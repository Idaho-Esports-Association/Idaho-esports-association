#!/usr/bin/env node

/**
 * BUILD THE PARTICIPATION SNAPSHOT
 *
 * Counts how many students actually competed in each game title, each school
 * year, and how many schools fielded them. Writes the result to
 * src/data/participation.json, which the Transparency page imports at build
 * time. Nothing is fetched from LeagueOS at page load.
 *
 * A finished school year never changes, so this is run on demand rather than
 * live: re-run it at the end of a season, commit the JSON, done.
 *
 * USAGE
 *   LEAGUEOS_API_KEY=xxxx npm run participation
 *   LEAGUEOS_API_KEY=xxxx npm run participation -- --from 2021 --to 2026
 *   LEAGUEOS_API_KEY=xxxx npm run participation -- --list
 *   LEAGUEOS_API_KEY=xxxx npm run participation -- --dry-run
 *
 * FLAGS
 *   --from YYYY   First calendar year to include (default: 2018)
 *   --to YYYY     Last calendar year to include (default: current year)
 *   --list        Print every season with its id/state/exclusion status and
 *                 exit. Use this to populate participation-exclusions.json.
 *   --dry-run     Compute and print the summary but do not write the file.
 *   --out PATH    Override the output path.
 *
 * PRIVACY
 * Member IDs are used in memory only, to de-duplicate players. The written
 * snapshot contains counts and school names -- never student names, member IDs,
 * league tags, or team rosters. Schools are institutions and are named
 * deliberately; students never are.
 *
 * WHO COUNTS AS A PARTICIPANT
 * Only students who actually played. For each match that reached a played state
 * (finished / verifying / disputed) we take, per title:
 *   - playerStats: the players LeagueOS recorded a score or stat line for, when
 *     the title tracks per-player data. This is ground truth.
 *   - lineup: otherwise, the players on the match roster, minus anyone flagged
 *     inactive for every game, and minus teams that forfeited or no-showed.
 * Which method produced each title's number is recorded in the snapshot so the
 * page can footnote it honestly.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');

const API_KEY = process.env.LEAGUEOS_API_KEY;
const API_URL = process.env.LEAGUEOS_API_URL || 'https://api.leagueos.gg';

// Match states that mean the game was actually played.
const PLAYED_STATES = new Set(['finished', 'verifying', 'disputed']);

const MAX_PAGES = 200;
const PAGE_SIZE = 100;

// Friendly names for the stdAct codes a scholastic league is likely to run.
// Unmapped codes fall through to the raw value so nothing is silently dropped.
const TITLE_NAMES = {
  rl: 'Rocket League',
  ssbu: 'Super Smash Bros. Ultimate',
  ssbm: 'Super Smash Bros. Melee',
  overwatch: 'Overwatch 2',
  lol: 'League of Legends',
  cs2: 'Counter-Strike 2',
  csgo: 'Counter-Strike: Global Offensive',
  fortnite: 'Fortnite',
  splatoon3: 'Splatoon 3',
  marioKart8D: 'Mario Kart 8 Deluxe',
  madden27: 'Madden NFL 27',
  madden26: 'Madden NFL 26',
  madden25: 'Madden NFL 25',
  madden24: 'Madden NFL 24',
  madden23: 'Madden NFL 23',
  nba2K26: 'NBA 2K26',
  nba2K25: 'NBA 2K25',
  nba2K24: 'NBA 2K24',
  fc26: 'EA Sports FC 26',
  fc25: 'EA Sports FC 25',
  fc24: 'EA Sports FC 24',
  chess: 'Chess',
  'chess.com': 'Chess',
  minecraft: 'Minecraft',
  minecraftBedwars: 'Minecraft Bedwars',
  hearthstone: 'Hearthstone',
  apex: 'Apex Legends',
  r6siege: 'Rainbow Six Siege',
  brawlhalla: 'Brawlhalla',
  pokemonUnite: 'Pokemon UNITE',
  pokemonScarletViolet: 'Pokemon Scarlet & Violet',
  teamfightTactics: 'Teamfight Tactics',
  marvelRivals: 'Marvel Rivals',
  streetFighter6: 'Street Fighter 6',
  tekken8: 'Tekken 8',
  mortalKombat1: 'Mortal Kombat 1',
  knockoutCity: 'Knockout City',
  fallGuys: 'Fall Guys',
  rocketLeague: 'Rocket League',
  other: 'Other',
  custom: 'Custom',
};

function titleName(stdAct) {
  if (!stdAct) return 'Unspecified';
  return TITLE_NAMES[stdAct] || stdAct;
}

function parseArgs(argv) {
  const args = { list: false, dryRun: false, out: null, from: 2018, to: new Date().getFullYear() };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--list') args.list = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--from') args.from = Number(argv[++i]);
    else if (arg === '--to') args.to = Number(argv[++i]);
    else if (arg === '--out') args.out = argv[++i];
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isInteger(args.from) || !Number.isInteger(args.to) || args.to < args.from) {
    throw new Error('--from and --to must be years, with --to >= --from');
  }

  return args;
}

// Scholastic year runs August through July, so a fall season and the spring
// season that follows it belong to the same label.
function schoolYearOf(date) {
  const year = date.getUTCFullYear();
  const startYear = date.getUTCMonth() >= 7 ? year : year - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`;
}

function schoolYearBounds(startYear) {
  return {
    start: Math.floor(Date.UTC(startYear, 7, 1) / 1000),
    end: Math.floor(Date.UTC(startYear + 1, 7, 1) / 1000),
  };
}

async function apiGet(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'x-leagueos-api-key': API_KEY,
      'Content-Type': 'application/json',
      'User-Agent': 'Idaho-Esports-Association-Participation/1.0',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LeagueOS ${response.status} for ${endpoint}: ${body.slice(0, 300)}`);
  }

  return response.json();
}

/**
 * Walks a paginated LeagueOS collection.
 *
 * The spec documents `page` as 0-based on the response but 1-based as a query
 * default, so we start at 0, follow `hasMore`, and de-duplicate by id. An
 * overlapping first page is harmless; a missed page would be a silent undercount.
 */
async function paginate(buildEndpoint, label) {
  const byId = new Map();

  for (let page = 0; page < MAX_PAGES; page++) {
    const body = await apiGet(buildEndpoint(page));
    const data = body && body.data;

    if (!data || !Array.isArray(data.results)) break;

    data.results.forEach(item => {
      if (item && item.id) byId.set(item.id, item);
    });

    if (!data.hasMore) break;

    if (page === MAX_PAGES - 1) {
      console.warn(`  ! hit the ${MAX_PAGES}-page cap on ${label}; results may be truncated`);
    }
  }

  return [...byId.values()];
}

function loadExclusions() {
  const file = path.join(HERE, 'participation-exclusions.json');
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));

  return {
    seasonIds: new Set(raw.seasonIds || []),
    namePatterns: (raw.seasonNamePatterns || []).map(pattern => new RegExp(pattern, 'i')),
    states: new Set(raw.excludeEventStates || []),
  };
}

function exclusionReason(season, exclusions) {
  if (exclusions.seasonIds.has(season.id)) return 'listed in seasonIds';
  if (exclusions.states.has(season.state)) return `EventState ${season.state}`;

  const name = season.name || '';
  const match = exclusions.namePatterns.find(pattern => pattern.test(name));
  if (match) return `name matches /${match.source}/i`;

  return null;
}

/**
 * Works out which members actually played in a match, and which teams they
 * played for.
 *
 * Returns the set of member IDs, the teams that genuinely took part, and which
 * of the two methods produced it, so the caller can report the basis rather
 * than quietly mixing them. Teams are returned alongside players so a school
 * whose only appearance was a forfeit is not credited with playing.
 */
function playersInMatch(match) {
  const games = Array.isArray(match.games) ? match.games : [];
  const fromStats = new Set();
  const statTeams = new Set();

  games.forEach(game => {
    const teamStats = game && game.teamStats;
    if (!teamStats || typeof teamStats !== 'object') return;

    Object.entries(teamStats).forEach(([teamId, stats]) => {
      if (!stats || typeof stats !== 'object') return;

      const ids = [
        ...Object.keys(stats.playerScores || {}),
        ...Object.keys(stats.playerStats || {}),
      ];

      if (ids.length > 0) statTeams.add(teamId);
      ids.forEach(id => fromStats.add(id));
    });
  });

  if (fromStats.size > 0) {
    return { players: fromStats, teams: statTeams, method: 'playerStats' };
  }

  // Fall back to the match lineup, discounting teams that never actually
  // played and members flagged inactive for every game in the match.
  const skipTeams = new Set([...(match.forfeits || []), ...(match.noShows || [])]);

  const inactiveEverywhere = new Set();
  if (games.length > 0) {
    const perGame = games.map(game => new Set(game && game.inactivePlayerIds ? game.inactivePlayerIds : []));
    perGame[0].forEach(id => {
      if (perGame.every(set => set.has(id))) inactiveEverywhere.add(id);
    });
  }

  const players = new Set();
  const teams = new Set();
  const rosters = match.rosters && typeof match.rosters === 'object' ? match.rosters : {};

  Object.entries(rosters).forEach(([teamId, roster]) => {
    if (skipTeams.has(teamId) || !roster) return;

    const members = roster.members && typeof roster.members === 'object' ? roster.members : {};
    const ids = Object.keys(members);
    const before = players.size;

    if (ids.length > 0) {
      ids.forEach(id => {
        if (!inactiveEverywhere.has(id)) players.add(id);
      });
    } else if (roster.memberId && !inactiveEverywhere.has(roster.memberId)) {
      // Individual-activity rosters wrap a single member with no members map.
      players.add(roster.memberId);
    }

    if (players.size > before || ids.some(id => !inactiveEverywhere.has(id))) teams.add(teamId);
  });

  return { players, teams, method: 'lineup' };
}

/**
 * Schools credited for a match: the parents of the teams that actually played.
 * A team that forfeited or no-showed is already absent from `teams`, so a
 * school only ever appears on the strength of a match it really competed in.
 */
function schoolsInMatch(match, groupNames, teams) {
  const schools = new Map();
  const rosters = match.rosters && typeof match.rosters === 'object' ? match.rosters : {};
  const nameFor = (id, name) => name || groupNames.get(id) || null;

  teams.forEach(teamId => {
    const parent = rosters[teamId] && rosters[teamId].parent;
    if (parent && parent.id) schools.set(parent.id, nameFor(parent.id, parent.name));
  });

  // Only fall back to groupIds when the match carried no usable roster data at
  // all -- otherwise this would re-add the forfeiting school we just excluded.
  if (schools.size === 0 && Object.keys(rosters).length === 0) {
    (match.groupIds || []).forEach(id => schools.set(id, nameFor(id, null)));
  }

  return schools;
}

async function loadGroupNames() {
  const body = await apiGet('/league/groups?ipp=400');
  const results = (body && body.data && body.data.results) || [];
  const names = new Map();

  results.forEach(group => {
    if (!group || !group.id) return;
    const name =
      (group.schoolData && group.schoolData.name) ||
      group.nameMedium ||
      group.name ||
      null;
    if (name) names.set(group.id, name);
  });

  return names;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!API_KEY) {
    console.error('LEAGUEOS_API_KEY is not set.');
    console.error('Run: LEAGUEOS_API_KEY=your-key npm run participation');
    process.exit(1);
  }

  const exclusions = loadExclusions();

  console.log(`Loading seasons ${args.from}-${args.to} ...`);
  const rangeStart = Math.floor(Date.UTC(args.from, 0, 1) / 1000);
  const rangeEnd = Math.floor(Date.UTC(args.to + 1, 0, 1) / 1000);

  const seasons = await paginate(
    page => `/league/seasons?ipp=${PAGE_SIZE}&page=${page}&start=${rangeStart}&end=${rangeEnd}`,
    'seasons'
  );

  const seasonIndex = new Map();
  const seasonReport = [];

  seasons.forEach(season => {
    const reason = exclusionReason(season, exclusions);
    const ts = season.dateStart || season.dateEnd;
    const entry = {
      id: season.id,
      name: season.name || '(unnamed)',
      title: season.stdAct || null,
      state: season.state,
      schoolYear: ts ? schoolYearOf(new Date(ts * 1000)) : null,
      excluded: Boolean(reason),
      excludedBecause: reason,
    };
    seasonIndex.set(season.id, entry);
    seasonReport.push(entry);
  });

  seasonReport.sort((a, b) => String(a.schoolYear).localeCompare(String(b.schoolYear)));

  if (args.list) {
    console.log(`\n${seasons.length} season(s):\n`);
    console.log(
      ['year', 'state', 'excluded', 'title', 'id', 'name'].join('\t')
    );
    seasonReport.forEach(season => {
      console.log(
        [
          season.schoolYear || '?',
          season.state,
          season.excluded ? `yes (${season.excludedBecause})` : 'no',
          season.title || '-',
          season.id,
          season.name,
        ].join('\t')
      );
    });
    console.log('\nAdd unwanted ids to scripts/participation-exclusions.json.');
    return;
  }

  const excludedCount = seasonReport.filter(season => season.excluded).length;
  console.log(`  ${seasons.length} season(s), ${excludedCount} excluded.`);

  console.log('Loading school names ...');
  const groupNames = await loadGroupNames();
  console.log(`  ${groupNames.size} group(s).`);

  // year -> aggregate
  const years = new Map();
  const allTimePlayers = new Set();
  const allTimeSchools = new Set();
  const allTimeTitles = new Set();
  let allTimeMatches = 0;
  let skippedMatches = 0;
  let unattributedMatches = 0;

  for (let startYear = args.from - 1; startYear <= args.to; startYear++) {
    const label = `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`;
    const { start, end } = schoolYearBounds(startYear);

    process.stdout.write(`Loading matches for ${label} ... `);

    // `states` is an array param with an unclear encoding, so we pull the
    // window and filter on match.state here instead of guessing a format.
    const matches = await paginate(
      page => `/league/matches?ipp=${PAGE_SIZE}&page=${page}&start=${start}&end=${end}`,
      `matches ${label}`
    );

    const played = matches.filter(match => PLAYED_STATES.has(match.state));
    console.log(`${matches.length} match(es), ${played.length} played.`);

    if (played.length === 0) continue;

    played.forEach(match => {
      const season = match.seasonId ? seasonIndex.get(match.seasonId) : null;

      if (season && season.excluded) {
        skippedMatches++;
        return;
      }
      if (!season && match.seasonId) unattributedMatches++;

      // Attribute to the season's school year when we know it, so a playoff
      // played in June lands in the year it belongs to rather than its own.
      const yearLabel = (season && season.schoolYear) || label;
      const stdAct = match.stdAct || (season && season.title) || 'other';

      if (!years.has(yearLabel)) {
        years.set(yearLabel, {
          schoolYear: yearLabel,
          titles: new Map(),
          players: new Set(),
          schools: new Map(),
          matches: 0,
          seasonIds: new Set(),
        });
      }
      const year = years.get(yearLabel);

      if (!year.titles.has(stdAct)) {
        year.titles.set(stdAct, {
          title: stdAct,
          name: titleName(stdAct),
          players: new Set(),
          schools: new Map(),
          matches: 0,
          methods: new Set(),
        });
      }
      const title = year.titles.get(stdAct);

      const { players, teams, method } = playersInMatch(match);
      const schools = schoolsInMatch(match, groupNames, teams);

      players.forEach(id => {
        title.players.add(id);
        year.players.add(id);
        allTimePlayers.add(id);
      });

      schools.forEach((name, id) => {
        title.schools.set(id, name || title.schools.get(id) || null);
        year.schools.set(id, name || year.schools.get(id) || null);
        allTimeSchools.add(id);
      });

      title.methods.add(method);
      title.matches++;
      year.matches++;
      if (match.seasonId) year.seasonIds.add(match.seasonId);
      allTimeTitles.add(stdAct);
      allTimeMatches++;
    });
  }

  const schoolNames = ids =>
    [...ids.entries()]
      .map(([id, name]) => name || groupNames.get(id) || null)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

  const yearsOut = [...years.values()]
    .map(year => {
      const titles = [...year.titles.values()]
        .map(title => ({
          title: title.title,
          name: title.name,
          players: title.players.size,
          schools: title.schools.size,
          matches: title.matches,
          // playerStats where the title records per-player data, lineup
          // otherwise; both when a title changed mid-year.
          method: [...title.methods].sort().join('+') || 'lineup',
          schoolNames: schoolNames(title.schools),
        }))
        .sort((a, b) => b.players - a.players || a.name.localeCompare(b.name));

      return {
        schoolYear: year.schoolYear,
        // Distinct humans: a student who plays three titles counts once.
        uniquePlayers: year.players.size,
        // Roster spots filled: that same student counts three times.
        totalCompetitors: titles.reduce((sum, title) => sum + title.players, 0),
        schools: year.schools.size,
        titleCount: titles.length,
        matches: year.matches,
        seasonCount: year.seasonIds.size,
        schoolNames: schoolNames(year.schools),
        titles,
      };
    })
    .sort((a, b) => a.schoolYear.localeCompare(b.schoolYear));

  const snapshot = {
    $schema: 'participation-snapshot/1',
    generatedAt: new Date().toISOString(),
    range: { from: args.from, to: args.to },
    definition:
      'A participant is a student who played in at least one game of at least one match that reached a played state (finished, verifying or disputed). Registered students who never played are not counted.',
    matchStatesCounted: [...PLAYED_STATES],
    totals: {
      // Distinct across every year: a four-year player counts once.
      uniquePlayers: allTimePlayers.size,
      schools: allTimeSchools.size,
      titles: allTimeTitles.size,
      matches: allTimeMatches,
      schoolYears: yearsOut.length,
    },
    excludedSeasons: seasonReport.filter(season => season.excluded),
    notes: {
      skippedMatches,
      unattributedMatches,
    },
    years: yearsOut,
  };

  console.log('\n--- Summary ---');
  yearsOut.forEach(year => {
    console.log(
      `${year.schoolYear}: ${year.uniquePlayers} unique players, ` +
        `${year.totalCompetitors} total competitors, ${year.schools} schools, ` +
        `${year.titleCount} titles, ${year.matches} matches`
    );
  });
  console.log(
    `all time: ${snapshot.totals.uniquePlayers} unique players, ` +
      `${snapshot.totals.schools} schools, ${snapshot.totals.matches} matches`
  );
  if (skippedMatches) console.log(`(${skippedMatches} match(es) skipped from excluded seasons)`);
  if (unattributedMatches) {
    console.log(`(${unattributedMatches} match(es) referenced a season outside the loaded range)`);
  }

  if (args.dryRun) {
    console.log('\n--dry-run: nothing written.');
    return;
  }

  const outPath = args.out ? path.resolve(args.out) : path.join(REPO, 'src', 'data', 'participation.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(snapshot, null, 2)}\n`);

  console.log(`\nWrote ${path.relative(REPO, outPath)}`);
  console.log('Review the diff, then commit it.');
}

main().catch(error => {
  console.error(`\nFailed: ${error.message}`);
  process.exit(1);
});

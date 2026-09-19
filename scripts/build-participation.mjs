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
 *   --probe       Report which API endpoints this key can actually reach, and
 *                 exit. Start here if you get a 401 or 403.
 *   --audit       Compare what this script collects against the league's own
 *                 counts and against the season/stage path, and exit. Use this
 *                 when the output looks too small.
 *   --dry-run     Compute and print the summary but do not write the file.
 *   --out PATH    Override the output path.
 *
 * PRIVACY
 * Member IDs are used in memory only, to de-duplicate players. The written
 * snapshot contains counts and school names -- never student names, member IDs,
 * league tags, or team rosters. Schools are institutions and are named
 * deliberately; students never are.
 *
 * WHERE THE DATA COMES FROM
 * Not /league/matches. That is a schedule endpoint returning only upcoming and
 * in-flight matches -- for this league it surfaced 64 of 2599 matches, almost
 * none of them finished. We walk seasons -> stages -> matches instead, which
 * reproduces the league's own match count exactly.
 *
 * Stage matches arrive as IMatch, with no rosters attached, so players come
 * from /league/stages/{id}/rosters and are tied to real play by intersecting
 * each roster against the teams appearing in matches that reached a played
 * state (finished / verifying / disputed).
 *
 * WHO COUNTS AS A PARTICIPANT
 *   - memberStats: where LeagueOS recorded per-member results, only members
 *     carrying a win, loss or draw. Closest thing to "played at least one game".
 *   - roster: otherwise, every member of a roster whose team competed. This
 *     over-counts a benched substitute, because no finer evidence exists.
 * This league records no per-player game stats at all (every sampled match had
 * gamesWithPlayerStats = 0), so the strict reading of "played at least one
 * game" is not derivable from the API. Each title's basis is recorded in the
 * snapshot, and `rostered` is published next to `players` so the gap is
 * visible rather than hidden.
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
const SEASON_CONCURRENCY = 4;

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
  valorant: 'Valorant',
  custom: 'Custom',
};

function titleName(stdAct) {
  if (!stdAct) return 'Unspecified';
  return TITLE_NAMES[stdAct] || stdAct;
}

function parseArgs(argv) {
  const args = {
    list: false,
    probe: false,
    audit: false,
    dryRun: false,
    out: null,
    from: 2018,
    to: new Date().getFullYear(),
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--list') args.list = true;
    else if (arg === '--probe') args.probe = true;
    else if (arg === '--audit') args.audit = true;
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

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Retried because a dropped stage is not a visible error -- it silently
// removes a whole game from the published numbers.
const RETRY_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;

async function apiGet(endpoint, attempt = 1) {
  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'x-leagueos-api-key': API_KEY,
        'Content-Type': 'application/json',
        'User-Agent': 'Idaho-Esports-Association-Participation/1.0',
      },
    });
  } catch (networkError) {
    if (attempt < MAX_ATTEMPTS) {
      await sleep(250 * 2 ** (attempt - 1));
      return apiGet(endpoint, attempt + 1);
    }
    throw networkError;
  }

  if (RETRY_STATUSES.has(response.status) && attempt < MAX_ATTEMPTS) {
    const retryAfter = Number(response.headers.get('retry-after'));
    const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : 250 * 2 ** (attempt - 1);
    await sleep(waitMs);
    return apiGet(endpoint, attempt + 1);
  }

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`LeagueOS ${response.status} for ${endpoint}: ${body.slice(0, 300)}`);

    if (response.status === 401 || response.status === 403) {
      error.hint = [
        'That is an authorization failure, not a bad request.',
        '',
        'The existing Netlify functions only call /league/groups, /league/teams',
        'and /league/members. This script also needs /league/seasons and',
        '/league/matches, which your key may not be entitled to.',
        '',
        'Run `npm run participation -- --probe` to see exactly which endpoints',
        'the key can reach, then ask LeagueOS to enable the ones that fail.',
      ].join('\n');
    }

    throw error;
  }

  return response.json();
}

/**
 * Reports which endpoints this key can actually reach.
 *
 * Worth having as a first-class mode: a 403 on one endpoint says nothing about
 * the others, and "is the key wrong or is the league not entitled?" is the
 * first question every time.
 */
async function probe() {
  const now = Math.floor(Date.now() / 1000);
  const year = 365 * 24 * 60 * 60;

  const checks = [
    ['/league/league', 'league info'],
    ['/league/groups?ipp=1', 'groups (used by the existing Netlify functions)'],
    ['/league/league/stats', 'aggregate league counts'],
    ['/league/seasons?ipp=1&page=0', 'seasons (needed: season names, dates, titles)'],
    ['/league/seasons.rpc/references', 'seasons, simplified'],
    [`/league/matches?ipp=1&page=0&start=${now - year}&end=${now}`, 'matches (needed: who played)'],
  ];

  console.log(`Probing ${API_URL} with the supplied key ...\n`);

  let anyDenied = false;

  for (const [endpoint, label] of checks) {
    let line;
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'x-leagueos-api-key': API_KEY,
          'Content-Type': 'application/json',
          'User-Agent': 'Idaho-Esports-Association-Participation/1.0',
        },
      });

      if (response.ok) {
        const body = await response.json();
        const data = body && body.data;
        const count = Array.isArray(data)
          ? data.length
          : data && typeof data.total === 'number'
            ? data.total
            : null;
        line = `  ok   ${response.status}${count === null ? '' : `  (${count} available)`}`;
      } else {
        if (response.status === 401 || response.status === 403) anyDenied = true;
        const text = await response.text();
        let message = text.slice(0, 120);
        try {
          message = JSON.parse(text).message || message;
        } catch {
          // Non-JSON body; the raw text is already the best we have.
        }
        line = `  FAIL ${response.status}  ${message}`;
      }
    } catch (error) {
      line = `  FAIL --   ${error.message}`;
    }

    console.log(`${label}\n    ${endpoint}\n  ${line}\n`);
  }

  if (anyDenied) {
    console.log('At least one endpoint was denied.');
    console.log('If /league/groups succeeds but /league/seasons and /league/matches do not,');
    console.log('the key is valid and the league simply is not enabled for those endpoints.');
    console.log('Ask LeagueOS support to enable League API access for seasons and matches.');
  }
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
      throw new Error(`hit the ${MAX_PAGES}-page cap on ${label}; results would be truncated`);
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
 * Did this roster member actually compete?
 *
 * Only counts fields that imply playing. Deliberately ignores elo (seeded
 * non-zero at registration), sos, byes, forfeitWins and noShows -- none of
 * which mean the student sat down and played.
 */
const PLAYED_STAT_FIELDS = ['wins', 'losses', 'draws', 'gameWins', 'gameLosses', 'gameDraws'];

function memberPlayed(member) {
  const stats = member && member.stats;
  if (!stats || typeof stats !== 'object') return false;
  return PLAYED_STAT_FIELDS.some(field => typeof stats[field] === 'number' && stats[field] > 0);
}

// A roster is keyed differently for team vs individual events, so check every
// identifier it might carry against the teams that actually played.
function rosterCompeted(roster, teamsThatPlayed) {
  return [roster.teamId, roster.sourceId, roster.id, roster.originId, roster.rootId, roster.memberId]
    .filter(Boolean)
    .some(id => teamsThatPlayed.has(id));
}

function rosterMembers(roster) {
  const members = roster.members && typeof roster.members === 'object' ? roster.members : {};
  const entries = Object.entries(members);
  if (entries.length > 0) return entries;
  // Individual-activity rosters wrap a single member with no members map.
  return roster.memberId ? [[roster.memberId, roster]] : [];
}

// Runs tasks with a bounded number in flight, preserving input order.
async function mapWithConcurrency(items, limit, worker) {
  const out = new Array(items.length);
  let cursor = 0;

  async function runner() {
    while (cursor < items.length) {
      const index = cursor++;
      out[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runner));
  return out;
}

/**
 * Collects participation for one season by walking its stages.
 *
 * /league/matches is a schedule endpoint: it returns only upcoming and
 * in-flight matches, so it misses nearly every completed game (64 of 2599 for
 * this league). Enumerating seasons -> stages -> matches returns the full
 * history instead.
 *
 * Stage matches come back as IMatch, without rosters, so players come from
 * /league/stages/{id}/rosters and are tied to actual play by intersecting each
 * roster against the teams appearing in matches that reached a played state.
 */
async function collectSeason(season, groupNames) {
  const players = new Set();
  const rostered = new Set();
  const schools = new Map();
  let totalMatches = 0;
  let playedMatches = 0;
  let stageCount = 0;
  let sawMemberStats = false;
  const failures = [];

  let stages = [];
  try {
    stages = (await apiGet(`/league/seasons/${season.id}/stages`)).data || [];
  } catch (error) {
    failures.push(`stages for season ${season.id}: ${error.message.slice(0, 120)}`);
    return { players, rostered, schools, totalMatches, playedMatches, stages: 0, method: 'roster', failures };
  }

  for (const stage of stages) {
    if (!stage || !stage.id) continue;
    stageCount++;

    let matches = [];
    try {
      matches = await paginate(
        page => `/league/stages/${stage.id}/matches?ipp=${PAGE_SIZE}&page=${page}`,
        `stage ${stage.id} matches`
      );
    } catch (error) {
      failures.push(`matches for stage ${stage.id}: ${error.message.slice(0, 120)}`);
      continue;
    }

    totalMatches += matches.length;

    const teamsThatPlayed = new Set();
    // groupIds cannot be mapped back to individual teams, so a forfeiting
    // school is indistinguishable in it. Only used if no roster carries a
    // parent, which would otherwise leave the stage with no schools at all.
    const groupIdFallback = new Set();
    let stagePlayed = 0;

    matches.forEach(match => {
      if (!PLAYED_STATES.has(match.state)) return;
      stagePlayed++;

      // Teams that forfeited or no-showed did not play.
      const skip = new Set([...(match.forfeits || []), ...(match.noShows || [])]);
      (match.teamIds || []).forEach(id => {
        if (!skip.has(id)) teamsThatPlayed.add(id);
      });
      (match.groupIds || []).forEach(id => groupIdFallback.add(id));
    });

    playedMatches += stagePlayed;
    if (stagePlayed === 0) continue;

    let rosters = [];
    try {
      rosters = (await apiGet(`/league/stages/${stage.id}/rosters`)).data || [];
    } catch (error) {
      failures.push(`rosters for stage ${stage.id}: ${error.message.slice(0, 120)}`);
      continue;
    }

    let namedASchool = false;

    rosters.forEach(roster => {
      if (!roster || roster.state === 'cancelled') return;
      if (!rosterCompeted(roster, teamsThatPlayed)) return;

      const parent = roster.parent;
      if (parent && parent.id) {
        namedASchool = true;
        schools.set(parent.id, parent.name || schools.get(parent.id) || groupNames.get(parent.id) || null);
      }

      rosterMembers(roster).forEach(([memberId, member]) => {
        rostered.add(memberId);
        if (memberPlayed(member)) {
          sawMemberStats = true;
          players.add(memberId);
        }
      });
    });

    if (!namedASchool) {
      groupIdFallback.forEach(id => {
        if (!schools.has(id)) schools.set(id, groupNames.get(id) || null);
      });
    }
  }

  // Where no member carries stats, per-member evidence does not exist and the
  // rostered set is the most honest answer available.
  if (!sawMemberStats) rostered.forEach(id => players.add(id));

  return {
    players,
    rostered,
    schools,
    totalMatches,
    playedMatches,
    stages: stageCount,
    method: sawMemberStats ? 'memberStats' : 'roster',
    failures,
  };
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

/**
 * Diagnoses why a run produced fewer matches than expected.
 *
 * Compares what the date-window walk over /league/matches collects against the
 * league's own aggregate counts and against the season -> stage -> match path,
 * so we can tell a filtering bug from a pagination bug from genuinely sparse
 * data. Emits counts and shapes only -- no names, no member IDs.
 */
async function audit(args) {
  const tally = (items, key) => {
    const out = {};
    items.forEach(item => {
      const k = key(item);
      out[k] = (out[k] || 0) + 1;
    });
    return out;
  };
  const show = obj =>
    Object.entries(obj)
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      .map(([k, v]) => `${k}:${v}`)
      .join('  ') || '(none)';

  console.log('=== 1. League ground truth (/league/league/stats) ===');
  try {
    const stats = await apiGet('/league/league/stats');
    console.log(`  ${JSON.stringify(stats.data)}`);
  } catch (error) {
    console.log(`  unavailable: ${error.message}`);
  }

  console.log('\n=== 2. All seasons, no date filter ===');
  const allSeasons = await paginate(
    page => `/league/seasons?ipp=${PAGE_SIZE}&page=${page}&start=0&end=0`,
    'seasons (unfiltered)'
  );
  console.log(`  count: ${allSeasons.length}`);
  console.log(
    `  by school year: ${show(
      tally(allSeasons, s => {
        const ts = s.dateStart || s.dateEnd;
        return ts ? schoolYearOf(new Date(ts * 1000)) : 'no-date';
      })
    )}`
  );
  console.log(`  by state: ${show(tally(allSeasons, s => `state${s.state}`))}`);
  console.log(`  by title: ${show(tally(allSeasons, s => s.stdAct || 'none'))}`);
  const withDates = allSeasons.filter(s => s.dateStart);
  if (withDates.length) {
    const min = Math.min(...withDates.map(s => s.dateStart));
    const max = Math.max(...withDates.map(s => s.dateEnd || s.dateStart));
    console.log(`  date span: ${new Date(min * 1000).toISOString().slice(0, 10)} .. ${new Date(max * 1000).toISOString().slice(0, 10)}`);
  }
  console.log(`  seasons missing dateStart: ${allSeasons.length - withDates.length}`);

  console.log('\n=== 3. Date-window walk over /league/matches (what the build does) ===');
  console.log('  window     api_total  collected  states');
  let windowedTotal = 0;
  for (let startYear = args.from - 1; startYear <= args.to; startYear++) {
    const label = `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`;
    const { start, end } = schoolYearBounds(startYear);

    const first = await apiGet(`/league/matches?ipp=${PAGE_SIZE}&page=0&start=${start}&end=${end}`);
    const apiTotal = (first.data && first.data.total) ?? '?';
    const matches = await paginate(
      page => `/league/matches?ipp=${PAGE_SIZE}&page=${page}&start=${start}&end=${end}`,
      `matches ${label}`
    );
    windowedTotal += matches.length;

    if (matches.length || apiTotal) {
      console.log(
        `  ${label}   ${String(apiTotal).padEnd(9)}  ${String(matches.length).padEnd(9)}  ${show(tally(matches, m => m.state || 'no-state'))}`
      );
    }
  }
  console.log(`  collected across all windows: ${windowedTotal}`);

  console.log('\n=== 4. Same call with no date window ===');
  try {
    const wide = await apiGet('/league/matches?ipp=1&page=0&start=0&end=0');
    console.log(`  start=0&end=0 reports total: ${(wide.data && wide.data.total) ?? '?'}`);
  } catch (error) {
    console.log(`  failed: ${error.message}`);
  }
  try {
    const huge = await apiGet(`/league/matches?ipp=1&page=0&start=0&end=${Math.floor(Date.now() / 1000) + 86400 * 365}`);
    console.log(`  start=0&end=+1y reports total: ${(huge.data && huge.data.total) ?? '?'}`);
  } catch (error) {
    console.log(`  failed: ${error.message}`);
  }

  console.log('\n=== 5. Cross-check: seasons -> stages -> matches ===');
  let stageMatchTotal = 0;
  const sampleFinished = [];
  for (const season of allSeasons) {
    let stages = [];
    try {
      const body = await apiGet(`/league/seasons/${season.id}/stages`);
      stages = (body && body.data) || [];
    } catch (error) {
      console.log(`  season ${season.id}: stages failed (${error.message.slice(0, 60)})`);
      continue;
    }

    let count = 0;
    const states = [];
    for (const stage of stages) {
      if (!stage || !stage.id) continue;
      try {
        const sm = await paginate(
          page => `/league/stages/${stage.id}/matches?ipp=${PAGE_SIZE}&page=${page}`,
          `stage ${stage.id}`
        );
        count += sm.length;
        sm.forEach(m => {
          states.push(m.state || 'no-state');
          if (sampleFinished.length < 3 && m.state === 'finished' && m.id) {
            sampleFinished.push({ matchId: m.id, stageId: stage.id, seasonId: season.id, title: season.stdAct });
          }
        });
      } catch (error) {
        console.log(`  stage ${stage.id}: matches failed (${error.message.slice(0, 60)})`);
      }
    }
    stageMatchTotal += count;
    console.log(
      `  ${(season.stdAct || '?').padEnd(12)} stages:${String(stages.length).padEnd(3)} matches:${String(count).padEnd(5)} ${show(tally(states, s => s))}  "${(season.name || '').slice(0, 40)}"`
    );
  }
  console.log(`  total via stages: ${stageMatchTotal}   (via date windows: ${windowedTotal})`);

  console.log('\n=== 6. Shape of the first few matches found via stages ===');
  let shown = 0;
  outer: for (const season of allSeasons) {
    let stages = [];
    try {
      stages = ((await apiGet(`/league/seasons/${season.id}/stages`)).data) || [];
    } catch { continue; }
    for (const stage of stages) {
      if (!stage || !stage.id || shown >= 5) continue;
      let sm = [];
      try {
        sm = ((await apiGet(`/league/stages/${stage.id}/matches?ipp=5&page=0`)).data || {}).results || [];
      } catch { continue; }
      for (const m of sm) {
        if (shown >= 5) break outer;
        const rosters = m.rosters && typeof m.rosters === 'object' ? m.rosters : {};
        const memberCounts = Object.values(rosters).map(r =>
          r && r.members && typeof r.members === 'object' ? Object.keys(r.members).length : 0
        );
        const games = Array.isArray(m.games) ? m.games : [];
        const withPlayerStats = games.filter(g => {
          const ts = (g && g.teamStats) || {};
          return Object.values(ts).some(
            s => s && (Object.keys(s.playerScores || {}).length || Object.keys(s.playerStats || {}).length)
          );
        }).length;
        console.log(
          `  state=${String(m.state).padEnd(10)} teamIds=${(m.teamIds || []).length} groupIds=${(m.groupIds || []).length} ` +
            `rosters=${Object.keys(rosters).length} memberCounts=[${memberCounts}] games=${games.length} gamesWithPlayerStats=${withPlayerStats} ` +
            `seasonId=${m.seasonId ? 'yes' : 'MISSING'} date=${m.date ? new Date(m.date * 1000).toISOString().slice(0, 10) : 'none'}`
        );
        shown++;
      }
    }
  }
  if (!shown) console.log('  no matches found via the stage path either');

  // The stage path gives us every match but no rosters, so player counts have
  // to come from somewhere else. Find out where.
  console.log('\n=== 7. Where player data lives (for 3 finished matches) ===');

  const anyStat = stats =>
    stats && typeof stats === 'object'
      ? Object.values(stats).filter(v => typeof v === 'number' && v > 0).length
      : 0;

  const describeRosters = rosters => {
    const list = Array.isArray(rosters) ? rosters : Object.values(rosters || {});
    const memberCounts = list.map(r =>
      r && r.members && typeof r.members === 'object' ? Object.keys(r.members).length : 0
    );
    const allMembers = list.flatMap(r =>
      r && r.members && typeof r.members === 'object' ? Object.values(r.members) : []
    );
    const withStats = allMembers.filter(m => anyStat(m && m.stats) > 0).length;
    const stateHist = {};
    allMembers.forEach(m => {
      const k = `s${m && m.state !== undefined ? m.state : '?'}`;
      stateHist[k] = (stateHist[k] || 0) + 1;
    });
    return {
      rosters: list.length,
      memberCounts,
      members: allMembers.length,
      membersWithNonZeroStats: withStats,
      memberStates: show(stateHist),
    };
  };

  for (const s of sampleFinished) {
    console.log(`\n  --- ${s.title} match ---`);

    try {
      const ex = (await apiGet(`/los/matches/${s.matchId}`)).data || {};
      const games = Array.isArray(ex.games) ? ex.games : [];
      const withPlayerStats = games.filter(g => {
        const ts = (g && g.teamStats) || {};
        return Object.values(ts).some(
          st => st && (Object.keys(st.playerScores || {}).length || Object.keys(st.playerStats || {}).length)
        );
      }).length;
      const d = describeRosters(ex.rosters);
      console.log(
        `  /los/matches/{id}          rosters=${d.rosters} members=${d.members} memberCounts=[${d.memberCounts}] ` +
          `games=${games.length} gamesWithPlayerStats=${withPlayerStats} memberStates=${d.memberStates}`
      );
    } catch (error) {
      console.log(`  /los/matches/{id}          failed: ${error.message.slice(0, 90)}`);
    }

    try {
      const sr = (await apiGet(`/league/stages/${s.stageId}/rosters`)).data || [];
      const d = describeRosters(sr);
      console.log(
        `  /league/stages/{id}/rosters rosters=${d.rosters} members=${d.members} ` +
          `membersWithNonZeroStats=${d.membersWithNonZeroStats} memberStates=${d.memberStates}`
      );
    } catch (error) {
      console.log(`  /league/stages/{id}/rosters failed: ${error.message.slice(0, 90)}`);
    }

    try {
      const body = (await apiGet(`/league/seasons/${s.seasonId}/rosters?ipp=100&page=0`)).data || {};
      const d = describeRosters(body.results);
      console.log(
        `  /league/seasons/{id}/rosters total=${body.total ?? '?'} rosters=${d.rosters} members=${d.members} ` +
          `membersWithNonZeroStats=${d.membersWithNonZeroStats} memberStates=${d.memberStates}`
      );
    } catch (error) {
      console.log(`  /league/seasons/{id}/rosters failed: ${error.message.slice(0, 90)}`);
    }
  }

  console.log('\nDone. Section 5 vs 3 shows whether the date-window walk loses matches;');
  console.log('section 7 shows which endpoint can tell us who actually played.');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!API_KEY) {
    console.error('LEAGUEOS_API_KEY is not set.');
    console.error('Run: LEAGUEOS_API_KEY=your-key npm run participation');
    process.exitCode = 1;
    return;
  }

  if (args.probe) {
    await probe();
    return;
  }

  if (args.audit) {
    await audit(args);
    return;
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
  let stagesSeen = 0;

  // Every season is walked, including excluded ones, so the match total can be
  // reconciled against the league's own count. Only included ones aggregate.
  console.log(`Walking ${seasons.length} season(s) by stage ...`);

  const perSeason = await mapWithConcurrency(seasons, SEASON_CONCURRENCY, async season => {
    const entry = seasonIndex.get(season.id);
    const collected = await collectSeason(season, groupNames);
    process.stdout.write(
      `  ${(season.stdAct || '?').padEnd(12)} ${String(collected.playedMatches).padStart(4)} played` +
        ` / ${String(collected.totalMatches).padStart(4)} matches` +
        `  ${String(collected.players.size).padStart(4)} players` +
        `  "${(season.name || '').slice(0, 44)}"
`
    );
    return { entry, collected };
  });

  const failures = perSeason.flatMap(({ collected }) => collected.failures || []);
  const matchesSeen = perSeason.reduce((sum, { collected }) => sum + collected.totalMatches, 0);

  perSeason.forEach(({ entry, collected }) => {
    stagesSeen += collected.stages;

    if (entry.excluded || collected.playedMatches === 0) return;
    skippedMatches += collected.totalMatches - collected.playedMatches;

    const yearLabel = entry.schoolYear || 'unknown';
    const stdAct = entry.title || 'other';

    if (!years.has(yearLabel)) {
      years.set(yearLabel, {
        schoolYear: yearLabel,
        titles: new Map(),
        players: new Set(),
        rostered: new Set(),
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
        rostered: new Set(),
        schools: new Map(),
        matches: 0,
        methods: new Set(),
      });
    }
    const title = year.titles.get(stdAct);

    collected.players.forEach(id => {
      title.players.add(id);
      year.players.add(id);
      allTimePlayers.add(id);
    });
    collected.rostered.forEach(id => {
      title.rostered.add(id);
      year.rostered.add(id);
    });
    collected.schools.forEach((name, id) => {
      title.schools.set(id, name || title.schools.get(id) || null);
      year.schools.set(id, name || year.schools.get(id) || null);
      allTimeSchools.add(id);
    });

    title.methods.add(collected.method);
    title.matches += collected.playedMatches;
    year.matches += collected.playedMatches;
    year.seasonIds.add(entry.id);
    allTimeTitles.add(stdAct);
    allTimeMatches += collected.playedMatches;
  });

  console.log(`  ${stagesSeen} stage(s) walked, ${matchesSeen} match(es) seen.`);

  // The league knows how many matches it has. If our walk does not reproduce
  // that number, something was dropped and the snapshot must not be written --
  // a quietly incomplete file is exactly how wrong numbers get published.
  let reportedMatches = null;
  try {
    const stats = (await apiGet('/league/league/stats')).data || {};
    reportedMatches = typeof stats.matches === 'number' ? stats.matches : null;
  } catch (error) {
    console.warn(`  ! could not read /league/league/stats: ${error.message.slice(0, 90)}`);
  }

  const problems = [];
  if (failures.length) {
    problems.push(`${failures.length} API call(s) failed after retries`);
  }
  if (reportedMatches === null) {
    problems.push('could not reconcile against the league match count');
  } else if (matchesSeen !== reportedMatches) {
    problems.push(`walked ${matchesSeen} matches but the league reports ${reportedMatches}`);
  }

  if (failures.length) {
    console.error('\nFailures:');
    failures.slice(0, 20).forEach(f => console.error(`  - ${f}`));
    if (failures.length > 20) console.error(`  ... and ${failures.length - 20} more`);
  }

  if (problems.length) {
    console.error('\nRefusing to write the snapshot:');
    problems.forEach(problem => console.error(`  - ${problem}`));
    console.error('\nThe numbers would understate the league. Re-run, and if it persists');
    console.error('use `npm run participation -- --audit` to see which calls are failing.');
    process.exitCode = 1;
    return;
  }

  console.log(`  reconciled: ${matchesSeen} match(es), matching the league's own count.`);


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
          // Everyone on a roster that competed, whether or not they have a
          // stat line. Published alongside `players` so the gap is visible.
          rostered: title.rostered.size,
          schools: title.schools.size,
          matches: title.matches,
          // memberStats where LeagueOS recorded per-member results, roster
          // otherwise; both when a year mixes the two.
          method: [...title.methods].sort().join('+') || 'roster',
          schoolNames: schoolNames(title.schools),
        }))
        .sort((a, b) => b.players - a.players || a.name.localeCompare(b.name));

      return {
        schoolYear: year.schoolYear,
        // Distinct humans: a student who plays three titles counts once.
        uniquePlayers: year.players.size,
        // Roster spots filled: that same student counts three times.
        totalCompetitors: titles.reduce((sum, title) => sum + title.players, 0),
        uniqueRostered: year.rostered.size,
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
      'A participant is a student on the roster of a team that competed in at least one match reaching a played state (finished, verifying or disputed). Where LeagueOS recorded per-member results, only members with a win, loss or draw on record are counted; elsewhere every member of a competing roster is counted. Students who registered but whose team never played are excluded.',
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
  if (error.hint) console.error(`\n${error.hint}`);
  // Set the code rather than calling process.exit(), which can abort Node on
  // Windows while a partial stdout write is still in flight.
  process.exitCode = 1;
});

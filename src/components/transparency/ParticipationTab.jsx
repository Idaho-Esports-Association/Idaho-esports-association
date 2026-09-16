import React, { useState } from "react";
import { Users, UserPlus, School, Gamepad2, Swords, Info } from "lucide-react";
import participation from "../../data/participation.json";

const ALL_TIME = "all";

const StatCard = (stat) => (
  <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6">
    <div className="flex items-center space-x-2 mb-2">
      <stat.icon className="w-5 h-5 text-purple-400" />
      <p className="text-gray-400 text-sm">{stat.label}</p>
    </div>
    <p className="text-3xl font-bold text-white">
      {stat.value.toLocaleString()}
    </p>
    {stat.hint && (
      <p className="text-gray-500 text-xs mt-2 leading-relaxed">{stat.hint}</p>
    )}
  </div>
);

// "playerStats" means LeagueOS recorded a score or stat line for each player;
// "lineup" means we counted the match roster instead. Spelled out rather than
// hidden, because the two are not quite the same claim.
const MethodBadge = ({ method }) => {
  const exact = method === "playerStats";
  return (
    <span
      title={
        exact
          ? "Counted from per-player game results recorded by LeagueOS."
          : "This title does not record per-player results, so we counted the players named in each match lineup, excluding forfeits and players benched for every game."
      }
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
        exact
          ? "bg-green-500/10 text-green-400 border border-green-500/20"
          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
      }`}
    >
      {exact ? "per-player results" : "match lineups"}
    </span>
  );
};

export const ParticipationTab = () => {
  const years = participation.years || [];
  const [selected, setSelected] = useState(
    years.length > 0 ? years[years.length - 1].schoolYear : ALL_TIME
  );

  if (!participation.generatedAt || years.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <Gamepad2 className="w-10 h-10 text-purple-400 mx-auto" />
        <p className="text-gray-400">
          Participation numbers will be published here once the first season
          snapshot is generated.
        </p>
      </div>
    );
  }

  const year = years.find((entry) => entry.schoolYear === selected);
  const showingAllTime = selected === ALL_TIME;

  // Across all years a student is still one student, so the all-time unique
  // figure comes from the snapshot rather than summing the per-year numbers.
  const summary = showingAllTime
    ? {
        uniquePlayers: participation.totals.uniquePlayers,
        totalCompetitors: years.reduce((sum, y) => sum + y.totalCompetitors, 0),
        schools: participation.totals.schools,
        titleCount: participation.totals.titles,
        matches: participation.totals.matches,
      }
    : year;

  const titles = showingAllTime ? [] : year.titles;
  const schoolNames = showingAllTime ? [] : year.schoolNames;

  const formatLabel = (schoolYear) => schoolYear.replace("-", "–");
  const generated = new Date(participation.generatedAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="space-y-6">
      <p className="text-gray-300">
        How many Idaho students actually competed, by game and by school year.
        These are participation counts only &mdash; we never publish student
        names, and no student information leaves LeagueOS.
      </p>

      {/* Year selector */}
      <div className="flex flex-wrap gap-2">
        {years.map((entry) => (
          <button
            key={entry.schoolYear}
            onClick={() => setSelected(entry.schoolYear)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              selected === entry.schoolYear
                ? "bg-purple-600 text-white"
                : "bg-slate-900/50 text-gray-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            {formatLabel(entry.schoolYear)}
          </button>
        ))}
        <button
          onClick={() => setSelected(ALL_TIME)}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            showingAllTime
              ? "bg-purple-600 text-white"
              : "bg-slate-900/50 text-gray-400 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          All time
        </button>
      </div>

      {/* Headline numbers */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Unique students"
          value={summary.uniquePlayers}
          hint="Each student counted once, however many titles they played."
        />
        <StatCard
          icon={UserPlus}
          label="Total competitors"
          value={summary.totalCompetitors}
          hint="Counted once per title, so a student in two games counts twice."
        />
        <StatCard
          icon={School}
          label="Schools"
          value={summary.schools}
          hint="Schools that fielded at least one team that played."
        />
        <StatCard
          icon={Gamepad2}
          label="Game titles"
          value={summary.titleCount}
          hint={`Across ${summary.matches.toLocaleString()} matches played.`}
        />
      </div>

      {showingAllTime && (
        <p className="text-gray-400 text-sm">
          Pick a school year above for the per-game breakdown and the list of
          participating schools.
        </p>
      )}

      {/* Per-title breakdown */}
      {!showingAllTime && titles.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">
            By game &mdash; {formatLabel(year.schoolYear)}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-purple-500/30 text-gray-400 text-sm">
                  <th className="py-3 pr-4 font-semibold">Game</th>
                  <th className="py-3 pr-4 font-semibold text-right">Players</th>
                  <th className="py-3 pr-4 font-semibold text-right">Schools</th>
                  <th className="py-3 pr-4 font-semibold text-right">Matches</th>
                  <th className="py-3 font-semibold">Counted from</th>
                </tr>
              </thead>
              <tbody>
                {titles.map((title) => (
                  <tr
                    key={title.title}
                    className="border-b border-purple-500/10 text-gray-300"
                  >
                    <td className="py-3 pr-4 font-semibold text-white">
                      {title.name}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {title.players.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {title.schools.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {title.matches.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <MethodBadge method={title.method} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-500 text-sm mt-3">
            The player column adds up to {year.totalCompetitors.toLocaleString()}{" "}
            competitors, which is more than the{" "}
            {year.uniquePlayers.toLocaleString()} unique students above because
            some students competed in more than one game.
          </p>
        </div>
      )}

      {/* Participating schools */}
      {!showingAllTime && schoolNames.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">
            Schools that competed &mdash; {formatLabel(year.schoolYear)}
          </h3>
          <div className="flex flex-wrap gap-2">
            {schoolNames.map((name) => (
              <span
                key={name}
                className="px-3 py-1.5 bg-slate-900/50 border border-purple-500/20 rounded-lg text-gray-300 text-sm"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Methodology */}
      <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-gray-400">
            <p className="text-white font-semibold">How these numbers are counted</p>
            <p>{participation.definition}</p>
            <p>
              Where a game records per-player results, we count the students who
              actually posted a result. Where it does not, we count the students
              named in each match lineup, excluding teams that forfeited or
              no-showed and players benched for every game &mdash; which may
              slightly over-count in those titles. Each game&rsquo;s basis is
              labelled in the per-game table for that school year.
            </p>
            <p className="flex items-center space-x-2">
              <Swords className="w-4 h-4 text-purple-400" />
              <span>Last updated {generated} from LeagueOS league records.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

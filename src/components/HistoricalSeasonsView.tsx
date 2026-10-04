import React, { useState } from 'react';
import { HistoricalSeason, Team } from '../types/league';
import { ClubCrest } from './ClubCrest';
import { Award, Trophy, Users, Flame, ChevronRight } from 'lucide-react';

interface HistoricalSeasonsViewProps {
  seasons: HistoricalSeason[];
  teams: Team[];
  onSelectTeam: (teamId: string) => void;
}

export const HistoricalSeasonsView: React.FC<HistoricalSeasonsViewProps> = ({
  seasons,
  teams,
  onSelectTeam,
}) => {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(seasons[0]?.seasonId || '2024/25');

  const currentSeason = seasons.find((s) => s.seasonId === selectedSeasonId) || seasons[0];
  const championTeam = teams.find((t) => t.id === currentSeason.championTeamId);
  const runnerUpTeam = teams.find((t) => t.id === currentSeason.runnerUpTeamId);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header and Season Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Historical Seasons Archive
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official archives, past champion records, and final standings.
          </p>
        </div>

        {/* Season Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
          {seasons.map((s) => (
            <button
              key={s.seasonId}
              onClick={() => setSelectedSeasonId(s.seasonId)}
              className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition-colors ${
                selectedSeasonId === s.seasonId
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.seasonId}
            </button>
          ))}
        </div>
      </div>

      {/* Champion & Highlights Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Champion Card */}
        <div className="md:col-span-2 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 p-6 rounded-2xl border border-amber-500/30 relative overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Apex League Champion</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {championTeam && <ClubCrest team={championTeam} size="xl" />}
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-2xl font-black text-white tracking-tight">
                {championTeam ? championTeam.name : 'Champion Club'}
              </h3>
              <p className="text-xs text-slate-400">
                Lifted the {currentSeason.seasonName} Championship Trophy.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-3 text-xs">
                {runnerUpTeam && (
                  <span className="text-slate-400">
                    Runner-up: <strong className="text-white">{runnerUpTeam.name}</strong>
                  </span>
                )}
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400">
                  Total Goals: <strong className="font-mono text-white">{currentSeason.totalGoals}</strong>
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400">
                  Avg Attendance: <strong className="font-mono text-white">{currentSeason.averageAttendance.toLocaleString()}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Honors */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-center">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Golden Boot
              </span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {currentSeason.topScorer.goals} Goals
              </span>
            </div>
            <p className="text-xs font-bold text-white">{currentSeason.topScorer.name}</p>
            <span className="text-[11px] text-slate-400">{currentSeason.topScorer.team}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-sky-400 font-semibold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Golden Glove
              </span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {currentSeason.goldenGlove.cleanSheets} Clean Sheets
              </span>
            </div>
            <p className="text-xs font-bold text-white">{currentSeason.goldenGlove.name}</p>
            <span className="text-[11px] text-slate-400">{currentSeason.goldenGlove.team}</span>
          </div>
        </div>
      </div>

      {/* Historical Final Standings Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <h3 className="text-sm font-bold text-white">
            {currentSeason.seasonName} Final League Table
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">Pos</th>
                <th className="py-3 px-4">Club</th>
                <th className="py-3 px-3 text-center">P</th>
                <th className="py-3 px-3 text-center">W</th>
                <th className="py-3 px-3 text-center">D</th>
                <th className="py-3 px-3 text-center">L</th>
                <th className="py-3 px-3 text-center hidden sm:table-cell">GF</th>
                <th className="py-3 px-3 text-center hidden sm:table-cell">GA</th>
                <th className="py-3 px-3 text-center">GD</th>
                <th className="py-3 px-4 text-center font-bold text-white">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {currentSeason.standings.map((row, idx) => {
                const team = teams.find((t) => t.id === row.teamId);
                const pos = idx + 1;

                return (
                  <tr
                    key={row.teamId}
                    onClick={() => team && onSelectTeam(team.id)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-bold text-slate-300">
                      {pos === 1 ? '🏆 1' : pos}
                    </td>

                    <td className="py-3.5 px-4 font-sans font-semibold text-white">
                      {team ? (
                        <div className="flex items-center gap-2.5">
                          <ClubCrest team={team} size="xs" />
                          <span>{team.name}</span>
                        </div>
                      ) : (
                        row.teamId
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center tabular-nums text-slate-300">{row.played}</td>
                    <td className="py-3.5 px-3 text-center tabular-nums text-slate-300">{row.won}</td>
                    <td className="py-3.5 px-3 text-center tabular-nums text-slate-400">{row.drawn}</td>
                    <td className="py-3.5 px-3 text-center tabular-nums text-slate-400">{row.lost}</td>
                    <td className="py-3.5 px-3 text-center tabular-nums text-slate-400 hidden sm:table-cell">{row.goalsFor}</td>
                    <td className="py-3.5 px-3 text-center tabular-nums text-slate-400 hidden sm:table-cell">{row.goalsAgainst}</td>
                    <td className="py-3.5 px-3 text-center tabular-nums font-semibold">
                      <span className={row.goalDifference > 0 ? 'text-emerald-400' : row.goalDifference < 0 ? 'text-rose-400' : 'text-slate-400'}>
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-sm text-white tabular-nums">{row.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

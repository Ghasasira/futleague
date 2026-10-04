import React from 'react';
import { LeagueStanding, Team } from '../types/league';
import { ClubCrest } from './ClubCrest';
import { ChevronRight } from 'lucide-react';

interface LeagueTableProps {
  standings: LeagueStanding[];
  teams: Team[];
  onSelectTeam: (teamId: string) => void;
}

export const LeagueTable: React.FC<LeagueTableProps> = ({
  standings,
  teams,
  onSelectTeam,
}) => {
  return (
    <div className="w-full bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-800 bg-slate-950/60">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Apex League Standings (2025/26)
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>Matchweek 25</span>
            <span aria-hidden="true">·</span>
            <span>8 Championship Clubs</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Champions League</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
            <span>Europa League</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span>Relegation</span>
          </div>
        </div>
      </div>

      {/* Table */}
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
              <th className="py-3 px-4 text-center hidden md:table-cell">Form</th>
              <th className="py-3 px-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {standings.map((row, index) => {
              const team = teams.find((t) => t.id === row.teamId);
              if (!team) return null;

              const pos = index + 1;
              const isUCL = pos <= 2;
              const isUEL = pos === 3 || pos === 4;
              const isRelegation = pos >= 7;

              return (
                <tr
                  key={row.teamId}
                  onClick={() => onSelectTeam(team.id)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  {/* Position with qualification strip */}
                  <td className="py-3.5 px-4 text-center font-bold relative">
                    {isUCL && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                    )}
                    {isUEL && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500" />
                    )}
                    {isRelegation && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                    )}
                    <span className="text-slate-300 group-hover:text-white">
                      {pos}
                    </span>
                  </td>

                  {/* Team */}
                  <td className="py-3.5 px-4 font-sans font-semibold text-white">
                    <div className="flex items-center gap-3">
                      <ClubCrest team={team} size="xs" />
                      <span className="group-hover:text-emerald-400 transition-colors">
                        {team.name}
                      </span>
                    </div>
                  </td>

                  {/* Stats */}
                  <td className="py-3.5 px-3 text-center tabular-nums text-slate-300">
                    {row.played}
                  </td>
                  <td className="py-3.5 px-3 text-center tabular-nums text-slate-300">
                    {row.won}
                  </td>
                  <td className="py-3.5 px-3 text-center tabular-nums text-slate-400">
                    {row.drawn}
                  </td>
                  <td className="py-3.5 px-3 text-center tabular-nums text-slate-400">
                    {row.lost}
                  </td>
                  <td className="py-3.5 px-3 text-center tabular-nums text-slate-400 hidden sm:table-cell">
                    {row.goalsFor}
                  </td>
                  <td className="py-3.5 px-3 text-center tabular-nums text-slate-400 hidden sm:table-cell">
                    {row.goalsAgainst}
                  </td>
                  <td className="py-3.5 px-3 text-center tabular-nums font-semibold">
                    <span
                      className={
                        row.goalDifference > 0
                          ? 'text-emerald-400'
                          : row.goalDifference < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }
                    >
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </span>
                  </td>

                  {/* Points */}
                  <td className="py-3.5 px-4 text-center font-bold text-sm text-white tabular-nums">
                    {row.points}
                  </td>

                  {/* Form guide */}
                  <td className="py-3.5 px-4 text-center hidden md:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {row.form.map((res, i) => (
                        <span
                          key={i}
                          className={`w-5 h-5 rounded text-[10px] font-bold font-sans flex items-center justify-center ${
                            res === 'W'
                              ? 'bg-emerald-500 text-slate-950'
                              : res === 'D'
                              ? 'bg-slate-700 text-slate-300'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {res}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-right text-slate-500 group-hover:text-slate-300">
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

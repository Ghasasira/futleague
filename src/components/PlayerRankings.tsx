import React, { useState } from 'react';
import { Player, Team } from '../types/league';
import { ClubCrest } from './ClubCrest';
import { InjuryBadge } from './InjuryBadge';
import { Award, Zap, Shield, AlertTriangle, Star } from 'lucide-react';

interface PlayerRankingsProps {
  players: Player[];
  teams: Team[];
  onSelectPlayer: (player: Player) => void;
  onSelectTeam: (teamId: string) => void;
}

export const PlayerRankings: React.FC<PlayerRankingsProps> = ({
  players,
  teams,
  onSelectPlayer,
  onSelectTeam,
}) => {
  const [rankingCategory, setRankingCategory] = useState<'goals' | 'assists' | 'cleansheets' | 'rating' | 'discipline'>('goals');

  // Sorted list helpers
  const topScorers = [...players]
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals || a.minutesPlayed - b.minutesPlayed);

  const topAssists = [...players]
    .filter((p) => p.assists > 0)
    .sort((a, b) => b.assists - a.assists || a.minutesPlayed - b.minutesPlayed);

  const topKeepers = [...players]
    .filter((p) => p.position === 'GK')
    .sort((a, b) => b.cleanSheets - a.cleanSheets || b.formRating - a.formRating);

  const topRated = [...players]
    .filter((p) => p.appearances >= 10)
    .sort((a, b) => b.formRating - a.formRating);

  const mostCards = [...players]
    .map((p) => ({ ...p, totalPoints: p.yellowCards * 1 + p.redCards * 3 }))
    .filter((p) => p.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints);

  const getTeam = (teamId: string) => teams.find((t) => t.id === teamId);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Apex League Player Rankings & Honors
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official leaderboards for the 2025/26 Championship Season.
          </p>
        </div>

        {/* Category switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setRankingCategory('goals')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              rankingCategory === 'goals'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Golden Boot
          </button>
          <button
            onClick={() => setRankingCategory('assists')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              rankingCategory === 'assists'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Playmakers
          </button>
          <button
            onClick={() => setRankingCategory('cleansheets')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              rankingCategory === 'cleansheets'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Golden Glove
          </button>
          <button
            onClick={() => setRankingCategory('rating')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              rankingCategory === 'rating'
                ? 'bg-purple-500 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            MVP Index
          </button>
          <button
            onClick={() => setRankingCategory('discipline')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              rankingCategory === 'discipline'
                ? 'bg-rose-500 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Disciplinary
          </button>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Club</th>
                <th className="py-3 px-4 text-center">Apps</th>
                {rankingCategory === 'goals' && (
                  <>
                    <th className="py-3 px-4 text-center font-bold text-emerald-400">Goals</th>
                    <th className="py-3 px-4 text-center">Mins/Goal</th>
                  </>
                )}
                {rankingCategory === 'assists' && (
                  <>
                    <th className="py-3 px-4 text-center font-bold text-sky-400">Assists</th>
                    <th className="py-3 px-4 text-center">Goals Created</th>
                  </>
                )}
                {rankingCategory === 'cleansheets' && (
                  <>
                    <th className="py-3 px-4 text-center font-bold text-amber-400">Clean Sheets</th>
                    <th className="py-3 px-4 text-center">Form Rating</th>
                  </>
                )}
                {rankingCategory === 'rating' && (
                  <>
                    <th className="py-3 px-4 text-center font-bold text-purple-400">Match Rating</th>
                    <th className="py-3 px-4 text-center">Market Value</th>
                  </>
                )}
                {rankingCategory === 'discipline' && (
                  <>
                    <th className="py-3 px-4 text-center font-bold text-amber-400">Yellows</th>
                    <th className="py-3 px-4 text-center font-bold text-rose-400">Reds</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {(rankingCategory === 'goals'
                ? topScorers
                : rankingCategory === 'assists'
                ? topAssists
                : rankingCategory === 'cleansheets'
                ? topKeepers
                : rankingCategory === 'rating'
                ? topRated
                : mostCards
              ).map((player, idx) => {
                const team = getTeam(player.teamId);
                const rank = idx + 1;
                const minsPerGoal = player.goals > 0 ? Math.round(player.minutesPlayed / player.goals) : 0;

                return (
                  <tr
                    key={player.id}
                    onClick={() => onSelectPlayer(player)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-center font-bold">
                      {rank === 1 ? (
                        <span className="text-amber-400">🥇 1</span>
                      ) : rank === 2 ? (
                        <span className="text-slate-300">🥈 2</span>
                      ) : rank === 3 ? (
                        <span className="text-amber-600">🥉 3</span>
                      ) : (
                        <span className="text-slate-500">{rank}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{player.flag}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {player.name}
                            </span>
                            {(player.injuryStatus === 'injured' || player.injuryStatus === 'out' || player.injuryStatus === 'doubtful' || player.status === 'injured') && (
                              <InjuryBadge
                                injuryStatus={player.injuryStatus || 'injured'}
                                size="xs"
                              />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            #{player.number} · {player.position}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      {team && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTeam(team.id);
                          }}
                          className="flex items-center gap-2 hover:underline"
                        >
                          <ClubCrest team={team} size="xs" />
                          <span className="text-slate-300 font-medium">{team.shortName}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center tabular-nums text-slate-400">
                      {player.appearances}
                    </td>

                    {rankingCategory === 'goals' && (
                      <>
                        <td className="py-3.5 px-4 text-center tabular-nums font-bold text-emerald-400 text-sm">
                          {player.goals}
                        </td>
                        <td className="py-3.5 px-4 text-center tabular-nums text-slate-400">
                          {minsPerGoal}'
                        </td>
                      </>
                    )}

                    {rankingCategory === 'assists' && (
                      <>
                        <td className="py-3.5 px-4 text-center tabular-nums font-bold text-sky-400 text-sm">
                          {player.assists}
                        </td>
                        <td className="py-3.5 px-4 text-center tabular-nums text-slate-400">
                          {player.goals + player.assists}
                        </td>
                      </>
                    )}

                    {rankingCategory === 'cleansheets' && (
                      <>
                        <td className="py-3.5 px-4 text-center tabular-nums font-bold text-amber-400 text-sm">
                          {player.cleanSheets}
                        </td>
                        <td className="py-3.5 px-4 text-center tabular-nums text-emerald-400">
                          ★ {player.formRating.toFixed(1)}
                        </td>
                      </>
                    )}

                    {rankingCategory === 'rating' && (
                      <>
                        <td className="py-3.5 px-4 text-center tabular-nums font-bold text-purple-400 text-sm">
                          ★ {player.formRating.toFixed(1)}
                        </td>
                        <td className="py-3.5 px-4 text-center tabular-nums text-slate-300">
                          {player.marketValue}
                        </td>
                      </>
                    )}

                    {rankingCategory === 'discipline' && (
                      <>
                        <td className="py-3.5 px-4 text-center tabular-nums font-bold text-amber-400">
                          {player.yellowCards}
                        </td>
                        <td className="py-3.5 px-4 text-center tabular-nums font-bold text-rose-500">
                          {player.redCards}
                        </td>
                      </>
                    )}
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

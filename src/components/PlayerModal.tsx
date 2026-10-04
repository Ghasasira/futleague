import React from 'react';
import { Player, Team } from '../types/league';
import { ClubCrest } from './ClubCrest';
import { InjuryBadge } from './InjuryBadge';
import { X, ShieldAlert, Award, Star, Activity, User, AlertTriangle } from 'lucide-react';

interface PlayerModalProps {
  player: Player | null;
  team?: Team;
  onClose: () => void;
  onSelectTeam?: (teamId: string) => void;
  onViewFullPage?: (player: Player) => void;
  onStartComparison?: (player: Player) => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  player,
  team,
  onClose,
  onSelectTeam,
  onViewFullPage,
  onStartComparison,
}) => {
  if (!player) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header with team color backdrop */}
        <div
          className="relative p-6 border-b border-slate-800"
          style={{
            background: team
              ? `linear-gradient(135deg, ${team.crestColor}33 0%, #0f172a 100%)`
              : '#0f172a',
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            {/* Squad Number Avatar */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-mono font-black text-2xl text-white shadow-xl border-2"
              style={{
                backgroundColor: team?.crestColor || '#0284c7',
                borderColor: team?.secondaryColor || '#ffffff',
              }}
            >
              {player.number}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{player.flag}</span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {player.name}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-1">
                <span className="font-mono uppercase font-bold text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded">
                  {player.position}
                </span>
                {team && (
                  <span
                    onClick={() => {
                      onClose();
                      if (onSelectTeam) onSelectTeam(team.id);
                    }}
                    className="cursor-pointer hover:underline text-slate-300 font-medium"
                  >
                    {team.name}
                  </span>
                )}
                {(player.injuryStatus === 'injured' || player.injuryStatus === 'out' || player.injuryStatus === 'doubtful' || player.status === 'injured') && (
                  <InjuryBadge
                    injuryStatus={player.injuryStatus || 'injured'}
                    size="xs"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Player Metrics & Breakdown */}
        <div className="p-6 space-y-6">
          {/* Key Quick Stats */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <span className="font-mono font-bold text-white text-base block">
                {player.appearances}
              </span>
              <span className="text-[10px] text-slate-500 uppercase">Matches</span>
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <span className="font-mono font-bold text-emerald-400 text-base block">
                {player.position === 'GK' ? player.cleanSheets : player.goals}
              </span>
              <span className="text-[10px] text-slate-500 uppercase">
                {player.position === 'GK' ? 'Clean Sheets' : 'Goals'}
              </span>
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <span className="font-mono font-bold text-sky-400 text-base block">
                {player.assists}
              </span>
              <span className="text-[10px] text-slate-500 uppercase">Assists</span>
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <span className="font-mono font-bold text-purple-400 text-base block">
                ★ {player.formRating.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-500 uppercase">Form</span>
            </div>
          </div>

          {/* Bio Grid */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Nationality:</span>
              <span className="font-semibold text-white">{player.nationality}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Age:</span>
              <span className="font-mono text-white">{player.age} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Height:</span>
              <span className="font-mono text-white">{player.height}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Preferred Foot:</span>
              <span className="font-semibold text-white">{player.preferredFoot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Market Valuation:</span>
              <span className="font-mono font-bold text-emerald-400">{player.marketValue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Disciplinary Record:</span>
              <span className="font-mono text-slate-300">
                {player.yellowCards} 🟨 · {player.redCards} 🟥
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Squad Status:</span>
              {(player.injuryStatus === 'injured' || player.injuryStatus === 'out' || player.injuryStatus === 'doubtful' || player.status === 'injured') ? (
                <InjuryBadge
                  injuryStatus={player.injuryStatus || 'injured'}
                  injuryNote={player.injuryNote}
                  injuryReturnDate={player.injuryReturnDate}
                  showDetails={true}
                  size="xs"
                />
              ) : (
                <span className="font-semibold uppercase text-emerald-400 font-mono text-[11px]">
                  Fit & Available
                </span>
              )}
            </div>
          </div>

          {/* Technical Telemetry */}
          {player.stats && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Technical Match Performance
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Passing Accuracy</span>
                    <span className="font-mono font-bold text-white">
                      {player.stats.passingAccuracy}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${player.stats.passingAccuracy}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Defensive Tackles Won</span>
                    <span className="font-mono font-bold text-white">
                      {player.stats.tacklesWon}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, player.stats.tacklesWon * 2)}%` }}
                      className="h-full bg-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Aerial Duels Won</span>
                    <span className="font-mono font-bold text-white">
                      {player.stats.aerialDuelsWon}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, player.stats.aerialDuelsWon * 1.5)}%` }}
                      className="h-full bg-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Bottom Actions */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
            {onStartComparison && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartComparison(player);
                }}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <span>⚔️ Compare</span>
              </button>
            )}

            {onViewFullPage && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewFullPage(player);
                }}
                className="flex-1 px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Open Dedicated Player Page ➔</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

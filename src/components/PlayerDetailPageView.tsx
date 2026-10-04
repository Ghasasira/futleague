import React, { useState } from 'react';
import { Player, Team } from '../types/league';
import { ClubCrest } from './ClubCrest';
import { InjuryBadge } from './InjuryBadge';
import { getPlayerEnrichedData } from '../utils/playerEnrichment';
import {
  ArrowLeft,
  ArrowRightLeft,
  Calendar,
  MapPin,
  Award,
  Zap,
  Shield,
  Activity,
  User,
  Clock,
  Briefcase,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

interface PlayerDetailPageViewProps {
  player: Player;
  team?: Team;
  allTeams: Team[];
  allPlayers: Player[];
  onBack: () => void;
  onSelectTeam: (teamId: string) => void;
  onSelectPlayer: (player: Player) => void;
  onStartComparison: (player: Player) => void;
}

export const PlayerDetailPageView: React.FC<PlayerDetailPageViewProps> = ({
  player,
  team,
  allTeams,
  allPlayers,
  onBack,
  onSelectTeam,
  onSelectPlayer,
  onStartComparison,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'bio' | 'transfers' | 'matches'>('stats');

  const enriched = getPlayerEnrichedData(player);
  const teammates = allPlayers.filter((p) => p.teamId === player.teamId && p.id !== player.id);

  const minsPerGoal = player.goals > 0 ? Math.round(player.minutesPlayed / player.goals) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-16">
      {/* Back button & Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={() => onStartComparison(player)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Compare with Another Player</span>
        </button>
      </div>

      {/* Hero Player Header Card */}
      <div
        className="relative rounded-2xl overflow-hidden border border-slate-800 p-6 md:p-8 shadow-2xl"
        style={{
          background: team
            ? `linear-gradient(135deg, ${team.crestColor}25 0%, #090d16 100%)`
            : '#090d16',
        }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Jersey Number Circle / Crest Lockup */}
          <div className="relative shrink-0">
            <div
              className="w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center font-mono font-black text-3xl md:text-4xl text-white shadow-2xl border-2"
              style={{
                backgroundColor: team?.crestColor || '#0284c7',
                borderColor: team?.secondaryColor || '#ffffff',
              }}
            >
              {player.number}
            </div>
            {team && (
              <div className="absolute -bottom-2 -right-2 bg-slate-950 rounded-full p-1 border border-slate-800 shadow-md">
                <ClubCrest team={team} size="xs" />
              </div>
            )}
          </div>

          {/* Player Info */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="text-2xl">{player.flag}</span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {player.name}
              </h1>
              <span className="font-mono text-xs uppercase font-bold px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-800">
                {player.position}
              </span>
              {(player.injuryStatus === 'injured' || player.injuryStatus === 'out' || player.injuryStatus === 'doubtful' || player.status === 'injured') ? (
                <InjuryBadge
                  injuryStatus={player.injuryStatus || 'injured'}
                  injuryNote={player.injuryNote}
                  size="sm"
                />
              ) : (
                <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Fit & Available
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-300">
              {team && (
                <button
                  onClick={() => onSelectTeam(team.id)}
                  className="hover:underline font-semibold text-white flex items-center gap-1.5"
                >
                  <span>{team.name}</span>
                </button>
              )}
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{player.nationality}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{player.age} yrs ({enriched.birthDate})</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{player.height}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Foot: {player.preferredFoot}</span>
            </div>

            {/* Market Value & Wage */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                  Market Valuation
                </span>
                <span className="font-mono text-lg font-black text-emerald-400">
                  {player.marketValue}
                </span>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                  Est. Wage
                </span>
                <span className="font-mono text-sm font-bold text-white">
                  {enriched.estimatedWage}
                </span>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                  Contract
                </span>
                <span className="font-mono text-sm text-slate-300">
                  until {enriched.contractExpires}
                </span>
              </div>
            </div>
          </div>

          {/* Form Rating Spotlight */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-center shrink-0 min-w-[120px]">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
              Form Rating
            </span>
            <span className="font-mono text-3xl font-black text-amber-400">
              ★ {player.formRating.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">Apex League Index</span>
          </div>
        </div>

        {/* MEDICAL & INJURY WARNING BULLETIN (If affected) */}
        {(player.injuryStatus === 'injured' || player.injuryStatus === 'out' || player.injuryStatus === 'doubtful' || player.status === 'injured') && (
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/30 to-amber-950/20 border border-rose-500/40 flex items-start gap-3 shadow-lg">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                    Official Medical Bulletin · Ineligible for Selection
                  </h4>
                  <InjuryBadge
                    injuryStatus={player.injuryStatus || 'injured'}
                    size="xs"
                  />
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {player.injuryNote || 'Player is currently receiving specialized rehabilitation under club physiotherapists.'}
                </p>
                {player.injuryReturnDate && (
                  <p className="text-xs font-mono text-amber-300 font-semibold pt-0.5">
                    Estimated return to full team training: {player.injuryReturnDate}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 text-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'stats'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Performance Statistics
        </button>
        <button
          onClick={() => setActiveTab('bio')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'bio'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Biography & Contract
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'transfers'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Transfer History ({enriched.transfers.length})
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'matches'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Recent Match Logs ({enriched.matchLogs.length})
        </button>
      </div>

      {/* TAB 1: STATS & ATTRIBUTES */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="font-mono text-2xl font-black text-white">{player.appearances}</span>
              <p className="text-[11px] text-slate-400 uppercase mt-1">Appearances</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="font-mono text-2xl font-black text-emerald-400">
                {player.position === 'GK' ? player.cleanSheets : player.goals}
              </span>
              <p className="text-[11px] text-slate-400 uppercase mt-1">
                {player.position === 'GK' ? 'Clean Sheets' : 'Goals'}
              </p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="font-mono text-2xl font-black text-sky-400">{player.assists}</span>
              <p className="text-[11px] text-slate-400 uppercase mt-1">Assists</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="font-mono text-2xl font-black text-amber-400">
                {player.goals > 0 ? `${minsPerGoal}'` : '—'}
              </span>
              <p className="text-[11px] text-slate-400 uppercase mt-1">Mins / Goal</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="font-mono text-2xl font-black text-slate-300">
                {player.minutesPlayed.toLocaleString()}'
              </span>
              <p className="text-[11px] text-slate-400 uppercase mt-1">Total Mins</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="font-mono text-2xl font-black text-rose-400">
                {player.yellowCards} <span className="text-xs text-slate-400">🟨</span> · {player.redCards} <span className="text-xs text-slate-400">🟥</span>
              </span>
              <p className="text-[11px] text-slate-400 uppercase mt-1">Disciplinary</p>
            </div>
          </div>

          {/* Skill Attributes (Pace, Shooting, Passing, Dribbling, Defending, Physicality) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Player Attribute Profile
                </h3>
                <span className="text-xs text-slate-500 font-mono">FIFA/FM Rating scale (1-99)</span>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Pace (PAC)', value: enriched.attributes.pace, color: 'bg-emerald-500' },
                  { label: 'Shooting (SHO)', value: enriched.attributes.shooting, color: 'bg-sky-500' },
                  { label: 'Passing (PAS)', value: enriched.attributes.passing, color: 'bg-indigo-500' },
                  { label: 'Dribbling (DRI)', value: enriched.attributes.dribbling, color: 'bg-amber-500' },
                  { label: 'Defending (DEF)', value: enriched.attributes.defending, color: 'bg-rose-500' },
                  { label: 'Physicality (PHY)', value: enriched.attributes.physical, color: 'bg-purple-500' },
                ].map((attr) => (
                  <div key={attr.label} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-300">{attr.label}</span>
                      <span className="font-mono font-bold text-white text-sm tabular-nums">
                        {attr.value}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${attr.value}%` }}
                        className={`h-full ${attr.color} transition-all duration-300`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Match Telemetry */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Technical Telemetry
                </h3>
                <span className="text-xs text-slate-500">Official season match data</span>
              </div>

              {player.stats ? (
                <div className="space-y-4">
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Passing Accuracy</h4>
                      <p className="text-[11px] text-slate-400">Completed distribution rate</p>
                    </div>
                    <span className="font-mono text-xl font-bold text-emerald-400">
                      {player.stats.passingAccuracy}%
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Tackles Won</h4>
                      <p className="text-[11px] text-slate-400">Successful ground challenges</p>
                    </div>
                    <span className="font-mono text-xl font-bold text-sky-400">
                      {player.stats.tacklesWon}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Shots on Target</h4>
                      <p className="text-[11px] text-slate-400">Accurate attempts on goal</p>
                    </div>
                    <span className="font-mono text-xl font-bold text-amber-400">
                      {player.stats.shotsOnTarget}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Aerial Duels Won</h4>
                      <p className="text-[11px] text-slate-400">Air challenges won</p>
                    </div>
                    <span className="font-mono text-xl font-bold text-purple-400">
                      {player.stats.aerialDuelsWon}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No telemetry data recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BIOGRAPHY & CONTRACT */}
      {activeTab === 'bio' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Career Narrative & Style of Play
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans text-justify">
              {enriched.bioText}
            </p>
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tactical Strengths
              </h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {player.position === 'FW' && (
                  <>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">First-time Finishing</span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">Off-the-ball Movement</span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">High Pressing Triggers</span>
                  </>
                )}
                {player.position === 'MF' && (
                  <>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">Line-breaking Vision</span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">Tempo Regulation</span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">Half-space Penetration</span>
                  </>
                )}
                {player.position === 'DF' && (
                  <>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">Positional Anticipation</span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">Aerial Dominance</span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">Defensive Recovery</span>
                  </>
                )}
                {player.position === 'GK' && (
                  <>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">Reflex Shot-stopping</span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">Cross Collection</span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">Sweeper-Keeper Distribution</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Player Dossier
            </h3>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Date of Birth:</span>
              <span className="font-mono text-white">{enriched.birthDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Age:</span>
              <span className="font-mono text-white">{player.age} yrs</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Place of Birth:</span>
              <span className="text-white">{enriched.birthPlace}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Height / Weight:</span>
              <span className="font-mono text-white">{player.height} / {enriched.weight}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Preferred Foot:</span>
              <span className="text-white">{player.preferredFoot}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Contract Expiry:</span>
              <span className="font-mono text-emerald-400 font-semibold">{enriched.contractExpires}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Agent / Representation:</span>
              <span className="text-slate-300">Stellar Sports Management</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSFER HISTORY */}
      {activeTab === 'transfers' && (
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Transfer Chronicle & Historical Moves
            </h3>
            <span className="text-xs text-emerald-400 font-mono font-bold">
              Cumulative Valuation: {player.marketValue}
            </span>
          </div>

          <div className="space-y-3">
            {enriched.transfers.map((tr) => (
              <div
                key={tr.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{tr.fromTeam}</span>
                      <span className="text-slate-500 font-mono text-xs">➔</span>
                      <span className="text-sm font-bold text-emerald-400">{tr.toTeam}</span>
                    </div>
                    <span className="text-xs text-slate-400">{tr.date} · Season {tr.season}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono border border-slate-800 text-[11px]">
                    {tr.transferType}
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    {tr.fee}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RECENT MATCH LOGS */}
      {activeTab === 'matches' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70">
            <h3 className="text-sm font-bold text-white">
              Recent Championship Match Performances
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Opponent</th>
                  <th className="py-3 px-4 text-center">Result</th>
                  <th className="py-3 px-4 text-center">Minutes</th>
                  <th className="py-3 px-4 text-center">Goals</th>
                  <th className="py-3 px-4 text-center">Assists</th>
                  <th className="py-3 px-4 text-center font-bold text-amber-400">Match Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {enriched.matchLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50">
                    <td className="py-3.5 px-4 text-slate-400">{log.date}</td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-white">
                      vs {log.opponent} ({log.opponentCode})
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[11px]">
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-300">{log.minutes}'</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                      {log.goals > 0 ? `⚽ ${log.goals}` : '0'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-sky-400">
                      {log.assists > 0 ? `🎯 ${log.assists}` : '0'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-400 text-sm">
                      ★ {log.rating.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teammates Showcase Row */}
      {teammates.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {team?.shortName} Teammates
            </h3>
            <span className="text-xs text-slate-500">{teammates.length} other squad members</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {teammates.slice(0, 8).map((tm) => (
              <div
                key={tm.id}
                onClick={() => onSelectPlayer(tm)}
                className="shrink-0 p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all w-40 text-center"
              >
                <span className="w-7 h-7 rounded-full bg-slate-800 font-mono text-xs font-bold text-white inline-flex items-center justify-center mb-1">
                  {tm.number}
                </span>
                <h4 className="text-xs font-bold text-white truncate">{tm.name}</h4>
                <span className="text-[10px] text-slate-400 font-mono uppercase">{tm.position}</span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold block mt-0.5">
                  ★ {tm.formRating.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

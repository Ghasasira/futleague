import React, { useState } from 'react';
import { Player, Team } from '../types/league';
import { ClubCrest } from './ClubCrest';
import { InjuryBadge } from './InjuryBadge';
import { getPlayerEnrichedData } from '../utils/playerEnrichment';
import {
  ArrowRightLeft,
  Award,
  Zap,
  Shield,
  Activity,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface PlayerComparisonViewProps {
  players: Player[];
  teams: Team[];
  initialPlayerA?: Player | null;
  initialPlayerB?: Player | null;
  onSelectPlayer: (player: Player) => void;
  onSelectTeam: (teamId: string) => void;
}

export const PlayerComparisonView: React.FC<PlayerComparisonViewProps> = ({
  players,
  teams,
  initialPlayerA,
  initialPlayerB,
  onSelectPlayer,
  onSelectTeam,
}) => {
  // Default to two marquee players if not provided
  const defaultPlayerA = initialPlayerA || players.find((p) => p.name.includes('Vance')) || players[0];
  const defaultPlayerB =
    initialPlayerB ||
    players.find((p) => p.name.includes('Farouk')) ||
    players.find((p) => p.id !== defaultPlayerA.id) ||
    players[1];

  const [playerAId, setPlayerAId] = useState<string>(defaultPlayerA.id);
  const [playerBId, setPlayerBId] = useState<string>(defaultPlayerB.id);

  const playerA = players.find((p) => p.id === playerAId) || players[0];
  const playerB = players.find((p) => p.id === playerBId) || players[1];

  const teamA = teams.find((t) => t.id === playerA.teamId);
  const teamB = teams.find((t) => t.id === playerB.teamId);

  const enrichedA = getPlayerEnrichedData(playerA);
  const enrichedB = getPlayerEnrichedData(playerB);

  // Switch positions
  const handleSwapPlayers = () => {
    const temp = playerAId;
    setPlayerAId(playerBId);
    setPlayerBId(temp);
  };

  // Preset match-ups
  const presets = [
    {
      title: 'Striker Super Duel',
      desc: 'Erling Vance vs Mohamed Farouk',
      idA: players.find((p) => p.name.includes('Vance'))?.id,
      idB: players.find((p) => p.name.includes('Farouk'))?.id,
    },
    {
      title: 'Midfield Playmakers',
      desc: 'Kevin De Vries vs Pedri',
      idA: players.find((p) => p.name.includes('De Vries'))?.id,
      idB: players.find((p) => p.name.includes('Pedri'))?.id,
    },
    {
      title: 'Goalkeeper Titans',
      desc: 'Daniel Ortega vs Alisson Becker-Roy',
      idA: players.find((p) => p.name.includes('Ortega'))?.id,
      idB: players.find((p) => p.name.includes('Becker'))?.id,
    },
    {
      title: 'Generational Talents',
      desc: 'Julian Sterling vs Lamine Yamal',
      idA: players.find((p) => p.name.includes('Sterling'))?.id,
      idB: players.find((p) => p.name.includes('Yamal'))?.id,
    },
  ].filter((preset) => preset.idA && preset.idB);

  // Metric comparison helper
  const renderMetricBar = (
    label: string,
    valA: number,
    valB: number,
    isLowerBetter = false,
    suffix = ''
  ) => {
    const total = valA + valB || 1;
    const pctA = (valA / total) * 100;
    const pctB = (valB / total) * 100;

    const aWins = isLowerBetter ? valA < valB : valA > valB;
    const bWins = isLowerBetter ? valB < valA : valB > valA;
    const tie = valA === valB;

    return (
      <div className="space-y-1.5 py-2.5 border-b border-slate-800/80 last:border-b-0">
        <div className="flex items-center justify-between text-xs">
          <span
            className={`font-mono font-bold text-sm tabular-nums w-16 text-left ${
              aWins ? 'text-emerald-400 font-black' : tie ? 'text-white' : 'text-slate-400'
            }`}
          >
            {valA}
            {suffix} {aWins && '👑'}
          </span>
          <span className="text-slate-300 font-semibold text-xs tracking-tight text-center flex-1">
            {label}
          </span>
          <span
            className={`font-mono font-bold text-sm tabular-nums w-16 text-right ${
              bWins ? 'text-emerald-400 font-black' : tie ? 'text-white' : 'text-slate-400'
            }`}
          >
            {bWins && '👑 '}
            {valB}
            {suffix}
          </span>
        </div>

        {/* Dual Comparative Bar */}
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
          <div
            style={{
              width: `${pctA}%`,
              backgroundColor: teamA?.crestColor || '#0284c7',
            }}
            className="h-full transition-all duration-300"
          />
          <div
            style={{
              width: `${pctB}%`,
              backgroundColor: teamB?.crestColor || '#dc2626',
            }}
            className="h-full transition-all duration-300"
          />
        </div>
      </div>
    );
  };

  const minsPerGoalA = playerA.goals > 0 ? Math.round(playerA.minutesPlayed / playerA.goals) : 0;
  const minsPerGoalB = playerB.goals > 0 ? Math.round(playerB.minutesPlayed / playerB.goals) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
            Head-to-Head Player Comparison
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Analyze and compare any two championship footballers side-by-side.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2 text-xs">
          {presets.map((pr, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (pr.idA) setPlayerAId(pr.idA);
                if (pr.idB) setPlayerBId(pr.idB);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors"
            >
              {pr.title}
            </button>
          ))}
        </div>
      </div>

      {/* Selector Banner: Player A vs Player B */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        {/* Player A Card Selector */}
        <div className="md:col-span-2 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-400 uppercase tracking-wider">
              Player A
            </span>
            <select
              value={playerAId}
              onChange={(e) => setPlayerAId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500 max-w-[200px]"
            >
              {players.map((p) => {
                const t = teams.find((tm) => tm.id === p.teamId);
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} ({t?.code} - #{p.number})
                  </option>
                );
              })}
            </select>
          </div>

          <div
            onClick={() => onSelectPlayer(playerA)}
            className="flex items-center gap-4 cursor-pointer group hover:bg-slate-850 p-2 rounded-xl transition-colors"
          >
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center font-mono font-black text-2xl text-white shadow-md border-2 shrink-0"
              style={{
                backgroundColor: teamA?.crestColor || '#0284c7',
                borderColor: teamA?.secondaryColor || '#ffffff',
              }}
            >
              {playerA.number}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">{playerA.flag}</span>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {playerA.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                {teamA && <span>{teamA.name}</span>}
                <span aria-hidden="true">·</span>
                <span className="font-mono text-emerald-400 font-semibold">{playerA.position}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-mono font-bold text-white text-xs">
                  {playerA.marketValue} · ★ {playerA.formRating.toFixed(1)}
                </span>
                {(playerA.injuryStatus === 'injured' || playerA.injuryStatus === 'out' || playerA.injuryStatus === 'doubtful' || playerA.status === 'injured') && (
                  <InjuryBadge
                    injuryStatus={playerA.injuryStatus || 'injured'}
                    injuryNote={playerA.injuryNote}
                    size="xs"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center Swap Action */}
        <div className="md:col-span-1 flex justify-center">
          <button
            onClick={handleSwapPlayers}
            title="Swap Player A and Player B"
            className="p-3 rounded-full bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-white shadow-lg transition-transform hover:rotate-180"
          >
            <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
          </button>
        </div>

        {/* Player B Card Selector */}
        <div className="md:col-span-2 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-400 uppercase tracking-wider">
              Player B
            </span>
            <select
              value={playerBId}
              onChange={(e) => setPlayerBId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500 max-w-[200px]"
            >
              {players.map((p) => {
                const t = teams.find((tm) => tm.id === p.teamId);
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} ({t?.code} - #{p.number})
                  </option>
                );
              })}
            </select>
          </div>

          <div
            onClick={() => onSelectPlayer(playerB)}
            className="flex items-center gap-4 cursor-pointer group hover:bg-slate-850 p-2 rounded-xl transition-colors"
          >
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center font-mono font-black text-2xl text-white shadow-md border-2 shrink-0"
              style={{
                backgroundColor: teamB?.crestColor || '#dc2626',
                borderColor: teamB?.secondaryColor || '#ffffff',
              }}
            >
              {playerB.number}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">{playerB.flag}</span>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {playerB.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                {teamB && <span>{teamB.name}</span>}
                <span aria-hidden="true">·</span>
                <span className="font-mono text-emerald-400 font-semibold">{playerB.position}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-mono font-bold text-white text-xs">
                  {playerB.marketValue} · ★ {playerB.formRating.toFixed(1)}
                </span>
                {(playerB.injuryStatus === 'injured' || playerB.injuryStatus === 'out' || playerB.injuryStatus === 'doubtful' || playerB.status === 'injured') && (
                  <InjuryBadge
                    injuryStatus={playerB.injuryStatus || 'injured'}
                    injuryNote={playerB.injuryNote}
                    size="xs"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS MATRIX COMPARISON */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Season Output & Productivity Matrix
        </h3>

        {renderMetricBar('Goals Scored', playerA.goals, playerB.goals)}
        {renderMetricBar('Assists Provided', playerA.assists, playerB.assists)}
        {renderMetricBar('Total Goal Contributions', playerA.goals + playerA.assists, playerB.goals + playerB.assists)}
        {renderMetricBar('Form Rating', Number(playerA.formRating.toFixed(1)), Number(playerB.formRating.toFixed(1)))}
        {renderMetricBar('Appearances', playerA.appearances, playerB.appearances)}
        {renderMetricBar('Minutes Played', playerA.minutesPlayed, playerB.minutesPlayed, false, "'")}
        {renderMetricBar('Clean Sheets', playerA.cleanSheets, playerB.cleanSheets)}
        {renderMetricBar('Disciplinary Cards (Yellow + Red)', playerA.yellowCards + playerA.redCards, playerB.yellowCards + playerB.redCards, true)}
      </div>

      {/* ATTRIBUTE RADAR / RATINGS DUEL */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Attribute Skill Comparison (1-99)
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-bold" style={{ color: teamA?.crestColor }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teamA?.crestColor }} />
              {playerA.name}
            </span>
            <span className="text-slate-500">vs</span>
            <span className="flex items-center gap-1.5 font-bold" style={{ color: teamB?.crestColor }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teamB?.crestColor }} />
              {playerB.name}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Pace (Speed & Acceleration)', valA: enrichedA.attributes.pace, valB: enrichedB.attributes.pace },
            { label: 'Shooting (Finishing & Power)', valA: enrichedA.attributes.shooting, valB: enrichedB.attributes.shooting },
            { label: 'Passing (Vision & Accuracy)', valA: enrichedA.attributes.passing, valB: enrichedB.attributes.passing },
            { label: 'Dribbling (Agility & Control)', valA: enrichedA.attributes.dribbling, valB: enrichedB.attributes.dribbling },
            { label: 'Defending (Interceptions & Tackles)', valA: enrichedA.attributes.defending, valB: enrichedB.attributes.defending },
            { label: 'Physicality (Stamina & Strength)', valA: enrichedA.attributes.physical, valB: enrichedB.attributes.physical },
          ].map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono font-bold text-sm" style={{ color: teamA?.crestColor }}>
                  {item.valA}
                </span>
                <span className="text-slate-300 font-semibold">{item.label}</span>
                <span className="font-mono font-bold text-sm" style={{ color: teamB?.crestColor }}>
                  {item.valB}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                <div
                  style={{
                    width: `${(item.valA / (item.valA + item.valB)) * 100}%`,
                    backgroundColor: teamA?.crestColor || '#0284c7',
                  }}
                  className="h-full transition-all duration-300"
                />
                <div
                  style={{
                    width: `${(item.valB / (item.valA + item.valB)) * 100}%`,
                    backgroundColor: teamB?.crestColor || '#dc2626',
                  }}
                  className="h-full transition-all duration-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Telemetry Comparison */}
      {playerA.stats && playerB.stats && (
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Technical Telemetry Head-to-Head
          </h3>
          {renderMetricBar('Passing Accuracy', playerA.stats.passingAccuracy, playerB.stats.passingAccuracy, false, '%')}
          {renderMetricBar('Defensive Tackles Won', playerA.stats.tacklesWon, playerB.stats.tacklesWon)}
          {renderMetricBar('Shots on Target', playerA.stats.shotsOnTarget, playerB.stats.shotsOnTarget)}
          {renderMetricBar('Aerial Duels Won', playerA.stats.aerialDuelsWon, playerB.stats.aerialDuelsWon)}
        </div>
      )}
    </div>
  );
};

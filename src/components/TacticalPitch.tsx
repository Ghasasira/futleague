import React, { useState } from 'react';
import { Match, MatchLineupPlayer, Team, Player } from '../types/league';
import { Shield, Sparkles } from 'lucide-react';

interface TacticalPitchProps {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  allPlayers: Player[];
  onSelectPlayer?: (player: Player) => void;
}

export const TacticalPitch: React.FC<TacticalPitchProps> = ({
  match,
  homeTeam,
  awayTeam,
  allPlayers,
  onSelectPlayer,
}) => {
  const [activeSide, setActiveSide] = useState<'both' | 'home' | 'away'>('both');
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);

  const getPlayerEvents = (playerId: string) => {
    const events = match.events.filter((e) => e.playerId === playerId);
    const goals = events.filter((e) => e.type === 'GOAL' || e.type === 'PENALTY_GOAL').length;
    const yellowCards = events.filter((e) => e.type === 'YELLOW_CARD').length;
    const redCards = events.filter((e) => e.type === 'RED_CARD').length;
    return { goals, yellowCards, redCards };
  };

  const handlePlayerClick = (lineupPlayer: MatchLineupPlayer) => {
    const fullPlayer = allPlayers.find((p) => p.id === lineupPlayer.playerId);
    if (fullPlayer && onSelectPlayer) {
      onSelectPlayer(fullPlayer);
    }
  };

  const renderPlayerNode = (
    player: MatchLineupPlayer,
    team: Team,
    isHome: boolean
  ) => {
    const fullPlayer = allPlayers.find((p) => p.id === player.playerId);
    const isInjured = fullPlayer?.injuryStatus && fullPlayer.injuryStatus !== 'fit';
    const events = getPlayerEvents(player.playerId);
    const isHovered = hoveredPlayerId === player.playerId;

    return (
      <div
        key={player.playerId}
        onClick={() => handlePlayerClick(player)}
        onMouseEnter={() => setHoveredPlayerId(player.playerId)}
        onMouseLeave={() => setHoveredPlayerId(null)}
        style={{
          left: `${player.x}%`,
          top: `${player.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        className={`absolute z-10 flex flex-col items-center cursor-pointer transition-all duration-150 ${
          isHovered ? 'scale-115 z-20' : 'hover:scale-110'
        }`}
      >
        {/* Event badges floating above */}
        <div className="flex items-center gap-1 -mb-1 z-20">
          {isInjured && (
            <span
              title={`Injury Warning: ${fullPlayer?.injuryNote || 'Medical attention'}`}
              className="bg-rose-500 text-white font-bold text-[9px] px-1 rounded-sm shadow-sm flex items-center gap-0.5 animate-pulse"
            >
              ⚠️
            </span>
          )}
          {events.goals > 0 && (
            <span
              title={`${events.goals} Goal(s)`}
              className="bg-emerald-500 text-slate-950 font-bold text-[9px] px-1 rounded-sm shadow-sm flex items-center"
            >
              ⚽{events.goals > 1 ? `x${events.goals}` : ''}
            </span>
          )}
          {events.yellowCards > 0 && (
            <span
              title="Yellow Card"
              className="w-2 h-3 bg-amber-400 border border-amber-500 rounded-[1px] shadow-sm inline-block"
            />
          )}
          {events.redCards > 0 && (
            <span
              title="Red Card"
              className="w-2 h-3 bg-rose-600 border border-rose-700 rounded-[1px] shadow-sm inline-block"
            />
          )}
          {player.substitutedMinute && (
            <span
              title={`Substituted at ${player.substitutedMinute}'`}
              className="text-[9px] text-amber-300 font-bold bg-slate-900/90 px-1 rounded"
            >
              🔄 {player.substitutedMinute}'
            </span>
          )}
        </div>

        {/* Jersey Circle Node */}
        <div
          style={{
            backgroundColor: isHome ? team.crestColor : team.crestColor,
            borderColor: isHome ? team.secondaryColor : '#ffffff',
          }}
          className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-bold font-mono text-white text-xs md:text-sm border-2 shadow-lg shadow-black/40 transition-shadow ${
            isHovered ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
          }`}
        >
          {player.number}
        </div>

        {/* Name and Rating */}
        <div className="mt-1 flex flex-col items-center">
          <span className="text-[10px] md:text-xs font-semibold text-slate-100 bg-slate-950/80 px-1.5 py-0.5 rounded backdrop-blur-sm whitespace-nowrap shadow-sm">
            {player.name}
          </span>
          {player.rating && (
            <span className="text-[9px] font-mono tabular-nums text-emerald-400 font-bold">
              {player.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Pitch Header / Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: homeTeam.crestColor }} />
            <span className="text-xs font-semibold text-slate-200">{homeTeam.shortName}</span>
            <span className="text-xs text-slate-400 font-mono">({match.homeLineup.formation})</span>
          </div>
          <span className="text-slate-600 text-xs">vs</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: awayTeam.crestColor }} />
            <span className="text-xs font-semibold text-slate-200">{awayTeam.shortName}</span>
            <span className="text-xs text-slate-400 font-mono">({match.awayLineup.formation})</span>
          </div>
        </div>

        {/* Side Selector Tabs */}
        <div className="flex items-center p-1 bg-slate-950/80 rounded-md border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSide('both')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeSide === 'both' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tactical Matchup
          </button>
          <button
            onClick={() => setActiveSide('home')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeSide === 'home' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {homeTeam.code} Formation
          </button>
          <button
            onClick={() => setActiveSide('away')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeSide === 'away' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {awayTeam.code} Formation
          </button>
        </div>
      </div>

      {/* 2D Football Pitch Arena */}
      <div className="relative w-full aspect-[16/10] md:aspect-[16/9] max-h-[520px] rounded-xl overflow-hidden border border-emerald-900/60 shadow-2xl pitch-grass select-none">
        {/* Pitch Turf Markings SVG */}
        <svg
          viewBox="0 0 1000 640"
          className="absolute inset-0 w-full h-full stroke-white/40 fill-none"
          strokeWidth="2.5"
          preserveAspectRatio="none"
        >
          {/* Pitch Outer Boundary */}
          <rect x="25" y="25" width="950" height="590" />

          {/* Halfway Line */}
          <line x1="500" y1="25" x2="500" y2="615" />

          {/* Center Circle & Spot */}
          <circle cx="500" cy="320" r="85" />
          <circle cx="500" cy="320" r="3" fill="rgba(255,255,255,0.7)" />

          {/* Left Penalty Box (Home) */}
          <rect x="25" y="145" width="160" height="350" />
          {/* Left 6-Yard Box */}
          <rect x="25" y="225" width="55" height="190" />
          {/* Left Penalty Spot */}
          <circle cx="135" cy="320" r="3" fill="rgba(255,255,255,0.7)" />
          {/* Left Penalty Arc */}
          <path d="M 185 260 A 85 85 0 0 1 185 380" />
          {/* Left Goal Net Frame */}
          <rect x="5" y="275" width="20" height="90" stroke="rgba(255,255,255,0.5)" strokeDasharray="3 3" />

          {/* Right Penalty Box (Away) */}
          <rect x="815" y="145" width="160" height="350" />
          {/* Right 6-Yard Box */}
          <rect x="920" y="225" width="55" height="190" />
          {/* Right Penalty Spot */}
          <circle cx="865" cy="320" r="3" fill="rgba(255,255,255,0.7)" />
          {/* Right Penalty Arc */}
          <path d="M 815 260 A 85 85 0 0 0 815 380" />
          {/* Right Goal Net Frame */}
          <rect x="975" y="275" width="20" height="90" stroke="rgba(255,255,255,0.5)" strokeDasharray="3 3" />

          {/* Corner Arcs */}
          <path d="M 25 45 A 20 20 0 0 1 45 25" />
          <path d="M 25 595 A 20 20 0 0 0 45 615" />
          <path d="M 975 45 A 20 20 0 0 0 955 25" />
          <path d="M 975 595 A 20 20 0 0 1 955 615" />
        </svg>

        {/* Players on Pitch */}
        <div className="absolute inset-0">
          {(activeSide === 'both' || activeSide === 'home') &&
            match.homeLineup.starters.map((player) =>
              renderPlayerNode(player, homeTeam, true)
            )}

          {(activeSide === 'both' || activeSide === 'away') &&
            match.awayLineup.starters.map((player) =>
              renderPlayerNode(player, awayTeam, false)
            )}
        </div>

        {/* Orientation labels */}
        <div className="absolute bottom-2 left-3 text-[10px] uppercase font-mono tracking-wider text-white/50 bg-black/40 px-2 py-0.5 rounded">
          {homeTeam.shortName} Attack ➔
        </div>
        <div className="absolute bottom-2 right-3 text-[10px] uppercase font-mono tracking-wider text-white/50 bg-black/40 px-2 py-0.5 rounded">
          ⬅ {awayTeam.shortName} Attack
        </div>
      </div>

      {/* Substitutes / Bench Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 text-xs">
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-300 font-semibold">
            <span>{homeTeam.shortName} Substitutes</span>
            <span className="text-[11px] text-slate-500">{match.homeLineup.bench.length} available</span>
          </div>
          {match.homeLineup.bench.length === 0 ? (
            <span className="text-slate-500 italic">No substitutes listed</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {match.homeLineup.bench.map((benchPlayer) => {
                const fp = allPlayers.find((p) => p.id === benchPlayer.playerId);
                const isInj = fp?.injuryStatus && fp.injuryStatus !== 'fit';
                return (
                  <button
                    key={benchPlayer.playerId}
                    onClick={() => handlePlayerClick(benchPlayer)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/50 transition-colors"
                  >
                    <span className="font-mono text-emerald-400 font-bold">{benchPlayer.number}</span>
                    <span>{benchPlayer.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase">({benchPlayer.position})</span>
                    {isInj && (
                      <span className="text-[10px] text-rose-400 font-bold animate-pulse" title={fp?.injuryNote || 'Injured'}>
                        ⚠️
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-300 font-semibold">
            <span>{awayTeam.shortName} Substitutes</span>
            <span className="text-[11px] text-slate-500">{match.awayLineup.bench.length} available</span>
          </div>
          {match.awayLineup.bench.length === 0 ? (
            <span className="text-slate-500 italic">No substitutes listed</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {match.awayLineup.bench.map((benchPlayer) => {
                const fp = allPlayers.find((p) => p.id === benchPlayer.playerId);
                const isInj = fp?.injuryStatus && fp.injuryStatus !== 'fit';
                return (
                  <button
                    key={benchPlayer.playerId}
                    onClick={() => handlePlayerClick(benchPlayer)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/50 transition-colors"
                  >
                    <span className="font-mono text-emerald-400 font-bold">{benchPlayer.number}</span>
                    <span>{benchPlayer.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase">({benchPlayer.position})</span>
                    {isInj && (
                      <span className="text-[10px] text-rose-400 font-bold animate-pulse" title={fp?.injuryNote || 'Injured'}>
                        ⚠️
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

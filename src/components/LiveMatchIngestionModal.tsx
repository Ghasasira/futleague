import React, { useState } from 'react';
import {
  Match,
  Team,
  Player,
  MatchEventType,
  MatchEvent,
} from '../types/league';
import {
  X,
  PlusCircle,
  Clock,
  Activity,
  AlertTriangle,
  RefreshCw,
  Send,
  Sliders,
  Award,
} from 'lucide-react';

interface LiveMatchIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  homePlayers: Player[];
  awayPlayers: Player[];
  onAddEvent: (newEvent: Omit<MatchEvent, 'id'>) => void;
  onUpdateScore: (homeScore: number, awayScore: number) => void;
  onUpdateMinute: (minute: number) => void;
  onUpdateStatus: (status: 'UPCOMING' | 'LIVE' | 'FINISHED') => void;
  onUpdateStats: (newStats: Match['stats']) => void;
  onUpdateMvp?: (mvpPlayerId?: string) => void;
}

export const LiveMatchIngestionModal: React.FC<LiveMatchIngestionModalProps> = ({
  isOpen,
  onClose,
  match,
  homeTeam,
  awayTeam,
  homePlayers,
  awayPlayers,
  onAddEvent,
  onUpdateScore,
  onUpdateMinute,
  onUpdateStatus,
  onUpdateStats,
  onUpdateMvp,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'goal' | 'card' | 'sub' | 'var' | 'stats' | 'clock'>('goal');

  // Goal Form State
  const [goalTeamId, setGoalTeamId] = useState<string>(homeTeam.id);
  const [goalPlayerId, setGoalPlayerId] = useState<string>('');
  const [assistPlayerId, setAssistPlayerId] = useState<string>('');
  const [goalMinute, setGoalMinute] = useState<number>(match.currentMinute || 1);
  const [goalType, setGoalType] = useState<MatchEventType>('GOAL');
  const [goalDetail, setGoalDetail] = useState<string>('');

  // Card Form State
  const [cardTeamId, setCardTeamId] = useState<string>(homeTeam.id);
  const [cardPlayerId, setCardPlayerId] = useState<string>('');
  const [cardType, setCardType] = useState<'YELLOW_CARD' | 'RED_CARD'>('YELLOW_CARD');
  const [cardMinute, setCardMinute] = useState<number>(match.currentMinute || 1);
  const [cardReason, setCardReason] = useState<string>('Tactical foul');

  // Sub Form State
  const [subTeamId, setSubTeamId] = useState<string>(homeTeam.id);
  const [playerOutId, setPlayerOutId] = useState<string>('');
  const [playerInId, setPlayerInId] = useState<string>('');
  const [subMinute, setSubMinute] = useState<number>(match.currentMinute || 1);

  // VAR Form State
  const [varTeamId, setVarTeamId] = useState<string>(homeTeam.id);
  const [varMinute, setVarMinute] = useState<number>(match.currentMinute || 1);
  const [varDetail, setVarDetail] = useState<string>('Goal confirmed after video review for possible offside.');

  // Current active players based on chosen team
  const currentGoalPlayers = goalTeamId === homeTeam.id ? homePlayers : awayPlayers;
  const currentCardPlayers = cardTeamId === homeTeam.id ? homePlayers : awayPlayers;
  const currentSubPlayers = subTeamId === homeTeam.id ? homePlayers : awayPlayers;

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scorer = currentGoalPlayers.find((p) => p.id === goalPlayerId);
    const assist = currentGoalPlayers.find((p) => p.id === assistPlayerId);

    if (!scorer && !goalPlayerId) return;

    const scorerName = scorer ? scorer.name : 'Unknown Player';
    const assistName = assist ? assist.name : undefined;

    // Add event
    onAddEvent({
      minute: goalMinute,
      type: goalType,
      teamId: goalTeamId,
      playerId: goalPlayerId,
      playerName: scorerName,
      secondaryPlayerId: assistPlayerId || undefined,
      secondaryPlayerName: assistName,
      detail: goalDetail || (goalType === 'PENALTY_GOAL' ? 'Converted penalty kick.' : 'Goal scored into bottom corner.'),
    });

    // Update score
    if (goalTeamId === homeTeam.id) {
      onUpdateScore(match.homeScore + 1, match.awayScore);
    } else {
      onUpdateScore(match.homeScore, match.awayScore + 1);
    }

    // Reset inputs
    setGoalDetail('');
    setGoalPlayerId('');
    setAssistPlayerId('');
    onClose();
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const player = currentCardPlayers.find((p) => p.id === cardPlayerId);
    if (!player) return;

    onAddEvent({
      minute: cardMinute,
      type: cardType,
      teamId: cardTeamId,
      playerId: cardPlayerId,
      playerName: player.name,
      detail: cardReason,
    });

    onClose();
  };

  const handleSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const outP = currentSubPlayers.find((p) => p.id === playerOutId);
    const inP = currentSubPlayers.find((p) => p.id === playerInId);

    if (!outP || !inP) return;

    onAddEvent({
      minute: subMinute,
      type: 'SUB',
      teamId: subTeamId,
      playerId: playerInId,
      playerName: inP.name,
      secondaryPlayerId: playerOutId,
      secondaryPlayerName: outP.name,
      detail: `Substitution: ${inP.name} in for ${outP.name}`,
    });

    onClose();
  };

  const handleVarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent({
      minute: varMinute,
      type: 'VAR_DECISION',
      teamId: varTeamId,
      playerId: 'var',
      playerName: 'VAR Referee',
      detail: varDetail,
    });
    onClose();
  };

  const handleQuickStatChange = (
    statKey: keyof Match['stats'],
    teamIndex: 0 | 1,
    delta: number
  ) => {
    const updated = { ...match.stats };
    const currentVal = updated[statKey][teamIndex];
    const newVal = Math.max(0, currentVal + delta);
    if (statKey === 'possession') {
      const otherIndex = teamIndex === 0 ? 1 : 0;
      updated.possession = teamIndex === 0 ? [newVal, 100 - newVal] : [100 - newVal, newVal];
    } else if (statKey === 'xG') {
      const fixedXg = Number((currentVal + delta).toFixed(2));
      updated.xG[teamIndex] = Math.max(0, fixedXg);
    } else {
      updated[statKey][teamIndex] = newVal;
    }
    onUpdateStats(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Live Match Ingestion Console
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{homeTeam.shortName} vs {awayTeam.shortName}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-emerald-400 font-semibold">{match.currentMinute}' Minute</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono font-bold text-white">{match.homeScore} - {match.awayScore}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-900/40 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('goal')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'goal'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚽ Record Goal
          </button>
          <button
            onClick={() => setActiveTab('card')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'card'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🟨 Disciplinary Card
          </button>
          <button
            onClick={() => setActiveTab('sub')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'sub'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🔄 Substitution
          </button>
          <button
            onClick={() => setActiveTab('var')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'var'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📺 VAR Check
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 Live Stats
          </button>
          <button
            onClick={() => setActiveTab('clock')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'clock'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ⏱️ Clock & Status
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* TAB 1: GOAL */}
          {activeTab === 'goal' && (
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Scoring Team
                  </label>
                  <select
                    value={goalTeamId}
                    onChange={(e) => {
                      setGoalTeamId(e.target.value);
                      setGoalPlayerId('');
                      setAssistPlayerId('');
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={homeTeam.id}>{homeTeam.name} (Home)</option>
                    <option value={awayTeam.id}>{awayTeam.name} (Away)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Goal Type
                  </label>
                  <select
                    value={goalType}
                    onChange={(e) => setGoalType(e.target.value as MatchEventType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="GOAL">Regular Goal</option>
                    <option value="PENALTY_GOAL">Penalty Kick</option>
                    <option value="OWN_GOAL">Own Goal (OG)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Goalscorer *
                  </label>
                  <select
                    required
                    value={goalPlayerId}
                    onChange={(e) => setGoalPlayerId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Scorer...</option>
                    {currentGoalPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.number} - {p.name} ({p.position})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Minute (1-120)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={goalMinute}
                    onChange={(e) => setGoalMinute(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assist Provider (Optional)
                </label>
                <select
                  value={assistPlayerId}
                  onChange={(e) => setAssistPlayerId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">No assist / Solo effort / Rebound</option>
                  {currentGoalPlayers
                    .filter((p) => p.id !== goalPlayerId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.number} - {p.name} ({p.position})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Match Commentary Detail
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sensational curling effort from outside the box into the top corner."
                  value={goalDetail}
                  onChange={(e) => setGoalDetail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!goalPlayerId}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 rounded-lg hover:bg-emerald-300 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Publish Live Goal & Notify
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: DISCIPLINARY CARD */}
          {activeTab === 'card' && (
            <form onSubmit={handleCardSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Team
                  </label>
                  <select
                    value={cardTeamId}
                    onChange={(e) => {
                      setCardTeamId(e.target.value);
                      setCardPlayerId('');
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={homeTeam.id}>{homeTeam.name}</option>
                    <option value={awayTeam.id}>{awayTeam.name}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Card Type
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCardType('YELLOW_CARD')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                        cardType === 'YELLOW_CARD'
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <span className="w-2.5 h-3.5 bg-amber-400 rounded-[1px] border border-amber-600 inline-block" />
                      Yellow Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardType('RED_CARD')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                        cardType === 'RED_CARD'
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <span className="w-2.5 h-3.5 bg-rose-600 rounded-[1px] border border-rose-800 inline-block" />
                      Red Card
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Player *
                  </label>
                  <select
                    required
                    value={cardPlayerId}
                    onChange={(e) => setCardPlayerId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Player...</option>
                    {currentCardPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.number} - {p.name} ({p.position})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Minute
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={cardMinute}
                    onChange={(e) => setCardMinute(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Infraction Reason
                </label>
                <select
                  value={cardReason}
                  onChange={(e) => setCardReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Tactical cynical foul">Tactical cynical foul</option>
                  <option value="Dangerous late slide tackle">Dangerous late slide tackle</option>
                  <option value="Dissent towards match referee">Dissent towards match referee</option>
                  <option value="Time wasting">Time wasting</option>
                  <option value="Unsporting behavior">Unsporting behavior</option>
                  <option value="Denying an obvious goal-scoring opportunity">Denying an obvious goal-scoring opportunity</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!cardPlayerId}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Log Disciplinary Card
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SUBSTITUTION */}
          {activeTab === 'sub' && (
            <form onSubmit={handleSubSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Team
                </label>
                <select
                  value={subTeamId}
                  onChange={(e) => {
                    setSubTeamId(e.target.value);
                    setPlayerOutId('');
                    setPlayerInId('');
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={homeTeam.id}>{homeTeam.name}</option>
                  <option value={awayTeam.id}>{awayTeam.name}</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-rose-400 mb-1">
                    Player Leaving (OUT)
                  </label>
                  <select
                    required
                    value={playerOutId}
                    onChange={(e) => setPlayerOutId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="">Select player coming off...</option>
                    {currentSubPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.number} - {p.name} ({p.position})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-400 mb-1">
                    Player Entering (IN)
                  </label>
                  <select
                    required
                    value={playerInId}
                    onChange={(e) => setPlayerInId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select fresh player coming on...</option>
                    {currentSubPlayers
                      .filter((p) => p.id !== playerOutId)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          #{p.number} - {p.name} ({p.position})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Minute
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={subMinute}
                  onChange={(e) => setSubMinute(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!playerOutId || !playerInId}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 rounded-lg hover:bg-sky-300 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Execute Substitution
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: VAR */}
          {activeTab === 'var' && (
            <form onSubmit={handleVarSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Related Team
                  </label>
                  <select
                    value={varTeamId}
                    onChange={(e) => setVarTeamId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={homeTeam.id}>{homeTeam.name}</option>
                    <option value={awayTeam.id}>{awayTeam.name}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Minute
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={varMinute}
                    onChange={(e) => setVarMinute(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  VAR Review Ruling
                </label>
                <textarea
                  rows={3}
                  value={varDetail}
                  onChange={(e) => setVarDetail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Post VAR Ruling
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: LIVE STATS ADJUSTMENT */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Live official match telemetry adjustment. Click to increment or decrement metrics in real time.
              </p>

              <div className="space-y-3 bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                {/* Shots on Target */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickStatChange('shotsOnTarget', 0, -1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono tabular-nums text-white font-bold w-6 text-center">
                      {match.stats.shotsOnTarget[0]}
                    </span>
                    <button
                      onClick={() => handleQuickStatChange('shotsOnTarget', 0, 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-medium text-slate-400">Shots on Target</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickStatChange('shotsOnTarget', 1, -1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono tabular-nums text-white font-bold w-6 text-center">
                      {match.stats.shotsOnTarget[1]}
                    </span>
                    <button
                      onClick={() => handleQuickStatChange('shotsOnTarget', 1, 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total Shots */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickStatChange('shots', 0, -1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono tabular-nums text-white font-bold w-6 text-center">
                      {match.stats.shots[0]}
                    </span>
                    <button
                      onClick={() => handleQuickStatChange('shots', 0, 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-medium text-slate-400">Total Shots</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickStatChange('shots', 1, -1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono tabular-nums text-white font-bold w-6 text-center">
                      {match.stats.shots[1]}
                    </span>
                    <button
                      onClick={() => handleQuickStatChange('shots', 1, 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Expected Goals (xG) */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickStatChange('xG', 0, -0.1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono tabular-nums text-white font-bold w-10 text-center">
                      {match.stats.xG[0].toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleQuickStatChange('xG', 0, 0.1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-medium text-slate-400">Expected Goals (xG)</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickStatChange('xG', 1, -0.1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono tabular-nums text-white font-bold w-10 text-center">
                      {match.stats.xG[1].toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleQuickStatChange('xG', 1, 0.1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Corners */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickStatChange('corners', 0, -1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono tabular-nums text-white font-bold w-6 text-center">
                      {match.stats.corners[0]}
                    </span>
                    <button
                      onClick={() => handleQuickStatChange('corners', 0, 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-medium text-slate-400">Corner Kicks</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickStatChange('corners', 1, -1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono tabular-nums text-white font-bold w-6 text-center">
                      {match.stats.corners[1]}
                    </span>
                    <button
                      onClick={() => handleQuickStatChange('corners', 1, 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Fouls */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickStatChange('fouls', 0, -1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono tabular-nums text-white font-bold w-6 text-center">
                      {match.stats.fouls[0]}
                    </span>
                    <button
                      onClick={() => handleQuickStatChange('fouls', 0, 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-medium text-slate-400">Fouls Committed</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickStatChange('fouls', 1, -1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono tabular-nums text-white font-bold w-6 text-center">
                      {match.stats.fouls[1]}
                    </span>
                    <button
                      onClick={() => handleQuickStatChange('fouls', 1, 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CLOCK & STATUS */}
          {activeTab === 'clock' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Match Status:</span>
                  <div className="flex items-center gap-1.5">
                    {(['UPCOMING', 'LIVE', 'FINISHED'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => onUpdateStatus(st)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                          match.status === st
                            ? st === 'LIVE'
                              ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                              : 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-300">Quick Minute Adjust:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateMinute(Math.max(1, match.currentMinute - 5))}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                    >
                      -5'
                    </button>
                    <button
                      onClick={() => onUpdateMinute(Math.max(1, match.currentMinute - 1))}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                    >
                      -1'
                    </button>
                    <span className="px-3 py-1 bg-slate-900 border border-slate-700 rounded text-emerald-400 font-mono font-bold text-sm">
                      {match.currentMinute}'
                    </span>
                    <button
                      onClick={() => onUpdateMinute(Math.min(120, match.currentMinute + 1))}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                    >
                      +1'
                    </button>
                    <button
                      onClick={() => onUpdateMinute(Math.min(120, match.currentMinute + 5))}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                    >
                      +5'
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-300">Set Official Score Directly:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={match.homeScore}
                      onChange={(e) => onUpdateScore(Number(e.target.value), match.awayScore)}
                      className="w-14 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center font-mono text-white text-sm"
                    />
                    <span className="text-slate-500 font-bold">-</span>
                    <input
                      type="number"
                      min={0}
                      value={match.awayScore}
                      onChange={(e) => onUpdateScore(match.homeScore, Number(e.target.value))}
                      className="w-14 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center font-mono text-white text-sm"
                    />
                  </div>
                </div>

                {/* Official Match MVP Selector when status is FINISHED */}
                {match.status === 'FINISHED' && onUpdateMvp && (
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Award Match MVP (Player of the Match):</span>
                      </span>
                      {match.mvpPlayerId && (
                        <button
                          type="button"
                          onClick={() => onUpdateMvp(undefined)}
                          className="text-[11px] text-slate-400 hover:text-rose-400 px-2 py-0.5 rounded bg-slate-800"
                        >
                          Clear MVP
                        </button>
                      )}
                    </div>
                    <select
                      value={match.mvpPlayerId || ''}
                      onChange={(e) => onUpdateMvp(e.target.value || undefined)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400"
                    >
                      <option value="">-- Choose Match MVP --</option>
                      <optgroup label={`${homeTeam.name} (Home) Players`}>
                        {homePlayers.map((p) => (
                          <option key={p.id} value={p.id}>
                            #{p.number} {p.name} ({p.position}) {p.goals > 0 ? `⚽ x${p.goals}` : ''}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label={`${awayTeam.name} (Away) Players`}>
                        {awayPlayers.map((p) => (
                          <option key={p.id} value={p.id}>
                            #{p.number} {p.name} ({p.position}) {p.goals > 0 ? `⚽ x${p.goals}` : ''}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Team,
  Player,
  Match,
  PlayerPosition,
  PlayerStatus,
  InjuryStatus,
  MatchStatus,
} from '../types/league';
import { ClubCrest } from './ClubCrest';
import { InjuryBadge } from './InjuryBadge';
import {
  Users,
  Calendar,
  Shield,
  Plus,
  Edit2,
  Trash2,
  ArrowRightLeft,
  CheckCircle,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  AlertTriangle,
  HeartPulse,
  Award,
  Star,
} from 'lucide-react';

interface AdminDashboardProps {
  teams: Team[];
  players: Player[];
  matches: Match[];
  onAddPlayer: (player: Player) => void;
  onUpdatePlayer: (player: Player) => void;
  onDeletePlayer: (playerId: string) => void;
  onUpdateMatch: (match: Match) => void;
  onAddMatch: (match: Match) => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (dataJson: string) => void;
  onOpenMatchCenter: (matchId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  teams,
  players,
  matches,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
  onUpdateMatch,
  onAddMatch,
  onResetData,
  onExportData,
  onImportData,
  onOpenMatchCenter,
}) => {
  const [adminTab, setAdminTab] = useState<'rosters' | 'matches' | 'governance'>('rosters');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [isAddingPlayer, setIsAddingPlayer] = useState<boolean>(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [isAddingMatch, setIsAddingMatch] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // New Player Form State
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState<number>(10);
  const [newPlayerPos, setNewPlayerPos] = useState<PlayerPosition>('FW');
  const [newPlayerNat, setNewPlayerNat] = useState('England');
  const [newPlayerAge, setNewPlayerAge] = useState<number>(24);
  const [newPlayerValue, setNewPlayerValue] = useState('€35M');
  const [newPlayerInjuryStatus, setNewPlayerInjuryStatus] = useState<InjuryStatus>('fit');
  const [newPlayerInjuryNote, setNewPlayerInjuryNote] = useState('');

  // Active Injury Edit Dialog
  const [injuryDialogPlayer, setInjuryDialogPlayer] = useState<Player | null>(null);

  // New Match Form State
  const [newMatchHome, setNewMatchHome] = useState(teams[0]?.id || '');
  const [newMatchAway, setNewMatchAway] = useState(teams[1]?.id || '');
  const [newMatchDate, setNewMatchDate] = useState('2026-10-18');
  const [newMatchTime, setNewMatchTime] = useState('15:00');
  const [newMatchWeek, setNewMatchWeek] = useState(27);
  const [newMatchVenue, setNewMatchVenue] = useState('Zenith Arena');

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const teamPlayers = players.filter((p) => p.teamId === selectedTeam.id);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    const newP: Player = {
      id: `ply-${Date.now()}`,
      teamId: selectedTeam.id,
      name: newPlayerName.trim(),
      number: newPlayerNumber,
      position: newPlayerPos,
      nationality: newPlayerNat,
      flag: '⚽',
      age: newPlayerAge,
      height: '183 cm',
      preferredFoot: 'Right',
      appearances: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      yellowCards: 0,
      redCards: 0,
      minutesPlayed: 0,
      marketValue: newPlayerValue,
      formRating: 7.0,
      status: newPlayerInjuryStatus !== 'fit' ? 'injured' : 'fit',
      injuryStatus: newPlayerInjuryStatus,
      injuryNote: newPlayerInjuryNote.trim() || undefined,
      injuryReturnDate: newPlayerInjuryStatus !== 'fit' ? '14 days' : undefined,
      avatarBg: 'bg-emerald-700',
    };

    onAddPlayer(newP);
    setNewPlayerName('');
    setNewPlayerInjuryNote('');
    setNewPlayerInjuryStatus('fit');
    setIsAddingPlayer(false);
    showFeedback(`Player "${newP.name}" added to ${selectedTeam.name} roster.`);
  };

  const handleToggleInjury = (player: Player) => {
    const isCurrentlyInjured = player.injuryStatus === 'injured' || player.injuryStatus === 'out' || player.status === 'injured';
    const nextInjuryStatus: InjuryStatus = isCurrentlyInjured ? 'fit' : 'injured';
    const nextPlayerStatus: PlayerStatus = isCurrentlyInjured ? 'fit' : 'injured';

    const updated: Player = {
      ...player,
      status: nextPlayerStatus,
      injuryStatus: nextInjuryStatus,
      injuryNote: isCurrentlyInjured ? undefined : (player.injuryNote || 'Muscle strain under medical assessment'),
      injuryReturnDate: isCurrentlyInjured ? undefined : (player.injuryReturnDate || '7-14 days'),
    };

    onUpdatePlayer(updated);
    showFeedback(
      `${player.name} is now marked as ${
        nextInjuryStatus === 'fit' ? 'Fit & Match Ready' : 'Injured (Warning badge displayed)'
      }`
    );
  };

  const handleSaveInjuryDialog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!injuryDialogPlayer) return;

    const form = e.target as HTMLFormElement;
    const statusSelect = form.elements.namedItem('diagInjuryStatus') as HTMLSelectElement;
    const noteInput = form.elements.namedItem('diagInjuryNote') as HTMLInputElement;
    const returnInput = form.elements.namedItem('diagInjuryReturn') as HTMLInputElement;

    const nextInjStatus = statusSelect.value as InjuryStatus;
    const isInj = nextInjStatus !== 'fit';

    const updated: Player = {
      ...injuryDialogPlayer,
      status: isInj ? 'injured' : 'fit',
      injuryStatus: nextInjStatus,
      injuryNote: isInj ? noteInput.value.trim() : undefined,
      injuryReturnDate: isInj ? returnInput.value.trim() : undefined,
    };

    onUpdatePlayer(updated);
    setInjuryDialogPlayer(null);
    showFeedback(`Updated medical report for ${updated.name}.`);
  };

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMatchHome === newMatchAway) {
      alert('Home and Away teams must be different.');
      return;
    }

    const home = teams.find((t) => t.id === newMatchHome);
    const newM: Match = {
      id: `match-${Date.now()}`,
      matchweek: newMatchWeek,
      season: '2025/26',
      date: newMatchDate,
      time: newMatchTime,
      homeTeamId: newMatchHome,
      awayTeamId: newMatchAway,
      homeScore: 0,
      awayScore: 0,
      status: 'UPCOMING',
      currentMinute: 0,
      venue: newMatchVenue || home?.stadium || 'Arena',
      referee: 'Anthony Taylor',
      attendance: 0,
      events: [],
      homeLineup: { formation: '4-3-3', starters: [], bench: [] },
      awayLineup: { formation: '4-3-3', starters: [], bench: [] },
      stats: {
        possession: [50, 50],
        shots: [0, 0],
        shotsOnTarget: [0, 0],
        xG: [0, 0],
        corners: [0, 0],
        fouls: [0, 0],
        yellowCards: [0, 0],
        redCards: [0, 0],
        offsides: [0, 0],
        passAccuracy: [0, 0],
        saves: [0, 0],
      },
    };

    onAddMatch(newM);
    setIsAddingMatch(false);
    showFeedback(`Match scheduled between ${home?.shortName} and ${teams.find(t=>t.id===newMatchAway)?.shortName}.`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-lg shadow-xl font-semibold text-xs">
          <CheckCircle className="w-4 h-4" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              League Administrator Console
            </h2>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Admin Access Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage player rosters, live fixtures, match statistics ingestion, and database state.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setAdminTab('rosters')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              adminTab === 'rosters'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Manage Rosters
          </button>
          <button
            onClick={() => setAdminTab('matches')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              adminTab === 'matches'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fixtures & Matches
          </button>
          <button
            onClick={() => setAdminTab('governance')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              adminTab === 'governance'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Backup & Reset
          </button>
        </div>
      </div>

      {/* TAB 1: ROSTERS */}
      {adminTab === 'rosters' && (
        <div className="space-y-6">
          {/* Club Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <ClubCrest team={selectedTeam} size="sm" />
              <div>
                <span className="text-xs text-slate-400">Selected Club Roster:</span>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="block mt-0.5 bg-slate-800 border border-slate-700 text-white font-bold text-sm rounded px-3 py-1 focus:outline-none focus:border-emerald-500"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({players.filter((p) => p.teamId === t.id).length} players)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setIsAddingPlayer(!isAddingPlayer)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingPlayer ? 'Close Form' : 'Register New Player'}</span>
            </button>
          </div>

          {/* New Player Form */}
          {isAddingPlayer && (
            <form onSubmit={handleCreatePlayer} className="bg-slate-900/80 p-5 rounded-xl border border-emerald-500/30 space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Register Player to {selectedTeam.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="e.g. Marcus Thorne"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Squad Number</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={newPlayerNumber}
                    onChange={(e) => setNewPlayerNumber(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Position</label>
                  <select
                    value={newPlayerPos}
                    onChange={(e) => setNewPlayerPos(e.target.value as PlayerPosition)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  >
                    <option value="GK">Goalkeeper (GK)</option>
                    <option value="DF">Defender (DF)</option>
                    <option value="MF">Midfielder (MF)</option>
                    <option value="FW">Forward (FW)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Nationality</label>
                  <input
                    type="text"
                    value={newPlayerNat}
                    onChange={(e) => setNewPlayerNat(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    min={16}
                    max={42}
                    value={newPlayerAge}
                    onChange={(e) => setNewPlayerAge(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Market Valuation</label>
                  <input
                    type="text"
                    value={newPlayerValue}
                    onChange={(e) => setNewPlayerValue(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Injury / Fitness Status</label>
                  <select
                    value={newPlayerInjuryStatus}
                    onChange={(e) => setNewPlayerInjuryStatus(e.target.value as InjuryStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  >
                    <option value="fit">Fit & Available</option>
                    <option value="injured">Injured (Out)</option>
                    <option value="doubtful">Doubtful (Late test)</option>
                    <option value="out">Ruled Out (Long term)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Injury Diagnosis / Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Hamstring strain, Ankle sprain"
                    value={newPlayerInjuryNote}
                    onChange={(e) => setNewPlayerInjuryNote(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPlayer(false)}
                  className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300"
                >
                  Save & Register
                </button>
              </div>
            </form>
          )}

          {/* Player Roster Table */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4 text-center">Goals</th>
                  <th className="py-3 px-4 text-center">Assists</th>
                  <th className="py-3 px-4">Injury Status & Quick Toggle</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {teamPlayers.map((player) => {
                  const isEditing = editingPlayerId === player.id;
                  const isInj = player.injuryStatus === 'injured' || player.injuryStatus === 'out' || player.status === 'injured';
                  const isDoubt = player.injuryStatus === 'doubtful';

                  return (
                    <tr key={player.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4 font-mono font-bold text-center text-slate-300">
                        {isEditing ? (
                          <input
                            type="number"
                            defaultValue={player.number}
                            id={`edit-num-${player.id}`}
                            className="w-12 bg-slate-800 border border-slate-700 rounded px-1 text-center font-mono text-white text-xs"
                          />
                        ) : (
                          player.number
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {isEditing ? (
                          <input
                            type="text"
                            defaultValue={player.name}
                            id={`edit-name-${player.id}`}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-white text-xs"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>{player.name}</span>
                            {(isInj || isDoubt) && (
                              <InjuryBadge
                                injuryStatus={player.injuryStatus || 'injured'}
                                size="xs"
                              />
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <select
                            defaultValue={player.position}
                            id={`edit-pos-${player.id}`}
                            className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-white text-xs"
                          >
                            <option value="GK">GK</option>
                            <option value="DF">DF</option>
                            <option value="MF">MF</option>
                            <option value="FW">FW</option>
                          </select>
                        ) : (
                          <span className="font-mono uppercase text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded text-[10px]">
                            {player.position}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            defaultValue={player.goals}
                            id={`edit-goals-${player.id}`}
                            className="w-12 bg-slate-800 border border-slate-700 rounded px-1 text-center text-xs"
                          />
                        ) : (
                          player.goals
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            defaultValue={player.assists}
                            id={`edit-assists-${player.id}`}
                            className="w-12 bg-slate-800 border border-slate-700 rounded px-1 text-center text-xs"
                          />
                        ) : (
                          player.assists
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <div className="space-y-1">
                            <select
                              defaultValue={player.injuryStatus || (player.status === 'injured' ? 'injured' : 'fit')}
                              id={`edit-inj-${player.id}`}
                              className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-white text-xs w-full"
                            >
                              <option value="fit">Fit & Available</option>
                              <option value="injured">Injured (Out)</option>
                              <option value="doubtful">Doubtful (Late test)</option>
                              <option value="out">Ruled Out (Long term)</option>
                            </select>
                            <input
                              type="text"
                              defaultValue={player.injuryNote || ''}
                              placeholder="Diagnosis note..."
                              id={`edit-inj-note-${player.id}`}
                              className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-white text-[11px] w-full"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              {/* Staff 1-click Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleInjury(player)}
                                title={`Staff Action: Click to mark as ${isInj ? 'Fit' : 'Injured'}`}
                                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isInj
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                                    : isDoubt
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                }`}
                              >
                                <HeartPulse className="w-3.5 h-3.5" />
                                <span>{isInj ? 'Injured' : isDoubt ? 'Doubtful' : 'Fit'}</span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  (Toggle)
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setInjuryDialogPlayer(player)}
                                title="Edit injury diagnosis & expected return"
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Warning Note */}
                            {(isInj || isDoubt) && (
                              <div className="flex items-center gap-1 text-[11px] text-amber-400/90 font-medium">
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="truncate max-w-[170px]" title={player.injuryNote || 'Medical report active'}>
                                  {player.injuryNote || 'Under medical assessment'}
                                  {player.injuryReturnDate && ` (${player.injuryReturnDate})`}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                const numEl = document.getElementById(`edit-num-${player.id}`) as HTMLInputElement;
                                const nameEl = document.getElementById(`edit-name-${player.id}`) as HTMLInputElement;
                                const posEl = document.getElementById(`edit-pos-${player.id}`) as HTMLSelectElement;
                                const goalsEl = document.getElementById(`edit-goals-${player.id}`) as HTMLInputElement;
                                const assistsEl = document.getElementById(`edit-assists-${player.id}`) as HTMLInputElement;
                                const injEl = document.getElementById(`edit-inj-${player.id}`) as HTMLSelectElement;
                                const injNoteEl = document.getElementById(`edit-inj-note-${player.id}`) as HTMLInputElement;

                                const nextInjStatus = injEl ? (injEl.value as InjuryStatus) : 'fit';
                                const nextInjNote = injNoteEl ? injNoteEl.value.trim() : undefined;

                                onUpdatePlayer({
                                  ...player,
                                  number: Number(numEl.value),
                                  name: nameEl.value,
                                  position: posEl.value as PlayerPosition,
                                  goals: Number(goalsEl.value),
                                  assists: Number(assistsEl.value),
                                  status: nextInjStatus !== 'fit' ? 'injured' : 'fit',
                                  injuryStatus: nextInjStatus,
                                  injuryNote: nextInjStatus !== 'fit' ? nextInjNote : undefined,
                                });
                                setEditingPlayerId(null);
                                showFeedback(`Player ${player.name} updated.`);
                              }}
                              className="px-2 py-1 bg-emerald-500 text-slate-950 font-bold rounded text-[11px]"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingPlayerId(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingPlayerId(player.id)}
                              className="p-1 text-slate-400 hover:text-white"
                              title="Edit Player"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove ${player.name} from roster?`)) {
                                  onDeletePlayer(player.id);
                                  showFeedback(`Player removed.`);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-400"
                              title="Delete Player"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FIXTURES & MATCHES */}
      {adminTab === 'matches' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">League Match Schedule</h3>
              <span className="text-xs text-slate-400">{matches.length} total fixtures registered</span>
            </div>
            <button
              onClick={() => setIsAddingMatch(!isAddingMatch)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingMatch ? 'Cancel' : 'Schedule Fixture'}</span>
            </button>
          </div>

          {/* New Match Form */}
          {isAddingMatch && (
            <form onSubmit={handleCreateMatch} className="bg-slate-900/80 p-5 rounded-xl border border-emerald-500/30 space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Schedule New Apex League Match
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Home Team</label>
                  <select
                    value={newMatchHome}
                    onChange={(e) => setNewMatchHome(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Away Team</label>
                  <select
                    value={newMatchAway}
                    onChange={(e) => setNewMatchAway(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Matchweek</label>
                  <input
                    type="number"
                    min={1}
                    max={38}
                    value={newMatchWeek}
                    onChange={(e) => setNewMatchWeek(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={newMatchDate}
                    onChange={(e) => setNewMatchDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingMatch(false)}
                  className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          )}

          {/* Matches List */}
          <div className="space-y-3">
            {matches.map((m) => {
              const home = teams.find((t) => t.id === m.homeTeamId);
              const away = teams.find((t) => t.id === m.awayTeamId);
              const mvpPlayer = m.mvpPlayerId ? players.find((p) => p.id === m.mvpPlayerId) : null;
              const isFinished = m.status === 'FINISHED';

              return (
                <div
                  key={m.id}
                  className="flex flex-col p-4 rounded-xl bg-slate-900/60 border border-slate-800 gap-3 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-mono bg-slate-950 px-2 py-1 rounded text-slate-300">
                        MW {m.matchweek}
                      </span>
                      <span className="text-slate-400">{m.date}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-400">{m.venue}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold">
                      <span className="text-white">{home?.name}</span>
                      <span className="font-mono bg-slate-950 px-3 py-1 rounded border border-slate-800 text-sm">
                        {m.status === 'UPCOMING' ? m.time : `${m.homeScore} - ${m.awayScore}`}
                      </span>
                      <span className="text-white">{away?.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Match Status Selector */}
                      <select
                        value={m.status}
                        onChange={(e) => {
                          const nextSt = e.target.value as MatchStatus;
                          onUpdateMatch({
                            ...m,
                            status: nextSt,
                            currentMinute: nextSt === 'FINISHED' ? 90 : m.currentMinute,
                          });
                          showFeedback(`Match status updated to ${nextSt}.`);
                        }}
                        className="bg-slate-800 border border-slate-700 text-xs font-semibold rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="UPCOMING">Upcoming</option>
                        <option value="LIVE">Live</option>
                        <option value="FINISHED">Completed (FT)</option>
                      </select>

                      <button
                        onClick={() => onOpenMatchCenter(m.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5"
                      >
                        <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Match Center</span>
                      </button>
                    </div>
                  </div>

                  {/* MVP Selection for Completed Matches */}
                  {isFinished && (
                    <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 font-bold text-amber-400">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span>Official Match MVP:</span>
                        </span>
                        {mvpPlayer ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs shadow-sm">
                            <span className="text-amber-400">★</span>
                            <span>{mvpPlayer.name} (#{mvpPlayer.number})</span>
                            <span className="text-slate-400 font-normal text-[11px]">
                              · {mvpPlayer.teamId === home?.id ? home?.shortName : away?.shortName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">
                            No MVP designated yet
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={m.mvpPlayerId || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            onUpdateMatch({
                              ...m,
                              mvpPlayerId: val || undefined,
                            });
                            const picked = players.find((p) => p.id === val);
                            showFeedback(
                              picked
                                ? `★ Awarded Match MVP to ${picked.name} for Matchweek ${m.matchweek}.`
                                : `Cleared Match MVP for Matchweek ${m.matchweek}.`
                            );
                          }}
                          className="bg-slate-800 border border-slate-700 text-amber-300 font-semibold rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                        >
                          <option value="">-- Designate Match MVP --</option>
                          <optgroup label={`${home?.name || 'Home'} Players`}>
                            {players
                              .filter((p) => p.teamId === m.homeTeamId)
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  #{p.number} {p.name} ({p.position}) {p.goals > 0 ? `⚽ x${p.goals}` : ''}
                                </option>
                              ))}
                          </optgroup>
                          <optgroup label={`${away?.name || 'Away'} Players`}>
                            {players
                              .filter((p) => p.teamId === m.awayTeamId)
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  #{p.number} {p.name} ({p.position}) {p.goals > 0 ? `⚽ x${p.goals}` : ''}
                                </option>
                              ))}
                          </optgroup>
                        </select>

                        {m.mvpPlayerId && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateMatch({
                                ...m,
                                mvpPlayerId: undefined,
                              });
                              showFeedback(`Cleared MVP for Matchweek ${m.matchweek}.`);
                            }}
                            className="px-2.5 py-1 text-slate-400 hover:text-rose-400 rounded bg-slate-800 hover:bg-slate-750 text-xs transition-colors"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: GOVERNANCE & BACKUP */}
      {adminTab === 'governance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Database Backup & Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export the entire league snapshot (teams, 120+ players, real-time match events, stats, standings) to a single JSON archive.
            </p>
            <button
              onClick={onExportData}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download League Snapshot (.json)</span>
            </button>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-rose-400">System Reset</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reset all clubs, players, fixtures, and scores back to the factory realistic championship defaults.
            </p>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all data to default? This will clear custom changes.')) {
                  onResetData();
                  showFeedback('Database reset to defaults.');
                }
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Reset Factory League Data</span>
            </button>
          </div>
        </div>
      )}

      {/* MEDICAL & INJURY DIAGNOSIS MODAL */}
      {injuryDialogPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white">
                  Medical Report: {injuryDialogPlayer.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInjuryDialogPlayer(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInjuryDialog} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Availability / Injury Status
                </label>
                <select
                  name="diagInjuryStatus"
                  defaultValue={injuryDialogPlayer.injuryStatus || 'injured'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="fit">Fit & Match Available (Clear Injury)</option>
                  <option value="injured">Injured (Out)</option>
                  <option value="doubtful">Doubtful (Late Fitness Test)</option>
                  <option value="out">Ruled Out (Long-term / Surgery)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Injury Diagnosis Note
                </label>
                <input
                  type="text"
                  name="diagInjuryNote"
                  defaultValue={injuryDialogPlayer.injuryNote || 'Muscle strain under evaluation'}
                  placeholder="e.g. Hamstring strain, Ankle sprain"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Expected Return Timeline
                </label>
                <input
                  type="text"
                  name="diagInjuryReturn"
                  defaultValue={injuryDialogPlayer.injuryReturnDate || '14 days'}
                  placeholder="e.g. 7-10 days, 2 weeks, Matchweek 27"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setInjuryDialogPlayer(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300"
                >
                  Save Medical Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

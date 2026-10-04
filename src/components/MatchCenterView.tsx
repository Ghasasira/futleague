import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Match,
  Team,
  Player,
  MatchEvent,
} from '../types/league';
import { ClubCrest } from './ClubCrest';
import { TacticalPitch } from './TacticalPitch';
import { LiveMatchIngestionModal } from './LiveMatchIngestionModal';
import {
  Clock,
  Play,
  Pause,
  Sliders,
  Shield,
  MapPin,
  User,
  Users,
  Flame,
  Volume2,
  Bell,
  Mail,
  CheckCircle2,
  Calendar,
  Award,
  Star,
  ChevronRight,
} from 'lucide-react';

interface MatchCenterViewProps {
  match: Match;
  teams: Team[];
  players: Player[];
  isAdmin: boolean;
  onUpdateMatch: (updated: Match) => void;
  onSelectTeam?: (teamId: string) => void;
  onSelectPlayer?: (player: Player) => void;
  onTriggerNotification?: (title: string, message: string, type: any) => void;
  onDispatchEmail?: (subject: string, preview: string, bodyHtml: string) => void;
}

export const MatchCenterView: React.FC<MatchCenterViewProps> = ({
  match,
  teams,
  players,
  isAdmin,
  onUpdateMatch,
  onSelectTeam,
  onSelectPlayer,
  onTriggerNotification,
  onDispatchEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'tactics' | 'stats' | 'lineups' | 'info'>('timeline');
  const [isIngestionOpen, setIsIngestionOpen] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const homeTeam = teams.find((t) => t.id === match.homeTeamId) || teams[0];
  const awayTeam = teams.find((t) => t.id === match.awayTeamId) || teams[1];

  const homePlayers = players.filter((p) => p.teamId === homeTeam.id);
  const awayPlayers = players.filter((p) => p.teamId === awayTeam.id);

  // Auto-simulation effect
  React.useEffect(() => {
    if (!isSimulating || match.status !== 'LIVE') return;

    const interval = setInterval(() => {
      onUpdateMatch({
        ...match,
        currentMinute: match.currentMinute >= 95 ? 90 : match.currentMinute + 1,
        status: match.currentMinute >= 95 ? 'FINISHED' : 'LIVE',
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulating, match, onUpdateMatch]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddEvent = (newEventData: Omit<MatchEvent, 'id'>) => {
    const newEvent: MatchEvent = {
      ...newEventData,
      id: `evt-${Date.now()}`,
    };

    const updatedEvents = [newEvent, ...match.events];
    let newHomeScore = match.homeScore;
    let newAwayScore = match.awayScore;

    if (newEvent.type === 'GOAL' || newEvent.type === 'PENALTY_GOAL') {
      if (newEvent.teamId === homeTeam.id) {
        newHomeScore += 1;
      } else {
        newAwayScore += 1;
      }
      triggerToast(`⚽ GOAL! ${newEvent.playerName} scores for ${newEvent.teamId === homeTeam.id ? homeTeam.name : awayTeam.name}!`);

      if (onTriggerNotification) {
        onTriggerNotification(
          `GOAL! ${homeTeam.code} ${newHomeScore} - ${newAwayScore} ${awayTeam.code}`,
          `${newEvent.playerName} scores at ${newEvent.minute}' for ${newEvent.teamId === homeTeam.id ? homeTeam.name : awayTeam.name}.`,
          'GOAL'
        );
      }

      if (onDispatchEmail) {
        onDispatchEmail(
          `⚡ GOAL ALERT: ${newEvent.playerName} scores in ${newEvent.minute}'!`,
          `${homeTeam.name} ${newHomeScore} - ${newAwayScore} ${awayTeam.name}`,
          `<div style="font-family:sans-serif;background:#090d16;color:#f8fafc;padding:24px;border-radius:8px;">
            <h2 style="color:#10b981;">APEX LEAGUE REAL-TIME GOAL ALERT</h2>
            <p style="font-size:20px;font-weight:bold;">${homeTeam.name} ${newHomeScore} - ${newAwayScore} ${awayTeam.name}</p>
            <p style="color:#94a3b8;">${newEvent.minute}' ${newEvent.playerName} ${newEvent.secondaryPlayerName ? `(Assist: ${newEvent.secondaryPlayerName})` : ''}</p>
            <p>${newEvent.detail || 'Clinical strike finding the back of the net.'}</p>
          </div>`
        );
      }
    } else if (newEvent.type === 'YELLOW_CARD' || newEvent.type === 'RED_CARD') {
      triggerToast(`${newEvent.type === 'RED_CARD' ? '🟥 RED CARD' : '🟨 YELLOW CARD'} for ${newEvent.playerName}`);
      if (onTriggerNotification) {
        onTriggerNotification(
          `${newEvent.type === 'RED_CARD' ? 'RED CARD' : 'YELLOW CARD'}: ${newEvent.playerName}`,
          `${newEvent.playerName} received a card at ${newEvent.minute}'. (${newEvent.detail || 'Foul'})`,
          'CARD'
        );
      }
    } else if (newEvent.type === 'SUB') {
      triggerToast(`🔄 SUB: ${newEvent.playerName} on for ${newEvent.secondaryPlayerName}`);
    }

    onUpdateMatch({
      ...match,
      events: updatedEvents,
      homeScore: newHomeScore,
      awayScore: newAwayScore,
    });
  };

  const handleUpdateScore = (hScore: number, aScore: number) => {
    onUpdateMatch({
      ...match,
      homeScore: hScore,
      awayScore: aScore,
    });
  };

  const handleUpdateMinute = (min: number) => {
    onUpdateMatch({
      ...match,
      currentMinute: min,
    });
  };

  const handleUpdateStatus = (st: 'UPCOMING' | 'LIVE' | 'FINISHED') => {
    onUpdateMatch({
      ...match,
      status: st,
    });
    triggerToast(`Match status updated to ${st}`);
  };

  const handleUpdateMvp = (mvpId?: string) => {
    onUpdateMatch({
      ...match,
      mvpPlayerId: mvpId,
    });
    const p = players.find((ply) => ply.id === mvpId);
    triggerToast(p ? `★ Awarded Match MVP to ${p.name}` : 'Match MVP cleared');
  };

  const handleUpdateStats = (newStats: Match['stats']) => {
    onUpdateMatch({
      ...match,
      stats: newStats,
    });
  };

  // Group events chronologically
  const sortedEvents = [...match.events].sort((a, b) => b.minute - a.minute);

  // Calculate player goal tallies from match events
  const goalEvents = match.events.filter(
    (e) => e.type === 'GOAL' || e.type === 'PENALTY_GOAL'
  );

  const homeGoalScorers: {
    playerId: string;
    playerName: string;
    goals: number;
    minutes: number[];
    isPen: boolean;
  }[] = [];

  const awayGoalScorers: {
    playerId: string;
    playerName: string;
    goals: number;
    minutes: number[];
    isPen: boolean;
  }[] = [];

  goalEvents.forEach((evt) => {
    const isHome = evt.teamId === homeTeam.id;
    const list = isHome ? homeGoalScorers : awayGoalScorers;
    const existing = list.find((s) => s.playerName === evt.playerName);
    if (existing) {
      existing.goals += 1;
      existing.minutes.push(evt.minute);
      if (evt.type === 'PENALTY_GOAL') existing.isPen = true;
    } else {
      list.push({
        playerId: evt.playerId,
        playerName: evt.playerName,
        goals: 1,
        minutes: [evt.minute],
        isPen: evt.type === 'PENALTY_GOAL',
      });
    }
  });

  const getPlayerMatchGoals = (playerName: string, playerId: string) => {
    return goalEvents.filter(
      (g) => g.playerName === playerName || g.playerId === playerId
    ).length;
  };

  const mvpPlayer = match.mvpPlayerId ? players.find((p) => p.id === match.mvpPlayerId) : null;
  const mvpTeam = teams.find((t) => t.id === mvpPlayer?.teamId);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-lg shadow-xl font-semibold text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MATCH HERO SCOREBOARD CARD */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 md:p-8 shadow-2xl">
        {/* Subtle background glow */}
        <div
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ backgroundColor: homeTeam.crestColor }}
        />
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ backgroundColor: awayTeam.crestColor }}
        />

        {/* Top Match Bar Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Apex League</span>
            <span aria-hidden="true">·</span>
            <span>Matchweek {match.matchweek}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{match.date}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Status Indicator & MVP Badge */}
            {match.status === 'LIVE' ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-400 font-bold text-xs tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>LIVE {match.currentMinute}'</span>
              </div>
            ) : match.status === 'FINISHED' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-3 py-1 rounded-full">
                  FULL TIME (FT)
                </span>
                {mvpPlayer && (
                  <button
                    onClick={() => onSelectPlayer && onSelectPlayer(mvpPlayer)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/40 text-amber-300 font-bold text-xs shadow-md hover:bg-amber-500/30 transition-all cursor-pointer"
                    title={`Official Match MVP: ${mvpPlayer.name} (${mvpTeam?.shortName}) - Click to view player profile`}
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>MVP: {mvpPlayer.name}</span>
                    <span className="text-[10px] text-amber-400/70 font-mono">#{mvpPlayer.number}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                <Clock className="w-3.5 h-3.5" />
                <span>Kickoff {match.time}</span>
              </div>
            )}

            {/* Official Scorer Action (Always accessible or for Admin) */}
            <button
              onClick={() => setIsIngestionOpen(true)}
              className="px-3 py-1 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Match Ingestion Console</span>
            </button>

            {/* Auto Sim Button */}
            {match.status === 'LIVE' && (
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                  isSimulating
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isSimulating ? 'Pause Sim' : 'Live Clock Sim'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Big Teams & Scoreboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 py-6 md:py-8">
          {/* Home Team */}
          <div
            onClick={() => onSelectTeam && onSelectTeam(homeTeam.id)}
            className="flex md:flex-row flex-col items-center justify-center md:justify-end gap-4 cursor-pointer group text-center md:text-right"
          >
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-sky-400 transition-colors">
                {homeTeam.name}
              </h2>
              <span className="text-xs text-slate-400">Home · {homeTeam.manager}</span>
            </div>
            <ClubCrest team={homeTeam} size="lg" />
          </div>

          {/* Central Scoreboard Badge with framer-motion score transitions */}
          <div className="flex flex-col items-center justify-center text-center">
            <motion.div
              key={`score-container-${match.homeScore}-${match.awayScore}`}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.07, 1] }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex items-center gap-4 bg-slate-950/90 border border-slate-800 px-6 py-3 rounded-2xl shadow-inner relative overflow-hidden"
            >
              {/* Animated Home Score */}
              <div className="relative overflow-hidden w-12 text-center h-12 flex items-center justify-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={`home-score-${match.homeScore}`}
                    initial={{ y: -30, opacity: 0, scale: 0.6 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 30, opacity: 0, scale: 0.6 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    className="block text-4xl md:text-5xl font-black font-mono text-white tabular-nums"
                  >
                    {match.homeScore}
                  </motion.span>
                </AnimatePresence>
              </div>

              <span className="text-2xl font-black text-slate-600 select-none">:</span>

              {/* Animated Away Score */}
              <div className="relative overflow-hidden w-12 text-center h-12 flex items-center justify-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={`away-score-${match.awayScore}`}
                    initial={{ y: -30, opacity: 0, scale: 0.6 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 30, opacity: 0, scale: 0.6 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    className="block text-4xl md:text-5xl font-black font-mono text-white tabular-nums"
                  >
                    {match.awayScore}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>

            <div className="mt-2 text-xs font-mono text-slate-400">
              {match.status === 'LIVE' ? (
                <span className="text-emerald-400 font-bold tracking-wide">
                  Match In Progress · {match.currentMinute}'
                </span>
              ) : match.status === 'FINISHED' ? (
                <span>Finished · 90 Mins</span>
              ) : (
                <span>Scheduled</span>
              )}
            </div>
          </div>

          {/* Away Team */}
          <div
            onClick={() => onSelectTeam && onSelectTeam(awayTeam.id)}
            className="flex md:flex-row-reverse flex-col items-center justify-center md:justify-end gap-4 cursor-pointer group text-center md:text-left"
          >
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-red-400 transition-colors">
                {awayTeam.name}
              </h2>
              <span className="text-xs text-slate-400">Away · {awayTeam.manager}</span>
            </div>
            <ClubCrest team={awayTeam} size="lg" />
          </div>
        </div>

        {/* Live Goal Scorers & Player Goal Tallies Ribbon */}
        {(homeGoalScorers.length > 0 || awayGoalScorers.length > 0) && (
          <div className="mb-4 pt-3 pb-3 px-4 rounded-xl bg-slate-950/50 border border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Home Goal Scorers & Tallies */}
            <div className="flex flex-col md:items-end items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">
                {homeTeam.shortName} Scorers & Tallies
              </span>
              <div className="flex flex-col md:items-end items-center gap-1.5 w-full">
                <AnimatePresence initial={false}>
                  {homeGoalScorers.length === 0 ? (
                    <span className="text-slate-600 italic text-[11px]">-</span>
                  ) : (
                    homeGoalScorers.map((scorer) => (
                      <motion.div
                        key={`home-scorer-${scorer.playerName}`}
                        layout
                        initial={{ opacity: 0, x: -16, scale: 0.85 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                        className="flex items-center gap-2 flex-wrap"
                      >
                        <span
                          onClick={() => {
                            const p = players.find(
                              (ply) => ply.name === scorer.playerName || ply.id === scorer.playerId
                            );
                            if (p && onSelectPlayer) onSelectPlayer(p);
                          }}
                          className="font-bold text-white hover:text-emerald-400 cursor-pointer transition-colors"
                        >
                          {scorer.playerName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {scorer.minutes.map((m) => `${m}'`).join(', ')}
                        </span>
                        {/* Animated Player Goal Tally Badge */}
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={`home-tally-${scorer.playerName}-${scorer.goals}`}
                            initial={{ scale: 1.6, backgroundColor: '#10b981', color: '#090d16' }}
                            animate={{
                              scale: 1,
                              backgroundColor: 'rgba(16, 185, 129, 0.2)',
                              color: '#6ee7b7',
                            }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono font-bold text-[11px] border border-emerald-500/40 shadow-sm"
                          >
                            <span>⚽</span>
                            <span>{scorer.goals > 1 ? `x${scorer.goals} Goals` : '1 Goal'}</span>
                          </motion.span>
                        </AnimatePresence>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Away Goal Scorers & Tallies */}
            <div className="flex flex-col md:items-start items-center gap-1.5 md:border-l md:border-slate-800/80 md:pl-4">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">
                {awayTeam.shortName} Scorers & Tallies
              </span>
              <div className="flex flex-col md:items-start items-center gap-1.5 w-full">
                <AnimatePresence initial={false}>
                  {awayGoalScorers.length === 0 ? (
                    <span className="text-slate-600 italic text-[11px]">-</span>
                  ) : (
                    awayGoalScorers.map((scorer) => (
                      <motion.div
                        key={`away-scorer-${scorer.playerName}`}
                        layout
                        initial={{ opacity: 0, x: 16, scale: 0.85 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                        className="flex items-center gap-2 flex-wrap"
                      >
                        {/* Animated Player Goal Tally Badge */}
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={`away-tally-${scorer.playerName}-${scorer.goals}`}
                            initial={{ scale: 1.6, backgroundColor: '#f43f5e', color: '#ffffff' }}
                            animate={{
                              scale: 1,
                              backgroundColor: 'rgba(244, 63, 94, 0.2)',
                              color: '#fda4af',
                            }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono font-bold text-[11px] border border-rose-500/40 shadow-sm"
                          >
                            <span>⚽</span>
                            <span>{scorer.goals > 1 ? `x${scorer.goals} Goals` : '1 Goal'}</span>
                          </motion.span>
                        </AnimatePresence>
                        <span
                          onClick={() => {
                            const p = players.find(
                              (ply) => ply.name === scorer.playerName || ply.id === scorer.playerId
                            );
                            if (p && onSelectPlayer) onSelectPlayer(p);
                          }}
                          className="font-bold text-white hover:text-rose-400 cursor-pointer transition-colors"
                        >
                          {scorer.playerName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {scorer.minutes.map((m) => `${m}'`).join(', ')}
                        </span>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* OFFICIAL MATCH MVP SHOWCASE CARD */}
        {mvpPlayer && (
          <div className="mb-4 pt-3 pb-1 border-t border-slate-800/80">
            <div
              onClick={() => onSelectPlayer && onSelectPlayer(mvpPlayer)}
              className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-amber-950/30 border border-amber-500/40 hover:border-amber-400 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer group transition-all shadow-xl"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-lg text-white shadow-lg border-2"
                    style={{
                      backgroundColor: mvpTeam?.crestColor || '#d97706',
                      borderColor: mvpTeam?.secondaryColor || '#ffffff',
                    }}
                  >
                    {mvpPlayer.number}
                  </div>
                  <span className="absolute -top-2 -right-1 text-sm select-none">👑</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-sm">
                      <Award className="w-3 h-3 text-slate-950" />
                      Official Match MVP
                    </span>
                    <span className="text-xs text-amber-300 font-mono font-semibold">
                      Player of the Match
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base">{mvpPlayer.flag}</span>
                    <h4 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
                      {mvpPlayer.name}
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">({mvpPlayer.position})</span>
                    {mvpTeam && (
                      <span className="text-xs text-slate-300 font-semibold">
                        · {mvpTeam.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Form Index</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    ★ {mvpPlayer.formRating.toFixed(1)}
                  </span>
                </div>
                <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Valuation</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {mvpPlayer.marketValue}
                  </span>
                </div>
                <span className="text-amber-400 text-xs font-semibold group-hover:underline flex items-center gap-1 pl-1">
                  <span>Player Bio & Stats</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Match Details Ribbon (Venue, Referee, Attendance) */}
        <div className="flex flex-wrap items-center justify-around gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{match.venue}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>Ref: {match.referee}</span>
          </div>
          {match.attendance > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-mono tabular-nums">{match.attendance.toLocaleString()} Attendance</span>
            </div>
          )}
          {match.weather && (
            <div className="flex items-center gap-1.5">
              <span>🌤️ {match.weather}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs for Match Center */}
      <div className="flex items-center gap-1 border-b border-slate-800 text-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Timeline & Events ({sortedEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('tactics')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'tactics'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Tactical Lineups Board
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'stats'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Match Statistics
        </button>
        <button
          onClick={() => setActiveTab('lineups')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'lineups'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Squad Rosters
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'info'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Head to Head & Info
        </button>
      </div>

      {/* TAB CONTENT 1: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Events Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Live Match Events Log
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {sortedEvents.length} events logged
              </span>
            </div>

            {sortedEvents.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800 text-slate-500 text-sm">
                No match events recorded yet. Kickoff approaching or use the Ingestion Console above.
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {sortedEvents.map((evt) => {
                    const isHome = evt.teamId === homeTeam.id;
                    const team = isHome ? homeTeam : awayTeam;
                    const isGoal = evt.type === 'GOAL' || evt.type === 'PENALTY_GOAL';

                    return (
                      <motion.div
                        key={evt.id}
                        layout
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                          isGoal
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : evt.type === 'RED_CARD'
                            ? 'bg-rose-950/20 border-rose-500/30'
                            : 'bg-slate-900/60 border-slate-800'
                        }`}
                      >
                        {/* Minute badge */}
                        <div className="px-2.5 py-1 rounded bg-slate-950 font-mono font-bold text-xs text-emerald-400 border border-slate-800 shrink-0">
                          {evt.minute}'
                        </div>

                        {/* Icon */}
                        <div className="text-base shrink-0">
                          {isGoal && (
                            <motion.span
                              initial={{ scale: 1.6, rotate: -20 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 450, damping: 14 }}
                              className="inline-block"
                            >
                              ⚽{evt.type === 'PENALTY_GOAL' ? '🎯' : ''}
                            </motion.span>
                          )}
                          {evt.type === 'YELLOW_CARD' && '🟨'}
                          {evt.type === 'RED_CARD' && '🟥'}
                          {evt.type === 'SUB' && '🔄'}
                          {evt.type === 'VAR_DECISION' && '📺'}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold" style={{ color: team.crestColor }}>
                              {team.shortName}
                            </span>
                            <span className="text-sm font-bold text-white">
                              {evt.playerName}
                            </span>
                            {evt.secondaryPlayerName && (
                              <span className="text-xs text-slate-400">
                                (Assist: {evt.secondaryPlayerName})
                              </span>
                            )}
                          </div>
                          {evt.detail && (
                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                              {evt.detail}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Quick Key Match Stats Sidebar */}
          <div className="space-y-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Live Possession & Pressure
              </h3>

              {/* Possession Bar */}
              <div>
                <div className="flex justify-between text-xs font-mono font-bold mb-1">
                  <span style={{ color: homeTeam.crestColor }}>
                    {match.stats.possession[0]}%
                  </span>
                  <span className="text-slate-400 font-sans font-normal text-[11px]">
                    Ball Possession
                  </span>
                  <span style={{ color: awayTeam.crestColor }}>
                    {match.stats.possession[1]}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    style={{
                      width: `${match.stats.possession[0]}%`,
                      backgroundColor: homeTeam.crestColor,
                    }}
                    className="h-full transition-all duration-300"
                  />
                  <div
                    style={{
                      width: `${match.stats.possession[1]}%`,
                      backgroundColor: awayTeam.crestColor,
                    }}
                    className="h-full transition-all duration-300"
                  />
                </div>
              </div>

              {/* xG Comparison */}
              <div>
                <div className="flex justify-between text-xs font-mono font-bold mb-1">
                  <span className="text-white">{match.stats.xG[0].toFixed(2)}</span>
                  <span className="text-slate-400 font-sans font-normal text-[11px]">
                    Expected Goals (xG)
                  </span>
                  <span className="text-white">{match.stats.xG[1].toFixed(2)}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    style={{
                      width: `${(match.stats.xG[0] / (match.stats.xG[0] + match.stats.xG[1] || 1)) * 100}%`,
                    }}
                    className="h-full bg-emerald-500"
                  />
                  <div
                    style={{
                      width: `${(match.stats.xG[1] / (match.stats.xG[0] + match.stats.xG[1] || 1)) * 100}%`,
                    }}
                    className="h-full bg-rose-500"
                  />
                </div>
              </div>

              {/* Quick shots snapshot */}
              <div className="grid grid-cols-3 text-center text-xs py-2 border-t border-slate-800">
                <span className="font-mono font-bold text-white text-base">
                  {match.stats.shotsOnTarget[0]} / {match.stats.shots[0]}
                </span>
                <span className="text-[11px] text-slate-400 self-center">
                  On Target / Total
                </span>
                <span className="font-mono font-bold text-white text-base">
                  {match.stats.shotsOnTarget[1]} / {match.stats.shots[1]}
                </span>
              </div>
            </div>

            {/* Ingestion & Subscriber Alert CTA */}
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>Live Event Notifications</span>
              </div>
              <p className="text-xs text-slate-400">
                Subscribers receive real-time goal alerts and match summaries immediately upon official recording.
              </p>
              <button
                onClick={() => setIsIngestionOpen(true)}
                className="w-full py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                Add Live Match Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: TACTICAL PITCH BOARD */}
      {activeTab === 'tactics' && (
        <div className="space-y-6">
          <TacticalPitch
            match={match}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            allPlayers={players}
            onSelectPlayer={onSelectPlayer}
          />
        </div>
      )}

      {/* TAB CONTENT 3: STATS COMPARISON */}
      {activeTab === 'stats' && (
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
            <span className="font-bold text-slate-200 uppercase">{homeTeam.shortName}</span>
            <span className="font-semibold uppercase tracking-wider">Official Match Statistics</span>
            <span className="font-bold text-slate-200 uppercase">{awayTeam.shortName}</span>
          </div>

          {[
            { label: 'Ball Possession (%)', home: match.stats.possession[0], away: match.stats.possession[1], isPercent: true },
            { label: 'Expected Goals (xG)', home: match.stats.xG[0].toFixed(2), away: match.stats.xG[1].toFixed(2), numHome: match.stats.xG[0], numAway: match.stats.xG[1] },
            { label: 'Total Shots', home: match.stats.shots[0], away: match.stats.shots[1] },
            { label: 'Shots on Target', home: match.stats.shotsOnTarget[0], away: match.stats.shotsOnTarget[1] },
            { label: 'Pass Accuracy (%)', home: match.stats.passAccuracy[0], away: match.stats.passAccuracy[1], isPercent: true },
            { label: 'Corner Kicks', home: match.stats.corners[0], away: match.stats.corners[1] },
            { label: 'Fouls Committed', home: match.stats.fouls[0], away: match.stats.fouls[1] },
            { label: 'Goalkeeper Saves', home: match.stats.saves[0], away: match.stats.saves[1] },
            { label: 'Offsides', home: match.stats.offsides[0], away: match.stats.offsides[1] },
            { label: 'Yellow Cards', home: match.stats.yellowCards[0], away: match.stats.yellowCards[1] },
            { label: 'Red Cards', home: match.stats.redCards[0], away: match.stats.redCards[1] },
          ].map((stat, idx) => {
            const hVal = typeof stat.home === 'number' ? stat.home : Number(stat.home);
            const aVal = typeof stat.away === 'number' ? stat.away : Number(stat.away);
            const total = hVal + aVal || 1;
            const hPct = (hVal / total) * 100;
            const aPct = (aVal / total) * 100;

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-white text-sm tabular-nums w-12 text-left">
                    {stat.home}
                  </span>
                  <span className="text-slate-400 font-medium">{stat.label}</span>
                  <span className="font-mono font-bold text-white text-sm tabular-nums w-12 text-right">
                    {stat.away}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden flex">
                  <div
                    style={{
                      width: `${hPct}%`,
                      backgroundColor: homeTeam.crestColor,
                    }}
                    className="h-full transition-all duration-300"
                  />
                  <div
                    style={{
                      width: `${aPct}%`,
                      backgroundColor: awayTeam.crestColor,
                    }}
                    className="h-full transition-all duration-300"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB CONTENT 4: LINEUPS & SQUADS */}
      {activeTab === 'lineups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Home Squad */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ClubCrest team={homeTeam} size="sm" />
                <span className="font-bold text-white text-sm">{homeTeam.name}</span>
              </div>
              <span className="text-xs font-mono text-slate-400">{match.homeLineup.formation}</span>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Starting XI
              </h4>
              <div className="space-y-2">
                {match.homeLineup.starters.map((starter) => {
                  const goalsCount = getPlayerMatchGoals(starter.name, starter.playerId);
                  return (
                    <div
                      key={starter.playerId}
                      onClick={() => {
                        const fullP = players.find((p) => p.id === starter.playerId);
                        if (fullP && onSelectPlayer) onSelectPlayer(fullP);
                      }}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 cursor-pointer transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 text-center font-mono font-bold text-emerald-400">
                          {starter.number}
                        </span>
                        <span className="font-semibold text-white">{starter.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Animated Player Goal Tally in Squad Roster */}
                        {goalsCount > 0 && (
                          <AnimatePresence mode="popLayout" initial={false}>
                            <motion.span
                              key={`home-starter-tally-${starter.playerId}-${goalsCount}`}
                              initial={{ scale: 1.6, color: '#10b981' }}
                              animate={{ scale: 1, color: '#6ee7b7' }}
                              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                              className="font-mono font-bold text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm"
                              title={`${goalsCount} goal(s) in this match`}
                            >
                              <span>⚽</span>
                              <span>{goalsCount > 1 ? `x${goalsCount}` : '1'}</span>
                            </motion.span>
                          </AnimatePresence>
                        )}
                        {match.mvpPlayerId === starter.playerId && (
                          <span className="inline-flex items-center gap-1 font-bold font-mono text-[10px] bg-gradient-to-r from-amber-500/25 to-yellow-500/10 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded shadow-sm">
                            <Award className="w-3 h-3 text-amber-400" />
                            <span>MVP</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-900 px-1.5 py-0.5 rounded">
                          {starter.position}
                        </span>
                        {starter.rating && (
                          <span className="font-mono text-emerald-400 font-bold">
                            {starter.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Away Squad */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ClubCrest team={awayTeam} size="sm" />
                <span className="font-bold text-white text-sm">{awayTeam.name}</span>
              </div>
              <span className="text-xs font-mono text-slate-400">{match.awayLineup.formation}</span>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Starting XI
              </h4>
              <div className="space-y-2">
                {match.awayLineup.starters.map((starter) => {
                  const goalsCount = getPlayerMatchGoals(starter.name, starter.playerId);
                  return (
                    <div
                      key={starter.playerId}
                      onClick={() => {
                        const fullP = players.find((p) => p.id === starter.playerId);
                        if (fullP && onSelectPlayer) onSelectPlayer(fullP);
                      }}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 cursor-pointer transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 text-center font-mono font-bold text-red-400">
                          {starter.number}
                        </span>
                        <span className="font-semibold text-white">{starter.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Animated Player Goal Tally in Squad Roster */}
                        {goalsCount > 0 && (
                          <AnimatePresence mode="popLayout" initial={false}>
                            <motion.span
                              key={`away-starter-tally-${starter.playerId}-${goalsCount}`}
                              initial={{ scale: 1.6, color: '#f43f5e' }}
                              animate={{ scale: 1, color: '#fda4af' }}
                              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                              className="font-mono font-bold text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm"
                              title={`${goalsCount} goal(s) in this match`}
                            >
                              <span>⚽</span>
                              <span>{goalsCount > 1 ? `x${goalsCount}` : '1'}</span>
                            </motion.span>
                          </AnimatePresence>
                        )}
                        {match.mvpPlayerId === starter.playerId && (
                          <span className="inline-flex items-center gap-1 font-bold font-mono text-[10px] bg-gradient-to-r from-amber-500/25 to-yellow-500/10 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded shadow-sm">
                            <Award className="w-3 h-3 text-amber-400" />
                            <span>MVP</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-900 px-1.5 py-0.5 rounded">
                          {starter.position}
                        </span>
                        {starter.rating && (
                          <span className="font-mono text-emerald-400 font-bold">
                            {starter.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: HEAD TO HEAD & INFO */}
      {activeTab === 'info' && (
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Venue & Conditions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Played at {match.venue}, home of {homeTeam.name} with an authorized capacity of{' '}
                {homeTeam.capacity.toLocaleString()} seats. Weather conditions at kickoff: {match.weather || 'Clear conditions'}.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Match Officials</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lead Match Referee: {match.referee}. Video Assistant Referee (VAR) operating from the central league command room.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white mb-3">Head-to-Head History</h3>
            <div className="grid grid-cols-3 text-center text-xs bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-xl font-bold font-mono text-sky-400">14</span>
                <p className="text-[11px] text-slate-400 mt-1">{homeTeam.shortName} Wins</p>
              </div>
              <div>
                <span className="text-xl font-bold font-mono text-slate-300">8</span>
                <p className="text-[11px] text-slate-400 mt-1">Draws</p>
              </div>
              <div>
                <span className="text-xl font-bold font-mono text-red-400">12</span>
                <p className="text-[11px] text-slate-400 mt-1">{awayTeam.shortName} Wins</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Administrative Ingestion Modal */}
      <LiveMatchIngestionModal
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
        match={match}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homePlayers={homePlayers}
        awayPlayers={awayPlayers}
        onAddEvent={handleAddEvent}
        onUpdateScore={handleUpdateScore}
        onUpdateMinute={handleUpdateMinute}
        onUpdateStatus={handleUpdateStatus}
        onUpdateStats={handleUpdateStats}
        onUpdateMvp={handleUpdateMvp}
      />
    </div>
  );
};

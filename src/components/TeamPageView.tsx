import React, { useState } from 'react';
import { Team, Player, Match, Trophy } from '../types/league';
import { ClubCrest } from './ClubCrest';
import { InjuryBadge } from './InjuryBadge';
import { TeamMomentumChart } from './TeamMomentumChart';
import { getTeamPerformanceTrend } from '../data/teamPerformanceData';
import {
  MapPin,
  Users,
  Award,
  Calendar,
  Briefcase,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldAlert,
  Flame,
  Zap,
} from 'lucide-react';

interface TeamPageViewProps {
  team: Team;
  allTeams: Team[];
  players: Player[];
  matches: Match[];
  onSelectMatch: (matchId: string) => void;
  onSelectPlayer: (player: Player) => void;
}

export const TeamPageView: React.FC<TeamPageViewProps> = ({
  team,
  allTeams,
  players,
  matches,
  onSelectMatch,
  onSelectPlayer,
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'squad' | 'fixtures' | 'stats' | 'momentum'>('momentum');
  const [positionFilter, setPositionFilter] = useState<'ALL' | 'GK' | 'DF' | 'MF' | 'FW'>('ALL');
  const [sortBy, setSortBy] = useState<'number' | 'goals' | 'rating' | 'value'>('number');

  // Momentum analytics summary
  const momentumSummary = getTeamPerformanceTrend(team.id, allTeams, matches);

  // Filter players for this team
  const teamPlayers = players.filter((p) => p.teamId === team.id);

  const filteredPlayers = teamPlayers
    .filter((p) => positionFilter === 'ALL' || p.position === positionFilter)
    .sort((a, b) => {
      if (sortBy === 'number') return a.number - b.number;
      if (sortBy === 'goals') return b.goals - a.goals;
      if (sortBy === 'rating') return b.formRating - a.formRating;
      if (sortBy === 'value') {
        const valA = parseFloat(a.marketValue.replace(/[^0-9.]/g, '')) || 0;
        const valB = parseFloat(b.marketValue.replace(/[^0-9.]/g, '')) || 0;
        return valB - valA;
      }
      return 0;
    });

  // Team matches
  const teamMatches = matches.filter(
    (m) => m.homeTeamId === team.id || m.awayTeamId === team.id
  );

  // Aggregated stats
  const totalGoalsScored = teamPlayers.reduce((acc, p) => acc + p.goals, 0);
  const totalAssists = teamPlayers.reduce((acc, p) => acc + p.assists, 0);
  const cleanSheets = Math.max(...teamPlayers.map((p) => p.cleanSheets), 0);
  const yellowCards = teamPlayers.reduce((acc, p) => acc + p.yellowCards, 0);
  const redCards = teamPlayers.reduce((acc, p) => acc + p.redCards, 0);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-12">
      {/* Club Banner Header */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-2xl">
        {/* Color accents */}
        <div
          className="absolute top-0 left-0 right-0 h-2"
          style={{ backgroundColor: team.crestColor }}
        />
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ backgroundColor: team.crestColor }}
        />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <ClubCrest team={team} size="xl" className="shrink-0" />

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {team.name}
              </h1>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {team.code}
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {team.philosophy}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{team.stadium} ({team.capacity.toLocaleString()} cap.)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Manager: <strong className="text-white">{team.manager}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Est. {team.founded}</span>
              </div>
            </div>
          </div>

          {/* Quick Honors Badge Count */}
          <div className="flex md:flex-col items-center gap-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-center shrink-0">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-lg font-black font-mono text-white">
                {team.honours.reduce((sum, h) => sum + h.count, 0)}
              </span>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Major Honours
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Momentum Quick Banner under Club Header */}
      <div
        onClick={() => setActiveTab('momentum')}
        className="p-3.5 px-5 rounded-xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-slate-800 hover:border-slate-700 flex flex-wrap items-center justify-between gap-3 cursor-pointer group shadow-lg transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Last 10 Matches Performance:
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                {momentumSummary.momentumLabel}
              </span>
              <span className="font-mono text-xs font-bold text-amber-400">
                ({momentumSummary.totalPoints}/30 Pts)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {momentumSummary.currentStreak} · Goal Diff {momentumSummary.goalDifference > 0 ? `+${momentumSummary.goalDifference}` : momentumSummary.goalDifference} ({momentumSummary.goalsScored} scored, {momentumSummary.goalsConceded} conceded)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-400 group-hover:underline flex items-center gap-1">
            <span>View 10-Match Trend Line</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 text-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('momentum')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'momentum'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>10-Match Momentum</span>
        </button>
        <button
          onClick={() => setActiveTab('squad')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'squad'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Squad Roster ({teamPlayers.length})
        </button>
        <button
          onClick={() => setActiveTab('fixtures')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'fixtures'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Games & Results ({teamMatches.length})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'stats'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Season Statistics
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'about'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          About & Honours
        </button>
      </div>

      {/* TAB: 10-MATCH MOMENTUM & PERFORMANCE TREND */}
      {activeTab === 'momentum' && (
        <TeamMomentumChart
          team={team}
          allTeams={allTeams}
          matches={matches}
          onSelectMatch={onSelectMatch}
        />
      )}

      {/* TAB 1: SQUAD ROSTER */}
      {activeTab === 'squad' && (
        <div className="space-y-4">
          {/* Controls: Filter & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            {/* Position filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 mr-1 text-[11px] font-medium">Position:</span>
              {(['ALL', 'GK', 'DF', 'MF', 'FW'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPositionFilter(pos)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    positionFilter === pos
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-white rounded px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="number">Squad Number</option>
                <option value="goals">Top Goals</option>
                <option value="rating">Form Rating</option>
                <option value="value">Market Value</option>
              </select>
            </div>
          </div>

          {/* Player Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                onClick={() => onSelectPlayer(player)}
                className="group bg-slate-900/70 hover:bg-slate-850 p-4 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 font-mono font-bold text-white text-xs flex items-center justify-center">
                      {player.number}
                    </span>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-950 px-1.5 py-0.5 rounded">
                        {player.position}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ★ {player.formRating.toFixed(1)}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{player.flag}</span>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {player.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{player.age} yrs</span>
                    <span aria-hidden="true">·</span>
                    <span>{player.nationality}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-300">{player.marketValue}</span>
                  </div>
                </div>

                {/* Player stats mini row */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-3 text-center text-xs">
                  <div>
                    <span className="font-mono font-bold text-white tabular-nums">
                      {player.appearances}
                    </span>
                    <p className="text-[10px] text-slate-500">Apps</p>
                  </div>
                  <div>
                    <span className="font-mono font-bold text-emerald-400 tabular-nums">
                      {player.position === 'GK' ? player.cleanSheets : player.goals}
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {player.position === 'GK' ? 'Clean Sheets' : 'Goals'}
                    </p>
                  </div>
                  <div>
                    <span className="font-mono font-bold text-sky-400 tabular-nums">
                      {player.assists}
                    </span>
                    <p className="text-[10px] text-slate-500">Assists</p>
                  </div>
                </div>

                {/* Status / Injury warning badge */}
                {(player.injuryStatus === 'injured' || player.injuryStatus === 'out' || player.injuryStatus === 'doubtful' || player.status === 'injured') ? (
                  <div className="mt-2.5">
                    <InjuryBadge
                      injuryStatus={player.injuryStatus || 'injured'}
                      injuryNote={player.injuryNote}
                      showDetails={true}
                      size="xs"
                    />
                  </div>
                ) : player.status === 'suspended' ? (
                  <div className="mt-2 text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    <span className="uppercase">Suspended</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: GAMES & RESULTS */}
      {activeTab === 'fixtures' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {team.name} Schedule & Match Center
            </h3>
            <span className="text-xs text-slate-400">{teamMatches.length} Fixtures</span>
          </div>

          <div className="space-y-3">
            {teamMatches.map((m) => {
              const opponentId = m.homeTeamId === team.id ? m.awayTeamId : m.homeTeamId;
              const opponent = allTeams.find((t) => t.id === opponentId) || allTeams[0];
              const isHome = m.homeTeamId === team.id;

              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMatch(m.id)}
                  className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all gap-4"
                >
                  {/* Left: Meta */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 w-full sm:w-auto">
                    <div className="px-2 py-1 rounded bg-slate-950 font-mono text-slate-300">
                      MW {m.matchweek}
                    </div>
                    <span>{m.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{isHome ? 'Home' : 'Away'}</span>
                  </div>

                  {/* Center: Teams & Score */}
                  <div className="flex items-center justify-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 text-right">
                      <span className={`text-sm font-bold ${m.homeTeamId === team.id ? 'text-white' : 'text-slate-300'}`}>
                        {allTeams.find((t) => t.id === m.homeTeamId)?.shortName}
                      </span>
                    </div>

                    <div className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 font-mono font-bold text-sm text-center min-w-[70px]">
                      {m.status === 'UPCOMING' ? (
                        <span className="text-slate-400 text-xs">{m.time}</span>
                      ) : (
                        <span className="text-white">
                          {m.homeScore} - {m.awayScore}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-left">
                      <span className={`text-sm font-bold ${m.awayTeamId === team.id ? 'text-white' : 'text-slate-300'}`}>
                        {allTeams.find((t) => t.id === m.awayTeamId)?.shortName}
                      </span>
                    </div>
                  </div>

                  {/* Right: Status badge & Action */}
                  <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                    {m.status === 'LIVE' ? (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        LIVE {m.currentMinute}'
                      </span>
                    ) : m.status === 'FINISHED' ? (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        FT
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                        Upcoming
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ABOUT & HONOURS */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Club Philosophy & Governance
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {team.philosophy}
            </p>
            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Head Coach:</span>
                <span className="font-semibold text-white">{team.manager}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Club President:</span>
                <span className="font-semibold text-white">{team.president}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Official Ground:</span>
                <span className="font-semibold text-white">{team.stadium}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Seating Capacity:</span>
                <span className="font-mono text-white">{team.capacity.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Trophy Cabinet & Major Honours
            </h3>
            <div className="space-y-3">
              {team.honours.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80"
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{h.name}</h4>
                      <span className="text-[11px] text-slate-400">Last won: {h.lastWon}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-base text-amber-400">
                    x{h.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SEASON STATS */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-2xl font-black font-mono text-emerald-400">{totalGoalsScored}</span>
            <p className="text-xs text-slate-400 mt-1">Goals Scored</p>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-2xl font-black font-mono text-sky-400">{totalAssists}</span>
            <p className="text-xs text-slate-400 mt-1">Total Assists</p>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-2xl font-black font-mono text-amber-400">{cleanSheets}</span>
            <p className="text-xs text-slate-400 mt-1">Clean Sheets</p>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-2xl font-black font-mono text-rose-400">{yellowCards} / {redCards}</span>
            <p className="text-xs text-slate-400 mt-1">Yellow / Red Cards</p>
          </div>

          {/* 10-Match Momentum & Performance Curve */}
          <div className="col-span-2 sm:col-span-4 pt-2">
            <TeamMomentumChart
              team={team}
              allTeams={allTeams}
              matches={matches}
              onSelectMatch={onSelectMatch}
            />
          </div>
        </div>
      )}
    </div>
  );
};

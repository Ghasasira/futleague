import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Team, Match, TeamPerformanceMatch, TeamMomentumSummary } from '../types/league';
import { getTeamPerformanceTrend } from '../data/teamPerformanceData';
import { ClubCrest } from './ClubCrest';
import {
  TrendingUp,
  Activity,
  Flame,
  Award,
  Zap,
  Target,
  Shield,
  Calendar,
  ChevronRight,
  Info,
  Maximize2,
} from 'lucide-react';

interface TeamMomentumChartProps {
  team: Team;
  allTeams: Team[];
  matches?: Match[];
  onSelectMatch?: (matchId: string) => void;
}

type MetricMode = 'POINTS' | 'RATING' | 'GOAL_DIFF' | 'XG';

interface GridGuide {
  label: string;
  val: number;
  y: number;
  dashed?: boolean;
  highlight?: boolean;
}

export const TeamMomentumChart: React.FC<TeamMomentumChartProps> = ({
  team,
  allTeams,
  matches = [],
  onSelectMatch,
}) => {
  const [metricMode, setMetricMode] = useState<MetricMode>('POINTS');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(9); // default to latest match

  // Calculate the 10-match timeline
  const summary: TeamMomentumSummary = getTeamPerformanceTrend(team.id, allTeams, matches);
  const data = summary.matches;

  // Selected match for breakdown
  const activeMatch: TeamPerformanceMatch | undefined =
    hoveredIndex !== null
      ? data[hoveredIndex]
      : selectedIndex !== null
      ? data[selectedIndex]
      : data[data.length - 1];

  const opponentTeam = allTeams.find((t) => t.id === activeMatch?.opponentId);

  // SVG dimensions
  const width = 800;
  const height = 240;
  const paddingX = 45;
  const paddingTop = 30;
  const paddingBottom = 40;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates based on selected metric
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * innerWidth;
    let y = height - paddingBottom;

    if (metricMode === 'POINTS') {
      // Cumulative Points: 0 to 30
      const maxVal = 30;
      const normalized = d.cumulativePoints / maxVal;
      y = height - paddingBottom - normalized * innerHeight;
    } else if (metricMode === 'RATING') {
      // Rating: 5.0 to 10.0
      const minVal = 5.0;
      const maxVal = 10.0;
      const normalized = (d.rating - minVal) / (maxVal - minVal);
      y = height - paddingBottom - Math.max(0, Math.min(1, normalized)) * innerHeight;
    } else if (metricMode === 'GOAL_DIFF') {
      // Goal Diff per match: -4 to +4
      const minVal = -4;
      const maxVal = 4;
      const normalized = (d.goalDiff - minVal) / (maxVal - minVal);
      y = height - paddingBottom - Math.max(0, Math.min(1, normalized)) * innerHeight;
    } else if (metricMode === 'XG') {
      // Team xG: 0 to 4.0
      const maxVal = 4.0;
      const normalized = Math.min(4.0, d.teamXG) / maxVal;
      y = height - paddingBottom - normalized * innerHeight;
    }

    return { x, y, data: d, index: i };
  });

  // Build smooth bezier curve path for primary line
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = buildSmoothPath(points);

  // Closed area for gradient fill
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
      : '';

  // Reference lines & labels
  const getGridGuides = (): GridGuide[] => {
    if (metricMode === 'POINTS') {
      return [
        { label: '30 pts (Max)', val: 30, y: height - paddingBottom - (30 / 30) * innerHeight },
        { label: '20 pts (Title Pace)', val: 20, y: height - paddingBottom - (20 / 30) * innerHeight, dashed: true },
        { label: '10 pts', val: 10, y: height - paddingBottom - (10 / 30) * innerHeight },
        { label: '0 pts', val: 0, y: height - paddingBottom },
      ];
    } else if (metricMode === 'RATING') {
      return [
        { label: '9.0 Elite', val: 9.0, y: height - paddingBottom - ((9.0 - 5.0) / 5.0) * innerHeight, dashed: true },
        { label: '8.0 Strong', val: 8.0, y: height - paddingBottom - ((8.0 - 5.0) / 5.0) * innerHeight },
        { label: '7.0 Solid', val: 7.0, y: height - paddingBottom - ((7.0 - 5.0) / 5.0) * innerHeight },
        { label: '6.0 Par', val: 6.0, y: height - paddingBottom - ((6.0 - 5.0) / 5.0) * innerHeight },
      ];
    } else if (metricMode === 'GOAL_DIFF') {
      return [
        { label: '+3 GD', val: 3, y: height - paddingBottom - ((3 - -4) / 8) * innerHeight },
        { label: '0 Level', val: 0, y: height - paddingBottom - ((0 - -4) / 8) * innerHeight, highlight: true },
        { label: '-3 GD', val: -3, y: height - paddingBottom - ((-3 - -4) / 8) * innerHeight },
      ];
    } else {
      return [
        { label: '3.0 xG', val: 3.0, y: height - paddingBottom - (3.0 / 4.0) * innerHeight },
        { label: '2.0 xG', val: 2.0, y: height - paddingBottom - (2.0 / 4.0) * innerHeight, dashed: true },
        { label: '1.0 xG', val: 1.0, y: height - paddingBottom - (1.0 / 4.0) * innerHeight },
      ];
    }
  };

  const gridGuides = getGridGuides();

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 md:p-6 shadow-xl relative overflow-hidden space-y-6">
      {/* Background ambient branding glow */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ backgroundColor: team.crestColor }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ backgroundColor: team.secondaryColor }}
      />

      {/* HEADER: Title & Metric Mode Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-base md:text-lg font-bold text-white tracking-tight">
              10-Match Momentum & Performance Trend
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
              MW 15 — MW 24
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing form velocity, points accumulation rate, and match-by-match tactical dominance.
          </p>
        </div>

        {/* Metric Mode Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setMetricMode('POINTS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              metricMode === 'POINTS'
                ? 'bg-emerald-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cumulative Points
          </button>
          <button
            onClick={() => setMetricMode('RATING')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              metricMode === 'RATING'
                ? 'bg-emerald-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Match Rating
          </button>
          <button
            onClick={() => setMetricMode('GOAL_DIFF')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              metricMode === 'GOAL_DIFF'
                ? 'bg-emerald-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Goal Margin (+/-)
          </button>
          <button
            onClick={() => setMetricMode('XG')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              metricMode === 'XG'
                ? 'bg-emerald-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Expected Goals (xG)
          </button>
        </div>
      </div>

      {/* MOMENTUM KPI SUMMARY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs relative z-10">
        {/* Momentum Index */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Momentum</span>
          </span>
          <div className="mt-2">
            <span className="text-xl font-black font-mono text-white">
              {summary.momentumScore}
              <span className="text-xs text-slate-500 font-normal">/100</span>
            </span>
            <p className="text-[11px] font-semibold text-emerald-400 truncate mt-0.5">
              {summary.momentumLabel}
            </p>
          </div>
        </div>

        {/* Points Record */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-400" />
            <span>Points Won</span>
          </span>
          <div className="mt-2">
            <span className="text-xl font-black font-mono text-emerald-400">
              {summary.totalPoints}
              <span className="text-xs text-slate-500 font-normal"> / 30</span>
            </span>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              {summary.pointsPercentage}% efficiency
            </p>
          </div>
        </div>

        {/* 10-Game W-D-L */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Activity className="w-3 h-3 text-sky-400" />
            <span>10-Match Record</span>
          </span>
          <div className="mt-2">
            <span className="text-xl font-black font-mono text-white">
              {summary.wins}W · {summary.draws}D · {summary.losses}L
            </span>
            <div className="flex items-center gap-1 mt-1">
              {summary.matches.map((m, idx) => (
                <span
                  key={idx}
                  className={`w-3.5 h-3.5 rounded text-[8px] font-bold flex items-center justify-center font-mono ${
                    m.result === 'W'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : m.result === 'D'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {m.result}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Goal Difference */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Target className="w-3 h-3 text-purple-400" />
            <span>Goals / Differential</span>
          </span>
          <div className="mt-2">
            <span className="text-xl font-black font-mono text-white">
              {summary.goalDifference > 0 ? `+${summary.goalDifference}` : summary.goalDifference}
            </span>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              {summary.goalsScored} scored · {summary.goalsConceded} allowed
            </p>
          </div>
        </div>

        {/* Expected Goals Average */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Average xG</span>
          </span>
          <div className="mt-2">
            <span className="text-xl font-black font-mono text-sky-400">
              {summary.averageXG}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {summary.averagePossession}% avg possession
            </p>
          </div>
        </div>

        {/* Active Streak */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>Current Streak</span>
          </span>
          <div className="mt-2">
            <span className="text-sm font-bold text-white block truncate">
              {summary.currentStreak}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {summary.cleanSheets} clean sheets
            </p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE SVG TREND LINE CHART */}
      <div className="relative bg-slate-950/80 rounded-xl border border-slate-800 p-4 md:p-6 select-none overflow-hidden">
        {/* Chart Title / Context Legend */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: team.crestColor, borderColor: team.secondaryColor }}
            />
            <span className="font-semibold text-slate-200">
              {metricMode === 'POINTS'
                ? 'Points Trajectory (Max 30 pts)'
                : metricMode === 'RATING'
                ? 'Match Squad Performance Rating (5.0 - 10.0)'
                : metricMode === 'GOAL_DIFF'
                ? 'Net Margin Spread (-4 to +4)'
                : 'Expected Goals Generated per Match (xG)'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Win (3 pts)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Draw (1 pt)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Loss (0 pts)
            </span>
          </div>
        </div>

        {/* SVG Viewport */}
        <div className="w-full relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible"
            style={{ maxHeight: '280px' }}
          >
            <defs>
              {/* Primary area gradient */}
              <linearGradient id={`teamGrad-${team.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={team.crestColor} stopOpacity="0.45" />
                <stop offset="60%" stopColor={team.crestColor} stopOpacity="0.12" />
                <stop offset="100%" stopColor={team.crestColor} stopOpacity="0.0" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal Grid Lines */}
            {gridGuides.map((guide, idx) => (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={guide.y}
                  x2={width - paddingX}
                  y2={guide.y}
                  stroke={guide.highlight ? '#64748b' : '#334155'}
                  strokeDasharray={guide.dashed ? '4,4' : undefined}
                  strokeWidth={guide.highlight ? '1.5' : '1'}
                  opacity={guide.highlight ? '0.7' : '0.4'}
                />
                <text
                  x={paddingX - 8}
                  y={guide.y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {guide.label}
                </text>
              </g>
            ))}

            {/* Championship Target Pace dashed line for Points mode */}
            {metricMode === 'POINTS' && (
              <g>
                <line
                  x1={paddingX}
                  y1={height - paddingBottom}
                  x2={width - paddingX}
                  y2={height - paddingBottom - (24 / 30) * innerHeight}
                  stroke="#38bdf8"
                  strokeDasharray="6,4"
                  strokeWidth="1.5"
                  opacity="0.5"
                />
                <text
                  x={width - paddingX + 6}
                  y={height - paddingBottom - (24 / 30) * innerHeight + 4}
                  fill="#38bdf8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  2.4 pts/match (Title Pace)
                </text>
              </g>
            )}

            {/* Area Fill */}
            {areaPath && (
              <path
                d={areaPath}
                fill={`url(#teamGrad-${team.id})`}
                className="transition-all duration-500"
              />
            )}

            {/* Active Connecting Trend Curve */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke={team.crestColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
              />
            )}

            {/* Interactive Data Point Nodes */}
            {points.map((pt) => {
              const isHovered = hoveredIndex === pt.index;
              const isSelected = selectedIndex === pt.index;
              const resultColor =
                pt.data.result === 'W'
                  ? '#10b981'
                  : pt.data.result === 'D'
                  ? '#f59e0b'
                  : '#f43f5e';

              return (
                <g
                  key={pt.index}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(pt.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setSelectedIndex(pt.index)}
                >
                  {/* Vertical guideline on hover/selection */}
                  {(isHovered || isSelected) && (
                    <line
                      x1={pt.x}
                      y1={paddingTop}
                      x2={pt.x}
                      y2={height - paddingBottom}
                      stroke="#94a3b8"
                      strokeDasharray="3,3"
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                  )}

                  {/* Pulsing ring on selection */}
                  {(isHovered || isSelected) && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={14}
                      fill={resultColor}
                      opacity={0.25}
                    />
                  )}

                  {/* Outer circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered || isSelected ? 8 : 6}
                    fill="#020617"
                    stroke={resultColor}
                    strokeWidth="3"
                    className="transition-all duration-200"
                  />

                  {/* Result label inside node */}
                  {(isHovered || isSelected) && (
                    <text
                      x={pt.x}
                      y={pt.y - 12}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {metricMode === 'POINTS'
                        ? `${pt.data.cumulativePoints} pts`
                        : metricMode === 'RATING'
                        ? `★ ${pt.data.rating.toFixed(1)}`
                        : metricMode === 'GOAL_DIFF'
                        ? `${pt.data.goalDiff > 0 ? `+${pt.data.goalDiff}` : pt.data.goalDiff}`
                        : `${pt.data.teamXG.toFixed(2)} xG`}
                    </text>
                  )}

                  {/* Matchweek Label below axis */}
                  <text
                    x={pt.x}
                    y={height - paddingBottom + 18}
                    textAnchor="middle"
                    fill={isHovered || isSelected ? '#ffffff' : '#64748b'}
                    fontSize="10"
                    fontWeight={isHovered || isSelected ? 'bold' : 'normal'}
                    fontFamily="monospace"
                  >
                    MW{pt.data.matchweek}
                  </text>

                  {/* Result pill below MW */}
                  <text
                    x={pt.x}
                    y={height - paddingBottom + 30}
                    textAnchor="middle"
                    fill={resultColor}
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {pt.data.result}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* SELECTED MATCH DETAIL TELEMETRY CARD */}
      {activeMatch && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`match-card-${activeMatch.matchweek}-${activeMatch.opponentId}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-4 md:p-5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg"
          >
            {/* Left: Match Result & Teams */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-black font-mono text-lg shrink-0 ${
                  activeMatch.result === 'W'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : activeMatch.result === 'D'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {activeMatch.result}
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono font-bold text-slate-200">
                    Matchweek {activeMatch.matchweek}
                  </span>
                  <span>·</span>
                  <span>{activeMatch.date}</span>
                  <span>·</span>
                  <span>{activeMatch.isHome ? 'Home' : 'Away'}</span>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm md:text-base font-extrabold text-white">
                    {team.name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded font-mono font-black text-sm bg-slate-900 border border-slate-700 text-white">
                    {activeMatch.teamScore} - {activeMatch.opponentScore}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {opponentTeam && <ClubCrest team={opponentTeam} size="xs" />}
                    <span className="text-sm md:text-base font-extrabold text-slate-300">
                      {activeMatch.opponentName}
                    </span>
                  </div>
                </div>

                {activeMatch.keyMoment && (
                  <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-1">
                    "{activeMatch.keyMoment}"
                  </p>
                )}
              </div>
            </div>

            {/* Right: Telemetry Metrics & Action Button */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end text-xs">
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase block">Rating</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ★ {activeMatch.rating.toFixed(1)}
                </span>
              </div>

              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase block">xG Battle</span>
                <span className="font-mono font-bold text-white text-sm">
                  {activeMatch.teamXG.toFixed(2)}{' '}
                  <span className="text-slate-500 font-normal">vs</span>{' '}
                  {activeMatch.opponentXG.toFixed(2)}
                </span>
              </div>

              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase block">Possession</span>
                <span className="font-mono font-bold text-sky-400 text-sm">
                  {activeMatch.possession}%
                </span>
              </div>

              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase block">Points Gained</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  +{activeMatch.points} pts
                </span>
              </div>

              {activeMatch.matchId && onSelectMatch && (
                <button
                  onClick={() => onSelectMatch(activeMatch.matchId!)}
                  className="px-3 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <span>Match Center</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* QUICK MATCH STRIP: CLICKABLE 10-MATCH TIMELINE */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">
            Last 10 Matches Chronology (Click to inspect)
          </span>
          <span className="text-[11px] text-slate-500">
            Chronological left-to-right (Oldest → Latest)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {data.map((m, idx) => {
            const isSelected =
              (hoveredIndex !== null ? hoveredIndex : selectedIndex) === idx;
            const opp = allTeams.find((t) => t.id === m.opponentId);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-2 rounded-xl text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-400 shadow-md scale-102'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono font-bold">MW{m.matchweek}</span>
                  <span
                    className={`font-bold font-mono px-1 rounded text-[9px] ${
                      m.result === 'W'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : m.result === 'D'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {m.result}
                  </span>
                </div>

                <div className="my-1.5 flex items-center gap-1.5">
                  {opp && <ClubCrest team={opp} size="xs" />}
                  <span className="text-xs font-bold text-white truncate">
                    {m.opponentShortName}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-white">
                    {m.teamScore}-{m.opponentScore}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {m.isHome ? 'H' : 'A'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

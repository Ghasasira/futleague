import React from 'react';
import { InjuryStatus, PlayerStatus } from '../types/league';
import { AlertTriangle, ShieldAlert, HeartPulse, Clock } from 'lucide-react';

interface InjuryBadgeProps {
  injuryStatus?: InjuryStatus | PlayerStatus;
  injuryNote?: string;
  injuryReturnDate?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export const InjuryBadge: React.FC<InjuryBadgeProps> = ({
  injuryStatus,
  injuryNote,
  injuryReturnDate,
  size = 'sm',
  showDetails = false,
  className = '',
}) => {
  // If player is fit or undefined, return null
  if (!injuryStatus || injuryStatus === 'fit') {
    return null;
  }

  const isDoubtful = injuryStatus === 'doubtful';
  const isSevere = injuryStatus === 'out';
  const isInjured = injuryStatus === 'injured' || isSevere;

  const colorStyles = isDoubtful
    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    : 'bg-rose-500/15 text-rose-300 border-rose-500/40';

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const statusLabel = isDoubtful
    ? 'Doubtful'
    : isSevere
    ? 'Ruled Out'
    : 'Injured';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md font-semibold border ${colorStyles} ${textSizes[size]} ${className}`}
      title={injuryNote ? `${statusLabel}: ${injuryNote}` : `${statusLabel} for selection`}
    >
      <AlertTriangle className={`${iconSizes[size]} shrink-0 animate-pulse`} />
      <span className="uppercase tracking-wider font-mono text-[10px] font-bold">
        {statusLabel}
      </span>

      {showDetails && injuryNote && (
        <>
          <span className="text-white/40" aria-hidden="true">·</span>
          <span className="font-normal font-sans text-slate-200">
            {injuryNote}
          </span>
        </>
      )}

      {showDetails && injuryReturnDate && (
        <>
          <span className="text-white/40" aria-hidden="true">·</span>
          <span className="font-mono text-[10px] text-slate-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Ret: {injuryReturnDate}</span>
          </span>
        </>
      )}
    </div>
  );
};

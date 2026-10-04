import React from 'react';
import { Team } from '../types/league';

interface ClubCrestProps {
  team: Team;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
}

export const ClubCrest: React.FC<ClubCrestProps> = ({
  team,
  size = 'md',
  className = '',
  showName = false,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
  };

  const renderShape = () => {
    switch (team.crestBadgeStyle) {
      case 'circle':
        return (
          <circle
            cx="24"
            cy="24"
            r="22"
            fill={team.crestColor}
            stroke={team.secondaryColor}
            strokeWidth="2.5"
          />
        );
      case 'diamond':
        return (
          <polygon
            points="24,2 46,24 24,46 2,24"
            fill={team.crestColor}
            stroke={team.secondaryColor}
            strokeWidth="2.5"
          />
        );
      case 'hexagon':
        return (
          <polygon
            points="24,3 43,14 43,34 24,45 5,34 5,14"
            fill={team.crestColor}
            stroke={team.secondaryColor}
            strokeWidth="2.5"
          />
        );
      case 'shield':
      default:
        return (
          <path
            d="M 24 3 C 35 3 44 8 44 19 C 44 33 24 45 24 45 C 24 45 4 33 4 19 C 4 8 13 3 24 3 Z"
            fill={team.crestColor}
            stroke={team.secondaryColor}
            strokeWidth="2.5"
          />
        );
    }
  };

  const renderIcon = () => {
    switch (team.crestIcon) {
      case 'crown':
        return (
          <path
            d="M 14 30 L 16 19 L 21 24 L 24 16 L 27 24 L 32 19 L 34 30 Z"
            fill="#ffffff"
            stroke={team.secondaryColor}
            strokeWidth="1"
          />
        );
      case 'sword':
        return (
          <path
            d="M 23 12 L 25 12 L 25 28 L 29 28 L 29 30 L 25 30 L 25 35 L 23 35 L 23 30 L 19 30 L 19 28 L 23 28 Z"
            fill="#ffffff"
          />
        );
      case 'sun':
        return (
          <g fill="#ffffff">
            <circle cx="24" cy="24" r="6" />
            <line x1="24" y1="12" x2="24" y2="15" stroke="#ffffff" strokeWidth="2" />
            <line x1="24" y1="33" x2="24" y2="36" stroke="#ffffff" strokeWidth="2" />
            <line x1="12" y1="24" x2="15" y2="24" stroke="#ffffff" strokeWidth="2" />
            <line x1="33" y1="24" x2="36" y2="24" stroke="#ffffff" strokeWidth="2" />
          </g>
        );
      case 'anchor':
        return (
          <path
            d="M 24 14 A 3 3 0 1 0 24 20 A 3 3 0 1 0 24 14 M 24 20 L 24 33 M 16 26 C 16 32 32 32 32 26"
            stroke="#ffffff"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        );
      case 'tree':
        return (
          <path
            d="M 24 13 L 16 26 L 21 26 L 15 34 L 33 34 L 27 26 L 32 26 Z"
            fill="#ffffff"
          />
        );
      case 'compass':
        return (
          <g>
            <circle cx="24" cy="24" r="10" stroke="#ffffff" strokeWidth="1.5" fill="none" />
            <polygon points="24,16 27,24 24,22 21,24" fill="#ffffff" />
            <polygon points="24,32 27,24 24,26 21,24" fill={team.secondaryColor} />
          </g>
        );
      case 'star':
        return (
          <polygon
            points="24,14 26.5,21 34,21 28,25.5 30.5,33 24,28.5 17.5,33 20,25.5 14,21 21.5,21"
            fill="#ffffff"
          />
        );
      case 'shield':
      default:
        return (
          <path
            d="M 24 16 L 31 19 V 26 C 31 30 24 33 24 33 C 24 33 17 30 17 26 V 19 Z"
            fill="#ffffff"
          />
        );
    }
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`relative shrink-0 flex items-center justify-center transition-transform hover:scale-105 ${sizeClasses[size]}`}>
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-md">
          {renderShape()}
          {renderIcon()}
          {/* Subtle monogram */}
          <text
            x="24"
            y={size === 'xl' || size === 'lg' ? '41' : '39'}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="7"
            fontWeight="bold"
            letterSpacing="0.5"
            opacity="0.9"
            className="font-mono"
          >
            {team.code}
          </text>
        </svg>
      </div>
      {showName && (
        <span className="font-semibold text-slate-100 tracking-tight leading-tight">
          {team.name}
        </span>
      )}
    </div>
  );
};

import React from 'react';
import { CardView } from '../CardView';

export const TargetCardDisplay = ({ target = 'A' }) => {
  const getDetails = () => {
    switch (target) {
      case 'K':
        return {
          label: 'Kings',
          themeGlow: 'shadow-[0_0_24px_rgba(234,179,8,0.35)] ring-1 ring-yellow-400/50',
          badgeStyle: 'text-yellow-300 border-yellow-500/30 bg-yellow-500/10',
          dotStyle: 'bg-yellow-400'
        };
      case 'Q':
        return {
          label: 'Queens',
          themeGlow: 'shadow-[0_0_24px_rgba(225,29,72,0.35)] ring-1 ring-rose-500/50',
          badgeStyle: 'text-rose-300 border-rose-500/30 bg-rose-500/10',
          dotStyle: 'bg-rose-400'
        };
      case 'A':
      default:
        return {
          label: 'Aces',
          themeGlow: 'shadow-[0_0_24px_rgba(255,255,255,0.3)] ring-1 ring-white/40',
          badgeStyle: 'text-white/90 border-white/20 bg-white/10',
          dotStyle: 'bg-white'
        };
    }
  };

  const { label, themeGlow, badgeStyle, dotStyle } = getDetails();

  return (
    <div className="flex flex-col items-center select-none relative">
      <div className="relative w-20 h-28 md:w-24 md:h-32 flex items-center justify-center">
        <div className={`transition-all duration-500 rounded-xl ${themeGlow}`}>
          <CardView 
            card={{ rank: target }} 
            className="!w-18 !h-26 md:!w-20 md:!h-28 !cursor-default pointer-events-none" 
          />
        </div>
      </div>

      {/* Target Badge */}
      <div className={`mt-2 flex items-center gap-1.5 px-3 py-0.5 rounded-full border transition-all duration-500 ${badgeStyle}`}>
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotStyle}`} />
        <span className="text-[11px] font-mono font-medium tracking-wide">
          Target: {label}
        </span>
      </div>
    </div>
  );
};

import React from 'react';

export const TargetCardDisplay = ({ target = 'A' }) => {
  const getDetails = () => {
    switch (target) {
      case 'A': return { label: 'Aces', symbol: 'A' };
      case 'K': return { label: 'Kings', symbol: 'K' };
      case 'Q': return { label: 'Queens', symbol: 'Q' };
      default: return { label: 'Aces', symbol: 'A' };
    }
  };

  const { label, symbol } = getDetails();

  return (
    <div className="flex flex-col items-center select-none">
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/20 bg-white/[0.04] flex flex-col items-center justify-center shadow-lg backdrop-blur-sm">
        <span className="font-serif font-bold text-3xl md:text-4xl text-white leading-none">
          {symbol}
        </span>
        <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider mt-1">
          {label}
        </span>
      </div>
      <span className="text-[10px] font-mono text-white/40 mt-1.5 tracking-wide">
        Table Target
      </span>
    </div>
  );
};

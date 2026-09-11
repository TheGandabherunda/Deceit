import React from 'react';

/**
 * PlayerGunBadge displays each player's personal 6-chamber revolver.
 * Minimalist Bloom aesthetic (black and white, clean geometric cylinder).
 */
export const PlayerGunBadge = ({ chambersRemaining = 6, isAlive = true, isVictim = false, size = 'sm' }) => {
  const totalChambers = 6;
  const currentChambers = isAlive ? Math.max(0, Math.min(6, chambersRemaining)) : 0;
  const isDanger = currentChambers <= 2 && isAlive;

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all select-none ${
        !isAlive 
          ? 'bg-white/[0.02] border-white/5 opacity-40' 
          : isVictim 
            ? 'bg-white/10 border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.2)]'
            : isDanger
              ? 'bg-white/[0.06] border-white/30'
              : 'bg-white/[0.03] border-white/10'
      }`}
      title={`Personal Gun: ${currentChambers} of 6 chambers remaining (${isAlive ? Math.round((1 / currentChambers) * 100) : 0}% trigger danger)`}
    >
      {/* Mini SVG Cylinder */}
      <div className="relative w-4 h-4 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 32 32" className="w-full h-full">
          {/* Cylinder drum outline */}
          <circle cx="16" cy="16" r="14" fill="#080808" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
          
          {/* 6 Chamber Pips */}
          {Array.from({ length: totalChambers }).map((_, idx) => {
            const angleRad = (idx * 60 * Math.PI) / 180;
            const cx = 16 + 9 * Math.sin(angleRad);
            const cy = 16 - 9 * Math.cos(angleRad);
            const isLive = idx < currentChambers;

            return (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r="2.4"
                fill={isLive ? '#ffffff' : '#181818'}
                stroke={isLive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.1)'}
                strokeWidth="0.8"
              />
            );
          })}
          
          {/* Center Pin */}
          <circle cx="16" cy="16" r="2.8" fill="#ffffff" />
        </svg>
      </div>

      {/* Bullet Chamber Dots Bar */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: totalChambers }).map((_, idx) => {
          const isLive = idx < currentChambers;
          return (
            <span
              key={idx}
              className={`w-1 h-2 rounded-full transition-colors ${
                isLive ? 'bg-white' : 'bg-white/15'
              }`}
            />
          );
        })}
      </div>

      {/* Numerical Count */}
      <span className="font-mono text-[10px] text-white/70 tracking-tight font-medium ml-0.5">
        {isAlive ? `${currentChambers}/6` : '0/6'}
      </span>
    </div>
  );
};

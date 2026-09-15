import React from 'react';

export const RevolverCylinder = ({ chambersRemaining = 6, isActive = false, isSpinning = false }) => {
  const totalChambers = 6;
  const radius = 38;
  const center = 60;

  return (
    <div className="flex flex-col items-center select-none">
      <div 
        className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full p-1 flex items-center justify-center transition-all ${
          isSpinning ? 'spin-cylinder' : ''
        } ${isActive ? 'ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' : ''}`}
        style={{
          background: '#0a0a0a',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <svg viewBox="0 0 120 120" className="w-full h-full">
          {/* Main Cylinder Drum */}
          <circle cx={center} cy={center} r="54" fill="#0f0f0f" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
          <circle cx={center} cy={center} r="49" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />

          {/* 6 Chambers */}
          {Array.from({ length: totalChambers }).map((_, idx) => {
            const angleRad = (idx * 60 * Math.PI) / 180;
            const cx = center + radius * Math.sin(angleRad);
            const cy = center - radius * Math.cos(angleRad);
            
            const isLive = idx < chambersRemaining;

            return (
              <g key={idx}>
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r="12" 
                  fill={isLive ? '#ffffff' : '#050505'}
                  stroke="rgba(255,255,255,0.4)" 
                  strokeWidth="1.2"
                />
                {isLive ? (
                  <circle cx={cx} cy={cy} r="3" fill="#000000" />
                ) : (
                  <circle cx={cx} cy={cy} r="2" fill="#222222" />
                )}
              </g>
            );
          })}

          {/* Center Pin */}
          <circle cx={center} cy={center} r="12" fill="#000000" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <circle cx={center} cy={center} r="4" fill="#ffffff" />
        </svg>
      </div>

      {/* Label */}
      <div className="mt-2 flex flex-col items-center">
        <span className="text-[11px] font-mono text-white/70 font-semibold tracking-wider">
          {chambersRemaining} / 6 Chambers
        </span>
        <span className="text-[10px] font-mono text-white/40">
          {chambersRemaining > 0 ? `${Math.min(100, Math.round((1 / chambersRemaining) * 100))}% Danger` : '0% (Spent)'}
        </span>
      </div>
    </div>
  );
};

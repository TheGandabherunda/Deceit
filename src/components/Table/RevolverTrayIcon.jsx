import React from 'react';

/**
 * RevolverTrayIcon renders a 6-chamber revolver cylinder / bullet tray icon.
 * Dynamically updates as chambers/bullets are used (loaded = white cartridge casing, spent = dark empty hole).
 */
export const RevolverTrayIcon = ({ 
  chambersRemaining = 6, 
  isAlive = true, 
  className = 'w-4 h-4' 
}) => {
  const currentChambers = isAlive ? Math.max(0, Math.min(6, chambersRemaining)) : 0;
  const totalChambers = 6;
  const radius = 8.8;
  const center = 16;

  return (
    <svg 
      viewBox="0 0 32 32" 
      className={`${className} flex-shrink-0 select-none transition-all duration-300`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${currentChambers} of 6 chambers remaining`}
    >
      {/* Outer Revolver Cylinder Drum */}
      <circle 
        cx={center} 
        cy={center} 
        r="14.5" 
        fill="#0d0d0d" 
        stroke="rgba(255, 255, 255, 0.4)" 
        strokeWidth="1.2" 
      />

      {/* Subtle Inner Groove Line */}
      <circle 
        cx={center} 
        cy={center} 
        r="13.2" 
        fill="none" 
        stroke="rgba(255, 255, 255, 0.08)" 
        strokeWidth="0.8" 
        strokeDasharray="2 2" 
      />

      {/* 6 Radial Chambers (Loaded vs Spent) */}
      {Array.from({ length: totalChambers }).map((_, idx) => {
        const angleRad = (idx * 60 * Math.PI) / 180;
        const cx = center + radius * Math.sin(angleRad);
        const cy = center - radius * Math.cos(angleRad);
        const isLive = idx < currentChambers;

        return (
          <g key={idx}>
            {/* Chamber Cavity Hole */}
            <circle
              cx={cx}
              cy={cy}
              r="2.8"
              fill={isLive ? '#ffffff' : '#050505'}
              stroke={isLive ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.2)'}
              strokeWidth="0.8"
              className="transition-colors duration-300"
            />
            {/* Bullet Primer / Center Pin Dot */}
            {isLive ? (
              <circle cx={cx} cy={cy} r="0.9" fill="#000000" />
            ) : (
              <circle cx={cx} cy={cy} r="0.7" fill="rgba(255, 255, 255, 0.1)" />
            )}
          </g>
        );
      })}

      {/* Center Cylinder Pin / Ejector Rod Star */}
      <circle 
        cx={center} 
        cy={center} 
        r="3.2" 
        fill="#000000" 
        stroke="rgba(255, 255, 255, 0.6)" 
        strokeWidth="1.1" 
      />
      <circle 
        cx={center} 
        cy={center} 
        r="1.2" 
        fill="#ffffff" 
      />
    </svg>
  );
};

export default RevolverTrayIcon;

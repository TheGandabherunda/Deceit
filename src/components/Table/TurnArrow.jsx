import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useNostr } from '../../context/NostrContext';
import { getSeatLayout } from './useTableGaze';

export const TurnArrow = () => {
  const { pubkey } = useNostr();
  const { gameState, activePlayerPk, players, isRouletteActive, soleSurvivor } = useGame();

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  const [isLaptop, setIsLaptop] = useState(
    typeof window !== 'undefined' ? (window.innerWidth >= 768 && (window.innerHeight <= 860 || (window.innerWidth <= 1440 && window.innerHeight <= 900))) : false
  );

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsMobile(w < 640);
      setIsLaptop(w >= 768 && (h <= 860 || (w <= 1440 && h <= 900)));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (gameState !== 'playing' || !activePlayerPk || isRouletteActive || soleSurvivor) {
    return null;
  }

  // Determine vector from center (0, 0) towards the active player's seat
  let x = 0;
  let y = 1; // Default to local player (bottom)

  if (activePlayerPk === pubkey) {
    // Local player is at bottom center (0, 1.0)
    x = 0;
    y = 1;
  } else {
    const opponents = players.filter((p) => p.pk !== pubkey);
    const layout = getSeatLayout(opponents);
    const seat = layout.seats?.find((s) => s.player?.pk === activePlayerPk);
    if (seat?.pos) {
      x = seat.pos.x;
      y = seat.pos.y;
    }
  }

  const len = Math.sqrt(x * x + y * y) || 1;
  const normX = x / len;
  const normY = y / len;

  // Rotation angle in degrees:
  // Default base SVG points DOWN (along +Y).
  // Math.atan2(normX, normY) in radians, multiplied by 180 / PI gives exact clockwise rotation from +Y.
  const angleDeg = Math.round(Math.atan2(normX, normY) * (180 / Math.PI));

  // Distance from center of card stack (90x126 mobile, 82x115 laptop, 104x145 desktop)
  const dx = isMobile ? 66 : (isLaptop ? 62 : 76);
  const dy = isMobile ? 84 : (isLaptop ? 74 : 96);

  const offsetX = Math.round(normX * dx);
  const offsetY = Math.round(normY * dy);

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-30"
      aria-hidden="true"
    >
      <div
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px) rotate(${angleDeg}deg)`,
          transition: 'transform 0.42s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.25s ease'
        }}
        className="flex items-center justify-center"
      >
        {/* Triangle with rounded corners */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.85)] animate-pulse" 
          fill="currentColor"
        >
          <path d="M10.29 19.29a2 2 0 0 0 3.42 0l7.29-12.63A2 2 0 0 0 19.29 3.66H4.71a2 2 0 0 0-1.71 3l7.29 12.63z" />
        </svg>
      </div>
    </div>
  );
};

export default TurnArrow;

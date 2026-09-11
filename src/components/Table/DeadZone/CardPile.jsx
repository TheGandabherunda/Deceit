import React from 'react';
import { CardView } from '../CardView';

export const CardPile = ({ pileCount = 0 }) => {
  return (
    <div className="flex flex-col items-center select-none">
      {/* Card stack - responsive container matching card dimensions */}
      <div className="relative table-playing-card">
        {pileCount === 0 ? (
          <div className="absolute inset-0 border border-dashed border-white/10 rounded-xl flex items-center justify-center">
            <span className="text-white/25 text-xs font-mono">Empty</span>
          </div>
        ) : (
          <>
            {/* Layer 3 — back card, visible when 3+ cards */}
            {pileCount > 2 && (
              <div
                className="absolute inset-0"
                style={{ transform: 'translateX(-6px) translateY(5px) rotate(-5deg)', zIndex: 0 }}
              >
                <CardView faceDown className="!w-full !h-full" />
              </div>
            )}

            {/* Layer 2 — mid card, visible when 2+ cards */}
            {pileCount > 1 && (
              <div
                className="absolute inset-0"
                style={{ transform: 'translateX(5px) translateY(4px) rotate(4.5deg)', zIndex: 1 }}
              >
                <CardView faceDown className="!w-full !h-full" />
              </div>
            )}

            {/* Layer 1 — top card with count overlay */}
            <div
              className="absolute inset-0"
              style={{ transform: 'rotate(-1deg)', zIndex: 2 }}
            >
              <CardView faceDown className="!w-full !h-full" />
              {/* Count centered on top card */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white font-bold text-base font-mono drop-shadow-[0_1px_6px_rgba(0,0,0,1)]">
                  {pileCount}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

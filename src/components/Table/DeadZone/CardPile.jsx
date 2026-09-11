import React from 'react';
import { CardView } from '../CardView';

export const CardPile = ({ pileCount = 0 }) => {
  return (
    <div className="flex flex-col items-center select-none relative">
      <div className="relative w-20 h-28 md:w-24 md:h-32 flex items-center justify-center">
        {pileCount === 0 ? (
          <div className="w-18 h-26 md:w-20 md:h-28 border border-dashed border-white/10 rounded-xl flex items-center justify-center p-2 text-center">
            <span className="text-white/30 text-xs font-mono">Empty</span>
          </div>
        ) : (
          <>
            {pileCount > 2 && (
              <div 
                className="absolute transition-transform z-0"
                style={{ transform: 'rotate(-6deg) translate(-3px, 2px)' }}
              >
                <CardView faceDown className="!w-18 !h-26 md:!w-20 md:!h-28 shadow-md bg-black" />
              </div>
            )}
            {pileCount > 1 && (
              <div 
                className="absolute transition-transform z-10"
                style={{ transform: 'rotate(5deg) translate(2px, -2px)' }}
              >
                <CardView faceDown className="!w-18 !h-26 md:!w-20 md:!h-28 shadow-lg bg-black" />
              </div>
            )}
            <div 
              className="absolute transition-transform z-20"
              style={{ transform: 'rotate(-1deg)' }}
            >
              <CardView faceDown className="!w-18 !h-26 md:!w-20 md:!h-28 shadow-2xl bg-black" />
            </div>
          </>
        )}
      </div>

      {/* Pile Badge */}
      <div className="mt-2 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 border border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span className="text-[11px] font-mono text-white font-medium">
          {pileCount} {pileCount === 1 ? 'Card' : 'Cards'}
        </span>
      </div>
    </div>
  );
};

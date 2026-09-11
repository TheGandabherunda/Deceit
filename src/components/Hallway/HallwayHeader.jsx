import React from 'react';
import { useNostr } from '../../context/NostrContext';

export const HallwayHeader = ({ onOpenPrivate, onOpenEditName, onOpenRules }) => {
  const { displayName } = useNostr();

  return (
    <header className="bg-black/40 backdrop-blur-xl p-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] shadow-sm flex items-center justify-between border-b border-white/10 shrink-0 z-40 relative md:h-[72px]">
      
      {/* Left: App Brand & Player Name Chip */}
      <div className="flex items-center gap-3 z-20">
        <div className="flex items-center gap-2.5 font-bold text-white tracking-wide text-2xl">
          <span className="font-serif">Deceit</span>
          {displayName && (
            <>
              <span className="text-white/30 font-bold select-none leading-none">•</span>
              <button
                type="button"
                onClick={onOpenEditName}
                title="Click to change name"
                className="font-bold tracking-wide text-white/70 hover:text-white px-2.5 py-0.5 rounded-full hover:bg-white/10 transition-colors text-sm font-sans"
              >
                {displayName}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right Controls: Rules & Private Table */}
      <div className="flex items-center gap-2.5 z-20">
        <button
          onClick={onOpenRules}
          title="Game Rules"
          className="text-white/50 hover:text-white transition-colors p-2 flex items-center justify-center rounded-full hover:bg-white/10"
        >
          <span className="material-symbols-rounded text-[20px]">help_outline</span>
        </button>

        <button 
          onClick={onOpenPrivate}
          className="bg-white/10 hover:bg-white/15 border border-white/20 text-white px-4 py-2 rounded-full font-bold transition-all items-center flex gap-1.5 text-xs uppercase tracking-wider shadow-md active:scale-95"
          title="Create or Join a Private Table"
        >
          <span className="material-symbols-rounded text-sm">lock</span>
          <span>Private Table</span>
        </button>
      </div>

    </header>
  );
};

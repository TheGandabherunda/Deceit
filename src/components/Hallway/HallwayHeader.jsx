import React from 'react';
import { useNostr } from '../../context/NostrContext';
import { useProfile } from '../../context/ProfileContext';
import { BloubAvatar } from '../Bloub/BloubAvatar';

export const HallwayHeader = ({ onOpenPrivate, onOpenEditName, onOpenRules }) => {
  const { isRelayConnected } = useNostr();
  const { profile, truncatedId, setIsProfileModalOpen } = useProfile();

  const handleOpenProfile = () => {
    setIsProfileModalOpen(true);
    if (onOpenEditName) onOpenEditName();
  };

  return (
    <header className="bg-black/40 backdrop-blur-xl p-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] shadow-sm flex items-center justify-between border-b border-white/10 shrink-0 z-40 relative md:h-[72px]">
      
      {/* Left: App Brand & Player Profile Chip */}
      <div className="flex items-center gap-3 z-20">
        <div className="flex items-center gap-2 font-bold text-white tracking-wide text-2xl">
          <span className="font-serif">Deceit</span>
          <span className="text-white/20 font-bold select-none leading-none hidden sm:inline">•</span>
        </div>

        {/* Player Profile Pill */}
        <button
          type="button"
          onClick={handleOpenProfile}
          title="Customize character & profile"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-sm group"
        >
          {/* Mini Bloub Avatar */}
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div 
              className="absolute inset-0 rounded-full blur-[2px] opacity-40 group-hover:opacity-70 transition-opacity"
              style={{ backgroundColor: profile.color }}
            />
            <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center border border-white/20 relative z-10">
              <BloubAvatar
                shape={profile.shape}
                color={profile.color}
                expression="idle"
                size={24}
              />
            </div>
          </div>

          {/* Player Name */}
          <span className="text-xs font-semibold text-white group-hover:text-white/90 transition-colors max-w-[110px] truncate">
            {profile.name || 'Player'}
          </span>

          {/* Truncated Unique ID */}
          <span className="hidden md:inline-block px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-mono text-white/40 group-hover:text-white/60 transition-colors">
            {truncatedId}
          </span>

          {/* Settings Icon */}
          <span className="material-symbols-rounded text-sm text-white/30 group-hover:text-white/70 transition-colors">
            tune
          </span>
        </button>
      </div>

      {/* Right Controls: Relay Status, Rules & Private Table */}
      <div className="flex items-center gap-2.5 z-20">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-mono text-white/40">
          <span className={`w-1.5 h-1.5 rounded-full ${isRelayConnected ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
          <span>{isRelayConnected ? 'Relay Active' : 'Connecting'}</span>
        </div>

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

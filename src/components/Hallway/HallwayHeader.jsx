import React from 'react';
import { useNostr } from '../../context/NostrContext';
import { useProfile } from '../../context/ProfileContext';
import { BloubAvatar } from '../Bloub/BloubAvatar';

export const HallwayHeader = ({ onOpenPrivate, onOpenRules, onOpenSettings, onOpenScoreboard, onOpenImprints }) => {
  const { isRelayConnected } = useNostr();
  const { profile, truncatedId, setIsProfileModalOpen } = useProfile();

  const handleOpenProfile = () => {
    setIsProfileModalOpen(true);
  };

  return (
    <header className="bg-black/40 backdrop-blur-xl p-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] shadow-sm flex items-center justify-between border-b border-white/10 shrink-0 z-40 relative md:h-[72px]">
      
      {/* Left: App Brand & Player Profile Chip */}
      <div className="flex items-center gap-3 z-20">
        <button
          type="button"
          onClick={onOpenImprints}
          className="flex items-center gap-2 font-bold text-white tracking-wide text-2xl cursor-pointer hover:opacity-80 transition-opacity"
          title="Imprints & Open Source Credits"
        >
          <span className="font-serif">Deceit</span>
          <span className="text-white/20 font-bold select-none leading-none hidden sm:inline">•</span>
        </button>

        {/* Player Profile (Bloub & Name only, no background, no padding, no stroke, no ID, no icon) */}
        <button
          type="button"
          onClick={handleOpenProfile}
          title="Customize character & profile"
          className="flex items-center gap-2.5 transition-opacity cursor-pointer group hover:opacity-85 select-none"
        >
          {/* Bloub Avatar (increased size, no dropshadow) */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
            <BloubAvatar
              shape={profile.shape}
              color={profile.color}
              expression="idle"
              size={38}
            />
          </div>

          {/* Player Name */}
          <span className="text-sm font-semibold text-white group-hover:text-white/80 transition-colors max-w-[130px] truncate">
            {profile.name || 'Player'}
          </span>
        </button>
      </div>

      {/* Right Controls: Scoreboard, Rules, Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2 z-20">
        <button
          onClick={onOpenScoreboard}
          title="Global Scoreboard"
          className="text-white/50 hover:text-white transition-colors p-2 flex items-center justify-center rounded-full hover:bg-white/10 cursor-pointer"
        >
          <span className="material-symbols-rounded text-[20px]">leaderboard</span>
        </button>

        <button
          onClick={onOpenRules}
          title="Game Rules"
          className="text-white/50 hover:text-white transition-colors p-2 flex items-center justify-center rounded-full hover:bg-white/10 cursor-pointer"
        >
          <span className="material-symbols-rounded text-[20px]">help_outline</span>
        </button>

        <button
          onClick={onOpenSettings}
          title="Audio Settings"
          className="text-white/50 hover:text-white transition-colors p-2 flex items-center justify-center rounded-full hover:bg-white/10 cursor-pointer"
        >
          <span className="material-symbols-rounded text-[20px]">settings</span>
        </button>
      </div>

    </header>
  );
};

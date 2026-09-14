import React, { useState, useEffect, useRef } from 'react';
import { useNostr } from '../../context/NostrContext';
import { useProfile } from '../../context/ProfileContext';
import { BloubAvatar } from '../Bloub/BloubAvatar';

export const HallwayHeader = ({ onOpenPrivate, onOpenRules, onOpenSettings, onOpenScoreboard, onOpenImprints }) => {
  const { isRelayConnected } = useNostr();
  const { profile, truncatedId, setIsProfileModalOpen } = useProfile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

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

      {/* Right Controls (Desktop: Directly visible buttons; Mobile: Single 'More' button with dropdown) */}
      <div className="z-20">
        {/* Desktop Controls (Unchanged) */}
        <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
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

        {/* Mobile: More Icon Button & Dropdown Menu */}
        <div className="sm:hidden relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(prev => !prev)}
            title="More Options"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <span className="material-symbols-rounded text-[22px]">more_vert</span>
          </button>

          {isMenuOpen && (
            <div 
              ref={menuRef}
              className="absolute right-0 top-11 w-44 rounded-2xl bg-[#121212]/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-1.5 flex flex-col gap-1 z-50 animate-fade-in"
            >
              <button
                type="button"
                onClick={() => { setIsMenuOpen(false); onOpenScoreboard(); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-white/90 text-sm font-medium transition-colors text-left cursor-pointer"
              >
                <span className="material-symbols-rounded text-lg text-amber-400">leaderboard</span>
                <span>Scoreboard</span>
              </button>
              <button
                type="button"
                onClick={() => { setIsMenuOpen(false); onOpenRules(); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-white/90 text-sm font-medium transition-colors text-left cursor-pointer"
              >
                <span className="material-symbols-rounded text-lg text-blue-400">help_outline</span>
                <span>Game Rules</span>
              </button>
              <button
                type="button"
                onClick={() => { setIsMenuOpen(false); onOpenSettings(); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-white/90 text-sm font-medium transition-colors text-left cursor-pointer"
              >
                <span className="material-symbols-rounded text-lg text-purple-400">settings</span>
                <span>Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>

    </header>
  );
};

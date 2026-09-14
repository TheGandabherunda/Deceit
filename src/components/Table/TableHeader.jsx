import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { useNostr } from '../../context/NostrContext';
import { useProfile } from '../../context/ProfileContext';
import { BloubAvatar } from '../Bloub/BloubAvatar';

export const TableHeader = ({ onOpenRules, onOpenSettings, onOpenScoreboard }) => {
  const { roomCode, isHost, isPublic, togglePublic, players, roundNumber, gameState, startGame, leaveRoom, isStartAudioPlaying, tableTarget } = useGame();
  const { pubkey } = useNostr();
  const { profile, truncatedId, setIsProfileModalOpen } = useProfile();
  const [copied, setCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
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

  const me = players.find(p => p.pk === pubkey);
  const isAlive = me ? me.isAlive : true;

  const copyRoomCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const targetName = 
    tableTarget === 'K' ? "King's Table" : 
    tableTarget === 'Q' ? "Queen's Table" : 
    "Ace's Table";

  return (
    <header className="bg-black/40 backdrop-blur-xl px-3 sm:px-4 py-2 border-b border-white/10 flex items-center justify-between z-40 relative h-14 sm:h-16 shrink-0">
      {/* Left: App Brand & Player Profile Chip */}
      <div className="flex items-center gap-2 sm:gap-3 z-20">
        <div className="flex items-center gap-2 font-bold text-white tracking-wide text-xl sm:text-2xl">
          <span className="font-serif">Deceit</span>
          <span className="text-white/20 font-bold select-none leading-none hidden sm:inline">•</span>
        </div>

        {/* Player Profile (Bloub & Name only) */}
        <button
          type="button"
          onClick={() => setIsProfileModalOpen(true)}
          title="Customize character & profile"
          className="flex items-center gap-2 transition-opacity cursor-pointer group hover:opacity-85 select-none"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
            <BloubAvatar
              shape={profile.shape}
              color={profile.color}
              expression={!isAlive ? 'dead' : 'idle'}
              size={36}
            />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-white/80 transition-colors max-w-[90px] sm:max-w-[130px] truncate">
            {profile.name || 'Player'}
          </span>
        </button>
        
        {/* Room Code Badge - ONLY VISIBLE IN PRIVATE ROOMS ON DESKTOP */}
        {!isPublic && (
          <>
            <div className="h-4 w-[1px] bg-white/20 hidden md:inline" />
            <button
              onClick={copyRoomCode}
              className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-white font-mono text-xs transition-all border border-white/10 active:scale-95 cursor-pointer"
              title="Click to copy private room code"
            >
              <span className="opacity-60 text-[10px]">ROOM</span>
              <span className="font-bold tracking-widest">{roomCode || '----'}</span>
              <span className="material-symbols-rounded text-[14px] opacity-70">
                {copied ? 'check' : 'content_copy'}
              </span>
            </button>
          </>
        )}
      </div>

      {/* Middle: Round Info or Lobby Start */}
      <div className="flex items-center gap-2 sm:gap-3">
        {gameState === 'lobby' ? (
          <div className="text-[11px] sm:text-xs font-mono text-white/50">
            Lobby: <strong className="text-white">{players.filter(p => p.isReady).length}/{players.length} Ready</strong>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <span 
              className="text-sm sm:text-base md:text-lg text-white font-normal"
              style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}
            >
              {targetName}
            </span>
            <span className="text-white/20 select-none">•</span>
            <span className="text-[11px] sm:text-xs text-white/60 font-mono">
              Round <strong className="text-white font-bold">{roundNumber}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Right Controls: Desktop full row, Mobile single 'More' button with dropdown */}
      <div className="z-20">
        {/* Desktop Controls (Unchanged) */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onOpenScoreboard}
            className="text-white/50 hover:text-white transition-colors p-2 flex items-center justify-center rounded-full hover:bg-white/10 cursor-pointer"
            title="Global Scoreboard"
          >
            <span className="material-symbols-rounded text-[20px]">
              leaderboard
            </span>
          </button>

          <button
            onClick={onOpenRules}
            className="text-white/50 hover:text-white transition-colors p-2 flex items-center justify-center rounded-full hover:bg-white/10 cursor-pointer"
            title="Game Rules"
          >
            <span className="material-symbols-rounded text-[20px]">
              help_outline
            </span>
          </button>

          <button
            onClick={onOpenSettings}
            className="text-white/50 hover:text-white transition-colors p-2 flex items-center justify-center rounded-full hover:bg-white/10 cursor-pointer"
            title="Settings"
          >
            <span className="material-symbols-rounded text-[20px]">
              settings
            </span>
          </button>

          <button
            onClick={leaveRoom}
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition-all active:scale-95 cursor-pointer ml-1"
          >
            Leave
          </button>
        </div>

        {/* Mobile: More Icon Button & Options Menu */}
        <div className="md:hidden relative">
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
              className="absolute right-0 top-11 w-48 rounded-2xl bg-[#121212]/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-1.5 flex flex-col gap-1 z-50 animate-fade-in"
            >
              {!isPublic && roomCode && (
                <button
                  type="button"
                  onClick={copyRoomCode}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono transition-colors text-left cursor-pointer border border-white/10"
                >
                  <span className="opacity-70">Room: <strong>{roomCode}</strong></span>
                  <span className="material-symbols-rounded text-sm">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                </button>
              )}

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

              <div className="h-[1px] bg-white/10 my-0.5" />

              <button
                type="button"
                onClick={() => { setIsMenuOpen(false); leaveRoom(); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-500/20 text-rose-400 text-sm font-medium transition-colors text-left cursor-pointer"
              >
                <span className="material-symbols-rounded text-lg text-rose-400">logout</span>
                <span>Leave Table</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

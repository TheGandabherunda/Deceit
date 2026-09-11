import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useProfile } from '../../context/ProfileContext';
import { BloubAvatar } from '../Bloub/BloubAvatar';

export const TableHeader = ({ onOpenRules, onOpenSettings }) => {
  const { roomCode, isHost, isPublic, togglePublic, players, roundNumber, gameState, startGame, leaveRoom, isStartAudioPlaying, tableTarget } = useGame();
  const { profile, truncatedId, setIsProfileModalOpen } = useProfile();
  const [copied, setCopied] = useState(false);

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
      {/* Left: App Brand & Player Profile Chip (Identical to Home Screen) */}
      <div className="flex items-center gap-3 z-20">
        <div className="flex items-center gap-2 font-bold text-white tracking-wide text-2xl">
          <span className="font-serif">Deceit</span>
          <span className="text-white/20 font-bold select-none leading-none hidden sm:inline">•</span>
        </div>

        {/* Player Profile (Bloub & Name only, same as home screen) */}
        <button
          type="button"
          onClick={() => setIsProfileModalOpen(true)}
          title="Customize character & profile"
          className="flex items-center gap-2.5 transition-opacity cursor-pointer group hover:opacity-85 select-none"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
            <BloubAvatar
              shape={profile.shape}
              color={profile.color}
              expression="idle"
              size={38}
            />
          </div>
          <span className="text-sm font-semibold text-white group-hover:text-white/80 transition-colors max-w-[130px] truncate">
            {profile.name || 'Player'}
          </span>
        </button>
        
        {/* Room Code Badge - ONLY VISIBLE IN PRIVATE ROOMS */}
        {!isPublic && (
          <>
            <div className="h-4 w-[1px] bg-white/20 hidden md:inline" />
            <button
              onClick={copyRoomCode}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-white font-mono text-xs transition-all border border-white/10 active:scale-95 cursor-pointer"
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
      <div className="flex items-center gap-3">
        {gameState === 'lobby' ? (
          <div className="text-xs font-mono text-white/50">
            Lobby: <strong className="text-white">{players.filter(p => p.isReady).length}/{players.length} Ready</strong>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <span 
              className="text-base sm:text-lg text-white font-normal"
              style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}
            >
              {targetName}
            </span>
            <span className="text-white/20 select-none">•</span>
            <span className="text-xs text-white/60 font-mono">
              Round <strong className="text-white font-bold">{roundNumber}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Right: Rules, Settings & Leave */}
      <div className="flex items-center gap-2 z-20">
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
    </header>
  );
};

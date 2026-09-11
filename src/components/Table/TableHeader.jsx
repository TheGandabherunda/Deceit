import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useProfile } from '../../context/ProfileContext';
import { sound } from '../../services/sound';
import { RulesModal } from '../Hallway/RulesModal';
import { SettingsModal } from '../Settings/SettingsModal';
import { BloubAvatar } from '../Bloub/BloubAvatar';

export const TableHeader = () => {
  const { roomCode, isHost, isPublic, togglePublic, players, roundNumber, gameState, startGame, leaveRoom, isStartAudioPlaying } = useGame();
  const { profile, truncatedId, setIsProfileModalOpen } = useProfile();
  const [copied, setCopied] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const copyRoomCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-black/40 backdrop-blur-xl px-4 py-3 border-b border-white/10 flex items-center justify-between z-40 relative">
      {/* Left: Brand & Room Code */}
      <div className="flex items-center gap-3">
        <span className="font-serif font-black tracking-tight text-base text-white">
          DECEIT
        </span>
        <div className="h-4 w-[1px] bg-white/20" />
        
        {/* Room Code Badge - ONLY VISIBLE IN PRIVATE ROOMS */}
        {!isPublic ? (
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
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] text-white/70 font-mono text-xs border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wider uppercase text-[10px] font-bold">Public Match</span>
          </div>
        )}
      </div>

      {/* Middle: Round Info or Lobby Start */}
      <div className="flex items-center gap-3">
        {gameState === 'lobby' ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-white/70">
              <span className={`w-1.5 h-1.5 rounded-full ${players.length >= 2 && players.every(p => p.isReady) ? 'bg-emerald-400 animate-ping' : 'bg-white/40 animate-pulse'}`} />
              <span>
                Lobby: <strong className="text-white">{players.filter(p => p.isReady).length}/{players.length} Ready</strong>
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/60 font-mono">
              Round <strong className="text-white font-bold">{roundNumber}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Right: Player Profile, Rules, Sound & Leave */}
      <div className="flex items-center gap-2">
        {/* Player Profile (Bloub & Name only, no background, no padding, no stroke, no icon) */}
        <button
          type="button"
          onClick={() => setIsProfileModalOpen(true)}
          title="Customize character & profile"
          className="flex items-center gap-2 transition-opacity cursor-pointer group hover:opacity-85 mr-1 select-none"
        >
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <BloubAvatar
              shape={profile.shape}
              color={profile.color}
              expression="idle"
              size={32}
            />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-white/80 transition-colors max-w-[90px] truncate hidden sm:inline">
            {profile.name || 'Player'}
          </span>
        </button>

        <button
          onClick={() => setIsRulesOpen(true)}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center text-xs transition-colors"
          title="Game Rules"
        >
          <span className="material-symbols-rounded text-[18px]">
            menu_book
          </span>
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
          title="Settings"
        >
          <span className="material-symbols-rounded text-[18px]">
            settings
          </span>
        </button>

        <button
          onClick={leaveRoom}
          className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          Leave
        </button>
      </div>

      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
};

import React from 'react';
import { CardView } from './CardView';
import { PlayerGunBadge } from './PlayerGunBadge';
import { useGame } from '../../context/GameContext';
import { BloubAvatar } from '../Bloub/BloubAvatar';

export const OpponentSeat = ({ 
  player, 
  isActiveTurn = false, 
  lastAction = null,
  expression = 'idle',
  gazeTarget = null,
  directGaze = null,
  isFocusTarget = false
}) => {
  const { gameState, disconnectedPeer } = useGame();
  const { name, isAlive, cardCount, isHost, color = '#3b93f0', shape = 'cercle' } = player;

  const isLobby = gameState === 'lobby';
  const isDisconnected = disconnectedPeer?.pk === player.pk;

  return (
    <div className="flex flex-col items-center select-none transition-all duration-300 relative group">
      {/* Speech / Action Bubble */}
      {lastAction && (
        <div className="absolute -top-10 bg-black/90 border border-white/20 px-3 py-1 rounded-full text-xs font-mono text-white shadow-2xl whitespace-nowrap animate-bounce z-30">
          {lastAction}
        </div>
      )}

      {/* Disconnection Warning Badge */}
      {isDisconnected && (
        <div className="absolute -top-8 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono flex items-center gap-1 animate-pulse z-30 shadow-lg">
          <span className="material-symbols-rounded text-[12px]">wifi_off</span>
          <span>Reconnecting... ({disconnectedPeer.countdown}s)</span>
        </div>
      )}

      {/* Animated Bloub Character Avatar */}
      <div className={`relative mb-1 transition-all duration-300 ${!isAlive ? 'opacity-70' : ''}`}>
        <BloubAvatar
          shape={shape}
          color={color}
          expression={!isAlive ? 'dead' : expression}
          gazeTarget={gazeTarget}
          directGaze={directGaze}
          isFocusTarget={isFocusTarget}
          size={78}
          className="drop-shadow-xl"
        />

        {/* Eliminated badge corner pill */}
        {!isAlive && (
          <div className="absolute -bottom-1 -right-1 bg-black/80 border border-white/20 rounded-full p-1 shadow-md pointer-events-none">
            <span className="material-symbols-rounded text-xs text-rose-400 block leading-none">
              skull
            </span>
          </div>
        )}
      </div>

      {/* Cards fan: No covered cards in beginning or lobby; show actual hand cards once dealt */}
      <div className="h-14 flex items-center justify-center -space-x-7 mb-1.5 overflow-visible">
        {isLobby ? (
          <div className="h-12 flex items-center justify-center text-[10px] font-mono uppercase tracking-wider">
            {player.isReady ? (
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ready
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-white/40 bg-white/[0.03] px-2.5 py-0.5 rounded-full border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                Not Ready
              </span>
            )}
          </div>
        ) : isAlive && cardCount > 0 ? (
          Array.from({ length: Math.min(cardCount, 5) }).map((_, idx) => {
            const rot = (idx - (cardCount - 1) / 2) * 8;
            return (
              <div
                key={idx}
                className="transition-transform"
                style={{ transform: `rotate(${rot}deg)`, zIndex: idx }}
              >
                <CardView faceDown className="!w-9 !h-13 !rounded-lg shadow-xl bg-black" />
              </div>
            );
          })
        ) : (
          <div className="text-[11px] font-mono text-white/30 uppercase">
            {isAlive ? 'Hand Cleared' : 'Eliminated'}
          </div>
        )}
      </div>

      {/* Opponent Info Badge */}
      <div 
        className={`px-3 py-1.5 rounded-full flex items-center gap-2.5 transition-all ${
          isActiveTurn 
            ? 'bg-white/10 border border-white/40 shadow-[0_0_18px_rgba(255,255,255,0.25)] scale-105' 
            : 'bg-white/[0.04] border border-white/10'
        } ${!isAlive ? 'opacity-40 grayscale' : ''}`}
      >
        {/* Name & Details */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-white max-w-[95px] truncate">
              {name}
            </span>
            {isHost && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/15 text-white/80 font-mono">
                Host
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-white/40">
            {isLobby ? 'Ready' : isAlive ? `${cardCount} cards` : 'Dead'}
          </span>
        </div>

        {/* Personal Gun Badge */}
        <PlayerGunBadge 
          chambersRemaining={player.chambersRemaining !== undefined ? player.chambersRemaining : 6} 
          isAlive={isAlive} 
        />

        {/* Turn indicator light */}
        {isActiveTurn && isAlive && !isLobby && (
          <div className="w-2 h-2 rounded-full bg-white animate-ping ml-0.5" />
        )}
      </div>
    </div>
  );
};

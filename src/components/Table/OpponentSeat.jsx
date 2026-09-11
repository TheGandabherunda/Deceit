import React from 'react';
import { CardView } from './CardView';
import { PlayerGunBadge } from './PlayerGunBadge';
import { useGame } from '../../context/GameContext';

export const OpponentSeat = ({ player, isActiveTurn = false, lastAction = null }) => {
  const { gameState, isStartAudioPlaying, disconnectedPeer } = useGame();
  const { name, isAlive, cardCount, isHost } = player;

  const isLobby = gameState === 'lobby';
  const isDisconnected = disconnectedPeer?.pk === player.pk;

  return (
    <div className="flex flex-col items-center select-none transition-all duration-300 relative">
      {/* Speech / Action Bubble */}
      {lastAction && (
        <div className="absolute -top-9 bg-black/90 border border-white/20 px-3 py-0.5 rounded-full text-xs font-mono text-white shadow-xl whitespace-nowrap animate-bounce z-20">
          {lastAction}
        </div>
      )}

      {/* Disconnection Warning Badge */}
      {isDisconnected && (
        <div className="absolute -top-7 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono flex items-center gap-1 animate-pulse z-20 shadow-lg">
          <span className="material-symbols-rounded text-[12px]">wifi_off</span>
          <span>Reconnecting... ({disconnectedPeer.countdown}s)</span>
        </div>
      )}

      {/* Cards fan: No covered cards in beginning or lobby; show actual hand cards once dealt */}
      <div className="h-16 flex items-center justify-center -space-x-8 mb-2 overflow-visible">
        {isLobby ? (
          <div className="h-14 flex items-center justify-center text-[10px] font-mono uppercase tracking-wider">
            {player.isReady ? (
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ready
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-white/40 bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/10">
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
                <CardView faceDown className="!w-10 !h-14 !rounded-lg shadow-xl bg-black" />
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
            ? 'bg-white/10 border border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105' 
            : 'bg-white/[0.04] border border-white/10'
        } ${!isAlive ? 'opacity-40 grayscale' : ''}`}
      >
        {/* Avatar */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-serif text-xs font-bold ${
          isAlive ? 'bg-white text-black' : 'bg-white/10 text-white/40'
        }`}>
          {isAlive ? (name ? name.substring(0, 2).toUpperCase() : '??') : '☠'}
        </div>

        {/* Name & Details */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-white max-w-[90px] truncate">
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

        {/* Dominance Score Chip */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-[10px] font-bold" title="Dominance Score">
          <span className="material-symbols-rounded text-[11px]">bolt</span>
          <span>{player.dominanceScore ?? 0}</span>
        </div>

        {/* Turn indicator light */}
        {isActiveTurn && isAlive && !isLobby && (
          <div className="w-2 h-2 rounded-full bg-white animate-ping ml-0.5" />
        )}
      </div>
    </div>
  );
};

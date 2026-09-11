import React from 'react';
import { CardView } from './CardView';
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
  const { name, isAlive, cardCount, color = '#3b93f0', shape = 'cercle' } = player;

  const isLobby = gameState === 'lobby';
  const isDisconnected = disconnectedPeer?.pk === player.pk;

  return (
    <div className="flex flex-col items-center select-none transition-all duration-300 relative group">
      {/* Speech / Action Bubble */}
      {lastAction && (
        <div className="absolute -top-8 bg-black/90 border border-white/20 px-3 py-1 rounded-full text-xs font-mono text-white shadow-2xl whitespace-nowrap animate-bounce z-30">
          {lastAction}
        </div>
      )}

      {/* Disconnection Warning Badge */}
      {isDisconnected && (
        <div className="absolute -top-7 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono flex items-center gap-1 animate-pulse z-30 shadow-lg">
          <span className="material-symbols-rounded text-[12px]">wifi_off</span>
          <span>Reconnecting... ({disconnectedPeer.countdown}s)</span>
        </div>
      )}

      {/* 1. Just Player Name ABOVE Bloub */}
      <span className={`text-xs font-semibold text-white max-w-[120px] truncate mb-1 transition-opacity ${!isAlive ? 'opacity-40' : ''}`}>
        {name}
      </span>

      {/* 2. Increased Bloub Character Avatar & Bullet Count to the Right */}
      <div className="flex items-center justify-center relative mb-0.5">
        <div className={`relative transition-all duration-300 ${!isAlive ? 'opacity-70' : ''}`}>
          <BloubAvatar
            shape={shape}
            color={color}
            expression={!isAlive ? 'dead' : expression}
            gazeTarget={gazeTarget}
            directGaze={directGaze}
            isFocusTarget={isFocusTarget}
            size={156}
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

        {/* Bullet count RIGHT to the bloub - clean text with bullet icon, no pill container or extra indicator */}
        {isAlive && (
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-white/70 font-mono text-xs whitespace-nowrap select-none pointer-events-none">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-white/80" fill="currentColor">
              <path d="M12 2C9.8 2 8 4 8 7.5V17C8 18.1 8.9 19 10 19H14C15.1 19 16 18.1 16 17V7.5C16 4 14.2 2 12 2ZM10 20.5C10 20.2 10.2 20 10.5 20H13.5C13.8 20 14 20.2 14 20.5V21.5C14 21.8 13.8 22 13.5 22H10.5C10.2 22 10 21.8 10 21.5V20.5Z" />
            </svg>
            <span className="font-semibold">{player.chambersRemaining !== undefined ? player.chambersRemaining : 6}/6</span>
          </div>
        )}
      </div>

      {/* 3. Cards fan underneath */}
      <div className="h-10 flex items-center justify-center -space-x-7 overflow-visible">
        {isLobby ? (
          <div className="h-7 flex items-center justify-center text-[10px] font-mono uppercase tracking-wider">
            {player.isReady ? (
              <span className="text-emerald-400 font-medium">
                Ready
              </span>
            ) : (
              <span className="text-white/40">
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
          <div className="text-[10px] font-mono text-white/30 uppercase">
            {isAlive ? 'Hand Cleared' : 'Eliminated'}
          </div>
        )}
      </div>
    </div>
  );
};

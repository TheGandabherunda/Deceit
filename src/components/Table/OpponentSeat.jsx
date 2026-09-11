import React, { useState, useEffect } from 'react';
import { CardView } from './CardView';
import { RevolverTrayIcon } from './RevolverTrayIcon';
import { useGame } from '../../context/GameContext';
import { BloubAvatar } from '../Bloub/BloubAvatar';

export const OpponentSeat = ({ 
  player, 
  isActiveTurn = false, 
  expression = 'idle',
  gazeTarget = null,
  directGaze = null,
  isFocusTarget = false
}) => {
  const { gameState, roundNumber, disconnectedPeer } = useGame();
  const { name, isAlive, cardCount, color = '#3b93f0', shape = 'cercle' } = player;

  const [bloubSize, setBloubSize] = useState(156);
  const [isLaptop, setIsLaptop] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const laptop = w >= 768 && (h <= 860 || (w <= 1440 && h <= 900));
      const mobile = w < 640;
      setIsLaptop(laptop);
      if (mobile) {
        setBloubSize(96);
      } else if (laptop) {
        setBloubSize(112);
      } else {
        setBloubSize(156);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isLobby = gameState === 'lobby';
  const isDisconnected = disconnectedPeer?.pk === player.pk;

  return (
    <div className="flex flex-col items-center select-none transition-all duration-300 relative group">

      {/* Disconnection Warning Badge */}
      {isDisconnected && (
        <div className="absolute -top-7 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono flex items-center gap-1 animate-pulse z-30 shadow-lg">
          <span className="material-symbols-rounded text-[12px]">wifi_off</span>
          <span>Reconnecting... ({disconnectedPeer.countdown}s)</span>
        </div>
      )}

      {/* 1. Player Name & Bullet Count ABOVE Bloub */}
      <div className="flex items-center gap-2 mb-1 text-xs font-mono text-white/80 select-none">
        <span 
          className={`font-semibold text-white max-w-[110px] sm:max-w-[130px] truncate ${!isAlive ? 'opacity-40' : ''}`}
          title={name}
        >
          {name}
        </span>
        <span className="text-white/30">•</span>
        <div className="flex items-center gap-1.5 text-white/70">
          <RevolverTrayIcon 
            chambersRemaining={player.chambersRemaining !== undefined ? player.chambersRemaining : 6} 
            isAlive={isAlive} 
            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
          />
          <span className="font-semibold">
            {isAlive ? `${player.chambersRemaining !== undefined ? player.chambersRemaining : 6}/6` : '0/6'}
          </span>
        </div>
      </div>

      {/* 2. Bloub Character Avatar - Responsively scaled on laptops */}
      <div className="flex items-center justify-center relative mb-0.5">
        <div className={`relative transition-all duration-300 ${!isAlive ? 'opacity-70' : ''}`}>
          <BloubAvatar
            shape={shape}
            color={color}
            expression={!isAlive ? 'dead' : expression}
            gazeTarget={gazeTarget}
            directGaze={directGaze}
            isFocusTarget={isFocusTarget}
            size={bloubSize}
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
      </div>

      {/* 3. Cards fan underneath - mirrored reverse fan with staggered deal animation */}
      <div className={`flex items-center justify-center overflow-visible mt-1 table-cards-overlap ${isLaptop ? 'h-[44px]' : 'h-[56px]'}`}>
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
            const count = Math.min(cardCount, 5);
            const center = (count - 1) / 2;
            const offset = idx - center;
            const rot = offset * (isLaptop ? 6 : 7);
            const arcY = offset * offset * (isLaptop ? 2.4 : 3.5);
            return (
              <div
                key={`${roundNumber}_opp_${idx}`}
                className="deal-anim-opponent transition-transform duration-200 ease-out"
                style={{ 
                  '--target-y': `${arcY}px`,
                  '--target-rot': `${rot}deg`,
                  transform: `translateY(${arcY}px) rotate(${rot}deg)`,
                  transformOrigin: 'center top',
                  zIndex: count - 1 - Math.round(Math.abs(offset)),
                  animationDelay: `${idx * 75}ms`
                }}
              >
                <CardView faceDown />
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

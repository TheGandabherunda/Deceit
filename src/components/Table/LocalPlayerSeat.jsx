import React, { useState, useEffect } from 'react';
import { CardView } from './CardView';
import { RevolverTrayIcon } from './RevolverTrayIcon';
import { BloubAvatar } from '../Bloub/BloubAvatar';
import { useGame } from '../../context/GameContext';
import { useNostr } from '../../context/NostrContext';
import { useProfile } from '../../context/ProfileContext';

export const LocalPlayerSeat = () => {
  const { pubkey } = useNostr();
  const { profile } = useProfile();
  const { 
    gameState,
    roundNumber,
    localHand, 
    selectedCardIds, 
    toggleCardSelection, 
    activePlayerPk, 
    players,
  } = useGame();

  const isMyTurn = activePlayerPk === pubkey;
  const me = players.find(p => p.pk === pubkey) || { isAlive: true, cardCount: localHand.length };

  const [isLaptop, setIsLaptop] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsLaptop(w >= 768 && (h <= 860 || (w <= 1440 && h <= 900)));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // LOBBY STATE RENDER
  if (gameState === 'lobby') {
    return (
      <div className="w-full flex flex-col items-center select-none pt-1 pb-2 z-20">
        <div className="flex items-center gap-2 text-xs font-mono text-white/70 select-none">
          <span className="font-semibold text-white">You</span>
          <span className="text-white/30">•</span>
          <span className={me.isReady ? 'text-emerald-400 font-bold' : 'text-white/40'}>
            {me.isReady ? 'Ready' : 'Not Ready'}
          </span>
        </div>
      </div>
    );
  }

  // ACTIVE PLAYING STATE RENDER
  return (
    <div className="w-full flex flex-col items-center select-none pt-0 pb-2 z-20">
      {/* Hand Cards (Face Up) - Hand Fan Stacking with Staggered Deal Distribution */}
      <div className="flex items-center justify-center table-cards-overlap overflow-visible pt-3 pb-1.5">
        {me.isAlive ? (
          localHand.length > 0 ? (
            localHand.map((card, idx) => {
              const isSelected = selectedCardIds.includes(card.id);
              const total = localHand.length;
              const center = (total - 1) / 2;
              const offset = idx - center;
              const rot = offset * (isLaptop ? 5.2 : 6);
              // Quadratic arc: center card at apex, outer cards dip smoothly
              const arcY = offset * offset * (isLaptop ? 2.1 : 3);
              const targetY = isSelected ? (isLaptop ? -18 : -24) : arcY;

              return (
                <div 
                  key={`${roundNumber}_${card.id}`} 
                  style={{ 
                    '--target-y': `${targetY}px`,
                    '--target-rot': `${isSelected ? 0 : rot}deg`,
                    transform: `translateY(${targetY}px) rotate(${isSelected ? 0 : rot}deg)`, 
                    transformOrigin: 'center bottom',
                    zIndex: idx,
                    animationDelay: `${idx * 75}ms`
                  }}
                  className="deal-anim-local transition-transform duration-200 ease-out"
                >
                  <CardView 
                    card={card}
                    isSelected={isSelected}
                    onClick={() => isMyTurn && toggleCardSelection(card.id)}
                  />
                </div>
              );
            })
          ) : (
            <div className="h-20 flex flex-col items-center justify-center text-white/60 font-mono text-xs gap-1">
              <span className="material-symbols-rounded text-2xl text-white/40">done_all</span>
              <span>All cards played this round!</span>
            </div>
          )
        ) : (
          <div className="h-24 flex items-center justify-center gap-3 text-white/70 animate-fade-in">
            <div className="opacity-75 transition-all">
              <BloubAvatar
                shape={me.shape || profile.shape || 'cercle'}
                color={me.color || profile.color || '#e8483f'}
                expression="dead"
                size={isLaptop ? 54 : 62}
              />
            </div>
            <div className="flex flex-col text-left font-mono">
              <span className="text-rose-400 font-bold text-xs uppercase tracking-wider">
                Eliminated
              </span>
              <span className="text-white/40 text-[11px] mt-0.5">
                Spectating match
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Local Player Reference at Bottom - Just like before */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-white/70 select-none mt-1">
        <span className="font-semibold text-white">You</span>
        <span className="text-white/30">•</span>
        <div className="flex items-center gap-1.5 text-white/80">
          <RevolverTrayIcon 
            chambersRemaining={me.chambersRemaining ?? 6} 
            isAlive={me.isAlive} 
            className="w-4 h-4 sm:w-4.5 sm:h-4.5"
          />
          <span className="font-semibold">{me.isAlive ? `${me.chambersRemaining ?? 6}/6` : '0/6'}</span>
        </div>
      </div>
    </div>
  );
};

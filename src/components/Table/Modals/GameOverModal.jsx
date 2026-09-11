import React, { useState, useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { useNostr } from '../../../context/NostrContext';
import { useProfile } from '../../../context/ProfileContext';
import { sound } from '../../../services/sound';
import { BloubAvatar } from '../../Bloub/BloubAvatar';

export const GameOverModal = () => {
  const { 
    soleSurvivor, 
    endGameReason, 
    players, 
    leaveRoom, 
    gameState,
    isRouletteActive
  } = useGame();
  const { pubkey } = useNostr();
  const { profile } = useProfile();

  const [hasDismissedSpectate, setHasDismissedSpectate] = useState(false);
  const [windowSize, setWindowSize] = useState({
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 640 : false,
    isLaptop: typeof window !== 'undefined' ? window.innerWidth >= 768 && (window.innerHeight <= 860 || (window.innerWidth <= 1440 && window.innerHeight <= 900)) : false,
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setWindowSize({
        isMobile: w < 640,
        isLaptop: w >= 768 && (h <= 860 || (w <= 1440 && h <= 900)),
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const me = players.find(p => p.pk === pubkey);
  const isAlive = me ? me.isAlive : true;

  // Reset spectate dismissal if entering lobby or revived
  useEffect(() => {
    if (gameState === 'lobby' || isAlive) {
      setHasDismissedSpectate(false);
    }
  }, [gameState, isAlive]);

  useEffect(() => {
    return () => {
      sound.stopWin();
      sound.stopFail();
    };
  }, []);

  // Modal Visibility Conditions
  const isGameOver = Boolean(soleSurvivor) || gameState === 'ended';
  const isEliminatedInProgress = !isGameOver && gameState === 'playing' && !isAlive && !isRouletteActive;

  // Do not overlap with ongoing gun roulette cinematic
  if (isRouletteActive) return null;

  // Nothing to display if game is ongoing and player is alive, or player already chose to spectate
  if (!isGameOver && (!isEliminatedInProgress || hasDismissedSpectate)) {
    return null;
  }

  // Determine state values
  const isWinner = soleSurvivor ? soleSurvivor.pk === pubkey : false;

  const avatarSize = windowSize.isMobile ? 190 : (windowSize.isLaptop ? 235 : 290);

  let displayShape = profile.shape || 'cercle';
  let displayColor = profile.color || '#3b93f0';

  if (isWinner && soleSurvivor) {
    displayShape = soleSurvivor.shape || (soleSurvivor.pk === pubkey ? profile.shape : 'cercle');
    displayColor = soleSurvivor.color || (soleSurvivor.pk === pubkey ? profile.color : '#3b93f0');
  } else if (me) {
    displayShape = me.shape || profile.shape || 'cercle';
    displayColor = me.color || profile.color || '#e8483f';
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[350] flex flex-col justify-between items-center py-8 sm:py-12 px-4 select-none animate-fade-in overflow-y-auto">
      {/* 1. TOP: Title & Subtitle */}
      <div className="flex flex-col items-center text-center mt-2 sm:mt-4 z-20">
        <h1
          className={`text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight ${
            isWinner 
              ? 'text-white drop-shadow-[0_4px_30px_rgba(251,191,36,0.35)]' 
              : (isEliminatedInProgress 
                  ? 'text-rose-400 drop-shadow-[0_4px_30px_rgba(244,63,94,0.35)]' 
                  : 'text-white drop-shadow-[0_4px_30px_rgba(255,255,255,0.2)]')
          }`}
          style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}
        >
          {isWinner 
            ? 'Victory' 
            : (isEliminatedInProgress ? 'Got Eliminated' : 'Defeat')}
        </h1>

        <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-white/50 mt-2 sm:mt-3">
          {isWinner 
            ? 'Table Champion' 
            : (isEliminatedInProgress 
                ? 'Match Still In Progress' 
                : 'Eliminated from Table')}
        </span>
      </div>

      {/* 2. MIDDLE: Big Bloub with Head-Crown (Victory) or Pure Bloub (Defeat/Eliminated) */}
      <div className="flex flex-col items-center justify-center my-auto py-6 z-20">
        <div className="relative flex items-center justify-center">
          {/* Victory Crown: Sitting right on top of head, tilted slightly to the right */}
          {isWinner && (
            <div 
              className="absolute z-20 pointer-events-none"
              style={{
                top: '-10%',
                right: '25%',
                transform: 'rotate(14deg)',
                transformOrigin: 'bottom center',
              }}
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="text-amber-400 drop-shadow-[0_4px_14px_rgba(251,191,36,0.55)]"
                style={{
                  width: `${Math.round(avatarSize * 0.38)}px`,
                  height: `${Math.round(avatarSize * 0.38)}px`
                }}
              >
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
              </svg>
            </div>
          )}

          {/* Just the Bloub Avatar (No floating rings, badges, or frames) */}
          <div className={`transition-all duration-300 ${!isWinner ? 'opacity-85' : ''}`}>
            <BloubAvatar
              shape={displayShape}
              color={displayColor}
              expression={isWinner ? 'victory' : 'dead'}
              size={avatarSize}
            />
          </div>
        </div>
      </div>

      {/* 3. BOTTOM: Actions */}
      <div className="w-full max-w-md flex flex-col items-center justify-center z-20 pb-2 sm:pb-4">
        {isEliminatedInProgress ? (
          /* Mid-game Elimination: Spectate or Close */
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
            <button
              type="button"
              onClick={() => setHasDismissedSpectate(true)}
              className="w-full sm:w-auto flex-1 h-12 bg-white hover:bg-white/90 text-black font-semibold rounded-full transition-all flex items-center justify-center text-sm shadow-2xl cursor-pointer active:scale-95 px-8"
            >
              Spectate
            </button>

            <button
              type="button"
              onClick={leaveRoom}
              className="w-full sm:w-auto flex-1 h-12 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full transition-all flex items-center justify-center text-sm border border-white/10 cursor-pointer active:scale-95 px-8"
            >
              Close
            </button>
          </div>
        ) : (
          /* Game Over (Victory or Defeat): ONLY Close button */
          <div className="flex items-center justify-center w-full max-w-xs">
            <button
              type="button"
              onClick={leaveRoom}
              className="w-full h-12 bg-white hover:bg-white/90 text-black font-semibold rounded-full transition-all flex items-center justify-center text-sm shadow-2xl cursor-pointer active:scale-95 px-8"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

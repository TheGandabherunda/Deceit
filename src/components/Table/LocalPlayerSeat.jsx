import React, { useState, useEffect } from 'react';
import { CardView } from './CardView';
import { useGame } from '../../context/GameContext';
import { useNostr } from '../../context/NostrContext';
import { sound } from '../../services/sound';

export const LocalPlayerSeat = () => {
  const { pubkey } = useNostr();
  const { 
    gameState,
    roomCode,
    isPublic,
    startGame,
    togglePlayerReady,
    localHand, 
    selectedCardIds, 
    toggleCardSelection, 
    playSelectedCards, 
    handleCallLiar, 
    handlePassEscape,
    activePlayerPk, 
    lastPlay, 
    players,
    tableTarget,
    actionBanner,
    soleSurvivor,
    isStartAudioPlaying,
    isRouletteActive,
    pendingReveal
  } = useGame();

  const [isCallingLiar, setIsCallingLiar] = useState(false);

  useEffect(() => {
    setIsCallingLiar(false);
  }, [lastPlay?.turnId, activePlayerPk, gameState]);

  const isMyTurn = activePlayerPk === pubkey;
  const me = players.find(p => p.pk === pubkey) || { isAlive: true, cardCount: localHand.length };
  const canCallLiar = isMyTurn && lastPlay && lastPlay.playerPk !== pubkey && !pendingReveal && !isRouletteActive && !isCallingLiar;
  const canPlayCards = isMyTurn && selectedCardIds.length >= 1 && selectedCardIds.length <= 3 && me.isAlive && !pendingReveal && !isRouletteActive && !isCallingLiar;

  const prevPlayer = lastPlay ? players.find(p => p.pk === lastPlay.playerPk) : null;
  const isOpponentHandEmptied = gameState === 'playing' && !soleSurvivor && !isRouletteActive && isMyTurn && prevPlayer && prevPlayer.isAlive && prevPlayer.pk !== pubkey && prevPlayer.cardCount === 0 && me.isAlive;
  const isMyHandEmptied = gameState === 'playing' && !soleSurvivor && !isRouletteActive && !isMyTurn && prevPlayer && prevPlayer.isAlive && prevPlayer.pk === pubkey && prevPlayer.cardCount === 0 && me.isAlive;

  const [challengeTimer, setChallengeTimer] = useState(12);

  useEffect(() => {
    if (gameState !== 'playing' || soleSurvivor || (!isOpponentHandEmptied && !isMyHandEmptied)) {
      setChallengeTimer(12);
      sound.stopChallengeTimer();
      return;
    }

    setChallengeTimer(12);

    // If opponent emptied their hand and it's my turn, start full 12s timer audio
    // When audio completes all 12 seconds, auto-execute pass escape if round is still active
    if (isOpponentHandEmptied) {
      sound.playChallengeTimer(() => {
        if (gameState !== 'playing') {
          console.log('[Deceit:Timer] Timer completed but game is no longer active. Suppressing pass escape.');
          return;
        }
        console.log('[Deceit:Timer] 12s challenge timer audio finished completely! Executing pass escape.');
        handlePassEscape(pubkey, prevPlayer?.pk);
      });
    }

    // 1-second interval for smooth visual countdown from 12 down to 0
    const timer = setInterval(() => {
      setChallengeTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      sound.stopChallengeTimer();
    };
  }, [gameState, soleSurvivor, isOpponentHandEmptied, isMyHandEmptied, pubkey, prevPlayer?.pk, handlePassEscape]);

  const targetName = tableTarget === 'A' ? 'Aces' : tableTarget === 'K' ? 'Kings' : 'Queens';

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
    <div className="w-full flex flex-col items-center select-none pt-0 pb-1 z-20">
      {/* Hand Cards (Face Up) */}
      <div className="flex items-center justify-center -space-x-4 sm:-space-x-6 md:-space-x-6 px-4 mb-2 max-w-full overflow-visible pt-4 pb-2">
        {me.isAlive ? (
          localHand.length > 0 ? (
            localHand.map((card, idx) => {
              const isSelected = selectedCardIds.includes(card.id);
              const rot = (idx - (localHand.length - 1) / 2) * 4;

              return (
                <div 
                  key={card.id} 
                  style={{ 
                    transform: `rotate(${isSelected ? 0 : rot}deg) ${isSelected ? 'translateY(-18px)' : ''}`, 
                    zIndex: isSelected ? 60 : idx 
                  }}
                  className="transition-all duration-200"
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
          <div className="h-20 flex flex-col items-center justify-center text-white/40">
            <span className="material-symbols-rounded text-2xl mb-1">skull</span>
            <span className="text-xs tracking-wider uppercase">Eliminated (Spectating)</span>
          </div>
        )}
      </div>

      {/* Action Controls & Local Player Reference */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {/* Local Player Reference - Clean, no bloub, no pill container */}
        <div className="flex items-center gap-2 text-xs font-mono text-white/70 select-none">
          <span className="font-semibold text-white">You</span>
          <span className="text-white/30">•</span>
          <div className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-white/80" fill="currentColor">
              <path d="M12 2C9.8 2 8 4 8 7.5V17C8 18.1 8.9 19 10 19H14C15.1 19 16 18.1 16 17V7.5C16 4 14.2 2 12 2ZM10 20.5C10 20.2 10.2 20 10.5 20H13.5C13.8 20 14 20.2 14 20.5V21.5C14 21.8 13.8 22 13.5 22H10.5C10.2 22 10 21.8 10 21.5V20.5Z" />
            </svg>
            <span className="font-semibold">{me.isAlive ? `${me.chambersRemaining ?? 6}/6` : '0/6'}</span>
          </div>
          {isMyTurn && me.isAlive && (
            <>
              <span className="text-white/30">•</span>
              <span className="text-[11px] font-bold text-white animate-pulse">
                Your Turn
              </span>
            </>
          )}
        </div>

        {/* Urgent Final Card Notification Banner */}
        {isOpponentHandEmptied && (
          <div className="w-full max-w-md mx-auto mb-2.5 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/20 text-white font-mono text-xs flex items-center justify-between shadow-2xl animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>{prevPlayer?.name || 'Opponent'} played their last card!</span>
            </div>
            <span className="text-[11px] text-white/70 font-bold font-mono">{challengeTimer}s to decide</span>
          </div>
        )}

        {isMyHandEmptied && (
          <div className="w-full max-w-md mx-auto mb-2.5 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/20 text-white font-mono text-xs flex items-center justify-between shadow-2xl animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>You played your last card! Challenger deciding...</span>
            </div>
            <span className="text-[11px] text-white/70 font-bold font-mono">{challengeTimer}s remaining</span>
          </div>
        )}

        {/* Action Buttons */}
        {me.isAlive && (
          <div className="flex items-center gap-3">
            {isOpponentHandEmptied ? (
              <>
                {/* Challenge Final Cards Button */}
                <button
                  disabled={isCallingLiar}
                  onClick={() => {
                    if (isCallingLiar) return;
                    setIsCallingLiar(true);
                    sound.stopChallengeTimer();
                    handleCallLiar(pubkey, lastPlay.playerPk, lastPlay.turnId, lastPlay.cardHashes);
                  }}
                  className="h-11 px-6 rounded-full bg-white hover:bg-white/90 disabled:opacity-30 disabled:pointer-events-none text-black font-bold text-xs uppercase tracking-wider transition-all shadow-xl flex items-center gap-1.5 animate-pulse"
                >
                  <span className="material-symbols-rounded text-sm">gavel</span>
                  <span>Call Liar! (Challenge)</span>
                </button>

                {/* Pass & Face the Gun Button */}
                <button
                  onClick={() => {
                    sound.stopChallengeTimer();
                    handlePassEscape(pubkey, prevPlayer?.pk);
                  }}
                  className="h-11 px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-rounded text-sm">radio_button_checked</span>
                  <span>Pass (Face Gun {challengeTimer}s)</span>
                </button>
              </>
            ) : (
              <>
                {/* Play Cards Button */}
                <button
                  onClick={() => {
                    sound.stopChallengeTimer();
                    playSelectedCards();
                  }}
                  disabled={!canPlayCards}
                  className="h-11 px-6 rounded-full bg-white hover:bg-white/90 disabled:opacity-20 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-1.5"
                >
                  <span>Play {selectedCardIds.length > 0 ? `${selectedCardIds.length} ` : ''}Cards</span>
                  {selectedCardIds.length > 0 && (
                    <span className="font-normal opacity-70">
                      (as {targetName})
                    </span>
                  )}
                </button>

                {/* Call Liar Button */}
                {canCallLiar && (
                  <button
                    disabled={!canCallLiar || isCallingLiar}
                    onClick={() => {
                      if (isCallingLiar) return;
                      setIsCallingLiar(true);
                      sound.stopChallengeTimer();
                      handleCallLiar(pubkey, lastPlay.playerPk, lastPlay.turnId, lastPlay.cardHashes);
                    }}
                    className="h-11 px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <span className="material-symbols-rounded text-sm">gavel</span>
                    <span>Call Liar!</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

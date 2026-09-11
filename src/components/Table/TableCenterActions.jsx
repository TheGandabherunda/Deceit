import React, { useState, useEffect } from 'react';
import { CardPile } from './DeadZone/CardPile';
import { TurnArrow } from './TurnArrow';
import { useGame } from '../../context/GameContext';
import { useNostr } from '../../context/NostrContext';
import { sound } from '../../services/sound';

export const TableCenterActions = () => {
  const { pubkey } = useNostr();
  const {
    gameState,
    pileCount,
    activePlayerPk,
    lastPlay,
    players,
    localHand,
    selectedCardIds,
    playSelectedCards,
    handleCallLiar,
    handlePassEscape,
    soleSurvivor,
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

    if (isOpponentHandEmptied) {
      sound.playChallengeTimer(() => {
        if (gameState !== 'playing') return;
        handlePassEscape(pubkey, prevPlayer?.pk);
      });
    }

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

  return (
    <div className="flex flex-col items-center justify-center relative w-full my-auto py-2">
      {/* Urgent Final Card Notification Banner */}
      {isOpponentHandEmptied && (
        <div className="mb-3 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/20 text-white font-mono text-xs flex items-center gap-3 shadow-2xl animate-pulse z-30">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>{prevPlayer?.name || 'Opponent'} played their last card!</span>
          <span className="text-[11px] text-white/70 font-bold font-mono">{challengeTimer}s to decide</span>
        </div>
      )}

      {isMyHandEmptied && (
        <div className="mb-3 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/20 text-white font-mono text-xs flex items-center gap-3 shadow-2xl animate-pulse z-30">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>You played your last card! Challenger deciding...</span>
          <span className="text-[11px] text-white/70 font-bold font-mono">{challengeTimer}s remaining</span>
        </div>
      )}

      {/* Row: [Play Cards (Left)]  [Card Pile + Turn Arrow (Center)]  [Call Liar (Right)] */}
      <div className="relative flex items-center justify-center gap-3 sm:gap-6 md:gap-8 w-full max-w-xl">
        {/* Left Action: Play Card Button or Pass */}
        <div className="flex-1 flex justify-end z-20">
          {me.isAlive && (
            isOpponentHandEmptied ? (
              <button
                type="button"
                onClick={() => {
                  sound.stopChallengeTimer();
                  handlePassEscape(pubkey, prevPlayer?.pk);
                }}
                className="h-10 sm:h-11 px-4 sm:px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-lg whitespace-nowrap"
              >
                <span className="material-symbols-rounded text-sm">radio_button_checked</span>
                <span>Pass ({challengeTimer}s)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sound.stopChallengeTimer();
                  playSelectedCards();
                }}
                disabled={!canPlayCards}
                className="h-10 sm:h-11 px-4 sm:px-6 rounded-full bg-white hover:bg-white/90 disabled:opacity-20 text-black font-semibold text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center cursor-pointer disabled:cursor-not-allowed active:scale-95 whitespace-nowrap"
              >
                <span>
                  Play {selectedCardIds.length > 0 ? `${selectedCardIds.length} ${selectedCardIds.length === 1 ? 'Card' : 'Cards'}` : 'Cards'}
                </span>
              </button>
            )
          )}
        </div>

        {/* Center: Card Pile & Dynamic Turn Arrow */}
        <div className="relative flex items-center justify-center shrink-0">
          <CardPile pileCount={pileCount} />
          <TurnArrow />
        </div>

        {/* Right Action: Call Liar Button */}
        <div className="flex-1 flex justify-start z-20">
          {me.isAlive && (
            isOpponentHandEmptied ? (
              <button
                type="button"
                disabled={isCallingLiar}
                onClick={() => {
                  if (isCallingLiar) return;
                  setIsCallingLiar(true);
                  sound.stopChallengeTimer();
                  handleCallLiar(pubkey, lastPlay.playerPk, lastPlay.turnId, lastPlay.cardHashes);
                }}
                className="h-10 sm:h-11 px-4 sm:px-6 rounded-full bg-white hover:bg-white/90 disabled:opacity-30 disabled:pointer-events-none text-black font-semibold text-xs sm:text-sm transition-all shadow-xl flex items-center gap-1.5 animate-pulse cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <span className="material-symbols-rounded text-sm">gavel</span>
                <span>Call Liar!</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={!canCallLiar || isCallingLiar}
                onClick={() => {
                  if (isCallingLiar) return;
                  setIsCallingLiar(true);
                  sound.stopChallengeTimer();
                  handleCallLiar(pubkey, lastPlay.playerPk, lastPlay.turnId, lastPlay.cardHashes);
                }}
                className="h-10 sm:h-11 px-4 sm:px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 disabled:border-white/5 text-white disabled:opacity-20 font-semibold text-xs sm:text-sm transition-all shadow-lg flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed active:scale-95 whitespace-nowrap"
              >
                <span className="material-symbols-rounded text-sm">gavel</span>
                <span>Call Liar!</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

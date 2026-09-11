import React, { useState, useEffect } from 'react';
import { CardView } from './CardView';
import { PlayerGunBadge } from './PlayerGunBadge';
import { useGame } from '../../context/GameContext';
import { useNostr } from '../../context/NostrContext';
import { sound } from '../../services/sound';

export const LocalPlayerSeat = () => {
  const { pubkey, displayName } = useNostr();
  const { 
    gameState,
    isHost,
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
    isRouletteActive
  } = useGame();

  const isMyTurn = activePlayerPk === pubkey;
  const me = players.find(p => p.pk === pubkey) || { isAlive: true, cardCount: localHand.length };
  const canCallLiar = isMyTurn && lastPlay && lastPlay.playerPk !== pubkey;
  const canPlayCards = isMyTurn && selectedCardIds.length >= 1 && selectedCardIds.length <= 3 && me.isAlive;

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
      <div className="w-full flex flex-col items-center select-none pt-2 pb-6 z-20">
        {/* Entrance State: No covered cards in beginning, clean seated status */}
        <div className="h-20 flex flex-col items-center justify-center mb-3">
          <div className="flex items-center gap-2 text-white/50 font-mono text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
            <span>{isHost ? (players.length < 2 ? 'Invite players to take a seat to deal cards' : 'All seats ready • Deal cards to start') : 'Seated at table • Waiting for host to deal'}</span>
          </div>
        </div>

        {/* Lobby Action Controls & Profile Chip */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {/* Local Player Badge */}
          <div className="px-4 py-1.5 rounded-full flex items-center gap-3 bg-white/[0.04] border border-white/10">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-xs font-bold bg-white text-black">
              {displayName ? displayName.substring(0, 2).toUpperCase() : 'ME'}
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white">
                  {displayName || 'You'}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 text-white/70 font-mono">
                  {isHost ? 'Host' : 'You'}
                </span>
              </div>
              <div className="text-[10px] font-mono mt-0.5">
                {me.isReady ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Ready
                  </span>
                ) : (
                  <span className="text-white/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                    Not Ready
                  </span>
                )}
              </div>
            </div>
            <PlayerGunBadge chambersRemaining={me.chambersRemaining ?? 6} isAlive={true} />
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-[11px] font-bold shadow-sm" title="Dominance Score">
              <span className="material-symbols-rounded text-[13px]">bolt</span>
              <span>{me.dominanceScore ?? 0} pts</span>
            </div>
          </div>

          {/* Universal Collaborative Lobby Ready Actions */}
          {isStartAudioPlaying ? (
            <div className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-white/70 font-mono text-xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>Entering table...</span>
            </div>
          ) : players.length < 2 ? (
            <div className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/[0.04] border border-white/10">
              <span className="text-xs font-mono text-white/50">
                {isPublic ? (
                  <span>Waiting for another player to join the table...</span>
                ) : (
                  <span>Share code <strong className="text-white tracking-widest">{roomCode}</strong> to invite players</span>
                )}
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={togglePlayerReady}
                className={`h-11 px-8 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-xl flex items-center gap-2 cursor-pointer active:scale-95 ${
                  me.isReady
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40'
                    : 'bg-white hover:bg-white/90 text-black'
                }`}
              >
                <span className="material-symbols-rounded text-base">
                  {me.isReady ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span>
                  {me.isReady 
                    ? `Ready (${players.filter(p => p.isReady).length}/${players.length})` 
                    : "I'm Ready"}
                </span>
              </button>

              <span className="text-[11px] font-mono text-white/40">
                {players.every(p => p.isReady) 
                  ? 'All players ready! Starting...' 
                  : `Waiting for all players (${players.filter(p => p.isReady).length}/${players.length} ready)`}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ACTIVE PLAYING STATE RENDER
  return (
    <div className="w-full flex flex-col items-center select-none pt-2 pb-6 z-20">
      {/* Hand Cards (Face Up) */}
      <div className="flex items-center justify-center -space-x-4 sm:-space-x-6 md:-space-x-6 px-8 mb-3 max-w-full overflow-visible pt-8 pb-4">
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
            <div className="h-28 flex flex-col items-center justify-center text-white/60 font-mono text-xs gap-1">
              <span className="material-symbols-rounded text-2xl text-white/40">done_all</span>
              <span>All cards played this round!</span>
            </div>
          )
        ) : (
          <div className="h-24 flex flex-col items-center justify-center text-white/40">
            <span className="material-symbols-rounded text-3xl mb-1">skull</span>
            <span className="text-xs tracking-wider uppercase">Eliminated (Spectating)</span>
          </div>
        )}
      </div>

      {/* Action Controls & Profile Chip */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        {/* Local Player Badge */}
        <div className={`px-4 py-1.5 rounded-full flex items-center gap-3 bg-white/[0.04] border transition-all ${
          isMyTurn ? 'border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.15)]' : 'border-white/10'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif text-xs font-bold ${
            me.isAlive ? 'bg-white text-black' : 'bg-white/10 text-white/40'
          }`}>
            {me.isAlive ? (displayName ? displayName.substring(0, 2).toUpperCase() : 'ME') : '☠'}
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white">
                {displayName || 'You'}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 text-white/70 font-mono">
                {isHost ? 'Host' : 'You'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-white/40">
              {me.isAlive ? `${localHand.length} cards` : 'Dead'}
            </span>
          </div>

          {/* Personal Gun Badge */}
          <PlayerGunBadge 
            chambersRemaining={me.chambersRemaining ?? 6} 
            isAlive={me.isAlive} 
          />

          {/* Dominance Score */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-[11px] font-bold shadow-sm" title="Dominance Score">
            <span className="material-symbols-rounded text-[13px]">bolt</span>
            <span>{me.dominanceScore ?? 0} pts</span>
          </div>

          {isMyTurn && me.isAlive && (
            <span className="text-[10px] font-mono font-bold text-white ml-2 animate-pulse">
              Your Turn
            </span>
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
                  onClick={() => {
                    sound.stopChallengeTimer();
                    handleCallLiar(pubkey, lastPlay.playerPk, lastPlay.turnId, lastPlay.cardHashes);
                  }}
                  className="h-11 px-6 rounded-full bg-white hover:bg-white/90 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-xl flex items-center gap-1.5 animate-pulse"
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
                    onClick={() => {
                      sound.stopChallengeTimer();
                      handleCallLiar(pubkey, lastPlay.playerPk, lastPlay.turnId, lastPlay.cardHashes);
                    }}
                    className="h-11 px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-1.5"
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

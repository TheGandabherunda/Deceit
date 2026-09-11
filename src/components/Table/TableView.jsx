import React from 'react';
import { TableHeader } from './TableHeader';
import { OpponentsLayer } from './OpponentsLayer';
import { TargetCardDisplay } from './DeadZone/TargetCardDisplay';
import { CardPile } from './DeadZone/CardPile';
import { LocalPlayerSeat } from './LocalPlayerSeat';
import { RevealSummaryModal } from './Modals/RevealSummaryModal';
import { RevolverCinematic } from './Modals/RevolverCinematic';
import { GameOverModal } from './Modals/GameOverModal';
import AmbientLight from '../AmbientLight';
import { useGame } from '../../context/GameContext';
import { useNostr } from '../../context/NostrContext';

export const TableView = () => {
  const { pubkey } = useNostr();
  const { 
    roomCode,
    isHost,
    isPublic,
    gameState,
    startGame,
    players, 
    activePlayerPk, 
    tableTarget, 
    chambersRemaining, 
    pileCount, 
    lastPlay,
    actionBanner,
    isShaking,
    isFlashActive,
    isStartAudioPlaying,
    disconnectedPeer
  } = useGame();

  const opponents = players.filter(p => p.pk !== pubkey);

  return (
    <div className={`h-[100dvh] w-screen overflow-x-hidden flex flex-col antialiased bg-[#050505] text-white relative select-none animate-fade-in ${
      isShaking ? 'shake-active' : ''
    }`}>
      {/* Screen flash on gunshot */}
      {isFlashActive && <div className="flash-overlay" />}

      {/* Atmospheric Table Lighting */}
      <AmbientLight />

      {/* Persistent Navigation Header */}
      <TableHeader />

      {/* Table Arena */}
      <main className="flex-1 flex flex-col items-center justify-between p-2 md:p-4 relative max-w-5xl mx-auto w-full z-10 overflow-visible">
        {/* Disconnection Warning Banner */}
        {disconnectedPeer && (
          <div className="w-full max-w-xl mx-auto mb-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs flex items-center justify-between shadow-2xl animate-pulse z-30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-lg text-amber-400">wifi_off</span>
              <span><strong>{disconnectedPeer.name}</strong> disconnected. Waiting for reconnection...</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-white font-bold text-xs">
                {disconnectedPeer.countdown}s
              </span>
              <span className="text-[10px] text-amber-400/70 hidden sm:inline">(Dominance tie-breaker resolves on timeout)</span>
            </div>
          </div>
        )}

        {/* Opponents (Top) */}
        <div className="w-full z-20">
          <OpponentsLayer 
            opponents={opponents} 
            activePlayerPk={activePlayerPk}
            lastPlay={lastPlay}
          />
        </div>

        {/* Center Table Surface */}
        <div className="w-full max-w-3xl bg-white/[0.02] border border-white/10 rounded-[44px] p-6 md:p-8 my-auto relative flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm min-h-[220px]">
          {gameState === 'lobby' ? (
            /* Lobby Center Interface */
            <div className="flex flex-col items-center text-center max-w-md my-auto py-2">
              <div className="px-3.5 py-1 rounded-full bg-white/10 text-white/80 font-mono text-[11px] uppercase tracking-wider mb-3 border border-white/10 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>{isPublic ? 'Public Table' : 'Private Table'} • {players.length}/4 Seats Occupied</span>
              </div>

              <h2 className="text-2xl font-serif font-bold text-white mb-1 tracking-tight">
                {isPublic ? 'Public Match' : `Table ${roomCode}`}
              </h2>
              <p className="text-xs text-white/50 mb-4">
                {isPublic 
                  ? (players.length < 2 ? 'Waiting for matchmaking players to take a seat...' : 'Seated and waiting for all players to ready up.')
                  : (players.length < 2 ? `Share code ${roomCode} with friends to take a seat.` : 'Seated and waiting for all players to ready up.')}
              </p>

              {isStartAudioPlaying ? (
                <div className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-white/70 font-mono text-xs animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>Entering table...</span>
                </div>
              ) : players.length < 2 ? (
                <div className="flex items-center gap-2 text-white/40 font-mono text-xs px-4 py-2 rounded-full bg-white/[0.02] border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                  <span>Waiting for at least 1 more player to join...</span>
                </div>
              ) : players.every(p => p.isReady) ? (
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>All players ready! Dealing round 1...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-white/70 font-mono text-xs px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>
                    Waiting for players to ready up (<strong className="text-white">{players.filter(p => p.isReady).length}/{players.length}</strong>)
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Active Round Center Dead Zone Interface */
            <>
              {/* Action Notification Banner */}
              {actionBanner && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30">
                  <div className="px-4 py-1.5 rounded-full bg-[#0a0a0a] border border-white/20 text-white font-mono text-xs shadow-2xl flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>{actionBanner}</span>
                  </div>
                </div>
              )}

              {/* Center Dead Zone Elements */}
              <div className="w-full max-w-lg flex items-center justify-around py-1">
                <TargetCardDisplay target={tableTarget} />

                {/* Minimal Table Center Divider */}
                <div className="flex flex-col items-center gap-1 opacity-50 select-none">
                  <div className="w-9 h-9 rounded-full border border-white/20 bg-white/[0.02] flex items-center justify-center">
                    <span className="material-symbols-rounded text-base text-white/50">casino</span>
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">Dead Zone</span>
                </div>

                <CardPile pileCount={pileCount} />
              </div>
            </>
          )}
        </div>

        {/* Local Player (Bottom) */}
        <div className="w-full z-20">
          <LocalPlayerSeat />
        </div>
      </main>

      {/* Modals */}
      <RevealSummaryModal />
      <RevolverCinematic />
      <GameOverModal />
    </div>
  );
};

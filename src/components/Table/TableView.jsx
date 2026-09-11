import React, { useState, useEffect } from 'react';
import { TableHeader } from './TableHeader';
import { OpponentsLayer } from './OpponentsLayer';
import { TargetCardDisplay } from './DeadZone/TargetCardDisplay';
import { CardPile } from './DeadZone/CardPile';
import { LocalPlayerSeat } from './LocalPlayerSeat';
import { RevealSummaryModal } from './Modals/RevealSummaryModal';
import { RevolverCinematic } from './Modals/RevolverCinematic';
import { GameOverModal } from './Modals/GameOverModal';
import { RulesModal } from '../Hallway/RulesModal';
import { SettingsModal } from '../Settings/SettingsModal';
import AmbientLight from '../AmbientLight';
import { useGame } from '../../context/GameContext';
import { useNostr } from '../../context/NostrContext';
import { sound } from '../../services/sound';

export const TableView = () => {
  const { pubkey } = useNostr();
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  // Background Music: Play low-volume ambient music as soon as player enters the table
  useEffect(() => {
    sound.startBgMusic();
    return () => {
      sound.stopBgMusic();
    };
  }, []);

  return (
    <div className={`h-[100dvh] w-screen overflow-x-hidden flex flex-col antialiased bg-[#050505] text-white relative select-none animate-fade-in ${
      isShaking ? 'shake-active' : ''
    }`}>
      {/* Screen flash on gunshot */}
      {isFlashActive && <div className="flash-overlay" />}

      {/* Atmospheric Table Lighting */}
      <AmbientLight />

      {/* Persistent Navigation Header */}
      <TableHeader 
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

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

        {/* Opponents (Top Row: Standoff 1-opp, Triangle 2-opp, or Top-Center in Diamond) */}
        <div className="w-full z-20">
          <OpponentsLayer 
            opponents={opponents} 
            activePlayerPk={activePlayerPk}
            lastPlay={lastPlay}
            slot="top"
          />
        </div>

        {/* Mobile secondary row for 4-Player Diamond (Middle-Left and Middle-Right) */}
        {opponents.length === 3 && (
          <div className="flex lg:hidden items-center justify-around w-full z-20 my-1 px-4">
            <OpponentsLayer 
              opponents={opponents} 
              activePlayerPk={activePlayerPk}
              lastPlay={lastPlay}
              slot="left"
            />
            <OpponentsLayer 
              opponents={opponents} 
              activePlayerPk={activePlayerPk}
              lastPlay={lastPlay}
              slot="right"
            />
          </div>
        )}

        {/* Middle Row: [Middle-Left Opponent (4-player)] [Center Table Surface] [Middle-Right Opponent (4-player)] */}
        <div className="w-full max-w-5xl my-auto flex items-center justify-center gap-3 md:gap-6 relative z-10">
          {opponents.length === 3 && (
            <div className="hidden lg:flex flex-shrink-0 z-20">
              <OpponentsLayer 
                opponents={opponents} 
                activePlayerPk={activePlayerPk}
                lastPlay={lastPlay}
                slot="left"
              />
            </div>
          )}

          {/* Center Table Surface */}
          <div className="flex-1 max-w-3xl bg-white/[0.02] border border-white/10 rounded-[44px] p-6 md:p-8 relative flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm min-h-[220px]">
            {gameState === 'lobby' ? (
              /* Lobby Center Interface - Bloom Style */
              <div className="flex flex-col items-center text-center max-w-md my-auto py-3">
                <h2 
                  className="text-3xl sm:text-4xl text-white font-serif tracking-normal mb-1.5"
                  style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}
                >
                  {isPublic ? 'Table Arena' : 'Private Table'}
                </h2>
                <p className="text-xs sm:text-sm text-white/40 max-w-xs leading-relaxed">
                  {isPublic 
                    ? (players.length < 2 ? 'Waiting for players to join and take a seat.' : 'All seats occupied. Ready up to begin.')
                    : (players.length < 2 ? 'Share the room code with friends to join the match.' : 'All players seated. Ready up to deal the cards.')}
                </p>

                {/* Private Table Code pill with click to copy */}
                {!isPublic && roomCode && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(roomCode);
                    }}
                    className="mt-3.5 px-4 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/80 font-mono text-xs flex items-center gap-2 transition-all cursor-pointer group active:scale-95"
                    title="Click to copy room code"
                  >
                    <span className="text-white/40">CODE</span>
                    <span className="font-bold tracking-widest text-white">{roomCode}</span>
                    <span className="material-symbols-rounded text-sm text-white/40 group-hover:text-white">content_copy</span>
                  </button>
                )}

                {/* Minimal Status Indicator */}
                {isStartAudioPlaying ? (
                  <div className="mt-5 px-5 py-2 rounded-full bg-white text-black font-semibold text-xs animate-pulse tracking-wide">
                    Entering match...
                  </div>
                ) : players.length < 2 ? (
                  <div className="mt-5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-white/50 font-mono text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                    <span>Waiting for opponents ({players.length}/4 seated)</span>
                  </div>
                ) : players.every(p => p.isReady) ? (
                  <div className="mt-5 px-5 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold text-xs flex items-center gap-2 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>All players ready • Dealing Round 1</span>
                  </div>
                ) : (
                  <div className="mt-5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-white/60 font-mono text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{players.filter(p => p.isReady).length}/{players.length} players ready</span>
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

                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.04] flex items-center justify-center shadow-lg">
                      <span className="material-symbols-rounded text-base text-white/50">casino</span>
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">Dead Zone</span>
                  </div>

                  <CardPile pileCount={pileCount} />
                </div>
              </>
            )}
          </div>

          {opponents.length === 3 && (
            <div className="hidden lg:flex flex-shrink-0 z-20">
              <OpponentsLayer 
                opponents={opponents} 
                activePlayerPk={activePlayerPk}
                lastPlay={lastPlay}
                slot="right"
              />
            </div>
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
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

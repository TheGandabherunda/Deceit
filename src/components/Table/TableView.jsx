import React, { useState, useEffect } from 'react';
import { TableHeader } from './TableHeader';
import { OpponentsLayer } from './OpponentsLayer';
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
    togglePlayerReady,
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
    isRouletteActive,
    soleSurvivor,
    disconnectedPeer
  } = useGame();

  const opponents = players.filter(p => p.pk !== pubkey);
  const me = players.find(p => p.pk === pubkey);

  // Background Music:
  // - Starts ONLY while in playing, after table entry music (start.mp3) stops.
  // - Smoothly fades in to subtle 1.5% volume.
  // - Stops immediately during shooting, suspense, and roulette cinematic.
  // - Stops upon match completion before win/lose sound.
  // - Stops on unmount.
  useEffect(() => {
    const shouldPlayBgMusic = 
      (gameState === 'playing' || gameState === 'lobby') && 
      !isStartAudioPlaying && 
      !isRouletteActive && 
      !soleSurvivor && 
      gameState !== 'ended';

    if (shouldPlayBgMusic) {
      sound.startBgMusic(2000);
    } else {
      sound.stopBgMusic(400);
    }

    return () => {
      sound.stopBgMusic();
    };
  }, [gameState, isStartAudioPlaying, isRouletteActive, soleSurvivor]);

  return (
    <div className={`h-[100dvh] max-h-[100dvh] w-screen overflow-hidden flex flex-col antialiased bg-[#050505] text-white relative select-none animate-fade-in ${
      isShaking ? 'shake-active' : ''
    }`}>
      {/* Screen flash on gunshot */}
      {isFlashActive && <div className="flash-overlay" />}

      {/* Atmospheric Table Lighting */}
      <AmbientLight target={gameState === 'lobby' ? 'A' : (tableTarget || 'A')} />

      {/* Persistent Navigation Header */}
      <TableHeader 
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Table Arena - Strictly fits within single viewport */}
      <main className="flex-1 flex flex-col items-center justify-between p-1 sm:p-2 md:p-3 relative max-w-5xl mx-auto w-full z-10 overflow-hidden">
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

        {/* Middle Row: [Middle-Left Opponent (4-player)] [Center Cards Area] [Middle-Right Opponent (4-player)] */}
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

          {/* Center Table Area - Open layout without outer container box */}
          <div className="flex-1 max-w-3xl relative flex flex-col items-center justify-center my-auto py-1">
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

                {/* Ready Action Button in Middle Table Arena Container */}
                {isStartAudioPlaying ? (
                  <div className="mt-4 flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs tracking-wider animate-pulse">
                    <span>Entering match...</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={togglePlayerReady}
                    className={`mt-4 h-[44px] px-8 rounded-full font-bold text-sm transition-all shadow-xl flex items-center justify-center cursor-pointer active:scale-98 ${
                      me?.isReady
                        ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white hover:bg-white/90 text-black'
                    }`}
                  >
                    Ready
                  </button>
                )}

                {/* Minimal Status Indicator */}
                {!isStartAudioPlaying && (
                  players.length < 2 ? (
                    <div className="mt-3 text-xs font-mono text-white/40">
                      Waiting for opponents ({players.length}/4 seated)
                    </div>
                  ) : players.every(p => p.isReady) ? (
                    <div className="mt-3 text-xs font-medium text-emerald-400 animate-pulse">
                      All players ready • Dealing Round 1
                    </div>
                  ) : (
                    <div className="mt-3 text-xs font-mono text-white/50">
                      {players.filter(p => p.isReady).length}/{players.length} players ready
                    </div>
                  )
                )}
              </div>
            ) : (
              /* Active Round Center - Only Cards in the Middle */
              <div className="flex flex-col items-center justify-center relative w-full my-auto py-2">
                {/* Action Notification Banner */}
                {actionBanner && (
                  <div className="mb-4 transition-all animate-fade-in">
                    <div className="px-4 py-1.5 rounded-full bg-[#0a0a0a]/90 backdrop-blur-md border border-white/20 text-white font-mono text-xs shadow-2xl flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>{actionBanner}</span>
                    </div>
                  </div>
                )}

                {/* Only Cards Stack in the Middle */}
                <div className="flex items-center justify-center">
                  <CardPile pileCount={pileCount} />
                </div>
              </div>
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

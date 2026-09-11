import React, { useState } from 'react';
import { HallwayHeader } from './HallwayHeader';
import { PrivateRoomModal } from './PrivateRoomModal';
import { TableSizeModal } from './TableSizeModal';
import { RulesModal } from './RulesModal';
import EditNameModal from '../EditNameModal';
import AmbientLight from '../AmbientLight';
import { useNostr } from '../../context/NostrContext';
import { useGame } from '../../context/GameContext';

export const HallwayView = () => {
  const { displayName, updateDisplayName } = useNostr();
  const { 
    isMatchmaking, 
    matchmakingStatus, 
    queueCount, 
    matchmakingSize,
    showSizeFallback,
    switchTo2PlayerMatch,
    startMatchmaking, 
    cancelMatchmaking 
  } = useGame();

  const [isPrivateOpen, setIsPrivateOpen] = useState(false);
  const [isTableSizeOpen, setIsTableSizeOpen] = useState(false);
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  return (
    <div className="h-[100dvh] w-screen overflow-hidden flex flex-col antialiased bg-[#050505] relative animate-fade-in select-none">

      {/* Ambient Bottom Glow */}
      <AmbientLight />

      {/* Header with Private Table modal trigger */}
      <HallwayHeader
        onOpenPrivate={() => setIsPrivateOpen(true)}
        onOpenEditName={() => setIsEditNameOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      {/* Main Center Interface */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 z-10 flex flex-col items-center justify-center relative">
        <div className="max-w-xl mx-auto w-full text-center flex flex-col items-center justify-center my-auto py-6">

          {!isMatchmaking ? (
            /* IDLE STATE: PROMINENT "JOIN GAME" BUTTON */
            <div className="flex flex-col items-center animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-white/70 font-mono text-[11px] uppercase tracking-widest mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Nostr Multiplayer • 2 to 4 Players</span>
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-5xl md:text-7xl font-serif font-black text-white tracking-tight mb-4 select-none">
                DECEIT
              </h1>
              <p className="text-white/50 text-sm md:text-base font-sans max-w-md mx-auto mb-10 leading-relaxed">
                Play cards in the dead zone. Bluff the target, call out liars, and survive the Russian Roulette revolver.
              </p>

              {/* Hero "Join Game" Button */}
              <div className="relative group mb-8">
                <div className="absolute -inset-1 rounded-full bg-white/20 blur-xl group-hover:bg-white/30 transition-all opacity-70 group-hover:opacity-100 animate-pulse" />
                <button
                  onClick={() => setIsTableSizeOpen(true)}
                  className="relative h-16 px-12 md:px-16 rounded-full bg-white hover:bg-white/95 text-black font-serif text-xl font-bold tracking-wider uppercase transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:shadow-[0_0_80px_rgba(255,255,255,0.45)] hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span className="material-symbols-rounded text-2xl">play_arrow</span>
                  <span>Join Game</span>
                </button>
              </div>

              {/* Status Note & Quick Explainer */}
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-xs font-mono text-white/40">
                  Quick Match • Select 2, 3, or 4 players & match with active peers
                </span>
                <button
                  type="button"
                  onClick={() => setIsPrivateOpen(true)}
                  className="text-[11px] font-mono text-white/30 hover:text-white/60 transition-colors underline underline-offset-4"
                >
                  Playing with friends? Open a Private Table
                </button>
              </div>
            </div>
          ) : (
            /* MATCHMAKING / SEARCHING STATE (LOADING SCREEN) */
            <div className="flex flex-col items-center animate-fade-in w-full max-w-md bg-[#0a0a0a] rounded-[36px] p-8 border border-white/10 shadow-2xl relative">
              {/* Concentric Radar Pulse Rings */}
              <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                <span className="absolute w-24 h-24 rounded-full border border-white/20 animate-ping opacity-40" />
                <span className="absolute w-16 h-16 rounded-full border border-white/30 animate-pulse" />
                <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  <span className="material-symbols-rounded text-2xl animate-spin" style={{ animationDuration: '4s' }}>
                    casino
                  </span>
                </div>
              </div>

              {/* Matchmaking Status Heading */}
              <h3 className="text-2xl font-serif font-bold text-white tracking-tight mb-2">
                Finding {matchmakingSize || 2}-Player Match...
              </h3>

              {/* Dynamic Queue Description */}
              <p className="text-white/80 font-mono text-xs mb-3 font-semibold min-h-[20px]">
                {matchmakingStatus || 'Scanning for active peers...'}
              </p>

              {/* Queue Count Indicator */}
              <div className="px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-white/50 font-mono text-xs mb-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{queueCount} / {matchmakingSize || 2} player{queueCount === 1 ? '' : 's'} ready</span>
              </div>

              {/* Fallback Suggestion Card when 3 or 4 players are unavailable */}
              {showSizeFallback && (
                <div className="w-full bg-white/[0.05] border border-white/20 rounded-2xl p-4 mb-5 text-center animate-fade-in shadow-xl">
                  <div className="flex items-center justify-center gap-1.5 text-white/90 text-xs font-mono font-bold mb-1.5">
                    <span className="material-symbols-rounded text-sm text-amber-400">group_off</span>
                    <span>Waiting for {matchmakingSize} players taking longer</span>
                  </div>
                  <p className="text-[11px] text-white/60 mb-3 leading-relaxed">
                    Currently not enough players waiting for {matchmakingSize}-player tables. Switch to 2-Player Duel to play immediately?
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={switchTo2PlayerMatch}
                      className="w-full py-2.5 px-4 rounded-full bg-white hover:bg-white/90 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span className="material-symbols-rounded text-sm">bolt</span>
                      <span>Switch to 2 Players</span>
                    </button>
                    <button
                      onClick={cancelMatchmaking}
                      className="w-full py-1.5 text-[11px] font-mono text-white/40 hover:text-white transition-colors"
                    >
                      Leave Matchmaking
                    </button>
                  </div>
                </div>
              )}

              {/* Cancel Search Button */}
              <button
                onClick={cancelMatchmaking}
                className="h-11 px-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-rounded text-sm">close</span>
                <span>Cancel Search</span>
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Modals */}
      <TableSizeModal
        isOpen={isTableSizeOpen}
        onClose={() => setIsTableSizeOpen(false)}
        onSelectSize={(size) => startMatchmaking(size)}
      />
      <PrivateRoomModal
        isOpen={isPrivateOpen}
        onClose={() => setIsPrivateOpen(false)}
      />
      <EditNameModal
        isOpen={isEditNameOpen}
        onClose={() => setIsEditNameOpen(false)}
        currentName={displayName}
        onSave={(newName) => updateDisplayName(newName)}
      />
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
};

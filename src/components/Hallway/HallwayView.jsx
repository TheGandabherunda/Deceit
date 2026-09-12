import React, { useState, useEffect, useRef } from 'react';
import { HallwayHeader } from './HallwayHeader';
import { MatchingModal } from './MatchingModal';
import { PrivateRoomModal } from './PrivateRoomModal';
import { TableSizeModal } from './TableSizeModal';
import { RulesModal } from './RulesModal';
import Imprints from './Imprints';
import { ScoreboardView } from '../Scoreboard/ScoreboardView';
import { SettingsModal } from '../Settings/SettingsModal';
import AmbientLight from '../AmbientLight';
import { useNostr } from '../../context/NostrContext';
import { useGame } from '../../context/GameContext';
import { useProfile } from '../../context/ProfileContext';
import { BloubAvatar } from '../Bloub/BloubAvatar';

export const HallwayView = () => {
  const { displayName, updateDisplayName } = useNostr();
  const { profile } = useProfile();
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
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImprintsOpen, setIsImprintsOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' | 'scoreboard'

  // Mouse cursor tracking for the home screen hero Bloub avatar
  const bloubContainerRef = useRef(null);
  const [gazeTarget, setGazeTarget] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!bloubContainerRef.current) return;
      const rect = bloubContainerRef.current.getBoundingClientRect();
      // Face center in screen coordinates (eyes around 36% from top)
      const faceX = rect.left + rect.width / 2;
      const faceY = rect.top + rect.height * 0.36;

      const spanX = Math.max(window.innerWidth / 2, 280);
      const spanY = Math.max(window.innerHeight / 2, 280);

      const dx = Math.max(-1, Math.min(1, (e.clientX - faceX) / spanX));
      const dy = Math.max(-1, Math.min(1, (e.clientY - faceY) / spanY));

      setGazeTarget({ x: dx, y: dy });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Separate Screen for Global Scoreboard
  if (currentScreen === 'scoreboard') {
    return <ScoreboardView onBack={() => setCurrentScreen('home')} />;
  }

  return (
    <div className="h-[100dvh] w-screen overflow-hidden flex flex-col antialiased bg-[#050505] relative animate-fade-in select-none">

      {/* Ambient Bottom Glow */}
      <AmbientLight />

      {/* Header with Private Table modal trigger */}
      <HallwayHeader
        onOpenPrivate={() => setIsPrivateOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenScoreboard={() => setCurrentScreen('scoreboard')}
        onOpenImprints={() => setIsImprintsOpen(true)}
      />

      {/* Main Center Interface */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 z-10 flex flex-col items-center justify-center relative">
        <div className="max-w-xl mx-auto w-full text-center flex flex-col items-center justify-center my-auto py-6 relative">

          {/* IDLE STATE: PROMINENT "JOIN GAME" BUTTON */}
          <div className="flex flex-col items-center animate-fade-in relative w-full">
            {/* Big Selected Bloub with bottom fade partial reveal */}
            <div 
              ref={bloubContainerRef}
              className="relative pointer-events-none select-none -mb-28 sm:-mb-36 md:-mb-44 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <div 
                className="relative transition-all duration-500 scale-90 sm:scale-100 md:scale-105"
                style={{
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 26%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 95%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 26%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 95%)',
                }}
              >
                <BloubAvatar
                  shape={profile?.shape}
                  color={profile?.color}
                  expression="idle"
                  gazeTarget={gazeTarget}
                  size={520}
                  paperColor="#050505"
                />
              </div>
            </div>

            {/* Content Container: Positioned at the bottom of the Bloub */}
            <div className="flex flex-col items-center relative z-10 w-full">
              {/* Title & Subtitle */}
              <h1 className="text-5xl md:text-7xl font-serif font-black text-white tracking-tight mb-3 select-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                Deceit
              </h1>
              <p className="text-white/60 text-xs md:text-sm font-sans max-w-md mx-auto mb-8 leading-relaxed">
                Play cards in the dead zone. Bluff the target, call out liars, and survive the Russian Roulette revolver.
              </p>

              {/* Hero "Join Game" Button */}
              <div className="relative group mb-8">
                <div className="absolute -inset-1 rounded-full bg-white/20 blur-xl group-hover:bg-white/30 transition-all opacity-70 group-hover:opacity-100 animate-pulse" />
                <button
                  onClick={() => setIsTableSizeOpen(true)}
                  className="relative h-16 px-12 md:px-16 rounded-full bg-white hover:bg-white/95 text-black font-serif text-xl font-bold transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:shadow-[0_0_80px_rgba(255,255,255,0.45)] hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  <span>Join Game</span>
                </button>
              </div>

              {/* Status Note & Quick Actions */}
              <div className="flex flex-col items-center gap-4 text-center">
                <span className="text-xs text-white/40">
                  Quick Match • Select 2, 3, or 4 players & match with active peers
                </span>

                {/* Private Table Button */}
                <button
                  type="button"
                  onClick={() => setIsPrivateOpen(true)}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.07] hover:bg-white/[0.12] text-white/70 hover:text-white text-sm font-medium transition-all cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-rounded text-base">lock</span>
                  <span>Private Table</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Fixed bottom: IMPRINTS label */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-4 z-30 pointer-events-none">
        <button
          type="button"
          onClick={() => setIsImprintsOpen(true)}
          className="text-white/40 hover:text-white text-xs font-semibold tracking-wider uppercase transition-colors hover:underline focus:outline-none cursor-pointer pointer-events-auto"
        >
          IMPRINTS
        </button>
      </div>

      {/* Modals */}
      <MatchingModal
        isOpen={isMatchmaking}
        onCancel={cancelMatchmaking}
        matchmakingSize={matchmakingSize}
        matchmakingStatus={matchmakingStatus}
        showSizeFallback={showSizeFallback}
        onSwitchTo2Player={switchTo2PlayerMatch}
        onOpenPrivate={() => {
          cancelMatchmaking();
          setIsPrivateOpen(true);
        }}
      />
      <TableSizeModal
        isOpen={isTableSizeOpen}
        onClose={() => setIsTableSizeOpen(false)}
        onSelectSize={(size) => startMatchmaking(size)}
      />
      <PrivateRoomModal
        isOpen={isPrivateOpen}
        onClose={() => setIsPrivateOpen(false)}
      />
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Imprints Full-Screen Overlay */}
      {isImprintsOpen && (
        <Imprints onClose={() => setIsImprintsOpen(false)} />
      )}
    </div>
  );
};

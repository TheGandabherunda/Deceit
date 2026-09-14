import React, { useState, useEffect, useRef } from 'react';
import { BloubAvatar } from '../../Bloub/BloubAvatar';
import { sound } from '../../../services/sound';

export const TableIntroConfrontation = ({
  localPlayer,
  opponentPlayer,
  isAudioPlaying = false,
  tableTarget = 'A',
  onComplete
}) => {
  // Phase: 'confrontation' (centered facing each other) | 'departing' (moving to seats) | 'done'
  const [phase, setPhase] = useState('confrontation');
  const [isMobile, setIsMobile] = useState(false);
  const departureTimerRef = useRef(null);
  const confrontationTimerRef = useRef(null);
  const hasTriggeredDepartureRef = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const triggerDeparture = (fast = false) => {
    if (hasTriggeredDepartureRef.current) return;
    hasTriggeredDepartureRef.current = true;
    setPhase('departing');

    const duration = fast ? 450 : 950;
    departureTimerRef.current = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, duration);
  };

  const handleSkip = () => {
    sound.stopStartAudio();
    triggerDeparture(true);
  };

  // Sync with audio or timer
  useEffect(() => {
    // If audio is playing, schedule departure at 6.8s (start.mp3 is 8.0s total)
    // If audio is not playing (e.g. muted), schedule departure at 3.6s
    const confrontationDuration = isAudioPlaying ? 6800 : 3600;

    confrontationTimerRef.current = setTimeout(() => {
      triggerDeparture(false);
    }, confrontationDuration);

    return () => {
      if (confrontationTimerRef.current) clearTimeout(confrontationTimerRef.current);
      if (departureTimerRef.current) clearTimeout(departureTimerRef.current);
    };
  }, [isAudioPlaying]);

  // If audio finishes early, trigger departure immediately
  useEffect(() => {
    if (!isAudioPlaying && phase === 'confrontation' && hasTriggeredDepartureRef.current === false) {
      // Audio ended or was stopped externally
      const fallbackTimer = setTimeout(() => {
        triggerDeparture(false);
      }, 500);
      return () => clearTimeout(fallbackTimer);
    }
  }, [isAudioPlaying, phase]);

  if (phase === 'done') return null;

  const targetName = 
    tableTarget === 'K' ? "King's Table" : 
    tableTarget === 'Q' ? "Queen's Table" : 
    "Ace's Table";

  const me = localPlayer || {
    name: 'You',
    color: '#3b93f0',
    shape: 'cercle'
  };

  const opp = opponentPlayer || {
    name: 'Awaiting Rival...',
    color: '#252830',
    shape: 'cercle',
    isPlaceholder: true
  };

  const bloubSize = isMobile ? 104 : 124;

  // Departing transformations:
  // In confrontation:
  //   Top player (opponent) is centered above VS, gazing down
  //   Bottom player (local) is centered below VS, gazing up
  // In departing:
  //   Top player (opponent) moves further UP to top seat: translateY(-28vh), scale(0.85)
  //   Bottom player (local) moves further DOWN to bottom seat: translateY(28vh), scale(0.65)
  const isDeparting = phase === 'departing';

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center select-none overflow-hidden transition-opacity duration-700 ${
        isDeparting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at center, rgba(12,14,18,0.92) 0%, rgba(5,5,5,0.98) 100%)',
        backdropFilter: 'blur(12px)'
      }}
    >
      {/* Top Bar Header with Arena Name and Skip button */}
      <div 
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-50 transition-all duration-500 ${
          isDeparting ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-white/40">
            Table Entrance
          </span>
          <h2 
            className="text-lg sm:text-xl text-white font-normal drop-shadow-md"
            style={{ fontFamily: '"Gloock", serif' }}
          >
            {targetName}
          </h2>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white/80 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg"
          title="Skip intro animation"
        >
          <span>Skip</span>
          <span className="material-symbols-rounded text-sm">fast_forward</span>
        </button>
      </div>

      {/* Atmospheric Central Lighting Effect */}
      <div 
        className={`absolute w-[450px] sm:w-[600px] h-[300px] sm:h-[400px] rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          isDeparting ? 'opacity-0' : 'opacity-25'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(59,147,240,0.08) 50%, transparent 70%)'
        }}
      />

      {/* Center Confrontation Stage - Vertical Top & Bottom */}
      <div className="relative w-full max-w-md px-4 flex flex-col items-center justify-center">

        {/* Opponent Bloub (Top in confrontation -> glides to top seat) */}
        <div 
          className="flex flex-col items-center justify-center transition-all duration-900 ease-out"
          style={{
            transform: isDeparting
              ? 'translate(0px, -28vh) scale(0.85)'
              : 'translate(0px, 0px) scale(1)',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform, opacity'
          }}
        >
          {/* Avatar Container with vertical confrontation breathing */}
          <div className={`${!isDeparting ? 'animate-standoff-top' : ''} relative`}>
            <BloubAvatar
              shape={opp.shape || 'cercle'}
              color={opp.color || '#e5e5e5'}
              expression="duel"
              directGaze={{ yaw: 0, pitch: -26 }}
              size={bloubSize}
            />
          </div>

          {/* Opponent Name Tag */}
          <div 
            className={`mt-2 flex flex-col items-center text-center transition-opacity duration-300 ${
              isDeparting ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <span className="text-xs sm:text-sm font-semibold text-white tracking-wide max-w-[140px] truncate">
              {opp.name || 'Opponent'}
            </span>
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">
              {opp.isPlaceholder ? 'Waiting for peer' : 'Opponent'}
            </span>
          </div>
        </div>

        {/* Center Standoff VS Badge with subtle horizontal divider lines */}
        <div 
          className={`flex items-center justify-center gap-3 my-2 sm:my-3 transition-all duration-400 ${
            isDeparting ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
          }`}
        >
          <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-white/20" />
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.06)]">
            <span 
              className="text-xs sm:text-sm text-white/80 font-normal tracking-widest"
              style={{ fontFamily: '"Gloock", serif' }}
            >
              VS
            </span>
          </div>
          <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-white/20" />
        </div>

        {/* Local Player Bloub (Bottom in confrontation -> glides to bottom seat) */}
        <div 
          className="flex flex-col items-center justify-center transition-all duration-900 ease-out"
          style={{
            transform: isDeparting
              ? 'translate(0px, 28vh) scale(0.65)'
              : 'translate(0px, 0px) scale(1)',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform, opacity'
          }}
        >
          {/* Avatar Container with vertical confrontation breathing */}
          <div className={`${!isDeparting ? 'animate-standoff-bottom' : ''} relative`}>
            <BloubAvatar
              shape={me.shape || 'cercle'}
              color={me.color || '#3b93f0'}
              expression="duel"
              directGaze={{ yaw: 0, pitch: 26 }}
              size={bloubSize}
            />
          </div>

          {/* Player Name Tag */}
          <div 
            className={`mt-2 flex flex-col items-center text-center transition-opacity duration-300 ${
              isDeparting ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <span className="text-xs sm:text-sm font-semibold text-white tracking-wide max-w-[140px] truncate">
              {me.name || 'You'}
            </span>
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">
              (You)
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Audio/Status hint */}
      <div 
        className={`absolute bottom-6 sm:bottom-8 flex items-center gap-2 text-xs font-mono text-white/40 transition-all duration-500 ${
          isDeparting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
        <span>Preparing table showdown...</span>
      </div>
    </div>
  );
};

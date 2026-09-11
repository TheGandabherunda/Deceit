import React, { useState, useEffect } from 'react';
import { RevolverCylinder } from '../DeadZone/RevolverCylinder';
import { useGame } from '../../../context/GameContext';
import { useNostr } from '../../../context/NostrContext';
import { useProfile } from '../../../context/ProfileContext';
import { BloubAvatar } from '../../Bloub/BloubAvatar';

export const RevolverCinematic = () => {
  const { isRouletteActive, rouletteVictim, rouletteResult, players, isShaking, isFlashActive } = useGame();
  const { pubkey } = useNostr();
  const { profile } = useProfile();

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  const [isDecisionComplete, setIsDecisionComplete] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hasResult = rouletteResult !== null;

  // When trigger is pulled (hasResult becomes true), let the shot/click and bullet removal play for 700ms,
  // then smoothly glide the top Bloub down into the middle with the outcome announcement!
  useEffect(() => {
    if (!hasResult) {
      setIsDecisionComplete(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsDecisionComplete(true);
    }, 700);

    return () => clearTimeout(timer);
  }, [hasResult]);

  if (!isRouletteActive) return null;

  const victim = players.find(p => p.pk === rouletteVictim);
  const isLocalVictim = rouletteVictim === pubkey;
  const victimName = victim?.name || (isLocalVictim ? (profile.name || 'You') : 'Player');
  const victimColor = victim?.color || (isLocalVictim ? profile.color : '#3b93f0');
  const victimShape = victim?.shape || (isLocalVictim ? profile.shape : 'cercle');

  const isDead = rouletteResult?.isDead;

  // Victim's personal gun chambers
  const victimChambers = rouletteResult 
    ? rouletteResult.chambersBefore 
    : (victim?.chambersRemaining !== undefined ? victim.chambersRemaining : 6);
  const nextChambers = rouletteResult ? rouletteResult.chambersAfter : Math.max(0, victimChambers - 1);

  return (
    <div 
      className={`fixed inset-0 z-[300] bg-black/80 backdrop-blur-md select-none animate-fade-in overflow-hidden ${
        isDead && isShaking ? 'shake-active' : ''
      }`}
    >
      {/* Screen flash on gunshot */}
      {isDead && isFlashActive && (
        <div className="fixed inset-0 z-[350] bg-white pointer-events-none transition-opacity duration-300 animate-pulse" />
      )}

      {/* 1. The Bloub Avatar: Starts at top, then smoothly glides down into the middle */}
      <div 
        className="absolute left-1/2 flex flex-col items-center justify-center pointer-events-none z-20"
        style={{
          top: isDecisionComplete ? '44%' : (isMobile ? '19%' : '17%'),
          transform: `translate(-50%, -50%) scale(${isDecisionComplete ? (isMobile ? 1.25 : 1.35) : 1})`,
          transition: 'top 0.75s cubic-bezier(0.22, 1, 0.36, 1), transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        <div className="relative">
          <BloubAvatar
            shape={victimShape}
            color={victimColor}
            expression={hasResult ? (isDead ? 'dead' : 'idle') : 'shock'}
            gazeTarget={hasResult ? null : { x: 0, y: 0.8 }}
            size={isMobile ? 115 : 155}
            className={hasResult && isDead ? 'opacity-85' : ''}
          />
        </div>
      </div>

      {/* 2. Middle Revolver Animation: Fades and scales out when decision completes */}
      <div 
        className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center pointer-events-none z-10"
        style={{
          opacity: isDecisionComplete ? 0 : 1,
          transform: `translate(-50%, -50%) scale(${isDecisionComplete ? 0.65 : 1})`,
          transition: 'opacity 0.45s ease-out, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        <RevolverCylinder 
          chambersRemaining={hasResult ? nextChambers : victimChambers} 
          isActive={true} 
          isSpinning={!hasResult} 
        />
      </div>

      {/* 3. Bottom Text: Seamlessly transitions from Facing Gun to Survived / Got Shot */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 sm:bottom-12 w-full max-w-xl px-4 flex flex-col items-center text-center z-20">
        <h2 
          key={isDecisionComplete ? 'outcome' : 'facing'}
          className={`text-2xl sm:text-4xl md:text-5xl font-normal tracking-tight drop-shadow-[0_4px_24px_rgba(255,255,255,0.2)] animate-fade-in ${
            isDecisionComplete && isDead ? 'text-rose-400' : 'text-white'
          }`}
          style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}
        >
          {isDecisionComplete
            ? (isLocalVictim
                ? (isDead ? 'You got shot' : 'You survived')
                : (isDead ? `${victimName} got shot` : `${victimName} survived`))
            : (isLocalVictim ? 'You facing Gun' : `${victimName} facing Gun`)}
        </h2>

        <span 
          key={isDecisionComplete ? 'sub-outcome' : 'sub-facing'}
          className="text-xs sm:text-sm font-mono text-white/50 tracking-wider mt-2 sm:mt-2.5 animate-fade-in"
        >
          {isDecisionComplete
            ? (isDead 
                ? 'Eliminated from the match' 
                : `Chamber empty • ${nextChambers}/6 chambers remaining`)
            : `1 in ${victimChambers} odds • ${Math.round((1 / victimChambers) * 100)}% Danger`}
        </span>
      </div>
    </div>
  );
};

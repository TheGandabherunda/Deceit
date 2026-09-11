import React from 'react';
import { RevolverCylinder } from '../DeadZone/RevolverCylinder';
import { useGame } from '../../../context/GameContext';
import { useNostr } from '../../../context/NostrContext';
import { useProfile } from '../../../context/ProfileContext';
import { BloubAvatar } from '../../Bloub/BloubAvatar';

export const RevolverCinematic = () => {
  const { isRouletteActive, rouletteVictim, rouletteResult, players } = useGame();
  const { pubkey } = useNostr();
  const { profile } = useProfile();

  if (!isRouletteActive) return null;

  const victim = players.find(p => p.pk === rouletteVictim);
  const isLocalVictim = rouletteVictim === pubkey;
  const victimName = victim?.name || (isLocalVictim ? profile.name : 'Player');
  const victimColor = victim?.color || (isLocalVictim ? profile.color : '#3b93f0');
  const victimShape = victim?.shape || (isLocalVictim ? profile.shape : 'cercle');

  const hasResult = rouletteResult !== null;
  const isDead = rouletteResult?.isDead;

  // Expression logic:
  // While cylinder spinning: 'shock'
  // BANG: 'dead' (X X eyes!)
  // Click: 'idle' (relieved!)
  const victimExpression = !hasResult ? 'shock' : isDead ? 'dead' : 'idle';

  // Victim's personal gun chambers
  const victimChambers = rouletteResult 
    ? rouletteResult.chambersBefore 
    : (victim?.chambersRemaining !== undefined ? victim.chambersRemaining : 6);
  const nextChambers = rouletteResult ? rouletteResult.chambersAfter : Math.max(1, victimChambers - 1);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex flex-col justify-center items-center p-4 animate-fade-in select-none">
      <div 
        className="w-full max-w-md bg-[#0a0a0a] rounded-[32px] p-6 sm:p-8 shadow-2xl relative border border-white/10 text-center"
        style={{ animation: 'slideUpModal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <span className="text-white/40 font-mono text-xs uppercase tracking-widest block mb-1">
          Gunpoint Stand-off
        </span>

        <h3 className="text-2xl font-serif text-white tracking-tight mb-1">
          {victimName} at Gunpoint
        </h3>

        <p className="text-white/40 text-xs font-mono mb-4">
          1 in {victimChambers} odds ({Math.round((1 / victimChambers) * 100)}% Danger)
        </p>

        {/* Victim Face at Gunpoint */}
        <div className="flex flex-col items-center justify-center my-3 relative">
          <div className="relative">
            <BloubAvatar
              shape={victimShape}
              color={victimColor}
              expression={victimExpression}
              gazeTarget={{ x: 0, y: -0.6 }} // looking down at the spinning cylinder
              size={100}
              className={isDead ? 'opacity-80' : ''}
            />

            {/* Sweat Drop while facing the gun */}
            {!hasResult && (
              <div className="absolute -top-1 -right-1 bg-sky-500/20 border border-sky-400/40 text-sky-300 rounded-full p-1 animate-bounce">
                <span className="material-symbols-rounded text-sm block leading-none">
                  water_drop
                </span>
              </div>
            )}

            {/* Outcome Badge */}
            {hasResult && (
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full tracking-widest uppercase shadow-xl border animate-fade-in ${
                isDead 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {isDead ? 'Eliminated' : 'Survived'}
              </div>
            )}
          </div>
        </div>

        {/* Revolver Cylinder */}
        <div className="my-3 transform scale-100 flex justify-center">
          <RevolverCylinder 
            chambersRemaining={victimChambers} 
            isActive={true} 
            isSpinning={!hasResult} 
          />
        </div>

        {/* Result Text */}
        <div className="mt-5 min-h-[50px] flex items-center justify-center">
          {!hasResult ? (
            <div className="flex items-center gap-2 text-xs font-mono text-white/60 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>Holding breath... facing the revolver...</span>
            </div>
          ) : isDead ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-serif font-bold text-white tracking-wider">
                BANG
              </span>
              <span className="text-xs font-mono text-white/60">
                {victimName} was eliminated.
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-serif font-bold text-white tracking-wider">
                Click! Survived
              </span>
              <span className="text-xs font-mono text-white/60">
                Chamber empty. {victimName}'s gun has {nextChambers} chambers remaining.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

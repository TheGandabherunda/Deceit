import React from 'react';
import { RevolverCylinder } from '../DeadZone/RevolverCylinder';
import { useGame } from '../../../context/GameContext';

export const RevolverCinematic = () => {
  const { isRouletteActive, rouletteVictim, rouletteResult, players } = useGame();

  if (!isRouletteActive) return null;

  const victim = players.find(p => p.pk === rouletteVictim);
  const victimName = victim?.name || 'Player';
  const hasResult = rouletteResult !== null;
  const isDead = rouletteResult?.isDead;

  // Victim's personal gun chambers
  const victimChambers = rouletteResult 
    ? rouletteResult.chambersBefore 
    : (victim?.chambersRemaining !== undefined ? victim.chambersRemaining : 6);
  const nextChambers = rouletteResult ? rouletteResult.chambersAfter : Math.max(1, victimChambers - 1);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex flex-col justify-center items-center p-4 animate-fade-in select-none">
      <div 
        className="w-full max-w-md bg-[#0a0a0a] rounded-[32px] p-8 shadow-2xl relative border border-white/10 text-center"
        style={{ animation: 'slideUpModal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <span className="text-white/40 font-mono text-xs uppercase tracking-widest block mb-1">
          {victimName}'s Revolver
        </span>

        <h3 className="text-3xl font-serif text-white tracking-tight mb-1">
          {victimName}
        </h3>

        <p className="text-white/40 text-xs font-mono mb-6">
          1 in {victimChambers} odds ({Math.round((1 / victimChambers) * 100)}% Danger)
        </p>

        {/* Cylinder */}
        <div className="my-4 transform scale-110 flex justify-center">
          <RevolverCylinder 
            chambersRemaining={victimChambers} 
            isActive={true} 
            isSpinning={!hasResult} 
          />
        </div>

        {/* Result */}
        <div className="mt-8 min-h-[50px] flex items-center justify-center">
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

import React, { useState, useEffect } from 'react';
import { CardView } from '../CardView';
import { useGame } from '../../../context/GameContext';
import { useNostr } from '../../../context/NostrContext';
import { useProfile } from '../../../context/ProfileContext';
import { BloubAvatar } from '../../Bloub/BloubAvatar';

export const RevealSummaryModal = () => {
  const { pendingReveal, players, tableTarget } = useGame();
  const { pubkey } = useNostr();
  const { profile } = useProfile();

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!pendingReveal) return null;

  const { accuserPk, accusedPk, cards, isTruth, designatedLoserPk } = pendingReveal;
  const accuser = players.find(p => p.pk === accuserPk);
  const accused = players.find(p => p.pk === accusedPk);

  const accuserName = accuser?.name || (accuserPk === pubkey ? (profile.name || 'You') : 'Challenger');
  const accusedName = accused?.name || (accusedPk === pubkey ? (profile.name || 'You') : 'Accused');

  const accuserColor = accuser?.color || (accuserPk === pubkey ? profile.color : '#3b93f0');
  const accuserShape = accuser?.shape || (accuserPk === pubkey ? profile.shape : 'cercle');

  const accusedColor = accused?.color || (accusedPk === pubkey ? profile.color : '#e8483f');
  const accusedShape = accused?.shape || (accusedPk === pubkey ? profile.shape : 'cercle');

  const isAccuserLoser = designatedLoserPk === accuserPk;
  const isAccusedLoser = designatedLoserPk === accusedPk;

  const accuserExpression = isAccuserLoser ? 'shock' : 'victory';
  const accusedExpression = isAccusedLoser ? 'shock' : 'victory';

  // Dynamic Title:
  // - If local player called liar: "You called [player name] Liar"
  // - If opponent called liar on local player: "[Player name] called you Liar"
  // - If spectating two other players: "[Player name] called [player name] Liar"
  const challengeTitle = 
    accuserPk === pubkey 
      ? `You called ${accusedName} Liar` 
      : accusedPk === pubkey 
        ? `${accuserName} called you Liar` 
        : `${accuserName} called ${accusedName} Liar`;

  const tableName = 
    tableTarget === 'K' ? "King's Table" : 
    tableTarget === 'Q' ? "Queen's Table" : 
    "Ace's Table";

  // Player facing the gun
  const facingGunPlayer = isAccuserLoser 
    ? (accuserPk === pubkey ? (profile.name || 'You') : accuserName)
    : (accusedPk === pubkey ? (profile.name || 'You') : accusedName);

  const bloubSize = isMobile ? 110 : 200;

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 md:p-10 select-none animate-fade-in overflow-hidden">
      {/* Top: Challenge Title & Table Name */}
      <div className="flex flex-col items-center text-center mt-2 sm:mt-4">
        <h2 
          className="text-2xl sm:text-4xl md:text-5xl text-white font-normal tracking-tight drop-shadow-[0_4px_24px_rgba(255,255,255,0.2)]"
          style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}
        >
          {challengeTitle}
        </h2>
        <span className="text-xs sm:text-sm font-sans font-medium tracking-[0.25em] uppercase text-white/50 mt-2 sm:mt-3">
          {tableName}
        </span>
      </div>

      {/* Middle Standoff: [Challenger Bloub (Left)]  [Revealed Cards (Center)]  [Accused Bloub (Right)] */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-2 sm:gap-6 my-auto px-2 sm:px-6">
        {/* Left: Challenger Bloub */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative transition-transform duration-300">
            <BloubAvatar
              shape={accuserShape}
              color={accuserColor}
              expression={accuserExpression}
              gazeTarget={{ x: 1, y: 0 }}
              size={bloubSize}
            />
          </div>
          <span className="mt-2 sm:mt-3 text-[11px] sm:text-xs md:text-sm font-mono text-white/80 tracking-wide text-center">
            Challenger • {accuserName}
          </span>
        </div>

        {/* Center: Revealed Cards */}
        <div className="flex flex-col items-center justify-center flex-1 px-1 sm:px-4">
          <div className="flex items-center justify-center -space-x-5 sm:space-x-3 md:space-x-4 overflow-visible py-2">
            {cards && cards.length > 0 ? (
              cards.map((card, idx) => {
                const matchesTarget = card.rank === tableTarget || card.rank === 'JOKER';
                const status = matchesTarget ? 'truth' : 'bluff';
                return (
                  <div 
                    key={idx} 
                    className="flex flex-col items-center gap-2.5 sm:gap-3 transition-transform duration-300 hover:-translate-y-2 hover:scale-105"
                    style={{ zIndex: idx }}
                  >
                    <CardView 
                      card={card} 
                      faceDown={false} 
                      shimmerStatus={status}
                    />
                    <span className={`text-sm sm:text-base md:text-lg font-gloock tracking-wider select-none ${
                      matchesTarget 
                        ? 'text-emerald-400 drop-shadow-[0_0_14px_rgba(52,211,153,0.9)]' 
                        : 'text-rose-500 drop-shadow-[0_0_14px_rgba(244,63,94,0.9)]'
                    }`}>
                      {matchesTarget ? 'Truth' : 'Bluff'}
                    </span>
                  </div>
                );
              })
            ) : (
              <span className="text-white/40 text-xs font-mono">No cards revealed</span>
            )}
          </div>
        </div>

        {/* Right: Accused Bloub */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative transition-transform duration-300">
            <BloubAvatar
              shape={accusedShape}
              color={accusedColor}
              expression={accusedExpression}
              gazeTarget={{ x: -1, y: 0 }}
              size={bloubSize}
            />
          </div>
          <span className="mt-2 sm:mt-3 text-[11px] sm:text-xs md:text-sm font-mono text-white/80 tracking-wide text-center">
            Accused • {accusedName}
          </span>
        </div>
      </div>

      {/* Bottom: Loser Facing Gun in Gloock font */}
      <div className="flex flex-col items-center text-center mb-2 sm:mb-6">
        <h3 
          className="text-2xl sm:text-3xl md:text-5xl text-white font-normal tracking-tight drop-shadow-[0_4px_30px_rgba(255,255,255,0.25)]"
          style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}
        >
          {facingGunPlayer} facing Gun
        </h3>
      </div>
    </div>
  );
};

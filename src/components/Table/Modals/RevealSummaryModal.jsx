import React from 'react';
import { CardView } from '../CardView';
import { useGame } from '../../../context/GameContext';
import { useNostr } from '../../../context/NostrContext';
import { useProfile } from '../../../context/ProfileContext';
import { BloubAvatar } from '../../Bloub/BloubAvatar';

export const RevealSummaryModal = () => {
  const { pendingReveal, players, tableTarget } = useGame();
  const { pubkey } = useNostr();
  const { profile } = useProfile();

  if (!pendingReveal) return null;

  const { accuserPk, accusedPk, cards, isTruth, cheatDetected, designatedLoserPk } = pendingReveal;
  const accuser = players.find(p => p.pk === accuserPk);
  const accused = players.find(p => p.pk === accusedPk);

  const accuserName = accuser?.name || (accuserPk === pubkey ? profile.name : 'Challenger');
  const accusedName = accused?.name || (accusedPk === pubkey ? profile.name : 'Accused');

  const accuserColor = accuser?.color || (accuserPk === pubkey ? profile.color : '#3b93f0');
  const accuserShape = accuser?.shape || (accuserPk === pubkey ? profile.shape : 'cercle');

  const accusedColor = accused?.color || (accusedPk === pubkey ? profile.color : '#e8483f');
  const accusedShape = accused?.shape || (accusedPk === pubkey ? profile.shape : 'cercle');

  const isAccuserLoser = designatedLoserPk === accuserPk;
  const isAccusedLoser = designatedLoserPk === accusedPk;

  const accuserExpression = isAccuserLoser ? 'shock' : 'victory';
  const accusedExpression = isAccusedLoser ? 'shock' : 'victory';

  const loserName = isAccuserLoser ? accuserName : accusedName;
  const targetName = tableTarget === 'A' ? 'Aces' : tableTarget === 'K' ? 'Kings' : 'Queens';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex flex-col justify-center items-center p-4 animate-fade-in select-none">
      <div 
        className="w-full max-w-lg bg-[#0a0a0a] rounded-[32px] p-6 sm:p-8 shadow-2xl relative border border-white/10 text-center"
        style={{ animation: 'slideUpModal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <span className="text-white/40 font-mono text-xs uppercase tracking-widest block mb-1">
          Cards Revealed
        </span>

        <h3 className="text-2xl font-serif text-white tracking-tight mb-1">
          {accuserName} called Liar on {accusedName}
        </h3>

        <p className="text-white/50 text-xs font-mono mb-4">
          Table target was {targetName} (Jokers wild)
        </p>

        {/* Both Faces: Standoff Duel */}
        <div className="flex items-center justify-between px-4 py-3.5 mb-5 bg-white/[0.02] border border-white/10 rounded-2xl">
          {/* Accuser / Challenger Face */}
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="relative">
              <BloubAvatar
                shape={accuserShape}
                color={accuserColor}
                expression={accuserExpression}
                gazeTarget={{ x: 0.9, y: 0 }}
                size={70}
              />
              <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold tracking-wider border shadow-md whitespace-nowrap ${
                isAccuserLoser 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {isAccuserLoser ? 'Blundered' : 'Called Lie'}
              </span>
            </div>
            <span className="text-white text-xs font-semibold mt-2.5 truncate max-w-[100px]">
              {accuserName}
            </span>
            <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider">
              Challenger
            </span>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center px-2">
            <span className="text-white/20 font-black font-serif text-base tracking-widest">
              VS
            </span>
            <span className="material-symbols-rounded text-white/30 text-sm">
              swords
            </span>
          </div>

          {/* Accused Face */}
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="relative">
              <BloubAvatar
                shape={accusedShape}
                color={accusedColor}
                expression={accusedExpression}
                gazeTarget={{ x: -0.9, y: 0 }}
                size={70}
              />
              <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold tracking-wider border shadow-md whitespace-nowrap ${
                isAccusedLoser 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {isAccusedLoser ? 'Caught Lie' : 'Truthful'}
              </span>
            </div>
            <span className="text-white text-xs font-semibold mt-2.5 truncate max-w-[100px]">
              {accusedName}
            </span>
            <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider">
              Accused
            </span>
          </div>
        </div>

        {/* Revealed Cards */}
        <div className="flex items-center justify-center gap-3 mb-5">
          {cards && cards.length > 0 ? (
            cards.map((card, idx) => {
              const matchesTarget = card.rank === tableTarget || card.rank === 'JOKER';
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <CardView card={card} faceDown={false} />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/10">
                    {matchesTarget ? 'Truth' : 'Bluff'}
                  </span>
                </div>
              );
            })
          ) : (
            <span className="text-white/40 text-xs font-mono">Cards revealed</span>
          )}
        </div>

        {/* Verdict */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-5 flex flex-col items-center">
          <span className="text-base font-bold text-white">
            {isTruth ? 'Truth! Genuine cards played.' : cheatDetected ? 'Caught in a lie!' : 'Bluff! Cards did not match.'}
          </span>
          <span className="text-xs text-white/50 mt-0.5">
            {isTruth ? `${accuserName} made an incorrect challenge.` : `${accusedName} was caught bluffing.`}
          </span>
        </div>

        {/* Loser */}
        <div className="flex items-center justify-center gap-2 text-sm font-mono">
          <span className="text-white/50">Facing the gun:</span>
          <span className="px-3 py-1 rounded-full bg-white text-black font-bold">
            {loserName}
          </span>
        </div>
      </div>
    </div>
  );
};

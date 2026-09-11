import React from 'react';
import { CardView } from '../CardView';
import { useGame } from '../../../context/GameContext';

export const RevealSummaryModal = () => {
  const { pendingReveal, players, tableTarget } = useGame();

  if (!pendingReveal) return null;

  const { accuserPk, accusedPk, cards, isTruth, cheatDetected, designatedLoserPk } = pendingReveal;
  const accuserName = players.find(p => p.pk === accuserPk)?.name || 'Challenger';
  const accusedName = players.find(p => p.pk === accusedPk)?.name || 'Accused';
  const loserName = players.find(p => p.pk === designatedLoserPk)?.name || 'Loser';

  const targetName = tableTarget === 'A' ? 'Aces' : tableTarget === 'K' ? 'Kings' : 'Queens';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex flex-col justify-center items-center p-4 animate-fade-in select-none">
      <div 
        className="w-full max-w-lg bg-[#0a0a0a] rounded-[32px] p-8 shadow-2xl relative border border-white/10 text-center"
        style={{ animation: 'slideUpModal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <span className="text-white/40 font-mono text-xs uppercase tracking-widest block mb-1">
          Cards Revealed
        </span>

        <h3 className="text-2xl font-serif text-white tracking-tight mb-1">
          {accuserName} called Liar on {accusedName}
        </h3>

        <p className="text-white/50 text-xs font-mono mb-6">
          Table target was {targetName} (Jokers wild)
        </p>

        {/* Revealed Cards */}
        <div className="flex items-center justify-center gap-3 mb-6">
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
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-6 flex flex-col items-center">
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

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export const RulesModal = ({ isOpen, onClose }) => {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-[300] flex flex-col justify-end md:justify-center items-center p-4 sm:p-6 pb-6 md:pb-6 animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-[520px] max-h-[85vh] overflow-y-auto bg-[#0a0a0a] rounded-[32px] p-6 sm:p-8 shadow-2xl relative border border-white/10 no-scrollbar"
        style={{ animation: 'slideUpModal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        {/* Pull Handle for mobile */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 md:hidden" />

        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10 cursor-pointer"
          aria-label="Close rules"
        >
          <span className="material-symbols-rounded text-[20px]">close</span>
        </button>

        <div className="mt-1 mb-6 text-center px-2">
          <h3 
            className="text-4xl text-white font-serif tracking-normal"
            style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}
          >
            Game Rules
          </h3>
          <p className="text-white/40 text-sm mt-1.5">
            How to bluff, survive, and win.
          </p>
        </div>

        <div className="space-y-3.5 text-left text-sm text-white/80 select-text">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <h4 className="font-bold text-white mb-1">1. The 20-Card Deck & Table Target</h4>
            <p className="text-white/60 text-xs leading-relaxed">
              The deck has exactly 20 cards: 6 Aces, 6 Kings, 6 Queens, and 2 Jokers.
              Each round rolls a random Table Target (Ace, King, or Queen).
              Jokers are wild and are ALWAYS considered telling the truth, regardless of the target.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <h4 className="font-bold text-white mb-1">2. Turns & Calling Liar</h4>
            <p className="text-white/60 text-xs leading-relaxed">
              The active player selects 1 to 3 cards and plays them face-down, claiming they match the target.
              The next player must either play their own cards or call "Liar!".
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <h4 className="font-bold text-white mb-1">3. Verification</h4>
            <p className="text-white/60 text-xs leading-relaxed">
              When Liar is called, only the previous cards flip face-up. If any card doesn't match the target (and isn't a Joker), the Liar loses.
              If all match (or are Jokers), the Accuser loses.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <h4 className="font-bold text-white mb-1">4. Empty Hand Rule</h4>
            <p className="text-white/60 text-xs leading-relaxed">
              If a player plays their last card and the next player does not call Liar, the round ends.
              The empty-handed player wins safely, and the preceding player takes the revolver penalty.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <h4 className="font-bold text-white mb-1">5. The Revolver Penalty</h4>
            <p className="text-white/60 text-xs leading-relaxed">
              The loser faces the 6-chamber revolver.
              If they survive, the chamber count drops by 1, hands refill, and the survivor starts the next round.
              If eliminated, the chamber count resets to 6. Last player standing is the Sole Survivor.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/15">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-rounded text-base text-amber-400">bolt</span>
              <h4 className="font-bold text-white">6. Disconnection Rule & Dominance Calculation</h4>
            </div>
            <p className="text-white/60 text-xs leading-relaxed mb-3">
              Normal rounds and matches are won strictly by surviving Russian Roulette. Point scores are never displayed on screen during play. 
              However, if a player disconnects and abandons the table, the backend resolves the winner using an automated Dominance calculation based on round performance:
            </p>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-emerald-400 font-bold">+50 Points</span>
                <span className="text-white/70 text-right text-[11px]">Successfully calling out a Liar (guessed right)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-emerald-400 font-bold">+20 Points</span>
                <span className="text-white/70 text-right text-[11px]">Getting away with a lie (uncalled bluff)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-emerald-400 font-bold">+10 Points</span>
                <span className="text-white/70 text-right text-[11px]">Safely playing the truth</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-rose-400 font-bold">-50 Points</span>
                <span className="text-white/70 text-right text-[11px]">Falsely accusing someone (they told truth)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-rose-400 font-bold">-50 Points</span>
                <span className="text-white/70 text-right text-[11px]">Getting caught in a lie</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-rounded text-base text-blue-400">wifi</span>
              <h4 className="font-bold text-white">7. 30-Second Disconnection Policy</h4>
            </div>
            <p className="text-white/60 text-xs leading-relaxed">
              If a player disconnects during a match, a 30-second reconnection grace period is provided.
              If they reconnect in time, play resumes seamlessly. If they do not return, the backend resolves the winner via the Disconnection Rule, detailing why the player won and how it was calculated.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-[48px] rounded-full bg-white hover:bg-white/90 text-black font-bold text-sm transition-all flex items-center justify-center cursor-pointer shadow-lg active:scale-98"
          >
            Understood
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

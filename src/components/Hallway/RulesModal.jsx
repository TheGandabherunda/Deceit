import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const RulesModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('how-to-play'); // 'how-to-play' | 'details'

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset to first tab on open
  useEffect(() => {
    if (isOpen) {
      setActiveTab('how-to-play');
    }
  }, [isOpen]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex flex-col justify-end md:justify-center items-center p-3 sm:p-6 pb-4 md:pb-6 animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-[560px] max-h-[88vh] flex flex-col bg-[#0c0c0c] rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 shadow-2xl relative border border-white/10 overflow-hidden"
        style={{ animation: 'slideUpModal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3 md:hidden shrink-0" />

        {/* Top Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10 cursor-pointer"
          aria-label="Close rules"
        >
          <span className="material-symbols-rounded text-[20px]">close</span>
        </button>

        {/* Header Title */}
        <div className="text-center px-2 shrink-0 mb-4">
          <h2 
            className="text-3xl sm:text-4xl text-white font-normal tracking-tight"
            style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}
          >
            How to Play Deceit
          </h2>
          <p className="text-white/40 text-xs sm:text-sm mt-1">
            Bluff with cards. Survive the gun. Be the last player standing.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-center p-1 bg-white/5 rounded-full border border-white/10 mb-4 mx-auto w-full max-w-[320px] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('how-to-play')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              activeTab === 'how-to-play' 
                ? 'bg-white text-black shadow-md' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            Quick Guide (4 Steps)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              activeTab === 'details' 
                ? 'bg-white text-black shadow-md' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            Cards & Details
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto pr-1 -mr-1 space-y-3.5 text-left text-sm text-white/80 select-text no-scrollbar flex-1">
          {activeTab === 'how-to-play' ? (
            /* TAB 1: HOW TO PLAY (BEGINNER WALKTHROUGH) */
            <>
              {/* Objective Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-white/[0.04] to-transparent border border-amber-500/20 flex items-start gap-3">
                <span className="material-symbols-rounded text-xl text-amber-400 shrink-0 mt-0.5">
                  target
                </span>
                <div className="text-xs text-white/70 leading-relaxed">
                  <strong className="text-white block font-sans text-sm mb-0.5">The Goal</strong>
                  Out-bluff opponents and empty your cards. If you get caught lying or wrongly accuse someone, you must pull the trigger on a personal revolver!
                </div>
              </div>

              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-bold font-mono text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <h3 className="font-bold text-white text-sm">The Table Target</h3>
                </div>
                <p className="text-white/70 text-xs leading-relaxed pl-8">
                  Each round chooses a Target card: <strong>Ace</strong>, <strong>King</strong>, or <strong>Queen</strong>.
                  All cards played in this round must be claimed as that target!
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pl-8 pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-mono text-[11px]">Aces</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-mono text-[11px]">Kings</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-mono text-[11px]">Queens</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-mono text-[11px] font-semibold border border-amber-400/30">
                    ★ Joker (Wild)
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-bold font-mono text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h3 className="font-bold text-white text-sm">Play Cards or Bluff</h3>
                </div>
                <p className="text-white/70 text-xs leading-relaxed pl-8">
                  On your turn, select <strong>1, 2, or 3 cards</strong> from your hand and play them face-down into the center pile.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                    <strong className="block text-emerald-400 font-semibold mb-0.5">Tell the Truth</strong>
                    Play real target cards or Jokers (Jokers always count as the target!).
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200">
                    <strong className="block text-rose-400 font-semibold mb-0.5">Tell a Lie (Bluff)</strong>
                    Play mismatched cards face-down and pretend they are the target!
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-bold font-mono text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <h3 className="font-bold text-white text-sm">Call "Liar!"</h3>
                </div>
                <p className="text-white/70 text-xs leading-relaxed pl-8">
                  When an opponent plays cards, you have two choices:
                </p>
                <div className="space-y-1.5 pl-8 text-xs text-white/70">
                  <div className="flex items-start gap-2">
                    <span className="text-white font-bold">•</span>
                    <span><strong>Believe them:</strong> Play your own cards to continue the stack.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-white font-bold">•</span>
                    <span><strong>Challenge them:</strong> Hit <strong>Call Liar!</strong> to reveal their cards.</span>
                  </div>
                </div>

                <div className="pl-8 pt-1">
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1.5 text-xs">
                    <div className="text-white font-semibold font-sans">Who loses the showdown?</div>
                    <div className="text-rose-300">
                      • <strong>If they lied:</strong> The bluffer loses and faces the gun.
                    </div>
                    <div className="text-amber-300">
                      • <strong>If they told the truth:</strong> The accuser was wrong and faces the gun!
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-bold font-mono text-xs flex items-center justify-center shrink-0">
                    4
                  </span>
                  <h3 className="font-bold text-white text-sm">The Russian Roulette</h3>
                </div>
                <p className="text-white/70 text-xs leading-relaxed pl-8">
                  The loser of the showdown pulls the trigger on their personal revolver:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/80">
                    <strong className="block text-white font-semibold mb-0.5">Click! (Empty Chamber)</strong>
                    You survive! But your revolver loses an empty slot (e.g. 6 $\to$ 5 $\to$ 4). Odds get deadlier each round you lose!
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200">
                    <strong className="block text-rose-400 font-semibold mb-0.5">BANG! (Fired Bullet)</strong>
                    You are eliminated from the match! The remaining players duel until one Sole Survivor remains.
                  </div>
                </div>

                {/* Who Plays First Explanation */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-xs text-amber-200 ml-8 mt-2">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <span className="material-symbols-rounded text-sm">play_circle</span>
                    <span>Who Plays First in Each Round?</span>
                  </div>
                  <div className="text-white/80 leading-relaxed text-[11px] sm:text-xs">
                    • <strong>Round 1:</strong> A random player is chosen to start the game.<br />
                    • <strong>Roulette Survivor:</strong> If the challenged player survives the trigger pull, they start the next round!<br />
                    • <strong>Elimination:</strong> If the player is eliminated, the next living player clockwise starts.
                  </div>
                </div>
              </div>

              {/* Pro Tips Section */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <span className="material-symbols-rounded text-base">lightbulb</span>
                  <span>Beginner Tips</span>
                </div>
                <ul className="space-y-1 text-white/60 pl-6 list-disc leading-relaxed">
                  <li><strong>Count cards:</strong> There are only 6 of each card. If you hold 4 Queens and someone plays 3 Queens, they are definitely lying!</li>
                  <li><strong>Jokers are wild:</strong> Jokers can NEVER be caught in a lie—they always count as truth.</li>
                  <li><strong>Empty Hand escape:</strong> If you play your last card and nobody calls Liar, you win the round safely!</li>
                </ul>
              </div>
            </>
          ) : (
            /* TAB 2: CARDS & TECHNICAL DETAILS */
            <>
              {/* 20-Card Deck Breakdown */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="material-symbols-rounded text-base text-blue-400">style</span>
                  The 20-Card Deck
                </h3>
                <p className="text-white/60 text-xs leading-relaxed">
                  Deceit is played with a tight, fast-cycling 20-card deck designed for intense bluff detection:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                  <div className="p-2 rounded-xl bg-white/[0.04] text-center">
                    <div className="text-lg font-bold text-white">6</div>
                    <div className="text-[11px] text-white/50">Aces</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04] text-center">
                    <div className="text-lg font-bold text-white">6</div>
                    <div className="text-[11px] text-white/50">Kings</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04] text-center">
                    <div className="text-lg font-bold text-white">6</div>
                    <div className="text-[11px] text-white/50">Queens</div>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-400/10 text-center">
                    <div className="text-lg font-bold text-amber-300">2</div>
                    <div className="text-[11px] text-amber-300/70">Jokers (Wild)</div>
                  </div>
                </div>
              </div>

              {/* Personal Revolver Odds */}
              <div className="p-4 rounded-2xl bg-white/[0.03] space-y-2.5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="material-symbols-rounded text-base text-rose-400">crisis_alert</span>
                  Personal Revolver Chambers & Odds
                </h3>
                <p className="text-white/60 text-xs leading-relaxed">
                  Each player has their own personal gun with 6 chambers. Each time you survive the gun, one empty chamber is spent, raising the danger on your next standoff:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 font-mono text-xs pt-1">
                  <div className="p-2 rounded-lg bg-white/[0.04] text-center">
                    <div className="text-white font-bold">6/6</div>
                    <div className="text-[10px] text-emerald-400">17% Risk</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.04] text-center">
                    <div className="text-white font-bold">5/6</div>
                    <div className="text-[10px] text-emerald-400">20% Risk</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.04] text-center">
                    <div className="text-white font-bold">4/6</div>
                    <div className="text-[10px] text-amber-400">25% Risk</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.04] text-center">
                    <div className="text-white font-bold">3/6</div>
                    <div className="text-[10px] text-amber-400">33% Risk</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.04] text-center">
                    <div className="text-white font-bold">2/6</div>
                    <div className="text-[10px] text-rose-400 font-bold">50% Risk</div>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-500/20 text-center">
                    <div className="text-rose-300 font-bold">1/6</div>
                    <div className="text-[10px] text-rose-400 font-bold">100% Lethal</div>
                  </div>
                </div>
              </div>

              {/* Empty Hand Rule */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="material-symbols-rounded text-base text-amber-400">done_all</span>
                  Empty Hand Escape
                </h3>
                <p className="text-white/60 text-xs leading-relaxed">
                  When a player places their last card, a <strong>12-second countdown</strong> starts. If the next player does not call Liar (or passes), the empty-handed player wins the round safely. The hesitant challenger who let them escape faces the gun penalty!
                </p>
              </div>

              {/* Disconnection Policy */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="material-symbols-rounded text-base text-cyan-400">wifi_off</span>
                  Disconnection Resolution
                </h3>
                <p className="text-white/60 text-xs leading-relaxed">
                  If a player loses connection, a 30-second reconnection window opens. If they do not return, the match is awarded to the surviving player with the highest calculated bluff dominance (+50 for caught bluffs, +20 for successful bluffs, -50 for false accusations).
                </p>
              </div>
            </>
          )}
        </div>

        {/* Bottom Confirmation Action */}
        <div className="mt-4 pt-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-12 rounded-full bg-white hover:bg-white/90 text-black font-semibold text-sm transition-all flex items-center justify-center cursor-pointer shadow-lg active:scale-98"
          >
            Understood
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

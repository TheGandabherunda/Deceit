import React, { useState, useEffect } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { BloubAvatar } from '../Bloub/BloubAvatar';

const SHUFFLE_EXPRESSIONS = ['waiting', 'thinking', 'bored'];

export const MatchingModal = ({
  isOpen,
  onCancel,
  matchmakingSize = 2,
  matchmakingStatus = '',
  queueCount = 1,
  showSizeFallback = false,
  onSwitchTo2Player,
  onOpenPrivate
}) => {
  const { profile } = useProfile();
  const [expressionIndex, setExpressionIndex] = useState(0);

  // Cycle through waiting, thinking, and bored expressions while matching
  useEffect(() => {
    if (!isOpen) {
      setExpressionIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setExpressionIndex((prev) => (prev + 1) % SHUFFLE_EXPRESSIONS.length);
    }, 2400);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Handle escape key to cancel search
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const currentExpression = SHUFFLE_EXPRESSIONS[expressionIndex];

  return (
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-[300] flex flex-col justify-end md:justify-center items-center p-4 sm:p-6 pb-6 md:pb-6 animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div 
        className="w-full max-w-[460px] bg-[#0a0a0a] rounded-[36px] p-6 sm:p-8 shadow-2xl relative border border-white/10 overflow-hidden"
        style={{ animation: 'slideUpModal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        {/* Pull Handle for mobile */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 md:hidden" />

        {/* Top-right close button */}
        <button 
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10 cursor-pointer"
          aria-label="Cancel search"
        >
          <span className="material-symbols-rounded text-[20px]">close</span>
        </button>

        {/* Character Preview with expression shuffle (size 140 matching user profile modal) */}
        <div className="mt-1 mb-2 text-center px-2 flex flex-col items-center">
          <div className="w-36 h-36 flex items-center justify-center mb-2">
            <BloubAvatar 
              shape={profile?.shape}
              color={profile?.color}
              expression={currentExpression}
              size={140}
              paperColor="#0a0a0a"
            />
          </div>

          <h3 
            className="text-4xl text-white font-serif tracking-normal" 
            style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}
          >
            Finding Match
          </h3>
          <p className="text-white/40 text-sm mt-1.5 min-h-[20px]">
            {matchmakingStatus || 'Scanning for active peers...'}
          </p>

          {/* Queue Count Pill */}
          <div className="mt-3 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white/60 font-mono text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{queueCount} / {matchmakingSize || 2} player{queueCount === 1 ? '' : 's'} ready</span>
          </div>
        </div>

        {/* Fallback Suggestion Card when matchmaking takes longer */}
        {showSizeFallback && (
          <div className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-4 mt-5 text-center animate-fade-in shadow-xl">
            <div className="flex items-center justify-center gap-1.5 text-white/90 text-xs font-mono font-bold mb-1.5">
              <span className="material-symbols-rounded text-sm text-amber-400">hourglass_empty</span>
              <span>Matching is taking longer</span>
            </div>
            <p className="text-[12px] text-white/50 mb-3 leading-relaxed">
              {matchmakingSize > 2
                ? `Waiting for ${matchmakingSize} players is taking longer. Switch to a 2-Player Duel to play immediately?`
                : 'No other players currently searching in the queue. You can create a Private Table to invite a friend, or keep searching.'}
            </p>
            <div className="flex flex-col gap-2">
              {matchmakingSize > 2 ? (
                <button
                  type="button"
                  onClick={onSwitchTo2Player}
                  className="w-full h-[46px] rounded-full bg-white hover:bg-white/90 text-black font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span className="material-symbols-rounded text-base">bolt</span>
                  <span>Switch to 2 Players</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenPrivate}
                  className="w-full h-[46px] rounded-full bg-white hover:bg-white/90 text-black font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span className="material-symbols-rounded text-base">lock</span>
                  <span>Create Private Table</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Cancel Search Button */}
        <button
          type="button"
          onClick={onCancel}
          className="w-full h-[50px] rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-6"
        >
          <span className="material-symbols-rounded text-lg">close</span>
          <span>Cancel Search</span>
        </button>
      </div>
    </div>
  );
};

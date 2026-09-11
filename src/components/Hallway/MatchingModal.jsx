import React, { useState, useEffect } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { BloubAvatar } from '../Bloub/BloubAvatar';

const SHUFFLE_EXPRESSIONS = ['waiting', 'thinking', 'bored'];

export const MatchingModal = ({
  isOpen,
  onCancel,
  matchmakingSize = 2,
  matchmakingStatus = '',
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
        className="w-full max-w-[420px] bg-[#0a0a0a] rounded-[32px] p-6 sm:p-8 shadow-2xl relative border border-white/10 overflow-hidden"
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
        <div className="mt-2 mb-2 text-center px-2 flex flex-col items-center">
          <div className="w-36 h-36 flex items-center justify-center mb-3">
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
          <p className="text-white/40 text-sm mt-2 min-h-[20px]">
            {matchmakingStatus || 'Scanning for active peers...'}
          </p>
        </div>

        {/* Fallback Notice & Action when matchmaking takes longer */}
        {showSizeFallback && (
          <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 mt-6 text-center animate-fade-in">
            <h4 className="text-white text-base font-semibold mb-1.5">
              Taking longer than usual
            </h4>
            <p className="text-white/40 text-xs mb-4 leading-relaxed">
              {matchmakingSize > 2
                ? `Few players are currently in the ${matchmakingSize}-player queue. Switch to a 2-Player Duel to play immediately?`
                : 'No peers found in the public queue right now. You can create a private table to invite friends.'}
            </p>
            <div>
              {matchmakingSize > 2 ? (
                <button
                  type="button"
                  onClick={onSwitchTo2Player}
                  className="w-full h-[48px] rounded-full bg-white hover:bg-white/90 text-black font-bold text-sm transition-all flex items-center justify-center cursor-pointer shadow-lg active:scale-98"
                >
                  Switch to 2-Player Duel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenPrivate}
                  className="w-full h-[48px] rounded-full bg-white hover:bg-white/90 text-black font-bold text-sm transition-all flex items-center justify-center cursor-pointer shadow-lg active:scale-98"
                >
                  Create Private Table
                </button>
              )}
            </div>
          </div>
        )}

        {/* Cancel Search Button (clean Bloom style without inside icon) */}
        <button
          type="button"
          onClick={onCancel}
          className="w-full h-[48px] rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-semibold text-sm transition-all flex items-center justify-center cursor-pointer active:scale-98 mt-6"
        >
          Cancel Search
        </button>
      </div>
    </div>
  );
};

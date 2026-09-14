import React from 'react';
import BackImg from '../../assets/Back.png';
import { CardTemplate } from './CardTemplate';

export const CardView = ({ card, faceDown = false, isSelected = false, shimmerStatus = null, onClick, className = '' }) => {
  // 1. Face-Down Card Render
  if (faceDown) {
    return (
      <div 
        onClick={onClick}
        data-card="true"
        className={`table-playing-card rounded-lg sm:rounded-xl bg-black overflow-hidden flex items-center justify-center cursor-default shadow-lg transition-all select-none relative opacity-100 playing-card border border-white/10 ${className}`}
        style={{ aspectRatio: '250 / 350' }}
      >
        <img 
          src={BackImg} 
          alt="Card Back" 
          className="w-full h-full object-cover pointer-events-none block opacity-100 select-none rounded-[inherit]"
        />
      </div>
    );
  }

  // 2. Face-Up Card Template Render
  const hasGlowOrShimmer = isSelected || !!shimmerStatus;

  return (
    <div 
      className={`table-playing-card relative rounded-lg sm:rounded-xl ${
        hasGlowOrShimmer ? 'shadow-none' : 'playing-card'
      } ${className}`}
    >
      <CardTemplate 
        card={card}
        isSelected={isSelected}
        shimmerStatus={shimmerStatus}
        onClick={onClick}
        className="w-full h-full"
      />
    </div>
  );
};

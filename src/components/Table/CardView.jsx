import React, { useState } from 'react';

import AceImg from '../../assets/Ace.png';
import KingImg from '../../assets/King.png';
import QueenImg from '../../assets/Queen.png';
import JokerImg from '../../assets/Joker.png';
import BackImg from '../../assets/Back.png';

const ASSET_IMAGES = {
  ace: AceImg,
  king: KingImg,
  queen: QueenImg,
  joker: JokerImg,
  back: BackImg
};

export const CardView = ({ card, faceDown = false, isSelected = false, onClick, className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const { rank } = card || { rank: 'A' };
  const isJoker = rank === 'JOKER';

  let keyName = 'ace';
  let symbol = 'A';
  let title = 'Ace';
  let suitIcon = '♠';

  if (rank === 'K') {
    keyName = 'king';
    symbol = 'K';
    title = 'King';
    suitIcon = '◆';
  } else if (rank === 'Q') {
    keyName = 'queen';
    symbol = 'Q';
    title = 'Queen';
    suitIcon = '♥';
  } else if (isJoker) {
    keyName = 'joker';
    symbol = '★';
    title = 'Joker';
    suitIcon = '🃏';
  }

  const currentImgSrc = !imgError ? (faceDown ? ASSET_IMAGES.back : ASSET_IMAGES[keyName]) : null;

  const handleImgError = () => {
    setImgError(true);
  };

  // 1. Face-Down Card Render
  if (faceDown) {
    return (
      <div 
        onClick={onClick}
        data-card="true"
        className={`table-playing-card rounded-lg sm:rounded-xl bg-black overflow-hidden flex items-center justify-center cursor-default shadow-lg transition-all select-none relative opacity-100 playing-card ${!currentImgSrc ? 'border border-white/15' : ''} ${className}`}
      >
        {currentImgSrc ? (
          <img 
            src={currentImgSrc} 
            alt="Card Back" 
            onError={handleImgError}
            className="w-full h-full object-cover pointer-events-none block opacity-100 select-none rounded-[inherit]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <span className="font-serif text-white/30 text-lg font-bold">D</span>
            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest mt-0.5">Deceit</span>
          </div>
        )}
      </div>
    );
  }

  // 2. Face-Up Card Render
  return (
    <div
      onClick={onClick}
      data-card="true"
      className={`table-playing-card rounded-lg sm:rounded-xl bg-black cursor-pointer select-none relative overflow-hidden transition-all ${
        isSelected 
          ? 'shadow-none' 
          : 'playing-card shadow-md hover:shadow-xl'
      } ${!currentImgSrc ? 'border border-white/15' : ''} ${className}`}
    >
      {/* Minimal White Shimmer Stroke for Selected Card - Zero Drop Shadow */}
      {isSelected && (
        <div className="card-shimmer-stroke" />
      )}

      {currentImgSrc ? (
        /* Image Card Presentation - Pure Image Only, No Overlaid Text, No Stroke */
        <img 
          src={currentImgSrc} 
          alt={title} 
          onError={handleImgError}
          className="w-full h-full object-cover pointer-events-none block select-none rounded-[inherit]"
        />
      ) : (
        /* Sleek Typography Vector Card (Fallback) */
        <div className="w-full h-full flex flex-col justify-between p-2.5">
          {/* Top Corner */}
          <div className="flex items-center justify-between leading-none">
            <div className="flex flex-col items-center">
              <span className="font-serif font-bold text-base md:text-lg text-white">
                {symbol}
              </span>
              <span className="text-[10px] text-white/40">
                {suitIcon}
              </span>
            </div>
            {isJoker && (
              <span className="text-[9px] font-mono px-1 rounded bg-white/10 text-white border border-white/10">
                Wild
              </span>
            )}
          </div>

          {/* Center Art */}
          <div className="flex flex-col items-center justify-center my-auto">
            {isJoker ? (
              <div className="flex flex-col items-center">
                <span className="text-2xl md:text-3xl filter grayscale contrast-125">
                  🃏
                </span>
                <span className="text-[9px] font-mono text-white/50 tracking-wider mt-0.5">
                  Truth
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="font-serif text-3xl md:text-4xl font-bold text-white">
                  {symbol}
                </span>
                <span className="text-[8px] font-mono text-white/40 tracking-widest uppercase mt-0.5">
                  {title}
                </span>
              </div>
            )}
          </div>

          {/* Inverted Bottom Corner */}
          <div className="flex items-center justify-between leading-none rotate-180">
            <div className="flex flex-col items-center">
              <span className="font-serif font-bold text-base md:text-lg text-white">
                {symbol}
              </span>
              <span className="text-[10px] text-white/40">
                {suitIcon}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

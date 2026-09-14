import React, { useState, useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { useNostr } from '../../../context/NostrContext';
import { useProfile } from '../../../context/ProfileContext';
import { sound } from '../../../services/sound';
import { BloubEmblemIcon } from '../../Bloub/BloubEmblemIcon';


const hexToHsl = (hex) => {
  if (!hex) return [210, 80, 50];
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return [210, 80, 50];
  const num = parseInt(c, 16);
  let r = (num >> 16) / 255;
  let g = ((num >> 8) & 255) / 255;
  let b = (num & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

export const GameOverModal = () => {
  const { 
    soleSurvivor, 
    endGameReason, 
    players, 
    leaveRoom, 
    gameState,
    isRouletteActive
  } = useGame();
  const { pubkey } = useNostr();
  const { profile } = useProfile();

  const [hasDismissedSpectate, setHasDismissedSpectate] = useState(false);
  const [windowSize, setWindowSize] = useState({
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 640 : false,
    isLaptop: typeof window !== 'undefined' ? window.innerWidth >= 768 && (window.innerHeight <= 860 || (window.innerWidth <= 1440 && window.innerHeight <= 900)) : false,
  });

  // Play Victory or Fail Sound once on mount
  useEffect(() => {
    if (soleSurvivor) {
      if (soleSurvivor.pk === pubkey) {
        sound.playWin();
      } else {
        sound.playFail();
      }
    }
  }, [soleSurvivor, pubkey]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      const isLaptop = window.innerWidth >= 768 && (window.innerHeight <= 860 || (window.innerWidth <= 1440 && window.innerHeight <= 900));
      setWindowSize({ isMobile, isLaptop });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const me = players.find(p => p.pk === pubkey);
  const isAlive = me ? me.isAlive : true;

  // Reset spectate dismissal if entering lobby or revived
  useEffect(() => {
    if (gameState === 'lobby' || isAlive) {
      setHasDismissedSpectate(false);
    }
  }, [gameState, isAlive]);

  useEffect(() => {
    return () => {
      sound.stopWin();
      sound.stopFail();
    };
  }, []);

  // Modal Visibility Conditions
  const isGameOver = Boolean(soleSurvivor) || gameState === 'ended';
  const isEliminatedInProgress = !isGameOver && gameState === 'playing' && !isAlive && !isRouletteActive;

  // Do not overlap with ongoing gun roulette cinematic
  if (isRouletteActive) return null;

  // Nothing to display if game is ongoing and player is alive, or player already chose to spectate
  if (!isGameOver && (!isEliminatedInProgress || hasDismissedSpectate)) {
    return null;
  }

  // Determine state values
  const isWinner = soleSurvivor ? soleSurvivor.pk === pubkey : false;

  let displayShape = profile.shape || 'cercle';
  let displayColor = profile.color || '#3b93f0';
  let displayName = profile.name || 'You';

  if (isWinner && soleSurvivor) {
    displayShape = soleSurvivor.shape || (soleSurvivor.pk === pubkey ? profile.shape : 'cercle');
    displayColor = soleSurvivor.color || (soleSurvivor.pk === pubkey ? profile.color : '#3b93f0');
    displayName = soleSurvivor.name || (soleSurvivor.pk === pubkey ? (profile.name || 'You') : 'Champion');
  } else if (me) {
    displayShape = me.shape || profile.shape || 'cercle';
    displayColor = me.color || profile.color || '#e8483f';
    displayName = me.name || profile.name || 'You';
  }

  // Generate dynamic shine and border track matched to character's color theme
  const [h, s] = hexToHsl(displayColor);
  const themeStrokeBase = `hsl(${h}, ${Math.max(s, 45)}%, 16%)`;
  const themePeak = `hsl(${h}, ${Math.max(s, 35)}%, 82%)`;
  const themeMid = `hsla(${h}, ${Math.max(s, 50)}%, 65%, 0.4)`;
  const themeLow = `hsla(${h}, ${Math.max(s, 50)}%, 50%, 0.1)`;
  const themeShimmerGradient = `conic-gradient(from 0deg, ${themePeak} 0deg, ${themeMid} 10deg, ${themeLow} 20deg, transparent 25deg, transparent 335deg, ${themeLow} 340deg, ${themeMid} 350deg, ${themePeak} 360deg)`;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[350] flex flex-col justify-between items-center py-8 sm:py-12 px-4 select-none animate-fade-in overflow-y-auto">
      {/* SVG DEFS FOR 3D METAL GOLD PATTERN & EMBLEM FILTERS */}
      <svg width="0" height="0" className="absolute pointer-events-none opacity-0 overflow-hidden" aria-hidden="true">
        <defs>
          <pattern id="card-gold-pattern" patternUnits="userSpaceOnUse" width="160" height="160">
            <image href="/cards/gold-texture-wallpaper.jpg" x="0" y="0" width="160" height="160" preserveAspectRatio="xMidYMid slice" />
          </pattern>

          {/* 3D Metal Gold Filter FOR EMBLEM (Exactly matching metal.svg) */}
          <filter id="card-metal-icon" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.6" result="blur" />
            <feDiffuseLighting in="blur" surfaceScale="3" diffuseConstant="1.2" lightingColor="#ffffff" result="diffuse">
              <fePointLight x="80" y="60" z="70" />
            </feDiffuseLighting>
            <feSpecularLighting in="blur" surfaceScale="3" specularConstant="1.0" specularExponent="20" lightingColor="#fffadb" result="specular">
              <fePointLight x="80" y="60" z="70" />
            </feSpecularLighting>
            <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="diffuse" in2="SourceGraphic" result="shadedTexture" />
            <feComposite operator="arithmetic" k1="0" k2="1" k3="1" k4="0" in="shadedTexture" in2="specular" result="litPaint" />
            <feComposite operator="in" in="litPaint" in2="SourceAlpha" result="finalMetal" />
            <feDropShadow dx="0" dy="0.35" stdDeviation="0.18" floodColor="#2a2000" floodOpacity="0.35" />
          </filter>

          {/* 3D Metal Gold Filter FOR CORNER TEXT */}
          <filter id="card-metal-text" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.2" result="blur" />
            <feDiffuseLighting in="blur" surfaceScale="1.8" diffuseConstant="1.2" lightingColor="#ffffff" result="diffuse">
              <fePointLight x="50" y="10" z="25" />
            </feDiffuseLighting>
            <feSpecularLighting in="blur" surfaceScale="1.8" specularConstant="1.1" specularExponent="24" lightingColor="#fffadb" result="specular">
              <fePointLight x="50" y="10" z="25" />
            </feSpecularLighting>
            <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="diffuse" in2="SourceGraphic" result="shadedTexture" />
            <feComposite operator="arithmetic" k1="0" k2="1" k3="1" k4="0" in="shadedTexture" in2="specular" result="litPaint" />
            <feComposite operator="in" in="litPaint" in2="SourceAlpha" result="finalMetal" />
            <feDropShadow dx="0" dy="0.08" stdDeviation="0.05" floodColor="#000000" floodOpacity="0.25" />
          </filter>

          {/* 3D Metal Gold Filter FOR PLAYER NAME (Centered lighting for larger font) */}
          <filter id="card-metal-name" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.25" result="blur" />
            <feDiffuseLighting in="blur" surfaceScale="1.8" diffuseConstant="1.2" lightingColor="#ffffff" result="diffuse">
              <fePointLight x="140" y="18" z="44" />
            </feDiffuseLighting>
            <feSpecularLighting in="blur" surfaceScale="1.8" specularConstant="1.15" specularExponent="24" lightingColor="#fffadb" result="specular">
              <fePointLight x="140" y="18" z="44" />
            </feSpecularLighting>
            <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="diffuse" in2="SourceGraphic" result="shadedTexture" />
            <feComposite operator="arithmetic" k1="0" k2="1" k3="1" k4="0" in="shadedTexture" in2="specular" result="litPaint" />
            <feComposite operator="in" in="litPaint" in2="SourceAlpha" result="finalMetal" />
            <feDropShadow dx="0" dy="0.12" stdDeviation="0.07" floodColor="#000000" floodOpacity="0.28" />
          </filter>
        </defs>
      </svg>

      {/* 1. TOP: Title & Subtitle */}
      <div className="flex flex-col items-center text-center mt-2 sm:mt-4 z-20">
        <h1
          className={`text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight ${
            isWinner 
              ? 'text-white drop-shadow-[0_2px_14px_rgba(251,191,36,0.25)]' 
              : (isEliminatedInProgress 
                  ? 'text-rose-400 drop-shadow-[0_2px_14px_rgba(244,63,94,0.25)]' 
                  : 'text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]')
          }`}
          style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}
        >
          {isWinner 
            ? 'Victory' 
            : (isEliminatedInProgress ? 'Got Eliminated' : 'Defeat')}
        </h1>

        <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-white/50 mt-2 sm:mt-3">
          {isWinner 
            ? 'Table Champion' 
            : (isEliminatedInProgress 
                ? 'Match Still In Progress' 
                : 'Eliminated from Table')}
        </span>
      </div>

      {/* 2. MIDDLE: Victory / Defeat Card with 3D Perspective Hover Effect */}
      <div 
        className="flex flex-col items-center justify-center my-auto py-4 sm:py-6 z-20 animate-slide-up" 
        style={{ perspective: '1000px' }}
      >
        <div 
          className="relative select-none rounded-xl sm:rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.35)] cursor-pointer"
          style={{
            width: windowSize.isMobile ? '215px' : (windowSize.isLaptop ? '235px' : '255px'),
            aspectRatio: '250 / 350',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease',
            willChange: 'transform'
          }}
          onMouseMove={(e) => {
            const card = e.currentTarget;
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            card.style.setProperty('--mouse-x', `${(x * 100).toFixed(1)}%`);
            card.style.setProperty('--mouse-y', `${(y * 100).toFixed(1)}%`);
            const rotX = ((0.5 - y) * 24).toFixed(2);
            const rotY = ((x - 0.5) * 24).toFixed(2);
            card.style.transition = 'transform 0.08s ease-out, box-shadow 0.2s ease';
            card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.05, 1.05, 1.05)`;
            card.style.boxShadow = '0 24px 48px -8px rgba(0,0,0,0.55)';
          }}
          onMouseLeave={(e) => {
            const card = e.currentTarget;
            card.style.setProperty('--mouse-x', '50%');
            card.style.setProperty('--mouse-y', '35%');
            card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease';
            card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
          }}
        >
          {/* Tight, natural subtle ambient glow blooming outside card in character color theme */}
          <div 
            className="absolute -inset-1 sm:-inset-1.5 rounded-xl sm:rounded-2xl pointer-events-none z-0 overflow-hidden"
            style={{
              filter: 'blur(5px)',
              opacity: 0.22,
              willChange: 'transform'
            }}
          >
            <div 
              className="card-border-beam"
              style={{
                background: themeShimmerGradient
              }}
            />
          </div>

          {/* Crisp Shimmer Track Layer in character color theme */}
          <div 
            className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-10"
            style={{
              backgroundColor: themeStrokeBase,
              padding: '2px'
            }}
          >
            <div 
              className="card-border-beam"
              style={{
                background: themeShimmerGradient
              }}
            />
          </div>

          {/* Card Inner Face - Concentric rounded corners in Character Color */}
          <div 
            className="relative w-full h-full rounded-[8px] sm:rounded-[12px] overflow-hidden z-20 flex flex-col justify-between p-2.5"
            style={{ 
              margin: '2px',
              width: 'calc(100% - 4px)',
              height: 'calc(100% - 4px)',
              backgroundColor: displayColor 
            }}
          >
            {/* Real Leather Macro Texture Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url("/cards/leather-macro-shot.jpg")',
                opacity: 0.22,
                mixBlendMode: 'overlay'
              }}
            />

            {/* Mouse Ambient Lighting Sheen */}
            <div 
              className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-200"
              style={{
                background: 'radial-gradient(circle 140px at var(--mouse-x, 50%) var(--mouse-y, 35%), rgba(255,255,255,0.3) 0%, transparent 100%)',
                mixBlendMode: 'screen'
              }}
            />

            {/* TOP LEFT: Winner / Loser in 3D Gold Metal Gloock */}
            <div 
              className="absolute z-20 pointer-events-none select-none card-gold-label"
              style={{ top: 12, left: 14 }}
            >
              <svg viewBox="0 0 100 24" className="h-5 sm:h-6 w-auto overflow-visible pointer-events-none">
                <text
                  x="0"
                  y="19"
                  fontFamily="'Gloock', serif"
                  fontSize="22"
                  fontWeight="400"
                  fill="url(#card-gold-pattern)"
                  filter="url(#card-metal-text)"
                  letterSpacing="0.02em"
                >
                  {isWinner ? 'Winner' : 'Loser'}
                </text>
              </svg>
            </div>

            {/* CENTER: The Respected Victory / Dead Bloub with 3D Gold Metal Emblem Effect & Player Name in Exact Middle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-3 -translate-y-3.5 sm:-translate-y-4">
              <div className="relative flex items-center justify-center">
                <BloubEmblemIcon
                  shape={displayShape}
                  isWinner={isWinner}
                  className="w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44"
                />
              </div>

              {/* Player Name (Enlarged) positioned snugly with very less space below Character Bloub */}
              <div className="-mt-9 sm:-mt-10 md:-mt-11 flex items-center justify-center select-none max-w-[95%] text-center card-gold-label z-20">
                <svg 
                  viewBox="0 0 280 44" 
                  className="h-9 sm:h-10 md:h-11 w-auto max-w-full overflow-visible pointer-events-none"
                >
                  <text
                    x="140"
                    y="33"
                    textAnchor="middle"
                    fontFamily="'Gloock', serif"
                    fontSize="38"
                    fontWeight="400"
                    fill="url(#card-gold-pattern)"
                    filter="url(#card-metal-name)"
                    letterSpacing="0.02em"
                  >
                    {displayName}
                  </text>
                </svg>
              </div>
            </div>

            {/* BOTTOM RIGHT: Winner / Loser in 3D Gold Metal Gloock */}
            <div 
              className="absolute z-20 pointer-events-none select-none card-gold-label"
              style={{ bottom: 12, right: 14 }}
            >
              <svg viewBox="0 0 100 24" className="h-5 sm:h-6 w-auto overflow-visible pointer-events-none">
                <text
                  x="100"
                  y="19"
                  textAnchor="end"
                  fontFamily="'Gloock', serif"
                  fontSize="22"
                  fontWeight="400"
                  fill="url(#card-gold-pattern)"
                  filter="url(#card-metal-text)"
                  letterSpacing="0.02em"
                >
                  {isWinner ? 'Winner' : 'Loser'}
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM: Actions */}
      <div className="w-full max-w-md flex flex-col items-center justify-center z-20 pb-2 sm:pb-4">
        {isEliminatedInProgress ? (
          /* Mid-game Elimination: Spectate or Close */
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
            <button
              type="button"
              onClick={() => setHasDismissedSpectate(true)}
              className="w-full sm:w-auto flex-1 h-12 bg-white hover:bg-white/90 text-black font-semibold rounded-full transition-all flex items-center justify-center text-sm shadow-2xl cursor-pointer active:scale-95 px-8"
            >
              Spectate
            </button>

            <button
              type="button"
              onClick={leaveRoom}
              className="w-full sm:w-auto flex-1 h-12 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full transition-all flex items-center justify-center text-sm border border-white/10 cursor-pointer active:scale-95 px-8"
            >
              Close
            </button>
          </div>
        ) : (
          /* Game Over (Victory or Defeat): ONLY Close button */
          <div className="flex items-center justify-center w-full max-w-xs">
            <button
              type="button"
              onClick={leaveRoom}
              className="w-full h-12 bg-white hover:bg-white/90 text-black font-semibold rounded-full transition-all flex items-center justify-center text-sm shadow-2xl cursor-pointer active:scale-95 px-8"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

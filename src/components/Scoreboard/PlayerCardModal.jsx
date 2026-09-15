import React, { useState, useEffect } from 'react';
import { sound } from '../../services/sound';
import { BloubEmblemIcon } from '../Bloub/BloubEmblemIcon';
import { BloubAvatar } from '../Bloub/BloubAvatar';

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

export const PlayerCardModal = ({ player, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedPk, setCopiedPk] = useState(false);
  const [windowSize, setWindowSize] = useState({
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 640 : false,
    isLaptop: typeof window !== 'undefined' ? window.innerWidth >= 768 && (window.innerHeight <= 860 || (window.innerWidth <= 1440 && window.innerHeight <= 900)) : false,
  });

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

  if (!player) return null;

  const isFirst = player.rank === 1;
  const displayShape = player.shape || 'cercle';
  const displayColor = player.color || '#3b93f0';
  const displayName = player.name || 'Anonymous';
  const totalMatches = player.totalMatches || ((player.wins || 0) + (player.defeats || 0)) || 0;
  const winRate = player.winRate !== undefined ? player.winRate : (totalMatches > 0 ? Math.round(((player.wins || 0) / totalMatches) * 100) : 0);

  // Generate dynamic shine and border track matched to character's color theme
  const [h, s] = hexToHsl(displayColor);
  const themeStrokeBase = `hsl(${h}, ${Math.max(s, 45)}%, 16%)`;
  const themePeak = `hsl(${h}, ${Math.max(s, 35)}%, 82%)`;
  const themeMid = `hsla(${h}, ${Math.max(s, 50)}%, 65%, 0.4)`;
  const themeLow = `hsla(${h}, ${Math.max(s, 50)}%, 50%, 0.1)`;
  const themeShimmerGradient = `conic-gradient(from 0deg, ${themePeak} 0deg, ${themeMid} 10deg, ${themeLow} 20deg, transparent 25deg, transparent 335deg, ${themeLow} 340deg, ${themeMid} 350deg, ${themePeak} 360deg)`;

  const handleCardClick = (e) => {
    e.stopPropagation();
    try {
      sound.playCardFlip();
    } catch (err) {}
    setIsFlipped(prev => !prev);
  };

  const handleCopyId = (e) => {
    e.stopPropagation();
    if (!player.pk) return;
    navigator.clipboard.writeText(player.pk);
    setCopiedPk(true);
    setTimeout(() => setCopiedPk(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[350] flex flex-col justify-between items-center py-8 sm:py-12 px-4 select-none animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* SVG DEFS FOR 3D METAL GOLD PATTERN & EMBLEM FILTERS */}
      <svg width="0" height="0" className="absolute pointer-events-none opacity-0 overflow-hidden" aria-hidden="true">
        <defs>
          <pattern id="card-gold-pattern" patternUnits="userSpaceOnUse" width="160" height="160">
            <image href="/cards/gold-texture-wallpaper.jpg" x="0" y="0" width="160" height="160" preserveAspectRatio="xMidYMid slice" />
          </pattern>

          {/* 3D Metal Gold Filter FOR EMBLEM */}
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

          {/* 3D Metal Gold Filter FOR PLAYER NAME */}
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
            isFirst 
              ? 'text-white drop-shadow-[0_2px_14px_rgba(251,191,36,0.3)]' 
              : 'text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]'
          }`}
          style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}
        >
          {isFirst ? 'Victory' : `Rank #${player.rank}`}
        </h1>

        <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-white/50 mt-2 sm:mt-3">
          {isFirst 
            ? 'Leaderboard Champion' 
            : `Contender • ${player.wins || 0} ${(player.wins || 0) === 1 ? 'Victory' : 'Victories'}`}
        </span>
      </div>

      {/* 2. MIDDLE: Interactive 3D Card with Tilt & Flip */}
      <div 
        className="flex flex-col items-center justify-center my-auto py-4 sm:py-6 z-20 animate-slide-up" 
        style={{ perspective: '1200px' }}
      >
        <div
          onClick={handleCardClick}
          className="relative select-none rounded-xl sm:rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.45)] cursor-pointer group"
          style={{
            width: windowSize.isMobile ? '215px' : (windowSize.isLaptop ? '235px' : '255px'),
            aspectRatio: '250 / 350',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
            willChange: 'transform'
          }}
          onMouseMove={(e) => {
            if (isFlipped) return; // disable hover tilt on stats back face
            const card = e.currentTarget;
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            card.style.setProperty('--mouse-x', `${(x * 100).toFixed(1)}%`);
            card.style.setProperty('--mouse-y', `${(y * 100).toFixed(1)}%`);
            const rotX = ((0.5 - y) * 20).toFixed(2);
            const rotY = ((x - 0.5) * 20).toFixed(2);
            card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04, 1.04, 1.04)`;
            card.style.boxShadow = '0 24px 48px -8px rgba(0,0,0,0.55)';
          }}
          onMouseLeave={(e) => {
            const card = e.currentTarget;
            card.style.setProperty('--mouse-x', '50%');
            card.style.setProperty('--mouse-y', '35%');
            card.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
            card.style.boxShadow = '0 12px 32px rgba(0,0,0,0.45)';
          }}
        >
          {/* Outer Ambient Glow Blooming */}
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
              style={{ background: themeShimmerGradient }}
            />
          </div>

          {/* Crisp Shimmer Track Layer */}
          <div 
            className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-10"
            style={{
              backgroundColor: themeStrokeBase,
              padding: '2px'
            }}
          >
            <div 
              className="card-border-beam"
              style={{ background: themeShimmerGradient }}
            />
          </div>

          {/* ================= CARD FRONT FACE ================= */}
          <div 
            className="absolute inset-0 rounded-[8px] sm:rounded-[12px] overflow-hidden z-20 flex flex-col justify-between p-2.5"
            style={{ 
              margin: '2px',
              width: 'calc(100% - 4px)',
              height: 'calc(100% - 4px)',
              backgroundColor: displayColor,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)'
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

            {/* TOP LEFT: Winner / Rank in 3D Gold Metal Gloock */}
            <div 
              className="absolute z-20 pointer-events-none select-none card-gold-label"
              style={{ top: 12, left: 14 }}
            >
              <svg viewBox="0 0 100 24" className="h-5 sm:h-6 w-auto overflow-visible pointer-events-none">
                <text
                  x="0"
                  y="19"
                  fontFamily="'Gloock', serif"
                  fontSize={isFirst ? "22" : "18"}
                  fontWeight="400"
                  fill="url(#card-gold-pattern)"
                  filter="url(#card-metal-text)"
                  letterSpacing="0.02em"
                >
                  {isFirst ? 'Winner' : `#${player.rank}`}
                </text>
              </svg>
            </div>

            {/* CENTER: 3D Gold Metal Emblem Icon + Player Name */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-3 -translate-y-3.5 sm:-translate-y-4">
              <div className="relative flex items-center justify-center">
                <BloubEmblemIcon
                  shape={displayShape}
                  expression={isFirst ? 'victory' : 'normal'}
                  isWinner={isFirst}
                  className="w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44"
                />
              </div>

              {/* Player Name positioned snugly below Character Bloub */}
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

            {/* BOTTOM RIGHT: Winner / Rank in 3D Gold Metal Gloock */}
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
                  fontSize={isFirst ? "22" : "18"}
                  fontWeight="400"
                  fill="url(#card-gold-pattern)"
                  filter="url(#card-metal-text)"
                  letterSpacing="0.02em"
                >
                  {isFirst ? 'Winner' : `#${player.rank}`}
                </text>
              </svg>
            </div>
          </div>

          {/* ================= CARD BACK FACE (AUTHENTIC PLAYING CARD REVERSE) ================= */}
          <div 
            className="absolute inset-0 rounded-[8px] sm:rounded-[12px] overflow-hidden z-20 flex flex-col justify-between p-3 select-none pointer-events-auto"
            style={{ 
              margin: '2px',
              width: 'calc(100% - 4px)',
              height: 'calc(100% - 4px)',
              backgroundColor: displayColor,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
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

            {/* TOP LEFT: Rank in 3D Gold Metal Gloock */}
            <div 
              className="absolute z-20 pointer-events-none select-none card-gold-label"
              style={{ top: 12, left: 14 }}
            >
              <svg viewBox="0 0 100 24" className="h-5 sm:h-6 w-auto overflow-visible pointer-events-none">
                <text
                  x="0"
                  y="19"
                  fontFamily="'Gloock', serif"
                  fontSize="18"
                  fontWeight="400"
                  fill="url(#card-gold-pattern)"
                  filter="url(#card-metal-text)"
                  letterSpacing="0.02em"
                >
                  {isFirst ? 'Winner' : `#${player.rank}`}
                </text>
              </svg>
            </div>

            {/* BOTTOM RIGHT: Rank in 3D Gold Metal Gloock */}
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
                  fontSize="18"
                  fontWeight="400"
                  fill="url(#card-gold-pattern)"
                  filter="url(#card-metal-text)"
                  letterSpacing="0.02em"
                >
                  {isFirst ? 'Winner' : `#${player.rank}`}
                </text>
              </svg>
            </div>

            {/* FULL-CARD ENGRAVED GOLD METALLIC DOSSIER */}
            <svg 
              viewBox="0 0 250 350" 
              className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
            >
              {/* 1. Double Inset Filigree Border Frame */}
              <rect 
                x="12" y="12" width="226" height="326" rx="9" 
                fill="none" 
                stroke="url(#card-gold-pattern)" 
                strokeWidth="1.6" 
                filter="url(#card-metal-text)" 
              />
              <rect 
                x="16" y="16" width="218" height="318" rx="6" 
                fill="none" 
                stroke="url(#card-gold-pattern)" 
                strokeWidth="0.7" 
                opacity="0.65" 
              />

              {/* 4 Corner Fleur Accents */}
              <polygon points="20,17 23,20 20,23 17,20" fill="url(#card-gold-pattern)" filter="url(#card-metal-text)" />
              <polygon points="230,17 233,20 230,23 227,20" fill="url(#card-gold-pattern)" filter="url(#card-metal-text)" />
              <polygon points="20,327 23,330 20,333 17,330" fill="url(#card-gold-pattern)" filter="url(#card-metal-text)" />
              <polygon points="230,327 233,330 230,333 227,330" fill="url(#card-gold-pattern)" filter="url(#card-metal-text)" />

              {/* 2. Top Header / Player Name in 3D Gold Metal */}
              <text 
                x="125" y="32" 
                textAnchor="middle" 
                fontFamily="'Inter', sans-serif" 
                fontSize="7.5" 
                fontWeight="700" 
                letterSpacing="0.32em" 
                fill="url(#card-gold-pattern)" 
                filter="url(#card-metal-text)"
              >
                {isFirst ? '★ CHAMPION DOSSIER ★' : 'PLAYER DOSSIER'}
              </text>

              <text 
                x="125" y="58" 
                textAnchor="middle" 
                fontFamily="'Gloock', serif" 
                fontSize="24" 
                fontWeight="400" 
                fill="url(#card-gold-pattern)" 
                filter="url(#card-metal-name)"
                letterSpacing="0.02em"
              >
                {displayName}
              </text>

              <text 
                x="125" y="73" 
                textAnchor="middle" 
                fontFamily="'Inter', sans-serif" 
                fontSize="8.5" 
                fontWeight="600" 
                letterSpacing="0.22em" 
                fill="url(#card-gold-pattern)" 
                opacity="0.8"
              >
                {isFirst ? 'TABLE CHAMPION • RANK #1' : `RANK #${player.rank} CONTENDER`}
              </text>

              {/* Top Flourish Divider */}
              <path 
                d="M 40 82 L 105 82 M 145 82 L 210 82" 
                stroke="url(#card-gold-pattern)" 
                strokeWidth="0.8" 
                opacity="0.6" 
              />
              <polygon points="125,79 128,82 125,85 122,82" fill="url(#card-gold-pattern)" filter="url(#card-metal-text)" />

              {/* 3. Engraved Four Pillars Cartouche (Stats Grid) */}
              <rect 
                x="26" y="92" width="198" height="152" rx="10" 
                fill="#000000" 
                fillOpacity="0.16" 
                stroke="url(#card-gold-pattern)" 
                strokeWidth="1" 
                opacity="0.85" 
              />

              {/* Inner Crosshair Dividers */}
              <line x1="34" y1="168" x2="216" y2="168" stroke="url(#card-gold-pattern)" strokeWidth="0.8" opacity="0.5" />
              <line x1="125" y1="100" x2="125" y2="236" stroke="url(#card-gold-pattern)" strokeWidth="0.8" opacity="0.5" />
              <polygon points="125,164 129,168 125,172 121,168" fill="url(#card-gold-pattern)" filter="url(#card-metal-text)" />

              {/* Quadrant 1: VICTORIES */}
              <text 
                x="75" y="136" 
                textAnchor="middle" 
                fontFamily="'Gloock', serif" 
                fontSize="32" 
                fontWeight="400" 
                fill="url(#card-gold-pattern)" 
                filter="url(#card-metal-name)"
              >
                {player.wins || 0}
              </text>
              <text 
                x="75" y="152" 
                textAnchor="middle" 
                fontFamily="'Inter', sans-serif" 
                fontSize="7.5" 
                fontWeight="700" 
                letterSpacing="0.22em" 
                fill="url(#card-gold-pattern)" 
                filter="url(#card-metal-text)"
              >
                VICTORIES
              </text>

              {/* Quadrant 2: WIN RATE */}
              <text 
                x="175" y="136" 
                textAnchor="middle" 
                fontFamily="'Gloock', serif" 
                fontSize="32" 
                fontWeight="400" 
                fill="url(#card-gold-pattern)" 
                filter="url(#card-metal-name)"
              >
                {winRate}%
              </text>
              <text 
                x="175" y="152" 
                textAnchor="middle" 
                fontFamily="'Inter', sans-serif" 
                fontSize="7.5" 
                fontWeight="700" 
                letterSpacing="0.22em" 
                fill="url(#card-gold-pattern)" 
                filter="url(#card-metal-text)"
              >
                WIN RATE
              </text>

              {/* Quadrant 3: DEFEATS */}
              <text 
                x="75" y="210" 
                textAnchor="middle" 
                fontFamily="'Gloock', serif" 
                fontSize="28" 
                fontWeight="400" 
                fill="url(#card-gold-pattern)" 
                filter="url(#card-metal-name)"
              >
                {player.defeats || 0}
              </text>
              <text 
                x="75" y="226" 
                textAnchor="middle" 
                fontFamily="'Inter', sans-serif" 
                fontSize="7.5" 
                fontWeight="700" 
                letterSpacing="0.22em" 
                fill="url(#card-gold-pattern)" 
                filter="url(#card-metal-text)"
              >
                DEFEATS
              </text>

              {/* Quadrant 4: MATCHES */}
              <text 
                x="175" y="210" 
                textAnchor="middle" 
                fontFamily="'Gloock', serif" 
                fontSize="28" 
                fontWeight="400" 
                fill="url(#card-gold-pattern)" 
                filter="url(#card-metal-name)"
              >
                {totalMatches}
              </text>
              <text 
                x="175" y="226" 
                textAnchor="middle" 
                fontFamily="'Inter', sans-serif" 
                fontSize="7.5" 
                fontWeight="700" 
                letterSpacing="0.22em" 
                fill="url(#card-gold-pattern)" 
                filter="url(#card-metal-text)"
              >
                MATCHES
              </text>

              {/* Bottom Decorative Flourish */}
              <path 
                d="M 50 256 L 105 256 M 145 256 L 200 256" 
                stroke="url(#card-gold-pattern)" 
                strokeWidth="0.8" 
                opacity="0.6" 
              />
              <polygon points="125,253 128,256 125,259 122,256" fill="url(#card-gold-pattern)" filter="url(#card-metal-text)" />
            </svg>

            {/* 4. Bottom Nostr Identity Ribbon (Click to Copy) */}
            <div 
              className="absolute bottom-5 inset-x-8 z-20 flex flex-col items-center pointer-events-auto cursor-pointer group/ribbon"
              onClick={handleCopyId}
            >
              <div className="w-full py-1 px-3 rounded-full bg-black/35 hover:bg-black/55 border border-white/20 group-hover/ribbon:border-white/40 transition-all flex items-center justify-between shadow-inner">
                <span className="material-symbols-rounded text-xs text-white/50 group-hover/ribbon:text-white/80">
                  key
                </span>
                <span className="font-mono text-[10px] text-white/80 tracking-wider truncate px-1">
                  {copiedPk 
                    ? '✓ COPIED TO CLIPBOARD' 
                    : (player.pk ? `${player.pk.slice(0, 10)}...${player.pk.slice(-6)}` : 'IDENTITY SECRET')}
                </span>
                <span className="material-symbols-rounded text-xs text-white/50 group-hover/ribbon:text-white/80">
                  {copiedPk ? 'check' : 'content_copy'}
                </span>
              </div>
              <span className="text-[7.5px] font-mono uppercase tracking-[0.2em] text-white/40 mt-1">
                Tap to copy Nostr identity
              </span>
            </div>
          </div>
        </div>

        {/* Card Flip Hint */}
        <div className="mt-3.5 flex items-center gap-1.5 text-xs text-white/50 bg-white/5 px-3.5 py-1 rounded-full border border-white/10 pointer-events-none">
          <span className="material-symbols-rounded text-sm">
            {isFlipped ? 'flip_camera_android' : 'touch_app'}
          </span>
          <span>{isFlipped ? 'Click card to view character' : 'Click card to view player stats'}</span>
        </div>
      </div>

      {/* 3. BOTTOM: Actions */}
      <div className="w-full max-w-xs flex items-center justify-center z-20 pb-2 sm:pb-4">
        <button
          type="button"
          onClick={onClose}
          className="w-full h-12 bg-white hover:bg-white/90 text-black font-semibold rounded-full transition-all flex items-center justify-center text-sm shadow-2xl cursor-pointer active:scale-95 px-8"
        >
          Close
        </button>
      </div>
    </div>
  );
};

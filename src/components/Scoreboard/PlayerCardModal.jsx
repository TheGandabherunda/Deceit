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

          {/* ================= CARD BACK FACE (CLEAN, UNCLUTTERED STATS CARD) ================= */}
          <div 
            className="absolute inset-0 rounded-[8px] sm:rounded-[12px] overflow-hidden z-20 flex flex-col justify-between p-5 sm:p-6 select-none pointer-events-auto text-white"
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

            {/* Elegant 3D Gold Inset Outline Frame */}
            <svg 
              viewBox="0 0 250 350" 
              className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
            >
              <rect 
                x="10" y="10" width="230" height="330" rx="9" 
                fill="none" 
                stroke="url(#card-gold-pattern)" 
                strokeWidth="1.6" 
                filter="url(#card-metal-text)" 
              />
              <rect 
                x="14" y="14" width="222" height="322" rx="6" 
                fill="none" 
                stroke="url(#card-gold-pattern)" 
                strokeWidth="0.7" 
                opacity="0.6" 
              />
            </svg>

            {/* Top: Player Name & Clean Rank Tag */}
            <div className="relative z-20 text-center pt-2">
              <h3 
                className="text-2xl sm:text-3xl text-white font-normal truncate tracking-tight"
                style={{ fontFamily: '"Gloock", serif' }}
              >
                {displayName}
              </h3>
              <p className="text-xs text-white/60 font-mono tracking-widest mt-1 uppercase">
                Rank #{player.rank}
              </p>
            </div>

            {/* Middle: Clean 4-Metric Grid */}
            <div className="relative z-20 grid grid-cols-2 gap-2.5 my-auto px-1 py-2">
              {/* Wins */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/30 border border-white/10">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 leading-none">
                  {player.wins || 0}
                </span>
                <span className="text-[11px] text-white/60 font-medium tracking-wide mt-1.5">
                  Wins
                </span>
              </div>

              {/* Defeats */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/30 border border-white/10">
                <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 leading-none">
                  {player.defeats || 0}
                </span>
                <span className="text-[11px] text-white/60 font-medium tracking-wide mt-1.5">
                  Defeats
                </span>
              </div>

              {/* Win Rate */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/30 border border-white/10">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 leading-none">
                  {winRate}%
                </span>
                <span className="text-[11px] text-white/60 font-medium tracking-wide mt-1.5">
                  Win Rate
                </span>
              </div>

              {/* Matches */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/30 border border-white/10">
                <span className="text-2xl sm:text-3xl font-extrabold text-white leading-none">
                  {totalMatches}
                </span>
                <span className="text-[11px] text-white/60 font-medium tracking-wide mt-1.5">
                  Matches
                </span>
              </div>
            </div>

            {/* Bottom: Clean Nostr ID Bar */}
            <div className="relative z-20 px-1 pb-1">
              <div
                onClick={handleCopyId}
                className="w-full py-2 px-3 rounded-xl bg-black/35 hover:bg-black/55 border border-white/10 flex items-center justify-between text-xs text-white/70 hover:text-white transition-colors cursor-pointer group"
                title="Click to copy Nostr Pubkey ID"
              >
                <span className="font-mono text-[10px] text-white/80 tracking-wider truncate pr-2">
                  {copiedPk 
                    ? 'Copied to clipboard!' 
                    : (player.pk ? `${player.pk.slice(0, 10)}...${player.pk.slice(-6)}` : 'Identity Unknown')}
                </span>
                <span className="material-symbols-rounded text-sm text-white/40 group-hover:text-white shrink-0">
                  {copiedPk ? 'check' : 'content_copy'}
                </span>
              </div>
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

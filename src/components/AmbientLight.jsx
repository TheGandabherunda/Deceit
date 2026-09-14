import React, { useMemo } from 'react';

const THEMES = {
  default: {
    // Black ambient noir with subtle neutral depth
    spread1: 'rgba(255, 255, 255, 0.05)',
    spread1Fade: 'rgba(0, 0, 0, 0)',
    spread2: 'rgba(255, 255, 255, 0.09)',
    spread2Fade: 'rgba(0, 0, 0, 0)',
    ledEdge: 'rgba(255, 255, 255, 0.25)',
    ledCenter: 'rgba(255, 255, 255, 0.85)',
    shadowOuter: 'rgba(255, 255, 255, 0.15)',
    shadowInner: 'rgba(255, 255, 255, 0.35)',
    particleBg: '#ffffff',
    particleGlow: 'rgba(255, 255, 255, 0.85)',
    hasColorFlow: false
  },
  A: {
    // Ace's Table: Radiant Diamond / Silver White
    spread1: 'rgba(255, 255, 255, 0.35)',
    spread1Fade: 'rgba(255, 255, 255, 0.08)',
    spread2: 'rgba(255, 255, 255, 0.45)',
    spread2Fade: 'rgba(200, 220, 255, 0.12)',
    ledEdge: 'rgba(255, 255, 255, 0.85)',
    ledCenter: 'rgba(255, 255, 255, 1.0)',
    shadowOuter: 'rgba(255, 255, 255, 0.5)',
    shadowInner: 'rgba(255, 255, 255, 0.7)',
    particleBg: '#ffffff',
    particleGlow: 'rgba(255, 255, 255, 0.8)',
    hasColorFlow: false
  },
  K: {
    // King's Table: Vibrant Gold / Amber
    spread1: 'rgba(202, 138, 4, 0.4)',
    spread1Fade: 'rgba(161, 98, 7, 0.1)',
    spread2: 'rgba(234, 179, 8, 0.55)',
    spread2Fade: 'rgba(250, 204, 21, 0.15)',
    ledEdge: 'rgba(234, 179, 8, 0.85)',
    ledCenter: 'rgba(254, 240, 138, 0.95)',
    shadowOuter: 'rgba(234, 179, 8, 0.65)',
    shadowInner: 'rgba(254, 240, 138, 0.6)',
    particleBg: '#facc15',
    particleGlow: 'rgba(234, 179, 8, 0.8)',
    hasColorFlow: false
  },
  Q: {
    // Queen's Table: Deep Crimson / Rose
    spread1: 'rgba(190, 18, 60, 0.4)',
    spread1Fade: 'rgba(136, 19, 55, 0.1)',
    spread2: 'rgba(225, 29, 72, 0.55)',
    spread2Fade: 'rgba(244, 63, 94, 0.15)',
    ledEdge: 'rgba(225, 29, 72, 0.85)',
    ledCenter: 'rgba(254, 205, 211, 0.95)',
    shadowOuter: 'rgba(225, 29, 72, 0.65)',
    shadowInner: 'rgba(254, 205, 211, 0.6)',
    particleBg: '#fb7185',
    particleGlow: 'rgba(225, 29, 72, 0.8)',
    hasColorFlow: false
  }
};

const AmbientLight = ({ target, variant = "default", maxWidth = "max-w-full" }) => {
  const resolvedKey = (target && THEMES[target]) ? target : (variant && THEMES[variant]) ? variant : 'default';
  const t = THEMES[resolvedKey] || THEMES.default;

  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 4 + 2}px`,
      duration: `${Math.random() * 5 + 4}s`,
      waveDuration: `${Math.random() * 4 + 3}s`,
      delay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.5 + 0.3
    }));
  }, []);

  return (
    <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-end ${t.hasColorFlow ? 'animate-color-flow' : ''}`}>
      {/* Deep ambient spread */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200vw] lg:w-[150vw] h-[70vh] mix-blend-screen opacity-60 animate-pulse transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${t.spread1} 0%, ${t.spread1Fade} 50%, transparent 70%)`,
          animationDuration: '7s'
        }}
      />
      {/* Vibrant ambient spread */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150vw] lg:w-[100vw] h-[50vh] mix-blend-screen opacity-70 animate-pulse transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${t.spread2} 0%, ${t.spread2Fade} 50%, transparent 70%)`,
          animationDuration: '4s'
        }}
      />
      {/* Harsh LED source line at extreme bottom */}
      <div 
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full ${maxWidth} h-[2px] opacity-100 z-10 transition-all duration-700`}
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${t.ledEdge} 20%, ${t.ledCenter} 50%, ${t.ledEdge} 80%, transparent 100%)`,
          boxShadow: `0 -4px 20px 2px ${t.shadowOuter}, 0 -2px 10px 0 ${t.shadowInner}`
        }}
      />
      
      {/* Floating Particles */}
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full ${maxWidth} h-full pointer-events-none z-10 overflow-hidden`}>
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bottom-0 animate-float-up"
            style={{
              left: p.left,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          >
            <div
              className="rounded-full bg-white mix-blend-screen animate-wave transition-all duration-700"
              style={{
                width: p.size,
                height: p.size,
                opacity: p.opacity,
                animationDuration: p.waveDuration,
                backgroundColor: t.particleBg,
                boxShadow: `0 0 10px 2px ${t.particleGlow}`
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmbientLight;

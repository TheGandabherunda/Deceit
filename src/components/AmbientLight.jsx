import React, { useMemo } from 'react';

const THEMES = {
  A: {
    radial: 'radial-gradient(ellipse at 50% 100%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.02) 50%, transparent 70%)',
    led: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 20%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 255, 255, 0.3) 80%, transparent 100%)',
    ledGlow: '0 -4px 20px 2px rgba(255, 255, 255, 0.3), 0 -2px 10px 0 rgba(255, 255, 255, 0.5)',
    particleBg: '#ffffff',
    particleGlow: '0 0 8px 1px rgba(255, 255, 255, 0.4)'
  },
  K: {
    radial: 'radial-gradient(ellipse at 50% 100%, rgba(234, 179, 8, 0.22) 0%, rgba(234, 179, 8, 0.04) 50%, transparent 70%)',
    led: 'linear-gradient(90deg, transparent 0%, rgba(234, 179, 8, 0.35) 20%, rgba(253, 224, 71, 0.95) 50%, rgba(234, 179, 8, 0.35) 80%, transparent 100%)',
    ledGlow: '0 -4px 24px 3px rgba(234, 179, 8, 0.45), 0 -2px 12px 0 rgba(253, 224, 71, 0.65)',
    particleBg: '#facc15',
    particleGlow: '0 0 10px 2px rgba(234, 179, 8, 0.7)'
  },
  Q: {
    radial: 'radial-gradient(ellipse at 50% 100%, rgba(225, 29, 72, 0.25) 0%, rgba(225, 29, 72, 0.04) 50%, transparent 70%)',
    led: 'linear-gradient(90deg, transparent 0%, rgba(225, 29, 72, 0.35) 20%, rgba(251, 113, 133, 0.95) 50%, rgba(225, 29, 72, 0.35) 80%, transparent 100%)',
    ledGlow: '0 -4px 24px 3px rgba(225, 29, 72, 0.45), 0 -2px 12px 0 rgba(251, 113, 133, 0.65)',
    particleBg: '#fb7185',
    particleGlow: '0 0 10px 2px rgba(225, 29, 72, 0.7)'
  }
};

const AmbientLight = ({ target = 'A', maxWidth = "max-w-full" }) => {
  const currentKey = THEMES[target] ? target : 'A';
  const currentTheme = THEMES[currentKey];

  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 2}px`,
      duration: `${Math.random() * 5 + 4}s`,
      waveDuration: `${Math.random() * 4 + 3}s`,
      delay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.4 + 0.2
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-end">
      {/* Dynamic Ambient Light Layers (White for Ace, Yellow for King, Crimson for Queen) */}
      {Object.entries(THEMES).map(([key, theme]) => {
        const isActive = key === currentKey;
        return (
          <div
            key={key}
            className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Deep ambient radial spread */}
            <div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[180vw] lg:w-[130vw] h-[60vh] mix-blend-screen opacity-30 animate-pulse"
              style={{
                background: theme.radial,
                animationDuration: '6s'
              }}
            />
            {/* Harsh LED source line at extreme bottom */}
            <div 
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full ${maxWidth} h-[2px] opacity-80 z-10`}
              style={{
                background: theme.led,
                boxShadow: theme.ledGlow
              }}
            />
          </div>
        );
      })}
      
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
              className="rounded-full mix-blend-screen animate-wave transition-all duration-700"
              style={{
                width: p.size,
                height: p.size,
                opacity: p.opacity,
                animationDuration: p.waveDuration,
                backgroundColor: currentTheme.particleBg,
                boxShadow: currentTheme.particleGlow
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmbientLight;

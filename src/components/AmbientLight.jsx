import React, { useMemo } from 'react';

const AmbientLight = ({ maxWidth = "max-w-full" }) => {
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
      {/* Deep ambient white spread */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[180vw] lg:w-[130vw] h-[60vh] mix-blend-screen opacity-30 animate-pulse"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 50%, transparent 70%)',
          animationDuration: '6s'
        }}
      />
      {/* Harsh LED source line at extreme bottom */}
      <div 
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full ${maxWidth} h-[2px] opacity-80 z-10`}
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 20%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0.3) 80%, transparent 100%)',
          boxShadow: '0 -4px 20px 2px rgba(255, 255, 255, 0.3), 0 -2px 10px 0 rgba(255, 255, 255, 0.5)'
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
              className="rounded-full bg-white mix-blend-screen animate-wave"
              style={{
                width: p.size,
                height: p.size,
                opacity: p.opacity,
                animationDuration: p.waveDuration,
                boxShadow: '0 0 8px 1px rgba(255, 255, 255, 0.4)'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmbientLight;

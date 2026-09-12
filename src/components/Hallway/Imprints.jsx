import React, { useEffect, useRef } from 'react';

const IMPRINT_GROUPS = [
  {
    category: 'Decentralized Network',
    items: [
      { name: 'Nostr Protocol', role: 'Decentralized P2P Signaling & Room Discovery', desc: 'Powers real-time room creation, player signaling, and table discovery — no central server ever sees your game.' },
      { name: 'nostr-tools', role: 'Cryptographic Event Signing & Relay Pool', desc: 'Handles keypair generation, event signing, relay subscription management, and NIP compliance across all game events.' },
      { name: 'Nostr Relay Network', role: 'Distributed WebSocket Relay Pool', desc: 'Game events propagate across relay.damus.io, nos.lol, relay.primal.net, nostr.wine, and global public relays.' },
    ]
  },
  {
    category: 'Character & Visuals',
    items: [
      { name: 'Bloub', role: 'Open-Source Character Design by Jeremy Prt', desc: 'The adorable, expressive blob characters that represent every player. Freely available at github.com/jeremy-prt/bloub.' },
      { name: 'Google Material Symbols', role: 'Rounded Iconography Suite', desc: 'Crisp, variable-weight material icons across the game interface — from actions to status indicators.' },
      { name: 'Gloock Typeface', role: 'Signature Editorial Typography by Google Fonts', desc: 'The distinctive high-contrast serif used across headings, game titles, and cinematic overlays.' },
      { name: 'Inter Typeface', role: 'UI Text by Rasmus Andersson via Google Fonts', desc: 'Clean, legible sans-serif for all interface text, labels, and body content throughout the game.' },
    ]
  },
  {
    category: 'Sound Effects',
    items: [
      { name: 'Pexels Sound Effects', role: 'Royalty-Free Audio Assets', desc: 'All in-game sound effects — card flips, gun shots, revolver spins, shell casings, and ambient tones — sourced from the Pexels sound library under their free license.' },
    ]
  },
  {
    category: 'Framework & Build',
    items: [
      { name: 'React 18', role: 'UI Application Framework', desc: 'Fluid component-driven UI with context architecture for game state, profile, and Nostr identity management.' },
      { name: 'Vite 6', role: 'High-Speed Bundler & Dev Server', desc: 'Instant hot module replacement during development and optimized production builds.' },
      { name: 'TailwindCSS v4', role: 'Utility-First Styling & Design System', desc: 'Powers all responsive layouts, dark glassmorphic panels, custom animations, and the entire visual design system.' },
    ]
  },
];

const Imprints = ({ onClose }) => {
  const isHoveredRef = useRef(false);
  const hasReachedEndRef = useRef(false); // locked once auto-scroll finishes
  const stopAtRef = useRef(null);         // cached stop position
  const contentRef = useRef(null);
  const thankYouRef = useRef(null);
  const posRef = useRef(0);
  const touchStartYRef = useRef(null);
  const manualResumeTimerRef = useRef(null);
  const isManualScrollingRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // RAF auto-scroll via translateY
  useEffect(() => {
    let animId;
    let lastTime = null;

    const step = (now) => {
      if (lastTime === null) lastTime = now;
      const delta = Math.min(now - lastTime, 100);
      lastTime = now;

      const el = contentRef.current;
      const paused = isHoveredRef.current || isManualScrollingRef.current;

      if (el && !paused) {
        // Compute and cache stopAt once
        if (stopAtRef.current === null && thankYouRef.current) {
          const tyTop = thankYouRef.current.offsetTop;
          const tyH   = thankYouRef.current.offsetHeight;
          stopAtRef.current = Math.max(0, tyTop + tyH / 2 - window.innerHeight / 2);
        }
        const stopAt = stopAtRef.current ?? el.offsetHeight;

        if (posRef.current < stopAt) {
          posRef.current = Math.min(posRef.current + (delta / 1000) * 80, stopAt);
          el.style.transform = `translateY(-${posRef.current}px)`;
        } else {
          hasReachedEndRef.current = true; // lock manual scroll at end
        }
      }

      animId = requestAnimationFrame(step);
    };

    const tid = setTimeout(() => { animId = requestAnimationFrame(step); }, 100);
    return () => { clearTimeout(tid); if (animId) cancelAnimationFrame(animId); };
  }, []);

  // Manual wheel scroll — only works before end is reached
  const handleWheel = (e) => {
    if (hasReachedEndRef.current) return;
    e.preventDefault();
    const el = contentRef.current;
    if (!el) return;
    const stopAt = stopAtRef.current ?? el.offsetHeight;
    posRef.current = Math.max(0, Math.min(posRef.current + e.deltaY * 0.8, stopAt));
    el.style.transform = `translateY(-${posRef.current}px)`;
    isManualScrollingRef.current = true;
    if (manualResumeTimerRef.current) clearTimeout(manualResumeTimerRef.current);
    manualResumeTimerRef.current = setTimeout(() => { isManualScrollingRef.current = false; }, 1500);
  };

  // Touch drag — only works before end is reached
  const handleTouchStart = (e) => { touchStartYRef.current = e.touches[0].clientY; };
  const handleTouchMove = (e) => {
    if (hasReachedEndRef.current) return;
    if (touchStartYRef.current === null) return;
    const dy = touchStartYRef.current - e.touches[0].clientY;
    touchStartYRef.current = e.touches[0].clientY;
    const el = contentRef.current;
    if (!el) return;
    const stopAt = stopAtRef.current ?? el.offsetHeight;
    posRef.current = Math.max(0, Math.min(posRef.current + dy, stopAt));
    el.style.transform = `translateY(-${posRef.current}px)`;
    isManualScrollingRef.current = true;
    if (manualResumeTimerRef.current) clearTimeout(manualResumeTimerRef.current);
    manualResumeTimerRef.current = setTimeout(() => { isManualScrollingRef.current = false; }, 1500);
  };
  const handleTouchEnd = () => { touchStartYRef.current = null; };

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-2xl animate-fade-in select-none"
      style={{ overflow: 'hidden' }}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >

      {/* Close Button */}
      <div className="absolute top-0 left-0 right-0 p-5 sm:p-6 flex items-center justify-end z-50">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Close (Esc)"
        >
          <span className="material-symbols-rounded text-xl">close</span>
        </button>
      </div>

      {/* Top fade */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-28 z-40"
        style={{ background: 'linear-gradient(to bottom, rgba(5,5,5,0.97) 0%, transparent 100%)' }}
      />
      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 z-40"
        style={{ background: 'linear-gradient(to top, rgba(5,5,5,0.97) 0%, transparent 100%)' }}
      />

      {/* Scrolling content — pause on hover over THIS element only */}
      <div
        ref={contentRef}
        style={{ willChange: 'transform' }}
      >
        {/* Top spacer so content starts below viewport */}
        <div style={{ height: '100vh' }} />

        <div
          className="flex flex-col items-center text-center px-6 mx-auto"
          style={{ maxWidth: '42rem', gap: '4rem' }}
          onMouseEnter={() => { isHoveredRef.current = true; }}
          onMouseLeave={() => { isHoveredRef.current = false; }}
        >
          {/* Main Heading */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-white/40 mb-3 tracking-widest uppercase">
              Open Foundations & Imprints
            </span>
            <h1 className="text-4xl sm:text-5xl text-white tracking-tight leading-tight mb-4"
              style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}>
              Built on Open & Decentralized Foundations
            </h1>
            <p className="text-white/50 text-sm leading-relaxed max-w-lg">
              Deceit is built without tracking, data collection, or centralized matchmaking.
              Every match happens peer-to-peer over the Nostr relay network.
            </p>
            <div className="mt-8 text-white/20 text-xs tracking-[0.4em]">· · ·</div>
          </div>

          {/* Imprint Groups */}
          {IMPRINT_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="w-full flex flex-col items-center">
              <h2 className="text-2xl text-white/90 mb-8"
                style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}>
                {group.category}
              </h2>
              <div className="w-full flex flex-col items-center" style={{ gap: '2rem' }}>
                {group.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex flex-col items-center max-w-lg px-4">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 mb-1.5">
                      <span className="text-lg font-bold text-white tracking-wide">{item.name}</span>
                      <span className="hidden sm:inline text-white/30 text-xs">·</span>
                      <span className="text-white/50 text-xs font-medium">{item.role}</span>
                    </div>
                    <p className="text-white/40 text-xs leading-relaxed max-w-md">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-white/20 text-xs tracking-[0.4em]">· · ·</div>
            </div>
          ))}

          {/* Legal note */}
          <div className="w-full flex flex-col items-center px-6 py-8 rounded-2xl bg-white/[0.03]">
            <h3 className="text-base text-white/80 mb-3"
              style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}>
              Fair Use & Open Source
            </h3>
            <p className="text-white/50 text-xs leading-relaxed max-w-lg">
              Deceit is a non-commercial open-source game built for fun. All sound effects are used under
              royalty-free licenses from Pexels. Character designs are used with appreciation of Jeremy Prt's
              open Bloub project. No player data is stored or tracked at any time.
            </p>
          </div>

          <div className="text-white/20 text-xs tracking-[0.4em]">· · ·</div>

          {/* Thank You */}
          <div ref={thankYouRef} className="flex flex-col items-center">
            <span className="material-symbols-rounded text-4xl mb-3"
              style={{ color: '#ef4444', fontVariationSettings: "'FILL' 1" }}>
              favorite
            </span>
            <h3 className="text-3xl text-white mb-2"
              style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}>
              Thanks for Playing
            </h3>
            <p className="text-white/40 text-xs leading-relaxed max-w-sm mb-6">
              May your bluffs land and your chambers be empty.
            </p>
            <button
              onClick={onClose}
              className="bg-white hover:bg-white/90 text-black px-6 py-2.5 rounded-full font-bold text-sm transition-colors shadow-xl cursor-pointer"
            >
              Back to Hallway
            </button>
          </div>
        </div>

        {/* Bottom spacer */}
        <div style={{ height: '60vh' }} />
      </div>
    </div>
  );
};

export default Imprints;

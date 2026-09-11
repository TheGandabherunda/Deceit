import React, { useState, useEffect } from 'react';
import AmbientLight from './AmbientLight';
import { getOrCreateKeys } from '../services/nostr';
import { useProfile } from '../context/ProfileContext';
import { useNostr } from '../context/NostrContext';
import { BloubAvatar } from './Bloub/BloubAvatar';
import { SHAPES, COLORS, DEFAULT_SHAPE, DEFAULT_COLOR } from './Bloub/bloubShapes';

const Login = ({ onComplete }) => {
  const { profile, updateProfile } = useProfile();
  const { updateDisplayName } = useNostr();

  const [name, setName] = useState(() => {
    const stored = localStorage.getItem('deceit_name');
    if (stored && stored.trim() && stored.trim() !== 'Player') {
      return stored.trim();
    }
    if (profile?.name && profile.name.trim() && profile.name.trim() !== 'Player') {
      return profile.name.trim();
    }
    return '';
  });
  const [color, setColor] = useState(profile?.color || DEFAULT_COLOR);
  const [shape, setShape] = useState(profile?.shape || DEFAULT_SHAPE);
  const [hasExtension, setHasExtension] = useState(false);

  useEffect(() => {
    const checkExt = setTimeout(() => {
      if (typeof window !== 'undefined' && window.nostr) {
        setHasExtension(true);
      }
    }, 500);
    return () => clearTimeout(checkExt);
  }, []);

  const currentShapeIndex = Math.max(0, SHAPES.findIndex((s) => s.id === shape));
  const currentShapeObj = SHAPES[currentShapeIndex] || SHAPES[0];

  const handlePrevShape = () => {
    const prevIndex = (currentShapeIndex - 1 + SHAPES.length) % SHAPES.length;
    setShape(SHAPES[prevIndex].id);
  };

  const handleNextShape = () => {
    const nextIndex = (currentShapeIndex + 1) % SHAPES.length;
    setShape(SHAPES[nextIndex].id);
  };

  const handleProceed = (cleanName, selectedShape, selectedColor, pk, sk) => {
    const profileData = {
      name: cleanName,
      color: selectedColor,
      shape: selectedShape
    };

    localStorage.setItem('deceit_name', cleanName);
    localStorage.setItem('deceit_player_profile', JSON.stringify(profileData));

    // Update global contexts so home screen and all views immediately reflect selected options
    if (updateDisplayName) updateDisplayName(cleanName);
    if (updateProfile) updateProfile(profileData);

    window.dispatchEvent(new CustomEvent('deceit:name-change', { detail: cleanName }));
    window.dispatchEvent(new CustomEvent('deceit:profile-change', { detail: profileData }));

    onComplete({ displayName: cleanName, nostrPk: pk, nostrSk: sk });
  };

  const handleExtensionLogin = async (e) => {
    e.preventDefault();
    if (!window.nostr) return;

    try {
      const pubkey = await window.nostr.getPublicKey();
      localStorage.setItem('deceit_nip07', 'true');
      const cleanName = name.trim() || 'Nostr Player';
      handleProceed(cleanName, shape, color, pubkey, 'extension');
    } catch (err) {
      console.error('[Deceit:Auth] Extension login failed', err);
    }
  };

  const handleGuestLogin = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    localStorage.removeItem('deceit_nip07');
    const { sk, pk } = getOrCreateKeys();
    handleProceed(cleanName, shape, color, pk, sk);
  };

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col justify-center items-center overflow-y-auto px-4 py-8 animate-fade-in select-none">
      
      {/* LED Edge Ambient Light Effect (identical to Bloom) */}
      <AmbientLight />

      {/* Top Logo Title */}
      <div className="absolute top-8 sm:top-12 left-0 right-0 text-center z-10 pointer-events-none px-4">
        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">Deceit</h1>
      </div>

      <div className="w-full max-w-sm transform transition-all pointer-events-auto relative z-10 p-4 lg:p-0 mx-auto my-auto">
        {/* Bloom Style Hero Headline */}
        <div className="mb-6 sm:mb-7 w-full text-center">
          <h2 
            className="text-[2.5rem] sm:text-[2.8rem] text-white/90 tracking-tight leading-none"
            style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}
          >
            Enter the table.<br />
            Trust no one.
          </h2>
        </div>

        {/* Character Selection Showcase */}
        <div className="flex flex-col items-center justify-center mb-5">
          {/* Character Shape Switcher */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePrevShape}
              aria-label="Previous character shape"
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-white/10"
              title="Previous character"
            >
              <span className="material-symbols-rounded text-lg">chevron_left</span>
            </button>

            {/* Interactive Avatar preview */}
            <button
              type="button"
              onClick={handleNextShape}
              className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center cursor-pointer group transition-transform hover:scale-105 active:scale-95"
              title="Click to cycle shape"
            >
              <BloubAvatar
                shape={shape}
                color={color}
                expression="idle"
                size={96}
              />
            </button>

            <button
              type="button"
              onClick={handleNextShape}
              aria-label="Next character shape"
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-white/10"
              title="Next character"
            >
              <span className="material-symbols-rounded text-lg">chevron_right</span>
            </button>
          </div>

          {/* Current Shape Label */}
          <span className="text-[11px] font-mono text-white/50 mt-1 capitalize tracking-wider">
            {currentShapeObj?.label || shape}
          </span>

          {/* Palette of Swatches */}
          <div className="flex items-center justify-center gap-1.5 mt-2.5 px-2 py-1 max-w-full overflow-x-auto no-scrollbar">
            {COLORS.map((c) => {
              const isSelected = color.toLowerCase() === c.hex.toLowerCase();
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  aria-label={c.label}
                  aria-pressed={isSelected}
                  className={`w-6 h-6 shrink-0 flex items-center justify-center rounded-full border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-white scale-110 shadow-sm'
                      : 'border-transparent hover:border-white/30'
                  }`}
                  title={c.label}
                >
                  <span
                    className="block w-[74%] h-[74%] rounded-full ring-1 ring-black/20 ring-inset"
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Input & Login Form (Identical to Bloom) */}
        <form onSubmit={handleGuestLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5 ml-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              className="w-full h-[48px] bg-white/[0.06] rounded-full px-6 text-lg text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors shadow-inner"
              placeholder="e.g., Alice"
              required
            />
          </div>

          <div className="flex flex-col gap-3 mt-4">
            {hasExtension && (
              <button
                type="button"
                onClick={handleExtensionLogin}
                className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold rounded-full h-[48px] transition-colors flex items-center justify-center text-sm border border-purple-500/30 cursor-pointer"
              >
                Login with Nostr Extension
              </button>
            )}

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-white hover:bg-white/90 disabled:bg-white/10 disabled:text-white/25 text-black font-bold rounded-full h-[48px] transition-colors flex items-center justify-center text-lg relative overflow-hidden cursor-pointer disabled:cursor-not-allowed active:scale-98 shadow-xl"
            >
              Join Deceit
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Watermark & Disclaimer (Identical to Bloom) */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center pointer-events-none z-0 px-4">
        <div className="w-full overflow-hidden leading-none opacity-10 flex justify-center items-end">
          <svg viewBox="0 0 100 28" className="w-full h-auto max-w-md">
            <text 
              x="50%" 
              y="27" 
              textAnchor="middle" 
              className="fill-white tracking-tight" 
              style={{ fontFamily: '"Gloock", serif' }} 
              fontSize="32"
            >
              Deceit
            </text>
          </svg>
        </div>
        <p className="text-white/30 text-xs text-center mt-1">
          Deceit uses the decentralized Nostr network for secure, peer-to-peer connection handling.
        </p>
      </div>
    </div>
  );
};

export default Login;

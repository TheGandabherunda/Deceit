import React, { useState } from 'react';
import AmbientLight from './AmbientLight';
import { getOrCreateKeys } from '../services/nostr';
import { BloubAvatar } from './Bloub/BloubAvatar';
import { SHAPES, COLORS, DEFAULT_SHAPE, DEFAULT_COLOR } from './Bloub/bloubShapes';

const Login = ({ onComplete }) => {
  const [name, setName] = useState(localStorage.getItem('deceit_name') || '');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [shape, setShape] = useState(DEFAULT_SHAPE);

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return;

    const profileData = {
      name: clean,
      color,
      shape
    };

    localStorage.setItem('deceit_name', clean);
    localStorage.setItem('deceit_player_profile', JSON.stringify(profileData));

    const { pk, sk } = getOrCreateKeys();
    window.dispatchEvent(new CustomEvent('deceit:name-change', { detail: clean }));
    window.dispatchEvent(new CustomEvent('deceit:profile-change', { detail: profileData }));
    onComplete({ displayName: clean, nostrPk: pk, nostrSk: sk });
  };

  return (
    <div className="fixed inset-0 bg-[#050505] z-[200] flex flex-col justify-center items-center overflow-y-auto px-4 py-8 animate-fade-in select-none">
      {/* Ambient Edge Light Effect */}
      <AmbientLight />

      {/* Top Logo Title */}
      <div className="text-center z-10 pointer-events-none mb-4">
        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-widest font-serif uppercase">Deceit</h1>
      </div>

      <div className="w-full max-w-sm transform transition-all pointer-events-auto relative z-10 p-2 mx-auto">
        {/* Animated Avatar Character Preview */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative mb-2">
            <BloubAvatar
              shape={shape}
              color={color}
              expression="idle"
              size={105}
            />
          </div>
          <div className="flex items-center gap-1.5">
            {SHAPES.slice(0, 5).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setShape(s.id)}
                className={`w-6 h-6 rounded-full border text-[10px] font-mono flex items-center justify-center transition-all cursor-pointer ${
                  shape === s.id ? 'border-white bg-white/20 text-white' : 'border-white/10 text-white/40 hover:text-white'
                }`}
                title={s.label}
              >
                {s.label.charAt(0)}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 w-full text-center">
          <h2 className="text-2xl text-white/90 font-serif tracking-tight leading-snug">
            Enter the table.<br />
            Trust no one.
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5 ml-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              autoFocus
              className="w-full h-[46px] bg-white/[0.06] border border-white/10 rounded-full px-5 text-base text-white focus:outline-none focus:border-white/30 transition-colors shadow-inner"
              placeholder="e.g., Alice"
              required
            />
          </div>

          {/* Color Choices */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-white/60">
                Profile Color
              </label>
              <span className="text-[11px] font-mono text-white/40">
                {COLORS.find((c) => c.hex.toLowerCase() === color.toLowerCase())?.label || ''}
              </span>
            </div>
            <div className="w-full flex items-center justify-between gap-1 p-1.5 rounded-full bg-white/[0.04] border border-white/10 overflow-x-auto no-scrollbar">
              {COLORS.map((c) => {
                const isSelected = color.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    aria-label={c.label}
                    aria-pressed={isSelected}
                    className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-full border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-white scale-110 shadow-sm'
                        : 'border-transparent hover:border-white/30'
                    }`}
                    title={c.label}
                  >
                    <span
                      className="block w-[78%] h-[78%] rounded-full ring-1 ring-black/20 ring-inset"
                      style={{ backgroundColor: c.hex }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full bg-white hover:bg-white/90 text-black font-bold rounded-full h-[46px] transition-colors flex items-center justify-center text-sm uppercase tracking-wider shadow-xl cursor-pointer active:scale-95"
            >
              Join Deceit
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 flex flex-col items-center pointer-events-none z-0 px-4">
        <p className="text-white/30 text-xs text-center font-mono">
          A serverless 2D bluffing game of deduction, deception, and survival.
        </p>
      </div>
    </div>
  );
};

export default Login;

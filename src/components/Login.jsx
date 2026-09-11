import React, { useState } from 'react';
import AmbientLight from './AmbientLight';
import { getOrCreateKeys } from '../services/nostr';

const Login = ({ onComplete }) => {
  const [name, setName] = useState(localStorage.getItem('deceit_name') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return;

    localStorage.setItem('deceit_name', clean);
    const { pk, sk } = getOrCreateKeys();
    window.dispatchEvent(new CustomEvent('deceit:name-change', { detail: clean }));
    onComplete({ displayName: clean, nostrPk: pk, nostrSk: sk });
  };

  return (
    <div className="fixed inset-0 bg-[#050505] z-[200] flex flex-col justify-end md:justify-center items-center overflow-hidden px-4 md:px-0 pb-24 md:pb-0 animate-fade-in select-none">
      
      {/* Ambient Edge Light Effect */}
      <AmbientLight />

      {/* Top Logo Title */}
      <div className="absolute top-12 left-0 right-0 text-center z-10 pointer-events-none px-4">
        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">Deceit</h1>
      </div>

      <div className="w-full max-w-sm transform transition-all pointer-events-auto relative z-10 p-4 lg:p-0 mx-auto">
        <div className="mb-8 w-full text-center">
          <h2 className="text-[2.8rem] text-white/90 font-serif tracking-tight leading-none">
            Enter the table.<br />
            Trust no one.
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5 ml-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              autoFocus
              className="w-full h-[48px] bg-white/[0.06] rounded-full px-6 text-lg text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors shadow-inner"
              placeholder="e.g., Alice"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-white hover:bg-white/90 text-black font-bold rounded-full h-[48px] transition-colors flex items-center justify-center text-lg shadow-xl"
            >
              Join Deceit
            </button>
          </div>
        </form>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center pointer-events-none z-0 px-4">
        <p className="text-white/30 text-xs text-center">
          A serverless 2D bluffing game of deduction, deception, and survival.
        </p>
      </div>
    </div>
  );
};

export default Login;

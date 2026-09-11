import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';

export const PrivateRoomModal = ({ isOpen, onClose }) => {
  const { createRoom, joinRoom } = useGame();
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join'

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const [createCode, setCreateCode] = useState(generateCode());
  const [joinCode, setJoinCode] = useState('');

  if (!isOpen) return null;

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!createCode || createCode.length < 4) return;
    createRoom(createCode, false); // Always private
    onClose();
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    const clean = joinCode.trim().toUpperCase();
    if (clean.length !== 4) return;
    joinRoom(clean);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-[300] flex flex-col justify-end md:justify-center items-center p-4 sm:p-6 pb-6 md:pb-6 animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-[460px] bg-[#0a0a0a] rounded-[36px] p-6 sm:p-8 shadow-2xl relative border border-white/10"
        style={{ animation: 'slideUpModal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        {/* Pull Handle for mobile */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 md:hidden" />

        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10 cursor-pointer"
        >
          <span className="material-symbols-rounded text-[20px]">close</span>
        </button>

        <div className="mt-1 mb-6 text-center px-2 flex flex-col items-center">
          <h3 
            className="text-4xl text-white font-serif" 
            style={{ fontFamily: '"Gloock", serif', letterSpacing: 'normal', fontWeight: 400 }}
          >
            Private Table
          </h3>
          <p className="text-white/40 text-sm mt-1.5">
            Play exclusively with friends using a 4-letter code.
          </p>
        </div>

        {/* 2 Tabs - exact same dimension (h-[50px] rounded-full) as button and input, with generous spacing */}
        <div className="w-full h-[50px] flex rounded-full bg-white/[0.06] p-1 mb-8 border border-white/10 items-center">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 h-full text-sm font-semibold rounded-full transition-all flex items-center justify-center cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white text-black shadow-md'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <span>Create Table</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('join')}
            className={`flex-1 h-full text-sm font-semibold rounded-full transition-all flex items-center justify-center cursor-pointer ${
              activeTab === 'join'
                ? 'bg-white text-black shadow-md'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <span>Join Table</span>
          </button>
        </div>

        {/* Tab 1: Create Table */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="space-y-5 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5 ml-2">
                Generated Table Code
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={createCode}
                  onChange={(e) => setCreateCode(e.target.value.toUpperCase())}
                  autoComplete="off"
                  className="w-full h-[50px] bg-white/[0.06] rounded-full px-6 text-2xl font-mono text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors shadow-inner tracking-widest"
                  required
                />
                <button
                  type="button"
                  onClick={() => setCreateCode(generateCode())}
                  title="Reroll code"
                  className="w-[50px] h-[50px] rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors shrink-0 flex items-center justify-center cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-rounded text-xl">refresh</span>
                </button>
              </div>
              <p className="text-white/30 text-xs mt-2 ml-3">
                Share this code with your friends so they can join.
              </p>
            </div>

            <button 
              type="submit" 
              className="w-full h-[50px] bg-white hover:bg-white/90 text-black font-semibold rounded-full text-base transition-all flex items-center justify-center shadow-xl cursor-pointer active:scale-[0.98]"
            >
              <span>Create Private Table</span>
            </button>
          </form>
        )}

        {/* Tab 2: Join Table */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinSubmit} className="space-y-5 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5 ml-2">
                Enter 4-Letter Code
              </label>
              <input
                type="text"
                maxLength={4}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="XXXX"
                autoFocus
                autoComplete="off"
                className="w-full h-[50px] bg-white/[0.06] rounded-full px-6 text-2xl font-mono text-center font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors shadow-inner tracking-widest uppercase"
                required
              />
              <p className="text-white/30 text-xs mt-2 ml-3">
                Ask the table host for their 4-letter invite code.
              </p>
            </div>

            <button 
              type="submit"
              disabled={joinCode.trim().length !== 4}
              className="w-full h-[50px] bg-white hover:bg-white/90 disabled:opacity-20 text-black font-semibold rounded-full text-base transition-all flex items-center justify-center shadow-xl cursor-pointer active:scale-[0.98]"
            >
              <span>Join Private Table</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

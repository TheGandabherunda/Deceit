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
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-[300] flex flex-col justify-end md:justify-center items-center p-4 sm:p-6 pb-6 md:pb-6 animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-[420px] bg-[#0a0a0a] rounded-[32px] p-8 shadow-2xl relative border border-white/10"
        style={{ animation: 'slideUpModal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10"
        >
          <span className="material-symbols-rounded text-[20px]">close</span>
        </button>

        <div className="mt-1 mb-6 text-center px-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-white/80 font-mono text-[10px] uppercase tracking-wider mb-2 border border-white/10">
            <span className="material-symbols-rounded text-[13px]">lock</span>
            Private Match
          </span>
          <h3 className="text-3xl text-white font-serif tracking-tight">
            Private Table
          </h3>
          <p className="text-white/40 text-xs mt-1">
            Play exclusively with friends using a 4-letter code.
          </p>
        </div>

        {/* 2 Tabs */}
        <div className="flex rounded-full bg-white/[0.04] p-1 mb-6 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-white text-black shadow-md'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <span className="material-symbols-rounded text-sm">add_circle</span>
            <span>Create Table</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'join'
                ? 'bg-white text-black shadow-md'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <span className="material-symbols-rounded text-sm">key</span>
            <span>Join Table</span>
          </button>
        </div>

        {/* Tab 1: Create Table */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-xs font-mono text-white/50 mb-1.5 ml-2">
                Generated Table Code
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={createCode}
                  onChange={(e) => setCreateCode(e.target.value.toUpperCase())}
                  autoComplete="off"
                  className="w-full h-[48px] bg-white/[0.06] rounded-full px-6 text-xl font-mono text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors shadow-inner tracking-widest"
                  required
                />
                <button
                  type="button"
                  onClick={() => setCreateCode(generateCode())}
                  className="h-[48px] px-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-mono transition-colors shrink-0 flex items-center gap-1"
                >
                  <span className="material-symbols-rounded text-sm">refresh</span>
                  <span>Reroll</span>
                </button>
              </div>
              <p className="text-white/30 text-[11px] mt-1.5 ml-3">
                Share this code with your friends so they can join.
              </p>
            </div>

            <button 
              type="submit" 
              className="w-full bg-white hover:bg-white/90 text-black font-bold rounded-full h-[48px] transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-xl"
            >
              <span className="material-symbols-rounded text-base">table_bar</span>
              <span>Create Private Table</span>
            </button>
          </form>
        )}

        {/* Tab 2: Join Table */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinSubmit} className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-xs font-mono text-white/50 mb-1.5 ml-2">
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
                className="w-full h-[48px] bg-white/[0.06] rounded-full px-6 text-xl font-mono text-center font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors shadow-inner tracking-widest uppercase"
                required
              />
              <p className="text-white/30 text-[11px] mt-1.5 ml-3">
                Ask the table host for their 4-letter invite code.
              </p>
            </div>

            <button 
              type="submit"
              disabled={joinCode.trim().length !== 4}
              className="w-full bg-white hover:bg-white/90 disabled:opacity-20 text-black font-bold rounded-full h-[48px] transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-xl"
            >
              <span className="material-symbols-rounded text-base">login</span>
              <span>Join Private Table</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';

export const CreateRoomModal = ({ isOpen, onClose }) => {
  const { createRoom } = useGame();

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const [code, setCode] = useState(generateCode());
  const [isPublic, setIsPublic] = useState(false); // Private by default

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code || code.length < 4) return;
    createRoom(code, isPublic);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex flex-col justify-end md:justify-center items-center p-4 sm:p-6 pb-6 md:pb-6 animate-fade-in"
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
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10"
        >
          <span className="material-symbols-rounded text-[20px]">close</span>
        </button>

        <div className="mt-2 mb-8 text-center px-4">
          <h3 className="text-3xl text-white font-serif tracking-tight">
            Create Room
          </h3>
          <p className="text-white/40 text-sm mt-2">
            Start a table and invite your friends.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5 ml-2">
              4-Letter Room Code
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                autoComplete="off"
                className="w-full h-[48px] bg-white/[0.06] rounded-full px-6 text-xl font-mono text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors shadow-inner tracking-widest"
                required
              />
              <button
                type="button"
                onClick={() => setCode(generateCode())}
                className="h-[48px] px-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm font-medium transition-colors shrink-0"
              >
                Reroll
              </button>
            </div>
            <p className="text-white/30 text-xs mt-1.5 ml-3">
              Share this code so others can join your table directly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`relative flex flex-col items-center justify-center p-5 rounded-3xl transition-all border text-center ${
                !isPublic ? 'bg-white/[0.08] border-white/30 text-white' : 'bg-white/[0.02] border-transparent text-white/40 hover:bg-white/[0.04]'
              }`}
            >
              {!isPublic && (
                <span className="absolute top-3 right-3 material-symbols-rounded text-white text-[18px]">check_circle</span>
              )}
              <span className="material-symbols-rounded text-2xl mb-2">lock</span>
              <span className="font-bold text-sm">Private Room</span>
              <span className="text-white/40 text-[11px] mt-0.5">Code required</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`relative flex flex-col items-center justify-center p-5 rounded-3xl transition-all border text-center ${
                isPublic ? 'bg-white/[0.08] border-white/30 text-white' : 'bg-white/[0.02] border-transparent text-white/40 hover:bg-white/[0.04]'
              }`}
            >
              {isPublic && (
                <span className="absolute top-3 right-3 material-symbols-rounded text-white text-[18px]">check_circle</span>
              )}
              <span className="material-symbols-rounded text-2xl mb-2">public</span>
              <span className="font-bold text-sm">Public Room</span>
              <span className="text-white/40 text-[11px] mt-0.5">Visible in Hallway</span>
            </button>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full bg-white hover:bg-white/90 text-black font-bold rounded-full h-[48px] transition-colors flex items-center justify-center text-lg shadow-xl"
            >
              Create Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

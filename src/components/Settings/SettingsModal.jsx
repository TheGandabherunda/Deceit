import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { sound } from '../../services/sound';

export const SettingsModal = ({ isOpen, onClose }) => {
  const [masterMuted, setMasterMuted] = useState(sound.masterMuted);
  const [bgMusicEnabled, setBgMusicEnabled] = useState(sound.bgMusicEnabled);
  const [sfxVolume, setSfxVolume] = useState(sound.sfxVolume);

  // Sync state when opened or when external sound changes occur
  useEffect(() => {
    if (isOpen) {
      setMasterMuted(sound.masterMuted);
      setBgMusicEnabled(sound.bgMusicEnabled);
      setSfxVolume(sound.sfxVolume);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleSettingsChange = (e) => {
      if (e.detail) {
        setMasterMuted(e.detail.masterMuted);
        setBgMusicEnabled(e.detail.bgMusicEnabled);
        setSfxVolume(e.detail.sfxVolume);
      }
    };
    window.addEventListener('deceit:sound-settings-change', handleSettingsChange);
    return () => window.removeEventListener('deceit:sound-settings-change', handleSettingsChange);
  }, []);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleToggleMasterMute = (checked) => {
    const newMuted = !checked;
    setMasterMuted(newMuted);
    sound.setMasterMuted(newMuted);
  };

  const handleToggleBgMusic = (checked) => {
    setBgMusicEnabled(checked);
    sound.setBgMusicEnabled(checked);
  };

  const handleChangeSfxVolume = (val) => {
    setSfxVolume(val);
    sound.setSfxVolume(val);
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-[300] flex flex-col justify-end md:justify-center items-center p-4 sm:p-6 pb-6 md:pb-6 animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-[420px] bg-[#0a0a0a] rounded-[32px] p-6 sm:p-8 shadow-2xl relative border border-white/10 overflow-hidden"
        style={{ animation: 'slideUpModal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        {/* Pull Handle for mobile */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 md:hidden" />

        {/* Top-right close button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10 cursor-pointer"
          aria-label="Close settings"
        >
          <span className="material-symbols-rounded text-[20px]">close</span>
        </button>

        {/* Header */}
        <div className="mt-1 mb-6 text-center px-2">
          <h3 
            className="text-4xl text-white font-serif tracking-normal" 
            style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}
          >
            Settings
          </h3>
          <p className="text-white/40 text-sm mt-1.5">
            Audio, music and sound preferences.
          </p>
        </div>

        {/* Settings Form Body */}
        <div className="space-y-4">
          {/* Master Sound Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex flex-col pr-4">
              <span className="text-sm font-semibold text-white">Website Audio</span>
              <span className="text-xs text-white/40 mt-0.5">Mute or enable all sound across the game</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={!masterMuted}
              onClick={() => handleToggleMasterMute(!masterMuted)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                !masterMuted ? 'bg-white' : 'bg-white/15'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                  !masterMuted ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Background Music Card */}
          <div className={`flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 transition-opacity ${
            masterMuted ? 'opacity-35 pointer-events-none' : ''
          }`}>
            <div className="flex flex-col pr-4">
              <span className="text-sm font-semibold text-white">Background Music</span>
              <span className="text-xs text-white/40 mt-0.5">Subtle ambient music during active game</span>
            </div>
            <button
              type="button"
              role="switch"
              disabled={masterMuted}
              aria-checked={bgMusicEnabled}
              onClick={() => handleToggleBgMusic(!bgMusicEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                bgMusicEnabled && !masterMuted ? 'bg-white' : 'bg-white/15'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                  bgMusicEnabled && !masterMuted ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound Effects (SFX) Card */}
          <div className={`p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 transition-opacity ${
            masterMuted ? 'opacity-35 pointer-events-none' : ''
          }`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Sound Effects</span>
                <span className="text-xs text-white/40 mt-0.5">Clicks, hovers, card deals & roulette audio</span>
              </div>
              <span className="text-xs font-mono text-white/50">{Math.round(sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              disabled={masterMuted}
              value={sfxVolume}
              onChange={(e) => handleChangeSfxVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white hover:bg-white/25 transition-all"
            />
          </div>
        </div>

        {/* Done Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full h-[48px] rounded-full bg-white hover:bg-white/90 text-black font-bold text-sm transition-all flex items-center justify-center cursor-pointer shadow-lg active:scale-98 mt-6"
        >
          Done
        </button>
      </div>
    </div>,
    document.body
  );
};

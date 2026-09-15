import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { sound } from '../../services/sound';
import { useNostr } from '../../context/NostrContext';
import { useProfile } from '../../context/ProfileContext';
import { BloubAvatar } from '../Bloub/BloubAvatar';
import { 
  generateAccountBackup, 
  verifyAndParseAccountBackup, 
  restoreAccountFromBackup 
} from '../../services/accountBackupService';

export const SettingsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('audio'); // 'audio' | 'account'

  // Audio settings
  const [masterMuted, setMasterMuted] = useState(sound.masterMuted);
  const [bgMusicEnabled, setBgMusicEnabled] = useState(sound.bgMusicEnabled);
  const [sfxVolume, setSfxVolume] = useState(sound.sfxVolume);

  // Account Context
  const { pubkey, privKeyHex, isExtension, displayName } = useNostr();
  const { profile } = useProfile();

  // Backup & Restore state
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [restoreInput, setRestoreInput] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [restoreError, setRestoreError] = useState('');
  const fileInputRef = useRef(null);

  // Sync state when opened or when external sound changes occur
  useEffect(() => {
    if (isOpen) {
      setMasterMuted(sound.masterMuted);
      setBgMusicEnabled(sound.bgMusicEnabled);
      setSfxVolume(sound.sfxVolume);
      setRestoreSuccess(false);
      setRestoreError('');
      setVerificationResult(null);
      setRestoreInput('');
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

  const handleToggleMasterMute = () => {
    const nextMuted = !masterMuted;
    setMasterMuted(nextMuted);
    sound.setMasterMuted(nextMuted);
  };

  const handleToggleBgMusic = () => {
    const nextEnabled = !bgMusicEnabled;
    setBgMusicEnabled(nextEnabled);
    sound.setBgMusicEnabled(nextEnabled);
  };

  const handleChangeSfxVolume = (val) => {
    setSfxVolume(val);
    sound.setSfxVolume(val);
  };

  // Generate and download .deceit backup file
  const handleDownloadBackup = () => {
    try {
      const effectivePrivHex = privKeyHex || (typeof localStorage !== 'undefined' ? localStorage.getItem('deceit_nsec_hex') : null);
      if (!effectivePrivHex) {
        alert('No local account credentials available to backup.');
        return;
      }

      const { armoredText, filename } = generateAccountBackup({
        pubkey,
        privKeyHex: effectivePrivHex,
        profile
      });

      const blob = new Blob([armoredText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      sound.playClick();
      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 3000);
    } catch (err) {
      console.error('Backup generation error:', err);
      alert('Failed to generate backup: ' + err.message);
    }
  };

  // Copy armored backup code to clipboard
  const handleCopyBackup = async () => {
    try {
      const effectivePrivHex = privKeyHex || (typeof localStorage !== 'undefined' ? localStorage.getItem('deceit_nsec_hex') : null);
      if (!effectivePrivHex) {
        alert('No local account credentials available to copy.');
        return;
      }

      const { armoredText } = generateAccountBackup({
        pubkey,
        privKeyHex: effectivePrivHex,
        profile
      });

      await navigator.clipboard.writeText(armoredText);
      sound.playClick();
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2500);
    } catch (err) {
      console.error('Clipboard copy error:', err);
      alert('Failed to copy backup to clipboard.');
    }
  };

  // Handle file picker selection
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        handleRestoreInputChange(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle text input change & live verification
  const handleRestoreInputChange = (val) => {
    setRestoreInput(val);
    setRestoreSuccess(false);
    setRestoreError('');

    if (!val.trim()) {
      setVerificationResult(null);
      return;
    }

    const result = verifyAndParseAccountBackup(val);
    setVerificationResult(result);
  };

  // Confirm restore
  const handleConfirmRestore = () => {
    if (!verificationResult || !verificationResult.valid || !verificationResult.data) {
      return;
    }

    try {
      restoreAccountFromBackup(verificationResult.data);
      sound.playClick();
      setRestoreSuccess(true);
      setRestoreInput('');
      setVerificationResult(null);
    } catch (err) {
      console.error('Failed to restore account:', err);
      setRestoreError(err.message || 'Restoration failed');
    }
  };

  const effectivePubkey = pubkey || '';
  const truncatedPubkey = effectivePubkey 
    ? `${effectivePubkey.slice(0, 8)}...${effectivePubkey.slice(-6)}` 
    : 'Generating identity...';

  const currentPlayerName = profile?.name || displayName || 'Player';

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex flex-col justify-end md:justify-center items-center p-3 sm:p-6 pb-4 md:pb-6 animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-[540px] max-h-[88vh] flex flex-col bg-[#0c0c0c] rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 shadow-2xl relative border border-white/10 overflow-hidden"
        style={{ animation: 'slideUpModal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3 md:hidden shrink-0" />

        {/* Top Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10 cursor-pointer"
          aria-label="Close settings"
        >
          <span className="material-symbols-rounded text-[20px]">close</span>
        </button>

        {/* Header Title */}
        <div className="text-center px-2 shrink-0 mb-4">
          <h2 
            className="text-3xl sm:text-4xl text-white font-normal tracking-tight" 
            style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}
          >
            Settings
          </h2>
          <p className="text-white/40 text-xs sm:text-sm mt-1">
            Audio preferences & account backup management.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-center p-1 bg-white/5 rounded-full border border-white/10 mb-4 mx-auto w-full max-w-[320px] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              activeTab === 'audio' 
                ? 'bg-white text-black shadow-md' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            Audio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              activeTab === 'account' 
                ? 'bg-white text-black shadow-md' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            Account & Backup
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto pr-1 -mr-1 space-y-3.5 text-left text-sm text-white/80 select-text no-scrollbar flex-1">
          {activeTab === 'audio' ? (
            /* ================= AUDIO TAB ================= */
            <div className="space-y-3.5">
              {/* Master Sound Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex flex-col pr-4">
                  <span className="text-sm font-semibold text-white">Game Sound</span>
                  <span className="text-xs text-white/40 mt-0.5">Mute or enable all sound across the game</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!masterMuted}
                  onClick={handleToggleMasterMute}
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
                  onClick={handleToggleBgMusic}
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
          ) : (
            /* ================= ACCOUNT & BACKUP TAB ================= */
            <div className="space-y-4">
              {/* Current Account Card */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  <BloubAvatar 
                    shape={profile?.shape} 
                    color={profile?.color} 
                    size={42} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">
                      {currentPlayerName}
                    </span>
                    <span className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full font-medium shrink-0">
                      {isExtension ? 'NIP-07' : 'Active Account'}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-white/40 truncate mt-0.5">
                    {truncatedPubkey}
                  </p>
                </div>
              </div>

              {/* Restore Success Banner */}
              {restoreSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
                  <span className="material-symbols-rounded text-xl text-emerald-400 shrink-0">check_circle</span>
                  <div className="flex-1">
                    <span className="font-semibold block text-emerald-200">Account Restored Successfully!</span>
                    <span className="text-[11px] text-emerald-300/80">Identity, name, character & sound preferences updated.</span>
                  </div>
                </div>
              )}

              {/* Backup Card */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-lg text-white/70">download</span>
                    <span className="text-sm font-semibold text-white">Backup Account</span>
                  </div>
                  {backupSuccess && (
                    <span className="text-[11px] text-emerald-400 font-medium animate-fade-in">
                      ✓ Downloaded
                    </span>
                  )}
                  {copiedBackup && (
                    <span className="text-[11px] text-emerald-400 font-medium animate-fade-in">
                      ✓ Copied Code
                    </span>
                  )}
                </div>

                <p className="text-xs text-white/50 leading-relaxed">
                  Export a cryptographically signed copy of your account credentials and customized character. Save this file to restore your account if browser data is cleared.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <span className="material-symbols-rounded text-sm">download</span>
                    Download .deceit
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyBackup}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <span className="material-symbols-rounded text-sm">content_copy</span>
                    {copiedBackup ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              </div>

              {/* Restore Card */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-lg text-white/70">settings_backup_restore</span>
                    <span className="text-sm font-semibold text-white">Restore Account</span>
                  </div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-mono">
                    Anti-Cheat Vault
                  </span>
                </div>

                <p className="text-xs text-white/50 leading-relaxed">
                  Import a valid <code className="text-white/80 font-mono">.deceit</code> file or paste an armored backup code. Tampered or fake mock data is cryptographically rejected.
                </p>

                {/* Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".deceit,.json,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <span className="material-symbols-rounded text-base">upload_file</span>
                    Choose .deceit file
                  </button>
                </div>

                {/* Textarea for code paste */}
                <div className="space-y-1.5">
                  <textarea
                    rows={3}
                    value={restoreInput}
                    onChange={(e) => handleRestoreInputChange(e.target.value)}
                    placeholder="Or paste backup code / text here..."
                    className="w-full bg-black/40 border border-white/10 focus:border-white/30 rounded-xl p-2.5 text-xs text-white placeholder-white/20 font-mono resize-none outline-none transition-colors"
                  />
                </div>

                {/* Live Cryptographic Verification Feedback */}
                {verificationResult && !verificationResult.valid && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
                    <span className="material-symbols-rounded text-base text-rose-400 shrink-0 mt-0.5">gpp_bad</span>
                    <div>
                      <div className="font-semibold text-rose-200">Cryptographic Verification Failed</div>
                      <div className="text-[11px] text-rose-300/80 mt-0.5">{verificationResult.error}</div>
                      <div className="text-[10px] text-rose-400/60 mt-1">
                        Mock, forged or tampered account data cannot be restored.
                      </div>
                    </div>
                  </div>
                )}

                {/* Verified Account Preview & Confirm Button */}
                {verificationResult && verificationResult.valid && verificationResult.data && (
                  <div className="space-y-2.5 animate-fade-in">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <span className="material-symbols-rounded text-base">verified_user</span>
                          Authentic Account Verified
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                          Schnorr & HMAC OK
                        </span>
                      </div>

                      <div className="flex items-center gap-3 p-2 bg-black/50 rounded-lg border border-emerald-500/20">
                        <div className="w-9 h-9 rounded-lg bg-black/60 flex items-center justify-center shrink-0">
                          <BloubAvatar
                            shape={verificationResult.data.payload.profile.shape}
                            color={verificationResult.data.payload.profile.color}
                            size={32}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-xs truncate">
                            {verificationResult.data.payload.profile.name}
                          </div>
                          <div className="font-mono text-[10px] text-white/50 truncate">
                            {verificationResult.data.payload.identity.pubkey}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmRestore}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-98"
                    >
                      <span className="material-symbols-rounded text-base">restore</span>
                      Confirm & Restore Account
                    </button>
                  </div>
                )}

                {restoreError && (
                  <div className="p-2 text-[11px] text-rose-400 bg-rose-500/10 rounded-lg">
                    {restoreError}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Confirmation Action */}
        <div className="mt-4 pt-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-12 rounded-full bg-white hover:bg-white/90 text-black font-semibold text-sm transition-all flex items-center justify-center cursor-pointer shadow-lg active:scale-98"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};


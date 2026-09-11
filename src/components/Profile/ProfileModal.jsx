import React, { useState, useEffect } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { BloubAvatar } from '../Bloub/BloubAvatar';
import { SHAPES, COLORS, DEFAULT_SHAPE, DEFAULT_COLOR } from '../Bloub/bloubShapes';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { profile, truncatedId, updateProfile } = useProfile();

  const getActiveName = () => {
    return profile?.name || localStorage.getItem('deceit_name') || '';
  };

  const [name, setName] = useState(getActiveName);
  const [selectedColor, setSelectedColor] = useState(profile?.color || DEFAULT_COLOR);
  const [selectedShape, setSelectedShape] = useState(profile?.shape || DEFAULT_SHAPE);

  // Sync state whenever the modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      const currentName = profile?.name || localStorage.getItem('deceit_name') || '';
      setName(currentName);
      setSelectedColor(profile?.color || DEFAULT_COLOR);
      setSelectedShape(profile?.shape || DEFAULT_SHAPE);
    }
  }, [isOpen, profile?.name, profile?.color, profile?.shape]);

  useEffect(() => {
    const handleNameChange = (e) => {
      if (e.detail) {
        setName(e.detail);
      }
    };
    window.addEventListener('deceit:name-change', handleNameChange);
    return () => window.removeEventListener('deceit:name-change', handleNameChange);
  }, []);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const cleanName = name.trim() || localStorage.getItem('deceit_name') || 'Player';
    updateProfile({
      name: cleanName,
      color: selectedColor,
      shape: selectedShape
    });
    localStorage.setItem('deceit_name', cleanName);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-[400] flex flex-col justify-end md:justify-center items-center p-4 sm:p-6 pb-6 animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto bg-[#0c0c0e] rounded-[32px] p-6 sm:p-7 shadow-2xl relative border border-white/10"
        style={{ animation: 'slideUpModal 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        {/* Close button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer z-10"
        >
          <span className="material-symbols-rounded text-[20px]">close</span>
        </button>

        {/* Header & Character Preview */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <BloubAvatar 
              shape={selectedShape}
              color={selectedColor}
              expression="idle"
              size={100}
            />
          </div>

          <h3 className="text-2xl font-serif text-white tracking-tight">
            Player Profile
          </h3>
          <div className="flex items-center gap-1.5 mt-1 font-mono text-xs text-white/40">
            <span>ID:</span>
            <span className="text-white/70 font-bold">{truncatedId}</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="Your table name"
              className="w-full h-[42px] bg-white/[0.05] border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/30 transition-colors font-medium"
              required
            />
          </div>

          {/* Profile Color Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-white/60">
                Character Color
              </label>
              <span className="text-xs font-mono text-white/50">
                {COLORS.find((c) => c.hex.toLowerCase() === selectedColor.toLowerCase())?.label || ''}
              </span>
            </div>

            {/* Solid Color Swatches Grid */}
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  className={`h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                    selectedColor.toLowerCase() === c.hex.toLowerCase()
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-105'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                >
                  {selectedColor.toLowerCase() === c.hex.toLowerCase() && (
                    <span className="material-symbols-rounded text-sm text-white">
                      check
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bloub Shape Selection */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
              Bloub Avatar Shape
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {SHAPES.map((s) => {
                const isSelected = selectedShape === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedShape(s.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-white/10 border-white/40 ring-1 ring-white/30 shadow-lg scale-105'
                        : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10 text-white/60'
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center pointer-events-none">
                      <BloubAvatar
                        shape={s.id}
                        color={selectedColor}
                        expression="idle"
                        size={36}
                      />
                    </div>
                    <span className="text-[11px] font-mono mt-1 text-white/80">
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 font-mono text-xs font-bold rounded-full h-[44px] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-white hover:bg-white/90 text-black font-bold rounded-full h-[44px] transition-colors flex items-center justify-center text-xs uppercase tracking-wider shadow-xl cursor-pointer active:scale-95"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';

const EditNameModal = ({ isOpen, onClose, currentName, onSave }) => {
  const [name, setName] = useState(currentName || '');

  useEffect(() => {
    setName(currentName || localStorage.getItem('deceit_name') || '');
  }, [currentName, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    localStorage.setItem('deceit_name', cleanName);
    window.dispatchEvent(new CustomEvent('deceit:name-change', { detail: cleanName }));

    if (onSave) onSave(cleanName);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex flex-col justify-end md:justify-center items-center p-4 sm:p-6 pb-6 md:pb-6 animate-fade-in"
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
            Change Name
          </h3>
          <p className="text-white/40 text-sm mt-2">
            Update your name across Deceit and active tables.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5 ml-2">Display Name</label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoComplete="off"
              maxLength={30}
              className="w-full h-[48px] bg-white/[0.06] rounded-full px-6 text-lg text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors shadow-inner"
            />
          </div>
          
          <div className="mt-8 pt-4">
            <button 
              type="submit" 
              disabled={!name.trim()}
              className="w-full bg-white hover:bg-white/90 disabled:opacity-50 text-black font-bold rounded-full h-[48px] transition-colors flex items-center justify-center text-lg shadow-xl"
            >
              Save Name
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNameModal;

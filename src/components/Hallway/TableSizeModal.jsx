import React from 'react';

export const TableSizeModal = ({ isOpen, onClose, onSelectSize }) => {
  if (!isOpen) return null;

  const options = [
    { size: 2, label: '2 Players', tag: 'Duel' },
    { size: 3, label: '3 Players', tag: '3-Way' },
    { size: 4, label: '4 Players', tag: '4-Way' }
  ];

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
            Select Table Size
          </h3>
          <p className="text-white/40 text-sm mt-1.5">
            Choose how many players to match with.
          </p>
        </div>

        {/* Clean Options */}
        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.size}
              type="button"
              onClick={() => {
                onSelectSize(opt.size);
                onClose();
              }}
              className="w-full h-[52px] px-6 rounded-full bg-white/[0.06] hover:bg-white text-white hover:text-black font-semibold text-base transition-all border border-white/10 hover:border-white flex items-center justify-between cursor-pointer active:scale-[0.98] shadow-sm group"
            >
              <span>{opt.label}</span>
              <span className="text-xs font-mono text-white/40 group-hover:text-black/60 transition-colors">
                {opt.tag}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


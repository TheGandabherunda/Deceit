import React from 'react';

export const TableSizeModal = ({ isOpen, onClose, onSelectSize }) => {
  if (!isOpen) return null;

  const options = [
    {
      size: 2,
      label: '2 Players',
      subtitle: 'Duel',
      desc: '1v1 Russian Roulette showdown. Fast & intense.',
      icon: 'person_outline',
      badge: 'Fastest'
    },
    {
      size: 3,
      label: '3 Players',
      subtitle: 'Triad',
      desc: '3-way standoff. Double bluffing & mindgames.',
      icon: 'group',
      badge: 'Tactical'
    },
    {
      size: 4,
      label: '4 Players',
      subtitle: 'Full Table',
      desc: 'Maximum table capacity. High tension & pure chaos.',
      icon: 'groups',
      badge: 'Max Chaos'
    }
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
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10"
        >
          <span className="material-symbols-rounded text-[20px]">close</span>
        </button>

        <div className="mt-1 mb-6 text-center px-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-white/80 font-mono text-[10px] uppercase tracking-wider mb-2 border border-white/10">
            <span className="material-symbols-rounded text-[13px]">tune</span>
            Matchmaking
          </span>
          <h3 className="text-3xl text-white font-serif tracking-tight font-bold">
            Select Table Size
          </h3>
          <p className="text-white/40 text-xs mt-1">
            Choose how many players you want to match with.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {options.map((opt) => (
            <button
              key={opt.size}
              type="button"
              onClick={() => {
                onSelectSize(opt.size);
                onClose();
              }}
              className="w-full p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/10 hover:border-white/25 transition-all flex items-center justify-between text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-white/5 group-hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80 group-hover:text-white transition-colors">
                  <span className="material-symbols-rounded text-xl">{opt.icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-white">
                      {opt.label}
                    </span>
                    <span className="text-[10px] font-mono text-white/40 uppercase">
                      • {opt.subtitle}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">
                    {opt.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10">
                  {opt.badge}
                </span>
                <span className="material-symbols-rounded text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all text-sm">
                  arrow_forward
                </span>
              </div>
            </button>
          ))}
        </div>

        <p className="text-[11px] font-mono text-white/30 text-center">
          Automatic matchmaking pairs you with peers who selected the same table size.
        </p>
      </div>
    </div>
  );
};

import React from 'react';

export const DoorCard = ({ room, onJoin }) => {
  const { roomCode, hostName, playerCount, maxPlayers, status, soleSurvivor } = room;

  const isOpen = status === 'open';
  const isPlaying = status === 'playing';
  const isClosed = status === 'closed' || !!soleSurvivor;

  return (
    <div 
      onClick={() => isOpen && onJoin(roomCode)}
      className={`w-full bg-white/[0.03] hover:bg-white/[0.06] p-5 rounded-2xl transition-all flex flex-col justify-between gap-4 border border-white/5 hover:border-white/15 ${
        isOpen ? 'cursor-pointer group' : 'opacity-70'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-lg text-white group-hover:text-white transition-colors">
              Room #{roomCode}
            </h4>
            {isOpen && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/10">
                Open
              </span>
            )}
            {isPlaying && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/5 flex items-center gap-1">
                <span className="material-symbols-rounded text-[14px]">lock</span> Playing
              </span>
            )}
            {isClosed && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/5">
                Closed
              </span>
            )}
          </div>
          <p className="text-white/40 text-xs mt-1">
            Host: {hostName || 'Anonymous'}
          </p>
        </div>

        <div className="text-right">
          <span className="text-white/60 text-xs font-mono">
            {playerCount}/{maxPlayers || 4} Players
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        {isOpen ? (
          <>
            <span className="text-white/40 text-xs">Waiting for players</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onJoin(roomCode);
              }}
              className="bg-white hover:bg-white/90 text-black px-4 py-1.5 rounded-full font-bold text-xs transition-colors shadow-md"
            >
              Join Table
            </button>
          </>
        ) : isPlaying ? (
          <span className="text-white/30 text-xs italic">Game in progress</span>
        ) : (
          <span className="text-white/40 text-xs">
            Sole Survivor: <strong className="text-white">{soleSurvivor || 'Unknown'}</strong>
          </span>
        )}
      </div>
    </div>
  );
};

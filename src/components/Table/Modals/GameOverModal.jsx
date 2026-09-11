import React, { useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { useNostr } from '../../../context/NostrContext';
import { sound } from '../../../services/sound';

export const GameOverModal = () => {
  const { soleSurvivor, endGameReason, players, resetToLobby, leaveRoom } = useGame();
  const { pubkey } = useNostr();

  useEffect(() => {
    return () => {
      sound.stopWin();
      sound.stopFail();
    };
  }, []);

  if (!soleSurvivor) return null;

  const isWinner = soleSurvivor.pk === pubkey;
  const isDisconnectWin = endGameReason?.type === 'disconnect';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[350] flex flex-col justify-center items-center p-4 animate-fade-in select-none">
      <div 
        className="w-full max-w-md bg-[#0a0a0a] rounded-[32px] p-6 sm:p-8 shadow-2xl relative border border-white/10 text-center"
        style={{ animation: 'slideUpModal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <span className="material-symbols-rounded text-5xl mb-2 text-white">
          {isWinner ? 'emoji_events' : 'skull'}
        </span>

        <span className="text-white/40 font-mono text-xs uppercase tracking-widest block mb-1">
          {isDisconnectWin 
            ? 'Match Concluded (Disconnect)' 
            : (isWinner ? 'Sole Survivor' : 'Eliminated')}
        </span>

        <h3 className="text-3xl font-serif text-white tracking-tight mb-1">
          {isWinner ? 'Victory!' : 'Defeat'}
        </h3>

        <p className="text-lg font-bold text-white mb-2">
          {isWinner ? 'You won the table!' : `${soleSurvivor.name} survived`}
        </p>

        {isDisconnectWin ? (
          <div className="mb-4 px-3 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-mono text-center">
            <span>Opponent disconnected. Table awarded to player with highest Dominance Score!</span>
          </div>
        ) : (
          <p className="text-white/40 text-xs font-mono mb-4 max-w-xs mx-auto">
            {isWinner 
              ? 'You outlasted every bluff and survived the revolver.' 
              : 'Fell in the Russian Roulette. The table belongs to the victor.'}
          </p>
        )}

        {/* Dominance Score Leaderboard */}
        <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 mb-6 text-left">
          <div className="flex items-center justify-between text-[11px] font-mono text-white/40 mb-2 uppercase tracking-wider">
            <span>Player</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-rounded text-xs text-amber-400">bolt</span>
              Dominance Score
            </span>
          </div>
          <div className="space-y-2">
            {players.map(p => {
              const pIsWinner = p.pk === soleSurvivor.pk;
              return (
                <div 
                  key={p.pk} 
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono ${
                    pIsWinner ? 'bg-white/10 border border-white/20 text-white font-bold' : 'text-white/70 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{p.name}</span>
                    {p.pk === pubkey && <span className="text-[10px] text-white/50">(You)</span>}
                    {pIsWinner && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold uppercase tracking-wider">
                        Winner
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-sm text-white">
                    {p.dominanceScore ?? 0} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: Play Again (Stay in table) or Leave */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={resetToLobby}
            className="w-full bg-white hover:bg-white/90 text-black font-bold rounded-full h-[46px] transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-xl cursor-pointer active:scale-95"
          >
            <span className="material-symbols-rounded text-base">replay</span>
            <span>Stay & Play Again</span>
          </button>

          <button
            onClick={leaveRoom}
            className="w-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-full h-[40px] transition-colors flex items-center justify-center text-xs font-mono tracking-wider cursor-pointer"
          >
            Return to Hallway
          </button>
        </div>
      </div>
    </div>
  );
};

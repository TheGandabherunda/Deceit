import React, { useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { useNostr } from '../../../context/NostrContext';
import { useProfile } from '../../../context/ProfileContext';
import { sound } from '../../../services/sound';
import { BloubAvatar } from '../../Bloub/BloubAvatar';

export const GameOverModal = () => {
  const { soleSurvivor, endGameReason, players, resetToLobby, leaveRoom } = useGame();
  const { pubkey } = useNostr();
  const { profile } = useProfile();

  useEffect(() => {
    return () => {
      sound.stopWin();
      sound.stopFail();
    };
  }, []);

  if (!soleSurvivor) return null;

  const isWinner = soleSurvivor.pk === pubkey;
  const isDisconnectWin = endGameReason?.type === 'disconnect';

  const winner = soleSurvivor;
  const winnerColor = winner.color || (winner.pk === pubkey ? profile.color : '#3b93f0');
  const winnerShape = winner.shape || (winner.pk === pubkey ? profile.shape : 'cercle');

  // Local player info for defeat screen
  const localPlayerObj = players.find(p => p.pk === pubkey);
  const loserName = localPlayerObj?.name || profile.name || 'You';
  const loserColor = localPlayerObj?.color || profile.color || '#e8483f';
  const loserShape = localPlayerObj?.shape || profile.shape || 'cercle';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[350] flex flex-col justify-center items-center p-4 animate-fade-in select-none">
      <div 
        className="w-full max-w-md bg-[#0a0a0a] rounded-[32px] p-6 sm:p-8 shadow-2xl relative border border-white/10 text-center"
        style={{ animation: 'slideUpModal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <span className="text-white/40 font-mono text-xs uppercase tracking-widest block mb-1">
          {isDisconnectWin 
            ? 'Match Concluded (Disconnect)' 
            : (isWinner ? 'Sole Survivor' : 'Eliminated')}
        </span>

        <h3 className="text-3xl font-serif text-white tracking-tight mb-2">
          {isWinner ? 'Victory!' : 'Defeat'}
        </h3>

        {/* Respective Face Only: Winner sees only Winner face; Loser sees only Loser face */}
        {isWinner ? (
          /* Winner Face Showcase */
          <div className="flex flex-col items-center justify-center my-4 relative">
            <div className="relative">
              {/* Crown Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-black rounded-full p-1 shadow-lg z-10 animate-bounce">
                <span className="material-symbols-rounded text-base block leading-none">
                  crown
                </span>
              </div>

              <div className="rounded-full ring-4 ring-amber-400/30 p-1 bg-black/40 shadow-2xl">
                <BloubAvatar
                  shape={winnerShape}
                  color={winnerColor}
                  expression="victory"
                  size={96}
                />
              </div>
            </div>

            <span className="text-white font-bold text-lg mt-3">
              {winner.name} (You)
            </span>
            <span className="text-amber-400 font-mono text-[10px] uppercase tracking-widest font-semibold">
              Table Champion
            </span>
          </div>
        ) : (
          /* Loser Face Showcase with Dead X X Eyes */
          <div className="flex flex-col items-center justify-center my-4 relative">
            <div className="relative">
              {/* Eliminated Skull Badge */}
              <div className="absolute -bottom-1 -right-1 bg-black/80 border border-white/20 rounded-full p-1 shadow-md z-10">
                <span className="material-symbols-rounded text-sm text-rose-400 block leading-none">
                  skull
                </span>
              </div>

              <div className="rounded-full ring-4 ring-rose-500/20 p-1 bg-black/40 shadow-2xl opacity-80">
                <BloubAvatar
                  shape={loserShape}
                  color={loserColor}
                  expression="dead"
                  size={96}
                />
              </div>
            </div>

            <span className="text-white font-bold text-lg mt-3">
              {loserName} (You)
            </span>
            <span className="text-rose-400 font-mono text-[10px] uppercase tracking-widest font-semibold">
              Eliminated
            </span>
          </div>
        )}

        {isDisconnectWin ? (
          <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-6 text-left space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <span className="material-symbols-rounded text-base">wifi_off</span>
              <span>Disconnection Rule Decision</span>
            </div>
            <p className="text-white/80 leading-relaxed">
              <strong>{endGameReason?.disconnectedName || 'Opponent'}</strong> disconnected and did not return within the 30-second window.
            </p>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 text-[11px] text-white/60">
              <div className="text-white/90 font-semibold font-sans">How victory was calculated:</div>
              <div>• Disconnection Rule: Tie-breaker is resolved by backend Dominance Score.</div>
              <div>• Backend factors: Successful bluff calls (+50), uncalled bluffs (+20), safe truth (+10), and caught bluffs (-50).</div>
              <div className="text-emerald-400 font-bold pt-1">
                Result: {soleSurvivor.name} had higher calculated dominance and was awarded the match!
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-6 text-center font-mono text-xs text-white/60">
            <p className="leading-relaxed">
              {isWinner 
                ? 'You outlasted every bluff and survived the Russian Roulette!' 
                : `${soleSurvivor.name} survived the Russian Roulette to claim the table.`}
            </p>
          </div>
        )}

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

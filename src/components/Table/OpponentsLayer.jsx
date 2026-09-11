import React from 'react';
import { OpponentSeat } from './OpponentSeat';
import { useGame } from '../../context/GameContext';

export const OpponentsLayer = ({ opponents = [], activePlayerPk = null, lastPlay = null }) => {
  const { isStartAudioPlaying } = useGame();

  if (opponents.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-4">
        <div className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-white/40 text-xs font-mono flex items-center gap-2.5 shadow-sm">
          <span>Awaiting players to join the table...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center gap-6 md:gap-12 py-2">
      {opponents.map((opp) => {
        const isTurn = activePlayerPk === opp.pk;
        const isLastActor = lastPlay?.playerPk === opp.pk;
        const lastActionText = isLastActor ? `Played ${lastPlay.cardCount}` : null;

        return (
          <OpponentSeat 
            key={opp.pk}
            player={opp} 
            isActiveTurn={isTurn} 
            lastAction={lastActionText}
          />
        );
      })}
    </div>
  );
};

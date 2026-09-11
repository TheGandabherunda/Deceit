import React from 'react';
import { OpponentSeat } from './OpponentSeat';
import { useTableGaze } from './useTableGaze';
import { useNostr } from '../../context/NostrContext';
import { useGame } from '../../context/GameContext';

export const OpponentsLayer = ({ 
  opponents = [], 
  activePlayerPk = null, 
  lastPlay = null,
  slot = 'top' // 'top' | 'left' | 'right'
}) => {
  const { pubkey } = useNostr();
  const { gameState, designatedLoserPk, liarCallerPk } = useGame();

  const { layoutType, seatStates } = useTableGaze({
    opponents,
    activePlayerPk,
    localPk: pubkey,
    gameState,
    rouletteVictimPk: designatedLoserPk,
    liarAccuserPk: liarCallerPk,
    liarAccusedPk: lastPlay?.playerPk
  });

  if (opponents.length === 0) {
    if (slot !== 'top') return null;
    return (
      <div className="w-full flex items-center justify-center py-4">
        <div className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-white/40 text-xs font-mono flex items-center gap-2.5 shadow-sm">
          <span>Awaiting opponents to join the table...</span>
        </div>
      </div>
    );
  }

  // Filter seats based on slot
  let renderedSeats = seatStates;
  if (layoutType === 'diamond') {
    if (slot === 'left') {
      renderedSeats = seatStates.filter(s => s.positionName === 'middle-left');
    } else if (slot === 'right') {
      renderedSeats = seatStates.filter(s => s.positionName === 'middle-right');
    } else if (slot === 'top') {
      renderedSeats = seatStates.filter(s => s.positionName === 'top-center');
    }
  }

  if (renderedSeats.length === 0) return null;

  return (
    <div className={`flex items-center justify-center ${
      layoutType === 'triangle' ? 'gap-10 sm:gap-24' : 'gap-6 sm:gap-12'
    } py-1`}>
      {renderedSeats.map((seat) => {
        const opp = seat?.player;
        if (!opp || !opp.pk) return null;
        const isTurn = activePlayerPk === opp.pk;

        return (
          <OpponentSeat 
            key={opp.pk}
            player={opp} 
            isActiveTurn={isTurn} 
            expression={seat.expression}
            gazeTarget={seat.gazeTarget}
            directGaze={seat.directGaze}
            isFocusTarget={seat.isFocusTarget}
          />
        );
      })}
    </div>
  );
};

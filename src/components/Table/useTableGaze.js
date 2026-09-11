import { useState, useEffect, useMemo } from 'react';

/**
 * Normalized 2D seat coordinates:
 * Origin (0, 0) is the table center.
 * Me sits at (0, 1.0).
 */
export function getSeatLayout(opponents = []) {
  const count = opponents.length;

  if (count === 0) {
    return {
      type: 'empty',
      seats: []
    };
  }

  if (count === 1) {
    // 2-Player (Standoff)
    return {
      type: 'standoff',
      seats: [
        {
          player: opponents[0],
          positionName: 'top-center',
          pos: { x: 0, y: -0.85 },
          restingGaze: { yaw: 0, pitch: -26, roll: 0 }
        }
      ]
    };
  }

  if (count === 2) {
    // 3-Player (The Triangle)
    return {
      type: 'triangle',
      seats: [
        {
          player: opponents[0],
          positionName: 'top-left',
          pos: { x: -0.65, y: -0.75 },
          // Angle inward toward opponent 2
          restingGaze: { yaw: 28, pitch: -10, roll: 0 }
        },
        {
          player: opponents[1],
          positionName: 'top-right',
          pos: { x: 0.65, y: -0.75 },
          // Angle inward toward opponent 1
          restingGaze: { yaw: -28, pitch: -10, roll: 0 }
        }
      ]
    };
  }

  // 4-Player (The Diamond: Middle-Left, Top-Center, Middle-Right)
  const seats = [];
  if (opponents[0]) {
    seats.push({
      player: opponents[0],
      positionName: 'middle-left',
      pos: { x: -0.85, y: 0.0 },
      restingGaze: { yaw: 36, pitch: 0, roll: 0 }
    });
  }
  if (opponents[1]) {
    seats.push({
      player: opponents[1],
      positionName: 'top-center',
      pos: { x: 0.0, y: -0.85 },
      restingGaze: { yaw: 0, pitch: -28, roll: 0 }
    });
  }
  if (opponents[2]) {
    seats.push({
      player: opponents[2],
      positionName: 'middle-right',
      pos: { x: 0.85, y: 0.0 },
      restingGaze: { yaw: -36, pitch: 0, roll: 0 }
    });
  }

  return {
    type: 'diamond',
    seats
  };
}

export function useTableGaze({
  opponents = [],
  activePlayerPk = null,
  localPk = null,
  gameState = 'lobby',
  rouletteVictimPk = null,
  liarAccuserPk = null,
  liarAccusedPk = null
}) {
  const [turnTimer, setTurnTimer] = useState(0);

  // Track deliberation time for the active turn
  useEffect(() => {
    setTurnTimer(0);
    if (gameState !== 'playing' || !activePlayerPk) return;

    const interval = setInterval(() => {
      setTurnTimer((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activePlayerPk, gameState]);

  const layout = useMemo(() => getSeatLayout(opponents), [opponents]);

  // Determine current focus target position
  const mePos = { x: 0, y: 1.0 };
  let focusTargetPos = null;
  let focusTargetPk = activePlayerPk;

  if (activePlayerPk === localPk) {
    focusTargetPos = mePos;
  } else if (activePlayerPk) {
    const seat = layout.seats.find((s) => s.player?.pk === activePlayerPk);
    if (seat) focusTargetPos = seat.pos;
  }

  // When liar call is being verified or roulette penalty is happening
  if (liarAccusedPk) {
    focusTargetPk = liarAccusedPk;
    const seat = layout.seats.find((s) => s.player?.pk === liarAccusedPk);
    focusTargetPos = liarAccusedPk === localPk ? mePos : seat?.pos;
  } else if (rouletteVictimPk) {
    focusTargetPk = rouletteVictimPk;
    const seat = layout.seats.find((s) => s.player?.pk === rouletteVictimPk);
    focusTargetPos = rouletteVictimPk === localPk ? mePos : seat?.pos;
  }

  // Compute state for each seat with a valid player
  const validSeats = (layout.seats || []).filter((s) => Boolean(s && s.player && s.player.pk));

  const seatStates = validSeats.map((seat) => {
    const p = seat.player;
    const isSelfFocus = Boolean(focusTargetPk && p.pk && focusTargetPk === p.pk);

    // 1. Expression resolution
    let expression = 'idle';

    if (rouletteVictimPk === p.pk) {
      expression = 'shock';
    } else if (liarAccusedPk === p.pk) {
      expression = 'shock';
    } else if (liarAccuserPk === p.pk) {
      expression = 'aggressive';
    } else if (turnTimer >= 6 && gameState === 'playing') {
      // Taking a long time to select cards -> suspicious
      expression = 'suspicious';
    } else if (gameState === 'playing' && activePlayerPk && !isSelfFocus && Math.random() < 0.25) {
      expression = 'suspicious';
    }

    // 2. Gaze resolution
    let directGaze = null;
    let gazeTarget = null;

    if (isSelfFocus) {
      // The active player looks down at their own hand / table
      directGaze = { yaw: 0, pitch: -18, roll: 0 };
    } else if (focusTargetPos) {
      // Rotate eyes & head to look directly at the focus target!
      const dx = focusTargetPos.x - seat.pos.x;
      const dy = focusTargetPos.y - seat.pos.y;
      gazeTarget = { x: dx, y: dy };
    } else {
      // Default resting gaze according to table geometry
      directGaze = seat.restingGaze;
    }

    return {
      ...seat,
      expression,
      directGaze,
      gazeTarget,
      isFocusTarget: isSelfFocus
    };
  });

  return {
    layoutType: layout.type,
    seatStates
  };
}

import { EYE_H, EYE_SPLIT, EYE_W, REST_GAZE } from './bloubFace';
import { lerp } from './bloubMath';

/**
 * Expression configuration for eyes:
 * w, h: dimensions relative to unit sphere
 * tilt: angle in degrees
 * open: lid opening factor (1 = fully open)
 */
const eye = (w, h, tilt = 0, open = 1) => ({ w, h, tilt, open });
const pair = (w, h, tilt = 0, open = 1) => [
  eye(w, h, tilt, open),
  eye(w, h, -tilt, open)
];

export const EXPRESSIONS = {
  // Idle: Neutral, blinking, subtle breathing
  idle: {
    id: 'idle',
    gaze: { ...REST_GAZE },
    split: EYE_SPLIT,
    eyes: [eye(EYE_W, EYE_H), eye(EYE_W, EYE_H)]
  },

  // Suspicious: Narrowed squinting capsules, slight asymmetric tilt
  suspicious: {
    id: 'suspicious',
    gaze: { yaw: 8, pitch: -4, roll: -5 },
    split: 16,
    eyes: [eye(0.20, 0.38, 5, 0.85), eye(0.21, 0.18, -12, 0.65)]
  },

  // Shock / Fear: Wide open round eyes, raised pupils
  shock: {
    id: 'shock',
    gaze: { yaw: 0, pitch: -16, roll: 0 },
    split: 20,
    eyes: pair(0.42, 0.58, 0, 1.2)
  },

  // Aggressive / Angry: Angled sharp converging capsules, intense focus
  aggressive: {
    id: 'aggressive',
    gaze: { yaw: 0, pitch: 8, roll: 0 },
    split: 17,
    eyes: pair(0.32, 0.16, 28, 0.95)
  },

  // Dead / Defeat: Lifeless head front-facing screen with large X X eyes and clean spacing
  dead: {
    id: 'dead',
    isDead: true,
    gaze: { yaw: 0, pitch: 0, roll: 0 },
    split: 22,
    eyes: pair(0.48, 0.48, 0, 1)
  },

  defeat: {
    id: 'defeat',
    isDead: true,
    gaze: { yaw: 0, pitch: 0, roll: 0 },
    split: 22,
    eyes: pair(0.48, 0.48, 0, 1)
  },

  // Victory / Triumphant: Confident raised gaze, victorious squint
  victory: {
    id: 'victory',
    isDead: false,
    gaze: { yaw: 0, pitch: -8, roll: -3 },
    split: 17,
    eyes: pair(0.34, 0.22, -15, 0.85)
  }
};

export const DEFAULT_EXPRESSION = 'idle';

const lerpEyeCfg = (a, b, t) => ({
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  tilt: lerp(a.tilt ?? 0, b.tilt ?? 0, t),
  open: lerp(a.open ?? 1, b.open ?? 1, t)
});

export function blendExpression(a, b, t) {
  if (!a || !b) return b || a || EXPRESSIONS.idle;
  return {
    id: b.id,
    isDead: (t >= 0.5 ? b.isDead : a.isDead) ?? false,
    gaze: {
      yaw: lerp(a.gaze?.yaw ?? 0, b.gaze?.yaw ?? 0, t),
      pitch: lerp(a.gaze?.pitch ?? 0, b.gaze?.pitch ?? 0, t),
      roll: lerp(a.gaze?.roll ?? 0, b.gaze?.roll ?? 0, t)
    },
    split: lerp(a.split ?? EYE_SPLIT, b.split ?? EYE_SPLIT, t),
    eyes: [
      lerpEyeCfg(a.eyes[0], b.eyes[0], t),
      lerpEyeCfg(a.eyes[1], b.eyes[1], t)
    ]
  };
}

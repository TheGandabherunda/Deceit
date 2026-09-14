import React from 'react';
import { SHAPE_BY_ID, DEFAULT_SHAPE, toPoints, closedPath } from './bloubShapes';

/**
 * Generates a single continuous united cross path (X X dead eyes)
 * with rounded pill ends and NO overlapping subpaths, eliminating
 * the center dot artifact under fillRule="evenodd".
 */
const makeCrossPath = (cx, cy, size = 21, thick = 6) => {
  const s = size / 2;
  const t = thick / 2;
  const r = t;
  const rad = Math.PI / 4; // 45 deg rotation
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  
  const rot = (x, y) => ({
    x: +(x * cos - y * sin + cx).toFixed(2),
    y: +(x * sin + y * cos + cy).toFixed(2)
  });

  // 4 arms with semicircular rounded tips and inner 90-degree corner joints
  const p1 = rot(-t, -s + r);
  const p2 = rot(t, -s + r);
  const c1 = rot(t, -t);
  
  const p3 = rot(s - r, -t);
  const p4 = rot(s - r, t);
  const c2 = rot(t, t);
  
  const p5 = rot(t, s - r);
  const p6 = rot(-t, s - r);
  const c3 = rot(-t, t);
  
  const p7 = rot(-s + r, t);
  const p8 = rot(-s + r, -t);
  const c4 = rot(-t, -t);

  return [
    'M', p1.x, p1.y,
    'A', r, r, 0, 0, 1, p2.x, p2.y,
    'L', c1.x, c1.y,
    'L', p3.x, p3.y,
    'A', r, r, 0, 0, 1, p4.x, p4.y,
    'L', c2.x, c2.y,
    'L', p5.x, p5.y,
    'A', r, r, 0, 0, 1, p6.x, p6.y,
    'L', c3.x, c3.y,
    'L', p7.x, p7.y,
    'A', r, r, 0, 0, 1, p8.x, p8.y,
    'L', c4.x, c4.y,
    'Z'
  ].join(' ');
};

/**
 * Generates an SVG path for a joyful smiling squint eye (⌒ victory eye)
 * centered precisely at (cx, cy).
 */
const makeSmilingEyePath = (cx, cy, w = 19, h = 9, thick = 4.5) => {
  const hw = w / 2;
  const r = thick / 2;
  const yBase = cy + h * 0.25;
  const yPeak = cy - h * 0.75;
  
  const p0x = cx - hw, p0y = yBase;
  const p1x = cx + hw, p1y = yBase;
  const c1x = cx - hw * 0.45, c1y = yPeak;
  const c2x = cx + hw * 0.45, c2y = yPeak;
  
  const ip0x = cx - hw, ip0y = yBase + thick;
  const ip1x = cx + hw, ip1y = yBase + thick;
  const ic1x = cx - hw * 0.45, ic1y = yPeak + thick;
  const ic2x = cx + hw * 0.45, ic2y = yPeak + thick;

  return [
    'M', +(p0x).toFixed(2), +(p0y).toFixed(2),
    'C', +(c1x).toFixed(2), +(c1y).toFixed(2) + ',', +(c2x).toFixed(2), +(c2y).toFixed(2) + ',', +(p1x).toFixed(2), +(p1y).toFixed(2),
    'A', +(r).toFixed(2), +(r).toFixed(2), '0 0 1', +(ip1x).toFixed(2), +(ip1y).toFixed(2),
    'C', +(ic2x).toFixed(2), +(ic2y).toFixed(2) + ',', +(ic1x).toFixed(2), +(ic1y).toFixed(2) + ',', +(ip0x).toFixed(2), +(ip0y).toFixed(2),
    'A', +(r).toFixed(2), +(r).toFixed(2), '0 0 1', +(p0x).toFixed(2), +(p0y).toFixed(2),
    'Z'
  ].join(' ');
};

/**
 * 3D Gold Metal Emblem Icon for Character Bloub in GameOver (Victory / Defeat) Card.
 * Uses the authentic 160x160 coordinate space matching KingIcon, QueenIcon, AceIcon, JokerIcon
 * with #card-gold-pattern fill and #card-metal-icon specular filter.
 */
export const BloubEmblemIcon = ({
  shape = DEFAULT_SHAPE,
  isWinner = false,
  className = "w-36 h-36 sm:w-40 sm:h-40"
}) => {
  const shapeObj = SHAPE_BY_ID.get(shape) || SHAPE_BY_ID.get(DEFAULT_SHAPE);
  const radii = shapeObj?.radii || new Array(64).fill(1);

  // Position and Scale: Winner is shifted slightly down to accommodate the top crown
  const cx = 80;
  const cy = isWinner ? 86 : 80;
  const scale = isWinner ? 43 : 47;

  // Generate Bloub silhouette path
  const pts = toPoints(radii, scale, 1, 1, 0, 0, 0).map(p => ({
    x: p.x + cx,
    y: p.y + cy
  }));
  const bodyD = closedPath(pts);

  // Concentric sculpted inner relief groove following the character's organic silhouette
  const outerRimPts = toPoints(radii, scale - 4, 1, 1, 0, 0, 0).map(p => ({
    x: p.x + cx,
    y: p.y + cy
  }));
  const innerRimPts = toPoints(radii, scale - 6.5, 1, 1, 0, 0, 0).map(p => ({
    x: p.x + cx,
    y: p.y + cy
  }));
  const innerGrooveD = `${closedPath(outerRimPts)} ${closedPath(innerRimPts)}`;

  // Generate Eye paths (Joyful smiling squint for victory, rounded pill crosses for dead)
  const leftEyeD = isWinner
    ? makeSmilingEyePath(cx - 16, cy - 3, 19, 9, 4.5)
    : makeCrossPath(cx - 16, cy, 21, 5.5);

  const rightEyeD = isWinner
    ? makeSmilingEyePath(cx + 16, cy - 3, 19, 9, 4.5)
    : makeCrossPath(cx + 16, cy, 21, 5.5);

  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} overflow-visible pointer-events-none select-none`}
    >
      {/* 1. Dark obsidian backing strictly under the eye cutouts (so card color never bleeds through) */}
      <path d={`${leftEyeD} ${rightEyeD}`} fill="#120e04" />

      {/* 2. 3D Gold Metal Emblem Group with specular lighting and real gold texture */}
      <g filter="url(#card-metal-icon)" fill="url(#card-gold-pattern)">
        {/* Body with beveled eye cutouts using fillRule="evenodd" */}
        <path
          d={`${bodyD} ${leftEyeD} ${rightEyeD}`}
          fillRule="evenodd"
        />

        {/* Concentric Sculpted Medallion Groove following the character silhouette */}
        <path
          d={innerGrooveD}
          fillRule="evenodd"
        />

        {/* Majestic Royal Crown for Winner (enlarged, rotated slight right, placed on slight right of head) */}
        {isWinner && (
          <g transform="translate(100, 36) rotate(20) scale(0.42) translate(-80, -75)">
            <path d="M33.334 133.333V120H126.667V133.333H33.334Z" />
            <path d="M33.334 110L24.834 56.4997C24.6118 56.4997 24.3618 56.5275 24.084 56.583C23.8062 56.6386 23.5562 56.6663 23.334 56.6663C20.5562 56.6663 18.1951 55.6941 16.2507 53.7497C14.3062 51.8052 13.334 49.4441 13.334 46.6663C13.334 43.8886 14.3062 41.5275 16.2507 39.583C18.1951 37.6386 20.5562 36.6663 23.334 36.6663C26.1118 36.6663 28.4729 37.6386 30.4173 39.583C32.3618 41.5275 33.334 43.8886 33.334 46.6663C33.334 47.4441 33.2507 48.1663 33.084 48.833C32.9173 49.4997 32.7229 50.1108 32.5007 50.6663L53.334 59.9997L74.1673 31.4997C72.9451 30.6108 71.9451 29.4441 71.1673 27.9997C70.3895 26.5552 70.0007 24.9997 70.0007 23.333C70.0007 20.5552 70.9729 18.1941 72.9173 16.2497C74.8618 14.3052 77.2229 13.333 80.0007 13.333C82.7784 13.333 85.1395 14.3052 87.084 16.2497C89.0284 18.1941 90.0007 20.5552 90.0007 23.333C90.0007 24.9997 89.6118 26.5552 88.834 27.9997C88.0562 29.4441 87.0562 30.6108 85.834 31.4997L106.667 59.9997L127.501 50.6663C127.278 50.1108 127.084 49.4997 126.917 48.833C126.751 48.1663 126.667 47.4441 126.667 46.6663C126.667 43.8886 127.64 41.5275 129.584 39.583C131.528 37.6386 133.89 36.6663 136.667 36.6663C139.445 36.6663 141.806 37.6386 143.751 39.583C145.695 41.5275 146.667 43.8886 146.667 46.6663C146.667 49.4441 145.695 51.8052 143.751 53.7497C141.806 55.6941 139.445 56.6663 136.667 56.6663C136.445 56.6663 136.195 56.6386 135.917 56.583C135.64 56.5275 135.39 56.4997 135.167 56.4997L126.667 110H33.334Z" />
          </g>
        )}
      </g>
    </svg>
  );
};

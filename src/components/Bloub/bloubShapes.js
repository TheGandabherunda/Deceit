import { TAU, lerp, r2 } from './bloubMath';

export const PROFILE_SAMPLES = 64;

const ANGLES = Array.from({ length: PROFILE_SAMPLES }, (_, i) => (i / PROFILE_SAMPLES) * TAU);
const COS = ANGLES.map(Math.cos);
const SIN = ANGLES.map(Math.sin);

export function toPoints(radii, scale = 100, sx = 1, sy = 1, rot = 0, cx = 0, cy = 0) {
  const cr = Math.cos(rot);
  const sr = Math.sin(rot);
  const pts = new Array(PROFILE_SAMPLES);
  for (let i = 0; i < PROFILE_SAMPLES; i++) {
    const r = radii[i] ?? 1;
    const x = r * (COS[i] ?? 0);
    const y = r * (SIN[i] ?? 0);
    const rx = x * cr - y * sr;
    const ry = x * sr + y * cr;
    pts[i] = {
      x: (rx * sx + cx) * scale,
      y: (ry * sy + cy) * scale
    };
  }
  return pts;
}

export function closedPath(pts, tension = 1 / 6) {
  const n = pts.length;
  if (n < 3) return '';
  const first = pts[0];
  let d = `M${r2(first.x)} ${r2(first.y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1.x + (p2.x - p0.x) * tension;
    const c1y = p1.y + (p2.y - p0.y) * tension;
    const c2x = p2.x - (p3.x - p1.x) * tension;
    const c2y = p2.y - (p3.y - p1.y) * tension;
    d += `C${r2(c1x)} ${r2(c1y)} ${r2(c2x)} ${r2(c2y)} ${r2(p2.x)} ${r2(p2.y)}`;
  }
  return `${d}Z`;
}

export function capsulePath(w, h) {
  const hw = Math.max(w, 0.01) / 2;
  const hh = Math.max(h, 0.01) / 2;
  const r = Math.min(hw, hh);
  return (
    `M${r2(-hw)} ${r2(-hh + r)}` +
    `A${r2(r)} ${r2(r)} 0 0 1 ${r2(-hw + r)} ${r2(-hh)}` +
    `L${r2(hw - r)} ${r2(-hh)}` +
    `A${r2(r)} ${r2(r)} 0 0 1 ${r2(hw)} ${r2(-hh + r)}` +
    `L${r2(hw)} ${r2(hh - r)}` +
    `A${r2(r)} ${r2(r)} 0 0 1 ${r2(hw - r)} ${r2(hh)}` +
    `L${r2(-hw + r)} ${r2(hh)}` +
    `A${r2(r)} ${r2(r)} 0 0 1 ${r2(-hw)} ${r2(hh - r)}Z`
  );
}

export function crossPath(w, h, t = 0.28) {
  const s = Math.min(Math.max(w, 0.01), Math.max(h, 0.01)) / 2;
  const k = s * t;
  return (
    `M${r2(-s + k)} ${r2(-s)} ` +
    `L0 ${r2(-k)} ` +
    `L${r2(s - k)} ${r2(-s)} ` +
    `L${r2(s)} ${r2(-s + k)} ` +
    `L${r2(k)} 0 ` +
    `L${r2(s)} ${r2(s - k)} ` +
    `L${r2(s - k)} ${r2(s)} ` +
    `L0 ${r2(k)} ` +
    `L${r2(-s + k)} ${r2(s)} ` +
    `L${r2(-s)} ${r2(s - k)} ` +
    `L${r2(-k)} 0 ` +
    `L${r2(-s)} ${r2(-s + k)}Z`
  );
}

function normalize(radii, max = 1) {
  const peak = Math.max(...radii);
  if (peak <= 0) return radii;
  const k = max / peak;
  return radii.map((r) => r * k);
}

export function superellipseProfile(n, sx = 1, sy = 1) {
  return ANGLES.map((_, i) => {
    const c = Math.abs((COS[i] ?? 0) / sx) ** n;
    const s = Math.abs((SIN[i] ?? 0) / sy) ** n;
    return (c + s) ** (-1 / n);
  });
}

export function unionOfCirclesProfile(circles) {
  const out = new Array(PROFILE_SAMPLES).fill(0);
  for (let i = 0; i < PROFILE_SAMPLES; i++) {
    const dx = COS[i] ?? 0;
    const dy = SIN[i] ?? 0;
    let best = 0;
    for (const c of circles) {
      const b = dx * c.x + dy * c.y;
      const disc = b * b - (c.x * c.x + c.y * c.y - c.r * c.r);
      if (disc < 0) continue;
      const t = b + Math.sqrt(disc);
      if (t > best) best = t;
    }
    out[i] = best;
  }
  return out;
}

export function profileFromPolygon(poly, cx = 0, cy = 0) {
  const radii = new Array(PROFILE_SAMPLES).fill(0);
  const n = poly.length;
  for (let k = 0; k < PROFILE_SAMPLES; k++) {
    const dx = COS[k] ?? 0;
    const dy = SIN[k] ?? 0;
    let best = 0;
    for (let i = 0; i < n; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % n];
      const ex = b.x - a.x;
      const ey = b.y - a.y;
      const den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-9) continue;
      const px = a.x - cx;
      const py = a.y - cy;
      const t = (px * ey - py * ex) / den;
      const u = (px * dy - py * dx) / den;
      if (t > best && u >= 0 && u <= 1) best = t;
    }
    radii[k] = best;
  }
  return radii;
}

export function hullOfCircles(x1, y1, r1, x2, y2, r2v, steps = 64) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy) || 1e-6;
  const base = Math.atan2(dy, dx);
  const spread = Math.acos(Math.max(-1, Math.min(1, (r1 - r2v) / dist)));
  const pts = [];
  for (let i = 0; i <= steps / 2; i++) {
    const a = base + spread + ((TAU - 2 * spread) * i) / (steps / 2);
    pts.push({ x: x1 + Math.cos(a) * r1, y: y1 + Math.sin(a) * r1 });
  }
  for (let i = 0; i <= steps / 2; i++) {
    const a = base - spread + ((2 * spread) * i) / (steps / 2);
    pts.push({ x: x2 + Math.cos(a) * r2v, y: y2 + Math.sin(a) * r2v });
  }
  return pts;
}

function roundedPolygon(verts, rc, arcSteps = 8) {
  const n = verts.length;
  const out = [];
  const normal = (a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    return Math.atan2(-dx / len, dy / len);
  };
  for (let i = 0; i < n; i++) {
    const prev = verts[(i - 1 + n) % n];
    const cur = verts[i];
    const next = verts[(i + 1) % n];
    const a0 = normal(prev, cur);
    const a1 = normal(cur, next);
    let d = a1 - a0;
    while (d > Math.PI) d -= TAU;
    while (d < -Math.PI) d += TAU;
    for (let k = 0; k <= arcSteps; k++) {
      const a = a0 + (d * k) / arcSteps;
      out.push({ x: cur.x + Math.cos(a) * rc, y: cur.y + Math.sin(a) * rc });
    }
  }
  return out;
}

export function regularPolygonProfile(sides, radius, rc, rotationDeg = 0) {
  const rot = (rotationDeg * Math.PI) / 180;
  const verts = Array.from({ length: sides }, (_, i) => {
    const a = rot + (i / sides) * TAU;
    return { x: Math.cos(a) * (radius - rc), y: Math.sin(a) * (radius - rc) };
  });
  return profileFromPolygon(roundedPolygon(verts, rc), 0, 0);
}

// Generate pre-computed shapes
const pebble = normalize(
  ANGLES.map((a) => 1 + 0.075 * Math.cos(2 * a + 0.5) + 0.035 * Math.cos(3 * a + 2.1)),
  1.02
);

const cloud = normalize(
  unionOfCirclesProfile([
    { x: -0.44, y: 0.2, r: 0.54 },
    { x: 0.46, y: 0.2, r: 0.5 },
    { x: 0.02, y: 0.3, r: 0.6 },
    { x: -0.24, y: -0.3, r: 0.48 },
    { x: 0.3, y: -0.24, r: 0.44 }
  ]),
  1.02
);

const droplet = normalize(
  profileFromPolygon(hullOfCircles(0, 0.28, 0.66, 0, -0.96, 0.05), 0, 0),
  1.04
);

const capsule = profileFromPolygon(hullOfCircles(-0.42, 0, 0.62, 0.42, 0, 0.62), 0, 0);

export const SHAPES = [
  { id: 'cercle', label: 'Circle', radii: new Array(PROFILE_SAMPLES).fill(1) },
  { id: 'galet', label: 'Pebble', radii: pebble },
  { id: 'squircle', label: 'Squircle', radii: normalize(superellipseProfile(4.2), 1.15) },
  { id: 'capsule', label: 'Capsule', radii: capsule },
  { id: 'triangle', label: 'Triangle', radii: regularPolygonProfile(3, 1.12, 0.34, -90) },
  { id: 'hexagone', label: 'Hexagon', radii: regularPolygonProfile(6, 1.04, 0.26, 0) },
  { id: 'nuage', label: 'Cloud', radii: cloud },
  { id: 'goutte', label: 'Droplet', radii: droplet }
];

export const SHAPE_BY_ID = new Map(SHAPES.map((s) => [s.id, s]));
export const DEFAULT_SHAPE = 'cercle';

export const COLORS = [
  { id: 'cobalt', label: 'Cobalt', hex: '#2563eb' },
  { id: 'emerald', label: 'Emerald', hex: '#059669' },
  { id: 'orange', label: 'Orange', hex: '#ea580c' },
  { id: 'teal', label: 'Teal', hex: '#0d9488' },
  { id: 'magenta', label: 'Magenta', hex: '#db2777' },
  { id: 'cyan', label: 'Cyan', hex: '#0284c7' },
  { id: 'forest', label: 'Forest', hex: '#15803d' },
  { id: 'navy', label: 'Navy', hex: '#1e3a8a' },
  { id: 'bronze', label: 'Bronze', hex: '#9a3412' },
  { id: 'olive', label: 'Olive', hex: '#4d7c0f' },
  { id: 'slate', label: 'Slate', hex: '#475569' },
  { id: 'obsidian', label: 'Obsidian', hex: '#18181b' }
];

export const COLOR_BY_ID = new Map(COLORS.map((c) => [c.id, c]));
export const DEFAULT_COLOR = '#2563eb';

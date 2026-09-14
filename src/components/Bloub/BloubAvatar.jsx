import React, { useEffect, useRef, useId } from 'react';
import { SHAPE_BY_ID, DEFAULT_SHAPE, toPoints, closedPath, capsulePath, crossPath } from './bloubShapes';
import { eyePoses, liveliness, blinkScale, EYE_SPLIT } from './bloubFace';
import { EXPRESSIONS, DEFAULT_EXPRESSION, blendExpression } from './bloubExpressions';
import { clamp, lerp, r2 } from './bloubMath';

const RAYON = 100;
const DEMI_VIEWBOX = 158;

export const BloubAvatar = ({
  shape = DEFAULT_SHAPE,
  color = '#3b93f0',
  stroke = null,
  strokeWidth = 2,
  expression = DEFAULT_EXPRESSION,
  gazeTarget = null, // { x: -1..1, y: -1..1 } relative direction
  directGaze = null, // { yaw, pitch, roll }
  isFocusTarget = false,
  size = 96,
  className = '',
  paperColor = '#000000',
  filter = null
}) => {
  const maskUid = useId().replace(/:/g, '');
  const maskId = `bloub-mask-${maskUid}`;

  const bodyPathRef = useRef(null);
  const strokePathRef = useRef(null);
  const eye0Ref = useRef(null);
  const eye1Ref = useRef(null);
  const svgRef = useRef(null);

  // Animation & transition tracking refs
  const stateRef = useRef({
    currentExpression: EXPRESSIONS[expression] || EXPRESSIONS.idle,
    targetExpression: EXPRESSIONS[expression] || EXPRESSIONS.idle,
    blendProgress: 1,
    currentYaw: 0,
    currentPitch: 0,
    targetYaw: 0,
    targetPitch: 0,
    clock: Math.random() * 10,
    lastTime: 0
  });

  // Handle expression prop updates with smooth blending
  useEffect(() => {
    const nextExp = EXPRESSIONS[expression] || EXPRESSIONS.idle;
    if (stateRef.current.targetExpression.id !== nextExp.id) {
      stateRef.current.currentExpression = blendExpression(
        stateRef.current.currentExpression,
        stateRef.current.targetExpression,
        stateRef.current.blendProgress
      );
      stateRef.current.targetExpression = nextExp;
      stateRef.current.blendProgress = 0;
    }
  }, [expression]);

  // Update target gaze based on directGaze or gazeTarget vector
  useEffect(() => {
    if (directGaze) {
      stateRef.current.targetYaw = directGaze.yaw ?? 0;
      stateRef.current.targetPitch = directGaze.pitch ?? 0;
    } else if (gazeTarget) {
      // Map 2D displacement to yaw/pitch
      stateRef.current.targetYaw = clamp(gazeTarget.x * 40, -42, 42);
      stateRef.current.targetPitch = clamp(-gazeTarget.y * 32, -32, 26);
    } else {
      stateRef.current.targetYaw = 0;
      stateRef.current.targetPitch = 0;
    }
  }, [gazeTarget, directGaze]);

  // Main 60fps RAF animation loop
  useEffect(() => {
    let rafId;

    const shapeObj = SHAPE_BY_ID.get(shape) || SHAPE_BY_ID.get(DEFAULT_SHAPE);
    const radii = shapeObj?.radii || new Array(64).fill(1);

    const tick = (now) => {
      rafId = requestAnimationFrame(tick);

      const st = stateRef.current;
      const dt = st.lastTime ? Math.min((now - st.lastTime) / 1000, 0.064) : 0.016;
      st.lastTime = now;
      st.clock += dt;

      // Advance expression blend
      if (st.blendProgress < 1) {
        st.blendProgress = Math.min(1, st.blendProgress + dt * 4.0); // ~250ms transition
      }

      // Smooth gaze interpolation
      st.currentYaw = lerp(st.currentYaw, st.targetYaw, dt * 8.0);
      st.currentPitch = lerp(st.currentPitch, st.targetPitch, dt * 8.0);

      // Active expression
      const exp = st.blendProgress >= 1
        ? st.targetExpression
        : blendExpression(st.currentExpression, st.targetExpression, st.blendProgress);

      const isDeadEye = !!(exp.isDead || exp.id === 'dead' || exp.id === 'defeat');

      // Liveliness (wander, blinking, breathing)
      const live = liveliness(st.clock, {
        wander: isDeadEye ? 0 : 0.8,
        blink: !isDeadEye,
        float: !isDeadEye
      });

      // Composite head orientation: Dead characters face front directly at screen
      // When directGaze or gazeTarget is provided, gaze direction is controlled explicitly
      const hasExplicitGaze = Boolean(directGaze || gazeTarget);
      const baseYaw = hasExplicitGaze ? 0 : (exp.gaze?.yaw || 0);
      const basePitch = hasExplicitGaze ? 0 : (exp.gaze?.pitch || 0);
      const baseRoll = hasExplicitGaze ? 0 : (exp.gaze?.roll || 0);
      const wanderWeight = hasExplicitGaze ? 0.15 : 1.0;

      const headGaze = isDeadEye
        ? { yaw: 0, pitch: 0, roll: 0 }
        : {
            yaw: baseYaw + st.currentYaw + live.dYaw * wanderWeight,
            pitch: basePitch + st.currentPitch + live.dPitch * wanderWeight,
            roll: baseRoll + live.dRoll * wanderWeight
          };

      // 1. Update Body Silhouette
      const pts = toPoints(
        radii,
        RAYON,
        1 + live.driftX,
        live.breath + live.driftY,
        0,
        live.driftX * 2,
        live.driftY * 2
      );
      const bodyD = closedPath(pts);
      if (bodyPathRef.current) {
        bodyPathRef.current.setAttribute('d', bodyD);
      }
      if (strokePathRef.current) {
        strokePathRef.current.setAttribute('d', bodyD);
      }

      // 2. Update Eye Projections
      const poses = eyePoses(headGaze, RAYON, exp.split || EYE_SPLIT);
      const lidScale = blinkScale(live.lid * (exp.eyes[0]?.open ?? 1));
      const effectiveLid = isDeadEye ? 1 : lidScale;

      // Left Eye
      if (eye0Ref.current && poses[0].depth > -0.1) {
        const eyeCfg = exp.eyes[0] || { w: 0.186, h: 0.412 };
        const w = (eyeCfg.w || (isDeadEye ? 0.66 : 0.186)) * RAYON;
        const h = (eyeCfg.h || (isDeadEye ? 0.66 : 0.412)) * RAYON;
        const eyeD = isDeadEye ? crossPath(w, h, 0.26) : capsulePath(w, h);
        const p = poses[0];
        const a = r2(p.a);
        const b = r2(p.b * effectiveLid);
        const c = r2(p.c);
        const d = r2(p.d * effectiveLid);
        const x = r2(p.x);
        const y = r2(p.y);

        eye0Ref.current.setAttribute('d', eyeD);
        eye0Ref.current.setAttribute('transform', `matrix(${a}, ${b}, ${c}, ${d}, ${x}, ${y})`);
        eye0Ref.current.setAttribute('opacity', poses[0].depth > 0 ? '1' : '0.4');
      }

      // Right Eye
      if (eye1Ref.current && poses[1].depth > -0.1) {
        const eyeCfg = exp.eyes[1] || { w: 0.186, h: 0.412 };
        const w = (eyeCfg.w || (isDeadEye ? 0.66 : 0.186)) * RAYON;
        const h = (eyeCfg.h || (isDeadEye ? 0.66 : 0.412)) * RAYON;
        const eyeD = isDeadEye ? crossPath(w, h, 0.26) : capsulePath(w, h);
        const p = poses[1];
        const a = r2(p.a);
        const b = r2(p.b * effectiveLid);
        const c = r2(p.c);
        const d = r2(p.d * effectiveLid);
        const x = r2(p.x);
        const y = r2(p.y);

        eye1Ref.current.setAttribute('d', eyeD);
        eye1Ref.current.setAttribute('transform', `matrix(${a}, ${b}, ${c}, ${d}, ${x}, ${y})`);
        eye1Ref.current.setAttribute('opacity', poses[1].depth > 0 ? '1' : '0.4');
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [shape]);

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none transition-transform duration-300 ${
        isFocusTarget ? 'scale-105' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`${-DEMI_VIEWBOX} ${-DEMI_VIEWBOX} ${DEMI_VIEWBOX * 2} ${DEMI_VIEWBOX * 2}`}
        className="w-full h-full overflow-visible"
        role="img"
        aria-label="Character Avatar"
      >
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x={-DEMI_VIEWBOX}
            y={-DEMI_VIEWBOX}
            width={DEMI_VIEWBOX * 2}
            height={DEMI_VIEWBOX * 2}
          >
            {/* White body silhouette: determines where color shows */}
            <path ref={bodyPathRef} fill="#ffffff" />
            {/* Black eye cutouts: cut through the body */}
            <path ref={eye0Ref} fill="#000000" />
            <path ref={eye1Ref} fill="#000000" />
          </mask>
        </defs>

        {/* Paper Background Underlay (shows through eye cutouts) */}
        <path
          d=""
          ref={(node) => {
            if (node && bodyPathRef.current) {
              const d = bodyPathRef.current.getAttribute('d');
              if (d) node.setAttribute('d', d);
            }
          }}
          fill={paperColor}
        />

        {/* Color fill masked with the body shape & eye holes */}
        <rect
          x={-DEMI_VIEWBOX}
          y={-DEMI_VIEWBOX}
          width={DEMI_VIEWBOX * 2}
          height={DEMI_VIEWBOX * 2}
          fill={color}
          mask={`url(#${maskId})`}
          filter={filter}
        />

        {/* Optional Stroke Outline */}
        {stroke && (
          <path
            ref={strokePathRef}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
};

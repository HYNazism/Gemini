/**
 * First-class Android & Mobile Touch Controls (Persian & English):
 * - Bounded Bottom-Left Circular Virtual Thumbstick (never blocks HUD or Story Close buttons)
 * - Right-Hand Ergonomic Action Cluster (Whack/ضربه, Dash/جهش, Bloom Spin/چرخش, Restore/احیا)
 * - Viewport-responsive sizing via computeResponsiveHudProfile
 */

import React, { useRef, useState, useEffect } from 'react';
import type { TouchInputState } from '../game/engine';
import {
  computeResponsiveHudProfile,
  isPointInsideJoystickPad,
  type ResponsiveHudProfile,
} from '../game/rules';
import type { Language } from '../game/i18n';

interface TouchControlsProps {
  touchInputs: TouchInputState;
  isNearShrine: boolean;
  dashCooldown: number;
  spinCooldown: number;
  lang: Language;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  touchInputs,
  isNearShrine,
  dashCooldown,
  spinCooldown,
  lang,
}) => {
  const isFa = lang === 'fa';
  const padRef = useRef<HTMLDivElement>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [hudProfile, setHudProfile] = useState<ResponsiveHudProfile>(() =>
    computeResponsiveHudProfile(
      typeof window !== 'undefined' ? window.innerWidth : 1024,
      typeof window !== 'undefined' ? window.innerHeight : 768
    )
  );

  const activeTouchId = useRef<number | null>(null);
  const padCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const onResize = () => {
      setHudProfile(computeResponsiveHudProfile(window.innerWidth, window.innerHeight));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = rect.width / 2;

    if (!isPointInsideJoystickPad(e.clientX, e.clientY, centerX, centerY, radius)) {
      return;
    }

    e.stopPropagation();
    activeTouchId.current = e.pointerId;
    padCenterRef.current = { x: centerX, y: centerY };
    e.currentTarget.setPointerCapture(e.pointerId);

    setJoystickActive(true);

    // Immediately compute initial deflection relative to pad center
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const maxDist = hudProfile.joystickKnobMaxDistancePx;
    const dist = Math.hypot(dx, dy);
    if (dist > 0) {
      const clamped = Math.min(dist, maxDist);
      const angle = Math.atan2(dy, dx);
      const kx = Math.cos(angle) * clamped;
      const ky = Math.sin(angle) * clamped;
      setKnobPos({ x: kx, y: ky });
      touchInputs.moveX = kx / maxDist;
      touchInputs.moveY = ky / maxDist;
    } else {
      setKnobPos({ x: 0, y: 0 });
      touchInputs.moveX = 0;
      touchInputs.moveY = 0;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!joystickActive || activeTouchId.current !== e.pointerId) return;

    const dx = e.clientX - padCenterRef.current.x;
    const dy = e.clientY - padCenterRef.current.y;
    const maxRadius = hudProfile.joystickKnobMaxDistancePx;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) {
      setKnobPos({ x: 0, y: 0 });
      touchInputs.moveX = 0;
      touchInputs.moveY = 0;
      return;
    }

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(distance, maxRadius);
    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    setKnobPos({ x: kx, y: ky });

    // Normalized move direction (-1 to 1)
    touchInputs.moveX = kx / maxRadius;
    touchInputs.moveY = ky / maxRadius;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeTouchId.current === e.pointerId) {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // ignore
      }
      setJoystickActive(false);
      activeTouchId.current = null;
      setKnobPos({ x: 0, y: 0 });
      touchInputs.moveX = 0;
      touchInputs.moveY = 0;
    }
  };

  // Prevent default multi-touch gesture pinch/scroll
  useEffect(() => {
    const preventTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    window.addEventListener('touchmove', preventTouch, { passive: false });
    return () => window.removeEventListener('touchmove', preventTouch);
  }, []);

  const padDiameter = hudProfile.joystickPadRadiusPx * 2;
  const knobDiameter = Math.round(padDiameter * 0.44);
  const isCompact = hudProfile.tier === 'compact-mobile';

  return (
    <div
      dir="ltr"
      data-testid="touch-controls-layer"
      className="fixed inset-0 pointer-events-none z-20 flex items-end justify-between p-3 sm:p-6 select-none touch-none"
    >
      {/* Strictly Bounded Bottom-Left Circular Joystick Pad */}
      <div
        ref={padRef}
        data-testid="joystick-pad"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          width: `${padDiameter}px`,
          height: `${padDiameter}px`,
        }}
        className={`relative pointer-events-auto rounded-full flex items-center justify-center transition-colors shadow-xl cursor-grab active:cursor-grabbing mb-1 ml-1 ${
          joystickActive
            ? 'border-2 border-[#ffd166] bg-[#0f281e]/75 ring-4 ring-[#ffd166]/25'
            : 'border-2 border-[#d8f3dc]/45 bg-[#1b4332]/45 hover:bg-[#1b4332]/65'
        }`}
      >
        {/* Subtle cardinal direction ticks */}
        <span className="absolute top-1.5 text-[9px] text-[#d8f3dc]/40 font-black pointer-events-none">▲</span>
        <span className="absolute bottom-1.5 text-[9px] text-[#d8f3dc]/40 font-black pointer-events-none">▼</span>
        <span className="absolute left-1.5 text-[9px] text-[#d8f3dc]/40 font-black pointer-events-none">◀</span>
        <span className="absolute right-1.5 text-[9px] text-[#d8f3dc]/40 font-black pointer-events-none">▶</span>

        {/* Draggable Thumb Knob */}
        <div
          style={{
            width: `${knobDiameter}px`,
            height: `${knobDiameter}px`,
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            transition: joystickActive ? 'none' : 'transform 0.12s ease-out',
          }}
          className={`rounded-full pointer-events-none flex items-center justify-center shadow-lg border-2 ${
            joystickActive
              ? 'bg-gradient-to-br from-[#ffd166] to-[#f4a261] border-white text-[#081c15]'
              : 'bg-[#95d5b2]/85 border-[#e9f5db] text-[#081c15]'
          }`}
        >
          <span className="text-[10px] font-black tracking-tighter">
            {joystickActive ? '✦' : isFa ? 'حرکت' : 'MOVE'}
          </span>
        </div>
      </div>

      {/* Right Action Buttons Cluster (Bounded to bottom-right action container) */}
      <div
        className={`relative pointer-events-none ${
          isCompact ? 'w-36 h-36' : 'w-44 h-44 sm:w-48 sm:h-48'
        }`}
      >
        {/* Whack / Bonk (Large primary bottom-right) */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            touchInputs.bonkPressed = true;
          }}
          aria-label="Acorn Bonk"
          className={`pointer-events-auto absolute bottom-1 right-1 ${
            isCompact ? 'w-16 h-16 text-[10px]' : 'w-19 h-19 sm:w-20 sm:h-20 text-xs'
          } rounded-full bg-gradient-to-br from-[#80b918] to-[#55a630] border-2 border-[#e9f5db] text-[#0d2818] font-black tracking-wider shadow-xl flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer`}
        >
          <span className={isCompact ? 'text-base' : 'text-xl'}>🌰</span>
          <span>{isFa ? 'ضربه' : 'BONK'}</span>
        </button>

        {/* Dandelion Dash (Bottom left of cluster) */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dashCooldown <= 0) touchInputs.dashPressed = true;
          }}
          disabled={dashCooldown > 0}
          aria-label="Dandelion Dash"
          className={`pointer-events-auto absolute bottom-2 left-2 ${
            isCompact ? 'w-12 h-12 text-[9px]' : 'w-14 h-14 text-[10px]'
          } rounded-full border-2 border-[#e9f5db] font-black tracking-wider shadow-lg flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
            dashCooldown > 0
              ? 'bg-[#2d5029]/60 text-white/50 border-gray-400/40'
              : 'bg-gradient-to-br from-[#48cae4] to-[#0096c7] text-[#03045e]'
          }`}
        >
          <span className={isCompact ? 'text-sm' : 'text-base'}>💨</span>
          <span>{dashCooldown > 0 ? dashCooldown.toFixed(1) : isFa ? 'جهش' : 'DASH'}</span>
        </button>

        {/* Pollen Bloom Spin (Top right of cluster) */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (spinCooldown <= 0) touchInputs.spinPressed = true;
          }}
          disabled={spinCooldown > 0}
          aria-label="Pollen Bloom Spin"
          className={`pointer-events-auto absolute top-2 right-2 ${
            isCompact ? 'w-12 h-12 text-[9px]' : 'w-14 h-14 text-[10px]'
          } rounded-full border-2 border-[#e9f5db] font-black tracking-wider shadow-lg flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
            spinCooldown > 0
              ? 'bg-[#2d5029]/60 text-white/50 border-gray-400/40'
              : 'bg-gradient-to-br from-[#ffb703] to-[#fb8500] text-[#370617]'
          }`}
        >
          <span className={isCompact ? 'text-sm' : 'text-base'}>🌸</span>
          <span>{spinCooldown > 0 ? spinCooldown.toFixed(1) : isFa ? 'چرخش' : 'BLOOM'}</span>
        </button>

        {/* Harvest / Deposit (Top left of cluster - glows if near shrine) */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            touchInputs.interactPressed = true;
          }}
          aria-label="Harvest or Deposit Seeds"
          className={`pointer-events-auto absolute top-1.5 left-4 ${
            isCompact ? 'w-11 h-11 text-[8px]' : 'w-13 h-13 text-[9px]'
          } rounded-full border-2 font-black tracking-wider shadow-lg flex flex-col items-center justify-center active:scale-90 transition-all cursor-pointer ${
            isNearShrine
              ? 'bg-[#ffd166] text-[#2b2d42] border-white ring-4 ring-[#ffd166]/50 scale-105 animate-pulse'
              : 'bg-[#52b788] text-[#081c15] border-[#d8f3dc]'
          }`}
        >
          <span className="text-xs">✨</span>
          <span>{isFa ? 'احیا' : 'RESTORE'}</span>
        </button>
      </div>
    </div>
  );
};

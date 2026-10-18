/**
 * First-class Android & Mobile Touch Controls (Persian & English):
 * - Dynamic Left-Hand Virtual Thumbstick with smooth floating center
 * - Right-Hand Ergonomic Action Cluster (Whack/ضربه, Dash/جهش, Bloom Spin/چرخش, Restore/احیا)
 */

import React, { useRef, useState, useEffect } from 'react';
import type { TouchInputState } from '../game/engine';
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
  const joystickAreaRef = useRef<HTMLDivElement>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [stickOrigin, setStickOrigin] = useState({ x: 0, y: 0 });
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });

  const activeTouchId = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Left half of screen initiates joystick
    if (e.clientX > window.innerWidth * 0.55) return;

    activeTouchId.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setJoystickActive(true);
    setStickOrigin({ x: e.clientX, y: e.clientY });
    setKnobPos({ x: 0, y: 0 });

    touchInputs.moveX = 0;
    touchInputs.moveY = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!joystickActive || activeTouchId.current !== e.pointerId) return;

    const dx = e.clientX - stickOrigin.x;
    const dy = e.clientY - stickOrigin.y;
    const maxRadius = 52;
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

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeTouchId.current === e.pointerId) {
      setJoystickActive(false);
      activeTouchId.current = null;
      setKnobPos({ x: 0, y: 0 });
      touchInputs.moveX = 0;
      touchInputs.moveY = 0;
    }
  };

  // Prevent default gesture pinch/scroll
  useEffect(() => {
    const preventTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    window.addEventListener('touchmove', preventTouch, { passive: false });
    return () => window.removeEventListener('touchmove', preventTouch);
  }, []);

  return (
    <div dir="ltr" className="absolute inset-0 pointer-events-none z-20 flex select-none touch-none">
      {/* Left Touch Joystick Zone */}
      <div
        ref={joystickAreaRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-1/2 h-full pointer-events-auto flex items-end p-8"
      >
        {/* Visual Joystick Ring & Knob */}
        {joystickActive ? (
          <div
            className="fixed w-28 h-28 rounded-full border-2 border-[#d8f3dc]/60 bg-[#1b4332]/40 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none shadow-lg"
            style={{ left: stickOrigin.x, top: stickOrigin.y }}
          >
            <div
              className="w-12 h-12 rounded-full bg-[#95d5b2] border-2 border-white shadow-md"
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
                transition: 'transform 0.04s ease-out',
              }}
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full border border-[#d8f3dc]/30 bg-[#1b4332]/20 flex items-center justify-center mb-6 ml-2">
            <span className="text-[11px] font-bold text-[#d8f3dc]/70 tracking-wide text-center px-2">
              {isFa ? 'چوبک حرکت' : 'Drag Stick'}
            </span>
          </div>
        )}
      </div>

      {/* Right Action Buttons Cluster */}
      <div className="w-1/2 h-full pointer-events-none flex flex-col justify-end items-end p-6 sm:p-8">
        <div className="relative w-48 h-48 pointer-events-auto">
          {/* Whack / Bonk (Large primary bottom-right) */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              touchInputs.bonkPressed = true;
            }}
            aria-label="Acorn Bonk"
            className="absolute bottom-1 right-1 w-20 h-20 rounded-full bg-gradient-to-br from-[#80b918] to-[#55a630] border-3 border-[#e9f5db] text-[#0d2818] font-black text-xs tracking-wider shadow-xl flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer"
          >
            <span className="text-xl">🌰</span>
            <span>{isFa ? 'ضربه' : 'BONK'}</span>
          </button>

          {/* Dandelion Dash (Bottom left of cluster) */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              if (dashCooldown <= 0) touchInputs.dashPressed = true;
            }}
            disabled={dashCooldown > 0}
            aria-label="Dandelion Dash"
            className={`absolute bottom-3 left-3 w-14 h-14 rounded-full border-2 border-[#e9f5db] font-black text-[10px] tracking-wider shadow-lg flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
              dashCooldown > 0
                ? 'bg-[#2d5029]/60 text-white/50 border-gray-400/40'
                : 'bg-gradient-to-br from-[#48cae4] to-[#0096c7] text-[#03045e]'
            }`}
          >
            <span className="text-base">💨</span>
            <span>{dashCooldown > 0 ? dashCooldown.toFixed(1) : isFa ? 'جهش' : 'DASH'}</span>
          </button>

          {/* Pollen Bloom Spin (Top right of cluster) */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              if (spinCooldown <= 0) touchInputs.spinPressed = true;
            }}
            disabled={spinCooldown > 0}
            aria-label="Pollen Bloom Spin"
            className={`absolute top-3 right-3 w-14 h-14 rounded-full border-2 border-[#e9f5db] font-black text-[10px] tracking-wider shadow-lg flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
              spinCooldown > 0
                ? 'bg-[#2d5029]/60 text-white/50 border-gray-400/40'
                : 'bg-gradient-to-br from-[#ffb703] to-[#fb8500] text-[#370617]'
            }`}
          >
            <span className="text-base">🌸</span>
            <span>{spinCooldown > 0 ? spinCooldown.toFixed(1) : isFa ? 'چرخش' : 'BLOOM'}</span>
          </button>

          {/* Harvest / Deposit (Top left of cluster - glows if near shrine) */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              touchInputs.interactPressed = true;
            }}
            aria-label="Harvest or Deposit Seeds"
            className={`absolute top-2 left-6 w-13 h-13 rounded-full border-2 font-black text-[9px] tracking-wider shadow-lg flex flex-col items-center justify-center active:scale-90 transition-all cursor-pointer ${
              isNearShrine
                ? 'bg-[#ffd166] text-[#2b2d42] border-white ring-4 ring-[#ffd166]/50 scale-105 animate-pulse'
                : 'bg-[#52b788] text-[#081c15] border-[#d8f3dc]'
            }`}
          >
            <span className="text-sm">✨</span>
            <span>{isFa ? 'احیا' : 'RESTORE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

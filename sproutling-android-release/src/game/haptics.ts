/**
 * Haptic Feedback & Gamepad Controller Manager for Aethelgard: Warden of the Astral Grove.
 * Provides Dual-Motor Gamepad Rumble (vibrationActuator / hapticActuators),
 * Mobile Web Vibration API patterns (navigator.vibrate), and 60fps Gamepad Input Polling.
 */

export interface GamepadFrameInput {
  connected: boolean;
  controllerName: string;
  moveX: number;
  moveY: number;
  attackJustPressed: boolean;
  parryJustPressed: boolean;
  dashJustPressed: boolean;
  spinJustPressed: boolean;
  pauseJustPressed: boolean;
}

interface GamepadWithHaptics extends Gamepad {
  vibrationActuator?: {
    type?: string;
    playEffect?: (
      type: string,
      params: {
        startDelay?: number;
        duration: number;
        weakMagnitude: number;
        strongMagnitude: number;
      }
    ) => Promise<unknown>;
  };
  hapticActuators?: Array<{
    pulse?: (value: number, duration: number) => Promise<unknown>;
  }>;
}

export class HapticAndGamepadManager {
  private prevButtons: boolean[] = [];
  private isConnected: boolean = false;
  private controllerName: string = '';
  private aftershockTimer: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('gamepadconnected', this.handleGamepadConnect);
      window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnect);
    }
  }

  private handleGamepadConnect = (e: GamepadEvent): void => {
    this.isConnected = true;
    this.controllerName = e.gamepad.id || 'Controller';
    // Gentle connection confirmation pulse
    this.playDualRumble(65, 0.35, 0.2);
  };

  private handleGamepadDisconnect = (): void => {
    const pads = this.getActiveGamepads();
    this.isConnected = pads.length > 0;
    this.controllerName = pads[0]?.id || '';
  };

  private getActiveGamepads(): GamepadWithHaptics[] {
    if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
      return [];
    }
    try {
      const raw = navigator.getGamepads();
      if (!raw) return [];
      const list: GamepadWithHaptics[] = [];
      for (let i = 0; i < raw.length; i++) {
        const pad = raw[i];
        if (pad && pad.connected) {
          list.push(pad as GamepadWithHaptics);
        }
      }
      return list;
    } catch {
      return [];
    }
  }

  /**
   * Triggers Dual-Motor Gamepad Rumble on all active controllers + optional Mobile Web Vibration.
   */
  public playDualRumble(
    durationMs: number,
    strongMagnitude: number,
    weakMagnitude: number,
    vibratePattern?: number | number[]
  ): void {
    // 1. Gamepad Haptic Actuator (Dual-Rumble & Pulse fallbacks)
    const pads = this.getActiveGamepads();
    for (const pad of pads) {
      const actuator = pad.vibrationActuator;
      if (actuator && typeof actuator.playEffect === 'function') {
        actuator
          .playEffect(actuator.type || 'dual-rumble', {
            startDelay: 0,
            duration: Math.max(15, Math.round(durationMs)),
            strongMagnitude: Math.max(0, Math.min(1, strongMagnitude)),
            weakMagnitude: Math.max(0, Math.min(1, weakMagnitude)),
          })
          .catch(() => {
            // Ignore browser permission or unsupported effect errors
          });
      } else if (pad.hapticActuators && pad.hapticActuators.length > 0) {
        const pulseActuator = pad.hapticActuators[0];
        if (pulseActuator && typeof pulseActuator.pulse === 'function') {
          pulseActuator
            .pulse(Math.max(strongMagnitude, weakMagnitude), Math.round(durationMs))
            .catch(() => {});
        }
      }
    }

    // 2. Mobile / Device Web Vibration API Fallback
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function' &&
      vibratePattern !== undefined
    ) {
      try {
        navigator.vibrate(vibratePattern);
      } catch {
        // Ignore on unsupported desktop browsers
      }
    }
  }

  /**
   * Subtle crisp tap when raising the Astral Aegis Parry stance (F / Right-Click / L1).
   */
  public triggerParryStance(): void {
    this.playDualRumble(45, 0.12, 0.38, 18);
  }

  /**
   * Multi-stage rumble when deflecting an enemy attack and shattering their defense.
   * Scales duration, motor magnitudes, and mobile vibration pulses by shakeIntensity (0.38..1.0)
   * and escalates further when shredding a Boss Aegis Shield pillar.
   */
  public triggerPerfectParry(isBossShieldShred: boolean = false, shakeIntensity: number = 0.65): void {
    if (this.aftershockTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.aftershockTimer);
      this.aftershockTimer = null;
    }

    const clampedShake = Math.max(0.3, Math.min(1.0, shakeIntensity));

    if (isBossShieldShred || clampedShake >= 0.95) {
      // Colossal defense-shatter jolt + heavy multi-pulse mobile vibration
      this.playDualRumble(265, 1.0, 0.95, [70, 25, 150]);
      if (typeof window !== 'undefined') {
        this.aftershockTimer = window.setTimeout(() => {
          this.playDualRumble(165, 0.78, 0.9);
          this.aftershockTimer = null;
        }, 190);
      }
    } else if (clampedShake >= 0.8) {
      // Heavy Roller charge deflection
      this.playDualRumble(225, 0.95, 0.85, [55, 22, 120]);
      if (typeof window !== 'undefined') {
        this.aftershockTimer = window.setTimeout(() => {
          this.playDualRumble(135, 0.6, 0.76);
          this.aftershockTimer = null;
        }, 165);
      }
    } else if (clampedShake >= 0.52) {
      // Medium Puffer melee deflection
      this.playDualRumble(185, 0.78, 0.68, [40, 22, 85]);
      if (typeof window !== 'undefined') {
        this.aftershockTimer = window.setTimeout(() => {
          this.playDualRumble(100, 0.42, 0.58);
          this.aftershockTimer = null;
        }, 145);
      }
    } else {
      // Light Frost Sprite / Projectile deflection
      this.playDualRumble(130, 0.52, 0.48, [26, 18, 52]);
      if (typeof window !== 'undefined') {
        this.aftershockTimer = window.setTimeout(() => {
          this.playDualRumble(70, 0.25, 0.38);
          this.aftershockTimer = null;
        }, 115);
      }
    }
  }

  /**
   * High-energy slash rumble when landing an empowered 1.65x Astral Riposte counter-attack.
   */
  public triggerRiposteStrike(shakeIntensity: number = 0.7): void {
    const scale = Math.max(0.5, Math.min(1.0, shakeIntensity));
    this.playDualRumble(
      Math.round(150 * scale),
      Math.min(1.0, 0.86 * scale),
      Math.min(1.0, 0.72 * scale),
      [Math.round(35 * scale), 20, Math.round(75 * scale)]
    );
  }

  /**
   * Standard combat impact or combo finisher rumble.
   */
  public triggerCombatImpact(isFinisher: boolean = false): void {
    if (isFinisher) {
      this.playDualRumble(115, 0.65, 0.5, 35);
    } else {
      this.playDualRumble(55, 0.28, 0.25, 12);
    }
  }

  /**
   * Polls connected Gamepad axes and buttons once per animation frame.
   */
  public pollGamepad(): GamepadFrameInput {
    const pads = this.getActiveGamepads();
    if (pads.length === 0) {
      this.isConnected = false;
      this.prevButtons = [];
      return {
        connected: false,
        controllerName: '',
        moveX: 0,
        moveY: 0,
        attackJustPressed: false,
        parryJustPressed: false,
        dashJustPressed: false,
        spinJustPressed: false,
        pauseJustPressed: false,
      };
    }

    const pad = pads[0];
    this.isConnected = true;
    this.controllerName = pad.id || 'Gamepad';

    // Analog Left Stick + D-Pad fallback
    const deadzone = 0.18;
    let rawX = pad.axes[0] || 0;
    let rawY = pad.axes[1] || 0;
    if (Math.hypot(rawX, rawY) < deadzone) {
      rawX = 0;
      rawY = 0;
    }

    // D-Pad buttons: 12=Up, 13=Down, 14=Left, 15=Right
    if (pad.buttons[14]?.pressed) rawX = -1;
    if (pad.buttons[15]?.pressed) rawX = 1;
    if (pad.buttons[12]?.pressed) rawY = -1;
    if (pad.buttons[13]?.pressed) rawY = 1;

    const currentButtons = pad.buttons.map((b) => Boolean(b && (b.pressed || b.value > 0.45)));
    const wasJustPressed = (index: number): boolean =>
      Boolean(currentButtons[index] && !this.prevButtons[index]);

    // Standard Gamepad Mapping:
    // Parry: L1/LB (4) or L2/LT (6)
    // Strike / Riposte: X/Square (2) or R1/RB (5)
    // Tactical Evade: A/Cross (0) or B/Circle (1)
    // Astral Supernova: Y/Triangle (3) or R2/RT (7)
    // Pause: Start/Options (9)
    const parryJustPressed = wasJustPressed(4) || wasJustPressed(6);
    const attackJustPressed = wasJustPressed(2) || wasJustPressed(5);
    const dashJustPressed = wasJustPressed(0) || wasJustPressed(1);
    const spinJustPressed = wasJustPressed(3) || wasJustPressed(7);
    const pauseJustPressed = wasJustPressed(9);

    this.prevButtons = currentButtons;

    return {
      connected: true,
      controllerName: this.controllerName,
      moveX: Math.max(-1, Math.min(1, rawX)),
      moveY: Math.max(-1, Math.min(1, rawY)),
      attackJustPressed,
      parryJustPressed,
      dashJustPressed,
      spinJustPressed,
      pauseJustPressed,
    };
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('gamepadconnected', this.handleGamepadConnect);
      window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnect);
      if (this.aftershockTimer !== null) {
        window.clearTimeout(this.aftershockTimer);
      }
    }
  }
}

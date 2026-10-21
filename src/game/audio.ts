/**
 * Procedural Web Audio synthesizer for cozy, tactile game feedback and
 * biome-adaptive procedural soundtracks (chirping forest birds, sakura koto & wind chimes,
 * autumn crickets, howling mountain wind, and celestial nebula pads).
 * No external audio files or 404 dependencies.
 */

import type { StageBiomeId, WeatherType, TimePhase } from './rules';

class SoundSystem {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private ambientTimer: number | null = null;
  private bgmPlaying: boolean = false;
  private currentBiomeId: StageBiomeId = 'emerald_meadow';
  private currentWeather: WeatherType = 'sunshine';
  private currentTimePhase: TimePhase = 'day';
  private noiseBuffer: AudioBuffer | null = null;
  private tickCounter: number = 0;

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.ambientTimer) {
      window.clearInterval(this.ambientTimer);
      this.ambientTimer = null;
      this.bgmPlaying = false;
    } else if (!this.isMuted) {
      this.startAmbientBgm();
    }
    return this.isMuted;
  }

  // Acorn Wand Swing / Woosh
  public playSwing(comboStep: number = 1): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    const baseFreq = 220 + comboStep * 60;
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, ctx.currentTime + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  }

  // Bonk / Hit feedback
  public playHit(isFinisher: boolean = false): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isFinisher ? 'square' : 'sine';
    const startFreq = isFinisher ? 340 : 260;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + (isFinisher ? 0.22 : 0.12));

    gain.gain.setValueAtTime(isFinisher ? 0.28 : 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isFinisher ? 0.24 : 0.14));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + (isFinisher ? 0.25 : 0.15));

    // For finisher, add a bright chime
    if (isFinisher) {
      this.playChime(660, 0.2, 0.1);
    }
  }

  // Dandelion Dash whoosh
  public playDash(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.23);
  }

  // Runic Aegis Parry stance activation hum
  public playParryStance(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.17);
  }

  // Perfect Parry deflection clash + AoE shockwave resonance
  public playParrySuccess(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    // 1. Metallic crystalline ring (high harmonic chord)
    [880, 1318.51, 1760].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = ctx.currentTime + idx * 0.02;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.06, t + 0.34);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.38);
    });

    // 2. Sub-bass AoE shockwave thump
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(160, ctx.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 0.28);

    subGain.gain.setValueAtTime(0.28, ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start();
    subOsc.stop(ctx.currentTime + 0.32);
  }

  // Pollen Whirlwind bloom
  public playPollenSpin(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

      gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.05);
      osc.stop(ctx.currentTime + idx * 0.05 + 0.36);
    });
  }

  // Sun-Seed Sparkle pickup
  public playPickup(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const notes = [587.33, 739.99, 880, 1174.66]; // D, F#, A, D
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.04);

      gain.gain.setValueAtTime(0.14, ctx.currentTime + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.04 + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.04);
      osc.stop(ctx.currentTime + i * 0.04 + 0.2);
    });
  }

  // Critter Cleansed / Puff sound
  public playCleansed(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  // Player hurt
  public playPlayerHurt(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.24);
  }

  // Shrine Restored fanfare
  public playShrineRestored(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const chords = [
      [392.0, 493.88, 587.33], // G major
      [440.0, 554.37, 659.25], // A major
      [587.33, 739.99, 880.0], // D major
    ];

    chords.forEach((chord, step) => {
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const t = ctx.currentTime + step * 0.22;
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.52);
      });
    });
  }

  // Victory Fanfare
  public playVictory(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const notes = [
      { f: 523.25, d: 0.18, wait: 0 },
      { f: 659.25, d: 0.18, wait: 0.18 },
      { f: 783.99, d: 0.22, wait: 0.36 },
      { f: 1046.5, d: 0.6, wait: 0.58 },
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = ctx.currentTime + n.wait;
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + n.d + 0.05);
    });
  }

  private playChime(freq: number, duration: number, vol: number): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  }

  /**
   * Updates the active biome, weather particle system, and time phase so the procedural
   * background soundtrack and nature layer shift dynamically with the chapter!
   */
  public setBiomeAndWeather(
    biomeId: StageBiomeId,
    weather: WeatherType,
    timePhase: TimePhase = 'day'
  ): void {
    const biomeChanged = this.currentBiomeId !== biomeId;
    this.currentBiomeId = biomeId;
    this.currentWeather = weather;
    this.currentTimePhase = timePhase;
    if (biomeChanged && this.bgmPlaying) {
      this.stopAmbientBgm();
      this.startAmbientBgm();
    }
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBuffer;
    }
    const bufferSize = Math.floor(ctx.sampleRate * 1.6);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.95 * b2 + white * 0.048;
      data[i] = (b0 + b1 + b2 + white * 0.12) * 0.35;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  // 1. Emerald Meadow Nature Layer: Chirping Forest Songbirds
  private playBirdChirp(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const syllables = 2 + Math.floor(Math.random() * 2);
    const basePitch = 1750 + Math.random() * 650;

    for (let s = 0; s < syllables; s++) {
      const t0 = now + s * 0.13;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(basePitch, t0);
      osc.frequency.exponentialRampToValueAtTime(basePitch * 1.42, t0 + 0.055);
      osc.frequency.exponentialRampToValueAtTime(basePitch * 1.12, t0 + 0.11);

      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(0.024, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.115);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.12);
    }
  }

  // 2. Sakura Glade Nature Layer: Bamboo Wind-Chimes & Petal Breeze
  private playSakuraWindChime(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const chimeNotes = [1174.66, 1318.51, 1567.98, 1760.0, 2093.0];
    const count = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const t0 = now + i * 0.09;
      const freq = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t0);

      gain.gain.setValueAtTime(0.018, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.68);
    }
  }

  // 3. Amber Autumn Grove Nature Layer: Twilight Crickets Stridulation
  private playAutumnCricket(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const carrierFreq = 3850 + Math.random() * 350;
    for (let pulse = 0; pulse < 3; pulse++) {
      const t0 = now + pulse * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(carrierFreq, t0);

      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(0.014, t0 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.048);
    }
  }

  // 4. Frost Aurora Mountain Layer: Howling Mountain Wind Gust
  private playMountainWindGust(ctx: AudioContext, duration = 1.4, peakFreq = 420): void {
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.getNoiseBuffer(ctx);
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(5.5, now);
    filter.frequency.setValueAtTime(190, now);
    filter.frequency.exponentialRampToValueAtTime(peakFreq, now + duration * 0.48);
    filter.frequency.exponentialRampToValueAtTime(210, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.032, now + duration * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    src.stop(now + duration + 0.05);
  }

  // Weather Particle Layer: Gentle Raindrop Plink / Pitter-Patter
  private playRainDroplet(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const base = 950 + Math.random() * 650;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 1.35, now + 0.045);

    gain.gain.setValueAtTime(0.012, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  /**
   * Starts the biome-specific procedural ambient soundtrack + nature & weather particle soundscape!
   */
  public startAmbientBgm(): void {
    if (this.isMuted || this.bgmPlaying) return;
    this.bgmPlaying = true;

    const scalesByBiome: Record<StageBiomeId, number[]> = {
      // 1. Sunlit Emerald Meadow: Warm C-Major Pentatonic Kalimba
      emerald_meadow: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25],
      // 2. Sakura Blossom Valley: Japanese Hirajoshi Koto & Bamboo Flute
      sakura_glade: [293.66, 311.13, 392.0, 440.0, 466.16, 587.33, 622.25, 783.99],
      // 3. Amber Firefly Grove: Cozy A-Dorian Woodland Harp & Lute
      amber_autumngrove: [220.0, 246.94, 261.63, 329.63, 369.99, 440.0, 493.88, 523.25],
      // 4. Aurora Frostveil Basin: Ethereal F-Lydian Glass Celesta
      frost_aurora: [349.23, 392.0, 440.0, 493.88, 523.25, 659.25, 783.99, 880.0],
      // 5. Starlight Astral Oasis: Cosmic Minor-Hexatonic Nebula Chimes
      astral_oasis: [196.0, 233.08, 293.66, 349.23, 392.0, 466.16, 587.33, 698.46],
    };

    const intervalByBiome: Record<StageBiomeId, number> = {
      emerald_meadow: 660,
      sakura_glade: 580,
      amber_autumngrove: 740,
      frost_aurora: 820,
      astral_oasis: 640,
    };

    let noteIdx = 0;
    const stepMs = intervalByBiome[this.currentBiomeId] ?? 680;

    this.ambientTimer = window.setInterval(() => {
      if (this.isMuted) return;
      const ctx = this.initCtx();
      if (!ctx) return;

      this.tickCounter++;
      const biome = this.currentBiomeId;
      const scale = scalesByBiome[biome] ?? scalesByBiome.emerald_meadow;
      const freq = scale[noteIdx % scale.length];
      noteIdx = (noteIdx + (this.tickCounter % 2 === 0 ? 1 : 2)) % scale.length;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (biome === 'sakura_glade') {
        // Plucked Koto string + occasional soft breathy flute harmonic
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.032, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
      } else if (biome === 'amber_autumngrove') {
        // Warm low-mid woodland harp with gentle fifth drone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.036, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.35);
      } else if (biome === 'frost_aurora') {
        // Crystalline glass celesta bell with high overtone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.028, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.55);
      } else if (biome === 'astral_oasis') {
        // Cosmic pad swell + astral resonance
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.03, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.45);
      } else {
        // Emerald meadow kalimba
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.034, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.6);

      // Trigger biome-specific procedural nature soundscapes on alternating ticks
      if (biome === 'emerald_meadow' && this.tickCounter % 3 === 0) {
        this.playBirdChirp(ctx);
      } else if (biome === 'sakura_glade' && this.tickCounter % 3 === 1) {
        this.playSakuraWindChime(ctx);
      } else if (biome === 'amber_autumngrove' && this.tickCounter % 2 === 0) {
        this.playAutumnCricket(ctx);
      } else if (biome === 'frost_aurora' && this.tickCounter % 3 === 0) {
        this.playMountainWindGust(ctx, 1.45, 360 + Math.random() * 220);
      } else if (biome === 'astral_oasis' && this.tickCounter % 4 === 0) {
        // Deep cosmic sub-drone pulse
        this.playChime(98.0, 1.8, 0.025);
      }

      // Trigger weather particle sound layer to complement active 3D particle system
      if (this.currentWeather === 'rain' && this.tickCounter % 2 === 0) {
        this.playRainDroplet(ctx);
      } else if (this.currentWeather === 'snow' && biome !== 'frost_aurora' && this.tickCounter % 4 === 0) {
        this.playMountainWindGust(ctx, 1.1, 310);
      } else if (this.currentWeather === 'petals' && biome !== 'sakura_glade' && this.tickCounter % 4 === 0) {
        this.playSakuraWindChime(ctx);
      } else if (
        this.currentWeather === 'sunshine' &&
        this.currentTimePhase === 'day' &&
        biome !== 'emerald_meadow' &&
        this.tickCounter % 5 === 0
      ) {
        this.playBirdChirp(ctx);
      }
    }, stepMs);
  }

  public stopAmbientBgm(): void {
    if (this.ambientTimer) {
      window.clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
    this.bgmPlaying = false;
  }
}

export const sound = new SoundSystem();


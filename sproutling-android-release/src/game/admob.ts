/**
 * Google Play AdMob Bridge (Native Capacitor Android + Web SDK Simulator).
 *
 * CRITICAL ADMOB POLICY COMPLIANCE:
 * 1. Never link ads via raw email address; AdMob strictly requires Publisher App ID
 *    (ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY) and Ad Unit IDs (ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ).
 * 2. Always default to Google's Official Test IDs during development/testing to protect
 *    the publisher account (hyn198911@gmail.com) from invalid-traffic suspension.
 * 3. Never render banner ads over active 3D gameplay controls (prevents accidental-click policy strikes).
 */

import { isValidAdMobAppId, isValidAdMobUnitId } from './rules';

export interface AdMobConfig {
  publisherEmail: string;
  packageName: string;
  appId: string;
  rewardedAdUnitId: string;
  interstitialAdUnitId: string;
  bannerAdUnitId: string;
  isTestMode: boolean;
}

// Official Google AdMob Android Test IDs
export const GOOGLE_TEST_ADMOB_CONFIG: AdMobConfig = {
  publisherEmail: 'hyn198911@gmail.com',
  packageName: 'com.hyn198911.sproutling3d',
  appId: 'ca-app-pub-3940256099942544~3347511713',
  rewardedAdUnitId: 'ca-app-pub-3940256099942544/5224354917',
  interstitialAdUnitId: 'ca-app-pub-3940256099942544/1033173712',
  bannerAdUnitId: 'ca-app-pub-3940256099942544/6300978111',
  isTestMode: true,
};

const STORAGE_KEY = 'sproutling_admob_config_v1';

export interface ActiveAdOverlay {
  type: 'rewarded' | 'interstitial';
  unitId: string;
  isTest: boolean;
  rewardLabel: string;
  secondsRemaining: number;
  canClose: boolean;
}

type OverlayListener = (overlay: ActiveAdOverlay | null) => void;

class AdMobService {
  private config: AdMobConfig = { ...GOOGLE_TEST_ADMOB_CONFIG };
  private listeners = new Set<OverlayListener>();
  private activeOverlay: ActiveAdOverlay | null = null;
  private countdownTimer: number | null = null;
  private onRewardCallback: (() => void) | null = null;
  private onDismissCallback: (() => void) | null = null;
  private lastInterstitialTime = -999;

  constructor() {
    this.loadConfig();
  }

  public loadConfig(): AdMobConfig {
    if (typeof window === 'undefined') return this.config;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AdMobConfig>;
        this.config = {
          ...GOOGLE_TEST_ADMOB_CONFIG,
          ...parsed,
        };
      }
    } catch {
      // ignore storage errors
    }
    return this.config;
  }

  public saveConfig(next: AdMobConfig): { valid: boolean; error?: string } {
    if (!isValidAdMobAppId(next.appId)) {
      return {
        valid: false,
        error: 'فرمت App ID نامعتبر است. باید به شکل ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY باشد.',
      };
    }
    if (
      !isValidAdMobUnitId(next.rewardedAdUnitId) ||
      !isValidAdMobUnitId(next.interstitialAdUnitId) ||
      !isValidAdMobUnitId(next.bannerAdUnitId)
    ) {
      return {
        valid: false,
        error: 'فرمت Ad Unit ID نامعتبر است. باید به شکل ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ باشد.',
      };
    }

    this.config = { ...next };
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      } catch {
        // ignore
      }
    }
    return { valid: true };
  }

  public resetToTestIds(): AdMobConfig {
    this.config = { ...GOOGLE_TEST_ADMOB_CONFIG };
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      } catch {
        // ignore
      }
    }
    return this.config;
  }

  public getConfig(): AdMobConfig {
    return { ...this.config };
  }

  public subscribe(listener: OverlayListener): () => void {
    this.listeners.add(listener);
    listener(this.activeOverlay);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l(this.activeOverlay));
  }

  private isNativeCapacitor(): boolean {
    if (typeof window === 'undefined') return false;
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    return Boolean(cap?.isNativePlatform?.());
  }

  public isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine !== false;
  }

  /**
   * Triggers a Rewarded Video Ad (ONLY when connected to internet)
   */
  public async showRewardedAd(
    rewardLabel: string,
    onRewardEarned: () => void,
    onDismissed?: () => void
  ): Promise<boolean> {
    if (!this.isOnline()) {
      onDismissed?.();
      return false;
    }

    const unitId = this.config.isTestMode
      ? GOOGLE_TEST_ADMOB_CONFIG.rewardedAdUnitId
      : this.config.rewardedAdUnitId;

    const capPlugins = (window as unknown as {
      Capacitor?: { Plugins?: { AdMob?: Record<string, (...args: unknown[]) => Promise<unknown>> } };
    }).Capacitor?.Plugins;

    if (this.isNativeCapacitor() && capPlugins?.AdMob) {
      try {
        await capPlugins.AdMob.prepareRewardVideoAd({
          adId: unitId,
          isTesting: this.config.isTestMode,
        });
        await capPlugins.AdMob.showRewardVideoAd();
        onRewardEarned();
        onDismissed?.();
        return true;
      } catch {
        // Fallback to simulator overlay
      }
    }

    this.startAdOverlay('rewarded', unitId, rewardLabel, 3, onRewardEarned, onDismissed);
    return true;
  }

  /**
   * Triggers a frequency-capped Interstitial Ad at natural breaks (ONLY when online)
   */
  public async showInterstitialAd(onDismissed: () => void): Promise<void> {
    if (!this.isOnline()) {
      onDismissed();
      return;
    }
    const now = Date.now() / 1000;
    if (now - this.lastInterstitialTime < 60) {
      onDismissed();
      return;
    }
    this.lastInterstitialTime = now;

    const unitId = this.config.isTestMode
      ? GOOGLE_TEST_ADMOB_CONFIG.interstitialAdUnitId
      : this.config.interstitialAdUnitId;

    this.startAdOverlay('interstitial', unitId, 'Interstitial Break', 2, undefined, onDismissed);
  }

  private startAdOverlay(
    type: 'rewarded' | 'interstitial',
    unitId: string,
    rewardLabel: string,
    durationSec: number,
    onReward?: () => void,
    onDismiss?: () => void
  ): void {
    if (this.countdownTimer) {
      window.clearInterval(this.countdownTimer);
    }

    this.onRewardCallback = onReward || null;
    this.onDismissCallback = onDismiss || null;

    this.activeOverlay = {
      type,
      unitId,
      isTest: this.config.isTestMode,
      rewardLabel,
      secondsRemaining: durationSec,
      canClose: false,
    };
    this.notify();

    this.countdownTimer = window.setInterval(() => {
      if (!this.activeOverlay) return;
      const nextSec = Math.max(0, this.activeOverlay.secondsRemaining - 1);
      const canClose = nextSec === 0;
      this.activeOverlay = {
        ...this.activeOverlay,
        secondsRemaining: nextSec,
        canClose,
      };
      this.notify();

      if (canClose && this.countdownTimer) {
        window.clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        if (this.onRewardCallback) {
          this.onRewardCallback();
          this.onRewardCallback = null;
        }
      }
    }, 1000);
  }

  public closeActiveAd(): void {
    if (this.countdownTimer) {
      window.clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.activeOverlay = null;
    this.notify();
    if (this.onDismissCallback) {
      const cb = this.onDismissCallback;
      this.onDismissCallback = null;
      cb();
    }
  }
}

export const admob = new AdMobService();

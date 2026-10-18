/**
 * Multi-Network Regional Ad Router & Bridge:
 * - Google Play AdMob (Global Primary)
 * - Tapsell Plus / تپسل پلاس (Iran Primary for Android / CafeBazaar / Myket Video Ads)
 * - Yektanet / یکتانت (Iran Web/PWA & Native Ad Fallback)
 *
 * Automatically detects the executing country/region via Timezone (Asia/Tehran),
 * Browser Locale (fa-IR), or explicit Country/Network selection, and executes
 * Waterfall Fallback if the primary network is unreachable or blocked.
 */

import {
  isValidAdMobAppId,
  isValidAdMobUnitId,
  isValidTapsellAppKey,
  isValidTapsellZoneId,
  isValidYektanetAppId,
  isValidYektanetPlacementId,
  resolveAdNetworkByCountry,
  type AdNetworkProvider,
  type AdRoutingMode,
  type AdRoutingResolution,
} from './rules';

export interface AdMobConfig {
  publisherEmail: string;
  packageName: string;
  // Routing & Region Preferences
  routingMode: AdRoutingMode;
  preferredIranProvider: 'tapsell' | 'yektanet';
  countryCodeOverride: '' | 'IR' | 'GLOBAL';
  simulatePrimaryFailure: boolean;
  // 1. Google AdMob IDs
  appId: string;
  rewardedAdUnitId: string;
  interstitialAdUnitId: string;
  bannerAdUnitId: string;
  // 2. Tapsell Plus (Iran) IDs
  tapsellAppKey: string;
  tapsellRewardedZoneId: string;
  tapsellInterstitialZoneId: string;
  // 3. Yektanet (Iran) IDs
  yektanetAppId: string;
  yektanetRewardedPlacementId: string;
  yektanetBannerPlacementId: string;
  isTestMode: boolean;
}

// Official Test & Standard Sandbox Configurations for AdMob, Tapsell, and Yektanet
export const GOOGLE_TEST_ADMOB_CONFIG: AdMobConfig = {
  publisherEmail: 'hyn198911@gmail.com',
  packageName: 'com.hyn198911.sproutling3d',
  routingMode: 'auto',
  preferredIranProvider: 'tapsell',
  countryCodeOverride: '',
  simulatePrimaryFailure: false,
  // Google AdMob Official Android Test IDs
  appId: 'ca-app-pub-3940256099942544~3347511713',
  rewardedAdUnitId: 'ca-app-pub-3940256099942544/5224354917',
  interstitialAdUnitId: 'ca-app-pub-3940256099942544/1033173712',
  bannerAdUnitId: 'ca-app-pub-3940256099942544/6300978111',
  // Tapsell Plus Standard Sandbox Keys
  tapsellAppKey: 'tapsell-plus-sandbox-key-sproutling3d-ir-2026',
  tapsellRewardedZoneId: '5cfaa802e8d17f0001ffb28e',
  tapsellInterstitialZoneId: '5cfaa942e8d17f0001ffb292',
  // Yektanet Standard Placement IDs
  yektanetAppId: 'yn-pub-sproutling3d-ir',
  yektanetRewardedPlacementId: 'yn-pos-rewarded-video-01',
  yektanetBannerPlacementId: 'yn-pos-native-banner-02',
  isTestMode: true,
};

const STORAGE_KEY = 'sproutling_admob_config_v2';

export interface ActiveAdOverlay {
  type: 'rewarded' | 'interstitial';
  provider: AdNetworkProvider;
  fallbackProvider: AdNetworkProvider;
  detectedCountry: 'IR' | 'GLOBAL';
  usedFallback: boolean;
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
        error: 'فرمت AdMob App ID نامعتبر است. باید به شکل ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY باشد.',
      };
    }
    if (
      !isValidAdMobUnitId(next.rewardedAdUnitId) ||
      !isValidAdMobUnitId(next.interstitialAdUnitId) ||
      !isValidAdMobUnitId(next.bannerAdUnitId)
    ) {
      return {
        valid: false,
        error: 'فرمت AdMob Ad Unit ID نامعتبر است. باید به شکل ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ باشد.',
      };
    }
    if (!isValidTapsellAppKey(next.tapsellAppKey)) {
      return {
        valid: false,
        error: 'فرمت کلید اپلیکیشن تپسل (Tapsell App Key) نامعتبر است.',
      };
    }
    if (
      !isValidTapsellZoneId(next.tapsellRewardedZoneId) ||
      !isValidTapsellZoneId(next.tapsellInterstitialZoneId)
    ) {
      return {
        valid: false,
        error: 'فرمت شناسه تبلیغگاه تپسل (Zone ID) نامعتبر است (هگزادسیمال ۲۴ کاراکتری یا tapsell-zone-*).',
      };
    }
    if (!isValidYektanetAppId(next.yektanetAppId)) {
      return {
        valid: false,
        error: 'فرمت شناسه اپلیکیشن یکتانت (Yektanet App ID) نامعتبر است.',
      };
    }
    if (
      !isValidYektanetPlacementId(next.yektanetRewardedPlacementId) ||
      !isValidYektanetPlacementId(next.yektanetBannerPlacementId)
    ) {
      return {
        valid: false,
        error: 'فرمت شناسه جایگاه یکتانت (Placement ID) نامعتبر است.',
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

  /**
   * Resolves the currently active ad provider based on device country, timezone, locale, and fallback settings.
   */
  public getRoutingResolution(forcePrimaryFailed = false): AdRoutingResolution {
    let tz = '';
    let langs: readonly string[] = [];
    try {
      if (typeof Intl !== 'undefined') {
        tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      }
      if (typeof navigator !== 'undefined') {
        langs = navigator.languages?.length ? navigator.languages : [navigator.language || ''];
      }
    } catch {
      // ignore
    }

    return resolveAdNetworkByCountry({
      mode: this.config.routingMode,
      preferredIranProvider: this.config.preferredIranProvider,
      countryCodeHint: this.config.countryCodeOverride,
      timeZone: tz,
      languages: langs,
      primaryFailed: forcePrimaryFailed || this.config.simulatePrimaryFailure,
    });
  }

  private getUnitIdForProvider(
    provider: AdNetworkProvider,
    type: 'rewarded' | 'interstitial'
  ): string {
    if (provider === 'tapsell') {
      return type === 'rewarded'
        ? this.config.tapsellRewardedZoneId
        : this.config.tapsellInterstitialZoneId;
    }
    if (provider === 'yektanet') {
      return type === 'rewarded'
        ? this.config.yektanetRewardedPlacementId
        : this.config.yektanetBannerPlacementId;
    }
    if (this.config.isTestMode) {
      return type === 'rewarded'
        ? GOOGLE_TEST_ADMOB_CONFIG.rewardedAdUnitId
        : GOOGLE_TEST_ADMOB_CONFIG.interstitialAdUnitId;
    }
    return type === 'rewarded' ? this.config.rewardedAdUnitId : this.config.interstitialAdUnitId;
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
   * Triggers a Rewarded Video Ad using Country-Aware Routing (Tapsell / Yektanet in Iran, AdMob globally)
   * with automatic Waterfall Fallback if the primary SDK fails.
   */
  public async showRewardedAd(
    rewardLabel: string,
    onRewardEarned: () => void,
    onDismissed?: () => void,
    explicitProvider?: AdNetworkProvider
  ): Promise<boolean> {
    if (!this.isOnline()) {
      onDismissed?.();
      return false;
    }

    const resolution = this.getRoutingResolution();
    const activeProvider = explicitProvider ?? resolution.activeProvider;
    const unitId = this.getUnitIdForProvider(activeProvider, 'rewarded');

    // Attempt Native SDK Bridge if running in Android APK
    const capPlugins = (window as unknown as {
      Capacitor?: {
        Plugins?: {
          AdMob?: Record<string, (...args: unknown[]) => Promise<unknown>>;
          TapsellPlus?: Record<string, (...args: unknown[]) => Promise<unknown>>;
        };
      };
    }).Capacitor?.Plugins;

    if (this.isNativeCapacitor()) {
      try {
        if (activeProvider === 'tapsell' && capPlugins?.TapsellPlus) {
          await capPlugins.TapsellPlus.requestRewardedVideoAd({ zoneId: unitId });
          await capPlugins.TapsellPlus.showRewardedVideoAd({ zoneId: unitId });
          onRewardEarned();
          onDismissed?.();
          return true;
        }
        if (activeProvider === 'admob' && capPlugins?.AdMob) {
          await capPlugins.AdMob.prepareRewardVideoAd({
            adId: unitId,
            isTesting: this.config.isTestMode,
          });
          await capPlugins.AdMob.showRewardVideoAd();
          onRewardEarned();
          onDismissed?.();
          return true;
        }
      } catch {
        // Native primary failed -> automatic waterfall fallback to secondary provider
        const fallbackResolution = this.getRoutingResolution(true);
        const fallbackUnitId = this.getUnitIdForProvider(fallbackResolution.activeProvider, 'rewarded');
        this.startAdOverlay(
          'rewarded',
          fallbackResolution.activeProvider,
          fallbackResolution.fallbackProvider,
          fallbackResolution.detectedCountry,
          true,
          fallbackUnitId,
          rewardLabel,
          3,
          onRewardEarned,
          onDismissed
        );
        return true;
      }
    }

    this.startAdOverlay(
      'rewarded',
      activeProvider,
      resolution.fallbackProvider,
      resolution.detectedCountry,
      this.config.simulatePrimaryFailure,
      unitId,
      rewardLabel,
      3,
      onRewardEarned,
      onDismissed
    );
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

    const resolution = this.getRoutingResolution();
    const unitId = this.getUnitIdForProvider(resolution.activeProvider, 'interstitial');

    this.startAdOverlay(
      'interstitial',
      resolution.activeProvider,
      resolution.fallbackProvider,
      resolution.detectedCountry,
      this.config.simulatePrimaryFailure,
      unitId,
      'Interstitial Break',
      2,
      undefined,
      onDismissed
    );
  }

  private startAdOverlay(
    type: 'rewarded' | 'interstitial',
    provider: AdNetworkProvider,
    fallbackProvider: AdNetworkProvider,
    detectedCountry: 'IR' | 'GLOBAL',
    usedFallback: boolean,
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
      provider,
      fallbackProvider,
      detectedCountry,
      usedFallback,
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

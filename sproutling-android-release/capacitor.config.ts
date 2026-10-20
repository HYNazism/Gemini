/**
 * Capacitor Native Android Configuration for Google Play Store (.apk / .aab)
 * Publisher Account: hyn198911@gmail.com
 */

export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  bundledWebRuntime?: boolean;
  plugins?: Record<string, unknown>;
}

const config: CapacitorConfig = {
  appId: process.env.VITE_ANDROID_PACKAGE_NAME || 'com.hyn198911.sproutling3d',
  appName: 'Sproutling: Grove Guardian 3D',
  webDir: 'dist',
  plugins: {
    AdMob: {
      appIdAndroid: process.env.VITE_ADMOB_APP_ID || 'ca-app-pub-3940256099942544~3347511713',
      initializeForTesting: process.env.VITE_ADMOB_TEST_MODE !== 'false',
    },
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#1b4332',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;

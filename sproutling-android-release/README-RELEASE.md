# Sproutling: Grove Guardian 3D — Android APK, GitHub Releases & Google Play Guide

## 1. Automated GitHub Releases (`.apk` & `.aab`)
The workflow `/.github/workflows/android-apk-release.yml` automatically compiles and attaches both:
- `Sproutling-Grove-Guardian-v1.0.0.apk` (Direct Android installation)
- `Sproutling-Grove-Guardian-v1.0.0.aab` (Google Play Console App Bundle)

directly to your repository's **GitHub Releases** page on every push to `main`/`master` or any `v*` tag.

## 2. Google Play AdMob Account Configuration (`hyn198911@gmail.com`)
- **Why an email address alone does not link ads**: Google Mobile Ads SDK (`com.google.android.gms.ads`) authenticates strictly via your Publisher **App ID** (`ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`) and **Ad Unit IDs** (`ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ`), never via raw email.
- **Account Safety (Invalid Traffic Prevention)**: By default, the codebase uses Google's official Test IDs (`VITE_ADMOB_TEST_MODE="true"`). Replace them in GitHub Repository Secrets (`VITE_ADMOB_APP_ID`, `VITE_ADMOB_REWARDED_ID`, `VITE_ADMOB_INTERSTITIAL_ID`) only when building your signed production release for Google Play.
- **Offline Play**: Ads are strictly gated behind `navigator.onLine`; when the player is offline, the game runs 100% offline via Service Worker with zero ad network requests or interruptions.

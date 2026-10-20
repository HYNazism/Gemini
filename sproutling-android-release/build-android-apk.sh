#!/usr/bin/env bash
set -euo pipefail

echo "=== Sproutling: Grove Guardian 3D — Android APK & Google Play AAB Builder ==="
npm install
node --test src/game/rules.test.ts
npm run build

if [ ! -d "android" ]; then
  npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor-community/admob
  npx cap add android
fi

npx cap sync android

ADMOB_APP_ID="${VITE_ADMOB_APP_ID:-ca-app-pub-3940256099942544~3347511713}"
MANIFEST="android/app/src/main/AndroidManifest.xml"
if ! grep -q "com.google.android.gms.ads.APPLICATION_ID" "$MANIFEST"; then
  sed -i "s|</application>|  <meta-data android:name=\"com.google.android.gms.ads.APPLICATION_ID\" android:value=\"${ADMOB_APP_ID}\"/>\n  </application>|g" "$MANIFEST"
fi

cd android
chmod +x gradlew
./gradlew assembleDebug bundleRelease
cp app/build/outputs/apk/debug/app-debug.apk ../sproutling-android-release/Sproutling-Grove-Guardian.apk
cp app/build/outputs/bundle/release/app-release.aab ../sproutling-android-release/Sproutling-Grove-Guardian.aab
echo "=== Build Complete: APK and AAB saved in ./sproutling-android-release/ ==="

## Verified release status / وضعیت واقعی انتشار

The full multi-platform release [`v1.7.6`](https://github.com/HYNazism/Gemini/releases/tag/v1.7.6) includes Windows setup/portable `.exe` files, Android `.apk` and Google Play `.aab`, Linux `.AppImage`/`.deb`/`.tar.gz`, macOS `.dmg`/`.zip`, and Web/PWA plus source `.zip` archives. The separate Android-only release [`v1.7.27`](https://github.com/HYNazism/Gemini/releases/tag/v1.7.27) contains APK/AAB assets only; it has no desktop or web packages. The current `package.json` version is `1.7.0`, and desktop asset filenames in release `v1.7.6` use `1.7.0`; the release tag is not the packaged desktop version.

انتشار کامل چندسکویی [`v1.7.6`](https://github.com/HYNazism/Gemini/releases/tag/v1.7.6) شامل فایل‌های نصاب/قابل‌حمل Windows (`.exe`)، فایل نصب Android (`.apk`) و بستهٔ Google Play (`.aab`)، بسته‌های Linux (`.AppImage`، `.deb` و `.tar.gz`)، بسته‌های macOS (`.dmg` و `.zip`) و ZIP وب/PWA و سورس است. انتشار جداگانهٔ Android با برچسب [`v1.7.27`](https://github.com/HYNazism/Gemini/releases/tag/v1.7.27) فقط APK/AAB دارد و بستهٔ دسکتاپ یا وب ندارد. نسخهٔ فعلی `package.json` برابر `1.7.0` است و نام فایل‌های دسکتاپ انتشار `v1.7.6` نیز `1.7.0` را نشان می‌دهد؛ شمارهٔ تگ با نسخهٔ داخل بستهٔ دسکتاپ یکی نیست.

---

## English

Sproutling: Grove Guardian 3D is a browser-based 3D action adventure built with React, TypeScript, Vite, and Three.js. GitHub Actions provides desktop and Android packaging.

### Downloads

- [GitHub Releases](https://github.com/HYNazism/Gemini/releases)
- [Multi-platform build workflow](https://github.com/HYNazism/Gemini/actions/workflows/multi-platform-release.yml)

Depending on the release, assets may include:

- **Windows:** NSIS installer `.exe`, portable `.exe`, and possibly `.zip`
- **Android:** directly installable `.apk` and `.aab` for Google Play
- **Linux:** `.AppImage`, `.deb`, and `.tar.gz`
- **macOS:** `.dmg` and `.zip`
- **Web:** PWA bundle and source archive (`.zip`)

The Windows installer/portable app and Android APK are installable packages. A web or source ZIP is not an installer. Assets can vary by release, so check the files attached to the specific version before downloading.

### Local development

Requirements: Node.js 22 and npm.

```bash
git clone https://github.com/HYNazism/Gemini.git
cd Gemini
npm install --legacy-peer-deps
npm run dev
```

Run TypeScript checks and build the web app with:

```bash
npm run lint
npm run build
```

`npm run lint` performs TypeScript checks. GitHub Actions builds desktop packages and APK/AAB files. The workflow runs on pushes to `main`/`master`, version tags, or a manual dispatch. Verify successful jobs and release assets after each run.

---



---

## فارسی

«Sproutling: Grove Guardian 3D» یک ماجراجویی اکشن سه‌بعدیِ مبتنی بر مرورگر است که با React، TypeScript، Vite و Three.js ساخته شده و گردش‌کارهای خودکار برای بسته‌بندی دسکتاپ و Android دارد.

### دریافت نسخه‌ها

- [انتشارهای GitHub](https://github.com/HYNazism/Gemini/releases)
- [گردش‌کار ساخت چندسکویی](https://github.com/HYNazism/Gemini/actions/workflows/multi-platform-release.yml)

دارایی‌های انتشار، بسته به نسخه، می‌توانند شامل این موارد باشند:

- **Windows:** نصاب NSIS با پسوند `.exe`، نسخهٔ قابل‌حمل `.exe` و در صورت وجود فایل `.zip`
- **Android:** فایل نصب مستقیم `.apk` و بستهٔ `.aab` برای Google Play
- **Linux:** فایل‌های `.AppImage`، `.deb` و `.tar.gz`
- **macOS:** فایل‌های `.dmg` و `.zip`
- **وب:** باندل PWA و آرشیو سورس (`.zip`)

نصاب/نسخهٔ قابل‌حمل Windows و APK فایل‌های نصب‌شدنی هستند. ZIP وب یا سورس، نصاب نیست. دارایی‌های هر Release ممکن است فرق کنند؛ پیش از دریافت، فهرست فایل‌های همان نسخه را بررسی کنید.

### اجرای محلی

پیش‌نیازها: Node.js 22 و npm.

```bash
git clone https://github.com/HYNazism/Gemini.git
cd Gemini
npm install --legacy-peer-deps
npm run dev
```

برای بررسی TypeScript و ساخت وب:

```bash
npm run lint
npm run build
```

`npm run lint` بررسی TypeScript را اجرا می‌کند. گردش‌کار GitHub Actions بسته‌های دسکتاپ و فایل‌های APK/AAB را می‌سازد. برای نصب روی دستگاه از دارایی نصب‌شدنی Release استفاده کنید، نه ZIP وب.

### فناوری‌ها و انتشار

React 19 · TypeScript · Vite 8 · Three.js · Capacitor · Electron.

گردش‌کار با push به `main`/`master`، تگ نسخه یا اجرای دستی از تب **Actions** اجرا می‌شود. پس از هر اجرا، موفقیت jobها و دارایی‌های صفحهٔ Releases را بررسی کنید.

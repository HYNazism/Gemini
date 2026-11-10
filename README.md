

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

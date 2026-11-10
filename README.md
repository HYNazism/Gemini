# Sproutling: Grove Guardian 3D

A browser-based 3D action-adventure built with React, TypeScript, Vite, and Three.js. The project includes an installable web build and automated desktop and Android packaging.

## Downloads

- [GitHub Releases](https://github.com/HYNazism/Gemini/releases)
- [Multi-platform build workflow](https://github.com/HYNazism/Gemini/actions/workflows/multi-platform-release.yml)

Release assets may include:

- **Windows:** NSIS installer `.exe`, portable `.exe`, and optional `.zip`
- **Android:** installable `.apk` and Google Play `.aab`
- **Linux:** `.AppImage`, `.deb`, and `.tar.gz`
- **macOS:** `.dmg` and `.zip`
- **Web:** static PWA bundle and source archives (`.zip`)

The Windows installer/portable executable and Android APK are direct app packages. Web/source ZIP files are not installers. Asset availability can vary between releases, so check the files attached to the specific version before downloading.

## Run locally

Requirements: Node.js 22 and npm.

```bash
git clone https://github.com/HYNazism/Gemini.git
cd Gemini
npm install --legacy-peer-deps
npm run dev
```

Useful project checks and web build:

```bash
npm run lint
npm run build
```

`npm run lint` performs TypeScript checking. The multi-platform GitHub Actions workflow builds desktop packages and Android APK/AAB files; use the release assets rather than the web bundle when you need an installable app.

## Technologies

React 19 · TypeScript · Vite 8 · Three.js · Capacitor · Electron

## Release automation

The workflow runs for pushes to `main`/`master`, version tags, or a manual dispatch from **Actions**. Confirm that all build jobs succeed and verify the resulting assets on the Releases page before sharing a new version.

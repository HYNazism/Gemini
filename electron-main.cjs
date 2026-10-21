/**
 * Electron Desktop Wrapper for Sproutling: Grove Guardian 3D (Windows EXE, Linux AppImage/DEB, macOS DMG).
 * Launches the compiled Three.js WebGL dist/ bundle in a hardware-accelerated native desktop window.
 */
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Enable high-performance GPU hardware acceleration for Three.js WebGL
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Sproutling: Grove Guardian 3D',
    backgroundColor: '#1b4332',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
    },
  });

  const indexPath = path.join(__dirname, 'dist', 'index.html');
  win.loadFile(indexPath);
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

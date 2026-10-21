@echo off
title Sproutling: Grove Guardian 3D — Windows EXE Builder (NSIS Setup + Portable EXE)
echo ============================================================================
echo   Sproutling: Grove Guardian 3D (v1.7.0) — Windows Desktop EXE Builder
echo ============================================================================
echo.
echo [1/4] Installing dependencies...
call npm install --legacy-peer-deps
call npm install --no-save --legacy-peer-deps electron@33.2.0 electron-builder@25.1.8

echo.
echo [2/4] Running unit tests...
call npx tsx --test src/game/rules.test.ts

echo.
echo [3/4] Building production Three.js WebGL bundle...
call npx vite build --base=./

echo.
echo [4/4] Packaging Windows NSIS Installer (.exe), Portable (.exe), and Archive (.zip)...
set CSC_IDENTITY_AUTO_DISCOVERY=false
call npx electron-builder --win --config electron-builder.yml --publish never

echo.
echo ============================================================================
echo   Build Complete! Executables saved in .\release-desktop\
echo ============================================================================
pause

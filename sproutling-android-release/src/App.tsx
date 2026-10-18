/**
 * Main Application Component for Sproutling: Grove Guardian 3D.
 * Mounts the isolated Three.js canvas container and manages decoupled Game Shell UI,
 * 3D Character Customizer, Cozy Home Base Sanctuary, Day/Night & Weather controls,
 * and Google Play AdMob / Android APK export.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, type HUDData } from './game/engine';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { TouchControls } from './components/TouchControls';
import { StatusModals } from './components/StatusModals';
import { CustomizeAndBaseModal } from './components/CustomizeAndBaseModal';
import { ReleaseAndAdsModal, AdMobSimulatorOverlay } from './components/ReleaseAndAdsModal';
import {
  createInitialPlayer,
  DEFAULT_CUSTOMIZATION,
  DEFAULT_HOME_BASE,
  generateChapterInfo,
  type CharacterCustomization,
  type HomeBaseCustomization,
  type WeatherType,
  type TimePhase,
  type PerformanceQuality,
} from './game/rules';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [customizeMode, setCustomizeMode] = useState<'none' | 'hero' | 'home' | 'atmosphere'>('none');
  const [adMobModalOpen, setAdMobModalOpen] = useState(false);

  const [hudData, setHudData] = useState<HUDData>(() => ({
    gameState: 'title',
    player: createInitialPlayer(),
    shrines: [],
    totalShrines: 4,
    restoredShrines: 0,
    cleansedEnemiesCount: 0,
    elapsedTime: 0,
    isNearShrine: false,
    nearShrinePrompt: '',
    isInsideSafeZone: true,
    isMuted: false,
    weather: 'sunshine',
    weatherDescription: 'Golden Sunshine: +25% Sun-Seed Harvest Score',
    timePhase: 'day',
    timeOfDay: 0.3,
    autoDayNight: true,
    characterCustom: { ...DEFAULT_CUSTOMIZATION },
    homeBaseCustom: { ...DEFAULT_HOME_BASE },
    trophies: {
      shrineTrophy: false,
      cleanserTrophy: false,
      seedHoarderTrophy: false,
      guardianCrownTrophy: false,
    },
    chapterInfo: generateChapterInfo(1),
    performanceQuality: 'balanced',
  }));

  const handleHUDUpdate = useCallback((data: HUDData) => {
    setHudData(data);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GameEngine(mountRef.current, handleHUDUpdate);
    engineRef.current = engine;

    // Auto-detect low-end/weak phones (<= 4 cores or <= 2GB RAM) and switch to Eco 60fps mode
    const cores = navigator.hardwareConcurrency || 8;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;
    if (cores <= 4 || mem <= 2) {
      engine.setPerformanceQuality('eco');
    }

    document.body.dataset.state = engine.gameState;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [handleHUDUpdate]);

  const handleStart = () => {
    setCustomizeMode('none');
    engineRef.current?.setCameraFocusMode('gameplay');
    engineRef.current?.startGame();
  };

  const handlePause = () => {
    engineRef.current?.togglePause();
  };

  const handleResume = () => {
    setCustomizeMode('none');
    engineRef.current?.setCameraFocusMode('gameplay');
    if (engineRef.current?.gameState === 'paused') {
      engineRef.current.togglePause();
    }
  };

  const handleRestart = () => {
    setCustomizeMode('none');
    engineRef.current?.restartGame(false);
  };

  const handleNextChapter = () => {
    setCustomizeMode('none');
    engineRef.current?.advanceToNextChapter();
  };

  const handleReviveWithAd = () => {
    engineRef.current?.revivePlayerWithAd();
  };

  const handleToggleMute = () => {
    engineRef.current?.toggleMute();
  };

  const handleOpenCustomize = (tab: 'hero' | 'home' | 'atmosphere') => {
    setCustomizeMode(tab);
    if (tab === 'hero') {
      engineRef.current?.setCameraFocusMode('customize-hero');
    } else if (tab === 'home') {
      engineRef.current?.setCameraFocusMode('customize-home');
    } else {
      engineRef.current?.setCameraFocusMode('gameplay');
    }
  };

  const handleCloseCustomize = () => {
    setCustomizeMode('none');
    engineRef.current?.setCameraFocusMode('gameplay');
  };

  const handleUpdateCharacter = (next: CharacterCustomization) => {
    engineRef.current?.updateCharacterCustomization(next);
  };

  const handleUpdateHomeBase = (next: HomeBaseCustomization) => {
    engineRef.current?.updateHomeBaseCustomization(next);
  };

  const handleSetWeather = (w: WeatherType) => {
    engineRef.current?.setWeather(w);
  };

  const handleSetTimePhase = (p: TimePhase) => {
    engineRef.current?.setTimePhase(p);
  };

  const handleToggleAutoDayNight = () => {
    engineRef.current?.toggleAutoDayNight();
  };

  const handleSetPerformanceQuality = (q: PerformanceQuality) => {
    engineRef.current?.setPerformanceQuality(q);
  };

  const handleGrantRewardedSeeds = () => {
    engineRef.current?.grantRewardedSeeds();
  };

  return (
    <div
      data-testid="game-root"
      className="relative w-screen h-screen overflow-hidden bg-[#1b4332] select-none touch-none"
    >
      {/* Isolated Three.js Canvas Container */}
      <div
        ref={mountRef}
        data-testid="three-canvas-container"
        className="absolute inset-0 w-full h-full z-0"
      />

      {/* Title Screen Overlay */}
      {hudData.gameState === 'title' && customizeMode === 'none' && (
        <TitleScreen
          onStart={handleStart}
          isMuted={hudData.isMuted}
          onToggleMute={handleToggleMute}
          chapterInfo={hudData.chapterInfo}
          onOpenCustomizeHero={() => handleOpenCustomize('hero')}
          onOpenCustomizeHome={() => handleOpenCustomize('home')}
          onOpenAdMobAndApk={() => setAdMobModalOpen(true)}
        />
      )}

      {/* In-Game HUD Overlay */}
      {hudData.gameState === 'playing' && (
        <>
          <GameHUD
            data={hudData}
            onPause={handlePause}
            onToggleMute={handleToggleMute}
            onOpenCustomize={handleOpenCustomize}
            onGrantRewardedSeeds={handleGrantRewardedSeeds}
          />

          {engineRef.current && customizeMode === 'none' && (
            <TouchControls
              touchInputs={engineRef.current.touchInputs}
              isNearShrine={hudData.isNearShrine}
              dashCooldown={hudData.player.dashCooldownRemaining}
              spinCooldown={hudData.player.spinCooldownRemaining}
            />
          )}
        </>
      )}

      {/* Status Modals: Paused, Victory (Next Chapter), Defeat (Ad Revive) */}
      {customizeMode === 'none' && (
        <StatusModals
          data={hudData}
          onResume={handleResume}
          onRestart={handleRestart}
          onNextChapter={handleNextChapter}
          onReviveWithAd={handleReviveWithAd}
          onToggleMute={handleToggleMute}
          onOpenCustomize={() => handleOpenCustomize('hero')}
          onOpenAdMobAndApk={() => setAdMobModalOpen(true)}
        />
      )}

      {/* 3D Character Customizer, Cozy Sanctuary Base & Weather/FPS Drawer */}
      <CustomizeAndBaseModal
        mode={customizeMode}
        onClose={handleCloseCustomize}
        characterCustom={hudData.characterCustom}
        onUpdateCharacter={handleUpdateCharacter}
        homeBaseCustom={hudData.homeBaseCustom}
        onUpdateHomeBase={handleUpdateHomeBase}
        trophies={hudData.trophies}
        weather={hudData.weather}
        onSetWeather={handleSetWeather}
        timePhase={hudData.timePhase}
        onSetTimePhase={handleSetTimePhase}
        autoDayNight={hudData.autoDayNight}
        onToggleAutoDayNight={handleToggleAutoDayNight}
        performanceQuality={hudData.performanceQuality}
        onSetPerformanceQuality={handleSetPerformanceQuality}
      />

      {/* Google Play AdMob & Android APK Export Modal */}
      <ReleaseAndAdsModal
        isOpen={adMobModalOpen}
        onClose={() => setAdMobModalOpen(false)}
        onGrantBonusSeeds={handleGrantRewardedSeeds}
      />

      {/* Interactive AdMob Simulator Overlay */}
      <AdMobSimulatorOverlay />
    </div>
  );
}

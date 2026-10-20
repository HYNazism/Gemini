/**
 * Main Application Component for Sproutling: Grove Guardian 3D.
 * Mounts the isolated Three.js canvas container and manages decoupled Game Shell UI,
 * Bilingual Persian/English ('fa' | 'en') Localization,
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
import { DailyQuestsModal } from './components/DailyQuestsModal';
import { getSavedLanguage, saveLanguage, type Language } from './game/i18n';
import {
  createInitialPlayer,
  DEFAULT_CUSTOMIZATION,
  DEFAULT_HOME_BASE,
  generateChapterInfo,
  createInitialMissionState,
  computeStageObjectiveGuide,
  getInGameStoryBeat,
  getTodayDateKey,
  generateDailyQuests,
  type CharacterCustomization,
  type HomeBaseCustomization,
  type WeatherType,
  type TimePhase,
  type PerformanceQuality,
} from './game/rules';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [lang, setLang] = useState<Language>(() => getSavedLanguage());
  const [customizeMode, setCustomizeMode] = useState<'none' | 'hero' | 'home' | 'atmosphere'>('none');
  const [adMobModalOpen, setAdMobModalOpen] = useState(false);
  const [dailyQuestsModalOpen, setDailyQuestsModalOpen] = useState(false);

  const handleToggleLang = useCallback(() => {
    setLang((prev) => {
      const next: Language = prev === 'fa' ? 'en' : 'fa';
      saveLanguage(next);
      return next;
    });
  }, []);

  const [hudData, setHudData] = useState<HUDData>(() => {
    const todayKey = getTodayDateKey();
    const ch1 = generateChapterInfo(1);
    const initialMission = createInitialMissionState(1);
    const initialBeat = getInGameStoryBeat(1, 'chapter_start');
    return {
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
      chapterInfo: ch1,
      bossHp: ch1.bossMaxHp,
      bossMaxHp: ch1.bossMaxHp,
      bossCleansed: false,
      stageObjective: computeStageObjectiveGuide({
        playerX: 0,
        playerZ: 11,
        sunSeeds: 0,
        shrines: [],
        bossHp: ch1.bossMaxHp,
        bossMaxHp: ch1.bossMaxHp,
        bossCleansed: false,
        chapterNumber: 1,
        missionState: initialMission,
      }),
      missionState: initialMission,
      currentStoryBeat: initialBeat,
      storyHistory: [initialBeat],
      performanceQuality: 'balanced',
      dailyQuests: generateDailyQuests(todayKey, 0),
      dailyQuestsDateKey: todayKey,
    };
  });

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
    setDailyQuestsModalOpen(false);
    engineRef.current?.setCameraFocusMode('gameplay');
    engineRef.current?.startGame();
  };

  const handlePause = () => {
    engineRef.current?.togglePause();
  };

  const handleResume = () => {
    setCustomizeMode('none');
    setDailyQuestsModalOpen(false);
    engineRef.current?.setCameraFocusMode('gameplay');
    if (engineRef.current?.gameState === 'paused') {
      engineRef.current.togglePause();
    }
  };

  const handleRestart = () => {
    setCustomizeMode('none');
    setDailyQuestsModalOpen(false);
    engineRef.current?.restartGame(false);
  };

  const handleExitToTitle = () => {
    setCustomizeMode('none');
    setDailyQuestsModalOpen(false);
    setAdMobModalOpen(false);
    engineRef.current?.exitToTitleScreen();
  };

  const handleNextChapter = () => {
    setCustomizeMode('none');
    setDailyQuestsModalOpen(false);
    engineRef.current?.advanceToNextChapter();
  };

  const handleJumpToChapter = (chapterNum: number) => {
    setCustomizeMode('none');
    setDailyQuestsModalOpen(false);
    engineRef.current?.jumpToChapter(chapterNum);
  };

  const handleDismissStoryBeat = () => {
    engineRef.current?.dismissCurrentStoryBeat();
  };

  const handleReviveWithAd = () => {
    engineRef.current?.revivePlayerWithAd();
  };

  const handleToggleMute = () => {
    engineRef.current?.toggleMute();
  };

  const handleOpenCustomize = (tab: 'hero' | 'home' | 'atmosphere') => {
    setDailyQuestsModalOpen(false);
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

  const handleClaimDailyQuest = (questId: string) => {
    engineRef.current?.claimDailyQuest(questId);
  };

  const handleRerollDailyQuests = () => {
    engineRef.current?.rerollDailyQuests();
  };

  return (
    <div
      data-testid="game-root"
      data-lang={lang}
      className="relative w-screen h-[100dvh] overflow-hidden bg-[#1b4332] select-none touch-none"
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
          dailyQuests={hudData.dailyQuests}
          onOpenDailyQuests={() => setDailyQuestsModalOpen(true)}
          onOpenCustomizeHero={() => handleOpenCustomize('hero')}
          onOpenCustomizeHome={() => handleOpenCustomize('home')}
          onOpenAtmosphereSettings={() => handleOpenCustomize('atmosphere')}
          onOpenAdMobAndApk={() => setAdMobModalOpen(true)}
          lang={lang}
          onToggleLang={handleToggleLang}
        />
      )}

      {/* In-Game HUD Overlay */}
      {hudData.gameState === 'playing' && (
        <>
          <GameHUD
            data={hudData}
            onPause={handlePause}
            onExitToTitle={handleExitToTitle}
            onToggleMute={handleToggleMute}
            onOpenCustomize={handleOpenCustomize}
            onOpenDailyQuests={() => setDailyQuestsModalOpen(true)}
            onOpenAdMobAndApk={() => setAdMobModalOpen(true)}
            onClaimDailyQuest={handleClaimDailyQuest}
            onGrantRewardedSeeds={handleGrantRewardedSeeds}
            onDismissStoryBeat={handleDismissStoryBeat}
            onAdvanceChapter={handleNextChapter}
            onJumpToChapter={handleJumpToChapter}
            onSetPerformanceQuality={handleSetPerformanceQuality}
            lang={lang}
            onToggleLang={handleToggleLang}
          />

          {engineRef.current && customizeMode === 'none' && !dailyQuestsModalOpen && (
            <TouchControls
              touchInputs={engineRef.current.touchInputs}
              isNearShrine={hudData.isNearShrine}
              dashCooldown={hudData.player.dashCooldownRemaining}
              spinCooldown={hudData.player.spinCooldownRemaining}
              lang={lang}
            />
          )}
        </>
      )}

      {/* Status Modals: Paused, Victory (Next Chapter), Defeat (Ad Revive) */}
      {customizeMode === 'none' && !dailyQuestsModalOpen && (
        <StatusModals
          data={hudData}
          onResume={handleResume}
          onRestart={handleRestart}
          onExitToTitle={handleExitToTitle}
          onNextChapter={handleNextChapter}
          onJumpToChapter={handleJumpToChapter}
          onReviveWithAd={handleReviveWithAd}
          onToggleMute={handleToggleMute}
          onOpenCustomize={() => handleOpenCustomize('hero')}
          onOpenAdMobAndApk={() => setAdMobModalOpen(true)}
          lang={lang}
          onToggleLang={handleToggleLang}
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
        lang={lang}
      />

      {/* Daily Quests Board Modal */}
      <DailyQuestsModal
        isOpen={dailyQuestsModalOpen}
        onClose={() => setDailyQuestsModalOpen(false)}
        quests={hudData.dailyQuests}
        dateKey={hudData.dailyQuestsDateKey}
        onClaimQuest={handleClaimDailyQuest}
        onRerollQuests={handleRerollDailyQuests}
        lang={lang}
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

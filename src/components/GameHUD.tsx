/**
 * Dark-Mythic High-Fantasy ARPG HUD (Persian & English) for
 * Aethelgard: Warden of the Astral Grove.
 *
 * Features:
 * - 3D-to-2D Projected Floating Combat Numbers (Normal, Critical Strike, 3-Hit Finisher, Perfect Evade, Shard, Heal)
 * - Live Tactical Radar Minimap (Top-Right) tracking Warden Kaelen, Void Legion Enemies, Obelisks, Bastion & Sovereign Boss
 * - Top-Center Sovereign Boss Health Bar & Phase II Cosmic Enrage Indicator
 * - Top-Left Warden Vitality Crests, Stamina Gauge, Astral Orbs & Mission Progress
 * - Orin (Astrolabe Sentinel) Telemetry Badge & Archon Seraphius Astral Chronicle
 * - Dedicated Dark-Mythic Settings (⚙️ تنظیمات) & Exit (🚪 خروج) Modals
 */

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Pause,
  Sparkles,
  Sun,
  CloudSun,
  Home,
  Gift,
  User,
  Languages,
  ScrollText,
  CheckCircle2,
  Compass,
  ShieldAlert,
  ShieldCheck,
  FastForward,
  Settings,
  LogOut,
  Smartphone,
  Gauge,
  X,
  Swords,
  Zap,
  Radar,
  Crown,
} from 'lucide-react';
import type { HUDData } from '../game/engine';
import { admob } from '../game/admob';
import {
  computeResponsiveHudProfile,
  getStageBiomeTheme,
  type ResponsiveHudProfile,
  type PerformanceQuality,
} from '../game/rules';
import {
  WEATHER_SHORT_LABELS,
  TIME_PHASE_LABELS,
  localizeShrinePrompt,
  getLocalizedChapterInfo,
  type Language,
} from '../game/i18n';

interface GameHUDProps {
  data: HUDData;
  onPause: () => void;
  onExitToTitle: () => void;
  onToggleMute: () => void;
  onOpenCustomize: (tab: 'hero' | 'mastery' | 'home' | 'atmosphere') => void;
  onOpenDailyQuests: () => void;
  onOpenAdMobAndApk?: () => void;
  onClaimDailyQuest: (questId: string) => void;
  onGrantRewardedSeeds: () => void;
  onDismissStoryBeat: () => void;
  onAdvanceChapter: () => void;
  onJumpToChapter?: (chapterNumber: number) => void;
  onSetPerformanceQuality?: (quality: PerformanceQuality) => void;
  onTriggerParry?: () => void;
  lang: Language;
  onToggleLang: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  data,
  onPause,
  onExitToTitle,
  onToggleMute,
  onOpenCustomize,
  onOpenDailyQuests,
  onOpenAdMobAndApk,
  onClaimDailyQuest,
  onGrantRewardedSeeds,
  onDismissStoryBeat,
  onAdvanceChapter,
  onJumpToChapter,
  onSetPerformanceQuality,
  onTriggerParry,
  lang,
  onToggleLang,
}) => {
  const {
    player,
    restoredShrines,
    totalShrines,
    isNearShrine,
    nearShrinePrompt,
    isInsideSafeZone,
    isMuted,
    weather,
    timePhase,
    chapterInfo,
    bossHp,
    bossMaxHp,
    stageObjective,
    missionState,
    currentStoryBeat,
    storyHistory,
    dailyQuests,
    performanceQuality,
  } = data;

  const isFa = lang === 'fa';
  const [isOnline, setIsOnline] = useState<boolean>(() => admob.isOnline());
  const [showStageGuideModal, setShowStageGuideModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [showStoryPopover, setShowStoryPopover] = useState(false);

  const [hudProfile, setHudProfile] = useState<ResponsiveHudProfile>(() =>
    computeResponsiveHudProfile(
      typeof window !== 'undefined' ? window.innerWidth : 1024,
      typeof window !== 'undefined' ? window.innerHeight : 768
    )
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    const onResize = () => {
      setHudProfile(computeResponsiveHudProfile(window.innerWidth, window.innerHeight));
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const handleRewardedBlessing = () => {
    admob.showRewardedAd(isFa ? '+۳ گوی طلایی اختری' : '+3 Golden Astral Orbs', () => {
      onGrantRewardedSeeds();
    });
  };

  const completedQuestsCount = dailyQuests.filter((q) => q.completed).length;
  const unclaimedQuest = dailyQuests.find((q) => q.completed && !q.claimed);
  const localizedChapter = getLocalizedChapterInfo(chapterInfo.chapterNumber, lang);
  const isCompact = hudProfile.tier === 'compact-mobile';

  const modeBadgeLabel = (() => {
    switch (missionState.mode) {
      case 'rescue_escort':
        return isFa ? 'آزادسازی نگهبانان' : 'Sentinel Rescue';
      case 'harmonic_bells':
        return isFa ? 'رزونانس مناره‌ها' : 'Astral Chimes';
      case 'heart_tree_defense':
        return isFa ? 'دفاع ستون اختران' : 'Spire Defense';
      case 'meteor_rush':
        return isFa ? 'شهاب‌باران اختری' : 'Meteor Convergence';
      case 'boss_duel':
        return isFa ? 'نبرد فرمانروای خلأ' : 'Sovereign Duel';
    }
  })();

  const compactMissionCounter = (() => {
    switch (missionState.mode) {
      case 'rescue_escort':
        return `${missionState.currentCount}/${missionState.targetCount}`;
      case 'harmonic_bells':
        return `${missionState.currentCount}/${missionState.targetCount}`;
      case 'heart_tree_defense':
        return `${Math.ceil(missionState.heartTreeHp)}%`;
      case 'meteor_rush':
        return `${missionState.currentCount}/${missionState.targetCount}`;
      case 'boss_duel':
        return `${restoredShrines}/${totalShrines}`;
    }
  })();

  const radarData = data.radar;
  const radarRadiusPx = isCompact ? 34 : 42;
  const radarWorldRange = 95;

  const projectToRadar = (wx: number, wz: number) => {
    if (!radarData) return { rx: 0, ry: 0 };
    const dx = wx - radarData.playerX;
    const dz = wz - radarData.playerZ;
    const dist = Math.hypot(dx, dz);
    const clampedDist = Math.min(dist, radarWorldRange);
    const norm = clampedDist / radarWorldRange;
    const angle = Math.atan2(dz, dx);
    return {
      rx: Math.cos(angle) * norm * (radarRadiusPx - 5),
      ry: Math.sin(angle) * norm * (radarRadiusPx - 5),
    };
  };

  return (
    <div
      style={{ fontSize: `${Math.round(hudProfile.uiFontScale * 100)}%` }}
      className={`absolute inset-0 pointer-events-none z-30 flex flex-col justify-between ${
        isCompact ? 'p-2' : 'p-3 sm:p-4'
      } select-none overflow-hidden`}
    >
      {/* 0A. PERFECT PARRY & DEFENSE-BREAK EDGE VIGNETTE SCREEN-FLASH OVERLAY */}
      {(data.parryFlashIntensity ?? 0) > 0.02 && (
        <svg
          data-testid="parry-screen-flash"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="fixed inset-0 w-full h-full pointer-events-none z-20"
        >
          <defs>
            <radialGradient id="parryEdgeVignette" cx="50%" cy="50%" r="55%">
              <stop offset="52%" stopColor="#060d18" stopOpacity="0" />
              <stop
                offset="84%"
                stopColor={data.parryFlashType === 'boss_shred' ? '#ffd166' : '#38bdf8'}
                stopOpacity={Math.min(0.65, (data.parryFlashIntensity ?? 0) * 0.58)}
              />
              <stop
                offset="100%"
                stopColor={data.parryFlashType === 'riposte' ? '#38bdf8' : '#ffd166'}
                stopOpacity={Math.min(0.92, (data.parryFlashIntensity ?? 0) * 0.88)}
              />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="url(#parryEdgeVignette)" />
          {/* Crystalline Corner Shard Flares */}
          <polygon
            points="0,0 18,0 4,4 0,18"
            fill="#ffd166"
            opacity={Math.min(0.9, (data.parryFlashIntensity ?? 0) * 0.85)}
          />
          <polygon
            points="100,0 82,0 96,4 100,18"
            fill="#38bdf8"
            opacity={Math.min(0.9, (data.parryFlashIntensity ?? 0) * 0.85)}
          />
          <polygon
            points="0,100 18,100 4,96 0,82"
            fill="#38bdf8"
            opacity={Math.min(0.9, (data.parryFlashIntensity ?? 0) * 0.85)}
          />
          <polygon
            points="100,100 82,100 96,96 100,82"
            fill="#ffd166"
            opacity={Math.min(0.9, (data.parryFlashIntensity ?? 0) * 0.85)}
          />
        </svg>
      )}

      {/* 0B. 3D-TO-2D PROJECTED FLOATING COMBAT NUMBERS OVERLAY */}
      {(data.floatingCombatTexts || data.floatingTexts) &&
        (data.floatingCombatTexts || data.floatingTexts)!.length > 0 && (
          <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
            {(data.floatingCombatTexts || data.floatingTexts)!.map((ft) => {
              const badgeStyle =
                ft.type === 'parry'
                  ? 'text-[#ffd166] drop-shadow-[0_2px_10px_rgba(56,189,248,0.95)] text-sm sm:text-base scale-115'
                  : ft.type === 'crit'
                  ? 'text-[#fde047] drop-shadow-[0_2px_8px_rgba(245,158,11,0.95)] text-sm sm:text-base scale-110'
                  : ft.type === 'finisher'
                  ? 'text-[#e879f9] drop-shadow-[0_2px_10px_rgba(168,85,247,0.95)] text-sm sm:text-base scale-115'
                  : ft.type === 'dodge'
                  ? 'text-[#38bdf8] drop-shadow-[0_2px_8px_rgba(56,189,248,0.95)] text-xs sm:text-sm'
                  : ft.type === 'heal'
                  ? 'text-[#34d399] drop-shadow-[0_2px_6px_rgba(16,185,129,0.9)] text-xs sm:text-sm'
                  : ft.type === 'shard'
                  ? 'text-[#ffd166] drop-shadow-[0_2px_6px_rgba(251,191,36,0.9)] text-xs sm:text-sm'
                  : 'text-[#f8fafc] drop-shadow-[0_2px_5px_rgba(15,23,42,0.95)] text-xs sm:text-sm';

              return (
                <div
                  key={ft.id}
                  style={{
                    left: `${ft.screenX}%`,
                    top: `${ft.screenY}%`,
                    opacity: ft.opacity,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute font-black tracking-wider uppercase flex flex-col items-center pointer-events-none tabular-nums ${badgeStyle}`}
                >
                  {ft.subtext && (
                    <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded bg-[#060d18]/90 border border-current/40 mb-0.5">
                      {ft.subtext}
                    </span>
                  )}
                  <span>{ft.text}</span>
                </div>
              );
            })}
          </div>
        )}

      {/* Top Row: Left Warden Status & Action Bar + Center Boss Bar + Right Radar, Score, Settings & Exit */}
      <div className="flex items-start justify-between w-full gap-1.5 sm:gap-2 relative">
        {/* Top-Left Cluster: Warden Vitality + Stamina + Relics + Action Row */}
        <div className="flex flex-col gap-1.5 max-w-[60%] sm:max-w-none">
          {/* Unified ARPG Warden Status Frame */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 bg-[#060d18]/95 px-3 py-1.5 rounded-xl border border-[#ffd166]/65 shadow-[0_6px_20px_rgba(2,6,23,0.85)]">
            {/* Hexagonal Aegis Vitality Crests */}
            <div className="flex items-center gap-0.5" title={isFa ? 'جان نگهبان' : 'Warden Vitality'}>
              {Array.from({ length: player.maxHp }).map((_, i) => {
                const isFull = i < player.hp;
                return (
                  <div
                    key={i}
                    className={`${
                      isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4 sm:w-4.5 sm:h-4.5'
                    } flex items-center justify-center`}
                  >
                    <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-sm">
                      <polygon
                        points="12,2 21,7 19,17 12,22 5,17 3,7"
                        fill={isFull ? '#0ea5e9' : '#0f172a'}
                        stroke={isFull ? '#ffd166' : '#334155'}
                        strokeWidth="2"
                      />
                      {isFull && <polygon points="12,6 16,11 12,18 8,11" fill="#e0f2fe" />}
                    </svg>
                  </div>
                );
              })}
            </div>

            {/* Stamina Bar + 50% Stamina Cost Reduction Buff */}
            <div
              className="flex items-center gap-1"
              title={
                player.staminaBuffRemaining > 0
                  ? isFa
                    ? 'جریان اختری فعال: ۵۰٪ کاهش مصرف استقامت!'
                    : 'Astral Flow Active: -50% Stamina Consumption!'
                  : isFa
                  ? 'استقامت رزمی'
                  : 'Combat Stamina'
              }
            >
              <Zap
                className={`w-3.5 h-3.5 shrink-0 ${
                  player.staminaBuffRemaining > 0 ? 'text-[#34d399]' : 'text-[#38bdf8]'
                }`}
              />
              <div
                className={`w-11 sm:w-16 h-2 bg-[#0f172a] rounded-sm overflow-hidden border ${
                  player.staminaBuffRemaining > 0
                    ? 'border-[#34d399]'
                    : 'border-[#38bdf8]/50'
                }`}
              >
                <div
                  className={`h-full transition-all duration-150 ${
                    player.staminaBuffRemaining > 0
                      ? 'bg-gradient-to-r from-[#059669] via-[#34d399] to-[#fde047]'
                      : 'bg-gradient-to-r from-[#0284c7] via-[#38bdf8] to-[#7dd3fc]'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round((player.stamina / Math.max(1, player.maxStamina)) * 100))}%`,
                  }}
                />
              </div>
              {player.staminaBuffRemaining > 0 && (
                <span
                  data-testid="stamina-buff-indicator"
                  className="text-[10px] font-black text-[#34d399] tabular-nums whitespace-nowrap"
                >
                  -50% ({player.staminaBuffRemaining.toFixed(1)}s)
                </span>
              )}
            </div>

            <div className="w-[1px] h-3.5 bg-[#334155]" />

            {/* Astral Orbs (sunSeeds) */}
            <div className="flex items-center gap-1" title={isFa ? 'گوی‌های اختری' : 'Astral Orbs'}>
              <Sun className="w-3.5 h-3.5 text-[#ffd166] shrink-0" />
              <span className="text-xs sm:text-sm font-black text-[#ffd166] tabular-nums">
                {player.sunSeeds}
              </span>
            </div>

            <div className="w-[1px] h-3.5 bg-[#334155]" />

            {/* Compact Mission Progress */}
            <div className="flex items-center gap-1.5">
              {missionState.mode === 'boss_duel' && stageObjective.bossShieldActive ? (
                <ShieldAlert className="w-3.5 h-3.5 text-[#f43f5e] shrink-0" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
              )}
              <span className="text-xs font-black text-[#38bdf8] tabular-nums">
                {compactMissionCounter}
              </span>
              <div className="w-10 sm:w-14 h-1.5 bg-[#0f172a] rounded-sm overflow-hidden hidden xs:flex sm:flex border border-[#334155]">
                <div
                  className="h-full bg-gradient-to-r from-[#ffd166] to-[#38bdf8] transition-all duration-300"
                  style={{ width: `${stageObjective.progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-[#7dd3fc] tabular-nums">
                {stageObjective.progressPercent}%
              </span>
            </div>
          </div>

          {/* Action Bar Row */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* 1. Stage Objective & Map Guide Button */}
            <button
              type="button"
              data-testid="stage-progression-banner"
              onClick={() => setShowStageGuideModal(true)}
              aria-label="Open Stage Progression and Objective Guide"
              className="bg-[#060d18]/94 hover:bg-[#0f1e36] px-2.5 py-1 rounded-lg border border-[#ffd166]/65 shadow-md flex items-center gap-1.5 text-[11px] font-black text-[#ffd166] pointer-events-auto cursor-pointer active:scale-95 transition-transform"
            >
              <Compass className="w-3.5 h-3.5 text-[#ffd166] shrink-0" />
              <span>
                {isFa
                  ? `فصل ${chapterInfo.chapterNumber}: ${modeBadgeLabel}`
                  : `Ch.${chapterInfo.chapterNumber}: ${modeBadgeLabel}`}
              </span>
            </button>

            {/* 2. Skill Tree & Mythic Armory Button */}
            <button
              type="button"
              data-testid="hud-mastery-btn"
              onClick={() => onOpenCustomize('mastery')}
              aria-label="Open Skill Tree and Mythic Armory"
              className="bg-[#111827]/95 hover:bg-[#1e293b] px-2.5 py-1 rounded-lg border border-[#38bdf8]/75 shadow-md flex items-center gap-1 text-[11px] font-black text-[#38bdf8] pointer-events-auto cursor-pointer active:scale-95 transition-transform"
            >
              <Swords className="w-3.5 h-3.5 text-[#ffd166] shrink-0" />
              <span className="hidden sm:inline">{isFa ? 'مهارت و سلاح' : 'Armory'}</span>
              <span className="text-[#ffd166] tabular-nums">
                {data.heroMastery?.astralShards ?? 0}✦
              </span>
            </button>

            {/* 3. Guild Contracts (Daily Quests) Button */}
            <button
              type="button"
              onClick={onOpenDailyQuests}
              aria-label="Open Daily Quests Board"
              className="relative bg-[#060d18]/94 hover:bg-[#0f1e36] px-2.5 py-1 rounded-lg border border-[#475569]/80 shadow-md flex items-center gap-1 text-[11px] font-bold text-[#e2e8f0] pointer-events-auto cursor-pointer active:scale-95 transition-transform"
            >
              <ScrollText className="w-3.5 h-3.5 text-[#ffd166] shrink-0" />
              <span className="hidden sm:inline">{isFa ? 'پیمان‌ها' : 'Contracts'}</span>
              <span className="font-black text-[#ffd166] tabular-nums">
                {completedQuestsCount}/{dailyQuests.length}
              </span>
              {unclaimedQuest && (
                <span className="w-2 h-2 rounded-full bg-[#ffd166] animate-ping" />
              )}
            </button>

            {unclaimedQuest && (
              <button
                type="button"
                onClick={() => onClaimDailyQuest(unclaimedQuest.id)}
                aria-label="Claim Completed Daily Quest Reward"
                className="bg-[#ffd166] hover:bg-[#fde047] text-[#060d18] px-2 py-1 rounded-lg font-black text-[10px] flex items-center gap-1 shadow-md pointer-events-auto cursor-pointer active:scale-95 transition-transform"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{isFa ? 'پاداش!' : 'Claim!'}</span>
              </button>
            )}

            {/* 4. Archon Seraphius Chronicle Toggle Button */}
            <button
              type="button"
              onClick={() => setShowStoryPopover((prev) => !prev)}
              aria-label="Toggle Archon Seraphius Chronicle"
              className={`relative px-2.5 py-1 rounded-lg border shadow-md flex items-center gap-1 text-[11px] font-bold pointer-events-auto cursor-pointer active:scale-95 transition-transform ${
                currentStoryBeat
                  ? 'bg-[#1e1b4b]/95 border-[#ffd166] text-[#ffd166]'
                  : 'bg-[#060d18]/92 border-[#38bdf8]/55 text-[#e2e8f0]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#38bdf8] shrink-0" />
              <span>{isFa ? 'فرامین آرکون' : 'Codex'}</span>
              {currentStoryBeat && !showStoryPopover && (
                <span className="w-2 h-2 rounded-full bg-[#ffd166] animate-pulse" />
              )}
            </button>

            {/* 5. Orin Astrolabe Sentinel Telemetry Badge */}
            {data.sproutBuddy?.isHighlighting && (
              <div
                data-testid="sprout-buddy-badge"
                className={`px-2.5 py-1 rounded-lg border shadow-md flex items-center gap-1.5 text-[10px] font-black ${
                  data.sproutBuddy.targetType === 'seed'
                    ? 'bg-[#060d18]/94 border-[#ffd166]/75 text-[#ffd166]'
                    : 'bg-[#060d18]/94 border-[#38bdf8]/75 text-[#38bdf8]'
                }`}
              >
                <Radar className="w-3 h-3 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="truncate max-w-[115px] sm:max-w-[165px]">
                  {isFa ? data.sproutBuddy.targetLabelFa : data.sproutBuddy.targetLabel}
                </span>
                <span className="font-mono text-[9px] opacity-90 tabular-nums">
                  {Math.round(data.sproutBuddy.distanceToTarget)}m
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Top-Right System Cluster: Tactical Radar + Score + Settings + Exit */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            {/* Compact Score */}
            <div className="bg-[#060d18]/94 px-2.5 py-1.5 rounded-lg border border-[#38bdf8]/55 shadow-md flex items-baseline gap-1">
              <span className="text-[10px] font-bold text-[#94a3b8] hidden sm:inline">
                {isFa ? 'افتخار' : 'VALOR'}
              </span>
              <span className="text-xs sm:text-sm font-black text-[#ffd166] tabular-nums">
                {player.score}
              </span>
            </div>

            {/* Dedicated Settings Button (⚙️ تنظیمات) */}
            <button
              type="button"
              data-testid="hud-settings-btn"
              onClick={() => setShowSettingsModal(true)}
              aria-label={isFa ? 'تنظیمات بازی' : 'Game Settings'}
              className="px-2.5 py-1.5 rounded-lg bg-[#0f172a]/95 hover:bg-[#1e293b] border border-[#ffd166]/70 text-[#ffd166] font-black text-xs flex items-center gap-1.5 shadow-md pointer-events-auto cursor-pointer active:scale-95 transition-all"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>{isFa ? 'تنظیمات' : 'Settings'}</span>
            </button>

            {/* Dedicated Exit Button (🚪 خروج) */}
            <button
              type="button"
              data-testid="hud-exit-btn"
              onClick={() => setShowExitConfirmModal(true)}
              aria-label={isFa ? 'خروج از بازی' : 'Exit Game'}
              className="px-2.5 py-1.5 rounded-lg bg-[#2a0a18]/95 hover:bg-[#4c0519] border border-[#f43f5e]/75 text-[#fecdd3] font-black text-xs flex items-center gap-1.5 shadow-md pointer-events-auto cursor-pointer active:scale-95 transition-all"
            >
              <LogOut className="w-4 h-4 text-[#f43f5e] shrink-0" />
              <span>{isFa ? 'خروج' : 'Exit'}</span>
            </button>
          </div>

          {/* LIVE TACTICAL RADAR MINIMAP */}
          {radarData && (
            <div
              data-testid="tactical-radar"
              title={isFa ? 'رادار تاکتیکی قلمرو اختران' : 'Astral Realm Tactical Radar'}
              style={{
                width: `${radarRadiusPx * 2}px`,
                height: `${radarRadiusPx * 2}px`,
              }}
              className="relative rounded-full bg-[#050b14]/92 border-2 border-[#38bdf8]/65 shadow-[0_4px_16px_rgba(2,6,23,0.9)] flex items-center justify-center overflow-hidden"
            >
              {/* Radar Range Rings & Crosshair */}
              <div className="absolute inset-2 rounded-full border border-[#1e293b]/80 pointer-events-none" />
              <div className="absolute inset-5 rounded-full border border-[#1e293b]/60 pointer-events-none" />
              <div className="absolute inset-x-0 h-[1px] bg-[#1e293b]/70 pointer-events-none" />
              <div className="absolute inset-y-0 w-[1px] bg-[#1e293b]/70 pointer-events-none" />

              {/* Sanctuary Keep Marker (South Base) */}
              {(() => {
                const { rx, ry } = projectToRadar(radarData.sanctuaryX, radarData.sanctuaryZ);
                return (
                  <div
                    style={{ transform: `translate(${rx}px, ${ry}px)` }}
                    className="absolute w-2 h-2 rounded-sm bg-[#ffd166] border border-white/80"
                  />
                );
              })()}

              {/* Shrines / Obelisks */}
              {radarData.shrines.map((sh, idx) => {
                const { rx, ry } = projectToRadar(sh.x, sh.z);
                return (
                  <div
                    key={`r-sh-${idx}`}
                    style={{ transform: `translate(${rx}px, ${ry}px)` }}
                    className={`absolute w-2 h-2 rotate-45 ${
                      sh.restored
                        ? 'bg-[#10b981] shadow-[0_0_5px_#10b981]'
                        : 'bg-[#38bdf8] animate-pulse'
                    }`}
                  />
                );
              })}

              {/* Void Legion Enemies */}
              {radarData.enemies.map((en, idx) => {
                const { rx, ry } = projectToRadar(en.x, en.z);
                return (
                  <div
                    key={`r-en-${idx}`}
                    style={{ transform: `translate(${rx}px, ${ry}px)` }}
                    className={`absolute w-1.5 h-1.5 rounded-full ${
                      en.kind === 'charger'
                        ? 'bg-[#f43f5e]'
                        : en.kind === 'roller'
                        ? 'bg-[#fbbf24]'
                        : 'bg-[#a855f7]'
                    }`}
                  />
                );
              })}

              {/* Sovereign Boss Marker */}
              {radarData.boss && (
                <div
                  style={{
                    transform: `translate(${projectToRadar(radarData.boss.x, radarData.boss.z).rx}px, ${
                      projectToRadar(radarData.boss.x, radarData.boss.z).ry
                    }px)`,
                  }}
                  className="absolute w-2.5 h-2.5 rounded-full bg-[#e11d48] border border-[#ffd166] animate-ping"
                />
              )}

              {/* Center Player Warden Arrow / Dot */}
              <div
                style={{
                  transform: `rotate(${-radarData.playerRotationY}rad)`,
                }}
                className="relative w-2.5 h-2.5 flex items-center justify-center"
              >
                <div className="w-2 h-2 rounded-full bg-[#f8fafc] border border-[#38bdf8] shadow-[0_0_6px_#38bdf8]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top-Center Sovereign Boss Bar (Displayed during Boss Duel or when near Boss) */}
      {(missionState.mode === 'boss_duel' || bossHp < bossMaxHp) && !data.bossCleansed && (
        <div className="w-full max-w-md mx-auto mt-1 px-2 pointer-events-none">
          <div className="bg-[#060d18]/94 border border-[#f43f5e]/75 rounded-xl px-3 py-1.5 shadow-[0_6px_20px_rgba(2,6,23,0.9)]">
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-black mb-1">
              <div className="flex items-center gap-1.5 text-[#fecdd3]">
                <Crown className="w-3.5 h-3.5 text-[#ffd166] shrink-0" />
                <span>
                  {isFa
                    ? 'مالاکور، فرمانروای خلأ کیهانی'
                    : 'MALAKOR, SOVEREIGN OF THE VOID'}
                </span>
              </div>
              <span className="text-[#ffd166] tabular-nums">
                {Math.ceil(bossHp)} / {bossMaxHp}
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#0f172a] rounded-sm overflow-hidden border border-[#475569]/70">
              <div
                className={`h-full transition-all duration-200 ${
                  stageObjective.bossShieldActive
                    ? 'bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#38bdf8]'
                    : data.bossPhase === 2
                    ? 'bg-gradient-to-r from-[#dc2626] via-[#f43f5e] to-[#f59e0b]'
                    : 'bg-gradient-to-r from-[#be123c] to-[#f43f5e]'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, (bossHp / Math.max(1, bossMaxHp)) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Middle Contextual Prompt (When near an Astral Obelisk or inside Bastion Keep) */}
      <div className="flex flex-col items-center gap-1.5 my-auto pointer-events-none">
        {isNearShrine ? (
          <div
            dir={isFa ? 'rtl' : 'ltr'}
            className="bg-[#060d18]/95 border-2 border-[#ffd166] px-4 py-1.5 rounded-xl shadow-2xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#ffd166] shrink-0" />
            <span className="text-xs font-black text-[#f8fafc] tracking-wide">
              {localizeShrinePrompt(nearShrinePrompt, lang)}
            </span>
          </div>
        ) : isInsideSafeZone ? (
          <button
            type="button"
            dir={isFa ? 'rtl' : 'ltr'}
            onClick={() => onOpenCustomize('home')}
            className="bg-[#060d18]/92 hover:bg-[#0f1e36] border border-[#38bdf8]/75 px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 pointer-events-auto cursor-pointer active:scale-95 transition-transform"
          >
            <Home className="w-3.5 h-3.5 text-[#ffd166] shrink-0" />
            <span className="text-[11px] font-black text-[#e2e8f0]">
              {isFa ? 'حریم دژ اختران · ارتقای دژ و تندیس‌ها' : 'Astral Bastion · Upgrade Keep'}
            </span>
          </button>
        ) : null}
      </div>

      {/* Bottom Area: 3-Hit Combo Step, Critical Hit Badge, Boss Phase II Alert & Archon Chronicle Popover */}
      <div className="flex flex-col items-center gap-1.5 w-full px-2">
        {missionState.mode === 'boss_duel' && data.bossPhase === 2 && !data.bossCleansed && (
          <div className="bg-[#4c0519]/95 text-[#ffd166] px-3.5 py-1 rounded-lg text-[11px] font-black tracking-wider uppercase border border-[#ffd166] shadow-lg">
            {isFa
              ? '⚠️ فاز دوم مالاکور: خشم کیهانی و امواج شوک خلأ فعال شد!'
              : '⚠️ SOVEREIGN PHASE II: COSMIC ENRAGE & VOID SHOCKWAVES!'}
          </div>
        )}

        {(player.comboCount > 1 ||
          player.lastHitWasCrit ||
          player.counterWindowRemaining > 0 ||
          player.staminaBuffRemaining > 0) && (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {player.counterWindowRemaining > 0 && (
              <div
                data-testid="counter-window-badge"
                className="bg-[#ffd166]/95 text-[#060d18] px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase border border-white shadow-lg tabular-nums"
              >
                {isFa
                  ? `⚔️ پنجره پاتک فعال (۱.۶۵× آسیب) · ${player.counterWindowRemaining.toFixed(1)}s`
                  : `⚔️ RIPOSTE WINDOW (1.65X CRIT) · ${player.counterWindowRemaining.toFixed(1)}s`}
              </div>
            )}
            {player.staminaBuffRemaining > 0 && (
              <div
                data-testid="stamina-flow-badge"
                className="bg-[#064e3b]/95 text-[#34d399] px-2.5 py-1 rounded-lg text-xs font-black tracking-wider uppercase border border-[#34d399]/80 shadow-lg tabular-nums"
              >
                {isFa
                  ? `⚡ ۵۰٪ کاهش مصرف استقامت · ${player.staminaBuffRemaining.toFixed(1)}s`
                  : `⚡ -50% STAMINA COST · ${player.staminaBuffRemaining.toFixed(1)}s`}
              </div>
            )}
            {player.comboCount > 1 && (
              <div className="bg-[#f59e0b]/95 text-[#060d18] px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase border border-white/80 shadow-lg">
                {isFa
                  ? `کمبو ${player.comboCount}/3 ${player.comboCount === 3 ? '· شکاف نهایی!' : ''}`
                  : `COMBO ${player.comboCount}/3 ${player.comboCount === 3 ? '· FINISHER!' : ''}`}
              </div>
            )}
            {player.lastHitWasCrit && (
              <div className="bg-[#38bdf8]/95 text-[#060d18] px-2.5 py-1 rounded-lg text-xs font-black tracking-wider uppercase border border-white/80 shadow-lg">
                {isFa ? `ضربه بحرانی! (${player.lastDamageDealt})` : `CRIT! (${player.lastDamageDealt})`}
              </div>
            )}
          </div>
        )}

        {/* Compact Combat Parry & Skill Bar (Desktop & Tablet Quick Reference + Clickable Parry Trigger) */}
        <div
          dir="ltr"
          className="hidden sm:flex items-center gap-2 bg-[#060d18]/92 border border-[#334155] px-3 py-1.5 rounded-xl shadow-xl pointer-events-auto"
        >
          <button
            type="button"
            data-testid="hud-parry-btn"
            onClick={() => onTriggerParry?.()}
            disabled={player.parryCooldownRemaining > 0}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer tabular-nums whitespace-nowrap ${
              player.parryWindowRemaining > 0
                ? 'bg-[#ffd166] text-[#060d18] border-white'
                : player.parryCooldownRemaining > 0
                ? 'bg-[#0f172a] text-[#64748b] border-[#1e293b]'
                : 'bg-[#0f172a] hover:bg-[#1e293b] text-[#38bdf8] border-[#38bdf8]/65'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#ffd166] shrink-0" />
            <span>
              {isFa
                ? 'دفع اختری [F / راست‌کلیک / L1]'
                : 'Parry [F / RMB / L1]'}
            </span>
            <span className="text-[#ffd166]">
              {player.parryWindowRemaining > 0
                ? 'ACTIVE'
                : player.parryCooldownRemaining > 0
                ? `${player.parryCooldownRemaining.toFixed(1)}s`
                : player.staminaBuffRemaining > 0
                ? '7⚡'
                : '14⚡'}
            </span>
          </button>

          <span className="text-[#475569]" aria-hidden="true">·</span>

          <div className="text-[11px] text-[#cbd5e1] flex items-center gap-1.5 tabular-nums whitespace-nowrap">
            <span>
              {player.counterWindowRemaining > 0
                ? isFa
                  ? 'پاتک [Space/X]: ۱.۶۵× ضربه بحرانی'
                  : 'Riposte [Space/X]: 1.65x Crit'
                : isFa
                ? 'برش [Space/X]'
                : 'Strike [Space/X]'}
            </span>
            <span className="text-[#475569]" aria-hidden="true">·</span>
            <span>
              {isFa ? 'جاخالی [Shift/A]:' : 'Evade [Shift/A]:'}{' '}
              <strong className={player.staminaBuffRemaining > 0 ? 'text-[#34d399]' : 'text-[#38bdf8]'}>
                {player.staminaBuffRemaining > 0 ? '11⚡' : '22⚡'}
              </strong>
            </span>
            <span className="text-[#475569]" aria-hidden="true">·</span>
            <span>
              {isFa ? 'ابرنواختر [Q/Y]:' : 'Nova [Q/Y]:'}{' '}
              <strong className={player.staminaBuffRemaining > 0 ? 'text-[#34d399]' : 'text-[#a855f7]'}>
                {player.staminaBuffRemaining > 0 ? '14⚡' : '28⚡'}
              </strong>
            </span>
            {data.gamepadConnected && (
              <>
                <span className="text-[#475569]" aria-hidden="true">·</span>
                <span className="text-[#ffd166] font-black">
                  {isFa ? '🎮 دسته متصل (لرزش فعال)' : '🎮 RUMBLE ON'}
                </span>
              </>
            )}
          </div>
        </div>

        {showStoryPopover && (currentStoryBeat || storyHistory.length > 0) && (
          <div
            dir={isFa ? 'rtl' : 'ltr'}
            data-testid="in-game-story-banner"
            onPointerDown={(e) => e.stopPropagation()}
            className={`w-full max-w-md bg-[#060d18]/96 border-2 border-[#ffd166]/85 rounded-2xl p-3.5 shadow-2xl pointer-events-auto flex flex-col gap-1.5 ${
              hudProfile.isPortrait ? 'mb-28' : 'mb-20 sm:mb-4'
            }`}
          >
            {(() => {
              const beat = currentStoryBeat || storyHistory[storyHistory.length - 1];
              if (!beat) return null;
              return (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Sparkles className="w-4 h-4 text-[#38bdf8] shrink-0" />
                      <span className="text-xs font-black text-[#ffd166] truncate">
                        {isFa ? beat.speakerFa : beat.speakerEn}
                      </span>
                    </div>
                    <button
                      type="button"
                      data-testid="dismiss-story-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowStoryPopover(false);
                        if (currentStoryBeat) {
                          onDismissStoryBeat();
                        }
                      }}
                      aria-label="Close Story Popover"
                      className="px-2.5 py-1 rounded-lg bg-[#ffd166] hover:bg-[#fde047] text-[#060d18] text-[11px] font-black flex items-center gap-1 cursor-pointer shrink-0 shadow-md"
                    >
                      <span>{isFa ? 'بستن' : 'Close'}</span>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-[#e2e8f0] font-medium leading-relaxed">
                    {isFa ? beat.textFa : beat.textEn}
                  </p>

                  <div className="text-[11px] text-[#38bdf8] font-bold flex items-center gap-1.5 pt-1.5 border-t border-[#1e293b]">
                    <Compass className="w-3.5 h-3.5 text-[#ffd166] shrink-0" />
                    <span>{isFa ? beat.hintFa : beat.hintEn}</span>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* 1. DEDICATED SETTINGS MODAL (⚙️ تنظیمات جامع بازی) */}
      {showSettingsModal && (
        <div
          role="dialog"
          dir={isFa ? 'rtl' : 'ltr'}
          aria-label={isFa ? 'تنظیمات بازی' : 'Game Settings'}
          onPointerDown={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 bg-[#020617]/88 flex items-center justify-center p-3 sm:p-4 pointer-events-auto"
        >
          <div className="w-full max-w-md max-h-[88dvh] overflow-y-auto bg-[#0b1520] border-2 border-[#ffd166] rounded-2xl p-4 sm:p-5 shadow-2xl text-[#f8fafc] flex flex-col gap-3">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#ffd166]" />
                <h3 className="text-base sm:text-lg font-black text-[#ffd166]">
                  {isFa ? 'تنظیمات و فرماندهی نگهبان' : 'Warden Command & Settings'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                aria-label="Close Settings"
                className="w-8 h-8 rounded-lg bg-[#16293d] hover:bg-[#1e3a5f] flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Row: Sound & Language */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onToggleMute}
                className="p-2.5 rounded-xl bg-[#112233] hover:bg-[#16293d] border border-[#38bdf8]/40 flex items-center justify-center gap-2 text-xs font-black cursor-pointer"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-red-400 shrink-0" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#ffd166] shrink-0" />
                )}
                <span>
                  {isFa
                    ? isMuted
                      ? 'صدا: خاموش'
                      : 'صدا: روشن'
                    : isMuted
                    ? 'Audio: Muted'
                    : 'Audio: On'}
                </span>
              </button>

              <button
                type="button"
                onClick={onToggleLang}
                className="p-2.5 rounded-xl bg-[#112233] hover:bg-[#16293d] border border-[#38bdf8]/40 flex items-center justify-center gap-2 text-xs font-black text-[#ffd166] cursor-pointer"
              >
                <Languages className="w-4 h-4 text-[#38bdf8] shrink-0" />
                <span>{isFa ? 'زبان: پارسی (EN)' : 'Lang: English (فا)'}</span>
              </button>
            </div>

            {/* Graphics Quality Selector (Eco / Balanced / Ultra) */}
            {onSetPerformanceQuality && (
              <div className="bg-[#112233] p-3 rounded-xl border border-[#1e293b] flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#94a3b8]">
                  <Gauge className="w-4 h-4 text-[#ffd166]" />
                  <span>
                    {isFa
                      ? 'کیفیت گرافیک سه‌بعدی و نرخ فریم:'
                      : '3D Graphics & Performance Tier:'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'eco', labelFa: 'اقتصادی (موبایل)', labelEn: 'Eco (Mobile)' },
                      { id: 'balanced', labelFa: 'متعادل', labelEn: 'Balanced' },
                      { id: 'ultra', labelFa: 'فوق‌العاده (Ultra)', labelEn: 'Ultra 3D' },
                    ] as const
                  ).map((tier) => {
                    const active = performanceQuality === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => onSetPerformanceQuality(tier.id)}
                        className={`py-2 px-2 rounded-lg text-[11px] font-black border transition-all cursor-pointer ${
                          active
                            ? 'bg-[#ffd166] text-[#060d18] border-white shadow-sm'
                            : 'bg-[#0b1520] hover:bg-[#16293d] text-[#e2e8f0] border-[#334155]'
                        }`}
                      >
                        {isFa ? tier.labelFa : tier.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Customization, Armory & World Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  onOpenCustomize('mastery');
                }}
                className="p-2.5 rounded-xl bg-[#1e1b4b] hover:bg-[#312e81] border border-[#38bdf8]/75 flex items-center gap-2 text-xs font-black text-[#38bdf8] cursor-pointer"
              >
                <Swords className="w-4 h-4 text-[#ffd166] shrink-0" />
                <span>{isFa ? 'درخت مهارت و زرادخانه سلاح' : 'Skill Tree & Mythic Armory'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  onOpenCustomize('hero');
                }}
                className="p-2.5 rounded-xl bg-[#112233] hover:bg-[#16293d] border border-[#334155] flex items-center gap-2 text-xs font-bold text-[#f8fafc] cursor-pointer"
              >
                <User className="w-4 h-4 text-[#ffd166] shrink-0" />
                <span>{isFa ? 'شخصی‌سازی زره نگهبان' : 'Customize Warden Armor'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  onOpenCustomize('home');
                }}
                className="p-2.5 rounded-xl bg-[#112233] hover:bg-[#16293d] border border-[#334155] flex items-center gap-2 text-xs font-bold text-[#f8fafc] cursor-pointer"
              >
                <Home className="w-4 h-4 text-[#ffd166] shrink-0" />
                <span>{isFa ? 'دژ اختران و تندیس‌ها' : 'Astral Bastion & Relics'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  onOpenCustomize('atmosphere');
                }}
                className="p-2.5 rounded-xl bg-[#112233] hover:bg-[#16293d] border border-[#334155] flex items-center gap-2 text-xs font-bold text-[#e2e8f0] cursor-pointer"
              >
                <CloudSun className="w-4 h-4 text-[#38bdf8] shrink-0" />
                <span>
                  {isFa
                    ? `اقلیم (${TIME_PHASE_LABELS[lang][timePhase]} · ${WEATHER_SHORT_LABELS[lang][weather]})`
                    : `Atmosphere (${TIME_PHASE_LABELS[lang][timePhase]})`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowStageGuideModal(true);
                }}
                className="p-2.5 rounded-xl bg-[#112233] hover:bg-[#16293d] border border-[#ffd166]/55 flex items-center gap-2 text-xs font-bold text-[#ffd166] cursor-pointer sm:col-span-2"
              >
                <Compass className="w-4 h-4 text-[#ffd166] shrink-0" />
                <span>{isFa ? 'راهنمای قلمرو و انتخاب مرحله' : 'Realm Guide & Stage Switcher'}</span>
              </button>
            </div>

            {/* Online Rewarded Orbs & APK Settings */}
            <div className="flex flex-wrap items-center gap-2">
              {isOnline && (
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    handleRewardedBlessing();
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#ffd166] hover:bg-[#fde047] text-[#060d18] font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Gift className="w-4 h-4 shrink-0" />
                  <span>{isFa ? 'دریافت +۳ گوی اختری' : 'Get +3 Astral Orbs'}</span>
                </button>
              )}

              {onOpenAdMobAndApk && (
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    onOpenAdMobAndApk();
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#112233] hover:bg-[#16293d] border border-[#ffd166]/45 text-[#ffd166] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>{isFa ? 'خروجی ویندوز، اندروید و تبلیغات' : 'Builds & AdMob Setup'}</span>
                </button>
              )}
            </div>

            {/* Bottom Actions: Pause Menu, Exit to Title, or Resume */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1e293b]">
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  onPause();
                }}
                className="px-3.5 py-2 rounded-lg bg-[#16293d] hover:bg-[#1e3a5f] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>{isFa ? 'توقف کامل' : 'Pause Screen'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  onExitToTitle();
                }}
                className="px-3.5 py-2 rounded-lg bg-[#2a0a18] hover:bg-[#4c0519] border border-[#f43f5e]/70 text-[#fecdd3] font-black text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-[#f43f5e]" />
                <span>{isFa ? 'خروج به منوی اصلی' : 'Exit to Main Menu'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-lg bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#060d18] font-black text-xs cursor-pointer"
              >
                {isFa ? 'ادامه نبرد' : 'Resume'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DEDICATED EXIT CONFIRMATION MODAL (🚪 خروج از بازی) */}
      {showExitConfirmModal && (
        <div
          role="dialog"
          dir={isFa ? 'rtl' : 'ltr'}
          aria-label={isFa ? 'خروج از بازی' : 'Exit Game Confirmation'}
          onPointerDown={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 bg-[#020617]/88 flex items-center justify-center p-4 pointer-events-auto"
        >
          <div className="w-full max-w-sm bg-[#0b1520] border-2 border-[#f43f5e] rounded-2xl p-5 shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#2a0a18] border border-[#f43f5e]/75 flex items-center justify-center">
              <LogOut className="w-6 h-6 text-[#f43f5e]" />
            </div>

            <h3 className="text-base sm:text-lg font-black text-[#fff1f2]">
              {isFa ? 'خروج به صفحه اصلی بازی؟' : 'Exit to Main Title Screen?'}
            </h3>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              {isFa
                ? 'پیشرفت فصل، مهارت‌ها و تندیس‌های دژ اختران ذخیره شده است. آیا می‌خواهید به منوی اصلی بازگردید؟'
                : 'Your chapter progress, mastery skills, and Bastion relics are saved. Return to the main title screen?'}
            </p>

            <div className="w-full flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                data-testid="confirm-exit-to-title-btn"
                onClick={() => {
                  setShowExitConfirmModal(false);
                  onExitToTitle();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#e11d48] hover:bg-[#f43f5e] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{isFa ? 'بله، خروج به منوی اصلی' : 'Yes, Exit to Menu'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExitConfirmModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#16293d] hover:bg-[#1e3a5f] text-[#f8fafc] font-black text-xs cursor-pointer"
              >
                {isFa ? 'انصراف و ادامه نبرد' : 'Cancel & Resume'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. STAGE PROGRESSION & STORY GUIDE MODAL */}
      {showStageGuideModal && (
        <div
          role="dialog"
          dir={isFa ? 'rtl' : 'ltr'}
          aria-label="Stage Progression Guide and Story Chronicle"
          onPointerDown={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 bg-[#020617]/88 flex items-center justify-center p-4 pointer-events-auto"
        >
          <div className="w-full max-w-lg max-h-[84vh] overflow-y-auto bg-[#0b1520] border-2 border-[#ffd166] rounded-2xl p-5 shadow-2xl text-[#f8fafc] flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#ffd166]">
                  {isFa
                    ? `طومار قلمرو و مأموریت — ${localizedChapter.title}`
                    : `Realm Codex & Mission — ${localizedChapter.title}`}
                </h3>
                <p className="text-xs text-[#38bdf8] font-bold">{localizedChapter.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowStageGuideModal(false)}
                aria-label="Close Stage Guide"
                className="w-8 h-8 rounded-lg bg-[#16293d] hover:bg-[#1e3a5f] flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stage Objective Details */}
            <div className="bg-[#112233] p-3.5 rounded-xl border border-[#38bdf8]/45 flex flex-col gap-2">
              <span className="text-xs font-black text-[#ffd166]">
                {isFa
                  ? `هدف تاکتیکی این قلمرو (${modeBadgeLabel}):`
                  : `Tactical Realm Objective (${modeBadgeLabel}):`}
              </span>

              <div className="flex items-center justify-between text-xs bg-[#060d18] p-2.5 rounded-lg border border-[#1e293b]">
                <span>{isFa ? stageObjective.headlineFa : stageObjective.headlineEn}</span>
                <span className="font-black text-[#38bdf8] tabular-nums">
                  {stageObjective.progressPercent}%
                </span>
              </div>

              <div className="text-xs bg-[#060d18] p-2.5 rounded-lg border border-[#1e293b] text-[#cbd5e1] leading-relaxed">
                {isFa ? stageObjective.sublineFa : stageObjective.sublineEn}
              </div>

              {missionState.mode === 'boss_duel' && (
                <div className="flex items-center gap-2 text-xs text-[#ffd166] pt-1">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    {isFa
                      ? `جان مالاکور، فرمانروای خلأ: ${Math.ceil(bossHp)} / ${bossMaxHp}`
                      : `Malakor Void Sovereign HP: ${Math.ceil(bossHp)} / ${bossMaxHp}`}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Stage Biome & Mission Mode Explorer */}
            {onJumpToChapter && (
              <div className="bg-[#112233] p-3.5 rounded-xl border border-[#ffd166]/45 flex flex-col gap-2">
                <span className="text-xs font-black text-[#ffd166]">
                  {isFa
                    ? 'انتخاب مستقیم قلمرو (۵ اقلیم اسطوره‌ای و مأموریت تاکتیکی):'
                    : 'Select Mythic Realm Directly (5 Distinct Realms & Tactical Modes):'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {[
                    {
                      chNum: 1,
                      modeFa: 'آزادسازی نگهبانان اختری از منشور خلأ',
                      modeEn: 'Astral Sentinel Rescue & Escort',
                    },
                    {
                      chNum: 2,
                      modeFa: 'پازل مناره‌های رزونانس و پل‌های اختری',
                      modeEn: 'Harmonic Chimes & Light Bridges',
                    },
                    {
                      chNum: 3,
                      modeFa: 'دفاع از ستون اختران در برابر امواج خلأ',
                      modeEn: 'Celestial Spire Wave Defense',
                    },
                    {
                      chNum: 4,
                      modeFa: 'مهار شهاب‌سنگ‌های اختری در بوران یخ‌زده',
                      modeEn: 'Falling Starlight Meteor Convergence',
                    },
                    {
                      chNum: 5,
                      modeFa: 'نبرد نهایی با مالاکور در حلقه کسوف',
                      modeEn: 'Malakor Sovereign Boss Arena Duel',
                    },
                  ].map(({ chNum, modeFa, modeEn }) => {
                    const b = getStageBiomeTheme(chNum);
                    const isCurrent = chapterInfo.chapterNumber === chNum;
                    return (
                      <button
                        key={chNum}
                        type="button"
                        onClick={() => {
                          setShowStageGuideModal(false);
                          onJumpToChapter(chNum);
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-bold flex flex-col items-start gap-0.5 border transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#ffd166] text-[#060d18] border-white shadow-md'
                            : 'bg-[#060d18] hover:bg-[#16293d] text-[#f8fafc] border-[#334155]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>
                            {isFa ? `فصل ${chNum}: ${b.nameFa}` : `Stage ${chNum}: ${b.nameEn}`}
                          </span>
                          {isCurrent && <span className="text-[10px] font-black">★</span>}
                        </div>
                        <span
                          className={`text-[10px] font-medium ${
                            isCurrent ? 'text-[#0f172a]' : 'text-[#38bdf8]'
                          }`}
                        >
                          {isFa ? modeFa : modeEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Story Chronicle History */}
            <div className="bg-[#112233] p-3.5 rounded-xl border border-[#1e293b] flex flex-col gap-2">
              <span className="text-xs font-black text-[#38bdf8]">
                {isFa ? 'فرامین ثبت‌شده آرکون سرافیوس:' : 'Archon Seraphius Codex Entries:'}
              </span>
              {storyHistory.map((beat) => (
                <div
                  key={beat.id}
                  className="bg-[#060d18] p-2.5 rounded-lg border border-[#1e293b] text-xs"
                >
                  <div className="font-black text-[#ffd166] mb-0.5">
                    {isFa ? beat.speakerFa : beat.speakerEn}
                  </div>
                  <p className="text-[#e2e8f0] leading-relaxed">
                    {isFa ? beat.textFa : beat.textEn}
                  </p>
                </div>
              ))}
            </div>

            {/* Direct Next Chapter / Stage Action */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowStageGuideModal(false);
                  onAdvanceChapter();
                }}
                aria-label="Skip to Next Chapter Immediately"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ffd166] to-[#f59e0b] text-[#060d18] font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <FastForward className="w-4 h-4" />
                <span>
                  {isFa
                    ? `پیشروی مستقیم به قلمرو بعد (فصل ${chapterInfo.chapterNumber + 1})`
                    : `Advance to Next Realm (Chapter ${chapterInfo.chapterNumber + 1})`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowStageGuideModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#38bdf8] text-[#060d18] font-black text-xs cursor-pointer"
              >
                {isFa ? 'بازگشت به نبرد' : 'Resume Combat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

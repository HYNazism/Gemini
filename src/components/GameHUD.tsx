/**
 * Minimalist Mobile-First Playing HUD (Persian & English).
 * >= 90% playfield unobstructed, zero backdrop-filter, tabular-nums.
 * Features:
 * - Ultra-compact Top-Left Vitality, Seeds & Mission Progress Bar
 * - Collapsible icon buttons for Stage Guide, Daily Quests, and Story Owl Dialogue
 * - Top-Right System Bar with Score, Dedicated Settings (⚙️ تنظیمات) & Dedicated Exit (🚪 خروج)
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
  onOpenCustomize: (tab: 'hero' | 'home' | 'atmosphere') => void;
  onOpenDailyQuests: () => void;
  onOpenAdMobAndApk?: () => void;
  onClaimDailyQuest: (questId: string) => void;
  onGrantRewardedSeeds: () => void;
  onDismissStoryBeat: () => void;
  onAdvanceChapter: () => void;
  onJumpToChapter?: (chapterNumber: number) => void;
  onSetPerformanceQuality?: (quality: PerformanceQuality) => void;
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
    admob.showRewardedAd(isFa ? '+۳ بذر طلایی خورشید' : '+3 Golden Sun-Seeds', () => {
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
        return isFa ? 'نجات جوانه‌ها' : 'Critter Rescue';
      case 'harmonic_bells':
        return isFa ? 'پازل زنگوله' : 'Bell Puzzle';
      case 'heart_tree_defense':
        return isFa ? 'دفاع درخت قلب' : 'Tree Defense';
      case 'meteor_rush':
        return isFa ? 'شهاب‌باران' : 'Meteor Rush';
      case 'boss_duel':
        return isFa ? 'نبرد غول' : 'Boss Duel';
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

  return (
    <div
      style={{ fontSize: `${Math.round(hudProfile.uiFontScale * 100)}%` }}
      className={`absolute inset-0 pointer-events-none z-30 flex flex-col justify-between ${
        isCompact ? 'p-2' : 'p-3 sm:p-4'
      } select-none`}
    >
      {/* Top Bar: Minimalist Left Status & Action Buttons + Right Score, Settings & Exit */}
      <div className="flex items-start justify-between w-full gap-1.5 sm:gap-2">
        {/* Top-Left Cluster: Compact Vitality + Seeds + Mission Progress & Collapsible Action Buttons */}
        <div className="flex flex-col gap-1.5 max-w-[62%] sm:max-w-none">
          {/* Unified Status Capsule: HP Leaves + Sun-Seeds + Mission Progress */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-[#0f281e]/92 px-2.5 py-1.5 rounded-2xl border border-[#52b788]/65 shadow-md">
            {/* HP Leaves */}
            <div className="flex items-center gap-0.5" title={isFa ? 'جان' : 'HP'}>
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
                      <path
                        d="M12 2 C16 6 20 12 12 22 C4 12 8 6 12 2 Z"
                        fill={isFull ? '#52b788' : '#2d3748'}
                        stroke={isFull ? '#95d5b2' : '#4a5568'}
                        strokeWidth="2"
                      />
                      {isFull && <circle cx="12" cy="11" r="2.5" fill="#d8f3dc" />}
                    </svg>
                  </div>
                );
              })}
            </div>

            <div className="w-[1px] h-3.5 bg-[#709775]/40" />

            {/* Sun-Seeds */}
            <div className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-[#ffd166] shrink-0" />
              <span className="text-xs sm:text-sm font-black text-[#ffd166] tabular-nums">
                {player.sunSeeds}
              </span>
            </div>

            <div className="w-[1px] h-3.5 bg-[#709775]/40" />

            {/* Compact Mission Progress */}
            <div className="flex items-center gap-1.5">
              {missionState.mode === 'boss_duel' && stageObjective.bossShieldActive ? (
                <ShieldAlert className="w-3.5 h-3.5 text-[#c77dff] shrink-0" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#06d6a0] shrink-0" />
              )}
              <span className="text-xs font-black text-[#06d6a0] tabular-nums">
                {compactMissionCounter}
              </span>
              <div className="w-10 sm:w-14 h-1.5 bg-[#1b4332] rounded-full overflow-hidden hidden xs:flex sm:flex">
                <div
                  className="h-full bg-gradient-to-r from-[#ffd166] to-[#06d6a0] transition-all duration-300"
                  style={{ width: `${stageObjective.progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-[#80ffdb] tabular-nums">
                {stageObjective.progressPercent}%
              </span>
            </div>
          </div>

          {/* Collapsible Icon Action Buttons Row (Replaces Cluttered Multi-line Banners) */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* 1. Stage Objective & Map Guide Button */}
            <button
              type="button"
              data-testid="stage-progression-banner"
              onClick={() => setShowStageGuideModal(true)}
              aria-label="Open Stage Progression and Objective Guide"
              className="bg-[#1b4332]/92 hover:bg-[#2d6a4f] px-2.5 py-1 rounded-xl border border-[#ffd166]/60 shadow-md flex items-center gap-1.5 text-[11px] font-black text-[#ffd166] pointer-events-auto cursor-pointer active:scale-95 transition-transform"
            >
              <Compass className="w-3.5 h-3.5 text-[#ffd166] shrink-0" />
              <span>
                {isFa
                  ? `فصل ${chapterInfo.chapterNumber}: ${modeBadgeLabel}`
                  : `Ch.${chapterInfo.chapterNumber}: ${modeBadgeLabel}`}
              </span>
            </button>

            {/* 2. Daily Quests Button (Compact Icon + Count + Claim Badge) */}
            <button
              type="button"
              onClick={onOpenDailyQuests}
              aria-label="Open Daily Quests Board"
              className="relative bg-[#1b4332]/92 hover:bg-[#2d6a4f] px-2.5 py-1 rounded-xl border border-[#709775]/60 shadow-md flex items-center gap-1 text-[11px] font-bold text-[#e9f5db] pointer-events-auto cursor-pointer active:scale-95 transition-transform"
            >
              <ScrollText className="w-3.5 h-3.5 text-[#ffd166] shrink-0" />
              <span className="hidden sm:inline">{isFa ? 'ماموریت‌ها' : 'Quests'}</span>
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
                className="bg-[#ffd166] hover:bg-[#ffe08a] text-[#081c15] px-2 py-1 rounded-xl font-black text-[10px] flex items-center gap-1 shadow-md pointer-events-auto cursor-pointer active:scale-95 transition-transform"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{isFa ? 'پاداش!' : 'Claim!'}</span>
              </button>
            )}

            {/* 3. Story Owl Toggle Button (Replaces Full-Width Story Banner) */}
            <button
              type="button"
              onClick={() => setShowStoryPopover((prev) => !prev)}
              aria-label="Toggle Wise Owl Story Hint"
              className={`relative px-2.5 py-1 rounded-xl border shadow-md flex items-center gap-1 text-[11px] font-bold pointer-events-auto cursor-pointer active:scale-95 transition-transform ${
                currentStoryBeat
                  ? 'bg-[#2d5029]/95 border-[#ffd166] text-[#ffd166]'
                  : 'bg-[#1b4332]/92 border-[#709775]/60 text-[#d8f3dc]'
              }`}
            >
              <span className="text-xs leading-none">🦉</span>
              <span>{isFa ? 'پیام راهنما' : 'Story'}</span>
              {currentStoryBeat && !showStoryPopover && (
                <span className="w-2 h-2 rounded-full bg-[#ffd166] animate-pulse" />
              )}
            </button>

            {/* 4. Compact Sprout-Buddy Companion Radar Badge */}
            {data.sproutBuddy?.isHighlighting && (
              <div
                data-testid="sprout-buddy-badge"
                className={`px-2 py-1 rounded-xl border shadow-md flex items-center gap-1 text-[10px] font-bold ${
                  data.sproutBuddy.targetType === 'seed'
                    ? 'bg-[#1b4332]/92 border-[#ffd166]/65 text-[#ffd166]'
                    : 'bg-[#1b4332]/92 border-[#06d6a0]/65 text-[#06d6a0]'
                }`}
              >
                <span className="text-xs leading-none">🌱</span>
                <span className="truncate max-w-[115px] sm:max-w-[160px]">
                  {isFa ? data.sproutBuddy.targetLabelFa : data.sproutBuddy.targetLabel}
                </span>
                <span className="font-mono text-[9px] opacity-85 tabular-nums">
                  {Math.round(data.sproutBuddy.distanceToTarget)}m
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Top-Right System Cluster: Score + Dedicated Settings Button + Dedicated Exit Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Compact Score */}
          <div className="bg-[#0f281e]/92 px-2.5 py-1.5 rounded-xl border border-[#709775]/60 shadow-md flex items-baseline gap-1">
            <span className="text-[10px] font-bold text-[#95d5b2] hidden sm:inline">
              {isFa ? 'امتیاز' : 'SCORE'}
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
            className="px-2.5 py-1.5 rounded-xl bg-[#1b4332]/95 hover:bg-[#2d6a4f] border border-[#ffd166]/65 text-[#ffd166] font-black text-xs flex items-center gap-1.5 shadow-md pointer-events-auto cursor-pointer active:scale-95 transition-all"
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
            className="px-2.5 py-1.5 rounded-xl bg-[#3b1c24]/95 hover:bg-[#592633] border border-[#ff6b6b]/70 text-[#ffccd5] font-black text-xs flex items-center gap-1.5 shadow-md pointer-events-auto cursor-pointer active:scale-95 transition-all"
          >
            <LogOut className="w-4 h-4 text-[#ff6b6b] shrink-0" />
            <span>{isFa ? 'خروج' : 'Exit'}</span>
          </button>
        </div>
      </div>

      {/* Middle Contextual Prompt (Only when standing right next to a Shrine or inside Safe Zone) */}
      <div className="flex flex-col items-center gap-1.5 my-auto pointer-events-none">
        {isNearShrine ? (
          <div
            dir={isFa ? 'rtl' : 'ltr'}
            className="bg-[#2d5029]/95 border-2 border-[#ffd166] px-3.5 py-1.5 rounded-2xl shadow-xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#ffd166] shrink-0" />
            <span className="text-xs font-bold text-[#fffdf0] tracking-wide">
              {localizeShrinePrompt(nearShrinePrompt, lang)}
            </span>
          </div>
        ) : isInsideSafeZone ? (
          <button
            type="button"
            dir={isFa ? 'rtl' : 'ltr'}
            onClick={() => onOpenCustomize('home')}
            className="bg-[#1b4332]/90 hover:bg-[#2d6a4f] border border-[#95d5b2]/70 px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 pointer-events-auto cursor-pointer active:scale-95 transition-transform"
          >
            <Home className="w-3.5 h-3.5 text-[#ffd166] shrink-0" />
            <span className="text-[11px] font-bold text-[#d8f3dc]">
              {isFa ? 'پناهگاه امن · تزئین کلبه' : 'Safe Zone · Decorate Base'}
            </span>
          </button>
        ) : null}
      </div>

      {/* Bottom Area: Only Combo Pop & On-Demand Collapsible Story Popover */}
      <div className="flex flex-col items-center gap-1.5 w-full px-2">
        {player.comboCount > 1 && (
          <div className="bg-[#ffb703]/95 text-[#370617] px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase border border-white/60 shadow-lg">
            {isFa ? `ضربه زنجیره‌ای ×${player.comboCount}!` : `Combo x${player.comboCount}!`}
          </div>
        )}

        {showStoryPopover && (currentStoryBeat || storyHistory.length > 0) && (
          <div
            dir={isFa ? 'rtl' : 'ltr'}
            data-testid="in-game-story-banner"
            onPointerDown={(e) => e.stopPropagation()}
            className={`w-full max-w-md bg-[#0d2116]/95 border-2 border-[#ffd166]/85 rounded-2xl p-3 shadow-2xl pointer-events-auto flex flex-col gap-1.5 ${
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
                      <span className="text-sm shrink-0">🦉</span>
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
                      className="px-2.5 py-1 rounded-xl bg-[#ffd166] hover:bg-[#ffea79] text-[#081c15] text-[11px] font-black flex items-center gap-1 cursor-pointer shrink-0 shadow-md"
                    >
                      <span>{isFa ? 'بستن' : 'Close'}</span>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-[#f4fbf1] font-medium leading-relaxed">
                    {isFa ? beat.textFa : beat.textEn}
                  </p>

                  <div className="text-[11px] text-[#80ffdb] font-bold flex items-center gap-1.5 pt-1 border-t border-[#2d6a4f]/80">
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
          className="fixed inset-0 z-50 bg-[#081c15]/85 flex items-center justify-center p-3 sm:p-4 pointer-events-auto"
        >
          <div className="w-full max-w-md max-h-[88dvh] overflow-y-auto bg-[#1b4332] border-2 border-[#ffd166] rounded-3xl p-4 sm:p-5 shadow-2xl text-[#e9f5db] flex flex-col gap-3">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2d6a4f] pb-2.5">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#ffd166]" />
                <h3 className="text-base sm:text-lg font-black text-[#ffd166]">
                  {isFa ? 'تنظیمات و امکانات بازی' : 'Game Settings & Controls'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                aria-label="Close Settings"
                className="w-8 h-8 rounded-xl bg-[#2d6a4f] hover:bg-[#40916c] flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Row: Sound & Language */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onToggleMute}
                className="p-2.5 rounded-2xl bg-[#0f281e] hover:bg-[#2d6a4f] border border-[#52b788]/50 flex items-center justify-center gap-2 text-xs font-black cursor-pointer"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-red-300 shrink-0" />
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
                className="p-2.5 rounded-2xl bg-[#0f281e] hover:bg-[#2d6a4f] border border-[#52b788]/50 flex items-center justify-center gap-2 text-xs font-black text-[#ffd166] cursor-pointer"
              >
                <Languages className="w-4 h-4 text-[#48cae4] shrink-0" />
                <span>{isFa ? 'زبان: پارسی (EN)' : 'Lang: English (فا)'}</span>
              </button>
            </div>

            {/* Graphics Quality Selector (Eco / Balanced / Ultra) */}
            {onSetPerformanceQuality && (
              <div className="bg-[#0f281e] p-3 rounded-2xl border border-[#2d6a4f] flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#95d5b2]">
                  <Gauge className="w-4 h-4 text-[#ffd166]" />
                  <span>
                    {isFa
                      ? 'کیفیت گرافیک و بهینه‌سازی موبایل:'
                      : 'Graphics & Mobile Performance:'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'eco', labelFa: 'اقتصادی (موبایل)', labelEn: 'Eco (Mobile)' },
                      { id: 'balanced', labelFa: 'متعادل', labelEn: 'Balanced' },
                      { id: 'ultra', labelFa: 'فوق‌العاده', labelEn: 'Ultra 3D' },
                    ] as const
                  ).map((tier) => {
                    const active = performanceQuality === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => onSetPerformanceQuality(tier.id)}
                        className={`py-2 px-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                          active
                            ? 'bg-[#ffd166] text-[#081c15] border-white shadow-sm'
                            : 'bg-[#1b4332] hover:bg-[#2d6a4f] text-[#d8f3dc] border-[#52b788]/40'
                        }`}
                      >
                        {isFa ? tier.labelFa : tier.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Customization & World Controls (Moved from cluttered top-right HUD into Settings) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  onOpenCustomize('hero');
                }}
                className="p-2.5 rounded-2xl bg-[#0f281e] hover:bg-[#2d6a4f] border border-[#52b788]/50 flex items-center gap-2 text-xs font-bold text-[#e9f5db] cursor-pointer"
              >
                <User className="w-4 h-4 text-[#80b918] shrink-0" />
                <span>{isFa ? 'شخصی‌سازی ظاهر قهرمان' : 'Customize Hero'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  onOpenCustomize('home');
                }}
                className="p-2.5 rounded-2xl bg-[#0f281e] hover:bg-[#2d6a4f] border border-[#52b788]/50 flex items-center gap-2 text-xs font-bold text-[#e9f5db] cursor-pointer"
              >
                <Home className="w-4 h-4 text-[#ffd166] shrink-0" />
                <span>{isFa ? 'تزئین کلبه و تندیس‌ها' : 'Sanctuary & Trophies'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  onOpenCustomize('atmosphere');
                }}
                className="p-2.5 rounded-2xl bg-[#0f281e] hover:bg-[#2d6a4f] border border-[#52b788]/50 flex items-center gap-2 text-xs font-bold text-[#d8f3dc] cursor-pointer"
              >
                <CloudSun className="w-4 h-4 text-[#48cae4] shrink-0" />
                <span>
                  {isFa
                    ? `آب‌وهوا (${ TIME_PHASE_LABELS[lang][timePhase] } · ${ WEATHER_SHORT_LABELS[lang][weather] })`
                    : `Weather (${ TIME_PHASE_LABELS[lang][timePhase] })`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowStageGuideModal(true);
                }}
                className="p-2.5 rounded-2xl bg-[#0f281e] hover:bg-[#2d6a4f] border border-[#ffd166]/50 flex items-center gap-2 text-xs font-bold text-[#ffd166] cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#ffd166] shrink-0" />
                <span>{isFa ? 'راهنمای مرحله و تغییر فصل' : 'Stage Guide & Switcher'}</span>
              </button>
            </div>

            {/* Online Rewarded Seeds & APK Settings */}
            <div className="flex flex-wrap items-center gap-2">
              {isOnline && (
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    handleRewardedBlessing();
                  }}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-[#ffd166] hover:bg-[#ffe08a] text-[#081c15] font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Gift className="w-4 h-4 shrink-0" />
                  <span>{isFa ? 'دریافت +۳ بذر رایگان' : 'Get +3 Free Sun-Seeds'}</span>
                </button>
              )}

              {onOpenAdMobAndApk && (
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    onOpenAdMobAndApk();
                  }}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-[#0f281e] hover:bg-[#2d6a4f] border border-[#ffd166]/40 text-[#ffd166] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>{isFa ? 'تنظیمات اندروید و تبلیغات' : 'APK & Ads Setup'}</span>
                </button>
              )}
            </div>

            {/* Bottom Actions: Pause Menu, Exit to Title, or Resume */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#2d6a4f]">
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  onPause();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-[#2d6a4f] hover:bg-[#40916c] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>{isFa ? 'توقف کامل بازی' : 'Pause Screen'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  onExitToTitle();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-[#3b1c24] hover:bg-[#592633] border border-[#ff6b6b]/70 text-[#ffccd5] font-black text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-[#ff6b6b]" />
                <span>{isFa ? 'خروج به منوی اصلی' : 'Exit to Main Menu'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#80b918] hover:bg-[#9ef01a] text-[#081c15] font-black text-xs cursor-pointer"
              >
                {isFa ? 'ادامه بازی' : 'Resume'}
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
          className="fixed inset-0 z-50 bg-[#081c15]/85 flex items-center justify-center p-4 pointer-events-auto"
        >
          <div className="w-full max-w-sm bg-[#1b4332] border-2 border-[#ff6b6b] rounded-3xl p-5 shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3b1c24] border border-[#ff6b6b]/70 flex items-center justify-center">
              <LogOut className="w-6 h-6 text-[#ff6b6b]" />
            </div>

            <h3 className="text-base sm:text-lg font-black text-[#fff0f3]">
              {isFa ? 'خروج به صفحه اصلی بازی؟' : 'Exit to Main Title Screen?'}
            </h3>
            <p className="text-xs text-[#d8f3dc] leading-relaxed">
              {isFa
                ? 'پیشرفت فصل و تندیس‌های شما ذخیره شده است. آیا می‌خواهید از این مرحله خارج شوید و به منوی اصلی برگردید؟'
                : 'Your chapter progress and trophies are saved. Return to the main title screen?'}
            </p>

            <div className="w-full flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                data-testid="confirm-exit-to-title-btn"
                onClick={() => {
                  setShowExitConfirmModal(false);
                  onExitToTitle();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#e63946] hover:bg-[#ff4d5a] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{isFa ? 'بله، خروج به منوی اصلی' : 'Yes, Exit to Menu'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExitConfirmModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#2d6a4f] hover:bg-[#40916c] text-[#e9f5db] font-black text-xs cursor-pointer"
              >
                {isFa ? 'انصراف و ادامه بازی' : 'Cancel & Resume'}
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
          className="fixed inset-0 z-50 bg-[#081c15]/85 flex items-center justify-center p-4 pointer-events-auto"
        >
          <div className="w-full max-w-lg max-h-[84vh] overflow-y-auto bg-[#1b4332] border-2 border-[#ffd166] rounded-3xl p-5 shadow-2xl text-[#e9f5db] flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-[#2d6a4f] pb-2.5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#ffd166]">
                  {isFa
                    ? `راهنمای مرحله و داستان — ${localizedChapter.title}`
                    : `Stage & Story Guide — ${localizedChapter.title}`}
                </h3>
                <p className="text-xs text-[#95d5b2]">{localizedChapter.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowStageGuideModal(false)}
                aria-label="Close Stage Guide"
                className="w-8 h-8 rounded-xl bg-[#2d6a4f] hover:bg-[#40916c] flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stage Objective Details */}
            <div className="bg-[#0f281e] p-3.5 rounded-2xl border border-[#52b788]/50 flex flex-col gap-2">
              <span className="text-xs font-black text-[#ffd166]">
                {isFa
                  ? `هدف اختصاصی این مرحله (${modeBadgeLabel}):`
                  : `Unique Stage Mission (${modeBadgeLabel}):`}
              </span>

              <div className="flex items-center justify-between text-xs bg-[#1b4332] p-2.5 rounded-xl border border-[#2d6a4f]">
                <span>{isFa ? stageObjective.headlineFa : stageObjective.headlineEn}</span>
                <span className="font-black text-[#06d6a0] tabular-nums">
                  {stageObjective.progressPercent}%
                </span>
              </div>

              <div className="text-xs bg-[#1b4332] p-2.5 rounded-xl border border-[#2d6a4f] text-[#f4fbf1] leading-relaxed">
                {isFa ? stageObjective.sublineFa : stageObjective.sublineEn}
              </div>

              {missionState.mode === 'boss_duel' && (
                <div className="flex items-center gap-2 text-xs text-[#ffd166] pt-1">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    {isFa
                      ? `جان غول امپراتور: ${Math.ceil(bossHp)} / ${bossMaxHp}`
                      : `Emperor Boss HP: ${Math.ceil(bossHp)} / ${bossMaxHp}`}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Stage Biome & Mission Mode Explorer */}
            {onJumpToChapter && (
              <div className="bg-[#0f281e] p-3.5 rounded-2xl border border-[#ffd166]/40 flex flex-col gap-2">
                <span className="text-xs font-black text-[#ffd166]">
                  {isFa
                    ? 'انتخاب مستقیم مراحل (۵ سبک گیم‌پلی و نقشه سه‌بعدی متفاوت):'
                    : 'Switch Stage Directly (5 Distinct Gameplay Modes & 3D Maps):'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {[
                    {
                      chNum: 1,
                      modeFa: 'نجات و هدایت جوانه‌ها به کلبه',
                      modeEn: 'Critter Rescue & Escort',
                    },
                    {
                      chNum: 2,
                      modeFa: 'پازل زنگوله‌ها و پل‌های نوری',
                      modeEn: 'Harmonic Bells & Light Bridges',
                    },
                    {
                      chNum: 3,
                      modeFa: 'دفاع از درخت قلب کهربایی',
                      modeEn: 'Heart-Tree Wave Defense',
                    },
                    {
                      chNum: 4,
                      modeFa: 'مسابقه شهاب‌باران زمان‌دار',
                      modeEn: 'Falling Starlight Meteor Rush',
                    },
                    {
                      chNum: 5,
                      modeFa: 'نبرد غول امپراتور در میدان رزونانس',
                      modeEn: 'Celestial Boss Arena Duel',
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
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex flex-col items-start gap-0.5 border transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#ffd166] text-[#081c15] border-white shadow-md'
                            : 'bg-[#1b4332] hover:bg-[#2d6a4f] text-[#e9f5db] border-[#52b788]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>
                            {isFa ? `مرحله ${chNum}: ${b.nameFa}` : `Stage ${chNum}: ${b.nameEn}`}
                          </span>
                          {isCurrent && <span className="text-[10px] font-black">★</span>}
                        </div>
                        <span
                          className={`text-[10px] font-medium ${
                            isCurrent ? 'text-[#1b4332]' : 'text-[#80ffdb]'
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
            <div className="bg-[#0f281e] p-3.5 rounded-2xl border border-[#2d6a4f] flex flex-col gap-2">
              <span className="text-xs font-black text-[#80ffdb]">
                {isFa ? 'روایت‌های ثبت‌شده در این فصل:' : 'Chapter Story Chronicle:'}
              </span>
              {storyHistory.map((beat) => (
                <div
                  key={beat.id}
                  className="bg-[#1b4332]/80 p-2.5 rounded-xl border border-[#2d6a4f] text-xs"
                >
                  <div className="font-black text-[#ffd166] mb-0.5">
                    {isFa ? beat.speakerFa : beat.speakerEn}
                  </div>
                  <p className="text-[#f4fbf1] leading-relaxed">
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
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ffd166] to-[#f4a261] text-[#081c15] font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <FastForward className="w-4 h-4" />
                <span>
                  {isFa
                    ? `رفتن مستقیم به مرحله بعد (فصل ${chapterInfo.chapterNumber + 1})`
                    : `Jump to Next Stage (Chapter ${chapterInfo.chapterNumber + 1})`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowStageGuideModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#52b788] text-[#081c15] font-black text-xs cursor-pointer"
              >
                {isFa ? 'ادامه بازی' : 'Resume Playing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

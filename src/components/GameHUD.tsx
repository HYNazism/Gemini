/**
 * World-matched, low-occlusion Playing HUD (Persian & English).
 * >= 85% playfield unobstructed, zero backdrop-filter, tabular-nums.
 * Includes:
 * - Step-by-Step Stage Progression Tracker & Boss HP Bar (explaining how to advance to next stage)
 * - Live In-Game Story & Narrative Banner (telling the woodland story during active gameplay)
 * - Weather/Time indicator, Sanctuary Safe-Zone banner, and Geo-Routed Rewarded Ad button.
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
  BookOpen,
  FastForward,
  X,
} from 'lucide-react';
import type { HUDData } from '../game/engine';
import { admob } from '../game/admob';
import {
  computeResponsiveHudProfile,
  getStageBiomeTheme,
  type ResponsiveHudProfile,
} from '../game/rules';
import {
  WEATHER_SHORT_LABELS,
  TIME_PHASE_LABELS,
  localizeShrinePrompt,
  localizeDailyQuest,
  getLocalizedChapterInfo,
  type Language,
} from '../game/i18n';

interface GameHUDProps {
  data: HUDData;
  onPause: () => void;
  onToggleMute: () => void;
  onOpenCustomize: (tab: 'hero' | 'home' | 'atmosphere') => void;
  onOpenDailyQuests: () => void;
  onClaimDailyQuest: (questId: string) => void;
  onGrantRewardedSeeds: () => void;
  onDismissStoryBeat: () => void;
  onAdvanceChapter: () => void;
  onJumpToChapter?: (chapterNumber: number) => void;
  lang: Language;
  onToggleLang: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  data,
  onPause,
  onToggleMute,
  onOpenCustomize,
  onOpenDailyQuests,
  onClaimDailyQuest,
  onGrantRewardedSeeds,
  onDismissStoryBeat,
  onAdvanceChapter,
  onJumpToChapter,
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
    bossCleansed,
    stageObjective,
    currentStoryBeat,
    storyHistory,
    dailyQuests,
  } = data;

  const isFa = lang === 'fa';
  const [isOnline, setIsOnline] = useState<boolean>(() => admob.isOnline());
  const [showStageGuideModal, setShowStageGuideModal] = useState(false);
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
  const featuredQuest =
    unclaimedQuest || dailyQuests.find((q) => !q.completed) || dailyQuests[0];
  const featuredQuestLoc = featuredQuest ? localizeDailyQuest(featuredQuest, lang) : null;
  const localizedChapter = getLocalizedChapterInfo(chapterInfo.chapterNumber, lang);
  const bossHpPercent = bossMaxHp > 0 ? Math.max(0, Math.min(100, (bossHp / bossMaxHp) * 100)) : 0;
  const isCompact = hudProfile.tier === 'compact-mobile';

  return (
    <div
      style={{ fontSize: `${Math.round(hudProfile.uiFontScale * 100)}%` }}
      className={`absolute inset-0 pointer-events-none z-30 flex flex-col justify-between ${
        isCompact ? 'p-2' : 'p-3 sm:p-4'
      } select-none`}
    >
      {/* Top Bar: Corner Clusters + Center Stage Progression Tracker */}
      <div className="flex flex-wrap items-start justify-between w-full gap-1.5 sm:gap-2">
        {/* Top-Left Cluster: Vitality Leaf Pips, Seeds, Shrines, Chapter & Compact Daily Quests Tracker */}
        <div className="flex flex-col gap-1">
          {/* Health Leaves Socket + Chapter Guide Trigger */}
          <div className="flex items-center gap-1 bg-[#1b4332]/90 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-2xl border border-[#709775]/60 shadow-md">
            <span className="text-[10px] font-black text-[#95d5b2] uppercase tracking-wider mr-0.5">
              {isFa ? 'جان' : 'HP'}
            </span>
            {Array.from({ length: player.maxHp }).map((_, i) => {
              const isFull = i < player.hp;
              return (
                <div key={i} className={`${isCompact ? 'w-4 h-4' : 'w-4.5 h-4.5 sm:w-5 sm:h-5'} flex items-center justify-center`}>
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
            <button
              type="button"
              onClick={() => setShowStageGuideModal(true)}
              aria-label="Open Stage Progression and Story Guide"
              className="ml-1.5 px-2 py-0.5 rounded-lg bg-[#ffd166]/20 hover:bg-[#ffd166]/35 border border-[#ffd166]/50 text-[10px] font-black text-[#ffd166] flex items-center gap-1 pointer-events-auto cursor-pointer"
            >
              <BookOpen className="w-3 h-3" />
              <span>{isFa ? `فصل ${chapterInfo.chapterNumber} (راهنما)` : `Ch.${chapterInfo.chapterNumber} Guide`}</span>
            </button>
          </div>

          {/* Seeds, Shrines & Boss Status Cluster */}
          <div className="flex items-center gap-2.5 bg-[#1b4332]/90 px-3 py-1.5 rounded-2xl border border-[#709775]/60 shadow-md">
            <div className="flex items-center gap-1">
              <Sun className="w-4 h-4 text-[#ffd166]" />
              <span className="text-sm font-black text-[#ffd166] tabular-nums">
                {player.sunSeeds}
              </span>
              <span className="text-[10px] font-bold text-[#d8f3dc]/85">
                {isFa ? 'بذر' : 'Seeds'}
              </span>
            </div>

            <div className="w-[1px] h-3.5 bg-[#709775]/40" />

            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#06d6a0]" />
              <span className="text-sm font-black text-[#06d6a0] tabular-nums">
                {restoredShrines}/{totalShrines}
              </span>
              <span className="text-[10px] font-bold text-[#d8f3dc]/85">
                {isFa ? 'نیایشگاه' : 'Shrines'}
              </span>
            </div>

            <div className="w-[1px] h-3.5 bg-[#709775]/40" />

            <div className="flex items-center gap-1">
              {stageObjective.bossShieldActive ? (
                <ShieldAlert className="w-3.5 h-3.5 text-[#c77dff]" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-[#ffd166]" />
              )}
              <span className="text-[10px] font-bold text-[#e9f5db] tabular-nums">
                {isFa
                  ? `غول: ${Math.ceil(bossHp)}/${bossMaxHp}`
                  : `Boss: ${Math.ceil(bossHp)}/${bossMaxHp}`}
              </span>
            </div>
          </div>

          {/* Compact Daily Quests Live Tracker Button */}
          {featuredQuest && featuredQuestLoc && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenDailyQuests}
                aria-label="Open Daily Quests Board"
                className="bg-[#1b4332]/90 hover:bg-[#2d6a4f] px-3 py-1.5 rounded-2xl border border-[#709775]/60 shadow-md flex items-center gap-2 text-left pointer-events-auto cursor-pointer"
              >
                <ScrollText className="w-3.5 h-3.5 text-[#ffd166] shrink-0" />
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="font-bold text-[#f4fbf1] truncate max-w-[135px] sm:max-w-[180px]">
                    {featuredQuestLoc.title}
                  </span>
                  <span className="font-black text-[#ffd166] tabular-nums">
                    ({featuredQuest.progress}/{featuredQuest.target})
                  </span>
                  <span className="text-[10px] text-[#95d5b2] font-bold tabular-nums">
                    · {completedQuestsCount}/{dailyQuests.length}
                  </span>
                </div>
              </button>

              {unclaimedQuest && (
                <button
                  type="button"
                  onClick={() => onClaimDailyQuest(unclaimedQuest.id)}
                  aria-label="Claim Completed Daily Quest Reward"
                  className="bg-[#ffd166] hover:bg-[#ffe08a] text-[#081c15] px-2.5 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1 shadow-md pointer-events-auto cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isFa ? 'دریافت پاداش' : 'Claim!'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Center-Top: Live Stage Progression & Objective Compass Banner */}
        <div
          dir={isFa ? 'rtl' : 'ltr'}
          data-testid="stage-progression-banner"
          className="order-3 lg:order-2 w-full lg:w-auto lg:max-w-md bg-[#0f281e]/92 border border-[#52b788]/70 rounded-2xl px-3.5 py-2 shadow-xl flex flex-col gap-1 pointer-events-auto"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#ffd166] shrink-0" />
              <span className="text-[11px] sm:text-xs font-black text-[#ffd166]">
                {isFa ? stageObjective.headlineFa : stageObjective.headlineEn}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-[#06d6a0] tabular-nums">
                {stageObjective.progressPercent}%
              </span>
              <button
                type="button"
                onClick={() => setShowStageGuideModal(true)}
                className="px-2 py-0.5 rounded-md bg-[#2d6a4f] hover:bg-[#40916c] text-[10px] font-bold text-[#f4fbf1] cursor-pointer"
              >
                {isFa ? 'چطور برم مرحله بعد؟' : 'Stage Info'}
              </button>
            </div>
          </div>

          {/* Stage Progress + Boss HP Bar */}
          <div className="w-full h-1.5 bg-[#1b4332] rounded-full overflow-hidden flex">
            <div
              className="h-full bg-[#ffd166] transition-all duration-300"
              style={{ width: `${Math.min(65, (restoredShrines / Math.max(1, totalShrines)) * 65)}%` }}
            />
            <div
              className="h-full bg-[#06d6a0] transition-all duration-300"
              style={{ width: `${Math.max(0, ((100 - bossHpPercent) / 100) * 35)}%` }}
            />
          </div>

          <p className="text-[10px] sm:text-[11px] text-[#d8f3dc] font-medium leading-snug">
            {isFa ? stageObjective.sublineFa : stageObjective.sublineEn}
          </p>
        </div>

        {/* Top-Right Cluster: Weather/Time, Online-Only Ad Blessing, Score & Utility */}
        <div className="order-2 lg:order-3 flex flex-wrap items-center justify-end gap-1.5">
          {isOnline && (() => {
            const activeProvider = admob.getRoutingResolution().activeProvider;
            const providerShort =
              activeProvider === 'tapsell'
                ? isFa
                  ? 'تپسل'
                  : 'Tapsell'
                : activeProvider === 'yektanet'
                ? isFa
                  ? 'یکتانت'
                  : 'Yektanet'
                : 'AdMob';
            return (
              <button
                type="button"
                onClick={handleRewardedBlessing}
                aria-label="Watch Rewarded Ad for 3 Sun-Seeds"
                className="bg-[#ffd166] hover:bg-[#ffe08a] text-[#081c15] px-2.5 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1 shadow-md pointer-events-auto cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>{isFa ? `+۳ بذر (${providerShort})` : `+3 Seeds (${providerShort})`}</span>
              </button>
            );
          })()}

          <button
            type="button"
            onClick={() => onOpenCustomize('atmosphere')}
            aria-label="Open Weather and Day-Night Settings"
            className="bg-[#1b4332]/90 hover:bg-[#2d6a4f] px-2.5 py-1.5 rounded-xl border border-[#709775]/60 shadow-md flex items-center gap-1.5 text-[11px] font-bold text-[#d8f3dc] pointer-events-auto cursor-pointer"
          >
            <CloudSun className="w-3.5 h-3.5 text-[#48cae4]" />
            <span>
              {TIME_PHASE_LABELS[lang][timePhase]} · {WEATHER_SHORT_LABELS[lang][weather]}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onOpenCustomize('hero')}
            aria-label="Customize Hero Appearance"
            className="w-9 h-9 rounded-xl bg-[#1b4332]/90 border border-[#709775]/60 text-[#e9f5db] flex items-center justify-center hover:bg-[#2d6a4f] shadow-md pointer-events-auto cursor-pointer"
          >
            <User className="w-4 h-4 text-[#80b918]" />
          </button>

          <button
            type="button"
            onClick={onToggleLang}
            aria-label="Switch Language"
            className="px-2.5 h-9 rounded-xl bg-[#1b4332]/90 border border-[#709775]/60 text-[#ffd166] text-[11px] font-black flex items-center gap-1 hover:bg-[#2d6a4f] shadow-md pointer-events-auto cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{isFa ? 'EN' : 'فا'}</span>
          </button>

          <div className="bg-[#1b4332]/90 px-3 py-1.5 rounded-xl border border-[#709775]/60 shadow-md flex items-baseline gap-1">
            <span className="text-[10px] font-bold text-[#95d5b2]">
              {isFa ? 'امتیاز' : 'SCORE'}
            </span>
            <span className="text-sm font-black text-[#f4fbf1] tabular-nums">{player.score}</span>
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute game' : 'Mute game'}
            className="w-9 h-9 rounded-xl bg-[#1b4332]/90 border border-[#709775]/60 text-[#e9f5db] flex items-center justify-center hover:bg-[#2d6a4f] active:scale-95 transition-all shadow-md pointer-events-auto cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-300" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#ffd166]" />
            )}
          </button>

          <button
            type="button"
            onClick={onPause}
            aria-label="Pause game"
            className="w-9 h-9 rounded-xl bg-[#1b4332]/90 border border-[#709775]/60 text-[#e9f5db] flex items-center justify-center hover:bg-[#2d6a4f] active:scale-95 transition-all shadow-md pointer-events-auto cursor-pointer"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle-Top Contextual Prompt OR Live In-Game Story Dialogue Toast */}
      <div className="flex flex-col items-center gap-2 my-auto pointer-events-none">
        {isNearShrine ? (
          <div
            dir={isFa ? 'rtl' : 'ltr'}
            className="bg-[#2d5029]/95 border-2 border-[#ffd166] px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#ffd166] shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-[#fffdf0] tracking-wide">
              {localizeShrinePrompt(nearShrinePrompt, lang)}
            </span>
          </div>
        ) : isInsideSafeZone ? (
          <button
            type="button"
            dir={isFa ? 'rtl' : 'ltr'}
            onClick={() => onOpenCustomize('home')}
            className="bg-[#1b4332]/90 hover:bg-[#2d6a4f] border border-[#95d5b2]/70 px-4 py-1.5 rounded-2xl shadow-xl flex items-center gap-2 pointer-events-auto cursor-pointer"
          >
            <Home className="w-4 h-4 text-[#ffd166] shrink-0" />
            <span className="text-xs font-bold text-[#d8f3dc]">
              {isFa
                ? 'پناهگاه امن (درمان خودکار) · برای تزئین کلبه و تندیس‌ها لمس کنید'
                : 'Sanctuary Safe Zone (Healing) · Tap to Decorate Base & Trophies'}
            </span>
          </button>
        ) : null}
      </div>

      {/* Bottom-Center: Live In-Game Story Narrative Box + Combo Pop (Elevated above bottom touch pads) */}
      <div className="flex flex-col items-center gap-1.5 w-full px-2">
        {player.comboCount > 1 && (
          <div className="bg-[#ffb703]/95 text-[#370617] px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase border border-white/60 shadow-lg">
            {isFa ? `ضربه زنجیره‌ای ×${player.comboCount}!` : `Combo x${player.comboCount}!`}
          </div>
        )}

        {currentStoryBeat && (
          <div
            dir={isFa ? 'rtl' : 'ltr'}
            data-testid="in-game-story-banner"
            onPointerDown={(e) => e.stopPropagation()}
            className={`w-full max-w-md sm:max-w-xl bg-[#0d2116]/95 border-2 border-[#ffd166]/85 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl pointer-events-auto flex flex-col gap-1.5 ${
              hudProfile.isPortrait ? 'mb-32' : 'mb-24 sm:mb-3'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm sm:text-base shrink-0">🦉</span>
                <span className="text-[11px] sm:text-xs font-black text-[#ffd166] truncate">
                  {isFa ? currentStoryBeat.speakerFa : currentStoryBeat.speakerEn}
                </span>
                <span className="text-[10px] text-[#95d5b2] font-bold shrink-0">
                  · {isFa ? `داستان (${currentStoryBeat.stepIndex}/${currentStoryBeat.totalSteps})` : `Story (${currentStoryBeat.stepIndex}/${currentStoryBeat.totalSteps})`}
                </span>
              </div>
              <button
                type="button"
                data-testid="dismiss-story-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismissStoryBeat();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="Dismiss Story Dialogue"
                className="px-2.5 py-1 rounded-xl bg-[#ffd166] hover:bg-[#ffea79] text-[#081c15] text-[10px] sm:text-xs font-black flex items-center gap-1 cursor-pointer shrink-0 shadow-md active:scale-95 transition-transform"
              >
                <span>{isFa ? 'بستن پیام' : 'Got it'}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] sm:text-sm text-[#f4fbf1] font-medium leading-relaxed">
              {isFa ? currentStoryBeat.textFa : currentStoryBeat.textEn}
            </p>

            <div className="text-[10px] sm:text-[11px] text-[#80ffdb] font-bold flex items-center gap-1.5 pt-0.5 border-t border-[#2d6a4f]/80">
              <Compass className="w-3.5 h-3.5 text-[#ffd166] shrink-0" />
              <span>{isFa ? currentStoryBeat.hintFa : currentStoryBeat.hintEn}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stage Progression & Story Log Modal (Explains how to advance to next stage + Direct Chapter Jump) */}
      {showStageGuideModal && (
        <div
          role="dialog"
          dir={isFa ? 'rtl' : 'ltr'}
          aria-label="Stage Progression Guide and Story Chronicle"
          className="fixed inset-0 z-50 bg-[#081c15]/85 flex items-center justify-center p-4 pointer-events-auto"
        >
          <div className="w-full max-w-lg max-h-[82vh] overflow-y-auto bg-[#1b4332] border-2 border-[#ffd166] rounded-3xl p-5 shadow-2xl text-[#e9f5db] flex flex-col gap-3.5">
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

            {/* How to go to next stage */}
            <div className="bg-[#0f281e] p-3.5 rounded-2xl border border-[#52b788]/50 flex flex-col gap-2">
              <span className="text-xs font-black text-[#ffd166]">
                {isFa
                  ? 'چگونه این مرحله را تمام کنیم و به فصل بعد برویم؟'
                  : 'How to Complete This Stage & Advance to Next Chapter:'}
              </span>

              <div className="flex items-center justify-between text-xs bg-[#1b4332] p-2.5 rounded-xl border border-[#2d6a4f]">
                <span>
                  {isFa
                    ? `۱. جمع‌آوری بذر خورشید و احیای ۴ نیایشگاه باستانی (کلید E)`
                    : `1. Gather Sun-Seeds & Restore 4 Ancient Shrines [E]`}
                </span>
                <span className="font-black text-[#06d6a0] tabular-nums">
                  {restoredShrines} / {totalShrines}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs bg-[#1b4332] p-2.5 rounded-xl border border-[#2d6a4f]">
                <span>
                  {isFa
                    ? `۲. شکستن سپر و پاکسازی غول خاردار مرکزی در وسط نقشه (Space / Q)`
                    : `2. Cleanse the Central Elder Bramble Boss at Map Center [Space / Q]`}
                </span>
                <span className="font-black text-[#ffd166] tabular-nums">
                  {bossCleansed
                    ? isFa
                      ? 'پاکسازی شد ✓'
                      : 'Cleansed ✓'
                    : `${Math.ceil(bossHp)} / ${bossMaxHp} HP`}
                </span>
              </div>

              <p className="text-[11px] text-[#95d5b2] leading-relaxed">
                {isFa
                  ? 'نکته: پیکان طلایی روی زمین (زیر پای پیپ) همیشه جهت دقیق نزدیک‌ترین نیایشگاه خاموش یا غول مرکزی را به شما نشان می‌دهد!'
                  : 'Tip: The golden compass arrow at Pip’s feet always points directly toward the next unrestored Shrine or the Central Boss!'}
              </p>
            </div>

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

            {/* Quick Stage Biome Explorer (5 Distinct Biomes) */}
            {onJumpToChapter && (
              <div className="bg-[#0f281e] p-3.5 rounded-2xl border border-[#ffd166]/40 flex flex-col gap-2">
                <span className="text-xs font-black text-[#ffd166]">
                  {isFa
                    ? 'انتخاب مستقیم مراحل و زیست‌بوم‌های متنوع:'
                    : 'Explore Distinct Stage Biomes Directly:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {[1, 2, 3, 4, 5].map((chNum) => {
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
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#ffd166] text-[#081c15] border-white shadow-md'
                            : 'bg-[#1b4332] hover:bg-[#2d6a4f] text-[#e9f5db] border-[#52b788]/40'
                        }`}
                      >
                        <span>
                          {isFa ? `فصل ${chNum}: ${b.nameFa}` : `Stage ${chNum}: ${b.nameEn}`}
                        </span>
                        {isCurrent && <span className="text-[10px] font-black">★</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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

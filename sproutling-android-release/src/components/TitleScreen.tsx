/**
 * Bespoke High-Fantasy ARPG Title Screen (Persian & English) for
 * Aethelgard: Warden of the Astral Grove.
 * Features custom inline Astral Shield SVG emblem, Chapter Story Chronicle,
 * Start CTA (data-start="true"), Skill Tree & Mythic Armory, 3D Warden Armor Customizer,
 * Citadel Sanctuary Decorator, and APK/AdMob setup.
 */

import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Compass,
  Shield,
  Home,
  Smartphone,
  Languages,
  ScrollText,
  Settings,
  BookOpen,
  Swords,
} from 'lucide-react';
import type { ChapterStoryInfo, DailyQuest } from '../game/rules';
import { getLocalizedChapterInfo, type Language } from '../game/i18n';

interface TitleScreenProps {
  onStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  chapterInfo: ChapterStoryInfo;
  dailyQuests: DailyQuest[];
  onOpenDailyQuests: () => void;
  onOpenCustomizeHero: () => void;
  onOpenMasteryArmory?: () => void;
  onOpenCustomizeHome: () => void;
  onOpenAtmosphereSettings?: () => void;
  onOpenAdMobAndApk: () => void;
  lang: Language;
  onToggleLang: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  isMuted,
  onToggleMute,
  chapterInfo,
  dailyQuests,
  onOpenDailyQuests,
  onOpenCustomizeHero,
  onOpenMasteryArmory,
  onOpenCustomizeHome,
  onOpenAtmosphereSettings,
  onOpenAdMobAndApk,
  lang,
  onToggleLang,
}) => {
  const isFa = lang === 'fa';
  const [showStoryBox, setShowStoryBox] = useState(false);
  const localizedChapter = getLocalizedChapterInfo(chapterInfo.chapterNumber, lang);
  const completedQuestsCount = dailyQuests.filter((q) => q.completed).length;
  const unclaimedQuestsCount = dailyQuests.filter((q) => q.completed && !q.claimed).length;

  return (
    <div
      dir={isFa ? 'rtl' : 'ltr'}
      className="absolute inset-0 z-30 pointer-events-auto flex flex-col justify-between p-4 sm:p-8 select-none"
    >
      {/* Top Bar with Chapter Emblem, Settings, Language switch, APK/AdMob setup, and audio toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-[#0b1520]/92 text-[#f8fafc] px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border border-[#ffd166]/65 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-[#ffd166] shrink-0" />
          <span className="truncate max-w-[140px] sm:max-w-none">{localizedChapter.title}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {onOpenAtmosphereSettings && (
            <button
              type="button"
              onClick={onOpenAtmosphereSettings}
              aria-label={isFa ? 'تنظیمات گرافیک و آب‌وهوا' : 'Graphics & Weather Settings'}
              className="px-3 py-1.5 rounded-full bg-[#0b1520]/92 border border-[#ffd166]/65 text-[#ffd166] text-xs font-black flex items-center gap-1.5 hover:bg-[#16293d] transition-colors shadow-md cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{isFa ? 'تنظیمات' : 'Settings'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleLang}
            aria-label="Switch Language (Persian / English)"
            className="px-2.5 py-1.5 rounded-full bg-[#0b1520]/92 border border-[#38bdf8]/65 text-[#f8fafc] text-xs font-black flex items-center gap-1 hover:bg-[#16293d] transition-colors shadow-md cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>{isFa ? 'EN' : 'فا'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAdMobAndApk}
            aria-label="Open Android APK and Google Play AdMob Setup"
            className="px-2.5 py-1.5 rounded-full bg-[#0b1520]/92 border border-[#ffd166]/60 text-[#ffd166] text-xs font-bold flex items-center gap-1 hover:bg-[#16293d] transition-colors shadow-md cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isFa ? 'خروجی و تبلیغات' : 'Build · AdMob'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute game audio' : 'Mute game audio'}
            className="w-9 h-9 rounded-full bg-[#0b1520]/92 border border-[#475569]/70 text-[#f8fafc] flex items-center justify-center hover:bg-[#16293d] transition-colors shadow-md active:scale-95 cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#ffd166]" />
            )}
          </button>
        </div>
      </div>

      {/* Main High-Fantasy Title Centerpiece */}
      <div className="flex flex-col items-center text-center my-auto max-w-lg mx-auto">
        <div className="w-16 h-16 sm:w-22 sm:h-22 mb-2.5 filter drop-shadow-[0_8px_18px_rgba(8,16,28,0.75)]">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            <circle cx="50" cy="50" r="46" fill="#0b1520" stroke="#ffd166" strokeWidth="4" />
            <polygon
              points="50,12 80,28 72,72 50,88 28,72 20,28"
              fill="#16293d"
              stroke="#38bdf8"
              strokeWidth="3"
            />
            <polygon points="50,20 62,50 50,80 38,50" fill="#38bdf8" />
            <circle cx="50" cy="50" r="9" fill="#ffd166" />
          </svg>
        </div>

        <h1 className="text-[clamp(1.5rem,4.5vw,2.8rem)] font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(8,16,28,0.9)] font-sans leading-tight">
          {isFa ? 'آتلگارد: نگهبان بیشه اختران' : 'AETHELGARD'}
        </h1>
        <p className="text-[clamp(0.75rem,2vw,0.95rem)] font-extrabold tracking-wider text-[#ffd166] mt-1 mb-2 drop-shadow-[0_2px_4px_rgba(8,16,28,0.9)]">
          {isFa
            ? `${chapterInfo.biomeNameFa} · ${localizedChapter.subtitle}`
            : `Warden of the Astral Grove · ${localizedChapter.subtitle}`}
        </p>

        {showStoryBox && (
          <p className="text-xs sm:text-sm text-[#e2e8f0] max-w-md mb-3 leading-relaxed bg-[#0b1520]/94 px-4 py-2.5 rounded-2xl border border-[#ffd166]/65 shadow-xl">
            {localizedChapter.storyParagraph}
          </p>
        )}

        {/* Primary Start CTA with data-start="true" */}
        <button
          data-start="true"
          onClick={onStart}
          aria-label="Start Game"
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#ffd166] via-[#f59e0b] to-[#d97706] hover:from-[#fde047] hover:to-[#f59e0b] text-[#081018] font-black text-[clamp(0.95rem,2.4vw,1.15rem)] tracking-wide rounded-2xl shadow-[0_6px_20px_rgba(217,119,6,0.55)] border-2 border-white/75 transition-all transform hover:-translate-y-0.5 active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Compass className="w-5 h-5 text-[#081018]" />
          <span>
            {isFa
              ? `آغاز نبرد — فصل ${localizedChapter.chapterNumber}`
              : `ENTER REALM — CHAPTER ${localizedChapter.chapterNumber}`}
          </span>
        </button>

        {/* Compact Action Row: Skill Tree & Armory, Warden Armor, Guild Quests, Story, Citadel */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          {onOpenMasteryArmory && (
            <button
              type="button"
              onClick={onOpenMasteryArmory}
              aria-label="Open Skill Tree and Mythic Armory"
              className="px-3 py-1.5 bg-[#1e1b4b]/95 hover:bg-[#312e81] text-[#38bdf8] font-black text-xs rounded-xl border border-[#38bdf8]/75 shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Swords className="w-3.5 h-3.5 text-[#ffd166]" />
              <span>{isFa ? 'درخت مهارت و سلاح' : 'Skills & Armory'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCustomizeHero}
            aria-label="Customize Character"
            className="px-3 py-1.5 bg-[#0b1520]/92 hover:bg-[#16293d] text-[#f8fafc] font-bold text-xs rounded-xl border border-[#ffd166]/60 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>{isFa ? 'زره قهرمان' : 'Warden Armor'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenDailyQuests}
            aria-label="Open Daily Quests"
            className="px-3 py-1.5 bg-[#0b1520]/92 hover:bg-[#16293d] text-[#ffd166] font-black text-xs rounded-xl border border-[#ffd166]/60 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <ScrollText className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>
              {isFa
                ? `پیمان‌ها (${completedQuestsCount}/${dailyQuests.length})`
                : `Contracts (${completedQuestsCount}/${dailyQuests.length})`}
            </span>
            {unclaimedQuestsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#ffd166] animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowStoryBox((prev) => !prev)}
            className="px-3 py-1.5 bg-[#0b1520]/92 hover:bg-[#16293d] text-[#38bdf8] font-bold text-xs rounded-xl border border-[#38bdf8]/55 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isFa ? 'طومار فصل' : 'Chronicle'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenCustomizeHome}
            aria-label="Customize Home Base Sanctuary"
            className="px-3 py-1.5 bg-[#0b1520]/92 hover:bg-[#16293d] text-[#f8fafc] font-bold text-xs rounded-xl border border-[#475569]/70 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>{isFa ? 'دژ اختران' : 'Citadel'}</span>
          </button>
        </div>
      </div>

      {/* Minimal Bottom Hint */}
      <div className="text-center hidden sm:block">
        <p className="text-xs text-[#e2e8f0]/90 font-medium tracking-wide drop-shadow-[0_1px_3px_rgba(8,16,28,0.95)]">
          {isFa
            ? 'حرکت: WASD · کمبو/ضدحمله: Space · سپر دفاعی (Parry): F یا کلیک راست · جاخالی: Shift · ابرنواختر: Q'
            : 'WASD Move · Space 3-Hit Combo / Riposte · F / Right-Click Aegis Parry · Shift Evade · Q Supernova'}
        </p>
      </div>
    </div>
  );
};


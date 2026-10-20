/**
 * Bespoke Title Screen with custom inline SVG title lockup,
 * continuous story chapter banner (Persian / English), Start CTA (data-start="true"),
 * 3D Character Customizer, Home Base Sanctuary Decorator, and APK/AdMob setup.
 */

import React from 'react';
import { Volume2, VolumeX, Sparkles, Compass, User, Home, Smartphone, Languages, ScrollText } from 'lucide-react';
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
  onOpenCustomizeHome: () => void;
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
  onOpenCustomizeHome,
  onOpenAdMobAndApk,
  lang,
  onToggleLang,
}) => {
  const isFa = lang === 'fa';
  const localizedChapter = getLocalizedChapterInfo(chapterInfo.chapterNumber, lang);
  const completedQuestsCount = dailyQuests.filter((q) => q.completed).length;
  const unclaimedQuestsCount = dailyQuests.filter((q) => q.completed && !q.claimed).length;

  return (
    <div
      dir={isFa ? 'rtl' : 'ltr'}
      className="absolute inset-0 z-30 pointer-events-auto flex flex-col justify-between p-5 sm:p-8 select-none"
    >
      {/* Top Bar with cozy chapter badge, Language switch, APK/AdMob setup, and audio toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 bg-[#2d5029]/85 text-[#e9f5db] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide border border-[#709775]/50 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-[#ffd166] shrink-0" />
          <span>{localizedChapter.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleLang}
            aria-label="Switch Language (Persian / English)"
            className="px-3 py-1.5 rounded-full bg-[#1b4332]/90 border border-[#95d5b2]/60 text-[#e9f5db] text-xs font-black flex items-center gap-1.5 hover:bg-[#2d6a4f] transition-colors shadow-md cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>{isFa ? 'EN / انگلیسی' : 'FA / پارسی'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAdMobAndApk}
            aria-label="Open Android APK and Google Play AdMob Setup"
            className="px-3 py-1.5 rounded-full bg-[#1b4332]/90 border border-[#ffd166]/60 text-[#ffd166] text-xs font-bold flex items-center gap-1.5 hover:bg-[#2d6a4f] transition-colors shadow-md cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isFa ? 'خروجی APK و تبلیغات' : 'APK · AdMob'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute game audio' : 'Mute game audio'}
            className="w-9 h-9 rounded-full bg-[#2d5029]/85 border border-[#709775]/50 text-[#e9f5db] flex items-center justify-center hover:bg-[#3d6b38] transition-colors shadow-md active:scale-95 cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-300" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#ffd166]" />
            )}
          </button>
        </div>
      </div>

      {/* Main Title Centerpiece */}
      <div className="flex flex-col items-center text-center my-auto max-w-lg mx-auto">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mb-3 filter drop-shadow-[0_8px_16px_rgba(20,50,20,0.4)]">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            <circle cx="50" cy="50" r="46" fill="#2d5029" stroke="#90be6d" strokeWidth="4" />
            <path
              d="M50 16 C68 28 78 52 50 82 C22 52 32 28 50 16 Z"
              fill="#90be6d"
            />
            <path
              d="M50 16 L50 82"
              stroke="#2d5029"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="50" cy="38" r="8" fill="#ffd166" />
            <circle cx="36" cy="54" r="5" fill="#f4a261" />
            <circle cx="64" cy="54" r="5" fill="#f4a261" />
          </svg>
        </div>

        <h1 className="text-[clamp(1.6rem,4.5vw,3rem)] font-black tracking-tight text-[#f4fbf1] drop-shadow-[0_3px_6px_rgba(15,35,15,0.7)] font-sans leading-tight">
          {isFa ? 'نگهبان جوانه: بیشه جادویی' : 'SPROUTLING'}
        </h1>
        <p className="text-[clamp(0.75rem,2vw,0.95rem)] font-bold tracking-wider text-[#ffd166] mt-1 mb-2 drop-shadow-[0_2px_4px_rgba(15,35,15,0.8)]">
          {isFa
            ? `ماجراجویی سه‌بعدی · ${localizedChapter.subtitle}`
            : `Grove Guardian 3D · ${localizedChapter.subtitle}`}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#2d6a4f] border border-[#ffd166]/50 text-[#ffd166] text-[10px] font-black">
            {isFa ? `اقلیم: ${chapterInfo.biomeNameFa}` : `Biome: ${chapterInfo.biomeNameEn}`}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#1b4332] border border-[#52b788]/50 text-[#d8f3dc] text-[10px] font-bold">
            {isFa
              ? `${chapterInfo.seedsPerShrine} بذر برای هر نیایشگاه · ۶ قلب جان`
              : `${chapterInfo.seedsPerShrine} Seed/Shrine · 6 Hearts`}
          </span>
        </div>

        <p className="text-[clamp(0.72rem,1.9vw,0.875rem)] text-[#d8f3dc] max-w-md mb-4 drop-shadow-[0_2px_4px_rgba(10,25,10,0.9)] leading-relaxed bg-[#1b4332]/85 px-4 py-2.5 rounded-2xl border border-[#709775]/40">
          {localizedChapter.storyParagraph}
        </p>

        {/* Primary Start CTA with data-start="true" */}
        <button
          data-start="true"
          onClick={onStart}
          aria-label="Start Game"
          className="w-full sm:w-auto px-9 py-3 bg-gradient-to-b from-[#80b918] to-[#55a630] hover:from-[#9ef01a] hover:to-[#70e000] text-[#0d2818] font-black text-[clamp(0.95rem,2.4vw,1.15rem)] tracking-wide rounded-2xl shadow-[0_6px_20px_rgba(43,84,30,0.6)] border-2 border-[#d8f3dc]/60 transition-all transform hover:-translate-y-0.5 active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Compass className="w-5 h-5 text-[#0d2818]" />
          <span>
            {isFa
              ? `ورود به فصل ${localizedChapter.chapterNumber} (${chapterInfo.biomeNameFa})`
              : `ENTER CHAPTER ${localizedChapter.chapterNumber} (${chapterInfo.biomeNameEn.toUpperCase()})`}
          </span>
        </button>

        {/* Secondary Action Row: Daily Quests, Customize Hero & Home Base Sanctuary */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3">
          <button
            type="button"
            onClick={onOpenDailyQuests}
            aria-label="Open Daily Quests"
            className="px-4 py-2 bg-[#2d5029]/95 hover:bg-[#3d6b38] text-[#ffd166] font-black text-xs rounded-xl border border-[#ffd166]/60 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <ScrollText className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>
              {isFa
                ? `مأموریت‌های روزانه (${completedQuestsCount}/${dailyQuests.length})`
                : `Daily Quests (${completedQuestsCount}/${dailyQuests.length})`}
            </span>
            {unclaimedQuestsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#ffd166] animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCustomizeHero}
            aria-label="Customize Character"
            className="px-4 py-2 bg-[#1b4332]/90 hover:bg-[#2d6a4f] text-[#e9f5db] font-bold text-xs rounded-xl border border-[#95d5b2]/50 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-[#80b918]" />
            <span>{isFa ? 'شخصی‌سازی قهرمان' : 'Customize Hero'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenCustomizeHome}
            aria-label="Customize Home Base Sanctuary"
            className="px-4 py-2 bg-[#1b4332]/90 hover:bg-[#2d6a4f] text-[#e9f5db] font-bold text-xs rounded-xl border border-[#95d5b2]/50 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>{isFa ? 'پایگاه امن و تندیس‌ها' : 'Home Base & Trophies'}</span>
          </button>
        </div>
      </div>

      {/* Flat Control Hint Line */}
      <div className="text-center">
        <p className="text-[11px] sm:text-xs text-[#d8f3dc]/90 font-medium tracking-wide drop-shadow-[0_1px_3px_rgba(10,25,10,0.9)]">
          {isFa
            ? 'حرکت: WASD یا جوی‌استیک لمسی · ضربه: Space · جهش: Shift · چرخش شکوفه: Q · احیای نیایشگاه: E · توقف: Esc'
            : 'WASD / Joystick Move · Space Whack · Shift Dash · Q Bloom Spin · E Restore · Esc Pause'}
        </p>
      </div>
    </div>
  );
};

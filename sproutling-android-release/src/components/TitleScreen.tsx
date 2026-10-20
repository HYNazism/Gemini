/**
 * Bespoke Title Screen with custom inline SVG title lockup,
 * continuous story chapter banner, Start CTA (data-start="true"),
 * 3D Character Customizer, Home Base Sanctuary Decorator, and APK/AdMob setup.
 */

import React from 'react';
import { Volume2, VolumeX, Sparkles, Compass, User, Home, Smartphone } from 'lucide-react';
import type { ChapterStoryInfo } from '../game/rules';

interface TitleScreenProps {
  onStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  chapterInfo: ChapterStoryInfo;
  onOpenCustomizeHero: () => void;
  onOpenCustomizeHome: () => void;
  onOpenAdMobAndApk: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  isMuted,
  onToggleMute,
  chapterInfo,
  onOpenCustomizeHero,
  onOpenCustomizeHome,
  onOpenAdMobAndApk,
}) => {
  return (
    <div className="absolute inset-0 z-30 pointer-events-auto flex flex-col justify-between p-5 sm:p-8 select-none">
      {/* Top Bar with cozy badge, APK/AdMob setup, and audio toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 bg-[#2d5029]/85 text-[#e9f5db] px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border border-[#709775]/50 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-[#ffd166]" />
          <span>{chapterInfo.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAdMobAndApk}
            aria-label="Open Android APK and Google Play AdMob Setup"
            className="px-3 py-1.5 rounded-full bg-[#1b4332]/90 border border-[#ffd166]/60 text-[#ffd166] text-xs font-bold flex items-center gap-1.5 hover:bg-[#2d6a4f] transition-colors shadow-md cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>APK · AdMob</span>
          </button>

          <button
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

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#f4fbf1] drop-shadow-[0_3px_6px_rgba(15,35,15,0.7)] font-sans">
          SPROUTLING
        </h1>
        <p className="text-xs sm:text-sm font-bold tracking-widest text-[#ffd166] uppercase mt-1 mb-2 drop-shadow-[0_2px_4px_rgba(15,35,15,0.8)]">
          Grove Guardian 3D · {chapterInfo.subtitle}
        </p>

        <p className="text-xs sm:text-sm text-[#d8f3dc] max-w-md mb-5 drop-shadow-[0_2px_4px_rgba(10,25,10,0.9)] leading-relaxed bg-[#1b4332]/75 px-4 py-2.5 rounded-2xl border border-[#709775]/40">
          {chapterInfo.storyParagraph}
        </p>

        {/* Primary Start CTA with data-start="true" */}
        <button
          data-start="true"
          onClick={onStart}
          aria-label="Start Game"
          className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-b from-[#80b918] to-[#55a630] hover:from-[#9ef01a] hover:to-[#70e000] text-[#0d2818] font-black text-base sm:text-lg tracking-wide rounded-2xl shadow-[0_6px_20px_rgba(43,84,30,0.6)] border-2 border-[#d8f3dc]/60 transition-all transform hover:-translate-y-0.5 active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Compass className="w-5 h-5 text-[#0d2818]" />
          <span>ENTER CHAPTER {chapterInfo.chapterNumber}</span>
        </button>

        {/* Secondary Action Row: Customize Hero & Home Base Sanctuary */}
        <div className="flex items-center justify-center gap-2.5 mt-3">
          <button
            type="button"
            onClick={onOpenCustomizeHero}
            aria-label="Customize Character"
            className="px-4 py-2 bg-[#1b4332]/90 hover:bg-[#2d6a4f] text-[#e9f5db] font-bold text-xs rounded-xl border border-[#95d5b2]/50 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-[#80b918]" />
            <span>Customize Hero</span>
          </button>

          <button
            type="button"
            onClick={onOpenCustomizeHome}
            aria-label="Customize Home Base Sanctuary"
            className="px-4 py-2 bg-[#1b4332]/90 hover:bg-[#2d6a4f] text-[#e9f5db] font-bold text-xs rounded-xl border border-[#95d5b2]/50 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>Home Base & Trophies</span>
          </button>
        </div>
      </div>

      {/* Flat Control Hint Line */}
      <div className="text-center">
        <p className="text-[11px] sm:text-xs text-[#d8f3dc]/90 font-medium tracking-wide drop-shadow-[0_1px_3px_rgba(10,25,10,0.9)]">
          WASD / Joystick Move · Space Whack · Shift Dash · Q Bloom Spin · E Restore · Esc Pause
        </p>
      </div>
    </div>
  );
};

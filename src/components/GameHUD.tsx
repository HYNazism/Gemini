/**
 * World-matched, low-occlusion Playing HUD (Persian & English).
 * >= 85% playfield unobstructed, zero backdrop-filter, tabular-nums.
 * Includes Weather/Time indicator, Sanctuary Safe-Zone banner, and Online-Only Rewarded Ad button.
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Sparkles, Sun, CloudSun, Home, Gift, User, Languages } from 'lucide-react';
import type { HUDData } from '../game/engine';
import { admob } from '../game/admob';
import {
  WEATHER_SHORT_LABELS,
  TIME_PHASE_LABELS,
  localizeShrinePrompt,
  type Language,
} from '../game/i18n';

interface GameHUDProps {
  data: HUDData;
  onPause: () => void;
  onToggleMute: () => void;
  onOpenCustomize: (tab: 'hero' | 'home' | 'atmosphere') => void;
  onGrantRewardedSeeds: () => void;
  lang: Language;
  onToggleLang: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  data,
  onPause,
  onToggleMute,
  onOpenCustomize,
  onGrantRewardedSeeds,
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
  } = data;

  const isFa = lang === 'fa';
  const [isOnline, setIsOnline] = useState<boolean>(() => admob.isOnline());

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const handleRewardedBlessing = () => {
    admob.showRewardedAd(isFa ? '+۳ بذر طلایی خورشید' : '+3 Golden Sun-Seeds', () => {
      onGrantRewardedSeeds();
    });
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3.5 sm:p-5 select-none">
      {/* Top Bar: Corner Clusters */}
      <div className="flex items-start justify-between w-full gap-2">
        {/* Top-Left Cluster: Vitality Leaf Pips, Seeds, Shrines & Chapter */}
        <div className="flex flex-col gap-1.5">
          {/* Health Leaves Socket */}
          <div className="flex items-center gap-1.5 bg-[#1b4332]/85 px-3 py-1.5 rounded-2xl border border-[#709775]/50 shadow-md">
            <span className="text-[10px] font-black text-[#95d5b2] uppercase tracking-wider mr-1">
              {isFa ? 'جان' : 'HP'}
            </span>
            {Array.from({ length: player.maxHp }).map((_, i) => {
              const isFull = i < player.hp;
              return (
                <div key={i} className="w-5 h-5 flex items-center justify-center">
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
            <span className="ml-1.5 text-[10px] font-black text-[#ffd166] uppercase">
              {isFa ? `فصل ${chapterInfo.chapterNumber}` : `Ch.${chapterInfo.chapterNumber}`}
            </span>
          </div>

          {/* Seeds and Shrines Cluster */}
          <div className="flex items-center gap-2.5 bg-[#1b4332]/85 px-3 py-1.5 rounded-2xl border border-[#709775]/50 shadow-md">
            <div className="flex items-center gap-1">
              <Sun className="w-4 h-4 text-[#ffd166]" />
              <span className="text-sm font-black text-[#ffd166] tabular-nums">
                {player.sunSeeds}
              </span>
              <span className="text-[10px] font-bold text-[#d8f3dc]/80">
                {isFa ? 'بذر' : 'Seeds'}
              </span>
            </div>

            <div className="w-[1px] h-3.5 bg-[#709775]/40" />

            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#06d6a0]" />
              <span className="text-sm font-black text-[#06d6a0] tabular-nums">
                {restoredShrines}/{totalShrines}
              </span>
              <span className="text-[10px] font-bold text-[#d8f3dc]/80">
                {isFa ? 'نیایشگاه' : 'Shrines'}
              </span>
            </div>
          </div>
        </div>

        {/* Top-Right Cluster: Weather/Time, Online-Only Ad Blessing, Score & Utility */}
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {/* Online-only Rewarded Ad Blessing */}
          {isOnline && (
            <button
              type="button"
              onClick={handleRewardedBlessing}
              aria-label="Watch Rewarded Ad for 3 Sun-Seeds"
              className="bg-[#ffd166] hover:bg-[#ffe08a] text-[#081c15] px-2.5 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1 shadow-md pointer-events-auto cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>{isFa ? '+۳ بذر (تبلیغ)' : '+3 Seeds (Ad)'}</span>
            </button>
          )}

          {/* Weather & Time-of-Day Button */}
          <button
            type="button"
            onClick={() => onOpenCustomize('atmosphere')}
            aria-label="Open Weather and Day-Night Settings"
            className="bg-[#1b4332]/85 hover:bg-[#2d6a4f] px-2.5 py-1.5 rounded-xl border border-[#709775]/50 shadow-md flex items-center gap-1.5 text-[11px] font-bold text-[#d8f3dc] pointer-events-auto cursor-pointer"
          >
            <CloudSun className="w-3.5 h-3.5 text-[#48cae4]" />
            <span>
              {TIME_PHASE_LABELS[lang][timePhase]} · {WEATHER_SHORT_LABELS[lang][weather]}
            </span>
          </button>

          {/* Hero Wardrobe Button */}
          <button
            type="button"
            onClick={() => onOpenCustomize('hero')}
            aria-label="Customize Hero Appearance"
            className="w-9 h-9 rounded-xl bg-[#1b4332]/85 border border-[#709775]/50 text-[#e9f5db] flex items-center justify-center hover:bg-[#2d6a4f] shadow-md pointer-events-auto cursor-pointer"
          >
            <User className="w-4 h-4 text-[#80b918]" />
          </button>

          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={onToggleLang}
            aria-label="Switch Language"
            className="px-2.5 h-9 rounded-xl bg-[#1b4332]/85 border border-[#709775]/50 text-[#ffd166] text-[11px] font-black flex items-center gap-1 hover:bg-[#2d6a4f] shadow-md pointer-events-auto cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{isFa ? 'EN' : 'فا'}</span>
          </button>

          {/* Score Badge */}
          <div className="bg-[#1b4332]/85 px-3 py-1.5 rounded-xl border border-[#709775]/50 shadow-md flex items-baseline gap-1">
            <span className="text-[10px] font-bold text-[#95d5b2]">
              {isFa ? 'امتیاز' : 'SCORE'}
            </span>
            <span className="text-sm font-black text-[#f4fbf1] tabular-nums">{player.score}</span>
          </div>

          {/* Mute button */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute game' : 'Mute game'}
            className="w-9 h-9 rounded-xl bg-[#1b4332]/85 border border-[#709775]/50 text-[#e9f5db] flex items-center justify-center hover:bg-[#2d6a4f] active:scale-95 transition-all shadow-md pointer-events-auto cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-300" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#ffd166]" />
            )}
          </button>

          {/* Pause button */}
          <button
            type="button"
            onClick={onPause}
            aria-label="Pause game"
            className="w-9 h-9 rounded-xl bg-[#1b4332]/85 border border-[#709775]/50 text-[#e9f5db] flex items-center justify-center hover:bg-[#2d6a4f] active:scale-95 transition-all shadow-md pointer-events-auto cursor-pointer"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center-Top Prompt Pill (Near Shrine OR Inside Cozy Home Base Sanctuary) */}
      {isNearShrine ? (
        <div
          dir={isFa ? 'rtl' : 'ltr'}
          className="self-center mb-auto mt-2 bg-[#2d5029]/90 border border-[#ffd166]/70 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 pointer-events-none"
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
          className="self-center mb-auto mt-2 bg-[#1b4332]/90 hover:bg-[#2d6a4f] border border-[#95d5b2]/70 px-4 py-1.5 rounded-2xl shadow-xl flex items-center gap-2 pointer-events-auto cursor-pointer"
        >
          <Home className="w-4 h-4 text-[#ffd166] shrink-0" />
          <span className="text-xs font-bold text-[#d8f3dc]">
            {isFa
              ? 'پناهگاه امن (درمان خودکار) · برای تزئین کلبه و تندیس‌ها لمس کنید'
              : 'Sanctuary Safe Zone (Healing) · Tap to Decorate Base & Trophies'}
          </span>
        </button>
      ) : null}

      {/* Combo Step Pop if Active */}
      {player.comboCount > 1 && (
        <div className="self-center mb-8 bg-[#ffb703]/90 text-[#370617] px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border border-white/60 shadow-lg">
          {isFa ? `ضربه زنجیره‌ای ×${player.comboCount}!` : `Combo x${player.comboCount}!`}
        </div>
      )}
    </div>
  );
};

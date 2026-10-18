/**
 * Status Modals (Persian & English): Paused, Victory (Infinite Chapter Progression),
 * and Game Over (Online-Only Ad Revive).
 */

import React from 'react';
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  Sparkles,
  AlertCircle,
  Star,
  Gift,
  User,
  Smartphone,
  Languages,
} from 'lucide-react';
import type { HUDData } from '../game/engine';
import { admob } from '../game/admob';
import { getLocalizedChapterInfo, type Language } from '../game/i18n';

interface StatusModalsProps {
  data: HUDData;
  onResume: () => void;
  onRestart: () => void;
  onNextChapter: () => void;
  onReviveWithAd: () => void;
  onToggleMute: () => void;
  onOpenCustomize: () => void;
  onOpenAdMobAndApk: () => void;
  lang: Language;
  onToggleLang: () => void;
}

export const StatusModals: React.FC<StatusModalsProps> = ({
  data,
  onResume,
  onRestart,
  onNextChapter,
  onReviveWithAd,
  onToggleMute,
  onOpenCustomize,
  onOpenAdMobAndApk,
  lang,
  onToggleLang,
}) => {
  const {
    gameState,
    finalSummary,
    player,
    restoredShrines,
    totalShrines,
    cleansedEnemiesCount,
    isMuted,
    chapterInfo,
  } = data;

  if (gameState === 'title' || gameState === 'playing') {
    return null;
  }

  const isFa = lang === 'fa';
  const isOnline = admob.isOnline();
  const currentLocalized = getLocalizedChapterInfo(chapterInfo.chapterNumber, lang);
  const nextChapter = getLocalizedChapterInfo(chapterInfo.chapterNumber + 1, lang);

  return (
    <div
      dir={isFa ? 'rtl' : 'ltr'}
      className="absolute inset-0 z-40 bg-[#0d1f12]/80 flex items-center justify-center p-4 select-none pointer-events-auto"
    >
      {/* 1. PAUSED MODAL */}
      {gameState === 'paused' && (
        <div className="w-full max-w-sm bg-[#1b4332] border-2 border-[#52b788] rounded-3xl p-6 sm:p-7 shadow-2xl text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-[#2d6a4f] border border-[#709775] flex items-center justify-center mb-3 shadow-inner">
            <span className="text-2xl">🌿</span>
          </div>

          <h2 className="text-2xl font-black text-[#d8f3dc] tracking-tight mb-1">
            {currentLocalized.title}
          </h2>
          <p className="text-xs text-[#95d5b2] mb-5">
            {isFa
              ? 'نفسی تازه کن جوانه کوچک؛ بیشه چشم‌به‌راه بازگشت توست.'
              : 'Take a breath, Sproutling. The grove awaits your return.'}
          </p>

          <div className="w-full flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onResume}
              aria-label="Resume Game"
              className="w-full py-3 bg-gradient-to-r from-[#80b918] to-[#55a630] text-[#081c15] font-black text-sm tracking-wider rounded-xl shadow-md border border-white/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isFa ? 'ادامه ماجراجویی' : 'RESUME ADVENTURE'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenCustomize}
              aria-label="Customize Hero and Sanctuary"
              className="w-full py-2.5 bg-[#2d6a4f] hover:bg-[#40916c] text-[#e9f5db] font-bold text-xs tracking-wider rounded-xl border border-[#709775]/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4 text-[#ffd166]" />
              <span>
                {isFa ? 'شخصی‌سازی قهرمان، کلبه و گرافیک' : 'HERO, SANCTUARY & FPS'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenAdMobAndApk}
              aria-label="Open Android APK and AdMob Settings"
              className="w-full py-2.5 bg-[#2d6a4f] hover:bg-[#40916c] text-[#ffd166] font-bold text-xs tracking-wider rounded-xl border border-[#ffd166]/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isFa ? 'تنظیمات APK، گیت‌هاب و تبلیغات' : 'ANDROID APK & ADMOB'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleLang}
              aria-label="Switch Language"
              className="w-full py-2.5 bg-[#0f281e] hover:bg-[#2d6a4f] text-[#e9f5db] font-bold text-xs tracking-wider rounded-xl border border-[#709775]/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Languages className="w-4 h-4 text-[#48cae4]" />
              <span>{isFa ? 'زبان بازی: پارسی (تغییر به English)' : 'Language: English (تغییر به پارسی)'}</span>
            </button>

            <button
              type="button"
              onClick={onNextChapter}
              aria-label="Advance to Next Chapter"
              className="w-full py-2.5 bg-gradient-to-r from-[#ffd166] to-[#f4a261] text-[#081c15] font-black text-xs tracking-wider rounded-xl shadow-md border border-white/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>
                {isFa
                  ? `رفتن به مرحله بعد (${nextChapter.title})`
                  : `NEXT STAGE (${nextChapter.title.toUpperCase()})`}
              </span>
            </button>

            <button
              type="button"
              onClick={onRestart}
              aria-label="Restart Chapter"
              className="w-full py-2.5 bg-[#0f281e] hover:bg-[#2d6a4f] text-[#e9f5db] font-bold text-xs tracking-wider rounded-xl border border-[#709775]/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isFa ? 'شروع دوباره این فصل' : 'RESTART CHAPTER'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="w-full py-2 text-[#95d5b2] hover:text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-300" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#ffd166]" />
              )}
              <span>
                {isFa
                  ? isMuted
                    ? 'صدای بازی: خاموش'
                    : 'صدای بازی: روشن'
                  : isMuted
                  ? 'Sound: Off'
                  : 'Sound: On'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 2. VICTORY MODAL (INFINITE CHAPTER PROGRESSION) */}
      {gameState === 'victory' && (
        <div className="w-full max-w-md bg-[#1b4332] border-2 border-[#ffd166] rounded-3xl p-6 sm:p-7 shadow-2xl text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#ffd166] to-[#f4a261] border-2 border-white flex items-center justify-center mb-2.5 shadow-lg">
            <Trophy className="w-7 h-7 text-[#081c15]" />
          </div>

          <h2 className="text-2xl font-black text-[#ffd166] tracking-tight mb-1">
            {isFa
              ? `فصل ${chapterInfo.chapterNumber} با موفقیت احیا شد!`
              : `CHAPTER ${chapterInfo.chapterNumber} RESTORED!`}
          </h2>
          <p className="text-xs text-[#d8f3dc] mb-3 max-w-sm leading-relaxed">
            {nextChapter.storyParagraph}
          </p>

          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map((starIdx) => {
              const active = (finalSummary?.stars || 1) >= starIdx;
              return (
                <Star
                  key={starIdx}
                  className={`w-6 h-6 ${
                    active ? 'text-[#ffd166] fill-[#ffd166]' : 'text-gray-500 fill-gray-600'
                  } drop-shadow-md`}
                />
              );
            })}
          </div>

          <div className="w-full grid grid-cols-2 gap-2 mb-5 text-start">
            <div className="bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f]">
              <span className="text-[10px] font-bold text-[#95d5b2] uppercase block">
                {isFa ? 'امتیاز کل' : 'Total Score'}
              </span>
              <span className="text-base font-black text-[#ffd166] tabular-nums">
                {finalSummary?.finalScore ?? player.score}
              </span>
            </div>

            <div className="bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f]">
              <span className="text-[10px] font-bold text-[#95d5b2] uppercase block">
                {isFa ? 'زمان اتمام' : 'Clear Time'}
              </span>
              <span className="text-base font-black text-[#f4fbf1] tabular-nums">
                {finalSummary?.timeFormatted ?? '0:00'}
              </span>
            </div>

            <div className="bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f]">
              <span className="text-[10px] font-bold text-[#95d5b2] uppercase block">
                {isFa ? 'نیایشگاه‌های بیدارشده' : 'Shrines Awakened'}
              </span>
              <span className="text-base font-black text-[#06d6a0] tabular-nums">
                {restoredShrines} / {totalShrines}
              </span>
            </div>

            <div className="bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f]">
              <span className="text-[10px] font-bold text-[#95d5b2] uppercase block">
                {isFa ? 'موجودات پاکسازی‌شده' : 'Critters Cleansed'}
              </span>
              <span className="text-base font-black text-[#f4fbf1] tabular-nums">
                {cleansedEnemiesCount}
              </span>
            </div>
          </div>

          <button
            data-start="true"
            onClick={() => admob.showInterstitialAd(onNextChapter)}
            aria-label="Advance to Next Chapter"
            className="w-full py-3.5 bg-gradient-to-r from-[#ffd166] to-[#f4a261] text-[#0d2818] font-black text-sm tracking-wider rounded-2xl shadow-xl border border-white/50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>
              {isFa
                ? `ورود به ${nextChapter.title}`
                : `ENTER ${nextChapter.title.toUpperCase()}`}
            </span>
          </button>
        </div>
      )}

      {/* 3. GAME OVER MODAL (WITH ONLINE-ONLY REWARDED AD REVIVE) */}
      {gameState === 'gameover' && (
        <div className="w-full max-w-sm bg-[#1b4332] border-2 border-red-500/70 rounded-3xl p-6 sm:p-7 shadow-2xl text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-red-900/60 border border-red-500/60 flex items-center justify-center mb-3">
            <AlertCircle className="w-7 h-7 text-red-300" />
          </div>

          <h2 className="text-2xl font-black text-red-200 tracking-tight mb-1">
            {isFa ? 'پیپ پژمرده شد!' : 'PIP WILTED'}
          </h2>
          <p className="text-xs text-[#d8f3dc] mb-4">
            {isFa
              ? `خارهای تاریک در «${currentLocalized.title}» بر شما غلبه کردند.`
              : `The gloomy brambles overwhelmed you in ${currentLocalized.title}.`}
          </p>

          <div className="w-full grid grid-cols-2 gap-2 mb-5 text-start">
            <div className="bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f]">
              <span className="text-[10px] font-bold text-[#95d5b2] uppercase block">
                {isFa ? 'نیایشگاه‌های بیدارشده' : 'Shrines Awakened'}
              </span>
              <span className="text-base font-black text-[#06d6a0] tabular-nums">
                {restoredShrines} / {totalShrines}
              </span>
            </div>

            <div className="bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f]">
              <span className="text-[10px] font-bold text-[#95d5b2] uppercase block">
                {isFa ? 'بذرهای جمع‌شده' : 'Seeds Gathered'}
              </span>
              <span className="text-base font-black text-[#ffd166] tabular-nums">
                {player.sunSeeds}
              </span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2.5">
            {isOnline && (
              <button
                type="button"
                onClick={() =>
                  admob.showRewardedAd(
                    isFa ? 'احیای کامل جان پیپ' : 'Second-Wind Full HP Revive',
                    () => {
                      onReviveWithAd();
                    }
                  )
                }
                aria-label="Revive Pip with Rewarded Ad"
                className="w-full py-3.5 bg-gradient-to-r from-[#ffd166] to-[#f4a261] text-[#081c15] font-black text-xs tracking-wider rounded-xl shadow-lg border border-white/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Gift className="w-4 h-4" />
                <span>
                  {isFa ? 'احیای کامل جان (تماشای تبلیغ)' : 'REVIVE FULL HP (WATCH AD)'}
                </span>
              </button>
            )}

            <button
              data-start="true"
              onClick={onRestart}
              aria-label="Try Again"
              className="w-full py-3 bg-gradient-to-r from-[#80b918] to-[#55a630] text-[#081c15] font-black text-sm tracking-wider rounded-xl shadow-lg border border-white/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isFa ? 'تلاش دوباره' : 'TRY AGAIN'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

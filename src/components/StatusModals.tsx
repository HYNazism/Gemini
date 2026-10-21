/**
 * Dark-Mythic ARPG Status Modals (Persian & English):
 * Paused Command Center, Realm Victory (Infinite Chapter Progression),
 * and Warden Fallen (Online-Only Rewarded Ad Revive).
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
  LogOut,
  Shield,
} from 'lucide-react';
import type { HUDData } from '../game/engine';
import { admob } from '../game/admob';
import { getLocalizedChapterInfo, type Language } from '../game/i18n';
import { getStageBiomeTheme } from '../game/rules';

interface StatusModalsProps {
  data: HUDData;
  onResume: () => void;
  onRestart: () => void;
  onExitToTitle: () => void;
  onNextChapter: () => void;
  onJumpToChapter?: (chapterNum: number) => void;
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
  onExitToTitle,
  onNextChapter,
  onJumpToChapter,
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
      className="absolute inset-0 z-40 bg-[#020617]/88 flex items-center justify-center p-3 sm:p-4 select-none pointer-events-auto"
    >
      {/* 1. PAUSED MODAL */}
      {gameState === 'paused' && (
        <div className="w-full max-w-sm max-h-[90dvh] overflow-y-auto bg-[#0b1520] border-2 border-[#38bdf8] rounded-2xl p-4 sm:p-6 shadow-2xl text-center flex flex-col items-center">
          <div className="w-11 h-11 rounded-xl bg-[#112233] border border-[#ffd166] flex items-center justify-center mb-2 shadow-inner shrink-0">
            <Shield className="w-6 h-6 text-[#ffd166]" />
          </div>

          <h2 className="text-[clamp(1.15rem,3vw,1.5rem)] font-black text-[#f8fafc] tracking-tight mb-0.5">
            {currentLocalized.title}
          </h2>
          <p className="text-[11px] font-bold text-[#ffd166] mb-1">
            {isFa ? `قلمرو: ${chapterInfo.biomeNameFa}` : `Realm: ${chapterInfo.biomeNameEn}`}
          </p>
          <p className="text-xs text-[#94a3b8] mb-3.5">
            {isFa
              ? 'نگهبان اختران؛ قلمرو باستانی چشم‌به‌راه بازگشت تیغه توست.'
              : 'Astral Warden, the realm awaits your blade.'}
          </p>

          {/* Quick 5-Biome Stage Switcher */}
          {onJumpToChapter && (
            <div className="w-full bg-[#112233] border border-[#1e3a5f] rounded-xl p-2 mb-3 text-start">
              <div className="text-[10px] font-bold text-[#38bdf8] mb-1.5 text-center">
                {isFa ? 'انتقال سریع به قلمرو و مرحله دلخواه:' : 'Quick Teleport to Mythic Realm:'}
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map((stageNum) => {
                  const biome = getStageBiomeTheme(stageNum);
                  const isCurrent = ((chapterInfo.chapterNumber - 1) % 5) + 1 === stageNum;
                  return (
                    <button
                      key={stageNum}
                      type="button"
                      onClick={() => onJumpToChapter(stageNum)}
                      className={`py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#1e3a5f] border-[#ffd166] text-white font-black'
                          : 'bg-[#060d18] border-[#1e293b] text-[#cbd5e1] hover:bg-[#16293d] font-bold'
                      }`}
                    >
                      <div className="text-[10px] text-[#ffd166]">
                        {isFa ? `ف ${stageNum}` : `S${stageNum}`}
                      </div>
                      <div className="text-[8px] truncate">
                        {isFa ? biome.nameFa.split(' ')[1] || biome.nameFa : biome.nameEn.split(' ')[0]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="w-full flex flex-col gap-2">
            <button
              type="button"
              onClick={onResume}
              aria-label="Resume Game"
              className="w-full py-2.5 bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-[#060d18] font-black text-sm tracking-wider rounded-xl shadow-md border border-white/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isFa ? 'ادامه نبرد' : 'RESUME COMBAT'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenCustomize}
              aria-label="Customize Hero and Sanctuary"
              className="w-full py-2 bg-[#1e1b4b] hover:bg-[#312e81] text-[#f8fafc] font-bold text-xs tracking-wider rounded-xl border border-[#38bdf8]/65 flex items-center justify-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4 text-[#ffd166]" />
              <span>
                {isFa ? 'درخت مهارت، زرادخانه سلاح و گرافیک' : 'SKILL TREE, ARMORY & GRAPHICS'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenAdMobAndApk}
              aria-label="Open Android APK and AdMob Settings"
              className="w-full py-2 bg-[#112233] hover:bg-[#16293d] text-[#ffd166] font-bold text-xs tracking-wider rounded-xl border border-[#ffd166]/45 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isFa ? 'خروجی ویندوز، اندروید و تبلیغات' : 'BUILDS & ADMOB SETUP'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleLang}
              aria-label="Switch Language"
              className="w-full py-2 bg-[#112233] hover:bg-[#16293d] text-[#f8fafc] font-bold text-xs tracking-wider rounded-xl border border-[#334155] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Languages className="w-4 h-4 text-[#38bdf8]" />
              <span>{isFa ? 'زبان بازی: پارسی (تغییر به English)' : 'Language: English (تغییر به پارسی)'}</span>
            </button>

            <button
              type="button"
              onClick={onNextChapter}
              aria-label="Advance to Next Chapter"
              className="w-full py-2 bg-gradient-to-r from-[#ffd166] to-[#f59e0b] text-[#060d18] font-black text-xs tracking-wider rounded-xl shadow-md border border-white/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>
                {isFa
                  ? `رفتن به قلمرو بعد (${nextChapter.title})`
                  : `NEXT REALM (${nextChapter.title.toUpperCase()})`}
              </span>
            </button>

            <button
              type="button"
              onClick={onRestart}
              aria-label="Restart Chapter"
              className="w-full py-2 bg-[#112233] hover:bg-[#16293d] text-[#e2e8f0] font-bold text-xs tracking-wider rounded-xl border border-[#334155] flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isFa ? 'آغاز دوباره این فصل' : 'RESTART CHAPTER'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="w-full py-1.5 text-[#94a3b8] hover:text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
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

            <button
              type="button"
              onClick={onExitToTitle}
              aria-label="Exit to Main Title Screen"
              className="w-full py-2 bg-[#2a0a18] hover:bg-[#4c0519] text-[#fecdd3] font-black text-xs tracking-wider rounded-xl border border-[#f43f5e]/75 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-[#f43f5e]" />
              <span>{isFa ? 'خروج به منوی اصلی' : 'EXIT TO MAIN MENU'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. VICTORY MODAL (INFINITE CHAPTER PROGRESSION) */}
      {gameState === 'victory' && (
        <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto bg-[#0b1520] border-2 border-[#ffd166] rounded-2xl p-5 sm:p-7 shadow-2xl text-center flex flex-col items-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#ffd166] to-[#f59e0b] border-2 border-white flex items-center justify-center mb-2 shadow-lg shrink-0">
            <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-[#060d18]" />
          </div>

          <h2 className="text-[clamp(1.2rem,3.2vw,1.55rem)] font-black text-[#ffd166] tracking-tight mb-1">
            {isFa
              ? `فصل ${chapterInfo.chapterNumber} (${chapterInfo.biomeNameFa}) فتح شد!`
              : `CHAPTER ${chapterInfo.chapterNumber} (${chapterInfo.biomeNameEn}) CONQUERED!`}
          </h2>
          <p className="text-xs text-[#cbd5e1] mb-3 max-w-sm leading-relaxed">
            {nextChapter.storyParagraph}
          </p>

          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map((starIdx) => {
              const active = (finalSummary?.stars || 1) >= starIdx;
              return (
                <Star
                  key={starIdx}
                  className={`w-6 h-6 ${
                    active ? 'text-[#ffd166] fill-[#ffd166]' : 'text-slate-600 fill-slate-700'
                  } drop-shadow-md`}
                />
              );
            })}
          </div>

          <div className="w-full grid grid-cols-2 gap-2 mb-5 text-start">
            <div className="bg-[#112233] p-2.5 rounded-xl border border-[#1e3a5f]">
              <span className="text-[10px] font-bold text-[#94a3b8] uppercase block">
                {isFa ? 'امتیاز افتخار' : 'Total Valor'}
              </span>
              <span className="text-base font-black text-[#ffd166] tabular-nums">
                {finalSummary?.finalScore ?? player.score}
              </span>
            </div>

            <div className="bg-[#112233] p-2.5 rounded-xl border border-[#1e3a5f]">
              <span className="text-[10px] font-bold text-[#94a3b8] uppercase block">
                {isFa ? 'زمان فتح' : 'Clear Time'}
              </span>
              <span className="text-base font-black text-[#f8fafc] tabular-nums">
                {finalSummary?.timeFormatted ?? '0:00'}
              </span>
            </div>

            <div className="bg-[#112233] p-2.5 rounded-xl border border-[#1e3a5f]">
              <span className="text-[10px] font-bold text-[#94a3b8] uppercase block">
                {isFa ? 'مناره‌های بیدارشده' : 'Obelisks Awakened'}
              </span>
              <span className="text-base font-black text-[#38bdf8] tabular-nums">
                {restoredShrines} / {totalShrines}
              </span>
            </div>

            <div className="bg-[#112233] p-2.5 rounded-xl border border-[#1e3a5f]">
              <span className="text-[10px] font-bold text-[#94a3b8] uppercase block">
                {isFa ? 'سپاهیان خلأ شکست‌خورده' : 'Void Foes Vanquished'}
              </span>
              <span className="text-base font-black text-[#f8fafc] tabular-nums">
                {cleansedEnemiesCount}
              </span>
            </div>
          </div>

          <button
            data-start="true"
            onClick={() => admob.showInterstitialAd(onNextChapter)}
            aria-label="Advance to Next Chapter"
            className="w-full py-3.5 bg-gradient-to-r from-[#ffd166] to-[#f59e0b] text-[#060d18] font-black text-sm tracking-wider rounded-xl shadow-xl border border-white/60 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>
              {isFa
                ? `ورود به ${nextChapter.title}`
                : `ENTER ${nextChapter.title.toUpperCase()}`}
            </span>
          </button>

          <button
            type="button"
            onClick={onExitToTitle}
            aria-label="Exit to Main Title Screen"
            className="w-full mt-2 py-2.5 bg-[#2a0a18] hover:bg-[#4c0519] text-[#fecdd3] font-black text-xs tracking-wider rounded-xl border border-[#f43f5e]/75 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#f43f5e]" />
            <span>{isFa ? 'خروج به منوی اصلی' : 'EXIT TO MAIN MENU'}</span>
          </button>
        </div>
      )}

      {/* 3. GAME OVER MODAL (WITH ONLINE-ONLY REWARDED AD REVIVE) */}
      {gameState === 'gameover' && (
        <div className="w-full max-w-sm bg-[#0b1520] border-2 border-[#f43f5e] rounded-2xl p-6 sm:p-7 shadow-2xl text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#2a0a18] border border-[#f43f5e]/75 flex items-center justify-center mb-3">
            <AlertCircle className="w-7 h-7 text-[#f43f5e]" />
          </div>

          <h2 className="text-2xl font-black text-[#fecdd3] tracking-tight mb-1">
            {isFa ? 'سقوط نگهبان اختران!' : 'WARDEN FALLEN'}
          </h2>
          <p className="text-xs text-[#cbd5e1] mb-4">
            {isFa
              ? `سپاهیان خلأ در «${currentLocalized.title}» بر شما غلبه کردند.`
              : `The Void Legion overwhelmed you in ${currentLocalized.title}.`}
          </p>

          <div className="w-full grid grid-cols-2 gap-2 mb-5 text-start">
            <div className="bg-[#112233] p-2.5 rounded-xl border border-[#1e3a5f]">
              <span className="text-[10px] font-bold text-[#94a3b8] uppercase block">
                {isFa ? 'مناره‌های بیدارشده' : 'Obelisks Awakened'}
              </span>
              <span className="text-base font-black text-[#38bdf8] tabular-nums">
                {restoredShrines} / {totalShrines}
              </span>
            </div>

            <div className="bg-[#112233] p-2.5 rounded-xl border border-[#1e3a5f]">
              <span className="text-[10px] font-bold text-[#94a3b8] uppercase block">
                {isFa ? 'گوی‌های اختری' : 'Astral Orbs'}
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
                    isFa ? 'احیای کامل جان نگهبان' : 'Second-Wind Full Vitality Revive',
                    () => {
                      onReviveWithAd();
                    }
                  )
                }
                aria-label="Revive Warden with Rewarded Ad"
                className="w-full py-3.5 bg-gradient-to-r from-[#ffd166] to-[#f59e0b] text-[#060d18] font-black text-xs tracking-wider rounded-xl shadow-lg border border-white/60 flex items-center justify-center gap-2 cursor-pointer"
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
              className="w-full py-3 bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-[#060d18] font-black text-sm tracking-wider rounded-xl shadow-lg border border-white/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isFa ? 'تلاش دوباره' : 'RISE AGAIN'}</span>
            </button>

            <button
              type="button"
              onClick={onExitToTitle}
              aria-label="Exit to Main Title Screen"
              className="w-full py-2.5 bg-[#2a0a18] hover:bg-[#4c0519] text-[#fecdd3] font-black text-xs tracking-wider rounded-xl border border-[#f43f5e]/75 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-[#f43f5e]" />
              <span>{isFa ? 'خروج به منوی اصلی' : 'EXIT TO MAIN MENU'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

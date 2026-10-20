/**
 * Daily Quests Board Modal (Persian & English) for Sproutling: Grove Guardian 3D.
 * Displays 3 randomized daily woodland objectives with progress bars,
 * instant reward claiming (+Sun-Seeds, +Score, +1 HP), and quest board rerolling.
 */

import React from 'react';
import { X, ScrollText, CheckCircle2, Sparkles, Sun, RefreshCw, Gift } from 'lucide-react';
import type { DailyQuest } from '../game/rules';
import { localizeDailyQuest, type Language } from '../game/i18n';

interface DailyQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: DailyQuest[];
  dateKey: string;
  onClaimQuest: (questId: string) => void;
  onRerollQuests: () => void;
  lang: Language;
}

export const DailyQuestsModal: React.FC<DailyQuestsModalProps> = ({
  isOpen,
  onClose,
  quests,
  dateKey,
  onClaimQuest,
  onRerollQuests,
  lang,
}) => {
  if (!isOpen) return null;

  const isFa = lang === 'fa';
  const completedCount = quests.filter((q) => q.completed).length;

  return (
    <div
      dir={isFa ? 'rtl' : 'ltr'}
      className="absolute inset-0 z-50 bg-[#081c15]/85 flex items-center justify-center p-4 pointer-events-auto select-none"
    >
      <div
        role="dialog"
        aria-label={isFa ? 'تابلوی مأموریت‌های روزانه' : 'Daily Quests Board'}
        className="w-full max-w-lg bg-[#1b4332] border-2 border-[#95d5b2] rounded-3xl p-5 sm:p-6 shadow-2xl text-[#f4fbf1] flex flex-col gap-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#709775]/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#2d5029] border border-[#ffd166]/60 flex items-center justify-center shadow-inner">
              <ScrollText className="w-5 h-5 text-[#ffd166]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#f4fbf1]">
                {isFa ? 'مأموریت‌های روزانه بیشه' : 'Daily Woodland Quests'}
              </h2>
              <p className="text-xs text-[#95d5b2] font-medium tabular-nums">
                {isFa
                  ? `تاریخ: ${dateKey} · تکمیل‌شده: ${completedCount} از ${quests.length}`
                  : `Date: ${dateKey} · Completed: ${completedCount}/${quests.length}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isFa ? 'بستن مأموریت‌های روزانه' : 'Close Daily Quests'}
            className="w-9 h-9 rounded-full bg-[#2d5029] hover:bg-[#3d6b38] text-[#e9f5db] flex items-center justify-center border border-[#709775]/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quest Cards List */}
        <div className="flex flex-col gap-3">
          {quests.map((q) => {
            const loc = localizeDailyQuest(q, lang);
            const pct = Math.min(100, Math.round((q.progress / Math.max(1, q.target)) * 100));

            return (
              <div
                key={q.id}
                className={`rounded-2xl p-4 border transition-colors ${
                  q.completed
                    ? 'bg-[#2d5029]/95 border-[#ffd166]/80'
                    : 'bg-[#081c15]/65 border-[#709775]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {q.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#ffd166] shrink-0" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-[#80b918] shrink-0" />
                      )}
                      <h3 className="text-sm sm:text-base font-black text-[#f4fbf1]">
                        {loc.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[#d8f3dc]/85 mt-1 leading-relaxed">
                      {loc.description}
                    </p>
                  </div>

                  {/* Progress Counter */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-[#ffd166] tabular-nums">
                      {q.progress}/{q.target}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-[#081c15] rounded-full overflow-hidden mt-3 border border-[#709775]/30">
                  <div
                    className={`h-full transition-all duration-300 ${
                      q.completed ? 'bg-[#ffd166]' : 'bg-[#52b788]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Footer: Rewards & Claim Action */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-[#709775]/25">
                  <div className="flex items-center gap-3 text-xs text-[#d8f3dc] tabular-nums">
                    <span className="flex items-center gap-1 font-bold text-[#ffd166]">
                      <Sun className="w-3.5 h-3.5" />
                      {isFa ? `+${q.rewardSeeds} بذر` : `+${q.rewardSeeds} Seeds`}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-bold text-[#95d5b2]">
                      {isFa ? `+${q.rewardScore} امتیاز` : `+${q.rewardScore} Score`}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-bold text-[#52b788]">
                      {isFa ? '+۱ جان' : '+1 HP'}
                    </span>
                  </div>

                  {q.claimed ? (
                    <span className="text-xs font-black text-[#95d5b2]">
                      {isFa ? 'دریافت شد ✓' : 'Claimed ✓'}
                    </span>
                  ) : q.completed ? (
                    <button
                      type="button"
                      onClick={() => onClaimQuest(q.id)}
                      aria-label={isFa ? `دریافت پاداش ${loc.title}` : `Claim Reward for ${loc.title}`}
                      className="px-3.5 py-1.5 rounded-xl bg-[#ffd166] hover:bg-[#ffe08a] text-[#081c15] font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{isFa ? 'دریافت پاداش' : 'Claim Reward'}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-[#95d5b2]/80">
                      {isFa ? 'در حال انجام...' : 'In Progress'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions: Reroll New Objectives & Close */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#709775]/40">
          <button
            type="button"
            onClick={onRerollQuests}
            aria-label={isFa ? 'دریافت مأموریت‌های تصادفی جدید' : 'Roll New Daily Quests'}
            className="px-4 py-2.5 rounded-xl bg-[#2d5029] hover:bg-[#3d6b38] border border-[#95d5b2]/50 text-[#e9f5db] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>{isFa ? 'مأموریت‌های تصادفی جدید' : 'Roll New Quests'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#80b918] hover:bg-[#9ef01a] text-[#081c15] font-black text-xs cursor-pointer"
          >
            {isFa ? 'بازگشت به بازی' : 'Back to Grove'}
          </button>
        </div>
      </div>
    </div>
  );
};

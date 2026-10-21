/**
 * Astral Guild Contracts Modal (Persian & English) for Aethelgard: Warden of the Astral Grove.
 * Displays 3 randomized daily tactical contracts with progress bars,
 * instant reward claiming (+Astral Orbs, +Valor Score, +1 Vitality), and contract rerolling.
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
      className="absolute inset-0 z-50 bg-[#020617]/88 flex items-center justify-center p-4 pointer-events-auto select-none"
    >
      <div
        role="dialog"
        aria-label={isFa ? 'فرمان‌های روزانه محفل اختران' : 'Daily Guild Contracts Board'}
        className="w-full max-w-lg bg-[#0b1520] border-2 border-[#ffd166] rounded-2xl p-5 sm:p-6 shadow-2xl text-[#f8fafc] flex flex-col gap-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#112233] border border-[#ffd166]/70 flex items-center justify-center shadow-inner">
              <ScrollText className="w-5 h-5 text-[#ffd166]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#f8fafc]">
                {isFa ? 'پیمان‌های روزانه محفل اختران' : 'Astral Guild Contracts'}
              </h2>
              <p className="text-xs text-[#38bdf8] font-medium tabular-nums">
                {isFa
                  ? `تاریخ: ${dateKey} · تکمیل‌شده: ${completedCount} از ${quests.length}`
                  : `Date: ${dateKey} · Completed: ${completedCount}/${quests.length}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isFa ? 'بستن پیمان‌های روزانه' : 'Close Daily Quests'}
            className="w-9 h-9 rounded-lg bg-[#16293d] hover:bg-[#1e3a5f] text-[#f8fafc] flex items-center justify-center border border-[#334155] cursor-pointer"
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
                className={`rounded-xl p-4 border transition-colors ${
                  q.completed
                    ? 'bg-[#112233] border-[#ffd166]'
                    : 'bg-[#060d18]/90 border-[#1e293b]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {q.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#ffd166] shrink-0" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-[#38bdf8] shrink-0" />
                      )}
                      <h3 className="text-sm sm:text-base font-black text-[#f8fafc]">
                        {loc.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[#cbd5e1] mt-1 leading-relaxed">
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
                <div className="w-full h-2 bg-[#020617] rounded-sm overflow-hidden mt-3 border border-[#1e293b]">
                  <div
                    className={`h-full transition-all duration-300 ${
                      q.completed ? 'bg-[#ffd166]' : 'bg-[#38bdf8]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Footer: Rewards & Claim Action */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-[#1e293b]">
                  <div className="flex items-center gap-3 text-xs text-[#cbd5e1] tabular-nums">
                    <span className="flex items-center gap-1 font-bold text-[#ffd166]">
                      <Sun className="w-3.5 h-3.5" />
                      {isFa ? `+${q.rewardSeeds} گوی اختری` : `+${q.rewardSeeds} Orbs`}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-bold text-[#38bdf8]">
                      {isFa ? `+${q.rewardScore} افتخار` : `+${q.rewardScore} Valor`}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-bold text-[#10b981]">
                      {isFa ? '+۱ جان' : '+1 HP'}
                    </span>
                  </div>

                  {q.claimed ? (
                    <span className="text-xs font-black text-[#10b981]">
                      {isFa ? 'دریافت شد ✓' : 'Claimed ✓'}
                    </span>
                  ) : q.completed ? (
                    <button
                      type="button"
                      onClick={() => onClaimQuest(q.id)}
                      aria-label={isFa ? `دریافت پاداش ${loc.title}` : `Claim Reward for ${loc.title}`}
                      className="px-3.5 py-1.5 rounded-lg bg-[#ffd166] hover:bg-[#fde047] text-[#060d18] font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{isFa ? 'دریافت پاداش' : 'Claim Reward'}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-[#64748b]">
                      {isFa ? 'در جریان...' : 'In Progress'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions: Reroll New Objectives & Close */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1e293b]">
          <button
            type="button"
            onClick={onRerollQuests}
            aria-label={isFa ? 'دریافت پیمان‌های تصادفی جدید' : 'Roll New Daily Quests'}
            className="px-4 py-2.5 rounded-xl bg-[#112233] hover:bg-[#16293d] border border-[#38bdf8]/45 text-[#f8fafc] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>{isFa ? 'پیمان‌های جدید محفل' : 'New Contracts'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#060d18] font-black text-xs cursor-pointer"
          >
            {isFa ? 'بازگشت به نبرد' : 'Return to Realm'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Live 3D Warden Armor Customizer, Hero Mastery Skill Tree & Mythic Armory,
 * Citadel Sanctuary Decorator, Day/Night & Weather Controller,
 * and Weak-Phone Performance Optimizer (Persian & English).
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Swords,
  Home,
  CloudSun,
  Shuffle,
  Award,
  Gauge,
  Sun,
  CloudRain,
  Snowflake,
  Sparkles,
  Zap,
  Flame,
  Check,
  Lock,
} from 'lucide-react';
import {
  CUSTOMIZATION_OPTIONS,
  WEAPON_CATALOG,
  computeMasteryStats,
  type CharacterCustomization,
  type HomeBaseCustomization,
  type TrophyStatus,
  type WeatherType,
  type TimePhase,
  type PerformanceQuality,
  type RoofStyleType,
  type HearthStyleType,
  type GardenStyleType,
  type HeroMasteryState,
  type WeaponType,
} from '../game/rules';
import {
  BODY_TYPE_LABELS,
  FACIAL_FEATURE_LABELS,
  HAIRSTYLE_LABELS,
  CLOTHING_STYLE_LABELS,
  ROOF_STYLE_LABELS,
  HEARTH_STYLE_LABELS,
  GARDEN_STYLE_LABELS,
  WEATHER_LABELS,
  TIME_PHASE_LABELS,
  PERFORMANCE_LABELS,
  type Language,
} from '../game/i18n';

interface CustomizeAndBaseModalProps {
  mode: 'none' | 'hero' | 'mastery' | 'home' | 'atmosphere';
  onClose: () => void;
  characterCustom: CharacterCustomization;
  onUpdateCharacter: (next: CharacterCustomization) => void;
  heroMastery?: HeroMasteryState;
  onUpgradeSkill?: (
    skillKey: 'attackPowerLevel' | 'critChanceLevel' | 'staminaMaxLevel' | 'cooldownHasteLevel'
  ) => void;
  onEquipOrUnlockWeapon?: (weaponId: WeaponType) => void;
  homeBaseCustom: HomeBaseCustomization;
  onUpdateHomeBase: (next: HomeBaseCustomization) => void;
  trophies: TrophyStatus;
  weather: WeatherType;
  onSetWeather: (w: WeatherType) => void;
  timePhase: TimePhase;
  onSetTimePhase: (p: TimePhase) => void;
  autoDayNight: boolean;
  onToggleAutoDayNight: () => void;
  performanceQuality: PerformanceQuality;
  onSetPerformanceQuality: (q: PerformanceQuality) => void;
  lang: Language;
}

export const CustomizeAndBaseModal: React.FC<CustomizeAndBaseModalProps> = ({
  mode,
  onClose,
  characterCustom,
  onUpdateCharacter,
  heroMastery,
  onUpgradeSkill,
  onEquipOrUnlockWeapon,
  homeBaseCustom,
  onUpdateHomeBase,
  trophies,
  weather,
  onSetWeather,
  timePhase,
  onSetTimePhase,
  autoDayNight,
  onToggleAutoDayNight,
  performanceQuality,
  onSetPerformanceQuality,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'mastery' | 'home' | 'atmosphere'>(
    mode === 'none' ? 'hero' : mode
  );

  useEffect(() => {
    if (mode !== 'none') {
      setActiveTab(mode);
    }
  }, [mode]);

  if (mode === 'none') return null;

  const isFa = lang === 'fa';
  const masteryStats = heroMastery ? computeMasteryStats(heroMastery) : null;

  const handleRandomizeHero = () => {
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    onUpdateCharacter({
      bodyType: pick(CUSTOMIZATION_OPTIONS.bodyTypes).id,
      skinColor: pick(CUSTOMIZATION_OPTIONS.skinColors).hex,
      hairstyle: pick(CUSTOMIZATION_OPTIONS.hairstyles).id,
      hairColor: pick(CUSTOMIZATION_OPTIONS.hairColors).hex,
      facialFeature: pick(CUSTOMIZATION_OPTIONS.facialFeatures).id,
      clothing: pick(CUSTOMIZATION_OPTIONS.clothingStyles).id,
      clothingColor: pick(CUSTOMIZATION_OPTIONS.clothingColors).hex,
    });
  };

  return (
    <div
      role="dialog"
      dir={isFa ? 'rtl' : 'ltr'}
      aria-label="Warden Armor, Skill Tree, Citadel Base, and Atmosphere Customization"
      className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-5 pointer-events-none flex justify-center select-none"
    >
      <div className="w-full max-w-2xl max-h-[65vh] overflow-y-auto bg-[#0b1520]/96 border-2 border-[#ffd166]/80 rounded-3xl p-4 sm:p-5 shadow-2xl text-[#f8fafc] pointer-events-auto flex flex-col gap-3">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('mastery')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'mastery'
                  ? 'bg-[#38bdf8] text-[#081018]'
                  : 'bg-[#16293d] text-[#94a3b8] hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>{isFa ? 'درخت مهارت و سلاح' : 'Skills & Armory'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hero')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'hero'
                  ? 'bg-[#ffd166] text-[#081018]'
                  : 'bg-[#16293d] text-[#94a3b8] hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isFa ? 'زره قهرمان' : 'Warden Armor'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#ffd166] text-[#081018]'
                  : 'bg-[#16293d] text-[#94a3b8] hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{isFa ? 'دژ اختران و تندیس‌ها' : 'Citadel & Relics'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('atmosphere')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'atmosphere'
                  ? 'bg-[#38bdf8] text-[#081018]'
                  : 'bg-[#16293d] text-[#94a3b8] hover:text-white'
              }`}
            >
              <CloudSun className="w-3.5 h-3.5" />
              <span>{isFa ? 'اقلیم و گرافیک' : 'World & 60FPS'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Customizer"
            className="w-8 h-8 rounded-xl bg-[#16293d] hover:bg-[#1e3a5f] flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TAB 0: HERO MASTERY SKILL TREE & MYTHIC ARMORY */}
        {activeTab === 'mastery' && heroMastery && (
          <div className="flex flex-col gap-3 text-xs">
            {/* Top Shards & Combat Stats Summary */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#112233] p-3 rounded-2xl border border-[#38bdf8]/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1e1b4b] border border-[#38bdf8] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#94a3b8]">
                    {isFa ? 'شظیه‌های اختری در اختیار' : 'Available Astral Shards'}
                  </div>
                  <div className="text-sm font-black text-[#ffd166] tabular-nums">
                    {heroMastery.astralShards}{' '}
                    <span className="text-[10px] text-[#38bdf8]">
                      {isFa ? 'شظیه اختری' : 'Shards'}
                    </span>
                  </div>
                </div>
              </div>

              {masteryStats && (
                <div className="flex flex-wrap items-center gap-3 text-[11px]">
                  <div>
                    <span className="text-[#94a3b8]">{isFa ? 'قدرت حمله: ' : 'ATK: '}</span>
                    <span className="font-black text-[#ffd166] tabular-nums">
                      {Math.round(masteryStats.damageMultiplier * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">{isFa ? 'ضربه بحرانی: ' : 'CRIT: '}</span>
                    <span className="font-black text-[#38bdf8] tabular-nums">
                      {Math.round(masteryStats.critChance * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">{isFa ? 'استقامت: ' : 'STA: '}</span>
                    <span className="font-black text-[#10b981] tabular-nums">
                      {masteryStats.maxStamina}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 4 Skill Tree Upgrade Nodes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(
                [
                  {
                    key: 'attackPowerLevel' as const,
                    level: heroMastery.attackPowerLevel,
                    titleFa: 'قدرت شکاف اختری',
                    titleEn: 'Astral Might (ATK)',
                    descFa: '+۱۸٪ قدرت آسیب کمبو و ابرنواختر در هر سطح',
                    descEn: '+18% Combo & Supernova Damage per Rank',
                    icon: Flame,
                  },
                  {
                    key: 'critChanceLevel' as const,
                    level: heroMastery.critChanceLevel,
                    titleFa: 'دقت ضربه بحرانی',
                    titleEn: 'Lethal Precision (CRIT)',
                    descFa: '+۷٪ شانس ضربه بحرانی (۱.۷۵ برابر آسیب)',
                    descEn: '+7% Critical Strike Chance (1.75x DMG)',
                    icon: Zap,
                  },
                  {
                    key: 'staminaMaxLevel' as const,
                    level: heroMastery.staminaMaxLevel,
                    titleFa: 'ظرفیت استقامت جنگجو',
                    titleEn: 'Warden Endurance (STA)',
                    descFa: '+۲۰ استقامت حداکثر برای جاخالی و مهارت‌ها',
                    descEn: '+20 Max Stamina for Evade & Supernova',
                    icon: Shield,
                  },
                  {
                    key: 'cooldownHasteLevel' as const,
                    level: heroMastery.cooldownHasteLevel,
                    titleFa: 'شتاب رونیک مهارت‌ها',
                    titleEn: 'Runic Haste (CDR)',
                    descFa: '۱۰٪ کاهش زمان بازیابی مهارت‌ها در هر سطح',
                    descEn: '10% Faster Cooldown Recovery per Rank',
                    icon: Sparkles,
                  },
                ] as const
              ).map((node) => {
                const Icon = node.icon;
                const isMax = node.level >= 5;
                const cost = node.level * 12;
                const canAfford = !isMax && heroMastery.astralShards >= cost;
                return (
                  <div
                    key={node.key}
                    className="bg-[#112233] p-2.5 rounded-xl border border-[#1e3a5f] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-[#ffd166] shrink-0" />
                        <span className="font-black text-white truncate">
                          {isFa ? node.titleFa : node.titleEn}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#1e293b] text-[#38bdf8] text-[10px] font-black tabular-nums">
                          Lv.{node.level}/5
                        </span>
                      </div>
                      <p className="text-[10px] text-[#94a3b8] mt-0.5">{isFa ? node.descFa : node.descEn}</p>
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford || isMax}
                      onClick={() => onUpgradeSkill?.(node.key)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black shrink-0 transition-all ${
                        isMax
                          ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 cursor-default'
                          : canAfford
                          ? 'bg-[#ffd166] hover:bg-[#fde047] text-[#081018] cursor-pointer shadow-md'
                          : 'bg-[#1e293b] text-[#64748b] cursor-not-allowed'
                      }`}
                    >
                      {isMax
                        ? isFa
                          ? 'حداکثر'
                          : 'MAX'
                        : isFa
                        ? `ارتقا (${cost}✦)`
                        : `UPGRADE (${cost}✦)`}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* 3D Mythic Armory Weapons */}
            <div className="bg-[#112233] p-3 rounded-xl border border-[#1e3a5f]">
              <div className="flex items-center gap-1.5 mb-2">
                <Swords className="w-4 h-4 text-[#ffd166]" />
                <span className="text-[11px] font-black text-[#ffd166] uppercase">
                  {isFa
                    ? 'زرادخانه سلاح‌های اسطوره‌ای سه‌بعدی (تغییر آنی سلاح در دست قهرمان)'
                    : '3D Mythic Weapon Armory (Live 3D Weapon Swap)'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {WEAPON_CATALOG.map((w) => {
                  const isUnlocked = heroMastery.unlockedWeapons.includes(w.id);
                  const isEquipped = heroMastery.equippedWeapon === w.id;
                  const canUnlock = !isUnlocked && heroMastery.astralShards >= w.unlockCost;
                  return (
                    <div
                      key={w.id}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 ${
                        isEquipped
                          ? 'bg-[#1e3a5f]/80 border-[#ffd166]'
                          : 'bg-[#0b1520] border-[#1e293b]'
                      }`}
                    >
                      <div>
                        <div className="font-black text-xs text-white">
                          {isFa ? w.nameFa : w.nameEn}
                        </div>
                        <p className="text-[10px] text-[#94a3b8] mt-0.5 leading-snug">
                          {isFa ? w.descFa : w.descEn}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={!isUnlocked && !canUnlock}
                        onClick={() => onEquipOrUnlockWeapon?.(w.id)}
                        className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 ${
                          isEquipped
                            ? 'bg-[#10b981] text-[#081018] cursor-default'
                            : isUnlocked
                            ? 'bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#081018] cursor-pointer'
                            : canUnlock
                            ? 'bg-[#ffd166] hover:bg-[#fde047] text-[#081018] cursor-pointer'
                            : 'bg-[#1e293b] text-[#64748b] cursor-not-allowed'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{isFa ? 'مجهز شده' : 'EQUIPPED'}</span>
                          </>
                        ) : isUnlocked ? (
                          <span>{isFa ? 'تجهیز سلاح' : 'EQUIP'}</span>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>
                              {isFa ? `گشودن (${w.unlockCost}✦)` : `UNLOCK (${w.unlockCost}✦)`}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: HERO CUSTOMIZATION */}
        {activeTab === 'hero' && (
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#94a3b8] font-semibold">
                {isFa
                  ? 'شخصی‌سازی زنده سه‌بعدی زره، تاج و شنل نگهبان اختران — ذخیره خودکار!'
                  : 'Customize your Astral Warden Armor, Helm & Mantle in live 3D — saved automatically!'}
              </span>
              <button
                type="button"
                onClick={handleRandomizeHero}
                className="px-3 py-1 bg-[#ffd166] text-[#060d18] font-black rounded-lg flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <Shuffle className="w-3 h-3" />
                <span>{isFa ? 'ترکیب تصادفی' : 'Randomize Look'}</span>
              </button>
            </div>

            {/* Body Type & Facial Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-[#112233] p-2.5 rounded-xl border border-[#1e3a5f]">
                <span className="text-[10px] font-bold text-[#38bdf8] uppercase block mb-1.5">
                  {isFa ? 'فرم زره و قامت جنگجو' : 'Armor Stance & Build'}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {CUSTOMIZATION_OPTIONS.bodyTypes.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onUpdateCharacter({ ...characterCustom, bodyType: b.id })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer ${
                        characterCustom.bodyType === b.id
                          ? 'bg-[#38bdf8] text-[#060d18]'
                          : 'bg-[#0b1520] text-[#cbd5e1] border border-[#1e293b]'
                      }`}
                    >
                      {BODY_TYPE_LABELS[lang][b.id]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#112233] p-2.5 rounded-xl border border-[#1e3a5f]">
                <span className="text-[10px] font-bold text-[#38bdf8] uppercase block mb-1.5">
                  {isFa ? 'نقاب و نشان چهره' : 'Visor & Battle Markings'}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {CUSTOMIZATION_OPTIONS.facialFeatures.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onUpdateCharacter({ ...characterCustom, facialFeature: f.id })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer ${
                        characterCustom.facialFeature === f.id
                          ? 'bg-[#38bdf8] text-[#060d18]'
                          : 'bg-[#0b1520] text-[#cbd5e1] border border-[#1e293b]'
                      }`}
                    >
                      {FACIAL_FEATURE_LABELS[lang][f.id]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hairstyle & Clothing Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-[#112233] p-2.5 rounded-xl border border-[#1e3a5f]">
                <span className="text-[10px] font-bold text-[#38bdf8] uppercase block mb-1.5">
                  {isFa ? 'تاج و کلاه‌خود اسطوره‌ای' : 'Mythic Crest & Helm'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CUSTOMIZATION_OPTIONS.hairstyles.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => onUpdateCharacter({ ...characterCustom, hairstyle: h.id })}
                      className={`py-1 px-2.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                        characterCustom.hairstyle === h.id
                          ? 'bg-[#ffd166] text-[#060d18]'
                          : 'bg-[#0b1520] text-[#cbd5e1] border border-[#1e293b]'
                      }`}
                    >
                      {HAIRSTYLE_LABELS[lang][h.id]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#112233] p-2.5 rounded-xl border border-[#1e3a5f]">
                <span className="text-[10px] font-bold text-[#38bdf8] uppercase block mb-1.5">
                  {isFa ? 'شنل و ردای نگهبان' : 'Warden Mantle & Regalia'}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {CUSTOMIZATION_OPTIONS.clothingStyles.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onUpdateCharacter({ ...characterCustom, clothing: c.id })}
                      className={`py-1 px-2 rounded-lg text-[11px] font-bold cursor-pointer ${
                        characterCustom.clothing === c.id
                          ? 'bg-[#ffd166] text-[#060d18]'
                          : 'bg-[#0b1520] text-[#cbd5e1] border border-[#1e293b]'
                      }`}
                    >
                      {CLOTHING_STYLE_LABELS[lang][c.id]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Color Swatches: Armor Alloy, Crest Glow, Mantle Dye */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-[#112233] p-2.5 rounded-xl border border-[#1e3a5f]">
                <span className="text-[10px] font-bold text-[#38bdf8] uppercase block mb-1.5">
                  {isFa ? 'آلیاژ زره' : 'Armor Alloy Tone'}
                </span>
                <div className="flex items-center gap-1.5">
                  {CUSTOMIZATION_OPTIONS.skinColors.map((s) => (
                    <button
                      key={s.hex}
                      type="button"
                      aria-label={s.label}
                      onClick={() => onUpdateCharacter({ ...characterCustom, skinColor: s.hex })}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                        characterCustom.skinColor === s.hex ? 'border-white scale-115' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: s.hex }}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-[#112233] p-2.5 rounded-xl border border-[#1e3a5f]">
                <span className="text-[10px] font-bold text-[#38bdf8] uppercase block mb-1.5">
                  {isFa ? 'درخشش تاج و رون‌ها' : 'Crest & Rune Glow'}
                </span>
                <div className="flex items-center gap-1.5">
                  {CUSTOMIZATION_OPTIONS.hairColors.map((h) => (
                    <button
                      key={h.hex}
                      type="button"
                      aria-label={h.label}
                      onClick={() => onUpdateCharacter({ ...characterCustom, hairColor: h.hex })}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                        characterCustom.hairColor === h.hex ? 'border-white scale-115' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: h.hex }}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-[#112233] p-2.5 rounded-xl border border-[#1e3a5f]">
                <span className="text-[10px] font-bold text-[#38bdf8] uppercase block mb-1.5">
                  {isFa ? 'رنگ شنل و زره سینه' : 'Mantle & Cuirass Dye'}
                </span>
                <div className="flex items-center gap-1.5">
                  {CUSTOMIZATION_OPTIONS.clothingColors.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      aria-label={c.label}
                      onClick={() => onUpdateCharacter({ ...characterCustom, clothingColor: c.hex })}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                        characterCustom.clothingColor === c.hex ? 'border-white scale-115' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASTRAL BASTION CITADEL & RELIC MONUMENTS */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-3 text-xs">
            <p className="text-[11px] text-[#94a3b8]">
              {isFa
                ? 'دژ اختران در جنوب قلمرو، سپاهیان خلأ را دفع کرده و جان و استقامت کائِلِن را بازیابی می‌کند!'
                : 'Your Astral Bastion Keep in the southern realm repels Void Legions and restores Kaelen’s vitality!'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-[#112233] p-2.5 rounded-xl border border-[#1e3a5f]">
                <span className="text-[10px] font-bold text-[#38bdf8] uppercase block mb-1.5">
                  {isFa ? 'گنبد مناره دژ' : 'Bastion Spire Dome'}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['moss', 'terracotta', 'slate', 'sakura'] as RoofStyleType[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => onUpdateHomeBase({ ...homeBaseCustom, roofStyle: r })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer ${
                        homeBaseCustom.roofStyle === r
                          ? 'bg-[#ffd166] text-[#060d18]'
                          : 'bg-[#0b1520] text-[#cbd5e1] border border-[#1e293b]'
                      }`}
                    >
                      {ROOF_STYLE_LABELS[lang][r]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#112233] p-2.5 rounded-xl border border-[#1e3a5f]">
                <span className="text-[10px] font-bold text-[#38bdf8] uppercase block mb-1.5">
                  {isFa ? 'کانون انرژی اختری' : 'Astral Nexus Core'}
                </span>
                <div className="flex flex-col gap-1">
                  {(['campfire', 'fountain', 'lantern'] as HearthStyleType[]).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => onUpdateHomeBase({ ...homeBaseCustom, hearthStyle: h })}
                      className={`py-1 px-2 rounded-lg text-[11px] font-bold cursor-pointer ${
                        homeBaseCustom.hearthStyle === h
                          ? 'bg-[#ffd166] text-[#060d18]'
                          : 'bg-[#0b1520] text-[#cbd5e1] border border-[#1e293b]'
                      }`}
                    >
                      {HEARTH_STYLE_LABELS[lang][h]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#112233] p-2.5 rounded-xl border border-[#1e3a5f]">
                <span className="text-[10px] font-bold text-[#38bdf8] uppercase block mb-1.5">
                  {isFa ? 'حلقه دفاعی دژ' : 'Bastion Ward Ring'}
                </span>
                <div className="flex flex-col gap-1">
                  {(['flowers', 'mushrooms', 'stones'] as GardenStyleType[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => onUpdateHomeBase({ ...homeBaseCustom, gardenStyle: g })}
                      className={`py-1 px-2 rounded-lg text-[11px] font-bold cursor-pointer ${
                        homeBaseCustom.gardenStyle === g
                          ? 'bg-[#ffd166] text-[#060d18]'
                          : 'bg-[#0b1520] text-[#cbd5e1] border border-[#1e293b]'
                      }`}
                    >
                      {GARDEN_STYLE_LABELS[lang][g]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Trophy Pedestals Display */}
            <div className="bg-[#112233] p-3 rounded-xl border border-[#1e3a5f]">
              <div className="flex items-center gap-1.5 mb-2">
                <Award className="w-4 h-4 text-[#ffd166]" />
                <span className="text-[11px] font-black text-[#ffd166] uppercase">
                  {isFa ? 'تندیس‌های افتخار سه‌بعدی در صحن دژ اختران' : 'Bastion 3D Relic Monuments'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {
                    unlocked: trophies.shrineTrophy,
                    title: isFa ? 'بیدارگر مناره‌ها' : 'Obelisk Awakener',
                    req: isFa ? 'احیای ۱ مناره' : 'Restore 1+ Obelisk',
                  },
                  {
                    unlocked: trophies.cleanserTrophy,
                    title: isFa ? 'شکارچی سپاه خلأ' : 'Void Slayer',
                    req: isFa ? 'پاکسازی ۳ دشمن' : 'Vanquish 3+ Foes',
                  },
                  {
                    unlocked: trophies.seedHoarderTrophy,
                    title: isFa ? 'خزانه اختران' : 'Astral Hoard',
                    req: isFa ? 'کسب ۳۰۰ افتخار' : 'Reach 300+ Valor',
                  },
                  {
                    unlocked: trophies.guardianCrownTrophy,
                    title: isFa ? 'تاج فرمانروای خلأ' : 'Sovereign Crown',
                    req: isFa ? 'شکست مالاکور' : 'Vanquish Malakor',
                  },
                ].map((tr) => (
                  <div
                    key={tr.title}
                    className={`p-2 rounded-lg border text-center ${
                      tr.unlocked
                        ? 'bg-[#1e3a5f]/75 border-[#ffd166] text-white'
                        : 'bg-[#0b1520]/60 border-[#1e293b] text-white/40'
                    }`}
                  >
                    <div className="font-black text-[11px]">{tr.title}</div>
                    <div className="text-[9px] mt-0.5 text-[#38bdf8]">
                      {tr.unlocked ? (isFa ? '★ برافراشته در دژ' : '★ Erected in Keep') : tr.req}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WEATHER, DAY/NIGHT & PERFORMANCE */}
        {activeTab === 'atmosphere' && (
          <div className="flex flex-col gap-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Weather Controls */}
              <div className="bg-[#112233] p-3 rounded-xl border border-[#1e3a5f]">
                <span className="text-[10px] font-bold text-[#38bdf8] uppercase block mb-2">
                  {isFa ? 'پدیده‌های جوی و اقلیمی' : 'Realm Weather & Buffs'}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'sunshine' as WeatherType, icon: Sun },
                    { id: 'rain' as WeatherType, icon: CloudRain },
                    { id: 'snow' as WeatherType, icon: Snowflake },
                    { id: 'petals' as WeatherType, icon: Sparkles },
                  ].map((w) => {
                    const Icon = w.icon;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => onSetWeather(w.id)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer ${
                          weather === w.id
                            ? 'bg-[#38bdf8] text-[#060d18]'
                            : 'bg-[#0b1520] text-[#cbd5e1] border border-[#1e293b]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{WEATHER_LABELS[lang][w.id]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time of Day */}
              <div className="bg-[#112233] p-3 rounded-xl border border-[#1e3a5f]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#38bdf8] uppercase">
                    {isFa ? 'چرخه کیهانی شبانه‌روز' : 'Celestial Cycle'}
                  </span>
                  <button
                    type="button"
                    onClick={onToggleAutoDayNight}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      autoDayNight ? 'bg-[#10b981] text-[#060d18]' : 'bg-[#1e293b] text-white'
                    }`}
                  >
                    {isFa
                      ? autoDayNight
                        ? 'چرخش خودکار: روشن'
                        : 'چرخش خودکار: خاموش'
                      : autoDayNight
                      ? 'Auto Cycle: ON'
                      : 'Auto Cycle: OFF'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['dawn', 'day', 'sunset', 'night'] as TimePhase[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onSetTimePhase(p)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                        timePhase === p
                          ? 'bg-[#ffd166] text-[#060d18]'
                          : 'bg-[#0b1520] text-[#cbd5e1] border border-[#1e293b]'
                      }`}
                    >
                      {TIME_PHASE_LABELS[lang][p]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scalable GPU Graphics & Detail Selector */}
            <div className="bg-[#112233] p-3 rounded-xl border border-[#1e3a5f] flex flex-col gap-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-[#38bdf8] shrink-0" />
                  <div>
                    <span className="font-bold text-white block">
                      {isFa
                        ? 'سطح گرافیک سه‌بعدی و جزئیات شیدر (موبایل اقتصادی تا پرچمدار Ultra)'
                        : '3D Graphics & Shader Fidelity (Mobile Eco to Flagship Ultra)'}
                    </span>
                    <span className="text-[10px] text-[#94a3b8]">
                      {isFa
                        ? performanceQuality === 'eco'
                          ? 'حالت اقتصادی: بهینه‌سازی شیدرها و حذف سایه‌های سنگین برای اجرای روان ۶۰ فریم در ثانیه.'
                          : performanceQuality === 'balanced'
                          ? 'حالت متعادل: فعال‌سازی هاله رونیک کائِلِن، دریاچه اختری، دروازه‌های سنگی و سایه‌های استاندارد.'
                          : performanceQuality === 'high'
                          ? 'کیفیت بالا: بافت برجسته PBR صخره‌ها، مدل کامل کائِلِن و مالاکور ۱۴بخشی.'
                          : 'حالت اولترا (پرچمدار): حداکثر جزئیات سه‌بعدی، بازتاب دریاچه اختری، بلورهای شب‌تاب و رزولوشن ۲ برابر.'
                        : performanceQuality === 'eco'
                        ? 'Eco: Streamlined shaders and shadows for locked 60 FPS on mobile devices.'
                        : performanceQuality === 'balanced'
                        ? 'Balanced: Enables Kaelen’s runic halo, Astral Mirror Lake, monolith arches & shadows.'
                        : performanceQuality === 'high'
                        ? 'High: Full PBR surface relief, articulated Warden rig & 14-part Sovereign Boss.'
                        : 'Ultra (Flagship): Maximum geometric & shader fidelity, reflective lake & 2x resolution.'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  {(['eco', 'balanced', 'high', 'ultra'] as PerformanceQuality[]).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => onSetPerformanceQuality(q)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black cursor-pointer transition-colors ${
                        performanceQuality === q
                          ? q === 'ultra'
                            ? 'bg-[#ffd166] text-[#060d18] shadow-md'
                            : 'bg-[#38bdf8] text-[#060d18]'
                          : 'bg-[#0b1520] text-[#cbd5e1] hover:bg-[#16293d] border border-[#1e293b]'
                      }`}
                    >
                      {PERFORMANCE_LABELS[lang][q]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

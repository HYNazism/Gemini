/**
 * Live 3D Character Customizer, Cozy Home Base Sanctuary Decorator,
 * Day/Night & Weather Controller, and Weak-Phone Performance Optimizer.
 */

import React, { useState } from 'react';
import {
  X,
  User,
  Home,
  CloudSun,
  Shuffle,
  Award,
  Gauge,
  Sun,
  CloudRain,
  Snowflake,
  Sparkles,
} from 'lucide-react';
import {
  CUSTOMIZATION_OPTIONS,
  type CharacterCustomization,
  type HomeBaseCustomization,
  type TrophyStatus,
  type WeatherType,
  type TimePhase,
  type PerformanceQuality,
  type RoofStyleType,
  type HearthStyleType,
  type GardenStyleType,
} from '../game/rules';

interface CustomizeAndBaseModalProps {
  mode: 'none' | 'hero' | 'home' | 'atmosphere';
  onClose: () => void;
  characterCustom: CharacterCustomization;
  onUpdateCharacter: (next: CharacterCustomization) => void;
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
}

export const CustomizeAndBaseModal: React.FC<CustomizeAndBaseModalProps> = ({
  mode,
  onClose,
  characterCustom,
  onUpdateCharacter,
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
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'home' | 'atmosphere'>(
    mode === 'none' ? 'hero' : mode
  );

  if (mode === 'none') return null;

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
      aria-label="Character, Home Base, and Atmosphere Customization"
      className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-5 pointer-events-none flex justify-center select-none"
    >
      <div className="w-full max-w-2xl max-h-[62vh] overflow-y-auto bg-[#1b4332]/95 border-2 border-[#709775] rounded-3xl p-4 sm:p-5 shadow-2xl text-[#e9f5db] pointer-events-auto flex flex-col gap-3">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-[#2d6a4f] pb-2.5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('hero')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'hero'
                  ? 'bg-[#80b918] text-[#081c15]'
                  : 'bg-[#0f281e] text-[#95d5b2] hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Hero Style</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#ffd166] text-[#081c15]'
                  : 'bg-[#0f281e] text-[#95d5b2] hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Sanctuary Base</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('atmosphere')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'atmosphere'
                  ? 'bg-[#48cae4] text-[#03045e]'
                  : 'bg-[#0f281e] text-[#95d5b2] hover:text-white'
              }`}
            >
              <CloudSun className="w-3.5 h-3.5" />
              <span>Weather & FPS</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Customizer"
            className="w-8 h-8 rounded-xl bg-[#2d6a4f] hover:bg-[#40916c] flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TAB 1: HERO CUSTOMIZATION */}
        {activeTab === 'hero' && (
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#95d5b2] font-semibold">
                Customize Pip in live 3D — saved automatically!
              </span>
              <button
                type="button"
                onClick={handleRandomizeHero}
                className="px-3 py-1 bg-[#ffd166] text-[#081c15] font-black rounded-lg flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <Shuffle className="w-3 h-3" />
                <span>Randomize Look</span>
              </button>
            </div>

            {/* Body Type & Facial Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f]">
                <span className="text-[10px] font-bold text-[#95d5b2] uppercase block mb-1.5">
                  Body Silhouette
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {CUSTOMIZATION_OPTIONS.bodyTypes.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onUpdateCharacter({ ...characterCustom, bodyType: b.id })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer ${
                        characterCustom.bodyType === b.id
                          ? 'bg-[#52b788] text-[#081c15]'
                          : 'bg-[#1b4332] text-[#d8f3dc]'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f]">
                <span className="text-[10px] font-bold text-[#95d5b2] uppercase block mb-1.5">
                  Facial Features
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {CUSTOMIZATION_OPTIONS.facialFeatures.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onUpdateCharacter({ ...characterCustom, facialFeature: f.id })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer ${
                        characterCustom.facialFeature === f.id
                          ? 'bg-[#52b788] text-[#081c15]'
                          : 'bg-[#1b4332] text-[#d8f3dc]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hairstyle & Clothing Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f]">
                <span className="text-[10px] font-bold text-[#95d5b2] uppercase block mb-1.5">
                  Hairstyle & Headpiece
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CUSTOMIZATION_OPTIONS.hairstyles.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => onUpdateCharacter({ ...characterCustom, hairstyle: h.id })}
                      className={`py-1 px-2.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                        characterCustom.hairstyle === h.id
                          ? 'bg-[#ffd166] text-[#081c15]'
                          : 'bg-[#1b4332] text-[#d8f3dc]'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f]">
                <span className="text-[10px] font-bold text-[#95d5b2] uppercase block mb-1.5">
                  Woodland Outfit & Cloak
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {CUSTOMIZATION_OPTIONS.clothingStyles.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onUpdateCharacter({ ...characterCustom, clothing: c.id })}
                      className={`py-1 px-2 rounded-lg text-[11px] font-bold cursor-pointer ${
                        characterCustom.clothing === c.id
                          ? 'bg-[#ffd166] text-[#081c15]'
                          : 'bg-[#1b4332] text-[#d8f3dc]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Color Swatches: Skin, Hair, Clothing */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f]">
                <span className="text-[10px] font-bold text-[#95d5b2] uppercase block mb-1.5">
                  Sprout / Skin Tone
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

              <div className="bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f]">
                <span className="text-[10px] font-bold text-[#95d5b2] uppercase block mb-1.5">
                  Hair / Foliage Color
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

              <div className="bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f]">
                <span className="text-[10px] font-bold text-[#95d5b2] uppercase block mb-1.5">
                  Outfit Dye
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

        {/* TAB 2: COZY HOME BASE SANCTUARY & TROPHIES */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-3 text-xs">
            <p className="text-[11px] text-[#95d5b2]">
              Your Sanctuary in the southern meadow repels all gloomlings and gently heals Pip!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f]">
                <span className="text-[10px] font-bold text-[#95d5b2] uppercase block mb-1.5">
                  Cottage Roof
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['moss', 'terracotta', 'slate', 'sakura'] as RoofStyleType[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => onUpdateHomeBase({ ...homeBaseCustom, roofStyle: r })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold capitalize cursor-pointer ${
                        homeBaseCustom.roofStyle === r
                          ? 'bg-[#ffd166] text-[#081c15]'
                          : 'bg-[#1b4332] text-[#d8f3dc]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f]">
                <span className="text-[10px] font-bold text-[#95d5b2] uppercase block mb-1.5">
                  Warm Hearth
                </span>
                <div className="flex flex-col gap-1">
                  {(['campfire', 'fountain', 'lantern'] as HearthStyleType[]).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => onUpdateHomeBase({ ...homeBaseCustom, hearthStyle: h })}
                      className={`py-1 px-2 rounded-lg text-[11px] font-bold capitalize cursor-pointer ${
                        homeBaseCustom.hearthStyle === h
                          ? 'bg-[#ffd166] text-[#081c15]'
                          : 'bg-[#1b4332] text-[#d8f3dc]'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f]">
                <span className="text-[10px] font-bold text-[#95d5b2] uppercase block mb-1.5">
                  Garden Ring
                </span>
                <div className="flex flex-col gap-1">
                  {(['flowers', 'mushrooms', 'stones'] as GardenStyleType[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => onUpdateHomeBase({ ...homeBaseCustom, gardenStyle: g })}
                      className={`py-1 px-2 rounded-lg text-[11px] font-bold capitalize cursor-pointer ${
                        homeBaseCustom.gardenStyle === g
                          ? 'bg-[#ffd166] text-[#081c15]'
                          : 'bg-[#1b4332] text-[#d8f3dc]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Trophy Pedestals Display */}
            <div className="bg-[#0f281e] p-3 rounded-xl border border-[#2d6a4f]">
              <div className="flex items-center gap-1.5 mb-2">
                <Award className="w-4 h-4 text-[#ffd166]" />
                <span className="text-[11px] font-black text-[#ffd166] uppercase">
                  Sanctuary 3D Trophy Pedestals
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { unlocked: trophies.shrineTrophy, title: 'Shrine Keeper', req: 'Restore 1+ Shrine' },
                  { unlocked: trophies.cleanserTrophy, title: 'Gloom Cleanser', req: 'Cleanse 3+ Critters' },
                  { unlocked: trophies.seedHoarderTrophy, title: 'Golden Hoard', req: 'Reach 300+ Score' },
                  { unlocked: trophies.guardianCrownTrophy, title: 'Elder Crown', req: 'Cleanse Elder Bramble' },
                ].map((tr) => (
                  <div
                    key={tr.title}
                    className={`p-2 rounded-lg border text-center ${
                      tr.unlocked
                        ? 'bg-[#2d6a4f]/60 border-[#ffd166] text-white'
                        : 'bg-[#1b4332]/40 border-[#2d6a4f] text-white/40'
                    }`}
                  >
                    <div className="font-black text-[11px]">{tr.title}</div>
                    <div className="text-[9px] mt-0.5">{tr.unlocked ? '★ Displayed' : tr.req}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WEATHER, DAY/NIGHT & WEAK PHONE PERFORMANCE */}
        {activeTab === 'atmosphere' && (
          <div className="flex flex-col gap-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Weather Controls */}
              <div className="bg-[#0f281e] p-3 rounded-xl border border-[#2d6a4f]">
                <span className="text-[10px] font-bold text-[#95d5b2] uppercase block mb-2">
                  Cozy Weather & Buffs
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'sunshine' as WeatherType, label: 'Sunshine (+Score)', icon: Sun },
                    { id: 'rain' as WeatherType, label: 'Rain (+Regen/Dash)', icon: CloudRain },
                    { id: 'snow' as WeatherType, label: 'Snow (Slows Foes)', icon: Snowflake },
                    { id: 'petals' as WeatherType, label: 'Sakura Breeze', icon: Sparkles },
                  ].map((w) => {
                    const Icon = w.icon;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => onSetWeather(w.id)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer ${
                          weather === w.id
                            ? 'bg-[#48cae4] text-[#03045e]'
                            : 'bg-[#1b4332] text-[#d8f3dc]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{w.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time of Day */}
              <div className="bg-[#0f281e] p-3 rounded-xl border border-[#2d6a4f]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#95d5b2] uppercase">
                    Day / Night Cycle
                  </span>
                  <button
                    type="button"
                    onClick={onToggleAutoDayNight}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      autoDayNight ? 'bg-[#06d6a0] text-[#081c15]' : 'bg-[#2d6a4f] text-white'
                    }`}
                  >
                    {autoDayNight ? 'Auto Cycle: ON' : 'Auto Cycle: OFF'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['dawn', 'day', 'sunset', 'night'] as TimePhase[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onSetTimePhase(p)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold capitalize cursor-pointer ${
                        timePhase === p
                          ? 'bg-[#ffd166] text-[#081c15]'
                          : 'bg-[#1b4332] text-[#d8f3dc]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Weak Phone / Old Android GPU Performance Selector */}
            <div className="bg-[#0f281e] p-3 rounded-xl border border-[#2d6a4f] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#06d6a0] shrink-0" />
                <div>
                  <span className="font-bold text-white block">
                    Old & Weak Phone Optimization (FPS Mode)
                  </span>
                  <span className="text-[10px] text-[#95d5b2]">
                    Eco mode disables heavy shadow maps and lowers resolution scale for smooth 60 FPS on budget Android phones.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {(
                  [
                    { id: 'eco', label: 'Eco (Weak Phones)' },
                    { id: 'balanced', label: 'Balanced' },
                    { id: 'high', label: 'High' },
                  ] as { id: PerformanceQuality; label: string }[]
                ).map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => onSetPerformanceQuality(q.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black cursor-pointer ${
                      performanceQuality === q.id
                        ? 'bg-[#06d6a0] text-[#081c15]'
                        : 'bg-[#1b4332] text-[#d8f3dc]'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

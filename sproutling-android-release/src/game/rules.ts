/**
 * Pure game rules, mathematical collision, state transitions, scoring,
 * character customization, day/night & weather modifiers, home base safe-zone,
 * and AdMob validation for Sproutling: Grove Guardian 3D.
 */

export type WeaponType = 'astral-glaive' | 'sunforged-greatsword' | 'runic-halberd';

export interface HeroMasteryState {
  astralShards: number;
  attackPowerLevel: number; // 1..5
  critChanceLevel: number; // 1..5
  staminaMaxLevel: number; // 1..5
  cooldownHasteLevel: number; // 1..5
  equippedWeapon: WeaponType;
  unlockedWeapons: WeaponType[];
}

export interface WeaponSpec {
  id: WeaponType;
  nameFa: string;
  nameEn: string;
  descFa: string;
  descEn: string;
  unlockCost: number;
  damageBonus: number;
  critBonus: number;
  reachMultiplier: number;
  primaryColorHex: number;
  emissiveHex: number;
}

export const WEAPON_CATALOG: WeaponSpec[] = [
  {
    id: 'astral-glaive',
    nameFa: 'ناگیناتای اخترتاب',
    nameEn: 'Astral Glaive',
    descFa: 'سلاح متوازن نگهبانان با سرعت برش بالا و شعاع قوسی دقیق',
    descEn: 'Balanced Warden polearm with swift crescent cleave and agile reach',
    unlockCost: 0,
    damageBonus: 1.0,
    critBonus: 0.05,
    reachMultiplier: 1.05,
    primaryColorHex: 0x38bdf8,
    emissiveHex: 0x0284c7,
  },
  {
    id: 'sunforged-greatsword',
    nameFa: 'شمشیر بزرگ خورشیدزاد',
    nameEn: 'Sunforged Greatsword',
    descFa: 'تیغه سنگین طلایی با +۲۸٪ قدرت برش و موج آتشین در ضربه سوم کمبو',
    descEn: 'Heavy golden blade dealing +28% strike damage and blazing finisher waves',
    unlockCost: 80,
    damageBonus: 1.28,
    critBonus: 0.08,
    reachMultiplier: 1.12,
    primaryColorHex: 0xfbbf24,
    emissiveHex: 0xd97706,
  },
  {
    id: 'runic-halberd',
    nameFa: 'تبر نیزه‌ای رونیک',
    nameEn: 'Runic Halberd',
    descFa: 'سلاح شکافنده زره با +۲۲٪ برد ضربه و +۱۵٪ شانس ضربه بحرانی',
    descEn: 'Armor-piercing halberd with +22% cleave radius and +15% critical strike chance',
    unlockCost: 120,
    damageBonus: 1.16,
    critBonus: 0.15,
    reachMultiplier: 1.22,
    primaryColorHex: 0x34d399,
    emissiveHex: 0x059669,
  },
];

export const DEFAULT_HERO_MASTERY: HeroMasteryState = {
  astralShards: 180,
  attackPowerLevel: 1,
  critChanceLevel: 1,
  staminaMaxLevel: 1,
  cooldownHasteLevel: 1,
  equippedWeapon: 'astral-glaive',
  unlockedWeapons: ['astral-glaive'],
};

const MASTERY_STORAGE_KEY = 'aethelgard_mastery_v1';

export function getSavedHeroMastery(): HeroMasteryState {
  if (typeof window === 'undefined') return { ...DEFAULT_HERO_MASTERY };
  try {
    const raw = window.localStorage.getItem(MASTERY_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_HERO_MASTERY };
    const parsed = JSON.parse(raw) as Partial<HeroMasteryState>;
    return {
      astralShards: typeof parsed.astralShards === 'number' ? parsed.astralShards : 180,
      attackPowerLevel: Math.max(1, Math.min(5, parsed.attackPowerLevel ?? 1)),
      critChanceLevel: Math.max(1, Math.min(5, parsed.critChanceLevel ?? 1)),
      staminaMaxLevel: Math.max(1, Math.min(5, parsed.staminaMaxLevel ?? 1)),
      cooldownHasteLevel: Math.max(1, Math.min(5, parsed.cooldownHasteLevel ?? 1)),
      equippedWeapon: parsed.equippedWeapon ?? 'astral-glaive',
      unlockedWeapons: Array.isArray(parsed.unlockedWeapons) && parsed.unlockedWeapons.length > 0
        ? parsed.unlockedWeapons
        : ['astral-glaive'],
    };
  } catch {
    return { ...DEFAULT_HERO_MASTERY };
  }
}

export function saveHeroMastery(state: HeroMasteryState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MASTERY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage quota errors
  }
}

export function getMasteryUpgradeCost(currentLevel: number): number {
  return currentLevel * 45;
}

export function upgradeHeroMasterySkill(
  state: HeroMasteryState,
  skillKey: 'attackPowerLevel' | 'critChanceLevel' | 'staminaMaxLevel' | 'cooldownHasteLevel'
): { state: HeroMasteryState; success: boolean } {
  const currentLvl = state[skillKey];
  if (currentLvl >= 5) return { state, success: false };
  const cost = getMasteryUpgradeCost(currentLvl);
  if (state.astralShards < cost) return { state, success: false };
  const next: HeroMasteryState = {
    ...state,
    astralShards: state.astralShards - cost,
    [skillKey]: currentLvl + 1,
  };
  saveHeroMastery(next);
  return { state: next, success: true };
}

export function selectOrUnlockWeapon(
  state: HeroMasteryState,
  weaponId: WeaponType
): { state: HeroMasteryState; success: boolean } {
  if (state.unlockedWeapons.includes(weaponId)) {
    const next: HeroMasteryState = { ...state, equippedWeapon: weaponId };
    saveHeroMastery(next);
    return { state: next, success: true };
  }
  const spec = WEAPON_CATALOG.find((w) => w.id === weaponId);
  if (!spec || state.astralShards < spec.unlockCost) {
    return { state, success: false };
  }
  const next: HeroMasteryState = {
    ...state,
    astralShards: state.astralShards - spec.unlockCost,
    unlockedWeapons: [...state.unlockedWeapons, weaponId],
    equippedWeapon: weaponId,
  };
  saveHeroMastery(next);
  return { state: next, success: true };
}

export function computeCombatStatsFromMastery(mastery: HeroMasteryState = DEFAULT_HERO_MASTERY) {
  const weapon = WEAPON_CATALOG.find((w) => w.id === mastery.equippedWeapon) || WEAPON_CATALOG[0];
  const damageMultiplier = (1 + (mastery.attackPowerLevel - 1) * 0.18) * weapon.damageBonus;
  const critChance = Math.min(0.75, 0.12 + (mastery.critChanceLevel - 1) * 0.08 + weapon.critBonus);
  const critMultiplier = 1.75 + (mastery.critChanceLevel - 1) * 0.15;
  const maxStamina = 100 + (mastery.staminaMaxLevel - 1) * 20;
  const staminaRegenPerSec = 28 + (mastery.staminaMaxLevel - 1) * 5;
  const cooldownMultiplier = 1 + (mastery.cooldownHasteLevel - 1) * 0.12;
  const reachMultiplier = weapon.reachMultiplier;

  return {
    damageMultiplier,
    critChance,
    critMultiplier,
    maxStamina,
    staminaRegenPerSec,
    cooldownMultiplier: 1 / cooldownMultiplier,
    reachMultiplier,
    radiusBonus: (reachMultiplier - 1.0) * 2.2,
    weaponSpec: weapon,
  };
}

export function createInitialHeroMastery(): HeroMasteryState {
  return {
    ...DEFAULT_HERO_MASTERY,
    unlockedWeapons: [...DEFAULT_HERO_MASTERY.unlockedWeapons],
  };
}

export function upgradeMasterySkill(
  state: HeroMasteryState,
  skillKey: 'attackPowerLevel' | 'critChanceLevel' | 'staminaMaxLevel' | 'cooldownHasteLevel'
): { mastery: HeroMasteryState; upgraded: boolean } {
  const currentLvl = state[skillKey];
  if (currentLvl >= 5) return { mastery: state, upgraded: false };
  const cost = currentLvl * 12;
  if (state.astralShards < cost) return { mastery: state, upgraded: false };
  const next: HeroMasteryState = {
    ...state,
    astralShards: state.astralShards - cost,
    [skillKey]: currentLvl + 1,
  };
  saveHeroMastery(next);
  return { mastery: next, upgraded: true };
}

export function unlockOrEquipWeapon(
  state: HeroMasteryState,
  weaponId: WeaponType
): { mastery: HeroMasteryState; success: boolean } {
  const res = selectOrUnlockWeapon(state, weaponId);
  return { mastery: res.state, success: res.success };
}

export const computeMasteryStats = computeCombatStatsFromMastery;

export type ComboStreakRank = 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';

export type ElementalInfusionType = 'none' | 'forest' | 'frost' | 'sun' | 'void';
export type AttackWeightTier = 'light' | 'medium' | 'heavy' | 'colossal';

export interface PlayerStats {
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  sunSeeds: number;
  score: number;
  comboCount: number;
  comboStep: number;
  comboWindowRemaining: number;
  lastAttackTime: number;
  dashCooldownRemaining: number;
  spinCooldownRemaining: number;
  isInvulnerable: boolean;
  invulnerableTimer: number;
  lastHitWasCrit: boolean;
  lastDamageDealt: number;
  perfectDodgeCount: number;
  parryWindowRemaining: number;
  parryCooldownRemaining: number;
  counterWindowRemaining: number;
  staminaBuffRemaining: number;
  parrySuccessCount: number;
  activeElementalInfusion: ElementalInfusionType;
  lastParryElement: ElementalInfusionType;
  lastParryWeightTier: AttackWeightTier;
  parryShakeIntensity: number;
  streakCount: number;
  streakHits: number;
  streakParries: number;
  peakStreakCount: number;
  streakTimer: number;
  streakMaxTimer: number;
  streakMultiplier: number;
  streakRank: ComboStreakRank;
  bonusSeedsEarnedThisRun: number;
  lastBattleBonusSeeds: number;
}

export type EnemyType = 'puffer' | 'roller' | 'sprite' | 'boss';

export interface EnemyState {
  id: string;
  type: EnemyType;
  x: number;
  z: number;
  vx: number;
  vz: number;
  hp: number;
  maxHp: number;
  state: 'idle' | 'chase' | 'windup' | 'attack' | 'recover' | 'stunned' | 'cleansed';
  timer: number;
  telegraphTimer: number;
  targetX: number;
  targetZ: number;
  speed: number;
  size: number;
  bossPhase?: 1 | 2;
}

export interface Shrine {
  id: number;
  x: number;
  z: number;
  requiredSeeds: number;
  currentSeeds: number;
  isRestored: boolean;
  name: string;
}

// ============================================================================
// 1. CHARACTER CUSTOMIZATION TYPES & OPTIONS
// ============================================================================

export type BodyType = 'sprout' | 'nimble' | 'sturdy' | 'tall';
export type HairstyleType = 'twin-sprout' | 'fluffy-bob' | 'braided-crown' | 'mushroom-beret' | 'sun-halo';
export type FacialFeatureType = 'cheerful' | 'starry' | 'sleepy-cozy' | 'scholar-glasses';
export type ClothingStyleType = 'leaf-cloak' | 'traveler-poncho' | 'sun-robe' | 'berry-overalls';

export interface CharacterCustomization {
  bodyType: BodyType;
  skinColor: string;
  hairstyle: HairstyleType;
  hairColor: string;
  facialFeature: FacialFeatureType;
  clothing: ClothingStyleType;
  clothingColor: string;
}

export const CUSTOMIZATION_OPTIONS = {
  bodyTypes: [
    { id: 'sprout' as BodyType, label: 'Balanced Warden', scale: [1.0, 1.0, 1.0] as [number, number, number] },
    { id: 'nimble' as BodyType, label: 'Swift Valkyrie', scale: [0.92, 1.05, 0.92] as [number, number, number] },
    { id: 'sturdy' as BodyType, label: 'Heavy Juggernaut', scale: [1.14, 0.98, 1.12] as [number, number, number] },
    { id: 'tall' as BodyType, label: 'Archon Dragoon', scale: [0.96, 1.14, 0.96] as [number, number, number] },
  ],
  skinColors: [
    { hex: '#cbd5e1', label: 'Starforged Silver' },
    { hex: '#475569', label: 'Obsidian Titanium' },
    { hex: '#fbbf24', label: 'Solar Gold Alloy' },
    { hex: '#38bdf8', label: 'Astral Cobalt' },
    { hex: '#a855f7', label: 'Void Amethyst' },
    { hex: '#f43f5e', label: 'Crimson Valkyrie' },
  ],
  hairstyles: [
    { id: 'twin-sprout' as HairstyleType, label: 'Winged Valkyrie Crest' },
    { id: 'fluffy-bob' as HairstyleType, label: 'Royal Plume Helm' },
    { id: 'braided-crown' as HairstyleType, label: 'Horned Dragoon Visor' },
    { id: 'mushroom-beret' as HairstyleType, label: 'Arcane Hood & Mask' },
    { id: 'sun-halo' as HairstyleType, label: 'Radiant Archon Halo' },
  ],
  hairColors: [
    { hex: '#ffd166', label: 'Solar Gold' },
    { hex: '#38bdf8', label: 'Astral Cyan' },
    { hex: '#f43f5e', label: 'Crimson Flame' },
    { hex: '#c084fc', label: 'Nebula Violet' },
    { hex: '#34d399', label: 'Emerald Aether' },
    { hex: '#f8fafc', label: 'Starlight White' },
  ],
  facialFeatures: [
    { id: 'cheerful' as FacialFeatureType, label: 'Azure Visor Slit' },
    { id: 'starry' as FacialFeatureType, label: 'Twin Astral Eyes' },
    { id: 'sleepy-cozy' as FacialFeatureType, label: 'Golden Archon Mask' },
    { id: 'scholar-glasses' as FacialFeatureType, label: 'Tactical Rune Visor' },
  ],
  clothingStyles: [
    { id: 'leaf-cloak' as ClothingStyleType, label: 'Astral Warden Plate' },
    { id: 'traveler-poncho' as ClothingStyleType, label: 'Vanguard Half-Cape' },
    { id: 'sun-robe' as ClothingStyleType, label: 'Solar Archon Regalia' },
    { id: 'berry-overalls' as ClothingStyleType, label: 'Shadow-Stalker Cuirass' },
  ],
  clothingColors: [
    { hex: '#1e3a8a', label: 'Royal Astral Blue' },
    { hex: '#7f1d1d', label: 'Sovereign Crimson' },
    { hex: '#312e81', label: 'Midnight Indigo' },
    { hex: '#0f172a', label: 'Obsidian Night' },
    { hex: '#b45309', label: 'Sunforged Amber' },
  ],
};

export const DEFAULT_CUSTOMIZATION: CharacterCustomization = {
  bodyType: 'sprout',
  skinColor: '#cbd5e1',
  hairstyle: 'twin-sprout',
  hairColor: '#ffd166',
  facialFeature: 'cheerful',
  clothing: 'leaf-cloak',
  clothingColor: '#1e3a8a',
};

// ============================================================================
// 2. HOME BASE SAFE ZONE & CUSTOMIZATION
// ============================================================================

export type RoofStyleType = 'moss' | 'terracotta' | 'slate' | 'sakura';
export type HearthStyleType = 'campfire' | 'fountain' | 'lantern';
export type GardenStyleType = 'flowers' | 'mushrooms' | 'stones';

export interface HomeBaseCustomization {
  roofStyle: RoofStyleType;
  hearthStyle: HearthStyleType;
  gardenStyle: GardenStyleType;
}

export const DEFAULT_HOME_BASE: HomeBaseCustomization = {
  roofStyle: 'moss',
  hearthStyle: 'campfire',
  gardenStyle: 'flowers',
};

export interface TrophyStatus {
  shrineTrophy: boolean;      // Restored at least 1 shrine
  cleanserTrophy: boolean;    // Cleansed >= 3 gloomlings
  seedHoarderTrophy: boolean; // Score >= 500 or seeds >= 5
  guardianCrownTrophy: boolean; // Boss cleansed
}

// ============================================================================
// 3. DYNAMIC DAY/NIGHT CYCLE & WEATHER SYSTEM
// ============================================================================

export type WeatherType = 'sunshine' | 'rain' | 'snow' | 'petals';
export type TimePhase = 'dawn' | 'day' | 'sunset' | 'night';

export interface DayNightEnvironmentState {
  timeOfDay: number; // 0.0 to 1.0 (0 = dawn, 0.25 = noon, 0.55 = sunset, 0.8 = night)
  phase: TimePhase;
  sunIntensity: number;
  hemiIntensity: number;
  lanternGlowIntensity: number;
  skyHex: number;
  fogHex: number;
  sunColorHex: number;
}

export interface WeatherModifiers {
  weather: WeatherType;
  dashCooldownMultiplier: number;
  enemySpeedMultiplier: number;
  seedScoreBonusMultiplier: number;
  passiveHealPerSecond: number;
  description: string;
}

export const GAME_CONSTANTS = {
  PLAYER_SPEED: 7.5,
  PLAYER_DASH_SPEED: 18.5,
  PLAYER_DASH_DURATION: 0.24,
  PLAYER_DASH_COOLDOWN: 0.95,
  PLAYER_SPIN_COOLDOWN: 3.4,
  PLAYER_PARRY_WINDOW: 0.32,
  PLAYER_PARRY_COOLDOWN: 1.1,
  PLAYER_PARRY_SUCCESS_COOLDOWN: 0.35,
  PARRY_COUNTER_WINDOW_SEC: 3.5,
  PARRY_STAMINA_BUFF_SEC: 5.0,
  PARRY_BASE_STAMINA_COST: 14,
  DASH_BASE_STAMINA_COST: 22,
  SPIN_BASE_STAMINA_COST: 28,
  PARRY_SHOCKWAVE_RADIUS: 4.8,
  PARRY_DEFLECT_RADIUS: 3.6,
  PARRY_STAGGER_DURATION: 2.2,
  PLAYER_COMBO_WINDOW: 0.95,
  COMBO_WINDOW_SEC: 0.95,
  STREAK_WINDOW_SEC: 5.5,
  STREAK_DECAY_PER_SEC: 2.5,
  MAX_STREAK_MULTIPLIER: 3.0,
  INVULNERABILITY_AFTER_HIT: 1.25,
  ATTACK_RADIUS: 2.65,
  SPIN_RADIUS: 5.0,
  SHRINE_INTERACT_RADIUS: 3.8,
  SEED_PICKUP_RADIUS: 2.35,
  MAX_PLAYER_HP: 6,
  HOME_BASE_X: 0,
  HOME_BASE_Z: 14,
  HOME_BASE_SAFE_RADIUS: 6.4,
};

/**
 * Computes the Sun-Seed yield multiplier (1.0x up to 3.0x) and mythic rank badge ('D'..'SS')
 * from the active consecutive hit + parry streak count.
 */
export function computeStreakMultiplierAndRank(
  streakCount: number
): { multiplier: number; rank: ComboStreakRank } {
  const clampedCount = Math.max(0, streakCount);
  const multiplier = Math.min(
    GAME_CONSTANTS.MAX_STREAK_MULTIPLIER,
    Math.round((1.0 + clampedCount * 0.08) * 100) / 100
  );

  let rank: ComboStreakRank = 'D';
  if (clampedCount >= 25) {
    rank = 'SS';
  } else if (clampedCount >= 18) {
    rank = 'S';
  } else if (clampedCount >= 12) {
    rank = 'A';
  } else if (clampedCount >= 7) {
    rank = 'B';
  } else if (clampedCount >= 3) {
    rank = 'C';
  }

  return { multiplier, rank };
}

/**
 * Records consecutive hits or parries into the player's Battle Streak Combo Meter,
 * refreshing the decay timer and boosting the Sun-Seed yield multiplier.
 */
export function recordPlayerStreakEvent(
  player: PlayerStats,
  eventType: 'hit' | 'parry',
  count: number = 1
): PlayerStats {
  const safeCount = Math.max(1, Math.floor(count));
  const pointsPerEvent = eventType === 'parry' ? 3 : 1;
  const nextStreakCount = Math.round(((player.streakCount || 0) + pointsPerEvent * safeCount) * 100) / 100;
  const nextHits = (player.streakHits || 0) + (eventType === 'hit' ? safeCount : 0);
  const nextParries = (player.streakParries || 0) + (eventType === 'parry' ? safeCount : 0);
  const nextPeak = Math.max(player.peakStreakCount || 0, Math.ceil(nextStreakCount));
  const { multiplier, rank } = computeStreakMultiplierAndRank(nextStreakCount);

  return {
    ...player,
    streakCount: nextStreakCount,
    streakHits: nextHits,
    streakParries: nextParries,
    peakStreakCount: nextPeak,
    streakTimer: GAME_CONSTANTS.STREAK_WINDOW_SEC,
    streakMaxTimer: GAME_CONSTANTS.STREAK_WINDOW_SEC,
    streakMultiplier: multiplier,
    streakRank: rank,
  };
}

/**
 * Calculates and awards bonus Sun-Seed (Astral Orb) yields upon finishing an enemy battle
 * or completing a Stage/Boss encounter based on the active decaying combo multiplier.
 */
export function resolveBattleComboSeedYield(
  player: PlayerStats,
  baseSeedDrop: number = 2,
  isStageOrBossFinale: boolean = false
): {
  player: PlayerStats;
  bonusSeeds: number;
  bonusScore: number;
  multiplierApplied: number;
} {
  const activeMult = player.streakMultiplier || 1.0;
  const peakMult = computeStreakMultiplierAndRank(player.peakStreakCount || 0).multiplier;
  const effectiveMult = isStageOrBossFinale ? Math.max(activeMult, peakMult) : activeMult;

  const hasActiveStreak = (player.streakCount || 0) >= 2 || (isStageOrBossFinale && (player.peakStreakCount || 0) >= 3);
  if (!hasActiveStreak || effectiveMult <= 1.0) {
    return {
      player: { ...player },
      bonusSeeds: 0,
      bonusScore: 0,
      multiplierApplied: 1.0,
    };
  }

  const parryBonusSeed = (player.streakParries || 0) > 0 ? 1 : 0;
  const rawBonus = baseSeedDrop * (effectiveMult - 1.0) + parryBonusSeed;
  const bonusSeeds = Math.max(1, Math.round(rawBonus));
  const bonusScore = Math.round(bonusSeeds * 95 * effectiveMult);

  return {
    player: {
      ...player,
      sunSeeds: player.sunSeeds + bonusSeeds,
      score: player.score + bonusScore,
      bonusSeedsEarnedThisRun: (player.bonusSeedsEarnedThisRun || 0) + bonusSeeds,
      lastBattleBonusSeeds: bonusSeeds,
    },
    bonusSeeds,
    bonusScore,
    multiplierApplied: effectiveMult,
  };
}

/**
 * Computes effective stamina cost, applying a 50% reduction while the
 * Parry Counter-Attack / Astral Flow stamina buff is active.
 */
export function getEffectiveStaminaCost(baseCost: number, staminaBuffRemaining: number = 0): number {
  if (staminaBuffRemaining > 0) {
    return Math.ceil(baseCost * 0.5);
  }
  return baseCost;
}

/**
 * Creates initial fresh player state
 */
export function createInitialPlayer(mastery?: HeroMasteryState): PlayerStats {
  const stats = computeCombatStatsFromMastery(mastery ?? DEFAULT_HERO_MASTERY);
  return {
    hp: GAME_CONSTANTS.MAX_PLAYER_HP,
    maxHp: GAME_CONSTANTS.MAX_PLAYER_HP,
    stamina: stats.maxStamina,
    maxStamina: stats.maxStamina,
    sunSeeds: 0,
    score: 0,
    comboCount: 0,
    comboStep: 0,
    comboWindowRemaining: 0,
    lastAttackTime: -999,
    dashCooldownRemaining: 0,
    spinCooldownRemaining: 0,
    isInvulnerable: false,
    invulnerableTimer: 0,
    lastHitWasCrit: false,
    lastDamageDealt: 0,
    perfectDodgeCount: 0,
    parryWindowRemaining: 0,
    parryCooldownRemaining: 0,
    counterWindowRemaining: 0,
    staminaBuffRemaining: 0,
    parrySuccessCount: 0,
    activeElementalInfusion: 'none',
    lastParryElement: 'none',
    lastParryWeightTier: 'medium',
    parryShakeIntensity: 0,
    streakCount: 0,
    streakHits: 0,
    streakParries: 0,
    peakStreakCount: 0,
    streakTimer: 0,
    streakMaxTimer: GAME_CONSTANTS.STREAK_WINDOW_SEC,
    streakMultiplier: 1.0,
    streakRank: 'D',
    bonusSeedsEarnedThisRun: 0,
    lastBattleBonusSeeds: 0,
  };
}

/**
 * Calculates 2D Euclidean distance squared
 */
export function distanceSq(x1: number, z1: number, x2: number, z2: number): number {
  const dx = x1 - x2;
  const dz = z1 - z2;
  return dx * dx + dz * dz;
}

/**
 * Calculates 2D Euclidean distance
 */
export function distance(x1: number, z1: number, x2: number, z2: number): number {
  return Math.sqrt(distanceSq(x1, z1, x2, z2));
}

/**
 * Tests circle overlap in 2D (ground X-Z plane)
 */
export function checkCircleOverlap(
  x1: number,
  z1: number,
  r1: number,
  x2: number,
  z2: number,
  r2: number
): boolean {
  const rSum = r1 + r2;
  return distanceSq(x1, z1, x2, z2) <= rSum * rSum;
}

/**
 * Checks if coordinates are inside the cozy Home Base Safe Zone
 */
export function isInsideHomeBaseSafeZone(x: number, z: number): boolean {
  return (
    distanceSq(x, z, GAME_CONSTANTS.HOME_BASE_X, GAME_CONSTANTS.HOME_BASE_Z) <=
    GAME_CONSTANTS.HOME_BASE_SAFE_RADIUS * GAME_CONSTANTS.HOME_BASE_SAFE_RADIUS
  );
}

/**
 * Computes unlocked trophies for the Home Base pedestals
 */
export function computeUnlockedTrophies(
  restoredShrines: number,
  cleansedEnemies: number,
  score: number,
  bossCleansed: boolean
): TrophyStatus {
  return {
    shrineTrophy: restoredShrines >= 1,
    cleanserTrophy: cleansedEnemies >= 3,
    seedHoarderTrophy: score >= 300,
    guardianCrownTrophy: bossCleansed,
  };
}

/**
 * Computes smooth day/night lighting parameters from normalized timeOfDay [0, 1)
 */
export function computeDayNightState(timeOfDay: number): DayNightEnvironmentState {
  const t = ((timeOfDay % 1) + 1) % 1;

  if (t < 0.2) {
    // Crimson-Gold Mythic Dawn
    return {
      timeOfDay: t,
      phase: 'dawn',
      sunIntensity: 1.25,
      hemiIntensity: 0.78,
      lanternGlowIntensity: 0.65,
      skyHex: 0x1e1b2e,
      fogHex: 0x261f33,
      sunColorHex: 0xfbbf24,
    };
  } else if (t < 0.55) {
    // High-Contrast Heroic Zenith
    return {
      timeOfDay: t,
      phase: 'day',
      sunIntensity: 1.55,
      hemiIntensity: 0.88,
      lanternGlowIntensity: 0.35,
      skyHex: 0x162436,
      fogHex: 0x1b2b40,
      sunColorHex: 0xfef3c7,
    };
  } else if (t < 0.75) {
    // Blood-Amber Eclipse Dusk
    return {
      timeOfDay: t,
      phase: 'sunset',
      sunIntensity: 1.15,
      hemiIntensity: 0.68,
      lanternGlowIntensity: 1.1,
      skyHex: 0x2a1421,
      fogHex: 0x331826,
      sunColorHex: 0xf97316,
    };
  } else {
    // Abyssal Starlight Night
    return {
      timeOfDay: t,
      phase: 'night',
      sunIntensity: 0.62,
      hemiIntensity: 0.52,
      lanternGlowIntensity: 1.75,
      skyHex: 0x090d16,
      fogHex: 0x0d1322,
      sunColorHex: 0x38bdf8,
    };
  }
}

/**
 * Returns subtle gameplay & mood modifiers for each cozy weather state
 */
export function getWeatherGameplayModifiers(weather: WeatherType): WeatherModifiers {
  switch (weather) {
    case 'rain':
      return {
        weather: 'rain',
        dashCooldownMultiplier: 1.25, // Faster dash cooldown recovery
        enemySpeedMultiplier: 0.95,
        seedScoreBonusMultiplier: 1.0,
        passiveHealPerSecond: 0.08, // Nourishing rain slowly refreshes sprout
        description: 'Nourishing Rain: +25% Dash Recovery & Gentle Sprout Regen',
      };
    case 'snow':
      return {
        weather: 'snow',
        dashCooldownMultiplier: 1.0,
        enemySpeedMultiplier: 0.8, // Chills gloomlings by 20%
        seedScoreBonusMultiplier: 1.1,
        passiveHealPerSecond: 0,
        description: 'Gentle Snowfall: Gloomlings move 20% slower',
      };
    case 'petals':
      return {
        weather: 'petals',
        dashCooldownMultiplier: 1.15,
        enemySpeedMultiplier: 0.9,
        seedScoreBonusMultiplier: 1.2,
        passiveHealPerSecond: 0.04,
        description: 'Sakura Breeze: +20% Seed Score & Swift Footwork',
      };
    case 'sunshine':
    default:
      return {
        weather: 'sunshine',
        dashCooldownMultiplier: 1.0,
        enemySpeedMultiplier: 1.0,
        seedScoreBonusMultiplier: 1.25, // Warm sun boosts seed harvest score
        passiveHealPerSecond: 0,
        description: 'Golden Sunshine: +25% Sun-Seed Harvest Score',
      };
  }
}

/**
 * Checks if target is within an angle cone from source facing angle
 */
export function isPointInCone(
  sourceX: number,
  sourceZ: number,
  facingAngleRad: number,
  targetX: number,
  targetZ: number,
  maxDistance: number,
  coneAngleRad: number
): boolean {
  const dist = distance(sourceX, sourceZ, targetX, targetZ);
  if (dist > maxDistance || dist < 0.001) return dist <= 0.5;

  const dx = targetX - sourceX;
  const dz = targetZ - sourceZ;
  const targetAngle = Math.atan2(dx, dz);

  let angleDiff = Math.abs(targetAngle - facingAngleRad);
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  angleDiff = Math.abs(angleDiff);

  return angleDiff <= coneAngleRad / 2;
}

export interface ElementalInfusionVisualPalette {
  element: ElementalInfusionType;
  nameEn: string;
  nameFa: string;
  riposteBonusLabelEn: string;
  riposteBonusLabelFa: string;
  crystalPaletteHex: [number, number, number, number];
  pillarPrimaryHex: number;
  pillarSecondaryHex: number;
  shockwaveRingHex: number;
  particleRgb: [number, number, number];
  flashPrimaryColor: string;
  flashSecondaryColor: string;
}

/**
 * Returns the visual color palette (3D crystal shards, upward energy pillars, shockwave ring,
 * particle RGB, and SVG screen-flash colors) and Riposte combat bonus metadata for an elemental infusion.
 */
export function getElementalInfusionPalette(
  element: ElementalInfusionType
): ElementalInfusionVisualPalette {
  switch (element) {
    case 'forest':
      return {
        element: 'forest',
        nameEn: 'FOREST INFUSION',
        nameFa: 'تزریق عنصر جنگل',
        riposteBonusLabelEn: 'VERDANT RENEWAL (+35⚡ / +1 HP)',
        riposteBonusLabelFa: 'احیای زمردین (+۳۵⚡ و +۱ جان)',
        crystalPaletteHex: [0x10b981, 0x34d399, 0x6ee7b7, 0xfde047],
        pillarPrimaryHex: 0x10b981,
        pillarSecondaryHex: 0x34d399,
        shockwaveRingHex: 0x10b981,
        particleRgb: [0.15, 0.92, 0.55],
        flashPrimaryColor: '#10b981',
        flashSecondaryColor: '#34d399',
      };
    case 'frost':
      return {
        element: 'frost',
        nameEn: 'FROST INFUSION',
        nameFa: 'تزریق عنصر یخ‌بندان',
        riposteBonusLabelEn: 'GLACIAL SHATTER (+1.5S CRYO-STUN)',
        riposteBonusLabelFa: 'انجماد کریستالی (+۱.۵ ثانیه گیجی)',
        crystalPaletteHex: [0x38bdf8, 0x60a5fa, 0xbae6fd, 0x2dd4bf],
        pillarPrimaryHex: 0x38bdf8,
        pillarSecondaryHex: 0x7dd3fc,
        shockwaveRingHex: 0x38bdf8,
        particleRgb: [0.22, 0.85, 1.0],
        flashPrimaryColor: '#38bdf8',
        flashSecondaryColor: '#7dd3fc',
      };
    case 'sun':
      return {
        element: 'sun',
        nameEn: 'SUN INFUSION',
        nameFa: 'تزریق عنصر خورشید',
        riposteBonusLabelEn: 'SOLAR FLARE (+120 AOE BURN)',
        riposteBonusLabelFa: 'شعله خورشیدی (+۱۲۰ انفجار محیطی)',
        crystalPaletteHex: [0xef4444, 0xf59e0b, 0xfbbf24, 0xf87171],
        pillarPrimaryHex: 0xef4444,
        pillarSecondaryHex: 0xfbbf24,
        shockwaveRingHex: 0xf59e0b,
        particleRgb: [1.0, 0.36, 0.16],
        flashPrimaryColor: '#ef4444',
        flashSecondaryColor: '#f59e0b',
      };
    case 'void':
    case 'none':
    default:
      return {
        element: element === 'none' ? 'void' : element,
        nameEn: 'VOID INFUSION',
        nameFa: 'تزریق عنصر خلأ اختری',
        riposteBonusLabelEn: 'ASTRAL REND (+50% PIERCE DMG)',
        riposteBonusLabelFa: 'شکاف اختران (+۵۰٪ آسیب نافذ)',
        crystalPaletteHex: [0xa855f7, 0xffd166, 0xc084fc, 0x38bdf8],
        pillarPrimaryHex: 0xa855f7,
        pillarSecondaryHex: 0xffd166,
        shockwaveRingHex: 0xa855f7,
        particleRgb: [0.78, 0.35, 1.0],
        flashPrimaryColor: '#a855f7',
        flashSecondaryColor: '#ffd166',
      };
  }
}

export interface ParryElementAndImpactProfile {
  element: ElementalInfusionType;
  weightTier: AttackWeightTier;
  parryShakeIntensity: number;
  hitstopDuration: number;
  cameraPunchDuration: number;
  cameraPunchZoom: number;
  shardCount: number;
  pillarHeightScale: number;
}

/**
 * Maps a deflected Gloomling archetype ('puffer', 'sprite', 'roller', 'boss', or 'projectile')
 * and its attack momentum state to its Elemental Infusion and Attack-Weight Scaled Screen-Shake profile.
 */
export function resolveParryElementAndImpact(
  deflectedSource: EnemyType | 'projectile' = 'puffer',
  isHeavyAttackState: boolean = false
): ParryElementAndImpactProfile {
  switch (deflectedSource) {
    case 'sprite':
    case 'projectile':
      return {
        element: 'frost',
        weightTier: 'light',
        parryShakeIntensity: isHeavyAttackState ? 0.44 : 0.38,
        hitstopDuration: 0.042,
        cameraPunchDuration: 0.28,
        cameraPunchZoom: 0.11,
        shardCount: 22,
        pillarHeightScale: 0.9,
      };
    case 'puffer':
      return {
        element: 'forest',
        weightTier: isHeavyAttackState ? 'heavy' : 'medium',
        parryShakeIntensity: isHeavyAttackState ? 0.72 : 0.58,
        hitstopDuration: 0.064,
        cameraPunchDuration: 0.36,
        cameraPunchZoom: 0.15,
        shardCount: 28,
        pillarHeightScale: 1.05,
      };
    case 'roller':
      return {
        element: 'sun',
        weightTier: 'heavy',
        parryShakeIntensity: isHeavyAttackState ? 0.92 : 0.85,
        hitstopDuration: 0.082,
        cameraPunchDuration: 0.44,
        cameraPunchZoom: 0.2,
        shardCount: 36,
        pillarHeightScale: 1.25,
      };
    case 'boss':
      return {
        element: 'void',
        weightTier: 'colossal',
        parryShakeIntensity: 1.0,
        hitstopDuration: 0.095,
        cameraPunchDuration: 0.52,
        cameraPunchZoom: 0.24,
        shardCount: 44,
        pillarHeightScale: 1.45,
      };
  }
}

/**
 * Calculates 3-hit combo chain, critical strike multiplier, weapon reach,
 * Empowered Riposte Counter-Attack bonus, and Elemental Riposte Infusion effect when counterWindowRemaining > 0.
 */
export function resolvePlayerAttack(
  currentTime: number,
  currentCombo: number,
  lastAttackTime: number,
  mastery?: HeroMasteryState,
  counterWindowRemaining: number = 0,
  activeElementalInfusion: ElementalInfusionType = 'none'
): {
  combo: number;
  damage: number;
  isFinisher: boolean;
  isCrit: boolean;
  isRiposte: boolean;
  reachMultiplier: number;
  radiusBonus: number;
  infusionConsumed: ElementalInfusionType;
  bonusStunDuration: number;
  bonusAoEBurnDamage: number;
  staminaRestore: number;
  hpRestore: number;
} {
  const isWithinWindow = currentTime - lastAttackTime <= GAME_CONSTANTS.PLAYER_COMBO_WINDOW;
  const nextCombo = isWithinWindow ? (currentCombo % 3) + 1 : 1;
  const stats = computeCombatStatsFromMastery(mastery ?? DEFAULT_HERO_MASTERY);
  const isRiposte = counterWindowRemaining > 0;
  const infusionConsumed: ElementalInfusionType = isRiposte ? activeElementalInfusion : 'none';

  let baseDamage = 1;
  let isFinisher = false;

  if (nextCombo === 1) {
    baseDamage = 1.0;
  } else if (nextCombo === 2) {
    baseDamage = 1.2;
  } else {
    baseDamage = 2.5;
    isFinisher = true;
  }

  // Deterministic-friendly critical hit roll (finisher has +15% bonus crit chance; Riposte guarantees crit)
  const effectiveCritChance = isFinisher ? Math.min(0.9, stats.critChance + 0.15) : stats.critChance;
  const pseudoRoll = Math.abs(Math.sin(currentTime * 19.73 + nextCombo * 4.13));
  const isCrit = isRiposte || (mastery ? pseudoRoll < effectiveCritChance : false);
  const riposteBonusMult = isRiposte ? 1.65 : 1.0;
  const voidPierceMult = infusionConsumed === 'void' ? 1.5 : 1.0;
  const rawDamage =
    baseDamage *
    stats.damageMultiplier *
    (isCrit ? stats.critMultiplier : 1.0) *
    riposteBonusMult *
    voidPierceMult;
  const damage = Math.round(rawDamage * 100) / 100;
  const reachMult =
    stats.reachMultiplier * (isFinisher ? 1.25 : 1.0) * (isRiposte ? 1.35 : 1.0);

  return {
    combo: nextCombo,
    damage,
    isFinisher,
    isCrit,
    isRiposte,
    reachMultiplier: reachMult,
    radiusBonus: (isFinisher ? 0.85 : 0) + (isRiposte ? 1.1 : 0) + stats.radiusBonus,
    infusionConsumed,
    bonusStunDuration: infusionConsumed === 'frost' ? 1.5 : 0,
    bonusAoEBurnDamage:
      infusionConsumed === 'sun' ? Math.round(1.2 * stats.damageMultiplier * 100) / 100 : 0,
    staminaRestore: infusionConsumed === 'forest' ? 35 : 0,
    hpRestore: infusionConsumed === 'forest' ? 1 : 0,
  };
}

/**
 * Initiates the Astral Aegis Parry stance if off cooldown and stamina is sufficient.
 * Consumes 50% less stamina if the player's staminaBuffRemaining is active.
 */
export function activateParryStance(
  player: PlayerStats,
  mastery?: HeroMasteryState
): {
  player: PlayerStats;
  activated: boolean;
  staminaSpent: number;
} {
  if (player.parryCooldownRemaining > 0 || player.parryWindowRemaining > 0) {
    return { player: { ...player }, activated: false, staminaSpent: 0 };
  }
  const cost = getEffectiveStaminaCost(
    GAME_CONSTANTS.PARRY_BASE_STAMINA_COST,
    player.staminaBuffRemaining
  );
  if (player.stamina < cost) {
    return { player: { ...player }, activated: false, staminaSpent: 0 };
  }
  const stats = computeCombatStatsFromMastery(mastery ?? DEFAULT_HERO_MASTERY);
  return {
    player: {
      ...player,
      stamina: Math.max(0, player.stamina - cost),
      parryWindowRemaining: GAME_CONSTANTS.PLAYER_PARRY_WINDOW,
      parryCooldownRemaining: GAME_CONSTANTS.PLAYER_PARRY_COOLDOWN * stats.cooldownMultiplier,
    },
    activated: true,
    staminaSpent: cost,
  };
}

/**
 * Resolves a successful timed parry deflection:
 * - Infuses the Warden with the deflected Gloomling's Elemental Alignment ('forest' | 'frost' | 'sun' | 'void')
 * - Computes Attack-Weight Scaled Screen-Shake intensity (parryShakeIntensity: 0.38..1.0), hit-stop, and camera punch
 * - Grants instant AoE shockwave damage & stagger parameters
 * - Refunds +25 stamina on the spot
 * - Activates a 5.0s 50% stamina cost reduction buff (staminaBuffRemaining)
 * - Opens a 3.5s Counter-Attack Riposte window (counterWindowRemaining)
 * - Resets parry cooldown to 0.35s for rapid multi-parry skill expression
 */
export function resolveParrySuccess(
  player: PlayerStats,
  mastery?: HeroMasteryState,
  deflectedSource: EnemyType | 'projectile' = 'puffer',
  isHeavyAttackState: boolean = false
): {
  player: PlayerStats;
  shockwaveDamage: number;
  shockwaveRadius: number;
  staggerDuration: number;
  staminaRefunded: number;
  element: ElementalInfusionType;
  weightTier: AttackWeightTier;
  parryShakeIntensity: number;
  hitstopDuration: number;
  cameraPunchDuration: number;
  cameraPunchZoom: number;
  shardCount: number;
  pillarHeightScale: number;
} {
  const stats = computeCombatStatsFromMastery(mastery ?? DEFAULT_HERO_MASTERY);
  const impact = resolveParryElementAndImpact(deflectedSource, isHeavyAttackState);
  const staminaRefunded = 25;
  const shockwaveDamage = Math.round(1.85 * stats.damageMultiplier * 100) / 100;
  const shockwaveRadius = GAME_CONSTANTS.PARRY_SHOCKWAVE_RADIUS + stats.radiusBonus;

  const baseUpdated: PlayerStats = {
    ...player,
    stamina: Math.min(player.maxStamina, player.stamina + staminaRefunded),
    parryWindowRemaining: 0,
    parryCooldownRemaining: GAME_CONSTANTS.PLAYER_PARRY_SUCCESS_COOLDOWN,
    counterWindowRemaining: GAME_CONSTANTS.PARRY_COUNTER_WINDOW_SEC,
    staminaBuffRemaining: GAME_CONSTANTS.PARRY_STAMINA_BUFF_SEC,
    isInvulnerable: true,
    invulnerableTimer: Math.max(player.invulnerableTimer, 0.55),
    parrySuccessCount: (player.parrySuccessCount || 0) + 1,
    activeElementalInfusion: impact.element,
    lastParryElement: impact.element,
    lastParryWeightTier: impact.weightTier,
    parryShakeIntensity: impact.parryShakeIntensity,
    score: player.score + 180,
  };

  return {
    player: recordPlayerStreakEvent(baseUpdated, 'parry', 1),
    shockwaveDamage,
    shockwaveRadius,
    staggerDuration: GAME_CONSTANTS.PARRY_STAGGER_DURATION,
    staminaRefunded,
    element: impact.element,
    weightTier: impact.weightTier,
    parryShakeIntensity: impact.parryShakeIntensity,
    hitstopDuration: impact.hitstopDuration,
    cameraPunchDuration: impact.cameraPunchDuration,
    cameraPunchZoom: impact.cameraPunchZoom,
    shardCount: impact.shardCount,
    pillarHeightScale: impact.pillarHeightScale,
  };
}

/**
 * Handles player taking damage if not invulnerable
 */
export function applyDamageToPlayer(
  player: PlayerStats,
  damageAmount: number
): { player: PlayerStats; tookDamage: boolean } {
  if (player.isInvulnerable || player.hp <= 0 || player.parryWindowRemaining > 0) {
    return { player: { ...player }, tookDamage: false };
  }

  const newHp = Math.max(0, player.hp - damageAmount);
  const reducedStreak = Math.floor((player.streakCount || 0) * 0.5);
  const { multiplier, rank } = computeStreakMultiplierAndRank(reducedStreak);

  return {
    player: {
      ...player,
      hp: newHp,
      isInvulnerable: true,
      invulnerableTimer: GAME_CONSTANTS.INVULNERABILITY_AFTER_HIT,
      streakCount: reducedStreak,
      streakHits: reducedStreak === 0 ? 0 : player.streakHits,
      streakParries: reducedStreak === 0 ? 0 : player.streakParries,
      streakMultiplier: multiplier,
      streakRank: rank,
    },
    tookDamage: true,
  };
}

/**
 * Ticks player invulnerability, stamina regeneration, combo window, parry & decaying streak multiplier timers
 */
export function tickPlayerTimers(
  player: PlayerStats,
  dt: number,
  dashMultiplier = 1.0,
  staminaRegenRate = 28
): PlayerStats {
  const dashCooldown = Math.max(0, player.dashCooldownRemaining - dt * dashMultiplier);
  const spinCooldown = Math.max(0, player.spinCooldownRemaining - dt * dashMultiplier);
  const parryCooldown = Math.max(0, (player.parryCooldownRemaining || 0) - dt * dashMultiplier);
  const parryWindow = Math.max(0, (player.parryWindowRemaining || 0) - dt);
  const counterWindow = Math.max(0, (player.counterWindowRemaining || 0) - dt);
  const staminaBuff = Math.max(0, (player.staminaBuffRemaining || 0) - dt);
  const invulnerableTimer = Math.max(0, player.invulnerableTimer - dt);
  const isInvulnerable = invulnerableTimer > 0;
  // Regenerate stamina 30% faster while Astral Flow stamina buff is active
  const effRegen = staminaRegenRate * (staminaBuff > 0 ? 1.3 : 1.0);
  const nextStamina = Math.min(player.maxStamina, player.stamina + dt * effRegen);
  const nextComboWindow = Math.max(0, player.comboWindowRemaining - dt);
  const nextComboStep = nextComboWindow > 0 ? player.comboStep : 0;
  const nextElementalInfusion: ElementalInfusionType =
    counterWindow > 0 ? player.activeElementalInfusion || 'none' : 'none';
  const nextParryShakeIntensity = Math.max(
    0,
    Math.round(((player.parryShakeIntensity || 0) - dt * 1.45) * 100) / 100
  );

  // Decaying Battle Streak Combo Meter & Sun-Seed Yield Multiplier
  let nextStreakTimer = Math.max(0, (player.streakTimer || 0) - dt);
  let nextStreakCount = player.streakCount || 0;
  let nextStreakHits = player.streakHits || 0;
  let nextStreakParries = player.streakParries || 0;

  if (nextStreakTimer <= 0 && nextStreakCount > 0) {
    nextStreakCount = Math.max(
      0,
      Math.round((nextStreakCount - dt * GAME_CONSTANTS.STREAK_DECAY_PER_SEC) * 100) / 100
    );
    if (nextStreakCount <= 0) {
      nextStreakCount = 0;
      nextStreakHits = 0;
      nextStreakParries = 0;
    }
  }

  const { multiplier: nextStreakMultiplier, rank: nextStreakRank } =
    computeStreakMultiplierAndRank(nextStreakCount);

  return {
    ...player,
    stamina: nextStamina,
    comboWindowRemaining: nextComboWindow,
    comboStep: nextComboStep,
    dashCooldownRemaining: dashCooldown,
    spinCooldownRemaining: spinCooldown,
    parryCooldownRemaining: parryCooldown,
    parryWindowRemaining: parryWindow,
    counterWindowRemaining: counterWindow,
    staminaBuffRemaining: staminaBuff,
    activeElementalInfusion: nextElementalInfusion,
    parryShakeIntensity: nextParryShakeIntensity,
    invulnerableTimer,
    isInvulnerable,
    streakTimer: nextStreakTimer,
    streakCount: nextStreakCount,
    streakHits: nextStreakHits,
    streakParries: nextStreakParries,
    streakMultiplier: nextStreakMultiplier,
    streakRank: nextStreakRank,
  };
}

/**
 * Applies hit to enemy, calculates remaining HP and state
 */
export function damageEnemy(
  enemy: EnemyState,
  damage: number,
  stunDuration: number = 0.35
): { enemy: EnemyState; wasCleansed: boolean } {
  if (enemy.state === 'cleansed') {
    return { enemy: { ...enemy }, wasCleansed: false };
  }

  const newHp = Math.max(0, enemy.hp - damage);
  const wasCleansed = newHp === 0;

  return {
    enemy: {
      ...enemy,
      hp: newHp,
      state: wasCleansed ? 'cleansed' : 'stunned',
      timer: wasCleansed ? 1.0 : stunDuration,
    },
    wasCleansed,
  };
}

/**
 * Shrine deposit logic: checks if player is near and has seeds
 */
export function tryDepositSeedInShrine(
  player: PlayerStats,
  shrine: Shrine,
  playerX: number,
  playerZ: number
): { player: PlayerStats; shrine: Shrine; success: boolean; justCompleted: boolean } {
  if (shrine.isRestored) {
    return { player, shrine, success: false, justCompleted: false };
  }

  const distSq = distanceSq(playerX, playerZ, shrine.x, shrine.z);
  if (distSq > GAME_CONSTANTS.SHRINE_INTERACT_RADIUS * GAME_CONSTANTS.SHRINE_INTERACT_RADIUS) {
    return { player, shrine, success: false, justCompleted: false };
  }

  if (player.sunSeeds <= 0) {
    return { player, shrine, success: false, justCompleted: false };
  }

  const needed = shrine.requiredSeeds - shrine.currentSeeds;
  const deposit = Math.min(needed, player.sunSeeds);

  if (deposit <= 0) {
    return { player, shrine, success: false, justCompleted: false };
  }

  const newCurrent = shrine.currentSeeds + deposit;
  const isNowRestored = newCurrent >= shrine.requiredSeeds;

  const updatedPlayer: PlayerStats = {
    ...player,
    sunSeeds: player.sunSeeds - deposit,
    score: player.score + deposit * 100 + (isNowRestored ? 500 : 0),
  };

  const updatedShrine: Shrine = {
    ...shrine,
    currentSeeds: newCurrent,
    isRestored: isNowRestored,
  };

  return {
    player: updatedPlayer,
    shrine: updatedShrine,
    success: true,
    justCompleted: isNowRestored,
  };
}

/**
 * Checks win conditions: all shrines restored and/or boss cleansed
 */
export function checkVictory(shrines: Shrine[], bossCleansed: boolean): boolean {
  if (shrines.length === 0) return false;
  const allShrinesRestored = shrines.every((s) => s.isRestored);
  return allShrinesRestored && bossCleansed;
}

/**
 * Calculates end of run score and star rating (1 to 3 stars)
 */
export function calculateRunSummary(
  score: number,
  cleansedEnemiesCount: number,
  elapsedSeconds: number,
  damageTaken: number
): { finalScore: number; stars: number; timeFormatted: string } {
  const timeBonus = Math.max(0, 1000 - Math.floor(elapsedSeconds * 3));
  const damagePenalty = damageTaken * 50;
  const finalScore = Math.max(100, score + cleansedEnemiesCount * 150 + timeBonus - damagePenalty);

  let stars = 1;
  if (finalScore >= 3500) {
    stars = 3;
  } else if (finalScore >= 2000) {
    stars = 2;
  }

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = Math.floor(elapsedSeconds % 60);
  const timeFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  return { finalScore, stars, timeFormatted };
}

/**
 * Validates Google AdMob App ID format (ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY)
 */
export function isValidAdMobAppId(id: string): boolean {
  return /^ca-app-pub-\d{16}~\d{10}$/.test(id.trim());
}

/**
 * Validates Google AdMob Ad Unit ID format (ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ)
 */
export function isValidAdMobUnitId(id: string): boolean {
  return /^ca-app-pub-\d{16}\/\d{10}$/.test(id.trim());
}

/**
 * Validates Iranian Tapsell Plus App Key format (standard 60-72 char token or tapsell-* key)
 */
export function isValidTapsellAppKey(key: string): boolean {
  const trimmed = key.trim();
  return /^(tapsell-[a-zA-Z0-9_-]{8,64}|[a-zA-Z0-9]{40,76})$/.test(trimmed);
}

/**
 * Validates Tapsell Zone ID format (24-char Mongo ObjectId hex or UUID / standard test zone)
 */
export function isValidTapsellZoneId(zoneId: string): boolean {
  const trimmed = zoneId.trim();
  return /^([a-fA-F0-9]{24}|[0-9a-fA-F-]{32,36}|tapsell-zone-[a-zA-Z0-9_-]{4,32})$/.test(trimmed);
}

/**
 * Validates Iranian Yektanet App / Script ID (e.g., yn-pub-XXXX or 6-32 alphanumeric ID)
 */
export function isValidYektanetAppId(appId: string): boolean {
  const trimmed = appId.trim();
  return /^(yn-[a-zA-Z0-9_-]{4,32}|[a-zA-Z0-9_-]{6,32})$/.test(trimmed);
}

/**
 * Validates Yektanet Placement / Position ID
 */
export function isValidYektanetPlacementId(placementId: string): boolean {
  const trimmed = placementId.trim();
  return /^(yn-pos-[a-zA-Z0-9_-]{3,32}|[a-zA-Z0-9_-]{4,32})$/.test(trimmed);
}

export type AdNetworkProvider = 'admob' | 'tapsell' | 'yektanet';
export type AdRoutingMode = 'auto' | 'admob' | 'tapsell' | 'yektanet';

export interface AdRoutingResolution {
  detectedCountry: 'IR' | 'GLOBAL';
  activeProvider: AdNetworkProvider;
  fallbackProvider: AdNetworkProvider;
  reasonFa: string;
  reasonEn: string;
}

/**
 * Resolves the optimal ad network (Google AdMob vs Tapsell vs Yektanet) based on
 * country/timezone/locale signals and automatic waterfall fallback.
 */
export function resolveAdNetworkByCountry(params: {
  mode?: AdRoutingMode;
  preferredIranProvider?: 'tapsell' | 'yektanet';
  countryCodeHint?: string;
  timeZone?: string;
  languages?: readonly string[];
  primaryFailed?: boolean;
}): AdRoutingResolution {
  const mode = params.mode ?? 'auto';
  const iranPrimary: AdNetworkProvider = params.preferredIranProvider ?? 'tapsell';
  const iranSecondary: AdNetworkProvider = iranPrimary === 'tapsell' ? 'yektanet' : 'tapsell';

  const tz = (params.timeZone || '').toLowerCase();
  const hint = (params.countryCodeHint || '').toUpperCase();
  const langs = (params.languages || []).map((l) => l.toLowerCase());

  const isIranByHint = hint === 'IR' || hint === 'IRAN';
  const isIranByTz = tz === 'asia/tehran' || tz.includes('tehran');
  const isIranByLang = langs.some((l) => l === 'fa' || l.startsWith('fa-ir') || l === 'pes');

  const detectedCountry: 'IR' | 'GLOBAL' =
    isIranByHint || (hint === '' && (isIranByTz || isIranByLang)) ? 'IR' : 'GLOBAL';

  if (mode !== 'auto') {
    const fallback: AdNetworkProvider =
      mode === 'admob' ? iranPrimary : mode === 'tapsell' ? 'yektanet' : 'tapsell';
    const active = params.primaryFailed ? fallback : mode;
    return {
      detectedCountry,
      activeProvider: active,
      fallbackProvider: fallback,
      reasonFa:
        active === mode
          ? `انتخاب دستی شبکه (${active.toUpperCase()})`
          : `سوییچ خودکار (Fallback) به ${active.toUpperCase()} پس از عدم پاسخ شبکه اول`,
      reasonEn:
        active === mode
          ? `Manual override (${active.toUpperCase()})`
          : `Waterfall fallback to ${active.toUpperCase()}`,
    };
  }

  if (detectedCountry === 'IR') {
    const active = params.primaryFailed ? iranSecondary : iranPrimary;
    const fallback = params.primaryFailed ? 'admob' : iranSecondary;
    return {
      detectedCountry: 'IR',
      activeProvider: active,
      fallbackProvider: fallback,
      reasonFa: params.primaryFailed
        ? `ایران تشخیص داده شد — سوییچ جایگزین از ${iranPrimary} به ${iranSecondary}`
        : `منطقه ایران (IR) — اجرای بومی ${active === 'tapsell' ? 'تپسل (Tapsell)' : 'یکتانت (Yektanet)'} با جایگزین ${fallback === 'yektanet' ? 'یکتانت' : 'تپسل'}`,
      reasonEn: params.primaryFailed
        ? `Iran region (IR) — Fallback switched from ${iranPrimary} to ${iranSecondary}`
        : `Iran region (IR) — Active ${active.toUpperCase()} with ${fallback.toUpperCase()} fallback`,
    };
  }

  const active: AdNetworkProvider = params.primaryFailed ? iranPrimary : 'admob';
  const fallback: AdNetworkProvider = params.primaryFailed ? iranSecondary : iranPrimary;
  return {
    detectedCountry: 'GLOBAL',
    activeProvider: active,
    fallbackProvider: fallback,
    reasonFa: params.primaryFailed
      ? `عدم دسترسی به AdMob — سوییچ خودکار به شبکه جایگزین (${active === 'tapsell' ? 'تپسل' : 'یکتانت'})`
      : 'منطقه بین‌المللی (GLOBAL) — اجرای Google AdMob با پشتیبان تپسل/یکتانت',
    reasonEn: params.primaryFailed
      ? `AdMob unreachable — Waterfall fallback to ${active.toUpperCase()}`
      : 'Global region — Primary Google AdMob with Tapsell/Yektanet fallback',
  };
}

/**
 * Grants player +3 Sun-Seeds and score upon watching an opt-in Rewarded Ad
 */
export function applyRewardedSeedBlessing(player: PlayerStats, bonusSeeds: number = 3): PlayerStats {
  return {
    ...player,
    sunSeeds: player.sunSeeds + Math.max(1, bonusSeeds),
    score: player.score + 150,
  };
}

/**
 * Revives a defeated player with full HP and temporary invulnerability upon watching a Rewarded Ad
 */
export function applyRewardedRevive(player: PlayerStats): PlayerStats {
  return {
    ...player,
    hp: player.maxHp,
    isInvulnerable: true,
    invulnerableTimer: 3.0,
  };
}

// ============================================================================
// 4. INFINITE LEVELS, CONTINUOUS STORY & SCALABLE GRAPHICS TIERS (ECO -> ULTRA)
// ============================================================================

export type PerformanceQuality = 'eco' | 'balanced' | 'high' | 'ultra';

export interface GraphicsQualityProfile {
  quality: PerformanceQuality;
  pixelRatioCap: number;
  shadowsEnabled: boolean;
  shadowMapSize: number;
  toneMappingExposure: number;
  envMapIntensity: number;
  characterGeometrySegments: number;
  enablePbrBumpMaps: boolean;
  enableReflectiveWaterAndRuins: boolean;
  enableCharacterAuraAndSatchel: boolean;
  enableSunbeamGodRays: boolean;
  enableWaterRippleRings: boolean;
  enableDistantMountainRim: boolean;
  showSecondaryCanopyAndRocks: boolean;
  showHighDetailGrassAndFerns: boolean;
  showUltraCrystalsAndFireflies: boolean;
  grassBladeCount: number;
  fernClusterCount: number;
  crystalClusterCount: number;
  fireflyCount: number;
}

/**
 * Returns deterministic GPU, character mesh fidelity, PBR surface relief, studio IBL intensity,
 * and architectural environment parameters for each phone tier, maximizing visual quality per tier
 * from budget phones ('eco') up to flagship ('ultra').
 */
export function getGraphicsQualityProfile(quality: PerformanceQuality): GraphicsQualityProfile {
  switch (quality) {
    case 'eco':
      return {
        quality: 'eco',
        pixelRatioCap: 1.35,
        shadowsEnabled: true,
        shadowMapSize: 1024,
        toneMappingExposure: 1.18,
        envMapIntensity: 0.72,
        characterGeometrySegments: 20,
        enablePbrBumpMaps: true,
        enableReflectiveWaterAndRuins: true,
        enableCharacterAuraAndSatchel: true,
        enableSunbeamGodRays: true,
        enableWaterRippleRings: true,
        enableDistantMountainRim: true,
        showSecondaryCanopyAndRocks: true,
        showHighDetailGrassAndFerns: true,
        showUltraCrystalsAndFireflies: true,
        grassBladeCount: 320,
        fernClusterCount: 36,
        crystalClusterCount: 16,
        fireflyCount: 36,
      };
    case 'balanced':
      return {
        quality: 'balanced',
        pixelRatioCap: 1.75,
        shadowsEnabled: true,
        shadowMapSize: 1536,
        toneMappingExposure: 1.21,
        envMapIntensity: 0.96,
        characterGeometrySegments: 26,
        enablePbrBumpMaps: true,
        enableReflectiveWaterAndRuins: true,
        enableCharacterAuraAndSatchel: true,
        enableSunbeamGodRays: true,
        enableWaterRippleRings: true,
        enableDistantMountainRim: true,
        showSecondaryCanopyAndRocks: true,
        showHighDetailGrassAndFerns: true,
        showUltraCrystalsAndFireflies: true,
        grassBladeCount: 640,
        fernClusterCount: 72,
        crystalClusterCount: 32,
        fireflyCount: 76,
      };
    case 'high':
      return {
        quality: 'high',
        pixelRatioCap: 2.15,
        shadowsEnabled: true,
        shadowMapSize: 2048,
        toneMappingExposure: 1.24,
        envMapIntensity: 1.22,
        characterGeometrySegments: 34,
        enablePbrBumpMaps: true,
        enableReflectiveWaterAndRuins: true,
        enableCharacterAuraAndSatchel: true,
        enableSunbeamGodRays: true,
        enableWaterRippleRings: true,
        enableDistantMountainRim: true,
        showSecondaryCanopyAndRocks: true,
        showHighDetailGrassAndFerns: true,
        showUltraCrystalsAndFireflies: true,
        grassBladeCount: 1020,
        fernClusterCount: 116,
        crystalClusterCount: 50,
        fireflyCount: 118,
      };
    case 'ultra':
      return {
        quality: 'ultra',
        pixelRatioCap: 2.75,
        shadowsEnabled: true,
        shadowMapSize: 4096,
        toneMappingExposure: 1.28,
        envMapIntensity: 1.48,
        characterGeometrySegments: 44,
        enablePbrBumpMaps: true,
        enableReflectiveWaterAndRuins: true,
        enableCharacterAuraAndSatchel: true,
        enableSunbeamGodRays: true,
        enableWaterRippleRings: true,
        enableDistantMountainRim: true,
        showSecondaryCanopyAndRocks: true,
        showHighDetailGrassAndFerns: true,
        showUltraCrystalsAndFireflies: true,
        grassBladeCount: 1400,
        fernClusterCount: 160,
        crystalClusterCount: 68,
        fireflyCount: 160,
      };
  }
}

export type ViewportScaleTier = 'compact-mobile' | 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveHudProfile {
  tier: ViewportScaleTier;
  isPortrait: boolean;
  cameraFov: number;
  cameraOffsetY: number;
  cameraOffsetZ: number;
  joystickPadRadiusPx: number;
  joystickKnobMaxDistancePx: number;
  uiFontScale: number;
}

/**
 * Computes deterministic viewport-adaptive layout, font scale, 3D camera FOV/framing,
 * and bounded thumbstick geometry for any screen size (from 320px phones to 4K monitors).
 */
export function computeResponsiveHudProfile(
  viewportWidth: number,
  viewportHeight: number
): ResponsiveHudProfile {
  const w = Math.max(280, viewportWidth);
  const h = Math.max(280, viewportHeight);
  const minDim = Math.min(w, h);
  const aspect = w / h;
  const isPortrait = aspect < 0.92;

  let tier: ViewportScaleTier = 'desktop';
  if (w < 420 || minDim < 400) {
    tier = 'compact-mobile';
  } else if (w < 768) {
    tier = 'mobile';
  } else if (w < 1080) {
    tier = 'tablet';
  }

  // Widen vertical FOV and pull camera slightly back on narrow portrait phones so the 3D glade isn't cropped
  const cameraFov = isPortrait ? Math.min(60, Math.round(45 + (0.95 - aspect) * 24)) : 45;
  const cameraOffsetY = isPortrait ? 11.2 : 9.5;
  const cameraOffsetZ = isPortrait ? 14.8 : 12.5;

  const joystickPadRadiusPx = Math.round(Math.max(44, Math.min(66, minDim * 0.125)));
  const joystickKnobMaxDistancePx = Math.round(joystickPadRadiusPx * 0.68);
  const uiFontScale =
    tier === 'compact-mobile' ? 0.86 : tier === 'mobile' ? 0.92 : tier === 'tablet' ? 0.97 : 1.0;

  return {
    tier,
    isPortrait,
    cameraFov,
    cameraOffsetY,
    cameraOffsetZ,
    joystickPadRadiusPx,
    joystickKnobMaxDistancePx,
    uiFontScale,
  };
}

/**
 * Verifies that a pointer/touch event initiates strictly inside the bounded bottom-left
 * joystick pad circle, preventing the joystick from intercepting HUD buttons or story modals.
 */
export function isPointInsideJoystickPad(
  clientX: number,
  clientY: number,
  padCenterX: number,
  padCenterY: number,
  padRadiusPx: number
): boolean {
  const dx = clientX - padCenterX;
  const dy = clientY - padCenterY;
  // Allow a slight 12% ergonomic touch halo around the visible ring, never extending into HUD/modals
  const effectiveRadius = padRadiusPx * 1.12;
  return dx * dx + dy * dy <= effectiveRadius * effectiveRadius;
}

export type StageBiomeId =
  | 'emerald-meadow'
  | 'sakura-valley'
  | 'amber-autumn'
  | 'frost-aurora'
  | 'astral-oasis';

export interface StageBiomeTheme {
  id: StageBiomeId;
  nameFa: string;
  nameEn: string;
  meadowHex: number;
  mossHex: number;
  trailHex: number;
  pondBedHex: number;
  cliffHex: number;
  plazaHex: number;
  canopyPrimaryHex: number;
  canopySecondaryHex: number;
  trunkHex: number;
  mountainPrimaryHex: number;
  mountainSecondaryHex: number;
  waterHex: number;
  waterEmissiveHex: number;
  lilyHex: number;
  lotusHex: number;
  flowerPalette: number[];
  grassPalette: number[];
  fernPalette: number[];
  crystalPalette: number[];
  fireflyPrimaryHex: number;
  fireflySecondaryHex: number;
  sunbeamHex: number;
  // Creature theme colors
  pufferCapHex: number;
  pufferSpotHex: number;
  rollerShellHex: number;
  rollerGlowHex: number;
  spriteBodyHex: number;
  spriteWingHex: number;
  bossBarkHex: number;
  bossCrownHex: number;
  bossCoreHex: number;
  bossShieldHex: number;
}

const STAGE_BIOMES: StageBiomeTheme[] = [
  {
    id: 'emerald-meadow',
    nameFa: 'معبد ابسیدین و خرابه‌های زمردین',
    nameEn: 'Obsidian Sanctum & Emerald Ley-Ruins',
    meadowHex: 0x1b2e28,
    mossHex: 0x111f1b,
    trailHex: 0x92400e,
    pondBedHex: 0x0891b2,
    cliffHex: 0x0f172a,
    plazaHex: 0x334155,
    canopyPrimaryHex: 0x134e4a,
    canopySecondaryHex: 0x0f766e,
    trunkHex: 0x1e293b,
    mountainPrimaryHex: 0x0f172a,
    mountainSecondaryHex: 0x1e293b,
    waterHex: 0x06b6d4,
    waterEmissiveHex: 0x0284c7,
    lilyHex: 0x0d9488,
    lotusHex: 0xfbbf24,
    flowerPalette: [0xfbbf24, 0x38bdf8, 0x10b981, 0xf59e0b, 0x2dd4bf, 0xe2e8f0],
    grassPalette: [0x115e59, 0x0f766e, 0x134e4a],
    fernPalette: [0x0f766e, 0x1e293b],
    crystalPalette: [0x38bdf8, 0x10b981, 0xfbbf24],
    fireflyPrimaryHex: 0xfbbf24,
    fireflySecondaryHex: 0x38bdf8,
    sunbeamHex: 0x38bdf8,
    pufferCapHex: 0xbe123c,
    pufferSpotHex: 0x38bdf8,
    rollerShellHex: 0x1e293b,
    rollerGlowHex: 0xf59e0b,
    spriteBodyHex: 0x4c1d95,
    spriteWingHex: 0x38bdf8,
    bossBarkHex: 0x0f172a,
    bossCrownHex: 0xf59e0b,
    bossCoreHex: 0xef4444,
    bossShieldHex: 0x38bdf8,
  },
  {
    id: 'sakura-valley',
    nameFa: 'دژ ماه خونین و تالارهای سرخ',
    nameEn: 'Blood-Moon Sovereign Bastion',
    meadowHex: 0x261724,
    mossHex: 0x180e18,
    trailHex: 0x7f1d1d,
    pondBedHex: 0x9d174d,
    cliffHex: 0x140a14,
    plazaHex: 0x3b1d2e,
    canopyPrimaryHex: 0x881337,
    canopySecondaryHex: 0xbe123c,
    trunkHex: 0x1c1917,
    mountainPrimaryHex: 0x180e18,
    mountainSecondaryHex: 0x3b1d2e,
    waterHex: 0xe11d48,
    waterEmissiveHex: 0x9f1239,
    lilyHex: 0x4c1d95,
    lotusHex: 0xfbbf24,
    flowerPalette: [0xf43f5e, 0xfbbf24, 0xc084fc, 0xfb7185, 0xf59e0b, 0xe2e8f0],
    grassPalette: [0x4c0519, 0x881337, 0x3b0764],
    fernPalette: [0x881337, 0x3b1d2e],
    crystalPalette: [0xf43f5e, 0xc084fc, 0xfbbf24],
    fireflyPrimaryHex: 0xf43f5e,
    fireflySecondaryHex: 0xfbbf24,
    sunbeamHex: 0xfda4af,
    pufferCapHex: 0xe11d48,
    pufferSpotHex: 0xfbbf24,
    rollerShellHex: 0x27272a,
    rollerGlowHex: 0xf43f5e,
    spriteBodyHex: 0x701a75,
    spriteWingHex: 0xf43f5e,
    bossBarkHex: 0x18181b,
    bossCrownHex: 0xe11d48,
    bossCoreHex: 0xf43f5e,
    bossShieldHex: 0xc084fc,
  },
  {
    id: 'amber-autumn',
    nameFa: 'کوره تایتان‌های خورشیدزاد',
    nameEn: 'Sunforged Titan Foundry',
    meadowHex: 0x291d12,
    mossHex: 0x1c130b,
    trailHex: 0xb45309,
    pondBedHex: 0xea580c,
    cliffHex: 0x140d07,
    plazaHex: 0x451a03,
    canopyPrimaryHex: 0x9a3412,
    canopySecondaryHex: 0xd97706,
    trunkHex: 0x1c1917,
    mountainPrimaryHex: 0x1c130b,
    mountainSecondaryHex: 0x451a03,
    waterHex: 0xf97316,
    waterEmissiveHex: 0xc2410c,
    lilyHex: 0x78350f,
    lotusHex: 0xfef08a,
    flowerPalette: [0xfbbf24, 0xf97316, 0xef4444, 0x38bdf8, 0xf59e0b, 0xfef3c7],
    grassPalette: [0x78350f, 0x92400e, 0x451a03],
    fernPalette: [0x9a3412, 0x78350f],
    crystalPalette: [0xfbbf24, 0xf97316, 0x38bdf8],
    fireflyPrimaryHex: 0xfbbf24,
    fireflySecondaryHex: 0xf97316,
    sunbeamHex: 0xfde68a,
    pufferCapHex: 0xea580c,
    pufferSpotHex: 0xfef08a,
    rollerShellHex: 0x292524,
    rollerGlowHex: 0xfbbf24,
    spriteBodyHex: 0x7c2d12,
    spriteWingHex: 0xfbbf24,
    bossBarkHex: 0x1c1917,
    bossCrownHex: 0xf97316,
    bossCoreHex: 0xfbbf24,
    bossShieldHex: 0xf97316,
  },
  {
    id: 'frost-aurora',
    nameFa: 'مناره یخ‌بندان شفق قطبی',
    nameEn: 'Glacial Borealis Spire',
    meadowHex: 0x152238,
    mossHex: 0x0f172a,
    trailHex: 0x0369a1,
    pondBedHex: 0x0284c7,
    cliffHex: 0x090d16,
    plazaHex: 0x1e293b,
    canopyPrimaryHex: 0x0284c7,
    canopySecondaryHex: 0x38bdf8,
    trunkHex: 0x0f172a,
    mountainPrimaryHex: 0x090d16,
    mountainSecondaryHex: 0x1e293b,
    waterHex: 0x38bdf8,
    waterEmissiveHex: 0x0284c7,
    lilyHex: 0x0369a1,
    lotusHex: 0x2dd4bf,
    flowerPalette: [0x38bdf8, 0x2dd4bf, 0x818cf8, 0xf8fafc, 0x0ea5e9, 0xfbbf24],
    grassPalette: [0x1e3a8a, 0x0c4a6e, 0x164e63],
    fernPalette: [0x0369a1, 0x1e293b],
    crystalPalette: [0x38bdf8, 0x2dd4bf, 0x818cf8],
    fireflyPrimaryHex: 0x38bdf8,
    fireflySecondaryHex: 0x2dd4bf,
    sunbeamHex: 0xbae6fd,
    pufferCapHex: 0x0284c7,
    pufferSpotHex: 0x2dd4bf,
    rollerShellHex: 0x0f172a,
    rollerGlowHex: 0x38bdf8,
    spriteBodyHex: 0x1e1b4b,
    spriteWingHex: 0x2dd4bf,
    bossBarkHex: 0x090d16,
    bossCrownHex: 0x38bdf8,
    bossCoreHex: 0x2dd4bf,
    bossShieldHex: 0x38bdf8,
  },
  {
    id: 'astral-oasis',
    nameFa: 'کانون خلأ اختران و ستارگان',
    nameEn: 'Celestial Void Nexus',
    meadowHex: 0x160d29,
    mossHex: 0x0b0518,
    trailHex: 0x6d28d9,
    pondBedHex: 0x38bdf8,
    cliffHex: 0x070312,
    plazaHex: 0x2e1065,
    canopyPrimaryHex: 0x5b21b6,
    canopySecondaryHex: 0x0284c7,
    trunkHex: 0x0f172a,
    mountainPrimaryHex: 0x090414,
    mountainSecondaryHex: 0x2e1065,
    waterHex: 0x38bdf8,
    waterEmissiveHex: 0x6d28d9,
    lilyHex: 0x4c1d95,
    lotusHex: 0xfbbf24,
    flowerPalette: [0xfbbf24, 0x38bdf8, 0xf43f5e, 0x2dd4bf, 0xc084fc, 0xffffff],
    grassPalette: [0x3b0764, 0x1e1b4b, 0x311042],
    fernPalette: [0x4c1d95, 0x1e3a8a],
    crystalPalette: [0xfbbf24, 0xf43f5e, 0x38bdf8],
    fireflyPrimaryHex: 0xfbbf24,
    fireflySecondaryHex: 0x38bdf8,
    sunbeamHex: 0xc084fc,
    pufferCapHex: 0xe11d48,
    pufferSpotHex: 0xfbbf24,
    rollerShellHex: 0x1e1b4b,
    rollerGlowHex: 0x38bdf8,
    spriteBodyHex: 0x0284c7,
    spriteWingHex: 0xfbbf24,
    bossBarkHex: 0x090414,
    bossCrownHex: 0x38bdf8,
    bossCoreHex: 0xf43f5e,
    bossShieldHex: 0x38bdf8,
  },
];

/**
 * Returns the distinct biome theme (terrain, trees, water, crystals, and creature colors)
 * for any chapter number so every stage looks and feels genuinely different.
 */
export function getStageBiomeTheme(chapterNumber: number): StageBiomeTheme {
  const lvl = Math.max(1, Math.floor(chapterNumber));
  return STAGE_BIOMES[(lvl - 1) % STAGE_BIOMES.length];
}

export type StageMissionMode =
  | 'rescue_escort'
  | 'harmonic_bells'
  | 'heart_tree_defense'
  | 'meteor_rush'
  | 'boss_duel';

export type StageTrailPattern =
  | 'radial_cross'
  | 'spiral_glade'
  | 'twin_crescent'
  | 'star_pentagram'
  | 'serpentine_valley';

export type StageObstacleType =
  | 'moss_boulder'
  | 'hollow_log'
  | 'crystal_spire'
  | 'ruin_pillar';

export interface StageObstacle {
  id: string;
  type: StageObstacleType;
  x: number;
  z: number;
  radius: number;
  rotationY: number;
  scale: number;
}

export interface StageMapLayout {
  chapterNumber: number;
  seed: number;
  trailPattern: StageTrailPattern;
  terrainWavePhaseX: number;
  terrainWavePhaseZ: number;
  pondX: number;
  pondZ: number;
  pondRadius: number;
  archCoords: { x: number; z: number; rotY: number }[];
  shrineCoords: { id: number; name: string; x: number; z: number }[];
  centerpieceScale: number;
  centerpieceVariant: number;
  obstacles: StageObstacle[];
}

export interface LostSproutItem {
  id: string;
  cageX: number;
  cageZ: number;
  x: number;
  z: number;
  state: 'caged' | 'following' | 'rescued';
}

export interface HarmonicBellItem {
  id: string;
  index: number;
  x: number;
  z: number;
  isRung: boolean;
}

export interface DefenseTotemItem {
  id: string;
  x: number;
  z: number;
  cooldown: number;
}

export interface StarlightMeteorItem {
  id: string;
  x: number;
  z: number;
  timeRemaining: number;
  maxTime: number;
  collected: boolean;
}

export interface BoostPadItem {
  id: string;
  x: number;
  z: number;
  angleRad: number;
}

export interface StageMissionState {
  mode: StageMissionMode;
  chapterNumber: number;
  tierLevel: number;
  mapLayout: StageMapLayout;
  missionTitleFa: string;
  missionTitleEn: string;
  missionBadgeFa: string;
  missionBadgeEn: string;
  currentCount: number;
  targetCount: number;
  // Mode 1: rescue_escort
  lostSprouts: LostSproutItem[];
  followingCount: number;
  safeZoneX: number;
  safeZoneZ: number;
  // Mode 2: harmonic_bells
  bells: HarmonicBellItem[];
  allBellsRung: boolean;
  // Mode 3: heart_tree_defense
  heartTreeHp: number;
  heartTreeMaxHp: number;
  currentWave: number;
  totalWaves: number;
  totems: DefenseTotemItem[];
  // Mode 4: meteor_rush
  meteors: StarlightMeteorItem[];
  // Shared boost pads (wind streams in Stage 2, aurora pads in Stage 4, etc.)
  boostPads: BoostPadItem[];
  speedBoostRemaining: number;
  // Mode 5: boss_duel
  bossStunRemaining: number;
}

export function getStageMissionMode(chapterNumber: number): StageMissionMode {
  const lvl = Math.max(1, Math.floor(chapterNumber));
  const modes: StageMissionMode[] = [
    'rescue_escort',
    'harmonic_bells',
    'heart_tree_defense',
    'meteor_rush',
    'boss_duel',
  ];
  return modes[(lvl - 1) % modes.length];
}

/**
 * Deterministic seeded PRNG (Mulberry32) so every chapter N generates a reproducible,
 * genuinely distinct 3D map layout, obstacle formation, and objective coordinate set.
 */
function createSeededPrng(seedInput: number): () => number {
  let a = (seedInput * 7919 + 0x9e3779b9) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Procedurally shifts the 3D map layout, pond coordinates, trail topology,
 * mid-field collidable 3D obstacles, and shrine/pillar coordinates for every chapter.
 */
export function generateStageMapLayout(chapterNumber: number): StageMapLayout {
  const lvl = Math.max(1, Math.floor(chapterNumber));
  const rand = createSeededPrng(lvl);

  const patterns: StageTrailPattern[] = [
    'radial_cross',
    'spiral_glade',
    'twin_crescent',
    'star_pentagram',
    'serpentine_valley',
  ];
  const trailPattern = patterns[(lvl - 1) % patterns.length];

  const terrainWavePhaseX = (lvl - 1) * 1.15;
  const terrainWavePhaseZ = (lvl - 1) * 0.85;

  // Shift Reflective Crystal Pond around the meadow while avoiding (0,0) and Home Base (0,14)
  const pondAngles = [0.18, -0.75, 2.35, -2.15, 0.92, -1.45, 2.8];
  const pAng = pondAngles[(lvl - 1) % pondAngles.length] + (rand() - 0.5) * 0.25;
  const pDist = 11.0 + (lvl % 3) * 2.2;
  const pondX = Math.round(Math.cos(pAng) * pDist * 10) / 10;
  let pondZ = Math.round(Math.sin(pAng) * pDist * 10) / 10;
  if (distance(pondX, pondZ, GAME_CONSTANTS.HOME_BASE_X, GAME_CONSTANTS.HOME_BASE_Z) < 8.5) {
    pondZ = -Math.abs(pondZ) - 6;
  }
  const pondRadius = 3.5 + (lvl % 3) * 0.45;

  // Rotate and shift the 4 Shrine / Resonance Pillar coordinates per chapter
  const baseRot = ((lvl - 1) * 0.42) % (Math.PI * 2);
  const shrineNames = [
    'Sun Blossom Shrine',
    'Amber Meadow Shrine',
    'Whispering Willow Shrine',
    'Golden Canopy Shrine',
  ];
  const shrineCoords = [0, 1, 2, 3].map((idx) => {
    const a = baseRot + Math.PI * 0.25 + idx * (Math.PI * 0.5) + (rand() - 0.5) * 0.22;
    const r = 17.5 + (idx % 2) * 2.5 + (rand() - 0.5) * 2.0;
    let sx = Math.round(Math.cos(a) * r * 10) / 10;
    const sz = Math.round(Math.sin(a) * r * 10) / 10;
    if (distance(sx, sz, GAME_CONSTANTS.HOME_BASE_X, GAME_CONSTANTS.HOME_BASE_Z) < 8.0) {
      sx += sx >= 0 ? 6.5 : -6.5;
    }
    return {
      id: idx + 1,
      name: shrineNames[idx],
      x: sx,
      z: sz,
    };
  });

  // Position the 4 carved stone archways midway toward the shifted shrines
  const archCoords = shrineCoords.map((s) => {
    const ax = Math.round(s.x * 0.58 * 10) / 10;
    const az = Math.round(s.z * 0.58 * 10) / 10;
    return {
      x: ax,
      z: az,
      rotY: Math.atan2(s.x, s.z),
    };
  });

  // Generate 8..12 procedural mid-field 3D obstacles that never block (0,0), Home Base, Pond, or Shrines
  const obstacleTypes: StageObstacleType[] = [
    'moss_boulder',
    'hollow_log',
    'crystal_spire',
    'ruin_pillar',
  ];
  const obstacleCount = 8 + (lvl % 5);
  const obstacles: StageObstacle[] = [];

  for (let i = 0; i < obstacleCount; i++) {
    const type = obstacleTypes[(i + lvl) % obstacleTypes.length];
    const ringAngle =
      baseRot * 1.3 + (i / obstacleCount) * Math.PI * 2 + (rand() - 0.5) * 0.35;
    const ringRad = 7.5 + ((i * 3.7 + lvl * 2.1) % 19.5);
    let ox = Math.cos(ringAngle) * ringRad;
    let oz = Math.sin(ringAngle) * ringRad;

    // Keep clear of Home Base Sanctuary (0, 14) and Player Spawn (0, 11)
    if (distance(ox, oz, 0, 13.5) < 7.5) {
      ox += ox >= 0 ? 7.5 : -7.5;
    }
    // Keep clear of Centerpiece (0, 0)
    if (Math.hypot(ox, oz) < 5.8) {
      const push = 6.2 / Math.max(0.5, Math.hypot(ox, oz));
      ox *= push;
      oz *= push;
    }
    // Keep clear of Pond
    if (distance(ox, oz, pondX, pondZ) < pondRadius + 2.2) {
      ox -= 4.5;
      oz -= 4.5;
    }

    const scale = 0.85 + rand() * 0.45;
    const baseRadius =
      type === 'hollow_log' ? 1.35 : type === 'moss_boulder' ? 1.25 : 1.05;

    obstacles.push({
      id: `obs_${lvl}_${i}`,
      type,
      x: Math.round(ox * 10) / 10,
      z: Math.round(oz * 10) / 10,
      radius: Math.round(baseRadius * scale * 100) / 100,
      rotationY: Math.round(rand() * Math.PI * 2 * 100) / 100,
      scale: Math.round(scale * 100) / 100,
    });
  }

  return {
    chapterNumber: lvl,
    seed: lvl * 7919,
    trailPattern,
    terrainWavePhaseX,
    terrainWavePhaseZ,
    pondX,
    pondZ,
    pondRadius,
    archCoords,
    shrineCoords,
    centerpieceScale: 1.0 + ((lvl - 1) % 4) * 0.08,
    centerpieceVariant: (lvl - 1) % 5,
    obstacles,
  };
}

export function createInitialMissionState(chapterNumber: number): StageMissionState {
  const lvl = Math.max(1, Math.floor(chapterNumber));
  const tierLevel = Math.floor((lvl - 1) / 5);
  const mode = getStageMissionMode(lvl);
  const mapLayout = generateStageMapLayout(lvl);
  const rand = createSeededPrng(lvl * 31 + 7);
  const rotOffset = ((lvl - 1) * 0.55) % (Math.PI * 2);

  // Procedurally shift Lost Sprout Cages & scale count with tier (3 -> 4 -> 5)
  const sproutCount = Math.min(5, 3 + tierLevel);
  const lostSprouts: LostSproutItem[] = Array.from({ length: sproutCount }, (_, idx) => {
    const ang = rotOffset + (idx / sproutCount) * Math.PI * 2 + Math.PI * 0.65;
    const rad = 18.5 + (idx % 2) * 4.5 + (rand() - 0.5) * 2.5;
    const cx = Math.round(Math.cos(ang) * rad * 10) / 10;
    let cz = Math.round(Math.sin(ang) * rad * 10) / 10;
    if (distance(cx, cz, 0, 13.5) < 9.5) {
      cz = -Math.abs(cz) - 10;
    }
    return {
      id: `sprout-${lvl}-${idx + 1}`,
      cageX: cx,
      cageZ: cz,
      x: cx,
      z: cz,
      state: 'caged',
    };
  });

  // Procedurally shift Harmonic Bell Towers & scale count with tier (4 -> 5 -> 6)
  const bellCount = Math.min(6, 4 + Math.min(2, tierLevel));
  const bells: HarmonicBellItem[] = Array.from({ length: bellCount }, (_, idx) => {
    const ang = rotOffset + Math.PI * 0.25 + (idx / bellCount) * Math.PI * 2;
    const rad = 19.5 + (idx % 2) * 3.0;
    let bx = Math.round(Math.cos(ang) * rad * 10) / 10;
    const bz = Math.round(Math.sin(ang) * rad * 10) / 10;
    if (distance(bx, bz, 0, 13.5) < 8.5) {
      bx += bx >= 0 ? 7 : -7;
    }
    return {
      id: `bell-${lvl}-${idx + 1}`,
      index: idx + 1,
      x: bx,
      z: bz,
      isRung: false,
    };
  });

  // Procedurally shift Heart-Tree Defense Totems around center (3 -> 4)
  const totemCount = Math.min(4, 3 + Math.min(1, tierLevel));
  const totems: DefenseTotemItem[] = Array.from({ length: totemCount }, (_, idx) => {
    const ang = rotOffset + (idx / totemCount) * Math.PI * 2 - Math.PI / 2;
    const rad = 8.8 + (idx % 2) * 1.4;
    return {
      id: `totem-${lvl}-${idx + 1}`,
      x: Math.round(Math.cos(ang) * rad * 10) / 10,
      z: Math.round(Math.sin(ang) * rad * 10) / 10,
      cooldown: 0,
    };
  });

  // Procedurally shift Falling Starlight Meteors
  const meteors: StarlightMeteorItem[] = [0, 1, 2].map((idx) => {
    const ang = rotOffset + idx * ((Math.PI * 2) / 3) + 0.4;
    const rad = 15 + idx * 3.5;
    const mx = Math.round(Math.cos(ang) * rad * 10) / 10;
    let mz = Math.round(Math.sin(ang) * rad * 10) / 10;
    if (distance(mx, mz, 0, 13.5) < 7.5) {
      mz = -Math.abs(mz) - 8;
    }
    return {
      id: `meteor-${lvl}-${idx + 1}`,
      x: mx,
      z: mz,
      timeRemaining: 28 - idx * 2,
      maxTime: 28,
      collected: false,
    };
  });

  // Procedurally place Speed Boost Pads / Wind Streams for every stage mode
  const padCount = mode === 'harmonic_bells' || mode === 'meteor_rush' ? 4 : 3;
  const boostPads: BoostPadItem[] = Array.from({ length: padCount }, (_, idx) => {
    const ang = rotOffset + idx * ((Math.PI * 2) / padCount);
    const rad = 10.5 + (idx % 2) * 2.0;
    return {
      id: `pad-${lvl}-${idx + 1}`,
      x: Math.round(Math.cos(ang) * rad * 10) / 10,
      z: Math.round(Math.sin(ang) * rad * 10) / 10,
      angleRad: ang + Math.PI / 2,
    };
  });

  const waveCount = 3 + Math.min(2, tierLevel);
  const waveTargetCritters = waveCount * 3;
  const meteorTargetCount = Math.min(10, 6 + tierLevel * 2);

  switch (mode) {
    case 'rescue_escort':
      return {
        mode,
        chapterNumber: lvl,
        tierLevel,
        mapLayout,
        missionTitleFa: `نجات و هدایت ${sproutCount} جوانه گمشده به کلبه امن`,
        missionTitleEn: `Rescue & Escort ${sproutCount} Lost Sproutlings to the Safe Cottage`,
        missionBadgeFa: 'ماموریت نجات و اسکورت',
        missionBadgeEn: 'Rescue & Escort Mission',
        currentCount: 0,
        targetCount: sproutCount,
        lostSprouts,
        followingCount: 0,
        safeZoneX: 0,
        safeZoneZ: 13.5,
        bells: [],
        allBellsRung: false,
        heartTreeHp: 100,
        heartTreeMaxHp: 100,
        currentWave: 1,
        totalWaves: 3,
        totems: [],
        meteors: [],
        boostPads,
        speedBoostRemaining: 0,
        bossStunRemaining: 0,
      };
    case 'harmonic_bells':
      return {
        mode,
        chapterNumber: lvl,
        tierLevel,
        mapLayout,
        missionTitleFa: `گذر از تندباد ساکورا و نواختن ${bellCount} زنگوله باستانی`,
        missionTitleEn: `Ride Wind Streams & Ring ${bellCount} Ancient Harmonic Bells`,
        missionBadgeFa: 'پازل زنگوله‌ها و پل نوری',
        missionBadgeEn: 'Harmonic Bells & Wind Puzzle',
        currentCount: 0,
        targetCount: bellCount,
        lostSprouts: [],
        followingCount: 0,
        safeZoneX: 0,
        safeZoneZ: 13.5,
        bells,
        allBellsRung: false,
        heartTreeHp: 100,
        heartTreeMaxHp: 100,
        currentWave: 1,
        totalWaves: 3,
        totems: [],
        meteors: [],
        boostPads,
        speedBoostRemaining: 0,
        bossStunRemaining: 0,
      };
    case 'heart_tree_defense':
      return {
        mode,
        chapterNumber: lvl,
        tierLevel,
        mapLayout,
        missionTitleFa: `دفاع از درخت قلب کهربایی در برابر ${waveCount} موج مهاجمان`,
        missionTitleEn: `Defend the Amber Heart-Tree Against ${waveCount} Critter Waves`,
        missionBadgeFa: 'دفاع از درخت قلب',
        missionBadgeEn: 'Heart-Tree Wave Defense',
        currentCount: 0,
        targetCount: waveTargetCritters,
        lostSprouts: [],
        followingCount: 0,
        safeZoneX: 0,
        safeZoneZ: 13.5,
        bells: [],
        allBellsRung: false,
        heartTreeHp: 100,
        heartTreeMaxHp: 100,
        currentWave: 1,
        totalWaves: waveCount,
        totems,
        meteors: [],
        boostPads,
        speedBoostRemaining: 0,
        bossStunRemaining: 0,
      };
    case 'meteor_rush':
      return {
        mode,
        chapterNumber: lvl,
        tierLevel,
        mapLayout,
        missionTitleFa: `شکار ${meteorTargetCount} شهاب‌سنگ ستاره‌ای پیش از خاموش شدن نورشان`,
        missionTitleEn: `Catch ${meteorTargetCount} Falling Starlight Meteors Before They Fade`,
        missionBadgeFa: 'شهاب‌باران شفق قطبی',
        missionBadgeEn: 'Starlight Meteor Rush',
        currentCount: 0,
        targetCount: meteorTargetCount,
        lostSprouts: [],
        followingCount: 0,
        safeZoneX: 0,
        safeZoneZ: 13.5,
        bells: [],
        allBellsRung: false,
        heartTreeHp: 100,
        heartTreeMaxHp: 100,
        currentWave: 1,
        totalWaves: 3,
        totems: [],
        meteors,
        boostPads,
        speedBoostRemaining: 0,
        bossStunRemaining: 0,
      };
    case 'boss_duel':
      return {
        mode,
        chapterNumber: lvl,
        tierLevel,
        mapLayout,
        missionTitleFa: 'نبرد مستقیم با غول نگهبان با کمک ستون‌های اخترتاب',
        missionTitleEn: 'Cleanse the Astral Bramble-King Using Starlight Pillars',
        missionBadgeFa: 'میدان نبرد غول نگهبان',
        missionBadgeEn: 'Celestial Boss Arena',
        currentCount: 0,
        targetCount: 1,
        lostSprouts: [],
        followingCount: 0,
        safeZoneX: 0,
        safeZoneZ: 13.5,
        bells: [],
        allBellsRung: false,
        heartTreeHp: 100,
        heartTreeMaxHp: 100,
        currentWave: 1,
        totalWaves: 1,
        totems: [],
        meteors: [],
        boostPads,
        speedBoostRemaining: 0,
        bossStunRemaining: 0,
      };
  }
}

export interface ChapterStoryInfo {
  chapterNumber: number;
  title: string;
  subtitle: string;
  storyParagraph: string;
  featuredWeather: WeatherType;
  featuredTimePhase: TimePhase;
  seedsPerShrine: number;
  enemyCount: number;
  bossMaxHp: number;
  biomeId: StageBiomeId;
  biomeNameFa: string;
  biomeNameEn: string;
  enemySpeedScale: number;
  missionMode: StageMissionMode;
  missionTitleFa: string;
  missionTitleEn: string;
  missionBadgeFa: string;
  missionBadgeEn: string;
}

export type StoryTriggerEvent =
  | 'chapter_start'
  | 'first_seed'
  | 'shrine_1'
  | 'shrine_2'
  | 'shrine_3'
  | 'all_shrines_restored'
  | 'boss_damaged'
  | 'boss_cleansed';

export interface InGameStoryBeat {
  id: StoryTriggerEvent;
  stepIndex: number;
  totalSteps: number;
  speakerFa: string;
  speakerEn: string;
  textFa: string;
  textEn: string;
  hintFa: string;
  hintEn: string;
}

export interface StageObjectiveGuide {
  currentStep: 1 | 2 | 3;
  totalSteps: 3;
  progressPercent: number;
  targetX: number;
  targetZ: number;
  distanceMeters: number;
  angleToTargetRad: number;
  bossShieldActive: boolean;
  headlineFa: string;
  headlineEn: string;
  sublineFa: string;
  sublineEn: string;
}

const CHAPTER_ADJECTIVES = [
  'Sunlit',
  'Sakura',
  'Amber',
  'Aurora',
  'Starlight',
  'Blooming',
  'Dewdrop',
  'Crystal',
  'Velvet',
  'Emerald',
  'Lullaby',
  'Moonbeam',
];

const CHAPTER_PLACES = [
  'Emerald Glade',
  'Blossom Sanctuary',
  'Lantern Grove',
  'Frostveil Basin',
  'Astral Orchard',
  'Mossy Crown',
  'Willow Glade',
  'Honey Hollow',
  'Sun-Seed Basin',
  'Spirit Orchard',
];

const CHAPTER_SPIRITS = [
  'Elder Oak Spirit',
  'Sakura Songbird',
  'Lady of the Fireflies',
  'Frost-Crystal Stag',
  'Astral Sun-Weaver',
  'Slumbering Moss Tortoise',
  'Star-Petal Deer',
  'Wind-Chime Owl',
];

/**
 * Deterministically generates accessible, genuinely distinct chapters with unique biomes,
/**
 * Smooth circle-to-circle sliding collision resolution against procedural mid-field 3D stage obstacles.
 */
export function resolveStageObstacleCollisions(
  x: number,
  z: number,
  entityRadius: number,
  obstacles: readonly StageObstacle[]
): { x: number; z: number } {
  let nextX = x;
  let nextZ = z;
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    const minDist = entityRadius + obs.radius;
    const dx = nextX - obs.x;
    const dz = nextZ - obs.z;
    const distSq = dx * dx + dz * dz;
    if (distSq < minDist * minDist && distSq > 0.0001) {
      const d = Math.sqrt(distSq);
      const overlap = minDist - d;
      nextX += (dx / d) * overlap;
      nextZ += (dz / d) * overlap;
    }
  }
  return { x: nextX, z: nextZ };
}

/**
 * Deterministically generates accessible, genuinely distinct chapters with unique biomes,
 * 3D map layouts, and non-repetitive gameplay missions for each stage.
 */
export function generateChapterInfo(chapterNumber: number): ChapterStoryInfo {
  const lvl = Math.max(1, Math.floor(chapterNumber));
  const biome = getStageBiomeTheme(lvl);
  const mission = createInitialMissionState(lvl);
  const adj = CHAPTER_ADJECTIVES[(lvl - 1) % CHAPTER_ADJECTIVES.length];
  const place = CHAPTER_PLACES[(lvl - 1) % CHAPTER_PLACES.length];

  const weathers: WeatherType[] = ['sunshine', 'petals', 'sunshine', 'snow', 'petals'];
  const phases: TimePhase[] = ['day', 'dawn', 'sunset', 'day', 'night'];

  const featuredWeather = weathers[(lvl - 1) % weathers.length];
  const featuredTimePhase = phases[(lvl - 1) % phases.length];

  const seedsPerShrine = 1;
  const enemyCount = mission.mode === 'heart_tree_defense' ? 3 : Math.min(8, 4 + Math.floor(lvl * 0.6));
  const bossMaxHp = Math.min(18, 6 + Math.floor(lvl * 1.2));
  const enemySpeedScale = Math.min(1.08, 0.74 + (lvl - 1) * 0.04);

  const storyByMode: Record<StageMissionMode, string> = {
    rescue_escort: `Chapter ${lvl} (${biome.nameEn}): ${mission.targetCount} baby Grove Sproutlings are trapped in thorny cages across a shifted ${mission.mapLayout.trailPattern.replace('_', ' ')} layout! Break their cages and escort their hopping caravan safely back to your Sanctuary Cottage!`,
    harmonic_bells: `Chapter ${lvl} (${biome.nameEn}): Ride the pink Sakura wind-streams across crystal bridges and ring all ${mission.targetCount} Ancient Harmonic Chime Bells to awaken the Grand Sakura Pavilion at the center!`,
    heart_tree_defense: `Chapter ${lvl} (${biome.nameEn}): Autumn rollers are marching toward the Ancient Amber Heart-Tree at the center! Strike the Golden Pulse Totems and defend the Heart-Tree across ${mission.totalWaves} short waves!`,
    meteor_rush: `Chapter ${lvl} (${biome.nameEn}): Glowing Starlight Meteors are falling across the Aurora Frostveil Basin! Dash across the icy speed-boost pads and catch ${mission.targetCount} Starlight Meteors before their glow fades!`,
    boss_duel: `Chapter ${lvl} (${biome.nameEn}): Enter the Celestial Resonance Arena! Strike the shifted Astral Pillars to stun the Ancient Bramble-King, shatter his dark armor, and restore the Astral Oasis!`,
  };

  return {
    chapterNumber: lvl,
    title: `Chapter ${lvl}: ${adj} ${place}`,
    subtitle: `${biome.nameEn} · ${mission.missionBadgeEn}`,
    storyParagraph: storyByMode[mission.mode],
    featuredWeather,
    featuredTimePhase,
    seedsPerShrine,
    enemyCount,
    bossMaxHp,
    biomeId: biome.id,
    biomeNameFa: biome.nameFa,
    biomeNameEn: biome.nameEn,
    enemySpeedScale,
    missionMode: mission.mode,
    missionTitleFa: mission.missionTitleFa,
    missionTitleEn: mission.missionTitleEn,
    missionBadgeFa: mission.missionBadgeFa,
    missionBadgeEn: mission.missionBadgeEn,
  };
}

/**
 * Computes the live step-by-step stage progression guide and 3D compass target
 * tailored to each stage's unique mission mode (or fallback shrine/boss mode).
 */
export function computeStageObjectiveGuide(params: {
  playerX: number;
  playerZ: number;
  sunSeeds: number;
  shrines: readonly Shrine[];
  bossHp: number;
  bossMaxHp: number;
  bossCleansed: boolean;
  chapterNumber: number;
  missionState?: StageMissionState;
}): StageObjectiveGuide {
  const {
    playerX,
    playerZ,
    sunSeeds,
    shrines,
    bossHp,
    bossMaxHp,
    bossCleansed,
    chapterNumber,
    missionState,
  } = params;

  // If missionState is provided, compute dynamic guidance for the 5 distinct stage gameplay modes!
  if (missionState) {
    const mode = missionState.mode;

    // ------------------------------------------------------------------------
    // STAGE MODE 1: RESCUE & ESCORT LOST SPROUTLINGS
    // ------------------------------------------------------------------------
    if (mode === 'rescue_escort') {
      const rescued = missionState.currentCount;
      const total = missionState.targetCount;
      const following = missionState.lostSprouts.filter((s) => s.state === 'following');
      const caged = missionState.lostSprouts.filter((s) => s.state === 'caged');

      if (rescued >= total) {
        return {
          currentStep: 3,
          totalSteps: 3,
          progressPercent: 100,
          targetX: missionState.safeZoneX,
          targetZ: missionState.safeZoneZ,
          distanceMeters: 0,
          angleToTargetRad: 0,
          bossShieldActive: false,
          headlineFa: `فصل ${chapterNumber} کامل شد! هر ۳ جوانه به خانه امن رسیدند`,
          headlineEn: `Chapter ${chapterNumber} Complete! All 3 Sproutlings Rescued`,
          sublineFa: `آفرین! کاروان جوانه‌ها در امنیت کامل هستند.`,
          sublineEn: `Wonderful! All lost sproutlings are safe in the Sanctuary Cottage.`,
        };
      }

      // If any sproutling is currently following Pip and no more caged ones are nearby, or all remaining are following -> guide to Safe Cottage!
      if (following.length > 0 && (caged.length === 0 || following.length >= 2)) {
        const tx = missionState.safeZoneX;
        const tz = missionState.safeZoneZ;
        const dist = Math.round(distance(playerX, playerZ, tx, tz));
        const angle = Math.atan2(tx - playerX, tz - playerZ);
        const pct = Math.min(95, Math.round(((rescued + following.length * 0.5) / total) * 100));
        return {
          currentStep: 2,
          totalSteps: 3,
          progressPercent: pct,
          targetX: tx,
          targetZ: tz,
          distanceMeters: dist,
          angleToTargetRad: angle,
          bossShieldActive: false,
          headlineFa: `اسکورت به کلبه امن (${rescued}/${total} نجات‌یافته · ${following.length} دنبال‌کننده)`,
          headlineEn: `Escort to Safe Cottage (${rescued}/${total} Rescued · ${following.length} Following)`,
          sublineFa: `جوانه‌های آزادشده پشت سر شما می‌پرند! آن‌ها را به حیاط کلبه امن (${dist} متر) ببرید.`,
          sublineEn: `The freed sproutlings are hopping behind you! Lead them to the Safe Cottage (${dist}m).`,
        };
      }

      // Otherwise point to nearest caged sproutling
      let nearest = caged[0];
      let minDist = Infinity;
      for (const c of caged) {
        const d = distance(playerX, playerZ, c.cageX, c.cageZ);
        if (d < minDist) {
          minDist = d;
          nearest = c;
        }
      }
      const tx = nearest ? nearest.cageX : missionState.safeZoneX;
      const tz = nearest ? nearest.cageZ : missionState.safeZoneZ;
      const dist = Math.round(distance(playerX, playerZ, tx, tz));
      const angle = Math.atan2(tx - playerX, tz - playerZ);
      const pct = Math.round(((rescued + following.length * 0.4) / total) * 100);

      return {
        currentStep: 1,
        totalSteps: 3,
        progressPercent: pct,
        targetX: tx,
        targetZ: tz,
        distanceMeters: dist,
        angleToTargetRad: angle,
        bossShieldActive: false,
        headlineFa: `ماموریت نجات: رهاسازی جوانه‌های گمشده (${rescued}/${total} در کلبه امن)`,
        headlineEn: `Rescue Mission: Free Lost Sproutlings (${rescued}/${total} Safe)`,
        sublineFa:
          dist <= 4
            ? `کنار قفس خاردار هستید! دکمه ضربه (Space) یا تعامل (E) را بزنید تا جوانه آزاد شود!`
            : following.length > 0
            ? `می‌توانید جوانه همراهتان را به کلبه امن ببرید یا قفس بعدی (${dist} متر) را بشکنید!`
            : `پیکان طلایی را تا قفس خاردار (${dist} متر) دنبال کنید و با عصا آن را بشکنید.`,
        sublineEn:
          dist <= 4
            ? `Near Bramble Cage! Strike [Space] or press [E] to free the Lost Sproutling!`
            : `Follow the golden arrow to the Bramble Cage (${dist}m) and break it open!`,
      };
    }

    // ------------------------------------------------------------------------
    // STAGE MODE 2: HARMONIC CHIME BELLS & WIND STREAMS
    // ------------------------------------------------------------------------
    if (mode === 'harmonic_bells') {
      const rung = missionState.currentCount;
      const total = missionState.targetCount;
      const unrung = missionState.bells.filter((b) => !b.isRung);

      if (unrung.length > 0) {
        let nearest = unrung[0];
        let minDist = Infinity;
        for (const b of unrung) {
          const d = distance(playerX, playerZ, b.x, b.z);
          if (d < minDist) {
            minDist = d;
            nearest = b;
          }
        }
        const dist = Math.round(distance(playerX, playerZ, nearest.x, nearest.z));
        const angle = Math.atan2(nearest.x - playerX, nearest.z - playerZ);
        const pct = Math.round((rung / total) * 80);

        return {
          currentStep: 1,
          totalSteps: 3,
          progressPercent: pct,
          targetX: nearest.x,
          targetZ: nearest.z,
          distanceMeters: dist,
          angleToTargetRad: angle,
          bossShieldActive: false,
          headlineFa: `پازل ساکورا: نواختن زنگوله‌های باستانی (${rung}/${total})`,
          headlineEn: `Sakura Puzzle: Ring Ancient Chime Bells (${rung}/${total})`,
          sublineFa:
            dist <= 4.5
              ? `کنار برجک زنگوله هستید! ضربه (Space) یا دکمه (E) را بزنید تا طنین زنگوله پل نوری را روشن کند!`
              : `از دالان‌های باد صورتی برای سرعت گرفتن عبور کنید و زنگوله بعدی (${dist} متر) را به صدا درآورید.`,
          sublineEn:
            dist <= 4.5
              ? `At the Chime Bell! Strike [Space] or press [E] to ring the bell and light the crystal bridge!`
              : `Glide through pink wind-streams and ring the next Ancient Chime Bell (${dist}m).`,
        };
      }

      // All 4 bells rung -> Step into the Grand Sakura Pavilion at (0, 0)
      const distCenter = Math.round(distance(playerX, playerZ, 0, 0));
      const angleCenter = Math.atan2(0 - playerX, 0 - playerZ);
      return {
        currentStep: 2,
        totalSteps: 3,
        progressPercent: 92,
        targetX: 0,
        targetZ: 0,
        distanceMeters: distCenter,
        angleToTargetRad: angleCenter,
        bossShieldActive: false,
        headlineFa: `گام نهایی: ورود به معبد زنگ ساکورا در مرکز (${distCenter} متر)`,
        headlineEn: `Final Step: Enter the Central Sakura Pavilion (${distCenter}m)`,
        sublineFa: `هر ۴ پل نوری روشن شدند! از روی پل بلورین به معبد مرکزی ساکورا بروید تا مرحله کامل شود.`,
        sublineEn: `All 4 crystal bridges shine! Cross to the central Sakura Pavilion to complete the stage.`,
      };
    }

    // ------------------------------------------------------------------------
    // STAGE MODE 3: HEART-TREE SANCTUARY WAVE DEFENSE
    // ------------------------------------------------------------------------
    if (mode === 'heart_tree_defense') {
      const cleansed = missionState.currentCount;
      const target = missionState.targetCount;
      const distCenter = Math.round(distance(playerX, playerZ, 0, 0));
      const angleCenter = Math.atan2(0 - playerX, 0 - playerZ);
      const pct = Math.min(98, Math.round((cleansed / Math.max(1, target)) * 100));

      return {
        currentStep: missionState.currentWave as 1 | 2 | 3,
        totalSteps: 3,
        progressPercent: pct,
        targetX: 0,
        targetZ: 0,
        distanceMeters: distCenter,
        angleToTargetRad: angleCenter,
        bossShieldActive: false,
        headlineFa: `دفاع از درخت قلب کهربایی · موج ${missionState.currentWave} از ${missionState.totalWaves} (جان درخت: ${Math.ceil(missionState.heartTreeHp)}%)`,
        headlineEn: `Defend the Heart-Tree · Wave ${missionState.currentWave}/${missionState.totalWaves} (Tree HP: ${Math.ceil(missionState.heartTreeHp)}%)`,
        sublineFa: `مهاجمان (${cleansed}/${target} پاکسازی‌شده) به سمت مرکز می‌آیند! به آن‌ها ضربه بزنید یا توتم‌های طلایی اطراف درخت را فعال کنید.`,
        sublineEn: `Cleanse incoming critters (${cleansed}/${target}) or strike the Golden Pulse Totems around the Heart-Tree!`,
      };
    }

    // ------------------------------------------------------------------------
    // STAGE MODE 4: FALLING STARLIGHT METEOR HARVEST RACE
    // ------------------------------------------------------------------------
    if (mode === 'meteor_rush') {
      const collected = missionState.currentCount;
      const target = missionState.targetCount;
      const activeMeteors = missionState.meteors.filter((m) => !m.collected);
      let nearest = activeMeteors[0];
      let minDist = Infinity;
      for (const m of activeMeteors) {
        const d = distance(playerX, playerZ, m.x, m.z);
        if (d < minDist) {
          minDist = d;
          nearest = m;
        }
      }
      const tx = nearest ? nearest.x : 0;
      const tz = nearest ? nearest.z : 0;
      const dist = Math.round(distance(playerX, playerZ, tx, tz));
      const angle = Math.atan2(tx - playerX, tz - playerZ);
      const timerSec = nearest ? Math.ceil(nearest.timeRemaining) : 20;
      const pct = Math.min(98, Math.round((collected / Math.max(1, target)) * 100));

      return {
        currentStep: collected < 3 ? 1 : 2,
        totalSteps: 3,
        progressPercent: pct,
        targetX: tx,
        targetZ: tz,
        distanceMeters: dist,
        angleToTargetRad: angle,
        bossShieldActive: false,
        headlineFa: `شهاب‌باران شفق قطبی: جذب شهاب‌های ستاره‌ای (${collected}/${target})`,
        headlineEn: `Aurora Meteor Rush: Catch Falling Starlight Meteors (${collected}/${target})`,
        sublineFa: `پیکان طلایی را تا شهاب‌سنگ بعدی (${dist} متر · ${timerSec} ثانیه تا خاموشی) دنبال کنید! از سکوهای یخی برای شتاب بگیرید.`,
        sublineEn: `Dash to the nearest Starlight Meteor (${dist}m · ${timerSec}s left)! Step on icy Aurora Pads for a speed boost.`,
      };
    }

    // ------------------------------------------------------------------------
    // STAGE MODE 5: CELESTIAL BOSS ARENA DUEL
    // ------------------------------------------------------------------------
    if (mode === 'boss_duel') {
      const unlitShrines = shrines.filter((s) => !s.isRestored);
      const distToBoss = Math.round(distance(playerX, playerZ, 0, 0));
      const angleToBoss = Math.atan2(0 - playerX, 0 - playerZ);
      const bossFraction = bossMaxHp > 0 ? Math.max(0, Math.min(1, (bossMaxHp - bossHp) / bossMaxHp)) : 0;
      const pct = bossCleansed ? 100 : Math.min(98, Math.round(bossFraction * 100));

      if (!bossCleansed && missionState.bossStunRemaining <= 0 && unlitShrines.length > 0 && bossHp > bossMaxHp * 0.35) {
        let nearestPillar = unlitShrines[0];
        let minD = Infinity;
        for (const p of unlitShrines) {
          const d = distance(playerX, playerZ, p.x, p.z);
          if (d < minD) {
            minD = d;
            nearestPillar = p;
          }
        }
        const pDist = Math.round(distance(playerX, playerZ, nearestPillar.x, nearestPillar.z));
        const pAngle = Math.atan2(nearestPillar.x - playerX, nearestPillar.z - playerZ);

        return {
          currentStep: 1,
          totalSteps: 3,
          progressPercent: pct,
          targetX: nearestPillar.x,
          targetZ: nearestPillar.z,
          distanceMeters: pDist,
          angleToTargetRad: pAngle,
          bossShieldActive: true,
          headlineFa: `میدان غول اخترتاب: فعال‌سازی ستون تشدید نور (${pDist} متر) یا ضربه به غول`,
          headlineEn: `Celestial Boss Duel: Strike Starlight Pillar (${pDist}m) to Stun Boss`,
          sublineFa: `به ستون اخترتاب (${pDist} متر) ضربه بزنید یا کلید E را بزنید (بدون نیاز به بذر!) تا غول گیج شده و ۳ برابر آسیب ببیند!`,
          sublineEn: `Strike or press [E] at the Starlight Pillar (${pDist}m, no seeds needed!) to stun the Boss for 3x damage!`,
        };
      }

      return {
        currentStep: 2,
        totalSteps: 3,
        progressPercent: pct,
        targetX: 0,
        targetZ: 0,
        distanceMeters: distToBoss,
        angleToTargetRad: angleToBoss,
        bossShieldActive: false,
        headlineFa: `نبرد نهایی اخترتاب: پاکسازی پادشاه خارها (جان غول: ${Math.ceil(bossHp)}/${bossMaxHp})`,
        headlineEn: `Celestial Boss Duel: Cleanse the Bramble-King (HP: ${Math.ceil(bossHp)}/${bossMaxHp})`,
        sublineFa:
          missionState.bossStunRemaining > 0
            ? `غول گیج شده است (${Math.ceil(missionState.bossStunRemaining)} ثانیه)! همین حالا در مرکز میدان با Space یا Q به او ضربه بزنید!`
            : `پیکان طلایی را به مرکز میدان (${distToBoss} متر) دنبال کنید و پادشاه خارها را پاکسازی کنید!`,
        sublineEn:
          missionState.bossStunRemaining > 0
            ? `Boss is STUNNED (${Math.ceil(missionState.bossStunRemaining)}s)! Strike now with [Space] or [Q] for triple damage!`
            : `Attack the Bramble-King at the center (${distToBoss}m) with [Space] or [Q]!`,
      };
    }
  }

  const totalShrines = shrines.length || 4;
  const restoredShrines = shrines.filter((s) => s.isRestored).length;
  const shrineFraction = totalShrines > 0 ? restoredShrines / totalShrines : 0;
  const bossFraction = bossMaxHp > 0 ? Math.max(0, Math.min(1, (bossMaxHp - bossHp) / bossMaxHp)) : 0;

  if (restoredShrines < totalShrines) {
    let nearestShrine: Shrine | null = null;
    let minDist = Infinity;
    for (const s of shrines) {
      if (!s.isRestored) {
        const d = distance(playerX, playerZ, s.x, s.z);
        if (d < minDist) {
          minDist = d;
          nearestShrine = s;
        }
      }
    }

    const targetX = nearestShrine ? nearestShrine.x : 0;
    const targetZ = nearestShrine ? nearestShrine.z : 0;
    const dist = Math.round(distance(playerX, playerZ, targetX, targetZ));
    const angle = Math.atan2(targetX - playerX, targetZ - playerZ);
    const needed = nearestShrine ? Math.max(0, nearestShrine.requiredSeeds - nearestShrine.currentSeeds) : 2;
    const progressPercent = Math.round(shrineFraction * 65);

    if (sunSeeds >= 1) {
      return {
        currentStep: 1,
        totalSteps: 3,
        progressPercent,
        targetX,
        targetZ,
        distanceMeters: dist,
        angleToTargetRad: angle,
        bossShieldActive: true,
        headlineFa: `گام ۱ از ۲: احیای نیایشگاه‌ها (${restoredShrines}/${totalShrines})`,
        headlineEn: `Step 1/2: Awaken Ancient Shrines (${restoredShrines}/${totalShrines})`,
        sublineFa:
          dist <= 4
            ? `کنار نیایشگاه هستید! کلید E یا دکمه «احیا» را بزنید تا بذر اهدا شود.`
            : `${sunSeeds} بذر دارید! پیکان طلایی را تا نیایشگاه دنبال کنید (${dist} متر) و دکمه E را بزنید.`,
        sublineEn:
          dist <= 4
            ? `Near Shrine! Press [E] or Tap Restore to offer your Sun-Seeds.`
            : `You have ${sunSeeds} Sun-Seed(s)! Follow the golden arrow to the Shrine (${dist}m) & press [E].`,
      };
    }

    return {
      currentStep: 1,
      totalSteps: 3,
      progressPercent,
      targetX,
      targetZ,
      distanceMeters: dist,
      angleToTargetRad: angle,
      bossShieldActive: true,
      headlineFa: `گام ۱ از ۲: جمع‌آوری بذر و احیای ۴ نیایشگاه (${restoredShrines}/${totalShrines})`,
      headlineEn: `Step 1/2: Gather Sun-Seeds & Restore Shrines (${restoredShrines}/${totalShrines})`,
      sublineFa: `${needed} بذر طلایی از روی زمین (یا با زدن دشمنان) جمع کنید و به نیایشگاه (${dist} متر) ببرید.`,
      sublineEn: `Collect ${needed} glowing Sun-Seeds in the glade and bring them to the Shrine (${dist}m).`,
    };
  }

  if (!bossCleansed) {
    const distToBoss = Math.round(distance(playerX, playerZ, 0, 0));
    const angleToBoss = Math.atan2(0 - playerX, 0 - playerZ);
    const progressPercent = Math.min(98, Math.round(65 + bossFraction * 35));

    return {
      currentStep: 2,
      totalSteps: 3,
      progressPercent,
      targetX: 0,
      targetZ: 0,
      distanceMeters: distToBoss,
      angleToTargetRad: angleToBoss,
      bossShieldActive: false,
      headlineFa: `گام ۲ از ۲: پاکسازی غول خاردار مرکزی (جان غول: ${Math.ceil(bossHp)}/${bossMaxHp})`,
      headlineEn: `Step 2/2: Cleanse the Elder Bramble Boss (HP: ${Math.ceil(bossHp)}/${bossMaxHp})`,
      sublineFa:
        distToBoss <= 4
          ? `به غول مرکزی رسیدید! با عصای بلوط (Space) یا چرخش شکوفه (Q) خارهای او را پاکسازی کنید!`
          : `سپر غول شکست! پیکان طلایی را به مرکز بیشه (${distToBoss} متر) دنبال کنید و غول را پاکسازی کنید.`,
      sublineEn:
        distToBoss <= 4
          ? `Strike the Elder Bramble with your Acorn Wand [Space] or Bloom Spin [Q] to finish Chapter ${chapterNumber}!`
          : `All 4 Shrines awakened! Follow the arrow to the center (${distToBoss}m) and cleanse the Boss!`,
    };
  }

  return {
    currentStep: 3,
    totalSteps: 3,
    progressPercent: 100,
    targetX: 0,
    targetZ: 0,
    distanceMeters: 0,
    angleToTargetRad: 0,
    bossShieldActive: false,
    headlineFa: `فصل ${chapterNumber} کامل شد! دروازه مرحله بعد باز است`,
    headlineEn: `Chapter ${chapterNumber} Complete! Next Stage Portal Open`,
    sublineFa: `بیشه از تاریکی رها شد! دکمه «ورود به فصل ${chapterNumber + 1}» را بزنید.`,
    sublineEn: `The grove is restored! Click 'Enter Chapter ${chapterNumber + 1}' to advance.`,
  };
}

/**
 * Generates contextual, stage-mission-aware narrative dialogue beats during gameplay.
 */
export function getInGameStoryBeat(
  chapterNumber: number,
  trigger: StoryTriggerEvent
): InGameStoryBeat {
  const lvl = Math.max(1, Math.floor(chapterNumber));
  const mode = getStageMissionMode(lvl);
  const biome = getStageBiomeTheme(lvl);

  if (trigger === 'chapter_start') {
    switch (mode) {
      case 'rescue_escort':
        return {
          id: 'chapter_start',
          stepIndex: 1,
          totalSteps: 4,
          speakerFa: 'فرمانده محفل اخترتاب',
          speakerEn: 'High Arbiter of Aethelgard',
          textFa: `«ای کایلن، جنگجوی اخترتاب! در ${biome.nameFa}، سه نگهبان در قفس‌های رونیک سایه به اسارت درآمده‌اند. مهرهای زندان را با سلاح خود درهم بشکن و آن‌ها را تا دژ مقدس اسکورت کن!»`,
          textEn: `"Kaelen, Warden of the Astral Blade! In ${biome.nameEn}, three allied Wardens are bound inside Void Seals. Shatter their prisons and escort them safely to the Citadel!"`,
          hintFa: 'فرمان مرحله ۱: ۳ قفس رونیک را با سلاح خود بشکنید و نگهبانان را به دژ امن هدایت کنید.',
          hintEn: 'Tactical Objective: Shatter 3 Void Cages and escort the Wardens to the Citadel.',
        };
      case 'harmonic_bells':
        return {
          id: 'chapter_start',
          stepIndex: 1,
          totalSteps: 4,
          speakerFa: 'ارباب طنین ساکورا',
          speakerEn: 'Grand Archon of Resonance',
          textFa: `«به قلمرو ${biome.nameFa} گام نهادی! از جریان‌های باد اخترتاب برای شتاب نبرد استفاده کن و ۴ ناقوس باستانی را به صدا درآور تا پل‌های بلورین تالار مرکزی بازگشایی شوند!»`,
          textEn: `"You enter ${biome.nameEn}! Harness the Astral Wind-Streams and strike all 4 Ancient Resonance Bells to forge the crystal bridges toward the Grand Sanctum!"`,
          hintFa: 'فرمان مرحله ۲: ۴ ناقوس تشدید را با ضربه سلاح [Space/E] فعال کرده و وارد تالار مرکزی شوید.',
          hintEn: 'Tactical Objective: Strike 4 Resonance Bells [Space/E] and claim the central Sanctum.',
        };
      case 'heart_tree_defense':
        return {
          id: 'chapter_start',
          stepIndex: 1,
          totalSteps: 4,
          speakerFa: 'نگهبان ارشد کهربا',
          speakerEn: 'Vanguard Sentinel',
          textFa: `«در قلب ${biome.nameFa}، درخت باستانی اخترتاب زیر هجوم ۳ لشکر از زره‌پوشان سایه قرار دارد! با زنجیره کمبوی ۳-ضربه‌ای و فعال‌سازی ستون‌های شوک طلایی، محاصره را بشکن!»`,
          textEn: `"At the heart of ${biome.nameEn}, the World-Tree faces 3 assault waves of Void Vanguards! Unleash 3-hit combos and trigger the Golden Shockwave Obelisks to hold the line!"`,
          hintFa: 'فرمان مرحله ۳: دفاع از هسته باستانی در برابر ۳ موج تهاجمی دشمنان.',
          hintEn: 'Tactical Objective: Defend the World-Tree Core across 3 Void Vanguard assault waves.',
        };
      case 'meteor_rush':
        return {
          id: 'chapter_start',
          stepIndex: 1,
          totalSteps: 4,
          speakerFa: 'ستاره‌شناس شفق قطبی',
          speakerEn: 'Oracle of the Frostveil',
          textFa: `«آسمان ${biome.nameFa} شکافته شده و شهاب‌سنگ‌های اخترتاب در حال سقوط‌اند! با جاخالی تاکتیکی از روی سکوهای شتاب عبور کن و ۶ هسته اخترتاب را پیش از فروپاشی مهار کن!»`,
          textEn: `"Astral Meteorites are plummeting across ${biome.nameEn}! Surge across the Rune Boost Pads and secure 6 Astral Cores before their cosmic energy dissipates!"`,
          hintFa: 'فرمان مرحله ۴: مهار ۶ هسته شهاب‌سنگ اخترتاب پیش از اتمام زمان.',
          hintEn: 'Tactical Objective: Secure 6 falling Astral Meteorite Cores before time runs out.',
        };
      case 'boss_duel':
        return {
          id: 'chapter_start',
          stepIndex: 1,
          totalSteps: 4,
          speakerFa: 'فرمانده محفل اخترتاب',
          speakerEn: 'High Arbiter of Aethelgard',
          textFa: `«به میدان نبرد نهایی در ${biome.nameFa} رسیدی! فرمانروای سایه‌زاد در مرکز میدان ایستاده است. ستون‌های تشدید اخترتاب را فعال کن تا زره او بشکند و با ضربات بحرانی او را سرنگون کن!»`,
          textEn: `"You stand in the Celestial Colosseum of ${biome.nameEn}! Strike the Starlight Resonance Pillars to shatter the Void Sovereign's ward and unleash critical finishers!"`,
          hintFa: 'فرمان مرحله ۵: شکستن سپر فرمانروای سایه با ستون‌های تشدید و پیروزی در نبرد دو مرحله‌ای.',
          hintEn: 'Tactical Objective: Shatter the Boss Ward via Resonance Pillars and defeat the Sovereign.',
        };
    }
  }

  switch (trigger) {
    case 'first_seed':
      return {
        id: 'first_seed',
        stepIndex: 2,
        totalSteps: 4,
        speakerFa: 'کایلن (نگهبان اخترتاب)',
        speakerEn: 'Kaelen (Astral Warden)',
        textFa: `«بلور اخترتاب جذب شد؛ نیروی رونیک در تیغه سلاحم جریان دارد! ماموریت ${biome.nameFa} را به سرانجام می‌رسانیم.»`,
        textEn: `"Astral Shard absorbed—runic power surges through my blade! Let us conquer the trials of ${biome.nameEn}!"`,
        hintFa: 'قطب‌نمای طلایی و ویسپ اخترتاب همیشه مسیر هدف تاکتیکی بعدی را نشان می‌دهند.',
        hintEn: 'Follow the golden tactical compass and Runic Wisp to your next objective.',
      };
    case 'shrine_1':
      return {
        id: 'shrine_1',
        stepIndex: 2,
        totalSteps: 4,
        speakerFa: 'کایلن (نگهبان اخترتاب)',
        speakerEn: 'Kaelen (Astral Warden)',
        textFa: `«نخستین دژ رونیک در ${biome.nameFa} بیدار شد! حلقه محاصره تاریکی در حال فروپاشی است.»`,
        textEn: `"First Runic Obelisk awakened in ${biome.nameEn}! The shadow blockade is fracturing!"`,
        hintFa: 'به پیشروی تاکتیکی به سوی هدف بعدی ادامه دهید.',
        hintEn: 'Press forward to the next tactical objective.',
      };
    case 'shrine_2':
    case 'shrine_3':
      return {
        id: trigger,
        stepIndex: 3,
        totalSteps: 4,
        speakerFa: 'فرمانده محفل اخترتاب',
        speakerEn: 'High Arbiter of Aethelgard',
        textFa: `«بیش از نیمی از خطوط دفاعی دشمن در ${biome.nameFa} درهم شکسته شد! ضربات کمبوی خود را حفظ کن!»`,
        textEn: `"Over half of the enemy stronghold in ${biome.nameEn} has fallen! Maintain your combat momentum!"`,
        hintFa: 'هدف نهایی این قلمرو را کامل کنید تا دروازه اقلیم بعدی گشوده شود.',
        hintEn: 'Complete the final objective to open the Astral Gate to the next realm.',
      };
    case 'all_shrines_restored':
      return {
        id: 'all_shrines_restored',
        stepIndex: 3,
        totalSteps: 4,
        speakerFa: 'فرمانده محفل اخترتاب',
        speakerEn: 'High Arbiter of Aethelgard',
        textFa: `«تمام ستون‌های رونیک ${biome.nameFa} فعال شدند! سپر فرمانروای سایه شکسته شد—ضربه نهایی را فرود آور!»`,
        textEn: `"All Runic Obelisks in ${biome.nameEn} blaze with power! The Sovereign's ward is shattered—strike now!"`,
        hintFa: 'پیکان طلایی را به سوی مرکز میدان نبرد دنبال کنید.',
        hintEn: 'Advance to the central arena to finish the battle!',
      };
    case 'boss_damaged':
      return {
        id: 'boss_damaged',
        stepIndex: 3,
        totalSteps: 4,
        speakerFa: 'کایلن (نگهبان اخترتاب)',
        speakerEn: 'Kaelen (Astral Warden)',
        textFa: `«زره فرمانروای سایه ترک برداشته است! مراقب امواج خشم او باشید و با جاخالی به موقع ضدحمله بزنید!»`,
        textEn: `"The Void Sovereign's armor is cracking! Watch for his crimson telegraph rings and counter-strike!"`,
        hintFa: 'هنگام مشاهده حلقه هشدار قرمز با کلید Shift جاخالی دهید.',
        hintEn: 'Use Tactical Dodge [Shift] when the crimson telegraph ring appears!',
      };
    case 'boss_cleansed':
    default:
      return {
        id: 'boss_cleansed',
        stepIndex: 4,
        totalSteps: 4,
        speakerFa: 'فرمانده محفل اخترتاب',
        speakerEn: 'High Arbiter of Aethelgard',
        textFa: `«پیروزی شکوهمند در ${biome.nameFa}! تاریکی درهم شکست و دروازه اخترتاب به سوی فصل ${lvl + 1} گشوده شد!»`,
        textEn: `"Glorious victory in ${biome.nameEn}! The shadow legion is vanquished and the Astral Gate to Chapter ${lvl + 1} stands open!"`,
        hintFa: 'قلمرو آزاد شد! بلورهای اخترتاب را در درخت مهارت خرج کنید و وارد فصل بعد شوید.',
        hintEn: 'Realm Liberated! Upgrade your Mastery Tree and advance to the next chapter.',
      };
  }
}

// ============================================================================
// 5. DAILY QUESTS SYSTEM (RANDOMIZED DAILY OBJECTIVES & REWARDS)
// ============================================================================

export type DailyQuestType =
  | 'harvest_seeds'
  | 'cleanse_gloomlings'
  | 'restore_shrines'
  | 'bloom_spins'
  | 'leaf_dashes'
  | 'combo_finishers';

export interface DailyQuest {
  id: string;
  type: DailyQuestType;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardSeeds: number;
  rewardScore: number;
}

interface QuestTemplate {
  type: DailyQuestType;
  minTarget: number;
  maxTarget: number;
  baseSeeds: number;
  baseScore: number;
  buildTitle: (target: number) => string;
  buildDescription: (target: number) => string;
}

const DAILY_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    type: 'harvest_seeds',
    minTarget: 6,
    maxTarget: 12,
    baseSeeds: 3,
    baseScore: 300,
    buildTitle: (t) => `Claim ${t} Astral Shards`,
    buildDescription: (t) => `Secure ${t} radiant Astral Shards across the contested battlefield.`,
  },
  {
    type: 'cleanse_gloomlings',
    minTarget: 4,
    maxTarget: 8,
    baseSeeds: 3,
    baseScore: 350,
    buildTitle: (t) => `Vanquish ${t} Voidbound Foes`,
    buildDescription: (t) => `Defeat ${t} corrupted Voidbound enemies using your Runic Blade.`,
  },
  {
    type: 'restore_shrines',
    minTarget: 2,
    maxTarget: 4,
    baseSeeds: 4,
    baseScore: 450,
    buildTitle: (t) => `Ignite ${t} Runic Obelisks`,
    buildDescription: (t) => `Channel Astral Shards to awaken ${t} ancient obelisks in the realm.`,
  },
  {
    type: 'bloom_spins',
    minTarget: 3,
    maxTarget: 6,
    baseSeeds: 2,
    baseScore: 250,
    buildTitle: (t) => `Unleash ${t} Astral Novas`,
    buildDescription: (t) => `Execute your Astral Nova shockwave ability ${t} times in combat.`,
  },
  {
    type: 'leaf_dashes',
    minTarget: 5,
    maxTarget: 9,
    baseSeeds: 2,
    baseScore: 250,
    buildTitle: (t) => `Execute ${t} Tactical Dodges`,
    buildDescription: (t) => `Evade attacks using Tactical Phase-Dodge ${t} times.`,
  },
  {
    type: 'combo_finishers',
    minTarget: 3,
    maxTarget: 6,
    baseSeeds: 3,
    baseScore: 400,
    buildTitle: (t) => `Land ${t} 3-Hit Combo Finishers`,
    buildDescription: (t) => `Unleash the 3rd-stage Astral Cleave Finisher ${t} times in battle.`,
  },
];

/**
 * Returns YYYY-MM-DD date key for deterministic daily quest rotation
 */
export function getTodayDateKey(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Simple deterministic 32-bit FNV-1a string hash
 */
export function hashSeedString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Generates 3 deterministic randomized Daily Quests for a given dateKey and reroll index.
 */
export function generateDailyQuests(dateKey: string, rerollCount: number = 0): DailyQuest[] {
  const pool = [...DAILY_QUEST_TEMPLATES];
  const selected: QuestTemplate[] = [];
  let seed = hashSeedString(`${dateKey}::reroll_${rerollCount}`);

  // Always ensure variety by picking 3 distinct templates deterministically
  for (let i = 0; i < 3; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const idx = seed % pool.length;
    selected.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return selected.map((tpl, idx) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const span = tpl.maxTarget - tpl.minTarget + 1;
    const target = tpl.minTarget + (seed % span);
    const bonusMultiplier = target >= tpl.maxTarget - 1 ? 1 : 0;

    return {
      id: `dq_${dateKey}_${rerollCount}_${idx}_${tpl.type}`,
      type: tpl.type,
      title: tpl.buildTitle(target),
      description: tpl.buildDescription(target),
      target,
      progress: 0,
      completed: false,
      claimed: false,
      rewardSeeds: tpl.baseSeeds + bonusMultiplier,
      rewardScore: tpl.baseScore + bonusMultiplier * 100,
    };
  });
}

/**
 * Advances matching daily quests by `amount` and returns updated quests + any newly completed quests
 */
export function advanceDailyQuestProgress(
  quests: DailyQuest[],
  type: DailyQuestType,
  amount: number = 1
): { quests: DailyQuest[]; newlyCompleted: DailyQuest[] } {
  if (amount <= 0) {
    return { quests: quests.map((q) => ({ ...q })), newlyCompleted: [] };
  }

  const newlyCompleted: DailyQuest[] = [];
  const updated = quests.map((q) => {
    if (q.type !== type || q.completed) {
      return { ...q };
    }
    const nextProgress = Math.min(q.target, q.progress + amount);
    const nowCompleted = nextProgress >= q.target;
    const nextQuest: DailyQuest = {
      ...q,
      progress: nextProgress,
      completed: nowCompleted,
    };
    if (nowCompleted) {
      newlyCompleted.push(nextQuest);
    }
    return nextQuest;
  });

  return { quests: updated, newlyCompleted };
}

/**
 * Claims a completed, unclaimed daily quest reward (+Sun-Seeds, +Score, and +1 HP heal)
 */
export function claimDailyQuestReward(
  player: PlayerStats,
  quests: DailyQuest[],
  questId: string
): { player: PlayerStats; quests: DailyQuest[]; claimedQuest: DailyQuest | null } {
  let claimedQuest: DailyQuest | null = null;

  const updatedQuests = quests.map((q) => {
    if (q.id === questId && q.completed && !q.claimed) {
      const updated = { ...q, claimed: true };
      claimedQuest = updated;
      return updated;
    }
    return { ...q };
  });

  if (!claimedQuest) {
    return { player: { ...player }, quests: updatedQuests, claimedQuest: null };
  }

  const cq = claimedQuest as DailyQuest;
  const updatedPlayer: PlayerStats = {
    ...player,
    sunSeeds: player.sunSeeds + cq.rewardSeeds,
    score: player.score + cq.rewardScore,
    hp: Math.min(player.maxHp, player.hp + 1),
  };

  return {
    player: updatedPlayer,
    quests: updatedQuests,
    claimedQuest: cq,
  };
}

// ============================================================================
// 14. NON-COMBATIVE 'SPROUT-BUDDY' PET COMPANION & TARGET HIGHLIGHTER
// ============================================================================

export type SproutBuddyTargetType = 'seed' | 'shrine' | 'mission_prop' | 'none';

export interface SproutBuddyState {
  x: number;
  z: number;
  facingY: number;
  targetX: number | null;
  targetZ: number | null;
  targetType: SproutBuddyTargetType;
  targetLabel: string;
  targetLabelFa: string;
  distanceToTarget: number;
  isHighlighting: boolean;
}

export function createInitialSproutBuddy(startX: number = -1.4, startZ: number = 12.2): SproutBuddyState {
  return {
    x: startX,
    z: startZ,
    facingY: 0,
    targetX: null,
    targetZ: null,
    targetType: 'none',
    targetLabel: 'Wisp Escorting Warden',
    targetLabelFa: 'ویسپ در حال اسکورت نگهبان',
    distanceToTarget: 0,
    isHighlighting: false,
  };
}

/**
 * Pure simulation update for the Runic Wisp Companion ('Sprout-Buddy' radar unit).
 * Scans nearby procedural map entities (Astral Shards, un-restored Shrines, Captured Wardens,
 * Harmonic Bells, Defense Totems, Starlight Meteors) to highlight the highest-priority tactical target.
 */
export function computeSproutBuddyUpdate(params: {
  buddy: SproutBuddyState;
  playerX: number;
  playerZ: number;
  playerFacing: number;
  sunSeeds: number;
  elapsedTime: number;
  dt: number;
  pickups: { x: number; z: number }[];
  shrines: Shrine[];
  missionState: StageMissionState;
}): SproutBuddyState {
  const {
    buddy,
    playerX,
    playerZ,
    playerFacing,
    sunSeeds,
    elapsedTime,
    dt,
    pickups,
    shrines,
    missionState,
  } = params;

  let bestTargetX: number | null = null;
  let bestTargetZ: number | null = null;
  let bestType: SproutBuddyTargetType = 'none';
  let bestLabel = 'Wisp Escorting Warden';
  let bestLabelFa = 'ویسپ در حال اسکورت نگهبان';
  let bestScore = Infinity;

  const SHRINE_SCAN_RADIUS = 28;
  const SEED_SCAN_RADIUS = 24;

  // 1. Scan hidden/uncompleted Shrine or Mission components in the procedural map
  if (missionState.mode === 'rescue_escort') {
    for (const sp of missionState.lostSprouts) {
      if (sp.state === 'caged') {
        const d = distance(playerX, playerZ, sp.cageX, sp.cageZ);
        if (d <= SHRINE_SCAN_RADIUS && d * 0.75 < bestScore) {
          bestScore = d * 0.75;
          bestTargetX = sp.cageX;
          bestTargetZ = sp.cageZ;
          bestType = 'mission_prop';
          bestLabel = 'Prisoner Seal Located';
          bestLabelFa = 'مهر زندان نگهبان در نزدیکی';
        }
      }
    }
  } else if (missionState.mode === 'harmonic_bells') {
    for (const bell of missionState.bells) {
      if (!bell.isRung) {
        const d = distance(playerX, playerZ, bell.x, bell.z);
        if (d <= SHRINE_SCAN_RADIUS && d * 0.75 < bestScore) {
          bestScore = d * 0.75;
          bestTargetX = bell.x;
          bestTargetZ = bell.z;
          bestType = 'shrine';
          bestLabel = 'Resonance Bell Tower';
          bestLabelFa = 'برج ناقوس تشدید';
        }
      }
    }
  } else if (missionState.mode === 'heart_tree_defense') {
    for (const totem of missionState.totems) {
      if (totem.cooldown <= 0) {
        const d = distance(playerX, playerZ, totem.x, totem.z);
        if (d <= SHRINE_SCAN_RADIUS && d * 0.8 < bestScore) {
          bestScore = d * 0.8;
          bestTargetX = totem.x;
          bestTargetZ = totem.z;
          bestType = 'shrine';
          bestLabel = 'Runic Shockwave Obelisk';
          bestLabelFa = 'ستون موج رونیک آماده';
        }
      }
    }
  } else if (missionState.mode === 'meteor_rush') {
    for (const meteor of missionState.meteors) {
      if (!meteor.collected) {
        const d = distance(playerX, playerZ, meteor.x, meteor.z);
        if (d <= SHRINE_SCAN_RADIUS && d * 0.7 < bestScore) {
          bestScore = d * 0.7;
          bestTargetX = meteor.x;
          bestTargetZ = meteor.z;
          bestType = 'mission_prop';
          bestLabel = 'Astral Meteorite Core';
          bestLabelFa = 'هسته شهاب‌سنگ اخترتاب';
        }
      }
    }
  } else if (missionState.mode === 'boss_duel') {
    for (const shrine of shrines) {
      if (!shrine.isRestored) {
        const d = distance(playerX, playerZ, shrine.x, shrine.z);
        const weight = sunSeeds > 0 ? 0.65 : 0.82;
        if (d <= SHRINE_SCAN_RADIUS && d * weight < bestScore) {
          bestScore = d * weight;
          bestTargetX = shrine.x;
          bestTargetZ = shrine.z;
          bestType = 'shrine';
          bestLabel = shrine.name;
          bestLabelFa = 'ستون تشدید اخترتاب';
        }
      }
    }
  }

  // 2. Scan nearby Astral Shards / Sun-Seeds
  for (const seed of pickups) {
    const d = distance(playerX, playerZ, seed.x, seed.z);
    if (d <= SEED_SCAN_RADIUS) {
      const weight = sunSeeds < 3 ? 0.68 : 0.9;
      if (d * weight < bestScore) {
        bestScore = d * weight;
        bestTargetX = seed.x;
        bestTargetZ = seed.z;
        bestType = 'seed';
        bestLabel = 'Astral Shard Detected';
        bestLabelFa = 'بلور اخترتاب در نزدیکی';
      }
    }
  }

  // 3. Fallback: unrestored shrines
  if (bestType === 'none') {
    for (const shrine of shrines) {
      if (!shrine.isRestored) {
        const d = distance(playerX, playerZ, shrine.x, shrine.z);
        if (d <= SHRINE_SCAN_RADIUS && d < bestScore) {
          bestScore = d;
          bestTargetX = shrine.x;
          bestTargetZ = shrine.z;
          bestType = 'shrine';
          bestLabel = shrine.name;
          bestLabelFa = 'محراب باستانی';
        }
      }
    }
  }

  const isHighlighting = bestTargetX !== null && bestTargetZ !== null;
  let desiredX = playerX - Math.sin(playerFacing) * 1.55 + Math.cos(elapsedTime * 1.8) * 0.65;
  let desiredZ = playerZ - Math.cos(playerFacing) * 1.55 + Math.sin(elapsedTime * 1.8) * 0.65;
  let distToTarget = 0;

  if (isHighlighting && bestTargetX !== null && bestTargetZ !== null) {
    const dx = bestTargetX - playerX;
    const dz = bestTargetZ - playerZ;
    distToTarget = Math.hypot(dx, dz);
    if (distToTarget > 0.01) {
      const leadDist = Math.min(3.4, Math.max(1.5, distToTarget * 0.38));
      desiredX = playerX + (dx / distToTarget) * leadDist + Math.cos(elapsedTime * 3.2) * 0.25;
      desiredZ = playerZ + (dz / distToTarget) * leadDist + Math.sin(elapsedTime * 3.2) * 0.25;
    }
  }

  const followLerp = Math.min(1, dt * 6.5);
  const nextX = buddy.x + (desiredX - buddy.x) * followLerp;
  const nextZ = buddy.z + (desiredZ - buddy.z) * followLerp;

  const lookDx = (bestTargetX ?? playerX) - nextX;
  const lookDz = (bestTargetZ ?? playerZ) - nextZ;
  const nextFacing = Math.hypot(lookDx, lookDz) > 0.05 ? Math.atan2(lookDx, lookDz) : buddy.facingY;

  return {
    x: nextX,
    z: nextZ,
    facingY: nextFacing,
    targetX: bestTargetX,
    targetZ: bestTargetZ,
    targetType: bestType,
    targetLabel: bestLabel,
    targetLabelFa: bestLabelFa,
    distanceToTarget: Math.round(distToTarget * 10) / 10,
    isHighlighting,
  };
}




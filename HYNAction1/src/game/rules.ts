/**
 * Pure game rules, mathematical collision, state transitions, scoring,
 * character customization, day/night & weather modifiers, home base safe-zone,
 * and AdMob validation for Sproutling: Grove Guardian 3D.
 */

export interface PlayerStats {
  hp: number;
  maxHp: number;
  sunSeeds: number;
  score: number;
  comboCount: number;
  lastAttackTime: number;
  dashCooldownRemaining: number;
  spinCooldownRemaining: number;
  isInvulnerable: boolean;
  invulnerableTimer: number;
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
    { id: 'sprout' as BodyType, label: 'Plump Sprout', scale: [1.0, 1.0, 1.0] as [number, number, number] },
    { id: 'nimble' as BodyType, label: 'Nimble Sprite', scale: [0.86, 1.04, 0.86] as [number, number, number] },
    { id: 'sturdy' as BodyType, label: 'Sturdy Acorn', scale: [1.18, 0.92, 1.15] as [number, number, number] },
    { id: 'tall' as BodyType, label: 'Willow Wanderer', scale: [0.92, 1.16, 0.92] as [number, number, number] },
  ],
  skinColors: [
    { hex: '#8fd14f', label: 'Sage Sprout' },
    { hex: '#f4c29f', label: 'Warm Peach' },
    { hex: '#e0ac69', label: 'Golden Honey' },
    { hex: '#8d5524', label: 'Rich Chestnut' },
    { hex: '#4b2e1e', label: 'Deep Espresso' },
    { hex: '#c8b6ff', label: 'Moonlight Lavender' },
  ],
  hairstyles: [
    { id: 'twin-sprout' as HairstyleType, label: 'Twin Sprout Leaves' },
    { id: 'fluffy-bob' as HairstyleType, label: 'Cozy Fluffy Bob' },
    { id: 'braided-crown' as HairstyleType, label: 'Woodland Braids' },
    { id: 'mushroom-beret' as HairstyleType, label: 'Toadstool Beret' },
    { id: 'sun-halo' as HairstyleType, label: 'Sunflower Crest' },
  ],
  hairColors: [
    { hex: '#3d9943', label: 'Emerald Leaf' },
    { hex: '#c85a32', label: 'Autumn Auburn' },
    { hex: '#2b2d42', label: 'Midnight Berry' },
    { hex: '#ffd166', label: 'Sunbeam Blonde' },
    { hex: '#ff8fa3', label: 'Sakura Blossom' },
    { hex: '#e2eafc', label: 'Silver Frost' },
  ],
  facialFeatures: [
    { id: 'cheerful' as FacialFeatureType, label: 'Rosy & Cheerful' },
    { id: 'starry' as FacialFeatureType, label: 'Starry Eyes & Freckles' },
    { id: 'sleepy-cozy' as FacialFeatureType, label: 'Cozy Gentle Smile' },
    { id: 'scholar-glasses' as FacialFeatureType, label: 'Woodland Round Glasses' },
  ],
  clothingStyles: [
    { id: 'leaf-cloak' as ClothingStyleType, label: 'Emerald Leaf Cloak' },
    { id: 'traveler-poncho' as ClothingStyleType, label: 'Woven Traveler Poncho' },
    { id: 'sun-robe' as ClothingStyleType, label: 'Royal Sun-Weaver Mantle' },
    { id: 'berry-overalls' as ClothingStyleType, label: 'Gardener Tunic & Scarf' },
  ],
  clothingColors: [
    { hex: '#2d6a4f', label: 'Forest Moss' },
    { hex: '#e76f51', label: 'Terracotta Spice' },
    { hex: '#457b9d', label: 'River Blue' },
    { hex: '#9b5de5', label: 'Twilight Plum' },
    { hex: '#f4a261', label: 'Amber Harvest' },
  ],
};

export const DEFAULT_CUSTOMIZATION: CharacterCustomization = {
  bodyType: 'sprout',
  skinColor: '#8fd14f',
  hairstyle: 'twin-sprout',
  hairColor: '#3d9943',
  facialFeature: 'cheerful',
  clothing: 'leaf-cloak',
  clothingColor: '#2d6a4f',
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
  PLAYER_COMBO_WINDOW: 0.95,
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
 * Creates initial fresh player state
 */
export function createInitialPlayer(): PlayerStats {
  return {
    hp: GAME_CONSTANTS.MAX_PLAYER_HP,
    maxHp: GAME_CONSTANTS.MAX_PLAYER_HP,
    sunSeeds: 0,
    score: 0,
    comboCount: 0,
    lastAttackTime: -999,
    dashCooldownRemaining: 0,
    spinCooldownRemaining: 0,
    isInvulnerable: false,
    invulnerableTimer: 0,
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
    // Dawn
    return {
      timeOfDay: t,
      phase: 'dawn',
      sunIntensity: 1.05,
      hemiIntensity: 0.85,
      lanternGlowIntensity: 0.4,
      skyHex: 0xf4c29f,
      fogHex: 0xe8b89a,
      sunColorHex: 0xffd199,
    };
  } else if (t < 0.55) {
    // Sunny Day
    return {
      timeOfDay: t,
      phase: 'day',
      sunIntensity: 1.45,
      hemiIntensity: 0.98,
      lanternGlowIntensity: 0.1,
      skyHex: 0x9bd0a3,
      fogHex: 0xa7d8ad,
      sunColorHex: 0xfff1cf,
    };
  } else if (t < 0.75) {
    // Golden Sunset Dusk
    return {
      timeOfDay: t,
      phase: 'sunset',
      sunIntensity: 1.0,
      hemiIntensity: 0.72,
      lanternGlowIntensity: 0.9,
      skyHex: 0xd97f6c,
      fogHex: 0xc97a6b,
      sunColorHex: 0xff9e66,
    };
  } else {
    // Starry Cozy Night
    return {
      timeOfDay: t,
      phase: 'night',
      sunIntensity: 0.42,
      hemiIntensity: 0.48,
      lanternGlowIntensity: 1.6,
      skyHex: 0x1b2d48,
      fogHex: 0x1f3352,
      sunColorHex: 0x90b4f8,
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

/**
 * Calculates attack damage and updates combo step
 */
export function resolvePlayerAttack(
  currentTime: number,
  currentCombo: number,
  lastAttackTime: number
): { combo: number; damage: number; isFinisher: boolean } {
  const isWithinWindow = currentTime - lastAttackTime <= GAME_CONSTANTS.PLAYER_COMBO_WINDOW;
  const nextCombo = isWithinWindow ? (currentCombo % 3) + 1 : 1;

  let damage = 1;
  let isFinisher = false;

  if (nextCombo === 1) {
    damage = 1;
  } else if (nextCombo === 2) {
    damage = 1.25;
  } else {
    damage = 2.5;
    isFinisher = true;
  }

  return { combo: nextCombo, damage, isFinisher };
}

/**
 * Handles player taking damage if not invulnerable
 */
export function applyDamageToPlayer(
  player: PlayerStats,
  damageAmount: number
): { player: PlayerStats; tookDamage: boolean } {
  if (player.isInvulnerable || player.hp <= 0) {
    return { player: { ...player }, tookDamage: false };
  }

  const newHp = Math.max(0, player.hp - damageAmount);
  return {
    player: {
      ...player,
      hp: newHp,
      isInvulnerable: true,
      invulnerableTimer: GAME_CONSTANTS.INVULNERABILITY_AFTER_HIT,
    },
    tookDamage: true,
  };
}

/**
 * Ticks player invulnerability and cooldown timers
 */
export function tickPlayerTimers(player: PlayerStats, dt: number, dashMultiplier = 1.0): PlayerStats {
  const dashCooldown = Math.max(0, player.dashCooldownRemaining - dt * dashMultiplier);
  const spinCooldown = Math.max(0, player.spinCooldownRemaining - dt);
  const invulnerableTimer = Math.max(0, player.invulnerableTimer - dt);
  const isInvulnerable = invulnerableTimer > 0;

  return {
    ...player,
    dashCooldownRemaining: dashCooldown,
    spinCooldownRemaining: spinCooldown,
    invulnerableTimer,
    isInvulnerable,
  };
}

/**
 * Applies hit to enemy, calculates remaining HP and state
 */
export function damageEnemy(
  enemy: EnemyState,
  damage: number
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
      timer: wasCleansed ? 1.0 : 0.35,
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
        pixelRatioCap: 1.0,
        shadowsEnabled: false,
        shadowMapSize: 512,
        toneMappingExposure: 1.14,
        envMapIntensity: 0.35,
        characterGeometrySegments: 14,
        enablePbrBumpMaps: false,
        enableReflectiveWaterAndRuins: true, // Keep static low-poly stone archways & pond landmarks visible in Eco!
        enableCharacterAuraAndSatchel: true, // Keep hero's signature satchel & staff silhouette in Eco!
        enableSunbeamGodRays: false,
        enableWaterRippleRings: false,
        enableDistantMountainRim: true,
        showSecondaryCanopyAndRocks: false,
        showHighDetailGrassAndFerns: false,
        showUltraCrystalsAndFireflies: false,
        grassBladeCount: 60, // Lightweight stylized grass tufts even in Eco
        fernClusterCount: 0,
        crystalClusterCount: 0,
        fireflyCount: 0,
      };
    case 'balanced':
      return {
        quality: 'balanced',
        pixelRatioCap: 1.4,
        shadowsEnabled: true,
        shadowMapSize: 1024,
        toneMappingExposure: 1.17,
        envMapIntensity: 0.68,
        characterGeometrySegments: 18,
        enablePbrBumpMaps: true,
        enableReflectiveWaterAndRuins: true,
        enableCharacterAuraAndSatchel: true,
        enableSunbeamGodRays: false,
        enableWaterRippleRings: true,
        enableDistantMountainRim: true,
        showSecondaryCanopyAndRocks: true,
        showHighDetailGrassAndFerns: true,
        showUltraCrystalsAndFireflies: false,
        grassBladeCount: 240,
        fernClusterCount: 28,
        crystalClusterCount: 0,
        fireflyCount: 0,
      };
    case 'high':
      return {
        quality: 'high',
        pixelRatioCap: 1.85,
        shadowsEnabled: true,
        shadowMapSize: 1536,
        toneMappingExposure: 1.2,
        envMapIntensity: 0.95,
        characterGeometrySegments: 26,
        enablePbrBumpMaps: true,
        enableReflectiveWaterAndRuins: true,
        enableCharacterAuraAndSatchel: true,
        enableSunbeamGodRays: true,
        enableWaterRippleRings: true,
        enableDistantMountainRim: true,
        showSecondaryCanopyAndRocks: true,
        showHighDetailGrassAndFerns: true,
        showUltraCrystalsAndFireflies: false,
        grassBladeCount: 480,
        fernClusterCount: 54,
        crystalClusterCount: 18,
        fireflyCount: 42,
      };
    case 'ultra':
      return {
        quality: 'ultra',
        pixelRatioCap: 2.35,
        shadowsEnabled: true,
        shadowMapSize: 2048,
        toneMappingExposure: 1.25,
        envMapIntensity: 1.25,
        characterGeometrySegments: 32,
        enablePbrBumpMaps: true,
        enableReflectiveWaterAndRuins: true,
        enableCharacterAuraAndSatchel: true,
        enableSunbeamGodRays: true,
        enableWaterRippleRings: true,
        enableDistantMountainRim: true,
        showSecondaryCanopyAndRocks: true,
        showHighDetailGrassAndFerns: true,
        showUltraCrystalsAndFireflies: true,
        grassBladeCount: 780,
        fernClusterCount: 84,
        crystalClusterCount: 34,
        fireflyCount: 90,
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
    nameFa: 'بیشه زمردین آفتابی',
    nameEn: 'Sunlit Emerald Glade',
    meadowHex: 0x52b788,
    mossHex: 0x2d6a4f,
    trailHex: 0xe6ccb2,
    pondBedHex: 0x48cae4,
    cliffHex: 0x344e41,
    plazaHex: 0xe6ccb2,
    canopyPrimaryHex: 0x2d6a4f,
    canopySecondaryHex: 0x52b788,
    trunkHex: 0x4a2e1b,
    mountainPrimaryHex: 0x2d5a40,
    mountainSecondaryHex: 0x40916c,
    waterHex: 0x48cae4,
    waterEmissiveHex: 0x0077b6,
    lilyHex: 0x52b788,
    lotusHex: 0xffb3c6,
    flowerPalette: [0xffd166, 0xef476f, 0x06d6a0, 0x118ab2, 0xffa07a, 0xffffff],
    grassPalette: [0x70e000, 0x52b788, 0x38b000],
    fernPalette: [0x2d6a4f, 0x40916c],
    crystalPalette: [0x48cae4, 0x06d6a0, 0xffd166],
    fireflyPrimaryHex: 0xffe66d,
    fireflySecondaryHex: 0x80ffdb,
    sunbeamHex: 0xfff3b0,
    pufferCapHex: 0xef476f,
    pufferSpotHex: 0xfff3b0,
    rollerShellHex: 0x582f0e,
    rollerGlowHex: 0xff9f1c,
    spriteBodyHex: 0x7209b7,
    spriteWingHex: 0x80ffdb,
    bossBarkHex: 0x3a2314,
    bossCrownHex: 0x2d6a4f,
    bossCoreHex: 0x9d4edd,
    bossShieldHex: 0x9d4edd,
  },
  {
    id: 'sakura-valley',
    nameFa: 'دره شکوفه‌های ساکورا و مهتاب',
    nameEn: 'Sakura Blossom Sanctuary',
    meadowHex: 0x95d5b2,
    mossHex: 0xf4a2bd,
    trailHex: 0xfde2e4,
    pondBedHex: 0xcdb4db,
    cliffHex: 0x6d597a,
    plazaHex: 0xfcefb4,
    canopyPrimaryHex: 0xff8fa3,
    canopySecondaryHex: 0xffb3c6,
    trunkHex: 0x5e3023,
    mountainPrimaryHex: 0x6d597a,
    mountainSecondaryHex: 0xb56576,
    waterHex: 0xbde0fe,
    waterEmissiveHex: 0x9d4edd,
    lilyHex: 0x74c69d,
    lotusHex: 0xff4d6d,
    flowerPalette: [0xff8fa3, 0xffb3c6, 0xcdb4db, 0xffe5ec, 0xffd166, 0xffffff],
    grassPalette: [0x95d5b2, 0xffcad4, 0x74c69d],
    fernPalette: [0xb56576, 0x52b788],
    crystalPalette: [0xff8fa3, 0xcdb4db, 0x90e0ef],
    fireflyPrimaryHex: 0xffb3c6,
    fireflySecondaryHex: 0xffe66d,
    sunbeamHex: 0xffe5ec,
    pufferCapHex: 0xff758f,
    pufferSpotHex: 0xffffff,
    rollerShellHex: 0x6d597a,
    rollerGlowHex: 0xff4d6d,
    spriteBodyHex: 0xb5179e,
    spriteWingHex: 0xffcad4,
    bossBarkHex: 0x4a2545,
    bossCrownHex: 0xff8fa3,
    bossCoreHex: 0xff4d6d,
    bossShieldHex: 0xf72585,
  },
  {
    id: 'amber-autumn',
    nameFa: 'جنگل پاییزی کهربایی و شب‌تاب',
    nameEn: 'Amber Autumn Lantern Grove',
    meadowHex: 0xd4a373,
    mossHex: 0xbc6c25,
    trailHex: 0xfaedcd,
    pondBedHex: 0x2ec4b6,
    cliffHex: 0x603808,
    plazaHex: 0xfefae0,
    canopyPrimaryHex: 0xe76f51,
    canopySecondaryHex: 0xf4a261,
    trunkHex: 0x3d2314,
    mountainPrimaryHex: 0x7f4f24,
    mountainSecondaryHex: 0xb07d62,
    waterHex: 0x2ec4b6,
    waterEmissiveHex: 0x0f4c5c,
    lilyHex: 0xe9c46a,
    lotusHex: 0xff9f1c,
    flowerPalette: [0xff9f1c, 0xe76f51, 0xe9c46a, 0x06d6a0, 0xffd166, 0xf4a261],
    grassPalette: [0xe9c46a, 0xf4a261, 0x90be6d],
    fernPalette: [0xbc6c25, 0xdddf00],
    crystalPalette: [0xff9f1c, 0x2ec4b6, 0xffd166],
    fireflyPrimaryHex: 0xff9f1c,
    fireflySecondaryHex: 0x06d6a0,
    sunbeamHex: 0xffd166,
    pufferCapHex: 0xf77f00,
    pufferSpotHex: 0xfefae0,
    rollerShellHex: 0x582f0e,
    rollerGlowHex: 0xffbe0b,
    spriteBodyHex: 0x9b5de5,
    spriteWingHex: 0xfee440,
    bossBarkHex: 0x432818,
    bossCrownHex: 0xe76f51,
    bossCoreHex: 0xff9f1c,
    bossShieldHex: 0xf77f00,
  },
  {
    id: 'frost-aurora',
    nameFa: 'بلورزار یخی و شفق قطبی',
    nameEn: 'Aurora Frostveil Basin',
    meadowHex: 0xa8dadc,
    mossHex: 0x457b9d,
    trailHex: 0xf1faee,
    pondBedHex: 0x00b4d8,
    cliffHex: 0x1d3557,
    plazaHex: 0xe0fbfc,
    canopyPrimaryHex: 0x48cae4,
    canopySecondaryHex: 0xade8f4,
    trunkHex: 0x3d5a80,
    mountainPrimaryHex: 0x1d3557,
    mountainSecondaryHex: 0x457b9d,
    waterHex: 0x90e0ef,
    waterEmissiveHex: 0x00b4d8,
    lilyHex: 0x80ffdb,
    lotusHex: 0xe0aaff,
    flowerPalette: [0x90e0ef, 0x80ffdb, 0xe0aaff, 0xffffff, 0x48cae4, 0xffd166],
    grassPalette: [0xade8f4, 0x80ffdb, 0x90e0ef],
    fernPalette: [0x457b9d, 0x48cae4],
    crystalPalette: [0x80ffdb, 0x48cae4, 0xe0aaff],
    fireflyPrimaryHex: 0x80ffdb,
    fireflySecondaryHex: 0xe0aaff,
    sunbeamHex: 0xcaf0f8,
    pufferCapHex: 0x00b4d8,
    pufferSpotHex: 0xffffff,
    rollerShellHex: 0x1d3557,
    rollerGlowHex: 0x80ffdb,
    spriteBodyHex: 0x3a0ca3,
    spriteWingHex: 0x72efdd,
    bossBarkHex: 0x1d3557,
    bossCrownHex: 0x80ffdb,
    bossCoreHex: 0x00f5d4,
    bossShieldHex: 0x48cae4,
  },
  {
    id: 'astral-oasis',
    nameFa: 'واحه کیهانی ستارگان',
    nameEn: 'Astral Starlight Orchard',
    meadowHex: 0x3c096c,
    mossHex: 0x240046,
    trailHex: 0xe0aaff,
    pondBedHex: 0x4cc9f0,
    cliffHex: 0x10002b,
    plazaHex: 0xc77dff,
    canopyPrimaryHex: 0x7209b7,
    canopySecondaryHex: 0x4cc9f0,
    trunkHex: 0x240046,
    mountainPrimaryHex: 0x240046,
    mountainSecondaryHex: 0x5a189a,
    waterHex: 0x4cc9f0,
    waterEmissiveHex: 0x7209b7,
    lilyHex: 0x72efdd,
    lotusHex: 0xffe66d,
    flowerPalette: [0xffe66d, 0x4cc9f0, 0xf72585, 0x72efdd, 0xe0aaff, 0xffffff],
    grassPalette: [0x9d4edd, 0x4cc9f0, 0x72efdd],
    fernPalette: [0x5a189a, 0x4361ee],
    crystalPalette: [0xffe66d, 0xf72585, 0x4cc9f0],
    fireflyPrimaryHex: 0xffe66d,
    fireflySecondaryHex: 0xf72585,
    sunbeamHex: 0xe0aaff,
    pufferCapHex: 0xf72585,
    pufferSpotHex: 0xffe66d,
    rollerShellHex: 0x3c096c,
    rollerGlowHex: 0x4cc9f0,
    spriteBodyHex: 0x4cc9f0,
    spriteWingHex: 0xffe66d,
    bossBarkHex: 0x240046,
    bossCrownHex: 0x4cc9f0,
    bossCoreHex: 0xf72585,
    bossShieldHex: 0x4cc9f0,
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
          speakerFa: 'روح بلوط کهنسال',
          speakerEn: 'Elder Oak Spirit',
          textFa: `«ای جوانه نگهبان! در ${biome.nameFa} نیازی به روشن کردن نیایشگاه‌ها نیست؛ ۳ جوانه کوچک در قفس‌های خاردار اسیر شده‌اند! قفس‌هایشان را بشکن تا پشت سرت به کلبه امن بیایند.»`,
          textEn: `"Little Guardian! In ${biome.nameEn}, 3 baby Sproutlings are trapped in thorny cages! Break their cages and escort them back to your Safe Cottage!"`,
          hintFa: 'هدف مرحله ۱: ۳ قفس خاردار را بشکنید و جوانه‌ها را به حیاط کلبه امن ببرید.',
          hintEn: 'Stage 1 Goal: Break 3 Bramble Cages and escort the Sproutlings to the Safe Cottage.',
        };
      case 'harmonic_bells':
        return {
          id: 'chapter_start',
          stepIndex: 1,
          totalSteps: 4,
          speakerFa: 'مرغ نغمه‌خوان ساکورا',
          speakerEn: 'Sakura Songbird',
          textFa: `«به ${biome.nameFa} خوش آمدی! در این دره، از دالان‌های باد صورتی عبور کن و ۴ زنگوله باستانی را به صدا درآور تا پل‌های بلورین به سوی معبد مرکزی روشن شوند!»`,
          textEn: `"Welcome to ${biome.nameEn}! Glide through the pink wind-streams and ring all 4 Ancient Chime Bells to illuminate the crystal bridges to the central Pavilion!"`,
          hintFa: 'هدف مرحله ۲: ۴ زنگوله باستانی را با ضربه یا کلید E بنوازید و وارد معبد مرکزی شوید.',
          hintEn: 'Stage 2 Goal: Ring 4 Ancient Chime Bells [Space/E] and step into the central Pavilion.',
        };
      case 'heart_tree_defense':
        return {
          id: 'chapter_start',
          stepIndex: 1,
          totalSteps: 4,
          speakerFa: 'بانوی کرم‌های شب‌تاب',
          speakerEn: 'Lady of the Fireflies',
          textFa: `«در مرکز ${biome.nameFa}، درخت قلب کهربایی هدف ۳ موج از مهاجمان قرار گرفته است! در کنار درخت بمان، توتم‌های موج نوری را فعال کن و مهاجمان را دفع کن!»`,
          textEn: `"At the heart of ${biome.nameEn}, the Amber Heart-Tree faces 3 waves of rollers! Guard the tree and strike the Golden Pulse Totems to unleash healing shockwaves!"`,
          hintFa: 'هدف مرحله ۳: محافظت از درخت قلب در برابر ۳ موج کوتاه مهاجمان (۹ مهاجم).',
          hintEn: 'Stage 3 Goal: Defend the central Heart-Tree across 3 short waves (9 critters).',
        };
      case 'meteor_rush':
        return {
          id: 'chapter_start',
          stepIndex: 1,
          totalSteps: 4,
          speakerFa: 'گوزن بلورین شفق',
          speakerEn: 'Frost-Crystal Stag',
          textFa: `«آسمان ${biome.nameFa} غرق در شهاب‌باران است! روی سکوهای یخی شتاب‌دهنده بپر و ۶ شهاب‌سنگ ستاره‌ای را پیش از آنکه درخشش آن‌ها در برف خاموش شود جمع کن!»`,
          textEn: `"Starlight Meteors are falling across ${biome.nameEn}! Dash over the icy Aurora Boost Pads and catch 6 glowing meteors before their light fades!"`,
          hintFa: 'هدف مرحله ۴: جذب ۶ شهاب‌سنگ درخشان در زمان محدود با کمک سکوهای سرعت.',
          hintEn: 'Stage 4 Goal: Catch 6 falling Starlight Meteors before their timers expire.',
        };
      case 'boss_duel':
        return {
          id: 'chapter_start',
          stepIndex: 1,
          totalSteps: 4,
          speakerFa: 'بافنده اخترتاب کیهانی',
          speakerEn: 'Astral Sun-Weaver',
          textFa: `«به میدان نهایی در ${biome.nameFa} رسیدی! پادشاه خارهای باستانی در مرکز میدان منتظر توست. ستون‌های تشدید اطراف را بدون نیاز به بذر فعال کن تا غول گیج و بی‌دفاع شود!»`,
          textEn: `"You have reached the Celestial Arena of ${biome.nameEn}! Strike the Starlight Pillars (no seeds needed!) to stun the Ancient Bramble-King and cleanse him!"`,
          hintFa: 'هدف مرحله ۵: فعال کردن ستون‌های تشدید نور و شکست دادن غول نگهبان.',
          hintEn: 'Stage 5 Goal: Activate Starlight Pillars to stun the Boss and defeat him.',
        };
    }
  }

  switch (trigger) {
    case 'first_seed':
      return {
        id: 'first_seed',
        stepIndex: 2,
        totalSteps: 4,
        speakerFa: 'پیپ (نگهبان جوانه)',
        speakerEn: 'Pip (Grove Guardian)',
        textFa: `«انرژی درخشان بیشه همراه من است! بیایید ماموریت ویژه این مرحله (${biome.nameFa}) را به سرانجام برسانیم!»`,
        textEn: `"The grove's radiant energy is with me! Let's complete the special mission of ${biome.nameEn}!"`,
        hintFa: 'پیکان طلایی پای پیپ همیشه هدف بعدی ماموریت این مرحله را نشان می‌دهد.',
        hintEn: 'Follow the golden compass arrow at Pip’s feet to your next mission target.',
      };
    case 'shrine_1':
      return {
        id: 'shrine_1',
        stepIndex: 2,
        totalSteps: 4,
        speakerFa: 'پیپ (نگهبان جوانه)',
        speakerEn: 'Pip (Grove Guardian)',
        textFa: `«بخش اول ماموریت در ${biome.nameFa} با موفقیت انجام شد! انرژی طبیعت در حال بازگشت است.»`,
        textEn: `"First milestone achieved in ${biome.nameEn}! Nature's harmony is returning!"`,
        hintFa: 'به دنبال کردن پیکان راهنمای طلایی ادامه دهید.',
        hintEn: 'Keep following the golden compass arrow to the next objective.',
      };
    case 'shrine_2':
    case 'shrine_3':
      return {
        id: trigger,
        stepIndex: 3,
        totalSteps: 4,
        speakerFa: 'روح نگهبان بیشه',
        speakerEn: 'Grove Spirit',
        textFa: `«بیش از نیمی از چالش ${biome.nameFa} کامل شد! فقط کمی دیگر تا پیروزی و گشوده شدن دروازه فصل بعد باقی مانده است!»`,
        textEn: `"More than halfway through ${biome.nameEn}'s challenge! Victory is within reach!"`,
        hintFa: 'چالش نهایی این مرحله را کامل کنید تا وارد اقلیم بعدی شوید.',
        hintEn: 'Complete the remaining stage objective to unlock the next biome.',
      };
    case 'all_shrines_restored':
      return {
        id: 'all_shrines_restored',
        stepIndex: 3,
        totalSteps: 4,
        speakerFa: 'روح نگهبان بیشه',
        speakerEn: 'Grove Spirit',
        textFa: `«همه اهداف فرعی ${biome.nameFa} کامل شدند! اکنون گام آخر را بردار تا این فصل به پیروزی برسد!»`,
        textEn: `"All stage milestones in ${biome.nameEn} are complete! Take the final step to claim victory!"`,
        hintFa: 'پیکان طلایی را به نقطه پایانی دنبال کنید.',
        hintEn: 'Follow the golden arrow to finish the stage!',
      };
    case 'boss_damaged':
      return {
        id: 'boss_damaged',
        stepIndex: 3,
        totalSteps: 4,
        speakerFa: 'روح نگهبان بیشه',
        speakerEn: 'Grove Spirit',
        textFa: `«آفرین جوانه دلیر! ضربات درخشان تو تاریکی را به عقب می‌راند. ادامه بده!»`,
        textEn: `"Well struck, brave Sproutling! Your radiant blows push back the gloom—keep going!"`,
        hintFa: 'تا تکمیل کامل نوار پیشرفت مرحله ادامه دهید.',
        hintEn: 'Keep going until the stage progress reaches 100%!',
      };
    case 'boss_cleansed':
    default:
      return {
        id: 'boss_cleansed',
        stepIndex: 4,
        totalSteps: 4,
        speakerFa: 'روح نگهبان بیشه',
        speakerEn: 'Grove Spirit',
        textFa: `«ماموریت ${biome.nameFa} با پیروزی کامل به پایان رسید! دروازه درخشان به سوی فصل ${lvl + 1} و یک ماجراجویی کاملاً جدید گشوده شد!»`,
        textEn: `"Mission accomplished in ${biome.nameEn}! The shimmering portal to Chapter ${lvl + 1} and a brand-new adventure is open!"`,
        hintFa: 'مرحله به‌پایان رسید! وارد فصل بعدی شوید.',
        hintEn: 'Stage Complete! Advance to the next chapter.',
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
    buildTitle: (t) => `Harvest ${t} Sun-Seeds`,
    buildDescription: (t) => `Gather ${t} glowing Golden Sun-Seeds scattered across the woodland.`,
  },
  {
    type: 'cleanse_gloomlings',
    minTarget: 4,
    maxTarget: 8,
    baseSeeds: 3,
    baseScore: 350,
    buildTitle: (t) => `Bonk ${t} Gloomlings`,
    buildDescription: (t) => `Cleanse ${t} mischievous woodland gloomlings with your Acorn Wand.`,
  },
  {
    type: 'restore_shrines',
    minTarget: 2,
    maxTarget: 4,
    baseSeeds: 4,
    baseScore: 450,
    buildTitle: (t) => `Restore ${t} Ancient Shrines`,
    buildDescription: (t) => `Offer Sun-Seeds to awaken ${t} dimmed shrines in the grove.`,
  },
  {
    type: 'bloom_spins',
    minTarget: 3,
    maxTarget: 6,
    baseSeeds: 2,
    baseScore: 250,
    buildTitle: (t) => `Unleash ${t} Bloom Spins`,
    buildDescription: (t) => `Cast your Pollen Bloom Spin ability ${t} times in the glade.`,
  },
  {
    type: 'leaf_dashes',
    minTarget: 5,
    maxTarget: 9,
    baseSeeds: 2,
    baseScore: 250,
    buildTitle: (t) => `Perform ${t} Leaf Dashes`,
    buildDescription: (t) => `Dash swiftly through the meadow ${t} times using Leaf Dash.`,
  },
  {
    type: 'combo_finishers',
    minTarget: 3,
    maxTarget: 6,
    baseSeeds: 3,
    baseScore: 400,
    buildTitle: (t) => `Land ${t} Combo Finishers`,
    buildDescription: (t) => `Strike with the 3rd heavy Acorn Wand combo finisher ${t} times.`,
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
    targetLabel: 'Following Pip',
    targetLabelFa: 'همراهی پیپ',
    distanceToTarget: 0,
    isHighlighting: false,
  };
}

/**
 * Pure simulation update for the non-combative 'Sprout-Buddy' pet companion.
 * Scans nearby procedural map entities (Sun-Seeds, un-restored Shrines, Caged Sprouts,
 * Harmonic Bells, Defense Totems, Starlight Meteors) to highlight the most helpful nearby target,
 * and smoothly orbits/leads Pip toward it.
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
  let bestLabel = 'Following Pip';
  let bestLabelFa = 'همراهی پیپ';
  let bestScore = Infinity; // Lower score = higher priority

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
          bestLabel = 'Caged Sproutling Nearby';
          bestLabelFa = 'قفس جوانه گمشده در نزدیکی';
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
          bestLabel = 'Ancient Chime Bell';
          bestLabelFa = 'زنگوله باستانی معبد';
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
          bestLabel = 'Ready Healing Totem';
          bestLabelFa = 'توتم شفابخش آماده';
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
          bestLabel = 'Starlight Meteor Core';
          bestLabelFa = 'شهاب‌سنگ نورانی';
        }
      }
    }
  } else if (missionState.mode === 'boss_duel') {
    for (const shrine of shrines) {
      if (!shrine.isRestored) {
        const d = distance(playerX, playerZ, shrine.x, shrine.z);
        // Prioritize shrines strongly if player has seeds or in boss_duel where shrines stun boss
        const weight = sunSeeds > 0 ? 0.65 : 0.82;
        if (d <= SHRINE_SCAN_RADIUS && d * weight < bestScore) {
          bestScore = d * weight;
          bestTargetX = shrine.x;
          bestTargetZ = shrine.z;
          bestType = 'shrine';
          bestLabel = shrine.name;
          bestLabelFa = 'ستون معبد خورشید';
        }
      }
    }
  }

  // 2. Scan nearby Sun-Seeds (especially prioritized when Pip needs seeds or a seed is close)
  for (const seed of pickups) {
    const d = distance(playerX, playerZ, seed.x, seed.z);
    if (d <= SEED_SCAN_RADIUS) {
      const weight = sunSeeds < 3 ? 0.68 : 0.9;
      if (d * weight < bestScore) {
        bestScore = d * weight;
        bestTargetX = seed.x;
        bestTargetZ = seed.z;
        bestType = 'seed';
        bestLabel = 'Sun-Seed Detected';
        bestLabelFa = 'بذر خورشید در نزدیکی';
      }
    }
  }

  // 3. Fallback: if no un-restored shrine was checked in non-boss modes, also check shrines if any are unrestored
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
          bestLabelFa = 'معبد باستانی';
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
      // Sprout-Buddy scouts ahead of Pip toward the highlighted seed or shrine (up to 3.4 units from Pip)
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




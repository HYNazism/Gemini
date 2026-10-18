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
  PLAYER_SPEED: 7.2,
  PLAYER_DASH_SPEED: 18.0,
  PLAYER_DASH_DURATION: 0.22,
  PLAYER_DASH_COOLDOWN: 1.1,
  PLAYER_SPIN_COOLDOWN: 4.0,
  PLAYER_COMBO_WINDOW: 0.9,
  INVULNERABILITY_AFTER_HIT: 1.0,
  ATTACK_RADIUS: 2.4,
  SPIN_RADIUS: 4.8,
  SHRINE_INTERACT_RADIUS: 3.5,
  MAX_PLAYER_HP: 5,
  HOME_BASE_X: 0,
  HOME_BASE_Z: 14,
  HOME_BASE_SAFE_RADIUS: 6.2,
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
  characterGeometrySegments: number;
  enablePbrBumpMaps: boolean;
  enableReflectiveWaterAndRuins: boolean;
  enableCharacterAuraAndSatchel: boolean;
  showSecondaryCanopyAndRocks: boolean;
  showHighDetailGrassAndFerns: boolean;
  showUltraCrystalsAndFireflies: boolean;
  grassBladeCount: number;
  fernClusterCount: number;
  crystalClusterCount: number;
  fireflyCount: number;
}

/**
 * Returns deterministic GPU, character mesh fidelity, PBR surface relief, and architectural
 * environment parameters for each phone tier, from budget phones ('eco') to flagships ('ultra').
 */
export function getGraphicsQualityProfile(quality: PerformanceQuality): GraphicsQualityProfile {
  switch (quality) {
    case 'eco':
      return {
        quality: 'eco',
        pixelRatioCap: 0.85,
        shadowsEnabled: false,
        shadowMapSize: 512,
        toneMappingExposure: 1.12,
        characterGeometrySegments: 10,
        enablePbrBumpMaps: false,
        enableReflectiveWaterAndRuins: false,
        enableCharacterAuraAndSatchel: false,
        showSecondaryCanopyAndRocks: false,
        showHighDetailGrassAndFerns: false,
        showUltraCrystalsAndFireflies: false,
        grassBladeCount: 0,
        fernClusterCount: 0,
        crystalClusterCount: 0,
        fireflyCount: 0,
      };
    case 'balanced':
      return {
        quality: 'balanced',
        pixelRatioCap: 1.35,
        shadowsEnabled: true,
        shadowMapSize: 1024,
        toneMappingExposure: 1.15,
        characterGeometrySegments: 16,
        enablePbrBumpMaps: true,
        enableReflectiveWaterAndRuins: true,
        enableCharacterAuraAndSatchel: true,
        showSecondaryCanopyAndRocks: true,
        showHighDetailGrassAndFerns: false,
        showUltraCrystalsAndFireflies: false,
        grassBladeCount: 180,
        fernClusterCount: 24,
        crystalClusterCount: 0,
        fireflyCount: 0,
      };
    case 'high':
      return {
        quality: 'high',
        pixelRatioCap: 1.85,
        shadowsEnabled: true,
        shadowMapSize: 1536,
        toneMappingExposure: 1.18,
        characterGeometrySegments: 24,
        enablePbrBumpMaps: true,
        enableReflectiveWaterAndRuins: true,
        enableCharacterAuraAndSatchel: true,
        showSecondaryCanopyAndRocks: true,
        showHighDetailGrassAndFerns: true,
        showUltraCrystalsAndFireflies: false,
        grassBladeCount: 420,
        fernClusterCount: 48,
        crystalClusterCount: 16,
        fireflyCount: 36,
      };
    case 'ultra':
      return {
        quality: 'ultra',
        pixelRatioCap: 2.25,
        shadowsEnabled: true,
        shadowMapSize: 2048,
        toneMappingExposure: 1.24,
        characterGeometrySegments: 32,
        enablePbrBumpMaps: true,
        enableReflectiveWaterAndRuins: true,
        enableCharacterAuraAndSatchel: true,
        showSecondaryCanopyAndRocks: true,
        showHighDetailGrassAndFerns: true,
        showUltraCrystalsAndFireflies: true,
        grassBladeCount: 650,
        fernClusterCount: 72,
        crystalClusterCount: 28,
        fireflyCount: 75,
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
  'Whispering',
  'Sunlit',
  'Starlight',
  'Blooming',
  'Dewdrop',
  'Crystal',
  'Velvet',
  'Emerald',
  'Amber',
  'Lullaby',
  'Moonbeam',
  'Harmony',
];

const CHAPTER_PLACES = [
  'Meadow',
  'Willow Glade',
  'Honey Hollow',
  'Sakura Sanctuary',
  'Fern Valley',
  'Mossy Crown',
  'Lantern Grove',
  'Bramble Reach',
  'Sun-Seed Basin',
  'Spirit Orchard',
];

const CHAPTER_SPIRITS = [
  'Elder Oak Spirit',
  'Songbird of Dawn',
  'Lady of the Fireflies',
  'Ancient Sun-Weaver',
  'Keeper of the Dew',
  'Slumbering Moss Tortoise',
  'Star-Petal Deer',
  'Wind-Chime Owl',
];

/**
 * Deterministically generates infinite joyful chapters with a continuous woodland story
 */
export function generateChapterInfo(chapterNumber: number): ChapterStoryInfo {
  const lvl = Math.max(1, Math.floor(chapterNumber));
  const adj = CHAPTER_ADJECTIVES[(lvl - 1) % CHAPTER_ADJECTIVES.length];
  const place = CHAPTER_PLACES[((lvl - 1) * 3) % CHAPTER_PLACES.length];
  const spirit = CHAPTER_SPIRITS[((lvl - 1) * 5) % CHAPTER_SPIRITS.length];

  const weathers: WeatherType[] = ['sunshine', 'petals', 'rain', 'snow'];
  const phases: TimePhase[] = ['day', 'dawn', 'sunset', 'night'];

  const featuredWeather = weathers[(lvl - 1) % weathers.length];
  const featuredTimePhase = phases[(lvl - 1) % phases.length];

  const seedsPerShrine = Math.min(5, 2 + Math.floor((lvl - 1) / 2));
  const enemyCount = Math.min(12, 5 + Math.floor(lvl * 1.2));
  const bossMaxHp = Math.min(24, 6 + lvl * 2);

  const storyParagraph =
    lvl === 1
      ? `Pip awakens in the ${adj} ${place}. Mischievous gloomlings have dimmed the 4 Ancient Shrines and tangled the ${spirit} in sleepy thorns. Gather Golden Sun-Seeds to restore warmth to the forest!`
      : `With the previous glade singing in harmony, a glowing trail opens into Chapter ${lvl}: The ${adj} ${place}. Here, the ${spirit} awaits your Acorn Wand's blessing to awaken 4 sacred shrines beneath the ${featuredWeather} sky!`;

  return {
    chapterNumber: lvl,
    title: `Chapter ${lvl}: The ${adj} ${place}`,
    subtitle: `Blessing of the ${spirit}`,
    storyParagraph,
    featuredWeather,
    featuredTimePhase,
    seedsPerShrine,
    enemyCount,
    bossMaxHp,
  };
}

/**
 * Computes the live step-by-step stage progression guide and 3D compass target
 * so the player always knows how to finish the current chapter and advance to the next stage.
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
}): StageObjectiveGuide {
  const { playerX, playerZ, sunSeeds, shrines, bossHp, bossMaxHp, bossCleansed, chapterNumber } = params;
  const totalShrines = shrines.length || 4;
  const restoredShrines = shrines.filter((s) => s.isRestored).length;
  const shrineFraction = totalShrines > 0 ? restoredShrines / totalShrines : 0;
  const bossFraction = bossMaxHp > 0 ? Math.max(0, Math.min(1, (bossMaxHp - bossHp) / bossMaxHp)) : 0;

  if (restoredShrines < totalShrines) {
    // Find nearest unrestored shrine
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
 * Generates contextual, chapter-aware live narrative dialogue beats during gameplay.
 */
export function getInGameStoryBeat(
  chapterNumber: number,
  trigger: StoryTriggerEvent
): InGameStoryBeat {
  const lvl = Math.max(1, Math.floor(chapterNumber));
  const spiritEn = CHAPTER_SPIRITS[((lvl - 1) * 5) % CHAPTER_SPIRITS.length];
  const placeEn = CHAPTER_PLACES[((lvl - 1) * 3) % CHAPTER_PLACES.length];

  const faSpirits = [
    'روح بلوط کهنسال',
    'مرغ نغمه‌خوان سحر',
    'بانوی کرم‌های شب‌تاب',
    'بافنده خورشید باستان',
    'نگهبان شبنم',
    'لاک‌پشت خزه‌ای خفته',
    'گوزن گلبرگ‌ستاره',
    'جغد زنگوله‌باد',
  ];
  const faPlaces = [
    'مرغزار',
    'بیشه بید',
    'دره عسل',
    'پناهگاه شکوفه',
    'دره سرخس',
    'تاج خزه‌ای',
    'باغ فانوس',
    'گذرگاه تمشک',
    'حوضچه بذر خورشید',
    'باغستان ارواح',
  ];
  const spiritFa = faSpirits[((lvl - 1) * 5) % faSpirits.length];
  const placeFa = faPlaces[((lvl - 1) * 3) % faPlaces.length];

  switch (trigger) {
    case 'chapter_start':
      return {
        id: 'chapter_start',
        stepIndex: 1,
        totalSteps: 6,
        speakerFa: spiritFa,
        speakerEn: spiritEn,
        textFa: `«ای جوانه نگهبان! در فصل ${lvl} (${placeFa})، خارهای تاریک مرا در مرکز بیشه به بند کشیده‌اند. تا زمانی که ۴ نیایشگاه اطراف خاموش‌اند، سپر خاردار من نفوذناپذیر است!»`,
        textEn: `"Little Guardian! In Chapter ${lvl} (${placeEn}), dark brambles have bound me at the center. While the 4 Ancient Shrines remain dim, the thorny barrier shields the corruption!"`,
        hintFa: 'برای رفتن به مرحله بعد: ابتدا بذرهای طلایی را به ۴ نیایشگاه ببرید (کلید E).',
        hintEn: 'To advance stage: Gather Golden Sun-Seeds and restore all 4 Shrines [E].',
      };
    case 'first_seed':
      return {
        id: 'first_seed',
        stepIndex: 2,
        totalSteps: 6,
        speakerFa: 'پیپ (نگهبان جوانه)',
        speakerEn: 'Pip (Grove Guardian)',
        textFa: `«نور این بذر خورشید در عصای بلوطم طنین انداخت! اگر آن را به نزدیک‌ترین نیایشگاه سنگی ببرم، ریشه‌های خشکیده دوباره جان می‌گیرند.»`,
        textEn: `"This Sun-Seed hums with warm light! If I carry it to the nearest stone Shrine and press [E], the ancient roots will awaken."`,
        hintFa: 'پیکان طلایی پای پیپ جهت نزدیک‌ترین نیایشگاه را نشان می‌دهد.',
        hintEn: 'Follow the golden compass arrow at Pip’s feet to the nearest Shrine.',
      };
    case 'shrine_1':
      return {
        id: 'shrine_1',
        stepIndex: 3,
        totalSteps: 6,
        speakerFa: spiritFa,
        speakerEn: spiritEn,
        textFa: `«نخستین نیایشگاه درخشید و نخستین حلقه از زنجیر خاردار در مرکز ${placeFa} ترک برداشت! ۳ نیایشگاه دیگر باقی مانده است.»`,
        textEn: `"The first Shrine blazes with dawnlight! One thorny seal around the heart of ${placeEn} has cracked—3 Shrines remain."`,
        hintFa: '۳ نیایشگاه دیگر را احیا کنید تا سپر غول مرکزی بشکند.',
        hintEn: 'Restore 3 more Shrines to shatter the central Boss barrier.',
      };
    case 'shrine_2':
      return {
        id: 'shrine_2',
        stepIndex: 4,
        totalSteps: 6,
        speakerFa: spiritFa,
        speakerEn: spiritEn,
        textFa: `«نیمی از نیایشگاه‌های ${placeFa} بیدار شدند! نسیم گرم دوباره میان شاخه‌ها می‌وزد و قدرت غول خاردار رو به افول است.»`,
        textEn: `"Half the Shrines of ${placeEn} now sing in harmony! Warmth returns to the canopy and the Elder Bramble weakens."`,
        hintFa: '۲ نیایشگاه دیگر تا شکستن کامل طلسم غول مرکزی باقی مانده است.',
        hintEn: 'Only 2 Shrines left before the Elder Bramble is vulnerable!',
      };
    case 'shrine_3':
      return {
        id: 'shrine_3',
        stepIndex: 4,
        totalSteps: 6,
        speakerFa: 'پیپ (نگهبان جوانه)',
        speakerEn: 'Pip (Grove Guardian)',
        textFa: `«سومین ستون نور هم بیدار شد! فقط یک نیایشگاه دیگر مانده تا سپر تاریک غول مرکزی برای همیشه فرو بریزد!»`,
        textEn: `"Three pillars of sunlight shine! Just one final Shrine left to shatter the Elder Bramble's dark shield!"`,
        hintFa: 'آخرین نیایشگاه را روی قطب‌نما پیدا و احیا کنید!',
        hintEn: 'Follow the golden arrow to awaken the 4th and final Shrine!',
      };
    case 'all_shrines_restored':
      return {
        id: 'all_shrines_restored',
        stepIndex: 5,
        totalSteps: 6,
        speakerFa: spiritFa,
        speakerEn: spiritEn,
        textFa: `«هر ۴ نیایشگاه احیا شدند و پرتوهای خورشید سپر خاردار را شکافتند! اکنون به مرکز بیشه بیا و با عصای بلوطت مرا از آخرین خارهای تاریک رها کن تا دروازه فصل ${lvl + 1} گشوده شود!»`,
        textEn: `"All 4 Shrines blaze! Their solar beams have shattered the thorny shield! Come to the center of the grove and strike the Elder Bramble to open Chapter ${lvl + 1}!"`,
        hintFa: 'گام نهایی مرحله: به مرکز نقشه (۰،۰) بروید و غول مرکزی را با Space یا Q پاکسازی کنید!',
        hintEn: 'Final Step: Go to the center of the map and strike the Boss with [Space] or [Q]!',
      };
    case 'boss_damaged':
      return {
        id: 'boss_damaged',
        stepIndex: 5,
        totalSteps: 6,
        speakerFa: spiritFa,
        speakerEn: spiritEn,
        textFa: `«آفرین جوانه دلیر! با هر ضربه عصای تو، پوسته سیاه خارها فرو می‌ریزد و شکوفه‌های طلایی جوانه می‌زنند. ادامه بده!»`,
        textEn: `"Well struck, brave Sproutling! Every blow of your Acorn Wand sheds the dark bark and awakens golden blossoms. Keep striking!"`,
        hintFa: 'نوار جان غول مرکزی را به صفر برسانید تا وارد فصل بعد شوید.',
        hintEn: 'Deplete the Boss HP bar to complete the chapter and advance!',
      };
    case 'boss_cleansed':
      return {
        id: 'boss_cleansed',
        stepIndex: 6,
        totalSteps: 6,
        speakerFa: spiritFa,
        speakerEn: spiritEn,
        textFa: `«نفرین تاریکی شکست! ${placeFa} دوباره غرق در نور و آواز شد و دروازه طلایی به سوی فصل ${lvl + 1} پیش روی تو گشوده گشت!»`,
        textEn: `"The curse is lifted! ${placeEn} blooms in golden harmony, and the shimmering pathway to Chapter ${lvl + 1} opens before you!"`,
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



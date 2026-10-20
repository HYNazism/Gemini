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
// 4. INFINITE LEVELS, CONTINUOUS STORY & LOW-END PHONE PERFORMANCE TIER
// ============================================================================

export type PerformanceQuality = 'eco' | 'balanced' | 'high';

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

  const seedsPerShrine = Math.min(6, 2 + Math.floor((lvl + 1) / 2));
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


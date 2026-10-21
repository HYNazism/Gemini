/**
 * Core 60fps Three.js simulation engine for Sproutling: Grove Guardian 3D.
 * Integrates:
 * - Character Customization Rig (Body types, hairstyles, hair colors, facial features, outfits)
 * - Dynamic Day/Night Cycle & Weather System (Sunshine, Rain, Snow, Petals + gameplay modifiers)
 * - Cozy Customizable Home Base Safe Zone & Trophy Pedestals
 * - Google Play AdMob Rewarded Blessings & Second-Wind Revive
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createHeroModel,
  createHomeBaseModel,
  createPufferModel,
  createRollerModel,
  createSpriteModel,
  createShrineModel,
  createBossModel,
  createSunSeedModel,
  createLostSproutAndCageModel,
  createHarmonicBellAndBridgeModel,
  createSakuraPavilionCenterpiece,
  createHeartTreeCenterpiece,
  createDefenseTotemModel,
  createAuroraSpireCenterpiece,
  createStarlightMeteorModel,
  createBoostPadModel,
  createStageObstacleModel,
  createSproutBuddyModel,
  type HeroRig,
  type HomeBaseRig,
  type SproutBuddyRig,
} from './models';
import {
  buildEnvironment,
  setupLighting,
  getGroundHeight,
  createParticlePool,
  createWeatherSystem,
  type ParticlePool,
  type LightingRig,
  type WeatherParticleSystem,
  type EnvironmentDetailRig,
} from './world';
import {
  createInitialPlayer,
  resolvePlayerAttack,
  applyDamageToPlayer,
  tickPlayerTimers,
  damageEnemy,
  tryDepositSeedInShrine,
  checkVictory,
  calculateRunSummary,
  isInsideHomeBaseSafeZone,
  computeUnlockedTrophies,
  computeDayNightState,
  getWeatherGameplayModifiers,
  applyRewardedSeedBlessing,
  applyRewardedRevive,
  generateChapterInfo,
  getStageBiomeTheme,
  createInitialMissionState,
  computeStageObjectiveGuide,
  getInGameStoryBeat,
  getTodayDateKey,
  generateDailyQuests,
  advanceDailyQuestProgress,
  claimDailyQuestReward,
  getGraphicsQualityProfile,
  computeResponsiveHudProfile,
  resolveStageObstacleCollisions,
  createInitialSproutBuddy,
  computeSproutBuddyUpdate,
  createInitialHeroMastery,
  upgradeMasterySkill,
  unlockOrEquipWeapon,
  computeMasteryStats,
  getEffectiveStaminaCost,
  activateParryStance,
  resolveParrySuccess,
  getElementalInfusionPalette,
  recordPlayerStreakEvent,
  resolveBattleComboSeedYield,
  distance,
  DEFAULT_CUSTOMIZATION,
  DEFAULT_HOME_BASE,
  GAME_CONSTANTS,
  type PlayerStats,
  type Shrine,
  type EnemyState,
  type EnemyType,
  type ElementalInfusionType,
  type AttackWeightTier,
  type CharacterCustomization,
  type HomeBaseCustomization,
  type TrophyStatus,
  type WeatherType,
  type TimePhase,
  type ChapterStoryInfo,
  type StageObjectiveGuide,
  type InGameStoryBeat,
  type StoryTriggerEvent,
  type PerformanceQuality,
  type DailyQuest,
  type DailyQuestType,
  type StageMissionState,
  type SproutBuddyState,
  type HeroMasteryState,
  type WeaponType,
} from './rules';
import { sound } from './audio';
import { HapticAndGamepadManager } from './haptics';

export type GameState = 'title' | 'playing' | 'paused' | 'victory' | 'gameover';
export type CameraFocusMode = 'gameplay' | 'customize-hero' | 'customize-home';

export interface FloatingCombatText {
  id: string;
  text: string;
  subtext?: string;
  type: 'normal' | 'crit' | 'finisher' | 'dodge' | 'parry' | 'heal' | 'shard';
  screenX: number;
  screenY: number;
  opacity: number;
}

export interface RadarTelemetry {
  playerX: number;
  playerZ: number;
  playerFacing: number;
  playerRotationY: number;
  sanctuaryX: number;
  sanctuaryZ: number;
  enemies: {
    x: number;
    z: number;
    type: 'puffer' | 'roller' | 'sprite';
    kind: 'charger' | 'roller' | 'ranged';
    isWindup: boolean;
  }[];
  pickups: { x: number; z: number }[];
  shrines: { x: number; z: number; isRestored: boolean; restored: boolean }[];
  boss: { x: number; z: number } | null;
  targetX: number;
  targetZ: number;
}

export interface HUDData {
  gameState: GameState;
  player: PlayerStats;
  shrines: Shrine[];
  totalShrines: number;
  restoredShrines: number;
  cleansedEnemiesCount: number;
  elapsedTime: number;
  isNearShrine: boolean;
  nearShrinePrompt: string;
  isInsideSafeZone: boolean;
  isMuted: boolean;
  weather: WeatherType;
  weatherDescription: string;
  timePhase: TimePhase;
  timeOfDay: number;
  autoDayNight: boolean;
  characterCustom: CharacterCustomization;
  homeBaseCustom: HomeBaseCustomization;
  trophies: TrophyStatus;
  chapterInfo: ChapterStoryInfo;
  bossHp: number;
  bossMaxHp: number;
  bossCleansed: boolean;
  stageObjective: StageObjectiveGuide;
  missionState: StageMissionState;
  currentStoryBeat: InGameStoryBeat | null;
  storyHistory: InGameStoryBeat[];
  performanceQuality: PerformanceQuality;
  dailyQuests: DailyQuest[];
  dailyQuestsDateKey: string;
  sproutBuddy?: SproutBuddyState;
  heroMastery: HeroMasteryState;
  bossPhase: 1 | 2;
  floatingTexts?: FloatingCombatText[];
  floatingCombatTexts?: FloatingCombatText[];
  radar?: RadarTelemetry;
  parryFlashIntensity?: number;
  parryFlashType?: 'normal' | 'boss_shred' | 'riposte';
  parryFlashElement?: ElementalInfusionType;
  parryShakeIntensity?: number;
  parryWeightTier?: AttackWeightTier;
  gamepadConnected?: boolean;
  finalSummary?: {
    finalScore: number;
    stars: number;
    timeFormatted: string;
  };
}

export interface TouchInputState {
  moveX: number;
  moveY: number;
  bonkPressed: boolean;
  dashPressed: boolean;
  spinPressed: boolean;
  parryPressed: boolean;
  interactPressed: boolean;
}

const CHAR_STORAGE_KEY = 'sproutling_char_custom_v1';
const HOME_STORAGE_KEY = 'sproutling_home_custom_v1';
const CHAPTER_STORAGE_KEY = 'sproutling_chapter_num_v1';
const DAILY_QUESTS_STORAGE_KEY = 'sproutling_daily_quests_v1';
const QUALITY_STORAGE_KEY = 'sproutling_perf_quality_v1';
const MASTERY_STORAGE_KEY = 'sproutling_hero_mastery_v1';

export class GameEngine {
  public canvasContainer: HTMLElement;
  public renderer!: THREE.WebGLRenderer;
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;

  public gameState: GameState = 'title';
  public cameraFocusMode: CameraFocusMode = 'gameplay';
  private player: PlayerStats = createInitialPlayer();
  private isHeadless: boolean = false;
  private animFrameId: number | null = null;
  private clock = new THREE.Clock();

  // Customization, Home Base, Infinite Chapter, Mastery & Daily Quests State
  private characterCustom: CharacterCustomization = { ...DEFAULT_CUSTOMIZATION };
  private homeBaseCustom: HomeBaseCustomization = { ...DEFAULT_HOME_BASE };
  private heroMastery: HeroMasteryState = createInitialHeroMastery();
  private homeBaseRig!: HomeBaseRig;
  private currentChapterNumber = 1;
  private performanceQuality: PerformanceQuality = 'ultra';
  private dailyQuestsDateKey: string = getTodayDateKey();
  private dailyQuestsRerollCount: number = 0;
  private dailyQuests: DailyQuest[] = generateDailyQuests(this.dailyQuestsDateKey, 0);

  // Dynamic Day/Night, Weather & Scalable Detail State
  private lightingRig!: LightingRig;
  private environmentRig!: EnvironmentDetailRig;
  private weatherSystem!: WeatherParticleSystem;
  private timeOfDay = 0.3;
  private autoDayNight = true;
  private currentWeather: WeatherType = 'sunshine';
  private weatherTimer = 0;
  private passiveHealAccumulator = 0;

  // Hero Rig & Physics
  private hero!: HeroRig;
  private sproutBuddyRig!: SproutBuddyRig;
  private sproutBuddyState: SproutBuddyState = createInitialSproutBuddy();
  private playerPos = new THREE.Vector3(0, 0, 11);
  private playerVel = new THREE.Vector3();
  private playerFacing = 0;
  private isDashing = false;
  private dashTimer = 0;
  private dashDir = new THREE.Vector3();
  private attackAnimTimer = 0;
  private currentComboStep = 0;
  private spinAnimTimer = 0;
  private parryShockwaveAnimTimer = 0;
  private walkCycle = 0;
  private damageTakenTotal = 0;
  private totalEnemiesCleansed = 0;
  private elapsedTime = 0;

  // Hitstop, Screen-Flash, Camera Zoom Punch, Scaled Shake & Haptics
  private hitstopTimer = 0;
  private cameraTrauma = 0;
  private cameraPunchTimer = 0;
  private cameraPunchMaxDuration = 0.38;
  private cameraPunchZoom = 0.16;
  private parryShakeIntensity = 0;
  private parryRecoilX = 0;
  private parryRecoilZ = 0;
  private parryFlashIntensity = 0;
  private parryFlashType: 'normal' | 'boss_shred' | 'riposte' = 'normal';
  private parryFlashElement: ElementalInfusionType = 'none';
  private haptics = new HapticAndGamepadManager();
  private gamepadConnected = false;
  private gamepadMoveX = 0;
  private gamepadMoveY = 0;
  private cameraOffset = new THREE.Vector3(0, 9.5, 12.5);
  private titleTourAngle = 0;

  // Particles & 3D Parry Crystal Shockwave Pools
  private particles!: ParticlePool;
  private crystalShards: {
    mesh: THREE.Mesh;
    mat: THREE.MeshStandardMaterial;
    vx: number;
    vy: number;
    vz: number;
    rotVelX: number;
    rotVelY: number;
    rotVelZ: number;
    life: number;
    maxLife: number;
    baseScale: number;
  }[] = [];
  private energyPillars: {
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    angle: number;
    startRadius: number;
    endRadius: number;
    centerX: number;
    centerY: number;
    centerZ: number;
    life: number;
    maxLife: number;
    targetHeight: number;
  }[] = [];

  // Enemies
  private enemies: {
    state: EnemyState;
    rig:
      | ReturnType<typeof createPufferModel>
      | ReturnType<typeof createRollerModel>
      | ReturnType<typeof createSpriteModel>;
  }[] = [];

  // Boss & Live Story State
  private bossRig!: ReturnType<typeof createBossModel>;
  private bossHp = 8;
  private bossMaxHp = 8;
  private bossCleansed = false;
  private bossPhase: 1 | 2 = 1;
  private bossShockwaveTimer = 0;
  private currentStoryBeat: InGameStoryBeat | null = null;
  private storyHistory: InGameStoryBeat[] = [];
  private triggeredStoryEvents = new Set<StoryTriggerEvent>();

  // Shrines
  private shrines: Shrine[] = [];
  private shrineRigs: ReturnType<typeof createShrineModel>[] = [];

  // Dynamic Stage Mission State & 3D Props
  private missionState: StageMissionState = createInitialMissionState(1);
  private stagePropsGroup!: THREE.Group;
  private sproutRigs: { sproutRoot: THREE.Group; cageRoot: THREE.Group }[] = [];
  private bellRigs: {
    root: THREE.Group;
    bellMesh: THREE.Mesh;
    haloRing: THREE.Mesh;
    bridgeMesh: THREE.Mesh;
  }[] = [];
  private totemRigs: { root: THREE.Group; orb: THREE.Mesh; ring: THREE.Mesh }[] = [];
  private meteorRigs: {
    root: THREE.Group;
    core: THREE.Mesh;
    timerRing: THREE.Mesh;
    beam: THREE.Mesh;
  }[] = [];
  private boostPadRigs: { root: THREE.Group; ring: THREE.Mesh }[] = [];
  private centerpieceRig: {
    root: THREE.Group;
    rotatingPart?: THREE.Object3D;
  } | null = null;

  // Pickups
  private pickups: {
    mesh: THREE.Group;
    x: number;
    z: number;
    floatOffset: number;
  }[] = [];

  // Projectiles
  private projectiles: {
    mesh: THREE.Mesh;
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    life: number;
    isReflected?: boolean;
  }[] = [];

  // 3D World-Space Floating Combat Numbers
  private floatingTextItems: {
    id: string;
    x: number;
    y: number;
    z: number;
    text: string;
    subtext?: string;
    type: 'normal' | 'crit' | 'finisher' | 'dodge' | 'parry' | 'heal' | 'shard';
    age: number;
    maxAge: number;
  }[] = [];
  private projVec = new THREE.Vector3();

  // Inputs
  private keysHeld = new Set<string>();
  public touchInputs: TouchInputState = {
    moveX: 0,
    moveY: 0,
    bonkPressed: false,
    dashPressed: false,
    spinPressed: false,
    parryPressed: false,
    interactPressed: false,
  };

  private onHUDUpdate: (data: HUDData) => void;
  private lastHUDTick = 0;

  constructor(container: HTMLElement, onHUDUpdate: (data: HUDData) => void) {
    this.canvasContainer = container;
    this.onHUDUpdate = onHUDUpdate;

    this.isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

    this.loadSavedCustomizations();
    this.initThree();
    this.setupWorld();
    this.bindEvents();

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('autostart') === '1') {
        this.startGame();
      }
    }

    this.dispatchHUD();
    this.startLoop();
  }

  private loadSavedCustomizations(): void {
    if (typeof window === 'undefined') return;
    try {
      const savedChar = window.localStorage.getItem(CHAR_STORAGE_KEY);
      if (savedChar) {
        this.characterCustom = { ...DEFAULT_CUSTOMIZATION, ...JSON.parse(savedChar) };
      }
      const savedHome = window.localStorage.getItem(HOME_STORAGE_KEY);
      if (savedHome) {
        this.homeBaseCustom = { ...DEFAULT_HOME_BASE, ...JSON.parse(savedHome) };
      }
      const savedChapter = window.localStorage.getItem(CHAPTER_STORAGE_KEY);
      if (savedChapter) {
        const parsed = parseInt(savedChapter, 10);
        if (!Number.isNaN(parsed) && parsed >= 1) {
          this.currentChapterNumber = parsed;
        }
      }
      const savedMastery = window.localStorage.getItem(MASTERY_STORAGE_KEY);
      if (savedMastery) {
        const parsedMastery = JSON.parse(savedMastery);
        this.heroMastery = {
          ...createInitialHeroMastery(),
          ...parsedMastery,
        };
      }
      this.player = createInitialPlayer(this.heroMastery);
      const savedQuality = window.localStorage.getItem(QUALITY_STORAGE_KEY) as PerformanceQuality | null;
      if (
        savedQuality === 'eco' ||
        savedQuality === 'balanced' ||
        savedQuality === 'high' ||
        savedQuality === 'ultra'
      ) {
        this.performanceQuality = savedQuality;
      } else {
        const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
        this.performanceQuality = cores >= 4 ? 'ultra' : 'high';
      }
      const todayKey = getTodayDateKey();
      this.dailyQuestsDateKey = todayKey;
      const savedQuestsRaw = window.localStorage.getItem(DAILY_QUESTS_STORAGE_KEY);
      if (savedQuestsRaw) {
        const parsed = JSON.parse(savedQuestsRaw) as {
          dateKey?: string;
          rerollCount?: number;
          quests?: DailyQuest[];
        };
        if (parsed.dateKey === todayKey && Array.isArray(parsed.quests) && parsed.quests.length === 3) {
          this.dailyQuestsRerollCount = parsed.rerollCount ?? 0;
          this.dailyQuests = parsed.quests;
          return;
        }
      }
      this.dailyQuestsRerollCount = 0;
      this.dailyQuests = generateDailyQuests(todayKey, 0);
      this.saveDailyQuests();
    } catch {
      // ignore storage errors
    }
  }

  private saveDailyQuests(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        DAILY_QUESTS_STORAGE_KEY,
        JSON.stringify({
          dateKey: this.dailyQuestsDateKey,
          rerollCount: this.dailyQuestsRerollCount,
          quests: this.dailyQuests,
        })
      );
    } catch {
      // ignore
    }
  }

  private recordQuestProgress(type: DailyQuestType, amount: number = 1): void {
    const res = advanceDailyQuestProgress(this.dailyQuests, type, amount);
    this.dailyQuests = res.quests;
    this.saveDailyQuests();

    if (res.newlyCompleted.length > 0) {
      sound.playShrineRestored();
      if (this.particles) {
        this.particles.spawn(
          this.playerPos.x,
          this.playerPos.y + 1.4,
          this.playerPos.z,
          1.0,
          0.9,
          0.25,
          22,
          4.5
        );
      }
      this.dispatchHUD();
    }
  }

  public claimDailyQuest(questId: string): boolean {
    const res = claimDailyQuestReward(this.player, this.dailyQuests, questId);
    if (!res.claimedQuest) return false;

    this.player = res.player;
    this.dailyQuests = res.quests;
    this.saveDailyQuests();
    sound.playShrineRestored();
    if (this.particles) {
      this.particles.spawn(
        this.playerPos.x,
        this.playerPos.y + 1.3,
        this.playerPos.z,
        0.2,
        1.0,
        0.6,
        26,
        5.0
      );
    }
    this.refreshHomeTrophies();
    this.dispatchHUD();
    return true;
  }

  public rerollDailyQuests(): void {
    this.dailyQuestsDateKey = getTodayDateKey();
    this.dailyQuestsRerollCount++;
    this.dailyQuests = generateDailyQuests(this.dailyQuestsDateKey, this.dailyQuestsRerollCount);
    this.saveDailyQuests();
    sound.playPickup();
    this.dispatchHUD();
  }

  public updateCharacterCustomization(next: CharacterCustomization): void {
    this.characterCustom = { ...next };
    this.hero.applyCustomization(this.characterCustom);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(CHAR_STORAGE_KEY, JSON.stringify(this.characterCustom));
      } catch {
        // ignore
      }
    }
    this.dispatchHUD();
  }

  public updateHomeBaseCustomization(next: HomeBaseCustomization): void {
    this.homeBaseCustom = { ...next };
    const trophies = this.getCurrentTrophies();
    this.homeBaseRig.applyHomeCustomization(this.homeBaseCustom, trophies);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(this.homeBaseCustom));
      } catch {
        // ignore
      }
    }
    this.dispatchHUD();
  }

  private saveHeroMastery(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(MASTERY_STORAGE_KEY, JSON.stringify(this.heroMastery));
    } catch {
      // ignore
    }
  }

  public awardAstralShards(amount: number): void {
    if (amount <= 0) return;
    this.heroMastery = {
      ...this.heroMastery,
      astralShards: this.heroMastery.astralShards + Math.round(amount),
    };
    this.saveHeroMastery();
  }

  public upgradeHeroSkill(
    skillKey: 'attackPowerLevel' | 'critChanceLevel' | 'staminaMaxLevel' | 'cooldownHasteLevel'
  ): boolean {
    const res = upgradeMasterySkill(this.heroMastery, skillKey);
    if (!res.upgraded) return false;
    this.heroMastery = res.mastery;
    const stats = computeMasteryStats(this.heroMastery);
    this.player.maxStamina = stats.maxStamina;
    this.player.stamina = stats.maxStamina;
    this.saveHeroMastery();
    sound.playShrineRestored();
    if (this.particles) {
      this.particles.spawn(
        this.playerPos.x,
        this.playerPos.y + 1.3,
        this.playerPos.z,
        0.3,
        0.95,
        1.0,
        24,
        4.5
      );
    }
    this.dispatchHUD();
    return true;
  }

  public equipOrUnlockHeroWeapon(weaponId: WeaponType): boolean {
    const res = unlockOrEquipWeapon(this.heroMastery, weaponId);
    if (!res.success) return false;
    this.heroMastery = res.mastery;
    this.saveHeroMastery();
    if (this.hero) {
      this.hero.applyWeapon(this.heroMastery.equippedWeapon);
    }
    sound.playShrineRestored();
    this.dispatchHUD();
    return true;
  }

  public setCameraFocusMode(mode: CameraFocusMode): void {
    this.cameraFocusMode = mode;
    if (this.scene) {
      const profile = getGraphicsQualityProfile(this.performanceQuality);
      this.scene.environmentIntensity =
        mode === 'gameplay' ? profile.envMapIntensity : Math.max(1.38, profile.envMapIntensity * 1.15);
    }
  }

  public setWeather(weather: WeatherType): void {
    this.currentWeather = weather;
    this.weatherTimer = 0;
    this.dispatchHUD();
  }

  public setTimePhase(phase: TimePhase): void {
    const map: Record<TimePhase, number> = {
      dawn: 0.1,
      day: 0.32,
      sunset: 0.62,
      night: 0.85,
    };
    this.timeOfDay = map[phase];
    this.dispatchHUD();
  }

  public toggleAutoDayNight(): void {
    this.autoDayNight = !this.autoDayNight;
    this.dispatchHUD();
  }

  public grantRewardedSeeds(): void {
    this.player = applyRewardedSeedBlessing(this.player, 3);
    this.recordQuestProgress('harvest_seeds', 3);
    sound.playShrineRestored();
    this.particles.spawn(
      this.playerPos.x,
      this.playerPos.y + 1.2,
      this.playerPos.z,
      1.0,
      0.85,
      0.2,
      24,
      4.5
    );
    this.refreshHomeTrophies();
    this.dispatchHUD();
  }

  public revivePlayerWithAd(): void {
    this.player = applyRewardedRevive(this.player);
    this.gameState = 'playing';
    document.body.dataset.state = 'playing';
    sound.playShrineRestored();
    sound.startAmbientBgm();
    this.particles.spawn(
      this.playerPos.x,
      this.playerPos.y + 1.0,
      this.playerPos.z,
      0.3,
      1.0,
      0.6,
      28,
      5.0
    );
    this.dispatchHUD();
  }

  private getCurrentTrophies(): TrophyStatus {
    const restoredCount = this.shrines.filter((s) => s.isRestored).length;
    return computeUnlockedTrophies(
      restoredCount,
      this.totalEnemiesCleansed,
      this.player.score,
      this.bossCleansed
    );
  }

  private refreshHomeTrophies(): void {
    if (!this.homeBaseRig) return;
    this.homeBaseRig.applyHomeCustomization(this.homeBaseCustom, this.getCurrentTrophies());
  }

  private initThree(): void {
    const width = this.canvasContainer.clientWidth || window.innerWidth;
    const height = this.canvasContainer.clientHeight || window.innerHeight;
    const hudProfile = computeResponsiveHudProfile(width, height);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(hudProfile.cameraFov, width / height, 0.1, 200);
    this.cameraOffset.set(0, hudProfile.cameraOffsetY, hudProfile.cameraOffsetZ);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isHeadless,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.shadowMap.enabled = !this.isHeadless;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    if (!this.isHeadless) {
      try {
        const pmrem = new THREE.PMREMGenerator(this.renderer);
        const envScene = new RoomEnvironment();
        this.scene.environment = pmrem.fromScene(envScene, 0.04).texture;
        envScene.dispose();
        pmrem.dispose();
      } catch {
        // Fallback if PMREM fails on older WebGL contexts
      }
    }

    this.canvasContainer.innerHTML = '';
    this.canvasContainer.appendChild(this.renderer.domElement);
  }

  private setupWorld(): void {
    this.lightingRig = setupLighting(this.scene, this.isHeadless);
    this.environmentRig = buildEnvironment(this.scene);
    this.particles = createParticlePool(this.scene, 260);
    this.weatherSystem = createWeatherSystem(this.scene, 200);
    this.initParryShockwavePools();

    // Hero with saved customization & equipped mythic weapon
    this.hero = createHeroModel(this.characterCustom, this.heroMastery.equippedWeapon);
    this.scene.add(this.hero.root);
    this.updateHeroTransform();

    // Non-Combative 'Sprout-Buddy' Pet Companion & 3D Target Highlighter Beacon
    this.sproutBuddyRig = createSproutBuddyModel();
    this.scene.add(this.sproutBuddyRig.root);
    this.scene.add(this.sproutBuddyRig.highlightGroup);
    this.sproutBuddyState = createInitialSproutBuddy(this.playerPos.x - 1.4, this.playerPos.z + 1.2);
    this.updateSproutBuddy(0.016);

    // Cozy Home Base Sanctuary at (0, 14)
    this.homeBaseRig = createHomeBaseModel(this.homeBaseCustom, this.getCurrentTrophies());
    const baseY = getGroundHeight(GAME_CONSTANTS.HOME_BASE_X, GAME_CONSTANTS.HOME_BASE_Z);
    this.homeBaseRig.root.position.set(GAME_CONSTANTS.HOME_BASE_X, baseY, GAME_CONSTANTS.HOME_BASE_Z);
    this.scene.add(this.homeBaseRig.root);

    // Boss at center (0, 0)
    this.bossRig = createBossModel();
    const bossY = getGroundHeight(0, 0);
    this.bossRig.root.position.set(0, bossY, 0);
    this.scene.add(this.bossRig.root);

    // Stage-Specific Dynamic 3D Props Group
    this.stagePropsGroup = new THREE.Group();
    this.scene.add(this.stagePropsGroup);

    this.applyPerformanceProfile();

    // 4 Ancient Sun Shrines / Astral Pillars
    const initialChapter = generateChapterInfo(this.currentChapterNumber);
    const initialBiome = getStageBiomeTheme(this.currentChapterNumber);
    this.environmentRig.applyBiomeTheme(initialBiome);
    this.bossRig.applyBiomeTheme(initialBiome);
    this.currentWeather = initialChapter.featuredWeather;
    this.setTimePhase(initialChapter.featuredTimePhase);

    this.bossMaxHp = initialChapter.bossMaxHp;
    this.bossHp = initialChapter.bossMaxHp;

    const shrineCoords = [
      { id: 1, name: 'Sun Blossom Shrine', x: -18, z: -16, req: initialChapter.seedsPerShrine },
      { id: 2, name: 'Amber Meadow Shrine', x: 18, z: -16, req: initialChapter.seedsPerShrine },
      { id: 3, name: 'Whispering Willow Shrine', x: -18, z: 18, req: initialChapter.seedsPerShrine },
      { id: 4, name: 'Golden Canopy Shrine', x: 18, z: 18, req: initialChapter.seedsPerShrine },
    ];

    shrineCoords.forEach((s) => {
      this.shrines.push({
        id: s.id,
        name: s.name,
        x: s.x,
        z: s.z,
        requiredSeeds: s.req,
        currentSeeds: 0,
        isRestored: false,
      });

      const rig = createShrineModel(s.name);
      const y = getGroundHeight(s.x, s.z);
      rig.root.position.set(s.x, y, s.z);

      const distToCenter = Math.hypot(s.x, s.z);
      rig.beamMesh.scale.set(1, 1, distToCenter);
      rig.beamMesh.rotation.y = Math.atan2(-s.x, -s.z);
      rig.beamMesh.position.set(-s.x * 0.5, 2.1, -s.z * 0.5);
      rig.beamMesh.visible = false;

      this.scene.add(rig.root);
      this.shrineRigs.push(rig);
    });

    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
      const rad = 6 + Math.random() * 23;
      this.spawnPickup(Math.cos(ang) * rad, Math.sin(ang) * rad);
    }

    this.rebuildStageMissionLayout();
    this.spawnEnemies(initialChapter.enemyCount);
    this.renderer.compile(this.scene, this.camera);
  }

  /**
   * Completely transforms the 3D centerpiece, terrain trails, pond, archways, obstacles,
   * and interactive mission props for each chapter's unique procedural layout and mission mode.
   */
  private rebuildStageMissionLayout(): void {
    this.missionState = createInitialMissionState(this.currentChapterNumber);
    const biome = getStageBiomeTheme(this.currentChapterNumber);
    const layout = this.missionState.mapLayout;

    // Apply biome theme AND procedural chapter map layout (trail pattern, shifted pond, shifted archways)
    this.environmentRig?.applyBiomeTheme(biome, layout);
    this.bossRig?.applyBiomeTheme(biome);

    if (this.stagePropsGroup) {
      while (this.stagePropsGroup.children.length > 0) {
        this.stagePropsGroup.remove(this.stagePropsGroup.children[0]);
      }
    }
    this.sproutRigs = [];
    this.bellRigs = [];
    this.totemRigs = [];
    this.meteorRigs = [];
    this.boostPadRigs = [];
    this.centerpieceRig = null;

    const mode = this.missionState.mode;
    const isBossStage = mode === 'boss_duel';

    // Show Boss & Shrines ONLY in Boss Duel stages so other stages have completely fresh centerpieces & layouts!
    if (this.bossRig) {
      this.bossRig.root.visible = isBossStage;
      this.bossRig.shieldRing.visible = isBossStage;
      this.bossRig.root.scale.setScalar(layout.centerpieceScale);
    }

    // Reposition the 4 Shrines / Resonance Pillars to the chapter's procedural coordinates
    this.shrineRigs.forEach((rig, idx) => {
      const sc = layout.shrineCoords[idx];
      if (sc && this.shrines[idx]) {
        this.shrines[idx].x = sc.x;
        this.shrines[idx].z = sc.z;
        const sy = getGroundHeight(sc.x, sc.z);
        rig.root.position.set(sc.x, sy, sc.z);

        const distToCenter = Math.hypot(sc.x, sc.z);
        rig.beamMesh.scale.set(1, 1, distToCenter);
        rig.beamMesh.rotation.y = Math.atan2(-sc.x, -sc.z);
        rig.beamMesh.position.set(-sc.x * 0.5, 2.1, -sc.z * 0.5);
      }
      rig.root.visible = isBossStage;
      rig.beamMesh.visible = false;
      if (this.shrines[idx]) {
        this.shrines[idx].isRestored = !isBossStage;
        this.shrines[idx].currentSeeds = 0;
        this.shrines[idx].requiredSeeds = 1;
      }
    });

    // Spawn procedural mid-field 3D collidable obstacles for this chapter
    if (this.stagePropsGroup) {
      for (const obs of layout.obstacles) {
        const obsGroup = createStageObstacleModel(obs, biome);
        const oy = getGroundHeight(obs.x, obs.z);
        obsGroup.position.set(obs.x, oy, obs.z);
        this.stagePropsGroup.add(obsGroup);
      }
    }

    // Build Boost Pads (Sakura Wind Streams / Aurora Speed Pads)
    for (const pad of this.missionState.boostPads) {
      const padRig = createBoostPadModel(mode === 'meteor_rush' || mode === 'boss_duel');
      const py = getGroundHeight(pad.x, pad.z);
      padRig.root.position.set(pad.x, py, pad.z);
      this.stagePropsGroup.add(padRig.root);
      this.boostPadRigs.push(padRig);
    }

    if (mode === 'rescue_escort') {
      // Thorny Bramble Cages + Lost Baby Sproutlings + Safe Sanctuary Gazebo
      for (const sp of this.missionState.lostSprouts) {
        const rig = createLostSproutAndCageModel();
        const y = getGroundHeight(sp.x, sp.z);
        rig.sproutRoot.position.set(sp.x, y, sp.z);
        rig.cageRoot.position.set(sp.cageX, y, sp.cageZ);
        this.stagePropsGroup.add(rig.sproutRoot);
        this.stagePropsGroup.add(rig.cageRoot);
        this.sproutRigs.push(rig);
      }
      const pav = createSakuraPavilionCenterpiece();
      pav.root.position.set(0, getGroundHeight(0, 0), 0);
      pav.root.scale.setScalar(layout.centerpieceScale);
      pav.root.rotation.y = layout.terrainWavePhaseX;
      this.stagePropsGroup.add(pav.root);
      this.centerpieceRig = { root: pav.root, rotatingPart: pav.crystalCore };
    } else if (mode === 'harmonic_bells') {
      // Grand Sakura Pavilion at (0, 0) + Shifted Ancient Chime Bells with Crystal Light Bridges
      const pav = createSakuraPavilionCenterpiece();
      pav.root.position.set(0, getGroundHeight(0, 0), 0);
      pav.root.scale.setScalar(layout.centerpieceScale);
      pav.root.rotation.y = layout.terrainWavePhaseX;
      this.stagePropsGroup.add(pav.root);
      this.centerpieceRig = { root: pav.root, rotatingPart: pav.crystalCore };

      for (const bell of this.missionState.bells) {
        const bRig = createHarmonicBellAndBridgeModel(bell.x, bell.z);
        const by = getGroundHeight(bell.x, bell.z);
        bRig.root.position.set(bell.x, by, bell.z);
        bRig.root.rotation.y = Math.atan2(-bell.x, -bell.z);
        this.stagePropsGroup.add(bRig.root);
        this.stagePropsGroup.add(bRig.bridgeMesh);
        this.bellRigs.push(bRig);
      }
    } else if (mode === 'heart_tree_defense') {
      // Colossal Ancient Amber Heart-Tree at (0, 0) + Shifted Golden Pulse Totems
      const tree = createHeartTreeCenterpiece();
      tree.root.position.set(0, getGroundHeight(0, 0), 0);
      tree.root.scale.setScalar(layout.centerpieceScale);
      tree.root.rotation.y = layout.terrainWavePhaseX;
      this.stagePropsGroup.add(tree.root);
      this.centerpieceRig = { root: tree.root, rotatingPart: tree.heartCore };

      for (const totem of this.missionState.totems) {
        const tRig = createDefenseTotemModel();
        const ty = getGroundHeight(totem.x, totem.z);
        tRig.root.position.set(totem.x, ty, totem.z);
        this.stagePropsGroup.add(tRig.root);
        this.totemRigs.push(tRig);
      }
    } else if (mode === 'meteor_rush') {
      // Aurora Prism Spire at (0, 0) + Falling Starlight Meteors
      const spire = createAuroraSpireCenterpiece();
      spire.root.position.set(0, getGroundHeight(0, 0), 0);
      spire.root.scale.setScalar(layout.centerpieceScale);
      spire.root.rotation.y = layout.terrainWavePhaseX;
      this.stagePropsGroup.add(spire.root);
      this.centerpieceRig = { root: spire.root, rotatingPart: spire.spireMesh };

      for (const meteor of this.missionState.meteors) {
        const mRig = createStarlightMeteorModel();
        const my = getGroundHeight(meteor.x, meteor.z);
        mRig.root.position.set(meteor.x, my, meteor.z);
        this.stagePropsGroup.add(mRig.root);
        this.meteorRigs.push(mRig);
      }
    }
  }

  private spawnEnemies(count: number): void {
    const types: ('puffer' | 'roller' | 'sprite')[] = ['puffer', 'roller', 'sprite'];
    const chapter = generateChapterInfo(this.currentChapterNumber);
    const biome = getStageBiomeTheme(this.currentChapterNumber);
    const spdScale = chapter.enemySpeedScale;

    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      let x = 0;
      let z = 0;
      // Ensure enemies never spawn inside the Home Base Safe Zone
      for (let attempt = 0; attempt < 10; attempt++) {
        const ang = Math.random() * Math.PI * 2;
        const rad = 14 + Math.random() * 20;
        x = Math.cos(ang) * rad;
        z = Math.sin(ang) * rad;
        if (!isInsideHomeBaseSafeZone(x, z)) break;
      }
      const y = getGroundHeight(x, z);

      const state: EnemyState = {
        id: `e_${Date.now()}_${Math.random()}`,
        type,
        x,
        z,
        vx: 0,
        vz: 0,
        hp: type === 'roller' ? 2.5 : 1.5,
        maxHp: type === 'roller' ? 2.5 : 1.5,
        state: 'chase',
        timer: Math.random() * 2,
        telegraphTimer: 0,
        targetX: this.playerPos.x,
        targetZ: this.playerPos.z,
        speed: (type === 'puffer' ? 2.3 : type === 'roller' ? 1.85 : 2.1) * spdScale,
        size: type === 'roller' ? 0.9 : 0.7,
      };

      const rig =
        type === 'puffer'
          ? createPufferModel(biome)
          : type === 'roller'
          ? createRollerModel(biome)
          : createSpriteModel(biome);

      rig.root.position.set(x, y, z);
      this.scene.add(rig.root);
      this.enemies.push({ state, rig });
    }
  }

  public spawnPickup(x: number, z: number): void {
    const seed = createSunSeedModel();
    const y = getGroundHeight(x, z);
    seed.root.position.set(x, y, z);
    this.scene.add(seed.root);
    this.pickups.push({
      mesh: seed.root,
      x,
      z,
      floatOffset: Math.random() * Math.PI * 2,
    });
  }

  private bindEvents(): void {
    window.addEventListener('keydown', (e) => {
      this.keysHeld.add(e.code);

      if (this.cameraFocusMode !== 'gameplay') return;

      if (this.gameState === 'title') {
        if (e.code === 'Enter' || e.code === 'Space') {
          this.startGame();
        }
      } else if (this.gameState === 'playing') {
        if (e.code === 'Space') {
          this.triggerPlayerBonk();
        } else if (e.code === 'ShiftLeft' || e.code === 'KeyK') {
          this.triggerPlayerDash();
        } else if (e.code === 'KeyQ' || e.code === 'KeyL') {
          this.triggerPlayerSpin();
        } else if (e.code === 'KeyF') {
          this.triggerPlayerParry();
        } else if (e.code === 'KeyE') {
          this.triggerPlayerInteract();
        } else if (e.code === 'Escape' || e.code === 'KeyP') {
          this.togglePause();
        } else if (e.code === 'KeyM') {
          this.toggleMute();
        }
      } else if (this.gameState === 'paused') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          this.togglePause();
        }
      }
    });

    this.canvasContainer.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this.gameState === 'playing' && this.cameraFocusMode === 'gameplay') {
        this.triggerPlayerParry();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysHeld.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.keysHeld.clear();
      this.resetTouchInputs();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.keysHeld.clear();
        this.resetTouchInputs();
      }
    });

    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  public handleResize(): void {
    if (!this.renderer || !this.camera) return;
    const w = this.canvasContainer.clientWidth || window.innerWidth;
    const h = this.canvasContainer.clientHeight || window.innerHeight;
    const hudProfile = computeResponsiveHudProfile(w, h);
    this.camera.fov = hudProfile.cameraFov;
    this.camera.aspect = w / h;
    this.cameraOffset.set(0, hudProfile.cameraOffsetY, hudProfile.cameraOffsetZ);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  public triggerStoryBeat(event: StoryTriggerEvent, force = false): void {
    if (!force && this.triggeredStoryEvents.has(event)) return;
    this.triggeredStoryEvents.add(event);
    const beat = getInGameStoryBeat(this.currentChapterNumber, event);
    this.currentStoryBeat = beat;
    if (!this.storyHistory.some((b) => b.id === beat.id)) {
      this.storyHistory = [...this.storyHistory, beat];
    }
    this.dispatchHUD();
  }

  public dismissCurrentStoryBeat(): void {
    this.currentStoryBeat = null;
    this.dispatchHUD();
  }

  public jumpToChapter(chapterNum: number): void {
    this.currentChapterNumber = Math.max(1, Math.floor(chapterNum));
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(CHAPTER_STORAGE_KEY, String(this.currentChapterNumber));
      } catch {
        // ignore
      }
    }
    this.restartGame(false);
  }

  public startGame(): void {
    if (this.gameState === 'playing') return;
    this.cameraFocusMode = 'gameplay';
    this.gameState = 'playing';
    document.body.dataset.state = 'playing';

    const chapter = generateChapterInfo(this.currentChapterNumber);
    const biome = getStageBiomeTheme(this.currentChapterNumber);
    this.environmentRig?.applyBiomeTheme(biome);
    this.bossRig?.applyBiomeTheme(biome);

    this.player = createInitialPlayer(this.heroMastery);
    this.playerPos.set(0, getGroundHeight(0, 11), 11);
    this.damageTakenTotal = 0;
    this.totalEnemiesCleansed = 0;
    this.elapsedTime = 0;
    this.bossMaxHp = chapter.bossMaxHp;
    this.bossHp = chapter.bossMaxHp;
    this.bossCleansed = false;
    this.bossPhase = 1;

    this.triggeredStoryEvents.clear();
    this.storyHistory = [];
    this.triggerStoryBeat('chapter_start', true);

    sound.startAmbientBgm();
    this.dispatchHUD();
  }

  public togglePause(): void {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      document.body.dataset.state = 'paused';
      sound.stopAmbientBgm();
    } else if (this.gameState === 'paused') {
      this.gameState = 'playing';
      document.body.dataset.state = 'playing';
      sound.startAmbientBgm();
    }
    this.dispatchHUD();
  }

  public exitToTitleScreen(): void {
    this.cameraFocusMode = 'gameplay';
    this.gameState = 'title';
    document.body.dataset.state = 'title';
    this.touchInputs.moveX = 0;
    this.touchInputs.moveY = 0;
    this.touchInputs.bonkPressed = false;
    this.touchInputs.dashPressed = false;
    this.touchInputs.spinPressed = false;
    this.touchInputs.parryPressed = false;
    this.touchInputs.interactPressed = false;
    sound.stopAmbientBgm();
    this.dispatchHUD();
  }

  public restartGame(advanceChapter = false): void {
    this.cameraFocusMode = 'gameplay';

    if (advanceChapter) {
      this.currentChapterNumber++;
      this.awardAstralShards(25);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(CHAPTER_STORAGE_KEY, String(this.currentChapterNumber));
        } catch {
          // ignore
        }
      }
      // Keep accumulated score when advancing chapters, restore full HP & Stamina
      const mStats = computeMasteryStats(this.heroMastery);
      this.player.hp = this.player.maxHp;
      this.player.maxStamina = mStats.maxStamina;
      this.player.stamina = mStats.maxStamina;
      this.player.isInvulnerable = true;
      this.player.invulnerableTimer = 2.0;
    } else {
      this.player = createInitialPlayer(this.heroMastery);
      this.damageTakenTotal = 0;
      this.totalEnemiesCleansed = 0;
      this.elapsedTime = 0;
    }

    const chapter = generateChapterInfo(this.currentChapterNumber);
    const biome = getStageBiomeTheme(this.currentChapterNumber);
    this.environmentRig?.applyBiomeTheme(biome);
    this.bossRig?.applyBiomeTheme(biome);
    this.currentWeather = chapter.featuredWeather;
    this.setTimePhase(chapter.featuredTimePhase);

    this.playerPos.set(0, getGroundHeight(0, 11), 11);
    this.playerVel.set(0, 0, 0);
    this.isDashing = false;
    this.bossMaxHp = chapter.bossMaxHp;
    this.bossHp = chapter.bossMaxHp;
    this.bossCleansed = false;

    this.shrines.forEach((s, idx) => {
      s.currentSeeds = 0;
      s.requiredSeeds = chapter.seedsPerShrine;
      s.isRestored = false;
      const rig = this.shrineRigs[idx];
      if (rig) {
        (rig.ring.material as THREE.MeshStandardMaterial).emissive.setHex(0x221100);
        rig.light.intensity = 0.5;
        rig.beamMesh.visible = false;
      }
    });

    this.rebuildStageMissionLayout();

    this.enemies.forEach((e) => this.scene.remove(e.rig.root));
    this.enemies = [];
    this.spawnEnemies(chapter.enemyCount);

    while (this.pickups.length < 14) {
      const ang = Math.random() * Math.PI * 2;
      const rad = 6 + Math.random() * 23;
      this.spawnPickup(Math.cos(ang) * rad, Math.sin(ang) * rad);
    }

    this.triggeredStoryEvents.clear();
    this.storyHistory = [];
    this.triggerStoryBeat('chapter_start', true);

    this.refreshHomeTrophies();
    this.gameState = 'playing';
    document.body.dataset.state = 'playing';
    sound.startAmbientBgm();
    this.dispatchHUD();
  }

  public advanceToNextChapter(): void {
    this.restartGame(true);
  }

  private applyPerformanceProfile(): void {
    const profile = getGraphicsQualityProfile(this.performanceQuality);
    if (this.environmentRig) {
      this.environmentRig.applyQualityProfile(profile);
    }
    if (this.hero) {
      this.hero.setHighDetailEnabled(profile.enableCharacterAuraAndSatchel);
      this.hero.setQualityTier(this.performanceQuality);
    }
    if (this.scene) {
      this.scene.environmentIntensity = profile.envMapIntensity;
    }
    if (!this.renderer || this.isHeadless) return;

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, profile.pixelRatioCap));
    this.renderer.shadowMap.enabled = profile.shadowsEnabled;
    this.renderer.toneMappingExposure = profile.toneMappingExposure;

    if (this.lightingRig?.keyLight) {
      this.lightingRig.keyLight.castShadow = profile.shadowsEnabled;
      if (
        profile.shadowsEnabled &&
        this.lightingRig.keyLight.shadow.mapSize.width !== profile.shadowMapSize
      ) {
        this.lightingRig.keyLight.shadow.mapSize.set(profile.shadowMapSize, profile.shadowMapSize);
        this.lightingRig.keyLight.shadow.map?.dispose();
        this.lightingRig.keyLight.shadow.map = null;
      }
    }
  }

  public setPerformanceQuality(quality: PerformanceQuality): void {
    this.performanceQuality = quality;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(QUALITY_STORAGE_KEY, quality);
      } catch {
        // ignore
      }
    }
    this.applyPerformanceProfile();
    this.dispatchHUD();
  }

  public toggleMute(): boolean {
    const isMuted = sound.toggleMute();
    this.dispatchHUD();
    return isMuted;
  }

  public resetTouchInputs(): void {
    this.touchInputs = {
      moveX: 0,
      moveY: 0,
      bonkPressed: false,
      dashPressed: false,
      spinPressed: false,
      parryPressed: false,
      interactPressed: false,
    };
  }

  public triggerPlayerBonk(): void {
    if (this.attackAnimTimer > 0) return;
    const now = this.elapsedTime;
    const attack = resolvePlayerAttack(
      now,
      this.player.comboCount,
      this.player.lastAttackTime,
      this.heroMastery,
      this.player.counterWindowRemaining,
      this.player.activeElementalInfusion
    );

    const riposteElement: ElementalInfusionType =
      attack.infusionConsumed !== 'none'
        ? attack.infusionConsumed
        : this.player.lastParryElement !== 'none'
        ? this.player.lastParryElement
        : 'void';
    const ripostePalette = getElementalInfusionPalette(riposteElement);

    if (attack.isRiposte) {
      this.player.counterWindowRemaining = 0;
      this.player.activeElementalInfusion = 'none';
      if (attack.staminaRestore > 0) {
        this.player.stamina = Math.min(
          this.player.maxStamina,
          this.player.stamina + attack.staminaRestore
        );
      }
      if (attack.hpRestore > 0 && this.player.hp < this.player.maxHp) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + attack.hpRestore);
      }
    }

    this.player.comboCount = attack.combo;
    this.player.comboStep = attack.combo;
    this.player.comboWindowRemaining = GAME_CONSTANTS.COMBO_WINDOW_SEC;
    this.player.lastAttackTime = now;
    this.player.lastHitWasCrit = attack.isCrit;
    this.player.lastDamageDealt = Math.round(attack.damage * 10) / 10;
    this.attackAnimTimer = 0.28;
    this.currentComboStep = attack.combo;

    if (this.hero) {
      this.hero.triggerSlashArc(attack.isRiposte ? 3 : attack.combo, attack.isCrit);
      if (attack.isRiposte) {
        this.hero.slashArcMat.color.setHex(ripostePalette.pillarPrimaryHex);
      }
    }

    sound.playSwing(attack.combo);
    if (attack.isRiposte) {
      this.haptics.triggerRiposteStrike(Math.max(0.7, this.parryShakeIntensity));
      this.parryFlashIntensity = 0.85;
      this.parryFlashType = 'riposte';
      this.parryFlashElement = riposteElement;
      this.cameraPunchMaxDuration = 0.3;
      this.cameraPunchTimer = 0.3;
      this.cameraPunchZoom = 0.16;
    } else {
      this.haptics.triggerCombatImpact(attack.isFinisher || attack.isCrit);
    }

    const attackRange = GAME_CONSTANTS.ATTACK_RADIUS + attack.radiusBonus;
    let hitAny = false;

    for (const item of this.enemies) {
      const e = item.state;
      if (e.state === 'cleansed') continue;

      const d = distance(this.playerPos.x, this.playerPos.z, e.x, e.z);
      if (d <= attackRange) {
        this.player = recordPlayerStreakEvent(this.player, 'hit', 1);
        const stunDur = attack.isRiposte ? 1.2 + attack.bonusStunDuration : 0.35;
        const res = damageEnemy(e, attack.damage, stunDur);
        item.state = res.enemy;
        hitAny = true;

        if (attack.isRiposte) {
          this.spawnCrystalShatterBurst(
            e.x,
            getGroundHeight(e.x, e.z) + 0.9,
            e.z,
            15,
            riposteElement,
            1.1
          );

          // Sun Infusion Riposte: Solar Flare AoE Burn Detonation around target
          if (attack.bonusAoEBurnDamage > 0) {
            this.particles.spawn(
              e.x,
              getGroundHeight(e.x, e.z) + 1.0,
              e.z,
              1.0,
              0.38,
              0.12,
              28,
              5.8
            );
            for (const other of this.enemies) {
              if (other === item || other.state.state === 'cleansed') continue;
              if (distance(e.x, e.z, other.state.x, other.state.z) <= 3.8) {
                const burnRes = damageEnemy(other.state, attack.bonusAoEBurnDamage, 0.9);
                other.state = burnRes.enemy;
                if (burnRes.wasCleansed) {
                  this.onEnemyCleansed(other.state.x, other.state.z, 220);
                }
              }
            }
          }
        }

        const dx = e.x - this.playerPos.x;
        const dz = e.z - this.playerPos.z;
        const len = Math.max(0.1, Math.hypot(dx, dz));
        const pushForce =
          attack.infusionConsumed === 'frost'
            ? 8.5
            : attack.isRiposte
            ? 15.5
            : attack.isFinisher
            ? 13
            : 6.5;
        e.vx = (dx / len) * pushForce;
        e.vz = (dz / len) * pushForce;

        const [pr, pg, pb] = attack.isRiposte
          ? ripostePalette.particleRgb
          : attack.isCrit
          ? [0.3, 0.95, 1.0]
          : [0.95, 0.85, 0.25];
        this.particles.spawn(
          e.x,
          getGroundHeight(e.x, e.z) + 0.8,
          e.z,
          pr,
          pg,
          pb,
          attack.isRiposte || attack.isFinisher || attack.isCrit ? 22 : 9
        );

        const dmgDisplay = Math.round(attack.damage * 100);
        const elementTag =
          attack.infusionConsumed !== 'none'
            ? `${attack.infusionConsumed.toUpperCase()} RIPOSTE ${dmgDisplay}!`
            : `RIPOSTE ${dmgDisplay}!`;
        this.spawnFloatingText(
          e.x,
          getGroundHeight(e.x, e.z) + 1.4,
          e.z,
          attack.isRiposte
            ? elementTag
            : attack.isCrit
            ? `CRIT ${dmgDisplay}!`
            : `${dmgDisplay}`,
          attack.isRiposte ? 'parry' : attack.isCrit ? 'crit' : attack.isFinisher ? 'finisher' : 'normal',
          attack.isRiposte
            ? ripostePalette.riposteBonusLabelEn
            : attack.isFinisher
            ? 'FINISHER'
            : undefined
        );

        if (res.wasCleansed) {
          this.onEnemyCleansed(e.x, e.z, attack.isRiposte ? 260 : attack.isCrit ? 200 : 150);
        }
      }
    }

    if (attack.isFinisher && hitAny) {
      this.recordQuestProgress('combo_finishers', 1);
    }

    if (this.triggerStageMissionAction(attackRange + 1.0)) {
      hitAny = true;
    }

    if (!this.bossCleansed && this.missionState.mode === 'boss_duel') {
      const dToBoss = distance(this.playerPos.x, this.playerPos.z, 0, 0);
      if (dToBoss <= attackRange + 1.6) {
        hitAny = true;
        this.player = recordPlayerStreakEvent(this.player, 'hit', 1);
        const stunMult = this.missionState.bossStunRemaining > 0 ? 3.0 : 1.25;
        const effDamage = attack.damage * stunMult;
        this.bossHp = Math.max(0, this.bossHp - effDamage);
        if (attack.isRiposte) {
          this.spawnCrystalShatterBurst(0, 2.0, 0, 16, riposteElement, 1.25);
        }
        const [br, bg, bb] = attack.isRiposte ? ripostePalette.particleRgb : [0.7, 0.2, 0.9];
        this.particles.spawn(0, 2.0, 0, br, bg, bb, 16);
        this.spawnFloatingText(
          0,
          3.2,
          0,
          attack.isRiposte
            ? `${riposteElement.toUpperCase()} RIPOSTE ${Math.round(effDamage * 100)}!`
            : attack.isCrit
            ? `CRIT ${Math.round(effDamage * 100)}!`
            : `${Math.round(effDamage * 100)}`,
          attack.isRiposte ? 'parry' : attack.isCrit ? 'crit' : 'finisher',
          attack.isRiposte
            ? ripostePalette.riposteBonusLabelEn
            : this.missionState.bossStunRemaining > 0
            ? 'STUNNED 3X'
            : undefined
        );
        this.triggerStoryBeat('boss_damaged');

        if (this.bossHp <= 0) {
          this.cleanseBoss();
        }
      }
    }

    if (hitAny) {
      sound.playHit(attack.isFinisher || attack.isCrit);
      this.hitstopTimer = attack.isRiposte ? 0.072 : attack.isFinisher || attack.isCrit ? 0.065 : 0.035;
      this.cameraTrauma = Math.min(
        1.0,
        this.cameraTrauma + (attack.isRiposte ? 0.58 : attack.isFinisher || attack.isCrit ? 0.48 : 0.25)
      );
      this.dispatchHUD();
    }
  }

  private onEnemyCleansed(x: number, z: number, scoreReward: number): void {
    this.totalEnemiesCleansed++;
    this.player.score += scoreReward;
    this.awardAstralShards(4);
    this.recordQuestProgress('cleanse_gloomlings', 1);
    sound.playCleansed();
    this.spawnPickup(x, z);
    this.spawnPickup(x + (Math.random() - 0.5) * 1.4, z + (Math.random() - 0.5) * 1.4);

    // Award bonus Sun-Seed yield from the active decaying Hit + Parry Combo Meter
    const comboYield = resolveBattleComboSeedYield(this.player, 2, false);
    this.player = comboYield.player;
    if (comboYield.bonusSeeds > 0) {
      this.recordQuestProgress('collect_seeds', comboYield.bonusSeeds);
      this.spawnFloatingText(
        x,
        getGroundHeight(x, z) + 1.95,
        z,
        `+${comboYield.bonusSeeds} BONUS SUN-SEEDS!`,
        'shard',
        `${comboYield.multiplierApplied.toFixed(2)}X COMBO YIELD (${this.player.streakRank})`
      );
    }

    if (this.player.hp < this.player.maxHp) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 1);
    }
    this.refreshHomeTrophies();

    // Stage 3 (Heart-Tree Defense): Count towards wave defense objective!
    if (this.missionState.mode === 'heart_tree_defense') {
      this.missionState.currentCount++;
      if (this.missionState.currentCount >= this.missionState.targetCount) {
        this.completeStageMission();
      } else if (this.missionState.currentCount % 3 === 0) {
        this.missionState.currentWave = Math.min(
          this.missionState.totalWaves,
          Math.floor(this.missionState.currentCount / 3) + 1
        );
        this.triggerStoryBeat(this.missionState.currentWave === 2 ? 'shrine_1' : 'shrine_2');
        this.spawnEnemies(3);
      }
    }
  }

  private completeStageMission(): void {
    if (this.bossCleansed) return;
    this.bossCleansed = true;
    this.bossHp = 0;
    this.shrines.forEach((s) => {
      s.isRestored = true;
    });
    this.player.score += 1000;
    this.awardAstralShards(35);

    // Grant Battle Finale Sun-Seed Harvest Bonus from Peak/Active Combo Multiplier
    const finaleYield = resolveBattleComboSeedYield(this.player, 6, true);
    this.player = finaleYield.player;
    if (finaleYield.bonusSeeds > 0) {
      this.recordQuestProgress('collect_seeds', finaleYield.bonusSeeds);
      this.spawnFloatingText(
        this.playerPos.x,
        this.playerPos.y + 2.2,
        this.playerPos.z,
        `BATTLE FINALE +${finaleYield.bonusSeeds} SUN-SEEDS!`,
        'shard',
        `${finaleYield.multiplierApplied.toFixed(2)}X COMBO HARVEST BONUS`
      );
    }

    this.triggerStoryBeat('boss_cleansed');
    sound.playShrineRestored();
    this.particles.spawn(this.playerPos.x, this.playerPos.y + 1.8, this.playerPos.z, 0.2, 0.95, 0.4, 36);
    this.refreshHomeTrophies();
    this.checkGameOutcome();
  }

  private cleanseBoss(): void {
    if (this.bossCleansed) return;
    if (this.bossRig) {
      (this.bossRig.core.material as THREE.MeshStandardMaterial).emissive.setHex(0x00ff88);
      this.bossRig.eyeMat.color.setHex(0x80ffdb);
      this.bossRig.eyeMat.emissive.setHex(0x06d6a0);
      this.bossRig.shieldRing.visible = false;
    }
    this.completeStageMission();
  }

  public triggerPlayerDash(): void {
    const dashCost = getEffectiveStaminaCost(
      GAME_CONSTANTS.DASH_BASE_STAMINA_COST,
      this.player.staminaBuffRemaining
    );
    if (this.player.dashCooldownRemaining > 0 || this.isDashing || this.player.stamina < dashCost) return;

    const mStats = computeMasteryStats(this.heroMastery);
    this.isDashing = true;
    this.dashTimer = GAME_CONSTANTS.PLAYER_DASH_DURATION;
    this.player.dashCooldownRemaining = GAME_CONSTANTS.PLAYER_DASH_COOLDOWN * mStats.cooldownMultiplier;
    this.player.stamina = Math.max(0, this.player.stamina - dashCost);
    this.player.isInvulnerable = true;
    this.player.invulnerableTimer = GAME_CONSTANTS.PLAYER_DASH_DURATION + 0.14;

    // Check for Tactical Perfect Dodge (dodging near an attacking/winding-up enemy or incoming projectile)
    let isPerfectDodge = false;
    for (const item of this.enemies) {
      const e = item.state;
      if (
        (e.state === 'windup' || e.state === 'attack') &&
        distance(this.playerPos.x, this.playerPos.z, e.x, e.z) <= 5.2
      ) {
        isPerfectDodge = true;
        break;
      }
    }
    if (!isPerfectDodge) {
      for (const proj of this.projectiles) {
        if (!proj.isReflected && distance(this.playerPos.x, this.playerPos.z, proj.x, proj.z) <= 3.5) {
          isPerfectDodge = true;
          break;
        }
      }
    }

    if (isPerfectDodge) {
      this.player.perfectDodgeCount++;
      this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 18);
      this.player.score += 120;
      this.awardAstralShards(2);
      this.spawnFloatingText(
        this.playerPos.x,
        this.playerPos.y + 1.75,
        this.playerPos.z,
        'PERFECT EVADE!',
        'dodge',
        '+18 STAMINA · +2 SHARDS'
      );
      this.particles.spawn(
        this.playerPos.x,
        this.playerPos.y + 0.9,
        this.playerPos.z,
        0.3,
        0.95,
        1.0,
        22,
        4.2
      );
    }

    this.dashDir.set(Math.sin(this.playerFacing), 0, Math.cos(this.playerFacing)).normalize();
    this.recordQuestProgress('leaf_dashes', 1);
    sound.playDash();

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(isPerfectDodge ? 35 : 20);
    }

    this.particles.spawn(this.playerPos.x, this.playerPos.y + 0.3, this.playerPos.z, 1.0, 1.0, 0.9, 12, 2.5);
  }

  public triggerPlayerSpin(): void {
    const spinCost = getEffectiveStaminaCost(
      GAME_CONSTANTS.SPIN_BASE_STAMINA_COST,
      this.player.staminaBuffRemaining
    );
    if (this.player.spinCooldownRemaining > 0 || this.player.stamina < spinCost) return;

    const mStats = computeMasteryStats(this.heroMastery);
    this.player.spinCooldownRemaining = GAME_CONSTANTS.PLAYER_SPIN_COOLDOWN * mStats.cooldownMultiplier;
    this.player.stamina = Math.max(0, this.player.stamina - spinCost);
    this.spinAnimTimer = 0.55;
    if (this.hero) {
      this.hero.triggerSlashArc(3, true);
    }
    this.recordQuestProgress('bloom_spins', 1);
    sound.playPollenSpin();

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }

    this.particles.spawn(
      this.playerPos.x,
      this.playerPos.y + 0.8,
      this.playerPos.z,
      0.95,
      0.85,
      0.3,
      25,
      6.0
    );

    const spinRadius = GAME_CONSTANTS.SPIN_RADIUS + mStats.radiusBonus;
    const spinDamage = 2.6 * mStats.damageMultiplier;
    let hitCount = 0;
    for (const item of this.enemies) {
      const e = item.state;
      if (e.state === 'cleansed') continue;

      const d = distance(this.playerPos.x, this.playerPos.z, e.x, e.z);
      if (d <= spinRadius) {
        hitCount++;
        this.player = recordPlayerStreakEvent(this.player, 'hit', 1);
        const res = damageEnemy(e, spinDamage);
        item.state = res.enemy;

        const dx = e.x - this.playerPos.x;
        const dz = e.z - this.playerPos.z;
        const len = Math.max(0.1, Math.hypot(dx, dz));
        e.vx = (dx / len) * 14;
        e.vz = (dz / len) * 14;

        this.spawnFloatingText(
          e.x,
          getGroundHeight(e.x, e.z) + 1.4,
          e.z,
          `SUPERNOVA ${Math.round(spinDamage * 100)}!`,
          'finisher'
        );

        if (res.wasCleansed) {
          this.onEnemyCleansed(e.x, e.z, 200);
        }
      }
    }

    if (this.triggerStageMissionAction(spinRadius)) {
      hitCount++;
    }

    if (!this.bossCleansed && this.missionState.mode === 'boss_duel') {
      const dToBoss = distance(this.playerPos.x, this.playerPos.z, 0, 0);
      if (dToBoss <= spinRadius + 1.5) {
        hitCount++;
        this.player = recordPlayerStreakEvent(this.player, 'hit', 1);
        const stunMult = this.missionState.bossStunRemaining > 0 ? 3.0 : 1.3;
        this.bossHp = Math.max(0, this.bossHp - spinDamage * stunMult);
        this.triggerStoryBeat('boss_damaged');
        if (this.bossHp <= 0) {
          this.cleanseBoss();
        }
      }
    }

    if (hitCount > 0) {
      this.hitstopTimer = 0.05;
      this.cameraTrauma = Math.min(1.0, this.cameraTrauma + 0.35);
      this.dispatchHUD();
    }
  }

  /**
   * Scans the immediate parry envelope for incoming Gloomling attacks, projectiles, or Boss strikes
   * and returns the highest-priority threat ('boss' > 'roller' > 'puffer' > 'sprite' > 'projectile')
   * so both the Elemental Infusion and Attack-Weight Scaled Screen-Shake match the deflected foe.
   */
  private detectDominantParryThreat(): {
    detected: boolean;
    sourceType: EnemyType | 'projectile';
    isHeavyAttackState: boolean;
    recoilDirX: number;
    recoilDirZ: number;
  } {
    let bestPriority = 0;
    let bestSource: EnemyType | 'projectile' = 'puffer';
    let bestHeavy = false;
    let recoilX = 0;
    let recoilZ = 1;

    // 1. Check Sovereign Boss in Boss Duel
    if (
      !this.bossCleansed &&
      this.missionState.mode === 'boss_duel' &&
      distance(this.playerPos.x, this.playerPos.z, 0, 0) <= 6.2
    ) {
      const d = Math.max(0.1, distance(this.playerPos.x, this.playerPos.z, 0, 0));
      return {
        detected: true,
        sourceType: 'boss',
        isHeavyAttackState: true,
        recoilDirX: this.playerPos.x / d,
        recoilDirZ: this.playerPos.z / d,
      };
    }

    // 2. Check Gloomling enemies ('roller' > 'puffer' > 'sprite')
    for (const item of this.enemies) {
      const e = item.state;
      if (e.state === 'cleansed' || e.state === 'stunned') continue;
      const d = distance(this.playerPos.x, this.playerPos.z, e.x, e.z);
      const isAttacking = e.state === 'windup' || e.state === 'attack';
      if ((isAttacking && d <= 5.2) || d <= 2.45) {
        const typePriority = e.type === 'roller' ? 3 : e.type === 'puffer' ? 2 : 1;
        const effectivePriority = typePriority * 10 + (isAttacking ? 5 : 0);
        if (effectivePriority > bestPriority) {
          bestPriority = effectivePriority;
          bestSource = e.type;
          bestHeavy = isAttacking || e.type === 'roller';
          const len = Math.max(0.1, d);
          recoilX = (this.playerPos.x - e.x) / len;
          recoilZ = (this.playerPos.z - e.z) / len;
        }
      }
    }

    // 3. Check incoming Spark Projectiles
    if (bestPriority === 0) {
      for (const proj of this.projectiles) {
        const d = distance(this.playerPos.x, this.playerPos.z, proj.x, proj.z);
        if (!proj.isReflected && d <= GAME_CONSTANTS.PARRY_DEFLECT_RADIUS + 1.0) {
          const len = Math.max(0.1, d);
          return {
            detected: true,
            sourceType: 'projectile',
            isHeavyAttackState: false,
            recoilDirX: (this.playerPos.x - proj.x) / len,
            recoilDirZ: (this.playerPos.z - proj.z) / len,
          };
        }
      }
    }

    return {
      detected: bestPriority > 0,
      sourceType: bestSource,
      isHeavyAttackState: bestHeavy,
      recoilDirX: recoilX,
      recoilDirZ: recoilZ,
    };
  }

  /**
   * Activates the Astral Aegis Parry stance (KeyF / Right-Click / Mobile Parry Button).
   * If an enemy attack, roller lunge, projectile, or boss strike is within the deflection
   * envelope, immediately triggers a Perfect Parry with Elemental Infusion & Weight-Scaled Shake.
   */
  public triggerPlayerParry(): void {
    const res = activateParryStance(this.player, this.heroMastery);
    if (!res.activated) return;

    this.player = res.player;
    sound.playParryStance();
    this.haptics.triggerParryStance();
    this.particles.spawn(
      this.playerPos.x,
      this.playerPos.y + 0.9,
      this.playerPos.z,
      0.22,
      0.88,
      1.0,
      12,
      2.6
    );

    const threat = this.detectDominantParryThreat();
    if (threat.detected) {
      this.executeSuccessfulParry(
        threat.sourceType,
        threat.isHeavyAttackState,
        threat.recoilDirX,
        threat.recoilDirZ
      );
    } else {
      this.dispatchHUD();
    }
  }

  /**
   * Executes a Perfect Parry Deflection:
   * 1. Infuses the Warden's crystal shatter shards, upward pillars, and Riposte window with the Gloomling's element ('forest' | 'frost' | 'sun' | 'void')
   * 2. Scales parryShakeIntensity (0.38..1.0), Micro Hit-Stop (42ms..95ms), Camera Zoom Punch & Haptic Rumble by incoming attack weight
   * 3. Staggers melee enemies (2.2s stun), reflects projectiles at 1.8x speed, and shreds Boss Aegis Shields
   */
  private executeSuccessfulParry(
    overrideSource?: EnemyType | 'projectile',
    overrideHeavy?: boolean,
    recoilDirX: number = 0,
    recoilDirZ: number = 1
  ): void {
    const fallbackThreat =
      overrideSource !== undefined
        ? {
            sourceType: overrideSource,
            isHeavyAttackState: Boolean(overrideHeavy),
            recoilDirX,
            recoilDirZ,
          }
        : this.detectDominantParryThreat();

    const res = resolveParrySuccess(
      this.player,
      this.heroMastery,
      fallbackThreat.sourceType,
      fallbackThreat.isHeavyAttackState
    );
    this.player = res.player;
    const palette = getElementalInfusionPalette(res.element);

    this.parryShockwaveAnimTimer = 0.48;
    this.awardAstralShards(3);
    this.recordQuestProgress('leaf_dashes', 1);
    sound.playParrySuccess(res.element, -fallbackThreat.recoilDirX * 0.72, res.parryShakeIntensity);

    // Attack-Weight Scaled Hit-Stop, Camera Zoom Punch, Directional Recoil & Trauma Shake
    this.hitstopTimer = res.hitstopDuration;
    this.cameraPunchMaxDuration = res.cameraPunchDuration;
    this.cameraPunchTimer = res.cameraPunchDuration;
    this.cameraPunchZoom = res.cameraPunchZoom;
    this.parryShakeIntensity = res.parryShakeIntensity;
    this.parryRecoilX = fallbackThreat.recoilDirX * res.parryShakeIntensity * 0.65;
    this.parryRecoilZ = fallbackThreat.recoilDirZ * res.parryShakeIntensity * 0.65;
    this.cameraTrauma = Math.min(1.0, Math.max(this.cameraTrauma, res.parryShakeIntensity));
    this.parryFlashIntensity = Math.min(1.0, 0.72 + res.parryShakeIntensity * 0.35);
    this.parryFlashType = 'normal';
    this.parryFlashElement = res.element;

    if (this.hero) {
      this.hero.parryShockwaveMat.color.setHex(palette.shockwaveRingHex);
    }

    // Spawn Elemental 3D Shattering Crystal Shards & Upward Astral Energy Pillars around the Warden
    this.spawnParryShockwaveVisuals(
      this.playerPos.x,
      this.playerPos.y,
      this.playerPos.z,
      res.element,
      res.shardCount,
      res.pillarHeightScale
    );

    const [pr, pg, pb] = palette.particleRgb;
    this.particles.spawn(
      this.playerPos.x,
      this.playerPos.y + 0.95,
      this.playerPos.z,
      pr,
      pg,
      pb,
      Math.round(24 + res.parryShakeIntensity * 16),
      5.2 + res.parryShakeIntensity * 2.4
    );

    const weightTag = res.weightTier.toUpperCase();
    this.spawnFloatingText(
      this.playerPos.x,
      this.playerPos.y + 1.9,
      this.playerPos.z,
      `${palette.nameEn}! (${weightTag})`,
      'parry',
      `${palette.riposteBonusLabelEn} · SHAKE ${Math.round(res.parryShakeIntensity * 100)}%`
    );

    // 1. Instant AoE Shockwave & Melee Stagger (2.2s Stun)
    for (const item of this.enemies) {
      const e = item.state;
      if (e.state === 'cleansed') continue;
      const d = distance(this.playerPos.x, this.playerPos.z, e.x, e.z);
      if (d <= res.shockwaveRadius) {
        const hitRes = damageEnemy(e, res.shockwaveDamage, res.staggerDuration);
        item.state = hitRes.enemy;
        item.state.telegraphTimer = 0;

        const dx = e.x - this.playerPos.x;
        const dz = e.z - this.playerPos.z;
        const len = Math.max(0.1, Math.hypot(dx, dz));
        item.state.vx = (dx / len) * (13.5 + res.parryShakeIntensity * 4.5);
        item.state.vz = (dz / len) * (13.5 + res.parryShakeIntensity * 4.5);

        // Shatter enemy defense crystals in their own elemental hue at their position
        const enemyElement: ElementalInfusionType =
          e.type === 'puffer' ? 'forest' : e.type === 'roller' ? 'sun' : 'frost';
        this.spawnCrystalShatterBurst(
          e.x,
          getGroundHeight(e.x, e.z) + 0.85,
          e.z,
          10,
          enemyElement,
          0.95 + res.parryShakeIntensity * 0.35
        );

        this.spawnFloatingText(
          e.x,
          getGroundHeight(e.x, e.z) + 1.45,
          e.z,
          `STAGGER ${Math.round(res.shockwaveDamage * 100)}!`,
          'parry',
          'DEFENSE BROKEN · 2.2S'
        );

        if (hitRes.wasCleansed) {
          this.onEnemyCleansed(e.x, e.z, 220);
        }
      }
    }

    // 2. Deflect Incoming Void Projectiles Back at Enemies (1.8x Speed)
    for (const p of this.projectiles) {
      if (
        !p.isReflected &&
        distance(this.playerPos.x, this.playerPos.z, p.x, p.z) <=
          GAME_CONSTANTS.PARRY_DEFLECT_RADIUS + 1.4
      ) {
        p.isReflected = true;
        p.vx = -p.vx * 1.8;
        p.vz = -p.vz * 1.8;
        p.life = 2.8;
        (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(palette.pillarPrimaryHex);
        p.mesh.scale.setScalar(1.35);
        this.spawnCrystalShatterBurst(p.x, p.y, p.z, 9, 'frost', 0.9);
        this.spawnFloatingText(p.x, p.y + 0.6, p.z, 'FROST DEFLECT!', 'parry');
      }
    }

    // 3. Shred Boss Aegis Shield & Stagger Sovereign Boss
    let bossShieldShredded = false;
    if (!this.bossCleansed && this.missionState.mode === 'boss_duel') {
      const dToBoss = distance(this.playerPos.x, this.playerPos.z, 0, 0);
      if (dToBoss <= res.shockwaveRadius + 2.2) {
        bossShieldShredded = true;
        this.parryFlashType = 'boss_shred';
        this.parryFlashElement = 'void';
        this.parryShakeIntensity = 1.0;
        this.cameraTrauma = 1.0;

        // Shred 1 unrestored Starlight Pillar / Aegis Shield segment if any remain
        const unrestoredIdx = this.shrines.findIndex((s) => !s.isRestored);
        if (unrestoredIdx !== -1) {
          const shrine = this.shrines[unrestoredIdx];
          shrine.isRestored = true;
          shrine.currentSeeds = shrine.requiredSeeds;
          const rig = this.shrineRigs[unrestoredIdx];
          if (rig) {
            (rig.ring.material as THREE.MeshStandardMaterial).emissive.setHex(0x4cc9f0);
            (rig.ring.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.1;
            rig.beamMesh.visible = true;
          }
          this.recordQuestProgress('restore_shrines', 1);
        }
        if (this.bossRig) {
          this.bossRig.shieldRing.visible = false;
        }
        this.missionState.bossStunRemaining = Math.max(this.missionState.bossStunRemaining, 4.5);
        const bossParryDmg = res.shockwaveDamage * 1.8;
        this.bossHp = Math.max(0, this.bossHp - bossParryDmg);
        this.spawnCrystalShatterBurst(0, 2.1, 0, 20, 'void', 1.35);
        this.spawnFloatingText(
          0,
          3.4,
          0,
          `AEGIS SHREDDED -${Math.round(bossParryDmg * 100)}!`,
          'parry',
          'VOID INFUSION · BOSS STAGGERED'
        );
        this.triggerStoryBeat('boss_damaged');
        if (this.bossHp <= 0) {
          this.cleanseBoss();
        }
      }
    }

    this.haptics.triggerPerfectParry(bossShieldShredded, this.parryShakeIntensity);
    this.dispatchHUD();
  }

  /**
   * Handles stage-specific interactive props (Bramble Cages, Chime Bells, Pulse Totems,
   * Starlight Meteors, or Astral Boss Pillars) via either Whack/Spin or Interact [E].
   */
  private triggerStageMissionAction(radius: number): boolean {
    const mode = this.missionState.mode;
    const px = this.playerPos.x;
    const pz = this.playerPos.z;
    let acted = false;

    if (mode === 'rescue_escort') {
      for (let i = 0; i < this.missionState.lostSprouts.length; i++) {
        const sp = this.missionState.lostSprouts[i];
        if (sp.state === 'caged' && distance(px, pz, sp.cageX, sp.cageZ) <= radius) {
          sp.state = 'following';
          this.missionState.followingCount = this.missionState.lostSprouts.filter(
            (s) => s.state === 'following'
          ).length;
          const rig = this.sproutRigs[i];
          if (rig) {
            rig.cageRoot.visible = false;
          }
          this.player.score += 200;
          sound.playShrineRestored();
          this.particles.spawn(sp.cageX, getGroundHeight(sp.cageX, sp.cageZ) + 1.0, sp.cageZ, 0.4, 1.0, 0.5, 28, 4.5);
          this.triggerStoryBeat('shrine_1');
          acted = true;
        }
      }
    } else if (mode === 'harmonic_bells') {
      for (let i = 0; i < this.missionState.bells.length; i++) {
        const bell = this.missionState.bells[i];
        if (!bell.isRung && distance(px, pz, bell.x, bell.z) <= radius + 0.6) {
          bell.isRung = true;
          this.missionState.currentCount = this.missionState.bells.filter((b) => b.isRung).length;
          this.missionState.allBellsRung = this.missionState.currentCount >= this.missionState.targetCount;
          const rig = this.bellRigs[i];
          if (rig) {
            (rig.bellMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.25;
            (rig.bridgeMesh.material as THREE.MeshStandardMaterial).opacity = 0.88;
            (rig.bridgeMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.0;
          }
          this.player.score += 220;
          this.recordQuestProgress('restore_shrines', 1);
          sound.playShrineRestored();
          this.particles.spawn(bell.x, getGroundHeight(bell.x, bell.z) + 1.8, bell.z, 1.0, 0.7, 0.85, 30, 5.0);
          if (this.missionState.allBellsRung) {
            this.triggerStoryBeat('all_shrines_restored');
          } else {
            this.triggerStoryBeat('shrine_1');
          }
          acted = true;
        }
      }
      if (this.missionState.allBellsRung && distance(px, pz, 0, 0) <= 5.5) {
        this.completeStageMission();
        acted = true;
      }
    } else if (mode === 'heart_tree_defense') {
      for (let i = 0; i < this.missionState.totems.length; i++) {
        const totem = this.missionState.totems[i];
        if (totem.cooldown <= 0 && distance(px, pz, totem.x, totem.z) <= radius + 0.5) {
          totem.cooldown = 7.5;
          this.missionState.heartTreeHp = Math.min(
            this.missionState.heartTreeMaxHp,
            this.missionState.heartTreeHp + 18
          );
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 1);
          sound.playShrineRestored();
          this.particles.spawn(totem.x, getGroundHeight(totem.x, totem.z) + 1.5, totem.z, 1.0, 0.8, 0.2, 32, 5.5);

          // Golden shockwave damages & knocks back all nearby critters!
          for (const item of this.enemies) {
            const e = item.state;
            if (e.state === 'cleansed') continue;
            if (distance(0, 0, e.x, e.z) <= 18) {
              const res = damageEnemy(e, 3.0);
              item.state = res.enemy;
              if (res.wasCleansed) {
                this.onEnemyCleansed(e.x, e.z, 180);
              }
            }
          }
          acted = true;
        }
      }
    } else if (mode === 'boss_duel') {
      for (let idx = 0; idx < this.shrines.length; idx++) {
        const shrine = this.shrines[idx];
        if (!shrine.isRestored && distance(px, pz, shrine.x, shrine.z) <= radius + 0.8) {
          shrine.isRestored = true;
          shrine.currentSeeds = shrine.requiredSeeds;
          this.missionState.bossStunRemaining = 7.5;
          const rig = this.shrineRigs[idx];
          if (rig) {
            (rig.ring.material as THREE.MeshStandardMaterial).emissive.setHex(0x4cc9f0);
            (rig.ring.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.1;
            rig.beamMesh.visible = true;
          }
          if (this.bossRig) {
            this.bossRig.shieldRing.visible = false;
          }
          this.bossHp = Math.max(1.0, this.bossHp - this.bossMaxHp * 0.2);
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 1);
          this.recordQuestProgress('restore_shrines', 1);
          sound.playShrineRestored();
          this.particles.spawn(shrine.x, getGroundHeight(shrine.x, shrine.z) + 2.0, shrine.z, 0.3, 0.9, 1.0, 32, 5.0);
          this.triggerStoryBeat('shrine_1');
          acted = true;
        }
      }
    }

    return acted;
  }

  public triggerPlayerInteract(): void {
    if (this.triggerStageMissionAction(GAME_CONSTANTS.SHRINE_INTERACT_RADIUS)) {
      this.dispatchHUD();
      return;
    }

    for (let idx = 0; idx < this.shrines.length; idx++) {
      const shrine = this.shrines[idx];
      const res = tryDepositSeedInShrine(this.player, shrine, this.playerPos.x, this.playerPos.z);
      if (res.success) {
        this.player = res.player;
        this.shrines[idx] = res.shrine;
        sound.playPickup();
        this.refreshHomeTrophies();
        if (res.justCompleted) {
          this.recordQuestProgress('restore_shrines', 1);
          sound.playShrineRestored();
          this.checkGameOutcome();
        }
        this.dispatchHUD();
        break;
      }
    }
  }

  private checkGameOutcome(): void {
    if (checkVictory(this.shrines, this.bossCleansed)) {
      this.gameState = 'victory';
      document.body.dataset.state = 'gameover';
      sound.stopAmbientBgm();
      sound.playVictory();

      const summary = calculateRunSummary(
        this.player.score,
        this.totalEnemiesCleansed,
        this.elapsedTime,
        this.damageTakenTotal
      );
      this.dispatchHUD(summary);
    }
  }

  private startLoop(): void {
    let headlessRenderAccum = 1.0;
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05);

      if (this.isHeadless) {
        headlessRenderAccum += rawDt;
        if (headlessRenderAccum < 0.066) {
          return;
        }
        headlessRenderAccum = 0;
      }

      this.updateDayNightAndWeather(dt);
      if (this.environmentRig) {
        this.environmentRig.updateDetails(this.elapsedTime);
      }

      if (this.cameraFocusMode === 'customize-hero') {
        this.updateCustomizeHeroCamera(dt);
      } else if (this.cameraFocusMode === 'customize-home') {
        this.updateCustomizeHomeCamera(dt);
      } else if (this.gameState === 'title') {
        this.updateTitleMode(dt);
      } else if (this.gameState === 'playing') {
        this.updatePlayingMode(dt);
      } else {
        this.particles.update(dt * 0.5);
      }

      this.renderer.render(this.scene, this.camera);
    };

    this.animFrameId = requestAnimationFrame(animate);
  }

  private updateDayNightAndWeather(dt: number): void {
    if (this.autoDayNight && (this.gameState === 'playing' || this.gameState === 'title')) {
      // Full day/night cycle every ~95 seconds
      this.timeOfDay = (this.timeOfDay + dt * 0.0105) % 1;

      // Cycle weather naturally every 28 seconds when auto-cycling
      this.weatherTimer += dt;
      if (this.weatherTimer > 28) {
        this.weatherTimer = 0;
        const order: WeatherType[] = ['sunshine', 'petals', 'rain', 'snow'];
        const nextIdx = (order.indexOf(this.currentWeather) + 1) % order.length;
        this.currentWeather = order[nextIdx];
      }
    }

    const envState = computeDayNightState(this.timeOfDay);
    this.lightingRig.updateDayNight(envState, dt);

    // Adjust Home Base hearth & window glow based on dusk/night
    if (this.homeBaseRig) {
      this.homeBaseRig.hearthLight.intensity = 0.8 + envState.lanternGlowIntensity * 1.4;
      (this.homeBaseRig.windowMesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.3 + envState.lanternGlowIntensity * 0.9;
    }

    this.weatherSystem.update(dt, this.playerPos.x, this.playerPos.z, this.currentWeather, this.elapsedTime);
  }

  private updateCustomizeHeroCamera(dt: number): void {
    this.titleTourAngle += dt * 0.85;
    const hx = this.playerPos.x;
    const hy = getGroundHeight(hx, this.playerPos.z);
    const hz = this.playerPos.z;

    this.hero.root.position.set(hx, hy, hz);
    this.hero.root.rotation.y = Math.sin(this.titleTourAngle) * 0.85;
    this.hero.sproutTop.rotation.z = Math.sin(this.titleTourAngle * 2) * 0.12;

    const targetCamX = hx + 0.8;
    const targetCamY = hy + 1.65;
    const targetCamZ = hz + 3.6;

    this.camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), Math.min(1, dt * 6));
    this.camera.lookAt(hx + 0.4, hy + 1.15, hz);
  }

  private updateCustomizeHomeCamera(dt: number): void {
    this.titleTourAngle += dt * 0.35;
    const bx = GAME_CONSTANTS.HOME_BASE_X;
    const bz = GAME_CONSTANTS.HOME_BASE_Z;
    const by = getGroundHeight(bx, bz);

    const camX = bx + Math.sin(this.titleTourAngle) * 9.5;
    const camZ = bz - 7.5 + Math.cos(this.titleTourAngle) * 2.0;
    const camY = by + 5.8;

    this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), Math.min(1, dt * 5));
    this.camera.lookAt(bx, by + 1.4, bz + 1.2);
  }

  private updateTitleMode(dt: number): void {
    this.titleTourAngle += dt * 0.25;
    const r = 18;
    const camX = Math.cos(this.titleTourAngle) * r;
    const camZ = Math.sin(this.titleTourAngle) * r;
    const camY = 8.5;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(0, 1.2, 4);

    this.hero.root.position.set(0, getGroundHeight(0, 11), 11);
    this.hero.headMesh.position.y = 1.35 + Math.sin(this.titleTourAngle * 4) * 0.03;
    this.hero.sproutTop.rotation.z = Math.sin(this.titleTourAngle * 3) * 0.15;

    this.updateSproutBuddy(dt);
    this.particles.update(dt);
  }

  private updatePlayingMode(dt: number): void {
    this.elapsedTime += dt;

    // Poll Gamepad Controller Axes & Buttons
    const gp = this.haptics.pollGamepad();
    this.gamepadConnected = gp.connected;
    this.gamepadMoveX = gp.moveX;
    this.gamepadMoveY = gp.moveY;
    if (gp.pauseJustPressed) {
      this.togglePause();
      return;
    }

    if (this.parryFlashIntensity > 0) {
      this.parryFlashIntensity = Math.max(0, this.parryFlashIntensity - dt * 2.55);
    }

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.updateCamera(dt);
      this.particles.update(dt);
      this.updateParryShockwaveVisuals(dt);
      return;
    }

    if (gp.parryJustPressed) {
      this.triggerPlayerParry();
    }
    if (gp.attackJustPressed) {
      this.triggerPlayerBonk();
    }
    if (gp.dashJustPressed) {
      this.triggerPlayerDash();
    }
    if (gp.spinJustPressed) {
      this.triggerPlayerSpin();
    }

    const weatherMods = getWeatherGameplayModifiers(this.currentWeather);
    const inSafeZone = isInsideHomeBaseSafeZone(this.playerPos.x, this.playerPos.z);

    // Passive healing from nourishing rain OR resting inside the Cozy Home Base Sanctuary
    const healRate = weatherMods.passiveHealPerSecond + (inSafeZone ? 0.65 : 0);
    if (healRate > 0 && this.player.hp < this.player.maxHp) {
      this.passiveHealAccumulator += healRate * dt;
      if (this.passiveHealAccumulator >= 1.0) {
        this.passiveHealAccumulator -= 1.0;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 1);
        this.particles.spawn(this.playerPos.x, this.playerPos.y + 1.0, this.playerPos.z, 0.3, 0.95, 0.5, 6);
      }
    }

    this.player = tickPlayerTimers(this.player, dt, weatherMods.dashCooldownMultiplier);
    this.updatePlayerMovement(dt);
    this.updateStageMission(dt);
    this.updatePickups(dt, weatherMods.seedScoreBonusMultiplier);
    this.updateSproutBuddy(dt);
    this.updateEnemies(dt, weatherMods.enemySpeedMultiplier);
    this.updateProjectiles(dt);
    this.updateBoss(dt);
    this.particles.update(dt);
    this.updateParryShockwaveVisuals(dt);
    this.updateCamera(dt);

    if (this.elapsedTime - this.lastHUDTick >= 0.08) {
      this.lastHUDTick = this.elapsedTime;
      this.dispatchHUD();
    }
  }

  private updateStageMission(dt: number): void {
    const mode = this.missionState.mode;
    const px = this.playerPos.x;
    const pz = this.playerPos.z;

    if (this.centerpieceRig?.rotatingPart) {
      this.centerpieceRig.rotatingPart.rotation.y += dt * 1.1;
    }

    if (this.missionState.speedBoostRemaining > 0) {
      this.missionState.speedBoostRemaining = Math.max(0, this.missionState.speedBoostRemaining - dt);
    }
    if (this.missionState.bossStunRemaining > 0) {
      this.missionState.bossStunRemaining = Math.max(0, this.missionState.bossStunRemaining - dt);
    }

    // Animate Environmental Runic Traps & Shockwave Telegraphs on stage obstacles
    if (this.stagePropsGroup) {
      const pulseWave = Math.sin(this.elapsedTime * 3.2);
      const isTrapPeak = pulseWave > 0.92;
      for (const child of this.stagePropsGroup.children) {
        if (child.userData?.bladeRing) {
          child.userData.bladeRing.rotation.y += dt * 3.2;
        }
        if (child.userData?.hazardRing) {
          const hRing = child.userData.hazardRing as THREE.Mesh;
          hRing.rotation.z -= dt * 1.4;
          const hMat = hRing.material as THREE.MeshBasicMaterial;
          hMat.opacity = Math.max(0.12, (pulseWave + 1) * 0.38);
          if (
            isTrapPeak &&
            !this.isDashing &&
            distance(px, pz, child.position.x, child.position.z) <=
              (child.userData.hazardRadius || 2.1)
          ) {
            this.hitPlayer(1);
          }
        }
      }
    }

    // Check Wind-Stream / Aurora Boost Pads
    for (let i = 0; i < this.missionState.boostPads.length; i++) {
      const pad = this.missionState.boostPads[i];
      const rig = this.boostPadRigs[i];
      if (rig) {
        rig.ring.rotation.z += dt * 2.5;
      }
      if (distance(px, pz, pad.x, pad.z) <= 2.1) {
        if (this.missionState.speedBoostRemaining <= 0.5) {
          sound.playDash();
          this.particles.spawn(px, this.playerPos.y + 0.5, pz, 0.5, 1.0, 0.95, 14, 3.5);
        }
        this.missionState.speedBoostRemaining = 3.5;
      }
    }

    // Mode 1: Rescue & Escort Lost Sproutlings
    if (mode === 'rescue_escort') {
      let followOrder = 0;
      for (let i = 0; i < this.missionState.lostSprouts.length; i++) {
        const sp = this.missionState.lostSprouts[i];
        const rig = this.sproutRigs[i];
        if (!rig) continue;

        if (sp.state === 'caged') {
          // Auto-free if Pip walks right up to the cage or whacks it
          const hop = Math.abs(Math.sin(this.elapsedTime * 6 + i)) * 0.18;
          rig.sproutRoot.position.set(sp.x, getGroundHeight(sp.x, sp.z) + hop, sp.z);
        } else if (sp.state === 'following') {
          followOrder++;
          const targetDist = 1.45 * followOrder;
          const dx = px - sp.x;
          const dz = pz - sp.z;
          const d = Math.hypot(dx, dz);
          if (d > targetDist) {
            const moveStep = Math.min(d - targetDist, 8.2 * dt);
            sp.x += (dx / d) * moveStep;
            sp.z += (dz / d) * moveStep;
            rig.sproutRoot.rotation.y = Math.atan2(dx, dz);
          }
          const hop = Math.abs(Math.sin(this.elapsedTime * 11 + i)) * 0.35;
          rig.sproutRoot.position.set(sp.x, getGroundHeight(sp.x, sp.z) + hop, sp.z);

          // Check if brought to Safe Sanctuary Cottage (0, 13.5) or Central Gazebo (0, 0)
          if (
            distance(sp.x, sp.z, this.missionState.safeZoneX, this.missionState.safeZoneZ) <= 6.8 ||
            distance(sp.x, sp.z, 0, 0) <= 4.5
          ) {
            sp.state = 'rescued';
            this.missionState.currentCount = this.missionState.lostSprouts.filter(
              (s) => s.state === 'rescued'
            ).length;
            this.missionState.followingCount = this.missionState.lostSprouts.filter(
              (s) => s.state === 'following'
            ).length;
            // Place rescued sproutling happily dancing around the Safe Cottage
            const angle = this.missionState.currentCount * 1.1;
            sp.x = this.missionState.safeZoneX + Math.cos(angle) * 2.4;
            sp.z = this.missionState.safeZoneZ + Math.sin(angle) * 2.4;
            rig.sproutRoot.position.set(sp.x, getGroundHeight(sp.x, sp.z), sp.z);
            this.player.score += 350;
            this.recordQuestProgress('restore_shrines', 1);
            sound.playShrineRestored();
            this.particles.spawn(sp.x, getGroundHeight(sp.x, sp.z) + 1.2, sp.z, 1.0, 0.9, 0.25, 32, 5.0);

            if (this.missionState.currentCount >= this.missionState.targetCount) {
              this.completeStageMission();
            } else {
              this.triggerStoryBeat('shrine_2');
            }
          }
        } else if (sp.state === 'rescued') {
          const hop = Math.abs(Math.sin(this.elapsedTime * 8 + i)) * 0.25;
          rig.sproutRoot.position.y = getGroundHeight(sp.x, sp.z) + hop;
          rig.sproutRoot.rotation.y += dt * 2.0;
        }
      }
    }

    // Mode 2: Sakura Harmonic Bells & Central Pavilion
    if (mode === 'harmonic_bells') {
      for (let i = 0; i < this.missionState.bells.length; i++) {
        const bell = this.missionState.bells[i];
        const rig = this.bellRigs[i];
        if (rig && bell.isRung) {
          rig.bellMesh.rotation.z = Math.sin(this.elapsedTime * 8 + i) * 0.14;
          rig.haloRing.rotation.z += dt * 1.8;
        }
      }
      if (this.missionState.allBellsRung && distance(px, pz, 0, 0) <= 4.5) {
        this.completeStageMission();
      }
    }

    // Mode 3: Heart-Tree Wave Defense
    if (mode === 'heart_tree_defense') {
      for (let i = 0; i < this.missionState.totems.length; i++) {
        const totem = this.missionState.totems[i];
        const rig = this.totemRigs[i];
        if (totem.cooldown > 0) {
          totem.cooldown = Math.max(0, totem.cooldown - dt);
        }
        if (rig) {
          rig.orb.rotation.y += dt * 2.2;
          rig.orb.position.y = 1.7 + Math.sin(this.elapsedTime * 4 + i) * 0.12;
          (rig.orb.material as THREE.MeshStandardMaterial).emissiveIntensity =
            totem.cooldown <= 0 ? 1.2 : 0.2;
        }
      }
    }

    // Mode 4: Falling Starlight Meteor Rush
    if (mode === 'meteor_rush') {
      for (let i = 0; i < this.missionState.meteors.length; i++) {
        const meteor = this.missionState.meteors[i];
        const rig = this.meteorRigs[i];
        if (!rig || meteor.collected) continue;

        meteor.timeRemaining -= dt;
        rig.core.rotation.y += dt * 2.8;
        rig.core.position.y = 0.75 + Math.sin(this.elapsedTime * 5 + i) * 0.18;
        const scaleRatio = Math.max(0.25, meteor.timeRemaining / meteor.maxTime);
        rig.timerRing.scale.set(scaleRatio, scaleRatio, 1);

        // Collect meteor by touching it!
        if (distance(px, pz, meteor.x, meteor.z) <= 2.35) {
          meteor.collected = true;
          this.missionState.currentCount++;
          this.player.score += 250;
          this.recordQuestProgress('harvest_seeds', 1);
          sound.playShrineRestored();
          this.particles.spawn(meteor.x, getGroundHeight(meteor.x, meteor.z) + 1.0, meteor.z, 0.5, 1.0, 0.9, 28, 4.8);

          if (this.missionState.currentCount >= this.missionState.targetCount) {
            rig.root.visible = false;
            this.completeStageMission();
            return;
          } else {
            // Respawn a new falling meteor at a fresh location!
            const ang = Math.random() * Math.PI * 2;
            const rad = 12 + Math.random() * 16;
            meteor.x = Math.cos(ang) * rad;
            meteor.z = Math.sin(ang) * rad;
            meteor.timeRemaining = 28;
            meteor.collected = false;
            rig.root.position.set(meteor.x, getGroundHeight(meteor.x, meteor.z), meteor.z);
            this.triggerStoryBeat('shrine_1');
          }
        } else if (meteor.timeRemaining <= 0) {
          // If timer expires, respawn a fresh meteor at a new spot so the player can always win!
          const ang = Math.random() * Math.PI * 2;
          const rad = 11 + Math.random() * 16;
          meteor.x = Math.cos(ang) * rad;
          meteor.z = Math.sin(ang) * rad;
          meteor.timeRemaining = 28;
          rig.root.position.set(meteor.x, getGroundHeight(meteor.x, meteor.z), meteor.z);
        }
      }
    }
  }

  private updatePlayerMovement(dt: number): void {
    let inputX = 0;
    let inputZ = 0;

    if (this.keysHeld.has('KeyA') || this.keysHeld.has('ArrowLeft')) inputX -= 1;
    if (this.keysHeld.has('KeyD') || this.keysHeld.has('ArrowRight')) inputX += 1;
    if (this.keysHeld.has('KeyW') || this.keysHeld.has('ArrowUp')) inputZ -= 1;
    if (this.keysHeld.has('KeyS') || this.keysHeld.has('ArrowDown')) inputZ += 1;

    if (Math.abs(this.touchInputs.moveX) > 0.1) inputX += this.touchInputs.moveX;
    if (Math.abs(this.touchInputs.moveY) > 0.1) inputZ += this.touchInputs.moveY;
    if (Math.abs(this.gamepadMoveX) > 0.1) inputX += this.gamepadMoveX;
    if (Math.abs(this.gamepadMoveY) > 0.1) inputZ += this.gamepadMoveY;

    if (this.touchInputs.bonkPressed) {
      this.touchInputs.bonkPressed = false;
      this.triggerPlayerBonk();
    }
    if (this.touchInputs.dashPressed) {
      this.touchInputs.dashPressed = false;
      this.triggerPlayerDash();
    }
    if (this.touchInputs.spinPressed) {
      this.touchInputs.spinPressed = false;
      this.triggerPlayerSpin();
    }
    if (this.touchInputs.parryPressed) {
      this.touchInputs.parryPressed = false;
      this.triggerPlayerParry();
    }
    if (this.touchInputs.interactPressed) {
      this.touchInputs.interactPressed = false;
      this.triggerPlayerInteract();
    }

    const inputLen = Math.hypot(inputX, inputZ);
    const boostMult = this.missionState.speedBoostRemaining > 0 ? 1.55 : 1.0;

    if (this.isDashing) {
      this.dashTimer -= dt;
      this.playerPos.x += this.dashDir.x * GAME_CONSTANTS.PLAYER_DASH_SPEED * dt;
      this.playerPos.z += this.dashDir.z * GAME_CONSTANTS.PLAYER_DASH_SPEED * dt;

      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
    } else if (inputLen > 0.05) {
      const normX = inputX / inputLen;
      const normZ = inputZ / inputLen;

      this.playerFacing = Math.atan2(normX, normZ);
      const speed = GAME_CONSTANTS.PLAYER_SPEED * boostMult * Math.min(1.0, inputLen);

      this.playerPos.x += normX * speed * dt;
      this.playerPos.z += normZ * speed * dt;

      this.walkCycle += dt * 14 * inputLen * boostMult;
    } else {
      this.walkCycle += dt * 2.5;
    }

    const distFromCenter = Math.hypot(this.playerPos.x, this.playerPos.z);
    if (distFromCenter > 42) {
      const pushFactor = 42 / distFromCenter;
      this.playerPos.x *= pushFactor;
      this.playerPos.z *= pushFactor;
    }

    // Smooth circle-to-circle sliding collision against procedural chapter obstacles
    const obsRes = resolveStageObstacleCollisions(
      this.playerPos.x,
      this.playerPos.z,
      0.55,
      this.missionState.mapLayout.obstacles
    );
    this.playerPos.x = obsRes.x;
    this.playerPos.z = obsRes.z;

    this.playerPos.y = getGroundHeight(this.playerPos.x, this.playerPos.z);
    this.updateHeroTransform();
  }

  private updateHeroTransform(): void {
    this.hero.root.position.copy(this.playerPos);
    this.hero.root.rotation.y = this.playerFacing;

    const isMoving =
      this.keysHeld.size > 0 || Math.hypot(this.touchInputs.moveX, this.touchInputs.moveY) > 0.1;
    const bob = isMoving ? Math.sin(this.walkCycle) * 0.08 : Math.sin(this.walkCycle) * 0.02;
    this.hero.bodyMesh.position.y = 0.66 + bob;
    this.hero.headMesh.position.y = 1.36 + bob * 1.2;
    this.hero.faceGroup.position.y = 1.36 + bob * 1.2;

    this.hero.sproutTop.rotation.z = Math.sin(this.walkCycle) * (isMoving ? 0.25 : 0.08);
    this.hero.cape.rotation.x =
      -0.38 - (isMoving ? 0.35 : 0.05) + Math.cos(this.walkCycle * 2) * 0.1;

    this.hero.leftFoot.position.z = Math.sin(this.walkCycle) * 0.18;
    this.hero.rightFoot.position.z = -Math.sin(this.walkCycle) * 0.18;

    this.hero.leftArm.rotation.x = -Math.sin(this.walkCycle) * (isMoving ? 0.45 : 0.08);
    this.hero.rightArm.rotation.x = Math.sin(this.walkCycle) * (isMoving ? 0.32 : 0.06);
    this.hero.staffRing.rotation.z += 0.04;
    this.hero.staffRing.rotation.y += 0.025;
    if (this.hero.auraHaloGroup.visible) {
      this.hero.auraHaloGroup.rotation.y += 0.022;
      this.hero.auraHaloGroup.position.y = 0.95 + Math.sin(this.elapsedTime * 2.5) * 0.06;
    }

    if (this.attackAnimTimer > 0) {
      this.attackAnimTimer -= 0.016;
      const progress = 1 - Math.max(0, this.attackAnimTimer / 0.28);
      const swingSwing = Math.sin(progress * Math.PI) * 1.85;
      this.hero.staff.rotation.x = swingSwing;
      this.hero.staff.rotation.z =
        this.currentComboStep === 2
          ? Math.sin(progress * Math.PI) * 1.15
          : -Math.sin(progress * Math.PI) * 0.85;
      this.hero.rightArm.rotation.x = -swingSwing * 0.65;
      this.hero.slashArcMesh.rotation.z = progress * Math.PI * 1.25;
      this.hero.slashArcMat.opacity = Math.max(0, (1 - progress) * 0.88);
    } else if (this.spinAnimTimer > 0) {
      this.spinAnimTimer -= 0.016;
      this.hero.staff.rotation.y += 0.52;
      this.hero.slashArcMesh.rotation.z += 0.45;
      this.hero.slashArcMat.opacity = Math.max(0, (this.spinAnimTimer / 0.55) * 0.92);
    } else {
      this.hero.staff.rotation.set(0, 0, 0);
      if (this.hero.slashArcMesh.visible) {
        this.hero.slashArcMat.opacity = 0;
        this.hero.slashArcMesh.visible = false;
      }
    }

    // Animate 3D Runic Aegis Parry Ward & Expanding Deflect Shockwave Ring
    if (this.player.parryWindowRemaining > 0) {
      this.hero.parryShieldGroup.visible = true;
      this.hero.parryShieldGroup.rotation.z += 0.14;
      const wardPulse = 1.0 + Math.sin(this.elapsedTime * 28) * 0.08;
      this.hero.parryShieldGroup.scale.setScalar(wardPulse);
    } else {
      this.hero.parryShieldGroup.visible = false;
    }

    if (this.parryShockwaveAnimTimer > 0) {
      this.parryShockwaveAnimTimer = Math.max(0, this.parryShockwaveAnimTimer - 0.016);
      const shockProgress = 1 - this.parryShockwaveAnimTimer / 0.45;
      this.hero.parryShockwaveMesh.visible = true;
      const ringScale = 1.0 + shockProgress * 4.2;
      this.hero.parryShockwaveMesh.scale.set(ringScale, ringScale, 1);
      this.hero.parryShockwaveMat.opacity = Math.max(0, (1 - shockProgress) * 0.92);
    } else if (this.hero.parryShockwaveMesh.visible) {
      this.hero.parryShockwaveMesh.visible = false;
      this.hero.parryShockwaveMat.opacity = 0;
    }

    // Orient 3D Objective Waypoint Compass toward active stage objective
    if (this.gameState === 'playing' && this.cameraFocusMode === 'gameplay') {
      const obj = computeStageObjectiveGuide({
        playerX: this.playerPos.x,
        playerZ: this.playerPos.z,
        sunSeeds: this.player.sunSeeds,
        shrines: this.shrines,
        bossHp: this.bossHp,
        bossMaxHp: this.bossMaxHp,
        bossCleansed: this.bossCleansed,
        chapterNumber: this.currentChapterNumber,
        missionState: this.missionState,
      });
      this.hero.compassGroup.visible = obj.currentStep < 3;
      this.hero.compassGroup.rotation.y = obj.angleToTargetRad - this.playerFacing;
      this.hero.compassArrowMat.color.setHex(obj.currentStep === 2 ? 0x06d6a0 : 0xffd166);
    } else {
      this.hero.compassGroup.visible = false;
    }

    if (this.player.isInvulnerable) {
      this.hero.root.visible = Math.floor(this.elapsedTime * 20) % 2 === 0;
    } else {
      this.hero.root.visible = true;
    }
  }

  private updatePickups(dt: number, scoreMultiplier = 1.0): void {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.mesh.rotation.y += dt * 2.2;
      p.mesh.position.y =
        getGroundHeight(p.x, p.z) + 0.5 + Math.sin(this.elapsedTime * 3 + p.floatOffset) * 0.15;

      const d = distance(this.playerPos.x, this.playerPos.z, p.x, p.z);
      if (d <= GAME_CONSTANTS.SEED_PICKUP_RADIUS) {
        this.player.sunSeeds++;
        this.player.score += Math.round(50 * scoreMultiplier);
        this.recordQuestProgress('harvest_seeds', 1);
        this.triggerStoryBeat('first_seed');
        sound.playPickup();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(10);
        }

        this.particles.spawn(p.x, p.mesh.position.y, p.z, 1.0, 0.9, 0.2, 10);
        this.scene.remove(p.mesh);
        this.pickups.splice(i, 1);
        this.refreshHomeTrophies();
      }
    }

    if (this.pickups.length < 12) {
      const ang = Math.random() * Math.PI * 2;
      const rad = 7 + Math.random() * 22;
      this.spawnPickup(Math.cos(ang) * rad, Math.sin(ang) * rad);
    }
  }

  private updateEnemies(dt: number, weatherSpeedMultiplier = 1.0): void {
    const pX = this.playerPos.x;
    const pZ = this.playerPos.z;
    const playerInSafeZone = isInsideHomeBaseSafeZone(pX, pZ);

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const item = this.enemies[i];
      const e = item.state;
      const rig = item.rig;

      if (e.state === 'cleansed') {
        e.timer -= dt;
        rig.root.scale.multiplyScalar(Math.max(0, 1 - dt * 3));
        if (e.timer <= 0) {
          this.scene.remove(rig.root);
          this.enemies.splice(i, 1);
          continue;
        }
        continue;
      }

      e.x += e.vx * dt;
      e.z += e.vz * dt;
      e.vx *= 0.88;
      e.vz *= 0.88;

      if (e.state === 'stunned') {
        e.timer -= dt;
        rig.root.rotation.z = Math.sin(this.elapsedTime * 32 + i) * 0.22;
        rig.root.position.set(e.x, getGroundHeight(e.x, e.z), e.z);
        if (e.timer <= 0) {
          e.state = 'chase';
          rig.root.rotation.z = 0;
        }
        continue;
      }

      // Repel enemies from the Cozy Home Base Sanctuary Safe Zone!
      const distToHome = distance(e.x, e.z, GAME_CONSTANTS.HOME_BASE_X, GAME_CONSTANTS.HOME_BASE_Z);
      if (distToHome < GAME_CONSTANTS.HOME_BASE_SAFE_RADIUS + 1.0) {
        const pushDx = (e.x - GAME_CONSTANTS.HOME_BASE_X) / Math.max(0.1, distToHome);
        const pushDz = (e.z - GAME_CONSTANTS.HOME_BASE_Z) / Math.max(0.1, distToHome);
        e.x = GAME_CONSTANTS.HOME_BASE_X + pushDx * (GAME_CONSTANTS.HOME_BASE_SAFE_RADIUS + 1.05);
        e.z = GAME_CONSTANTS.HOME_BASE_Z + pushDz * (GAME_CONSTANTS.HOME_BASE_SAFE_RADIUS + 1.05);
      }

      // In Stage 3 (Heart-Tree Defense), critters march toward the central Heart-Tree (0, 0) unless Pip is close!
      const isDefenseMode = this.missionState.mode === 'heart_tree_defense';
      const distToPlayer = distance(e.x, e.z, pX, pZ);
      const distToTree = distance(e.x, e.z, 0, 0);
      const targetPosX = isDefenseMode && distToPlayer > 7.5 ? 0 : pX;
      const targetPosZ = isDefenseMode && distToPlayer > 7.5 ? 0 : pZ;
      const distToTarget = Math.max(0.1, distance(e.x, e.z, targetPosX, targetPosZ));
      const effSpeed = e.speed * weatherSpeedMultiplier;

      if (isDefenseMode && distToTree <= 2.5) {
        this.missionState.heartTreeHp = Math.max(15, this.missionState.heartTreeHp - dt * 1.6);
      }

      if (e.type === 'puffer') {
        if (!playerInSafeZone && distToTarget > 1.2) {
          const dx = (targetPosX - e.x) / distToTarget;
          const dz = (targetPosZ - e.z) / distToTarget;
          e.x += dx * effSpeed * dt;
          e.z += dz * effSpeed * dt;
          rig.root.rotation.y = Math.atan2(dx, dz);
        } else if (!playerInSafeZone && distToPlayer <= 1.2) {
          this.hitPlayer(1, 'puffer', false, e.x, e.z);
        }
        const hop = Math.abs(Math.sin(this.elapsedTime * 7 + i)) * 0.4;
        rig.root.position.set(e.x, getGroundHeight(e.x, e.z) + hop, e.z);
      } else if (e.type === 'roller') {
        const rRig = rig as ReturnType<typeof createRollerModel>;

        if (e.state === 'chase') {
          const dx = (targetPosX - e.x) / distToTarget;
          const dz = (targetPosZ - e.z) / distToTarget;
          rig.root.rotation.y = Math.atan2(dx, dz);

          if (!playerInSafeZone && distToPlayer < 9.0) {
            e.state = 'windup';
            e.telegraphTimer = 0.65;
            e.targetX = pX;
            e.targetZ = pZ;
          } else if (!playerInSafeZone) {
            e.x += dx * effSpeed * dt;
            e.z += dz * effSpeed * dt;
          }
          (rRig.telegraph.material as THREE.MeshBasicMaterial).opacity = 0;
        } else if (e.state === 'windup') {
          e.telegraphTimer -= dt;
          const mat = rRig.telegraph.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.4 + Math.sin(this.elapsedTime * 25) * 0.3;

          if (e.telegraphTimer <= 0) {
            e.state = 'attack';
            e.timer = 0.75;
            const dirX =
              (e.targetX - e.x) / Math.max(0.1, distance(e.x, e.z, e.targetX, e.targetZ));
            const dirZ =
              (e.targetZ - e.z) / Math.max(0.1, distance(e.x, e.z, e.targetX, e.targetZ));
            e.vx = dirX * 14.0 * weatherSpeedMultiplier;
            e.vz = dirZ * 14.0 * weatherSpeedMultiplier;
            mat.opacity = 0;
          }
        } else if (e.state === 'attack') {
          e.timer -= dt;
          rRig.ball.rotation.x += dt * 25;
          if (!playerInSafeZone && distToPlayer < 1.4) {
            this.hitPlayer(1, 'roller', true, e.x, e.z);
          }
          if (e.timer <= 0) {
            e.state = 'chase';
          }
        }

        rig.root.position.set(e.x, getGroundHeight(e.x, e.z), e.z);
      } else if (e.type === 'sprite') {
        const sRig = rig as ReturnType<typeof createSpriteModel>;
        sRig.wings.rotation.y = Math.sin(this.elapsedTime * 20) * 0.4;

        const floatY = 1.6 + Math.sin(this.elapsedTime * 4 + i) * 0.25;
        const idealDist = isDefenseMode ? 2.2 : 7.5;
        const diff = distToTarget - idealDist;
        const dx = (targetPosX - e.x) / distToTarget;
        const dz = (targetPosZ - e.z) / distToTarget;

        if (Math.abs(diff) > 1.0) {
          e.x += dx * Math.sign(diff) * effSpeed * dt;
          e.z += dz * Math.sign(diff) * effSpeed * dt;
        }

        e.x += -dz * effSpeed * 0.4 * dt;
        e.z += dx * effSpeed * 0.4 * dt;

        rig.root.rotation.y = Math.atan2(dx, dz);
        rig.root.position.set(e.x, getGroundHeight(e.x, e.z) + floatY, e.z);

        e.timer += dt;
        if (!playerInSafeZone && e.timer >= 3.4 && distToPlayer < 14) {
          e.timer = 0;
          this.spawnSparkProjectile(e.x, getGroundHeight(e.x, e.z) + floatY, e.z, dx, dz);
        }
      }

      // Resolve enemy collisions against procedural mid-field obstacles
      const enemyObsRes = resolveStageObstacleCollisions(
        e.x,
        e.z,
        0.5,
        this.missionState.mapLayout.obstacles
      );
      e.x = enemyObsRes.x;
      e.z = enemyObsRes.z;
    }

    const activeEnemies = this.enemies.filter((item) => item.state.state !== 'cleansed').length;
    if (this.gameState === 'playing') {
      if (this.missionState.mode === 'heart_tree_defense') {
        if (activeEnemies === 0 && this.missionState.currentCount < this.missionState.targetCount) {
          this.spawnEnemies(3);
        }
      } else if (activeEnemies < 3) {
        this.spawnEnemies(2);
      }
    }
  }

  private spawnSparkProjectile(x: number, y: number, z: number, dirX: number, dirZ: number): void {
    const geo = new THREE.SphereGeometry(0.2, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xc77dff });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);

    this.projectiles.push({
      mesh,
      x,
      y,
      z,
      vx: dirX * 5.5,
      vy: 0,
      vz: dirZ * 5.5,
      life: 3.5,
    });
  }

  private updateProjectiles(dt: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.z += p.vz * dt;
      p.mesh.position.set(p.x, p.y, p.z);

      // Dissolve projectiles if they touch the Home Base Safe Zone
      if (isInsideHomeBaseSafeZone(p.x, p.z)) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
        continue;
      }

      if (p.isReflected) {
        // Reflected projectiles damage and stagger enemies or the Sovereign Boss!
        let hitReflectedTarget = false;
        for (const item of this.enemies) {
          const e = item.state;
          if (e.state === 'cleansed') continue;
          if (distance(p.x, p.z, e.x, e.z) <= 1.35) {
            const hitRes = damageEnemy(e, 2.4, 1.8);
            item.state = hitRes.enemy;
            this.particles.spawn(p.x, p.y, p.z, 1.0, 0.85, 0.25, 16);
            this.spawnFloatingText(
              e.x,
              getGroundHeight(e.x, e.z) + 1.4,
              e.z,
              'DEFLECT HIT 240!',
              'parry'
            );
            if (hitRes.wasCleansed) {
              this.onEnemyCleansed(e.x, e.z, 220);
            }
            hitReflectedTarget = true;
            break;
          }
        }

        if (
          !hitReflectedTarget &&
          !this.bossCleansed &&
          this.missionState.mode === 'boss_duel' &&
          distance(p.x, p.z, 0, 0) <= 2.4
        ) {
          this.bossHp = Math.max(0, this.bossHp - 2.5);
          this.particles.spawn(0, 2.0, 0, 1.0, 0.85, 0.25, 18);
          this.spawnFloatingText(0, 3.2, 0, 'DEFLECT HIT 250!', 'parry');
          if (this.bossHp <= 0) {
            this.cleanseBoss();
          }
          hitReflectedTarget = true;
        }

        if (hitReflectedTarget || p.life <= 0) {
          this.scene.remove(p.mesh);
          this.projectiles.splice(i, 1);
        }
        continue;
      }

      const d = distance(p.x, p.z, this.playerPos.x, this.playerPos.z);
      if (this.player.parryWindowRemaining > 0 && d <= GAME_CONSTANTS.PARRY_DEFLECT_RADIUS) {
        const len = Math.max(0.1, d);
        this.executeSuccessfulParry(
          'projectile',
          false,
          (this.playerPos.x - p.x) / len,
          (this.playerPos.z - p.z) / len
        );
        continue;
      }

      if (d <= 1.0) {
        this.hitPlayer(1, 'projectile', false, p.x, p.z);
        this.particles.spawn(p.x, p.y, p.z, 0.8, 0.4, 0.9, 10);
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
        continue;
      }

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateBoss(dt: number): void {
    if (!this.bossRig) return;
    if (this.bossCleansed) {
      this.bossRig.branches.rotation.y += dt * 0.35;
      return;
    }

    // Multi-Phase Boss Transition: Enter Phase 2 (Cosmic Enrage) below 50% HP
    const nextPhase: 1 | 2 = this.bossHp <= this.bossMaxHp * 0.5 ? 2 : 1;
    if (nextPhase !== this.bossPhase) {
      this.bossPhase = nextPhase;
      if (nextPhase === 2) {
        (this.bossRig.core.material as THREE.MeshStandardMaterial).emissive.setHex(0xff2a5f);
        this.bossRig.eyeMat.color.setHex(0xffbe0b);
        this.bossRig.eyeMat.emissive.setHex(0xff0055);
        this.particles.spawn(0, 2.4, 0, 1.0, 0.2, 0.4, 36, 6.5);
      }
    }

    const speedMult = this.bossPhase === 2 ? 1.85 : 1.0;
    this.bossRig.branches.rotation.y = Math.sin(this.elapsedTime * 0.8 * speedMult) * 0.28;
    this.bossRig.leftArm.rotation.x = Math.sin(this.elapsedTime * 2.0 * speedMult) * 0.26;
    this.bossRig.rightArm.rotation.x = -Math.sin(this.elapsedTime * 2.0 * speedMult) * 0.26;
    this.bossRig.shieldRing.rotation.z += dt * 0.95 * speedMult;

    const pulse = 0.55 + Math.sin(this.elapsedTime * 3.5 * speedMult) * 0.38;
    (this.bossRig.core.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;

    // In Phase 2 during Boss Duel, emit periodic Cosmic Shockwave rings if not stunned
    if (
      this.missionState.mode === 'boss_duel' &&
      this.bossPhase === 2 &&
      this.missionState.bossStunRemaining <= 0
    ) {
      this.bossShockwaveTimer += dt;
      if (this.bossShockwaveTimer >= 5.2) {
        this.bossShockwaveTimer = 0;
        this.particles.spawn(0, 1.0, 0, 1.0, 0.25, 0.5, 28, 7.0);
        const dPlayer = distance(this.playerPos.x, this.playerPos.z, 0, 0);
        if (dPlayer <= 5.4 && !this.isDashing) {
          this.hitPlayer(1, 'boss', true, 0, 0);
        }
      }
    }
  }

  private hitPlayer(
    damageAmount: number,
    sourceType?: EnemyType | 'projectile',
    isHeavyAttack?: boolean,
    attackerX?: number,
    attackerZ?: number
  ): void {
    if (isInsideHomeBaseSafeZone(this.playerPos.x, this.playerPos.z)) return;

    // If the player has an active Astral Aegis Parry window, deflect the incoming attack!
    if (this.player.parryWindowRemaining > 0) {
      const dx = attackerX !== undefined ? this.playerPos.x - attackerX : 0;
      const dz = attackerZ !== undefined ? this.playerPos.z - attackerZ : 1;
      const len = Math.max(0.1, Math.hypot(dx, dz));
      this.executeSuccessfulParry(sourceType, isHeavyAttack, dx / len, dz / len);
      return;
    }

    const res = applyDamageToPlayer(this.player, damageAmount);
    if (res.tookDamage) {
      this.player = res.player;
      this.damageTakenTotal += damageAmount;
      sound.playPlayerHurt();
      this.hitstopTimer = 0.05;
      this.cameraTrauma = Math.min(1.0, this.cameraTrauma + 0.4);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 30, 40]);
      }

      if (this.player.hp <= 0) {
        this.gameState = 'gameover';
        document.body.dataset.state = 'gameover';
        sound.stopAmbientBgm();
        const summary = calculateRunSummary(
          this.player.score,
          this.totalEnemiesCleansed,
          this.elapsedTime,
          this.damageTakenTotal
        );
        this.dispatchHUD(summary);
      }
    }
  }

  private updateSproutBuddy(dt: number): void {
    if (!this.sproutBuddyRig) return;

    this.sproutBuddyState = computeSproutBuddyUpdate({
      buddy: this.sproutBuddyState,
      playerX: this.playerPos.x,
      playerZ: this.playerPos.z,
      playerFacing: this.playerFacing,
      sunSeeds: this.player.sunSeeds,
      elapsedTime: this.elapsedTime,
      dt,
      pickups: this.pickups,
      shrines: this.shrines,
      missionState: this.missionState,
    });

    const bx = this.sproutBuddyState.x;
    const bz = this.sproutBuddyState.z;
    const groundY = getGroundHeight(bx, bz);
    const floatBob = Math.sin(this.elapsedTime * 5.2) * 0.14;

    this.sproutBuddyRig.root.position.set(bx, groundY, bz);
    this.sproutBuddyRig.bodyGroup.position.y = 1.22 + floatBob;
    this.sproutBuddyRig.root.rotation.y = this.sproutBuddyState.facingY;

    // Wing flutter & antenna spin
    const wingAngle = Math.sin(this.elapsedTime * 24) * 0.48;
    this.sproutBuddyRig.leftWing.rotation.y = Math.PI - 0.35 - wingAngle;
    this.sproutBuddyRig.rightWing.rotation.y = 0.35 + wingAngle;
    this.sproutBuddyRig.antennaOrb.rotation.y += dt * 3.5;
    this.sproutBuddyRig.orbitRing.rotation.z += dt * 2.4;

    // Update 3D Highlighting Beacon over nearby Sun-Seed or Shrine component
    if (
      this.sproutBuddyState.isHighlighting &&
      this.sproutBuddyState.targetX !== null &&
      this.sproutBuddyState.targetZ !== null
    ) {
      const tx = this.sproutBuddyState.targetX;
      const tz = this.sproutBuddyState.targetZ;
      const ty = getGroundHeight(tx, tz);
      const isSeed = this.sproutBuddyState.targetType === 'seed';
      this.sproutBuddyRig.setHighlightColor(isSeed ? 0xffd166 : 0x06d6a0);
      this.sproutBuddyRig.highlightGroup.visible = true;
      this.sproutBuddyRig.highlightGroup.position.set(tx, ty, tz);

      const pulse = 1 + Math.sin(this.elapsedTime * 6.0) * 0.16;
      this.sproutBuddyRig.beaconRing.scale.set(pulse, pulse, 1);
      this.sproutBuddyRig.beaconInnerRing.rotation.z -= dt * 2.2;
      this.sproutBuddyRig.beaconBeam.rotation.y += dt * 1.5;
    } else {
      this.sproutBuddyRig.highlightGroup.visible = false;
    }
  }

  /**
   * Pre-allocates pooled 3D Shattering Crystal Shards (Octahedron splinters)
   * and 8 Hexagonal Upward Astral Energy Pillars for zero-GC 60fps parry shockwaves.
   */
  private initParryShockwavePools(): void {
    const shardGeo = new THREE.OctahedronGeometry(0.16, 0);
    shardGeo.scale(0.65, 1.75, 0.65);

    for (let i = 0; i < 48; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.35,
        roughness: 0.12,
        metalness: 0.85,
        transparent: true,
        opacity: 0,
      });
      const mesh = new THREE.Mesh(shardGeo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.crystalShards.push({
        mesh,
        mat,
        vx: 0,
        vy: 0,
        vz: 0,
        rotVelX: 0,
        rotVelY: 0,
        rotVelZ: 0,
        life: 0,
        maxLife: 0.55,
        baseScale: 1,
      });
    }

    const pillarGeo = new THREE.CylinderGeometry(0.16, 0.3, 1.0, 6, 1, true);
    pillarGeo.translate(0, 0.5, 0);

    for (let i = 0; i < 8; i++) {
      const isGold = i % 2 === 0;
      const mat = new THREE.MeshBasicMaterial({
        color: isGold ? 0xffd166 : 0x38bdf8,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(pillarGeo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.energyPillars.push({
        mesh,
        mat,
        angle: (i / 8) * Math.PI * 2,
        startRadius: 1.25,
        endRadius: 3.9,
        centerX: 0,
        centerY: 0,
        centerZ: 0,
        life: 0,
        maxLife: 0.52,
        targetHeight: 3.8,
      });
    }
  }

  /**
   * Triggers a radial burst of shattering crystal shards AND 8 upward astral energy pillars around the player,
   * colored by the deflected Gloomling's Elemental Infusion ('forest' | 'frost' | 'sun' | 'void') and scaled by attack weight.
   */
  private spawnParryShockwaveVisuals(
    cx: number,
    cy: number,
    cz: number,
    element: ElementalInfusionType = 'void',
    shardCount: number = 28,
    pillarHeightScale: number = 1.0
  ): void {
    const palette = getElementalInfusionPalette(element);

    // 1. Erupt elemental shattering crystal shards radially from the Warden's Aegis Ward
    this.spawnCrystalShatterBurst(cx, cy + 0.95, cz, shardCount, element, pillarHeightScale);

    // 2. Surge 8 upward elemental energy pillars in an expanding octagonal ring
    for (let i = 0; i < this.energyPillars.length; i++) {
      const p = this.energyPillars[i];
      p.angle = (i / this.energyPillars.length) * Math.PI * 2 + this.playerFacing;
      p.centerX = cx;
      p.centerY = cy;
      p.centerZ = cz;
      p.startRadius = 1.2;
      p.endRadius = 3.85 * Math.max(0.85, Math.min(1.3, pillarHeightScale));
      p.maxLife = 0.52;
      p.life = p.maxLife;
      p.targetHeight = (3.6 + (i % 2) * 0.65) * pillarHeightScale;
      p.mat.color.setHex(i % 2 === 0 ? palette.pillarPrimaryHex : palette.pillarSecondaryHex);
      p.mat.opacity = 0.9;
      p.mesh.visible = true;
      p.mesh.position.set(
        cx + Math.cos(p.angle) * p.startRadius,
        cy + 0.05,
        cz + Math.sin(p.angle) * p.startRadius
      );
      p.mesh.scale.set(0.85, 0.2, 0.85);
    }
  }

  /**
   * Spawns faceted 3D crystal shards erupting outward with 3-axis angular tumble,
   * dynamically colored by the Elemental Infusion ('forest' green, 'frost' blue, 'sun' red/gold, 'void' violet/gold).
   */
  private spawnCrystalShatterBurst(
    cx: number,
    cy: number,
    cz: number,
    count: number,
    elementOrPrismatic: ElementalInfusionType | boolean = 'void',
    weightScale: number = 1.0
  ): void {
    const resolvedElement: ElementalInfusionType =
      typeof elementOrPrismatic === 'boolean'
        ? elementOrPrismatic
          ? 'void'
          : 'sun'
        : elementOrPrismatic;
    const palette = getElementalInfusionPalette(resolvedElement).crystalPaletteHex;
    const clampedWeight = Math.max(0.8, Math.min(1.45, weightScale));

    let spawned = 0;
    for (let i = 0; i < this.crystalShards.length && spawned < count; i++) {
      const s = this.crystalShards[i];
      if (s.life > 0.08) continue;

      const angle = (spawned / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
      const speed = (5.6 + Math.random() * 7.6) * clampedWeight;
      const colorHex = palette[spawned % palette.length];

      s.mat.color.setHex(colorHex);
      s.mat.emissive.setHex(colorHex);
      s.mat.opacity = 1.0;
      s.vx = Math.cos(angle) * speed;
      s.vz = Math.sin(angle) * speed;
      s.vy = (3.4 + Math.random() * 4.8) * clampedWeight;
      s.rotVelX = (Math.random() - 0.5) * 22;
      s.rotVelY = (Math.random() - 0.5) * 22;
      s.rotVelZ = (Math.random() - 0.5) * 22;
      s.maxLife = 0.46 + Math.random() * 0.22;
      s.life = s.maxLife;
      s.baseScale = (0.75 + Math.random() * 0.65) * clampedWeight;

      s.mesh.position.set(
        cx + Math.cos(angle) * 0.45,
        cy + (Math.random() - 0.3) * 0.4,
        cz + Math.sin(angle) * 0.45
      );
      s.mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      s.mesh.scale.setScalar(s.baseScale);
      s.mesh.visible = true;
      spawned++;
    }
  }

  private updateParryShockwaveVisuals(dt: number): void {
    // 1. Update tumbling 3D crystal shards
    for (let i = 0; i < this.crystalShards.length; i++) {
      const s = this.crystalShards[i];
      if (s.life <= 0) continue;

      s.life -= dt;
      if (s.life <= 0) {
        s.mesh.visible = false;
        s.mat.opacity = 0;
        continue;
      }

      const ratio = s.life / s.maxLife;
      s.vy -= 14.5 * dt;
      s.mesh.position.x += s.vx * dt;
      s.mesh.position.y = Math.max(0.08, s.mesh.position.y + s.vy * dt);
      s.mesh.position.z += s.vz * dt;
      s.mesh.rotation.x += s.rotVelX * dt;
      s.mesh.rotation.y += s.rotVelY * dt;
      s.mesh.rotation.z += s.rotVelZ * dt;
      s.mesh.scale.setScalar(s.baseScale * Math.max(0.15, ratio));
      s.mat.opacity = Math.min(1, ratio * 1.25);
    }

    // 2. Update surging upward astral energy pillars
    for (let i = 0; i < this.energyPillars.length; i++) {
      const p = this.energyPillars[i];
      if (p.life <= 0) continue;

      p.life -= dt;
      if (p.life <= 0) {
        p.mesh.visible = false;
        p.mat.opacity = 0;
        continue;
      }

      const progress = 1 - p.life / p.maxLife;
      const curRadius = p.startRadius + (p.endRadius - p.startRadius) * Math.pow(progress, 0.65);
      const curAngle = p.angle + progress * 0.75;
      p.mesh.position.set(
        p.centerX + Math.cos(curAngle) * curRadius,
        p.centerY + 0.05,
        p.centerZ + Math.sin(curAngle) * curRadius
      );
      p.mesh.rotation.y += dt * 6.5;

      const heightEnvelope = Math.sin(Math.min(1, progress * 1.35) * Math.PI);
      const widthScale = Math.max(0.2, 1.15 - progress * 0.75);
      p.mesh.scale.set(widthScale, Math.max(0.2, p.targetHeight * heightEnvelope), widthScale);
      p.mat.opacity = Math.max(0, (1 - progress) * 0.88);
    }
  }

  private updateCamera(dt: number): void {
    // Camera Zoom Punch on Perfect Parry / Riposte scaled by incoming attack weight
    let punchZoomFactor = 0;
    if (this.cameraPunchTimer > 0) {
      this.cameraPunchTimer = Math.max(0, this.cameraPunchTimer - dt);
      const norm = this.cameraPunchTimer / Math.max(0.15, this.cameraPunchMaxDuration);
      punchZoomFactor = Math.sin(norm * Math.PI) * this.cameraPunchZoom;
    }

    // Decay directional parry recoil kick smoothly
    this.parryRecoilX *= Math.max(0, 1 - dt * 10);
    this.parryRecoilZ *= Math.max(0, 1 - dt * 10);

    const targetCamX =
      this.playerPos.x + this.cameraOffset.x * (1 - punchZoomFactor) + this.parryRecoilX;
    const targetCamY = this.playerPos.y + this.cameraOffset.y * (1 - punchZoomFactor * 0.85);
    const targetCamZ =
      this.playerPos.z + this.cameraOffset.z * (1 - punchZoomFactor) + this.parryRecoilZ;

    const factor = 1 - Math.exp(-(this.cameraPunchTimer > 0 ? 14 : 6) * dt);
    this.camera.position.x += (targetCamX - this.camera.position.x) * factor;
    this.camera.position.y += (targetCamY - this.camera.position.y) * factor;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * factor;

    if (this.cameraTrauma > 0) {
      this.cameraTrauma = Math.max(0, this.cameraTrauma - dt * 1.75);
      // Scale screen-shake amplitude with parryShakeIntensity so heavy attacks feel significantly heavier
      const weightBoost = 0.42 + Math.max(this.parryShakeIntensity, this.cameraTrauma) * 0.48;
      const shake = this.cameraTrauma * this.cameraTrauma * weightBoost;
      this.camera.position.x += (Math.random() - 0.5) * shake;
      this.camera.position.y += (Math.random() - 0.5) * shake;
      this.camera.position.z += (Math.random() - 0.5) * shake * 0.45;
    }

    if (this.parryShakeIntensity > 0) {
      this.parryShakeIntensity = Math.max(0, this.parryShakeIntensity - dt * 1.45);
    }

    this.camera.lookAt(this.playerPos.x, this.playerPos.y + 1.2, this.playerPos.z);
    this.updateFloatingTexts(dt);
  }

  private spawnFloatingText(
    x: number,
    y: number,
    z: number,
    text: string,
    type: 'normal' | 'crit' | 'finisher' | 'dodge' | 'parry' | 'heal' | 'shard',
    subtext?: string
  ): void {
    this.floatingTextItems.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      x: x + (Math.random() - 0.5) * 0.4,
      y,
      z: z + (Math.random() - 0.5) * 0.4,
      text,
      subtext,
      type,
      age: 0,
      maxAge: 0.95,
    });
    if (this.floatingTextItems.length > 14) {
      this.floatingTextItems.shift();
    }
  }

  private updateFloatingTexts(dt: number): void {
    for (let i = this.floatingTextItems.length - 1; i >= 0; i--) {
      const item = this.floatingTextItems[i];
      item.age += dt;
      item.y += dt * 1.45;
      if (item.age >= item.maxAge) {
        this.floatingTextItems.splice(i, 1);
      }
    }
  }

  private dispatchHUD(summary?: { finalScore: number; stars: number; timeFormatted: string }): void {
    let isNearShrine = false;
    let nearShrinePrompt = '';
    const px = this.playerPos.x;
    const pz = this.playerPos.z;
    const mode = this.missionState.mode;

    if (mode === 'rescue_escort') {
      for (const sp of this.missionState.lostSprouts) {
        if (sp.state === 'caged' && distance(px, pz, sp.cageX, sp.cageZ) <= GAME_CONSTANTS.SHRINE_INTERACT_RADIUS) {
          isNearShrine = true;
          nearShrinePrompt = 'Break Bramble Cage [Space / E] to free the Lost Sproutling!';
          break;
        }
      }
    } else if (mode === 'harmonic_bells') {
      for (const bell of this.missionState.bells) {
        if (!bell.isRung && distance(px, pz, bell.x, bell.z) <= GAME_CONSTANTS.SHRINE_INTERACT_RADIUS) {
          isNearShrine = true;
          nearShrinePrompt = 'Ring Ancient Chime Bell [Space / E] to light the Crystal Bridge!';
          break;
        }
      }
      if (!isNearShrine && this.missionState.allBellsRung && distance(px, pz, 0, 0) <= 5.5) {
        isNearShrine = true;
        nearShrinePrompt = 'Enter Central Sakura Pavilion [Space / E] to complete the stage!';
      }
    } else if (mode === 'heart_tree_defense') {
      for (const totem of this.missionState.totems) {
        if (totem.cooldown <= 0 && distance(px, pz, totem.x, totem.z) <= GAME_CONSTANTS.SHRINE_INTERACT_RADIUS) {
          isNearShrine = true;
          nearShrinePrompt = 'Trigger Healing Pulse Totem [Space / E] to heal the Heart-Tree & repel critters!';
          break;
        }
      }
    } else if (mode === 'boss_duel') {
      for (const shrine of this.shrines) {
        if (!shrine.isRestored && distance(px, pz, shrine.x, shrine.z) <= GAME_CONSTANTS.SHRINE_INTERACT_RADIUS) {
          isNearShrine = true;
          nearShrinePrompt = 'Activate Starlight Pillar [Space / E] to stun the Boss (No Seeds Needed)!';
          break;
        }
      }
    }

    const restoredCount = this.shrines.filter((s) => s.isRestored).length;
    const envState = computeDayNightState(this.timeOfDay);
    const weatherMods = getWeatherGameplayModifiers(this.currentWeather);
    const isInsideSafeZone = isInsideHomeBaseSafeZone(this.playerPos.x, this.playerPos.z);
    const stageObjective = computeStageObjectiveGuide({
      playerX: this.playerPos.x,
      playerZ: this.playerPos.z,
      sunSeeds: this.player.sunSeeds,
      shrines: this.shrines,
      bossHp: this.bossHp,
      bossMaxHp: this.bossMaxHp,
      bossCleansed: this.bossCleansed,
      chapterNumber: this.currentChapterNumber,
      missionState: this.missionState,
    });

    this.onHUDUpdate({
      gameState: this.gameState,
      player: { ...this.player },
      shrines: this.shrines.map((s) => ({ ...s })),
      totalShrines: this.shrines.length,
      restoredShrines: restoredCount,
      cleansedEnemiesCount: this.totalEnemiesCleansed,
      elapsedTime: this.elapsedTime,
      isNearShrine,
      nearShrinePrompt,
      isInsideSafeZone,
      isMuted: sound.isMuted,
      weather: this.currentWeather,
      weatherDescription: weatherMods.description,
      timePhase: envState.phase,
      timeOfDay: this.timeOfDay,
      autoDayNight: this.autoDayNight,
      characterCustom: { ...this.characterCustom },
      homeBaseCustom: { ...this.homeBaseCustom },
      trophies: this.getCurrentTrophies(),
      chapterInfo: generateChapterInfo(this.currentChapterNumber),
      bossHp: this.bossHp,
      bossMaxHp: this.bossMaxHp,
      bossCleansed: this.bossCleansed,
      stageObjective,
      missionState: {
        ...this.missionState,
        lostSprouts: this.missionState.lostSprouts.map((s) => ({ ...s })),
        bells: this.missionState.bells.map((b) => ({ ...b })),
        totems: this.missionState.totems.map((t) => ({ ...t })),
        meteors: this.missionState.meteors.map((m) => ({ ...m })),
        boostPads: this.missionState.boostPads.map((p) => ({ ...p })),
      },
      currentStoryBeat: this.currentStoryBeat,
      storyHistory: [...this.storyHistory],
      performanceQuality: this.performanceQuality,
      dailyQuests: this.dailyQuests.map((q) => ({ ...q })),
      dailyQuestsDateKey: this.dailyQuestsDateKey,
      sproutBuddy: { ...this.sproutBuddyState },
      heroMastery: {
        ...this.heroMastery,
        unlockedWeapons: [...this.heroMastery.unlockedWeapons],
      },
      bossPhase: this.bossPhase,
      floatingTexts: this.floatingTextItems.map((ft) => {
        this.projVec.set(ft.x, ft.y, ft.z).project(this.camera);
        const screenX = Math.max(8, Math.min(92, (this.projVec.x * 0.5 + 0.5) * 100));
        const screenY = Math.max(12, Math.min(86, (-this.projVec.y * 0.5 + 0.5) * 100));
        return {
          id: ft.id,
          text: ft.text,
          subtext: ft.subtext,
          type: ft.type,
          screenX,
          screenY,
          opacity: Math.max(0, 1 - ft.age / ft.maxAge),
        };
      }),
      floatingCombatTexts: this.floatingTextItems.map((ft) => {
        this.projVec.set(ft.x, ft.y, ft.z).project(this.camera);
        const screenX = Math.max(8, Math.min(92, (this.projVec.x * 0.5 + 0.5) * 100));
        const screenY = Math.max(12, Math.min(86, (-this.projVec.y * 0.5 + 0.5) * 100));
        return {
          id: ft.id,
          text: ft.text,
          subtext: ft.subtext,
          type: ft.type,
          screenX,
          screenY,
          opacity: Math.max(0, 1 - ft.age / ft.maxAge),
        };
      }),
      radar: {
        playerX: this.playerPos.x,
        playerZ: this.playerPos.z,
        playerFacing: this.playerFacing,
        playerRotationY: this.playerFacing,
        sanctuaryX: GAME_CONSTANTS.HOME_BASE_X,
        sanctuaryZ: GAME_CONSTANTS.HOME_BASE_Z,
        enemies: this.enemies
          .filter((item) => item.state.state !== 'cleansed')
          .map((item) => ({
            x: item.state.x,
            z: item.state.z,
            type: item.state.type,
            kind:
              item.state.type === 'puffer'
                ? 'charger'
                : item.state.type === 'roller'
                ? 'roller'
                : 'ranged',
            isWindup: item.state.state === 'windup' || item.state.state === 'attack',
          })),
        pickups: this.pickups.map((p) => ({ x: p.x, z: p.z })),
        shrines: this.shrines.map((s) => ({
          x: s.x,
          z: s.z,
          isRestored: s.isRestored,
          restored: s.isRestored,
        })),
        boss:
          this.missionState.mode === 'boss_duel' && !this.bossCleansed
            ? { x: 0, z: 0 }
            : null,
        targetX: stageObjective.targetX,
        targetZ: stageObjective.targetZ,
      },
      parryFlashIntensity: this.parryFlashIntensity,
      parryFlashType: this.parryFlashType,
      parryFlashElement:
        this.parryFlashElement !== 'none'
          ? this.parryFlashElement
          : this.player.activeElementalInfusion,
      parryShakeIntensity: Math.max(this.parryShakeIntensity, this.player.parryShakeIntensity || 0),
      parryWeightTier: this.player.lastParryWeightTier,
      gamepadConnected: this.gamepadConnected,
      finalSummary: summary,
    });
  }

  public destroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.haptics.destroy();
    sound.stopAmbientBgm();
    this.renderer.dispose();
  }
}

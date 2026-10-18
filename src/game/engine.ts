/**
 * Core 60fps Three.js simulation engine for Sproutling: Grove Guardian 3D.
 * Integrates:
 * - Character Customization Rig (Body types, hairstyles, hair colors, facial features, outfits)
 * - Dynamic Day/Night Cycle & Weather System (Sunshine, Rain, Snow, Petals + gameplay modifiers)
 * - Cozy Customizable Home Base Safe Zone & Trophy Pedestals
 * - Google Play AdMob Rewarded Blessings & Second-Wind Revive
 */

import * as THREE from 'three';
import {
  createHeroModel,
  createHomeBaseModel,
  createPufferModel,
  createRollerModel,
  createSpriteModel,
  createShrineModel,
  createBossModel,
  createSunSeedModel,
  type HeroRig,
  type HomeBaseRig,
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
  computeStageObjectiveGuide,
  getInGameStoryBeat,
  getTodayDateKey,
  generateDailyQuests,
  advanceDailyQuestProgress,
  claimDailyQuestReward,
  getGraphicsQualityProfile,
  distance,
  DEFAULT_CUSTOMIZATION,
  DEFAULT_HOME_BASE,
  GAME_CONSTANTS,
  type PlayerStats,
  type Shrine,
  type EnemyState,
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
} from './rules';
import { sound } from './audio';

export type GameState = 'title' | 'playing' | 'paused' | 'victory' | 'gameover';
export type CameraFocusMode = 'gameplay' | 'customize-hero' | 'customize-home';

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
  currentStoryBeat: InGameStoryBeat | null;
  storyHistory: InGameStoryBeat[];
  performanceQuality: PerformanceQuality;
  dailyQuests: DailyQuest[];
  dailyQuestsDateKey: string;
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
  interactPressed: boolean;
}

const CHAR_STORAGE_KEY = 'sproutling_char_custom_v1';
const HOME_STORAGE_KEY = 'sproutling_home_custom_v1';
const CHAPTER_STORAGE_KEY = 'sproutling_chapter_num_v1';
const DAILY_QUESTS_STORAGE_KEY = 'sproutling_daily_quests_v1';
const QUALITY_STORAGE_KEY = 'sproutling_perf_quality_v1';

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

  // Customization, Home Base, Infinite Chapter & Daily Quests State
  private characterCustom: CharacterCustomization = { ...DEFAULT_CUSTOMIZATION };
  private homeBaseCustom: HomeBaseCustomization = { ...DEFAULT_HOME_BASE };
  private homeBaseRig!: HomeBaseRig;
  private currentChapterNumber = 1;
  private performanceQuality: PerformanceQuality = 'high';
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
  private playerPos = new THREE.Vector3(0, 0, 11);
  private playerVel = new THREE.Vector3();
  private playerFacing = 0;
  private isDashing = false;
  private dashTimer = 0;
  private dashDir = new THREE.Vector3();
  private attackAnimTimer = 0;
  private currentComboStep = 0;
  private spinAnimTimer = 0;
  private walkCycle = 0;
  private damageTakenTotal = 0;
  private totalEnemiesCleansed = 0;
  private elapsedTime = 0;

  // Hitstop & Camera Juice
  private hitstopTimer = 0;
  private cameraTrauma = 0;
  private cameraOffset = new THREE.Vector3(0, 9.5, 12.5);
  private titleTourAngle = 0;

  // Particles
  private particles!: ParticlePool;

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
  private currentStoryBeat: InGameStoryBeat | null = null;
  private storyHistory: InGameStoryBeat[] = [];
  private triggeredStoryEvents = new Set<StoryTriggerEvent>();

  // Shrines
  private shrines: Shrine[] = [];
  private shrineRigs: ReturnType<typeof createShrineModel>[] = [];

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
  }[] = [];

  // Inputs
  private keysHeld = new Set<string>();
  public touchInputs: TouchInputState = {
    moveX: 0,
    moveY: 0,
    bonkPressed: false,
    dashPressed: false,
    spinPressed: false,
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
        this.performanceQuality = cores >= 8 ? 'ultra' : cores >= 6 ? 'high' : 'balanced';
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

  public setCameraFocusMode(mode: CameraFocusMode): void {
    this.cameraFocusMode = mode;
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

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isHeadless,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isHeadless;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.canvasContainer.innerHTML = '';
    this.canvasContainer.appendChild(this.renderer.domElement);
  }

  private setupWorld(): void {
    this.lightingRig = setupLighting(this.scene, this.isHeadless);
    this.environmentRig = buildEnvironment(this.scene);
    this.particles = createParticlePool(this.scene, 180);
    this.weatherSystem = createWeatherSystem(this.scene, 130);
    this.applyPerformanceProfile();

    // Hero with saved customization
    this.hero = createHeroModel(this.characterCustom);
    this.scene.add(this.hero.root);
    this.updateHeroTransform();

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

    // 4 Ancient Sun Shrines
    const initialChapter = generateChapterInfo(this.currentChapterNumber);
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

      // Orient the Solar Tether Beam from this Shrine toward Central Boss (0, 2.0, 0)
      const distToCenter = Math.hypot(s.x, s.z);
      rig.beamMesh.scale.set(1, 1, distToCenter);
      rig.beamMesh.rotation.y = Math.atan2(-s.x, -s.z);
      rig.beamMesh.position.set(-s.x * 0.5, 2.1, -s.z * 0.5);
      rig.beamMesh.visible = false;

      this.scene.add(rig.root);
      this.shrineRigs.push(rig);
    });

    for (let i = 0; i < 10; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = 6 + Math.random() * 24;
      this.spawnPickup(Math.cos(ang) * rad, Math.sin(ang) * rad);
    }

    this.spawnEnemies(7);
    this.renderer.compile(this.scene, this.camera);
  }

  private spawnEnemies(count: number): void {
    const types: ('puffer' | 'roller' | 'sprite')[] = ['puffer', 'roller', 'sprite'];

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
        hp: type === 'roller' ? 3 : 2,
        maxHp: type === 'roller' ? 3 : 2,
        state: 'chase',
        timer: Math.random() * 2,
        telegraphTimer: 0,
        targetX: this.playerPos.x,
        targetZ: this.playerPos.z,
        speed: type === 'puffer' ? 2.8 : type === 'roller' ? 2.2 : 2.5,
        size: type === 'roller' ? 0.9 : 0.7,
      };

      const rig =
        type === 'puffer'
          ? createPufferModel()
          : type === 'roller'
          ? createRollerModel()
          : createSpriteModel();

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
    this.camera.aspect = w / h;
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
    this.player = createInitialPlayer();
    this.playerPos.set(0, getGroundHeight(0, 11), 11);
    this.damageTakenTotal = 0;
    this.totalEnemiesCleansed = 0;
    this.elapsedTime = 0;
    this.bossMaxHp = chapter.bossMaxHp;
    this.bossHp = chapter.bossMaxHp;
    this.bossCleansed = false;

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

  public restartGame(advanceChapter = false): void {
    this.cameraFocusMode = 'gameplay';

    if (advanceChapter) {
      this.currentChapterNumber++;
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(CHAPTER_STORAGE_KEY, String(this.currentChapterNumber));
        } catch {
          // ignore
        }
      }
      // Keep accumulated score when advancing chapters, restore full HP
      this.player.hp = this.player.maxHp;
      this.player.isInvulnerable = true;
      this.player.invulnerableTimer = 2.0;
    } else {
      this.player = createInitialPlayer();
      this.damageTakenTotal = 0;
      this.totalEnemiesCleansed = 0;
      this.elapsedTime = 0;
    }

    const chapter = generateChapterInfo(this.currentChapterNumber);
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

    this.enemies.forEach((e) => this.scene.remove(e.rig.root));
    this.enemies = [];
    this.spawnEnemies(chapter.enemyCount);

    if (this.bossRig) {
      (this.bossRig.core.material as THREE.MeshStandardMaterial).emissive.setHex(0x5a189a);
      this.bossRig.eyeMat.color.setHex(0xff4d6d);
      this.bossRig.eyeMat.emissive.setHex(0xc9184a);
      this.bossRig.shieldRing.visible = true;
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
    }
    if (!this.renderer || this.isHeadless) return;

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, profile.pixelRatioCap));
    this.renderer.shadowMap.enabled = profile.shadowsEnabled;
    this.renderer.toneMappingExposure = profile.toneMappingExposure;

    if (this.lightingRig?.keyLight) {
      this.lightingRig.keyLight.castShadow = profile.shadowsEnabled;
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
      interactPressed: false,
    };
  }

  public triggerPlayerBonk(): void {
    if (this.attackAnimTimer > 0) return;
    const now = this.elapsedTime;
    const attack = resolvePlayerAttack(now, this.player.comboCount, this.player.lastAttackTime);

    this.player.comboCount = attack.combo;
    this.player.lastAttackTime = now;
    this.attackAnimTimer = 0.28;
    this.currentComboStep = attack.combo;

    sound.playSwing(attack.combo);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(attack.isFinisher ? 35 : 15);
    }

    const attackRange = GAME_CONSTANTS.ATTACK_RADIUS + (attack.isFinisher ? 0.8 : 0);
    let hitAny = false;

    for (const item of this.enemies) {
      const e = item.state;
      if (e.state === 'cleansed') continue;

      const d = distance(this.playerPos.x, this.playerPos.z, e.x, e.z);
      if (d <= attackRange) {
        const res = damageEnemy(e, attack.damage);
        item.state = res.enemy;
        hitAny = true;

        const dx = e.x - this.playerPos.x;
        const dz = e.z - this.playerPos.z;
        const len = Math.max(0.1, Math.hypot(dx, dz));
        e.vx = (dx / len) * (attack.isFinisher ? 12 : 6);
        e.vz = (dz / len) * (attack.isFinisher ? 12 : 6);

        this.particles.spawn(
          e.x,
          getGroundHeight(e.x, e.z) + 0.8,
          e.z,
          0.9,
          0.9,
          0.2,
          attack.isFinisher ? 18 : 8
        );

        if (res.wasCleansed) {
          this.totalEnemiesCleansed++;
          this.player.score += 150;
          this.recordQuestProgress('cleanse_gloomlings', 1);
          sound.playCleansed();
          this.spawnPickup(e.x, e.z);
          this.refreshHomeTrophies();
        }
      }
    }

    if (attack.isFinisher && hitAny) {
      this.recordQuestProgress('combo_finishers', 1);
    }

    if (!this.bossCleansed) {
      const dToBoss = distance(this.playerPos.x, this.playerPos.z, 0, 0);
      if (dToBoss <= attackRange + 1.4) {
        hitAny = true;
        const allShrinesDone = this.shrines.every((s) => s.isRestored);
        const effDamage = allShrinesDone ? attack.damage * 1.5 : attack.damage * 0.5;
        this.bossHp = Math.max(0, this.bossHp - effDamage);
        this.particles.spawn(0, 2.0, 0, 0.7, 0.2, 0.9, 14);
        this.triggerStoryBeat('boss_damaged');

        if (this.bossHp <= 0) {
          this.cleanseBoss();
        }
      }
    }

    if (hitAny) {
      sound.playHit(attack.isFinisher);
      this.hitstopTimer = attack.isFinisher ? 0.06 : 0.035;
      this.cameraTrauma = Math.min(1.0, this.cameraTrauma + (attack.isFinisher ? 0.45 : 0.25));
      this.dispatchHUD();
    }
  }

  private cleanseBoss(): void {
    if (this.bossCleansed) return;
    this.bossCleansed = true;
    this.bossHp = 0;
    this.player.score += 1000;
    if (this.bossRig) {
      (this.bossRig.core.material as THREE.MeshStandardMaterial).emissive.setHex(0x00ff88);
      this.bossRig.eyeMat.color.setHex(0x80ffdb);
      this.bossRig.eyeMat.emissive.setHex(0x06d6a0);
      this.bossRig.shieldRing.visible = false;
    }
    this.triggerStoryBeat('boss_cleansed');
    sound.playShrineRestored();
    this.particles.spawn(0, 2.5, 0, 0.2, 0.95, 0.4, 32);
    this.refreshHomeTrophies();
    this.checkGameOutcome();
  }

  public triggerPlayerDash(): void {
    if (this.player.dashCooldownRemaining > 0 || this.isDashing) return;

    this.isDashing = true;
    this.dashTimer = GAME_CONSTANTS.PLAYER_DASH_DURATION;
    this.player.dashCooldownRemaining = GAME_CONSTANTS.PLAYER_DASH_COOLDOWN;
    this.player.isInvulnerable = true;
    this.player.invulnerableTimer = GAME_CONSTANTS.PLAYER_DASH_DURATION + 0.1;

    this.dashDir.set(Math.sin(this.playerFacing), 0, Math.cos(this.playerFacing)).normalize();
    this.recordQuestProgress('leaf_dashes', 1);
    sound.playDash();

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }

    this.particles.spawn(this.playerPos.x, this.playerPos.y + 0.3, this.playerPos.z, 1.0, 1.0, 0.9, 12, 2.5);
  }

  public triggerPlayerSpin(): void {
    if (this.player.spinCooldownRemaining > 0) return;

    this.player.spinCooldownRemaining = GAME_CONSTANTS.PLAYER_SPIN_COOLDOWN;
    this.spinAnimTimer = 0.55;
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

    let hitCount = 0;
    for (const item of this.enemies) {
      const e = item.state;
      if (e.state === 'cleansed') continue;

      const d = distance(this.playerPos.x, this.playerPos.z, e.x, e.z);
      if (d <= GAME_CONSTANTS.SPIN_RADIUS) {
        hitCount++;
        const res = damageEnemy(e, 2.5);
        item.state = res.enemy;

        const dx = e.x - this.playerPos.x;
        const dz = e.z - this.playerPos.z;
        const len = Math.max(0.1, Math.hypot(dx, dz));
        e.vx = (dx / len) * 14;
        e.vz = (dz / len) * 14;

        if (res.wasCleansed) {
          this.totalEnemiesCleansed++;
          this.player.score += 200;
          this.recordQuestProgress('cleanse_gloomlings', 1);
          this.spawnPickup(e.x, e.z);
          this.refreshHomeTrophies();
        }
      }
    }

    if (!this.bossCleansed) {
      const dToBoss = distance(this.playerPos.x, this.playerPos.z, 0, 0);
      if (dToBoss <= GAME_CONSTANTS.SPIN_RADIUS + 1.2) {
        hitCount++;
        const allShrinesDone = this.shrines.every((s) => s.isRestored);
        this.bossHp = Math.max(0, this.bossHp - (allShrinesDone ? 3.5 : 1.2));
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

  public triggerPlayerInteract(): void {
    for (let idx = 0; idx < this.shrines.length; idx++) {
      const shrine = this.shrines[idx];
      const res = tryDepositSeedInShrine(this.player, shrine, this.playerPos.x, this.playerPos.z);
      if (res.success) {
        this.player = res.player;
        this.shrines[idx] = res.shrine;
        sound.playPickup();

        const rig = this.shrineRigs[idx];
        if (rig) {
          const ratio = res.shrine.currentSeeds / res.shrine.requiredSeeds;
          rig.light.intensity = 0.5 + ratio * 2.0;
        }

        this.refreshHomeTrophies();

        if (res.justCompleted) {
          this.recordQuestProgress('restore_shrines', 1);
          sound.playShrineRestored();
          if (rig) {
            (rig.ring.material as THREE.MeshStandardMaterial).emissive.setHex(0xffaa00);
            (rig.ring.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.95;
            rig.beamMesh.visible = true;
          }
          this.particles.spawn(
            shrine.x,
            getGroundHeight(shrine.x, shrine.z) + 2.0,
            shrine.z,
            1.0,
            0.85,
            0.2,
            35,
            5
          );

          // Solar beam from restored shrine weakens the Central Boss!
          const restoredCount = this.shrines.filter((s) => s.isRestored).length;
          this.bossHp = Math.max(1.5, this.bossHp - this.bossMaxHp * 0.16);

          if (restoredCount === 1) {
            this.triggerStoryBeat('shrine_1');
          } else if (restoredCount === 2) {
            this.triggerStoryBeat('shrine_2');
          } else if (restoredCount === 3) {
            this.triggerStoryBeat('shrine_3');
          } else if (restoredCount >= this.shrines.length) {
            if (this.bossRig) {
              this.bossRig.shieldRing.visible = false;
            }
            this.particles.spawn(0, 2.2, 0, 1.0, 0.85, 0.25, 36, 6.0);
            this.triggerStoryBeat('all_shrines_restored');
          }

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

    this.particles.update(dt);
  }

  private updatePlayingMode(dt: number): void {
    this.elapsedTime += dt;

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.updateCamera(dt);
      this.particles.update(dt);
      return;
    }

    const weatherMods = getWeatherGameplayModifiers(this.currentWeather);
    const inSafeZone = isInsideHomeBaseSafeZone(this.playerPos.x, this.playerPos.z);

    // Passive healing from nourishing rain OR resting inside the Cozy Home Base Sanctuary
    const healRate = weatherMods.passiveHealPerSecond + (inSafeZone ? 0.35 : 0);
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
    this.updatePickups(dt, weatherMods.seedScoreBonusMultiplier);
    this.updateEnemies(dt, weatherMods.enemySpeedMultiplier);
    this.updateProjectiles(dt);
    this.updateBoss(dt);
    this.particles.update(dt);
    this.updateCamera(dt);

    if (this.elapsedTime - this.lastHUDTick >= 0.12) {
      this.lastHUDTick = this.elapsedTime;
      this.dispatchHUD();
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
    if (this.touchInputs.interactPressed) {
      this.touchInputs.interactPressed = false;
      this.triggerPlayerInteract();
    }

    const inputLen = Math.hypot(inputX, inputZ);

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
      const speed = GAME_CONSTANTS.PLAYER_SPEED * Math.min(1.0, inputLen);

      this.playerPos.x += normX * speed * dt;
      this.playerPos.z += normZ * speed * dt;

      this.walkCycle += dt * 14 * inputLen;
    } else {
      this.walkCycle += dt * 2.5;
    }

    const distFromCenter = Math.hypot(this.playerPos.x, this.playerPos.z);
    if (distFromCenter > 42) {
      const pushFactor = 42 / distFromCenter;
      this.playerPos.x *= pushFactor;
      this.playerPos.z *= pushFactor;
    }

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

    // Articulated Arm Swing & Staff Filigree Rotation
    this.hero.leftArm.rotation.x = -Math.sin(this.walkCycle) * (isMoving ? 0.45 : 0.08);
    this.hero.rightArm.rotation.x = Math.sin(this.walkCycle) * (isMoving ? 0.32 : 0.06);
    this.hero.staffRing.rotation.z += 0.04;
    this.hero.staffRing.rotation.y += 0.025;

    if (this.attackAnimTimer > 0) {
      this.attackAnimTimer -= 0.016;
      const progress = 1 - Math.max(0, this.attackAnimTimer / 0.28);
      const swingSwing = Math.sin(progress * Math.PI) * 1.8;
      this.hero.staff.rotation.x = swingSwing;
      this.hero.staff.rotation.z = -Math.sin(progress * Math.PI) * 0.8;
      this.hero.rightArm.rotation.x = -swingSwing * 0.65;
    } else if (this.spinAnimTimer > 0) {
      this.spinAnimTimer -= 0.016;
      this.hero.staff.rotation.y += 0.45;
    } else {
      this.hero.staff.rotation.set(0, 0, 0);
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
      if (d <= 1.8) {
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

    if (this.pickups.length < 5) {
      const ang = Math.random() * Math.PI * 2;
      const rad = 8 + Math.random() * 22;
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

      // Repel enemies from the Cozy Home Base Sanctuary Safe Zone!
      const distToHome = distance(e.x, e.z, GAME_CONSTANTS.HOME_BASE_X, GAME_CONSTANTS.HOME_BASE_Z);
      if (distToHome < GAME_CONSTANTS.HOME_BASE_SAFE_RADIUS + 1.0) {
        const pushDx = (e.x - GAME_CONSTANTS.HOME_BASE_X) / Math.max(0.1, distToHome);
        const pushDz = (e.z - GAME_CONSTANTS.HOME_BASE_Z) / Math.max(0.1, distToHome);
        e.x = GAME_CONSTANTS.HOME_BASE_X + pushDx * (GAME_CONSTANTS.HOME_BASE_SAFE_RADIUS + 1.05);
        e.z = GAME_CONSTANTS.HOME_BASE_Z + pushDz * (GAME_CONSTANTS.HOME_BASE_SAFE_RADIUS + 1.05);
      }

      const distToPlayer = distance(e.x, e.z, pX, pZ);
      const effSpeed = e.speed * weatherSpeedMultiplier;

      if (e.type === 'puffer') {
        if (!playerInSafeZone && distToPlayer > 1.2) {
          const dx = (pX - e.x) / distToPlayer;
          const dz = (pZ - e.z) / distToPlayer;
          e.x += dx * effSpeed * dt;
          e.z += dz * effSpeed * dt;
          rig.root.rotation.y = Math.atan2(dx, dz);
        } else if (!playerInSafeZone && distToPlayer <= 1.2) {
          this.hitPlayer(1);
        }
        const hop = Math.abs(Math.sin(this.elapsedTime * 7 + i)) * 0.4;
        rig.root.position.set(e.x, getGroundHeight(e.x, e.z) + hop, e.z);
      } else if (e.type === 'roller') {
        const rRig = rig as ReturnType<typeof createRollerModel>;

        if (e.state === 'chase') {
          const dx = (pX - e.x) / Math.max(0.1, distToPlayer);
          const dz = (pZ - e.z) / Math.max(0.1, distToPlayer);
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
            this.hitPlayer(1);
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
        const idealDist = 7.5;
        const diff = distToPlayer - idealDist;
        const dx = (pX - e.x) / Math.max(0.1, distToPlayer);
        const dz = (pZ - e.z) / Math.max(0.1, distToPlayer);

        if (Math.abs(diff) > 1.0) {
          e.x += dx * Math.sign(diff) * effSpeed * dt;
          e.z += dz * Math.sign(diff) * effSpeed * dt;
        }

        e.x += -dz * effSpeed * 0.4 * dt;
        e.z += dx * effSpeed * 0.4 * dt;

        rig.root.rotation.y = Math.atan2(dx, dz);
        rig.root.position.set(e.x, getGroundHeight(e.x, e.z) + floatY, e.z);

        e.timer += dt;
        if (!playerInSafeZone && e.timer >= 3.2 && distToPlayer < 14) {
          e.timer = 0;
          this.spawnSparkProjectile(e.x, getGroundHeight(e.x, e.z) + floatY, e.z, dx, dz);
        }
      }
    }

    if (this.enemies.length < 5 && this.gameState === 'playing') {
      this.spawnEnemies(3);
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

      const d = distance(p.x, p.z, this.playerPos.x, this.playerPos.z);
      if (d <= 1.0) {
        this.hitPlayer(1);
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

    this.bossRig.branches.rotation.y = Math.sin(this.elapsedTime * 0.8) * 0.25;
    this.bossRig.leftArm.rotation.x = Math.sin(this.elapsedTime * 2.0) * 0.22;
    this.bossRig.rightArm.rotation.x = -Math.sin(this.elapsedTime * 2.0) * 0.22;
    this.bossRig.shieldRing.rotation.z += dt * 0.9;

    const pulse = 0.55 + Math.sin(this.elapsedTime * 3.5) * 0.35;
    (this.bossRig.core.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
  }

  private hitPlayer(damageAmount: number): void {
    if (isInsideHomeBaseSafeZone(this.playerPos.x, this.playerPos.z)) return;

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

  private updateCamera(dt: number): void {
    const targetCamX = this.playerPos.x + this.cameraOffset.x;
    const targetCamY = this.playerPos.y + this.cameraOffset.y;
    const targetCamZ = this.playerPos.z + this.cameraOffset.z;

    const factor = 1 - Math.exp(-6 * dt);
    this.camera.position.x += (targetCamX - this.camera.position.x) * factor;
    this.camera.position.y += (targetCamY - this.camera.position.y) * factor;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * factor;

    if (this.cameraTrauma > 0) {
      this.cameraTrauma = Math.max(0, this.cameraTrauma - dt * 1.8);
      const shake = this.cameraTrauma * this.cameraTrauma * 0.45;
      this.camera.position.x += (Math.random() - 0.5) * shake;
      this.camera.position.y += (Math.random() - 0.5) * shake;
    }

    this.camera.lookAt(this.playerPos.x, this.playerPos.y + 1.2, this.playerPos.z);
  }

  private dispatchHUD(summary?: { finalScore: number; stars: number; timeFormatted: string }): void {
    let isNearShrine = false;
    let nearShrinePrompt = '';

    for (const shrine of this.shrines) {
      const d = distance(this.playerPos.x, this.playerPos.z, shrine.x, shrine.z);
      if (d <= GAME_CONSTANTS.SHRINE_INTERACT_RADIUS) {
        isNearShrine = true;
        if (shrine.isRestored) {
          nearShrinePrompt = `${shrine.name} Restored!`;
        } else if (this.player.sunSeeds > 0) {
          nearShrinePrompt = `Press E or Tap RESTORE to deposit Sun-Seed (${shrine.currentSeeds}/${shrine.requiredSeeds})`;
        } else {
          nearShrinePrompt = `Need ${shrine.requiredSeeds - shrine.currentSeeds} more Sun-Seeds to restore Shrine!`;
        }
        break;
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
      currentStoryBeat: this.currentStoryBeat,
      storyHistory: [...this.storyHistory],
      performanceQuality: this.performanceQuality,
      dailyQuests: this.dailyQuests.map((q) => ({ ...q })),
      dailyQuestsDateKey: this.dailyQuestsDateKey,
      finalSummary: summary,
    });
  }

  public destroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    sound.stopAmbientBgm();
    this.renderer.dispose();
  }
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialPlayer,
  distance,
  checkCircleOverlap,
  resolvePlayerAttack,
  applyDamageToPlayer,
  tickPlayerTimers,
  damageEnemy,
  tryDepositSeedInShrine,
  checkVictory,
  calculateRunSummary,
  isValidAdMobAppId,
  isValidAdMobUnitId,
  applyRewardedSeedBlessing,
  applyRewardedRevive,
  isInsideHomeBaseSafeZone,
  computeUnlockedTrophies,
  computeDayNightState,
  getWeatherGameplayModifiers,
  CUSTOMIZATION_OPTIONS,
  DEFAULT_CUSTOMIZATION,
  generateChapterInfo,
  getTodayDateKey,
  generateDailyQuests,
  advanceDailyQuestProgress,
  claimDailyQuestReward,
  isValidTapsellAppKey,
  isValidTapsellZoneId,
  isValidYektanetAppId,
  isValidYektanetPlacementId,
  resolveAdNetworkByCountry,
  getGraphicsQualityProfile,
  computeStageObjectiveGuide,
  getInGameStoryBeat,
  GAME_CONSTANTS,
  type Shrine,
  type EnemyState,
} from './rules.ts';

test('createInitialPlayer creates full HP player', () => {
  const player = createInitialPlayer();
  assert.equal(player.hp, GAME_CONSTANTS.MAX_PLAYER_HP);
  assert.equal(player.maxHp, GAME_CONSTANTS.MAX_PLAYER_HP);
  assert.equal(player.sunSeeds, 0);
  assert.equal(player.isInvulnerable, false);
});

test('distance calculation is accurate in 2D plane', () => {
  assert.equal(distance(0, 0, 3, 4), 5);
  assert.equal(distance(1, 1, 1, 1), 0);
});

test('checkCircleOverlap identifies touching/overlapping spheres', () => {
  assert.equal(checkCircleOverlap(0, 0, 1, 2, 0, 1.5), true);
  assert.equal(checkCircleOverlap(0, 0, 1, 10, 0, 1), false);
});

test('resolvePlayerAttack manages 3-step combo string', () => {
  const hit1 = resolvePlayerAttack(1.0, 0, -10);
  assert.equal(hit1.combo, 1);
  assert.equal(hit1.isFinisher, false);

  const hit2 = resolvePlayerAttack(1.4, 1, 1.0);
  assert.equal(hit2.combo, 2);
  assert.equal(hit2.isFinisher, false);

  const hit3 = resolvePlayerAttack(1.8, 2, 1.4);
  assert.equal(hit3.combo, 3);
  assert.equal(hit3.isFinisher, true);
  assert.equal(hit3.damage, 2.5);

  const hitReset = resolvePlayerAttack(5.0, 3, 1.8);
  assert.equal(hitReset.combo, 1);
});

test('applyDamageToPlayer respects invulnerability and applies damage', () => {
  const player = createInitialPlayer();
  const res1 = applyDamageToPlayer(player, 1);
  assert.equal(res1.tookDamage, true);
  assert.equal(res1.player.hp, GAME_CONSTANTS.MAX_PLAYER_HP - 1);
  assert.equal(res1.player.isInvulnerable, true);

  const res2 = applyDamageToPlayer(res1.player, 1);
  assert.equal(res2.tookDamage, false);
  assert.equal(res2.player.hp, GAME_CONSTANTS.MAX_PLAYER_HP - 1);
});

test('tickPlayerTimers decays invulnerability and cooldowns with weather multiplier', () => {
  let player = createInitialPlayer();
  player.isInvulnerable = true;
  player.invulnerableTimer = 1.0;
  player.dashCooldownRemaining = 0.5;

  player = tickPlayerTimers(player, 0.5, 1.25);
  assert.equal(player.dashCooldownRemaining, 0);
  assert.equal(player.isInvulnerable, true);

  player = tickPlayerTimers(player, 0.6, 1.0);
  assert.equal(player.isInvulnerable, false);
});

test('damageEnemy drops HP and marks cleansed when HP hits 0', () => {
  const enemy: EnemyState = {
    id: 'e1',
    type: 'puffer',
    x: 0,
    z: 0,
    vx: 0,
    vz: 0,
    hp: 2,
    maxHp: 2,
    state: 'chase',
    timer: 0,
    telegraphTimer: 0,
    targetX: 0,
    targetZ: 0,
    speed: 3,
    size: 1,
  };

  const hit1 = damageEnemy(enemy, 1);
  assert.equal(hit1.enemy.hp, 1);
  assert.equal(hit1.enemy.state, 'stunned');
  assert.equal(hit1.wasCleansed, false);

  const hit2 = damageEnemy(hit1.enemy, 1);
  assert.equal(hit2.enemy.hp, 0);
  assert.equal(hit2.enemy.state, 'cleansed');
  assert.equal(hit2.wasCleansed, true);
});

test('tryDepositSeedInShrine increments shrine progress and restores when full', () => {
  const player = createInitialPlayer();
  player.sunSeeds = 3;

  const shrine: Shrine = {
    id: 1,
    x: 10,
    z: 10,
    requiredSeeds: 3,
    currentSeeds: 0,
    isRestored: false,
    name: 'Sun Blossom Shrine',
  };

  const farResult = tryDepositSeedInShrine(player, shrine, 0, 0);
  assert.equal(farResult.success, false);

  const closeResult = tryDepositSeedInShrine(player, shrine, 10.5, 10.2);
  assert.equal(closeResult.success, true);
  assert.equal(closeResult.shrine.currentSeeds, 3);
  assert.equal(closeResult.shrine.isRestored, true);
  assert.equal(closeResult.justCompleted, true);
  assert.equal(closeResult.player.sunSeeds, 0);
});

test('checkVictory validates all shrines restored and boss cleansed', () => {
  const shrines: Shrine[] = [
    { id: 1, x: 0, z: 0, requiredSeeds: 2, currentSeeds: 2, isRestored: true, name: 'S1' },
    { id: 2, x: 0, z: 0, requiredSeeds: 2, currentSeeds: 1, isRestored: false, name: 'S2' },
  ];

  assert.equal(checkVictory(shrines, true), false);
  shrines[1].isRestored = true;
  assert.equal(checkVictory(shrines, false), false);
  assert.equal(checkVictory(shrines, true), true);
});

test('calculateRunSummary outputs accurate stars and formatted time', () => {
  const summary = calculateRunSummary(1500, 8, 85, 1);
  assert.equal(summary.timeFormatted, '1:25');
  assert.ok(summary.finalScore > 2000);
  assert.ok(summary.stars >= 2);
});

test('isValidAdMobAppId and isValidAdMobUnitId validate official Google AdMob formats', () => {
  assert.equal(isValidAdMobAppId('ca-app-pub-3940256099942544~3347511713'), true);
  assert.equal(isValidAdMobAppId('hyn198911@gmail.com'), false);
  assert.equal(isValidAdMobUnitId('ca-app-pub-3940256099942544/5224354917'), true);
});

test('applyRewardedSeedBlessing and applyRewardedRevive update player state properly', () => {
  let player = createInitialPlayer();
  player.hp = 0;

  player = applyRewardedSeedBlessing(player, 3);
  assert.equal(player.sunSeeds, 3);
  assert.equal(player.score, 150);

  player = applyRewardedRevive(player);
  assert.equal(player.hp, player.maxHp);
  assert.equal(player.isInvulnerable, true);
});

test('Home Base safe zone detection and trophy unlocking work accurately', () => {
  assert.equal(isInsideHomeBaseSafeZone(0, 14), true);
  assert.equal(isInsideHomeBaseSafeZone(25, 25), false);

  const trophies = computeUnlockedTrophies(1, 3, 350, true);
  assert.equal(trophies.shrineTrophy, true);
  assert.equal(trophies.cleanserTrophy, true);
  assert.equal(trophies.seedHoarderTrophy, true);
  assert.equal(trophies.guardianCrownTrophy, true);
});

test('Day/Night cycle and Weather modifiers return coherent gameplay values', () => {
  const dawn = computeDayNightState(0.05);
  assert.equal(dawn.phase, 'dawn');
  const day = computeDayNightState(0.35);
  assert.equal(day.phase, 'day');
  const night = computeDayNightState(0.85);
  assert.equal(night.phase, 'night');
  assert.ok(night.lanternGlowIntensity > day.lanternGlowIntensity);

  const rainMod = getWeatherGameplayModifiers('rain');
  assert.equal(rainMod.dashCooldownMultiplier, 1.25);
  assert.ok(rainMod.passiveHealPerSecond > 0);

  const snowMod = getWeatherGameplayModifiers('snow');
  assert.equal(snowMod.enemySpeedMultiplier, 0.8);
});

test('Character customization catalog has diverse options across all categories', () => {
  assert.ok(CUSTOMIZATION_OPTIONS.bodyTypes.length >= 4);
  assert.ok(CUSTOMIZATION_OPTIONS.hairstyles.length >= 5);
  assert.ok(CUSTOMIZATION_OPTIONS.hairColors.length >= 6);
  assert.ok(CUSTOMIZATION_OPTIONS.facialFeatures.length >= 4);
  assert.ok(CUSTOMIZATION_OPTIONS.clothingStyles.length >= 4);
  assert.equal(DEFAULT_CUSTOMIZATION.bodyType, 'sprout');
});

test('generateChapterInfo produces infinite procedural chapters and story progression', () => {
  const ch1 = generateChapterInfo(1);
  const ch2 = generateChapterInfo(2);
  const ch50 = generateChapterInfo(50);

  assert.equal(ch1.chapterNumber, 1);
  assert.equal(ch2.chapterNumber, 2);
  assert.equal(ch50.chapterNumber, 50);
  assert.notEqual(ch1.title, ch2.title);
  assert.ok(ch50.storyParagraph.length > 30);
  assert.ok(ch50.bossMaxHp >= ch1.bossMaxHp);
});

test('Persian localization generates valid Persian chapter stories and shrine prompts', async () => {
  const { getLocalizedChapterInfo, localizeShrinePrompt } = await import('./i18n.ts');
  const faCh1 = getLocalizedChapterInfo(1, 'fa');
  const faCh5 = getLocalizedChapterInfo(5, 'fa');
  assert.ok(faCh1.title.includes('فصل 1'));
  assert.ok(faCh5.title.includes('فصل 5'));
  assert.ok(faCh1.storyParagraph.includes('پیپ'));

  const promptFa = localizeShrinePrompt('Press E or Tap RESTORE to deposit Sun-Seed (1/3)', 'fa');
  assert.ok(promptFa.includes('(1/3)'));
  assert.ok(promptFa.includes('احیا'));
});

test('Daily Quests generator produces 3 distinct deterministic quests per date and reroll', () => {
  const dateKey = getTodayDateKey(new Date('2026-10-18T12:00:00Z'));
  assert.equal(dateKey.length, 10);

  const questsA = generateDailyQuests('2026-10-18', 0);
  const questsB = generateDailyQuests('2026-10-18', 0);
  const questsRerolled = generateDailyQuests('2026-10-18', 1);

  assert.equal(questsA.length, 3);
  assert.deepEqual(questsA, questsB);

  const types = new Set(questsA.map((q) => q.type));
  assert.equal(types.size, 3);

  // Rerolling produces new quest IDs
  assert.notEqual(questsA[0].id, questsRerolled[0].id);
});

test('Daily Quests progress advancement and reward claiming update player state accurately', async () => {
  const { localizeDailyQuest } = await import('./i18n.ts');
  let quests = generateDailyQuests('2026-10-18', 0);
  const firstQuest = quests[0];

  // Check Persian localization of the daily quest
  const faLoc = localizeDailyQuest(firstQuest, 'fa');
  assert.ok(faLoc.title.includes(String(firstQuest.target)));
  assert.ok(faLoc.description.length > 10);

  // Advance partway
  const step1 = advanceDailyQuestProgress(quests, firstQuest.type, 2);
  quests = step1.quests;
  assert.equal(quests[0].progress, 2);
  assert.equal(quests[0].completed, false);
  assert.equal(step1.newlyCompleted.length, 0);

  // Advance to completion
  const step2 = advanceDailyQuestProgress(quests, firstQuest.type, firstQuest.target);
  quests = step2.quests;
  assert.equal(quests[0].progress, firstQuest.target);
  assert.equal(quests[0].completed, true);
  assert.equal(step2.newlyCompleted.length, 1);

  // Claim reward
  let player = createInitialPlayer();
  player.hp = 3;
  const claimRes = claimDailyQuestReward(player, quests, firstQuest.id);
  assert.ok(claimRes.claimedQuest);
  assert.equal(claimRes.quests[0].claimed, true);
  assert.equal(claimRes.player.sunSeeds, firstQuest.rewardSeeds);
  assert.equal(claimRes.player.score, firstQuest.rewardScore);
  assert.equal(claimRes.player.hp, 4);

  // Claiming a second time is a no-op
  const duplicateClaim = claimDailyQuestReward(claimRes.player, claimRes.quests, firstQuest.id);
  assert.equal(duplicateClaim.claimedQuest, null);
});

test('Country-aware Ad Router selects Tapsell or Yektanet in Iran and AdMob globally with Waterfall fallback', () => {
  assert.equal(isValidTapsellAppKey('tapsell-plus-sandbox-key-sproutling3d-ir-2026'), true);
  assert.equal(isValidTapsellZoneId('5cfaa802e8d17f0001ffb28e'), true);
  assert.equal(isValidYektanetAppId('yn-pub-sproutling3d-ir'), true);
  assert.equal(isValidYektanetPlacementId('yn-pos-rewarded-video-01'), true);

  // 1. Iran detected via Asia/Tehran timezone -> Tapsell primary, Yektanet fallback
  const irRoute = resolveAdNetworkByCountry({
    mode: 'auto',
    preferredIranProvider: 'tapsell',
    timeZone: 'Asia/Tehran',
    languages: ['en-US'],
  });
  assert.equal(irRoute.detectedCountry, 'IR');
  assert.equal(irRoute.activeProvider, 'tapsell');
  assert.equal(irRoute.fallbackProvider, 'yektanet');

  // 2. Iran Waterfall fallback when Tapsell fails -> automatically switches to Yektanet
  const irFallback = resolveAdNetworkByCountry({
    mode: 'auto',
    preferredIranProvider: 'tapsell',
    timeZone: 'Asia/Tehran',
    primaryFailed: true,
  });
  assert.equal(irFallback.activeProvider, 'yektanet');

  // 3. Global detected -> AdMob primary, Tapsell fallback if AdMob fails
  const globalRoute = resolveAdNetworkByCountry({
    mode: 'auto',
    preferredIranProvider: 'tapsell',
    timeZone: 'Europe/Berlin',
    languages: ['en-US'],
  });
  assert.equal(globalRoute.detectedCountry, 'GLOBAL');
  assert.equal(globalRoute.activeProvider, 'admob');
  assert.equal(globalRoute.fallbackProvider, 'tapsell');

  const globalFallback = resolveAdNetworkByCountry({
    mode: 'auto',
    preferredIranProvider: 'yektanet',
    timeZone: 'Europe/Berlin',
    languages: ['en-US'],
    primaryFailed: true,
  });
  assert.equal(globalFallback.activeProvider, 'yektanet');
});

test('Graphics Quality Profiles scale geometry details progressively from Eco up to Ultra', () => {
  const eco = getGraphicsQualityProfile('eco');
  const balanced = getGraphicsQualityProfile('balanced');
  const high = getGraphicsQualityProfile('high');
  const ultra = getGraphicsQualityProfile('ultra');

  assert.equal(eco.shadowsEnabled, false);
  assert.equal(eco.grassBladeCount, 0);
  assert.equal(eco.showSecondaryCanopyAndRocks, false);
  assert.equal(eco.enablePbrBumpMaps, false);
  assert.equal(eco.enableReflectiveWaterAndRuins, false);

  assert.equal(balanced.shadowsEnabled, true);
  assert.equal(balanced.showSecondaryCanopyAndRocks, true);
  assert.ok(balanced.grassBladeCount > eco.grassBladeCount);
  assert.ok(balanced.characterGeometrySegments > eco.characterGeometrySegments);

  assert.equal(high.showHighDetailGrassAndFerns, true);
  assert.equal(high.enablePbrBumpMaps, true);
  assert.equal(high.enableReflectiveWaterAndRuins, true);
  assert.ok(high.grassBladeCount > balanced.grassBladeCount);
  assert.ok(high.fernClusterCount > balanced.fernClusterCount);

  assert.equal(ultra.showUltraCrystalsAndFireflies, true);
  assert.ok(ultra.grassBladeCount > high.grassBladeCount);
  assert.ok(ultra.crystalClusterCount > high.crystalClusterCount);
  assert.ok(ultra.fireflyCount > high.fireflyCount);
  assert.ok(ultra.shadowMapSize > high.shadowMapSize);
  assert.ok(ultra.characterGeometrySegments > high.characterGeometrySegments);
});

test('computeStageObjectiveGuide tracks step-by-step stage progression and 3D compass target', () => {
  const shrines: Shrine[] = [
    { id: 1, x: -16, z: -16, requiredSeeds: 2, currentSeeds: 0, isRestored: false, name: 'Sun-Blossom Shrine' },
    { id: 2, x: 16, z: -16, requiredSeeds: 2, currentSeeds: 2, isRestored: true, name: 'Moss-Heart Shrine' },
  ];

  // Step 1: Needs Sun-Seeds to restore remaining shrines, boss shield is active
  const step1 = computeStageObjectiveGuide({
    playerX: 0,
    playerZ: 0,
    sunSeeds: 0,
    shrines,
    bossHp: 12,
    bossMaxHp: 12,
    bossCleansed: false,
    chapterNumber: 1,
  });
  assert.equal(step1.currentStep, 1);
  assert.equal(step1.totalSteps, 3);
  assert.equal(step1.bossShieldActive, true);
  assert.equal(step1.targetX, -16);
  assert.equal(step1.targetZ, -16);

  // Step 2: All shrines restored -> boss shield shatters, target shifts to Boss at (0, 0)
  shrines[0].currentSeeds = 2;
  shrines[0].isRestored = true;
  const step2 = computeStageObjectiveGuide({
    playerX: 10,
    playerZ: 10,
    sunSeeds: 0,
    shrines,
    bossHp: 8,
    bossMaxHp: 12,
    bossCleansed: false,
    chapterNumber: 1,
  });
  assert.equal(step2.currentStep, 2);
  assert.equal(step2.bossShieldActive, false);
  assert.equal(step2.targetX, 0);
  assert.equal(step2.targetZ, 0);
  assert.ok(step2.progressPercent >= 65);

  // Step 3: Boss cleansed -> stage complete (100%), ready to advance to next stage
  const step3 = computeStageObjectiveGuide({
    playerX: 0,
    playerZ: 0,
    sunSeeds: 0,
    shrines,
    bossHp: 0,
    bossMaxHp: 12,
    bossCleansed: true,
    chapterNumber: 1,
  });
  assert.equal(step3.currentStep, 3);
  assert.equal(step3.progressPercent, 100);
  assert.equal(step3.bossShieldActive, false);
});

test('getInGameStoryBeat returns bilingual narrative beats for gameplay milestones', () => {
  const beatStart = getInGameStoryBeat(1, 'chapter_start');
  const beatAllShrines = getInGameStoryBeat(2, 'all_shrines_restored');
  const beatCleanse = getInGameStoryBeat(3, 'boss_cleansed');

  assert.equal(beatStart.id, 'chapter_start');
  assert.ok(beatStart.textFa.includes('نیایشگاه'));
  assert.ok(beatStart.hintFa.includes('مرحله'));

  assert.equal(beatAllShrines.id, 'all_shrines_restored');
  assert.ok(beatAllShrines.textFa.includes('سپر'));
  assert.ok(beatAllShrines.textEn.toLowerCase().includes('shield'));

  assert.equal(beatCleanse.id, 'boss_cleansed');
  assert.ok(beatCleanse.hintFa.includes('فصل'));
});

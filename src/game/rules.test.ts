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


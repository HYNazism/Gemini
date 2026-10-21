/**
 * High-Fidelity Procedural Multi-Part 3D Character, Enemy, Citadel, Shrine & Boss Models
 * for Aethelgard: Warden of the Astral Grove (3D Action-RPG).
 *
 * Includes:
 * - Articulated Hero Rig: Kaelen, the Astral Warden (Obsidian-steel cuirass, layered pauldrons,
 *   crowned war-helms, glowing runic reactor pack, swappable 3D Mythic Weapons: Astral Glaive,
 *   Sunforged Greatsword, Runic Halberd, dynamic 3-step Combo Slash Arc VFX, and 3D Tactical Compass)
 * - The Astral Bastion Keep (Sanctuary Citadel with fortified spires, stained-glass rose window,
 *   Arcane Soul-Forge Brazier, Runic Obelisk perimeter wards, and 4 Champion Relic Pedestals)
 * - Dark-Mythic Enemy Archetypes:
 *   1. Void Stalker Fiend (Reaper Construct with twin plasma-scythe forelimbs & dorsal void spines)
 *   2. Obsidian Siege Juggernaut (Spiked dark-iron war-sphere with magma core & laser charge telegraph)
 *   3. Abyssal Archon Wraith (Eldritch seraph with 4 levitating runic blade-wings & eclipse halo)
 * - Malakor, the Eclipse Titan (18-Part Celestial-Void Colossus Boss with horned sovereign helm,
 *   spinning Astral Reactor Core, articulated war-gauntlets, dorsal monolith crown & Aegis Shield)
 * - Orin, the Celestial Astrolabe Sentinel (Arcane-mechanical companion drone & 3D Target Beacon)
 */

import * as THREE from 'three';
import {
  DEFAULT_CUSTOMIZATION,
  DEFAULT_HOME_BASE,
  CUSTOMIZATION_OPTIONS,
  WEAPON_CATALOG,
  getStageBiomeTheme,
  type CharacterCustomization,
  type HomeBaseCustomization,
  type TrophyStatus,
  type StageBiomeTheme,
  type StageObstacle,
  type WeaponType,
} from './rules';

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(6, 10, 18, 0.82)');
  gradient.addColorStop(0.5, 'rgba(6, 10, 18, 0.42)');
  gradient.addColorStop(1, 'rgba(6, 10, 18, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const shadowTexture = typeof document !== 'undefined' ? createContactShadowTexture() : null;

export function createContactShadow(radius: number): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(radius * 2, radius * 2);
  const mat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
    opacity: 0.72,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.02;
  mesh.renderOrder = 1;
  return mesh;
}

/**
 * Procedural Hero: Kaelen, the Astral Warden — High-Fantasy Armored Warrior Rig
 * with sculpted breastplate & pauldrons, flowing mantle, swappable 3D Mythic Weapons
 * (Astral Glaive, Sunforged Greatsword, Runic Halberd), 3D Combo Slash Arc trail,
 * and diegetic 3D Tactical Compass.
 */
export interface HeroRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  bodyMesh: THREE.Mesh;
  headMesh: THREE.Mesh;
  sproutTop: THREE.Group;
  faceGroup: THREE.Group;
  clothingGroup: THREE.Group;
  satchelGroup: THREE.Group;
  cape: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  staff: THREE.Group;
  staffCrystal: THREE.Mesh;
  staffRing: THREE.Mesh;
  slashArcMesh: THREE.Mesh;
  slashArcMat: THREE.MeshBasicMaterial;
  parryShieldGroup: THREE.Group;
  parryShockwaveMesh: THREE.Mesh;
  parryShockwaveMat: THREE.MeshBasicMaterial;
  auraHaloGroup: THREE.Group;
  leftFoot: THREE.Mesh;
  rightFoot: THREE.Mesh;
  compassGroup: THREE.Group;
  compassArrowMat: THREE.MeshBasicMaterial;
  shadow: THREE.Mesh;
  skinMat: THREE.MeshStandardMaterial;
  hairMat: THREE.MeshStandardMaterial;
  clothingMat: THREE.MeshStandardMaterial;
  swingAngle: number;
  applyCustomization: (custom: CharacterCustomization) => void;
  applyWeapon: (weaponId: WeaponType) => void;
  triggerSlashArc: (comboStep: number, isCrit: boolean) => void;
  setHighDetailEnabled: (enabled: boolean) => void;
  setQualityTier: (quality: 'eco' | 'balanced' | 'high' | 'ultra') => void;
}

export function createHeroModel(
  initialCustom: CharacterCustomization = DEFAULT_CUSTOMIZATION,
  initialWeapon: WeaponType = 'astral-glaive'
): HeroRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialCustom.skinColor),
    roughness: 0.38,
    metalness: 0.12,
  });
  const armorSteelMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.22,
    metalness: 0.85,
  });
  const darkIronMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.32,
    metalness: 0.78,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialCustom.hairColor),
    roughness: 0.34,
    metalness: 0.22,
    side: THREE.DoubleSide,
  });
  const clothingMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialCustom.clothingColor),
    roughness: 0.42,
    metalness: 0.28,
    side: THREE.DoubleSide,
  });
  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x3b1d0a,
    roughness: 0.62,
    metalness: 0.18,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.42,
    roughness: 0.18,
    metalness: 0.9,
  });
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.25,
    roughness: 0.1,
    metalness: 0.4,
  });

  // 1. Heroic Armored Torso & Sculpted Cuirass
  const bodyGeo = new THREE.CylinderGeometry(0.43, 0.35, 0.8, 24);
  const bodyMesh = new THREE.Mesh(bodyGeo, armorSteelMat);
  bodyMesh.position.y = 0.72;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  bodyGroup.add(bodyMesh);

  // Sculpted Chestplate Cuirass & Golden Filigree Ribbing
  const chestPlateGeo = new THREE.BoxGeometry(0.58, 0.46, 0.28);
  const chestPlate = new THREE.Mesh(chestPlateGeo, darkIronMat);
  chestPlate.position.set(0, 0.82, 0.15);
  chestPlate.castShadow = true;
  bodyGroup.add(chestPlate);

  const chestTrim = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.07, 0.3), goldMat);
  chestTrim.position.set(0, 0.98, 0.15);
  bodyGroup.add(chestTrim);

  const chestRune = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 1), crystalMat);
  chestRune.scale.set(1.0, 1.4, 0.48);
  chestRune.position.set(0, 0.83, 0.31);
  bodyGroup.add(chestRune);

  // Armored War-Girdle & Burnished Gold Sovereign Buckle
  const beltGeo = new THREE.CylinderGeometry(0.41, 0.46, 0.17, 24);
  const beltMesh = new THREE.Mesh(beltGeo, leatherMat);
  beltMesh.position.y = 0.46;
  bodyGroup.add(beltMesh);

  const buckleMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 1), goldMat);
  buckleMesh.scale.set(1.35, 1.0, 0.52);
  buckleMesh.position.set(0, 0.46, 0.44);
  bodyGroup.add(buckleMesh);

  // Multi-Layered Winged Pauldrons (Left & Right Shoulder Guards)
  const buildPauldron = (side: -1 | 1) => {
    const pGroup = new THREE.Group();
    pGroup.position.set(side * 0.54, 1.05, 0);
    pGroup.rotation.z = -side * 0.36;

    const domeGeo = new THREE.SphereGeometry(0.25, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.58);
    domeGeo.scale(1.3, 0.88, 1.12);
    const dome = new THREE.Mesh(domeGeo, armorSteelMat);
    dome.castShadow = true;

    const trim = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.028, 10, 24), goldMat);
    trim.rotation.x = Math.PI / 2;

    const wingFin = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.34, 8), goldMat);
    wingFin.position.set(side * 0.16, 0.16, -0.04);
    wingFin.rotation.z = -side * 0.65;

    const pauldronGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.06, 0), crystalMat);
    pauldronGem.position.set(side * 0.08, 0.14, 0.16);

    pGroup.add(dome, trim, wingFin, pauldronGem);
    return pGroup;
  };
  bodyGroup.add(buildPauldron(-1), buildPauldron(1));

  // 2. Sculpted Heroic Head & Armored Gorget Collar
  const gorget = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.16, 20), darkIronMat);
  gorget.position.y = 1.15;
  bodyGroup.add(gorget);

  const headGeo = new THREE.SphereGeometry(0.4, 32, 24);
  headGeo.scale(0.95, 1.05, 0.98);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.y = 1.44;
  headMesh.castShadow = true;
  bodyGroup.add(headMesh);

  const earOuterGeo = new THREE.ConeGeometry(0.08, 0.3, 8);
  earOuterGeo.translate(0, 0.14, 0);
  earOuterGeo.scale(0.58, 1.0, 0.82);
  const leftEar = new THREE.Mesh(earOuterGeo, skinMat);
  leftEar.position.set(-0.37, 0.02, -0.02);
  leftEar.rotation.set(0.15, 0, 1.02);
  const rightEar = new THREE.Mesh(earOuterGeo, skinMat);
  rightEar.position.set(0.37, 0.02, -0.02);
  rightEar.rotation.set(0.15, 0, -1.02);
  headMesh.add(leftEar, rightEar);

  // 3. Facial Features Container
  const faceGroup = new THREE.Group();
  faceGroup.position.set(0, 1.44, 0);
  bodyGroup.add(faceGroup);

  // 4. Helm / Crest / Hairstyle Container
  const sproutTop = new THREE.Group();
  sproutTop.position.set(0, 1.82, 0);
  bodyGroup.add(sproutTop);

  // 5. Armor Mantle / Cuirass Trim Container
  const clothingGroup = new THREE.Group();
  bodyGroup.add(clothingGroup);

  // 6. Runic Astral Reactor Core & Scabbard Mount on Back
  const satchelGroup = new THREE.Group();
  satchelGroup.position.set(0, 0.84, -0.34);
  const packBody = new THREE.Mesh(new THREE.OctahedronGeometry(0.23, 0), darkIronMat);
  packBody.scale.set(1.15, 1.45, 0.55);
  packBody.castShadow = true;
  const packCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 1), crystalMat);
  packCore.position.set(0, 0.04, -0.09);
  const packRing = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.024, 8, 22), goldMat);
  packRing.position.set(0, 0.04, -0.06);
  satchelGroup.add(packBody, packCore, packRing);
  bodyGroup.add(satchelGroup);

  // 7. Flowing Heroic Battle Cloak / Mantle with Gold Hem
  const capeShape = new THREE.Shape();
  capeShape.moveTo(-0.46, 0);
  capeShape.lineTo(-0.58, -0.96);
  capeShape.quadraticCurveTo(0, -1.12, 0.58, -0.96);
  capeShape.lineTo(0.46, 0);
  capeShape.closePath();
  const capeGeo = new THREE.ShapeGeometry(capeShape);
  const cape = new THREE.Mesh(capeGeo, clothingMat);
  cape.position.set(0, 1.14, -0.32);
  cape.rotation.x = -0.26;
  bodyGroup.add(cape);

  // 8. Articulated Left & Right Armored Vambraces & Gauntlets
  const armGeo = new THREE.CapsuleGeometry(0.095, 0.32, 8, 12);
  armGeo.translate(0, -0.18, 0);
  const gauntletGeo = new THREE.CylinderGeometry(0.115, 0.095, 0.22, 10);
  gauntletGeo.translate(0, -0.26, 0);
  const handGeo = new THREE.SphereGeometry(0.105, 10, 10);
  handGeo.translate(0, -0.38, 0);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.52, 0.98, 0.04);
  leftArm.rotation.z = 0.22;
  leftArm.add(
    new THREE.Mesh(armGeo, clothingMat),
    new THREE.Mesh(gauntletGeo, armorSteelMat),
    new THREE.Mesh(handGeo, goldMat)
  );
  bodyGroup.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.52, 0.98, 0.08);
  rightArm.rotation.z = -0.22;
  rightArm.add(
    new THREE.Mesh(armGeo, clothingMat),
    new THREE.Mesh(gauntletGeo, armorSteelMat),
    new THREE.Mesh(handGeo, goldMat)
  );
  bodyGroup.add(rightArm);

  // 9. Armored Sabatons & Knee-Guard Greaves
  const greaveGeo = new THREE.CylinderGeometry(0.125, 0.145, 0.36, 12);
  greaveGeo.translate(0, 0.15, 0);
  const footGeo = new THREE.BoxGeometry(0.22, 0.14, 0.4);
  footGeo.translate(0, 0.04, 0.06);

  const leftFoot = new THREE.Mesh(footGeo, armorSteelMat);
  leftFoot.add(new THREE.Mesh(greaveGeo, darkIronMat));
  leftFoot.position.set(-0.22, 0.06, 0);
  leftFoot.castShadow = true;

  const rightFoot = new THREE.Mesh(footGeo, armorSteelMat);
  rightFoot.add(new THREE.Mesh(greaveGeo, darkIronMat));
  rightFoot.position.set(0.22, 0.06, 0);
  rightFoot.castShadow = true;
  bodyGroup.add(leftFoot, rightFoot);

  // 10. Swappable 3D Mythic Weapon Rig (Astral Glaive / Sunforged Greatsword / Runic Halberd)
  const staff = new THREE.Group();
  staff.position.set(0.56, 0.84, 0.26);

  const weaponVisualGroup = new THREE.Group();
  staff.add(weaponVisualGroup);

  const crystalGeo = new THREE.OctahedronGeometry(0.16, 1);
  const staffCrystal = new THREE.Mesh(crystalGeo, crystalMat);
  staffCrystal.position.y = 1.05;
  staff.add(staffCrystal);

  const staffRingGeo = new THREE.TorusGeometry(0.26, 0.018, 8, 24);
  const staffRing = new THREE.Mesh(staffRingGeo, goldMat);
  staffRing.position.y = 1.05;
  staffRing.rotation.x = Math.PI / 3;
  staff.add(staffRing);

  bodyGroup.add(staff);

  // 10a. Dynamic 3D Weapon Slash Arc Mesh (visualizes 3-hit combo swings & critical finishers)
  const slashArcGeo = new THREE.RingGeometry(1.15, 2.55, 32, 1, -Math.PI * 0.48, Math.PI * 0.96);
  slashArcGeo.rotateX(-Math.PI / 2);
  slashArcGeo.rotateY(Math.PI / 2);
  const slashArcMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const slashArcMesh = new THREE.Mesh(slashArcGeo, slashArcMat);
  slashArcMesh.position.set(0, 0.86, 0.28);
  slashArcMesh.visible = false;
  root.add(slashArcMesh);

  let currentEquippedWeapon: WeaponType = initialWeapon;

  const applyWeapon = (weaponId: WeaponType) => {
    currentEquippedWeapon = weaponId;
    weaponVisualGroup.clear();
    const spec = WEAPON_CATALOG.find((w) => w.id === weaponId) || WEAPON_CATALOG[0];
    crystalMat.color.setHex(spec.primaryColorHex);
    crystalMat.emissive.setHex(spec.emissiveHex);

    const bladeMat = new THREE.MeshStandardMaterial({
      color: spec.primaryColorHex,
      emissive: spec.emissiveHex,
      emissiveIntensity: 0.95,
      roughness: 0.14,
      metalness: 0.9,
      side: THREE.DoubleSide,
    });

    if (weaponId === 'sunforged-greatsword') {
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.058, 0.58, 10), leatherMat);
      grip.position.y = -0.26;
      const pommel = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), goldMat);
      pommel.position.y = -0.58;
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.1, 0.15), goldMat);
      guard.position.y = 0.06;
      const bladeGeo = new THREE.ConeGeometry(0.21, 1.62, 4);
      bladeGeo.scale(1.0, 1.0, 0.26);
      bladeGeo.translate(0, 0.88, 0);
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.castShadow = true;
      weaponVisualGroup.add(grip, pommel, guard, blade);
      staffCrystal.position.set(0, 0.18, 0);
      staffRing.position.set(0, 0.18, 0);
    } else if (weaponId === 'runic-halberd') {
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.052, 1.82, 10), armorSteelMat);
      shaft.position.y = 0.12;
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.068, 0.2, 12), goldMat);
      collar.position.y = 0.92;
      const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.58, 6), bladeMat);
      spearTip.position.y = 1.3;
      const axeShape = new THREE.Shape();
      axeShape.moveTo(0, 0.65);
      axeShape.quadraticCurveTo(0.54, 0.9, 0.46, 1.28);
      axeShape.quadraticCurveTo(0.2, 1.04, 0, 1.08);
      axeShape.closePath();
      const axeBlade = new THREE.Mesh(new THREE.ShapeGeometry(axeShape), bladeMat);
      axeBlade.rotation.y = Math.PI / 2;
      weaponVisualGroup.add(shaft, collar, spearTip, axeBlade);
      staffCrystal.position.set(0, 0.98, 0);
      staffRing.position.set(0, 0.98, 0);
    } else {
      // 'astral-glaive'
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.05, 1.62, 10), armorSteelMat);
      shaft.position.y = 0.05;
      const guardRing = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.028, 8, 18), goldMat);
      guardRing.rotation.x = Math.PI / 2;
      guardRing.position.y = 0.8;
      const glaiveShape = new THREE.Shape();
      glaiveShape.moveTo(0, 0.8);
      glaiveShape.quadraticCurveTo(0.32, 1.16, 0.05, 1.65);
      glaiveShape.quadraticCurveTo(-0.09, 1.2, 0, 0.8);
      const glaiveBlade = new THREE.Mesh(new THREE.ShapeGeometry(glaiveShape), bladeMat);
      glaiveBlade.rotation.y = Math.PI / 2;
      weaponVisualGroup.add(shaft, guardRing, glaiveBlade);
      staffCrystal.position.set(0, 0.9, 0);
      staffRing.position.set(0, 0.9, 0);
    }
  };

  const triggerSlashArc = (comboStep: number, isCrit: boolean) => {
    const spec = WEAPON_CATALOG.find((w) => w.id === currentEquippedWeapon) || WEAPON_CATALOG[0];
    slashArcMesh.visible = true;
    slashArcMat.opacity = 0.92;
    if (isCrit || comboStep === 3) {
      slashArcMat.color.setHex(comboStep === 3 ? 0xfbbf24 : 0xf43f5e);
      slashArcMesh.scale.set(1.38, 1.38, 1.38);
      slashArcMesh.rotation.x = 0;
    } else if (comboStep === 2) {
      slashArcMat.color.setHex(0x38bdf8);
      slashArcMesh.scale.set(1.12, 1.12, 1.12);
      slashArcMesh.rotation.x = 0.25;
    } else {
      slashArcMat.color.setHex(spec.primaryColorHex);
      slashArcMesh.scale.set(1.0, 1.0, 1.0);
      slashArcMesh.rotation.x = -0.2;
    }
  };

  // 10b. High/Ultra Orbiting Runic Ward Halo around Warden
  const auraHaloGroup = new THREE.Group();
  auraHaloGroup.position.set(0, 0.95, 0);
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2;
    const mote = new THREE.Mesh(new THREE.OctahedronGeometry(0.068, 0), crystalMat);
    mote.position.set(Math.cos(ang) * 0.84, Math.sin(ang * 2) * 0.14, Math.sin(ang) * 0.84);
    auraHaloGroup.add(mote);
  }
  const auraRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.82, 0.013, 6, 28),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
  );
  auraRing.rotation.x = Math.PI / 2.2;
  auraHaloGroup.add(auraRing);
  bodyGroup.add(auraHaloGroup);

  // 10c. 3D Runic Aegis Parry Ward & AoE Deflect Shockwave Ring
  const parryShieldGroup = new THREE.Group();
  parryShieldGroup.position.set(0, 0.92, 0.68);
  parryShieldGroup.visible = false;

  const shieldHexGeo = new THREE.RingGeometry(0.32, 0.72, 6);
  const shieldHexMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const shieldHexMesh = new THREE.Mesh(shieldHexGeo, shieldHexMat);
  const shieldCoreGeo = new THREE.CircleGeometry(0.34, 6);
  const shieldCoreMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const shieldCoreMesh = new THREE.Mesh(shieldCoreGeo, shieldCoreMat);
  const shieldOuterFrame = new THREE.Mesh(
    new THREE.TorusGeometry(0.74, 0.032, 6, 6),
    goldMat
  );
  parryShieldGroup.add(shieldHexMesh, shieldCoreMesh, shieldOuterFrame);
  root.add(parryShieldGroup);

  const parryShockwaveGeo = new THREE.RingGeometry(0.65, 1.15, 36);
  parryShockwaveGeo.rotateX(-Math.PI / 2);
  const parryShockwaveMat = new THREE.MeshBasicMaterial({
    color: 0xffd166,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const parryShockwaveMesh = new THREE.Mesh(parryShockwaveGeo, parryShockwaveMat);
  parryShockwaveMesh.position.set(0, 0.14, 0);
  parryShockwaveMesh.visible = false;
  root.add(parryShockwaveMesh);

  // 11. Diegetic 3D Tactical Objective Compass at Warden's Feet
  const compassGroup = new THREE.Group();
  compassGroup.position.y = 0.08;

  const compassRingGeo = new THREE.RingGeometry(0.84, 0.95, 32);
  compassRingGeo.rotateX(-Math.PI / 2);
  const compassRingMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 0.52,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const compassRing = new THREE.Mesh(compassRingGeo, compassRingMat);
  compassGroup.add(compassRing);

  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(0, 0.42);
  arrowShape.lineTo(0.25, -0.12);
  arrowShape.lineTo(0, -0.02);
  arrowShape.lineTo(-0.25, -0.12);
  arrowShape.closePath();
  const arrowGeo = new THREE.ShapeGeometry(arrowShape);
  arrowGeo.rotateX(Math.PI / 2);
  const compassArrowMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const arrowMesh = new THREE.Mesh(arrowGeo, compassArrowMat);
  arrowMesh.position.set(0, 0.03, 1.16);
  compassGroup.add(arrowMesh);

  root.add(compassGroup);

  const shadow = createContactShadow(0.88);
  root.add(shadow);

  const applyCustomization = (custom: CharacterCustomization) => {
    const bodyOpt =
      CUSTOMIZATION_OPTIONS.bodyTypes.find((b) => b.id === custom.bodyType) ||
      CUSTOMIZATION_OPTIONS.bodyTypes[0];
    bodyGroup.scale.set(bodyOpt.scale[0], bodyOpt.scale[1], bodyOpt.scale[2]);

    skinMat.color.set(custom.skinColor);
    hairMat.color.set(custom.hairColor);
    clothingMat.color.set(custom.clothingColor);

    sproutTop.clear();
    if (custom.hairstyle === 'twin-sprout') {
      // Astral Horned Valkyrie Great-Crest
      const diadem = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.038, 8, 22), goldMat);
      diadem.rotation.x = Math.PI / 2;
      diadem.position.y = -0.18;
      const hornGeo = new THREE.ConeGeometry(0.08, 0.56, 8);
      hornGeo.translate(0, 0.26, 0);
      const leftHorn = new THREE.Mesh(hornGeo, goldMat);
      leftHorn.position.set(-0.25, -0.12, 0.14);
      leftHorn.rotation.set(-0.25, 0, 0.44);
      const rightHorn = new THREE.Mesh(hornGeo, goldMat);
      rightHorn.position.set(0.25, -0.12, 0.14);
      rightHorn.rotation.set(-0.25, 0, -0.44);
      const centerGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.095, 0), crystalMat);
      centerGem.position.set(0, -0.05, 0.37);
      sproutTop.add(diadem, leftHorn, rightHorn, centerGem);
    } else if (custom.hairstyle === 'fluffy-bob') {
      // Swept Battle-Worn Warrior Hair
      const domeGeo = new THREE.SphereGeometry(0.44, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.62);
      const dome = new THREE.Mesh(domeGeo, hairMat);
      dome.position.y = -0.32;
      const crestSpike = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.42, 6), hairMat);
      crestSpike.position.set(0, -0.02, -0.14);
      crestSpike.rotation.x = -0.48;
      sproutTop.add(dome, crestSpike);
    } else if (custom.hairstyle === 'braided-crown') {
      // Valkyrie War-Braids & Gold Circlet
      const ringGeo = new THREE.TorusGeometry(0.36, 0.055, 10, 22);
      ringGeo.rotateX(Math.PI / 2);
      const crown = new THREE.Mesh(ringGeo, goldMat);
      crown.position.y = -0.16;
      const braidGeo = new THREE.CapsuleGeometry(0.075, 0.44, 8, 10);
      const b1 = new THREE.Mesh(braidGeo, hairMat);
      b1.position.set(-0.36, -0.44, -0.08);
      b1.rotation.z = 0.22;
      const b2 = new THREE.Mesh(braidGeo, hairMat);
      b2.position.set(0.36, -0.44, -0.08);
      b2.rotation.z = -0.22;
      sproutTop.add(crown, b1, b2);
    } else if (custom.hairstyle === 'mushroom-beret') {
      // Ancient Warden Great-Helm & Plume
      const helmGeo = new THREE.SphereGeometry(0.46, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.66);
      const helm = new THREE.Mesh(helmGeo, armorSteelMat);
      helm.position.y = -0.28;
      const crestFin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.58), goldMat);
      crestFin.position.set(0, 0.08, -0.04);
      const plume = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.52, 8), hairMat);
      plume.position.set(0, 0.18, -0.28);
      plume.rotation.x = -0.78;
      sproutTop.add(helm, crestFin, plume);
    } else if (custom.hairstyle === 'sun-halo') {
      // Sunforged Sovereign Diadem Halo
      const haloRing = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.032, 8, 24), goldMat);
      haloRing.position.set(0, 0.05, -0.08);
      sproutTop.add(haloRing);
      const rayGeo = new THREE.ConeGeometry(0.048, 0.26, 6);
      for (let i = 0; i < 7; i++) {
        const ang = -Math.PI * 0.6 + (i / 6) * Math.PI * 1.2;
        const ray = new THREE.Mesh(rayGeo, goldMat);
        ray.position.set(Math.sin(ang) * 0.39, 0.05 + Math.cos(ang) * 0.39, -0.08);
        ray.rotation.z = -ang;
        sproutTop.add(ray);
      }
    }

    faceGroup.clear();
    const scleraMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
    const irisMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.85,
      roughness: 0.12,
    });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const browGeo = new THREE.BoxGeometry(0.145, 0.034, 0.042);
    const lBrow = new THREE.Mesh(browGeo, hairMat);
    lBrow.position.set(-0.15, 0.13, 0.38);
    lBrow.rotation.z = -0.2;
    const rBrow = new THREE.Mesh(browGeo, hairMat);
    rBrow.position.set(0.15, 0.13, 0.38);
    rBrow.rotation.z = 0.2;
    faceGroup.add(lBrow, rBrow);

    if (custom.facialFeature === 'scholar-glasses') {
      const visorGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.15, 16, 1, false, -Math.PI * 0.35, Math.PI * 0.7);
      const visor = new THREE.Mesh(visorGeo, crystalMat);
      visor.rotation.y = Math.PI;
      visor.position.set(0, 0.04, 0.02);
      faceGroup.add(visor);
    } else {
      const buildWardenEye = (xOffset: number) => {
        const eyeNode = new THREE.Group();
        eyeNode.position.set(xOffset, 0.03, 0.37);
        const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), scleraMat);
        sclera.scale.set(1.18, 0.72, 0.45);
        const iris = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 10), irisMat);
        iris.scale.set(1.0, 0.72, 0.45);
        iris.position.z = 0.016;
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), pupilMat);
        pupil.position.z = 0.028;
        eyeNode.add(sclera, iris, pupil);
        return eyeNode;
      };
      faceGroup.add(buildWardenEye(-0.15), buildWardenEye(0.15));
    }

    clothingGroup.clear();
    if (custom.clothing === 'leaf-cloak') {
      const collarGeo = new THREE.TorusGeometry(0.36, 0.065, 10, 20);
      collarGeo.rotateX(Math.PI / 2);
      const collar = new THREE.Mesh(collarGeo, goldMat);
      collar.position.y = 1.08;
      clothingGroup.add(collar);
    } else if (custom.clothing === 'traveler-poncho') {
      const mantleGeo = new THREE.ConeGeometry(0.58, 0.48, 16, 1, true);
      const mantle = new THREE.Mesh(mantleGeo, clothingMat);
      mantle.position.y = 0.9;
      clothingGroup.add(mantle);
    } else if (custom.clothing === 'sun-robe') {
      const tassetGeo = new THREE.CylinderGeometry(0.38, 0.54, 0.56, 16);
      const tasset = new THREE.Mesh(tassetGeo, clothingMat);
      tasset.position.y = 0.52;
      const trim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.035, 8, 20), goldMat);
      trim.rotation.x = Math.PI / 2;
      trim.position.y = 0.62;
      clothingGroup.add(tasset, trim);
    } else if (custom.clothing === 'berry-overalls') {
      const guardPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.5, 0.46, 16), armorSteelMat);
      guardPlate.position.y = 0.52;
      clothingGroup.add(guardPlate);
    }
  };

  const setHighDetailEnabled = (_enabled: boolean) => {
    satchelGroup.visible = true;
    staffRing.visible = true;
    auraHaloGroup.visible = true;
  };

  const setQualityTier = (_quality: 'eco' | 'balanced' | 'high' | 'ultra') => {
    satchelGroup.visible = true;
    staffRing.visible = true;
    auraHaloGroup.visible = true;
  };

  applyCustomization(initialCustom);
  applyWeapon(initialWeapon);

  return {
    root,
    bodyGroup,
    bodyMesh,
    headMesh,
    sproutTop,
    faceGroup,
    clothingGroup,
    satchelGroup,
    cape,
    leftArm,
    rightArm,
    staff,
    staffCrystal,
    staffRing,
    slashArcMesh,
    slashArcMat,
    parryShieldGroup,
    parryShockwaveMesh,
    parryShockwaveMat,
    auraHaloGroup,
    leftFoot,
    rightFoot,
    compassGroup,
    compassArrowMat,
    shadow,
    skinMat,
    hairMat,
    clothingMat,
    swingAngle: 0,
    applyCustomization,
    applyWeapon,
    triggerSlashArc,
    setHighDetailEnabled,
    setQualityTier,
  };
}

/**
 * The Astral Bastion Keep (Sanctuary Citadel Safe Zone at x: 0, z: 14)
 * Replaces the old cottage with an imposing Obsidian, Slate & Gold Gothic-Mythic Bastion!
 */
export interface HomeBaseRig {
  root: THREE.Group;
  roofMesh: THREE.Mesh;
  hearthGroup: THREE.Group;
  gardenGroup: THREE.Group;
  trophyGroup: THREE.Group;
  hearthLight: THREE.PointLight;
  windowMesh: THREE.Mesh;
  applyHomeCustomization: (custom: HomeBaseCustomization, trophies: TrophyStatus) => void;
}

export function createHomeBaseModel(
  initialCustom: HomeBaseCustomization = DEFAULT_HOME_BASE,
  initialTrophies: TrophyStatus = {
    shrineTrophy: false,
    cleanserTrophy: false,
    seedHoarderTrophy: false,
    guardianCrownTrophy: false,
  }
): HomeBaseRig {
  const root = new THREE.Group();

  // Octagonal Obsidian & Burnished Gold Citadel Platform
  const terraceGeo = new THREE.CylinderGeometry(6.0, 6.3, 0.24, 16);
  const terraceMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.45,
    metalness: 0.65,
  });
  const terrace = new THREE.Mesh(terraceGeo, terraceMat);
  terrace.position.y = 0.12;
  terrace.receiveShadow = true;
  root.add(terrace);

  // Glowing Astral Protection Ward Circle
  const borderGeo = new THREE.RingGeometry(5.75, 6.08, 48);
  borderGeo.rotateX(-Math.PI / 2);
  const borderMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.65,
  });
  const borderRing = new THREE.Mesh(borderGeo, borderMat);
  borderRing.position.y = 0.25;
  root.add(borderRing);

  const innerRuneRingGeo = new THREE.RingGeometry(4.1, 4.22, 32);
  innerRuneRingGeo.rotateX(-Math.PI / 2);
  const innerRuneRing = new THREE.Mesh(
    innerRuneRingGeo,
    new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.4 })
  );
  innerRuneRing.position.y = 0.25;
  root.add(innerRuneRing);

  // Grand Astral Bastion Keep Structure
  const keepGroup = new THREE.Group();
  keepGroup.position.set(0, 0.22, 3.2);
  root.add(keepGroup);

  const bastionStoneMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.38,
    metalness: 0.72,
  });
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    roughness: 0.2,
    metalness: 0.88,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x0f766e,
    roughness: 0.32,
    metalness: 0.65,
  });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.15,
    roughness: 0.15,
  });

  // Main Octagonal Citadel Keep Walls
  const walls = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.95, 2.35, 8), bastionStoneMat);
  walls.position.y = 1.15;
  walls.castShadow = true;
  walls.receiveShadow = true;
  keepGroup.add(walls);

  // 4 Buttressed Corner Watch-Towers
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const tx = Math.cos(ang) * 1.65;
    const tz = Math.sin(ang) * 1.65;
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.46, 2.85, 8), bastionStoneMat);
    tower.position.set(tx, 1.42, tz);
    tower.castShadow = true;
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.95, 8), goldTrimMat);
    spire.position.set(tx, 3.3, tz);
    keepGroup.add(tower, spire);
  }

  // Grand Sovereign Vaulted Dome Roof + Levitating Astrolabe Finial & Orbiting Rings
  const roofMesh = new THREE.Mesh(new THREE.ConeGeometry(2.38, 1.95, 16), roofMat);
  roofMesh.position.y = 3.25;
  roofMesh.castShadow = true;
  keepGroup.add(roofMesh);

  const roofCrownRing = new THREE.Mesh(new THREE.TorusGeometry(1.82, 0.08, 10, 32), goldTrimMat);
  roofCrownRing.rotation.x = Math.PI / 2;
  roofCrownRing.position.y = 2.35;
  keepGroup.add(roofCrownRing);

  const finialCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 1), windowMat);
  finialCrystal.scale.set(0.8, 1.85, 0.8);
  finialCrystal.position.y = 4.65;
  keepGroup.add(finialCrystal);

  const finialAstrolabe = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.035, 8, 24), goldTrimMat);
  finialAstrolabe.position.y = 4.65;
  finialAstrolabe.rotation.x = Math.PI / 3;
  keepGroup.add(finialAstrolabe);

  // Gothic Runic Sanctum Gate, Twin Beacon Pillars & Rose Window
  const gateFrame = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.45, 0.28), goldTrimMat);
  gateFrame.position.set(0, 0.72, -1.78);
  const gatePortal = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.28, 0.32), bastionStoneMat);
  gatePortal.position.set(0, 0.68, -1.8);
  keepGroup.add(gateFrame, gatePortal);

  for (const side of [-0.68, 0.68]) {
    const gatePillar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 1.55, 10), goldTrimMat);
    gatePillar.position.set(side, 0.78, -1.86);
    const gateLantern = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), windowMat);
    gateLantern.position.set(side, 1.68, -1.86);
    keepGroup.add(gatePillar, gateLantern);
  }

  const windowMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.18, 24), windowMat);
  windowMesh.rotation.x = Math.PI / 2;
  windowMesh.position.set(0, 1.75, -1.76);
  const windowFrame = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.045, 8, 24), goldTrimMat);
  windowFrame.position.set(0, 1.75, -1.84);
  keepGroup.add(windowMesh, windowFrame);

  // Arcane Soul-Forge Brazier Group
  const hearthGroup = new THREE.Group();
  hearthGroup.position.set(-2.2, 0.22, 0.4);
  root.add(hearthGroup);

  const hearthLight = new THREE.PointLight(0x38bdf8, 1.45, 12);
  hearthLight.position.set(-2.2, 1.6, 0.4);
  root.add(hearthLight);

  // Perimeter Runic Ward Obelisks Group
  const gardenGroup = new THREE.Group();
  gardenGroup.position.set(0, 0.22, 0);
  root.add(gardenGroup);

  // 4 Champion Relic Pedestals Group
  const trophyGroup = new THREE.Group();
  trophyGroup.position.set(2.2, 0.22, 0.5);
  root.add(trophyGroup);

  const roofColors: Record<string, number> = {
    moss: 0x0f766e,
    terracotta: 0x991b1b,
    slate: 0x1e3a8a,
    sakura: 0x6b21a8,
  };

  const applyHomeCustomization = (custom: HomeBaseCustomization, trophies: TrophyStatus) => {
    roofMat.color.setHex(roofColors[custom.roofStyle] || 0x0f766e);

    hearthGroup.clear();
    if (custom.hearthStyle === 'campfire') {
      // Sunforged War-Brazier
      const anvilBase = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.78, 0.52, 8), bastionStoneMat);
      anvilBase.position.y = 0.26;
      const bowl = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.1, 8, 16), goldTrimMat);
      bowl.rotation.x = Math.PI / 2;
      bowl.position.y = 0.52;
      const flameMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xea580c,
        emissiveIntensity: 1.35,
      });
      const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 1), flameMat);
      flame.scale.set(0.9, 1.6, 0.9);
      flame.position.y = 0.95;
      hearthGroup.add(anvilBase, bowl, flame);
      hearthLight.color.setHex(0xfbbf24);
    } else if (custom.hearthStyle === 'fountain') {
      // Astral Mana Conduit Font
      const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.72, 0.42, 12), bastionStoneMat);
      basin.position.y = 0.21;
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.95,
        roughness: 0.1,
      });
      const spire = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), waterMat);
      spire.scale.set(0.8, 2.1, 0.8);
      spire.position.y = 0.95;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.04, 8, 20), goldTrimMat);
      ring.rotation.x = Math.PI / 3;
      ring.position.y = 0.95;
      hearthGroup.add(basin, spire, ring);
      hearthLight.color.setHex(0x38bdf8);
    } else {
      // Celestial Astrolabe Beacon Pylon
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 1.65, 8), bastionStoneMat);
      post.position.y = 0.82;
      const orbMat = new THREE.MeshStandardMaterial({
        color: 0xc084fc,
        emissive: 0x7e22ce,
        emissiveIntensity: 1.35,
      });
      const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 1), orbMat);
      orb.position.y = 1.85;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.035, 8, 20), goldTrimMat);
      ring.position.y = 1.85;
      hearthGroup.add(post, orb, ring);
      hearthLight.color.setHex(0xc084fc);
    }

    gardenGroup.clear();
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const gx = Math.cos(ang) * 5.25;
      const gz = Math.sin(ang) * 5.25;

      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.28, 6), bastionStoneMat);
      plinth.position.set(gx, 0.14, gz);
      gardenGroup.add(plinth);

      if (custom.gardenStyle === 'flowers') {
        const shardMat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0xfbbf24 : 0x38bdf8,
          emissive: i % 2 === 0 ? 0xd97706 : 0x0284c7,
          emissiveIntensity: 0.75,
          roughness: 0.2,
        });
        const obelisk = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), shardMat);
        obelisk.scale.set(0.75, 1.85, 0.75);
        obelisk.position.set(gx, 0.58, gz);
        gardenGroup.add(obelisk);
      } else if (custom.gardenStyle === 'mushrooms') {
        const wardMat = new THREE.MeshStandardMaterial({
          color: 0x2dd4bf,
          emissive: 0x0d9488,
          emissiveIntensity: 0.85,
        });
        const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.65, 6), wardMat);
        crystal.position.set(gx, 0.56, gz);
        gardenGroup.add(crystal);
      } else {
        const monolith = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.78, 0.28), goldTrimMat);
        monolith.position.set(gx, 0.52, gz);
        gardenGroup.add(monolith);
      }
    }

    trophyGroup.clear();
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.75,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.65,
      metalness: 0.9,
      roughness: 0.15,
    });
    const lockedMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.75,
      transparent: true,
      opacity: 0.45,
    });

    const trophyList = [
      { unlocked: trophies.shrineTrophy, offset: [-1.2, 0] },
      { unlocked: trophies.cleanserTrophy, offset: [-0.4, 0.6] },
      { unlocked: trophies.seedHoarderTrophy, offset: [0.4, 0.6] },
      { unlocked: trophies.guardianCrownTrophy, offset: [1.2, 0] },
    ];

    trophyList.forEach((t, idx) => {
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.62, 8), pedMat);
      ped.position.set(t.offset[0], 0.31, t.offset[1]);
      trophyGroup.add(ped);

      const statGeo =
        idx === 0
          ? new THREE.OctahedronGeometry(0.24, 0)
          : idx === 1
          ? new THREE.TorusKnotGeometry(0.15, 0.05, 24, 6)
          : idx === 2
          ? new THREE.DodecahedronGeometry(0.22, 0)
          : new THREE.ConeGeometry(0.24, 0.46, 6);

      const stat = new THREE.Mesh(statGeo, t.unlocked ? goldMat : lockedMat);
      stat.position.set(t.offset[0], 0.84, t.offset[1]);
      trophyGroup.add(stat);
    });
  };

  applyHomeCustomization(initialCustom, initialTrophies);

  return {
    root,
    roofMesh,
    hearthGroup,
    gardenGroup,
    trophyGroup,
    hearthLight,
    windowMesh,
    applyHomeCustomization,
  };
}

/**
 * 1. Void Stalker Fiend (Replaces Puffer):
 * Menacing 12-part hunched Void-Reaper Construct with segmented obsidian carapace,
 * glowing crimson-violet visor eyes, twin curved plasma-scythe foreblades, and dorsal crystal spines.
 */
export function createPufferModel(biome: StageBiomeTheme = getStageBiomeTheme(1)): {
  root: THREE.Group;
  cap: THREE.Mesh;
  stem: THREE.Mesh;
  shadow: THREE.Mesh;
} {
  const root = new THREE.Group();

  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.32,
    metalness: 0.82,
  });
  const carapaceMat = new THREE.MeshStandardMaterial({
    color: biome.pufferCapHex,
    roughness: 0.25,
    metalness: 0.72,
  });
  const plasmaMat = new THREE.MeshStandardMaterial({
    color: biome.pufferSpotHex,
    emissive: biome.pufferSpotHex,
    emissiveIntensity: 1.15,
    roughness: 0.15,
    side: THREE.DoubleSide,
  });
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xe11d48,
    emissiveIntensity: 1.4,
  });

  // Lower Armored Locust/Stalker Chassis (`stem`) + Thruster Legs
  const stemGeo = new THREE.CylinderGeometry(0.32, 0.22, 0.62, 8);
  const stem = new THREE.Mesh(stemGeo, chassisMat);
  stem.position.y = 0.38;
  stem.castShadow = true;
  root.add(stem);

  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.48, 6), chassisMat);
    leg.position.set(side * 0.28, 0.22, -0.05);
    leg.rotation.z = side * 0.35;
    root.add(leg);

    // Twin Curved Plasma-Scythe Forearms
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.36, 0.12), carapaceMat);
    arm.position.set(side * 0.42, 0.56, 0.22);
    arm.rotation.x = 0.65;
    const scytheShape = new THREE.Shape();
    scytheShape.moveTo(0, 0);
    scytheShape.quadraticCurveTo(0.22, 0.28, 0.05, 0.62);
    scytheShape.quadraticCurveTo(-0.06, 0.28, 0, 0);
    const scythe = new THREE.Mesh(new THREE.ShapeGeometry(scytheShape), plasmaMat);
    scythe.position.set(side * 0.44, 0.42, 0.34);
    scythe.rotation.y = Math.PI / 2;
    scythe.rotation.x = 0.45;
    root.add(arm, scythe);
  }

  // Hunched Armored Carapace Hood (`cap`) + Dorsal Void Spines
  const capGeo = new THREE.DodecahedronGeometry(0.56, 1);
  capGeo.scale(1.08, 0.78, 1.18);
  const cap = new THREE.Mesh(capGeo, carapaceMat);
  cap.position.set(0, 0.76, -0.04);
  cap.castShadow = true;
  root.add(cap);

  const spineGeo = new THREE.OctahedronGeometry(0.15, 0);
  spineGeo.scale(0.65, 1.85, 0.65);
  [
    [0, 1.16, -0.08],
    [-0.24, 1.04, -0.22],
    [0.24, 1.04, -0.22],
  ].forEach(([x, y, z]) => {
    const spine = new THREE.Mesh(spineGeo, plasmaMat);
    spine.position.set(x, y, z);
    spine.rotation.x = -0.35;
    root.add(spine);
  });

  // Menacing Slit Visor Eyes
  const eyeGeo = new THREE.BoxGeometry(0.18, 0.055, 0.08);
  const e1 = new THREE.Mesh(eyeGeo, visorMat);
  e1.position.set(-0.16, 0.68, 0.48);
  e1.rotation.z = -0.22;
  const e2 = new THREE.Mesh(eyeGeo, visorMat);
  e2.position.set(0.16, 0.68, 0.48);
  e2.rotation.z = 0.22;
  root.add(e1, e2);

  const shadow = createContactShadow(0.68);
  root.add(shadow);

  return { root, cap, stem, shadow };
}

/**
 * 2. Obsidian Siege Juggernaut (Replaces Roller):
 * Heavy war-sphere plated in interlocking spiked dark-steel bands, glowing molten core fissures,
 * horned iron war-mask, and a tactical laser charge path telegraph on the ground.
 */
export function createRollerModel(biome: StageBiomeTheme = getStageBiomeTheme(1)): {
  root: THREE.Group;
  ball: THREE.Mesh;
  telegraph: THREE.Mesh;
  shadow: THREE.Mesh;
} {
  const root = new THREE.Group();

  const shellMat = new THREE.MeshStandardMaterial({
    color: biome.rollerShellHex,
    roughness: 0.28,
    metalness: 0.85,
  });
  const armorBandMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.35,
    metalness: 0.88,
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color: biome.rollerGlowHex,
    emissive: biome.rollerGlowHex,
    emissiveIntensity: 1.25,
    roughness: 0.15,
  });

  const ballGeo = new THREE.IcosahedronGeometry(0.68, 2);
  const ball = new THREE.Mesh(ballGeo, shellMat);
  ball.position.y = 0.68;
  ball.castShadow = true;
  root.add(ball);

  // Interlocking Spiked Iron War-Bands inside `ball`
  const band1 = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.075, 8, 20), armorBandMat);
  band1.rotation.y = Math.PI / 2;
  const band2 = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.06, 8, 20), glowMat);
  band2.position.x = 0.28;
  band2.rotation.y = Math.PI / 2;
  const band3 = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.06, 8, 20), glowMat);
  band3.position.x = -0.28;
  band3.rotation.y = Math.PI / 2;
  ball.add(band1, band2, band3);

  // Heavy Siege Spikes & Molten Core Nodes
  const spikeGeo = new THREE.ConeGeometry(0.14, 0.42, 5);
  spikeGeo.translate(0, 0.18, 0);

  const spikeAngles = [
    [0, 0, 0.66],
    [0, 0, -0.66],
    [0.66, 0, 0],
    [-0.66, 0, 0],
    [0.46, 0.46, 0.46],
    [-0.46, 0.46, -0.46],
    [0.46, -0.46, -0.46],
    [-0.46, -0.46, 0.46],
    [0, 0.66, 0],
  ];

  spikeAngles.forEach(([x, y, z], idx) => {
    const spike = new THREE.Mesh(spikeGeo, idx % 2 === 0 ? glowMat : armorBandMat);
    spike.position.set(x, y, z);
    spike.lookAt(x * 2, y * 2, z * 2);
    spike.rotation.x += Math.PI / 2;
    ball.add(spike);
  });

  // Horned Iron War-Crest & Slit Visor on Front
  const hornGeo = new THREE.ConeGeometry(0.08, 0.44, 6);
  const hornL = new THREE.Mesh(hornGeo, armorBandMat);
  hornL.position.set(-0.32, 1.24, 0.32);
  hornL.rotation.set(0.45, 0, 0.42);
  const hornR = new THREE.Mesh(hornGeo, armorBandMat);
  hornR.position.set(0.32, 1.24, 0.32);
  hornR.rotation.set(0.45, 0, -0.42);
  root.add(hornL, hornR);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.09, 0.14), glowMat);
  visor.position.set(0, 0.78, 0.62);
  root.add(visor);

  const telGeo = new THREE.PlaneGeometry(1.35, 8.4);
  const telMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const telegraph = new THREE.Mesh(telGeo, telMat);
  telegraph.rotation.x = -Math.PI / 2;
  telegraph.position.set(0, 0.04, 4.2);
  telegraph.renderOrder = 2;
  root.add(telegraph);

  const shadow = createContactShadow(0.86);
  root.add(shadow);

  return { root, ball, telegraph, shadow };
}

/**
 * 3. Abyssal Archon Wraith (Replaces Sprite):
 * Eldritch floating void-caster with a fractured dark-crystal core, eclipse halo crown,
 * 4 levitating geometric runic blade-wings, and orbiting void focus prisms.
 */
export function createSpriteModel(biome: StageBiomeTheme = getStageBiomeTheme(1)): {
  root: THREE.Group;
  orb: THREE.Mesh;
  wings: THREE.Group;
  shadow: THREE.Mesh;
} {
  const root = new THREE.Group();

  const orbMat = new THREE.MeshStandardMaterial({
    color: biome.spriteBodyHex,
    emissive: biome.spriteBodyHex,
    emissiveIntensity: 0.75,
    roughness: 0.18,
    metalness: 0.65,
  });
  const crownMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.85,
    roughness: 0.2,
    metalness: 0.85,
  });
  const wingMat = new THREE.MeshStandardMaterial({
    color: biome.spriteWingHex,
    emissive: biome.spriteWingHex,
    emissiveIntensity: 0.85,
    transparent: true,
    opacity: 0.88,
    roughness: 0.12,
    metalness: 0.5,
    side: THREE.DoubleSide,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.4,
  });

  // Faceted Archon Core Bust (`orb`)
  const orbGeo = new THREE.OctahedronGeometry(0.46, 1);
  const orb = new THREE.Mesh(orbGeo, orbMat);
  orb.position.y = 1.45;
  orb.castShadow = true;
  root.add(orb);

  // Armored Spire Tail & Eclipse Halo Crown
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.72, 6), orbMat);
  tail.rotation.x = Math.PI;
  tail.position.set(0, -0.48, -0.04);
  orb.add(tail);

  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 8, 20), crownMat);
  halo.rotation.x = Math.PI / 2.4;
  halo.position.set(0, 0.52, -0.06);
  orb.add(halo);

  // Orbiting Void Focus Prisms
  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * Math.PI * 2;
    const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.095, 0), crownMat);
    shard.scale.set(0.7, 1.6, 0.7);
    shard.position.set(Math.cos(ang) * 0.66, Math.sin(ang * 2) * 0.14, Math.sin(ang) * 0.66);
    orb.add(shard);
  }

  const eyeGeo = new THREE.BoxGeometry(0.14, 0.045, 0.06);
  const e1 = new THREE.Mesh(eyeGeo, eyeMat);
  e1.position.set(-0.14, 1.48, 0.42);
  e1.rotation.z = -0.18;
  const e2 = new THREE.Mesh(eyeGeo, eyeMat);
  e2.position.set(0.14, 1.48, 0.42);
  e2.rotation.z = 0.18;
  root.add(e1, e2);

  // 4 Levitating Geometric Runic Blade-Wings
  const wings = new THREE.Group();
  wings.position.set(0, 1.48, -0.24);

  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(0.55, 0.48);
  wingShape.lineTo(0.98, 0.18);
  wingShape.lineTo(0.45, -0.18);
  wingShape.closePath();
  const wingGeo = new THREE.ShapeGeometry(wingShape);

  const lw = new THREE.Mesh(wingGeo, wingMat);
  lw.rotation.z = 0.28;
  const rw = new THREE.Mesh(wingGeo, wingMat);
  rw.rotation.z = Math.PI - 0.28;
  rw.scale.y = -1;

  const lwLower = new THREE.Mesh(wingGeo, wingMat);
  lwLower.scale.set(0.72, 0.72, 0.72);
  lwLower.rotation.z = -0.32;
  const rwLower = new THREE.Mesh(wingGeo, wingMat);
  rwLower.scale.set(0.72, -0.72, 0.72);
  rwLower.rotation.z = Math.PI + 0.32;

  wings.add(lw, rw, lwLower, rwLower);
  root.add(wings);

  const shadow = createContactShadow(0.58);
  root.add(shadow);

  return { root, orb, wings, shadow };
}

/**
 * Ancient Astral Obelisk Shrine: 4 scattered across realm with astrolabe rings & Astral Tether Beam to Boss
 */
export function createShrineModel(name: string): {
  root: THREE.Group;
  crystal: THREE.Mesh;
  ring: THREE.Mesh;
  beamMesh: THREE.Mesh;
  light: THREE.PointLight;
} {
  const root = new THREE.Group();
  root.name = name;

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.42,
    metalness: 0.72,
  });
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    roughness: 0.22,
    metalness: 0.85,
  });
  const runeMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35,
    roughness: 0.2,
    metalness: 0.6,
  });
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.95,
    roughness: 0.1,
    metalness: 0.4,
  });

  // Stepped Octagonal Obsidian Dais
  const base1 = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.78, 0.44, 8), stoneMat);
  base1.position.y = 0.22;
  base1.receiveShadow = true;
  root.add(base1);

  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.12, 0.34, 8), goldTrimMat);
  base2.position.y = 0.58;
  base2.receiveShadow = true;
  root.add(base2);

  // 4 Carved Runic Obelisk Pillars + Crown Astrolabe Arch
  const pillarGeo = new THREE.BoxGeometry(0.36, 2.4, 0.36);
  const angles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
  angles.forEach((ang) => {
    const pillar = new THREE.Mesh(pillarGeo, stoneMat);
    pillar.position.set(Math.cos(ang) * 1.55, 1.7, Math.sin(ang) * 1.55);
    pillar.rotation.y = ang;
    pillar.castShadow = true;
    root.add(pillar);
  });

  const crownArch = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.14, 8, 24), goldTrimMat);
  crownArch.rotation.x = Math.PI / 2;
  crownArch.position.y = 2.85;
  crownArch.castShadow = true;
  root.add(crownArch);

  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.72, 0), crystalMat);
  crystal.scale.set(0.85, 1.45, 0.85);
  crystal.position.y = 2.15;
  root.add(crystal);

  const ringGeo = new THREE.TorusGeometry(1.34, 0.08, 10, 28);
  ringGeo.rotateX(Math.PI / 2);
  const ring = new THREE.Mesh(ringGeo, runeMat);
  ring.position.y = 0.82;
  root.add(ring);

  // Astral Energy Tether Beam pointing to Central Titan Boss
  const beamGeo = new THREE.CylinderGeometry(0.09, 0.16, 1.0, 8);
  beamGeo.rotateX(Math.PI / 2);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.82,
  });
  const beamMesh = new THREE.Mesh(beamGeo, beamMat);
  beamMesh.position.y = 2.15;
  beamMesh.visible = false;
  root.add(beamMesh);

  const light = new THREE.PointLight(0x38bdf8, 0.85, 10);
  light.position.set(0, 2.2, 0);
  root.add(light);

  const shadow = createContactShadow(2.4);
  root.add(shadow);

  return { root, crystal, ring, beamMesh, light };
}

/**
 * Astral Starlight Shard Pickup (Replaces Sun-Seed)
 */
export function createSunSeedModel(): { root: THREE.Group; mesh: THREE.Mesh } {
  const root = new THREE.Group();

  const seedMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 1.15,
    roughness: 0.12,
    metalness: 0.65,
  });

  const geo = new THREE.OctahedronGeometry(0.38, 0);
  geo.scale(0.78, 1.45, 0.78);
  const mesh = new THREE.Mesh(geo, seedMat);
  mesh.position.y = 0.56;
  root.add(mesh);

  const haloGeo = new THREE.TorusGeometry(0.54, 0.032, 8, 22);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.82 });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.y = 0.56;
  halo.rotation.x = Math.PI / 3;
  root.add(halo);

  const shadow = createContactShadow(0.44);
  root.add(shadow);

  return { root, mesh };
}

/**
 * 4. Malakor, the Eclipse Titan (Central Colossus Boss at x: 0, z: 0):
 * 18-part Celestial-Void Armored Titan with obsidian leg greaves, sculpted war-cuirass,
 * horned sovereign helm, blazing eyes, exposed spinning Astral Singularity Core,
 * articulated war-gauntlets with plasma claws, levitating dorsal monolith crown,
 * and rotating Hex-Runic Aegis Shield Ring!
 */
export function createBossModel(): {
  root: THREE.Group;
  core: THREE.Mesh;
  branches: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  shieldRing: THREE.Mesh;
  eyeMat: THREE.MeshStandardMaterial;
  shadow: THREE.Mesh;
  applyBiomeTheme: (biome: StageBiomeTheme) => void;
} {
  const root = new THREE.Group();

  const barkMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.28,
    metalness: 0.84,
  });
  const darkBarkMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.35,
    metalness: 0.88,
  });
  const mossShoulderMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xb45309,
    emissiveIntensity: 0.32,
    roughness: 0.22,
    metalness: 0.88,
  });
  const crownGemMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.95,
    roughness: 0.15,
  });
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 1.25,
    roughness: 0.12,
    metalness: 0.5,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xef4444,
    emissiveIntensity: 1.4,
  });

  // 1. Armored Titan Dais & Buttress Greave Pillars
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 2.35, 1.15, 8), darkBarkMat);
  base.position.y = 0.58;
  base.castShadow = true;
  root.add(base);

  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const buttress = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.65, 0.68), barkMat);
    buttress.position.set(Math.cos(ang) * 1.82, 0.65, Math.sin(ang) * 1.82);
    buttress.rotation.y = -ang;
    buttress.rotation.x = 0.32;
    root.add(buttress);
  }

  // 2. Sculpted Obsidian War-Cuirass Torso
  const bodyGeo = new THREE.CylinderGeometry(1.58, 1.38, 2.85, 8);
  const body = new THREE.Mesh(bodyGeo, barkMat);
  body.position.y = 2.15;
  body.castShadow = true;
  body.receiveShadow = true;
  root.add(body);

  // 3. Horned Sovereign War-Helm & Blazing Visor Eyes
  const helmCrest = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.42, 0.85), mossShoulderMat);
  helmCrest.position.set(0, 3.12, 1.18);
  root.add(helmCrest);

  for (const side of [-1, 1]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.15, 6), mossShoulderMat);
    horn.position.set(side * 0.95, 3.55, 0.95);
    horn.rotation.z = -side * 0.45;
    horn.rotation.x = 0.35;
    root.add(horn);
  }

  const eyeGeo = new THREE.BoxGeometry(0.38, 0.12, 0.14);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.46, 2.82, 1.46);
  leftEye.rotation.z = -0.22;
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.46, 2.82, 1.46);
  rightEye.rotation.z = 0.22;
  root.add(leftEye, rightEye);

  // Exposed Astral Singularity Reactor Core inside Chest
  const coreFrame = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.16, 8, 16), mossShoulderMat);
  coreFrame.position.set(0, 1.98, 1.34);
  root.add(coreFrame);

  const coreGeo = new THREE.OctahedronGeometry(0.76, 1);
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(0, 1.98, 1.28);
  root.add(core);

  // 4. Articulated Colossal War-Gauntlet Arms + Plasma Claws
  const buildBossArm = (side: -1 | 1) => {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * 1.88, 2.9, 0.15);

    const pauldron = new THREE.Mesh(new THREE.OctahedronGeometry(0.76, 0), mossShoulderMat);
    pauldron.scale.set(1.2, 0.9, 1.1);
    pauldron.castShadow = true;

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.48, 1.8, 8), barkMat);
    forearm.position.set(side * 0.38, -0.98, 0.38);
    forearm.rotation.z = side * 0.25;
    forearm.rotation.x = -0.38;
    forearm.castShadow = true;

    const claw1 = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.82, 5), coreMat);
    claw1.position.set(side * 0.48, -1.92, 0.82);
    claw1.rotation.x = Math.PI * 0.75;

    armGroup.add(pauldron, forearm, claw1);
    return armGroup;
  };

  const leftArm = buildBossArm(-1);
  const rightArm = buildBossArm(1);
  root.add(leftArm, rightArm);

  // 5. Floating Dorsal Runic Monolith Crown (`branches`)
  const branches = new THREE.Group();
  branches.position.set(0, 3.65, 0);

  const monolithGeo = new THREE.BoxGeometry(0.38, 2.2, 0.24);
  monolithGeo.translate(0, 1.1, 0);
  const tipGeo = new THREE.OctahedronGeometry(0.3, 0);

  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const b = new THREE.Mesh(monolithGeo, darkBarkMat);
    b.position.set(Math.cos(ang) * 0.95, 0, Math.sin(ang) * 0.95);
    b.rotation.y = -ang;
    b.rotation.z = -Math.cos(ang) * 0.38;
    b.rotation.x = Math.sin(ang) * 0.38;
    b.castShadow = true;

    const tip = new THREE.Mesh(tipGeo, crownGemMat);
    tip.position.set(0, 2.35, 0);
    b.add(tip);

    branches.add(b);
  }
  root.add(branches);

  // 6. Rotating Hex-Runic Aegis Shield Ring
  const shieldGeo = new THREE.TorusGeometry(2.75, 0.13, 8, 32);
  shieldGeo.rotateX(Math.PI / 2);
  const shieldMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.1,
    transparent: true,
    opacity: 0.78,
  });
  const shieldRing = new THREE.Mesh(shieldGeo, shieldMat);
  shieldRing.position.y = 1.72;
  root.add(shieldRing);

  const shadow = createContactShadow(2.95);
  root.add(shadow);

  const applyBiomeTheme = (biome: StageBiomeTheme) => {
    barkMat.color.setHex(biome.bossBarkHex);
    mossShoulderMat.color.setHex(biome.bossCrownHex);
    crownGemMat.color.setHex(biome.flowerPalette[0] ?? 0xfbbf24);
    crownGemMat.emissive.setHex(biome.bossCrownHex);
    coreMat.color.setHex(biome.bossCoreHex);
    coreMat.emissive.setHex(biome.bossCoreHex);
    shieldMat.color.setHex(biome.bossShieldHex);
    shieldMat.emissive.setHex(biome.bossShieldHex);
    eyeMat.color.setHex(biome.rollerGlowHex);
    eyeMat.emissive.setHex(biome.bossCoreHex);
  };

  applyBiomeTheme(getStageBiomeTheme(1));

  return { root, core, branches, leftArm, rightArm, shieldRing, eyeMat, shadow, applyBiomeTheme };
}

// ============================================================================
// 8. STAGE-SPECIFIC 3D MISSION PROPS & DYNAMIC CENTERPIECES
// ============================================================================

/**
 * Stage 1 (Rescue & Escort): Captured Astral Sentinel Spirit + Destructible Void Obelisk Prison
 */
export function createLostSproutAndCageModel(): {
  sproutRoot: THREE.Group;
  cageRoot: THREE.Group;
} {
  const sproutRoot = new THREE.Group();

  const armorMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.2,
    metalness: 0.9,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.55,
    roughness: 0.18,
    metalness: 0.92,
  });
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.45,
  });

  // Armored Sentinel Torso, Pauldrons, Wing-Vanes & Halo Helm
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.64, 16), armorMat);
  torso.position.y = 0.42;
  torso.castShadow = true;
  sproutRoot.add(torso);

  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.035, 8, 20), goldMat);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.38;
  sproutRoot.add(belt);

  const helm = new THREE.Mesh(new THREE.OctahedronGeometry(0.31, 2), armorMat);
  helm.position.y = 0.88;
  sproutRoot.add(helm);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.085, 0.15), visorMat);
  visor.position.set(0, 0.88, 0.24);
  sproutRoot.add(visor);

  const crest = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 8), goldMat);
  crest.position.set(0, 1.24, 0);
  sproutRoot.add(crest);

  const sentinelHalo = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.025, 8, 24), goldMat);
  sentinelHalo.rotation.x = Math.PI / 2.2;
  sentinelHalo.position.set(0, 1.15, -0.05);
  sproutRoot.add(sentinelHalo);

  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.42, 6), visorMat);
    wing.position.set(side * 0.36, 0.58, -0.1);
    wing.rotation.z = -side * 0.6;
    sproutRoot.add(wing);
  }

  sproutRoot.add(createContactShadow(0.68));

  // Destructible Dark Void-Obelisk Prison Cage with Runic Chains & Corner Spires
  const cageRoot = new THREE.Group();
  const cageMat = new THREE.MeshStandardMaterial({
    color: 0x1e1b4b,
    emissive: 0x4c1d95,
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.84,
  });
  const runeLockMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xe11d48,
    emissiveIntensity: 1.4,
    roughness: 0.14,
  });

  const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.095, 10, 28), cageMat);
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.08;
  cageRoot.add(baseRing);

  const midRing = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.055, 8, 24), runeLockMat);
  midRing.rotation.x = Math.PI / 2;
  midRing.position.y = 0.74;
  cageRoot.add(midRing);

  const topRing = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.085, 10, 28), cageMat);
  topRing.rotation.x = Math.PI / 2;
  topRing.position.y = 1.4;
  cageRoot.add(topRing);

  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.42, 0.11), cageMat);
    bar.position.set(Math.cos(ang) * 0.78, 0.74, Math.sin(ang) * 0.78);
    bar.castShadow = true;
    const spireCap = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.28, 6), runeLockMat);
    spireCap.position.set(Math.cos(ang) * 0.78, 1.56, Math.sin(ang) * 0.78);
    cageRoot.add(bar, spireCap);
  }

  const lockGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 1), runeLockMat);
  lockGem.position.y = 1.68;
  const lockHalo = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.025, 8, 20), cageMat);
  lockHalo.position.y = 1.68;
  cageRoot.add(lockGem, lockHalo);

  return { sproutRoot, cageRoot };
}

/**
 * Stage 2: Sovereign Resonance Bell + Astral Light Bridge to Center
 */
export function createHarmonicBellAndBridgeModel(
  bellX: number,
  bellZ: number
): {
  root: THREE.Group;
  bellMesh: THREE.Mesh;
  haloRing: THREE.Mesh;
  bridgeMesh: THREE.Mesh;
} {
  const root = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.34,
    metalness: 0.78,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xb45309,
    emissiveIntensity: 0.38,
    roughness: 0.22,
    metalness: 0.88,
  });

  // Stepped Base Plinths & Fluted Pillars
  for (const side of [-1, 1]) {
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.24, 12), stoneMat);
    plinth.position.set(side * 0.98, 0.12, 0);
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.23, 2.98, 12), stoneMat);
    pillar.position.set(side * 0.98, 1.5, 0);
    pillar.castShadow = true;
    const capRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 18), roofMat);
    capRing.rotation.x = Math.PI / 2;
    capRing.position.set(side * 0.98, 2.75, 0);
    root.add(plinth, pillar, capRing);
  }

  const topBeam = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.28, 0.44), roofMat);
  topBeam.position.y = 2.9;
  topBeam.castShadow = true;
  root.add(topBeam);

  const roofRidge = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.56, 8), roofMat);
  roofRidge.position.y = 3.28;
  root.add(roofRidge);

  const lowerBeam = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.18, 0.3), stoneMat);
  lowerBeam.position.y = 2.44;
  root.add(lowerBeam);

  const bellMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.52,
    roughness: 0.16,
    metalness: 0.94,
  });
  const bellMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.56, 1.0, 24), bellMat);
  bellMesh.position.y = 1.76;
  bellMesh.castShadow = true;

  // Engraved Rim Band & Suspended Striker Clapper inside Bell
  const bellRim = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.045, 8, 24), roofMat);
  bellRim.rotation.x = Math.PI / 2;
  bellRim.position.y = -0.46;
  const clapper = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 1), roofMat);
  clapper.position.y = -0.58;
  bellMesh.add(bellRim, clapper);
  root.add(bellMesh);

  const haloMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.92,
    transparent: true,
    opacity: 0.8,
  });
  const haloRing = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.085, 10, 36), haloMat);
  haloRing.rotation.x = Math.PI / 2;
  haloRing.position.y = 0.1;
  root.add(haloRing);

  const dist = Math.hypot(bellX, bellZ);
  const bridgeLen = Math.max(4, dist - 3.5);
  const bridgeGeo = new THREE.BoxGeometry(1.24, 0.14, bridgeLen);
  const bridgeMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.42,
    transparent: true,
    opacity: 0.36,
    roughness: 0.12,
  });
  const bridgeMesh = new THREE.Mesh(bridgeGeo, bridgeMat);
  bridgeMesh.position.set(bellX * 0.5, 0.18, bellZ * 0.5);
  bridgeMesh.rotation.y = Math.atan2(bellX, bellZ);

  return { root, bellMesh, haloRing, bridgeMesh };
}

/**
 * Stage 1 & 2 Centerpiece: Grand Sovereign Sanctum Pavilion at (0, 0)
 */
export function createSakuraPavilionCenterpiece(): {
  root: THREE.Group;
  crystalCore: THREE.Mesh;
} {
  const root = new THREE.Group();

  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.34,
    metalness: 0.78,
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(3.25, 3.68, 0.5, 24), baseMat);
  base.position.y = 0.25;
  base.receiveShadow = true;
  root.add(base);

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xb45309,
    emissiveIntensity: 0.36,
    roughness: 0.2,
    metalness: 0.88,
  });
  const innerStep = new THREE.Mesh(new THREE.CylinderGeometry(2.65, 2.9, 0.24, 24), roofMat);
  innerStep.position.y = 0.56;
  innerStep.receiveShadow = true;
  root.add(innerStep);

  // Two-Tiered Imperial Sanctum Roof + Spire Finial
  const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(3.55, 1.45, 12), roofMat);
  lowerRoof.position.y = 3.45;
  lowerRoof.castShadow = true;
  const upperRoof = new THREE.Mesh(new THREE.ConeGeometry(2.45, 1.35, 12), roofMat);
  upperRoof.position.y = 4.45;
  upperRoof.castShadow = true;
  const roofSpire = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 1), roofMat);
  roofSpire.scale.set(0.75, 1.9, 0.75);
  roofSpire.position.y = 5.45;
  root.add(lowerRoof, upperRoof, roofSpire);

  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.3,
    metalness: 0.84,
  });
  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.35,
  });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const px = Math.cos(a) * 2.42;
    const pz = Math.sin(a) * 2.42;
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.24, 2.9, 12), pillarMat);
    p.position.set(px, 1.65, pz);
    p.castShadow = true;
    const eaveLantern = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), lanternMat);
    eaveLantern.position.set(Math.cos(a) * 2.95, 2.72, Math.sin(a) * 2.95);
    root.add(p, eaveLantern);
  }

  const crystalCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.82, 2),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.35,
      roughness: 0.1,
      metalness: 0.55,
    })
  );
  crystalCore.position.y = 1.78;
  const coreAstrolabe = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.045, 8, 28), roofMat);
  coreAstrolabe.rotation.x = Math.PI / 3;
  crystalCore.add(coreAstrolabe);
  root.add(crystalCore);

  return { root, crystalCore };
}

/**
 * Stage 3 Centerpiece: Colossal World-Tree Conduit at (0, 0) + Golden Aegis Totems
 */
export function createHeartTreeCenterpiece(): {
  root: THREE.Group;
  heartCore: THREE.Mesh;
  canopyGroup: THREE.Group;
} {
  const root = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.76,
  });
  const goldRuneMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.65,
    roughness: 0.2,
    metalness: 0.9,
  });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.96, 3.9, 16), trunkMat);
  trunk.position.y = 1.95;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  root.add(trunk);

  // 6 Sculpted Root Buttresses & Spiral Gold Bark Runes
  for (let r = 0; r < 6; r++) {
    const ang = (r / 6) * Math.PI * 2;
    const rootButtress = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.85, 8), trunkMat);
    rootButtress.position.set(Math.cos(ang) * 1.75, 0.72, Math.sin(ang) * 1.75);
    rootButtress.rotation.z = -Math.cos(ang) * 0.48;
    rootButtress.rotation.x = Math.sin(ang) * 0.48;
    root.add(rootButtress);
  }

  const barkRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.48, 0.06, 8, 28), goldRuneMat);
  barkRing1.rotation.x = Math.PI / 2.2;
  barkRing1.position.y = 1.35;
  const barkRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.055, 8, 28), goldRuneMat);
  barkRing2.rotation.x = -Math.PI / 2.3;
  barkRing2.position.y = 2.45;
  root.add(barkRing1, barkRing2);

  const heartCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.92, 2),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xea580c,
      emissiveIntensity: 1.45,
      roughness: 0.12,
    })
  );
  heartCore.position.set(0, 1.78, 0);
  root.add(heartCore);

  const canopyGroup = new THREE.Group();
  const leafColors = [0xd97706, 0xf59e0b, 0x0284c7, 0xfbbf24, 0x38bdf8];
  const offsets = [
    [0, 4.45, 0, 2.45],
    [-1.45, 3.75, 0.95, 1.65],
    [1.45, 3.85, -0.85, 1.65],
    [0.85, 3.65, 1.35, 1.55],
    [-1.15, 3.65, -1.25, 1.55],
    [0, 5.35, 0, 1.75],
  ];
  offsets.forEach(([ox, oy, oz, rad], idx) => {
    const mat = new THREE.MeshStandardMaterial({
      color: leafColors[idx % leafColors.length],
      emissive: leafColors[idx % leafColors.length],
      emissiveIntensity: 0.34,
      roughness: 0.3,
      metalness: 0.48,
    });
    const dome = new THREE.Mesh(new THREE.OctahedronGeometry(rad, 2), mat);
    dome.position.set(ox, oy, oz);
    dome.scale.y = 0.74;
    dome.castShadow = true;
    canopyGroup.add(dome);
  });
  root.add(canopyGroup);

  return { root, heartCore, canopyGroup };
}

export function createDefenseTotemModel(): {
  root: THREE.Group;
  orb: THREE.Mesh;
  ring: THREE.Mesh;
} {
  const root = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.34, metalness: 0.8 });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.5,
    roughness: 0.2,
    metalness: 0.9,
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.66, 1.42, 12), stoneMat);
  base.position.y = 0.71;
  base.castShadow = true;
  root.add(base);

  const capital = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.055, 8, 24), goldMat);
  capital.rotation.x = Math.PI / 2;
  capital.position.y = 1.36;
  root.add(capital);

  const orb = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.42, 1),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 1.35,
      roughness: 0.12,
    })
  );
  orb.position.y = 1.76;
  const orbGimbal = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.032, 8, 24), goldMat);
  orbGimbal.rotation.x = Math.PI / 3;
  orb.add(orbGimbal);
  root.add(orb);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.16, 0.065, 10, 32),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.95,
      transparent: true,
      opacity: 0.82,
    })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.08;
  root.add(ring);

  return { root, orb, ring };
}

/**
 * Stage 4 Centerpiece & Props: Aurora Prism Spire & Falling Starlight Meteors
 */
export function createAuroraSpireCenterpiece(): {
  root: THREE.Group;
  spireMesh: THREE.Mesh;
  haloMesh: THREE.Mesh;
} {
  const root = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.32, metalness: 0.82 });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.95,
    roughness: 0.18,
    metalness: 0.9,
  });
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.3,
    roughness: 0.1,
    metalness: 0.65,
  });

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.75, 0.52, 24), stoneMat);
  pedestal.position.y = 0.26;
  root.add(pedestal);

  // 4 Perimeter Resonator Crystal Obelisks framing the Spire
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const subSpire = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), crystalMat);
    subSpire.scale.set(0.75, 2.1, 0.75);
    subSpire.position.set(Math.cos(ang) * 2.1, 1.15, Math.sin(ang) * 2.1);
    subSpire.rotation.z = -Math.cos(ang) * 0.22;
    subSpire.rotation.x = Math.sin(ang) * 0.22;
    root.add(subSpire);
  }

  const spireMesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.42, 1), crystalMat);
  spireMesh.scale.set(0.85, 2.2, 0.85);
  spireMesh.position.y = 2.5;
  spireMesh.castShadow = true;
  root.add(spireMesh);

  const haloMesh = new THREE.Mesh(new THREE.TorusGeometry(2.16, 0.095, 12, 36), goldMat);
  haloMesh.rotation.x = Math.PI / 2;
  haloMesh.position.y = 1.85;
  const secondaryHalo = new THREE.Mesh(new THREE.TorusGeometry(1.68, 0.055, 10, 32), crystalMat);
  secondaryHalo.rotation.x = Math.PI / 3;
   haloMesh.add(secondaryHalo);
  root.add(haloMesh);

  return { root, spireMesh, haloMesh };
}

export function createStarlightMeteorModel(): {
  root: THREE.Group;
  core: THREE.Mesh;
  timerRing: THREE.Mesh;
  beam: THREE.Mesh;
} {
  const root = new THREE.Group();

  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.45,
    roughness: 0.1,
    metalness: 0.5,
  });
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.56, 1), coreMat);
  core.position.y = 0.78;
  core.castShadow = true;

  const orbitRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.76, 0.04, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.88 })
  );
  orbitRing.rotation.x = Math.PI / 3;
  core.add(orbitRing);
  root.add(core);

  // 4 Impact Crater Shards
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2;
    const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), coreMat);
    shard.scale.set(0.7, 1.8, 0.7);
    shard.position.set(Math.cos(ang) * 0.72, 0.26, Math.sin(ang) * 0.72);
    shard.rotation.z = -Math.cos(ang) * 0.45;
    shard.rotation.x = Math.sin(ang) * 0.45;
    root.add(shard);
  }

  const timerRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.18, 0.075, 10, 32),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.88,
    })
  );
  timerRing.rotation.x = Math.PI / 2;
  timerRing.position.y = 0.08;
  root.add(timerRing);

  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.48, 6.8, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  beam.position.y = 3.4;
  root.add(beam);

  return { root, core, timerRing, beam };
}

/**
 * Shared Astral Ley-Gate Speed Boost Pad
 */
export function createBoostPadModel(isAurora: boolean): {
  root: THREE.Group;
  ring: THREE.Mesh;
} {
  const root = new THREE.Group();
  const primaryHex = isAurora ? 0x38bdf8 : 0xfbbf24;
  const emissiveHex = isAurora ? 0x0284c7 : 0xd97706;

  const ringMat = new THREE.MeshStandardMaterial({
    color: primaryHex,
    emissive: emissiveHex,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.9,
  });

  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.46, 0.1, 10, 32), ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.12;
  const innerChevronRing = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.055, 8, 24), ringMat);
  ring.add(innerChevronRing);
  root.add(ring);

  // 4 Corner Gale-Rune Pylon Nodes
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const pylon = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), ringMat);
    pylon.scale.set(0.75, 1.75, 0.75);
    pylon.position.set(Math.cos(ang) * 1.46, 0.28, Math.sin(ang) * 1.46);
    root.add(pylon);
  }

  const innerDisc = new THREE.Mesh(
    new THREE.CircleGeometry(1.32, 28),
    new THREE.MeshBasicMaterial({
      color: primaryHex,
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide,
    })
  );
  innerDisc.rotation.x = -Math.PI / 2;
  innerDisc.position.y = 0.06;
  root.add(innerDisc);

  return { root, ring };
}

/**
 * Procedural Mid-Field 3D Obstacle & Runic Trap Models
 */
export function createStageObstacleModel(
  obstacle: StageObstacle,
  biome: StageBiomeTheme
): THREE.Group {
  const root = new THREE.Group();
  const s = obstacle.scale;

  if (obstacle.type === 'moss_boulder') {
    const rockMat = new THREE.MeshStandardMaterial({
      color: biome.cliffHex,
      roughness: 0.55,
      metalness: 0.45,
    });
    const runeCapMat = new THREE.MeshStandardMaterial({
      color: biome.canopyPrimaryHex,
      emissive: biome.canopySecondaryHex,
      emissiveIntensity: 0.25,
      roughness: 0.4,
    });
    const mainRock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.15, 1), rockMat);
    mainRock.scale.set(1.15, 0.88, 1.0);
    mainRock.position.y = 0.72;
    mainRock.castShadow = true;
    mainRock.receiveShadow = true;
    root.add(mainRock);

    const runeCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), runeCapMat);
    runeCrystal.scale.set(0.8, 1.6, 0.8);
    runeCrystal.position.y = 1.25;
    root.add(runeCrystal);
  } else if (obstacle.type === 'hollow_log') {
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.45,
      metalness: 0.7,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xb45309,
      emissiveIntensity: 0.4,
      roughness: 0.25,
      metalness: 0.85,
    });
    const fallenMonolith = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.62, 2.6, 8), stoneMat);
    fallenMonolith.rotation.z = Math.PI / 2;
    fallenMonolith.position.y = 0.56;
    fallenMonolith.castShadow = true;
    fallenMonolith.receiveShadow = true;
    root.add(fallenMonolith);

    const runeBand = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.18, 0.68), goldMat);
    runeBand.position.y = 1.06;
    root.add(runeBand);
  } else if (obstacle.type === 'crystal_spire') {
    const crysHex = biome.crystalPalette[0] ?? 0x38bdf8;
    const crysMat = new THREE.MeshStandardMaterial({
      color: crysHex,
      emissive: crysHex,
      emissiveIntensity: 0.85,
      roughness: 0.14,
      metalness: 0.45,
    });
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.45,
      metalness: 0.7,
    });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.05, 0.35, 8), baseMat);
    base.position.y = 0.18;
    root.add(base);

    const mainSpire = new THREE.Mesh(new THREE.OctahedronGeometry(0.68, 0), crysMat);
    mainSpire.scale.set(0.8, 2.25, 0.8);
    mainSpire.position.y = 1.38;
    mainSpire.castShadow = true;
    root.add(mainSpire);

    const sideSpire = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), crysMat);
    sideSpire.scale.set(0.75, 1.75, 0.75);
    sideSpire.position.set(0.48, 0.85, 0.25);
    sideSpire.rotation.z = -0.32;
    root.add(sideSpire);

    const hazardRing = new THREE.Mesh(
      new THREE.RingGeometry(1.25, 1.52, 24),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    hazardRing.rotation.x = -Math.PI / 2;
    hazardRing.position.y = 0.06;
    root.add(hazardRing);
    root.userData.hazardRing = hazardRing;
    root.userData.hazardRadius = 2.15;
  } else {
    // ruin_pillar -> Runic Blade-Spinner Trap Obelisk
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.38,
      metalness: 0.78,
    });
    const runeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.95,
      roughness: 0.18,
      metalness: 0.88,
    });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.36, 1.4), stoneMat);
    plinth.position.y = 0.18;
    root.add(plinth);

    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 2.15, 8), stoneMat);
    col.position.y = 1.25;
    col.castShadow = true;
    root.add(col);

    const spinnerGroup = new THREE.Group();
    spinnerGroup.position.y = 0.85;
    const bladeGeo = new THREE.BoxGeometry(2.45, 0.06, 0.24);
    const b1 = new THREE.Mesh(bladeGeo, runeMat);
    const b2 = new THREE.Mesh(bladeGeo, runeMat);
    b2.rotation.y = Math.PI / 2;
    spinnerGroup.add(b1, b2);
    root.add(spinnerGroup);
    root.userData.spinnerGroup = spinnerGroup;
    root.userData.bladeRing = spinnerGroup;

    const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), runeMat);
    orb.position.y = 2.58;
    root.add(orb);

    const hazardRing = new THREE.Mesh(
      new THREE.RingGeometry(1.28, 1.54, 24),
      new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    hazardRing.rotation.x = -Math.PI / 2;
    hazardRing.position.y = 0.06;
    root.add(hazardRing);
    root.userData.hazardRing = hazardRing;
    root.userData.hazardRadius = 2.25;
  }

  const shadow = createContactShadow(obstacle.radius);
  root.add(shadow);
  root.scale.set(s, s, s);
  root.rotation.y = obstacle.rotationY;

  return root;
}

/**
 * Orin, the Celestial Astrolabe Sentinel (Replaces Sprout-Buddy).
 * Sleek arcane-mechanical companion construct with counter-rotating brass gimbal rings,
 * glowing sapphire sensor eye, and crystalline wing-vanes that lock onto nearby Shards & Relics.
 */
export interface SproutBuddyRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  leftWing: THREE.Mesh;
  rightWing: THREE.Mesh;
  antennaOrb: THREE.Mesh;
  orbitRing: THREE.Mesh;
  highlightGroup: THREE.Group;
  beaconRing: THREE.Mesh;
  beaconInnerRing: THREE.Mesh;
  beaconBeam: THREE.Mesh;
  setHighlightColor: (hex: number) => void;
}

export function createSproutBuddyModel(): SproutBuddyRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = 1.28;
  root.add(bodyGroup);

  const obsidianHullMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.25,
    metalness: 0.88,
  });
  const goldBrassMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.45,
    roughness: 0.18,
    metalness: 0.92,
  });
  const eyeCoreMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.4,
    roughness: 0.1,
  });
  const wingVaneMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.75,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });
  const antennaMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.25,
    roughness: 0.12,
  });

  // Faceted Astrolabe Sentinel Core Sphere
  const bodyGeo = new THREE.OctahedronGeometry(0.24, 1);
  const bodyMesh = new THREE.Mesh(bodyGeo, obsidianHullMat);
  bodyMesh.castShadow = true;
  bodyGroup.add(bodyMesh);

  // Brass Equatorial Gimbal Band + Glowing Sapphire Sensor Eye
  const gimbalBand = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.028, 8, 20), goldBrassMat);
  gimbalBand.rotation.x = Math.PI / 2;
  bodyGroup.add(gimbalBand);

  const eyeLens = new THREE.Mesh(new THREE.OctahedronGeometry(0.095, 1), eyeCoreMat);
  eyeLens.position.set(0, 0.02, 0.22);
  const eyeBezel = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 8, 16), goldBrassMat);
  eyeBezel.position.set(0, 0.02, 0.21);
  bodyGroup.add(eyeLens, eyeBezel);

  // Top Celestial Crest + Sensor Prism (`antennaOrb`)
  const crestFin = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 4), goldBrassMat);
  crestFin.position.set(0, 0.28, 0);
  bodyGroup.add(crestFin);

  const antennaOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.085, 0), antennaMat);
  antennaOrb.position.set(0, 0.44, 0);
  bodyGroup.add(antennaOrb);

  // Articulated Crystalline Wing-Vanes (`leftWing`, `rightWing`)
  const vaneShape = new THREE.Shape();
  vaneShape.moveTo(0, 0);
  vaneShape.lineTo(0.38, 0.16);
  vaneShape.lineTo(0.46, -0.04);
  vaneShape.lineTo(0.14, -0.14);
  vaneShape.closePath();
  const wingGeo = new THREE.ShapeGeometry(vaneShape);

  const leftWing = new THREE.Mesh(wingGeo, wingVaneMat);
  leftWing.position.set(-0.16, 0.06, -0.12);
  leftWing.rotation.y = Math.PI - 0.35;
  bodyGroup.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeo, wingVaneMat);
  rightWing.position.set(0.16, 0.06, -0.12);
  rightWing.rotation.y = 0.35;
  bodyGroup.add(rightWing);

  // Outer Orbiting Astrolabe Ring (`orbitRing`)
  const orbitRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.39, 0.018, 8, 24),
    new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.8,
    })
  );
  orbitRing.rotation.x = Math.PI / 2.3;
  bodyGroup.add(orbitRing);

  const shadow = createContactShadow(0.36);
  root.add(shadow);

  // 3D Target Highlight Beacon
  const highlightGroup = new THREE.Group();
  highlightGroup.visible = false;

  const beaconMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
  });

  const beaconInnerMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
  });

  const beaconBeamMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 0.24,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const beaconRing = new THREE.Mesh(new THREE.RingGeometry(1.05, 1.28, 28), beaconMat);
  beaconRing.rotation.x = -Math.PI / 2;
  beaconRing.position.y = 0.08;
  highlightGroup.add(beaconRing);

  const beaconInnerRing = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.72, 20), beaconInnerMat);
  beaconInnerRing.rotation.x = -Math.PI / 2;
  beaconInnerRing.position.y = 0.1;
  highlightGroup.add(beaconInnerRing);

  const beaconBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.85, 3.6, 16, 1, true),
    beaconBeamMat
  );
  beaconBeam.position.y = 1.8;
  highlightGroup.add(beaconBeam);

  const setHighlightColor = (hex: number) => {
    beaconMat.color.setHex(hex);
    beaconBeamMat.color.setHex(hex);
    (orbitRing.material as THREE.MeshBasicMaterial).color.setHex(hex);
    antennaMat.color.setHex(hex);
    antennaMat.emissive.setHex(hex);
  };

  return {
    root,
    bodyGroup,
    leftWing,
    rightWing,
    antennaOrb,
    orbitRing,
    highlightGroup,
    beaconRing,
    beaconInnerRing,
    beaconBeam,
    setHighlightColor,
  };
}

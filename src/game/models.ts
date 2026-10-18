/**
 * High-Fidelity Procedural Multi-Part 3D Character, Enemy, Shrine & Boss Models
 * for Sproutling: Grove Guardian 3D.
 *
 * Includes:
 * - Articulated Hero Rig (Left/Right arms, ears, 4-layer expressive eyes with catchlights,
 *   eyebrows, explorer seed satchel, ornate Acorn Lantern Staff with orbiting filigree ring,
 *   and diegetic 3D Golden Objective Compass Arrow)
 * - Upgraded Multi-Part Enemy Archetypes (Spore Puffer with gills/feet/brows,
 *   Armored Bramble Roller with carved mask & ember bands, 4-Winged Gloom Sprite with orbiting shards)
 * - Ancient Sun Shrines with astrolabe rings & Solar Tether Beams toward the Central Boss
 * - 14-Part Corrupted Elder Bramble Ent Boss with carved face, clawed arms, antler crown & Rune Shield
 */

import * as THREE from 'three';
import {
  DEFAULT_CUSTOMIZATION,
  DEFAULT_HOME_BASE,
  CUSTOMIZATION_OPTIONS,
  type CharacterCustomization,
  type HomeBaseCustomization,
  type TrophyStatus,
} from './rules';

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(10, 24, 16, 0.75)');
  gradient.addColorStop(0.5, 'rgba(10, 24, 16, 0.38)');
  gradient.addColorStop(1, 'rgba(10, 24, 16, 0)');

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
    opacity: 0.65,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.02;
  mesh.renderOrder = 1;
  return mesh;
}

/**
 * Procedural Hero: Pip the Sproutling with articulated limbs, multi-layer expressive face,
 * woodland satchel, ornate Acorn Lantern Staff, and 3D Objective Waypoint Compass.
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
  setHighDetailEnabled: (enabled: boolean) => void;
  setQualityTier: (quality: 'eco' | 'balanced' | 'high' | 'ultra') => void;
}

export function createHeroModel(initialCustom: CharacterCustomization = DEFAULT_CUSTOMIZATION): HeroRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialCustom.skinColor),
    roughness: 0.46,
    metalness: 0.06,
  });
  const innerEarMat = new THREE.MeshStandardMaterial({
    color: 0xffa5ab,
    roughness: 0.55,
    metalness: 0.02,
  });
  const bellyMat = new THREE.MeshStandardMaterial({
    color: 0xf1faee,
    roughness: 0.58,
    metalness: 0.02,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialCustom.hairColor),
    roughness: 0.4,
    metalness: 0.12,
    side: THREE.DoubleSide,
  });
  const clothingMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialCustom.clothingColor),
    roughness: 0.48,
    metalness: 0.08,
    side: THREE.DoubleSide,
  });
  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x7f4f24,
    roughness: 0.68,
    metalness: 0.12,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffd166,
    emissive: 0xff9f1c,
    emissiveIntensity: 0.35,
    roughness: 0.22,
    metalness: 0.65,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x583101,
    roughness: 0.76,
    metalness: 0.06,
  });
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xffe66d,
    emissive: 0xffaa00,
    emissiveIntensity: 0.95,
    roughness: 0.15,
    metalness: 0.25,
  });

  // 1. Torso / Lower Body
  const bodyGeo = new THREE.SphereGeometry(0.55, 24, 20);
  bodyGeo.scale(1, 1.16, 0.95);
  const bodyMesh = new THREE.Mesh(bodyGeo, skinMat);
  bodyMesh.position.y = 0.66;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  bodyGroup.add(bodyMesh);

  // Soft cream belly patch with stitched leaf pattern
  const bellyGeo = new THREE.SphereGeometry(0.43, 18, 16);
  bellyGeo.scale(0.86, 0.92, 0.42);
  const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
  bellyMesh.position.set(0, 0.6, 0.38);
  bodyGroup.add(bellyMesh);

  // Explorer Belt & Golden Acorn Buckle
  const beltGeo = new THREE.TorusGeometry(0.52, 0.045, 10, 24);
  beltGeo.rotateX(Math.PI / 2);
  const beltMesh = new THREE.Mesh(beltGeo, leatherMat);
  beltMesh.position.y = 0.48;
  bodyGroup.add(beltMesh);

  const buckleMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), goldMat);
  buckleMesh.scale.set(1.2, 1.0, 0.5);
  buckleMesh.position.set(0, 0.48, 0.55);
  bodyGroup.add(buckleMesh);

  // 2. Sculpted Head & Woodland Pointed Ears
  const headGeo = new THREE.SphereGeometry(0.49, 24, 20);
  headGeo.scale(1.06, 0.96, 1.0);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.y = 1.36;
  headMesh.castShadow = true;
  bodyGroup.add(headMesh);

  // Expressive Leaf/Elf Ears on Head
  const earGroup = new THREE.Group();
  const earOuterGeo = new THREE.ConeGeometry(0.14, 0.38, 10);
  earOuterGeo.translate(0, 0.18, 0);
  earOuterGeo.scale(0.65, 1.0, 1.0);
  const earInnerGeo = new THREE.ConeGeometry(0.08, 0.26, 8);
  earInnerGeo.translate(0, 0.16, 0.04);
  earInnerGeo.scale(0.55, 1.0, 0.6);

  const leftEar = new THREE.Group();
  leftEar.position.set(-0.46, 0.02, -0.02);
  leftEar.rotation.set(0.1, 0, 1.15);
  leftEar.add(new THREE.Mesh(earOuterGeo, skinMat), new THREE.Mesh(earInnerGeo, innerEarMat));

  const rightEar = new THREE.Group();
  rightEar.position.set(0.46, 0.02, -0.02);
  rightEar.rotation.set(0.1, 0, -1.15);
  rightEar.add(new THREE.Mesh(earOuterGeo, skinMat), new THREE.Mesh(earInnerGeo, innerEarMat));

  earGroup.add(leftEar, rightEar);
  headMesh.add(earGroup);

  // 3. Facial Features Container
  const faceGroup = new THREE.Group();
  faceGroup.position.set(0, 1.36, 0);
  bodyGroup.add(faceGroup);

  // 4. Hairstyle / Topknot Container
  const sproutTop = new THREE.Group();
  sproutTop.position.set(0, 1.8, 0);
  bodyGroup.add(sproutTop);

  // 5. Clothing / Outfit Container
  const clothingGroup = new THREE.Group();
  bodyGroup.add(clothingGroup);

  // 6. Woodland Seed Satchel / Backpack (Detail Group)
  const satchelGroup = new THREE.Group();
  satchelGroup.position.set(0, 0.78, -0.46);
  const packBody = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.44, 0.26), leatherMat);
  packBody.castShadow = true;
  const packFlap = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.46, 12, 1, false, 0, Math.PI), leatherMat);
  packFlap.rotation.z = Math.PI / 2;
  packFlap.position.set(0, 0.2, 0.02);
  const packSeed = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 1), crystalMat);
  packSeed.position.set(0.14, 0.26, 0.06);
  const packClasp = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), goldMat);
  packClasp.position.set(0, 0.05, 0.14);
  satchelGroup.add(packBody, packFlap, packSeed, packClasp);
  bodyGroup.add(satchelGroup);

  // 7. Flowing Woodland Cape
  const capeShape = new THREE.Shape();
  capeShape.moveTo(-0.42, 0);
  capeShape.quadraticCurveTo(0, -0.78, 0.42, 0);
  capeShape.quadraticCurveTo(0, -0.15, -0.42, 0);
  const capeGeo = new THREE.ShapeGeometry(capeShape);
  const cape = new THREE.Mesh(capeGeo, clothingMat);
  cape.position.set(0, 1.15, -0.44);
  cape.rotation.x = -0.38;
  bodyGroup.add(cape);

  // 8. Articulated Left & Right Arms + Hands
  const armGeo = new THREE.CapsuleGeometry(0.105, 0.28, 8, 12);
  armGeo.translate(0, -0.16, 0);
  const handGeo = new THREE.SphereGeometry(0.115, 12, 10);
  handGeo.translate(0, -0.34, 0);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.52, 0.96, 0.05);
  leftArm.rotation.z = 0.28;
  const leftSleeve = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.24, 10), clothingMat);
  leftSleeve.position.y = -0.08;
  leftArm.add(new THREE.Mesh(armGeo, skinMat), new THREE.Mesh(handGeo, skinMat), leftSleeve);
  bodyGroup.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.52, 0.96, 0.08);
  rightArm.rotation.z = -0.25;
  const rightSleeve = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.24, 10), clothingMat);
  rightSleeve.position.y = -0.08;
  rightArm.add(new THREE.Mesh(armGeo, skinMat), new THREE.Mesh(handGeo, skinMat), rightSleeve);
  bodyGroup.add(rightArm);

  // 9. Sculpted Woodland Boots / Feet
  const footGeo = new THREE.SphereGeometry(0.17, 12, 10);
  footGeo.scale(0.92, 0.65, 1.38);
  const cuffGeo = new THREE.TorusGeometry(0.12, 0.035, 8, 14);
  cuffGeo.rotateX(Math.PI / 2);
  cuffGeo.translate(0, 0.08, -0.04);

  const leftFoot = new THREE.Mesh(footGeo, woodMat);
  leftFoot.add(new THREE.Mesh(cuffGeo, leatherMat));
  leftFoot.position.set(-0.26, 0.12, 0);
  leftFoot.castShadow = true;

  const rightFoot = new THREE.Mesh(footGeo, woodMat);
  rightFoot.add(new THREE.Mesh(cuffGeo, leatherMat));
  rightFoot.position.set(0.26, 0.12, 0);
  rightFoot.castShadow = true;
  bodyGroup.add(leftFoot, rightFoot);

  // 10. Ornate Acorn Lantern Staff / Wand Rig
  const staff = new THREE.Group();
  staff.position.set(0.56, 0.82, 0.24);

  const staffShaftGeo = new THREE.CylinderGeometry(0.042, 0.058, 1.35, 10);
  const staffShaft = new THREE.Mesh(staffShaftGeo, woodMat);
  staffShaft.castShadow = true;
  staff.add(staffShaft);

  // Grip wrapping
  const gripMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.28, 10), leatherMat);
  gripMesh.position.y = 0.05;
  staff.add(gripMesh);

  // Acorn Cup & Filigree Crown
  const capGeo = new THREE.CylinderGeometry(0.21, 0.12, 0.22, 12);
  capGeo.translate(0, 0.66, 0);
  const staffCap = new THREE.Mesh(capGeo, woodMat);
  staff.add(staffCap);

  const capRim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.028, 8, 18), goldMat);
  capRim.rotation.x = Math.PI / 2;
  capRim.position.y = 0.75;
  staff.add(capRim);

  // Floating Sun-Crystal & Orbiting Golden Astrolabe Ring
  const crystalGeo = new THREE.OctahedronGeometry(0.21, 1);
  const staffCrystal = new THREE.Mesh(crystalGeo, crystalMat);
  staffCrystal.position.y = 0.92;
  staff.add(staffCrystal);

  const staffRingGeo = new THREE.TorusGeometry(0.3, 0.02, 8, 24);
  const staffRing = new THREE.Mesh(staffRingGeo, goldMat);
  staffRing.position.y = 0.92;
  staffRing.rotation.x = Math.PI / 3;
  staff.add(staffRing);

  bodyGroup.add(staff);

  // 10b. High/Ultra Orbiting Sun-Mote Aura Halo around Hero
  const auraHaloGroup = new THREE.Group();
  auraHaloGroup.position.set(0, 0.95, 0);
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2;
    const mote = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), crystalMat);
    mote.position.set(Math.cos(ang) * 0.78, Math.sin(ang * 2) * 0.14, Math.sin(ang) * 0.78);
    auraHaloGroup.add(mote);
  }
  const auraRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.76, 0.012, 6, 28),
    new THREE.MeshBasicMaterial({ color: 0xffe66d, transparent: true, opacity: 0.42 })
  );
  auraRing.rotation.x = Math.PI / 2.2;
  auraHaloGroup.add(auraRing);
  bodyGroup.add(auraHaloGroup);

  // 11. Diegetic 3D Objective Waypoint Compass at Pip's Feet
  const compassGroup = new THREE.Group();
  compassGroup.position.y = 0.08;

  const compassRingGeo = new THREE.RingGeometry(0.82, 0.92, 32);
  compassRingGeo.rotateX(-Math.PI / 2);
  const compassRingMat = new THREE.MeshBasicMaterial({
    color: 0xffd166,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const compassRing = new THREE.Mesh(compassRingGeo, compassRingMat);
  compassGroup.add(compassRing);

  // Pointer Arrow pointing forward (+Z in local compass space)
  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(0, 0.38);
  arrowShape.lineTo(0.24, -0.12);
  arrowShape.lineTo(0, -0.02);
  arrowShape.lineTo(-0.24, -0.12);
  arrowShape.closePath();
  const arrowGeo = new THREE.ShapeGeometry(arrowShape);
  arrowGeo.rotateX(Math.PI / 2);
  const compassArrowMat = new THREE.MeshBasicMaterial({
    color: 0xffd166,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const arrowMesh = new THREE.Mesh(arrowGeo, compassArrowMat);
  arrowMesh.position.set(0, 0.03, 1.15);
  compassGroup.add(arrowMesh);

  root.add(compassGroup);

  const shadow = createContactShadow(0.82);
  root.add(shadow);

  const applyCustomization = (custom: CharacterCustomization) => {
    const bodyOpt =
      CUSTOMIZATION_OPTIONS.bodyTypes.find((b) => b.id === custom.bodyType) ||
      CUSTOMIZATION_OPTIONS.bodyTypes[0];
    bodyGroup.scale.set(bodyOpt.scale[0], bodyOpt.scale[1], bodyOpt.scale[2]);

    skinMat.color.set(custom.skinColor);
    hairMat.color.set(custom.hairColor);
    clothingMat.color.set(custom.clothingColor);

    // Rebuild Hairstyle
    sproutTop.clear();
    if (custom.hairstyle === 'twin-sprout') {
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.055, 0.3, 8);
      stemGeo.translate(0, 0.15, 0);
      sproutTop.add(new THREE.Mesh(stemGeo, woodMat));

      const leafShape = new THREE.Shape();
      leafShape.moveTo(0, 0);
      leafShape.quadraticCurveTo(0.22, 0.25, 0, 0.56);
      leafShape.quadraticCurveTo(-0.22, 0.25, 0, 0);
      const leafGeo = new THREE.ShapeGeometry(leafShape);

      const l1 = new THREE.Mesh(leafGeo, hairMat);
      l1.position.set(0, 0.28, 0);
      l1.rotation.set(0.2, 0.4, 0.62);
      const l2 = new THREE.Mesh(leafGeo, hairMat);
      l2.position.set(0, 0.28, 0);
      l2.rotation.set(-0.2, -0.4, -0.62);

      // Tiny golden bud between leaves
      const bud = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), goldMat);
      bud.position.set(0, 0.3, 0);
      sproutTop.add(l1, l2, bud);
    } else if (custom.hairstyle === 'fluffy-bob') {
      const domeGeo = new THREE.SphereGeometry(0.54, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.65);
      const dome = new THREE.Mesh(domeGeo, hairMat);
      dome.position.y = -0.35;
      sproutTop.add(dome);

      const puffGeo = new THREE.SphereGeometry(0.2, 12, 12);
      const p1 = new THREE.Mesh(puffGeo, hairMat);
      p1.position.set(-0.4, -0.42, 0.14);
      const p2 = new THREE.Mesh(puffGeo, hairMat);
      p2.position.set(0.4, -0.42, 0.14);
      sproutTop.add(p1, p2);
    } else if (custom.hairstyle === 'braided-crown') {
      const ringGeo = new THREE.TorusGeometry(0.38, 0.095, 10, 22);
      ringGeo.rotateX(Math.PI / 2);
      const crown = new THREE.Mesh(ringGeo, hairMat);
      crown.position.y = -0.15;
      sproutTop.add(crown);

      const braidGeo = new THREE.CapsuleGeometry(0.085, 0.38, 8, 10);
      const b1 = new THREE.Mesh(braidGeo, hairMat);
      b1.position.set(-0.42, -0.45, -0.04);
      b1.rotation.z = 0.25;
      const b2 = new THREE.Mesh(braidGeo, hairMat);
      b2.position.set(0.42, -0.45, -0.04);
      b2.rotation.z = -0.25;
      sproutTop.add(b1, b2);
    } else if (custom.hairstyle === 'mushroom-beret') {
      const capGeo = new THREE.SphereGeometry(0.6, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const cap = new THREE.Mesh(capGeo, hairMat);
      cap.position.y = -0.22;
      sproutTop.add(cap);

      const dotMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
      const dotGeo = new THREE.SphereGeometry(0.095, 10, 10);
      [
        [-0.25, 0.06, 0.26],
        [0.26, 0.09, 0.18],
        [0, 0.23, -0.2],
        [-0.18, 0.19, -0.12],
      ].forEach(([dx, dy, dz]) => {
        const d = new THREE.Mesh(dotGeo, dotMat);
        d.position.set(dx, dy, dz);
        sproutTop.add(d);
      });
    } else if (custom.hairstyle === 'sun-halo') {
      const coreMat = new THREE.MeshStandardMaterial({ color: 0x5a3825, roughness: 0.65 });
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 12), coreMat);
      core.position.y = 0.1;
      sproutTop.add(core);

      const petalGeo = new THREE.ConeGeometry(0.085, 0.3, 8);
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2;
        const petal = new THREE.Mesh(petalGeo, hairMat);
        petal.position.set(Math.cos(ang) * 0.23, 0.1, Math.sin(ang) * 0.23);
        petal.rotation.x = Math.PI / 2;
        petal.rotation.z = -ang;
        sproutTop.add(petal);
      }
    }

    // 4. Multi-Layer Expressive Facial Features (Sclera, Iris, Pupil, Dual Catchlights, Brows, Smile)
    faceGroup.clear();
    const scleraMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const irisMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.2 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0b130d });
    const catchlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const cheekMat = new THREE.MeshStandardMaterial({ color: 0xff8fa3, roughness: 0.6 });
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfff3b0,
      emissive: 0xffd166,
      emissiveIntensity: 0.85,
    });

    // Rosy Cheeks
    const cheekGeo = new THREE.SphereGeometry(0.085, 10, 10);
    cheekGeo.scale(1.1, 0.62, 0.32);
    const lc = new THREE.Mesh(cheekGeo, cheekMat);
    lc.position.set(-0.29, -0.07, 0.39);
    const rc = new THREE.Mesh(cheekGeo, cheekMat);
    rc.position.set(0.29, -0.07, 0.39);
    faceGroup.add(lc, rc);

    // Expressive Eyebrows
    const browGeo = new THREE.CapsuleGeometry(0.022, 0.11, 4, 8);
    browGeo.rotateZ(Math.PI / 2);
    const lBrow = new THREE.Mesh(browGeo, woodMat);
    lBrow.position.set(-0.18, 0.16, 0.44);
    lBrow.rotation.z = 0.12;
    const rBrow = new THREE.Mesh(browGeo, woodMat);
    rBrow.position.set(0.18, 0.16, 0.44);
    rBrow.rotation.z = -0.12;
    faceGroup.add(lBrow, rBrow);

    // Happy Woodland Smile Arc
    const smileGeo = new THREE.TorusGeometry(0.065, 0.016, 6, 14, Math.PI);
    const smileMesh = new THREE.Mesh(smileGeo, woodMat);
    smileMesh.position.set(0, -0.06, 0.465);
    smileMesh.rotation.x = Math.PI;
    faceGroup.add(smileMesh);

    if (custom.facialFeature === 'sleepy-cozy') {
      const lidGeo = new THREE.TorusGeometry(0.075, 0.022, 8, 14, Math.PI);
      const le = new THREE.Mesh(lidGeo, pupilMat);
      le.position.set(-0.18, 0.03, 0.44);
      const re = new THREE.Mesh(lidGeo, pupilMat);
      re.position.set(0.18, 0.03, 0.44);
      faceGroup.add(le, re);
    } else {
      const buildDetailedEye = (xOffset: number) => {
        const eyeNode = new THREE.Group();
        eyeNode.position.set(xOffset, 0.03, 0.42);

        const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.088, 14, 12), scleraMat);
        sclera.scale.set(0.95, 1.1, 0.55);

        const iris = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 10), irisMat);
        iris.scale.set(0.92, 1.05, 0.5);
        iris.position.z = 0.018;

        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 10), pupilMat);
        pupil.scale.set(0.9, 1.0, 0.45);
        pupil.position.z = 0.032;

        const catch1 = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), catchlightMat);
        catch1.position.set(0.022, 0.026, 0.052);
        const catch2 = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), catchlightMat);
        catch2.position.set(-0.02, -0.02, 0.05);

        eyeNode.add(sclera, iris, pupil, catch1, catch2);
        return eyeNode;
      };

      faceGroup.add(buildDetailedEye(-0.18), buildDetailedEye(0.18));

      if (custom.facialFeature === 'starry') {
        const sparkGeo = new THREE.OctahedronGeometry(0.038, 0);
        const s1 = new THREE.Mesh(sparkGeo, starMat);
        s1.position.set(-0.16, 0.05, 0.49);
        const s2 = new THREE.Mesh(sparkGeo, starMat);
        s2.position.set(0.2, 0.05, 0.49);
        faceGroup.add(s1, s2);
      } else if (custom.facialFeature === 'scholar-glasses') {
        const rimGeo = new THREE.TorusGeometry(0.125, 0.019, 10, 22);
        const g1 = new THREE.Mesh(rimGeo, goldMat);
        g1.position.set(-0.18, 0.03, 0.475);
        const g2 = new THREE.Mesh(rimGeo, goldMat);
        g2.position.set(0.18, 0.03, 0.475);
        const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.14, 8), goldMat);
        bridge.rotation.z = Math.PI / 2;
        bridge.position.set(0, 0.03, 0.475);
        faceGroup.add(g1, g2, bridge);
      }
    }

    // 5. Rebuild Clothing / Tunic with Gold Trim
    clothingGroup.clear();
    if (custom.clothing === 'leaf-cloak') {
      const collarGeo = new THREE.TorusGeometry(0.39, 0.085, 10, 20);
      collarGeo.rotateX(Math.PI / 2);
      const collar = new THREE.Mesh(collarGeo, clothingMat);
      collar.position.y = 0.96;
      const brooch = new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 0), goldMat);
      brooch.position.set(0, 0.94, 0.42);
      clothingGroup.add(collar, brooch);
    } else if (custom.clothing === 'traveler-poncho') {
      const ponchoGeo = new THREE.ConeGeometry(0.65, 0.56, 18, 1, true);
      const poncho = new THREE.Mesh(ponchoGeo, clothingMat);
      poncho.position.y = 0.82;
      const trim = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.025, 8, 22), goldMat);
      trim.rotation.x = Math.PI / 2;
      trim.position.y = 0.56;
      clothingGroup.add(poncho, trim);
    } else if (custom.clothing === 'sun-robe') {
      const robeGeo = new THREE.CylinderGeometry(0.42, 0.63, 0.68, 18);
      const robe = new THREE.Mesh(robeGeo, clothingMat);
      robe.position.y = 0.56;
      const sash = new THREE.Mesh(new THREE.TorusGeometry(0.51, 0.045, 8, 20), goldMat);
      sash.rotation.x = Math.PI / 2;
      sash.position.y = 0.66;
      clothingGroup.add(robe, sash);
    } else if (custom.clothing === 'berry-overalls') {
      const bibGeo = new THREE.CylinderGeometry(0.48, 0.57, 0.48, 18);
      const bib = new THREE.Mesh(bibGeo, clothingMat);
      bib.position.y = 0.48;
      const scarfMat = new THREE.MeshStandardMaterial({ color: 0xff8fa3, roughness: 0.45 });
      const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.07, 10, 18), scarfMat);
      scarf.rotation.x = Math.PI / 2;
      scarf.position.y = 0.96;
      clothingGroup.add(bib, scarf);
    }
  };

  const setHighDetailEnabled = (enabled: boolean) => {
    satchelGroup.visible = true;
    staffRing.visible = enabled;
  };

  const setQualityTier = (quality: 'eco' | 'balanced' | 'high' | 'ultra') => {
    satchelGroup.visible = true;
    staffRing.visible = quality !== 'eco';
    auraHaloGroup.visible = quality === 'high' || quality === 'ultra';
  };

  applyCustomization(initialCustom);

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
    setHighDetailEnabled,
    setQualityTier,
  };
}

/**
 * Cozy Customizable Home Base Sanctuary (Safe Zone at x: 0, z: 14)
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

  const terraceGeo = new THREE.CylinderGeometry(6.0, 6.25, 0.18, 32);
  const terraceMat = new THREE.MeshStandardMaterial({
    color: 0xe6ccb2,
    roughness: 0.82,
  });
  const terrace = new THREE.Mesh(terraceGeo, terraceMat);
  terrace.position.y = 0.09;
  terrace.receiveShadow = true;
  root.add(terrace);

  const borderGeo = new THREE.RingGeometry(5.82, 6.08, 40);
  borderGeo.rotateX(-Math.PI / 2);
  const borderMat = new THREE.MeshBasicMaterial({
    color: 0x95d5b2,
    transparent: true,
    opacity: 0.5,
  });
  const borderRing = new THREE.Mesh(borderGeo, borderMat);
  borderRing.position.y = 0.19;
  root.add(borderRing);

  // Cozy Acorn Cottage
  const cottageGroup = new THREE.Group();
  cottageGroup.position.set(0, 0.16, 3.2);
  root.add(cottageGroup);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xfaf0ca, roughness: 0.78 });
  const timberMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.82 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x4a7c59, roughness: 0.62 });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0xffe66d,
    emissive: 0xffaa00,
    emissiveIntensity: 0.95,
    roughness: 0.2,
  });

  const walls = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.78, 1.95, 18), wallMat);
  walls.position.y = 0.96;
  walls.castShadow = true;
  walls.receiveShadow = true;
  cottageGroup.add(walls);

  // Scalloped Acorn Cap Roof + Chimney + Top Stem
  const roofMesh = new THREE.Mesh(new THREE.ConeGeometry(2.32, 1.72, 18), roofMat);
  roofMesh.position.y = 2.62;
  roofMesh.castShadow = true;
  cottageGroup.add(roofMesh);

  const roofStem = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.55, 8), timberMat);
  roofStem.position.y = 3.55;
  cottageGroup.add(roofStem);

  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 1.1, 10), timberMat);
  chimney.position.set(-1.1, 2.75, 0.4);
  cottageGroup.add(chimney);

  // Round Cozy Door with Timber Arch & Glowing Window
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.15, 0.22), timberMat);
  door.position.set(0, 0.58, -1.66);
  cottageGroup.add(door);

  const windowMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.16, 16), windowMat);
  windowMesh.rotation.x = Math.PI / 2;
  windowMesh.position.set(0.96, 1.12, -1.36);
  cottageGroup.add(windowMesh);

  const hearthGroup = new THREE.Group();
  hearthGroup.position.set(-2.0, 0.16, 0.5);
  root.add(hearthGroup);

  const hearthLight = new THREE.PointLight(0xff9f1c, 1.25, 11);
  hearthLight.position.set(-2.0, 1.4, 0.5);
  root.add(hearthLight);

  const gardenGroup = new THREE.Group();
  gardenGroup.position.set(0, 0.16, 0);
  root.add(gardenGroup);

  const trophyGroup = new THREE.Group();
  trophyGroup.position.set(2.2, 0.16, 0.6);
  root.add(trophyGroup);

  const roofColors: Record<string, number> = {
    moss: 0x4a7c59,
    terracotta: 0xd66853,
    slate: 0x457b9d,
    sakura: 0xff8fa3,
  };

  const applyHomeCustomization = (custom: HomeBaseCustomization, trophies: TrophyStatus) => {
    roofMat.color.setHex(roofColors[custom.roofStyle] || 0x4a7c59);

    hearthGroup.clear();
    if (custom.hearthStyle === 'campfire') {
      const logGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.9, 6);
      for (let i = 0; i < 4; i++) {
        const log = new THREE.Mesh(logGeo, timberMat);
        log.rotation.z = Math.PI / 2;
        log.rotation.y = (i * Math.PI) / 4;
        log.position.y = 0.1;
        hearthGroup.add(log);
      }
      const flameMat = new THREE.MeshStandardMaterial({
        color: 0xff9f1c,
        emissive: 0xff5400,
        emissiveIntensity: 1.1,
      });
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.65, 8), flameMat);
      flame.position.y = 0.42;
      hearthGroup.add(flame);
      hearthLight.color.setHex(0xff9f1c);
    } else if (custom.hearthStyle === 'fountain') {
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0xadb5bd, roughness: 0.7 });
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x48cae4,
        emissive: 0x0096c7,
        emissiveIntensity: 0.5,
        roughness: 0.12,
      });
      const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.7, 0.35, 16), stoneMat);
      basin.position.y = 0.18;
      const water = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.38, 16), waterMat);
      water.position.y = 0.2;
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.7, 12), waterMat);
      spire.position.y = 0.65;
      hearthGroup.add(basin, water, spire);
      hearthLight.color.setHex(0x48cae4);
    } else {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.6, 8), timberMat);
      post.position.y = 0.8;
      const orbMat = new THREE.MeshStandardMaterial({
        color: 0xffe66d,
        emissive: 0xffb703,
        emissiveIntensity: 1.2,
      });
      const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 1), orbMat);
      orb.position.y = 1.75;
      hearthGroup.add(post, orb);
      hearthLight.color.setHex(0xffe66d);
    }

    gardenGroup.clear();
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const gx = Math.cos(ang) * 5.2;
      const gz = Math.sin(ang) * 5.2;

      if (custom.gardenStyle === 'flowers') {
        const flMat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0xffd166 : 0xff8fa3,
          roughness: 0.4,
        });
        const fl = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), flMat);
        fl.position.set(gx, 0.24, gz);
        gardenGroup.add(fl);
      } else if (custom.gardenStyle === 'mushrooms') {
        const shroomMat = new THREE.MeshStandardMaterial({
          color: 0x06d6a0,
          emissive: 0x06d6a0,
          emissiveIntensity: 0.5,
        });
        const cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.35, 8), shroomMat);
        cap.position.set(gx, 0.35, gz);
        gardenGroup.add(cap);
      } else {
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x6c757d, roughness: 0.85 });
        const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), rockMat);
        c1.position.set(gx, 0.2, gz);
        const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), rockMat);
        c2.position.set(gx, 0.48, gz);
        gardenGroup.add(c1, c2);
      }
    }

    trophyGroup.clear();
    const pedMat = new THREE.MeshStandardMaterial({ color: 0xd8e2dc, roughness: 0.7 });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xff9900,
      emissiveIntensity: 0.4,
      metalness: 0.7,
      roughness: 0.2,
    });
    const lockedMat = new THREE.MeshStandardMaterial({
      color: 0x495057,
      roughness: 0.8,
      transparent: true,
      opacity: 0.4,
    });

    const trophyList = [
      { unlocked: trophies.shrineTrophy, offset: [-1.2, 0] },
      { unlocked: trophies.cleanserTrophy, offset: [-0.4, 0.6] },
      { unlocked: trophies.seedHoarderTrophy, offset: [0.4, 0.6] },
      { unlocked: trophies.guardianCrownTrophy, offset: [1.2, 0] },
    ];

    trophyList.forEach((t, idx) => {
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.55, 8), pedMat);
      ped.position.set(t.offset[0], 0.28, t.offset[1]);
      trophyGroup.add(ped);

      const statGeo =
        idx === 0
          ? new THREE.OctahedronGeometry(0.22, 0)
          : idx === 1
          ? new THREE.TorusKnotGeometry(0.14, 0.05, 24, 6)
          : idx === 2
          ? new THREE.DodecahedronGeometry(0.2, 0)
          : new THREE.ConeGeometry(0.22, 0.4, 6);

      const stat = new THREE.Mesh(statGeo, t.unlocked ? goldMat : lockedMat);
      stat.position.set(t.offset[0], 0.78, t.offset[1]);
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
 * 1. Spore Puffer: Multi-part mushroom swarmer with under-cap gill pleats,
 * glowing spore sacs, furrowed brow, catchlight eyes, and waddling feet.
 */
export function createPufferModel(): { root: THREE.Group; cap: THREE.Mesh; stem: THREE.Mesh; shadow: THREE.Mesh } {
  const root = new THREE.Group();

  const stemMat = new THREE.MeshStandardMaterial({
    color: 0xf4f1de,
    roughness: 0.6,
    metalness: 0.04,
  });
  const gillMat = new THREE.MeshStandardMaterial({
    color: 0xe0afa0,
    roughness: 0.75,
  });
  const capMat = new THREE.MeshStandardMaterial({
    color: 0xd62828,
    roughness: 0.38,
    metalness: 0.08,
  });
  const spotMat = new THREE.MeshStandardMaterial({
    color: 0xfff3b0,
    emissive: 0xffd166,
    emissiveIntensity: 0.35,
    roughness: 0.3,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x1b091c,
    roughness: 0.15,
  });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0xffbe0b });

  // Plump Stem + Waddling Feet
  const stemGeo = new THREE.CylinderGeometry(0.28, 0.4, 0.58, 16);
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = 0.34;
  stem.castShadow = true;
  root.add(stem);

  const footGeo = new THREE.SphereGeometry(0.13, 10, 8);
  footGeo.scale(1.0, 0.55, 1.35);
  const lf = new THREE.Mesh(footGeo, gillMat);
  lf.position.set(-0.2, 0.08, 0.08);
  const rf = new THREE.Mesh(footGeo, gillMat);
  rf.position.set(0.2, 0.08, 0.08);
  root.add(lf, rf);

  // Under-cap pleated gill collar
  const gillRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.09, 10, 20), gillMat);
  gillRing.rotation.x = Math.PI / 2;
  gillRing.position.y = 0.6;
  root.add(gillRing);

  // Sculpted Mushroom Cap
  const capGeo = new THREE.SphereGeometry(0.58, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.56);
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 0.58;
  cap.castShadow = true;
  root.add(cap);

  // Raised Bioluminescent Spore Wart Spots
  const dotGeo = new THREE.SphereGeometry(0.11, 10, 10);
  dotGeo.scale(1, 0.48, 1);
  [
    [-0.26, 0.95, 0.26],
    [0.28, 0.98, 0.16],
    [0.0, 1.12, -0.18],
    [-0.22, 0.92, -0.28],
    [0.22, 0.88, -0.25],
  ].forEach(([x, y, z]) => {
    const dot = new THREE.Mesh(dotGeo, spotMat);
    dot.position.set(x, y, z);
    root.add(dot);
  });

  // Expressive Eyes + Furrowed Angry Brows
  const eyeGeo = new THREE.SphereGeometry(0.075, 10, 10);
  const e1 = new THREE.Mesh(eyeGeo, eyeMat);
  e1.position.set(-0.15, 0.45, 0.34);
  const e2 = new THREE.Mesh(eyeGeo, eyeMat);
  e2.position.set(0.15, 0.45, 0.34);
  const p1 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), pupilMat);
  p1.position.set(-0.14, 0.46, 0.41);
  const p2 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), pupilMat);
  p2.position.set(0.14, 0.46, 0.41);

  const browGeo = new THREE.BoxGeometry(0.14, 0.035, 0.04);
  const b1 = new THREE.Mesh(browGeo, capMat);
  b1.position.set(-0.15, 0.53, 0.36);
  b1.rotation.z = -0.35;
  const b2 = new THREE.Mesh(browGeo, capMat);
  b2.position.set(0.15, 0.53, 0.36);
  b2.rotation.z = 0.35;

  root.add(e1, e2, p1, p2, b1, b2);

  const shadow = createContactShadow(0.65);
  root.add(shadow);

  return { root, cap, stem, shadow };
}

/**
 * 2. Bramble Roller: Armored thorny chestnut beast with interlocking bark bands,
 * glowing magma core seams, carved tribal mask, and ground charge telegraph.
 */
export function createRollerModel(): {
  root: THREE.Group;
  ball: THREE.Mesh;
  telegraph: THREE.Mesh;
  shadow: THREE.Mesh;
} {
  const root = new THREE.Group();

  const nutMat = new THREE.MeshStandardMaterial({
    color: 0x4a2c18,
    roughness: 0.72,
    metalness: 0.14,
  });
  const armorBandMat = new THREE.MeshStandardMaterial({
    color: 0x2b180d,
    roughness: 0.5,
    metalness: 0.25,
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xff4d00,
    emissive: 0xff2a00,
    emissiveIntensity: 0.85,
    roughness: 0.2,
  });

  const ballGeo = new THREE.SphereGeometry(0.66, 18, 16);
  const ball = new THREE.Mesh(ballGeo, nutMat);
  ball.position.y = 0.66;
  ball.castShadow = true;
  root.add(ball);

  // Interlocking Armored Bark Bands attached inside `ball` so they spin when rolling!
  const band1 = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.07, 10, 20), armorBandMat);
  band1.rotation.y = Math.PI / 2;
  const band2 = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.06, 10, 20), armorBandMat);
  band2.position.x = 0.28;
  band2.rotation.y = Math.PI / 2;
  const band3 = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.06, 10, 20), armorBandMat);
  band3.position.x = -0.28;
  band3.rotation.y = Math.PI / 2;
  ball.add(band1, band2, band3);

  const thornGeo = new THREE.ConeGeometry(0.13, 0.42, 6);
  thornGeo.translate(0, 0.21, 0);

  const spikeAngles = [
    [0, 0, 0.65],
    [0, 0, -0.65],
    [0.65, 0, 0],
    [-0.65, 0, 0],
    [0.45, 0.45, 0.45],
    [-0.45, 0.45, -0.45],
    [0.45, -0.45, -0.45],
    [-0.45, -0.45, 0.45],
    [0, 0.65, 0],
  ];

  spikeAngles.forEach(([x, y, z]) => {
    const spike = new THREE.Mesh(thornGeo, armorBandMat);
    spike.position.set(x, y, z);
    spike.lookAt(x * 2, y * 2, z * 2);
    spike.rotation.x += Math.PI / 2;
    ball.add(spike);
  });

  // Fierce Glowing Eyes & Brow Horns on Front
  const eyeGeo = new THREE.OctahedronGeometry(0.1, 0);
  const le = new THREE.Mesh(eyeGeo, glowMat);
  le.position.set(-0.22, 0.76, 0.58);
  const re = new THREE.Mesh(eyeGeo, glowMat);
  re.position.set(0.22, 0.76, 0.58);
  root.add(le, re);

  const telGeo = new THREE.PlaneGeometry(1.25, 8.2);
  const telMat = new THREE.MeshBasicMaterial({
    color: 0xff3b30,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const telegraph = new THREE.Mesh(telGeo, telMat);
  telegraph.rotation.x = -Math.PI / 2;
  telegraph.position.set(0, 0.03, 4.1);
  telegraph.renderOrder = 2;
  root.add(telegraph);

  const shadow = createContactShadow(0.84);
  root.add(shadow);

  return { root, ball, telegraph, shadow };
}

/**
 * 3. Gloom Sprite: Multi-part twilight wisp with horned forest mask,
 * 4 articulated gossamer wings, spirit tail, and orbiting dark-pollen shards.
 */
export function createSpriteModel(): {
  root: THREE.Group;
  orb: THREE.Mesh;
  wings: THREE.Group;
  shadow: THREE.Mesh;
} {
  const root = new THREE.Group();

  const orbMat = new THREE.MeshStandardMaterial({
    color: 0x5a189a,
    emissive: 0x3c096c,
    emissiveIntensity: 0.65,
    roughness: 0.25,
  });
  const maskMat = new THREE.MeshStandardMaterial({
    color: 0x240046,
    roughness: 0.45,
    metalness: 0.2,
  });
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xe0aaff,
    emissive: 0x9d4edd,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.78,
    roughness: 0.18,
    side: THREE.DoubleSide,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffe66d,
    emissiveIntensity: 0.95,
  });

  const orbGeo = new THREE.SphereGeometry(0.42, 18, 16);
  const orb = new THREE.Mesh(orbGeo, orbMat);
  orb.position.y = 1.42;
  orb.castShadow = true;
  root.add(orb);

  // Tapered Spirit Tail & Horned Crest
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.65, 10), orbMat);
  tail.rotation.x = Math.PI;
  tail.position.set(0, -0.42, -0.05);
  orb.add(tail);

  const hornGeo = new THREE.ConeGeometry(0.08, 0.35, 8);
  const h1 = new THREE.Mesh(hornGeo, maskMat);
  h1.position.set(-0.22, 0.42, 0.1);
  h1.rotation.z = 0.4;
  const h2 = new THREE.Mesh(hornGeo, maskMat);
  h2.position.set(0.22, 0.42, 0.1);
  h2.rotation.z = -0.4;
  orb.add(h1, h2);

  // Orbiting Dark-Pollen Shards
  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * Math.PI * 2;
    const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), eyeMat);
    shard.position.set(Math.cos(ang) * 0.62, Math.sin(ang * 2) * 0.12, Math.sin(ang) * 0.62);
    orb.add(shard);
  }

  const eyeGeo = new THREE.SphereGeometry(0.075, 10, 10);
  eyeGeo.scale(1.2, 0.8, 0.6);
  const e1 = new THREE.Mesh(eyeGeo, eyeMat);
  e1.position.set(-0.15, 1.46, 0.38);
  const e2 = new THREE.Mesh(eyeGeo, eyeMat);
  e2.position.set(0.15, 1.46, 0.38);
  root.add(e1, e2);

  // 4 Articulated Fairy Wings (Upper + Lower pairs)
  const wings = new THREE.Group();
  wings.position.set(0, 1.46, -0.22);

  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.quadraticCurveTo(0.45, 0.38, 0.85, 0.14);
  wingShape.quadraticCurveTo(0.4, -0.22, 0, 0);
  const wingGeo = new THREE.ShapeGeometry(wingShape);

  const lw = new THREE.Mesh(wingGeo, wingMat);
  lw.rotation.z = 0.25;
  const rw = new THREE.Mesh(wingGeo, wingMat);
  rw.rotation.z = Math.PI - 0.25;
  rw.scale.y = -1;

  const lwLower = new THREE.Mesh(wingGeo, wingMat);
  lwLower.scale.set(0.68, 0.68, 0.68);
  lwLower.rotation.z = -0.28;
  const rwLower = new THREE.Mesh(wingGeo, wingMat);
  rwLower.scale.set(0.68, -0.68, 0.68);
  rwLower.rotation.z = Math.PI + 0.28;

  wings.add(lw, rw, lwLower, rwLower);
  root.add(wings);

  const shadow = createContactShadow(0.55);
  root.add(shadow);

  return { root, orb, wings, shadow };
}

/**
 * Ancient Sun Shrine: 4 scattered across grove with astrolabe rings & Solar Tether Beam to Boss
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
    color: 0x7a8276,
    roughness: 0.82,
    metalness: 0.08,
  });
  const mossMat = new THREE.MeshStandardMaterial({
    color: 0x40916c,
    roughness: 0.88,
    metalness: 0.02,
  });
  const runeMat = new THREE.MeshStandardMaterial({
    color: 0x555555,
    emissive: 0x221100,
    emissiveIntensity: 0.15,
    roughness: 0.28,
    metalness: 0.4,
  });
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xffd166,
    emissive: 0xff8800,
    emissiveIntensity: 0.55,
    roughness: 0.12,
    metalness: 0.3,
  });

  // Stepped Octagonal Sanctuary Base
  const base1 = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.75, 0.42, 8), stoneMat);
  base1.position.y = 0.21;
  base1.receiveShadow = true;
  root.add(base1);

  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.1, 0.32, 8), mossMat);
  base2.position.y = 0.56;
  base2.receiveShadow = true;
  root.add(base2);

  // 4 Carved Stone Pillars + Top Crown Arch Ring
  const pillarGeo = new THREE.CylinderGeometry(0.22, 0.28, 2.2, 8);
  const angles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
  angles.forEach((ang) => {
    const pillar = new THREE.Mesh(pillarGeo, stoneMat);
    pillar.position.set(Math.cos(ang) * 1.55, 1.6, Math.sin(ang) * 1.55);
    pillar.castShadow = true;
    root.add(pillar);
  });

  const crownArch = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.16, 8, 24), stoneMat);
  crownArch.rotation.x = Math.PI / 2;
  crownArch.position.y = 2.7;
  crownArch.castShadow = true;
  root.add(crownArch);

  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.68, 1), crystalMat);
  crystal.position.y = 2.15;
  root.add(crystal);

  const ringGeo = new THREE.TorusGeometry(1.32, 0.085, 10, 28);
  ringGeo.rotateX(Math.PI / 2);
  const ring = new THREE.Mesh(ringGeo, runeMat);
  ring.position.y = 0.78;
  root.add(ring);

  // Solar Energy Tether Beam (Visible once Shrine is restored, pointing to Central Boss)
  const beamGeo = new THREE.CylinderGeometry(0.08, 0.14, 1.0, 8);
  beamGeo.rotateX(Math.PI / 2);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xffd166,
    transparent: true,
    opacity: 0.75,
  });
  const beamMesh = new THREE.Mesh(beamGeo, beamMat);
  beamMesh.position.y = 2.15;
  beamMesh.visible = false;
  root.add(beamMesh);

  const light = new THREE.PointLight(0xffa500, 0.6, 9);
  light.position.set(0, 2.2, 0);
  root.add(light);

  const shadow = createContactShadow(2.35);
  root.add(shadow);

  return { root, crystal, ring, beamMesh, light };
}

/**
 * Sun-Seed Pickup item
 */
export function createSunSeedModel(): { root: THREE.Group; mesh: THREE.Mesh } {
  const root = new THREE.Group();

  const seedMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0xff9900,
    emissiveIntensity: 0.95,
    roughness: 0.15,
    metalness: 0.3,
  });

  const geo = new THREE.OctahedronGeometry(0.36, 1);
  const mesh = new THREE.Mesh(geo, seedMat);
  mesh.position.y = 0.52;
  root.add(mesh);

  const haloGeo = new THREE.TorusGeometry(0.52, 0.035, 8, 20);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0xffea79, transparent: true, opacity: 0.75 });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.y = 0.52;
  halo.rotation.x = Math.PI / 3;
  root.add(halo);

  const shadow = createContactShadow(0.42);
  root.add(shadow);

  return { root, mesh };
}

/**
 * 4. Corrupted Elder Bramble Colossus (Central Guardian Boss at x: 0, z: 0):
 * 14-part Ancient Ent with gnarled roots, carved bark face, glowing eyes,
 * articulated thorny pauldron arms, antler branch crown, and rotating Rune Barrier Shield!
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
} {
  const root = new THREE.Group();

  const barkMat = new THREE.MeshStandardMaterial({
    color: 0x3a2314,
    roughness: 0.84,
    metalness: 0.08,
  });
  const darkBarkMat = new THREE.MeshStandardMaterial({
    color: 0x221209,
    roughness: 0.65,
    metalness: 0.15,
  });
  const mossShoulderMat = new THREE.MeshStandardMaterial({
    color: 0x2d6a4f,
    roughness: 0.78,
  });
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x9d4edd,
    emissive: 0x5a189a,
    emissiveIntensity: 0.85,
    roughness: 0.18,
    metalness: 0.3,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xff4d6d,
    emissive: 0xc9184a,
    emissiveIntensity: 0.95,
  });

  // 1. Gnarled Root Base & Buttress Roots
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 2.25, 1.1, 10), darkBarkMat);
  base.position.y = 0.55;
  base.castShadow = true;
  root.add(base);

  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const rootLeg = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.8, 7), barkMat);
    rootLeg.position.set(Math.cos(ang) * 1.75, 0.5, Math.sin(ang) * 1.75);
    rootLeg.rotation.z = -Math.cos(ang) * 0.55;
    rootLeg.rotation.x = Math.sin(ang) * 0.55;
    root.add(rootLeg);
  }

  // 2. Sculpted Ent Torso
  const bodyGeo = new THREE.CylinderGeometry(1.45, 1.55, 2.8, 12);
  const body = new THREE.Mesh(bodyGeo, barkMat);
  body.position.y = 2.1;
  body.castShadow = true;
  body.receiveShadow = true;
  root.add(body);

  // 3. Carved Ancient Wooden Face & Glowing Eyes
  const brow = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.34, 0.65), darkBarkMat);
  brow.position.set(0, 2.95, 1.28);
  root.add(brow);

  const eyeGeo = new THREE.OctahedronGeometry(0.2, 0);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.scale.set(1.3, 0.75, 0.6);
  leftEye.position.set(-0.45, 2.72, 1.42);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.scale.set(1.3, 0.75, 0.6);
  rightEye.position.set(0.45, 2.72, 1.42);
  root.add(leftEye, rightEye);

  // Exposed Heart-Core inside Chest Hollow
  const coreFrame = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.16, 8, 16), darkBarkMat);
  coreFrame.position.set(0, 1.95, 1.32);
  root.add(coreFrame);

  const coreGeo = new THREE.IcosahedronGeometry(0.72, 1);
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(0, 1.95, 1.25);
  root.add(core);

  // 4. Articulated Bramble Pauldron Arms + Thorny Claws
  const buildBossArm = (side: -1 | 1) => {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * 1.75, 2.85, 0.15);

    const pauldron = new THREE.Mesh(new THREE.DodecahedronGeometry(0.68, 0), mossShoulderMat);
    pauldron.castShadow = true;

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.44, 1.7, 8), barkMat);
    forearm.position.set(side * 0.35, -0.95, 0.35);
    forearm.rotation.z = side * 0.25;
    forearm.rotation.x = -0.35;
    forearm.castShadow = true;

    const claw1 = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.65, 6), darkBarkMat);
    claw1.position.set(side * 0.45, -1.85, 0.75);
    claw1.rotation.x = Math.PI * 0.75;

    armGroup.add(pauldron, forearm, claw1);
    return armGroup;
  };

  const leftArm = buildBossArm(-1);
  const rightArm = buildBossArm(1);
  root.add(leftArm, rightArm);

  // 5. Antler Crown of Twisted Branches
  const branches = new THREE.Group();
  branches.position.set(0, 3.45, 0);

  const branchGeo = new THREE.ConeGeometry(0.32, 2.4, 7);
  branchGeo.translate(0, 1.2, 0);

  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const b = new THREE.Mesh(branchGeo, darkBarkMat);
    b.position.set(Math.cos(ang) * 0.75, 0, Math.sin(ang) * 0.75);
    b.rotation.z = -Math.cos(ang) * 0.48;
    b.rotation.x = Math.sin(ang) * 0.48;
    b.castShadow = true;
    branches.add(b);
  }
  root.add(branches);

  // 6. Rotating Thorny Rune Shield Ring (Active while Shrines < 4)
  const shieldGeo = new THREE.TorusGeometry(2.65, 0.12, 10, 32);
  shieldGeo.rotateX(Math.PI / 2);
  const shieldMat = new THREE.MeshStandardMaterial({
    color: 0x9d4edd,
    emissive: 0x7b2cbf,
    emissiveIntensity: 0.9,
    transparent: true,
    opacity: 0.75,
  });
  const shieldRing = new THREE.Mesh(shieldGeo, shieldMat);
  shieldRing.position.y = 1.65;
  root.add(shieldRing);

  const shadow = createContactShadow(2.85);
  root.add(shadow);

  return { root, core, branches, leftArm, rightArm, shieldRing, eyeMat, shadow };
}

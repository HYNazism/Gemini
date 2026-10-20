/**
 * Procedural 3-12 part composite 3D models for Sproutling: Grove Guardian.
 * Includes full 3D Character Customization Rig (Body types, Hairstyles, Facial features, Clothing)
 * and the Customizable Cozy Home Base Sanctuary with Trophy Pedestals.
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
  gradient.addColorStop(0, 'rgba(15, 30, 20, 0.7)');
  gradient.addColorStop(0.5, 'rgba(15, 30, 20, 0.35)');
  gradient.addColorStop(1, 'rgba(15, 30, 20, 0)');

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
    opacity: 0.6,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.02;
  mesh.renderOrder = 1;
  return mesh;
}

/**
 * Procedural Hero: Pip the Sproutling with live 3D customization slots
 */
export interface HeroRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  bodyMesh: THREE.Mesh;
  headMesh: THREE.Mesh;
  sproutTop: THREE.Group;
  faceGroup: THREE.Group;
  clothingGroup: THREE.Group;
  cape: THREE.Mesh;
  staff: THREE.Group;
  staffCrystal: THREE.Mesh;
  leftFoot: THREE.Mesh;
  rightFoot: THREE.Mesh;
  shadow: THREE.Mesh;
  skinMat: THREE.MeshStandardMaterial;
  hairMat: THREE.MeshStandardMaterial;
  clothingMat: THREE.MeshStandardMaterial;
  swingAngle: number;
  applyCustomization: (custom: CharacterCustomization) => void;
}

export function createHeroModel(initialCustom: CharacterCustomization = DEFAULT_CUSTOMIZATION): HeroRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialCustom.skinColor),
    roughness: 0.55,
    metalness: 0.05,
  });
  const bellyMat = new THREE.MeshStandardMaterial({
    color: 0xe9f5db,
    roughness: 0.65,
    metalness: 0.02,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialCustom.hairColor),
    roughness: 0.45,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  const clothingMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialCustom.clothingColor),
    roughness: 0.5,
    metalness: 0.08,
    side: THREE.DoubleSide,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x6e4726,
    roughness: 0.8,
    metalness: 0.05,
  });
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xffd152,
    emissive: 0xffaa00,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.3,
  });

  // 1. Lower Body
  const bodyGeo = new THREE.SphereGeometry(0.55, 18, 16);
  bodyGeo.scale(1, 1.15, 0.95);
  const bodyMesh = new THREE.Mesh(bodyGeo, skinMat);
  bodyMesh.position.y = 0.65;
  bodyMesh.castShadow = true;
  bodyGroup.add(bodyMesh);

  // Belly patch
  const bellyGeo = new THREE.SphereGeometry(0.42, 14, 12);
  bellyGeo.scale(0.85, 0.9, 0.4);
  const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
  bellyMesh.position.set(0, 0.58, 0.38);
  bodyGroup.add(bellyMesh);

  // 2. Head
  const headGeo = new THREE.SphereGeometry(0.48, 18, 16);
  headGeo.scale(1.05, 0.95, 1);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.y = 1.35;
  headMesh.castShadow = true;
  bodyGroup.add(headMesh);

  // 3. Facial Features Container
  const faceGroup = new THREE.Group();
  faceGroup.position.set(0, 1.35, 0);
  bodyGroup.add(faceGroup);

  // 4. Hairstyle / Topknot Container
  const sproutTop = new THREE.Group();
  sproutTop.position.set(0, 1.78, 0);
  bodyGroup.add(sproutTop);

  // 5. Clothing / Outfit Container
  const clothingGroup = new THREE.Group();
  bodyGroup.add(clothingGroup);

  // Persistent cape ref for flutter animation
  const capeShape = new THREE.Shape();
  capeShape.moveTo(-0.38, 0);
  capeShape.quadraticCurveTo(0, -0.7, 0.38, 0);
  capeShape.quadraticCurveTo(0, -0.15, -0.38, 0);
  const capeGeo = new THREE.ShapeGeometry(capeShape);
  const cape = new THREE.Mesh(capeGeo, clothingMat);
  cape.position.set(0, 1.15, -0.42);
  cape.rotation.x = -0.35;
  bodyGroup.add(cape);

  // 6. Feet
  const footGeo = new THREE.SphereGeometry(0.16, 10, 8);
  footGeo.scale(0.9, 0.6, 1.3);
  const leftFoot = new THREE.Mesh(footGeo, woodMat);
  leftFoot.position.set(-0.26, 0.12, 0);
  const rightFoot = new THREE.Mesh(footGeo, woodMat);
  rightFoot.position.set(0.26, 0.12, 0);
  bodyGroup.add(leftFoot, rightFoot);

  // 7. Acorn Staff / Wand Rig
  const staff = new THREE.Group();
  staff.position.set(0.55, 0.8, 0.2);

  const staffShaftGeo = new THREE.CylinderGeometry(0.045, 0.05, 1.25, 8);
  const staffShaft = new THREE.Mesh(staffShaftGeo, woodMat);
  staffShaft.castShadow = true;
  staff.add(staffShaft);

  const capGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.2, 10);
  capGeo.translate(0, 0.62, 0);
  const staffCap = new THREE.Mesh(capGeo, woodMat);
  staff.add(staffCap);

  const crystalGeo = new THREE.OctahedronGeometry(0.2, 0);
  crystalGeo.translate(0, 0.78, 0);
  const staffCrystal = new THREE.Mesh(crystalGeo, crystalMat);
  staff.add(staffCrystal);

  bodyGroup.add(staff);

  const shadow = createContactShadow(0.75);
  root.add(shadow);

  const applyCustomization = (custom: CharacterCustomization) => {
    // 1. Body Type Scale
    const bodyOpt =
      CUSTOMIZATION_OPTIONS.bodyTypes.find((b) => b.id === custom.bodyType) ||
      CUSTOMIZATION_OPTIONS.bodyTypes[0];
    bodyGroup.scale.set(bodyOpt.scale[0], bodyOpt.scale[1], bodyOpt.scale[2]);

    // 2. Colors
    skinMat.color.set(custom.skinColor);
    hairMat.color.set(custom.hairColor);
    clothingMat.color.set(custom.clothingColor);

    // 3. Rebuild Hairstyle
    sproutTop.clear();
    if (custom.hairstyle === 'twin-sprout') {
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.28, 8);
      stemGeo.translate(0, 0.14, 0);
      sproutTop.add(new THREE.Mesh(stemGeo, woodMat));

      const leafShape = new THREE.Shape();
      leafShape.moveTo(0, 0);
      leafShape.quadraticCurveTo(0.18, 0.22, 0, 0.5);
      leafShape.quadraticCurveTo(-0.18, 0.22, 0, 0);
      const leafGeo = new THREE.ShapeGeometry(leafShape);

      const l1 = new THREE.Mesh(leafGeo, hairMat);
      l1.position.set(0, 0.26, 0);
      l1.rotation.set(0.2, 0.4, 0.6);
      const l2 = new THREE.Mesh(leafGeo, hairMat);
      l2.position.set(0, 0.26, 0);
      l2.rotation.set(-0.2, -0.4, -0.6);
      sproutTop.add(l1, l2);
    } else if (custom.hairstyle === 'fluffy-bob') {
      const domeGeo = new THREE.SphereGeometry(0.52, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.65);
      const dome = new THREE.Mesh(domeGeo, hairMat);
      dome.position.y = -0.35;
      sproutTop.add(dome);

      const puffGeo = new THREE.SphereGeometry(0.18, 10, 10);
      const p1 = new THREE.Mesh(puffGeo, hairMat);
      p1.position.set(-0.38, -0.42, 0.12);
      const p2 = new THREE.Mesh(puffGeo, hairMat);
      p2.position.set(0.38, -0.42, 0.12);
      sproutTop.add(p1, p2);
    } else if (custom.hairstyle === 'braided-crown') {
      const ringGeo = new THREE.TorusGeometry(0.36, 0.09, 8, 18);
      ringGeo.rotateX(Math.PI / 2);
      const crown = new THREE.Mesh(ringGeo, hairMat);
      crown.position.y = -0.15;
      sproutTop.add(crown);

      const braidGeo = new THREE.CapsuleGeometry(0.08, 0.35, 6, 8);
      const b1 = new THREE.Mesh(braidGeo, hairMat);
      b1.position.set(-0.42, -0.45, -0.05);
      b1.rotation.z = 0.25;
      const b2 = new THREE.Mesh(braidGeo, hairMat);
      b2.position.set(0.42, -0.45, -0.05);
      b2.rotation.z = -0.25;
      sproutTop.add(b1, b2);
    } else if (custom.hairstyle === 'mushroom-beret') {
      const capGeo = new THREE.SphereGeometry(0.58, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const cap = new THREE.Mesh(capGeo, hairMat);
      cap.position.y = -0.22;
      sproutTop.add(cap);

      const dotMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
      const dotGeo = new THREE.SphereGeometry(0.09, 8, 8);
      [
        [-0.25, 0.05, 0.25],
        [0.25, 0.08, 0.18],
        [0, 0.22, -0.2],
      ].forEach(([dx, dy, dz]) => {
        const d = new THREE.Mesh(dotGeo, dotMat);
        d.position.set(dx, dy, dz);
        sproutTop.add(d);
      });
    } else if (custom.hairstyle === 'sun-halo') {
      const coreMat = new THREE.MeshStandardMaterial({ color: 0x5a3825, roughness: 0.7 });
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), coreMat);
      core.position.y = 0.1;
      sproutTop.add(core);

      const petalGeo = new THREE.ConeGeometry(0.08, 0.28, 6);
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const petal = new THREE.Mesh(petalGeo, hairMat);
        petal.position.set(Math.cos(ang) * 0.22, 0.1, Math.sin(ang) * 0.22);
        petal.rotation.x = Math.PI / 2;
        petal.rotation.z = -ang;
        sproutTop.add(petal);
      }
    }

    // 4. Rebuild Facial Features
    faceGroup.clear();
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1b2816, roughness: 0.15, metalness: 0.4 });
    const cheekMat = new THREE.MeshStandardMaterial({ color: 0xff8fa3, roughness: 0.7 });
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfff3b0,
      emissive: 0xffd166,
      emissiveIntensity: 0.7,
    });

    const cheekGeo = new THREE.SphereGeometry(0.08, 8, 8);
    cheekGeo.scale(1, 0.6, 0.3);
    const lc = new THREE.Mesh(cheekGeo, cheekMat);
    lc.position.set(-0.28, -0.07, 0.38);
    const rc = new THREE.Mesh(cheekGeo, cheekMat);
    rc.position.set(0.28, -0.07, 0.38);
    faceGroup.add(lc, rc);

    if (custom.facialFeature === 'sleepy-cozy') {
      const lidGeo = new THREE.TorusGeometry(0.07, 0.02, 6, 12, Math.PI);
      const le = new THREE.Mesh(lidGeo, eyeMat);
      le.position.set(-0.18, 0.03, 0.43);
      const re = new THREE.Mesh(lidGeo, eyeMat);
      re.position.set(0.18, 0.03, 0.43);
      faceGroup.add(le, re);
    } else {
      const eyeGeo = new THREE.SphereGeometry(0.075, 10, 10);
      const le = new THREE.Mesh(eyeGeo, eyeMat);
      le.position.set(-0.18, 0.03, 0.42);
      const re = new THREE.Mesh(eyeGeo, eyeMat);
      re.position.set(0.18, 0.03, 0.42);
      faceGroup.add(le, re);

      if (custom.facialFeature === 'starry') {
        const sparkGeo = new THREE.OctahedronGeometry(0.035, 0);
        const s1 = new THREE.Mesh(sparkGeo, starMat);
        s1.position.set(-0.16, 0.05, 0.48);
        const s2 = new THREE.Mesh(sparkGeo, starMat);
        s2.position.set(0.2, 0.05, 0.48);
        faceGroup.add(s1, s2);
      } else if (custom.facialFeature === 'scholar-glasses') {
        const brassMat = new THREE.MeshStandardMaterial({
          color: 0xffd166,
          metalness: 0.7,
          roughness: 0.25,
        });
        const rimGeo = new THREE.TorusGeometry(0.12, 0.018, 8, 18);
        const g1 = new THREE.Mesh(rimGeo, brassMat);
        g1.position.set(-0.18, 0.03, 0.46);
        const g2 = new THREE.Mesh(rimGeo, brassMat);
        g2.position.set(0.18, 0.03, 0.46);
        const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 6), brassMat);
        bridge.rotation.z = Math.PI / 2;
        bridge.position.set(0, 0.03, 0.46);
        faceGroup.add(g1, g2, bridge);
      }
    }

    // 5. Rebuild Clothing / Tunic
    clothingGroup.clear();
    if (custom.clothing === 'leaf-cloak') {
      const collarGeo = new THREE.TorusGeometry(0.38, 0.08, 8, 16);
      collarGeo.rotateX(Math.PI / 2);
      const collar = new THREE.Mesh(collarGeo, clothingMat);
      collar.position.y = 0.95;
      clothingGroup.add(collar);
    } else if (custom.clothing === 'traveler-poncho') {
      const ponchoGeo = new THREE.ConeGeometry(0.64, 0.55, 14, 1, true);
      const poncho = new THREE.Mesh(ponchoGeo, clothingMat);
      poncho.position.y = 0.82;
      clothingGroup.add(poncho);
    } else if (custom.clothing === 'sun-robe') {
      const robeGeo = new THREE.CylinderGeometry(0.42, 0.62, 0.68, 14);
      const robe = new THREE.Mesh(robeGeo, clothingMat);
      robe.position.y = 0.56;
      clothingGroup.add(robe);

      const trimMat = new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.5, roughness: 0.3 });
      const belt = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 8, 18), trimMat);
      belt.rotation.x = Math.PI / 2;
      belt.position.y = 0.65;
      clothingGroup.add(belt);
    } else if (custom.clothing === 'berry-overalls') {
      const bibGeo = new THREE.CylinderGeometry(0.48, 0.56, 0.48, 14);
      const bib = new THREE.Mesh(bibGeo, clothingMat);
      bib.position.y = 0.48;
      clothingGroup.add(bib);

      const scarfMat = new THREE.MeshStandardMaterial({ color: 0xff8fa3, roughness: 0.5 });
      const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.065, 8, 16), scarfMat);
      scarf.rotation.x = Math.PI / 2;
      scarf.position.y = 0.96;
      clothingGroup.add(scarf);
    }
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
    cape,
    staff,
    staffCrystal,
    leftFoot,
    rightFoot,
    shadow,
    skinMat,
    hairMat,
    clothingMat,
    swingAngle: 0,
    applyCustomization,
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

  // Safe Zone Stone Terrace Ring
  const terraceGeo = new THREE.CylinderGeometry(6.0, 6.2, 0.16, 28);
  const terraceMat = new THREE.MeshStandardMaterial({
    color: 0xe6ccb2,
    roughness: 0.85,
  });
  const terrace = new THREE.Mesh(terraceGeo, terraceMat);
  terrace.position.y = 0.08;
  terrace.receiveShadow = true;
  root.add(terrace);

  // Safe Zone Glowing Rune Border
  const borderGeo = new THREE.RingGeometry(5.85, 6.05, 36);
  borderGeo.rotateX(-Math.PI / 2);
  const borderMat = new THREE.MeshBasicMaterial({
    color: 0x95d5b2,
    transparent: true,
    opacity: 0.45,
  });
  const borderRing = new THREE.Mesh(borderGeo, borderMat);
  borderRing.position.y = 0.18;
  root.add(borderRing);

  // 1. Cozy Acorn Cottage (Back of Sanctuary)
  const cottageGroup = new THREE.Group();
  cottageGroup.position.set(0, 0.16, 3.2);
  root.add(cottageGroup);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xfaf0ca, roughness: 0.8 });
  const timberMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.85 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x4a7c59, roughness: 0.65 });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0xffe66d,
    emissive: 0xffaa00,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });

  const walls = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.75, 1.9, 14), wallMat);
  walls.position.y = 0.95;
  walls.castShadow = true;
  walls.receiveShadow = true;
  cottageGroup.add(walls);

  const roofMesh = new THREE.Mesh(new THREE.ConeGeometry(2.25, 1.65, 14), roofMat);
  roofMesh.position.y = 2.6;
  roofMesh.castShadow = true;
  cottageGroup.add(roofMesh);

  // Round Cozy Door & Glowing Window
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.2), timberMat);
  door.position.set(0, 0.55, -1.65);
  cottageGroup.add(door);

  const windowMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.15, 12), windowMat);
  windowMesh.rotation.x = Math.PI / 2;
  windowMesh.position.set(0.95, 1.1, -1.35);
  cottageGroup.add(windowMesh);

  // 2. Hearth / Centerpiece Slot
  const hearthGroup = new THREE.Group();
  hearthGroup.position.set(-2.0, 0.16, 0.5);
  root.add(hearthGroup);

  const hearthLight = new THREE.PointLight(0xff9f1c, 1.2, 10);
  hearthLight.position.set(-2.0, 1.4, 0.5);
  root.add(hearthLight);

  // 3. Garden Decor Slot
  const gardenGroup = new THREE.Group();
  gardenGroup.position.set(0, 0.16, 0);
  root.add(gardenGroup);

  // 4. Trophy Pedestals Slot
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

    // Rebuild Hearth
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
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.65, 7), flameMat);
      flame.position.y = 0.42;
      hearthGroup.add(flame);
      hearthLight.color.setHex(0xff9f1c);
    } else if (custom.hearthStyle === 'fountain') {
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0xadb5bd, roughness: 0.7 });
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x48cae4,
        emissive: 0x0096c7,
        emissiveIntensity: 0.5,
        roughness: 0.15,
      });
      const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.7, 0.35, 14), stoneMat);
      basin.position.y = 0.18;
      const water = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.38, 14), waterMat);
      water.position.y = 0.2;
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.7, 10), waterMat);
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

    // Rebuild Garden Trim
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

    // Rebuild Trophy Pedestals
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
 * 1. Spore Puffer: Bouncy mushroom swarmer
 */
export function createPufferModel(): { root: THREE.Group; cap: THREE.Mesh; stem: THREE.Mesh; shadow: THREE.Mesh } {
  const root = new THREE.Group();

  const stemMat = new THREE.MeshStandardMaterial({
    color: 0xeeece5,
    roughness: 0.65,
    metalness: 0.05,
  });
  const capMat = new THREE.MeshStandardMaterial({
    color: 0xd64045,
    roughness: 0.45,
    metalness: 0.05,
  });
  const spotMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.35,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x221122,
    roughness: 0.2,
  });

  const stemGeo = new THREE.CylinderGeometry(0.3, 0.38, 0.55, 12);
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = 0.32;
  stem.castShadow = true;
  root.add(stem);

  const capGeo = new THREE.SphereGeometry(0.55, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 0.6;
  cap.castShadow = true;
  root.add(cap);

  const dotGeo = new THREE.SphereGeometry(0.1, 8, 8);
  dotGeo.scale(1, 0.4, 1);
  [
    [-0.25, 0.95, 0.25],
    [0.28, 0.98, 0.15],
    [0.0, 1.08, -0.2],
  ].forEach(([x, y, z]) => {
    const dot = new THREE.Mesh(dotGeo, spotMat);
    dot.position.set(x, y, z);
    root.add(dot);
  });

  const eyeGeo = new THREE.SphereGeometry(0.065, 8, 8);
  const e1 = new THREE.Mesh(eyeGeo, eyeMat);
  e1.position.set(-0.15, 0.45, 0.35);
  const e2 = new THREE.Mesh(eyeGeo, eyeMat);
  e2.position.set(0.15, 0.45, 0.35);
  root.add(e1, e2);

  const shadow = createContactShadow(0.6);
  root.add(shadow);

  return { root, cap, stem, shadow };
}

/**
 * 2. Bramble Roller: Thorny chestnut nut with ground telegraph
 */
export function createRollerModel(): {
  root: THREE.Group;
  ball: THREE.Mesh;
  telegraph: THREE.Mesh;
  shadow: THREE.Mesh;
} {
  const root = new THREE.Group();

  const nutMat = new THREE.MeshStandardMaterial({
    color: 0x5a3825,
    roughness: 0.75,
    metalness: 0.1,
  });
  const thornMat = new THREE.MeshStandardMaterial({
    color: 0x2e1910,
    roughness: 0.4,
    metalness: 0.2,
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xff3b30,
    emissive: 0xff2020,
    emissiveIntensity: 0.6,
    roughness: 0.2,
  });

  const ballGeo = new THREE.SphereGeometry(0.65, 14, 12);
  const ball = new THREE.Mesh(ballGeo, nutMat);
  ball.position.y = 0.65;
  ball.castShadow = true;
  root.add(ball);

  const thornGeo = new THREE.ConeGeometry(0.12, 0.38, 6);
  thornGeo.translate(0, 0.19, 0);

  const spikeAngles = [
    [0, 0, 0.65],
    [0, 0, -0.65],
    [0.65, 0, 0],
    [-0.65, 0, 0],
    [0.45, 0.45, 0.45],
    [-0.45, 0.45, -0.45],
    [0.45, -0.45, -0.45],
    [-0.45, -0.45, 0.45],
  ];

  spikeAngles.forEach(([x, y, z]) => {
    const spike = new THREE.Mesh(thornGeo, thornMat);
    spike.position.set(x, y + 0.65, z);
    spike.lookAt(root.position.x + x * 2, root.position.y + 0.65 + y * 2, root.position.z + z * 2);
    spike.rotation.x += Math.PI / 2;
    root.add(spike);
  });

  const eyeGeo = new THREE.SphereGeometry(0.09, 8, 8);
  const le = new THREE.Mesh(eyeGeo, glowMat);
  le.position.set(-0.22, 0.72, 0.58);
  const re = new THREE.Mesh(eyeGeo, glowMat);
  re.position.set(0.22, 0.72, 0.58);
  root.add(le, re);

  const telGeo = new THREE.PlaneGeometry(1.2, 8.0);
  const telMat = new THREE.MeshBasicMaterial({
    color: 0xff3b30,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const telegraph = new THREE.Mesh(telGeo, telMat);
  telegraph.rotation.x = -Math.PI / 2;
  telegraph.position.set(0, 0.03, 4.0);
  telegraph.renderOrder = 2;
  root.add(telegraph);

  const shadow = createContactShadow(0.8);
  root.add(shadow);

  return { root, ball, telegraph, shadow };
}

/**
 * 3. Gloom Sprite: Floating winged kiter
 */
export function createSpriteModel(): {
  root: THREE.Group;
  orb: THREE.Mesh;
  wings: THREE.Group;
  shadow: THREE.Mesh;
} {
  const root = new THREE.Group();

  const orbMat = new THREE.MeshStandardMaterial({
    color: 0x784ba0,
    emissive: 0x3d1d6d,
    emissiveIntensity: 0.5,
    roughness: 0.3,
  });
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xcdb4db,
    transparent: true,
    opacity: 0.7,
    roughness: 0.2,
    side: THREE.DoubleSide,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfff0aa,
    emissiveIntensity: 0.8,
  });

  const orbGeo = new THREE.SphereGeometry(0.42, 14, 14);
  const orb = new THREE.Mesh(orbGeo, orbMat);
  orb.position.y = 1.4;
  orb.castShadow = true;
  root.add(orb);

  const eyeGeo = new THREE.SphereGeometry(0.07, 8, 8);
  const e1 = new THREE.Mesh(eyeGeo, eyeMat);
  e1.position.set(-0.14, 1.45, 0.36);
  const e2 = new THREE.Mesh(eyeGeo, eyeMat);
  e2.position.set(0.14, 1.45, 0.36);
  root.add(e1, e2);

  const wings = new THREE.Group();
  wings.position.set(0, 1.45, -0.2);

  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.quadraticCurveTo(0.4, 0.3, 0.75, 0.1);
  wingShape.quadraticCurveTo(0.35, -0.2, 0, 0);
  const wingGeo = new THREE.ShapeGeometry(wingShape);

  const lw = new THREE.Mesh(wingGeo, wingMat);
  lw.rotation.z = 0.2;
  const rw = new THREE.Mesh(wingGeo, wingMat);
  rw.rotation.z = Math.PI - 0.2;
  rw.scale.y = -1;

  wings.add(lw, rw);
  root.add(wings);

  const shadow = createContactShadow(0.5);
  root.add(shadow);

  return { root, orb, wings, shadow };
}

/**
 * Ancient Sun Shrine: 4 scattered across grove
 */
export function createShrineModel(name: string): {
  root: THREE.Group;
  crystal: THREE.Mesh;
  ring: THREE.Mesh;
  light: THREE.PointLight;
} {
  const root = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x7a8276,
    roughness: 0.85,
    metalness: 0.05,
  });
  const mossMat = new THREE.MeshStandardMaterial({
    color: 0x47633b,
    roughness: 0.9,
    metalness: 0.0,
  });
  const runeMat = new THREE.MeshStandardMaterial({
    color: 0x444444,
    emissive: 0x221100,
    emissiveIntensity: 0.1,
    roughness: 0.3,
  });
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0xff7700,
    emissiveIntensity: 0.4,
    roughness: 0.15,
  });

  const base1Geo = new THREE.CylinderGeometry(2.4, 2.6, 0.4, 8);
  const base1 = new THREE.Mesh(base1Geo, stoneMat);
  base1.position.y = 0.2;
  base1.receiveShadow = true;
  root.add(base1);

  const base2Geo = new THREE.CylinderGeometry(1.8, 2.0, 0.3, 8);
  const base2 = new THREE.Mesh(base2Geo, mossMat);
  base2.position.y = 0.55;
  base2.receiveShadow = true;
  root.add(base2);

  const pillarGeo = new THREE.BoxGeometry(0.4, 1.8, 0.4);
  const angles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
  angles.forEach((ang) => {
    const pillar = new THREE.Mesh(pillarGeo, stoneMat);
    pillar.position.set(Math.cos(ang) * 1.5, 1.4, Math.sin(ang) * 1.5);
    pillar.castShadow = true;
    root.add(pillar);
  });

  const crystalGeo = new THREE.DodecahedronGeometry(0.65, 0);
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.position.y = 2.2;
  root.add(crystal);

  const ringGeo = new THREE.TorusGeometry(1.3, 0.08, 8, 24);
  ringGeo.rotateX(Math.PI / 2);
  const ring = new THREE.Mesh(ringGeo, runeMat);
  ring.position.y = 0.75;
  root.add(ring);

  const light = new THREE.PointLight(0xffa500, 0.5, 8);
  light.position.set(0, 2.2, 0);
  root.add(light);

  const shadow = createContactShadow(2.2);
  root.add(shadow);

  return { root, crystal, ring, light };
}

/**
 * Sun-Seed Pickup item
 */
export function createSunSeedModel(): { root: THREE.Group; mesh: THREE.Mesh } {
  const root = new THREE.Group();

  const seedMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0xff9900,
    emissiveIntensity: 0.9,
    roughness: 0.2,
    metalness: 0.2,
  });

  const geo = new THREE.OctahedronGeometry(0.35, 1);
  const mesh = new THREE.Mesh(geo, seedMat);
  mesh.position.y = 0.5;
  root.add(mesh);

  const haloGeo = new THREE.TorusGeometry(0.5, 0.03, 6, 16);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0xffea79, transparent: true, opacity: 0.7 });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.y = 0.5;
  halo.rotation.x = Math.PI / 3;
  root.add(halo);

  const shadow = createContactShadow(0.4);
  root.add(shadow);

  return { root, mesh };
}

/**
 * 4. Corrupted Elder Bramble (Central Guardian to cleanse)
 */
export function createBossModel(): {
  root: THREE.Group;
  core: THREE.Mesh;
  branches: THREE.Group;
  shadow: THREE.Mesh;
} {
  const root = new THREE.Group();

  const barkMat = new THREE.MeshStandardMaterial({
    color: 0x3d2b1f,
    roughness: 0.85,
    metalness: 0.05,
  });
  const thornMat = new THREE.MeshStandardMaterial({
    color: 0x221111,
    roughness: 0.6,
  });
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x8a2be2,
    emissive: 0x4b0082,
    emissiveIntensity: 0.6,
    roughness: 0.2,
  });

  const bodyGeo = new THREE.CylinderGeometry(1.2, 1.8, 3.2, 8);
  const body = new THREE.Mesh(bodyGeo, barkMat);
  body.position.y = 1.6;
  body.castShadow = true;
  root.add(body);

  const coreGeo = new THREE.IcosahedronGeometry(0.7, 0);
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(0, 2.2, 0.85);
  root.add(core);

  const branches = new THREE.Group();
  branches.position.set(0, 3.2, 0);

  const branchGeo = new THREE.ConeGeometry(0.3, 2.2, 6);
  branchGeo.translate(0, 1.1, 0);

  const b1 = new THREE.Mesh(branchGeo, thornMat);
  b1.rotation.z = -0.45;
  const b2 = new THREE.Mesh(branchGeo, thornMat);
  b2.rotation.z = 0.45;
  const b3 = new THREE.Mesh(branchGeo, thornMat);
  b3.rotation.x = -0.35;
  branches.add(b1, b2, b3);
  root.add(branches);

  const shadow = createContactShadow(2.4);
  root.add(shadow);

  return { root, core, branches, shadow };
}

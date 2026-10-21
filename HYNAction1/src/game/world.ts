/**
 * High-Fidelity Procedural Meadow World Generation for Sproutling: Grove Guardian 3D.
 * Includes:
 * - Multi-Biome Vertex-Colored Terrain (Sunlit Golden Trails to Shrines, Mossy Glades, Pond Shore)
 * - Procedural CanvasTexture Micro-Relief Bump Map for tactile PBR surface grain
 * - Architectural Landmarks: 4 Ancient Carved Stone Archways & Wayfinder Lanterns,
 *   plus a Reflective Crystal Pond with Water Lilies
 * - Scalable 4-Tier GPU & Geometry Detail Rig (Eco -> Balanced -> High -> Ultra)
 */

import * as THREE from 'three';
import {
  getStageBiomeTheme,
  generateStageMapLayout,
  type WeatherType,
  type DayNightEnvironmentState,
  type GraphicsQualityProfile,
  type StageBiomeTheme,
  type StageMapLayout,
} from './rules';

export function getGroundHeight(x: number, z: number): number {
  const wave1 = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 0.6;
  const wave2 = Math.sin(x * 0.12 + 1.2) * Math.sin(z * 0.09) * 0.3;

  const distFromCenter = Math.sqrt(x * x + z * z);
  const boundaryRise = distFromCenter > 38 ? Math.pow((distFromCenter - 38) * 0.25, 1.8) : 0;

  return wave1 + wave2 + boundaryRise;
}

/**
 * Generates a high-resolution 256x256 tileable procedural grayscale bump map for organic stone/moss/soil micro-relief.
 */
export function createSurfaceBumpTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  // Multi-octave deterministic organic pebble, moss & rune-vein micro-relief
  for (let i = 0; i < 1100; i++) {
    const x = (i * 97) % 256;
    const y = (i * 53) % 256;
    const r = 1.1 + (i % 5) * 1.15;
    const lum = i % 3 === 0 ? 175 : i % 2 === 0 ? 142 : 92;
    ctx.fillStyle = `rgb(${lum},${lum},${lum})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine crystalline striation veins
  ctx.strokeStyle = 'rgba(210, 210, 210, 0.25)';
  ctx.lineWidth = 1;
  for (let v = 0; v < 48; v++) {
    const sx = (v * 67) % 256;
    const sy = (v * 113) % 256;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo((sx + 18) % 256, (sy + 11) % 256);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(22, 22);
  tex.anisotropy = 16;
  return tex;
}

export interface ParticlePool {
  mesh: THREE.InstancedMesh;
  positions: Float32Array;
  velocities: Float32Array;
  scales: Float32Array;
  lifetimes: Float32Array;
  colors: Float32Array;
  maxCount: number;
  activeCount: number;
  spawn: (x: number, y: number, z: number, r: number, g: number, b: number, count?: number, speed?: number) => void;
  update: (dt: number) => void;
}

export function createParticlePool(scene: THREE.Scene, maxCount = 260): ParticlePool {
  const geo = new THREE.DodecahedronGeometry(0.14, 1);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.88,
  });

  const mesh = new THREE.InstancedMesh(geo, mat, maxCount);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const positions = new Float32Array(maxCount * 3);
  const velocities = new Float32Array(maxCount * 3);
  const scales = new Float32Array(maxCount);
  const lifetimes = new Float32Array(maxCount);
  const colors = new Float32Array(maxCount * 3);

  const dummy = new THREE.Object3D();
  const c = new THREE.Color();

  for (let i = 0; i < maxCount; i++) {
    dummy.position.set(0, -999, 0);
    dummy.scale.set(0, 0, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;

  let nextIndex = 0;

  const spawn = (
    x: number,
    y: number,
    z: number,
    r: number,
    g: number,
    b: number,
    count = 10,
    speed = 4.0
  ) => {
    for (let k = 0; k < count; k++) {
      const idx = nextIndex;
      nextIndex = (nextIndex + 1) % maxCount;

      positions[idx * 3] = x + (Math.random() - 0.5) * 0.4;
      positions[idx * 3 + 1] = y + Math.random() * 0.3;
      positions[idx * 3 + 2] = z + (Math.random() - 0.5) * 0.4;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      const spd = speed * (0.4 + Math.random() * 0.8);

      velocities[idx * 3] = Math.cos(theta) * Math.cos(phi) * spd;
      velocities[idx * 3 + 1] = Math.sin(phi) * spd + 1.5;
      velocities[idx * 3 + 2] = Math.sin(theta) * Math.cos(phi) * spd;

      scales[idx] = 0.8 + Math.random() * 0.6;
      lifetimes[idx] = 1.0;

      colors[idx * 3] = r;
      colors[idx * 3 + 1] = g;
      colors[idx * 3 + 2] = b;

      c.setRGB(r, g, b);
      mesh.setColorAt(idx, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };

  const update = (dt: number) => {
    let dirty = false;
    for (let i = 0; i < maxCount; i++) {
      if (lifetimes[i] > 0) {
        lifetimes[i] -= dt * 1.8;
        if (lifetimes[i] <= 0) {
          lifetimes[i] = 0;
          dummy.position.set(0, -999, 0);
          dummy.scale.set(0, 0, 0);
        } else {
          positions[i * 3] += velocities[i * 3] * dt;
          positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
          positions[i * 3 + 2] += velocities[i * 3 + 2] * dt;

          velocities[i * 3 + 1] -= 9.8 * 0.4 * dt;
          velocities[i * 3] *= 0.95;
          velocities[i * 3 + 2] *= 0.95;

          const s = scales[i] * lifetimes[i];
          dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
          dummy.scale.set(s, s, s);
        }
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        dirty = true;
      }
    }
    if (dirty) {
      mesh.instanceMatrix.needsUpdate = true;
    }
  };

  return {
    mesh,
    positions,
    velocities,
    scales,
    lifetimes,
    colors,
    maxCount,
    activeCount: 0,
    spawn,
    update,
  };
}

/**
 * Cozy Weather Particle System (Sunshine Pollen, Gentle Rain, Soft Snow, Sakura Petals)
 */
export interface WeatherParticleSystem {
  mesh: THREE.InstancedMesh;
  update: (dt: number, centerX: number, centerZ: number, weather: WeatherType, elapsedTime: number) => void;
}

export function createWeatherSystem(scene: THREE.Scene, count = 200): WeatherParticleSystem {
  const geo = new THREE.BoxGeometry(0.08, 0.22, 0.08);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.76,
  });

  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const offsets = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    offsets[i * 3] = (Math.random() - 0.5) * 28;
    offsets[i * 3 + 1] = Math.random() * 12;
    offsets[i * 3 + 2] = (Math.random() - 0.5) * 28;
    phases[i] = Math.random() * Math.PI * 2;
  }

  let lastWeather: WeatherType | null = null;

  const update = (dt: number, centerX: number, centerZ: number, weather: WeatherType, elapsedTime: number) => {
    if (weather !== lastWeather) {
      lastWeather = weather;
      for (let i = 0; i < count; i++) {
        if (weather === 'rain') {
          color.setHex(0x90e0ef);
        } else if (weather === 'snow') {
          color.setHex(0xf8f9fa);
        } else if (weather === 'petals') {
          color.setHex(i % 2 === 0 ? 0xffb3c6 : 0xffcad4);
        } else {
          color.setHex(0xffe66d);
        }
        mesh.setColorAt(i, color);
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }

    for (let i = 0; i < count; i++) {
      let ox = offsets[i * 3];
      let oy = offsets[i * 3 + 1];
      let oz = offsets[i * 3 + 2];

      if (weather === 'rain') {
        oy -= dt * 14.5;
        ox -= dt * 1.5;
        if (oy < 0.2) oy = 11.5;
        dummy.scale.set(0.45, 2.4, 0.45);
        dummy.rotation.set(0, 0, 0.1);
      } else if (weather === 'snow') {
        oy -= dt * 2.2;
        ox += Math.sin(elapsedTime * 1.5 + phases[i]) * dt * 0.8;
        if (oy < 0.2) oy = 11.5;
        dummy.scale.set(1.1, 0.5, 1.1);
        dummy.rotation.set(elapsedTime + phases[i], elapsedTime * 0.5, 0);
      } else if (weather === 'petals') {
        oy -= dt * 1.8;
        ox += Math.cos(elapsedTime * 1.8 + phases[i]) * dt * 1.4;
        oz += Math.sin(elapsedTime * 1.2 + phases[i]) * dt * 0.8;
        if (oy < 0.2) oy = 11.5;
        dummy.scale.set(1.3, 0.3, 0.9);
        dummy.rotation.set(elapsedTime * 2 + phases[i], elapsedTime, phases[i]);
      } else {
        oy += Math.sin(elapsedTime * 1.4 + phases[i]) * dt * 0.6;
        ox += Math.cos(elapsedTime * 0.9 + phases[i]) * dt * 0.4;
        if (oy > 8) oy = 0.8;
        if (oy < 0.5) oy = 6.0;
        const pulse = 0.6 + Math.sin(elapsedTime * 3 + phases[i]) * 0.35;
        dummy.scale.set(pulse, pulse * 0.45, pulse);
        dummy.rotation.set(0, elapsedTime, 0);
      }

      offsets[i * 3] = ((ox + 14) % 28 + 28) % 28 - 14;
      offsets[i * 3 + 1] = oy;
      offsets[i * 3 + 2] = ((oz + 14) % 28 + 28) % 28 - 14;

      dummy.position.set(centerX + offsets[i * 3], oy, centerZ + offsets[i * 3 + 2]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  return { mesh, update };
}

export interface EnvironmentDetailRig {
  distantMountainRimGroup: THREE.Group;
  secondaryCanopyAndRocksGroup: THREE.Group;
  architectureAndWaterGroup: THREE.Group;
  waterRippleRingsGroup: THREE.Group;
  sunbeamGodRaysGroup: THREE.Group;
  highDetailFoliageGroup: THREE.Group;
  ultraDetailGroup: THREE.Group;
  applyQualityProfile: (profile: GraphicsQualityProfile) => void;
  applyBiomeTheme: (biome: StageBiomeTheme, layout?: StageMapLayout) => void;
  updateDetails: (elapsedTime: number) => void;
}

/**
 * Builds the high-density multi-biome vertex-colored terrain, natural perimeter trees & rocks,
 * carved stone shrine archways, reflective crystal pond, and scalable 4-tier details.
 */
export function buildEnvironment(scene: THREE.Scene): EnvironmentDetailRig {
  const segments = 112;
  const size = 112;
  const terrainGeo = new THREE.PlaneGeometry(size, size, segments, segments);
  terrainGeo.rotateX(-Math.PI / 2);

  const posAttr = terrainGeo.attributes.position;
  const colors = new Float32Array(posAttr.count * 3);

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const y = getGroundHeight(x, z);
    posAttr.setY(i, y);
  }

  const colorAttr = new THREE.BufferAttribute(colors, 3);
  terrainGeo.setAttribute('color', colorAttr);
  terrainGeo.computeVertexNormals();

  const bumpTex = createSurfaceBumpTexture();

  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.74,
    metalness: 0.06,
    bumpMap: bumpTex,
    bumpScale: 0.095,
  });

  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.receiveShadow = true;
  scene.add(terrain);

  // Inner Sacred Plaza Ring around Central Elder Bramble with Engraved Gold Filigree Inner Trim
  const pathGeo = new THREE.RingGeometry(2.6, 4.35, 64);
  pathGeo.rotateX(-Math.PI / 2);
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0xe6ccb2,
    roughness: 0.78,
    metalness: 0.12,
    bumpMap: bumpTex,
    bumpScale: 0.04,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const pathMesh = new THREE.Mesh(pathGeo, pathMat);
  pathMesh.position.y = getGroundHeight(0, 0) + 0.04;
  pathMesh.receiveShadow = true;
  scene.add(pathMesh);

  // Wildflowers across the meadow (Expanded to 240 multi-faceted blossom clusters)
  const flowerGeo = new THREE.DodecahedronGeometry(0.22, 1);
  flowerGeo.scale(1.15, 0.85, 1.15);
  flowerGeo.translate(0, 0.22, 0);
  const flowerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.38,
    metalness: 0.08,
  });

  const flowerCount = 240;
  const flowerMesh = new THREE.InstancedMesh(flowerGeo, flowerMat, flowerCount);
  flowerMesh.receiveShadow = true;
  flowerMesh.castShadow = true;

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  for (let i = 0; i < flowerCount; i++) {
    const angle = (i * 2.39996) % (Math.PI * 2);
    const rad = 4.2 + ((i * 0.89) % 31.5);
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = getGroundHeight(x, z);

    dummy.position.set(x, y, z);
    const scale = 0.68 + (i % 5) * 0.15;
    dummy.scale.set(scale, scale, scale);
    dummy.rotation.set(0, (i * 1.3) % (Math.PI * 2), 0);
    dummy.updateMatrix();

    flowerMesh.setMatrixAt(i, dummy.matrix);
  }
  flowerMesh.instanceMatrix.needsUpdate = true;
  scene.add(flowerMesh);

  // Multi-Tiered Perimeter Trees (Expanded to 72 with 3 canopy tiers & fluted trunks)
  const treeCount = 72;
  const trunkGeo = new THREE.CylinderGeometry(0.32, 0.62, 2.45, 12);
  trunkGeo.translate(0, 1.22, 0);
  const foliageGeo = new THREE.ConeGeometry(1.92, 3.7, 12);
  foliageGeo.translate(0, 3.55, 0);
  const upperFoliageGeo = new THREE.ConeGeometry(1.48, 3.05, 12);
  upperFoliageGeo.translate(0, 5.3, 0);
  const crownSpireGeo = new THREE.ConeGeometry(0.95, 2.15, 10);
  crownSpireGeo.translate(0, 6.65, 0);

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x4a2e1b,
    roughness: 0.85,
    bumpMap: bumpTex,
    bumpScale: 0.06,
  });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.58 });
  const upperFoliageMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.52 });

  const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
  const canopyMesh = new THREE.InstancedMesh(foliageGeo, foliageMat, treeCount);
  const upperCanopyMesh = new THREE.InstancedMesh(upperFoliageGeo, upperFoliageMat, treeCount);
  const crownCanopyMesh = new THREE.InstancedMesh(crownSpireGeo, upperFoliageMat, treeCount);
  trunkMesh.castShadow = true;
  canopyMesh.castShadow = true;
  upperCanopyMesh.castShadow = true;
  crownCanopyMesh.castShadow = true;

  for (let i = 0; i < treeCount; i++) {
    const angle = (i / treeCount) * Math.PI * 2 + ((i % 3) - 1) * 0.04;
    const rad = 35.5 + (i % 5) * 2.6;
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = getGroundHeight(x, z);

    dummy.position.set(x, y, z);
    const scale = 0.85 + (i % 4) * 0.14;
    dummy.scale.set(scale, scale * (0.92 + (i % 3) * 0.12), scale);
    dummy.rotation.set(0, (i * 1.7) % (Math.PI * 2), 0);
    dummy.updateMatrix();

    trunkMesh.setMatrixAt(i, dummy.matrix);
    canopyMesh.setMatrixAt(i, dummy.matrix);
    upperCanopyMesh.setMatrixAt(i, dummy.matrix);
    crownCanopyMesh.setMatrixAt(i, dummy.matrix);
  }
  trunkMesh.instanceMatrix.needsUpdate = true;
  canopyMesh.instanceMatrix.needsUpdate = true;
  upperCanopyMesh.instanceMatrix.needsUpdate = true;
  crownCanopyMesh.instanceMatrix.needsUpdate = true;
  scene.add(trunkMesh);
  scene.add(canopyMesh);

  // Perimeter Rocks (Expanded to 42 high-segment faceted boulders)
  const rockGeo = new THREE.DodecahedronGeometry(1.65, 2);
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.5,
    metalness: 0.48,
    bumpMap: bumpTex,
    bumpScale: 0.07,
  });
  const rockCount = 42;
  const rockMesh = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
  rockMesh.castShadow = true;
  rockMesh.receiveShadow = true;

  for (let i = 0; i < rockCount; i++) {
    const angle = (i / rockCount) * Math.PI * 2 + ((i % 3) - 1) * 0.06;
    const rad = 41.5 + (i % 4) * 2.2;
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = getGroundHeight(x, z) + 0.4;

    dummy.position.set(x, y, z);
    const sx = 1.0 + (i % 4) * 0.25;
    const sy = 0.82 + ((i + 1) % 3) * 0.26;
    const sz = 1.0 + ((i + 2) % 4) * 0.25;
    dummy.scale.set(sx, sy, sz);
    dummy.rotation.set((i * 0.7) % Math.PI, (i * 1.3) % Math.PI, 0);
    dummy.updateMatrix();

    rockMesh.setMatrixAt(i, dummy.matrix);
  }
  rockMesh.instanceMatrix.needsUpdate = true;
  scene.add(rockMesh);

  // ==========================================================================
  // TIER 1: SECONDARY CANOPIES, CROWN SPIRES & 64 CARVED STEPPING STONES
  // ==========================================================================
  const secondaryCanopyAndRocksGroup = new THREE.Group();
  secondaryCanopyAndRocksGroup.add(upperCanopyMesh, crownCanopyMesh);

  const stepStoneGeo = new THREE.CylinderGeometry(0.56, 0.7, 0.15, 12);
  stepStoneGeo.translate(0, 0.07, 0);
  const stepStoneMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.44,
    metalness: 0.58,
    bumpMap: bumpTex,
    bumpScale: 0.05,
  });
  const stepStoneCount = 64;
  const stepStoneMesh = new THREE.InstancedMesh(stepStoneGeo, stepStoneMat, stepStoneCount);
  stepStoneMesh.receiveShadow = true;

  for (let i = 0; i < stepStoneCount; i++) {
    const a = (i / stepStoneCount) * Math.PI * 2;
    const r = 11.4 + Math.sin(i * 1.7) * 0.55;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = getGroundHeight(x, z);
    dummy.position.set(x, y, z);
    dummy.scale.set(0.82 + (i % 3) * 0.2, 1, 0.78 + ((i + 1) % 3) * 0.2);
    dummy.rotation.set(0, a + 0.4, 0);
    dummy.updateMatrix();
    stepStoneMesh.setMatrixAt(i, dummy.matrix);
  }
  stepStoneMesh.instanceMatrix.needsUpdate = true;
  secondaryCanopyAndRocksGroup.add(stepStoneMesh);
  scene.add(secondaryCanopyAndRocksGroup);

  // ==========================================================================
  // TIER 0 (ALL TIERS): DISTANT HORIZON MOUNTAIN & VALLEY RIM (28 PEAKS)
  // ==========================================================================
  const distantMountainRimGroup = new THREE.Group();
  const mountainCount = 28;
  const mountainGeo = new THREE.ConeGeometry(8.8, 17.5, 8);
  mountainGeo.translate(0, 7.6, 0);
  const mountainMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.88,
    metalness: 0.05,
    bumpMap: bumpTex,
    bumpScale: 0.04,
  });
  const mountainMesh = new THREE.InstancedMesh(mountainGeo, mountainMat, mountainCount);
  for (let i = 0; i < mountainCount; i++) {
    const ang = (i / mountainCount) * Math.PI * 2 + (i % 2) * 0.06;
    const rad = 52 + (i % 3) * 4.5;
    const mx = Math.cos(ang) * rad;
    const mz = Math.sin(ang) * rad;
    const my = getGroundHeight(mx, mz) - 1.5;
    dummy.position.set(mx, my, mz);
    const sx = 1.0 + (i % 3) * 0.36;
    const sy = 0.78 + ((i + 1) % 4) * 0.3;
    dummy.scale.set(sx, sy, sx);
    dummy.rotation.set(0, ang, 0);
    dummy.updateMatrix();
    mountainMesh.setMatrixAt(i, dummy.matrix);
  }
  mountainMesh.instanceMatrix.needsUpdate = true;
  distantMountainRimGroup.add(mountainMesh);
  scene.add(distantMountainRimGroup);

  // Architectural Landmarks & Reflective Crystal Pond
  const architectureAndWaterGroup = new THREE.Group();

  // 1. Reflective Crystal Mirror Pond (Procedurally shifted per chapter via pondGroup)
  const pondGroup = new THREE.Group();
  const pondX = 10;
  const pondZ = 2;
  const pondY = getGroundHeight(pondX, pondZ) + 0.06;
  pondGroup.position.set(pondX, pondY, pondZ);
  architectureAndWaterGroup.add(pondGroup);

  const waterGeo = new THREE.CircleGeometry(3.85, 48);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x48cae4,
    emissive: 0x0077b6,
    emissiveIntensity: 0.32,
    roughness: 0.05,
    metalness: 0.32,
    transparent: true,
    opacity: 0.9,
  });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  pondGroup.add(waterMesh);

  // Cozy Wooden Pond Jetty / Stepping Pier with Lantern Posts
  const pierTimberMat = new THREE.MeshStandardMaterial({ color: 0x6f4518, roughness: 0.72 });
  for (let p = 0; p < 5; p++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.09, 0.34), pierTimberMat);
    plank.position.set(-3.75 + p * 0.42, 0.08, 0);
    plank.castShadow = true;
    pondGroup.add(plank);
  }

  // Animated Crystal Pond Water Ripple Rings (All modes, 5 concentric rings)
  const waterRippleRingsGroup = new THREE.Group();
  waterRippleRingsGroup.position.set(pondX, pondY + 0.025, pondZ);
  const rippleMeshes: THREE.Mesh[] = [];
  for (let r = 0; r < 5; r++) {
    const rGeo = new THREE.RingGeometry(0.62, 0.74, 36);
    rGeo.rotateX(-Math.PI / 2);
    const rMat = new THREE.MeshBasicMaterial({
      color: 0xade8f4,
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const rMesh = new THREE.Mesh(rGeo, rMat);
    waterRippleRingsGroup.add(rMesh);
    rippleMeshes.push(rMesh);
  }
  scene.add(waterRippleRingsGroup);

  // Pond Rim Stones & Floating Lily Pads + Multi-Petal Lotus Blooms
  const lilyMat = new THREE.MeshStandardMaterial({ color: 0x52b788, roughness: 0.48 });
  const lotusMat = new THREE.MeshStandardMaterial({
    color: 0xffb3c6,
    emissive: 0xff8fa3,
    emissiveIntensity: 0.45,
    roughness: 0.25,
  });
  for (let i = 0; i < 18; i++) {
    const ang = (i / 18) * Math.PI * 2;
    const rx = Math.cos(ang) * 3.88;
    const rz = Math.sin(ang) * 3.88;
    const rimRock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.46, 1), stepStoneMat);
    rimRock.position.set(rx, 0.06, rz);
    rimRock.scale.set(1.2, 0.68, 1.1);
    pondGroup.add(rimRock);
  }
  [
    [-1.1, 0.8],
    [1.2, -0.7],
    [0.2, 1.5],
    [-0.9, -1.3],
    [1.55, 0.95],
  ].forEach(([lx, lz], idx) => {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.04, 16), lilyMat);
    pad.position.set(lx, 0.03, lz);
    pondGroup.add(pad);
    if (idx < 4) {
      const lotus = new THREE.Mesh(new THREE.OctahedronGeometry(0.19, 1), lotusMat);
      lotus.position.set(lx, 0.15, lz);
      pondGroup.add(lotus);
    }
  });

  // 2. Four Ancient Carved Obsidian-Gold Archways framing routes to the 4 Shrines
  const archStoneMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.36,
    metalness: 0.78,
    bumpMap: bumpTex,
    bumpScale: 0.06,
  });
  const archCrestMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xb45309,
    emissiveIntensity: 0.28,
    roughness: 0.22,
    metalness: 0.88,
  });
  const lanternOrbMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.4,
  });

  const archCoords = [
    { x: -11, z: -10, rotY: Math.PI / 4 },
    { x: 11, z: -10, rotY: -Math.PI / 4 },
    { x: -11, z: 11, rotY: -Math.PI / 4 },
    { x: 11, z: 11, rotY: Math.PI / 4 },
  ];

  const archGroups: THREE.Group[] = [];
  archCoords.forEach((ac) => {
    const archGroup = new THREE.Group();
    const ay = getGroundHeight(ac.x, ac.z);
    archGroup.position.set(ac.x, ay, ac.z);
    archGroup.rotation.y = ac.rotY;

    const colGeo = new THREE.CylinderGeometry(0.28, 0.38, 3.2, 12);
    const leftCol = new THREE.Mesh(colGeo, archStoneMat);
    leftCol.position.set(-1.45, 1.6, 0);
    leftCol.castShadow = true;
    const rightCol = new THREE.Mesh(colGeo, archStoneMat);
    rightCol.position.set(1.45, 1.6, 0);
    rightCol.castShadow = true;

    // Gold column capitals & bases
    for (const side of [-1.45, 1.45]) {
      const capRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 8, 18), archCrestMat);
      capRing.rotation.x = Math.PI / 2;
      capRing.position.set(side, 2.95, 0);
      const basePlinth = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.24, 0.86), archStoneMat);
      basePlinth.position.set(side, 0.12, 0);
      archGroup.add(capRing, basePlinth);
    }

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.44, 0.62), archStoneMat);
    lintel.position.set(0, 3.2, 0);
    lintel.castShadow = true;

    const topCrest = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.32, 0.48), archCrestMat);
    topCrest.position.set(0, 3.52, 0);

    const spireFinial = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), archCrestMat);
    spireFinial.scale.set(0.8, 1.6, 0.8);
    spireFinial.position.set(0, 3.92, 0);

    const lantern = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 1), lanternOrbMat);
    lantern.position.set(0, 2.68, 0);

    const lanternHalo = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.025, 8, 20), archCrestMat);
    lanternHalo.position.set(0, 2.68, 0);

    archGroup.add(leftCol, rightCol, lintel, topCrest, spireFinial, lantern, lanternHalo);
    architectureAndWaterGroup.add(archGroup);
    archGroups.push(archGroup);
  });

  scene.add(architectureAndWaterGroup);

  // ==========================================================================
  // TIER 2B: VOLUMETRIC SUNBEAM GOD-RAY SHAFTS (ALL MODES, 8 SHAFTS)
  // ==========================================================================
  const sunbeamGodRaysGroup = new THREE.Group();
  const rayGeo = new THREE.CylinderGeometry(0.88, 2.75, 14.2, 18, 1, true);
  rayGeo.translate(0, 7.1, 0);
  const rayMat = new THREE.MeshBasicMaterial({
    color: 0xfff3b0,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const rayLocations = [
    [0, 14], // Cozy Home Base Sanctuary
    [-18, -16], // Shrine 1
    [18, -16], // Shrine 2
    [-18, 18], // Shrine 3
    [18, 18], // Shrine 4
    [0, 0], // Stage Centerpiece
    [10, 2], // Crystal Pond
    [-10, 2], // Western Glade
  ];
  const rayMeshes: THREE.Mesh[] = [];
  rayLocations.forEach(([rx, rz]) => {
    const ray = new THREE.Mesh(rayGeo, rayMat);
    ray.position.set(rx, getGroundHeight(rx, rz), rz);
    ray.rotation.z = -0.16;
    ray.rotation.x = 0.08;
    sunbeamGodRaysGroup.add(ray);
    rayMeshes.push(ray);
  });
  scene.add(sunbeamGodRaysGroup);

  // ==========================================================================
  // TIER 2: SCALABLE 3D GRASS BLADES (320 -> 1400) & WOODLAND FERNS (36 -> 160)
  // ==========================================================================
  const highDetailFoliageGroup = new THREE.Group();

  const maxGrassCount = 1400;
  const grassGeo = new THREE.ConeGeometry(0.095, 0.56, 5);
  grassGeo.translate(0, 0.27, 0);
  const grassMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.04,
  });
  const grassMesh = new THREE.InstancedMesh(grassGeo, grassMat, maxGrassCount);
  grassMesh.receiveShadow = true;

  for (let i = 0; i < maxGrassCount; i++) {
    const angle = (i * 2.39996) % (Math.PI * 2);
    const rad = 3.2 + ((i * 0.53) % 32.5);
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = getGroundHeight(x, z);

    dummy.position.set(x, y, z);
    const s = 0.68 + (i % 5) * 0.16;
    dummy.scale.set(s, s * (0.88 + (i % 4) * 0.16), s);
    dummy.rotation.set(((i % 3) - 1) * 0.14, (i * 1.1) % (Math.PI * 2), 0);
    dummy.updateMatrix();
    grassMesh.setMatrixAt(i, dummy.matrix);
  }
  grassMesh.instanceMatrix.needsUpdate = true;
  highDetailFoliageGroup.add(grassMesh);

  const maxFernCount = 160;
  const fernGeo = new THREE.DodecahedronGeometry(0.54, 1);
  fernGeo.scale(1.28, 0.56, 1.28);
  fernGeo.translate(0, 0.25, 0);
  const fernMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.46,
  });
  const fernMesh = new THREE.InstancedMesh(fernGeo, fernMat, maxFernCount);
  fernMesh.castShadow = true;
  fernMesh.receiveShadow = true;

  for (let i = 0; i < maxFernCount; i++) {
    const angle = (i / maxFernCount) * Math.PI * 2 + (i % 4) * 0.08;
    const rad = 12.5 + (i % 7) * 3.3;
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = getGroundHeight(x, z);

    dummy.position.set(x, y, z);
    const s = 0.82 + (i % 4) * 0.22;
    dummy.scale.set(s, s, s);
    dummy.rotation.set(0, i * 0.9, 0);
    dummy.updateMatrix();
    fernMesh.setMatrixAt(i, dummy.matrix);
  }
  fernMesh.instanceMatrix.needsUpdate = true;
  highDetailFoliageGroup.add(fernMesh);
  scene.add(highDetailFoliageGroup);

  // ==========================================================================
  // TIER 3: BIOLUMINESCENT CRYSTALS (16 -> 68) & FIREFLIES (36 -> 160)
  // ==========================================================================
  const ultraDetailGroup = new THREE.Group();

  const maxCrystalCount = 68;
  const crystalGeo = new THREE.OctahedronGeometry(0.4, 1);
  crystalGeo.scale(0.65, 1.9, 0.65);
  crystalGeo.translate(0, 0.56, 0);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x00b4d8,
    emissiveIntensity: 0.78,
    roughness: 0.12,
    metalness: 0.38,
  });
  const crystalMesh = new THREE.InstancedMesh(crystalGeo, crystalMat, maxCrystalCount);
  crystalMesh.castShadow = true;

  for (let i = 0; i < maxCrystalCount; i++) {
    const angle = (i / maxCrystalCount) * Math.PI * 2;
    const rad = i % 3 === 0 ? 18.5 : i % 2 === 0 ? 24.5 : 31.5;
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = getGroundHeight(x, z);

    dummy.position.set(x, y, z);
    const s = 0.76 + (i % 3) * 0.28;
    dummy.scale.set(s, s, s);
    dummy.rotation.set(((i % 3) - 1) * 0.18, angle, ((i % 2) - 0.5) * 0.2);
    dummy.updateMatrix();
    crystalMesh.setMatrixAt(i, dummy.matrix);
  }
  crystalMesh.instanceMatrix.needsUpdate = true;
  ultraDetailGroup.add(crystalMesh);

  const maxFireflyCount = 160;
  const fireflyGeo = new THREE.DodecahedronGeometry(0.095, 0);
  const fireflyMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.94,
  });
  const fireflyMesh = new THREE.InstancedMesh(fireflyGeo, fireflyMat, maxFireflyCount);
  fireflyMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  fireflyMesh.frustumCulled = false;

  const fireflyBasePos = new Float32Array(maxFireflyCount * 3);
  for (let i = 0; i < maxFireflyCount; i++) {
    const angle = (i / maxFireflyCount) * Math.PI * 2;
    const rad = 4.5 + (i % 16) * 2.0;
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = getGroundHeight(x, z) + 0.85 + (i % 5) * 0.45;
    fireflyBasePos[i * 3] = x;
    fireflyBasePos[i * 3 + 1] = y;
    fireflyBasePos[i * 3 + 2] = z;
  }
  ultraDetailGroup.add(fireflyMesh);
  scene.add(ultraDetailGroup);

  let activeFireflies = 0;

  /**
   * Dynamically re-colors the entire 3D world and shifts the Pond, Stone Archways,
   * Sunbeam Shafts, and Terrain Trail Patterns for each chapter's procedural layout!
   */
  const applyBiomeTheme = (biome: StageBiomeTheme, layout?: StageMapLayout) => {
    const activeLayout = layout ?? generateStageMapLayout(1);
    const cMeadow = new THREE.Color(biome.meadowHex);
    const cMoss = new THREE.Color(biome.mossHex);
    const cTrail = new THREE.Color(biome.trailHex);
    const cPondBed = new THREE.Color(biome.pondBedHex);
    const cCliff = new THREE.Color(biome.cliffHex);
    const tempColor = new THREE.Color();

    // Shift Pond & Water Ripple Rings to activeLayout.pondX / pondZ
    const py = getGroundHeight(activeLayout.pondX, activeLayout.pondZ) + 0.06;
    pondGroup.position.set(activeLayout.pondX, py, activeLayout.pondZ);
    const pondScale = activeLayout.pondRadius / 3.8;
    pondGroup.scale.set(pondScale, 1, pondScale);
    waterRippleRingsGroup.position.set(activeLayout.pondX, py + 0.025, activeLayout.pondZ);

    // Shift the 4 Carved Stone Archways to activeLayout.archCoords
    activeLayout.archCoords.forEach((ac, idx) => {
      const grp = archGroups[idx];
      if (grp) {
        grp.position.set(ac.x, getGroundHeight(ac.x, ac.z), ac.z);
        grp.rotation.y = ac.rotY;
      }
    });

    // Shift Sunbeam God-Rays to Home Base + Shifted Shrine / Objective Coordinates
    if (rayMeshes[0]) {
      rayMeshes[0].position.set(0, getGroundHeight(0, 14), 14);
    }
    activeLayout.shrineCoords.forEach((sc, idx) => {
      const ray = rayMeshes[idx + 1];
      if (ray) {
        ray.position.set(sc.x, getGroundHeight(sc.x, sc.z), sc.z);
      }
    });
    if (rayMeshes[6]) {
      rayMeshes[6].position.set(
        activeLayout.pondX,
        getGroundHeight(activeLayout.pondX, activeLayout.pondZ),
        activeLayout.pondZ
      );
    }

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const distCenter = Math.hypot(x, z);
      const distPond = Math.hypot(x - activeLayout.pondX, z - activeLayout.pondZ);

      const noiseMix =
        0.5 +
        0.5 *
          Math.sin(x * 0.14 + activeLayout.terrainWavePhaseX) *
          Math.cos(z * 0.14 + activeLayout.terrainWavePhaseZ);
      const microRidge = 0.5 + 0.5 * Math.sin(x * 0.42 + z * 0.38);
      tempColor.copy(cMeadow).lerp(cMoss, noiseMix * 0.58 + microRidge * 0.16);

      const theta = Math.atan2(z, x);
      let onProceduralTrail = false;
      if (activeLayout.trailPattern === 'spiral_glade') {
        const spiralWave = Math.sin(distCenter * 0.42 - theta * 2.0);
        onProceduralTrail = spiralWave > 0.68 && distCenter > 3.2 && distCenter < 29.0;
      } else if (activeLayout.trailPattern === 'twin_crescent') {
        const c1 = Math.abs(Math.hypot(x - 6.5, z) - 12.5) < 1.65;
        const c2 = Math.abs(Math.hypot(x + 6.5, z) - 12.5) < 1.65;
        onProceduralTrail = (c1 || c2) && distCenter < 28.0;
      } else if (activeLayout.trailPattern === 'star_pentagram') {
        const starSpoke = Math.cos(theta * 5 + activeLayout.terrainWavePhaseX) > 0.84;
        const outerRing = Math.abs(distCenter - 15.5) < 1.35;
        onProceduralTrail = (starSpoke && distCenter > 3.5 && distCenter < 27.0) || outerRing;
      } else if (activeLayout.trailPattern === 'serpentine_valley') {
        const sCurve = Math.abs(x - Math.sin(z * 0.18) * 9.5) < 2.2;
        const crossCurve = Math.abs(z - Math.cos(x * 0.18) * 9.5) < 2.0;
        onProceduralTrail = (sCurve || crossCurve) && distCenter < 28.5;
      } else {
        const distDiag1 = Math.abs(x - z);
        const distDiag2 = Math.abs(x + z);
        const onRadialTrail =
          (distDiag1 < 2.2 || distDiag2 < 2.2) && distCenter > 3.5 && distCenter < 26.5;
        const onRingPath = Math.abs(distCenter - 11.4) < 1.35;
        onProceduralTrail = onRadialTrail || onRingPath;
      }

      if (onProceduralTrail) {
        tempColor.lerp(cTrail, 0.78);
      }
      if (distPond < activeLayout.pondRadius + 1.0) {
        tempColor.lerp(
          cPondBed,
          Math.max(0, 1 - distPond / (activeLayout.pondRadius + 1.0)) * 0.68
        );
      }
      if (distCenter > 36) {
        tempColor.lerp(cCliff, Math.min(1, (distCenter - 36) / 14));
      }

      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }
    colorAttr.needsUpdate = true;

    pathMat.color.setHex(biome.plazaHex);
    trunkMat.color.setHex(biome.trunkHex);
    archCrestMat.color.setHex(biome.canopyPrimaryHex);
    waterMat.color.setHex(biome.waterHex);
    waterMat.emissive.setHex(biome.waterEmissiveHex);
    lilyMat.color.setHex(biome.lilyHex);
    lotusMat.color.setHex(biome.lotusHex);
    lotusMat.emissive.setHex(biome.lotusHex);
    rayMat.color.setHex(biome.sunbeamHex);
    crystalMat.emissive.setHex(biome.crystalPalette[0] ?? 0x00b4d8);

    // Update Tree Canopies
    const cCanopy1 = new THREE.Color(biome.canopyPrimaryHex);
    const cCanopy2 = new THREE.Color(biome.canopySecondaryHex);
    for (let i = 0; i < treeCount; i++) {
      const mix = (i * 0.17) % 1;
      tempColor.copy(cCanopy1).lerp(cCanopy2, mix);
      canopyMesh.setColorAt(i, tempColor);
      tempColor.copy(cCanopy2).lerp(cCanopy1, mix * 0.5);
      upperCanopyMesh.setColorAt(i, tempColor);
      crownCanopyMesh.setColorAt(i, tempColor);
    }
    if (canopyMesh.instanceColor) canopyMesh.instanceColor.needsUpdate = true;
    if (upperCanopyMesh.instanceColor) upperCanopyMesh.instanceColor.needsUpdate = true;
    if (crownCanopyMesh.instanceColor) crownCanopyMesh.instanceColor.needsUpdate = true;

    // Update Distant Mountains
    for (let i = 0; i < mountainCount; i++) {
      color.setHex(i % 2 === 0 ? biome.mountainPrimaryHex : biome.mountainSecondaryHex);
      mountainMesh.setColorAt(i, color);
    }
    if (mountainMesh.instanceColor) mountainMesh.instanceColor.needsUpdate = true;

    // Update Wildflowers
    for (let i = 0; i < flowerCount; i++) {
      color.setHex(biome.flowerPalette[i % biome.flowerPalette.length]);
      flowerMesh.setColorAt(i, color);
    }
    if (flowerMesh.instanceColor) flowerMesh.instanceColor.needsUpdate = true;

    // Update Grass Blades
    for (let i = 0; i < maxGrassCount; i++) {
      color.setHex(biome.grassPalette[i % biome.grassPalette.length]);
      grassMesh.setColorAt(i, color);
    }
    if (grassMesh.instanceColor) grassMesh.instanceColor.needsUpdate = true;

    // Update Ferns
    for (let i = 0; i < maxFernCount; i++) {
      color.setHex(biome.fernPalette[i % biome.fernPalette.length]);
      fernMesh.setColorAt(i, color);
    }
    if (fernMesh.instanceColor) fernMesh.instanceColor.needsUpdate = true;

    // Update Crystals
    for (let i = 0; i < maxCrystalCount; i++) {
      color.setHex(biome.crystalPalette[i % biome.crystalPalette.length]);
      crystalMesh.setColorAt(i, color);
    }
    if (crystalMesh.instanceColor) crystalMesh.instanceColor.needsUpdate = true;

    // Update Fireflies
    for (let i = 0; i < maxFireflyCount; i++) {
      color.setHex(i % 2 === 0 ? biome.fireflyPrimaryHex : biome.fireflySecondaryHex);
      fireflyMesh.setColorAt(i, color);
    }
    if (fireflyMesh.instanceColor) fireflyMesh.instanceColor.needsUpdate = true;
  };

  // Initialize with Stage 1 Emerald Meadow biome
  applyBiomeTheme(getStageBiomeTheme(1));

  const applyQualityProfile = (profile: GraphicsQualityProfile) => {
    distantMountainRimGroup.visible = profile.enableDistantMountainRim;
    secondaryCanopyAndRocksGroup.visible = profile.showSecondaryCanopyAndRocks;
    architectureAndWaterGroup.visible = profile.enableReflectiveWaterAndRuins;
    waterRippleRingsGroup.visible = profile.enableWaterRippleRings;
    sunbeamGodRaysGroup.visible = profile.enableSunbeamGodRays;
    highDetailFoliageGroup.visible = profile.grassBladeCount > 0 || profile.fernClusterCount > 0;
    ultraDetailGroup.visible = profile.showUltraCrystalsAndFireflies || profile.crystalClusterCount > 0;

    terrainMat.bumpScale = profile.enablePbrBumpMaps ? 0.095 : 0;
    terrainMat.needsUpdate = true;

    grassMesh.count = Math.min(maxGrassCount, profile.grassBladeCount);
    fernMesh.count = Math.min(maxFernCount, profile.fernClusterCount);
    crystalMesh.count = Math.min(maxCrystalCount, profile.crystalClusterCount);
    activeFireflies = Math.min(maxFireflyCount, profile.fireflyCount);
    fireflyMesh.count = activeFireflies;
  };

  const updateDetails = (elapsedTime: number) => {
    if (architectureAndWaterGroup.visible) {
      waterMat.emissiveIntensity = 0.24 + Math.sin(elapsedTime * 2.2) * 0.09;
    }

    if (waterRippleRingsGroup.visible) {
      for (let r = 0; r < rippleMeshes.length; r++) {
        const mesh = rippleMeshes[r];
        const phase = (elapsedTime * 0.55 + r * (1 / rippleMeshes.length)) % 1;
        const scale = 0.55 + phase * 4.1;
        mesh.scale.set(scale, 1, scale);
        (mesh.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.45;
      }
    }

    if (sunbeamGodRaysGroup.visible) {
      rayMat.opacity = 0.09 + Math.sin(elapsedTime * 1.4) * 0.038;
    }

    if (!ultraDetailGroup.visible || activeFireflies <= 0) return;

    for (let i = 0; i < activeFireflies; i++) {
      const bx = fireflyBasePos[i * 3];
      const by = fireflyBasePos[i * 3 + 1];
      const bz = fireflyBasePos[i * 3 + 2];

      const phase = i * 0.65;
      const fx = bx + Math.sin(elapsedTime * 1.4 + phase) * 0.58;
      const fy = by + Math.sin(elapsedTime * 2.2 + phase) * 0.38;
      const fz = bz + Math.cos(elapsedTime * 1.3 + phase) * 0.58;
      const pulse = 0.68 + Math.sin(elapsedTime * 4.5 + phase) * 0.35;

      dummy.position.set(fx, fy, fz);
      dummy.scale.set(pulse, pulse, pulse);
      dummy.rotation.set(0, elapsedTime + phase, 0);
      dummy.updateMatrix();
      fireflyMesh.setMatrixAt(i, dummy.matrix);
    }
    fireflyMesh.instanceMatrix.needsUpdate = true;
  };

  return {
    distantMountainRimGroup,
    secondaryCanopyAndRocksGroup,
    architectureAndWaterGroup,
    waterRippleRingsGroup,
    sunbeamGodRaysGroup,
    highDetailFoliageGroup,
    ultraDetailGroup,
    applyQualityProfile,
    applyBiomeTheme,
    updateDetails,
  };
}

export interface LightingRig {
  keyLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  ambient: THREE.AmbientLight;
  fog: THREE.FogExp2;
  skyColor: THREE.Color;
  updateDayNight: (envState: DayNightEnvironmentState, dt: number) => void;
}

export function setupLighting(scene: THREE.Scene, isHeadless: boolean): LightingRig {
  const fog = new THREE.FogExp2(0x1b2b40, 0.013);
  const skyColor = new THREE.Color(0x162436);
  scene.fog = fog;
  scene.background = skyColor;

  const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.94);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfef3c7, 1.65);
  keyLight.position.set(28, 42, 24);
  keyLight.castShadow = !isHeadless;

  if (!isHeadless) {
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 120;
    const d = 34;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.00035;
    keyLight.shadow.normalBias = 0.02;
  }
  scene.add(keyLight);

  const ambient = new THREE.AmbientLight(0xffeedd, 0.28);
  scene.add(ambient);

  const targetSky = new THREE.Color();
  const targetFog = new THREE.Color();
  const targetSun = new THREE.Color();

  const updateDayNight = (envState: DayNightEnvironmentState, dt: number) => {
    const k = Math.min(1, dt * 2.5);
    targetSky.setHex(envState.skyHex);
    targetFog.setHex(envState.fogHex);
    targetSun.setHex(envState.sunColorHex);

    skyColor.lerp(targetSky, k);
    fog.color.lerp(targetFog, k);
    keyLight.color.lerp(targetSun, k);

    keyLight.intensity += (envState.sunIntensity - keyLight.intensity) * k;
    hemiLight.intensity += (envState.hemiIntensity - hemiLight.intensity) * k;

    const sunAngle = envState.timeOfDay * Math.PI * 2;
    keyLight.position.set(
      Math.cos(sunAngle) * 34,
      Math.max(12, Math.sin(sunAngle) * 42 + 22),
      24
    );
  };

  return { keyLight, hemiLight, ambient, fog, skyColor, updateDayNight };
}

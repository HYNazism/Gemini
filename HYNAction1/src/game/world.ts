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
  type WeatherType,
  type DayNightEnvironmentState,
  type GraphicsQualityProfile,
  type StageBiomeTheme,
} from './rules';

export function getGroundHeight(x: number, z: number): number {
  const wave1 = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 0.6;
  const wave2 = Math.sin(x * 0.12 + 1.2) * Math.sin(z * 0.09) * 0.3;

  const distFromCenter = Math.sqrt(x * x + z * z);
  const boundaryRise = distFromCenter > 38 ? Math.pow((distFromCenter - 38) * 0.25, 1.8) : 0;

  return wave1 + wave2 + boundaryRise;
}

/**
 * Generates a tileable procedural grayscale bump map for organic stone/moss/soil micro-relief.
 */
export function createSurfaceBumpTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 128, 128);

  // Deterministic organic pebble & moss grain
  for (let i = 0; i < 420; i++) {
    const x = (i * 73) % 128;
    const y = (i * 41) % 128;
    const r = 1.5 + (i % 4) * 1.2;
    const lum = i % 2 === 0 ? 155 : 100;
    ctx.fillStyle = `rgb(${lum},${lum},${lum})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
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

export function createParticlePool(scene: THREE.Scene, maxCount = 200): ParticlePool {
  const geo = new THREE.DodecahedronGeometry(0.14, 0);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
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

export function createWeatherSystem(scene: THREE.Scene, count = 130): WeatherParticleSystem {
  const geo = new THREE.BoxGeometry(0.08, 0.22, 0.08);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.72,
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
  applyBiomeTheme: (biome: StageBiomeTheme) => void;
  updateDetails: (elapsedTime: number) => void;
}

/**
 * Builds the multi-biome vertex-colored terrain, natural perimeter trees & rocks,
 * carved stone shrine archways, reflective crystal pond, and scalable 4-tier details.
 */
export function buildEnvironment(scene: THREE.Scene): EnvironmentDetailRig {
  const segments = 76;
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
    roughness: 0.78,
    metalness: 0.04,
    bumpMap: bumpTex,
    bumpScale: 0.08,
  });

  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.receiveShadow = true;
  scene.add(terrain);

  // Inner Sacred Plaza Ring around Central Elder Bramble
  const pathGeo = new THREE.RingGeometry(2.6, 4.2, 40);
  pathGeo.rotateX(-Math.PI / 2);
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0xe6ccb2,
    roughness: 0.85,
    metalness: 0.05,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const pathMesh = new THREE.Mesh(pathGeo, pathMat);
  pathMesh.position.y = getGroundHeight(0, 0) + 0.04;
  pathMesh.receiveShadow = true;
  scene.add(pathMesh);

  // Wildflowers across the meadow
  const flowerGeo = new THREE.ConeGeometry(0.2, 0.4, 6);
  flowerGeo.translate(0, 0.2, 0);
  const flowerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.45,
  });

  const flowerCount = 140;
  const flowerMesh = new THREE.InstancedMesh(flowerGeo, flowerMat, flowerCount);
  flowerMesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  for (let i = 0; i < flowerCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const rad = 4.5 + Math.random() * 31;
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = getGroundHeight(x, z);

    dummy.position.set(x, y, z);
    const scale = 0.7 + Math.random() * 0.6;
    dummy.scale.set(scale, scale, scale);
    dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
    dummy.updateMatrix();

    flowerMesh.setMatrixAt(i, dummy.matrix);
  }
  flowerMesh.instanceMatrix.needsUpdate = true;
  scene.add(flowerMesh);

  // Multi-Tiered Perimeter Trees
  const treeCount = 55;
  const trunkGeo = new THREE.CylinderGeometry(0.34, 0.56, 2.3, 8);
  trunkGeo.translate(0, 1.15, 0);
  const foliageGeo = new THREE.ConeGeometry(1.85, 3.6, 8);
  foliageGeo.translate(0, 3.5, 0);
  const upperFoliageGeo = new THREE.ConeGeometry(1.4, 2.9, 8);
  upperFoliageGeo.translate(0, 5.25, 0);

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x4a2e1b,
    roughness: 0.88,
    bumpMap: bumpTex,
    bumpScale: 0.05,
  });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.62 });
  const upperFoliageMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.58 });

  const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
  const canopyMesh = new THREE.InstancedMesh(foliageGeo, foliageMat, treeCount);
  const upperCanopyMesh = new THREE.InstancedMesh(upperFoliageGeo, upperFoliageMat, treeCount);
  trunkMesh.castShadow = true;
  canopyMesh.castShadow = true;
  upperCanopyMesh.castShadow = true;

  for (let i = 0; i < treeCount; i++) {
    const angle = (i / treeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
    const rad = 36 + Math.random() * 12;
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = getGroundHeight(x, z);

    dummy.position.set(x, y, z);
    const scale = 0.85 + Math.random() * 0.4;
    dummy.scale.set(scale, scale * (0.9 + Math.random() * 0.3), scale);
    dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
    dummy.updateMatrix();

    trunkMesh.setMatrixAt(i, dummy.matrix);
    canopyMesh.setMatrixAt(i, dummy.matrix);
    upperCanopyMesh.setMatrixAt(i, dummy.matrix);
  }
  trunkMesh.instanceMatrix.needsUpdate = true;
  canopyMesh.instanceMatrix.needsUpdate = true;
  upperCanopyMesh.instanceMatrix.needsUpdate = true;
  scene.add(trunkMesh);
  scene.add(canopyMesh);

  // Perimeter Rocks
  const rockGeo = new THREE.DodecahedronGeometry(1.6, 1);
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x687465,
    roughness: 0.85,
    bumpMap: bumpTex,
    bumpScale: 0.06,
  });
  const rockCount = 28;
  const rockMesh = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
  rockMesh.castShadow = true;
  rockMesh.receiveShadow = true;

  for (let i = 0; i < rockCount; i++) {
    const angle = (i / rockCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
    const rad = 42 + Math.random() * 8;
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = getGroundHeight(x, z) + 0.4;

    dummy.position.set(x, y, z);
    const sx = 1.0 + Math.random() * 0.8;
    const sy = 0.8 + Math.random() * 0.7;
    const sz = 1.0 + Math.random() * 0.8;
    dummy.scale.set(sx, sy, sz);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    dummy.updateMatrix();

    rockMesh.setMatrixAt(i, dummy.matrix);
  }
  rockMesh.instanceMatrix.needsUpdate = true;
  scene.add(rockMesh);

  // ==========================================================================
  // TIER 1: BALANCED+ DETAILS (Upper Tree Canopies, 3D Stepping Stones,
  //         Reflective Crystal Mirror Pond & Ancient Stone Shrine Archways)
  // ==========================================================================
  const secondaryCanopyAndRocksGroup = new THREE.Group();
  secondaryCanopyAndRocksGroup.add(upperCanopyMesh);

  const stepStoneGeo = new THREE.CylinderGeometry(0.55, 0.68, 0.14, 8);
  stepStoneGeo.translate(0, 0.06, 0);
  const stepStoneMat = new THREE.MeshStandardMaterial({
    color: 0x8d99ae,
    roughness: 0.78,
    metalness: 0.1,
    bumpMap: bumpTex,
    bumpScale: 0.04,
  });
  const stepStoneCount = 48;
  const stepStoneMesh = new THREE.InstancedMesh(stepStoneGeo, stepStoneMat, stepStoneCount);
  stepStoneMesh.receiveShadow = true;

  for (let i = 0; i < stepStoneCount; i++) {
    const a = (i / stepStoneCount) * Math.PI * 2;
    const r = 11.4 + Math.sin(i * 1.7) * 0.5;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = getGroundHeight(x, z);
    dummy.position.set(x, y, z);
    dummy.scale.set(0.8 + (i % 3) * 0.2, 1, 0.75 + ((i + 1) % 3) * 0.2);
    dummy.rotation.set(0, a + 0.4, 0);
    dummy.updateMatrix();
    stepStoneMesh.setMatrixAt(i, dummy.matrix);
  }
  stepStoneMesh.instanceMatrix.needsUpdate = true;
  secondaryCanopyAndRocksGroup.add(stepStoneMesh);
  scene.add(secondaryCanopyAndRocksGroup);

  // ==========================================================================
  // TIER 0 (ALL TIERS INCLUDING ECO): DISTANT HORIZON MOUNTAIN & VALLEY RIM
  // ==========================================================================
  const distantMountainRimGroup = new THREE.Group();
  const mountainCount = 20;
  const mountainGeo = new THREE.ConeGeometry(8.5, 16.5, 6);
  mountainGeo.translate(0, 7.2, 0);
  const mountainMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.92,
    metalness: 0.02,
  });
  const mountainMesh = new THREE.InstancedMesh(mountainGeo, mountainMat, mountainCount);
  for (let i = 0; i < mountainCount; i++) {
    const ang = (i / mountainCount) * Math.PI * 2 + (i % 2) * 0.08;
    const rad = 52 + (i % 3) * 4.5;
    const mx = Math.cos(ang) * rad;
    const mz = Math.sin(ang) * rad;
    const my = getGroundHeight(mx, mz) - 1.5;
    dummy.position.set(mx, my, mz);
    const sx = 1.0 + (i % 3) * 0.35;
    const sy = 0.75 + ((i + 1) % 4) * 0.28;
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

  // 1. Reflective Crystal Mirror Pond at (10, 2)
  const pondX = 10;
  const pondZ = 2;
  const pondY = getGroundHeight(pondX, pondZ) + 0.06;
  const waterGeo = new THREE.CircleGeometry(3.8, 32);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x48cae4,
    emissive: 0x0077b6,
    emissiveIntensity: 0.28,
    roughness: 0.08,
    metalness: 0.25,
    transparent: true,
    opacity: 0.88,
  });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.position.set(pondX, pondY, pondZ);
  architectureAndWaterGroup.add(waterMesh);

  // Cozy Wooden Pond Jetty / Stepping Pier
  const pierTimberMat = new THREE.MeshStandardMaterial({ color: 0x6f4518, roughness: 0.78 });
  for (let p = 0; p < 4; p++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.09, 0.34), pierTimberMat);
    plank.position.set(pondX - 3.6 + p * 0.45, pondY + 0.08, pondZ);
    plank.castShadow = true;
    architectureAndWaterGroup.add(plank);
  }

  // Animated Crystal Pond Water Ripple Rings (Balanced -> Ultra)
  const waterRippleRingsGroup = new THREE.Group();
  waterRippleRingsGroup.position.set(pondX, pondY + 0.025, pondZ);
  const rippleMeshes: THREE.Mesh[] = [];
  for (let r = 0; r < 3; r++) {
    const rGeo = new THREE.RingGeometry(0.65, 0.76, 28);
    rGeo.rotateX(-Math.PI / 2);
    const rMat = new THREE.MeshBasicMaterial({
      color: 0xade8f4,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const rMesh = new THREE.Mesh(rGeo, rMat);
    waterRippleRingsGroup.add(rMesh);
    rippleMeshes.push(rMesh);
  }
  scene.add(waterRippleRingsGroup);

  // Pond Rim Stones & Floating Lily Pads
  const lilyMat = new THREE.MeshStandardMaterial({ color: 0x52b788, roughness: 0.55 });
  const lotusMat = new THREE.MeshStandardMaterial({
    color: 0xffb3c6,
    emissive: 0xff8fa3,
    emissiveIntensity: 0.35,
  });
  for (let i = 0; i < 14; i++) {
    const ang = (i / 14) * Math.PI * 2;
    const rx = pondX + Math.cos(ang) * 3.85;
    const rz = pondZ + Math.sin(ang) * 3.85;
    const rimRock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), stepStoneMat);
    rimRock.position.set(rx, getGroundHeight(rx, rz) + 0.1, rz);
    rimRock.scale.set(1.2, 0.65, 1.1);
    architectureAndWaterGroup.add(rimRock);
  }
  [
    [pondX - 1.1, pondZ + 0.8],
    [pondX + 1.2, pondZ - 0.7],
    [pondX + 0.2, pondZ + 1.5],
  ].forEach(([lx, lz], idx) => {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.04, 12), lilyMat);
    pad.position.set(lx, pondY + 0.03, lz);
    architectureAndWaterGroup.add(pad);
    if (idx < 2) {
      const lotus = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), lotusMat);
      lotus.position.set(lx, pondY + 0.14, lz);
      architectureAndWaterGroup.add(lotus);
    }
  });

  // 2. Four Ancient Carved Woodland Stone Archways framing routes to the 4 Shrines
  const archStoneMat = new THREE.MeshStandardMaterial({
    color: 0xadb5bd,
    roughness: 0.76,
    metalness: 0.08,
    bumpMap: bumpTex,
    bumpScale: 0.06,
  });
  const archCrestMat = new THREE.MeshStandardMaterial({
    color: 0x2b582a,
    roughness: 0.65,
  });
  const lanternOrbMat = new THREE.MeshStandardMaterial({
    color: 0xffe66d,
    emissive: 0xff9f1c,
    emissiveIntensity: 0.9,
  });

  const archCoords = [
    { x: -11, z: -10, rotY: Math.PI / 4 },
    { x: 11, z: -10, rotY: -Math.PI / 4 },
    { x: -11, z: 11, rotY: -Math.PI / 4 },
    { x: 11, z: 11, rotY: Math.PI / 4 },
  ];

  archCoords.forEach((ac) => {
    const archGroup = new THREE.Group();
    const ay = getGroundHeight(ac.x, ac.z);
    archGroup.position.set(ac.x, ay, ac.z);
    archGroup.rotation.y = ac.rotY;

    const colGeo = new THREE.CylinderGeometry(0.28, 0.36, 3.1, 8);
    const leftCol = new THREE.Mesh(colGeo, archStoneMat);
    leftCol.position.set(-1.45, 1.55, 0);
    leftCol.castShadow = true;
    const rightCol = new THREE.Mesh(colGeo, archStoneMat);
    rightCol.position.set(1.45, 1.55, 0);
    rightCol.castShadow = true;

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.42, 0.58), archStoneMat);
    lintel.position.set(0, 3.15, 0);
    lintel.castShadow = true;

    const topCrest = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 0.44), archCrestMat);
    topCrest.position.set(0, 3.45, 0);

    const lantern = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), lanternOrbMat);
    lantern.position.set(0, 2.65, 0);

    archGroup.add(leftCol, rightCol, lintel, topCrest, lantern);
    architectureAndWaterGroup.add(archGroup);
  });

  scene.add(architectureAndWaterGroup);

  // ==========================================================================
  // TIER 2B: VOLUMETRIC SUNBEAM GOD-RAY SHAFTS (HIGH & ULTRA TIERS)
  // ==========================================================================
  const sunbeamGodRaysGroup = new THREE.Group();
  const rayGeo = new THREE.CylinderGeometry(0.85, 2.6, 13.5, 14, 1, true);
  rayGeo.translate(0, 6.75, 0);
  const rayMat = new THREE.MeshBasicMaterial({
    color: 0xfff3b0,
    transparent: true,
    opacity: 0.11,
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
  ];
  rayLocations.forEach(([rx, rz]) => {
    const ray = new THREE.Mesh(rayGeo, rayMat);
    ray.position.set(rx, getGroundHeight(rx, rz), rz);
    ray.rotation.z = -0.16;
    ray.rotation.x = 0.08;
    sunbeamGodRaysGroup.add(ray);
  });
  scene.add(sunbeamGodRaysGroup);

  // ==========================================================================
  // TIER 2: SCALABLE 3D GRASS BLADES (ECO 60 -> ULTRA 780) & WOODLAND FERNS
  // ==========================================================================
  const highDetailFoliageGroup = new THREE.Group();

  const maxGrassCount = 780;
  const grassGeo = new THREE.ConeGeometry(0.09, 0.52, 4);
  grassGeo.translate(0, 0.25, 0);
  const grassMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.55,
    metalness: 0.02,
  });
  const grassMesh = new THREE.InstancedMesh(grassGeo, grassMat, maxGrassCount);
  grassMesh.receiveShadow = true;

  for (let i = 0; i < maxGrassCount; i++) {
    const angle = (i * 2.39996) % (Math.PI * 2);
    const rad = 3.5 + ((i * 0.71) % 31);
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = getGroundHeight(x, z);

    dummy.position.set(x, y, z);
    const s = 0.65 + (i % 5) * 0.16;
    dummy.scale.set(s, s * (0.85 + (i % 4) * 0.15), s);
    dummy.rotation.set(((i % 3) - 1) * 0.14, (i * 1.1) % (Math.PI * 2), 0);
    dummy.updateMatrix();
    grassMesh.setMatrixAt(i, dummy.matrix);
  }
  grassMesh.instanceMatrix.needsUpdate = true;
  highDetailFoliageGroup.add(grassMesh);

  const maxFernCount = 84;
  const fernGeo = new THREE.DodecahedronGeometry(0.52, 1);
  fernGeo.scale(1.25, 0.55, 1.25);
  fernGeo.translate(0, 0.24, 0);
  const fernMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
  });
  const fernMesh = new THREE.InstancedMesh(fernGeo, fernMat, maxFernCount);
  fernMesh.castShadow = true;
  fernMesh.receiveShadow = true;

  for (let i = 0; i < maxFernCount; i++) {
    const angle = (i / maxFernCount) * Math.PI * 2 + (i % 4) * 0.08;
    const rad = 14 + (i % 6) * 3.6;
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = getGroundHeight(x, z);

    dummy.position.set(x, y, z);
    const s = 0.8 + (i % 4) * 0.22;
    dummy.scale.set(s, s, s);
    dummy.rotation.set(0, i * 0.9, 0);
    dummy.updateMatrix();
    fernMesh.setMatrixAt(i, dummy.matrix);
  }
  fernMesh.instanceMatrix.needsUpdate = true;
  highDetailFoliageGroup.add(fernMesh);
  scene.add(highDetailFoliageGroup);

  // ==========================================================================
  // TIER 3: ULTRA DETAILS (Bioluminescent Crystals & Floating Fireflies)
  // ==========================================================================
  const ultraDetailGroup = new THREE.Group();

  const maxCrystalCount = 34;
  const crystalGeo = new THREE.OctahedronGeometry(0.38, 0);
  crystalGeo.scale(0.65, 1.85, 0.65);
  crystalGeo.translate(0, 0.55, 0);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x00b4d8,
    emissiveIntensity: 0.65,
    roughness: 0.16,
    metalness: 0.3,
  });
  const crystalMesh = new THREE.InstancedMesh(crystalGeo, crystalMat, maxCrystalCount);
  crystalMesh.castShadow = true;

  for (let i = 0; i < maxCrystalCount; i++) {
    const angle = (i / maxCrystalCount) * Math.PI * 2;
    const rad = i % 2 === 0 ? 22.5 : 31.0;
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = getGroundHeight(x, z);

    dummy.position.set(x, y, z);
    const s = 0.75 + (i % 3) * 0.28;
    dummy.scale.set(s, s, s);
    dummy.rotation.set(((i % 3) - 1) * 0.18, angle, ((i % 2) - 0.5) * 0.2);
    dummy.updateMatrix();
    crystalMesh.setMatrixAt(i, dummy.matrix);
  }
  crystalMesh.instanceMatrix.needsUpdate = true;
  ultraDetailGroup.add(crystalMesh);

  const maxFireflyCount = 90;
  const fireflyGeo = new THREE.DodecahedronGeometry(0.09, 0);
  const fireflyMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.92,
  });
  const fireflyMesh = new THREE.InstancedMesh(fireflyGeo, fireflyMat, maxFireflyCount);
  fireflyMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  fireflyMesh.frustumCulled = false;

  const fireflyBasePos = new Float32Array(maxFireflyCount * 3);
  for (let i = 0; i < maxFireflyCount; i++) {
    const angle = (i / maxFireflyCount) * Math.PI * 2;
    const rad = 5 + (i % 15) * 2.1;
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = getGroundHeight(x, z) + 0.9 + (i % 5) * 0.45;
    fireflyBasePos[i * 3] = x;
    fireflyBasePos[i * 3 + 1] = y;
    fireflyBasePos[i * 3 + 2] = z;
  }
  ultraDetailGroup.add(fireflyMesh);
  scene.add(ultraDetailGroup);

  let activeFireflies = 0;

  /**
   * Dynamically re-colors the entire 3D world (terrain vertex colors, trees, mountains,
   * wildflowers, grass, ferns, pond water, crystals, and fireflies) for the stage biome!
   */
  const applyBiomeTheme = (biome: StageBiomeTheme) => {
    const cMeadow = new THREE.Color(biome.meadowHex);
    const cMoss = new THREE.Color(biome.mossHex);
    const cTrail = new THREE.Color(biome.trailHex);
    const cPondBed = new THREE.Color(biome.pondBedHex);
    const cCliff = new THREE.Color(biome.cliffHex);
    const tempColor = new THREE.Color();

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const distCenter = Math.hypot(x, z);
      const distPond = Math.hypot(x - 10, z - 2);

      const noiseMix = 0.5 + 0.5 * Math.sin(x * 0.14) * Math.cos(z * 0.14);
      tempColor.copy(cMeadow).lerp(cMoss, noiseMix * 0.65);

      const distDiag1 = Math.abs(x - z);
      const distDiag2 = Math.abs(x + z);
      const onRadialTrail =
        (distDiag1 < 2.2 || distDiag2 < 2.2) && distCenter > 3.5 && distCenter < 26.5;
      const onRingPath = Math.abs(distCenter - 11.4) < 1.35;

      if (onRadialTrail || onRingPath) {
        tempColor.lerp(cTrail, 0.72);
      }
      if (distPond < 4.5) {
        tempColor.lerp(cPondBed, Math.max(0, 1 - distPond / 4.5) * 0.65);
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
    }
    if (canopyMesh.instanceColor) canopyMesh.instanceColor.needsUpdate = true;
    if (upperCanopyMesh.instanceColor) upperCanopyMesh.instanceColor.needsUpdate = true;

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

    terrainMat.bumpScale = profile.enablePbrBumpMaps ? 0.085 : 0;
    terrainMat.needsUpdate = true;

    grassMesh.count = Math.min(maxGrassCount, profile.grassBladeCount);
    fernMesh.count = Math.min(maxFernCount, profile.fernClusterCount);
    crystalMesh.count = Math.min(maxCrystalCount, profile.crystalClusterCount);
    activeFireflies = Math.min(maxFireflyCount, profile.fireflyCount);
    fireflyMesh.count = activeFireflies;
  };

  const updateDetails = (elapsedTime: number) => {
    if (architectureAndWaterGroup.visible) {
      waterMat.emissiveIntensity = 0.22 + Math.sin(elapsedTime * 2.2) * 0.08;
    }

    if (waterRippleRingsGroup.visible) {
      for (let r = 0; r < rippleMeshes.length; r++) {
        const mesh = rippleMeshes[r];
        const phase = ((elapsedTime * 0.55 + r * 0.33) % 1);
        const scale = 0.6 + phase * 3.8;
        mesh.scale.set(scale, 1, scale);
        (mesh.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.42;
      }
    }

    if (sunbeamGodRaysGroup.visible) {
      rayMat.opacity = 0.08 + Math.sin(elapsedTime * 1.4) * 0.035;
    }

    if (!ultraDetailGroup.visible || activeFireflies <= 0) return;

    for (let i = 0; i < activeFireflies; i++) {
      const bx = fireflyBasePos[i * 3];
      const by = fireflyBasePos[i * 3 + 1];
      const bz = fireflyBasePos[i * 3 + 2];

      const phase = i * 0.65;
      const fx = bx + Math.sin(elapsedTime * 1.4 + phase) * 0.55;
      const fy = by + Math.sin(elapsedTime * 2.2 + phase) * 0.35;
      const fz = bz + Math.cos(elapsedTime * 1.3 + phase) * 0.55;
      const pulse = 0.65 + Math.sin(elapsedTime * 4.5 + phase) * 0.35;

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
  const fog = new THREE.FogExp2(0xa7d8ad, 0.015);
  const skyColor = new THREE.Color(0x9bd0a3);
  scene.fog = fog;
  scene.background = skyColor;

  const hemiLight = new THREE.HemisphereLight(0xbde0fe, 0x3b6e2e, 0.98);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfff1cf, 1.45);
  keyLight.position.set(28, 42, 24);
  keyLight.castShadow = !isHeadless;

  if (!isHeadless) {
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 120;
    const d = 34;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
  }
  scene.add(keyLight);

  const ambient = new THREE.AmbientLight(0xffeedd, 0.26);
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

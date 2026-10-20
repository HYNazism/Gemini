/**
 * Procedural Meadow World generation, instanced foliage, natural cliff perimeter,
 * zero-GC particle pool, Dynamic Day/Night Lighting Rig, and Weather System.
 */

import * as THREE from 'three';
import type { WeatherType, DayNightEnvironmentState } from './rules';

export function getGroundHeight(x: number, z: number): number {
  const wave1 = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 0.6;
  const wave2 = Math.sin(x * 0.12 + 1.2) * Math.sin(z * 0.09) * 0.3;

  const distFromCenter = Math.sqrt(x * x + z * z);
  const boundaryRise = distFromCenter > 38 ? Math.pow((distFromCenter - 38) * 0.25, 1.8) : 0;

  return wave1 + wave2 + boundaryRise;
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
        // Sunshine golden pollen motes floating upward gently
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

/**
 * Builds the rolling terrain, natural perimeter trees and rocks, and instanced meadow flowers
 */
export function buildEnvironment(scene: THREE.Scene): void {
  const segments = 60;
  const size = 110;
  const terrainGeo = new THREE.PlaneGeometry(size, size, segments, segments);
  terrainGeo.rotateX(-Math.PI / 2);

  const posAttr = terrainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const y = getGroundHeight(x, z);
    posAttr.setY(i, y);
  }
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x5fa848,
    roughness: 0.8,
    metalness: 0.05,
    flatShading: true,
  });

  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.receiveShadow = true;
  scene.add(terrain);

  const pathGeo = new THREE.RingGeometry(0.5, 12, 32);
  pathGeo.rotateX(-Math.PI / 2);
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0xd8caa8,
    roughness: 0.9,
    metalness: 0.0,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const pathMesh = new THREE.Mesh(pathGeo, pathMat);
  pathMesh.position.y = 0.03;
  pathMesh.receiveShadow = true;
  scene.add(pathMesh);

  const flowerGeo = new THREE.ConeGeometry(0.2, 0.4, 5);
  flowerGeo.translate(0, 0.2, 0);
  const flowerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
  });

  const flowerCount = 120;
  const flowerMesh = new THREE.InstancedMesh(flowerGeo, flowerMat, flowerCount);
  flowerMesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const flowerColors = [0xffd166, 0xef476f, 0x06d6a0, 0x118ab2, 0xffa07a, 0xffffff];
  const color = new THREE.Color();

  for (let i = 0; i < flowerCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const rad = 4 + Math.random() * 32;
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = getGroundHeight(x, z);

    dummy.position.set(x, y, z);
    const scale = 0.7 + Math.random() * 0.6;
    dummy.scale.set(scale, scale, scale);
    dummy.rotation.y = Math.random() * Math.PI * 2;
    dummy.updateMatrix();

    flowerMesh.setMatrixAt(i, dummy.matrix);
    color.setHex(flowerColors[i % flowerColors.length]);
    flowerMesh.setColorAt(i, color);
  }
  flowerMesh.instanceMatrix.needsUpdate = true;
  if (flowerMesh.instanceColor) flowerMesh.instanceColor.needsUpdate = true;
  scene.add(flowerMesh);

  const treeCount = 55;
  const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 2.2, 6);
  trunkGeo.translate(0, 1.1, 0);
  const foliageGeo = new THREE.ConeGeometry(1.8, 4.0, 7);
  foliageGeo.translate(0, 3.8, 0);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e1b, roughness: 0.9 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2b582a, roughness: 0.7, flatShading: true });

  const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
  const canopyMesh = new THREE.InstancedMesh(foliageGeo, foliageMat, treeCount);
  trunkMesh.castShadow = true;
  canopyMesh.castShadow = true;

  for (let i = 0; i < treeCount; i++) {
    const angle = (i / treeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
    const rad = 36 + Math.random() * 12;
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = getGroundHeight(x, z);

    dummy.position.set(x, y, z);
    const scale = 0.85 + Math.random() * 0.4;
    dummy.scale.set(scale, scale * (0.9 + Math.random() * 0.3), scale);
    dummy.rotation.y = Math.random() * Math.PI * 2;
    dummy.updateMatrix();

    trunkMesh.setMatrixAt(i, dummy.matrix);
    canopyMesh.setMatrixAt(i, dummy.matrix);

    const greenTint = new THREE.Color(0x244f23).lerp(new THREE.Color(0x3d703b), Math.random());
    canopyMesh.setColorAt(i, greenTint);
  }
  trunkMesh.instanceMatrix.needsUpdate = true;
  canopyMesh.instanceMatrix.needsUpdate = true;
  if (canopyMesh.instanceColor) canopyMesh.instanceColor.needsUpdate = true;
  scene.add(trunkMesh);
  scene.add(canopyMesh);

  const rockGeo = new THREE.DodecahedronGeometry(1.6, 1);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x687465, roughness: 0.9, flatShading: true });
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
  const fog = new THREE.FogExp2(0xa7d8ad, 0.016);
  const skyColor = new THREE.Color(0x9bd0a3);
  scene.fog = fog;
  scene.background = skyColor;

  const hemiLight = new THREE.HemisphereLight(0xbde0fe, 0x4a7c39, 0.95);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfff1cf, 1.4);
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

  const ambient = new THREE.AmbientLight(0xffeedd, 0.25);
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

    // Orbit sun/moon arc smoothly
    const sunAngle = envState.timeOfDay * Math.PI * 2;
    keyLight.position.set(
      Math.cos(sunAngle) * 34,
      Math.max(12, Math.sin(sunAngle) * 42 + 22),
      24
    );
  };

  return { keyLight, hemiLight, ambient, fog, skyColor, updateDayNight };
}

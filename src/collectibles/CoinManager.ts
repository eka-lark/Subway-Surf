import * as THREE from 'three';
import { GAME } from '@core/Constants';
import { createCoinMesh, getCoinAABB, type CoinInstance } from './Coin';
import { generateCoinPattern } from './CoinPatterns';
import { aabbIntersect, type AABB } from '@player/PlayerCollision';
import { eventBus } from '@core/EventBus';

export class CoinManager {
  private scene: THREE.Scene;
  private coins: CoinInstance[] = [];
  private lastPatternZ = 0;
  private patternInterval = 30;
  private rotationSpeed = 2.0;

  constructor(scene: THREE.Scene) { this.scene = scene; }

  update(playerZ: number, deltaTime: number): void {
    const spawnZ = playerZ + GAME.SEGMENT_LENGTH * (GAME.SPAWN_AHEAD - 1);
    while (this.lastPatternZ < spawnZ) {
      this.lastPatternZ += this.patternInterval;
      this.spawnPattern(this.lastPatternZ);
    }
    const behindZ = playerZ - GAME.SEGMENT_LENGTH * 2;
    this.coins = this.coins.filter(coin => {
      if (!coin.active || coin.z < behindZ) { this.scene.remove(coin.mesh); coin.active = false; return false; }
      coin.mesh.rotation.y += this.rotationSpeed * deltaTime;
      return true;
    });
  }

  checkCollisions(playerAABB: AABB): number {
    let collected = 0;
    for (const coin of this.coins) {
      if (!coin.active) continue;
      if (aabbIntersect(playerAABB, getCoinAABB(coin))) {
        coin.active = false; this.scene.remove(coin.mesh); collected++;
        eventBus.emit('coin:collected', null);
      }
    }
    return collected;
  }

  collectAllInRange(playerZ: number, radius: number): number {
    let collected = 0;
    for (const coin of this.coins) {
      if (!coin.active) continue;
      if (Math.abs(coin.z - playerZ) < radius) {
        coin.active = false; this.scene.remove(coin.mesh); collected++;
        eventBus.emit('coin:collected', null);
      }
    }
    return collected;
  }

  private spawnPattern(baseZ: number): void {
    const pattern = generateCoinPattern();
    for (const p of pattern) {
      const mesh = createCoinMesh();
      const x = p.lane * GAME.LANE_WIDTH;
      const z = baseZ + p.zOffset;
      mesh.position.set(x, p.y, z);
      this.coins.push({ mesh, x, y: p.y, z, active: true });
      this.scene.add(mesh);
    }
  }

  reset(): void {
    for (const coin of this.coins) this.scene.remove(coin.mesh);
    this.coins = []; this.lastPatternZ = 0;
  }
}

import * as THREE from 'three';
import { GAME } from '@core/Constants';
import { createCoinMesh, getCoinAABB, type CoinInstance } from './Coin';
import { generateCoinPattern } from './CoinPatterns';
import { aabbIntersect, type AABB } from '@player/PlayerCollision';
import { eventBus } from '@core/EventBus';

interface FlyingCoin {
  mesh: THREE.Mesh;
  startX: number;
  startY: number;
  startZ: number;
  progress: number;
}

export class CoinManager {
  private scene: THREE.Scene;
  private coins: CoinInstance[] = [];
  private flyingCoins: FlyingCoin[] = [];
  private lastPatternZ = 0;
  private patternInterval = 30;
  private rotationSpeed = 2.0;
  private playerX = 0;
  private playerY = 0;
  private playerZ = 0;

  constructor(scene: THREE.Scene) { this.scene = scene; }

  update(playerZ: number, deltaTime: number, playerX?: number, playerY?: number): void {
    // Track player position for coin fly animation
    if (playerX !== undefined) this.playerX = playerX;
    if (playerY !== undefined) this.playerY = playerY;
    this.playerZ = playerZ;

    // Spawn new patterns ahead
    const spawnZ = playerZ + GAME.SEGMENT_LENGTH * (GAME.SPAWN_AHEAD - 1);
    while (this.lastPatternZ < spawnZ) {
      this.lastPatternZ += this.patternInterval;
      this.spawnPattern(this.lastPatternZ);
    }

    // Rotate active coins + despawn behind
    const behindZ = playerZ - GAME.SEGMENT_LENGTH * 2;
    this.coins = this.coins.filter(coin => {
      if (!coin.active || coin.z < behindZ) {
        if (coin.active) this.scene.remove(coin.mesh);
        coin.active = false;
        return false;
      }
      coin.mesh.rotation.y += this.rotationSpeed * deltaTime;
      // Gentle hover
      coin.mesh.position.y = coin.y + Math.sin(performance.now() * 0.004 + coin.z) * 0.15;
      return true;
    });

    // Animate flying coins toward player
    this.flyingCoins = this.flyingCoins.filter(fc => {
      fc.progress += deltaTime * 3.5;
      if (fc.progress >= 1) {
        this.scene.remove(fc.mesh);
        return false;
      }

      // Smoothstep easing
      const t = fc.progress;
      const ease = t * t * (3 - 2 * t);

      // Arc upward then snap to player
      const arcHeight = 1.5 * Math.sin(t * Math.PI);
      fc.mesh.position.set(
        fc.startX + (this.playerX - fc.startX) * ease,
        fc.startY + ((this.playerY + 1.2) - fc.startY) * ease + arcHeight,
        fc.startZ + (this.playerZ - fc.startZ) * ease
      );

      // Spin faster as it flies
      fc.mesh.rotation.y += deltaTime * (10 + t * 25);

      // Shrink at end
      const scale = Math.max(0.1, 1 - t * 0.7);
      fc.mesh.scale.setScalar(scale);

      return true;
    });
  }

  checkCollisions(playerAABB: AABB): number {
    let collected = 0;
    for (const coin of this.coins) {
      if (!coin.active) continue;
      if (aabbIntersect(playerAABB, getCoinAABB(coin))) {
        this.collectCoin(coin);
        collected++;
      }
    }
    return collected;
  }

  collectAllInRange(playerZ: number, radius: number): number {
    let collected = 0;
    for (const coin of this.coins) {
      if (!coin.active) continue;
      const dx = coin.x - this.playerX;
      const dz = coin.z - playerZ;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < radius) {
        this.collectCoin(coin);
        collected++;
      }
    }
    return collected;
  }

  private collectCoin(coin: CoinInstance): void {
    coin.active = false;

    // Detach from static position, create flying animation
    const flyMesh = coin.mesh;
    this.flyingCoins.push({
      mesh: flyMesh,
      startX: coin.x,
      startY: coin.y,
      startZ: coin.z,
      progress: 0,
    });

    eventBus.emit('coin:collected', null);
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
    for (const fc of this.flyingCoins) this.scene.remove(fc.mesh);
    this.coins = [];
    this.flyingCoins = [];
    this.lastPatternZ = 0;
  }
}

import * as THREE from 'three';
import { GAME, DIFFICULTY } from '@core/Constants';
import { lerp } from '@utils/MathUtils';
import { randomInt, weightedRandom } from '@utils/RandomUtils';
import { OBSTACLE_CONFIGS, type ObstacleInstance } from './ObstacleTypes';
import { createObstacleInstance, computeObstacleAABB } from './ObstacleFactory';
import { aabbIntersect, type AABB } from '@player/PlayerCollision';

export class ObstacleManager {
  private scene: THREE.Scene;
  private obstacles: ObstacleInstance[] = [];
  private lastSpawnZ = 0;
  private nextSpawnDistance = 0;

  constructor(scene: THREE.Scene) { this.scene = scene; }

  update(playerZ: number, speed: number, distance: number, deltaTime: number): void {
    if (playerZ + GAME.SEGMENT_LENGTH * GAME.SPAWN_AHEAD > this.lastSpawnZ + this.nextSpawnDistance) {
      this.spawnObstacle(playerZ, distance);
    }
    for (const obs of this.obstacles) {
      if (!obs.active) continue;
      if (obs.config.type === 'dynamic_forward') {
        const moveSpeed = speed * obs.config.speedMultiplier;
        obs.z += moveSpeed * deltaTime;
        obs.mesh.position.z = obs.z;
        const x = obs.lane * GAME.LANE_WIDTH;
        obs.aabb = computeObstacleAABB(obs.config, x, obs.z);
      }
    }
    this.obstacles = this.obstacles.filter(obs => {
      if (obs.z < playerZ - GAME.SEGMENT_LENGTH * 3) {
        this.scene.remove(obs.mesh); obs.active = false; return false;
      }
      return true;
    });
  }

  checkCollision(playerAABB: AABB): ObstacleInstance | null {
    for (const obs of this.obstacles) {
      if (!obs.active) continue;
      if (aabbIntersect(playerAABB, obs.aabb)) return obs;
    }
    return null;
  }

  private spawnObstacle(playerZ: number, distance: number): void {
    const t = Math.min(distance / DIFFICULTY.RAMP_DISTANCE, 1);
    const interval = lerp(DIFFICULTY.OBSTACLE_MAX_INTERVAL, DIFFICULTY.OBSTACLE_MIN_INTERVAL, t);
    const eligible = OBSTACLE_CONFIGS.filter(c => distance >= c.minDistance);
    if (eligible.length === 0) return;

    const weights: Record<string, number> = {};
    for (const c of eligible) weights[c.id] = c.weight;
    const selectedId = weightedRandom(weights);
    const config = eligible.find(c => c.id === selectedId)!;

    const numLanes = randomInt(config.minLanes, config.maxLanes);
    const lanes = this.pickLanes(numLanes);
    const spawnZ = playerZ + GAME.SEGMENT_LENGTH * (GAME.SPAWN_AHEAD - 1);

    for (const lane of lanes) {
      const obs = createObstacleInstance(config, lane, spawnZ);
      this.scene.add(obs.mesh);
      this.obstacles.push(obs);
    }
    this.lastSpawnZ = spawnZ;
    // Use a minimum gap based on jump travel distance to prevent landing on obstacles after jumping
    const minGap = 15; // minimum meters between obstacles (covers a full jump arc at base speed)
    this.nextSpawnDistance = Math.max(minGap, interval * GAME.BASE_SPEED);
  }

  private pickLanes(count: number): number[] {
    const allLanes = [-1, 0, 1];
    const result: number[] = [];
    const available = [...allLanes];
    for (let i = 0; i < Math.min(count, 2); i++) {
      const idx = randomInt(0, available.length - 1);
      result.push(available[idx]);
      available.splice(idx, 1);
    }
    return result;
  }

  reset(): void {
    for (const obs of this.obstacles) this.scene.remove(obs.mesh);
    this.obstacles = []; this.lastSpawnZ = 0; this.nextSpawnDistance = 0;
  }
}

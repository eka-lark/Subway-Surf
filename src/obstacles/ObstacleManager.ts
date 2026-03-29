import * as THREE from 'three';
import { GAME, DIFFICULTY } from '@core/Constants';
import { lerp } from '@utils/MathUtils';
import { randomInt, weightedRandom, randomChoice } from '@utils/RandomUtils';
import { OBSTACLE_CONFIGS, type ObstacleInstance } from './ObstacleTypes';
import { createObstacleInstance, computeObstacleAABB } from './ObstacleFactory';
import { aabbIntersect, type AABB } from '@player/PlayerCollision';

export class ObstacleManager {
  private scene: THREE.Scene;
  private obstacles: ObstacleInstance[] = [];
  private nextSpawnZ = 0;

  constructor(scene: THREE.Scene) { this.scene = scene; }

  update(playerZ: number, speed: number, distance: number, deltaTime: number): void {
    // Spawn obstacles ahead of the player
    while (this.nextSpawnZ < playerZ + GAME.SEGMENT_LENGTH * GAME.SPAWN_AHEAD) {
      this.spawnObstacleGroup(distance);
    }

    // Update dynamic obstacles (currently none, trains are static)
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

    // Despawn obstacles far behind the player
    this.obstacles = this.obstacles.filter(obs => {
      if (obs.z < playerZ - GAME.SEGMENT_LENGTH * 3) {
        this.scene.remove(obs.mesh);
        obs.active = false;
        return false;
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

  private spawnObstacleGroup(distance: number): void {
    // Calculate spawn interval based on difficulty
    const t = Math.min(distance / DIFFICULTY.RAMP_DISTANCE, 1);
    const interval = lerp(DIFFICULTY.OBSTACLE_MAX_INTERVAL, DIFFICULTY.OBSTACLE_MIN_INTERVAL, t);
    const gap = Math.max(20, interval * GAME.BASE_SPEED);

    // Advance nextSpawnZ by the gap
    this.nextSpawnZ += gap;

    // Get eligible obstacle types for current distance
    const eligible = OBSTACLE_CONFIGS.filter(c => distance >= c.minDistance);
    if (eligible.length === 0) return;

    // Pick a random obstacle type
    const weights: Record<string, number> = {};
    for (const c of eligible) weights[c.id] = c.weight;
    const selectedId = weightedRandom(weights);
    const config = eligible.find(c => c.id === selectedId)!;

    // Pick which lane(s) to place it — ALWAYS leave at least 1 lane open
    const lanes = this.pickLanesForObstacle(config);

    for (const lane of lanes) {
      const obs = createObstacleInstance(config, lane, this.nextSpawnZ);
      this.scene.add(obs.mesh);
      this.obstacles.push(obs);
    }
  }

  private pickLanesForObstacle(config: typeof OBSTACLE_CONFIGS[number]): number[] {
    // Single-lane obstacles: pick one random lane
    if (config.maxLanes <= 1) {
      return [randomChoice([-1, 0, 1])];
    }

    // Multi-lane: pick 1-2 lanes, NEVER all 3
    const numLanes = randomInt(1, Math.min(config.maxLanes, 2));
    if (numLanes === 1) {
      return [randomChoice([-1, 0, 1])];
    }

    // 2 lanes: pick 2 random lanes, leaving 1 open
    const allLanes = [-1, 0, 1];
    const skipIdx = randomInt(0, 2);
    return allLanes.filter((_, i) => i !== skipIdx);
  }

  reset(): void {
    for (const obs of this.obstacles) this.scene.remove(obs.mesh);
    this.obstacles = [];
    this.nextSpawnZ = 0;
  }
}

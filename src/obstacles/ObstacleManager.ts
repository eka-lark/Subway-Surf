import * as THREE from 'three';
import { GAME, DIFFICULTY } from '@core/Constants';
import { lerp } from '@utils/MathUtils';
import { weightedRandom, randomChoice } from '@utils/RandomUtils';
import { OBSTACLE_CONFIGS, type ObstacleConfig, type ObstacleInstance } from './ObstacleTypes';
import { createObstacleInstance, computeObstacleAABB } from './ObstacleFactory';
import { aabbIntersect, type AABB } from '@player/PlayerCollision';
import { eventBus } from '@core/EventBus';

export class ObstacleManager {
  private scene: THREE.Scene;
  private obstacles: ObstacleInstance[] = [];
  private nextSpawnZ = 0;

  // Separate timer for oncoming trains — they come frequently
  private nextTrainTimer = 0;
  private trainInterval = 8; // seconds between oncoming trains (gets shorter with distance)

  constructor(scene: THREE.Scene) { this.scene = scene; }

  update(playerZ: number, speed: number, distance: number, deltaTime: number): void {
    // Spawn ground obstacles ahead
    while (this.nextSpawnZ < playerZ + GAME.SEGMENT_LENGTH * GAME.SPAWN_AHEAD) {
      this.spawnObstacleGroup(distance, playerZ);
    }

    // Spawn oncoming trains on a timer (independent of ground obstacles)
    this.nextTrainTimer -= deltaTime;
    if (this.nextTrainTimer <= 0 && distance > 50) {
      this.spawnOncomingTrain(playerZ, speed, distance);
      // Interval decreases with distance: 8s → 3s
      const t = Math.min(distance / DIFFICULTY.RAMP_DISTANCE, 1);
      this.trainInterval = lerp(8, 3, t);
      this.nextTrainTimer = this.trainInterval;
    }

    // Update dynamic obstacles
    for (const obs of this.obstacles) {
      if (!obs.active) continue;
      if (obs.config.type === 'dynamic_oncoming') {
        const moveSpeed = speed * obs.config.speedMultiplier;
        obs.z -= moveSpeed * deltaTime;
        obs.mesh.position.z = obs.z;
        const x = obs.lane * GAME.LANE_WIDTH;
        obs.aabb = computeObstacleAABB(obs.config, x, obs.z);
      }
    }

    // Despawn
    this.obstacles = this.obstacles.filter(obs => {
      const isBehind = obs.z + obs.config.depth / 2 < playerZ - GAME.SEGMENT_LENGTH * 3;
      if (isBehind) {
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

  private spawnObstacleGroup(distance: number, _playerZ: number): void {
    const t = Math.min(distance / DIFFICULTY.RAMP_DISTANCE, 1);
    const interval = lerp(DIFFICULTY.OBSTACLE_MAX_INTERVAL, DIFFICULTY.OBSTACLE_MIN_INTERVAL, t);
    const gap = Math.max(25, interval * GAME.BASE_SPEED);
    this.nextSpawnZ += gap;

    // Only spawn non-train obstacles here (trains handled separately)
    const eligible = OBSTACLE_CONFIGS.filter(c =>
      distance >= c.minDistance && c.type !== 'dynamic_oncoming'
    );
    if (eligible.length === 0) return;

    const weights: Record<string, number> = {};
    for (const c of eligible) weights[c.id] = c.weight;
    const selectedId = weightedRandom(weights);
    const config = eligible.find(c => c.id === selectedId)!;

    const lanes = this.pickLanesForObstacle(config);

    for (const lane of lanes) {
      if (this.isLaneBlockedAt(lane, this.nextSpawnZ, config.depth)) continue;
      const obs = createObstacleInstance(config, lane, this.nextSpawnZ);
      this.scene.add(obs.mesh);
      this.obstacles.push(obs);

      // Extra gap after long obstacles
      if (config.depth > 10) {
        this.nextSpawnZ += config.depth + 10;
      }
    }
  }

  private spawnOncomingTrain(playerZ: number, _speed: number, _distance: number): void {
    const config = OBSTACLE_CONFIGS.find(c => c.id === 'train_oncoming');
    if (!config) return;

    // Pick a random lane
    const lane = randomChoice([-1, 0, 1]);

    // Spawn far ahead — give player 2-3 seconds of visual warning
    const spawnZ = playerZ + GAME.SEGMENT_LENGTH * GAME.SPAWN_AHEAD + 50;

    if (this.isLaneBlockedAt(lane, spawnZ, config.depth)) return;

    const obs = createObstacleInstance(config, lane, spawnZ);
    this.scene.add(obs.mesh);
    this.obstacles.push(obs);

    // Emit event so GameManager can play train horn
    eventBus.emit('train:incoming', { lane });
  }

  private isLaneBlockedAt(lane: number, z: number, depth: number): boolean {
    for (const obs of this.obstacles) {
      if (!obs.active || obs.lane !== lane) continue;
      const existingStart = obs.z - obs.config.depth / 2;
      const existingEnd = obs.z + obs.config.depth / 2;
      const newStart = z - depth / 2;
      const newEnd = z + depth / 2;
      if (newStart < existingEnd + 5 && newEnd > existingStart - 5) {
        return true;
      }
    }
    return false;
  }

  private pickLanesForObstacle(_config: ObstacleConfig): number[] {
    return [randomChoice([-1, 0, 1])];
  }

  reset(): void {
    for (const obs of this.obstacles) this.scene.remove(obs.mesh);
    this.obstacles = [];
    this.nextSpawnZ = 0;
    this.nextTrainTimer = 5; // First train comes after 5 seconds
    this.trainInterval = 8;
  }
}

import * as THREE from 'three';
import { GAME, POWERUP } from '@core/Constants';
import { weightedRandom, randomChoice } from '@utils/RandomUtils';
import { aabbIntersect, type AABB } from '@player/PlayerCollision';
import { PowerUpBase } from './PowerUpBase';
import { Jetpack } from './Jetpack';
import { Magnet } from './Magnet';
import { eventBus } from '@core/EventBus';

interface PowerUpPickup { mesh: THREE.Group; type: string; x: number; z: number; active: boolean; }

const POWERUP_COLORS: Record<string, number> = { jetpack: 0xff4444, magnet: 0x44aaff };

export class PowerUpManager {
  private scene: THREE.Scene;
  private pickups: PowerUpPickup[] = [];
  private activePowerUp: PowerUpBase | null = null;
  private lastSpawnZ = 0;
  private powerUpLevels: Record<string, number>;

  constructor(scene: THREE.Scene, levels: Record<string, number>) { this.scene = scene; this.powerUpLevels = levels; }

  get current(): PowerUpBase | null { return this.activePowerUp; }
  get jetpackActive(): boolean { return this.activePowerUp instanceof Jetpack && this.activePowerUp.active; }
  get magnetRadius(): number { return this.activePowerUp instanceof Magnet ? this.activePowerUp.radius : 0; }

  update(playerZ: number, distance: number, deltaTime: number): void {
    if (this.activePowerUp?.active) this.activePowerUp.update(deltaTime);

    const spawnZ = playerZ + GAME.SEGMENT_LENGTH * (GAME.SPAWN_AHEAD - 1);
    if (spawnZ - this.lastSpawnZ >= POWERUP.MIN_DISTANCE_BETWEEN && distance > 100) {
      this.spawnPickup(spawnZ);
      this.lastSpawnZ = spawnZ;
    }

    const behindZ = playerZ - GAME.SEGMENT_LENGTH * 2;
    this.pickups = this.pickups.filter(p => {
      if (!p.active || p.z < behindZ) { this.scene.remove(p.mesh); return false; }
      p.mesh.rotation.y += 2 * deltaTime;
      p.mesh.position.y = 1.5 + Math.sin(performance.now() * 0.003) * 0.3;
      return true;
    });
  }

  checkCollisions(playerAABB: AABB): void {
    for (const pickup of this.pickups) {
      if (!pickup.active) continue;
      const pickupAABB: AABB = { minX: pickup.x - 0.5, maxX: pickup.x + 0.5, minY: 0.5, maxY: 2.5, minZ: pickup.z - 0.5, maxZ: pickup.z + 0.5 };
      if (aabbIntersect(playerAABB, pickupAABB)) {
        pickup.active = false; this.scene.remove(pickup.mesh);
        this.activatePowerUp(pickup.type);
      }
    }
  }

  private activatePowerUp(type: string): void {
    if (this.activePowerUp?.active) this.activePowerUp.deactivate();
    const level = this.powerUpLevels[type] ?? 1;
    switch (type) {
      case 'jetpack': this.activePowerUp = new Jetpack(level); break;
      case 'magnet': this.activePowerUp = new Magnet(level); break;
      default: return;
    }
    this.activePowerUp.activate();
    eventBus.emit('powerup:pickup', { type });
  }

  private spawnPickup(z: number): void {
    const type = weightedRandom(POWERUP.WEIGHTS);
    const lane = randomChoice([-1, 0, 1]);
    const x = lane * GAME.LANE_WIDTH;

    const group = new THREE.Group();
    const color = POWERUP_COLORS[type] ?? 0xffffff;
    const geo = new THREE.OctahedronGeometry(0.5);
    const mat = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
    group.add(new THREE.Mesh(geo, mat));
    group.position.set(x, 1.5, z);

    this.scene.add(group);
    this.pickups.push({ mesh: group, type, x, z, active: true });
  }

  reset(): void {
    if (this.activePowerUp?.active) this.activePowerUp.deactivate();
    this.activePowerUp = null;
    for (const p of this.pickups) this.scene.remove(p.mesh);
    this.pickups = []; this.lastSpawnZ = 0;
  }
}

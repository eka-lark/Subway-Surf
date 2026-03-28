import * as THREE from 'three';
import { GAME, POOL_SIZES } from '@core/Constants';
import { ObjectPool } from '@core/ObjectPool';
import { TrackSegment } from './TrackSegment';
import { addEnvironmentProps, clearEnvironmentProps } from './EnvironmentProps';

export class TrackGenerator {
  private pool: ObjectPool<TrackSegment>;
  private activeSegments: TrackSegment[] = [];
  private lastSpawnedIndex = -1;
  private firstActiveIndex = 0;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.pool = new ObjectPool(
      () => new TrackSegment(),
      (seg) => { clearEnvironmentProps(seg.group); seg.reset(); },
      POOL_SIZES.TRACK_SEGMENT
    );
  }

  get segments(): TrackSegment[] { return this.activeSegments; }

  init(): void {
    for (let i = -1; i < GAME.SPAWN_AHEAD; i++) this.spawnSegment(i);
    this.lastSpawnedIndex = GAME.SPAWN_AHEAD - 1;
    this.firstActiveIndex = -1;
  }

  update(playerZ: number): void {
    const playerIndex = Math.floor(playerZ / GAME.SEGMENT_LENGTH);
    while (this.lastSpawnedIndex < playerIndex + GAME.SPAWN_AHEAD) {
      this.lastSpawnedIndex++;
      this.spawnSegment(this.lastSpawnedIndex);
    }
    while (this.firstActiveIndex < playerIndex - GAME.DESPAWN_BEHIND) {
      const seg = this.activeSegments.shift();
      if (seg) { this.scene.remove(seg.group); this.pool.release(seg); }
      this.firstActiveIndex++;
    }
  }

  private spawnSegment(index: number): void {
    const seg = this.pool.get();
    if (!seg) return;
    const z = index * GAME.SEGMENT_LENGTH;
    seg.setPosition(z, index);
    addEnvironmentProps(seg.group);
    this.scene.add(seg.group);
    this.activeSegments.push(seg);
  }

  reset(): void {
    for (const seg of this.activeSegments) { this.scene.remove(seg.group); this.pool.release(seg); }
    this.activeSegments = [];
    this.lastSpawnedIndex = -1;
    this.firstActiveIndex = 0;
  }
}

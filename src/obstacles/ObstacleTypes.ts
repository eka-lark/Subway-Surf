import * as THREE from 'three';
import type { AABB } from '@player/PlayerCollision';

export type AvoidAction = 'jump' | 'slide' | 'lane_switch';
export type ObstacleType = 'static' | 'dynamic_forward' | 'dynamic_oncoming';

export interface ObstacleConfig {
  id: string; type: ObstacleType; avoidActions: AvoidAction[];
  minLanes: number; maxLanes: number; minDistance: number;
  speedMultiplier: number; weight: number;
  width: number; height: number; depth: number; color: number;
  collisionMinY: number; // bottom of collision box (0 for ground-level, raised for slide-under)
}

export const OBSTACLE_CONFIGS: ObstacleConfig[] = [
  { id: 'low_barrier', type: 'static', avoidActions: ['jump'], minLanes: 1, maxLanes: 2, minDistance: 0, speedMultiplier: 0, weight: 35, width: 2.0, height: 0.6, depth: 0.5, color: 0xff4444, collisionMinY: 0 },
  { id: 'high_barrier', type: 'static', avoidActions: ['slide'], minLanes: 1, maxLanes: 2, minDistance: 0, speedMultiplier: 0, weight: 30, width: 2.0, height: 2.5, depth: 0.3, color: 0xffaa00, collisionMinY: 1.0 },
  { id: 'full_barrier', type: 'static', avoidActions: ['lane_switch'], minLanes: 1, maxLanes: 1, minDistance: 200, speedMultiplier: 0, weight: 25, width: 2.2, height: 2.5, depth: 3.0, color: 0x4488ff, collisionMinY: 0 },
  { id: 'train_moving', type: 'dynamic_forward', avoidActions: ['lane_switch'], minLanes: 1, maxLanes: 1, minDistance: 500, speedMultiplier: 0.7, weight: 10, width: 2.2, height: 3.0, depth: 8.0, color: 0x22cc44, collisionMinY: 0 },
];

export interface ObstacleInstance {
  config: ObstacleConfig; mesh: THREE.Group; lane: number; z: number; active: boolean; aabb: AABB;
}

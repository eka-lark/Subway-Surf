import * as THREE from 'three';
import type { ObstacleConfig, ObstacleInstance } from './ObstacleTypes';
import type { AABB } from '@player/PlayerCollision';
import { GAME } from '@core/Constants';

export function createObstacleMesh(config: ObstacleConfig): THREE.Group {
  const group = new THREE.Group();
  const geo = new THREE.BoxGeometry(config.width, config.height, config.depth);
  const mat = new THREE.MeshLambertMaterial({ color: config.color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = config.height / 2;

  if (config.id === 'low_barrier') {
    const stripeGeo = new THREE.BoxGeometry(config.width + 0.02, 0.1, config.depth + 0.02);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = config.height / 2;
    group.add(stripe);
  }

  if (config.id === 'high_barrier') {
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, config.height);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const leftPole = new THREE.Mesh(poleGeo, poleMat);
    leftPole.position.set(-config.width / 2 + 0.1, config.height / 2, 0);
    const rightPole = new THREE.Mesh(poleGeo, poleMat.clone());
    rightPole.position.set(config.width / 2 - 0.1, config.height / 2, 0);
    group.add(leftPole, rightPole);
    mesh.position.y = config.height - 0.5;
    mesh.scale.y = 0.4;
  }

  group.add(mesh);
  return group;
}

export function computeObstacleAABB(config: ObstacleConfig, x: number, z: number): AABB {
  const hw = config.width / 2;
  const hd = config.depth / 2;
  return { minX: x - hw, maxX: x + hw, minY: 0, maxY: config.height, minZ: z - hd, maxZ: z + hd };
}

export function createObstacleInstance(config: ObstacleConfig, lane: number, z: number): ObstacleInstance {
  const mesh = createObstacleMesh(config);
  const x = lane * GAME.LANE_WIDTH;
  mesh.position.set(x, 0, z);
  return { config, mesh, lane, z, active: true, aabb: computeObstacleAABB(config, x, z) };
}

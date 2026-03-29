import * as THREE from 'three';
import type { ObstacleConfig, ObstacleInstance } from './ObstacleTypes';
import type { AABB } from '@player/PlayerCollision';
import { GAME } from '@core/Constants';

export function createObstacleMesh(config: ObstacleConfig): THREE.Group {
  const group = new THREE.Group();

  switch (config.id) {
    case 'low_barrier':
      createLowBarrier(group, config);
      break;
    case 'high_barrier':
      createHighBarrier(group, config);
      break;
    case 'full_barrier':
      createFullBarrier(group, config);
      break;
    case 'train_moving':
      createTrain(group, config);
      break;
    default: {
      const geo = new THREE.BoxGeometry(config.width, config.height, config.depth);
      const mat = new THREE.MeshPhongMaterial({ color: config.color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = config.height / 2;
      group.add(mesh);
    }
  }

  return group;
}

function createLowBarrier(group: THREE.Group, config: ObstacleConfig): void {
  // Traffic barrier — red and white striped, clearly jumpable
  const barMat = new THREE.MeshPhongMaterial({ color: 0xd32f2f });
  const whiteMat = new THREE.MeshPhongMaterial({ color: 0xffffff });

  // Main bar
  const barGeo = new THREE.BoxGeometry(config.width, 0.15, config.depth);
  const bar = new THREE.Mesh(barGeo, barMat);
  bar.position.y = config.height - 0.07;
  group.add(bar);

  // White stripes on the bar
  for (let x = -config.width / 2 + 0.3; x < config.width / 2; x += 0.6) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.16, config.depth + 0.01),
      whiteMat
    );
    stripe.position.set(x, config.height - 0.07, 0);
    group.add(stripe);
  }

  // Support legs
  const legMat = new THREE.MeshPhongMaterial({ color: 0xff8a80 });
  for (const x of [-config.width / 2 + 0.15, config.width / 2 - 0.15]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, config.height, 0.08),
      legMat
    );
    leg.position.set(x, config.height / 2, 0);
    group.add(leg);
  }

  // Warning sign on top (triangle)
  const signMat = new THREE.MeshPhongMaterial({ color: 0xffc107 });
  const signGeo = new THREE.ConeGeometry(0.15, 0.2, 3);
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(0, config.height + 0.15, 0);
  sign.rotation.y = Math.PI;
  group.add(sign);
}

function createHighBarrier(group: THREE.Group, config: ObstacleConfig): void {
  // Overhead sign/beam — clearly needs to slide under
  const poleMat = new THREE.MeshPhongMaterial({ color: 0x757575 });
  const signMat = new THREE.MeshPhongMaterial({ color: 0xf57f17 });
  const warningMat = new THREE.MeshPhongMaterial({ color: 0x212121 });

  // Poles on each side
  for (const x of [-config.width / 2 + 0.1, config.width / 2 - 0.1]) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, config.height, 8),
      poleMat
    );
    pole.position.set(x, config.height / 2, 0);
    group.add(pole);
  }

  // Overhead board (the actual dangerous part — at the top)
  const boardGeo = new THREE.BoxGeometry(config.width, 0.8, config.depth + 0.2);
  const board = new THREE.Mesh(boardGeo, signMat);
  board.position.y = config.height - 0.4;
  group.add(board);

  // "DUCK!" text area (dark strip on board)
  const textStrip = new THREE.Mesh(
    new THREE.BoxGeometry(config.width - 0.3, 0.5, config.depth + 0.21),
    warningMat
  );
  textStrip.position.y = config.height - 0.4;
  group.add(textStrip);

  // Down arrow indicators (showing you need to go low)
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffc107 });
  for (const x of [-0.4, 0, 0.4]) {
    const arrow = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.2, 3),
      arrowMat
    );
    arrow.position.set(x, config.height - 0.9, config.depth / 2 + 0.05);
    arrow.rotation.x = Math.PI; // Point down
    group.add(arrow);
  }
}

function createFullBarrier(group: THREE.Group, config: ObstacleConfig): void {
  // Parked bus/van — large colorful vehicle, clearly must dodge sideways
  const bodyMat = new THREE.MeshPhongMaterial({ color: 0x1565c0 });
  const windowMat = new THREE.MeshPhongMaterial({ color: 0x90caf9, transparent: true, opacity: 0.7 });
  const wheelMat = new THREE.MeshPhongMaterial({ color: 0x212121 });
  const bumperMat = new THREE.MeshPhongMaterial({ color: 0x9e9e9e });

  // Main body
  const bodyGeo = new THREE.BoxGeometry(config.width, config.height * 0.65, config.depth);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = config.height * 0.45;
  group.add(body);

  // Roof
  const roofGeo = new THREE.BoxGeometry(config.width - 0.2, 0.2, config.depth - 0.4);
  const roof = new THREE.Mesh(roofGeo, bodyMat);
  roof.position.y = config.height * 0.78;
  group.add(roof);

  // Windshield (front)
  const windGeo = new THREE.BoxGeometry(config.width - 0.4, config.height * 0.3, 0.05);
  const windshield = new THREE.Mesh(windGeo, windowMat);
  windshield.position.set(0, config.height * 0.6, config.depth / 2);
  group.add(windshield);

  // Side windows
  for (let z = -config.depth / 2 + 0.5; z < config.depth / 2 - 0.3; z += 0.8) {
    for (const side of [-1, 1]) {
      const winGeo = new THREE.BoxGeometry(0.05, config.height * 0.25, 0.5);
      const win = new THREE.Mesh(winGeo, windowMat);
      win.position.set(side * config.width / 2, config.height * 0.55, z);
      group.add(win);
    }
  }

  // Wheels
  for (const z of [-config.depth / 3, config.depth / 3]) {
    for (const side of [-1, 1]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.15, 12),
        wheelMat
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(side * (config.width / 2 + 0.02), 0.25, z);
      group.add(wheel);
    }
  }

  // Front bumper
  const bumper = new THREE.Mesh(
    new THREE.BoxGeometry(config.width + 0.1, 0.2, 0.15),
    bumperMat
  );
  bumper.position.set(0, 0.35, config.depth / 2 + 0.05);
  group.add(bumper);

  // Headlights
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
  for (const x of [-config.width / 2 + 0.3, config.width / 2 - 0.3]) {
    const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), lightMat);
    headlight.position.set(x, 0.5, config.depth / 2 + 0.05);
    group.add(headlight);
  }
}

function createTrain(group: THREE.Group, config: ObstacleConfig): void {
  // Moving train — long green/silver car
  const bodyMat = new THREE.MeshPhongMaterial({ color: 0x43a047 });
  const roofMat = new THREE.MeshPhongMaterial({ color: 0x757575 });
  const windowMat = new THREE.MeshPhongMaterial({ color: 0xb3e5fc, transparent: true, opacity: 0.6 });
  const stripeMat = new THREE.MeshPhongMaterial({ color: 0xfdd835 });
  const wheelMat = new THREE.MeshPhongMaterial({ color: 0x424242 });

  // Main body
  const bodyGeo = new THREE.BoxGeometry(config.width, config.height * 0.7, config.depth);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = config.height * 0.45;
  group.add(body);

  // Roof (rounded look with a box)
  const roofGeo = new THREE.BoxGeometry(config.width - 0.3, 0.3, config.depth);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = config.height * 0.82;
  group.add(roof);

  // Yellow stripe along the side
  for (const side of [-1, 1]) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.15, config.depth + 0.01),
      stripeMat
    );
    stripe.position.set(side * config.width / 2, config.height * 0.35, 0);
    group.add(stripe);
  }

  // Windows along both sides
  for (let z = -config.depth / 2 + 0.8; z < config.depth / 2 - 0.5; z += 1.2) {
    for (const side of [-1, 1]) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, config.height * 0.25, 0.7),
        windowMat
      );
      win.position.set(side * config.width / 2, config.height * 0.55, z);
      group.add(win);
    }
  }

  // Wheels/bogies
  for (const z of [-config.depth / 2 + 1, config.depth / 2 - 1]) {
    const bogie = new THREE.Mesh(
      new THREE.BoxGeometry(config.width + 0.1, 0.15, 0.8),
      wheelMat
    );
    bogie.position.set(0, 0.1, z);
    group.add(bogie);
  }

  // Front face
  const frontMat = new THREE.MeshPhongMaterial({ color: 0x2e7d32 });
  const front = new THREE.Mesh(
    new THREE.BoxGeometry(config.width, config.height * 0.7, 0.1),
    frontMat
  );
  front.position.set(0, config.height * 0.45, config.depth / 2 + 0.05);
  group.add(front);

  // Front light
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), lightMat);
  headlight.position.set(0, config.height * 0.5, config.depth / 2 + 0.1);
  group.add(headlight);
}

export function computeObstacleAABB(config: ObstacleConfig, x: number, z: number): AABB {
  const hw = config.width / 2;
  const hd = config.depth / 2;
  return { minX: x - hw, maxX: x + hw, minY: config.collisionMinY, maxY: config.height, minZ: z - hd, maxZ: z + hd };
}

export function createObstacleInstance(config: ObstacleConfig, lane: number, z: number): ObstacleInstance {
  const mesh = createObstacleMesh(config);
  const x = lane * GAME.LANE_WIDTH;
  mesh.position.set(x, 0, z);
  return { config, mesh, lane, z, active: true, aabb: computeObstacleAABB(config, x, z) };
}

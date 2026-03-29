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
    case 'train_parked':
    case 'train_oncoming':
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
  const isOncoming = config.id === 'train_oncoming';
  const bodyColor = config.color;
  const bodyMat = new THREE.MeshPhongMaterial({ color: bodyColor, flatShading: true });
  const roofMat = new THREE.MeshPhongMaterial({ color: 0x757575, flatShading: true });
  const windowMat = new THREE.MeshPhongMaterial({ color: 0xb3e5fc, transparent: true, opacity: 0.6 });
  const stripeMat = new THREE.MeshPhongMaterial({ color: isOncoming ? 0xff5722 : 0xfdd835 });
  const wheelMat = new THREE.MeshPhongMaterial({ color: 0x333333, flatShading: true });
  const doorMat = new THREE.MeshPhongMaterial({ color: 0x9e9e9e, flatShading: true });

  // Build train as multiple connected cars
  const carLength = 7;
  const numCars = Math.max(1, Math.floor(config.depth / carLength));
  const gapBetweenCars = 0.3;

  for (let car = 0; car < numCars; car++) {
    const carZ = -config.depth / 2 + car * (carLength + gapBetweenCars) + carLength / 2;
    const isFirstCar = car === 0;
    const isLastCar = car === numCars - 1;

    // Car body
    const carBody = new THREE.Mesh(
      new THREE.BoxGeometry(config.width, config.height * 0.65, carLength),
      bodyMat
    );
    carBody.position.set(0, config.height * 0.42, carZ);
    group.add(carBody);

    // Roof
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(config.width - 0.2, 0.2, carLength - 0.2),
      roofMat
    );
    roof.position.set(0, config.height * 0.76, carZ);
    group.add(roof);

    // Stripe along sides
    for (const side of [-1, 1]) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.12, carLength),
        stripeMat
      );
      stripe.position.set(side * config.width / 2, config.height * 0.35, carZ);
      group.add(stripe);

      // Bottom rail
      const bottomRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.06, carLength),
        stripeMat
      );
      bottomRail.position.set(side * config.width / 2, config.height * 0.12, carZ);
      group.add(bottomRail);
    }

    // Windows (evenly spaced with door gaps)
    for (let wz = -carLength / 2 + 0.6; wz < carLength / 2 - 0.4; wz += 0.9) {
      // Skip window positions where doors are
      const isDoorPos = Math.abs(wz) < 0.8;
      for (const side of [-1, 1]) {
        if (isDoorPos) {
          // Door
          const door = new THREE.Mesh(
            new THREE.BoxGeometry(0.03, config.height * 0.4, 0.7),
            doorMat
          );
          door.position.set(side * (config.width / 2 + 0.01), config.height * 0.32, carZ + wz);
          group.add(door);
        } else {
          // Window
          const win = new THREE.Mesh(
            new THREE.BoxGeometry(0.03, config.height * 0.2, 0.6),
            windowMat
          );
          win.position.set(side * (config.width / 2 + 0.01), config.height * 0.52, carZ + wz);
          group.add(win);
        }
      }
    }

    // Bogies/wheels at each end of car
    for (const bz of [-carLength / 2 + 0.8, carLength / 2 - 0.8]) {
      const bogie = new THREE.Mesh(
        new THREE.BoxGeometry(config.width + 0.05, 0.12, 0.6),
        wheelMat
      );
      bogie.position.set(0, 0.08, carZ + bz);
      group.add(bogie);

      // Wheel circles
      for (const side of [-1, 1]) {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 0.08, 10),
          wheelMat
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(side * (config.width / 2 + 0.03), 0.18, carZ + bz);
        group.add(wheel);
      }
    }

    // Front face on first car / rear face on last car
    const frontFaceZ = isOncoming
      ? (isFirstCar ? carZ - carLength / 2 - 0.05 : null)
      : (isLastCar ? carZ + carLength / 2 + 0.05 : null);

    if ((isFirstCar || isLastCar) && frontFaceZ !== null) {
      // Cab face (slightly different color)
      const cabMat = new THREE.MeshPhongMaterial({
        color: isOncoming ? 0xb71c1c : (bodyColor === 0x22cc44 ? 0x1b5e20 : 0x0d47a1),
        flatShading: true
      });
      const cabFace = new THREE.Mesh(
        new THREE.BoxGeometry(config.width, config.height * 0.65, 0.1),
        cabMat
      );
      cabFace.position.set(0, config.height * 0.42, frontFaceZ);
      group.add(cabFace);

      // Windshield
      const windshield = new THREE.Mesh(
        new THREE.BoxGeometry(config.width * 0.7, config.height * 0.2, 0.02),
        windowMat
      );
      windshield.position.set(0, config.height * 0.6, frontFaceZ + (frontFaceZ > 0 ? 0.06 : -0.06));
      group.add(windshield);

      // Headlights
      const headlightMat = new THREE.MeshBasicMaterial({ color: isOncoming ? 0xff5722 : 0xffeb3b });
      for (const x of [-config.width / 3, config.width / 3]) {
        const hl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), headlightMat);
        hl.position.set(x, config.height * 0.3, frontFaceZ + (frontFaceZ > 0 ? 0.06 : -0.06));
        group.add(hl);
      }

      // Route number plate
      const plateMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.02), plateMat);
      plate.position.set(0, config.height * 0.7, frontFaceZ + (frontFaceZ > 0 ? 0.06 : -0.06));
      group.add(plate);
    }

    // Connector between cars (except last car)
    if (!isLastCar) {
      const connector = new THREE.Mesh(
        new THREE.BoxGeometry(config.width * 0.4, config.height * 0.3, gapBetweenCars + 0.2),
        wheelMat
      );
      connector.position.set(0, config.height * 0.25, carZ + carLength / 2 + gapBetweenCars / 2);
      group.add(connector);
    }
  }
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

import * as THREE from 'three';
import { GAME } from '@core/Constants';
import { randomFloat, randomInt } from '@utils/RandomUtils';

const BUILDING_COLORS = [0x667788, 0x556677, 0x778899, 0x889999, 0x997788];

export function addEnvironmentProps(group: THREE.Group): void {
  const sideOffset = GAME.LANE_WIDTH * 1.5 + 2;
  const segLen = GAME.SEGMENT_LENGTH;
  const numBuildings = randomInt(2, 4);

  for (let i = 0; i < numBuildings; i++) {
    const height = randomFloat(4, 12);
    const width = randomFloat(2, 5);
    const depth = randomFloat(3, 8);
    const z = randomFloat(2, segLen - 2);
    const color = BUILDING_COLORS[randomInt(0, BUILDING_COLORS.length - 1)];

    const leftGeo = new THREE.BoxGeometry(width, height, depth);
    const leftMat = new THREE.MeshLambertMaterial({ color });
    const leftBuilding = new THREE.Mesh(leftGeo, leftMat);
    leftBuilding.position.set(-sideOffset - width / 2, height / 2, z);
    group.add(leftBuilding);

    const rightGeo = new THREE.BoxGeometry(width, height, depth);
    const rightMat = new THREE.MeshLambertMaterial({ color });
    const rightBuilding = new THREE.Mesh(rightGeo, rightMat);
    rightBuilding.position.set(sideOffset + width / 2, height / 2, z);
    group.add(rightBuilding);
  }
}

export function clearEnvironmentProps(group: THREE.Group): void {
  while (group.children.length > 5) {
    const child = group.children[group.children.length - 1];
    group.remove(child);
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (child.material instanceof THREE.Material) child.material.dispose();
    }
  }
}

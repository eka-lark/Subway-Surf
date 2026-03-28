import * as THREE from 'three';
import { GAME } from '@core/Constants';

export class TrackSegment {
  readonly group: THREE.Group;
  index = 0;

  constructor() {
    this.group = new THREE.Group();

    const groundGeo = new THREE.PlaneGeometry(GAME.LANE_WIDTH * 3 + 2, GAME.SEGMENT_LENGTH);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.01, GAME.SEGMENT_LENGTH / 2);

    const railGeo = new THREE.BoxGeometry(0.15, 0.3, GAME.SEGMENT_LENGTH);
    const railMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(-GAME.LANE_WIDTH * 1.5 - 0.5, 0.15, GAME.SEGMENT_LENGTH / 2);
    const rightRail = new THREE.Mesh(railGeo, railMat.clone());
    rightRail.position.set(GAME.LANE_WIDTH * 1.5 + 0.5, 0.15, GAME.SEGMENT_LENGTH / 2);

    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    const lineGeo = new THREE.PlaneGeometry(0.08, GAME.SEGMENT_LENGTH);
    const leftLine = new THREE.Mesh(lineGeo, lineMat);
    leftLine.rotation.x = -Math.PI / 2;
    leftLine.position.set(-GAME.LANE_WIDTH / 2, 0.001, GAME.SEGMENT_LENGTH / 2);
    const rightLine = new THREE.Mesh(lineGeo, lineMat.clone());
    rightLine.rotation.x = -Math.PI / 2;
    rightLine.position.set(GAME.LANE_WIDTH / 2, 0.001, GAME.SEGMENT_LENGTH / 2);

    this.group.add(ground, leftRail, rightRail, leftLine, rightLine);
  }

  setPosition(z: number, index: number): void {
    this.group.position.z = z;
    this.index = index;
  }

  reset(): void {
    this.group.position.set(0, 0, 0);
    this.index = 0;
  }
}

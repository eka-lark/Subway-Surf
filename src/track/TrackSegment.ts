import * as THREE from 'three';
import { GAME } from '@core/Constants';

export class TrackSegment {
  readonly group: THREE.Group;
  index = 0;

  constructor() {
    this.group = new THREE.Group();
    const segLen = GAME.SEGMENT_LENGTH;
    const trackWidth = GAME.LANE_WIDTH * 3 + 2;

    // Main ground — dark asphalt
    const groundGeo = new THREE.PlaneGeometry(trackWidth, segLen);
    const groundMat = new THREE.MeshPhongMaterial({
      color: 0x3a3a3a,
      flatShading: true,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.01, segLen / 2);
    this.group.add(ground);

    // Gravel/ballast strip (subtle texture along the track)
    const gravelGeo = new THREE.PlaneGeometry(trackWidth - 1, segLen);
    const gravelMat = new THREE.MeshPhongMaterial({ color: 0x4a4a4a, flatShading: true });
    const gravel = new THREE.Mesh(gravelGeo, gravelMat);
    gravel.rotation.x = -Math.PI / 2;
    gravel.position.set(0, 0.001, segLen / 2);
    this.group.add(gravel);

    // Subway rails (2 per lane, metallic silver)
    const railMat = new THREE.MeshPhongMaterial({ color: 0xcccccc, shininess: 80 });
    for (let lane = -1; lane <= 1; lane++) {
      const cx = lane * GAME.LANE_WIDTH;
      for (const offset of [-0.35, 0.35]) {
        const railGeo = new THREE.BoxGeometry(0.06, 0.08, segLen);
        const rail = new THREE.Mesh(railGeo, railMat);
        rail.position.set(cx + offset, 0.04, segLen / 2);
        this.group.add(rail);
      }
    }

    // Lane divider lines (yellow dashes)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffd600 });
    for (const xPos of [-GAME.LANE_WIDTH / 2, GAME.LANE_WIDTH / 2]) {
      for (let z = 0; z < segLen; z += 8) {
        const dashGeo = new THREE.PlaneGeometry(0.1, 2);
        const dash = new THREE.Mesh(dashGeo, lineMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(xPos, 0.005, z + 1);
        this.group.add(dash);
      }
    }

    // Platform edges (raised concrete on both sides)
    const platformMat = new THREE.MeshPhongMaterial({ color: 0x757575 });
    const platformEdgeMat = new THREE.MeshPhongMaterial({ color: 0xffd600 });
    for (const side of [-1, 1]) {
      const px = side * (GAME.LANE_WIDTH * 1.5 + 0.7);
      // Platform base
      const platGeo = new THREE.BoxGeometry(0.8, 0.6, segLen);
      const plat = new THREE.Mesh(platGeo, platformMat);
      plat.position.set(px, 0.3, segLen / 2);
      this.group.add(plat);

      // Yellow safety line on platform edge
      const edgeGeo = new THREE.BoxGeometry(0.1, 0.62, segLen);
      const edge = new THREE.Mesh(edgeGeo, platformEdgeMat);
      edge.position.set(px - side * 0.35, 0.3, segLen / 2);
      this.group.add(edge);
    }
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

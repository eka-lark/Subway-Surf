import * as THREE from 'three';
import { lerp } from '@utils/MathUtils';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private readonly offsetY = 6;
  private readonly offsetZ = -12;
  private readonly lookAheadZ = 10;
  private readonly smoothSpeed = 5;
  private currentY: number;
  private currentZ: number;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.currentY = this.offsetY;
    this.currentZ = this.offsetZ;
    this.camera.position.set(0, this.offsetY, this.offsetZ);
    this.camera.lookAt(0, 1, this.lookAheadZ);
  }

  update(playerZ: number, deltaTime: number): void {
    const targetZ = playerZ + this.offsetZ;
    this.currentY = lerp(this.currentY, this.offsetY, this.smoothSpeed * deltaTime);
    this.currentZ = lerp(this.currentZ, targetZ, this.smoothSpeed * deltaTime);
    this.camera.position.set(0, this.currentY, this.currentZ);
    this.camera.lookAt(0, 1.5, playerZ + this.lookAheadZ);
  }

  reset(playerZ: number): void {
    this.currentY = this.offsetY;
    this.currentZ = playerZ + this.offsetZ;
    this.camera.position.set(0, this.currentY, this.currentZ);
    this.camera.lookAt(0, 1.5, playerZ + this.lookAheadZ);
  }
}

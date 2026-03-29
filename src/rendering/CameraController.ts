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

  // Screen shake
  private shakeIntensity = 0;
  private shakeDuration = 0;
  private shakeTimer = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.currentY = this.offsetY;
    this.currentZ = this.offsetZ;
    this.camera.position.set(0, this.offsetY, this.offsetZ);
    this.camera.lookAt(0, 1, this.lookAheadZ);
  }

  /** Trigger a screen shake effect */
  shake(intensity: number, duration: number): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimer = 0;
  }

  update(playerZ: number, deltaTime: number): void {
    const targetZ = playerZ + this.offsetZ;
    this.currentY = lerp(this.currentY, this.offsetY, this.smoothSpeed * deltaTime);
    this.currentZ = lerp(this.currentZ, targetZ, this.smoothSpeed * deltaTime);

    let shakeX = 0;
    let shakeY = 0;

    // Apply screen shake
    if (this.shakeTimer < this.shakeDuration) {
      this.shakeTimer += deltaTime;
      const decay = 1 - (this.shakeTimer / this.shakeDuration);
      const strength = this.shakeIntensity * decay;
      shakeX = (Math.random() - 0.5) * 2 * strength;
      shakeY = (Math.random() - 0.5) * 2 * strength;
    }

    this.camera.position.set(shakeX, this.currentY + shakeY, this.currentZ);
    this.camera.lookAt(0, 1.5, playerZ + this.lookAheadZ);
  }

  reset(playerZ: number): void {
    this.currentY = this.offsetY;
    this.currentZ = playerZ + this.offsetZ;
    this.shakeTimer = this.shakeDuration; // Stop any active shake
    this.camera.position.set(0, this.currentY, this.currentZ);
    this.camera.lookAt(0, 1.5, playerZ + this.lookAheadZ);
  }
}

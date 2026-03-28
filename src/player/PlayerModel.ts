import * as THREE from 'three';

export type PlayerAnimState = 'run' | 'jump' | 'slide' | 'crash';

export class PlayerModel {
  readonly group: THREE.Group;
  private body: THREE.Mesh;
  private head: THREE.Mesh;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;
  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;
  private animTime = 0;
  private currentAnim: PlayerAnimState = 'run';

  constructor() {
    this.group = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x2196f3 });
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffccaa });
    const shoesMat = new THREE.MeshLambertMaterial({ color: 0x333333 });

    this.body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.3), bodyMat);
    this.body.position.y = 1.0;
    this.head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), skinMat);
    this.head.position.y = 1.55;
    this.leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), bodyMat);
    this.leftArm.position.set(-0.35, 1.0, 0);
    this.rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), bodyMat);
    this.rightArm.position.set(0.35, 1.0, 0);
    this.leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.18), shoesMat);
    this.leftLeg.position.set(-0.13, 0.4, 0);
    this.rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.18), shoesMat);
    this.rightLeg.position.set(0.13, 0.4, 0);

    this.group.add(this.body, this.head, this.leftArm, this.rightArm, this.leftLeg, this.rightLeg);
  }

  setAnimation(state: PlayerAnimState): void {
    if (this.currentAnim === state) return;
    this.currentAnim = state;
    this.animTime = 0;
    this.body.rotation.set(0, 0, 0);
    this.head.rotation.set(0, 0, 0);
    this.group.scale.set(1, 1, 1);
    this.body.position.y = 1.0;
    this.head.position.y = 1.55;
    this.leftArm.position.y = 1.0;
    this.rightArm.position.y = 1.0;
    this.leftLeg.position.y = 0.4;
    this.rightLeg.position.y = 0.4;

    if (state === 'slide') this.group.scale.set(1, 0.4, 1);
  }

  update(deltaTime: number): void {
    this.animTime += deltaTime;
    if (this.currentAnim === 'run') {
      const speed = 12;
      const swing = Math.sin(this.animTime * speed) * 0.4;
      this.leftArm.rotation.x = swing;
      this.rightArm.rotation.x = -swing;
      this.leftLeg.rotation.x = -swing;
      this.rightLeg.rotation.x = swing;
      this.body.position.y = 1.0 + Math.abs(Math.sin(this.animTime * speed)) * 0.03;
    } else if (this.currentAnim === 'jump') {
      this.leftLeg.rotation.x = -0.4;
      this.rightLeg.rotation.x = -0.4;
      this.leftArm.rotation.x = -0.6;
      this.rightArm.rotation.x = -0.6;
    }
  }
}

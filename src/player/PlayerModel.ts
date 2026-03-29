import * as THREE from 'three';

export type PlayerAnimState = 'run' | 'jump' | 'slide' | 'crash';

export class PlayerModel {
  readonly group: THREE.Group;
  private body: THREE.Group;
  private head: THREE.Mesh;
  private torso: THREE.Mesh;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private hair: THREE.Mesh;
  private backpack: THREE.Mesh;
  private animTime = 0;
  private currentAnim: PlayerAnimState = 'run';

  constructor() {
    this.group = new THREE.Group();
    this.body = new THREE.Group();

    // Materials
    const skinMat = new THREE.MeshPhongMaterial({ color: 0xf4c794, flatShading: true });
    const shirtMat = new THREE.MeshPhongMaterial({ color: 0x2196f3, flatShading: true });
    const pantsMat = new THREE.MeshPhongMaterial({ color: 0x1a237e, flatShading: true });
    const shoesMat = new THREE.MeshPhongMaterial({ color: 0xf44336, flatShading: true });
    const hairMat = new THREE.MeshPhongMaterial({ color: 0x3e2723, flatShading: true });
    const backpackMat = new THREE.MeshPhongMaterial({ color: 0xff9800, flatShading: true });

    // Head
    this.head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 0.32), skinMat);
    this.head.position.y = 1.58;

    // Hair (cap style)
    this.hair = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.35), hairMat);
    this.hair.position.y = 1.78;

    // Eyes (small white dots)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeGeo = new THREE.SphereGeometry(0.04, 6, 6);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.08, 1.6, 0.15);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.08, 1.6, 0.15);

    // Pupils
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const pupilGeo = new THREE.SphereGeometry(0.025, 6, 6);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.08, 1.6, 0.17);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.08, 1.6, 0.17);

    // Torso
    this.torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 0.25), shirtMat);
    this.torso.position.y = 1.1;

    // Backpack
    this.backpack = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.15), backpackMat);
    this.backpack.position.set(0, 1.15, -0.18);

    // Arms (upper + lower as group)
    this.leftArm = this.createArm(shirtMat, skinMat);
    this.leftArm.position.set(-0.3, 1.25, 0);
    this.rightArm = this.createArm(shirtMat, skinMat);
    this.rightArm.position.set(0.3, 1.25, 0);

    // Legs (upper + lower as group)
    this.leftLeg = this.createLeg(pantsMat, shoesMat);
    this.leftLeg.position.set(-0.1, 0.75, 0);
    this.rightLeg = this.createLeg(pantsMat, shoesMat);
    this.rightLeg.position.set(0.1, 0.75, 0);

    this.body.add(
      this.head, this.hair, leftEye, rightEye, leftPupil, rightPupil,
      this.torso, this.backpack,
      this.leftArm, this.rightArm,
      this.leftLeg, this.rightLeg
    );
    this.group.add(this.body);
  }

  private createArm(shirtMat: THREE.Material, skinMat: THREE.Material): THREE.Group {
    const arm = new THREE.Group();
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.12), shirtMat);
    upper.position.y = -0.14;
    const lower = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.1), skinMat);
    lower.position.y = -0.38;
    arm.add(upper, lower);
    return arm;
  }

  private createLeg(pantsMat: THREE.Material, shoesMat: THREE.Material): THREE.Group {
    const leg = new THREE.Group();
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.35, 0.15), pantsMat);
    upper.position.y = -0.17;
    const lower = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.3, 0.13), pantsMat);
    lower.position.y = -0.47;
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.22), shoesMat);
    shoe.position.set(0, -0.65, 0.04);
    leg.add(upper, lower, shoe);
    return leg;
  }

  setAnimation(state: PlayerAnimState): void {
    if (this.currentAnim === state) return;
    this.currentAnim = state;
    this.animTime = 0;

    // Reset transforms
    this.body.rotation.set(0, 0, 0);
    this.body.scale.set(1, 1, 1);
    this.body.position.set(0, 0, 0);
    this.leftArm.rotation.set(0, 0, 0);
    this.rightArm.rotation.set(0, 0, 0);
    this.leftLeg.rotation.set(0, 0, 0);
    this.rightLeg.rotation.set(0, 0, 0);

    if (state === 'slide') {
      this.body.rotation.x = -Math.PI / 2.5;
      this.body.position.y = -0.5;
      this.body.position.z = 0.3;
    } else if (state === 'crash') {
      this.body.rotation.x = Math.PI / 4;
    }
  }

  update(deltaTime: number): void {
    this.animTime += deltaTime;

    if (this.currentAnim === 'run') {
      const speed = 14;
      const t = this.animTime * speed;
      const armSwing = Math.sin(t) * 0.7;
      const legSwing = Math.sin(t) * 0.8;

      this.leftArm.rotation.x = armSwing;
      this.rightArm.rotation.x = -armSwing;
      this.leftLeg.rotation.x = -legSwing;
      this.rightLeg.rotation.x = legSwing;

      // Body bob
      this.body.position.y = Math.abs(Math.sin(t)) * 0.04;
      // Slight body lean
      this.torso.rotation.x = Math.sin(t) * 0.03;
    } else if (this.currentAnim === 'jump') {
      this.leftLeg.rotation.x = -0.5;
      this.rightLeg.rotation.x = -0.3;
      this.leftArm.rotation.x = -0.8;
      this.rightArm.rotation.x = -0.8;
      this.leftArm.rotation.z = -0.3;
      this.rightArm.rotation.z = 0.3;
    }
  }
}

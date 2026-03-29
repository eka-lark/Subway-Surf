import * as THREE from 'three';

export type PlayerAnimState = 'run' | 'jump' | 'slide' | 'crash' | 'fly';

export class PlayerModel {
  readonly group: THREE.Group;
  private body: THREE.Group;
  private head: THREE.Group;
  private torso: THREE.Mesh;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
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
    const beanieMat = new THREE.MeshPhongMaterial({ color: 0xe53935, flatShading: true });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const noseMat = new THREE.MeshPhongMaterial({ color: 0xe0a873, flatShading: true });
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
    const shoeSoleMat = new THREE.MeshPhongMaterial({ color: 0xeeeeee, flatShading: true });
    const handMat = new THREE.MeshPhongMaterial({ color: 0xf4c794, flatShading: true });

    // --- Head group ---
    this.head = new THREE.Group();
    this.head.position.y = 1.58;

    // Skull - sphere
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), skinMat);
    this.head.add(skull);

    // Hair base (back of head)
    const hairBack = new THREE.Mesh(
      new THREE.SphereGeometry(0.19, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6),
      hairMat
    );
    hairBack.position.y = 0.02;
    this.head.add(hairBack);

    // Beanie / cap
    const beanieBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.20, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.45),
      beanieMat
    );
    beanieBody.position.y = 0.03;
    this.head.add(beanieBody);

    // Beanie rim
    const beanieRim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.20, 0.20, 0.04, 12),
      beanieMat
    );
    beanieRim.position.y = 0.08;
    this.head.add(beanieRim);

    // Left eye - white sclera
    const leftEyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeWhiteMat);
    leftEyeWhite.position.set(-0.07, -0.01, 0.15);
    this.head.add(leftEyeWhite);

    // Right eye - white sclera
    const rightEyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeWhiteMat);
    rightEyeWhite.position.set(0.07, -0.01, 0.15);
    this.head.add(rightEyeWhite);

    // Left pupil
    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), pupilMat);
    leftPupil.position.set(-0.07, -0.01, 0.18);
    this.head.add(leftPupil);

    // Right pupil
    const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), pupilMat);
    rightPupil.position.set(0.07, -0.01, 0.18);
    this.head.add(rightPupil);

    // Nose
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), noseMat);
    nose.position.set(0, -0.05, 0.17);
    nose.scale.set(1, 0.8, 1.2);
    this.head.add(nose);

    // Mouth line
    const mouthShape = new THREE.PlaneGeometry(0.06, 0.012);
    const mouth = new THREE.Mesh(mouthShape, mouthMat);
    mouth.position.set(0, -0.1, 0.175);
    this.head.add(mouth);

    // --- Torso (hoodie/shirt) - capsule-like cylinder ---
    this.torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.18, 0.55, 10),
      shirtMat
    );
    this.torso.position.y = 1.1;

    // Hoodie collar detail
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.20, 0.06, 10),
      shirtMat
    );
    collar.position.y = 1.37;

    // --- Backpack (rounded) ---
    this.backpack = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.12, 0.2, 4, 8),
      backpackMat
    );
    this.backpack.position.set(0, 1.12, -0.2);

    // Backpack straps (thin cylinders)
    const strapMat = new THREE.MeshPhongMaterial({ color: 0xe68a00, flatShading: true });
    const leftStrap = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 6), strapMat);
    leftStrap.position.set(-0.08, 1.2, -0.08);
    leftStrap.rotation.x = 0.15;
    const rightStrap = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 6), strapMat);
    rightStrap.position.set(0.08, 1.2, -0.08);
    rightStrap.rotation.x = 0.15;

    // --- Arms ---
    this.leftArm = this.createArm(shirtMat, skinMat, handMat);
    this.leftArm.position.set(-0.28, 1.28, 0);
    this.rightArm = this.createArm(shirtMat, skinMat, handMat);
    this.rightArm.position.set(0.28, 1.28, 0);

    // --- Legs ---
    this.leftLeg = this.createLeg(pantsMat, shoesMat, shoeSoleMat);
    this.leftLeg.position.set(-0.1, 0.75, 0);
    this.rightLeg = this.createLeg(pantsMat, shoesMat, shoeSoleMat);
    this.rightLeg.position.set(0.1, 0.75, 0);

    this.body.add(
      this.head, this.torso, collar,
      this.backpack, leftStrap, rightStrap,
      this.leftArm, this.rightArm,
      this.leftLeg, this.rightLeg
    );
    this.group.add(this.body);
  }

  private createArm(shirtMat: THREE.Material, skinMat: THREE.Material, handMat: THREE.Material): THREE.Group {
    const arm = new THREE.Group();

    // Upper arm (shirt color) - cylinder
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.26, 8), shirtMat);
    upper.position.y = -0.13;
    arm.add(upper);

    // Forearm (skin color) - cylinder
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.22, 8), skinMat);
    lower.position.y = -0.35;
    arm.add(lower);

    // Hand - small sphere
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), handMat);
    hand.position.y = -0.48;
    arm.add(hand);

    return arm;
  }

  private createLeg(pantsMat: THREE.Material, shoesMat: THREE.Material, soleMat: THREE.Material): THREE.Group {
    const leg = new THREE.Group();

    // Upper leg (pants) - cylinder
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.32, 8), pantsMat);
    upper.position.y = -0.16;
    leg.add(upper);

    // Lower leg (pants) - cylinder
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.28, 8), pantsMat);
    lower.position.y = -0.46;
    leg.add(lower);

    // Sneaker body
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.09, 0.22), shoesMat);
    shoe.position.set(0, -0.64, 0.03);
    leg.add(shoe);

    // Sneaker sole (lighter color)
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.23), soleMat);
    sole.position.set(0, -0.7, 0.03);
    leg.add(sole);

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
    } else if (state === 'fly') {
      // Lean forward horizontally — Superman flying pose
      // Positive X rotation tilts head toward +Z (forward, away from camera)
      this.body.rotation.x = Math.PI / 2.3;
      this.body.position.y = -0.8;
      this.body.position.z = -0.2;
      // Arms stretched alongside body (swept back)
      this.leftArm.rotation.x = -0.3;
      this.leftArm.rotation.z = -0.4;
      this.rightArm.rotation.x = -0.3;
      this.rightArm.rotation.z = 0.4;
      // Legs straight back, together
      this.leftLeg.rotation.x = -0.15;
      this.rightLeg.rotation.x = -0.15;
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
    } else if (this.currentAnim === 'fly') {
      // Gentle hover wobble while flying
      const t = this.animTime * 3;
      this.body.position.y = -0.8 + Math.sin(t) * 0.1;
      this.body.rotation.z = Math.sin(t * 0.7) * 0.05;
    }
  }
}

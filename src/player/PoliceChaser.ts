import * as THREE from 'three';

export class PoliceChaser {
  readonly group: THREE.Group;
  private body: THREE.Group;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private torso: THREE.Mesh;

  private animTime = 0;
  private currentX = 0;
  private targetX = 0;
  private chaseDistance = 10;
  private readonly normalChaseDistance = 9;
  private readonly catchDistance = 1.5;
  private readonly startDistance = 25;
  private state: 'chasing' | 'catching' | 'caught' | 'idle' = 'idle';
  private caughtCallback: (() => void) | null = null;
  private caughtTimer = 0;

  constructor() {
    this.group = new THREE.Group();
    this.body = new THREE.Group();

    // Materials
    const skinMat = new THREE.MeshPhongMaterial({ color: 0xdeb896, flatShading: true });
    const uniformMat = new THREE.MeshPhongMaterial({ color: 0x1a2744, flatShading: true });
    const uniformPantsMat = new THREE.MeshPhongMaterial({ color: 0x152035, flatShading: true });
    const shoeMat = new THREE.MeshPhongMaterial({ color: 0x111111, flatShading: true });
    const badgeMat = new THREE.MeshPhongMaterial({ color: 0xffd700, flatShading: true });
    const capBrimMat = new THREE.MeshPhongMaterial({ color: 0x0d1520, flatShading: true });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const mustacheMat = new THREE.MeshPhongMaterial({ color: 0x3e2723, flatShading: true });
    const batonMat = new THREE.MeshPhongMaterial({ color: 0x2d1a0e, flatShading: true });
    const batonTipMat = new THREE.MeshPhongMaterial({ color: 0x111111, flatShading: true });

    // --- Head ---
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.65;

    // Skull - slightly larger than player
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), skinMat);
    headGroup.add(skull);

    // Police cap - body
    const capBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.22, 0.12, 10),
      uniformMat
    );
    capBody.position.y = 0.12;
    headGroup.add(capBody);

    // Cap top
    const capTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.21, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.4),
      uniformMat
    );
    capTop.position.y = 0.15;
    headGroup.add(capTop);

    // Cap brim
    const capBrim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.24, 0.02, 10),
      capBrimMat
    );
    capBrim.position.set(0, 0.08, 0.1);
    capBrim.rotation.x = -0.2;
    headGroup.add(capBrim);

    // Badge/star on cap
    const badge = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 5, 4),
      badgeMat
    );
    badge.position.set(0, 0.15, 0.2);
    badge.scale.set(1, 1, 0.3);
    headGroup.add(badge);

    // Eyes
    const leftEyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeWhiteMat);
    leftEyeWhite.position.set(-0.07, -0.02, 0.16);
    headGroup.add(leftEyeWhite);

    const rightEyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeWhiteMat);
    rightEyeWhite.position.set(0.07, -0.02, 0.16);
    headGroup.add(rightEyeWhite);

    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), pupilMat);
    leftPupil.position.set(-0.07, -0.02, 0.19);
    headGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), pupilMat);
    rightPupil.position.set(0.07, -0.02, 0.19);
    headGroup.add(rightPupil);

    // Mustache
    const mustache = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.025, 0.03),
      mustacheMat
    );
    mustache.position.set(0, -0.08, 0.17);
    headGroup.add(mustache);

    // --- Torso (uniform shirt) - slightly bulkier ---
    this.torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.22, 0.6, 10),
      uniformMat
    );
    this.torso.position.y = 1.12;

    // Badge on chest
    const chestBadge = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, 0.02),
      badgeMat
    );
    chestBadge.position.set(-0.12, 1.28, 0.2);
    chestBadge.rotation.y = 0.15;

    // Belt
    const beltMat = new THREE.MeshPhongMaterial({ color: 0x1a1a1a, flatShading: true });
    const belt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.23, 0.23, 0.05, 10),
      beltMat
    );
    belt.position.y = 0.82;

    // Belt buckle
    const buckleMat = new THREE.MeshPhongMaterial({ color: 0xc0c0c0, flatShading: true });
    const buckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.04, 0.02),
      buckleMat
    );
    buckle.position.set(0, 0.82, 0.23);

    // --- Arms ---
    this.leftArm = this.createArm(uniformMat, skinMat);
    this.leftArm.position.set(-0.32, 1.3, 0);
    this.rightArm = this.createArm(uniformMat, skinMat);
    this.rightArm.position.set(0.32, 1.3, 0);

    // Baton in right hand
    const baton = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.018, 0.35, 6),
      batonMat
    );
    baton.position.y = -0.48;
    baton.rotation.x = 0.3;
    this.rightArm.add(baton);

    // Baton tip
    const batonTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 6, 6),
      batonTipMat
    );
    batonTip.position.y = -0.65;
    this.rightArm.add(batonTip);

    // --- Legs ---
    this.leftLeg = this.createLeg(uniformPantsMat, shoeMat);
    this.leftLeg.position.set(-0.11, 0.75, 0);
    this.rightLeg = this.createLeg(uniformPantsMat, shoeMat);
    this.rightLeg.position.set(0.11, 0.75, 0);

    this.body.add(
      headGroup, this.torso, chestBadge,
      belt, buckle,
      this.leftArm, this.rightArm,
      this.leftLeg, this.rightLeg
    );
    this.group.add(this.body);
  }

  private createArm(uniformMat: THREE.Material, skinMat: THREE.Material): THREE.Group {
    const arm = new THREE.Group();

    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.28, 8), uniformMat);
    upper.position.y = -0.14;
    arm.add(upper);

    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.24, 8), uniformMat);
    lower.position.y = -0.37;
    arm.add(lower);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), skinMat);
    hand.position.y = -0.5;
    arm.add(hand);

    return arm;
  }

  private createLeg(pantsMat: THREE.Material, shoeMat: THREE.Material): THREE.Group {
    const leg = new THREE.Group();

    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.07, 0.34, 8), pantsMat);
    upper.position.y = -0.17;
    leg.add(upper);

    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.3, 8), pantsMat);
    lower.position.y = -0.47;
    leg.add(lower);

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.22), shoeMat);
    shoe.position.set(0, -0.65, 0.03);
    leg.add(shoe);

    return leg;
  }

  update(deltaTime: number, playerX: number, _playerY: number, playerZ: number, _playerSpeed: number): void {
    this.animTime += deltaTime;

    if (this.state === 'idle') return;

    // Follow player's lane with a slight delay
    this.targetX = playerX;
    const laneFollowSpeed = this.state === 'catching' ? 12 : 5;
    const dx = this.targetX - this.currentX;
    this.currentX += dx * Math.min(1, laneFollowSpeed * deltaTime);

    if (this.state === 'catching') {
      // Rush toward the player — takes ~1.5-2 seconds to close the gap
      const closingSpeed = 4;
      this.chaseDistance -= closingSpeed * deltaTime;
      if (this.chaseDistance < this.catchDistance) this.chaseDistance = this.catchDistance;

      // When close enough, enter caught state
      if (this.chaseDistance <= this.catchDistance + 0.1) {
        this.state = 'caught';
        this.caughtTimer = 0;
        // Stop running animation — grabbing pose
        this.leftArm.rotation.set(-1.2, 0, -0.3);
        this.rightArm.rotation.set(-1.2, 0, 0.3);
        this.leftLeg.rotation.set(0, 0, 0);
        this.rightLeg.rotation.set(0, 0, 0);
      }
    } else if (this.state === 'caught') {
      // Hold the grab pose for 1.5 seconds so player can see it
      this.caughtTimer += deltaTime;
      if (this.caughtTimer >= 1.5 && this.caughtCallback) {
        const cb = this.caughtCallback;
        this.caughtCallback = null;
        cb();
      }
    } else if (this.state === 'chasing') {
      // Gradually close to normal chase distance
      this.chaseDistance += (this.normalChaseDistance - this.chaseDistance) * Math.min(1, 3 * deltaTime);
    }

    // Position behind player
    this.group.position.set(
      this.currentX,
      0,
      playerZ - this.chaseDistance
    );

    // Running animation (only when chasing or catching, not when caught)
    if (this.state !== 'caught') {
      const speed = this.state === 'catching' ? 22 : 16;
      const t = this.animTime * speed;
      const armSwing = Math.sin(t) * 0.8;
      const legSwing = Math.sin(t) * 0.9;

      this.leftArm.rotation.x = armSwing;
      this.rightArm.rotation.x = -armSwing;
      this.leftLeg.rotation.x = -legSwing;
      this.rightLeg.rotation.x = legSwing;

      // Body bob
      this.body.position.y = Math.abs(Math.sin(t)) * 0.05;
      this.torso.rotation.x = Math.sin(t) * 0.04;
    }
  }

  /** Player crashed — police rushes to catch them. Calls onCaught when reached. */
  onPlayerCrash(onCaught: () => void): void {
    this.state = 'catching';
    this.caughtCallback = onCaught;
  }

  /** Player revived — police backs off and resumes normal chase */
  onPlayerRevive(): void {
    this.state = 'chasing';
    this.caughtCallback = null;
    this.chaseDistance = this.normalChaseDistance + 5; // Back off a bit on revive
  }

  /** Start chasing at beginning of run */
  startChase(playerZ: number): void {
    this.state = 'chasing';
    this.chaseDistance = this.startDistance;
    this.group.position.set(0, 0, playerZ - this.startDistance);
  }

  reset(playerZ: number): void {
    this.state = 'idle';
    this.caughtCallback = null;
    this.caughtTimer = 0;
    this.chaseDistance = this.startDistance;
    this.currentX = 0;
    this.targetX = 0;
    this.animTime = 0;
    this.group.position.set(0, 0, playerZ - this.startDistance);
    this.body.position.y = 0;
    this.leftArm.rotation.set(0, 0, 0);
    this.rightArm.rotation.set(0, 0, 0);
    this.leftLeg.rotation.set(0, 0, 0);
    this.rightLeg.rotation.set(0, 0, 0);
  }
}

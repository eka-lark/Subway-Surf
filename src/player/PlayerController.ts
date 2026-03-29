import { GAME, PHYSICS, PLAYER } from '@core/Constants';
import { moveTowards } from '@utils/MathUtils';
import { PlayerModel } from './PlayerModel';
import { createPlayerAABB, type AABB } from './PlayerCollision';
import { eventBus } from '@core/EventBus';

export type PlayerState = 'grounded' | 'jumping' | 'sliding' | 'dead';

export class PlayerController {
  readonly model: PlayerModel;
  private targetLane = 0;
  private currentX = 0;
  private positionY = 0;
  private positionZ = 0;
  private verticalVelocity = 0;
  private state: PlayerState = 'grounded';
  private slideTimer = 0;
  private immune = false;
  private immuneTimer = 0;
  private _flying = false;
  private _flightTargetY = 0;
  private _wallHitCount = 0;
  private _wallStumbleTimer = 0;

  constructor() { this.model = new PlayerModel(); }

  get lane(): number { return this.targetLane; }
  get x(): number { return this.currentX; }
  get y(): number { return this.positionY; }
  get z(): number { return this.positionZ; }
  get isImmune(): boolean { return this.immune; }
  get isDead(): boolean { return this.state === 'dead'; }
  get isFlying(): boolean { return this._flying; }
  get currentState(): PlayerState { return this.state; }

  getAABB(): AABB {
    const height = this.state === 'sliding' ? PLAYER.SLIDING_HEIGHT : PLAYER.STANDING_HEIGHT;
    return createPlayerAABB(this.currentX, this.positionY, this.positionZ, PLAYER.STANDING_WIDTH, height, PLAYER.STANDING_DEPTH);
  }

  moveLeft(): void {
    if (this.state === 'dead') return;
    if (this.targetLane > -1) {
      this.targetLane--;
      eventBus.emit('player:laneSwitch', this.targetLane);
    } else {
      this._wallHitCount++;
      if (this._wallHitCount >= 3) {
        eventBus.emit('player:wallCrash', null);
      } else {
        this._wallStumbleTimer = 0.5;
        eventBus.emit('player:wallStumble', null);
      }
    }
  }

  moveRight(): void {
    if (this.state === 'dead') return;
    if (this.targetLane < 1) {
      this.targetLane++;
      eventBus.emit('player:laneSwitch', this.targetLane);
    } else {
      this._wallHitCount++;
      if (this._wallHitCount >= 3) {
        eventBus.emit('player:wallCrash', null);
      } else {
        this._wallStumbleTimer = 0.5;
        eventBus.emit('player:wallStumble', null);
      }
    }
  }

  get isStumbling(): boolean { return this._wallStumbleTimer > 0; }
  get wallHitCount(): number { return this._wallHitCount; }

  jump(): void {
    if (this.state !== 'grounded' && this.state !== 'sliding') return;
    if (this.state === 'sliding') { this.slideTimer = 0; this.state = 'grounded'; this.model.setAnimation('run'); }
    this.verticalVelocity = PHYSICS.JUMP_FORCE;
    this.state = 'jumping';
    this.model.setAnimation('jump');
    eventBus.emit('player:jump', null);
  }

  slide(): void {
    if (this.state === 'jumping') { this.verticalVelocity = -PHYSICS.JUMP_FORCE; return; }
    if (this.state !== 'grounded') return;
    this.state = 'sliding';
    this.slideTimer = PHYSICS.SLIDE_DURATION;
    this.model.setAnimation('slide');
    eventBus.emit('player:slide', null);
  }

  hit(): void {
    if (this.immune) return;
    this.state = 'dead';
    this.model.setAnimation('crash');
    eventBus.emit('player:crash', null);
  }

  revive(): void {
    this.state = 'grounded';
    this.model.setAnimation('run');
    this.setImmune(2);
    this.verticalVelocity = 0;
    this.positionY = PHYSICS.GROUND_Y;
  }

  setImmune(duration: number): void { this.immune = true; this.immuneTimer = duration; }

  setFlying(flying: boolean, targetY: number): void {
    this._flying = flying;
    this._flightTargetY = targetY;
    if (flying) {
      this.state = 'jumping';
      this.verticalVelocity = 0;
      this.model.setAnimation('fly');
    } else {
      this.model.setAnimation('run');
    }
  }

  /** Returns the effective speed multiplier (reduced during stumble) */
  getSpeedMultiplier(): number {
    return this._wallStumbleTimer > 0 ? 0.4 : 1.0;
  }

  update(deltaTime: number, speed: number): void {
    if (this.state === 'dead') return;

    // Stumble slowdown
    if (this._wallStumbleTimer > 0) {
      this._wallStumbleTimer -= deltaTime;
      if (this._wallStumbleTimer <= 0) this._wallStumbleTimer = 0;
    }

    const effectiveSpeed = speed * this.getSpeedMultiplier();
    this.positionZ += effectiveSpeed * deltaTime;
    const targetX = this.targetLane * GAME.LANE_WIDTH;
    this.currentX = moveTowards(this.currentX, targetX, PHYSICS.LANE_SWITCH_SPEED * deltaTime);

    if (this._flying) {
      // Smoothly fly to target height
      const flySpeed = 8;
      this.positionY = moveTowards(this.positionY, this._flightTargetY, flySpeed * deltaTime);
      this.verticalVelocity = 0;
    } else if (this.state === 'jumping') {
      this.verticalVelocity += PHYSICS.GRAVITY * deltaTime;
      this.positionY += this.verticalVelocity * deltaTime;
      if (this.positionY <= PHYSICS.GROUND_Y) {
        this.positionY = PHYSICS.GROUND_Y; this.verticalVelocity = 0;
        this.state = 'grounded'; this.model.setAnimation('run');
      }
    }

    if (this.state === 'sliding') {
      this.slideTimer -= deltaTime;
      if (this.slideTimer <= 0) { this.state = 'grounded'; this.model.setAnimation('run'); }
    }

    if (this.immune) {
      this.immuneTimer -= deltaTime;
      if (this.immuneTimer <= 0) { this.immune = false; this.immuneTimer = 0; }
      this.model.group.visible = Math.floor(this.immuneTimer * 10) % 2 === 0;
    } else {
      this.model.group.visible = true;
    }

    this.model.group.position.set(this.currentX, this.positionY, this.positionZ);
    this.model.update(deltaTime);
  }

  reset(): void {
    this.targetLane = 0; this.currentX = 0; this.positionY = PHYSICS.GROUND_Y; this.positionZ = 0;
    this.verticalVelocity = 0; this.state = 'grounded'; this.slideTimer = 0;
    this.immune = false; this.immuneTimer = 0;
    this._flying = false; this._flightTargetY = 0;
    this._wallHitCount = 0; this._wallStumbleTimer = 0;
    this.model.setAnimation('run');
    this.model.group.position.set(0, 0, 0);
    this.model.group.visible = true;
  }
}

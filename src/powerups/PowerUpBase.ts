import { eventBus } from '@core/EventBus';

export abstract class PowerUpBase {
  readonly id: string;
  protected duration: number;
  protected timer = 0;
  protected _active = false;

  constructor(id: string, duration: number) { this.id = id; this.duration = duration; }

  get active(): boolean { return this._active; }
  get timeRemaining(): number { return Math.max(0, this.duration - this.timer); }
  get progress(): number { return this._active ? 1 - (this.timer / this.duration) : 0; }

  activate(): void { this._active = true; this.timer = 0; this.onActivate(); eventBus.emit('powerup:activated', { id: this.id, duration: this.duration }); }
  deactivate(): void { this._active = false; this.timer = 0; this.onDeactivate(); eventBus.emit('powerup:deactivated', { id: this.id }); }

  update(deltaTime: number): void {
    if (!this._active) return;
    this.timer += deltaTime;
    this.onUpdate(deltaTime);
    if (this.timer >= this.duration) this.deactivate();
  }

  protected abstract onActivate(): void;
  protected abstract onDeactivate(): void;
  protected abstract onUpdate(deltaTime: number): void;
}

import { PowerUpBase } from './PowerUpBase';

const DURATIONS = [6, 8, 10, 13, 16];
const RADII = [3, 4, 5, 6, 8];

export class Magnet extends PowerUpBase {
  private _radius: number;

  constructor(level: number = 1) {
    super('magnet', DURATIONS[Math.min(level - 1, DURATIONS.length - 1)]);
    this._radius = RADII[Math.min(level - 1, RADII.length - 1)];
  }

  get radius(): number { return this._active ? this._radius : 0; }

  protected onActivate(): void {}
  protected onDeactivate(): void {}
  protected onUpdate(_deltaTime: number): void {}
}

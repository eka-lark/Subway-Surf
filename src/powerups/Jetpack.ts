import { PowerUpBase } from './PowerUpBase';

const DURATIONS = [6, 8, 10, 13, 16];
const FLIGHT_HEIGHT = 15;

export class Jetpack extends PowerUpBase {
  private _flightHeight = 0;

  constructor(level: number = 1) {
    super('jetpack', DURATIONS[Math.min(level - 1, DURATIONS.length - 1)]);
  }

  get flightHeight(): number { return this._flightHeight; }
  get bypassObstacles(): boolean { return this._active; }

  protected onActivate(): void { this._flightHeight = FLIGHT_HEIGHT; }
  protected onDeactivate(): void { this._flightHeight = 0; }
  protected onUpdate(_deltaTime: number): void {}
}

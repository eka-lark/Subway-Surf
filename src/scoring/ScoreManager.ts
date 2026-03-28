import { ECONOMY } from '@core/Constants';
import { SaveManager } from '@persistence/SaveManager';
import { eventBus } from '@core/EventBus';

export class ScoreManager {
  private _score = 0;
  private _distance = 0;
  private _coinsCollected = 0;
  private _activeMultiplier = 1;
  private _highScore: number;

  constructor() {
    const data = SaveManager.load();
    this._highScore = data.scoring.highScore;
  }

  get current(): number { return Math.floor(this._score); }
  get distance(): number { return this._distance; }
  get coinsCollected(): number { return this._coinsCollected; }
  get highScore(): number { return this._highScore; }
  get isNewHighScore(): boolean { return this._score > this._highScore; }

  setActiveMultiplier(mult: number): void { this._activeMultiplier = mult; }

  addDistance(distanceDelta: number, baseMultiplier: number): void {
    this._distance += distanceDelta;
    this._score += distanceDelta * baseMultiplier * this._activeMultiplier;
    eventBus.emit('score:changed', { score: this.current, distance: this._distance });
  }

  addCoinScore(baseMultiplier: number): void {
    this._coinsCollected++;
    this._score += ECONOMY.COIN_SCORE_VALUE * baseMultiplier * this._activeMultiplier;
    eventBus.emit('score:changed', { score: this.current, distance: this._distance });
  }

  finalizeRun(): void {
    if (this._score > this._highScore) {
      this._highScore = Math.floor(this._score);
      const data = SaveManager.load();
      data.scoring.highScore = this._highScore;
      SaveManager.save(data);
    }
  }

  reset(): void {
    this._score = 0; this._distance = 0; this._coinsCollected = 0; this._activeMultiplier = 1;
  }
}

import { ECONOMY } from '@core/Constants';
import { SaveManager } from '@persistence/SaveManager';

export class MultiplierTracker {
  private _level: number;

  constructor() {
    const data = SaveManager.load();
    this._level = data.scoring.multiplierLevel;
  }

  get level(): number { return this._level; }

  advance(): void {
    if (this._level < ECONOMY.MAX_MULTIPLIER) this._level++;
  }

  persist(): void {
    const data = SaveManager.load();
    data.scoring.multiplierLevel = this._level;
    SaveManager.save(data);
  }
}

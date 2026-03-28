import { SaveManager } from '@persistence/SaveManager';
import { eventBus } from '@core/EventBus';

export class WalletManager {
  private _coins: number;
  private _keys: number;

  constructor() {
    const data = SaveManager.load();
    this._coins = data.wallet.coins;
    this._keys = data.wallet.keys;
  }

  get coins(): number { return this._coins; }
  get keys(): number { return this._keys; }

  addCoins(amount: number): void {
    this._coins += amount;
    eventBus.emit('wallet:changed', { coins: this._coins, keys: this._keys });
  }

  spendCoins(amount: number): boolean {
    if (this._coins < amount) return false;
    this._coins -= amount;
    eventBus.emit('wallet:changed', { coins: this._coins, keys: this._keys });
    return true;
  }

  addKeys(amount: number): void {
    this._keys += amount;
    eventBus.emit('wallet:changed', { coins: this._coins, keys: this._keys });
  }

  spendKeys(amount: number): boolean {
    if (this._keys < amount) return false;
    this._keys -= amount;
    eventBus.emit('wallet:changed', { coins: this._coins, keys: this._keys });
    return true;
  }

  canAfford(currency: 'coins' | 'keys', amount: number): boolean {
    return currency === 'coins' ? this._coins >= amount : this._keys >= amount;
  }

  persist(): void {
    const data = SaveManager.load();
    data.wallet.coins = this._coins;
    data.wallet.keys = this._keys;
    SaveManager.save(data);
  }
}

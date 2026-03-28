import { WalletManager } from './WalletManager';
import { CharacterManager } from '@characters/CharacterManager';
import { CHARACTERS, type CharacterConfig } from '@characters/CharacterData';
import { eventBus } from '@core/EventBus';

export interface ShopItem {
  config: CharacterConfig; owned: boolean; equipped: boolean; canAfford: boolean;
}

export class ShopManager {
  private wallet: WalletManager;
  private characters: CharacterManager;

  constructor(wallet: WalletManager, characters: CharacterManager) {
    this.wallet = wallet;
    this.characters = characters;
  }

  getShopItems(): ShopItem[] {
    return CHARACTERS.map(config => ({
      config,
      owned: this.characters.isUnlocked(config.id),
      equipped: this.characters.equippedId === config.id,
      canAfford: config.unlockCurrency === 'free' || this.wallet.canAfford(config.unlockCurrency as 'coins' | 'keys', config.unlockCost),
    }));
  }

  purchase(characterId: string): boolean {
    const config = CHARACTERS.find(c => c.id === characterId);
    if (!config) return false;
    if (this.characters.isUnlocked(characterId)) return false;
    if (config.unlockCurrency === 'free') { this.characters.unlock(characterId); return true; }

    const currency = config.unlockCurrency as 'coins' | 'keys';
    const spent = currency === 'coins' ? this.wallet.spendCoins(config.unlockCost) : this.wallet.spendKeys(config.unlockCost);
    if (!spent) return false;

    this.characters.unlock(characterId);
    this.wallet.persist();
    this.characters.persist();
    eventBus.emit('shop:purchased', { id: characterId });
    return true;
  }

  equipCharacter(characterId: string): void {
    this.characters.equip(characterId);
    this.characters.persist();
  }
}

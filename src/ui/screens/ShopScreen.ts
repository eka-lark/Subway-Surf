import { bindButton } from '@ui/components/Button';
import { updateCurrencyDisplay } from '@ui/components/CurrencyDisplay';
import type { ShopItem } from '@economy/ShopManager';
import { formatNumber } from '@utils/MathUtils';

export class ShopScreen {
  private onPurchase: ((id: string) => void) | null = null;
  private onEquip: ((id: string) => void) | null = null;

  init(callbacks: { onClose: () => void; onPurchase: (id: string) => void; onEquip: (id: string) => void }): void {
    bindButton('btn-shop-close', callbacks.onClose);
    this.onPurchase = callbacks.onPurchase;
    this.onEquip = callbacks.onEquip;
  }

  update(items: ShopItem[], coins: number, keys: number): void {
    updateCurrencyDisplay('shop-coins', '\u{1FA99}', coins);
    updateCurrencyDisplay('shop-keys', '\u{1F511}', keys);
    const grid = document.getElementById('shop-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (const item of items) {
      const div = document.createElement('div');
      div.className = 'shop-item' + (item.equipped ? ' equipped' : item.owned ? ' owned' : '');
      const costText = item.owned ? (item.equipped ? 'Equipped' : 'Owned') :
        item.config.unlockCurrency === 'free' ? 'Free' :
        `${item.config.unlockCurrency === 'coins' ? '\u{1FA99}' : '\u{1F511}'} ${formatNumber(item.config.unlockCost)}`;
      div.innerHTML = `<div class="shop-item-icon" style="color:#${item.config.bodyColor.toString(16).padStart(6, '0')}">\u{1F3C3}</div><div class="shop-item-name">${item.config.name}</div><div class="shop-item-cost">${costText}</div>`;
      div.addEventListener('click', () => {
        if (item.owned && !item.equipped) this.onEquip?.(item.config.id);
        else if (!item.owned && item.canAfford) this.onPurchase?.(item.config.id);
      });
      grid.appendChild(div);
    }
  }
}

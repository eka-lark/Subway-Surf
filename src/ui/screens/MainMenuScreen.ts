import { bindButton } from '@ui/components/Button';
import { updateCurrencyDisplay } from '@ui/components/CurrencyDisplay';
import { formatNumber } from '@utils/MathUtils';

export class MainMenuScreen {
  init(callbacks: { onPlay: () => void; onShop: () => void; onMissions: () => void }): void {
    bindButton('btn-play', callbacks.onPlay);
    bindButton('btn-shop', callbacks.onShop);
    bindButton('btn-missions', callbacks.onMissions);
  }

  update(data: { coins: number; keys: number; highScore: number }): void {
    updateCurrencyDisplay('menu-coins', '\u{1FA99}', data.coins);
    updateCurrencyDisplay('menu-keys', '\u{1F511}', data.keys);
    const el = document.getElementById('menu-high-score');
    if (el) el.textContent = `Best: ${formatNumber(data.highScore)}`;
  }
}

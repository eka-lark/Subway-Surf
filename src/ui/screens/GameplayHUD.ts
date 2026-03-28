import { formatNumber } from '@utils/MathUtils';

export class GameplayHUD {
  init(callbacks: { onPause: () => void }): void {
    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) pauseBtn.addEventListener('click', callbacks.onPause);
  }

  updateScore(score: number): void {
    const el = document.getElementById('hud-score');
    if (el) el.textContent = formatNumber(score);
  }

  updateMultiplier(level: number): void {
    const el = document.getElementById('hud-multiplier');
    if (el) el.textContent = `x${level}`;
  }

  updateCoins(coins: number): void {
    const el = document.getElementById('hud-coins');
    if (el) el.textContent = `\u{1FA99} ${formatNumber(coins)}`;
  }

  showPowerUp(name: string, progress: number): void {
    const container = document.getElementById('hud-powerup');
    const nameEl = document.getElementById('hud-powerup-name');
    const barEl = document.getElementById('hud-powerup-bar');
    if (container) container.style.display = 'block';
    if (nameEl) nameEl.textContent = name;
    if (barEl) barEl.style.width = `${progress * 100}%`;
  }

  hidePowerUp(): void {
    const container = document.getElementById('hud-powerup');
    if (container) container.style.display = 'none';
  }
}

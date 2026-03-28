import { bindButton } from '@ui/components/Button';
import { formatNumber, formatDistance } from '@utils/MathUtils';
import type { ActiveMission } from '@persistence/SaveData';

export class GameOverScreen {
  init(callbacks: { onMenu: () => void; onRestart: () => void }): void {
    bindButton('btn-go-menu', callbacks.onMenu);
    bindButton('btn-go-restart', callbacks.onRestart);
  }

  update(data: { score: number; highScore: number; isNewHighScore: boolean; coins: number; distance: number; missions: ActiveMission[] }): void {
    const scoreEl = document.getElementById('go-score');
    const bestEl = document.getElementById('go-best');
    const newBestEl = document.getElementById('go-new-best');
    const coinsEl = document.getElementById('go-coins');
    const distEl = document.getElementById('go-distance');

    if (scoreEl) scoreEl.textContent = formatNumber(data.score);
    if (bestEl) bestEl.textContent = formatNumber(data.highScore);
    if (newBestEl) newBestEl.style.display = data.isNewHighScore ? 'inline' : 'none';
    if (coinsEl) coinsEl.textContent = formatNumber(data.coins);
    if (distEl) distEl.textContent = formatDistance(data.distance);

    const missionsEl = document.getElementById('go-missions');
    if (missionsEl) {
      missionsEl.innerHTML = '<h3>Mission Progress</h3>';
      for (const m of data.missions) {
        const pct = Math.min(100, (m.progress / m.target) * 100);
        const completed = m.progress >= m.target;
        missionsEl.innerHTML += `<div class="mission-item"><span>${m.description}</span><div class="mission-bar"><div class="mission-bar-fill" style="width:${pct}%"></div></div><span>${completed ? '\u2705' : `${m.progress}/${m.target}`}</span></div>`;
      }
    }
  }
}

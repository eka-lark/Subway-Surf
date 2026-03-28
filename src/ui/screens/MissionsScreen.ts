import { bindButton } from '@ui/components/Button';
import type { ActiveMission } from '@persistence/SaveData';

export class MissionsScreen {
  init(callbacks: { onClose: () => void }): void { bindButton('btn-missions-close', callbacks.onClose); }

  update(missions: ActiveMission[]): void {
    const list = document.getElementById('missions-list');
    if (!list) return;
    list.innerHTML = '<div class="missions-title">Missions</div>';
    for (const m of missions) {
      const pct = Math.min(100, (m.progress / m.target) * 100);
      const completed = m.progress >= m.target;
      list.innerHTML += `<div class="mission-card${completed ? ' completed' : ''}"><div class="mission-card-desc">${m.description}</div><div class="mission-card-progress"><span>${m.progress}</span><div class="mission-card-bar"><div class="mission-card-bar-fill" style="width:${pct}%"></div></div><span>${m.target}</span></div><div class="mission-card-reward">${m.reward.type === 'coins' ? '\u{1FA99}' : '\u{1F511}'} ${m.reward.amount}</div></div>`;
    }
  }
}

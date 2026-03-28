import { ECONOMY } from '@core/Constants';
import { SaveManager } from '@persistence/SaveManager';
import type { ActiveMission } from '@persistence/SaveData';
import { MISSION_TEMPLATES, type MissionType } from './MissionData';
import { shuffleArray } from '@utils/RandomUtils';
import { lerp } from '@utils/MathUtils';

export class MissionManager {
  private missions: ActiveMission[] = [];
  private missionSetIndex: number;

  constructor() {
    const data = SaveManager.load();
    this.missions = data.missions.active;
    this.missionSetIndex = data.scoring.missionSetIndex;
  }

  get activeMissions(): ActiveMission[] { return this.missions; }

  ensureMissions(): void { if (this.missions.length === 0) this.generateMissionSet(); }

  trackProgress(type: MissionType, amount: number): void {
    for (const m of this.missions) {
      if (m.type === type && m.progress < m.target) m.progress = Math.min(m.target, m.progress + amount);
    }
  }

  setProgress(type: MissionType, value: number): void {
    for (const m of this.missions) { if (m.type === type) m.progress = Math.min(m.target, value); }
  }

  getCompletedMissions(): ActiveMission[] { return this.missions.filter(m => m.progress >= m.target); }

  isSetComplete(): boolean { return this.missions.length > 0 && this.missions.every(m => m.progress >= m.target); }

  advanceSet(): { newMultiplierLevel: number; rewards: ActiveMission['reward'][] } {
    const rewards = this.missions.map(m => m.reward);
    this.missionSetIndex++;
    this.missions = [];
    this.generateMissionSet();
    return { newMultiplierLevel: this.missionSetIndex + 1, rewards };
  }

  private generateMissionSet(): void {
    const shuffled = shuffleArray([...MISSION_TEMPLATES]);
    const picked = shuffled.slice(0, ECONOMY.MISSIONS_PER_SET);
    const difficulty = Math.min(this.missionSetIndex / 10, 1);
    this.missions = picked.map((template, i) => {
      const [minT, maxT] = template.targetRange;
      const target = Math.round(lerp(minT, maxT, difficulty));
      return {
        id: `mission_${this.missionSetIndex}_${i}`,
        type: template.type,
        description: template.descriptionFn(target),
        target,
        progress: 0,
        reward: { type: template.reward.type, amount: Math.round(template.reward.baseAmount * (1 + difficulty)) },
      };
    });
  }

  persist(): void {
    const data = SaveManager.load();
    data.missions.active = this.missions;
    data.scoring.missionSetIndex = this.missionSetIndex;
    SaveManager.save(data);
  }
}

import { SaveManager } from '@persistence/SaveManager';
import { ACHIEVEMENTS, type AchievementConfig } from './MissionData';
import { eventBus } from '@core/EventBus';

export class AchievementTracker {
  private completed: Set<string>;

  constructor() {
    const data = SaveManager.load();
    this.completed = new Set(data.achievements);
  }

  check(stats: {
    totalRuns: number; totalCoinsCollected: number; totalDistanceRun: number;
    highScore: number; singleRunDistance: number;
  }): AchievementConfig[] {
    const newAchievements: AchievementConfig[] = [];
    for (const ach of ACHIEVEMENTS) {
      if (this.completed.has(ach.id)) continue;
      const value = (stats as Record<string, number>)[ach.condition.type] ?? 0;
      if (value >= ach.condition.target) {
        this.completed.add(ach.id);
        newAchievements.push(ach);
        eventBus.emit('achievement:unlocked', { id: ach.id, name: ach.name });
      }
    }
    return newAchievements;
  }

  persist(): void {
    const data = SaveManager.load();
    data.achievements = [...this.completed];
    SaveManager.save(data);
  }
}

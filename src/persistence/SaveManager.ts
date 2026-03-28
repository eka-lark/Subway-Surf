import type { SaveData } from './SaveData';

export class SaveManager {
  private static readonly SAVE_KEY = 'subway_surf_save';
  private static readonly CURRENT_VERSION = 1;

  static save(data: SaveData): void {
    data.version = SaveManager.CURRENT_VERSION;
    try {
      localStorage.setItem(SaveManager.SAVE_KEY, JSON.stringify(data));
    } catch { /* localStorage full or unavailable */ }
  }

  static load(): SaveData {
    try {
      const raw = localStorage.getItem(SaveManager.SAVE_KEY);
      if (!raw) return SaveManager.defaultData();
      const data = JSON.parse(raw) as SaveData;
      return SaveManager.migrate(data);
    } catch {
      return SaveManager.defaultData();
    }
  }

  static reset(): void {
    localStorage.removeItem(SaveManager.SAVE_KEY);
  }

  static defaultData(): SaveData {
    return {
      version: SaveManager.CURRENT_VERSION,
      wallet: { coins: 0, keys: 0 },
      characters: { unlocked: ['default'], equipped: 'default' },
      skins: { unlocked: {}, equipped: {} },
      powerUpLevels: { jetpack: 1, magnet: 1, superSneakers: 1, multiplier: 1, hoverboard: 1 },
      hoverboardCount: 3,
      scoring: { highScore: 0, multiplierLevel: 1, missionSetIndex: 0 },
      missions: { active: [], dailyLastReset: '' },
      achievements: [],
      statistics: { totalCoinsCollected: 0, totalDistanceRun: 0, totalRuns: 0, totalTimePlayed: 0, totalJumps: 0, totalSlides: 0 },
      settings: { musicVolume: 0.7, sfxVolume: 1.0, theme: 'default_city' },
    };
  }

  static migrate(data: SaveData): SaveData { return data; }
}

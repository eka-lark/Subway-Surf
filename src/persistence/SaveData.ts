export interface ActiveMission {
  id: string;
  type: string;
  description: string;
  target: number;
  progress: number;
  reward: { type: 'coins' | 'keys'; amount: number };
}

export interface SaveData {
  version: number;
  wallet: { coins: number; keys: number };
  characters: { unlocked: string[]; equipped: string };
  skins: { unlocked: Record<string, string[]>; equipped: Record<string, string> };
  powerUpLevels: { jetpack: number; magnet: number; superSneakers: number; multiplier: number; hoverboard: number };
  hoverboardCount: number;
  scoring: { highScore: number; multiplierLevel: number; missionSetIndex: number };
  missions: { active: ActiveMission[]; dailyLastReset: string };
  achievements: string[];
  statistics: {
    totalCoinsCollected: number; totalDistanceRun: number; totalRuns: number;
    totalTimePlayed: number; totalJumps: number; totalSlides: number;
  };
  settings: { musicVolume: number; sfxVolume: number; theme: string };
}

export type MissionType = 'collect_coins' | 'run_distance' | 'jump_count' | 'use_powerup' | 'score_points' | 'dodge_obstacles';

export interface MissionTemplate {
  type: MissionType;
  descriptionFn: (target: number) => string;
  targetRange: [number, number];
  reward: { type: 'coins' | 'keys'; baseAmount: number };
}

export const MISSION_TEMPLATES: MissionTemplate[] = [
  { type: 'collect_coins', descriptionFn: (t) => `Collect ${t} coins in a single run`, targetRange: [100, 800], reward: { type: 'coins', baseAmount: 200 } },
  { type: 'run_distance', descriptionFn: (t) => `Run ${t} meters`, targetRange: [500, 5000], reward: { type: 'coins', baseAmount: 300 } },
  { type: 'jump_count', descriptionFn: (t) => `Jump ${t} times in a single run`, targetRange: [20, 100], reward: { type: 'coins', baseAmount: 150 } },
  { type: 'use_powerup', descriptionFn: (t) => `Use power-ups ${t} times`, targetRange: [2, 8], reward: { type: 'coins', baseAmount: 250 } },
  { type: 'score_points', descriptionFn: (t) => `Score ${t.toLocaleString()} points`, targetRange: [50000, 1000000], reward: { type: 'keys', baseAmount: 1 } },
  { type: 'dodge_obstacles', descriptionFn: (t) => `Dodge ${t} obstacles in a single run`, targetRange: [30, 150], reward: { type: 'coins', baseAmount: 500 } },
];

export interface AchievementConfig {
  id: string; name: string; description: string;
  condition: { type: string; target: number };
  reward: { type: 'coins' | 'keys'; amount: number };
}

export const ACHIEVEMENTS: AchievementConfig[] = [
  { id: 'first_steps', name: 'First Steps', description: 'Complete your first run', condition: { type: 'totalRuns', target: 1 }, reward: { type: 'coins', amount: 100 } },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Run 5,000m in one run', condition: { type: 'singleRunDistance', target: 5000 }, reward: { type: 'coins', amount: 1000 } },
  { id: 'coin_collector', name: 'Coin Collector', description: 'Collect 100,000 total coins', condition: { type: 'totalCoinsCollected', target: 100000 }, reward: { type: 'keys', amount: 2 } },
  { id: 'marathon_runner', name: 'Marathon Runner', description: 'Run 1,000,000 total meters', condition: { type: 'totalDistanceRun', target: 1000000 }, reward: { type: 'keys', amount: 10 } },
  { id: 'score_master', name: 'Score Master', description: 'Score 5,000,000 points', condition: { type: 'highScore', target: 5000000 }, reward: { type: 'coins', amount: 5000 } },
  { id: 'untouchable', name: 'Untouchable', description: 'Run 1,000m without hitting any obstacle', condition: { type: 'singleRunDistance', target: 1000 }, reward: { type: 'keys', amount: 2 } },
];

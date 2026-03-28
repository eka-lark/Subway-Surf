import { randomChoice, randomInt } from '@utils/RandomUtils';

export interface CoinPlacement { lane: number; y: number; zOffset: number; }

export function generateCoinPattern(patternType?: string): CoinPlacement[] {
  const type = patternType ?? randomChoice(['line', 'line', 'arc', 'jump_arc', 'cluster']);
  switch (type) {
    case 'line': return lineCoinPattern();
    case 'arc': return arcCoinPattern();
    case 'jump_arc': return jumpArcPattern();
    case 'cluster': return clusterPattern();
    default: return lineCoinPattern();
  }
}

function lineCoinPattern(): CoinPlacement[] {
  const lane = randomChoice([-1, 0, 1]);
  const count = randomInt(5, 8);
  const placements: CoinPlacement[] = [];
  for (let i = 0; i < count; i++) placements.push({ lane, y: 1.0, zOffset: i * 2.0 });
  return placements;
}

function arcCoinPattern(): CoinPlacement[] {
  const startLane = randomChoice([-1, 0]);
  const count = randomInt(6, 8);
  const placements: CoinPlacement[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const lane = Math.round(startLane + t * (startLane === -1 ? 2 : -2));
    placements.push({ lane: Math.max(-1, Math.min(1, lane)), y: 1.0, zOffset: i * 2.0 });
  }
  return placements;
}

function jumpArcPattern(): CoinPlacement[] {
  const lane = randomChoice([-1, 0, 1]);
  const count = randomInt(5, 7);
  const placements: CoinPlacement[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const y = 1.0 + Math.sin(t * Math.PI) * 3.0;
    placements.push({ lane, y, zOffset: i * 2.0 });
  }
  return placements;
}

function clusterPattern(): CoinPlacement[] {
  const centerLane = randomChoice([-1, 0, 1]);
  const placements: CoinPlacement[] = [];
  const lanes = [centerLane];
  if (centerLane > -1) lanes.push(centerLane - 1);
  if (centerLane < 1) lanes.push(centerLane + 1);
  for (const lane of lanes) {
    for (let z = 0; z < 3; z++) placements.push({ lane, y: 1.0, zOffset: z * 2.0 });
  }
  return placements;
}

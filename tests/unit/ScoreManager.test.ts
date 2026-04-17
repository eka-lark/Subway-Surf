import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScoreManager } from '../../src/scoring/ScoreManager';

const mockStorage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
  clear: vi.fn(() => { for (const k in mockStorage) delete mockStorage[k]; }),
});

describe('ScoreManager', () => {
  let score: ScoreManager;
  beforeEach(() => { for (const k in mockStorage) delete mockStorage[k]; score = new ScoreManager(); });

  it('starts at 0', () => { expect(score.current).toBe(0); expect(score.distance).toBe(0); });
  it('addDistance() increases score', () => { score.addDistance(10, 1); expect(score.current).toBe(10); expect(score.distance).toBe(10); });
  it('addCoinScore() adds coin score value', () => { score.addCoinScore(1); expect(score.current).toBe(100); });
  it('activeMultiplier stacks with base', () => { score.setActiveMultiplier(2); score.addDistance(10, 1); expect(score.current).toBe(20); });
  it('reset() clears run scores', () => { score.addDistance(100, 1); score.addCoinScore(5); score.reset(); expect(score.current).toBe(0); expect(score.distance).toBe(0); });
  it('tracks high score', () => { score.addDistance(1000, 1); score.finalizeRun(); expect(score.highScore).toBe(1000); });
  it('isNewHighScore detects new records', () => { score.addDistance(500, 1); score.finalizeRun(); score.reset(); score.addDistance(600, 1); expect(score.isNewHighScore).toBe(true); });
  it('coinsCollected tracks per-run coins', () => { score.addCoinScore(1); score.addCoinScore(1); score.addCoinScore(1); expect(score.coinsCollected).toBe(3); });
});

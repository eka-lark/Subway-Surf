import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MissionManager } from '../../src/missions/MissionManager';

const mockStorage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
  clear: vi.fn(() => { for (const k in mockStorage) delete mockStorage[k]; }),
});

describe('MissionManager', () => {
  let mgr: MissionManager;
  beforeEach(() => { for (const k in mockStorage) delete mockStorage[k]; mgr = new MissionManager(); });

  it('generates initial mission set with 3 missions', () => {
    mgr.ensureMissions();
    expect(mgr.activeMissions.length).toBe(3);
  });

  it('tracks progress on a mission', () => {
    mgr.ensureMissions();
    const mission = mgr.activeMissions[0];
    mgr.trackProgress(mission.type as any, 10);
    const updated = mgr.activeMissions.find(m => m.id === mission.id)!;
    expect(updated.progress).toBe(10);
  });

  it('marks mission complete when target reached', () => {
    mgr.ensureMissions();
    const mission = mgr.activeMissions[0];
    mgr.trackProgress(mission.type as any, mission.target);
    const completed = mgr.getCompletedMissions();
    expect(completed.length).toBeGreaterThanOrEqual(1);
  });

  it('does not exceed target progress', () => {
    mgr.ensureMissions();
    const mission = mgr.activeMissions[0];
    mgr.trackProgress(mission.type as any, mission.target + 100);
    const updated = mgr.activeMissions.find(m => m.id === mission.id)!;
    expect(updated.progress).toBe(mission.target);
  });
});

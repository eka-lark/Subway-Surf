import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveManager } from '@persistence/SaveManager';

const mockStorage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
  clear: vi.fn(() => { for (const k in mockStorage) delete mockStorage[k]; }),
});

describe('SaveManager', () => {
  beforeEach(() => { for (const k in mockStorage) delete mockStorage[k]; vi.clearAllMocks(); });

  it('returns default data when nothing is saved', () => {
    const data = SaveManager.load();
    expect(data.version).toBe(1);
    expect(data.wallet.coins).toBe(0);
    expect(data.characters.equipped).toBe('default');
  });

  it('save/load round-trip preserves data', () => {
    const data = SaveManager.defaultData();
    data.wallet.coins = 999;
    data.scoring.highScore = 50000;
    SaveManager.save(data);
    const loaded = SaveManager.load();
    expect(loaded.wallet.coins).toBe(999);
    expect(loaded.scoring.highScore).toBe(50000);
  });

  it('sets version on save', () => {
    const data = SaveManager.defaultData();
    data.version = 0;
    SaveManager.save(data);
    const loaded = SaveManager.load();
    expect(loaded.version).toBe(1);
  });

  it('handles corrupted data gracefully', () => {
    mockStorage['subway_surf_save'] = 'not-valid-json!!!';
    const data = SaveManager.load();
    expect(data.version).toBe(1);
    expect(data.wallet.coins).toBe(0);
  });

  it('reset() clears save data', () => {
    const data = SaveManager.defaultData();
    data.wallet.coins = 500;
    SaveManager.save(data);
    SaveManager.reset();
    const loaded = SaveManager.load();
    expect(loaded.wallet.coins).toBe(0);
  });
});

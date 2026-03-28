import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WalletManager } from '@economy/WalletManager';

const mockStorage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
  clear: vi.fn(() => { for (const k in mockStorage) delete mockStorage[k]; }),
});

describe('WalletManager', () => {
  let wallet: WalletManager;
  beforeEach(() => { for (const k in mockStorage) delete mockStorage[k]; wallet = new WalletManager(); });

  it('starts with 0 coins and 0 keys', () => { expect(wallet.coins).toBe(0); expect(wallet.keys).toBe(0); });
  it('addCoins() increases balance', () => { wallet.addCoins(100); expect(wallet.coins).toBe(100); });
  it('spendCoins() decreases balance', () => { wallet.addCoins(200); expect(wallet.spendCoins(150)).toBe(true); expect(wallet.coins).toBe(50); });
  it('spendCoins() rejects insufficient funds', () => { wallet.addCoins(100); expect(wallet.spendCoins(200)).toBe(false); expect(wallet.coins).toBe(100); });
  it('canAfford() checks balance', () => { wallet.addCoins(500); expect(wallet.canAfford('coins', 500)).toBe(true); expect(wallet.canAfford('coins', 501)).toBe(false); });
  it('addKeys() and spendKeys() work', () => {
    wallet.addKeys(5); expect(wallet.keys).toBe(5);
    expect(wallet.spendKeys(3)).toBe(true); expect(wallet.keys).toBe(2);
    expect(wallet.spendKeys(3)).toBe(false); expect(wallet.keys).toBe(2);
  });
});

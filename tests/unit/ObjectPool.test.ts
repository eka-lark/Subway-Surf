import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObjectPool } from '../../src/core/ObjectPool';

describe('ObjectPool', () => {
  let pool: ObjectPool<{ id: number; active: boolean }>;
  let nextId: number;

  beforeEach(() => {
    nextId = 0;
    pool = new ObjectPool(
      () => ({ id: nextId++, active: false }),
      (obj) => { obj.active = false; },
      { initial: 3, max: 5 }
    );
  });

  it('pre-warms to initial size', () => { expect(pool.available).toBe(3); expect(pool.inUse).toBe(0); });
  it('get() returns an object and marks it in use', () => { const obj = pool.get(); expect(obj).toBeDefined(); expect(pool.inUse).toBe(1); expect(pool.available).toBe(2); });
  it('release() returns object to pool', () => { const obj = pool.get(); pool.release(obj!); expect(pool.inUse).toBe(0); expect(pool.available).toBe(3); });
  it('calls reset function on release', () => { const obj = pool.get()!; obj.active = true; pool.release(obj); expect(obj.active).toBe(false); });
  it('grows when pool is exhausted (up to max)', () => { pool.get(); pool.get(); pool.get(); const obj4 = pool.get(); expect(obj4).toBeDefined(); expect(pool.inUse).toBe(4); });
  it('returns null when max is reached', () => { for (let i = 0; i < 5; i++) pool.get(); const obj = pool.get(); expect(obj).toBeNull(); });
  it('releaseAll() returns all objects', () => { pool.get(); pool.get(); pool.get(); pool.releaseAll(); expect(pool.inUse).toBe(0); expect(pool.available).toBe(3); });
});

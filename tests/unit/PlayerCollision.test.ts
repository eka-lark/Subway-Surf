import { describe, it, expect } from 'vitest';
import { aabbIntersect, AABB } from '../../src/player/PlayerCollision';

describe('PlayerCollision', () => {
  it('detects overlap', () => {
    const a: AABB = { minX: 0, maxX: 1, minY: 0, maxY: 1, minZ: 0, maxZ: 1 };
    const b: AABB = { minX: 0.5, maxX: 1.5, minY: 0.5, maxY: 1.5, minZ: 0.5, maxZ: 1.5 };
    expect(aabbIntersect(a, b)).toBe(true);
  });
  it('detects no overlap (separated X)', () => {
    const a: AABB = { minX: 0, maxX: 1, minY: 0, maxY: 1, minZ: 0, maxZ: 1 };
    const b: AABB = { minX: 2, maxX: 3, minY: 0, maxY: 1, minZ: 0, maxZ: 1 };
    expect(aabbIntersect(a, b)).toBe(false);
  });
  it('detects no overlap (separated Y)', () => {
    const a: AABB = { minX: 0, maxX: 1, minY: 0, maxY: 1, minZ: 0, maxZ: 1 };
    const b: AABB = { minX: 0, maxX: 1, minY: 3, maxY: 4, minZ: 0, maxZ: 1 };
    expect(aabbIntersect(a, b)).toBe(false);
  });
  it('detects edge-touching as overlap', () => {
    const a: AABB = { minX: 0, maxX: 1, minY: 0, maxY: 1, minZ: 0, maxZ: 1 };
    const b: AABB = { minX: 1, maxX: 2, minY: 0, maxY: 1, minZ: 0, maxZ: 1 };
    expect(aabbIntersect(a, b)).toBe(true);
  });
});

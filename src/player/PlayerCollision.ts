export interface AABB {
  minX: number; maxX: number;
  minY: number; maxY: number;
  minZ: number; maxZ: number;
}

export function aabbIntersect(a: AABB, b: AABB): boolean {
  return (
    a.minX <= b.maxX && a.maxX >= b.minX &&
    a.minY <= b.maxY && a.maxY >= b.minY &&
    a.minZ <= b.maxZ && a.maxZ >= b.minZ
  );
}

export function createPlayerAABB(
  x: number, y: number, z: number,
  width: number, height: number, depth: number
): AABB {
  const hw = width / 2;
  const hd = depth / 2;
  return {
    minX: x - hw, maxX: x + hw,
    minY: y,      maxY: y + height,
    minZ: z - hd, maxZ: z + hd,
  };
}

import * as THREE from 'three';
import type { AABB } from '@player/PlayerCollision';
import { PLAYER } from '@core/Constants';

export interface CoinInstance { mesh: THREE.Mesh; x: number; y: number; z: number; active: boolean; }

let coinGeometry: THREE.CylinderGeometry | null = null;
let coinMaterial: THREE.MeshLambertMaterial | null = null;

function getCoinGeometry(): THREE.CylinderGeometry {
  if (!coinGeometry) { coinGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 12); coinGeometry.rotateX(Math.PI / 2); }
  return coinGeometry;
}

function getCoinMaterial(): THREE.MeshLambertMaterial {
  if (!coinMaterial) coinMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700, emissive: 0xaa8800 });
  return coinMaterial;
}

export function createCoinMesh(): THREE.Mesh { return new THREE.Mesh(getCoinGeometry(), getCoinMaterial()); }

export function getCoinAABB(coin: CoinInstance): AABB {
  const r = 0.3 * PLAYER.COLLECTIBLE_RADIUS_MULT;
  return { minX: coin.x - r, maxX: coin.x + r, minY: coin.y - r, maxY: coin.y + r, minZ: coin.z - r, maxZ: coin.z + r };
}

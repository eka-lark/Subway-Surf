import * as THREE from 'three';

interface Particle { mesh: THREE.Mesh; velocity: THREE.Vector3; life: number; maxLife: number; }

export class VFXManager {
  private scene: THREE.Scene;
  private particles: Particle[] = [];

  constructor(scene: THREE.Scene) { this.scene = scene; }

  spawnCoinCollect(x: number, y: number, z: number): void {
    for (let i = 0; i < 6; i++) {
      const geo = new THREE.SphereGeometry(0.08);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);
      const angle = (i / 6) * Math.PI * 2;
      const speed = 3 + Math.random() * 2;
      this.particles.push({
        mesh, velocity: new THREE.Vector3(Math.cos(angle) * speed, 2 + Math.random() * 3, Math.sin(angle) * speed),
        life: 0, maxLife: 0.4 + Math.random() * 0.2,
      });
    }
  }

  spawnCrash(x: number, y: number, z: number): void {
    for (let i = 0; i < 15; i++) {
      const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const mat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);
      this.particles.push({
        mesh, velocity: new THREE.Vector3((Math.random() - 0.5) * 8, Math.random() * 6, (Math.random() - 0.5) * 8),
        life: 0, maxLife: 0.6 + Math.random() * 0.4,
      });
    }
  }

  update(deltaTime: number): void {
    this.particles = this.particles.filter(p => {
      p.life += deltaTime;
      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh); p.mesh.geometry.dispose(); (p.mesh.material as THREE.Material).dispose();
        return false;
      }
      p.velocity.y -= 15 * deltaTime;
      p.mesh.position.add(p.velocity.clone().multiplyScalar(deltaTime));
      p.mesh.scale.setScalar(1 - (p.life / p.maxLife));
      return true;
    });
  }

  reset(): void {
    for (const p of this.particles) {
      this.scene.remove(p.mesh); p.mesh.geometry.dispose(); (p.mesh.material as THREE.Material).dispose();
    }
    this.particles = [];
  }
}

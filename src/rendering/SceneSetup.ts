import * as THREE from 'three';

export interface SceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}

export function createSceneContext(canvas: HTMLCanvasElement): SceneContext {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = false;

  const scene = new THREE.Scene();

  // Gradient sky — warm sunset-like top to cool bottom
  scene.background = new THREE.Color(0x6eb5ff);
  scene.fog = new THREE.FogExp2(0x8ecae6, 0.008);

  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 400);

  // Warm ambient light
  const ambientLight = new THREE.AmbientLight(0xfff8e1, 0.5);
  scene.add(ambientLight);

  // Main directional light (sun)
  const sunLight = new THREE.DirectionalLight(0xfff3e0, 1.0);
  sunLight.position.set(10, 20, 15);
  scene.add(sunLight);

  // Fill light from opposite side
  const fillLight = new THREE.DirectionalLight(0xb3e5fc, 0.3);
  fillLight.position.set(-5, 10, -10);
  scene.add(fillLight);

  // Hemisphere light for natural sky/ground coloring
  const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3e2723, 0.4);
  scene.add(hemiLight);

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);

  return { scene, camera, renderer };
}

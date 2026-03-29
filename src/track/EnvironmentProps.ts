import * as THREE from 'three';
import { GAME } from '@core/Constants';
import { randomFloat, randomInt, randomChoice } from '@utils/RandomUtils';

// Load user photo texture for building walls
const textureLoader = new THREE.TextureLoader();
let userPhotoTexture: THREE.Texture | null = null;
textureLoader.load('/textures/akshay.jpg', (tex) => {
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  userPhotoTexture = tex;
});

const BUILDING_STYLES = [
  { color: 0x78909c, windowColor: 0xfff9c4 },
  { color: 0x8d6e63, windowColor: 0xffe0b2 },
  { color: 0x90a4ae, windowColor: 0xb3e5fc },
  { color: 0x7e57c2, windowColor: 0xf3e5f5 },
  { color: 0x5c6bc0, windowColor: 0xe8eaf6 },
  { color: 0xef6c00, windowColor: 0xfff3e0 },
  { color: 0xc62828, windowColor: 0xffcdd2 },
];

// ─── Billboard / Hoarding Definitions ───────────────────────────
// Each billboard is drawn procedurally using canvas textures

interface BillboardDef {
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

const BILLBOARDS: BillboardDef[] = [
  // 1. Bollywood Movie Poster — "DHAMAKA"
  {
    draw: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#ff1744');
      grad.addColorStop(0.5, '#ff9100');
      grad.addColorStop(1, '#ffea00');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Star burst
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      for (let i = 0; i < 12; i++) {
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate((i / 12) * Math.PI * 2);
        ctx.fillRect(-3, -h, 6, h * 2);
        ctx.restore();
      }

      ctx.fillStyle = '#fff';
      ctx.font = `bold ${h * 0.25}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('DHAMAKA', w / 2, h * 0.35);

      ctx.font = `${h * 0.1}px Arial`;
      ctx.fillText('★ ★ ★ ★ ★', w / 2, h * 0.5);

      ctx.fillStyle = '#1a0000';
      ctx.font = `bold ${h * 0.12}px Arial`;
      ctx.fillText('IN CINEMAS NOW', w / 2, h * 0.72);

      ctx.fillStyle = '#fff';
      ctx.font = `${h * 0.08}px Arial`;
      ctx.fillText('A Blockbuster Hit!', w / 2, h * 0.88);
    },
  },

  // 2. Chai Point
  {
    draw: (ctx, w, h) => {
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(0, 0, w, h);

      // Steam wisps
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const sx = w * 0.3 + i * w * 0.15;
        ctx.moveTo(sx, h * 0.45);
        ctx.quadraticCurveTo(sx + 10, h * 0.3, sx - 5, h * 0.15);
        ctx.stroke();
      }

      // Cup shape
      ctx.fillStyle = '#ff8f00';
      ctx.fillRect(w * 0.25, h * 0.45, w * 0.4, h * 0.3);
      ctx.fillStyle = '#6d4c41';
      ctx.fillRect(w * 0.28, h * 0.48, w * 0.34, h * 0.1);

      ctx.fillStyle = '#ffcc02';
      ctx.font = `bold ${h * 0.18}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('CHAI POINT', w / 2, h * 0.2);

      ctx.fillStyle = '#fff';
      ctx.font = `${h * 0.1}px Arial`;
      ctx.fillText('☕ Best Cutting Chai ☕', w / 2, h * 0.9);
    },
  },

  // 3. Cricket Match Banner
  {
    draw: (ctx, w, h) => {
      ctx.fillStyle = '#1b5e20';
      ctx.fillRect(0, 0, w, h);

      // Cricket pitch lines
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      ctx.fillStyle = '#fff';
      ctx.font = `bold ${h * 0.13}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('🏏 IPL 2026 🏏', w / 2, h * 0.18);

      // Team vs Team
      ctx.fillStyle = '#ffeb3b';
      ctx.font = `bold ${h * 0.2}px Arial`;
      ctx.fillText('MI vs CSK', w / 2, h * 0.42);

      ctx.fillStyle = '#fff';
      ctx.font = `${h * 0.1}px Arial`;
      ctx.fillText('TONIGHT 7:30 PM', w / 2, h * 0.6);

      // Score style
      ctx.fillStyle = '#f44336';
      ctx.fillRect(w * 0.1, h * 0.68, w * 0.8, h * 0.18);
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${h * 0.12}px Arial`;
      ctx.fillText('LIVE on JioStar', w / 2, h * 0.8);

      ctx.font = `${h * 0.07}px Arial`;
      ctx.fillStyle = '#c8e6c9';
      ctx.fillText('Wankhede Stadium, Mumbai', w / 2, h * 0.95);
    },
  },

  // 4. Lassi King
  {
    draw: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#fff9c4');
      grad.addColorStop(1, '#f9a825');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#e65100';
      ctx.font = `bold ${h * 0.2}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('LASSI KING', w / 2, h * 0.25);

      // Glass shape
      ctx.fillStyle = '#fff';
      ctx.fillRect(w * 0.35, h * 0.35, w * 0.3, h * 0.35);
      ctx.fillStyle = '#ffe082';
      ctx.fillRect(w * 0.37, h * 0.37, w * 0.26, h * 0.31);

      // Straw
      ctx.strokeStyle = '#f44336';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w * 0.55, h * 0.3);
      ctx.lineTo(w * 0.5, h * 0.55);
      ctx.stroke();

      ctx.fillStyle = '#4e342e';
      ctx.font = `bold ${h * 0.1}px Arial`;
      ctx.fillText('★ Since 1985 ★', w / 2, h * 0.82);

      ctx.fillStyle = '#e65100';
      ctx.font = `${h * 0.08}px Arial`;
      ctx.fillText('Mango | Rose | Malai', w / 2, h * 0.93);
    },
  },

  // 5. Incredible India Travel
  {
    draw: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#ff9933');
      grad.addColorStop(0.5, '#ffffff');
      grad.addColorStop(1, '#138808');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Ashoka Chakra (simplified)
      ctx.strokeStyle = '#000080';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.42, h * 0.12, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(w / 2, h * 0.42);
        ctx.lineTo(
          w / 2 + Math.cos(angle) * h * 0.12,
          h * 0.42 + Math.sin(angle) * h * 0.12
        );
        ctx.stroke();
      }

      ctx.fillStyle = '#1a237e';
      ctx.font = `bold ${h * 0.14}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('INCREDIBLE', w / 2, h * 0.15);
      ctx.fillStyle = '#b71c1c';
      ctx.font = `bold ${h * 0.2}px Arial`;
      ctx.fillText('!NDIA', w / 2, h * 0.75);

      ctx.fillStyle = '#333';
      ctx.font = `${h * 0.07}px Arial`;
      ctx.fillText('Explore • Experience • Enjoy', w / 2, h * 0.92);
    },
  },

  // 6. Rangoli / Mandala art panel
  {
    draw: (ctx, w, h) => {
      ctx.fillStyle = '#880e4f';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const colors = ['#ff6f00', '#ffeb3b', '#e91e63', '#00bcd4', '#4caf50', '#fff'];

      // Concentric rangoli rings
      for (let ring = 5; ring >= 0; ring--) {
        const r = (ring + 1) * Math.min(w, h) * 0.08;
        ctx.fillStyle = colors[ring % colors.length];
        ctx.beginPath();
        // Draw petal pattern
        const petals = 8 + ring * 2;
        for (let i = 0; i < petals; i++) {
          const angle = (i / petals) * Math.PI * 2;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          ctx.moveTo(cx, cy);
          ctx.arc(px, py, r * 0.3, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // Center dot
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();

      // Border decoration
      ctx.strokeStyle = '#ffeb3b';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, w - 8, h - 8);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 8, w - 16, h - 16);
    },
  },

  // 7. Pani Puri / Street Food
  {
    draw: (ctx, w, h) => {
      ctx.fillStyle = '#f57f17';
      ctx.fillRect(0, 0, w, h);

      // Decorative border
      ctx.fillStyle = '#e65100';
      ctx.fillRect(0, 0, w, h * 0.06);
      ctx.fillRect(0, h * 0.94, w, h * 0.06);

      ctx.fillStyle = '#fff';
      ctx.font = `bold ${h * 0.18}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('PANI PURI', w / 2, h * 0.22);

      ctx.fillStyle = '#4e342e';
      ctx.font = `bold ${h * 0.12}px Arial`;
      ctx.fillText('WALA', w / 2, h * 0.36);

      // Plate with puris (circles)
      ctx.fillStyle = '#d7ccc8';
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.6, w * 0.35, h * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();

      const puriColors = ['#ff8f00', '#ffa726', '#ffb74d', '#ff9800', '#fb8c00'];
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = puriColors[i];
        ctx.beginPath();
        ctx.arc(w * 0.25 + i * w * 0.12, h * 0.56, h * 0.07, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(w * 0.24 + i * w * 0.12, h * 0.54, h * 0.03, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#fff';
      ctx.font = `${h * 0.09}px Arial`;
      ctx.fillText('₹20 Only!', w / 2, h * 0.82);

      ctx.fillStyle = '#4e342e';
      ctx.font = `bold ${h * 0.07}px Arial`;
      ctx.fillText('Teekha • Meetha • Masaledaar', w / 2, h * 0.92);
    },
  },

  // 8. Diwali Festival
  {
    draw: (ctx, w, h) => {
      ctx.fillStyle = '#1a0033';
      ctx.fillRect(0, 0, w, h);

      // Sparkle/firework dots
      const sparkColors = ['#ffeb3b', '#ff9800', '#f44336', '#e91e63', '#00e5ff', '#76ff03'];
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = sparkColors[i % sparkColors.length];
        ctx.globalAlpha = 0.6 + Math.random() * 0.4;
        const sx = Math.random() * w;
        const sy = Math.random() * h * 0.5;
        const sr = 1 + Math.random() * 3;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Diya (oil lamp) shape
      ctx.fillStyle = '#ff6f00';
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.7, w * 0.15, h * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e65100';
      ctx.beginPath();
      ctx.moveTo(w * 0.35, h * 0.7);
      ctx.quadraticCurveTo(w / 2, h * 0.82, w * 0.65, h * 0.7);
      ctx.fill();

      // Flame
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.6, 6, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.62, 3, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffd54f';
      ctx.font = `bold ${h * 0.18}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('HAPPY', w / 2, h * 0.2);
      ctx.fillStyle = '#ff9800';
      ctx.font = `bold ${h * 0.22}px Arial`;
      ctx.fillText('DIWALI', w / 2, h * 0.4);

      ctx.fillStyle = '#ce93d8';
      ctx.font = `${h * 0.08}px Arial`;
      ctx.fillText('🪔 Festival of Lights 🪔', w / 2, h * 0.92);
    },
  },
];

// Create a canvas texture for a billboard
function createBillboardTexture(def: BillboardDef): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;
  def.draw(ctx, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function tagAsEnvProp(obj: THREE.Object3D): void {
  obj.userData.envProp = true;
}

export function addEnvironmentProps(group: THREE.Group): void {
  const sideOffset = GAME.LANE_WIDTH * 1.5 + 2.5;
  const segLen = GAME.SEGMENT_LENGTH;

  const numBuildings = randomInt(1, 3);
  for (let i = 0; i < numBuildings; i++) {
    const z = randomFloat(2, segLen - 4);
    for (const side of [-1, 1]) {
      if (Math.random() < 0.3) continue;
      const building = createBuilding(side);
      const bx = side * (sideOffset + (building.userData.hw || 2));
      building.position.set(bx, 0, z);
      tagAsEnvProp(building);
      group.add(building);
    }
  }

  // Standalone hoardings/billboards between buildings (30% chance of 1)
  if (Math.random() < 0.3) {
    const z = randomFloat(5, segLen - 5);
    const side = randomChoice([-1, 1]);
    const hoarding = createStandaloneHoarding(side);
    hoarding.position.set(side * (sideOffset + 0.5), 0, z);
    tagAsEnvProp(hoarding);
    group.add(hoarding);
  }

  const numTrees = randomInt(0, 1);
  for (let i = 0; i < numTrees; i++) {
    const z = randomFloat(3, segLen - 3);
    const side = randomChoice([-1, 1]);
    const tree = createTree();
    tree.position.set(side * (sideOffset - 0.5), 0, z);
    tagAsEnvProp(tree);
    group.add(tree);
  }

  for (let z = 5; z < segLen; z += randomFloat(20, 35)) {
    const side = randomChoice([-1, 1]);
    const lamp = createLamppost();
    lamp.position.set(side * (sideOffset - 0.3), 0, z);
    tagAsEnvProp(lamp);
    group.add(lamp);
  }
}

function createBuilding(facingSide: number): THREE.Group {
  const building = new THREE.Group();
  const style = randomChoice(BUILDING_STYLES);
  const height = randomFloat(6, 18);
  const width = randomFloat(3, 7);
  const depth = randomFloat(4, 8);
  building.userData.hw = width / 2;

  const bodyGeo = new THREE.BoxGeometry(width, height, depth);
  const bodyMat = new THREE.MeshPhongMaterial({ color: style.color, flatShading: true });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = height / 2;
  building.add(body);

  const roofGeo = new THREE.BoxGeometry(width + 0.2, 0.3, depth + 0.2);
  const roofMat = new THREE.MeshPhongMaterial({ color: 0x424242 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = height;
  building.add(roof);

  // Windows on the track-facing side
  const windowMat = new THREE.MeshBasicMaterial({ color: style.windowColor });
  const cols = Math.floor((width - 1) / 1.2);
  const rows = Math.floor((height - 2) / 2);
  const faceZ = -facingSide * depth / 2; // Face toward track
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() < 0.5) continue;
      const winGeo = new THREE.PlaneGeometry(0.5, 0.7);
      const win = new THREE.Mesh(winGeo, windowMat);
      win.position.set(-width / 2 + 0.8 + c * 1.2, 2 + r * 2, faceZ + (facingSide > 0 ? -0.01 : 0.01));
      if (facingSide > 0) win.rotation.y = Math.PI;
      building.add(win);
    }
  }

  // Wall art on buildings — both track-facing and outer side
  if (height > 6 && Math.random() < 0.75) {
    const bbWidth = Math.min(width - 0.4, 4);
    // Position higher on the building (middle to upper area)
    const bbY = randomFloat(height * 0.4, Math.min(height - 2, height * 0.75));
    const faceOffset = facingSide > 0 ? -0.02 : 0.02;
    const frameOffset = facingSide > 0 ? -0.03 : 0.03;

    // Pick shape: 0=rectangle, 1=tall portrait, 2=circle, 3=wide banner, 4=diamond, 5=rounded square
    const shape = randomInt(0, 5);

    // 50% chance user photo, 50% procedural billboard
    const usePhoto = userPhotoTexture && Math.random() < 0.5;
    const mat = usePhoto
      ? new THREE.MeshLambertMaterial({ map: userPhotoTexture })
      : new THREE.MeshLambertMaterial({ map: createBillboardTexture(randomChoice(BILLBOARDS)) });

    let geo: THREE.BufferGeometry;
    let frameColor = 0x333333;

    switch (shape) {
      case 0: // Rectangle (landscape)
        geo = new THREE.PlaneGeometry(bbWidth, bbWidth * 0.6);
        frameColor = 0xffd700;
        break;
      case 1: // Tall portrait
        geo = new THREE.PlaneGeometry(bbWidth * 0.6, bbWidth * 1.0);
        frameColor = 0xc0c0c0;
        break;
      case 2: // Circle
        geo = new THREE.CircleGeometry(bbWidth * 0.4, 32);
        frameColor = 0xff6b35;
        break;
      case 3: // Wide banner
        geo = new THREE.PlaneGeometry(bbWidth * 1.2, bbWidth * 0.35);
        frameColor = 0x2196f3;
        break;
      case 4: // Diamond (rotated square)
        geo = new THREE.PlaneGeometry(bbWidth * 0.6, bbWidth * 0.6);
        frameColor = 0xe91e63;
        break;
      default: // Rounded-look square
        geo = new THREE.PlaneGeometry(bbWidth * 0.7, bbWidth * 0.7);
        frameColor = 0x4caf50;
        break;
    }

    const bb = new THREE.Mesh(geo, mat);
    bb.position.set(0, bbY, faceZ + faceOffset);
    if (facingSide > 0) bb.rotation.y = Math.PI;
    if (shape === 4) bb.rotation.z = Math.PI / 4; // Diamond rotation
    building.add(bb);

    // Frame border — shape-matched
    const frameMat = new THREE.MeshPhongMaterial({ color: frameColor });
    if (shape === 2) {
      // Circular frame ring
      const ringGeo = new THREE.RingGeometry(bbWidth * 0.4, bbWidth * 0.44, 32);
      const ring = new THREE.Mesh(ringGeo, frameMat);
      ring.position.set(0, bbY, faceZ + frameOffset);
      if (facingSide > 0) ring.rotation.y = Math.PI;
      building.add(ring);
    } else {
      // Rectangular frame (top + bottom bars)
      const fw = shape === 3 ? bbWidth * 1.3 : shape === 1 ? bbWidth * 0.7 : bbWidth + 0.1;
      const topY = bbY + (shape === 1 ? bbWidth * 0.5 : shape === 3 ? bbWidth * 0.18 : bbWidth * 0.31) + 0.04;
      const botY = bbY - (shape === 1 ? bbWidth * 0.5 : shape === 3 ? bbWidth * 0.18 : bbWidth * 0.31) - 0.04;
      for (const fy of [topY, botY]) {
        const frame = new THREE.Mesh(new THREE.PlaneGeometry(fw, 0.08), frameMat);
        frame.position.set(0, fy, faceZ + frameOffset);
        if (facingSide > 0) frame.rotation.y = Math.PI;
        if (shape === 4) frame.rotation.z = Math.PI / 4;
        building.add(frame);
      }
      // Side bars for portrait and square shapes
      if (shape === 1 || shape === 5) {
        const fh = shape === 1 ? bbWidth * 1.0 : bbWidth * 0.7;
        const halfW = shape === 1 ? bbWidth * 0.3 : bbWidth * 0.35;
        for (const fx of [-halfW - 0.04, halfW + 0.04]) {
          const sideFrame = new THREE.Mesh(new THREE.PlaneGeometry(0.08, fh + 0.16), frameMat);
          sideFrame.position.set(fx, bbY, faceZ + frameOffset);
          if (facingSide > 0) sideFrame.rotation.y = Math.PI;
          building.add(sideFrame);
        }
      }
    }

  }

  return building;
}

function createStandaloneHoarding(facingSide: number): THREE.Group {
  const hoarding = new THREE.Group();
  const bbDef = randomChoice(BILLBOARDS);
  const texture = createBillboardTexture(bbDef);

  const bbWidth = randomFloat(4, 6);
  const bbHeight = bbWidth * 0.65;
  const poleHeight = randomFloat(4, 7);

  // Support poles
  const poleMat = new THREE.MeshPhongMaterial({ color: 0x616161 });
  for (const x of [-bbWidth / 2 + 0.2, bbWidth / 2 - 0.2]) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, poleHeight, 6),
      poleMat
    );
    pole.position.set(x, poleHeight / 2, 0);
    hoarding.add(pole);
  }

  // Billboard backing
  const backMat = new THREE.MeshPhongMaterial({ color: 0x424242 });
  const back = new THREE.Mesh(new THREE.BoxGeometry(bbWidth + 0.2, bbHeight + 0.2, 0.1), backMat);
  back.position.set(0, poleHeight, 0);
  hoarding.add(back);

  // Billboard face (toward track)
  const bbMat = new THREE.MeshLambertMaterial({ map: texture });
  const bb = new THREE.Mesh(new THREE.PlaneGeometry(bbWidth, bbHeight), bbMat);
  bb.position.set(0, poleHeight, facingSide > 0 ? -0.06 : 0.06);
  if (facingSide > 0) bb.rotation.y = Math.PI;
  hoarding.add(bb);

  // Top frame bar with lights
  const topBar = new THREE.Mesh(
    new THREE.BoxGeometry(bbWidth + 0.3, 0.15, 0.2),
    new THREE.MeshPhongMaterial({ color: 0x333333 })
  );
  topBar.position.set(0, poleHeight + bbHeight / 2 + 0.1, 0);
  hoarding.add(topBar);

  // Small spotlights on top
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff9c4 });
  for (let i = 0; i < 3; i++) {
    const spot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.1), lightMat);
    spot.position.set(
      -bbWidth / 2 + 0.5 + i * (bbWidth - 1) / 2,
      poleHeight + bbHeight / 2 + 0.02,
      facingSide > 0 ? -0.15 : 0.15
    );
    hoarding.add(spot);
  }

  return hoarding;
}

function createTree(): THREE.Group {
  const tree = new THREE.Group();
  const trunkGeo = new THREE.CylinderGeometry(0.1, 0.15, 1.5, 6);
  const trunkMat = new THREE.MeshPhongMaterial({ color: 0x5d4037, flatShading: true });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.75;
  tree.add(trunk);

  const leafMat = new THREE.MeshPhongMaterial({ color: 0x2e7d32, flatShading: true });
  for (const s of [{ r: 1.0, h: 1.2, y: 2.0 }, { r: 0.8, h: 1.0, y: 2.8 }, { r: 0.5, h: 0.8, y: 3.4 }]) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(s.r, s.h, 7), leafMat);
    cone.position.y = s.y;
    tree.add(cone);
  }
  return tree;
}

function createLamppost(): THREE.Group {
  const lamp = new THREE.Group();
  const poleMat = new THREE.MeshPhongMaterial({ color: 0x616161 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 4, 6), poleMat);
  pole.position.y = 2;
  lamp.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.04, 0.04), poleMat);
  arm.position.set(0.3, 3.9, 0);
  lamp.add(arm);
  const light = new THREE.Mesh(
    new THREE.PlaneGeometry(0.25, 0.08),
    new THREE.MeshBasicMaterial({ color: 0xfff9c4 })
  );
  light.rotation.x = -Math.PI / 2;
  light.position.set(0.6, 3.79, 0);
  lamp.add(light);
  return lamp;
}

export function clearEnvironmentProps(group: THREE.Group): void {
  const toRemove: THREE.Object3D[] = [];
  for (const child of group.children) {
    if (child.userData.envProp) toRemove.push(child);
  }
  for (const child of toRemove) {
    group.remove(child);
    child.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose();
          if ('map' in obj.material && obj.material.map) {
            (obj.material.map as THREE.Texture).dispose();
          }
        }
      }
    });
  }
}

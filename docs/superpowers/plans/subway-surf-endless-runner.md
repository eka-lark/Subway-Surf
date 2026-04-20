# Subway Surf Endless Runner Game — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade, Subway Surfers-inspired endless runner browser game with Three.js, TypeScript, and Vite — fully client-side, zero server dependencies.

**Architecture:** ECS-inspired singleton managers orchestrated by a central GameManager. Procedural track generation with object pooling. HTML/CSS overlay UI on Three.js canvas. localStorage persistence. Event-driven communication between systems.

**Tech Stack:** TypeScript 5.x, Three.js r160+, Vite 5.x, Howler.js 2.x, GSAP 3.x, Vitest 1.x

---

## File Structure

```
subway-surf/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── public/
│   └── audio/
│       ├── music/
│       └── sfx/
├── src/
│   ├── main.ts
│   ├── core/
│   │   ├── GameManager.ts
│   │   ├── GameLoop.ts
│   │   ├── StateMachine.ts
│   │   ├── EventBus.ts
│   │   ├── ObjectPool.ts
│   │   └── Constants.ts
│   ├── input/
│   │   ├── InputManager.ts
│   │   ├── KeyboardHandler.ts
│   │   └── SwipeHandler.ts
│   ├── player/
│   │   ├── PlayerController.ts
│   │   ├── PlayerModel.ts
│   │   └── PlayerCollision.ts
│   ├── track/
│   │   ├── TrackGenerator.ts
│   │   ├── TrackSegment.ts
│   │   └── EnvironmentProps.ts
│   ├── obstacles/
│   │   ├── ObstacleManager.ts
│   │   ├── ObstacleFactory.ts
│   │   └── ObstacleTypes.ts
│   ├── collectibles/
│   │   ├── CoinManager.ts
│   │   ├── Coin.ts
│   │   └── CoinPatterns.ts
│   ├── powerups/
│   │   ├── PowerUpManager.ts
│   │   ├── PowerUpBase.ts
│   │   ├── Jetpack.ts
│   │   └── Magnet.ts
│   ├── economy/
│   │   ├── WalletManager.ts
│   │   └── ShopManager.ts
│   ├── scoring/
│   │   ├── ScoreManager.ts
│   │   └── MultiplierTracker.ts
│   ├── missions/
│   │   ├── MissionManager.ts
│   │   ├── MissionData.ts
│   │   └── AchievementTracker.ts
│   ├── characters/
│   │   ├── CharacterManager.ts
│   │   └── CharacterData.ts
│   ├── audio/
│   │   └── AudioManager.ts
│   ├── ui/
│   │   ├── UIManager.ts
│   │   ├── screens/
│   │   │   ├── LoadingScreen.ts
│   │   │   ├── MainMenuScreen.ts
│   │   │   ├── GameplayHUD.ts
│   │   │   ├── PauseScreen.ts
│   │   │   ├── GameOverScreen.ts
│   │   │   ├── ShopScreen.ts
│   │   │   └── MissionsScreen.ts
│   │   └── components/
│   │       ├── Button.ts
│   │       ├── ProgressBar.ts
│   │       └── CurrencyDisplay.ts
│   ├── rendering/
│   │   ├── SceneSetup.ts
│   │   ├── CameraController.ts
│   │   └── VFXManager.ts
│   ├── persistence/
│   │   ├── SaveManager.ts
│   │   └── SaveData.ts
│   └── utils/
│       ├── MathUtils.ts
│       └── RandomUtils.ts
├── tests/
│   └── unit/
│       ├── StateMachine.test.ts
│       ├── EventBus.test.ts
│       ├── ObjectPool.test.ts
│       ├── ScoreManager.test.ts
│       ├── WalletManager.test.ts
│       ├── MissionManager.test.ts
│       ├── SaveManager.test.ts
│       ├── PlayerCollision.test.ts
│       └── SwipeHandler.test.ts
└── docs/
```

---

## Phase 1: Project Scaffolding & Core Engine

### Task 1: Project Initialization

**Files:**

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `index.html`
- Create: `src/main.ts`

- [ ] **Step 1: Initialize package.json**

```json
{
  "name": "subway-surf",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "three": "^0.160.0",
    "howler": "^2.2.4",
    "gsap": "^3.12.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "@types/three": "^0.160.0",
    "@types/howler": "^2.2.11",
    "vitest": "^1.4.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@core/*": ["./src/core/*"],
      "@input/*": ["./src/input/*"],
      "@player/*": ["./src/player/*"],
      "@track/*": ["./src/track/*"],
      "@obstacles/*": ["./src/obstacles/*"],
      "@collectibles/*": ["./src/collectibles/*"],
      "@powerups/*": ["./src/powerups/*"],
      "@economy/*": ["./src/economy/*"],
      "@scoring/*": ["./src/scoring/*"],
      "@missions/*": ["./src/missions/*"],
      "@characters/*": ["./src/characters/*"],
      "@audio/*": ["./src/audio/*"],
      "@ui/*": ["./src/ui/*"],
      "@rendering/*": ["./src/rendering/*"],
      "@persistence/*": ["./src/persistence/*"],
      "@utils/*": ["./src/utils/*"]
    },
    "baseUrl": "."
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@input': resolve(__dirname, 'src/input'),
      '@player': resolve(__dirname, 'src/player'),
      '@track': resolve(__dirname, 'src/track'),
      '@obstacles': resolve(__dirname, 'src/obstacles'),
      '@collectibles': resolve(__dirname, 'src/collectibles'),
      '@powerups': resolve(__dirname, 'src/powerups'),
      '@economy': resolve(__dirname, 'src/economy'),
      '@scoring': resolve(__dirname, 'src/scoring'),
      '@missions': resolve(__dirname, 'src/missions'),
      '@characters': resolve(__dirname, 'src/characters'),
      '@audio': resolve(__dirname, 'src/audio'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@rendering': resolve(__dirname, 'src/rendering'),
      '@persistence': resolve(__dirname, 'src/persistence'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          howler: ['howler'],
          gsap: ['gsap'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
```

- [ ] **Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@input': resolve(__dirname, 'src/input'),
      '@player': resolve(__dirname, 'src/player'),
      '@track': resolve(__dirname, 'src/track'),
      '@obstacles': resolve(__dirname, 'src/obstacles'),
      '@collectibles': resolve(__dirname, 'src/collectibles'),
      '@powerups': resolve(__dirname, 'src/powerups'),
      '@economy': resolve(__dirname, 'src/economy'),
      '@scoring': resolve(__dirname, 'src/scoring'),
      '@missions': resolve(__dirname, 'src/missions'),
      '@characters': resolve(__dirname, 'src/characters'),
      '@audio': resolve(__dirname, 'src/audio'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@rendering': resolve(__dirname, 'src/rendering'),
      '@persistence': resolve(__dirname, 'src/persistence'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts', 'src/**/*.d.ts'],
    },
  },
});
```

- [ ] **Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
  <title>Subway Surf</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
    #app {
      position: relative;
      width: 100%;
      height: 100%;
    }
    #game-canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
    #ui-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #fff;
    }
    #ui-layer > .screen {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    }
    #ui-layer > .screen.hidden { display: none; pointer-events: none; }

    .btn {
      padding: 14px 36px;
      font-size: 18px;
      font-weight: 700;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      min-width: 44px;
      min-height: 44px;
      transition: transform 0.1s, box-shadow 0.1s;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .btn:active { transform: scale(0.95); }
    .btn-primary {
      background: linear-gradient(135deg, #ff6b35, #f7c948);
      color: #1a1a2e;
      box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
    }
    .btn-secondary {
      background: rgba(255,255,255,0.15);
      color: #fff;
      border: 2px solid rgba(255,255,255,0.3);
      backdrop-filter: blur(10px);
    }

    /* Loading Screen */
    #screen-loading {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    }
    #screen-loading .title {
      font-size: 48px;
      font-weight: 900;
      background: linear-gradient(135deg, #ff6b35, #f7c948);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 40px;
      text-transform: uppercase;
    }
    .loading-bar-container {
      width: 300px;
      height: 8px;
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
      overflow: hidden;
    }
    .loading-bar-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #ff6b35, #f7c948);
      border-radius: 4px;
      transition: width 0.3s;
    }
    .loading-text {
      margin-top: 12px;
      font-size: 14px;
      opacity: 0.6;
    }

    /* Main Menu */
    #screen-menu {
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(5px);
    }
    #screen-menu .title {
      font-size: 56px;
      font-weight: 900;
      background: linear-gradient(135deg, #ff6b35, #f7c948);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
    }
    #screen-menu .subtitle { font-size: 16px; opacity: 0.6; margin-bottom: 40px; }
    #screen-menu .high-score { font-size: 18px; margin-bottom: 30px; opacity: 0.8; }
    #screen-menu .menu-buttons { display: flex; flex-direction: column; gap: 12px; }
    #screen-menu .currency-bar {
      position: absolute; top: 20px; right: 20px;
      display: flex; gap: 16px; font-size: 16px; font-weight: 600;
    }
    #screen-menu .currency-bar span { display: flex; align-items: center; gap: 6px; }

    /* Gameplay HUD */
    #screen-hud {
      pointer-events: none;
      justify-content: flex-start;
    }
    #screen-hud .hud-top {
      width: 100%;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    #screen-hud .hud-left { display: flex; flex-direction: column; gap: 4px; }
    #screen-hud .score-display { font-size: 28px; font-weight: 800; text-shadow: 0 2px 8px rgba(0,0,0,0.5); }
    #screen-hud .multiplier-display { font-size: 14px; opacity: 0.8; text-shadow: 0 2px 8px rgba(0,0,0,0.5); }
    #screen-hud .coin-display { font-size: 16px; text-shadow: 0 2px 8px rgba(0,0,0,0.5); }
    #screen-hud .hud-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .pause-btn {
      pointer-events: auto;
      background: rgba(0,0,0,0.4);
      border: none;
      color: #fff;
      width: 44px; height: 44px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      backdrop-filter: blur(5px);
    }
    .powerup-timer {
      background: rgba(0,0,0,0.4);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      backdrop-filter: blur(5px);
      display: none;
    }
    .powerup-timer-bar {
      height: 3px;
      background: #f7c948;
      border-radius: 2px;
      margin-top: 4px;
      transition: width 0.1s linear;
    }
    #screen-hud .hud-bottom {
      position: absolute;
      bottom: 20px;
      left: 20px;
      display: flex;
      gap: 10px;
    }
    .hoverboard-indicator {
      pointer-events: auto;
      background: rgba(0,0,0,0.4);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      backdrop-filter: blur(5px);
      cursor: pointer;
    }

    /* Pause Screen */
    #screen-pause {
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(10px);
    }
    #screen-pause .pause-title { font-size: 36px; font-weight: 800; margin-bottom: 40px; }
    #screen-pause .pause-buttons { display: flex; flex-direction: column; gap: 12px; }

    /* Game Over Screen */
    #screen-gameover {
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(10px);
    }
    #screen-gameover .go-title {
      font-size: 42px;
      font-weight: 900;
      margin-bottom: 30px;
      background: linear-gradient(135deg, #ff6b35, #f7c948);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .go-stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 30px;
      font-size: 18px;
    }
    .go-stats .label { opacity: 0.6; }
    .go-stats .value { font-weight: 700; }
    .go-stats .new-best { color: #f7c948; }
    .go-buttons {
      display: flex;
      gap: 16px;
      margin-top: 20px;
    }
    .mission-progress {
      margin-top: 30px;
      width: 300px;
    }
    .mission-progress h3 {
      font-size: 14px;
      text-transform: uppercase;
      opacity: 0.6;
      margin-bottom: 12px;
      letter-spacing: 1px;
    }
    .mission-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 14px;
    }
    .mission-bar {
      width: 80px;
      height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
      overflow: hidden;
    }
    .mission-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #ff6b35, #f7c948);
      border-radius: 3px;
    }

    /* Shop Screen */
    #screen-shop {
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(10px);
    }
    .shop-header {
      width: 100%;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .shop-title { font-size: 28px; font-weight: 800; }
    .shop-close {
      background: none; border: none; color: #fff;
      font-size: 28px; cursor: pointer; padding: 8px;
      min-width: 44px; min-height: 44px;
    }
    .shop-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 16px;
      padding: 20px;
      width: 100%;
      max-width: 600px;
      overflow-y: auto;
      max-height: 60vh;
    }
    .shop-item {
      background: rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      cursor: pointer;
      transition: transform 0.15s, background 0.15s;
    }
    .shop-item:hover { transform: scale(1.05); background: rgba(255,255,255,0.12); }
    .shop-item.owned { border: 2px solid #4caf50; }
    .shop-item.equipped { border: 2px solid #f7c948; }
    .shop-item-icon { font-size: 40px; margin-bottom: 8px; }
    .shop-item-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .shop-item-cost { font-size: 12px; opacity: 0.7; }

    /* Missions Screen */
    #screen-missions {
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(10px);
    }
    .missions-list {
      width: 100%;
      max-width: 400px;
      padding: 20px;
    }
    .missions-title { font-size: 28px; font-weight: 800; margin-bottom: 20px; text-align: center; }
    .mission-card {
      background: rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .mission-card-desc { font-size: 15px; margin-bottom: 8px; }
    .mission-card-progress {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      opacity: 0.7;
    }
    .mission-card-bar {
      flex: 1;
      height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
      margin: 0 10px;
      overflow: hidden;
    }
    .mission-card-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #ff6b35, #f7c948);
      border-radius: 3px;
    }
    .mission-card-reward { font-size: 12px; color: #f7c948; margin-top: 6px; }
    .mission-card.completed {
      border: 2px solid #4caf50;
      opacity: 0.7;
    }

    /* Countdown */
    .countdown-overlay {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 100;
    }
    .countdown-text {
      font-size: 120px;
      font-weight: 900;
      color: #fff;
      text-shadow: 0 0 40px rgba(255, 107, 53, 0.8);
      opacity: 0;
    }

    /* Revive prompt */
    #screen-revive {
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(10px);
    }
    .revive-prompt { text-align: center; }
    .revive-title { font-size: 28px; font-weight: 800; margin-bottom: 16px; }
    .revive-cost { font-size: 16px; opacity: 0.7; margin-bottom: 24px; }
    .revive-buttons { display: flex; gap: 16px; }
    .revive-timer { font-size: 48px; font-weight: 800; margin-bottom: 20px; color: #f7c948; }

    /* Responsive */
    @media (max-width: 600px) {
      #screen-menu .title { font-size: 36px; }
      #screen-gameover .go-title { font-size: 32px; }
      .btn { padding: 12px 28px; font-size: 16px; }
      .shop-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); }
    }
  </style>
</head>
<body>
  <div id="app">
    <canvas id="game-canvas"></canvas>
    <div id="ui-layer">
      <div id="screen-loading" class="screen">
        <div class="title">SUBWAY SURF</div>
        <div class="loading-bar-container">
          <div class="loading-bar-fill" id="loading-bar"></div>
        </div>
        <div class="loading-text" id="loading-text">Loading...</div>
      </div>

      <div id="screen-menu" class="screen hidden">
        <div class="currency-bar">
          <span id="menu-coins">🪙 0</span>
          <span id="menu-keys">🔑 0</span>
        </div>
        <div class="title">SUBWAY SURF</div>
        <div class="subtitle">Endless Runner</div>
        <div class="high-score" id="menu-high-score">Best: 0</div>
        <div class="menu-buttons">
          <button class="btn btn-primary" id="btn-play">Play</button>
          <button class="btn btn-secondary" id="btn-shop">Shop</button>
          <button class="btn btn-secondary" id="btn-missions">Missions</button>
        </div>
      </div>

      <div id="screen-hud" class="screen hidden">
        <div class="hud-top">
          <div class="hud-left">
            <div class="score-display" id="hud-score">0</div>
            <div class="multiplier-display" id="hud-multiplier">x1</div>
            <div class="coin-display" id="hud-coins">🪙 0</div>
          </div>
          <div class="hud-right">
            <button class="pause-btn" id="btn-pause">⏸</button>
            <div class="powerup-timer" id="hud-powerup">
              <span id="hud-powerup-name"></span>
              <div class="powerup-timer-bar" id="hud-powerup-bar" style="width:100%"></div>
            </div>
          </div>
        </div>
        <div class="hud-bottom">
          <div class="hoverboard-indicator" id="hud-hoverboard" style="display:none">🛹 x0</div>
        </div>
      </div>

      <div id="screen-pause" class="screen hidden">
        <div class="pause-title">PAUSED</div>
        <div class="pause-buttons">
          <button class="btn btn-primary" id="btn-resume">Resume</button>
          <button class="btn btn-secondary" id="btn-pause-menu">Main Menu</button>
        </div>
      </div>

      <div id="screen-revive" class="screen hidden">
        <div class="revive-prompt">
          <div class="revive-title">Continue?</div>
          <div class="revive-timer" id="revive-timer">5</div>
          <div class="revive-cost" id="revive-cost">Cost: 500 coins</div>
          <div class="revive-buttons">
            <button class="btn btn-primary" id="btn-revive">Revive</button>
            <button class="btn btn-secondary" id="btn-no-revive">Give Up</button>
          </div>
        </div>
      </div>

      <div id="screen-gameover" class="screen hidden">
        <div class="go-title">GAME OVER</div>
        <div class="go-stats">
          <div><span class="label">Score: </span><span class="value" id="go-score">0</span></div>
          <div><span class="label">Best: </span><span class="value" id="go-best">0</span><span class="new-best" id="go-new-best" style="display:none"> NEW!</span></div>
          <div><span class="label">Coins: </span><span class="value" id="go-coins">0</span></div>
          <div><span class="label">Distance: </span><span class="value" id="go-distance">0m</span></div>
        </div>
        <div class="go-buttons">
          <button class="btn btn-secondary" id="btn-go-menu">Menu</button>
          <button class="btn btn-primary" id="btn-go-restart">Play Again</button>
        </div>
        <div class="mission-progress" id="go-missions"></div>
      </div>

      <div id="screen-shop" class="screen hidden">
        <div class="shop-header">
          <div class="shop-title">Shop</div>
          <button class="shop-close" id="btn-shop-close">✕</button>
        </div>
        <div class="currency-bar" style="position:static;margin-bottom:16px">
          <span id="shop-coins">🪙 0</span>
          <span id="shop-keys">🔑 0</span>
        </div>
        <div class="shop-grid" id="shop-grid"></div>
      </div>

      <div id="screen-missions" class="screen hidden">
        <div class="shop-header">
          <div class="missions-title">Missions</div>
          <button class="shop-close" id="btn-missions-close">✕</button>
        </div>
        <div class="missions-list" id="missions-list"></div>
      </div>

      <div class="countdown-overlay" id="countdown-overlay" style="display:none">
        <div class="countdown-text" id="countdown-text"></div>
      </div>
    </div>
  </div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

- [ ] **Step 6: Create placeholder main.ts**

```typescript
// src/main.ts
console.log('Subway Surf — loading...');
```

- [ ] **Step 7: Install dependencies and verify build**

Run: `cd /Users/akshaypatel/Subway-Surf && npm install && npm run build`
Expected: Clean install, successful build

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: project scaffolding — Vite + TypeScript + Three.js setup"
```

---

### Task 2: Constants & Utility Modules

**Files:**

- Create: `src/core/Constants.ts`
- Create: `src/utils/MathUtils.ts`
- Create: `src/utils/RandomUtils.ts`

- [ ] **Step 1: Create Constants.ts**

```typescript
// src/core/Constants.ts

export const GAME = {
  LANE_WIDTH: 2.5,
  LANE_COUNT: 3,
  SEGMENT_LENGTH: 50,
  SPAWN_AHEAD: 5,
  DESPAWN_BEHIND: 2,
  BASE_SPEED: 8.0,
  MAX_SPEED: 22.0,
  ACCELERATION_RATE: 0.003,
  MAX_DELTA_TIME: 1 / 30,
} as const;

export const PHYSICS = {
  JUMP_FORCE: 10.0,
  GRAVITY: -30.0,
  LANE_SWITCH_SPEED: 10.0,
  SLIDE_DURATION: 0.6,
  GROUND_Y: 0.0,
} as const;

export const PLAYER = {
  STANDING_HEIGHT: 1.8,
  STANDING_WIDTH: 0.8,
  STANDING_DEPTH: 0.6,
  SLIDING_HEIGHT: 0.5,
  COLLECTIBLE_RADIUS_MULT: 1.2,
} as const;

export const DIFFICULTY = {
  OBSTACLE_MAX_INTERVAL: 3.0,
  OBSTACLE_MIN_INTERVAL: 0.8,
  RAMP_DISTANCE: 5000,
  COMBO_UNLOCK_DISTANCE: 1000,
  MIN_OBSTACLE_GAP_FACTOR: 0.5,
} as const;

export const ECONOMY = {
  COIN_SCORE_VALUE: 100,
  REVIVE_COST_1: 500,
  REVIVE_COST_2: 1500,
  MAX_REVIVES_PER_RUN: 2,
  MAX_MULTIPLIER: 30,
  MISSIONS_PER_SET: 3,
} as const;

export const POWERUP = {
  MIN_DISTANCE_BETWEEN: 200,
  MAX_PER_SEGMENT: 1,
  HOVERBOARD_COOLDOWN: 10,
  HOVERBOARD_IMMUNITY: 2.0,
  WEIGHTS: {
    magnet: 30,
    jetpack: 15,
  } as Record<string, number>,
} as const;

export const POOL_SIZES = {
  TRACK_SEGMENT: { initial: 8, max: 12 },
  COIN: { initial: 150, max: 300 },
  STATIC_OBSTACLE: { initial: 20, max: 40 },
  DYNAMIC_OBSTACLE: { initial: 8, max: 15 },
  POWERUP_PICKUP: { initial: 5, max: 10 },
  VFX_COIN: { initial: 15, max: 30 },
  VFX_CRASH: { initial: 3, max: 5 },
} as const;

export const INPUT = {
  MIN_SWIPE_DISTANCE: 50,
  MAX_SWIPE_TIME: 300,
  DEAD_ZONE_ANGLE: 30,
  BUFFER_SIZE: 2,
} as const;

export const AUDIO = {
  DEFAULT_MUSIC_VOLUME: 0.7,
  DEFAULT_SFX_VOLUME: 1.0,
  CROSSFADE_DURATION: 1.5,
  COIN_PITCH_MIN: 0.9,
  COIN_PITCH_MAX: 1.1,
} as const;

export const UI = {
  TRANSITION_DURATION: 0.3,
  MIN_TOUCH_TARGET: 44,
} as const;
```

- [ ] **Step 2: Create MathUtils.ts**

```typescript
// src/utils/MathUtils.ts

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

export function moveTowards(current: number, target: number, maxDelta: number): number {
  const diff = target - current;
  if (Math.abs(diff) <= maxDelta) return target;
  return current + Math.sign(diff) * maxDelta;
}

export function inverseLerp(a: number, b: number, value: number): number {
  if (a === b) return 0;
  return clamp((value - a) / (b - a), 0, 1);
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${Math.floor(meters)}m`;
}
```

- [ ] **Step 3: Create RandomUtils.ts**

```typescript
// src/utils/RandomUtils.ts

export function randomFloat(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomFloat(min, max + 1));
}

export function randomChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function weightedRandom(weights: Record<string, number>): string {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/core/Constants.ts src/utils/MathUtils.ts src/utils/RandomUtils.ts
git commit -m "feat: add game constants and utility modules"
```

---

### Task 3: EventBus (with tests)

**Files:**

- Create: `src/core/EventBus.ts`
- Create: `tests/unit/EventBus.test.ts`

- [ ] **Step 1: Write EventBus tests**

```typescript
// tests/unit/EventBus.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '@core/EventBus';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  it('calls listener when event is emitted', () => {
    const fn = vi.fn();
    bus.on('test', fn);
    bus.emit('test', { value: 42 });
    expect(fn).toHaveBeenCalledWith({ value: 42 });
  });

  it('supports multiple listeners on same event', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    bus.on('test', fn1);
    bus.on('test', fn2);
    bus.emit('test', null);
    expect(fn1).toHaveBeenCalledOnce();
    expect(fn2).toHaveBeenCalledOnce();
  });

  it('removes listener with off()', () => {
    const fn = vi.fn();
    bus.on('test', fn);
    bus.off('test', fn);
    bus.emit('test', null);
    expect(fn).not.toHaveBeenCalled();
  });

  it('once() fires only once', () => {
    const fn = vi.fn();
    bus.once('test', fn);
    bus.emit('test', null);
    bus.emit('test', null);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('does not throw when emitting event with no listeners', () => {
    expect(() => bus.emit('nonexistent', null)).not.toThrow();
  });

  it('clear() removes all listeners', () => {
    const fn = vi.fn();
    bus.on('a', fn);
    bus.on('b', fn);
    bus.clear();
    bus.emit('a', null);
    bus.emit('b', null);
    expect(fn).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/akshaypatel/Subway-Surf && npx vitest run tests/unit/EventBus.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement EventBus**

```typescript
// src/core/EventBus.ts

type Listener = (data: unknown) => void;

export class EventBus {
  private listeners = new Map<string, Set<Listener>>();

  on(event: string, listener: Listener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: string, listener: Listener): void {
    this.listeners.get(event)?.delete(listener);
  }

  once(event: string, listener: Listener): void {
    const wrapper: Listener = (data) => {
      this.off(event, wrapper);
      listener(data);
    };
    this.on(event, wrapper);
  }

  emit(event: string, data: unknown): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const listener of set) {
      listener(data);
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

// Singleton global event bus
export const eventBus = new EventBus();
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/EventBus.test.ts`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/EventBus.ts tests/unit/EventBus.test.ts
git commit -m "feat: add typed EventBus with tests"
```

---

### Task 4: StateMachine (with tests)

**Files:**

- Create: `src/core/StateMachine.ts`
- Create: `tests/unit/StateMachine.test.ts`

- [ ] **Step 1: Write StateMachine tests**

```typescript
// tests/unit/StateMachine.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StateMachine } from '@core/StateMachine';

describe('StateMachine', () => {
  let sm: StateMachine<string>;

  beforeEach(() => {
    sm = new StateMachine('idle', {
      idle: ['running', 'paused'],
      running: ['paused', 'dead'],
      paused: ['running', 'idle'],
      dead: ['idle'],
    });
  });

  it('starts in initial state', () => {
    expect(sm.current).toBe('idle');
  });

  it('transitions to valid state', () => {
    expect(sm.transition('running')).toBe(true);
    expect(sm.current).toBe('running');
  });

  it('rejects invalid transition', () => {
    expect(sm.transition('dead')).toBe(false);
    expect(sm.current).toBe('idle');
  });

  it('calls onEnter callback', () => {
    const fn = vi.fn();
    sm.onEnter('running', fn);
    sm.transition('running');
    expect(fn).toHaveBeenCalledWith('idle');
  });

  it('calls onExit callback', () => {
    const fn = vi.fn();
    sm.onExit('idle', fn);
    sm.transition('running');
    expect(fn).toHaveBeenCalledWith('running');
  });

  it('calls onChange callback', () => {
    const fn = vi.fn();
    sm.onChange(fn);
    sm.transition('running');
    expect(fn).toHaveBeenCalledWith('running', 'idle');
  });

  it('is() checks current state', () => {
    expect(sm.is('idle')).toBe(true);
    expect(sm.is('running')).toBe(false);
  });

  it('canTransitionTo() checks allowed transitions', () => {
    expect(sm.canTransitionTo('running')).toBe(true);
    expect(sm.canTransitionTo('dead')).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/StateMachine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement StateMachine**

```typescript
// src/core/StateMachine.ts

export class StateMachine<S extends string> {
  private _current: S;
  private transitions: Record<string, S[]>;
  private enterCallbacks = new Map<S, ((from: S) => void)[]>();
  private exitCallbacks = new Map<S, ((to: S) => void)[]>();
  private changeCallbacks: ((to: S, from: S) => void)[] = [];

  constructor(initial: S, transitions: Record<string, S[]>) {
    this._current = initial;
    this.transitions = transitions;
  }

  get current(): S {
    return this._current;
  }

  is(state: S): boolean {
    return this._current === state;
  }

  canTransitionTo(state: S): boolean {
    const allowed = this.transitions[this._current];
    return allowed ? allowed.includes(state) : false;
  }

  transition(to: S): boolean {
    if (!this.canTransitionTo(to)) return false;

    const from = this._current;

    // Fire exit callbacks
    const exitCbs = this.exitCallbacks.get(from);
    if (exitCbs) exitCbs.forEach(cb => cb(to));

    this._current = to;

    // Fire enter callbacks
    const enterCbs = this.enterCallbacks.get(to);
    if (enterCbs) enterCbs.forEach(cb => cb(from));

    // Fire change callbacks
    this.changeCallbacks.forEach(cb => cb(to, from));

    return true;
  }

  onEnter(state: S, callback: (from: S) => void): void {
    if (!this.enterCallbacks.has(state)) {
      this.enterCallbacks.set(state, []);
    }
    this.enterCallbacks.get(state)!.push(callback);
  }

  onExit(state: S, callback: (to: S) => void): void {
    if (!this.exitCallbacks.has(state)) {
      this.exitCallbacks.set(state, []);
    }
    this.exitCallbacks.get(state)!.push(callback);
  }

  onChange(callback: (to: S, from: S) => void): void {
    this.changeCallbacks.push(callback);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/StateMachine.test.ts`
Expected: All 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/StateMachine.ts tests/unit/StateMachine.test.ts
git commit -m "feat: add generic StateMachine with enter/exit callbacks and tests"
```

---

### Task 5: ObjectPool (with tests)

**Files:**

- Create: `src/core/ObjectPool.ts`
- Create: `tests/unit/ObjectPool.test.ts`

- [ ] **Step 1: Write ObjectPool tests**

```typescript
// tests/unit/ObjectPool.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObjectPool } from '@core/ObjectPool';

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

  it('pre-warms to initial size', () => {
    expect(pool.available).toBe(3);
    expect(pool.inUse).toBe(0);
  });

  it('get() returns an object and marks it in use', () => {
    const obj = pool.get();
    expect(obj).toBeDefined();
    expect(pool.inUse).toBe(1);
    expect(pool.available).toBe(2);
  });

  it('release() returns object to pool', () => {
    const obj = pool.get();
    pool.release(obj);
    expect(pool.inUse).toBe(0);
    expect(pool.available).toBe(3);
  });

  it('calls reset function on release', () => {
    const obj = pool.get();
    obj.active = true;
    pool.release(obj);
    expect(obj.active).toBe(false);
  });

  it('grows when pool is exhausted (up to max)', () => {
    pool.get(); pool.get(); pool.get();
    const obj4 = pool.get();
    expect(obj4).toBeDefined();
    expect(pool.inUse).toBe(4);
  });

  it('returns null when max is reached', () => {
    for (let i = 0; i < 5; i++) pool.get();
    const obj = pool.get();
    expect(obj).toBeNull();
  });

  it('releaseAll() returns all objects', () => {
    pool.get(); pool.get(); pool.get();
    pool.releaseAll();
    expect(pool.inUse).toBe(0);
    expect(pool.available).toBe(3);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/ObjectPool.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement ObjectPool**

```typescript
// src/core/ObjectPool.ts

export interface PoolConfig {
  initial: number;
  max: number;
}

export class ObjectPool<T> {
  private pool: T[] = [];
  private active = new Set<T>();
  private factory: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  constructor(factory: () => T, resetFn: (obj: T) => void, config: PoolConfig) {
    this.factory = factory;
    this.resetFn = resetFn;
    this.maxSize = config.max;

    // Pre-warm
    for (let i = 0; i < config.initial; i++) {
      this.pool.push(this.factory());
    }
  }

  get available(): number {
    return this.pool.length;
  }

  get inUse(): number {
    return this.active.size;
  }

  get(): T | null {
    let obj: T;

    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
    } else if (this.active.size < this.maxSize) {
      obj = this.factory();
    } else {
      return null;
    }

    this.active.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (!this.active.has(obj)) return;
    this.active.delete(obj);
    this.resetFn(obj);
    this.pool.push(obj);
  }

  releaseAll(): void {
    for (const obj of this.active) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
    this.active.clear();
  }

  forEach(fn: (obj: T) => void): void {
    for (const obj of this.active) {
      fn(obj);
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/ObjectPool.test.ts`
Expected: All 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/ObjectPool.ts tests/unit/ObjectPool.test.ts
git commit -m "feat: add generic ObjectPool with pre-warming and max cap, with tests"
```

---

### Task 6: SaveManager & Persistence (with tests)

**Files:**

- Create: `src/persistence/SaveData.ts`
- Create: `src/persistence/SaveManager.ts`
- Create: `tests/unit/SaveManager.test.ts`

- [ ] **Step 1: Write SaveManager tests**

```typescript
// tests/unit/SaveManager.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveManager } from '@persistence/SaveManager';
import type { SaveData } from '@persistence/SaveData';

// Mock localStorage
const mockStorage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
  clear: vi.fn(() => { for (const k in mockStorage) delete mockStorage[k]; }),
});

describe('SaveManager', () => {
  beforeEach(() => {
    for (const k in mockStorage) delete mockStorage[k];
    vi.clearAllMocks();
  });

  it('returns default data when nothing is saved', () => {
    const data = SaveManager.load();
    expect(data.version).toBe(1);
    expect(data.wallet.coins).toBe(0);
    expect(data.wallet.keys).toBe(0);
    expect(data.characters.equipped).toBe('default');
    expect(data.characters.unlocked).toContain('default');
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/SaveManager.test.ts`
Expected: FAIL

- [ ] **Step 3: Create SaveData.ts**

```typescript
// src/persistence/SaveData.ts

export interface ActiveMission {
  id: string;
  type: string;
  description: string;
  target: number;
  progress: number;
  reward: { type: 'coins' | 'keys'; amount: number };
}

export interface SaveData {
  version: number;
  wallet: {
    coins: number;
    keys: number;
  };
  characters: {
    unlocked: string[];
    equipped: string;
  };
  skins: {
    unlocked: Record<string, string[]>;
    equipped: Record<string, string>;
  };
  powerUpLevels: {
    jetpack: number;
    magnet: number;
    superSneakers: number;
    multiplier: number;
    hoverboard: number;
  };
  hoverboardCount: number;
  scoring: {
    highScore: number;
    multiplierLevel: number;
    missionSetIndex: number;
  };
  missions: {
    active: ActiveMission[];
    dailyLastReset: string;
  };
  achievements: string[];
  statistics: {
    totalCoinsCollected: number;
    totalDistanceRun: number;
    totalRuns: number;
    totalTimePlayed: number;
    totalJumps: number;
    totalSlides: number;
  };
  settings: {
    musicVolume: number;
    sfxVolume: number;
    theme: string;
  };
}
```

- [ ] **Step 4: Create SaveManager.ts**

```typescript
// src/persistence/SaveManager.ts
import type { SaveData } from './SaveData';

export class SaveManager {
  private static readonly SAVE_KEY = 'subway_surf_save';
  private static readonly CURRENT_VERSION = 1;

  static save(data: SaveData): void {
    data.version = SaveManager.CURRENT_VERSION;
    try {
      localStorage.setItem(SaveManager.SAVE_KEY, JSON.stringify(data));
    } catch {
      // localStorage full or unavailable — silently fail
    }
  }

  static load(): SaveData {
    try {
      const raw = localStorage.getItem(SaveManager.SAVE_KEY);
      if (!raw) return SaveManager.defaultData();
      const data = JSON.parse(raw) as SaveData;
      return SaveManager.migrate(data);
    } catch {
      return SaveManager.defaultData();
    }
  }

  static reset(): void {
    localStorage.removeItem(SaveManager.SAVE_KEY);
  }

  static defaultData(): SaveData {
    return {
      version: SaveManager.CURRENT_VERSION,
      wallet: { coins: 0, keys: 0 },
      characters: { unlocked: ['default'], equipped: 'default' },
      skins: { unlocked: {}, equipped: {} },
      powerUpLevels: { jetpack: 1, magnet: 1, superSneakers: 1, multiplier: 1, hoverboard: 1 },
      hoverboardCount: 3,
      scoring: { highScore: 0, multiplierLevel: 1, missionSetIndex: 0 },
      missions: { active: [], dailyLastReset: '' },
      achievements: [],
      statistics: {
        totalCoinsCollected: 0,
        totalDistanceRun: 0,
        totalRuns: 0,
        totalTimePlayed: 0,
        totalJumps: 0,
        totalSlides: 0,
      },
      settings: { musicVolume: 0.7, sfxVolume: 1.0, theme: 'default_city' },
    };
  }

  static migrate(data: SaveData): SaveData {
    // Future: add migration logic when version changes
    return data;
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/unit/SaveManager.test.ts`
Expected: All 5 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/persistence/ tests/unit/SaveManager.test.ts
git commit -m "feat: add SaveManager with localStorage persistence and tests"
```

---

### Task 7: GameLoop

**Files:**

- Create: `src/core/GameLoop.ts`

- [ ] **Step 1: Implement GameLoop**

```typescript
// src/core/GameLoop.ts
import { GAME } from './Constants';

export type UpdateCallback = (deltaTime: number) => void;
export type RenderCallback = () => void;

export class GameLoop {
  private lastTime = 0;
  private running = false;
  private rafId = 0;
  private updateFn: UpdateCallback;
  private renderFn: RenderCallback;

  constructor(updateFn: UpdateCallback, renderFn: RenderCallback) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.tick = this.tick.bind(this);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private tick(currentTime: number): void {
    if (!this.running) return;

    const rawDelta = (currentTime - this.lastTime) / 1000;
    const deltaTime = Math.min(rawDelta, GAME.MAX_DELTA_TIME);
    this.lastTime = currentTime;

    this.updateFn(deltaTime);
    this.renderFn();

    this.rafId = requestAnimationFrame(this.tick);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/core/GameLoop.ts
git commit -m "feat: add GameLoop with delta-time capping"
```

---

### Task 8: WalletManager (with tests)

**Files:**

- Create: `src/economy/WalletManager.ts`
- Create: `tests/unit/WalletManager.test.ts`

- [ ] **Step 1: Write WalletManager tests**

```typescript
// tests/unit/WalletManager.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WalletManager } from '@economy/WalletManager';

// Mock localStorage
const mockStorage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
  clear: vi.fn(() => { for (const k in mockStorage) delete mockStorage[k]; }),
});

describe('WalletManager', () => {
  let wallet: WalletManager;

  beforeEach(() => {
    for (const k in mockStorage) delete mockStorage[k];
    wallet = new WalletManager();
  });

  it('starts with 0 coins and 0 keys', () => {
    expect(wallet.coins).toBe(0);
    expect(wallet.keys).toBe(0);
  });

  it('addCoins() increases balance', () => {
    wallet.addCoins(100);
    expect(wallet.coins).toBe(100);
  });

  it('spendCoins() decreases balance', () => {
    wallet.addCoins(200);
    expect(wallet.spendCoins(150)).toBe(true);
    expect(wallet.coins).toBe(50);
  });

  it('spendCoins() rejects insufficient funds', () => {
    wallet.addCoins(100);
    expect(wallet.spendCoins(200)).toBe(false);
    expect(wallet.coins).toBe(100);
  });

  it('canAfford() checks balance', () => {
    wallet.addCoins(500);
    expect(wallet.canAfford('coins', 500)).toBe(true);
    expect(wallet.canAfford('coins', 501)).toBe(false);
  });

  it('addKeys() and spendKeys() work', () => {
    wallet.addKeys(5);
    expect(wallet.keys).toBe(5);
    expect(wallet.spendKeys(3)).toBe(true);
    expect(wallet.keys).toBe(2);
    expect(wallet.spendKeys(3)).toBe(false);
    expect(wallet.keys).toBe(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/WalletManager.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement WalletManager**

```typescript
// src/economy/WalletManager.ts
import { SaveManager } from '@persistence/SaveManager';
import { eventBus } from '@core/EventBus';

export class WalletManager {
  private _coins: number;
  private _keys: number;

  constructor() {
    const data = SaveManager.load();
    this._coins = data.wallet.coins;
    this._keys = data.wallet.keys;
  }

  get coins(): number { return this._coins; }
  get keys(): number { return this._keys; }

  addCoins(amount: number): void {
    this._coins += amount;
    eventBus.emit('wallet:changed', { coins: this._coins, keys: this._keys });
  }

  spendCoins(amount: number): boolean {
    if (this._coins < amount) return false;
    this._coins -= amount;
    eventBus.emit('wallet:changed', { coins: this._coins, keys: this._keys });
    return true;
  }

  addKeys(amount: number): void {
    this._keys += amount;
    eventBus.emit('wallet:changed', { coins: this._coins, keys: this._keys });
  }

  spendKeys(amount: number): boolean {
    if (this._keys < amount) return false;
    this._keys -= amount;
    eventBus.emit('wallet:changed', { coins: this._coins, keys: this._keys });
    return true;
  }

  canAfford(currency: 'coins' | 'keys', amount: number): boolean {
    return currency === 'coins' ? this._coins >= amount : this._keys >= amount;
  }

  persist(): void {
    const data = SaveManager.load();
    data.wallet.coins = this._coins;
    data.wallet.keys = this._keys;
    SaveManager.save(data);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/WalletManager.test.ts`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/economy/WalletManager.ts tests/unit/WalletManager.test.ts
git commit -m "feat: add WalletManager with coins/keys and persistence"
```

---

### Task 9: ScoreManager (with tests)

**Files:**

- Create: `src/scoring/ScoreManager.ts`
- Create: `src/scoring/MultiplierTracker.ts`
- Create: `tests/unit/ScoreManager.test.ts`

- [ ] **Step 1: Write ScoreManager tests**

```typescript
// tests/unit/ScoreManager.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScoreManager } from '@scoring/ScoreManager';

const mockStorage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
  clear: vi.fn(() => { for (const k in mockStorage) delete mockStorage[k]; }),
});

describe('ScoreManager', () => {
  let score: ScoreManager;

  beforeEach(() => {
    for (const k in mockStorage) delete mockStorage[k];
    score = new ScoreManager();
  });

  it('starts at 0', () => {
    expect(score.current).toBe(0);
    expect(score.distance).toBe(0);
  });

  it('addDistance() increases score based on multiplier', () => {
    score.addDistance(10, 1); // 10 distance * 1x multiplier
    expect(score.current).toBe(10);
    expect(score.distance).toBe(10);
  });

  it('addCoinScore() adds coin score value', () => {
    score.addCoinScore(1);
    expect(score.current).toBe(100); // COIN_SCORE_VALUE = 100
  });

  it('activeMultiplier stacks with base', () => {
    score.setActiveMultiplier(2);
    score.addDistance(10, 1);
    expect(score.current).toBe(20);
  });

  it('reset() clears run scores', () => {
    score.addDistance(100, 1);
    score.addCoinScore(5);
    score.reset();
    expect(score.current).toBe(0);
    expect(score.distance).toBe(0);
  });

  it('tracks high score', () => {
    score.addDistance(1000, 1);
    score.finalizeRun();
    expect(score.highScore).toBe(1000);
  });

  it('isNewHighScore detects new records', () => {
    score.addDistance(500, 1);
    score.finalizeRun();
    score.reset();
    score.addDistance(600, 1);
    expect(score.isNewHighScore).toBe(true);
  });

  it('coinsCollected tracks per-run coins', () => {
    score.addCoinScore(1);
    score.addCoinScore(1);
    score.addCoinScore(1);
    expect(score.coinsCollected).toBe(3);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/ScoreManager.test.ts`
Expected: FAIL

- [ ] **Step 3: Create MultiplierTracker.ts**

```typescript
// src/scoring/MultiplierTracker.ts
import { ECONOMY } from '@core/Constants';
import { SaveManager } from '@persistence/SaveManager';

export class MultiplierTracker {
  private _level: number;

  constructor() {
    const data = SaveManager.load();
    this._level = data.scoring.multiplierLevel;
  }

  get level(): number { return this._level; }

  advance(): void {
    if (this._level < ECONOMY.MAX_MULTIPLIER) {
      this._level++;
    }
  }

  persist(): void {
    const data = SaveManager.load();
    data.scoring.multiplierLevel = this._level;
    SaveManager.save(data);
  }
}
```

- [ ] **Step 4: Create ScoreManager.ts**

```typescript
// src/scoring/ScoreManager.ts
import { ECONOMY } from '@core/Constants';
import { SaveManager } from '@persistence/SaveManager';
import { eventBus } from '@core/EventBus';

export class ScoreManager {
  private _score = 0;
  private _distance = 0;
  private _coinsCollected = 0;
  private _activeMultiplier = 1;
  private _highScore: number;

  constructor() {
    const data = SaveManager.load();
    this._highScore = data.scoring.highScore;
  }

  get current(): number { return Math.floor(this._score); }
  get distance(): number { return this._distance; }
  get coinsCollected(): number { return this._coinsCollected; }
  get highScore(): number { return this._highScore; }
  get isNewHighScore(): boolean { return this._score > this._highScore; }

  setActiveMultiplier(mult: number): void {
    this._activeMultiplier = mult;
  }

  addDistance(distanceDelta: number, baseMultiplier: number): void {
    this._distance += distanceDelta;
    this._score += distanceDelta * baseMultiplier * this._activeMultiplier;
    eventBus.emit('score:changed', { score: this.current, distance: this._distance });
  }

  addCoinScore(baseMultiplier: number): void {
    this._coinsCollected++;
    this._score += ECONOMY.COIN_SCORE_VALUE * baseMultiplier * this._activeMultiplier;
    eventBus.emit('score:changed', { score: this.current, distance: this._distance });
  }

  finalizeRun(): void {
    if (this._score > this._highScore) {
      this._highScore = Math.floor(this._score);
      const data = SaveManager.load();
      data.scoring.highScore = this._highScore;
      SaveManager.save(data);
    }
  }

  reset(): void {
    this._score = 0;
    this._distance = 0;
    this._coinsCollected = 0;
    this._activeMultiplier = 1;
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/unit/ScoreManager.test.ts`
Expected: All 8 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/scoring/ tests/unit/ScoreManager.test.ts
git commit -m "feat: add ScoreManager + MultiplierTracker with tests"
```

---

## Phase 2: Input, Player, & Rendering

### Task 10: Input System

**Files:**

- Create: `src/input/KeyboardHandler.ts`
- Create: `src/input/SwipeHandler.ts`
- Create: `src/input/InputManager.ts`

- [ ] **Step 1: Create KeyboardHandler.ts**

```typescript
// src/input/KeyboardHandler.ts

export type GameAction = 'left' | 'right' | 'jump' | 'slide' | 'pause' | 'hoverboard';

const KEY_MAP: Record<string, GameAction> = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'jump',
  KeyW: 'jump',
  Space: 'jump',
  ArrowDown: 'slide',
  KeyS: 'slide',
  Escape: 'pause',
  KeyP: 'pause',
  Enter: 'hoverboard',
};

export class KeyboardHandler {
  private onAction: (action: GameAction) => void;
  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(onAction: (action: GameAction) => void) {
    this.onAction = onAction;
    this.boundKeyDown = this.handleKeyDown.bind(this);
  }

  enable(): void {
    window.addEventListener('keydown', this.boundKeyDown);
  }

  disable(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const action = KEY_MAP[e.code];
    if (action) {
      e.preventDefault();
      this.onAction(action);
    }
  }
}
```

- [ ] **Step 2: Create SwipeHandler.ts**

```typescript
// src/input/SwipeHandler.ts
import { INPUT } from '@core/Constants';
import type { GameAction } from './KeyboardHandler';

export class SwipeHandler {
  private onAction: (action: GameAction) => void;
  private startX = 0;
  private startY = 0;
  private startTime = 0;

  private boundTouchStart: (e: TouchEvent) => void;
  private boundTouchEnd: (e: TouchEvent) => void;

  constructor(onAction: (action: GameAction) => void) {
    this.onAction = onAction;
    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);
  }

  enable(): void {
    window.addEventListener('touchstart', this.boundTouchStart, { passive: false });
    window.addEventListener('touchend', this.boundTouchEnd, { passive: false });
  }

  disable(): void {
    window.removeEventListener('touchstart', this.boundTouchStart);
    window.removeEventListener('touchend', this.boundTouchEnd);
  }

  private handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = performance.now();
  }

  private handleTouchEnd(e: TouchEvent): void {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - this.startX;
    const dy = touch.clientY - this.startY;
    const elapsed = performance.now() - this.startTime;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Tap detection (short distance, short time)
    if (distance < INPUT.MIN_SWIPE_DISTANCE && elapsed < INPUT.MAX_SWIPE_TIME) {
      this.onAction('hoverboard');
      return;
    }

    if (distance < INPUT.MIN_SWIPE_DISTANCE) return;
    if (elapsed > INPUT.MAX_SWIPE_TIME) return;

    const angle = Math.atan2(-dy, dx) * (180 / Math.PI);

    // Classify direction with dead zone
    const dz = INPUT.DEAD_ZONE_ANGLE;
    if (angle > -dz && angle < dz) {
      this.onAction('right');
    } else if (angle > 90 - dz && angle < 90 + dz) {
      this.onAction('jump');
    } else if (angle > 180 - dz || angle < -180 + dz) {
      this.onAction('left');
    } else if (angle > -90 - dz && angle < -90 + dz) {
      this.onAction('slide');
    }
  }
}
```

- [ ] **Step 3: Create InputManager.ts**

```typescript
// src/input/InputManager.ts
import { INPUT } from '@core/Constants';
import { KeyboardHandler, type GameAction } from './KeyboardHandler';
import { SwipeHandler } from './SwipeHandler';
import { eventBus } from '@core/EventBus';

export class InputManager {
  private keyboard: KeyboardHandler;
  private swipe: SwipeHandler;
  private buffer: GameAction[] = [];
  private enabled = false;

  constructor() {
    const onAction = (action: GameAction) => this.enqueue(action);
    this.keyboard = new KeyboardHandler(onAction);
    this.swipe = new SwipeHandler(onAction);
  }

  enable(): void {
    if (this.enabled) return;
    this.enabled = true;
    this.keyboard.enable();
    this.swipe.enable();
  }

  disable(): void {
    this.enabled = false;
    this.keyboard.disable();
    this.swipe.disable();
  }

  private enqueue(action: GameAction): void {
    // Pause is immediate, not buffered
    if (action === 'pause') {
      eventBus.emit('input:pause', null);
      return;
    }
    if (action === 'hoverboard') {
      eventBus.emit('input:hoverboard', null);
      return;
    }

    if (this.buffer.length >= INPUT.BUFFER_SIZE) {
      this.buffer.shift();
    }
    this.buffer.push(action);
  }

  dequeue(): GameAction | null {
    return this.buffer.shift() ?? null;
  }

  flush(): void {
    this.buffer.length = 0;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/input/
git commit -m "feat: add input system — keyboard, swipe, input buffer"
```

---

### Task 11: Scene Setup & Camera

**Files:**

- Create: `src/rendering/SceneSetup.ts`
- Create: `src/rendering/CameraController.ts`

- [ ] **Step 1: Create SceneSetup.ts**

```typescript
// src/rendering/SceneSetup.ts
import * as THREE from 'three';

export interface SceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}

export function createSceneContext(canvas: HTMLCanvasElement): SceneContext {
  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Sky blue
  scene.fog = new THREE.Fog(0x87ceeb, 80, 200);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    300
  );

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 15, 10);
  scene.add(directionalLight);

  // Hemisphere light for natural ground/sky coloring
  const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x444444, 0.4);
  scene.add(hemiLight);

  // Resize handler
  const onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  return { scene, camera, renderer };
}
```

- [ ] **Step 2: Create CameraController.ts**

```typescript
// src/rendering/CameraController.ts
import * as THREE from 'three';
import { lerp } from '@utils/MathUtils';

export class CameraController {
  private camera: THREE.PerspectiveCamera;

  // Camera offset from player
  private readonly offsetY = 6;
  private readonly offsetZ = -12;
  private readonly lookAheadZ = 10;
  private readonly smoothSpeed = 5;

  private currentY: number;
  private currentZ: number;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.currentY = this.offsetY;
    this.currentZ = this.offsetZ;
    // Initial position
    this.camera.position.set(0, this.offsetY, this.offsetZ);
    this.camera.lookAt(0, 1, this.lookAheadZ);
  }

  update(playerZ: number, deltaTime: number): void {
    const targetY = this.offsetY;
    const targetZ = playerZ + this.offsetZ;

    this.currentY = lerp(this.currentY, targetY, this.smoothSpeed * deltaTime);
    this.currentZ = lerp(this.currentZ, targetZ, this.smoothSpeed * deltaTime);

    this.camera.position.set(0, this.currentY, this.currentZ);
    this.camera.lookAt(0, 1.5, playerZ + this.lookAheadZ);
  }

  reset(playerZ: number): void {
    this.currentY = this.offsetY;
    this.currentZ = playerZ + this.offsetZ;
    this.camera.position.set(0, this.currentY, this.currentZ);
    this.camera.lookAt(0, 1.5, playerZ + this.lookAheadZ);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/rendering/SceneSetup.ts src/rendering/CameraController.ts
git commit -m "feat: add Three.js scene setup and smooth-follow camera"
```

---

### Task 12: Player Controller & Model

**Files:**

- Create: `src/player/PlayerController.ts`
- Create: `src/player/PlayerModel.ts`
- Create: `src/player/PlayerCollision.ts`
- Create: `tests/unit/PlayerCollision.test.ts`

- [ ] **Step 1: Create PlayerCollision.ts and tests**

```typescript
// tests/unit/PlayerCollision.test.ts
import { describe, it, expect } from 'vitest';
import { aabbIntersect, type AABB } from '@player/PlayerCollision';

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
```

```typescript
// src/player/PlayerCollision.ts

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
```

- [ ] **Step 2: Run collision tests**

Run: `npx vitest run tests/unit/PlayerCollision.test.ts`
Expected: All 4 tests PASS

- [ ] **Step 3: Create PlayerModel.ts**

```typescript
// src/player/PlayerModel.ts
import * as THREE from 'three';
import { PLAYER, PHYSICS } from '@core/Constants';

export type PlayerAnimState = 'run' | 'jump' | 'slide' | 'crash';

export class PlayerModel {
  readonly group: THREE.Group;
  private body: THREE.Mesh;
  private head: THREE.Mesh;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;
  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;
  private animTime = 0;
  private currentAnim: PlayerAnimState = 'run';

  constructor() {
    this.group = new THREE.Group();

    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x2196f3 });
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffccaa });
    const shoesMat = new THREE.MeshLambertMaterial({ color: 0x333333 });

    // Body (torso)
    this.body = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.6, 0.3),
      bodyMat
    );
    this.body.position.y = 1.0;

    // Head
    this.head = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.35, 0.35),
      skinMat
    );
    this.head.position.y = 1.55;

    // Arms
    this.leftArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.5, 0.15),
      bodyMat
    );
    this.leftArm.position.set(-0.35, 1.0, 0);

    this.rightArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.5, 0.15),
      bodyMat
    );
    this.rightArm.position.set(0.35, 1.0, 0);

    // Legs
    this.leftLeg = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.5, 0.18),
      shoesMat
    );
    this.leftLeg.position.set(-0.13, 0.4, 0);

    this.rightLeg = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.5, 0.18),
      shoesMat
    );
    this.rightLeg.position.set(0.13, 0.4, 0);

    this.group.add(this.body, this.head, this.leftArm, this.rightArm, this.leftLeg, this.rightLeg);
  }

  setAnimation(state: PlayerAnimState): void {
    if (this.currentAnim === state) return;
    this.currentAnim = state;
    this.animTime = 0;

    // Reset all transforms
    this.body.rotation.set(0, 0, 0);
    this.head.rotation.set(0, 0, 0);
    this.group.scale.set(1, 1, 1);
    this.body.position.y = 1.0;
    this.head.position.y = 1.55;
    this.leftArm.position.y = 1.0;
    this.rightArm.position.y = 1.0;
    this.leftLeg.position.y = 0.4;
    this.rightLeg.position.y = 0.4;

    if (state === 'slide') {
      // Flatten the character for slide
      this.group.scale.set(1, 0.4, 1);
    }
  }

  update(deltaTime: number): void {
    this.animTime += deltaTime;

    if (this.currentAnim === 'run') {
      const speed = 12;
      const swing = Math.sin(this.animTime * speed) * 0.4;
      this.leftArm.rotation.x = swing;
      this.rightArm.rotation.x = -swing;
      this.leftLeg.rotation.x = -swing;
      this.rightLeg.rotation.x = swing;
      // Subtle body bob
      this.body.position.y = 1.0 + Math.abs(Math.sin(this.animTime * speed)) * 0.03;
    } else if (this.currentAnim === 'jump') {
      // Tuck legs slightly
      this.leftLeg.rotation.x = -0.4;
      this.rightLeg.rotation.x = -0.4;
      this.leftArm.rotation.x = -0.6;
      this.rightArm.rotation.x = -0.6;
    }
  }
}
```

- [ ] **Step 4: Create PlayerController.ts**

```typescript
// src/player/PlayerController.ts
import * as THREE from 'three';
import { GAME, PHYSICS, PLAYER } from '@core/Constants';
import { moveTowards, clamp } from '@utils/MathUtils';
import { PlayerModel, type PlayerAnimState } from './PlayerModel';
import { createPlayerAABB, type AABB } from './PlayerCollision';
import { eventBus } from '@core/EventBus';

export type PlayerState = 'grounded' | 'jumping' | 'sliding' | 'dead';

export class PlayerController {
  readonly model: PlayerModel;
  private targetLane = 0;     // -1, 0, 1
  private currentX = 0;
  private positionY = 0;
  private positionZ = 0;
  private verticalVelocity = 0;
  private state: PlayerState = 'grounded';
  private slideTimer = 0;
  private immune = false;
  private immuneTimer = 0;

  constructor() {
    this.model = new PlayerModel();
  }

  get lane(): number { return this.targetLane; }
  get x(): number { return this.currentX; }
  get y(): number { return this.positionY; }
  get z(): number { return this.positionZ; }
  get isImmune(): boolean { return this.immune; }
  get isDead(): boolean { return this.state === 'dead'; }
  get currentState(): PlayerState { return this.state; }

  getAABB(): AABB {
    const height = this.state === 'sliding' ? PLAYER.SLIDING_HEIGHT : PLAYER.STANDING_HEIGHT;
    return createPlayerAABB(
      this.currentX, this.positionY, this.positionZ,
      PLAYER.STANDING_WIDTH, height, PLAYER.STANDING_DEPTH
    );
  }

  moveLeft(): void {
    if (this.state === 'dead') return;
    if (this.targetLane > -1) {
      this.targetLane--;
      eventBus.emit('player:laneSwitch', this.targetLane);
    }
  }

  moveRight(): void {
    if (this.state === 'dead') return;
    if (this.targetLane < 1) {
      this.targetLane++;
      eventBus.emit('player:laneSwitch', this.targetLane);
    }
  }

  jump(): void {
    if (this.state !== 'grounded' && this.state !== 'sliding') return;
    if (this.state === 'sliding') {
      this.slideTimer = 0;
      this.state = 'grounded';
      this.model.setAnimation('run');
    }
    this.verticalVelocity = PHYSICS.JUMP_FORCE;
    this.state = 'jumping';
    this.model.setAnimation('jump');
    eventBus.emit('player:jump', null);
  }

  slide(): void {
    if (this.state === 'jumping') {
      // Fast-fall from jump
      this.verticalVelocity = -PHYSICS.JUMP_FORCE;
      return;
    }
    if (this.state !== 'grounded') return;
    this.state = 'sliding';
    this.slideTimer = PHYSICS.SLIDE_DURATION;
    this.model.setAnimation('slide');
    eventBus.emit('player:slide', null);
  }

  hit(): void {
    if (this.immune) return;
    this.state = 'dead';
    this.model.setAnimation('crash');
    eventBus.emit('player:crash', null);
  }

  revive(): void {
    this.state = 'grounded';
    this.model.setAnimation('run');
    this.setImmune(2);
    this.verticalVelocity = 0;
    this.positionY = PHYSICS.GROUND_Y;
  }

  setImmune(duration: number): void {
    this.immune = true;
    this.immuneTimer = duration;
  }

  update(deltaTime: number, speed: number): void {
    if (this.state === 'dead') return;

    // Forward movement
    this.positionZ += speed * deltaTime;

    // Lane switching (horizontal)
    const targetX = this.targetLane * GAME.LANE_WIDTH;
    this.currentX = moveTowards(this.currentX, targetX, PHYSICS.LANE_SWITCH_SPEED * deltaTime);

    // Vertical physics (jump/fall)
    if (this.state === 'jumping') {
      this.verticalVelocity += PHYSICS.GRAVITY * deltaTime;
      this.positionY += this.verticalVelocity * deltaTime;

      if (this.positionY <= PHYSICS.GROUND_Y) {
        this.positionY = PHYSICS.GROUND_Y;
        this.verticalVelocity = 0;
        this.state = 'grounded';
        this.model.setAnimation('run');
      }
    }

    // Slide timer
    if (this.state === 'sliding') {
      this.slideTimer -= deltaTime;
      if (this.slideTimer <= 0) {
        this.state = 'grounded';
        this.model.setAnimation('run');
      }
    }

    // Immunity timer
    if (this.immune) {
      this.immuneTimer -= deltaTime;
      if (this.immuneTimer <= 0) {
        this.immune = false;
        this.immuneTimer = 0;
      }
      // Blink effect
      this.model.group.visible = Math.floor(this.immuneTimer * 10) % 2 === 0;
    } else {
      this.model.group.visible = true;
    }

    // Update mesh position
    this.model.group.position.set(this.currentX, this.positionY, this.positionZ);
    this.model.update(deltaTime);
  }

  reset(): void {
    this.targetLane = 0;
    this.currentX = 0;
    this.positionY = PHYSICS.GROUND_Y;
    this.positionZ = 0;
    this.verticalVelocity = 0;
    this.state = 'grounded';
    this.slideTimer = 0;
    this.immune = false;
    this.immuneTimer = 0;
    this.model.setAnimation('run');
    this.model.group.position.set(0, 0, 0);
    this.model.group.visible = true;
  }
}
```

- [ ] **Step 5: Run collision tests**

Run: `npx vitest run tests/unit/PlayerCollision.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/player/ tests/unit/PlayerCollision.test.ts
git commit -m "feat: add player controller, model, collision — 3-lane movement, jump, slide"
```

---

## Phase 3: Track, Obstacles, Coins

### Task 13: Track Generation

**Files:**

- Create: `src/track/TrackSegment.ts`
- Create: `src/track/TrackGenerator.ts`
- Create: `src/track/EnvironmentProps.ts`

- [ ] **Step 1: Create TrackSegment.ts**

```typescript
// src/track/TrackSegment.ts
import * as THREE from 'three';
import { GAME } from '@core/Constants';

export class TrackSegment {
  readonly group: THREE.Group;
  private ground: THREE.Mesh;
  private leftRail: THREE.Mesh;
  private rightRail: THREE.Mesh;
  index = 0;

  constructor() {
    this.group = new THREE.Group();

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(GAME.LANE_WIDTH * 3 + 2, GAME.SEGMENT_LENGTH);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.set(0, -0.01, GAME.SEGMENT_LENGTH / 2);

    // Lane divider lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });

    // Left rail (track border)
    const railGeo = new THREE.BoxGeometry(0.15, 0.3, GAME.SEGMENT_LENGTH);
    this.leftRail = new THREE.Mesh(railGeo, new THREE.MeshLambertMaterial({ color: 0x888888 }));
    this.leftRail.position.set(-GAME.LANE_WIDTH * 1.5 - 0.5, 0.15, GAME.SEGMENT_LENGTH / 2);

    this.rightRail = new THREE.Mesh(railGeo, new THREE.MeshLambertMaterial({ color: 0x888888 }));
    this.rightRail.position.set(GAME.LANE_WIDTH * 1.5 + 0.5, 0.15, GAME.SEGMENT_LENGTH / 2);

    // Lane lines
    const lineGeo = new THREE.PlaneGeometry(0.08, GAME.SEGMENT_LENGTH);
    const leftLine = new THREE.Mesh(lineGeo, lineMat);
    leftLine.rotation.x = -Math.PI / 2;
    leftLine.position.set(-GAME.LANE_WIDTH / 2, 0.001, GAME.SEGMENT_LENGTH / 2);

    const rightLine = new THREE.Mesh(lineGeo, lineMat);
    rightLine.rotation.x = -Math.PI / 2;
    rightLine.position.set(GAME.LANE_WIDTH / 2, 0.001, GAME.SEGMENT_LENGTH / 2);

    this.group.add(this.ground, this.leftRail, this.rightRail, leftLine, rightLine);
  }

  setPosition(z: number, index: number): void {
    this.group.position.z = z;
    this.index = index;
  }

  reset(): void {
    this.group.position.set(0, 0, 0);
    this.index = 0;
  }
}
```

- [ ] **Step 2: Create EnvironmentProps.ts**

```typescript
// src/track/EnvironmentProps.ts
import * as THREE from 'three';
import { GAME } from '@core/Constants';
import { randomFloat, randomInt } from '@utils/RandomUtils';

const BUILDING_COLORS = [0x667788, 0x556677, 0x778899, 0x889999, 0x997788];

export function addEnvironmentProps(group: THREE.Group, segmentZ: number): void {
  const sideOffset = GAME.LANE_WIDTH * 1.5 + 2;
  const segLen = GAME.SEGMENT_LENGTH;

  // Buildings on both sides
  const numBuildings = randomInt(2, 4);
  for (let i = 0; i < numBuildings; i++) {
    const height = randomFloat(4, 12);
    const width = randomFloat(2, 5);
    const depth = randomFloat(3, 8);
    const z = randomFloat(2, segLen - 2);

    const color = BUILDING_COLORS[randomInt(0, BUILDING_COLORS.length - 1)];

    // Left side building
    const leftGeo = new THREE.BoxGeometry(width, height, depth);
    const leftMat = new THREE.MeshLambertMaterial({ color });
    const leftBuilding = new THREE.Mesh(leftGeo, leftMat);
    leftBuilding.position.set(-sideOffset - width / 2, height / 2, z);
    group.add(leftBuilding);

    // Right side building
    const rightGeo = new THREE.BoxGeometry(width, height, depth);
    const rightMat = new THREE.MeshLambertMaterial({ color });
    const rightBuilding = new THREE.Mesh(rightGeo, rightMat);
    rightBuilding.position.set(sideOffset + width / 2, height / 2, z);
    group.add(rightBuilding);
  }
}

export function clearEnvironmentProps(group: THREE.Group): void {
  // Remove everything except the base track elements (first 5 children)
  while (group.children.length > 5) {
    const child = group.children[group.children.length - 1];
    group.remove(child);
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (child.material instanceof THREE.Material) {
        child.material.dispose();
      }
    }
  }
}
```

- [ ] **Step 3: Create TrackGenerator.ts**

```typescript
// src/track/TrackGenerator.ts
import * as THREE from 'three';
import { GAME } from '@core/Constants';
import { ObjectPool } from '@core/ObjectPool';
import { POOL_SIZES } from '@core/Constants';
import { TrackSegment } from './TrackSegment';
import { addEnvironmentProps, clearEnvironmentProps } from './EnvironmentProps';

export class TrackGenerator {
  private pool: ObjectPool<TrackSegment>;
  private activeSegments: TrackSegment[] = [];
  private lastSpawnedIndex = -1;
  private firstActiveIndex = 0;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.pool = new ObjectPool(
      () => new TrackSegment(),
      (seg) => {
        clearEnvironmentProps(seg.group);
        seg.reset();
      },
      POOL_SIZES.TRACK_SEGMENT
    );
  }

  get segments(): TrackSegment[] {
    return this.activeSegments;
  }

  init(): void {
    // Pre-spawn initial segments
    for (let i = -1; i < GAME.SPAWN_AHEAD; i++) {
      this.spawnSegment(i);
    }
    this.lastSpawnedIndex = GAME.SPAWN_AHEAD - 1;
    this.firstActiveIndex = -1;
  }

  update(playerZ: number): void {
    const playerIndex = Math.floor(playerZ / GAME.SEGMENT_LENGTH);

    // Spawn ahead
    while (this.lastSpawnedIndex < playerIndex + GAME.SPAWN_AHEAD) {
      this.lastSpawnedIndex++;
      this.spawnSegment(this.lastSpawnedIndex);
    }

    // Despawn behind
    while (this.firstActiveIndex < playerIndex - GAME.DESPAWN_BEHIND) {
      const seg = this.activeSegments.shift();
      if (seg) {
        this.scene.remove(seg.group);
        this.pool.release(seg);
      }
      this.firstActiveIndex++;
    }
  }

  private spawnSegment(index: number): void {
    const seg = this.pool.get();
    if (!seg) return;

    const z = index * GAME.SEGMENT_LENGTH;
    seg.setPosition(z, index);
    addEnvironmentProps(seg.group, z);
    this.scene.add(seg.group);
    this.activeSegments.push(seg);
  }

  getSegmentAtZ(z: number): TrackSegment | null {
    const index = Math.floor(z / GAME.SEGMENT_LENGTH);
    return this.activeSegments.find(s => s.index === index) ?? null;
  }

  reset(): void {
    for (const seg of this.activeSegments) {
      this.scene.remove(seg.group);
      this.pool.release(seg);
    }
    this.activeSegments = [];
    this.lastSpawnedIndex = -1;
    this.firstActiveIndex = 0;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/track/
git commit -m "feat: add procedural track generation with object pooling and environment props"
```

---

### Task 14: Obstacle System

**Files:**

- Create: `src/obstacles/ObstacleTypes.ts`
- Create: `src/obstacles/ObstacleFactory.ts`
- Create: `src/obstacles/ObstacleManager.ts`

- [ ] **Step 1: Create ObstacleTypes.ts**

```typescript
// src/obstacles/ObstacleTypes.ts
import * as THREE from 'three';
import type { AABB } from '@player/PlayerCollision';

export type AvoidAction = 'jump' | 'slide' | 'lane_switch';
export type ObstacleType = 'static' | 'dynamic_forward' | 'dynamic_oncoming';

export interface ObstacleConfig {
  id: string;
  type: ObstacleType;
  avoidActions: AvoidAction[];
  minLanes: number;
  maxLanes: number;
  minDistance: number;
  speedMultiplier: number;
  weight: number;
  width: number;
  height: number;
  depth: number;
  color: number;
}

export const OBSTACLE_CONFIGS: ObstacleConfig[] = [
  {
    id: 'low_barrier',
    type: 'static',
    avoidActions: ['jump'],
    minLanes: 1, maxLanes: 2,
    minDistance: 0,
    speedMultiplier: 0,
    weight: 35,
    width: 2.0, height: 0.6, depth: 0.5,
    color: 0xff4444,
  },
  {
    id: 'high_barrier',
    type: 'static',
    avoidActions: ['slide'],
    minLanes: 1, maxLanes: 2,
    minDistance: 0,
    speedMultiplier: 0,
    weight: 30,
    width: 2.0, height: 2.5, depth: 0.3,
    color: 0xffaa00,
  },
  {
    id: 'full_barrier',
    type: 'static',
    avoidActions: ['lane_switch'],
    minLanes: 1, maxLanes: 1,
    minDistance: 200,
    speedMultiplier: 0,
    weight: 25,
    width: 2.2, height: 2.5, depth: 3.0,
    color: 0x4488ff,
  },
  {
    id: 'train_moving',
    type: 'dynamic_forward',
    avoidActions: ['lane_switch'],
    minLanes: 1, maxLanes: 1,
    minDistance: 500,
    speedMultiplier: 0.7,
    weight: 10,
    width: 2.2, height: 3.0, depth: 8.0,
    color: 0x22cc44,
  },
];

export interface ObstacleInstance {
  config: ObstacleConfig;
  mesh: THREE.Group;
  lane: number;
  z: number;
  active: boolean;
  aabb: AABB;
}
```

- [ ] **Step 2: Create ObstacleFactory.ts**

```typescript
// src/obstacles/ObstacleFactory.ts
import * as THREE from 'three';
import type { ObstacleConfig, ObstacleInstance } from './ObstacleTypes';
import type { AABB } from '@player/PlayerCollision';
import { GAME } from '@core/Constants';

export function createObstacleMesh(config: ObstacleConfig): THREE.Group {
  const group = new THREE.Group();
  const geo = new THREE.BoxGeometry(config.width, config.height, config.depth);
  const mat = new THREE.MeshLambertMaterial({ color: config.color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = config.height / 2;

  // Add stripe detail for visual interest
  if (config.id === 'low_barrier') {
    const stripeGeo = new THREE.BoxGeometry(config.width + 0.02, 0.1, config.depth + 0.02);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = config.height / 2;
    group.add(stripe);
  }

  if (config.id === 'high_barrier') {
    // Overhead sign look: two poles + board
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, config.height);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const leftPole = new THREE.Mesh(poleGeo, poleMat);
    leftPole.position.set(-config.width / 2 + 0.1, config.height / 2, 0);
    const rightPole = new THREE.Mesh(poleGeo, poleMat);
    rightPole.position.set(config.width / 2 - 0.1, config.height / 2, 0);
    group.add(leftPole, rightPole);
    // Board at top only (gap below for sliding)
    mesh.position.y = config.height - 0.5;
    mesh.scale.y = 0.4;
  }

  group.add(mesh);
  return group;
}

export function computeObstacleAABB(config: ObstacleConfig, x: number, z: number): AABB {
  const hw = config.width / 2;
  const hd = config.depth / 2;
  return {
    minX: x - hw, maxX: x + hw,
    minY: 0,      maxY: config.height,
    minZ: z - hd, maxZ: z + hd,
  };
}

export function createObstacleInstance(config: ObstacleConfig, lane: number, z: number): ObstacleInstance {
  const mesh = createObstacleMesh(config);
  const x = lane * GAME.LANE_WIDTH;
  mesh.position.set(x, 0, z);
  return {
    config,
    mesh,
    lane,
    z,
    active: true,
    aabb: computeObstacleAABB(config, x, z),
  };
}
```

- [ ] **Step 3: Create ObstacleManager.ts**

```typescript
// src/obstacles/ObstacleManager.ts
import * as THREE from 'three';
import { GAME, DIFFICULTY } from '@core/Constants';
import { lerp } from '@utils/MathUtils';
import { randomInt, weightedRandom } from '@utils/RandomUtils';
import { OBSTACLE_CONFIGS, type ObstacleConfig, type ObstacleInstance } from './ObstacleTypes';
import { createObstacleInstance, computeObstacleAABB } from './ObstacleFactory';
import { aabbIntersect, type AABB } from '@player/PlayerCollision';

export class ObstacleManager {
  private scene: THREE.Scene;
  private obstacles: ObstacleInstance[] = [];
  private lastSpawnZ = 0;
  private nextSpawnDistance = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  update(playerZ: number, speed: number, distance: number, deltaTime: number): void {
    // Spawn new obstacles
    if (playerZ + GAME.SEGMENT_LENGTH * GAME.SPAWN_AHEAD > this.lastSpawnZ + this.nextSpawnDistance) {
      this.spawnObstacle(playerZ, distance);
    }

    // Update dynamic obstacles
    for (const obs of this.obstacles) {
      if (!obs.active) continue;

      if (obs.config.type === 'dynamic_forward') {
        const moveSpeed = speed * obs.config.speedMultiplier;
        obs.z += moveSpeed * deltaTime;
        obs.mesh.position.z = obs.z;
        const x = obs.lane * GAME.LANE_WIDTH;
        obs.aabb = computeObstacleAABB(obs.config, x, obs.z);
      }
    }

    // Despawn far behind
    this.obstacles = this.obstacles.filter(obs => {
      if (obs.z < playerZ - GAME.SEGMENT_LENGTH * 3) {
        this.scene.remove(obs.mesh);
        obs.active = false;
        return false;
      }
      return true;
    });
  }

  checkCollision(playerAABB: AABB): ObstacleInstance | null {
    for (const obs of this.obstacles) {
      if (!obs.active) continue;
      if (aabbIntersect(playerAABB, obs.aabb)) {
        return obs;
      }
    }
    return null;
  }

  private spawnObstacle(playerZ: number, distance: number): void {
    // Calculate spawn interval based on difficulty
    const t = Math.min(distance / DIFFICULTY.RAMP_DISTANCE, 1);
    const interval = lerp(DIFFICULTY.OBSTACLE_MAX_INTERVAL, DIFFICULTY.OBSTACLE_MIN_INTERVAL, t);

    // Get eligible configs
    const eligible = OBSTACLE_CONFIGS.filter(c => distance >= c.minDistance);
    if (eligible.length === 0) return;

    // Weighted random selection
    const weights: Record<string, number> = {};
    for (const c of eligible) weights[c.id] = c.weight;
    const selectedId = weightedRandom(weights);
    const config = eligible.find(c => c.id === selectedId)!;

    // Pick lanes (never block all 3)
    const numLanes = randomInt(config.minLanes, config.maxLanes);
    const lanes = this.pickLanes(numLanes);

    // Spawn position
    const spawnZ = playerZ + GAME.SEGMENT_LENGTH * (GAME.SPAWN_AHEAD - 1);

    for (const lane of lanes) {
      const obs = createObstacleInstance(config, lane, spawnZ);
      this.scene.add(obs.mesh);
      this.obstacles.push(obs);
    }

    this.lastSpawnZ = spawnZ;
    this.nextSpawnDistance = interval * GAME.BASE_SPEED; // Convert time interval to distance
  }

  private pickLanes(count: number): number[] {
    const allLanes = [-1, 0, 1];
    const result: number[] = [];
    const available = [...allLanes];

    for (let i = 0; i < Math.min(count, 2); i++) { // Max 2 to never block all 3
      const idx = randomInt(0, available.length - 1);
      result.push(available[idx]);
      available.splice(idx, 1);
    }
    return result;
  }

  reset(): void {
    for (const obs of this.obstacles) {
      this.scene.remove(obs.mesh);
    }
    this.obstacles = [];
    this.lastSpawnZ = 0;
    this.nextSpawnDistance = 0;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/obstacles/
git commit -m "feat: add obstacle system — factory, types, spawning with difficulty curve"
```

---

### Task 15: Coin System

**Files:**

- Create: `src/collectibles/Coin.ts`
- Create: `src/collectibles/CoinPatterns.ts`
- Create: `src/collectibles/CoinManager.ts`

- [ ] **Step 1: Create Coin.ts**

```typescript
// src/collectibles/Coin.ts
import * as THREE from 'three';
import type { AABB } from '@player/PlayerCollision';
import { PLAYER } from '@core/Constants';

export interface CoinInstance {
  mesh: THREE.Mesh;
  x: number;
  y: number;
  z: number;
  active: boolean;
}

// Shared geometry and material for all coins (performance)
let coinGeometry: THREE.CylinderGeometry | null = null;
let coinMaterial: THREE.MeshLambertMaterial | null = null;

function getCoinGeometry(): THREE.CylinderGeometry {
  if (!coinGeometry) {
    coinGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 12);
    coinGeometry.rotateX(Math.PI / 2);
  }
  return coinGeometry;
}

function getCoinMaterial(): THREE.MeshLambertMaterial {
  if (!coinMaterial) {
    coinMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700, emissive: 0xaa8800 });
  }
  return coinMaterial;
}

export function createCoinMesh(): THREE.Mesh {
  return new THREE.Mesh(getCoinGeometry(), getCoinMaterial());
}

export function getCoinAABB(coin: CoinInstance): AABB {
  const r = 0.3 * PLAYER.COLLECTIBLE_RADIUS_MULT;
  return {
    minX: coin.x - r, maxX: coin.x + r,
    minY: coin.y - r, maxY: coin.y + r,
    minZ: coin.z - r, maxZ: coin.z + r,
  };
}
```

- [ ] **Step 2: Create CoinPatterns.ts**

```typescript
// src/collectibles/CoinPatterns.ts
import { GAME } from '@core/Constants';
import { randomChoice, randomInt } from '@utils/RandomUtils';

export interface CoinPlacement {
  lane: number;  // -1, 0, 1
  y: number;     // height
  zOffset: number; // offset from pattern start
}

export function generateCoinPattern(patternType?: string): CoinPlacement[] {
  const type = patternType ?? randomChoice(['line', 'line', 'arc', 'jump_arc', 'cluster']);

  switch (type) {
    case 'line': return lineCoinPattern();
    case 'arc': return arcCoinPattern();
    case 'jump_arc': return jumpArcPattern();
    case 'cluster': return clusterPattern();
    default: return lineCoinPattern();
  }
}

function lineCoinPattern(): CoinPlacement[] {
  const lane = randomChoice([-1, 0, 1]);
  const count = randomInt(5, 8);
  const placements: CoinPlacement[] = [];
  for (let i = 0; i < count; i++) {
    placements.push({ lane, y: 1.0, zOffset: i * 2.0 });
  }
  return placements;
}

function arcCoinPattern(): CoinPlacement[] {
  const startLane = randomChoice([-1, 0]);
  const count = randomInt(6, 8);
  const placements: CoinPlacement[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const lane = Math.round(startLane + t * (startLane === -1 ? 2 : -2));
    placements.push({ lane: Math.max(-1, Math.min(1, lane)), y: 1.0, zOffset: i * 2.0 });
  }
  return placements;
}

function jumpArcPattern(): CoinPlacement[] {
  const lane = randomChoice([-1, 0, 1]);
  const count = randomInt(5, 7);
  const placements: CoinPlacement[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const y = 1.0 + Math.sin(t * Math.PI) * 3.0; // Arc up
    placements.push({ lane, y, zOffset: i * 2.0 });
  }
  return placements;
}

function clusterPattern(): CoinPlacement[] {
  const centerLane = randomChoice([-1, 0, 1]);
  const placements: CoinPlacement[] = [];
  const lanes = [centerLane];
  if (centerLane > -1) lanes.push(centerLane - 1);
  if (centerLane < 1) lanes.push(centerLane + 1);

  for (const lane of lanes) {
    for (let z = 0; z < 3; z++) {
      placements.push({ lane, y: 1.0, zOffset: z * 2.0 });
    }
  }
  return placements;
}
```

- [ ] **Step 3: Create CoinManager.ts**

```typescript
// src/collectibles/CoinManager.ts
import * as THREE from 'three';
import { GAME } from '@core/Constants';
import { createCoinMesh, getCoinAABB, type CoinInstance } from './Coin';
import { generateCoinPattern } from './CoinPatterns';
import { aabbIntersect, type AABB } from '@player/PlayerCollision';
import { eventBus } from '@core/EventBus';

export class CoinManager {
  private scene: THREE.Scene;
  private coins: CoinInstance[] = [];
  private lastPatternZ = 0;
  private patternInterval = 30; // Spawn pattern every N meters
  private rotationSpeed = 2.0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  update(playerZ: number, deltaTime: number): void {
    // Spawn new patterns ahead
    const spawnZ = playerZ + GAME.SEGMENT_LENGTH * (GAME.SPAWN_AHEAD - 1);
    while (this.lastPatternZ < spawnZ) {
      this.lastPatternZ += this.patternInterval;
      this.spawnPattern(this.lastPatternZ);
    }

    // Rotate coins + despawn behind
    const behindZ = playerZ - GAME.SEGMENT_LENGTH * 2;
    this.coins = this.coins.filter(coin => {
      if (!coin.active || coin.z < behindZ) {
        this.scene.remove(coin.mesh);
        coin.active = false;
        return false;
      }
      coin.mesh.rotation.y += this.rotationSpeed * deltaTime;
      return true;
    });
  }

  checkCollisions(playerAABB: AABB): number {
    let collected = 0;
    for (const coin of this.coins) {
      if (!coin.active) continue;
      const coinAABB = getCoinAABB(coin);
      if (aabbIntersect(playerAABB, coinAABB)) {
        coin.active = false;
        this.scene.remove(coin.mesh);
        collected++;
        eventBus.emit('coin:collected', null);
      }
    }
    return collected;
  }

  collectAllInRange(playerZ: number, radius: number): number {
    let collected = 0;
    for (const coin of this.coins) {
      if (!coin.active) continue;
      const dist = Math.abs(coin.z - playerZ);
      if (dist < radius) {
        coin.active = false;
        this.scene.remove(coin.mesh);
        collected++;
        eventBus.emit('coin:collected', null);
      }
    }
    return collected;
  }

  private spawnPattern(baseZ: number): void {
    const pattern = generateCoinPattern();
    for (const p of pattern) {
      const mesh = createCoinMesh();
      const x = p.lane * GAME.LANE_WIDTH;
      const z = baseZ + p.zOffset;
      mesh.position.set(x, p.y, z);

      const coin: CoinInstance = { mesh, x, y: p.y, z, active: true };
      this.coins.push(coin);
      this.scene.add(mesh);
    }
  }

  reset(): void {
    for (const coin of this.coins) {
      this.scene.remove(coin.mesh);
    }
    this.coins = [];
    this.lastPatternZ = 0;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/collectibles/
git commit -m "feat: add coin system — patterns, spawning, collection with generous pickup radius"
```

---

## Phase 4: Power-Ups & Economy

### Task 16: Power-Up System

**Files:**

- Create: `src/powerups/PowerUpBase.ts`
- Create: `src/powerups/Jetpack.ts`
- Create: `src/powerups/Magnet.ts`
- Create: `src/powerups/PowerUpManager.ts`

- [ ] **Step 1: Create PowerUpBase.ts**

```typescript
// src/powerups/PowerUpBase.ts
import { eventBus } from '@core/EventBus';

export abstract class PowerUpBase {
  readonly id: string;
  protected duration: number;
  protected timer = 0;
  protected _active = false;

  constructor(id: string, duration: number) {
    this.id = id;
    this.duration = duration;
  }

  get active(): boolean { return this._active; }
  get timeRemaining(): number { return Math.max(0, this.duration - this.timer); }
  get progress(): number { return this._active ? 1 - (this.timer / this.duration) : 0; }

  activate(): void {
    this._active = true;
    this.timer = 0;
    this.onActivate();
    eventBus.emit('powerup:activated', { id: this.id, duration: this.duration });
  }

  deactivate(): void {
    this._active = false;
    this.timer = 0;
    this.onDeactivate();
    eventBus.emit('powerup:deactivated', { id: this.id });
  }

  update(deltaTime: number): void {
    if (!this._active) return;
    this.timer += deltaTime;
    this.onUpdate(deltaTime);

    if (this.timer >= this.duration) {
      this.deactivate();
    }
  }

  protected abstract onActivate(): void;
  protected abstract onDeactivate(): void;
  protected abstract onUpdate(deltaTime: number): void;
}
```

- [ ] **Step 2: Create Jetpack.ts**

```typescript
// src/powerups/Jetpack.ts
import { PowerUpBase } from './PowerUpBase';

const DURATIONS = [6, 8, 10, 13, 16];
const FLIGHT_HEIGHT = 15;

export class Jetpack extends PowerUpBase {
  private _flightHeight = 0;
  private level: number;

  constructor(level: number = 1) {
    super('jetpack', DURATIONS[Math.min(level - 1, DURATIONS.length - 1)]);
    this.level = level;
  }

  get flightHeight(): number { return this._flightHeight; }
  get bypassObstacles(): boolean { return this._active; }

  protected onActivate(): void {
    this._flightHeight = FLIGHT_HEIGHT;
  }

  protected onDeactivate(): void {
    this._flightHeight = 0;
  }

  protected onUpdate(_deltaTime: number): void {
    // Jetpack keeps player at flight height — handled by PlayerController
  }
}
```

- [ ] **Step 3: Create Magnet.ts**

```typescript
// src/powerups/Magnet.ts
import { PowerUpBase } from './PowerUpBase';

const DURATIONS = [6, 8, 10, 13, 16];
const RADII = [3, 4, 5, 6, 8];

export class Magnet extends PowerUpBase {
  private _radius: number;
  private level: number;

  constructor(level: number = 1) {
    super('magnet', DURATIONS[Math.min(level - 1, DURATIONS.length - 1)]);
    this.level = level;
    this._radius = RADII[Math.min(level - 1, RADII.length - 1)];
  }

  get radius(): number { return this._active ? this._radius : 0; }

  protected onActivate(): void {}
  protected onDeactivate(): void {}
  protected onUpdate(_deltaTime: number): void {}
}
```

- [ ] **Step 4: Create PowerUpManager.ts**

```typescript
// src/powerups/PowerUpManager.ts
import * as THREE from 'three';
import { GAME, POWERUP } from '@core/Constants';
import { weightedRandom, randomChoice } from '@utils/RandomUtils';
import { aabbIntersect, type AABB } from '@player/PlayerCollision';
import { PowerUpBase } from './PowerUpBase';
import { Jetpack } from './Jetpack';
import { Magnet } from './Magnet';
import { eventBus } from '@core/EventBus';

interface PowerUpPickup {
  mesh: THREE.Group;
  type: string;
  x: number;
  z: number;
  active: boolean;
}

const POWERUP_COLORS: Record<string, number> = {
  jetpack: 0xff4444,
  magnet: 0x44aaff,
};

export class PowerUpManager {
  private scene: THREE.Scene;
  private pickups: PowerUpPickup[] = [];
  private activePowerUp: PowerUpBase | null = null;
  private lastSpawnZ = 0;
  private powerUpLevels: Record<string, number>;

  constructor(scene: THREE.Scene, levels: Record<string, number>) {
    this.scene = scene;
    this.powerUpLevels = levels;
  }

  get current(): PowerUpBase | null { return this.activePowerUp; }
  get jetpackActive(): boolean {
    return this.activePowerUp instanceof Jetpack && this.activePowerUp.active;
  }
  get magnetRadius(): number {
    return this.activePowerUp instanceof Magnet ? this.activePowerUp.radius : 0;
  }

  update(playerZ: number, distance: number, deltaTime: number): void {
    // Update active power-up
    if (this.activePowerUp?.active) {
      this.activePowerUp.update(deltaTime);
    }

    // Spawn pickups ahead
    const spawnZ = playerZ + GAME.SEGMENT_LENGTH * (GAME.SPAWN_AHEAD - 1);
    if (spawnZ - this.lastSpawnZ >= POWERUP.MIN_DISTANCE_BETWEEN && distance > 100) {
      this.spawnPickup(spawnZ);
      this.lastSpawnZ = spawnZ;
    }

    // Rotate pickups + despawn behind
    const behindZ = playerZ - GAME.SEGMENT_LENGTH * 2;
    this.pickups = this.pickups.filter(p => {
      if (!p.active || p.z < behindZ) {
        this.scene.remove(p.mesh);
        return false;
      }
      p.mesh.rotation.y += 2 * deltaTime;
      // Hover animation
      p.mesh.position.y = 1.5 + Math.sin(performance.now() * 0.003) * 0.3;
      return true;
    });
  }

  checkCollisions(playerAABB: AABB): void {
    for (const pickup of this.pickups) {
      if (!pickup.active) continue;
      const pickupAABB: AABB = {
        minX: pickup.x - 0.5, maxX: pickup.x + 0.5,
        minY: 0.5,            maxY: 2.5,
        minZ: pickup.z - 0.5, maxZ: pickup.z + 0.5,
      };
      if (aabbIntersect(playerAABB, pickupAABB)) {
        pickup.active = false;
        this.scene.remove(pickup.mesh);
        this.activatePowerUp(pickup.type);
      }
    }
  }

  private activatePowerUp(type: string): void {
    // Deactivate current
    if (this.activePowerUp?.active) {
      this.activePowerUp.deactivate();
    }

    const level = this.powerUpLevels[type] ?? 1;
    switch (type) {
      case 'jetpack':
        this.activePowerUp = new Jetpack(level);
        break;
      case 'magnet':
        this.activePowerUp = new Magnet(level);
        break;
      default:
        return;
    }
    this.activePowerUp.activate();
    eventBus.emit('powerup:pickup', { type });
  }

  private spawnPickup(z: number): void {
    const type = weightedRandom(POWERUP.WEIGHTS);
    const lane = randomChoice([-1, 0, 1]);
    const x = lane * GAME.LANE_WIDTH;

    const group = new THREE.Group();
    const color = POWERUP_COLORS[type] ?? 0xffffff;
    const geo = new THREE.OctahedronGeometry(0.5);
    const mat = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);
    group.position.set(x, 1.5, z);

    this.scene.add(group);
    this.pickups.push({ mesh: group, type, x, z, active: true });
  }

  reset(): void {
    if (this.activePowerUp?.active) {
      this.activePowerUp.deactivate();
    }
    this.activePowerUp = null;
    for (const p of this.pickups) {
      this.scene.remove(p.mesh);
    }
    this.pickups = [];
    this.lastSpawnZ = 0;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/powerups/
git commit -m "feat: add power-up system — Jetpack and Magnet with level scaling"
```

---

### Task 17: VFX Manager

**Files:**

- Create: `src/rendering/VFXManager.ts`

- [ ] **Step 1: Create VFXManager.ts**

```typescript
// src/rendering/VFXManager.ts
import * as THREE from 'three';

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class VFXManager {
  private scene: THREE.Scene;
  private particles: Particle[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  spawnCoinCollect(x: number, y: number, z: number): void {
    const count = 6;
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.08);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);

      const angle = (i / count) * Math.PI * 2;
      const speed = 3 + Math.random() * 2;
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          2 + Math.random() * 3,
          Math.sin(angle) * speed
        ),
        life: 0,
        maxLife: 0.4 + Math.random() * 0.2,
      });
    }
  }

  spawnCrash(x: number, y: number, z: number): void {
    const count = 15;
    for (let i = 0; i < count; i++) {
      const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const mat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);

      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          Math.random() * 6,
          (Math.random() - 0.5) * 8
        ),
        life: 0,
        maxLife: 0.6 + Math.random() * 0.4,
      });
    }
  }

  update(deltaTime: number): void {
    this.particles = this.particles.filter(p => {
      p.life += deltaTime;
      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
        return false;
      }

      p.velocity.y -= 15 * deltaTime; // gravity
      p.mesh.position.add(p.velocity.clone().multiplyScalar(deltaTime));

      // Fade out
      const alpha = 1 - (p.life / p.maxLife);
      p.mesh.scale.setScalar(alpha);

      return true;
    });
  }

  reset(): void {
    for (const p of this.particles) {
      this.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      (p.mesh.material as THREE.Material).dispose();
    }
    this.particles = [];
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/rendering/VFXManager.ts
git commit -m "feat: add VFX manager — coin collect and crash particle effects"
```

---

## Phase 5: Missions, Audio, & UI Managers

### Task 18: Mission System (with tests)

**Files:**

- Create: `src/missions/MissionData.ts`
- Create: `src/missions/MissionManager.ts`
- Create: `src/missions/AchievementTracker.ts`
- Create: `tests/unit/MissionManager.test.ts`

- [ ] **Step 1: Create MissionData.ts**

```typescript
// src/missions/MissionData.ts

export type MissionType = 'collect_coins' | 'run_distance' | 'jump_count' | 'use_powerup' | 'score_points' | 'dodge_obstacles';

export interface MissionTemplate {
  type: MissionType;
  descriptionFn: (target: number) => string;
  targetRange: [number, number]; // [min, max] — scales with difficulty
  reward: { type: 'coins' | 'keys'; baseAmount: number };
}

export const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    type: 'collect_coins',
    descriptionFn: (t) => `Collect ${t} coins in a single run`,
    targetRange: [100, 800],
    reward: { type: 'coins', baseAmount: 200 },
  },
  {
    type: 'run_distance',
    descriptionFn: (t) => `Run ${t} meters`,
    targetRange: [500, 5000],
    reward: { type: 'coins', baseAmount: 300 },
  },
  {
    type: 'jump_count',
    descriptionFn: (t) => `Jump ${t} times in a single run`,
    targetRange: [20, 100],
    reward: { type: 'coins', baseAmount: 150 },
  },
  {
    type: 'use_powerup',
    descriptionFn: (t) => `Use power-ups ${t} times`,
    targetRange: [2, 8],
    reward: { type: 'coins', baseAmount: 250 },
  },
  {
    type: 'score_points',
    descriptionFn: (t) => `Score ${t.toLocaleString()} points`,
    targetRange: [50000, 1000000],
    reward: { type: 'keys', baseAmount: 1 },
  },
  {
    type: 'dodge_obstacles',
    descriptionFn: (t) => `Dodge ${t} obstacles in a single run`,
    targetRange: [30, 150],
    reward: { type: 'coins', baseAmount: 500 },
  },
];

export interface AchievementConfig {
  id: string;
  name: string;
  description: string;
  condition: { type: string; target: number };
  reward: { type: 'coins' | 'keys'; amount: number };
}

export const ACHIEVEMENTS: AchievementConfig[] = [
  { id: 'first_steps', name: 'First Steps', description: 'Complete your first run', condition: { type: 'totalRuns', target: 1 }, reward: { type: 'coins', amount: 100 } },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Run 5,000m in one run', condition: { type: 'singleRunDistance', target: 5000 }, reward: { type: 'coins', amount: 1000 } },
  { id: 'coin_collector', name: 'Coin Collector', description: 'Collect 100,000 total coins', condition: { type: 'totalCoinsCollected', target: 100000 }, reward: { type: 'keys', amount: 2 } },
  { id: 'marathon_runner', name: 'Marathon Runner', description: 'Run 1,000,000 total meters', condition: { type: 'totalDistanceRun', target: 1000000 }, reward: { type: 'keys', amount: 10 } },
  { id: 'score_master', name: 'Score Master', description: 'Score 5,000,000 points', condition: { type: 'highScore', target: 5000000 }, reward: { type: 'coins', amount: 5000 } },
  { id: 'untouchable', name: 'Untouchable', description: 'Run 1,000m without hitting any obstacle', condition: { type: 'singleRunDistance', target: 1000 }, reward: { type: 'keys', amount: 2 } },
];
```

- [ ] **Step 2: Write MissionManager tests**

```typescript
// tests/unit/MissionManager.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MissionManager } from '@missions/MissionManager';

const mockStorage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
  clear: vi.fn(() => { for (const k in mockStorage) delete mockStorage[k]; }),
});

describe('MissionManager', () => {
  let mgr: MissionManager;

  beforeEach(() => {
    for (const k in mockStorage) delete mockStorage[k];
    mgr = new MissionManager();
  });

  it('generates initial mission set with 3 missions', () => {
    mgr.ensureMissions();
    expect(mgr.activeMissions.length).toBe(3);
  });

  it('tracks progress on a mission', () => {
    mgr.ensureMissions();
    const mission = mgr.activeMissions[0];
    mgr.trackProgress(mission.type, 10);
    const updated = mgr.activeMissions.find(m => m.id === mission.id)!;
    expect(updated.progress).toBe(10);
  });

  it('marks mission complete when target reached', () => {
    mgr.ensureMissions();
    const mission = mgr.activeMissions[0];
    mgr.trackProgress(mission.type, mission.target);
    const completed = mgr.getCompletedMissions();
    expect(completed.length).toBeGreaterThanOrEqual(1);
  });

  it('does not exceed target progress', () => {
    mgr.ensureMissions();
    const mission = mgr.activeMissions[0];
    mgr.trackProgress(mission.type, mission.target + 100);
    const updated = mgr.activeMissions.find(m => m.id === mission.id)!;
    expect(updated.progress).toBe(mission.target);
  });
});
```

- [ ] **Step 3: Create MissionManager.ts**

```typescript
// src/missions/MissionManager.ts
import { ECONOMY } from '@core/Constants';
import { SaveManager } from '@persistence/SaveManager';
import type { ActiveMission } from '@persistence/SaveData';
import { MISSION_TEMPLATES, type MissionType } from './MissionData';
import { randomInt, shuffleArray } from '@utils/RandomUtils';
import { lerp } from '@utils/MathUtils';
import { eventBus } from '@core/EventBus';

export class MissionManager {
  private missions: ActiveMission[] = [];
  private missionSetIndex: number;

  constructor() {
    const data = SaveManager.load();
    this.missions = data.missions.active;
    this.missionSetIndex = data.scoring.missionSetIndex;
  }

  get activeMissions(): ActiveMission[] { return this.missions; }

  ensureMissions(): void {
    if (this.missions.length === 0) {
      this.generateMissionSet();
    }
  }

  trackProgress(type: MissionType, amount: number): void {
    for (const m of this.missions) {
      if (m.type === type && m.progress < m.target) {
        m.progress = Math.min(m.target, m.progress + amount);
      }
    }
  }

  setProgress(type: MissionType, value: number): void {
    for (const m of this.missions) {
      if (m.type === type) {
        m.progress = Math.min(m.target, value);
      }
    }
  }

  getCompletedMissions(): ActiveMission[] {
    return this.missions.filter(m => m.progress >= m.target);
  }

  isSetComplete(): boolean {
    return this.missions.length > 0 && this.missions.every(m => m.progress >= m.target);
  }

  advanceSet(): { newMultiplierLevel: number; rewards: ActiveMission['reward'][] } {
    const rewards = this.missions.map(m => m.reward);
    this.missionSetIndex++;
    this.missions = [];
    this.generateMissionSet();
    return { newMultiplierLevel: this.missionSetIndex + 1, rewards };
  }

  private generateMissionSet(): void {
    const shuffled = shuffleArray([...MISSION_TEMPLATES]);
    const picked = shuffled.slice(0, ECONOMY.MISSIONS_PER_SET);
    const difficulty = Math.min(this.missionSetIndex / 10, 1); // 0..1

    this.missions = picked.map((template, i) => {
      const [minT, maxT] = template.targetRange;
      const target = Math.round(lerp(minT, maxT, difficulty));
      return {
        id: `mission_${this.missionSetIndex}_${i}`,
        type: template.type,
        description: template.descriptionFn(target),
        target,
        progress: 0,
        reward: {
          type: template.reward.type,
          amount: Math.round(template.reward.baseAmount * (1 + difficulty)),
        },
      };
    });
  }

  persist(): void {
    const data = SaveManager.load();
    data.missions.active = this.missions;
    data.scoring.missionSetIndex = this.missionSetIndex;
    SaveManager.save(data);
  }

  resetRunProgress(): void {
    // Reset per-run missions (keep cumulative ones)
    // All missions track per-run in this simplified version
  }
}
```

- [ ] **Step 4: Create AchievementTracker.ts**

```typescript
// src/missions/AchievementTracker.ts
import { SaveManager } from '@persistence/SaveManager';
import { ACHIEVEMENTS, type AchievementConfig } from './MissionData';
import { eventBus } from '@core/EventBus';

export class AchievementTracker {
  private completed: Set<string>;

  constructor() {
    const data = SaveManager.load();
    this.completed = new Set(data.achievements);
  }

  check(stats: {
    totalRuns: number;
    totalCoinsCollected: number;
    totalDistanceRun: number;
    highScore: number;
    singleRunDistance: number;
  }): AchievementConfig[] {
    const newAchievements: AchievementConfig[] = [];

    for (const ach of ACHIEVEMENTS) {
      if (this.completed.has(ach.id)) continue;

      const value = (stats as Record<string, number>)[ach.condition.type] ?? 0;
      if (value >= ach.condition.target) {
        this.completed.add(ach.id);
        newAchievements.push(ach);
        eventBus.emit('achievement:unlocked', { id: ach.id, name: ach.name });
      }
    }

    return newAchievements;
  }

  persist(): void {
    const data = SaveManager.load();
    data.achievements = [...this.completed];
    SaveManager.save(data);
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/unit/MissionManager.test.ts`
Expected: All 4 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/missions/ tests/unit/MissionManager.test.ts
git commit -m "feat: add mission system and achievement tracker with tests"
```

---

### Task 19: Character Data & Shop Manager

**Files:**

- Create: `src/characters/CharacterData.ts`
- Create: `src/characters/CharacterManager.ts`
- Create: `src/economy/ShopManager.ts`

- [ ] **Step 1: Create CharacterData.ts**

```typescript
// src/characters/CharacterData.ts

export interface CharacterConfig {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockCurrency: 'coins' | 'keys' | 'free';
  unlockCost: number;
  bodyColor: number;
  accentColor: number;
}

export const CHARACTERS: CharacterConfig[] = [
  {
    id: 'default',
    name: 'Runner',
    description: 'The classic runner',
    rarity: 'common',
    unlockCurrency: 'free',
    unlockCost: 0,
    bodyColor: 0x2196f3,
    accentColor: 0x1976d2,
  },
  {
    id: 'skater',
    name: 'Skater',
    description: 'Cool and collected',
    rarity: 'common',
    unlockCurrency: 'coins',
    unlockCost: 5000,
    bodyColor: 0x4caf50,
    accentColor: 0x388e3c,
  },
  {
    id: 'ninja',
    name: 'Ninja',
    description: 'Silent and swift',
    rarity: 'rare',
    unlockCurrency: 'coins',
    unlockCost: 25000,
    bodyColor: 0x212121,
    accentColor: 0xf44336,
  },
];
```

- [ ] **Step 2: Create CharacterManager.ts**

```typescript
// src/characters/CharacterManager.ts
import { SaveManager } from '@persistence/SaveManager';
import { CHARACTERS, type CharacterConfig } from './CharacterData';
import { eventBus } from '@core/EventBus';

export class CharacterManager {
  private unlocked: Set<string>;
  private _equipped: string;

  constructor() {
    const data = SaveManager.load();
    this.unlocked = new Set(data.characters.unlocked);
    this._equipped = data.characters.equipped;
  }

  get equippedId(): string { return this._equipped; }
  get equippedConfig(): CharacterConfig {
    return CHARACTERS.find(c => c.id === this._equipped) ?? CHARACTERS[0];
  }
  get allCharacters(): CharacterConfig[] { return CHARACTERS; }

  isUnlocked(id: string): boolean { return this.unlocked.has(id); }

  unlock(id: string): void {
    this.unlocked.add(id);
    eventBus.emit('character:unlocked', { id });
  }

  equip(id: string): void {
    if (!this.unlocked.has(id)) return;
    this._equipped = id;
    eventBus.emit('character:equipped', { id });
  }

  persist(): void {
    const data = SaveManager.load();
    data.characters.unlocked = [...this.unlocked];
    data.characters.equipped = this._equipped;
    SaveManager.save(data);
  }
}
```

- [ ] **Step 3: Create ShopManager.ts**

```typescript
// src/economy/ShopManager.ts
import { WalletManager } from './WalletManager';
import { CharacterManager } from '@characters/CharacterManager';
import { CHARACTERS, type CharacterConfig } from '@characters/CharacterData';
import { eventBus } from '@core/EventBus';

export interface ShopItem {
  config: CharacterConfig;
  owned: boolean;
  equipped: boolean;
  canAfford: boolean;
}

export class ShopManager {
  private wallet: WalletManager;
  private characters: CharacterManager;

  constructor(wallet: WalletManager, characters: CharacterManager) {
    this.wallet = wallet;
    this.characters = characters;
  }

  getShopItems(): ShopItem[] {
    return CHARACTERS.map(config => ({
      config,
      owned: this.characters.isUnlocked(config.id),
      equipped: this.characters.equippedId === config.id,
      canAfford: config.unlockCurrency === 'free' ||
        this.wallet.canAfford(config.unlockCurrency as 'coins' | 'keys', config.unlockCost),
    }));
  }

  purchase(characterId: string): boolean {
    const config = CHARACTERS.find(c => c.id === characterId);
    if (!config) return false;
    if (this.characters.isUnlocked(characterId)) return false;

    if (config.unlockCurrency === 'free') {
      this.characters.unlock(characterId);
      return true;
    }

    const currency = config.unlockCurrency as 'coins' | 'keys';
    const spent = currency === 'coins'
      ? this.wallet.spendCoins(config.unlockCost)
      : this.wallet.spendKeys(config.unlockCost);

    if (!spent) return false;

    this.characters.unlock(characterId);
    this.wallet.persist();
    this.characters.persist();
    eventBus.emit('shop:purchased', { id: characterId });
    return true;
  }

  equipCharacter(characterId: string): void {
    this.characters.equip(characterId);
    this.characters.persist();
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/characters/ src/economy/ShopManager.ts
git commit -m "feat: add character system and shop with coin/key purchases"
```

---

### Task 20: Audio Manager

**Files:**

- Create: `src/audio/AudioManager.ts`

- [ ] **Step 1: Create AudioManager.ts**

```typescript
// src/audio/AudioManager.ts
import { Howl, Howler } from 'howler';
import { AUDIO } from '@core/Constants';
import { SaveManager } from '@persistence/SaveManager';

type SFXName = 'coin' | 'jump' | 'slide' | 'crash' | 'powerup' | 'click' | 'achievement';

export class AudioManager {
  private musicVolume: number;
  private sfxVolume: number;
  private currentMusic: Howl | null = null;
  private sfxCache = new Map<SFXName, Howl>();
  private initialized = false;

  constructor() {
    const data = SaveManager.load();
    this.musicVolume = data.settings.musicVolume;
    this.sfxVolume = data.settings.sfxVolume;
  }

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Pre-create SFX Howl instances
    // We use programmatic audio since we don't have actual audio files
    // These will be replaced with real audio files in production
    this.createSynthSFX();
  }

  private createSynthSFX(): void {
    // For MVP: use Web Audio API to generate simple synth sounds
    // This avoids needing actual audio files
    // In production, replace with Howl instances pointing to real files
  }

  playMusic(_trackName?: string): void {
    // Placeholder — in production, load and crossfade music tracks
    // For MVP, we skip music to avoid needing audio files
  }

  stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.fade(this.musicVolume, 0, 500);
      setTimeout(() => {
        this.currentMusic?.stop();
        this.currentMusic = null;
      }, 500);
    }
  }

  playSFX(name: SFXName): void {
    // Use Web Audio API for simple synthesized sounds
    if (this.sfxVolume === 0) return;

    try {
      const ctx = Howler.ctx;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.value = this.sfxVolume * 0.15;

      switch (name) {
        case 'coin':
          osc.frequency.value = 800 + Math.random() * 200;
          osc.type = 'sine';
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.15);
          break;
        case 'jump':
          osc.frequency.value = 300;
          osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
          osc.type = 'square';
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.15);
          break;
        case 'slide':
          osc.frequency.value = 400;
          osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
          osc.type = 'sawtooth';
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.2);
          break;
        case 'crash':
          osc.type = 'sawtooth';
          osc.frequency.value = 150;
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.4);
          break;
        case 'powerup':
          osc.frequency.value = 400;
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
          osc.type = 'sine';
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
          break;
        case 'click':
          osc.frequency.value = 600;
          osc.type = 'sine';
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.05);
          break;
        case 'achievement':
          osc.frequency.value = 523;
          osc.type = 'sine';
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.5);
          // Second tone
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          gain2.gain.value = this.sfxVolume * 0.15;
          osc2.frequency.value = 659;
          osc2.type = 'sine';
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
          osc2.start(ctx.currentTime + 0.15);
          osc2.stop(ctx.currentTime + 0.6);
          break;
      }
    } catch {
      // Web Audio API not available
    }
  }

  setMusicVolume(vol: number): void {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    this.currentMusic?.volume(this.musicVolume);
    this.persistSettings();
  }

  setSFXVolume(vol: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    this.persistSettings();
  }

  getMusicVolume(): number { return this.musicVolume; }
  getSFXVolume(): number { return this.sfxVolume; }

  private persistSettings(): void {
    const data = SaveManager.load();
    data.settings.musicVolume = this.musicVolume;
    data.settings.sfxVolume = this.sfxVolume;
    SaveManager.save(data);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/audio/AudioManager.ts
git commit -m "feat: add AudioManager with synthesized SFX for MVP"
```

---

## Phase 6: UI Manager & Screens

### Task 21: UI Manager & All Screens

**Files:**

- Create: `src/ui/UIManager.ts`
- Create: `src/ui/screens/LoadingScreen.ts`
- Create: `src/ui/screens/MainMenuScreen.ts`
- Create: `src/ui/screens/GameplayHUD.ts`
- Create: `src/ui/screens/PauseScreen.ts`
- Create: `src/ui/screens/GameOverScreen.ts`
- Create: `src/ui/screens/ShopScreen.ts`
- Create: `src/ui/screens/MissionsScreen.ts`
- Create: `src/ui/components/Button.ts`
- Create: `src/ui/components/ProgressBar.ts`
- Create: `src/ui/components/CurrencyDisplay.ts`

- [ ] **Step 1: Create UI components**

```typescript
// src/ui/components/Button.ts
export function bindButton(id: string, handler: () => void): HTMLButtonElement | null {
  const el = document.getElementById(id) as HTMLButtonElement | null;
  if (el) {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      handler();
    });
  }
  return el;
}
```

```typescript
// src/ui/components/ProgressBar.ts
export function setProgressBar(barId: string, progress: number): void {
  const el = document.getElementById(barId);
  if (el) {
    el.style.width = `${Math.max(0, Math.min(100, progress * 100))}%`;
  }
}
```

```typescript
// src/ui/components/CurrencyDisplay.ts
import { formatNumber } from '@utils/MathUtils';

export function updateCurrencyDisplay(elementId: string, emoji: string, amount: number): void {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = `${emoji} ${formatNumber(amount)}`;
  }
}
```

- [ ] **Step 2: Create UIManager.ts**

```typescript
// src/ui/UIManager.ts
import { gsap } from 'gsap';
import { UI } from '@core/Constants';

type ScreenId = 'screen-loading' | 'screen-menu' | 'screen-hud' | 'screen-pause'
  | 'screen-revive' | 'screen-gameover' | 'screen-shop' | 'screen-missions';

export class UIManager {
  private currentScreen: ScreenId | null = null;

  show(screenId: ScreenId): void {
    // Hide current
    if (this.currentScreen && this.currentScreen !== screenId) {
      this.hide(this.currentScreen);
    }

    const el = document.getElementById(screenId);
    if (!el) return;

    el.classList.remove('hidden');
    el.style.display = 'flex';
    el.style.opacity = '0';
    gsap.to(el, { opacity: 1, duration: UI.TRANSITION_DURATION });
    this.currentScreen = screenId;
  }

  hide(screenId: ScreenId): void {
    const el = document.getElementById(screenId);
    if (!el) return;

    gsap.to(el, {
      opacity: 0,
      duration: UI.TRANSITION_DURATION,
      onComplete: () => {
        el.classList.add('hidden');
        el.style.display = 'none';
      }
    });
  }

  showOverlay(screenId: ScreenId): void {
    // Show without hiding current (for HUD + pause, etc.)
    const el = document.getElementById(screenId);
    if (!el) return;
    el.classList.remove('hidden');
    el.style.display = 'flex';
    el.style.opacity = '0';
    gsap.to(el, { opacity: 1, duration: UI.TRANSITION_DURATION });
  }

  hideAll(): void {
    const screens: ScreenId[] = [
      'screen-loading', 'screen-menu', 'screen-hud', 'screen-pause',
      'screen-revive', 'screen-gameover', 'screen-shop', 'screen-missions',
    ];
    for (const id of screens) {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('hidden');
        el.style.display = 'none';
        el.style.opacity = '0';
      }
    }
    this.currentScreen = null;
  }

  setText(id: string, text: string): void {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  setDisplay(id: string, show: boolean): void {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? '' : 'none';
  }
}
```

- [ ] **Step 3: Create screen modules**

```typescript
// src/ui/screens/LoadingScreen.ts
import { setProgressBar } from '@ui/components/ProgressBar';

export class LoadingScreen {
  setProgress(progress: number): void {
    setProgressBar('loading-bar', progress);
  }

  setText(text: string): void {
    const el = document.getElementById('loading-text');
    if (el) el.textContent = text;
  }
}
```

```typescript
// src/ui/screens/MainMenuScreen.ts
import { bindButton } from '@ui/components/Button';
import { updateCurrencyDisplay } from '@ui/components/CurrencyDisplay';
import { formatNumber } from '@utils/MathUtils';

export class MainMenuScreen {
  init(callbacks: {
    onPlay: () => void;
    onShop: () => void;
    onMissions: () => void;
  }): void {
    bindButton('btn-play', callbacks.onPlay);
    bindButton('btn-shop', callbacks.onShop);
    bindButton('btn-missions', callbacks.onMissions);
  }

  update(data: { coins: number; keys: number; highScore: number }): void {
    updateCurrencyDisplay('menu-coins', '\u{1FA99}', data.coins);
    updateCurrencyDisplay('menu-keys', '\u{1F511}', data.keys);
    const el = document.getElementById('menu-high-score');
    if (el) el.textContent = `Best: ${formatNumber(data.highScore)}`;
  }
}
```

```typescript
// src/ui/screens/GameplayHUD.ts
import { formatNumber } from '@utils/MathUtils';

export class GameplayHUD {
  init(callbacks: { onPause: () => void }): void {
    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) pauseBtn.addEventListener('click', callbacks.onPause);
  }

  updateScore(score: number): void {
    const el = document.getElementById('hud-score');
    if (el) el.textContent = formatNumber(score);
  }

  updateMultiplier(level: number): void {
    const el = document.getElementById('hud-multiplier');
    if (el) el.textContent = `x${level}`;
  }

  updateCoins(coins: number): void {
    const el = document.getElementById('hud-coins');
    if (el) el.textContent = `\u{1FA99} ${formatNumber(coins)}`;
  }

  showPowerUp(name: string, progress: number): void {
    const container = document.getElementById('hud-powerup');
    const nameEl = document.getElementById('hud-powerup-name');
    const barEl = document.getElementById('hud-powerup-bar');
    if (container) container.style.display = 'block';
    if (nameEl) nameEl.textContent = name;
    if (barEl) barEl.style.width = `${progress * 100}%`;
  }

  hidePowerUp(): void {
    const container = document.getElementById('hud-powerup');
    if (container) container.style.display = 'none';
  }
}
```

```typescript
// src/ui/screens/PauseScreen.ts
import { bindButton } from '@ui/components/Button';

export class PauseScreen {
  init(callbacks: { onResume: () => void; onMenu: () => void }): void {
    bindButton('btn-resume', callbacks.onResume);
    bindButton('btn-pause-menu', callbacks.onMenu);
  }
}
```

```typescript
// src/ui/screens/GameOverScreen.ts
import { bindButton } from '@ui/components/Button';
import { formatNumber, formatDistance } from '@utils/MathUtils';
import type { ActiveMission } from '@persistence/SaveData';

export class GameOverScreen {
  init(callbacks: { onMenu: () => void; onRestart: () => void }): void {
    bindButton('btn-go-menu', callbacks.onMenu);
    bindButton('btn-go-restart', callbacks.onRestart);
  }

  update(data: {
    score: number;
    highScore: number;
    isNewHighScore: boolean;
    coins: number;
    distance: number;
    missions: ActiveMission[];
  }): void {
    const scoreEl = document.getElementById('go-score');
    const bestEl = document.getElementById('go-best');
    const newBestEl = document.getElementById('go-new-best');
    const coinsEl = document.getElementById('go-coins');
    const distEl = document.getElementById('go-distance');

    if (scoreEl) scoreEl.textContent = formatNumber(data.score);
    if (bestEl) bestEl.textContent = formatNumber(data.highScore);
    if (newBestEl) newBestEl.style.display = data.isNewHighScore ? 'inline' : 'none';
    if (coinsEl) coinsEl.textContent = formatNumber(data.coins);
    if (distEl) distEl.textContent = formatDistance(data.distance);

    // Mission progress
    const missionsEl = document.getElementById('go-missions');
    if (missionsEl) {
      missionsEl.innerHTML = '<h3>Mission Progress</h3>';
      for (const m of data.missions) {
        const pct = Math.min(100, (m.progress / m.target) * 100);
        const completed = m.progress >= m.target;
        missionsEl.innerHTML += `
          <div class="mission-item">
            <span>${m.description}</span>
            <div class="mission-bar">
              <div class="mission-bar-fill" style="width:${pct}%"></div>
            </div>
            <span>${completed ? '\u2705' : `${m.progress}/${m.target}`}</span>
          </div>
        `;
      }
    }
  }
}
```

```typescript
// src/ui/screens/ShopScreen.ts
import { bindButton } from '@ui/components/Button';
import { updateCurrencyDisplay } from '@ui/components/CurrencyDisplay';
import type { ShopItem } from '@economy/ShopManager';
import { formatNumber } from '@utils/MathUtils';

export class ShopScreen {
  private onPurchase: ((id: string) => void) | null = null;
  private onEquip: ((id: string) => void) | null = null;

  init(callbacks: {
    onClose: () => void;
    onPurchase: (id: string) => void;
    onEquip: (id: string) => void;
  }): void {
    bindButton('btn-shop-close', callbacks.onClose);
    this.onPurchase = callbacks.onPurchase;
    this.onEquip = callbacks.onEquip;
  }

  update(items: ShopItem[], coins: number, keys: number): void {
    updateCurrencyDisplay('shop-coins', '\u{1FA99}', coins);
    updateCurrencyDisplay('shop-keys', '\u{1F511}', keys);

    const grid = document.getElementById('shop-grid');
    if (!grid) return;

    grid.innerHTML = '';
    for (const item of items) {
      const div = document.createElement('div');
      div.className = 'shop-item' + (item.equipped ? ' equipped' : item.owned ? ' owned' : '');

      const costText = item.owned ? (item.equipped ? 'Equipped' : 'Owned') :
        item.config.unlockCurrency === 'free' ? 'Free' :
        `${item.config.unlockCurrency === 'coins' ? '\u{1FA99}' : '\u{1F511}'} ${formatNumber(item.config.unlockCost)}`;

      div.innerHTML = `
        <div class="shop-item-icon" style="color:#${item.config.bodyColor.toString(16).padStart(6, '0')}">\u{1F3C3}</div>
        <div class="shop-item-name">${item.config.name}</div>
        <div class="shop-item-cost">${costText}</div>
      `;

      div.addEventListener('click', () => {
        if (item.owned && !item.equipped) {
          this.onEquip?.(item.config.id);
        } else if (!item.owned && item.canAfford) {
          this.onPurchase?.(item.config.id);
        }
      });

      grid.appendChild(div);
    }
  }
}
```

```typescript
// src/ui/screens/MissionsScreen.ts
import { bindButton } from '@ui/components/Button';
import type { ActiveMission } from '@persistence/SaveData';

export class MissionsScreen {
  init(callbacks: { onClose: () => void }): void {
    bindButton('btn-missions-close', callbacks.onClose);
  }

  update(missions: ActiveMission[]): void {
    const list = document.getElementById('missions-list');
    if (!list) return;

    list.innerHTML = '<div class="missions-title">Missions</div>';
    for (const m of missions) {
      const pct = Math.min(100, (m.progress / m.target) * 100);
      const completed = m.progress >= m.target;

      list.innerHTML += `
        <div class="mission-card${completed ? ' completed' : ''}">
          <div class="mission-card-desc">${m.description}</div>
          <div class="mission-card-progress">
            <span>${m.progress}</span>
            <div class="mission-card-bar">
              <div class="mission-card-bar-fill" style="width:${pct}%"></div>
            </div>
            <span>${m.target}</span>
          </div>
          <div class="mission-card-reward">${m.reward.type === 'coins' ? '\u{1FA99}' : '\u{1F511}'} ${m.reward.amount}</div>
        </div>
      `;
    }
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/ui/
git commit -m "feat: add UI system — all screens, HUD, shop, missions with GSAP transitions"
```

---

## Phase 7: GameManager — Tie It All Together

### Task 22: GameManager

**Files:**

- Create: `src/core/GameManager.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Create GameManager.ts**

```typescript
// src/core/GameManager.ts
import * as THREE from 'three';
import { gsap } from 'gsap';
import { GAME, ECONOMY } from './Constants';
import { StateMachine } from './StateMachine';
import { eventBus } from './EventBus';
import { GameLoop } from './GameLoop';
import { createSceneContext, type SceneContext } from '@rendering/SceneSetup';
import { CameraController } from '@rendering/CameraController';
import { VFXManager } from '@rendering/VFXManager';
import { InputManager } from '@input/InputManager';
import { PlayerController } from '@player/PlayerController';
import { TrackGenerator } from '@track/TrackGenerator';
import { ObstacleManager } from '@obstacles/ObstacleManager';
import { CoinManager } from '@collectibles/CoinManager';
import { PowerUpManager } from '@powerups/PowerUpManager';
import { WalletManager } from '@economy/WalletManager';
import { ShopManager } from '@economy/ShopManager';
import { ScoreManager } from '@scoring/ScoreManager';
import { MultiplierTracker } from '@scoring/MultiplierTracker';
import { MissionManager } from '@missions/MissionManager';
import { AchievementTracker } from '@missions/AchievementTracker';
import { CharacterManager } from '@characters/CharacterManager';
import { AudioManager } from '@audio/AudioManager';
import { SaveManager } from '@persistence/SaveManager';
import { UIManager } from '@ui/UIManager';
import { LoadingScreen } from '@ui/screens/LoadingScreen';
import { MainMenuScreen } from '@ui/screens/MainMenuScreen';
import { GameplayHUD } from '@ui/screens/GameplayHUD';
import { PauseScreen } from '@ui/screens/PauseScreen';
import { GameOverScreen } from '@ui/screens/GameOverScreen';
import { ShopScreen } from '@ui/screens/ShopScreen';
import { MissionsScreen } from '@ui/screens/MissionsScreen';
import { clamp, lerp } from '@utils/MathUtils';
import type { GameAction } from '@input/KeyboardHandler';

type GameState = 'loading' | 'menu' | 'countdown' | 'playing' | 'paused' | 'crash' | 'revive' | 'gameover';

export class GameManager {
  // Core
  private ctx!: SceneContext;
  private gameLoop!: GameLoop;
  private state!: StateMachine<GameState>;
  private input!: InputManager;
  private camera!: CameraController;

  // Game systems
  private player!: PlayerController;
  private track!: TrackGenerator;
  private obstacles!: ObstacleManager;
  private coins!: CoinManager;
  private powerUps!: PowerUpManager;
  private vfx!: VFXManager;

  // Meta systems
  private wallet!: WalletManager;
  private shop!: ShopManager;
  private score!: ScoreManager;
  private multiplier!: MultiplierTracker;
  private missions!: MissionManager;
  private achievements!: AchievementTracker;
  private characters!: CharacterManager;
  private audio!: AudioManager;

  // UI
  private ui!: UIManager;
  private loadingScreen!: LoadingScreen;
  private menuScreen!: MainMenuScreen;
  private hud!: GameplayHUD;
  private pauseScreen!: PauseScreen;
  private gameOverScreen!: GameOverScreen;
  private shopScreen!: ShopScreen;
  private missionsScreen!: MissionsScreen;

  // Gameplay state
  private currentSpeed = GAME.BASE_SPEED;
  private reviveCount = 0;
  private reviveTimer = 0;
  private runStats = { jumps: 0, slides: 0, powerUpsUsed: 0, obstaclesDodged: 0 };

  async init(): Promise<void> {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!canvas) throw new Error('Canvas not found');

    // Loading screen
    this.loadingScreen = new LoadingScreen();
    this.loadingScreen.setProgress(0);
    this.loadingScreen.setText('Initializing...');

    // Scene
    this.ctx = createSceneContext(canvas);
    this.loadingScreen.setProgress(0.2);

    // Camera
    this.camera = new CameraController(this.ctx.camera);
    this.loadingScreen.setProgress(0.3);

    // Systems
    this.input = new InputManager();
    this.player = new PlayerController();
    this.track = new TrackGenerator(this.ctx.scene);
    this.obstacles = new ObstacleManager(this.ctx.scene);
    this.coins = new CoinManager(this.ctx.scene);
    this.vfx = new VFXManager(this.ctx.scene);

    const saveData = SaveManager.load();
    this.powerUps = new PowerUpManager(this.ctx.scene, saveData.powerUpLevels);
    this.loadingScreen.setProgress(0.5);

    // Meta systems
    this.wallet = new WalletManager();
    this.score = new ScoreManager();
    this.multiplier = new MultiplierTracker();
    this.missions = new MissionManager();
    this.achievements = new AchievementTracker();
    this.characters = new CharacterManager();
    this.audio = new AudioManager();
    this.shop = new ShopManager(this.wallet, this.characters);
    this.loadingScreen.setProgress(0.7);

    // State machine
    this.state = new StateMachine<GameState>('loading', {
      loading: ['menu'],
      menu: ['countdown'],
      countdown: ['playing'],
      playing: ['paused', 'crash'],
      paused: ['playing', 'menu'],
      crash: ['revive', 'gameover'],
      revive: ['playing', 'gameover'],
      gameover: ['menu', 'countdown'],
    });

    // UI
    this.ui = new UIManager();
    this.menuScreen = new MainMenuScreen();
    this.hud = new GameplayHUD();
    this.pauseScreen = new PauseScreen();
    this.gameOverScreen = new GameOverScreen();
    this.shopScreen = new ShopScreen();
    this.missionsScreen = new MissionsScreen();

    this.initUI();
    this.initEvents();
    this.loadingScreen.setProgress(0.9);

    // Add player to scene
    this.ctx.scene.add(this.player.model.group);

    // Game loop
    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render()
    );

    // Audio init (needs user interaction)
    const initAudio = () => {
      this.audio.init();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);

    this.loadingScreen.setProgress(1.0);
    this.loadingScreen.setText('Ready!');

    // Transition to menu
    setTimeout(() => this.goToMenu(), 500);

    // Start the loop
    this.gameLoop.start();

    // Visibility change — auto-pause
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state.is('playing')) {
        this.pauseGame();
      }
    });
  }

  private initUI(): void {
    this.menuScreen.init({
      onPlay: () => this.startRun(),
      onShop: () => this.openShop(),
      onMissions: () => this.openMissions(),
    });

    this.hud.init({
      onPause: () => this.pauseGame(),
    });

    this.pauseScreen.init({
      onResume: () => this.resumeGame(),
      onMenu: () => this.goToMenu(),
    });

    this.gameOverScreen.init({
      onMenu: () => this.goToMenu(),
      onRestart: () => this.startRun(),
    });

    this.shopScreen.init({
      onClose: () => this.closeShop(),
      onPurchase: (id) => this.purchaseCharacter(id),
      onEquip: (id) => this.equipCharacter(id),
    });

    this.missionsScreen.init({
      onClose: () => this.closeMissions(),
    });

    // Revive buttons
    const reviveBtn = document.getElementById('btn-revive');
    const noReviveBtn = document.getElementById('btn-no-revive');
    if (reviveBtn) reviveBtn.addEventListener('click', () => this.doRevive());
    if (noReviveBtn) noReviveBtn.addEventListener('click', () => this.declineRevive());
  }

  private initEvents(): void {
    eventBus.on('input:pause', () => {
      if (this.state.is('playing')) this.pauseGame();
      else if (this.state.is('paused')) this.resumeGame();
    });

    eventBus.on('player:jump', () => {
      this.runStats.jumps++;
      this.audio.playSFX('jump');
    });

    eventBus.on('player:slide', () => {
      this.runStats.slides++;
      this.audio.playSFX('slide');
    });

    eventBus.on('player:crash', () => {
      this.audio.playSFX('crash');
      this.vfx.spawnCrash(this.player.x, this.player.y + 0.9, this.player.z);
    });

    eventBus.on('coin:collected', () => {
      this.audio.playSFX('coin');
    });

    eventBus.on('powerup:pickup', () => {
      this.audio.playSFX('powerup');
      this.runStats.powerUpsUsed++;
    });

    eventBus.on('achievement:unlocked', () => {
      this.audio.playSFX('achievement');
    });
  }

  // ─── State Transitions ───────────────────────────

  private goToMenu(): void {
    this.state.transition('menu');
    this.ui.hideAll();
    this.ui.show('screen-menu');
    this.input.disable();

    this.missions.ensureMissions();

    this.menuScreen.update({
      coins: this.wallet.coins,
      keys: this.wallet.keys,
      highScore: this.score.highScore,
    });

    // Reset scene for background
    this.resetGameplay();
    this.track.init();
    this.camera.reset(0);
  }

  private startRun(): void {
    this.state.transition('countdown');
    this.resetGameplay();

    // Init track
    this.track.init();
    this.camera.reset(0);

    this.ui.hideAll();
    this.ui.show('screen-hud');
    this.hud.updateScore(0);
    this.hud.updateCoins(0);
    this.hud.updateMultiplier(this.multiplier.level);
    this.hud.hidePowerUp();

    // Countdown
    this.doCountdown().then(() => {
      this.state.transition('playing');
      this.input.enable();
    });
  }

  private async doCountdown(): Promise<void> {
    const overlay = document.getElementById('countdown-overlay')!;
    const text = document.getElementById('countdown-text')!;
    overlay.style.display = 'flex';

    for (const label of ['3', '2', '1', 'GO!']) {
      text.textContent = label;
      text.style.opacity = '0';
      text.style.transform = 'scale(2)';
      await new Promise<void>(resolve => {
        gsap.to(text, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          onComplete: () => {
            gsap.to(text, {
              opacity: 0,
              scale: 0.5,
              duration: 0.4,
              delay: 0.2,
              onComplete: resolve,
            });
          }
        });
      });
    }

    overlay.style.display = 'none';
  }

  private pauseGame(): void {
    if (!this.state.transition('paused')) return;
    this.input.disable();
    this.ui.showOverlay('screen-pause');
  }

  private resumeGame(): void {
    if (!this.state.transition('playing')) return;
    this.ui.hide('screen-pause');
    this.input.enable();
  }

  private handleCrash(): void {
    if (!this.state.transition('crash')) return;
    this.input.disable();
    this.input.flush();

    // Brief delay then show revive or game over
    setTimeout(() => {
      if (this.reviveCount < ECONOMY.MAX_REVIVES_PER_RUN) {
        this.showRevivePrompt();
      } else {
        this.endRun();
      }
    }, 800);
  }

  private showRevivePrompt(): void {
    this.state.transition('revive');
    const cost = this.reviveCount === 0 ? ECONOMY.REVIVE_COST_1 : ECONOMY.REVIVE_COST_2;

    const costEl = document.getElementById('revive-cost');
    if (costEl) costEl.textContent = `Cost: ${cost} coins`;

    const timerEl = document.getElementById('revive-timer');
    this.reviveTimer = 5;
    if (timerEl) timerEl.textContent = '5';

    this.ui.showOverlay('screen-revive');

    // Countdown timer
    const interval = setInterval(() => {
      this.reviveTimer--;
      if (timerEl) timerEl.textContent = String(Math.max(0, Math.ceil(this.reviveTimer)));
      if (this.reviveTimer <= 0) {
        clearInterval(interval);
        if (this.state.is('revive')) {
          this.declineRevive();
        }
      }
    }, 1000);
  }

  private doRevive(): void {
    const cost = this.reviveCount === 0 ? ECONOMY.REVIVE_COST_1 : ECONOMY.REVIVE_COST_2;
    if (!this.wallet.spendCoins(cost)) {
      this.declineRevive();
      return;
    }

    this.reviveCount++;
    this.ui.hide('screen-revive');
    this.player.revive();

    // Short countdown then resume
    this.state.transition('playing');
    this.input.enable();
  }

  private declineRevive(): void {
    this.ui.hide('screen-revive');
    this.endRun();
  }

  private endRun(): void {
    this.state.transition('gameover');
    this.input.disable();

    // Finalize score
    this.score.finalizeRun();

    // Award coins
    this.wallet.addCoins(this.score.coinsCollected);

    // Update statistics
    const data = SaveManager.load();
    data.statistics.totalCoinsCollected += this.score.coinsCollected;
    data.statistics.totalDistanceRun += this.score.distance;
    data.statistics.totalRuns++;
    data.statistics.totalJumps += this.runStats.jumps;
    data.statistics.totalSlides += this.runStats.slides;
    SaveManager.save(data);

    // Track missions
    this.missions.setProgress('collect_coins', this.score.coinsCollected);
    this.missions.setProgress('run_distance', this.score.distance);
    this.missions.setProgress('jump_count', this.runStats.jumps);
    this.missions.trackProgress('use_powerup', this.runStats.powerUpsUsed);
    this.missions.setProgress('score_points', this.score.current);

    // Check achievements
    const stats = SaveManager.load().statistics;
    this.achievements.check({
      totalRuns: stats.totalRuns,
      totalCoinsCollected: stats.totalCoinsCollected,
      totalDistanceRun: stats.totalDistanceRun,
      highScore: this.score.highScore,
      singleRunDistance: this.score.distance,
    });

    // Check if mission set is complete
    if (this.missions.isSetComplete()) {
      const result = this.missions.advanceSet();
      // Multiplier level up is handled by MultiplierTracker on next save
    }

    // Persist
    this.wallet.persist();
    this.missions.persist();
    this.achievements.persist();

    // Show game over screen
    this.ui.hideAll();
    this.ui.show('screen-gameover');
    this.gameOverScreen.update({
      score: this.score.current,
      highScore: this.score.highScore,
      isNewHighScore: this.score.isNewHighScore,
      coins: this.score.coinsCollected,
      distance: this.score.distance,
      missions: this.missions.activeMissions,
    });
  }

  private openShop(): void {
    this.ui.showOverlay('screen-shop');
    this.refreshShop();
  }

  private closeShop(): void {
    this.ui.hide('screen-shop');
  }

  private purchaseCharacter(id: string): void {
    if (this.shop.purchase(id)) {
      this.audio.playSFX('click');
      this.refreshShop();
      this.menuScreen.update({
        coins: this.wallet.coins,
        keys: this.wallet.keys,
        highScore: this.score.highScore,
      });
    }
  }

  private equipCharacter(id: string): void {
    this.shop.equipCharacter(id);
    this.audio.playSFX('click');
    this.refreshShop();
  }

  private refreshShop(): void {
    this.shopScreen.update(
      this.shop.getShopItems(),
      this.wallet.coins,
      this.wallet.keys
    );
  }

  private openMissions(): void {
    this.missions.ensureMissions();
    this.ui.showOverlay('screen-missions');
    this.missionsScreen.update(this.missions.activeMissions);
  }

  private closeMissions(): void {
    this.ui.hide('screen-missions');
  }

  // ─── Game Logic ────────────────────────────────

  private resetGameplay(): void {
    this.player.reset();
    this.track.reset();
    this.obstacles.reset();
    this.coins.reset();
    this.powerUps.reset();
    this.vfx.reset();
    this.score.reset();
    this.currentSpeed = GAME.BASE_SPEED;
    this.reviveCount = 0;
    this.runStats = { jumps: 0, slides: 0, powerUpsUsed: 0, obstaclesDodged: 0 };
  }

  private update(deltaTime: number): void {
    if (this.state.is('playing')) {
      this.updateGameplay(deltaTime);
    }

    // Always update VFX and camera for visual polish
    this.vfx.update(deltaTime);

    if (this.state.is('playing') || this.state.is('countdown')) {
      this.camera.update(this.player.z, deltaTime);
    }
  }

  private updateGameplay(deltaTime: number): void {
    // Process input
    const action = this.input.dequeue();
    if (action) {
      this.processAction(action);
    }

    // Difficulty curve
    this.currentSpeed = clamp(
      GAME.BASE_SPEED + this.score.distance * GAME.ACCELERATION_RATE,
      GAME.BASE_SPEED,
      GAME.MAX_SPEED
    );

    // Jetpack overrides normal movement
    const isFlying = this.powerUps.jetpackActive;
    const effectiveSpeed = this.currentSpeed;

    // Update player
    if (!isFlying) {
      this.player.update(deltaTime, effectiveSpeed);
    } else {
      // Jetpack: move forward at height, bypass obstacles
      this.player.update(deltaTime, effectiveSpeed);
      // Override Y position during jetpack
      // The player model position is handled by PlayerController
    }

    // Update systems
    this.track.update(this.player.z);
    this.obstacles.update(this.player.z, this.currentSpeed, this.score.distance, deltaTime);
    this.coins.update(this.player.z, deltaTime);
    this.powerUps.update(this.player.z, this.score.distance, deltaTime);

    // Collision checks (skip if immune or flying)
    if (!this.player.isImmune && !isFlying) {
      const playerAABB = this.player.getAABB();

      // Obstacles
      const hitObs = this.obstacles.checkCollision(playerAABB);
      if (hitObs) {
        this.player.hit();
        this.handleCrash();
        return;
      }

      // Coins
      const coinsCollected = this.coins.checkCollisions(playerAABB);
      for (let i = 0; i < coinsCollected; i++) {
        this.score.addCoinScore(this.multiplier.level);
        this.vfx.spawnCoinCollect(this.player.x, this.player.y + 1, this.player.z);
      }

      // Power-up pickups
      this.powerUps.checkCollisions(playerAABB);
    }

    // Magnet effect
    if (this.powerUps.magnetRadius > 0) {
      const magnetCollected = this.coins.collectAllInRange(this.player.z, this.powerUps.magnetRadius);
      for (let i = 0; i < magnetCollected; i++) {
        this.score.addCoinScore(this.multiplier.level);
      }
    }

    // Jetpack auto-collect
    if (isFlying) {
      const collected = this.coins.collectAllInRange(this.player.z, 8);
      for (let i = 0; i < collected; i++) {
        this.score.addCoinScore(this.multiplier.level);
      }
    }

    // Score: distance
    const distanceDelta = effectiveSpeed * deltaTime;
    this.score.addDistance(distanceDelta, this.multiplier.level);

    // Active multiplier from power-up
    const activePU = this.powerUps.current;
    if (activePU?.active && activePU.id === 'multiplier') {
      this.score.setActiveMultiplier(2);
    } else {
      this.score.setActiveMultiplier(1);
    }

    // Update HUD
    this.hud.updateScore(this.score.current);
    this.hud.updateCoins(this.score.coinsCollected);

    if (activePU?.active) {
      this.hud.showPowerUp(activePU.id, activePU.progress);
    } else {
      this.hud.hidePowerUp();
    }
  }

  private processAction(action: GameAction): void {
    switch (action) {
      case 'left': this.player.moveLeft(); break;
      case 'right': this.player.moveRight(); break;
      case 'jump': this.player.jump(); break;
      case 'slide': this.player.slide(); break;
    }
  }

  private render(): void {
    this.ctx.renderer.render(this.ctx.scene, this.ctx.camera);
  }
}
```

- [ ] **Step 2: Update main.ts**

```typescript
// src/main.ts
import { GameManager } from '@core/GameManager';

const game = new GameManager();
game.init().catch(err => {
  console.error('Failed to initialize game:', err);
});
```

- [ ] **Step 3: Commit**

```bash
git add src/core/GameManager.ts src/main.ts
git commit -m "feat: add GameManager — orchestrates all systems, full game loop"
```

---

## Phase 8: Testing & Final Polish

### Task 23: Run All Tests & Fix Issues

- [ ] **Step 1: Run all tests**

Run: `cd /Users/akshaypatel/Subway-Surf && npx vitest run`
Expected: All tests pass

- [ ] **Step 2: Run dev server and verify**

Run: `npm run dev`
Expected: Opens browser at localhost:5173, game loads to menu

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: Clean build in dist/ folder

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete MVP — endless runner with all core systems"
```

---

## Spec Coverage Checklist

| PRD Section | Task(s) |
|---|---|
| 1. Product Overview | Task 1 (scaffolding) |
| 2. System Architecture | Task 22 (GameManager) |
| 3. Project Setup | Task 1, 2 |
| 4. Core Gameplay | Task 7, 22 |
| 5. Input System | Task 10 |
| 6. Movement & Physics | Task 12 |
| 7. Obstacle System | Task 14 |
| 8. Track Generation | Task 13 |
| 9. Collectibles & Economy | Task 8, 15 |
| 10. Power-Up System | Task 16 |
| 11. Characters | Task 19 |
| 13. Scoring | Task 9 |
| 14. Missions & Achievements | Task 18 |
| 15. Audio | Task 20 |
| 16. UI/UX | Task 1 (index.html), 21 |
| 17. Persistence | Task 6 |
| 18. Performance | Object pooling (Task 5, 13), delta-time cap (Task 7) |
| 19. Testing | Tasks 3, 4, 5, 6, 8, 9, 12, 18 |
| 20. MVP Scope | All above = v1.0 |

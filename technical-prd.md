# Technical Product Requirements Document (PRD)

## Endless Runner Game — Subway Surfers-Inspired (Browser Edition)

| Field               | Value                                          |
|---------------------|------------------------------------------------|
| **Document Version**| 2.0                                            |
| **Status**          | Draft                                          |
| **Created**         | 2026-03-28                                     |
| **Last Updated**    | 2026-03-28                                     |
| **Author**          | Akshay Patel                                   |
| **Runtime**         | Browser (Chrome, Firefox, Safari, Edge)        |
| **Rendering**       | Three.js (WebGL 2.0)                           |
| **Language**        | TypeScript                                     |
| **Bundler**         | Vite                                           |
| **Server Required** | None — fully client-side, runs locally         |

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [System Architecture](#2-system-architecture)
3. [Project Setup & Structure](#3-project-setup--structure)
4. [Core Gameplay Mechanics](#4-core-gameplay-mechanics)
5. [Input System](#5-input-system)
6. [Movement & Physics System](#6-movement--physics-system)
7. [Obstacle System](#7-obstacle-system)
8. [Procedural Track Generation](#8-procedural-track-generation)
9. [Collectibles & Economy System](#9-collectibles--economy-system)
10. [Power-Up System](#10-power-up-system)
11. [Character & Customization System](#11-character--customization-system)
12. [World / Theme System](#12-world--theme-system)
13. [Scoring & Progression System](#13-scoring--progression-system)
14. [Missions & Achievements System](#14-missions--achievements-system)
15. [Audio System](#15-audio-system)
16. [UI/UX System](#16-uiux-system)
17. [Local Persistence](#17-local-persistence)
18. [Performance Requirements](#18-performance-requirements)
19. [Testing Strategy](#19-testing-strategy)
20. [MVP Scope & Roadmap](#20-mvp-scope--roadmap)
21. [Appendices](#21-appendices)

---

## 1. Product Overview

### 1.1 Vision

A fast-paced, visually appealing endless runner browser game where the player continuously runs forward, dodging obstacles, collecting coins, and competing for personal high scores. Runs entirely in the browser with zero server dependencies — just open and play.

### 1.2 Target Platform

| Platform       | Support Level | Requirements                  |
|----------------|---------------|-------------------------------|
| Chrome 90+     | Primary       | WebGL 2.0, ES2020+           |
| Firefox 90+    | Primary       | WebGL 2.0, ES2020+           |
| Safari 15+     | Secondary     | WebGL 2.0, ES2020+           |
| Edge 90+       | Secondary     | WebGL 2.0, ES2020+           |
| Mobile browsers| Best-effort   | Touch events supported        |

### 1.3 How to Run

```bash
# Development
git clone <repo>
cd subway-surf
npm install
npm run dev
# Opens at http://localhost:5173

# Production build
npm run build
# Output: dist/ folder — open dist/index.html directly or serve statically
```

### 1.4 Target Audience

| Attribute          | Detail                                    |
|--------------------|-------------------------------------------|
| Age Range          | 10–35 years                               |
| Gamer Profile      | Casual / hyper-casual                     |
| Session Length      | 1–5 minutes per run                       |
| Input              | Keyboard (desktop) + Touch/Swipe (mobile) |

### 1.5 Success Metrics

| Metric                    | Target          |
|---------------------------|-----------------|
| Stable FPS                | >= 60 FPS       |
| Initial Load Time         | < 3 seconds     |
| Bundle Size (gzipped)     | < 5 MB          |
| Zero Runtime Errors       | 0 uncaught      |
| Memory (sustained play)   | < 200 MB        |
| Input Latency             | < 16ms (1 frame)|

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    BROWSER (Client-Only)                  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                  VITE DEV SERVER                    │  │
│  │         (development only — no prod server)         │  │
│  └────────────────────────┬───────────────────────────┘  │
│                           │                              │
│  ┌────────────────────────▼───────────────────────────┐  │
│  │                   GAME ENGINE                       │  │
│  │                                                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │  │
│  │  │  Input   │  │  Game    │  │  Three.js        │  │  │
│  │  │  Manager │  │  Loop    │  │  Renderer        │  │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬────────────┘  │  │
│  │       │              │              │               │  │
│  │  ┌────┴──────────────┴──────────────┴────────────┐ │  │
│  │  │              GAME MANAGER                      │ │  │
│  │  │                                                │ │  │
│  │  │  ┌──────────┐ ┌───────────┐ ┌──────────────┐ │ │  │
│  │  │  │  State   │ │  Track    │ │  Score       │ │ │  │
│  │  │  │  Machine │ │  Generator│ │  Manager     │ │ │  │
│  │  │  └──────────┘ └───────────┘ └──────────────┘ │ │  │
│  │  │  ┌──────────┐ ┌───────────┐ ┌──────────────┐ │ │  │
│  │  │  │  Economy │ │  PowerUp  │ │  Mission     │ │ │  │
│  │  │  │  Manager │ │  Manager  │ │  Manager     │ │ │  │
│  │  │  └──────────┘ └───────────┘ └──────────────┘ │ │  │
│  │  │  ┌──────────┐ ┌───────────┐ ┌──────────────┐ │ │  │
│  │  │  │ Character│ │  Audio    │ │  UI          │ │ │  │
│  │  │  │ Manager  │ │  Manager  │ │  Manager     │ │ │  │
│  │  │  └──────────┘ └───────────┘ └──────────────┘ │ │  │
│  │  └────────────────────┬───────────────────────────┘ │  │
│  │                       │                             │  │
│  │  ┌────────────────────▼───────────────────────────┐ │  │
│  │  │           LOCAL PERSISTENCE                     │ │  │
│  │  │     localStorage + IndexedDB (browser)          │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                          │
│  NO SERVER │ NO SOCKETS │ NO API CALLS │ NO BACKEND     │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Core Tech Stack

| Layer            | Technology                | Purpose                     |
|------------------|---------------------------|-----------------------------|
| Language         | TypeScript 5.x            | Type-safe game logic        |
| 3D Rendering     | Three.js r160+            | WebGL scene, camera, meshes |
| Bundler          | Vite 5.x                  | Dev server, HMR, build      |
| UI Layer         | HTML/CSS overlays          | Menus, HUD, screens         |
| Audio            | Web Audio API (Howler.js)  | Music, SFX                  |
| Persistence      | localStorage              | Save data, high scores      |
| Animation        | Three.js AnimationMixer + GSAP | 3D anims + UI tweens   |
| Asset Format     | GLTF/GLB (models), PNG/WebP (textures), OGG/MP3 (audio) | Optimized web formats |

### 2.3 Design Patterns

| Pattern          | Usage                                            |
|------------------|--------------------------------------------------|
| Singleton        | GameManager, AudioManager, UIManager             |
| Object Pool      | Coins, obstacles, VFX, track segments            |
| State Machine    | Game states (Menu, Playing, Paused, GameOver)    |
| Event Emitter    | Score changes, power-up events, UI updates       |
| Strategy         | Obstacle behavior, power-up effects              |
| Factory          | Track segment creation, obstacle instantiation   |

### 2.4 Game State Machine

```
                    ┌──────────┐
          ┌────────>│  LOADING │
          │         └────┬─────┘
          │              │ (assets loaded)
          │         ┌────▼─────┐
          │    ┌───>│  MENU    │<──────────────┐
          │    │    └────┬─────┘               │
          │    │         │ (press play)        │
          │    │    ┌────▼─────┐               │
          │    │    │ COUNTDOWN│               │
          │    │    └────┬─────┘               │
          │    │         │ (3..2..1..GO)       │
          │    │    ┌────▼─────┐               │
          │    │    │ PLAYING  │◄──┐           │
          │    │    └──┬───┬───┘   │           │
          │    │       │   │       │           │
          │    │  (pause) (crash) (revive)     │
          │    │       │   │       │           │
          │    │  ┌────▼┐ ┌▼─────────┐        │
          │    │  │PAUSE│ │CRASH_ANIM│        │
          │    │  └──┬──┘ └────┬─────┘        │
          │    │     │         │              │
          │    │ (resume)  ┌───▼──────┐       │
          │    │     │     │ REVIVE?  │───────┘
          │    │     │     └───┬──────┘  (yes, costs coins)
          │    │     │         │ (no / timeout)
          │    │     │    ┌────▼─────┐
          │    │     │    │GAME_OVER │
          │    │     │    └────┬─────┘
          │    │     │         │
          │    └─────┴─────────┘ (return to menu)
          │
          └── (fatal error → reload page)
```

---

## 3. Project Setup & Structure

### 3.1 Directory Structure

```
subway-surf/
├── index.html                      # Entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   ├── models/                     # GLTF/GLB 3D models
│   │   ├── characters/
│   │   ├── obstacles/
│   │   ├── environment/
│   │   └── powerups/
│   ├── textures/                   # PNG/WebP textures
│   │   ├── environment/
│   │   ├── ui/
│   │   └── vfx/
│   ├── audio/                      # OGG/MP3 audio files
│   │   ├── music/
│   │   └── sfx/
│   └── fonts/
├── src/
│   ├── main.ts                     # App entry — boots GameManager
│   ├── core/
│   │   ├── GameManager.ts          # Master singleton, owns game loop
│   │   ├── GameLoop.ts             # requestAnimationFrame loop, delta time
│   │   ├── StateMachine.ts         # Generic FSM
│   │   ├── EventBus.ts             # Typed event emitter
│   │   ├── ObjectPool.ts           # Generic object pool
│   │   └── Constants.ts            # Game-wide constants
│   ├── input/
│   │   ├── InputManager.ts         # Unified keyboard + touch
│   │   ├── KeyboardHandler.ts      # Arrow keys / WASD
│   │   └── SwipeHandler.ts         # Touch swipe detection
│   ├── player/
│   │   ├── PlayerController.ts     # Position, lane, jump, slide
│   │   ├── PlayerModel.ts          # Three.js mesh + animations
│   │   └── PlayerCollision.ts      # AABB collision checks
│   ├── track/
│   │   ├── TrackGenerator.ts       # Procedural segment spawning
│   │   ├── TrackSegment.ts         # Single segment (ground + rails + deco)
│   │   └── EnvironmentProps.ts     # Buildings, props, scenery
│   ├── obstacles/
│   │   ├── ObstacleManager.ts      # Spawn logic, placement rules
│   │   ├── ObstacleBase.ts         # Base class
│   │   ├── StaticObstacle.ts       # Barriers, parked vehicles
│   │   └── DynamicObstacle.ts      # Moving trains
│   ├── collectibles/
│   │   ├── CoinManager.ts          # Coin spawning and patterns
│   │   ├── Coin.ts                 # Individual coin (mesh + rotation)
│   │   └── KeyPickup.ts            # Rare key collectible
│   ├── powerups/
│   │   ├── PowerUpManager.ts       # Spawn, activate, deactivate
│   │   ├── PowerUpBase.ts          # Base class with timer
│   │   ├── Jetpack.ts
│   │   ├── Magnet.ts
│   │   ├── SuperSneakers.ts
│   │   ├── ScoreMultiplier.ts
│   │   └── Hoverboard.ts
│   ├── economy/
│   │   ├── WalletManager.ts        # Coins, keys — read/write localStorage
│   │   └── ShopManager.ts          # Purchase logic (all in-game currency)
│   ├── scoring/
│   │   ├── ScoreManager.ts         # Real-time score + high score
│   │   └── MultiplierTracker.ts    # Permanent multiplier from missions
│   ├── missions/
│   │   ├── MissionManager.ts       # Active missions, completion check
│   │   ├── MissionData.ts          # Mission type definitions
│   │   └── AchievementTracker.ts   # Lifetime achievements
│   ├── characters/
│   │   ├── CharacterManager.ts     # Unlock, equip, switch
│   │   └── CharacterData.ts        # Character definitions
│   ├── themes/
│   │   ├── ThemeManager.ts         # Switch skybox, ground, props
│   │   └── ThemeData.ts            # Theme definitions
│   ├── audio/
│   │   ├── AudioManager.ts         # Music + SFX via Howler.js
│   │   └── SFXPool.ts              # Pooled short sound effects
│   ├── ui/
│   │   ├── UIManager.ts            # Show/hide screens
│   │   ├── screens/
│   │   │   ├── SplashScreen.ts
│   │   │   ├── MainMenuScreen.ts
│   │   │   ├── GameplayHUD.ts
│   │   │   ├── PauseScreen.ts
│   │   │   ├── GameOverScreen.ts
│   │   │   ├── ShopScreen.ts
│   │   │   └── MissionsScreen.ts
│   │   └── components/             # Reusable UI components
│   │       ├── Button.ts
│   │       ├── ProgressBar.ts
│   │       └── CurrencyDisplay.ts
│   ├── rendering/
│   │   ├── SceneSetup.ts           # Three.js scene, camera, lights
│   │   ├── CameraController.ts     # Follow camera with smoothing
│   │   ├── VFXManager.ts           # Particle effects (coin collect, crash)
│   │   └── PostProcessing.ts       # Optional bloom, color grading
│   ├── persistence/
│   │   ├── SaveManager.ts          # Read/write localStorage
│   │   └── SaveData.ts             # TypeScript interfaces for save schema
│   └── utils/
│       ├── MathUtils.ts
│       ├── RandomUtils.ts
│       └── DOMUtils.ts
├── tests/
│   ├── unit/
│   │   ├── ScoreManager.test.ts
│   │   ├── WalletManager.test.ts
│   │   ├── MissionManager.test.ts
│   │   ├── ObjectPool.test.ts
│   │   ├── StateMachine.test.ts
│   │   └── SwipeHandler.test.ts
│   └── integration/
│       └── GameLoop.test.ts
└── technical-prd.md
```

### 3.2 Package Dependencies

```json
{
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

No other runtime dependencies. No server frameworks. No socket libraries.

---

## 4. Core Gameplay Mechanics

### 4.1 Game Loop — Detailed Flow

```
START RUN
    │
    ├── Initialize track generator (pre-spawn 5 segments ahead)
    ├── Place player at center lane, ground level
    ├── Reset score, distance, multiplier
    ├── Start background music
    │
    ▼
GAME TICK (requestAnimationFrame — per frame)
    │
    ├── Calculate deltaTime (capped at 1/30 to prevent spiral)
    ├── Process input queue
    ├── Update player position (forward velocity + lane transitions)
    ├── Update track generator (despawn behind, spawn ahead)
    ├── Update obstacle positions (dynamic obstacles)
    ├── Check collisions (AABB: player vs obstacles, collectibles)
    ├── Update active power-ups (tick timers, apply effects)
    ├── Update score (distance + multiplier)
    ├── Update difficulty curve (speed, obstacle density)
    ├── Update camera follow (smooth lerp)
    ├── Update UI (score, coins, power-up timers)
    ├── Render frame (Three.js renderer.render)
    │
    ▼
ON COLLISION (obstacle)
    │
    ├── IF hoverboard active → destroy hoverboard, continue
    ├── ELSE → trigger crash animation
    │           ├── Show revive prompt (costs coins)
    │           ├── IF revive → resume from safe position
    │           └── ELSE → GAME OVER
    │
    ▼
GAME OVER
    │
    ├── Calculate final score
    ├── Update high score in localStorage
    ├── Award coins to wallet
    ├── Check mission progress
    ├── Check achievement completion
    ├── Show game-over screen with stats
    └── Return to menu or restart
```

### 4.2 Delta Time & Frame Rate

```typescript
// GameLoop.ts — core timing
const MAX_DELTA = 1 / 30; // cap to prevent physics explosion on tab-switch

let lastTime = 0;

function tick(currentTime: number): void {
    const rawDelta = (currentTime - lastTime) / 1000;
    const deltaTime = Math.min(rawDelta, MAX_DELTA);
    lastTime = currentTime;

    if (gameState === GameState.PLAYING) {
        gameManager.update(deltaTime);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
}
```

### 4.3 Difficulty Curve

| Distance (m) | Speed (m/s) | Obstacle Density | Gap Size | Dynamic Obstacles |
|---------------|-------------|------------------|----------|-------------------|
| 0–200         | 8           | Low              | Wide     | None              |
| 200–500       | 10          | Low-Medium       | Wide     | Rare              |
| 500–1000      | 13          | Medium           | Medium   | Occasional        |
| 1000–2000     | 16          | Medium-High      | Medium   | Frequent          |
| 2000–5000     | 19          | High             | Narrow   | Frequent          |
| 5000+         | 22 (capped) | Very High        | Narrow   | Common            |

**Speed Formula:**

```
currentSpeed = baseSpeed + (distanceTraveled * accelerationRate)
currentSpeed = clamp(currentSpeed, baseSpeed, maxSpeed)

Where:
  baseSpeed        = 8.0 m/s
  accelerationRate = 0.003 m/s per meter
  maxSpeed         = 22.0 m/s
```

**Obstacle Density Formula:**

```
spawnInterval = lerp(maxInterval, minInterval, distanceTraveled / difficultyRampDistance)

Where:
  maxInterval           = 3.0 seconds (easy)
  minInterval           = 0.8 seconds (hard)
  difficultyRampDistance = 5000 meters
```

---

## 5. Input System

### 5.1 Keyboard Controls (Desktop — Primary)

| Key               | Action           |
|--------------------|-----------------|
| Arrow Left / A     | Move lane left  |
| Arrow Right / D    | Move lane right |
| Arrow Up / W / Space | Jump         |
| Arrow Down / S     | Slide           |
| Escape / P         | Pause / Resume  |
| Enter              | Activate hoverboard |

### 5.2 Touch/Swipe Controls (Mobile Browser)

| Swipe Direction | Action           |
|-----------------|------------------|
| Left            | Move lane left   |
| Right           | Move lane right  |
| Up              | Jump             |
| Down            | Slide            |
| Tap             | Activate hoverboard |

### 5.3 Swipe Detection

```typescript
// SwipeHandler.ts

interface SwipeConfig {
    minDistance: number;   // 50px minimum drag
    maxTime: number;      // 300ms maximum swipe duration
    deadZoneAngle: number; // 30 degrees between axes
}

// Detection:
// 1. touchstart → record startPosition, startTime
// 2. touchend   → record endPosition
// 3. delta = endPosition - startPosition
// 4. If magnitude(delta) < minDistance → ignore
// 5. If elapsed > maxTime → ignore
// 6. Determine angle → classify Up/Down/Left/Right
// 7. Enqueue into InputBuffer
```

### 5.4 Input Buffer

```
InputBuffer (circular, size=2)
    │
    ├── On new input → enqueue
    ├── Per game tick → dequeue oldest if player can act
    └── On state change (crash/pause) → flush buffer

Prevents input drops during animations.
Both keyboard and touch feed the same buffer.
```

---

## 6. Movement & Physics System

### 6.1 Lane System

```
         Lane -1        Lane 0        Lane +1
        (Left)         (Center)       (Right)
           │              │              │
    ───────┼──────────────┼──────────────┼───────
           │              │              │
     x = -2.5          x = 0.0       x = +2.5

     laneWidth = 2.5 units (configurable in Constants.ts)
```

### 6.2 Lane Switching

```
targetLane     : -1 | 0 | 1
currentXPos    : number
laneSwitchSpeed: 10.0 units/sec

// Per frame:
targetX  = targetLane * LANE_WIDTH
currentX = moveTowards(currentX, targetX, laneSwitchSpeed * deltaTime)
```

### 6.3 Jump Mechanics

```
jumpForce = 10.0 m/s      (initial upward velocity)
gravity   = -30.0 m/s²    (snappy game feel, not realistic)
groundY   = 0.0

OnJump:
    verticalVelocity = jumpForce
    state = JUMPING

PerFrame:
    verticalVelocity += gravity * deltaTime
    positionY += verticalVelocity * deltaTime

    if positionY <= groundY:
        positionY = groundY
        verticalVelocity = 0
        state = GROUNDED
```

### 6.4 Slide Mechanics

```
slideDuration = 0.6 seconds

OnSlide:
    Shrink collision box (height 1.8 → 0.5, center 0.9 → 0.25)
    Play slide animation
    Start slideTimer

    After slideDuration:
        Restore collision box
        Return to run animation
```

### 6.5 Collision Detection (AABB)

```
All collision detection uses Axis-Aligned Bounding Boxes (AABB).
No physics engine — custom lightweight checks.

Player AABB:
    Standing: { width: 0.8, height: 1.8, depth: 0.6 }
    Sliding:  { width: 0.8, height: 0.5, depth: 0.6 }
    Jumping:  same as standing, position.y offset

Check per frame:
    Only test objects within player's current segment ± 1
    Filter by lane proximity first (skip if > 1 lane away)
    Then AABB intersection test

    Player ↔ Obstacle    → OnObstacleHit()
    Player ↔ Coin        → OnCoinCollect()
    Player ↔ PowerUp     → OnPowerUpPickup()
    Player ↔ Key         → OnKeyPickup()

Collectible pickup radius is generous (1.2x actual size) for better game feel.
```

---

## 7. Obstacle System

### 7.1 Obstacle Types

| ID  | Type           | Behavior          | Avoidance          | Lanes | Visual              |
|-----|----------------|-------------------|--------------------|-------|---------------------|
| OB1 | Low Barrier    | Static            | Jump               | 1–2   | Hurdle, traffic cone|
| OB2 | High Barrier   | Static            | Slide              | 1–2   | Overhead beam, sign |
| OB3 | Full Barrier   | Static            | Lane switch        | 1     | Parked bus          |
| OB4 | Train (side)   | Static            | Lane switch        | 1–2   | Stationary train    |
| OB5 | Train (moving) | Dynamic (forward) | Lane switch + time | 1     | Moving train        |
| OB6 | Oncoming Train | Dynamic (toward)  | Lane switch        | 1     | Train at player     |
| OB7 | Combo Barrier  | Static            | Jump + lane switch | 2     | Mixed barriers      |

### 7.2 Obstacle Data (TypeScript)

```typescript
interface ObstacleConfig {
    id: string;
    type: 'static' | 'dynamic_forward' | 'dynamic_oncoming';
    avoidActions: ('jump' | 'slide' | 'lane_switch')[];
    minLanes: number;       // 1
    maxLanes: number;       // 2
    minDistance: number;     // meters before this type appears
    speedMultiplier: number; // for dynamic (relative to player speed)
    modelPath: string;
    weight: number;         // spawn probability weight
}
```

### 7.3 Placement Rules

```
1. NEVER block all 3 lanes simultaneously
2. Minimum gap between obstacles = playerSpeed * 0.5 seconds
3. Jump + slide obstacles never back-to-back at max difficulty (0.3s buffer)
4. Dynamic obstacles must be visible >= 1.0 seconds before reaching player
5. Harder types unlock gradually with distance
6. Combo obstacles (multi-lane + jump/slide) only after 1000m
```

---

## 8. Procedural Track Generation

### 8.1 Track Segment System

```
Each TrackSegment:
    length   = 50 units
    contains = ground mesh, side rails, environment props,
               obstacle slots, coin pattern slots
    pooled   = reused via ObjectPool
```

### 8.2 Generation Algorithm

```
Constants:
    SPAWN_AHEAD    = 5 segments
    DESPAWN_BEHIND = 2 segments
    SEGMENT_LENGTH = 50 units

Per Frame:
    playerSegmentIndex = floor(playerZ / SEGMENT_LENGTH)

    // Spawn ahead
    while (lastSpawnedIndex < playerSegmentIndex + SPAWN_AHEAD):
        segment = segmentPool.get()
        segment.position.z = lastSpawnedIndex * SEGMENT_LENGTH
        populateSegment(segment)
        scene.add(segment.group)
        lastSpawnedIndex++

    // Despawn behind
    while (firstActiveIndex < playerSegmentIndex - DESPAWN_BEHIND):
        segment = activeSegments[firstActiveIndex]
        clearSegment(segment)
        scene.remove(segment.group)
        segmentPool.release(segment)
        firstActiveIndex++
```

### 8.3 Coin Patterns

| Pattern   | Description                        | Coins | Probability |
|-----------|------------------------------------|-------|-------------|
| Line      | Straight line in one lane          | 5–8   | 40%         |
| Arc       | Curved arc across lanes            | 6–10  | 25%         |
| Jump Arc  | Arc in air (requires jump)         | 5–7   | 15%         |
| Cluster   | Group in 2x2 or 3x2 grid          | 6–12  | 10%         |
| Trail     | Follows obstacle avoidance path    | 4–6   | 10%         |

### 8.4 Object Pool Sizes

| Object Type       | Initial | Max  | Pre-warm |
|--------------------|---------|------|----------|
| Track Segment      | 8       | 12   | Yes      |
| Coin               | 150     | 300  | Yes      |
| Static Obstacle    | 20      | 40   | Yes      |
| Dynamic Obstacle   | 8       | 15   | Yes      |
| Power-Up Pickup    | 5       | 10   | Yes      |
| VFX (coin collect) | 15      | 30   | Yes      |
| VFX (crash)        | 3       | 5    | No       |

---

## 9. Collectibles & Economy System

### 9.1 Currency Types

| Currency | Earn Method                    | Use                                 | Storage      |
|----------|--------------------------------|-------------------------------------|--------------|
| Coins    | In-run collection, missions    | Character/skin unlock, upgrades, revive | localStorage |
| Keys     | Rare in-run drop, missions     | Premium unlocks                     | localStorage |

No real-money purchases. No ads. Everything is earnable through gameplay.

### 9.2 Coin Economy Balancing

```
Average coins per run (by skill level):

    Beginner (0–300m):        30–60 coins
    Intermediate (300–1000m): 80–200 coins
    Advanced (1000–3000m):    200–600 coins
    Expert (3000m+):          500–1500 coins

Costs:
    Basic character:          5,000 coins
    Rare character:           25,000 coins
    Basic skin:               3,000 coins
    Rare skin:                15,000 coins
    Power-up upgrade (Lv1→2): 2,000 coins
    Power-up upgrade (Lv2→3): 5,000 coins
    Power-up upgrade (Lv3→4): 12,000 coins
    Power-up upgrade (Lv4→5): 25,000 coins
    Revive (1st in run):      500 coins
    Revive (2nd in run):      1,500 coins (max 2 per run)
```

### 9.3 Key Economy

```
Key earn rate:
    In-run drop:          ~1 key per 5 runs (random)
    Daily mission set:    1–2 keys
    Achievement rewards:  1–10 keys

Key costs:
    Premium character:    15 keys
    Premium skin:         10 keys
```

### 9.4 Save Data Schema

```typescript
interface SaveData {
    version: number;                          // schema version for migration
    wallet: {
        coins: number;
        keys: number;
    };
    characters: {
        unlocked: string[];                   // ["default", "ninja", "skater"]
        equipped: string;                     // "ninja"
    };
    skins: {
        unlocked: Record<string, string[]>;   // { "ninja": ["default", "gold"] }
        equipped: Record<string, string>;     // { "ninja": "gold" }
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
        dailyLastReset: string;               // ISO date
    };
    achievements: string[];                   // completed achievement IDs
    statistics: {
        totalCoinsCollected: number;
        totalDistanceRun: number;
        totalRuns: number;
        totalTimePlayed: number;              // seconds
        totalJumps: number;
        totalSlides: number;
    };
    settings: {
        musicVolume: number;                  // 0.0–1.0
        sfxVolume: number;                    // 0.0–1.0
        theme: string;
    };
}
```

---

## 10. Power-Up System

### 10.1 Power-Up Specifications

#### 10.1.1 Jetpack

| Property       | Lv1 | Lv2 | Lv3 | Lv4 | Lv5 |
|----------------|-----|-----|-----|-----|-----|
| Duration (s)   | 6   | 8   | 10  | 13  | 16  |
| Flight Height  | 15  | 15  | 15  | 15  | 15  |
| Auto-Collect   | Coins | Coins | Coins+Keys | Coins+Keys | All |
| Coin Multiplier| 1x  | 1x  | 1x  | 1.5x | 2x |

**Behavior:** Fly above track, bypass all obstacles, auto-collect coins in all lanes. Smooth 0.5s ascent/descent.

#### 10.1.2 Coin Magnet

| Property       | Lv1 | Lv2 | Lv3 | Lv4 | Lv5 |
|----------------|-----|-----|-----|-----|-----|
| Duration (s)   | 6   | 8   | 10  | 13  | 16  |
| Attract Radius | 3   | 4   | 5   | 6   | 8   |
| Attract Speed  | 15  | 18  | 20  | 22  | 25  |

**Behavior:** Pull coins toward player across all lanes. Visual: particle field effect.

#### 10.1.3 Super Sneakers

| Property       | Lv1  | Lv2  | Lv3  | Lv4  | Lv5  |
|----------------|------|------|------|------|------|
| Duration (s)   | 6    | 8    | 10   | 13   | 16   |
| Jump Multiplier| 1.5x | 1.8x | 2.0x | 2.3x | 2.5x |

**Behavior:** Higher jumps, can clear slide-only obstacles by jumping. Visual: glowing sneakers.

#### 10.1.4 Score Multiplier (2x)

| Property       | Lv1 | Lv2 | Lv3 | Lv4 | Lv5 |
|----------------|-----|-----|-----|-----|-----|
| Duration (s)   | 6   | 8   | 10  | 13  | 16  |
| Score Mult     | 2x  | 2x  | 3x  | 3x  | 4x  |

**Behavior:** All score gains multiplied. Stacks with permanent multiplier.

#### 10.1.5 Hoverboard

| Property       | Detail                                     |
|----------------|--------------------------------------------|
| Duration       | Until hit (one-time shield)                |
| Activation     | Manual (Enter key / tap)                   |
| Cooldown       | 10 seconds between uses                    |
| Inventory      | Consumable (earned from runs/missions)     |
| On Hit         | Board destroyed, player safe, 2s immunity  |

### 10.2 Spawn Rules

```
- Max 1 power-up per track segment
- Minimum distance between power-ups: 200 meters
- Spawn probability increases with distance
- Weighted selection:
    Magnet:         30%
    SuperSneakers:  25%
    Multiplier:     20%
    Jetpack:        15%
    Hoverboard:     10% (only if player has < 3 in inventory)
```

---

## 11. Character & Customization System

### 11.1 Character Data

```typescript
interface CharacterConfig {
    id: string;              // "ninja"
    name: string;            // "Ninja"
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlockCurrency: 'coins' | 'keys' | 'free';
    unlockCost: number;
    modelPath: string;       // "models/characters/ninja.glb"
    skins: SkinConfig[];
}

interface SkinConfig {
    id: string;              // "ninja_gold"
    name: string;            // "Golden Ninja"
    rarity: 'common' | 'rare' | 'epic';
    unlockCurrency: 'coins' | 'keys';
    unlockCost: number;
    textureOverrides: Record<string, string>; // mesh name → texture path
}
```

### 11.2 Character Roster (MVP)

| Character      | Rarity | Unlock      | Cost    |
|----------------|--------|-------------|---------|
| Runner (default)| Common | Free        | 0       |
| Skater         | Common | Coins       | 5,000   |
| Ninja          | Rare   | Coins       | 25,000  |
| Robot          | Rare   | Keys        | 15      |
| Astronaut      | Epic   | Achievement | —       |

Skins are visual only — no gameplay advantage.

---

## 12. World / Theme System

### 12.1 Theme Data

```typescript
interface ThemeConfig {
    id: string;
    name: string;                 // "Tokyo Neon"
    skyboxTexture: string;        // path to cubemap or gradient
    groundTexture: string;
    groundColor: string;          // hex fallback
    railTexture: string;
    fogColor: string;
    fogDensity: number;
    ambientLightColor: string;
    ambientLightIntensity: number;
    buildingModels: string[];     // paths to GLTF files
    propModels: string[];
    backgroundMusic: string;      // audio file path
    accentColor: string;          // UI accent
}
```

### 12.2 Available Themes

| Theme        | Visual Style        | Unique Elements              |
|--------------|---------------------|------------------------------|
| Default City | Modern urban        | Cars, buses, billboards      |
| India (Holi) | Colorful streets    | Color powder VFX, temples    |
| Tokyo Neon   | Cyberpunk night     | Neon signs, cherry blossoms  |
| Paris        | European classic    | Eiffel Tower BG, cafes       |

### 12.3 Theme Switching

```
- Player selects theme from settings or menu
- All theme assets are bundled locally (no downloads)
- On switch: swap skybox, ground material, building models, music
- Transition: 0.5s fade to black → swap → fade in
```

---

## 13. Scoring & Progression System

### 13.1 Score Calculation

```
PER-FRAME SCORE:
    frameScore = distanceDelta * baseMultiplier * activeMultiplier

    Where:
        distanceDelta    = currentSpeed * deltaTime
        baseMultiplier   = player's permanent multiplier (1–30)
        activeMultiplier = 1.0 (normal) or 2.0–4.0 (power-up)

COIN BONUS:
    Each coin = 100 * baseMultiplier points

FINAL SCORE:
    totalScore = sum(frameScores) + sum(coinScores)
```

### 13.2 Multiplier Progression

```
Complete a mission set (3 missions) → permanent multiplier +1

Mission Set 1  → x2
Mission Set 2  → x3
...
Mission Set 29 → x30 (cap)

Each set also awards bonus coins + keys.
```

### 13.3 High Score

```
Stored in localStorage.
Updated immediately on game over.
Displayed on main menu and game over screen.
```

---

## 14. Missions & Achievements System

### 14.1 Mission Types

| Category   | Examples                                  | Reward     |
|------------|-------------------------------------------|------------|
| Collection | Collect 500 coins in a single run         | 200 coins  |
| Distance   | Run 2,000 meters                          | 300 coins  |
| Action     | Jump 50 times in a single run             | 150 coins  |
| Power-Up   | Use Jetpack 3 times                       | 250 coins  |
| Score      | Score 500,000 points                      | 1 key      |
| Survival   | Dodge 100 obstacles in a single run       | 500 coins  |
| Challenge  | Complete a run without jumping            | 1 key      |

### 14.2 Mission System

```
Active missions: 3 at a time (one set)
On completing all 3 → advance multiplier, generate new set

Set generation:
    1. Pick difficulty tier = current multiplier level
    2. Select 3 missions from that tier (no duplicates, no same type)
    3. Save to localStorage

Daily bonus missions (separate):
    - 3 missions refresh every 24 hours
    - Reward: bonus coins + 1 key for completing all 3
    - Reset tracked via localStorage timestamp
```

### 14.3 Achievements

| Achievement       | Condition                      | Reward     |
|-------------------|--------------------------------|------------|
| First Steps       | Complete first run             | 100 coins  |
| Speed Demon       | Run 5,000m in one run          | 1,000 coins|
| Coin Collector    | 100,000 total coins collected  | 2 keys     |
| Fashionista       | Unlock 5 characters            | 3 keys     |
| Power Player      | Max upgrade any power-up       | 5 keys     |
| Marathon Runner   | 1,000,000 total meters         | 10 keys    |
| Score Master      | Score 5,000,000 points         | 5,000 coins|
| Untouchable       | Run 1,000m without hitting     | 2 keys     |

---

## 15. Audio System

### 15.1 Architecture (Howler.js)

```
AudioManager (singleton)
├── Music (Howl instance — looping, cross-fade)
│   ├── Menu music
│   ├── Gameplay music (per theme)
│   └── Game over sting
├── SFX Pool (multiple Howl instances)
│   ├── Coin collect (pitch variation: 0.9–1.1 for variety)
│   ├── Jump
│   ├── Slide
│   ├── Lane switch (subtle swoosh)
│   ├── Obstacle near miss
│   ├── Crash
│   ├── Power-up pickup
│   ├── Power-up active loop
│   ├── Power-up expire warning
│   ├── Hoverboard activate
│   ├── Hoverboard break
│   ├── UI button click
│   ├── Achievement unlock
│   └── Revive
└── Settings (persisted in localStorage)
    ├── musicVolume: 0.0–1.0
    └── sfxVolume: 0.0–1.0
```

### 15.2 Audio Formats

| Type              | Format       | Quality        |
|-------------------|-------------|----------------|
| Background Music  | OGG + MP3    | 128kbps stereo |
| SFX (short)       | OGG + MP3    | 96kbps mono    |
| Ambient           | OGG + MP3    | 96kbps mono    |

Dual format (OGG primary, MP3 fallback) for cross-browser support.

### 15.3 Music Cross-Fade

```
On theme/scene transition:
    1. Fade out current (1.5s)
    2. At 50% → start fading in new (1.5s)
    3. Total transition: ~2 seconds
```

---

## 16. UI/UX System

### 16.1 Screen Flow

```
┌──────────┐     ┌──────────┐     ┌──────────────┐
│ LOADING  │────>│ MAIN     │────>│ GAMEPLAY     │
│ SCREEN   │     │ MENU     │     │ HUD          │
└──────────┘     └──┬───┬───┘     └──┬───┬───┬───┘
                    │   │            │   │   │
              ┌─────┘   └────┐   ┌──┘   │   └──┐
              ▼              ▼   ▼      ▼      ▼
        ┌──────────┐ ┌──────┐ ┌─────┐ ┌────┐ ┌──────────┐
        │ SHOP     │ │CHARS │ │PAUSE│ │REV │ │GAME OVER │
        │          │ │      │ │     │ │IVE │ │          │
        └──────────┘ └──────┘ └─────┘ └────┘ └──────────┘
                         │                         │
                         ▼                         ▼
                    ┌──────┐               ┌──────────┐
                    │ SKIN │               │ MISSIONS │
                    │SELECT│               │          │
                    └──────┘               └──────────┘
```

### 16.2 UI Implementation

```
All UI is HTML/CSS overlaid on the Three.js <canvas>.

Structure:
    <div id="app">
        <canvas id="game-canvas"></canvas>   ← Three.js renders here
        <div id="ui-layer">                  ← HTML overlay
            <div id="screen-loading" class="screen">...</div>
            <div id="screen-menu" class="screen hidden">...</div>
            <div id="screen-hud" class="screen hidden">...</div>
            <div id="screen-pause" class="screen hidden">...</div>
            <div id="screen-gameover" class="screen hidden">...</div>
            <div id="screen-shop" class="screen hidden">...</div>
            <div id="screen-missions" class="screen hidden">...</div>
            <div id="screen-characters" class="screen hidden">...</div>
        </div>
    </div>

UIManager:
    - show(screenId) → hide all, show target, GSAP fade/slide in
    - hide(screenId) → GSAP fade out, set display: none
    - Transition time: 0.3s
```

### 16.3 Gameplay HUD Layout

```
┌────────────────────────────────────┐
│  Score: 1,250,000     x15         │
│  Coins: 342                        │
│                                    │
│  [PowerUp Timer ████░░░ 3.2s]     │
│                                    │
│                                    │
│         (Three.js canvas)          │
│                                    │
│                                    │
│                                    │
│                        [Pause ⏸]  │
│  [Hoverboard x3]                  │
└────────────────────────────────────┘
```

### 16.4 Game Over Screen Layout

```
┌────────────────────────────────────┐
│          GAME OVER                 │
│                                    │
│     Score:    1,250,000           │
│     Best:     2,450,000           │
│     Coins:    342                  │
│     Distance: 3,400m              │
│                                    │
│     [REVIVE — 500 coins]          │
│                                    │
│  [MENU]            [PLAY AGAIN]   │
│                                    │
│  ── Mission Progress ──           │
│  Jump 50 times   [████░] 42/50   │
│  Collect 500     [██░░░] 342/500 │
└────────────────────────────────────┘
```

### 16.5 UI Technical Notes

```
- CSS: flexbox/grid layout, responsive to window resize
- Animations: GSAP for transitions (no CSS @keyframes for complex ones)
- Font: system font stack (no custom font download for speed)
- Touch targets: minimum 44x44px
- Canvas resizes with window (renderer.setSize on window resize event)
- pointer-events: none on HUD elements that shouldn't block game input
```

---

## 17. Local Persistence

### 17.1 Storage Strategy

```
Primary: localStorage
    Key: "subway_surf_save"
    Value: JSON.stringify(SaveData)

Read:  on game boot
Write: on game over, on purchase, on mission complete, on settings change

No encryption needed (single-player local game, no competitive integrity concern).
If localStorage is cleared, game resets to defaults — that's acceptable.
```

### 17.2 Save/Load

```typescript
class SaveManager {
    private static readonly SAVE_KEY = 'subway_surf_save';
    private static readonly CURRENT_VERSION = 1;

    static save(data: SaveData): void {
        data.version = SaveManager.CURRENT_VERSION;
        localStorage.setItem(SaveManager.SAVE_KEY, JSON.stringify(data));
    }

    static load(): SaveData {
        const raw = localStorage.getItem(SaveManager.SAVE_KEY);
        if (!raw) return SaveManager.defaultData();

        const data = JSON.parse(raw) as SaveData;
        return SaveManager.migrate(data);
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
            statistics: { totalCoinsCollected: 0, totalDistanceRun: 0, totalRuns: 0, totalTimePlayed: 0, totalJumps: 0, totalSlides: 0 },
            settings: { musicVolume: 0.7, sfxVolume: 1.0, theme: 'default_city' }
        };
    }

    // Handle schema migrations when version changes
    static migrate(data: SaveData): SaveData {
        // Add migration logic as versions increment
        return data;
    }
}
```

---

## 18. Performance Requirements

### 18.1 Target Metrics

| Metric                  | Target          |
|-------------------------|-----------------|
| Frame Rate              | 60 FPS stable   |
| Frame Time Budget       | < 16ms          |
| Draw Calls (gameplay)   | < 80            |
| Triangles (on screen)   | < 100K          |
| JS Heap (gameplay)      | < 150 MB        |
| Bundle Size (gzipped)   | < 5 MB          |
| Initial Load            | < 3 seconds     |
| GC Pauses               | < 5ms, rare     |

### 18.2 Optimization Strategies

```
Rendering:
    - Instanced meshes for coins (InstancedMesh — 1 draw call for all coins)
    - Merged geometry for track segments (BufferGeometryUtils.mergeGeometries)
    - Frustum culling (Three.js default) + manual behind-player culling
    - LOD: 2 levels for buildings (near detail, far simple box)
    - Low-poly style: keep triangle counts inherently low
    - Texture atlas for small props and coins
    - No real-time shadows (baked or none) for performance
    - Optional post-processing (bloom) only if FPS > 55

Memory:
    - Object pooling for ALL runtime objects — zero new Three.js objects during gameplay
    - Dispose geometries + materials + textures when returning to pool
    - Reuse BufferGeometry by updating attributes, not recreating
    - Texture compression: WebP (lossy, quality 80)

CPU / GC:
    - Pre-allocate all Vector3, Matrix4, Box3 instances — reuse via .set()
    - Avoid string concatenation in hot path (score display: update DOM only on change)
    - Collision: spatial partitioning by segment index (check ±1 segment only)
    - Use TypedArrays for particle systems
    - requestAnimationFrame loop — no setInterval/setTimeout
```

### 18.3 Browser Compatibility

```
Required APIs:
    - WebGL 2.0 (Three.js requirement)
    - Web Audio API (Howler.js fallback to HTML5 Audio)
    - localStorage
    - requestAnimationFrame
    - Touch Events / Pointer Events
    - ES2020 (nullish coalescing, optional chaining)

Not required:
    - WebGPU (future optimization target)
    - WebXR
    - Service Workers
    - WebSockets
    - Any network access
```

---

## 19. Testing Strategy

### 19.1 Test Framework

```
Runner: Vitest (Vite-native, fast)
Command: npm run test
```

### 19.2 Unit Tests

| Module              | Test Cases                                          |
|---------------------|-----------------------------------------------------|
| ScoreManager        | Score calc, multiplier stacking, high score update  |
| WalletManager       | Add/subtract coins/keys, underflow prevention       |
| MissionManager      | Progress tracking, completion, set advancement      |
| ObjectPool          | Get/release, pool growth, reset                     |
| StateMachine        | Transitions, guards, callbacks                      |
| SwipeHandler        | Direction detection, dead zone, edge cases          |
| DifficultyManager   | Speed curve, density curve, clamping                |
| SaveManager         | Save/load roundtrip, default data, migration        |
| CollisionDetector   | AABB intersection, near-miss, edge overlap          |
| PowerUpManager      | Activation, timer, stacking, expiry                 |

### 19.3 Manual Testing Checklist

```
□ Full game loop: menu → play → crash → game over → restart
□ All input methods: keyboard (WASD + arrows), touch swipe
□ All power-ups activate and expire correctly
□ Coins accumulate and persist across runs
□ Missions track progress and complete
□ Achievements trigger at correct thresholds
□ Shop purchases deduct currency and unlock items
□ Character/skin switching updates the 3D model
□ Theme switching updates environment visuals + music
□ Settings (volume) persist across page reload
□ localStorage clear → game resets to defaults gracefully
□ Window resize → canvas and UI adapt
□ Tab switch → game pauses, resumes on return
□ 10+ consecutive runs → no memory growth (DevTools heap snapshot)
□ 5-minute sustained run at max difficulty → stable 60 FPS
```

---

## 20. MVP Scope & Roadmap

### 20.1 MVP (v1.0) — Included

| Feature              | Scope                                       |
|----------------------|---------------------------------------------|
| Core runner gameplay | 3-lane, keyboard + touch, jump/slide        |
| Obstacles            | 3 static types + 1 dynamic type             |
| Coins                | Collection, wallet, basic shop              |
| Power-ups            | Magnet + Jetpack (2 levels each)            |
| Characters           | 1 default + 2 unlockable                    |
| Scoring              | Distance + multiplier                       |
| Missions             | 3-mission sets, multiplier progression      |
| Track generation     | Procedural, 1 default theme                 |
| UI                   | All core screens (HTML/CSS overlay)         |
| Audio                | 1 BGM + core SFX                            |
| Local save           | localStorage                                |
| Dev server           | `npm run dev` with HMR                      |

### 20.2 Deferred

| Feature              | Target  |
|----------------------|---------|
| Additional themes    | v1.1    |
| Hoverboard           | v1.1    |
| Super Sneakers       | v1.1    |
| Score Multiplier     | v1.1    |
| Keys currency        | v1.2    |
| Skins                | v1.2    |
| Daily missions       | v1.2    |
| Additional characters| v1.3    |
| All achievements     | v1.3    |
| Mobile touch polish  | v1.3    |
| PWA offline support  | v2.0    |

### 20.3 Development Milestones

| Milestone              | Description                                   |
|------------------------|-----------------------------------------------|
| M1: Prototype          | Player runs, lanes work, basic obstacles      |
| M2: Core Loop          | Coins, scoring, game over, restart            |
| M3: Content            | Power-ups, multiple obstacle types            |
| M4: Meta-Game          | Shop, characters, missions, progression       |
| M5: Polish             | Audio, VFX, theme, UI animations              |
| M6: Testing & Release  | Bug fixes, perf optimization, v1.0 tag        |

---

## 21. Appendices

### Appendix A: Glossary

| Term           | Definition                                             |
|----------------|--------------------------------------------------------|
| Lane           | One of 3 horizontal tracks the player runs on         |
| Segment        | A 50-unit section of track, procedurally populated    |
| Hoverboard     | Consumable shield that absorbs one collision          |
| Multiplier     | Permanent score multiplier earned via missions        |
| Revive         | Post-crash continuation (costs coins)                 |
| Object Pool    | Pre-allocated cache of reusable objects               |
| AABB           | Axis-Aligned Bounding Box (collision detection)       |
| HMR            | Hot Module Replacement (Vite dev feature)             |
| InstancedMesh  | Three.js feature to render many copies in 1 draw call|

### Appendix B: Dependencies (Complete)

| Package      | Version | Purpose                     | License |
|--------------|---------|-----------------------------|---------|
| three        | ^0.160  | 3D rendering (WebGL)        | MIT     |
| howler       | ^2.2    | Audio playback              | MIT     |
| gsap         | ^3.12   | UI animations/tweens        | Free*   |
| typescript   | ^5.4    | Type-safe development       | Apache  |
| vite         | ^5.2    | Bundler + dev server        | MIT     |
| vitest       | ^1.4    | Unit test runner            | MIT     |
| @types/three | ^0.160  | Three.js type definitions   | MIT     |
| @types/howler| ^2.2    | Howler type definitions     | MIT     |

*GSAP: free for non-commercial and most commercial use. No server needed.

Zero backend dependencies. Zero network dependencies.

### Appendix C: Constants Reference

```typescript
// Constants.ts — all tunable game values in one place

export const GAME = {
    LANE_WIDTH: 2.5,
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
        superSneakers: 25,
        multiplier: 20,
        jetpack: 15,
        hoverboard: 10,
    },
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
    MAX_SWIPE_TIME: 0.3,
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

---

*End of Technical PRD — v2.0 (Browser-Only, No Server)*

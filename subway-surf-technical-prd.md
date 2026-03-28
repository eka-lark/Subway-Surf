# Technical Product Requirements Document (PRD)

## Endless Runner Game — Subway Surfers-Inspired

| Field               | Value                                      |
|---------------------|--------------------------------------------|
| **Document Version**| 1.0                                        |
| **Status**          | Draft                                      |
| **Created**         | 2026-03-28                                 |
| **Last Updated**    | 2026-03-28                                 |
| **Author**          | Akshay Patel                               |
| **Game Engine**     | Unity 2022 LTS (C#)                        |
| **Target Platforms**| Android (primary), iOS (secondary), Web (future) |

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [System Architecture](#2-system-architecture)
3. [Core Gameplay Mechanics](#3-core-gameplay-mechanics)
4. [Input System](#4-input-system)
5. [Movement & Physics System](#5-movement--physics-system)
6. [Obstacle System](#6-obstacle-system)
7. [Procedural Track Generation](#7-procedural-track-generation)
8. [Economy System](#8-economy-system)
9. [Power-Up System](#9-power-up-system)
10. [Character & Customization System](#10-character--customization-system)
11. [World / Theme System](#11-world--theme-system)
12. [Scoring & Progression System](#12-scoring--progression-system)
13. [Missions & Achievements System](#13-missions--achievements-system)
14. [Audio System](#14-audio-system)
15. [UI/UX System](#15-uiux-system)
16. [Backend Services](#16-backend-services)
17. [Monetization & Ad Integration](#17-monetization--ad-integration)
18. [Analytics & Telemetry](#18-analytics--telemetry)
19. [Social & Multiplayer Features](#19-social--multiplayer-features)
20. [Performance Requirements](#20-performance-requirements)
21. [Testing Strategy](#21-testing-strategy)
22. [Security Considerations](#22-security-considerations)
23. [Release Strategy & MVP Scope](#23-release-strategy--mvp-scope)
24. [Future Roadmap](#24-future-roadmap)
25. [Appendices](#25-appendices)

---

## 1. Product Overview

### 1.1 Vision

A fast-paced, visually appealing endless runner mobile game where the player continuously runs forward, dodging obstacles, collecting coins, and competing for high scores. The game follows the proven "Subway Surfers" model: accessible controls, escalating difficulty, and a strong reward loop that drives retention and session frequency.

### 1.2 Target Audience

| Attribute         | Detail                                       |
|-------------------|----------------------------------------------|
| Age Range         | 10–35 years                                  |
| Gamer Profile     | Casual / hyper-casual                        |
| Session Length     | 1–5 minutes per run                          |
| Platform Behavior | Portrait-mode, one-hand play, on-the-go      |
| Monetization Tolerance | Ads acceptable if rewarded; light IAP spend |

### 1.3 Success Metrics (KPIs)

| Metric                   | Target (MVP)       | Target (6-month) |
|--------------------------|--------------------|-------------------|
| D1 Retention             | >= 40%             | >= 50%            |
| D7 Retention             | >= 15%             | >= 25%            |
| D30 Retention            | >= 5%              | >= 12%            |
| Avg Session Length        | >= 4 min           | >= 6 min          |
| Sessions per Day          | >= 3               | >= 5              |
| ARPDAU (ads + IAP)        | $0.03              | $0.08             |
| Crash-free Session Rate   | >= 99.5%           | >= 99.9%          |
| Avg FPS (target devices)  | >= 30 FPS          | >= 55 FPS         |
| App Size (APK)            | < 100 MB           | < 150 MB          |
| Cold Start Time           | < 4 seconds        | < 3 seconds       |

### 1.4 Platform Requirements

| Platform | Min OS Version | Min Device Spec                      |
|----------|----------------|--------------------------------------|
| Android  | Android 7.0+   | 2 GB RAM, Adreno 306 / Mali-T720    |
| iOS      | iOS 14+        | iPhone 7 and above                   |
| Web      | Modern browsers | WebGL 2.0 support (future phase)     |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Unity)                       │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Input    │  │  Game    │  │ Rendering│  │  Audio │ │
│  │  System   │  │  Logic   │  │  Pipeline│  │  Mgr   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘ │
│       │              │              │             │      │
│  ┌────┴──────────────┴──────────────┴─────────────┴───┐ │
│  │              GAME MANAGER (Singleton)               │ │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │ │
│  │  │ State   │ │ Economy  │ │ Track    │ │ Score  │ │ │
│  │  │ Machine │ │ Manager  │ │ Generator│ │ Manager│ │ │
│  │  └─────────┘ └──────────┘ └──────────┘ └────────┘ │ │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │ │
│  │  │ Mission │ │ PowerUp  │ │Character │ │  UI    │ │ │
│  │  │ Manager │ │ Manager  │ │ Manager  │ │ Manager│ │ │
│  │  └─────────┘ └──────────┘ └──────────┘ └────────┘ │ │
│  └────────────────────────┬───────────────────────────┘ │
│                           │                             │
│  ┌────────────────────────┴───────────────────────────┐ │
│  │              PERSISTENCE LAYER                      │ │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │ Local    │  │  Cloud Save  │  │  Ad SDK      │ │ │
│  │  │ Storage  │  │  (Firebase)  │  │  (AdMob)     │ │ │
│  │  └──────────┘  └──────┬───────┘  └──────────────┘ │ │
│  └───────────────────────┼────────────────────────────┘ │
└──────────────────────────┼──────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │     BACKEND SERVICES    │
              │                         │
              │  ┌───────────────────┐  │
              │  │  Firebase Suite   │  │
              │  │  - Auth           │  │
              │  │  - Firestore      │  │
              │  │  - Cloud Save     │  │
              │  │  - Analytics      │  │
              │  │  - Remote Config  │  │
              │  │  - Cloud Messaging│  │
              │  └───────────────────┘  │
              │                         │
              │  ┌───────────────────┐  │
              │  │  Node.js API      │  │
              │  │  - Leaderboards   │  │
              │  │  - Events/Seasons │  │
              │  │  - IAP Validation │  │
              │  └───────────────────┘  │
              └─────────────────────────┘
```

### 2.2 Unity Project Structure

```
Assets/
├── _Project/
│   ├── Scripts/
│   │   ├── Core/                    # GameManager, StateManager, Singleton base
│   │   ├── Input/                   # SwipeDetector, InputHandler
│   │   ├── Player/                  # PlayerController, PlayerAnimator, PlayerCollision
│   │   ├── Track/                   # TrackGenerator, TrackSegment, ObstacleSpawner
│   │   ├── Obstacles/               # ObstacleBase, StaticObstacle, DynamicObstacle
│   │   ├── Collectibles/            # CoinController, PowerUpPickup, KeyPickup
│   │   ├── PowerUps/                # PowerUpBase, Jetpack, Magnet, SuperSneakers, Multiplier, Hoverboard
│   │   ├── Economy/                 # CurrencyManager, ShopManager, IAPManager
│   │   ├── Scoring/                 # ScoreManager, MultiplierTracker
│   │   ├── Missions/                # MissionManager, MissionData, AchievementTracker
│   │   ├── Characters/              # CharacterManager, CharacterData, SkinData
│   │   ├── UI/                      # UIManager, individual screen controllers
│   │   ├── Audio/                   # AudioManager, SFXPool
│   │   ├── Analytics/               # AnalyticsManager, EventLogger
│   │   ├── Ads/                     # AdManager, RewardedAdHandler, InterstitialHandler
│   │   ├── Social/                  # LeaderboardManager, CloudSaveManager
│   │   ├── Utilities/               # ObjectPool, Extensions, Constants
│   │   └── Data/                    # ScriptableObject definitions
│   ├── Prefabs/
│   │   ├── Track/
│   │   ├── Obstacles/
│   │   ├── Collectibles/
│   │   ├── Characters/
│   │   ├── PowerUps/
│   │   ├── VFX/
│   │   └── UI/
│   ├── Scenes/
│   │   ├── Boot.unity              # Initialization scene
│   │   ├── MainMenu.unity
│   │   ├── Gameplay.unity
│   │   └── Loading.unity
│   ├── Art/
│   │   ├── Characters/
│   │   ├── Environment/
│   │   ├── UI/
│   │   └── VFX/
│   ├── Audio/
│   │   ├── Music/
│   │   └── SFX/
│   ├── Animations/
│   ├── Materials/
│   ├── Shaders/
│   └── ScriptableObjects/
├── Plugins/                         # Third-party SDKs
├── StreamingAssets/
└── Resources/                       # Minimal — prefer Addressables
```

### 2.3 Design Patterns Used

| Pattern                | Usage                                          |
|------------------------|------------------------------------------------|
| Singleton              | GameManager, AudioManager, UIManager           |
| Object Pool            | Coins, obstacles, VFX, track segments          |
| State Machine          | Game states (Menu, Playing, Paused, GameOver)  |
| Observer / Event Bus   | Score changes, power-up events, UI updates     |
| Strategy               | Obstacle behavior, power-up effects            |
| Factory                | Track segment creation, obstacle instantiation  |
| ScriptableObject Data  | Character stats, power-up configs, mission defs |
| Command                | Input buffering, replay system (future)         |

### 2.4 Game State Machine

```
                    ┌──────────┐
          ┌────────>│  BOOT    │
          │         └────┬─────┘
          │              │ (assets loaded)
          │         ┌────▼─────┐
          │    ┌───>│  MENU    │<──────────────┐
          │    │    └────┬─────┘               │
          │    │         │ (tap play)           │
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
          │    │     │     └───┬──────┘  (yes)
          │    │     │         │ (no / timeout)
          │    │     │    ┌────▼─────┐
          │    │     │    │GAME_OVER │
          │    │     │    └────┬─────┘
          │    │     │         │
          │    └─────┴─────────┘ (return to menu)
          │
          └── (fatal error → restart)
```

---

## 3. Core Gameplay Mechanics

### 3.1 Game Loop — Detailed Flow

```
START RUN
    │
    ├── Initialize track generator (pre-spawn 5 segments ahead)
    ├── Place player at center lane, ground level
    ├── Reset score, distance, multiplier
    ├── Start background music
    │
    ▼
GAME TICK (per frame)
    │
    ├── Process input queue
    ├── Update player position (forward velocity + lane transitions)
    ├── Update track generator (despawn behind, spawn ahead)
    ├── Update obstacle positions (dynamic obstacles)
    ├── Check collisions (player vs obstacles, collectibles)
    ├── Update active power-ups (tick timers, apply effects)
    ├── Update score (distance + multiplier)
    ├── Update difficulty curve (speed, obstacle density)
    ├── Update camera follow
    ├── Update UI (score, coins, power-up timers)
    │
    ▼
ON COLLISION (obstacle)
    │
    ├── IF hoverboard active → destroy hoverboard, continue
    ├── ELSE → trigger crash animation
    │           ├── Show revive prompt (key or rewarded ad)
    │           ├── IF revive → resume from safe position
    │           └── ELSE → GAME OVER
    │
    ▼
GAME OVER
    │
    ├── Calculate final score
    ├── Update high score (local + cloud)
    ├── Award coins to wallet
    ├── Check mission progress
    ├── Check achievement completion
    ├── Show game-over screen with stats
    ├── Optional: show interstitial ad (frequency-capped)
    └── Return to menu or restart
```

### 3.2 Difficulty Curve

The game dynamically adjusts difficulty based on distance traveled.

| Distance (m) | Speed (m/s) | Obstacle Density | Gap Size   | Dynamic Obstacles |
|---------------|-------------|------------------|------------|-------------------|
| 0–200         | 8           | Low              | Wide       | None              |
| 200–500       | 10          | Low-Medium       | Wide       | Rare              |
| 500–1000      | 13          | Medium           | Medium     | Occasional        |
| 1000–2000     | 16          | Medium-High      | Medium     | Frequent          |
| 2000–5000     | 19          | High             | Narrow     | Frequent          |
| 5000+         | 22 (capped) | Very High        | Narrow     | Common            |

**Speed Formula:**

```
currentSpeed = baseSpeed + (distanceTraveled * accelerationRate)
currentSpeed = Mathf.Clamp(currentSpeed, baseSpeed, maxSpeed)

Where:
  baseSpeed        = 8.0 m/s
  accelerationRate = 0.003 m/s per meter
  maxSpeed         = 22.0 m/s
```

**Obstacle Density Formula:**

```
spawnInterval = Mathf.Lerp(maxInterval, minInterval, distanceTraveled / difficultyRampDistance)

Where:
  maxInterval           = 3.0 seconds (easy)
  minInterval           = 0.8 seconds (hard)
  difficultyRampDistance = 5000 meters
```

---

## 4. Input System

### 4.1 Swipe Detection

```csharp
// Pseudocode — SwipeDetector.cs

struct SwipeData {
    Vector2 startPosition;
    Vector2 endPosition;
    float   startTime;
    SwipeDirection direction;  // Up, Down, Left, Right
}

// Configuration (ScriptableObject)
float minSwipeDistance   = 50px;       // minimum drag to register
float maxSwipeTime      = 0.3s;       // maximum time for swipe gesture
float deadZoneAngle     = 30 degrees; // angular dead zone between axes

// Detection Logic:
// 1. On touch begin → record startPosition, startTime
// 2. On touch end   → record endPosition
// 3. Calculate delta = endPosition - startPosition
// 4. If magnitude(delta) < minSwipeDistance → ignore
// 5. If (Time.time - startTime) > maxSwipeTime → ignore
// 6. Determine angle → classify as Up/Down/Left/Right
// 7. Enqueue SwipeData into InputBuffer
```

### 4.2 Input Buffer

The system uses a small input buffer (max 2 inputs) to handle rapid successive swipes and prevent input drops during animations.

```
InputBuffer (circular, size=2)
  │
  ├── On new swipe → enqueue
  ├── Per game tick → dequeue oldest if player can act
  └── On state change (crash/pause) → flush buffer
```

### 4.3 Input-to-Action Mapping

| Swipe Direction | Action           | Conditions                                  |
|-----------------|------------------|---------------------------------------------|
| Left            | Move lane left   | Player not in leftmost lane                 |
| Right           | Move lane right  | Player not in rightmost lane                |
| Up              | Jump             | Player is grounded                          |
| Down            | Slide/Roll       | Player is grounded; cancels jump if airborne|
| Double Tap      | Activate hoverboard | Hoverboard available in inventory        |

---

## 5. Movement & Physics System

### 5.1 Lane System

```
         Lane -1        Lane 0        Lane +1
        (Left)         (Center)       (Right)
           │              │              │
    ───────┼──────────────┼──────────────┼───────
           │              │              │
     x = -laneWidth   x = 0.0     x = +laneWidth

     laneWidth = 2.5 units (adjustable via ScriptableObject)
```

### 5.2 Lane Switching

```
// Smooth lane transition
targetLane     : int   (-1, 0, +1)
currentXPos    : float
laneSwitchSpeed: 10.0 units/sec

// Per frame:
targetX    = targetLane * laneWidth
currentX   = Mathf.MoveTowards(currentX, targetX, laneSwitchSpeed * deltaTime)
```

### 5.3 Jump Mechanics

```
jumpForce      = 10.0 m/s  (initial upward velocity)
gravity        = -30.0 m/s² (tuned for snappy feel, NOT realistic)
groundY        = 0.0

// State: GROUNDED, JUMPING, FALLING
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

### 5.4 Slide Mechanics

```
slideDuration  = 0.6 seconds
slideColliderHeight = 0.5 (normal = 1.8)
slideColliderCenter = 0.25 (normal = 0.9)

OnSlide:
    Shrink collider
    Play slide animation
    Start slideTimer

    After slideDuration:
        Restore collider
        Return to run animation
```

### 5.5 Collision Detection

```
Player Collider:
    Type: CapsuleCollider (standing) / BoxCollider (sliding)
    Layer: "Player"

Obstacle Collider:
    Type: BoxCollider (trigger)
    Layer: "Obstacle"

Collectible Collider:
    Type: SphereCollider (trigger)
    Layer: "Collectible"
    Radius: 1.0 (generous for mobile feel)

Collision Matrix:
    Player ↔ Obstacle    → OnObstacleHit()
    Player ↔ Collectible → OnCollectiblePickup()
    Player ↔ PowerUp     → OnPowerUpPickup()
```

---

## 6. Obstacle System

### 6.1 Obstacle Types

| ID  | Type              | Behavior          | Avoidance          | Lanes  | Visual Example         |
|-----|-------------------|-------------------|--------------------|--------|------------------------|
| OB1 | Low Barrier       | Static            | Jump               | 1–2    | Hurdle, traffic cone   |
| OB2 | High Barrier      | Static            | Slide              | 1–2    | Overhead beam, sign    |
| OB3 | Full Barrier      | Static            | Lane switch         | 1      | Parked bus             |
| OB4 | Train (side)      | Static            | Lane switch         | 1–2    | Stationary train car   |
| OB5 | Train (moving)    | Dynamic (forward) | Lane switch + timing| 1      | Moving train           |
| OB6 | Oncoming Train    | Dynamic (toward)  | Lane switch         | 1      | Train moving at player |
| OB7 | Combo Barrier     | Static            | Jump + lane switch  | 2      | Mixed height barriers  |

### 6.2 Obstacle Data (ScriptableObject)

```csharp
[CreateAssetMenu(menuName = "Game/Obstacle Data")]
public class ObstacleData : ScriptableObject
{
    public string obstacleId;
    public ObstacleType type;              // Static, DynamicForward, DynamicOncoming
    public AvoidanceAction[] avoidActions;  // Jump, Slide, LaneSwitch
    public int minLanesOccupied;           // 1
    public int maxLanesOccupied;           // 2
    public float minDistanceRequired;      // meters traveled before this can appear
    public float speedMultiplier;          // for dynamic obstacles (relative to player speed)
    public GameObject[] prefabVariants;    // visual variety
    public float weight;                   // spawn probability weight
}
```

### 6.3 Obstacle Placement Rules

```
1. NEVER block all 3 lanes simultaneously (always leave at least 1 escapable lane)
2. Minimum gap between consecutive obstacles = playerSpeed * 0.5 seconds
3. Jump obstacles and slide obstacles should not appear back-to-back
   at maximum difficulty (allow at least 0.3s reaction buffer)
4. Dynamic obstacles must have a visible approach time >= 1.0 seconds
5. Obstacle variants increase with distance (harder types unlock gradually)
6. Combo obstacles (multi-lane + jump/slide) only after 1000m
```

---

## 7. Procedural Track Generation

### 7.1 Track Segment System

```
Track = series of TrackSegments
Each segment:
    length     = 50 units (adjustable)
    lanes      = 3
    contains   = ground mesh, rails, environment deco, obstacle slots, coin patterns
```

### 7.2 Generation Algorithm

```
TRACK GENERATOR (runs continuously)

Constants:
    SPAWN_AHEAD    = 5 segments
    DESPAWN_BEHIND = 2 segments
    SEGMENT_LENGTH = 50 units

Pool:
    segmentPool: ObjectPool<TrackSegment>
    obstaclePool: ObjectPool<Obstacle>
    coinPool: ObjectPool<Coin>

Per Frame:
    playerSegmentIndex = floor(playerZ / SEGMENT_LENGTH)

    // Spawn ahead
    while (lastSpawnedIndex < playerSegmentIndex + SPAWN_AHEAD):
        segment = segmentPool.Get()
        segment.position.z = lastSpawnedIndex * SEGMENT_LENGTH
        PopulateSegment(segment)
        lastSpawnedIndex++

    // Despawn behind
    while (firstActiveIndex < playerSegmentIndex - DESPAWN_BEHIND):
        segment = activeSegments[firstActiveIndex]
        ClearSegment(segment)
        segmentPool.Return(segment)
        firstActiveIndex++

PopulateSegment(segment):
    1. Select obstacle pattern from weighted random pool
    2. Place obstacles according to placement rules (Section 6.3)
    3. Place coin patterns (line, arc, or cluster)
    4. Optionally place power-up pickup (probability-based)
    5. Place environment decorations (parallax buildings, props)
```

### 7.3 Coin Patterns

| Pattern     | Description                         | Coin Count | Probability |
|-------------|-------------------------------------|------------|-------------|
| Line        | Straight line in one lane           | 5–8        | 40%         |
| Arc         | Curved arc across lanes             | 6–10       | 25%         |
| Jump Arc    | Arc in air (requires jump)          | 5–7        | 15%         |
| Cluster     | Group in 2x2 or 3x2 grid           | 6–12       | 10%         |
| Trail       | Follows obstacle avoidance path     | 4–6        | 10%         |

### 7.4 Object Pooling Strategy

| Object Type       | Initial Pool Size | Max Pool Size | Pre-warm |
|--------------------|-------------------|---------------|----------|
| Track Segment      | 8                 | 12            | Yes      |
| Coin               | 200               | 500           | Yes      |
| Static Obstacle    | 30                | 60            | Yes      |
| Dynamic Obstacle   | 10                | 20            | Yes      |
| Power-Up Pickup    | 5                 | 10            | Yes      |
| VFX (coin collect) | 20                | 40            | Yes      |
| VFX (crash)        | 3                 | 5             | No       |

---

## 8. Economy System

### 8.1 Currency Types

| Currency | Earn Method                          | Primary Use                    | Storage     |
|----------|--------------------------------------|--------------------------------|-------------|
| Coins    | In-run collection, mission rewards, ads | Character/skin unlock, upgrades | Local + Cloud |
| Keys     | Rare in-run drop, mission rewards, IAP  | Revive, premium unlocks        | Local + Cloud |

### 8.2 Coin Economy Balancing

```
Average coins per run (by skill level):

    Beginner (0–300m):     30–60 coins
    Intermediate (300–1000m): 80–200 coins
    Advanced (1000–3000m):    200–600 coins
    Expert (3000m+):          500–1500 coins

Coin value in shop:
    Basic character unlock:   5,000 coins
    Rare character unlock:    25,000 coins
    Basic skin:               3,000 coins
    Rare skin:                15,000 coins
    Power-up upgrade (Lv1→2): 2,000 coins
    Power-up upgrade (Lv2→3): 5,000 coins
    Power-up upgrade (Lv3→4): 12,000 coins
    Power-up upgrade (Lv4→5): 25,000 coins

Target: Player should unlock first character in ~2 days of casual play
```

### 8.3 Key Economy Balancing

```
Key earn rate:
    In-run drop:          ~1 key per 5 runs (random)
    Daily mission set:    1–2 keys
    Weekly challenge:     3 keys
    IAP:                  Available in packs

Key costs:
    Revive (1st):         1 key
    Revive (2nd, same run): 2 keys (capped at 2 revives per run)
    Premium character:    15 keys
    Premium skin:         10 keys
```

### 8.4 Data Schema — Player Wallet

```json
{
    "wallet": {
        "coins": 12500,
        "keys": 7,
        "lastUpdated": "2026-03-28T10:30:00Z"
    },
    "unlockedCharacters": ["default", "char_ninja", "char_skater"],
    "equippedCharacter": "char_ninja",
    "equippedSkin": "skin_ninja_gold",
    "unlockedSkins": {
        "char_ninja": ["skin_ninja_default", "skin_ninja_gold"]
    },
    "powerUpLevels": {
        "jetpack": 3,
        "magnet": 2,
        "superSneakers": 1,
        "multiplier": 2,
        "hoverboard": 1
    },
    "hoverboardInventory": 3,
    "statistics": {
        "totalCoinsCollected": 85000,
        "totalDistanceRun": 250000,
        "totalRuns": 420,
        "highScore": 2450000,
        "totalTimePlayed": 72000
    }
}
```

### 8.5 Anti-Cheat — Client-Side Economy

```
Protections:
1. Obfuscate save data with AES-256 encryption (key derived from device ID + salt)
2. Checksum validation on load (SHA-256 hash stored separately)
3. Server-side validation for IAP receipts (Apple/Google receipt verification)
4. Anomaly detection: flag accounts with coin earn rates > 3σ from mean
5. Periodic server-side wallet sync (on IAP, on leaderboard submit)
```

---

## 9. Power-Up System

### 9.1 Power-Up Specifications

#### 9.1.1 Jetpack

| Property       | Level 1  | Level 2  | Level 3  | Level 4  | Level 5  |
|----------------|----------|----------|----------|----------|----------|
| Duration (s)   | 6        | 8        | 10       | 13       | 16       |
| Flight Height  | 15 units | 15 units | 15 units | 15 units | 15 units |
| Auto-Collect   | Coins only | Coins only | Coins + Keys | Coins + Keys | All items |
| Coin Multiplier| 1x       | 1x       | 1x       | 1.5x     | 2x       |

**Behavior:**
- Player flies above track at fixed height
- All obstacles bypassed during flight
- Coins auto-collected in all 3 lanes
- Smooth ascent/descent animation (0.5s each)
- Camera pulls back slightly during flight

#### 9.1.2 Coin Magnet

| Property         | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 |
|------------------|---------|---------|---------|---------|---------|
| Duration (s)     | 6       | 8       | 10      | 13      | 16      |
| Attract Radius   | 3 units | 4 units | 5 units | 6 units | 8 units |
| Attract Speed    | 15 u/s  | 18 u/s  | 20 u/s  | 22 u/s  | 25 u/s  |

**Behavior:**
- Coins within radius are pulled toward player
- Applies across all 3 lanes
- Visual: magnetic field particle effect around player

#### 9.1.3 Super Sneakers

| Property         | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 |
|------------------|---------|---------|---------|---------|---------|
| Duration (s)     | 6       | 8       | 10      | 13      | 16      |
| Jump Multiplier  | 1.5x    | 1.8x    | 2.0x    | 2.3x    | 2.5x    |

**Behavior:**
- Jump force multiplied (higher jumps)
- Can clear obstacles that normally require slide
- Visual: glowing sneakers, higher trail VFX

#### 9.1.4 Score Multiplier (2x)

| Property         | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 |
|------------------|---------|---------|---------|---------|---------|
| Duration (s)     | 6       | 8       | 10      | 13      | 16      |
| Score Multiplier | 2x      | 2x      | 3x      | 3x      | 4x      |

**Behavior:**
- All score accumulation multiplied
- Stacks with mission multiplier
- Visual: score text color changes, pulsing effect

#### 9.1.5 Hoverboard

| Property         | Detail                                    |
|------------------|-------------------------------------------|
| Duration         | Until hit (one-time shield)               |
| Activation       | Manual (double-tap) or auto on crash       |
| Cooldown         | 10 seconds between uses                   |
| Inventory        | Consumable (earned or purchased)           |
| On Hit           | Board destroyed, player safe, 2s immunity  |

### 9.2 Power-Up Spawn Rules

```
- Max 1 power-up per track segment
- Minimum distance between power-ups: 200 meters
- Spawn probability increases with distance (reward longer runs)
- Weighted random selection:
    Magnet:         30%
    SuperSneakers:  25%
    Multiplier:     20%
    Jetpack:        15%
    Hoverboard:     10% (only if player has < 3 in inventory)
```

---

## 10. Character & Customization System

### 10.1 Character Data Schema

```csharp
[CreateAssetMenu(menuName = "Game/Character Data")]
public class CharacterData : ScriptableObject
{
    public string characterId;          // "char_ninja"
    public string displayName;          // "Ninja"
    public string description;          // "Silent and swift..."
    public Rarity rarity;              // Common, Rare, Epic, Legendary
    public UnlockMethod unlockMethod;  // Coins, Keys, Event, IAP
    public int unlockCost;
    public GameObject modelPrefab;
    public RuntimeAnimatorController animController;
    public SkinData[] availableSkins;
    public Sprite shopIcon;
    public Sprite portraitIcon;
}
```

### 10.2 Skin System

```csharp
[CreateAssetMenu(menuName = "Game/Skin Data")]
public class SkinData : ScriptableObject
{
    public string skinId;               // "skin_ninja_gold"
    public string displayName;          // "Golden Ninja"
    public Rarity rarity;
    public UnlockMethod unlockMethod;
    public int unlockCost;
    public Material[] materialOverrides;
    public Sprite shopIcon;
}
```

### 10.3 Character Roster (MVP)

| Character   | Rarity   | Unlock Method | Cost   |
|-------------|----------|---------------|--------|
| Runner (default) | Common | Free       | 0      |
| Skater      | Common   | Coins         | 5,000  |
| Ninja       | Rare     | Coins         | 25,000 |
| Robot       | Rare     | Keys          | 15     |
| Astronaut   | Epic     | Event only    | -      |

---

## 11. World / Theme System

### 11.1 Theme Architecture

Each "World Tour" theme is a content module that overrides visual and audio elements without changing gameplay logic.

```csharp
[CreateAssetMenu(menuName = "Game/Theme Data")]
public class ThemeData : ScriptableObject
{
    public string themeId;
    public string displayName;           // "Tokyo Nights"
    public string description;

    [Header("Environment")]
    public Material skyboxMaterial;
    public Material groundMaterial;
    public Material railMaterial;
    public GameObject[] buildingPrefabs;
    public GameObject[] propPrefabs;
    public Color fogColor;
    public float fogDensity;
    public Color ambientLightColor;

    [Header("Obstacles")]
    public ObstacleThemeOverride[] obstacleVisuals;

    [Header("Audio")]
    public AudioClip backgroundMusic;
    public AudioClip ambientLoop;

    [Header("UI")]
    public Sprite menuBackground;
    public Color accentColor;

    [Header("Availability")]
    public System.DateTime startDate;
    public System.DateTime endDate;
    public bool isDefault;
}
```

### 11.2 Theme Roster (Launch)

| Theme       | Visual Style           | Unique Elements               |
|-------------|------------------------|-------------------------------|
| Default City| Modern urban           | Cars, buses, billboards       |
| India (Holi)| Colorful streets       | Color powder VFX, temples     |
| Tokyo Neon  | Cyberpunk night        | Neon signs, cherry blossoms   |
| Paris       | European classic       | Eiffel Tower BG, cafes        |

### 11.3 Theme Switching

```
- Themes rotate on a schedule (managed via Firebase Remote Config)
- Theme assets loaded via Addressables (on-demand download)
- Bundle size per theme: 15–30 MB
- Preload theme assets during menu screen
- Fallback to default theme if download fails
```

---

## 12. Scoring & Progression System

### 12.1 Score Calculation

```
PER-FRAME SCORE:
    frameScore = distanceDelta * baseMultiplier * activeMultiplier

    Where:
        distanceDelta    = currentSpeed * deltaTime
        baseMultiplier   = playerMultiplierLevel (starts at 1, max 30)
        activeMultiplier = 1.0 (normal) or 2.0–4.0 (power-up active)

COIN SCORE BONUS:
    Each coin collected adds: coinValue * baseMultiplier
    coinValue = 100 points (base)

FINAL SCORE:
    totalScore = sum(frameScores) + sum(coinScores)
```

### 12.2 Multiplier Progression

The permanent base multiplier increases as the player completes mission sets.

```
Mission Set 1 (3 missions) → Multiplier x2
Mission Set 2 (3 missions) → Multiplier x3
...
Mission Set 29 (3 missions) → Multiplier x30 (cap)

Each set requires completing 3 random missions.
Completing a set also awards coins + keys.
```

### 12.3 High Score Storage

```
Local:  PlayerPrefs (encrypted) → immediate write on game over
Cloud:  Firebase Firestore → async write, retry on failure

Document: users/{userId}/scores/highScore
{
    "score": 2450000,
    "distance": 8500,
    "multiplier": 15,
    "character": "char_ninja",
    "theme": "tokyo_neon",
    "timestamp": "2026-03-28T10:30:00Z",
    "clientVersion": "1.2.0",
    "deviceHash": "abc123"  // for anti-cheat correlation
}
```

---

## 13. Missions & Achievements System

### 13.1 Mission Types

| Category     | Examples                                            | Reward        |
|--------------|-----------------------------------------------------|---------------|
| Collection   | Collect 500 coins in a single run                   | 200 coins     |
| Distance     | Run 2,000 meters without collecting coins            | 300 coins     |
| Action       | Jump 50 times in a single run                       | 150 coins     |
| Power-Up     | Use Jetpack 3 times                                 | 250 coins     |
| Score        | Score 500,000 points                                | 1 key         |
| Survival     | Dodge 100 obstacles in a single run                 | 500 coins     |
| Challenge    | Complete a run without jumping                       | 1 key         |

### 13.2 Mission Data Schema

```csharp
[CreateAssetMenu(menuName = "Game/Mission Data")]
public class MissionData : ScriptableObject
{
    public string missionId;
    public string description;          // "Collect {target} coins in a single run"
    public MissionType type;            // Collection, Distance, Action, etc.
    public MissionScope scope;          // SingleRun, Cumulative
    public string trackingEvent;        // "coin_collected", "jump_performed"
    public int targetValue;             // 500
    public RewardType rewardType;       // Coins, Keys
    public int rewardAmount;            // 200
    public int difficultyTier;          // 1–10 (used for set generation)
}
```

### 13.3 Mission Sets

```
Active Missions: 3 at a time (one mission set)
On completion of all 3 → advance multiplier, generate new set

Set Generation:
    1. Pick difficulty tier = current multiplier level
    2. Select 3 missions from that tier's pool (no duplicates)
    3. Ensure variety (no 2 missions of same type)

Daily Bonus Missions (separate from sets):
    - 3 missions refresh daily at 00:00 UTC
    - Reward: bonus coins + 1 key for completing all 3
```

### 13.4 Achievements

| Achievement             | Condition                  | Reward      |
|-------------------------|----------------------------|-------------|
| First Steps             | Complete first run          | 100 coins   |
| Speed Demon             | Run 5,000m in a single run | 1,000 coins |
| Coin Collector          | Collect 100,000 total coins| 2 keys      |
| Fashionista             | Unlock 5 characters        | 3 keys      |
| Power Player            | Max upgrade any power-up   | 5 keys      |
| Marathon Runner         | Run 1,000,000 total meters | 10 keys     |
| Score Master            | Score 5,000,000 points     | 5,000 coins |
| Untouchable             | Run 1,000m without hitting | 2 keys      |

---

## 14. Audio System

### 14.1 Audio Architecture

```
AudioManager (Singleton)
├── MusicSource (AudioSource — looping, cross-fade)
│   ├── Menu Music
│   ├── Gameplay Music (per theme)
│   └── Game Over Sting
├── AmbientSource (AudioSource — looping)
│   └── Environmental sounds (per theme)
├── SFXPool (pooled AudioSources — 8 simultaneous)
│   ├── Coin Collect (pitch variation: 0.9–1.1)
│   ├── Jump
│   ├── Slide
│   ├── Lane Switch (subtle swoosh)
│   ├── Obstacle Near Miss
│   ├── Crash
│   ├── Power-Up Pickup
│   ├── Power-Up Active Loop
│   ├── Power-Up Expire Warning
│   ├── Hoverboard Activate
│   ├── Hoverboard Break
│   ├── UI Button Click
│   ├── Score Tick
│   ├── Achievement Unlock
│   └── Revive
└── Settings
    ├── MasterVolume (0.0–1.0)
    ├── MusicVolume (0.0–1.0)
    └── SFXVolume (0.0–1.0)
```

### 14.2 Audio Specs

| Asset Type          | Format    | Sample Rate | Channels | Compression       |
|---------------------|-----------|-------------|----------|-------------------|
| Background Music    | OGG Vorbis| 44100 Hz    | Stereo   | Quality 0.5       |
| SFX (short)         | WAV → OGG | 22050 Hz    | Mono     | Quality 0.7       |
| Ambient Loops       | OGG Vorbis| 22050 Hz    | Mono     | Quality 0.4       |
| UI Sounds           | WAV → OGG | 22050 Hz    | Mono     | Quality 0.7       |

### 14.3 Music Cross-Fade

```
On theme/scene transition:
    1. Start fading out current music (1.5s)
    2. At 50% volume, start fading in new music (1.5s)
    3. Total transition: ~2 seconds
```

---

## 15. UI/UX System

### 15.1 Screen Flow

```
┌─────────┐     ┌──────────┐     ┌──────────────┐
│ SPLASH  │────>│ MAIN     │────>│ GAMEPLAY     │
│ SCREEN  │     │ MENU     │     │ HUD          │
└─────────┘     └──┬───┬───┘     └──┬───┬───┬───┘
                   │   │            │   │   │
              ┌────┘   └────┐   ┌──┘   │   └──┐
              ▼             ▼   ▼      ▼      ▼
        ┌──────────┐ ┌──────┐ ┌─────┐ ┌────┐ ┌──────────┐
        │ SHOP     │ │CHARS │ │PAUSE│ │ REV│ │GAME OVER │
        │          │ │      │ │     │ │ IVE│ │          │
        └──────────┘ └──────┘ └─────┘ └────┘ └──────────┘
             │           │                         │
             ▼           ▼                         ▼
        ┌──────────┐ ┌──────┐               ┌──────────┐
        │ IAP      │ │ SKIN │               │ MISSIONS │
        │ CONFIRM  │ │SELECT│               │          │
        └──────────┘ └──────┘               └──────────┘
```

### 15.2 Screen Specifications

#### Splash Screen
- Duration: 2–3 seconds (or until assets loaded)
- Content: Game logo, loading bar, legal text
- Preload: Core gameplay assets, player data

#### Main Menu
```
┌────────────────────────────────────┐
│           [GAME LOGO]              │
│                                    │
│      ┌──────────────────┐         │
│      │   TAP TO PLAY    │         │
│      └──────────────────┘         │
│                                    │
│  [Coins: 12,500]    [Keys: 7]    │
│                                    │
│  ┌──────┐ ┌──────┐ ┌──────┐     │
│  │ Shop │ │ Chars│ │Missions│    │
│  └──────┘ └──────┘ └──────┘     │
│                                    │
│  [Settings]  [Leaderboard] [Sound]│
│                                    │
│  ┌──────────────────────────┐     │
│  │   [Character Preview]    │     │
│  │   (3D model, rotating)   │     │
│  └──────────────────────────┘     │
└────────────────────────────────────┘
```

#### Gameplay HUD
```
┌────────────────────────────────────┐
│  [Score: 1,250,000]   [x15]       │
│  [Coins: 342]                      │
│                                    │
│  [PowerUp Timer Bar ████░░░ 3.2s] │
│                                    │
│                                    │
│           (gameplay area)          │
│                                    │
│                                    │
│                                    │
│                         [Pause ⏸] │
│  [Hoverboard x3]                  │
└────────────────────────────────────┘
```

#### Game Over Screen
```
┌────────────────────────────────────┐
│          GAME OVER                 │
│                                    │
│     Score:    1,250,000           │
│     Best:     2,450,000           │
│     Coins:    342                  │
│     Distance: 3,400m              │
│                                    │
│     ┌─────────────────────┐       │
│     │   WATCH AD FOR 2x   │       │
│     │   COINS (684)       │       │
│     └─────────────────────┘       │
│                                    │
│  ┌──────────┐  ┌──────────────┐  │
│  │  MENU    │  │  PLAY AGAIN  │  │
│  └──────────┘  └──────────────┘  │
│                                    │
│  ── Mission Progress ──           │
│  Jump 50 times   [████░] 42/50   │
│  Collect 500 coins [██░░] 342/500│
└────────────────────────────────────┘
```

### 15.3 UI Technical Requirements

```
- Canvas Scaler: Scale With Screen Size (reference: 1080x1920)
- Match: 0.5 (width-height balance)
- Safe area handling for notch/punch-hole devices
- All UI animations via DOTween (avoid Animator for UI)
- Transition time between screens: 0.3s (slide or fade)
- Buttons: minimum touch target 44x44dp (per platform guidelines)
- Text rendering: TextMeshPro (never use legacy Text)
- Localization-ready: all strings via localization table
```

---

## 16. Backend Services

### 16.1 Firebase Services

| Service            | Usage                                    | Pricing Tier |
|--------------------|------------------------------------------|--------------|
| Authentication     | Anonymous auth → optional link to Google/Apple | Free (Spark) |
| Cloud Firestore    | Player data, leaderboards, events        | Blaze (pay-as-you-go) |
| Cloud Storage      | Theme asset bundles (Addressables)       | Blaze         |
| Remote Config      | Difficulty tuning, theme rotation, feature flags | Free |
| Cloud Messaging    | Push notifications (events, updates)     | Free          |
| Analytics          | Event tracking, funnels, retention       | Free          |
| Crashlytics        | Crash reporting                          | Free          |

### 16.2 Node.js API (Supplementary)

```
Purpose: Handle logic that requires server authority

Endpoints:

POST /api/v1/leaderboard/submit
    Body: { score, distance, character, clientVersion, signature }
    Auth: Firebase ID token
    Returns: { rank, percentile }
    Validation: signature check, rate limit, anomaly check

GET  /api/v1/leaderboard/global?limit=100&offset=0
    Auth: Firebase ID token
    Returns: { entries: [{ rank, displayName, score, character }] }

GET  /api/v1/leaderboard/friends?limit=50
    Auth: Firebase ID token
    Returns: { entries: [...] }

POST /api/v1/iap/verify
    Body: { platform, receiptData, productId }
    Auth: Firebase ID token
    Returns: { valid, reward }
    Action: Credits wallet server-side if valid

GET  /api/v1/events/active
    Auth: Firebase ID token
    Returns: { events: [{ id, name, startDate, endDate, rewards }] }

POST /api/v1/sync/wallet
    Body: { wallet, checksum }
    Auth: Firebase ID token
    Returns: { wallet (server-authoritative merge) }
```

### 16.3 Firestore Data Model

```
/users/{userId}
    ├── profile: { displayName, avatarUrl, createdAt }
    ├── wallet: { coins, keys, lastUpdated }
    ├── progress: { multiplierLevel, missionSetIndex, unlockedChars, ... }
    ├── statistics: { totalRuns, totalDistance, highScore, ... }
    └── settings: { musicVolume, sfxVolume, language }

/leaderboards/global/entries/{entryId}
    ├── userId, displayName, score, character, timestamp

/leaderboards/weekly/entries/{entryId}
    ├── userId, displayName, score, character, timestamp, weekId

/events/{eventId}
    ├── name, description, startDate, endDate, rewards, themeId
```

### 16.4 Cloud Save Strategy

```
Save triggers:
    1. On game over (score, wallet, progress)
    2. On IAP completion (wallet)
    3. On mission completion (progress)
    4. On app background (wallet, progress) — debounced, max 1/min
    5. On app foreground (pull latest from server, merge)

Conflict resolution:
    - Coins/Keys: server max wins (prevents rollback exploits)
    - Unlocks: union merge (never remove unlocks)
    - High score: max wins
    - Progress: highest multiplier/mission set wins
    - Last-write-wins for settings only
```

---

## 17. Monetization & Ad Integration

### 17.1 Ad Placements

| Placement          | Format        | Trigger                        | Frequency Cap       |
|--------------------|---------------|-------------------------------|---------------------|
| Revive             | Rewarded Video| On crash (before game over)    | 1 per run           |
| Double Coins       | Rewarded Video| Game over screen               | 1 per run           |
| Free Hoverboard    | Rewarded Video| Main menu / shop               | 3 per day           |
| Interstitial       | Full-screen   | After game over (before menu)  | Every 3rd run, max 5/hr |
| Banner (optional)  | Banner        | Main menu bottom               | Always visible      |

### 17.2 Ad SDK Integration

```
Primary:   Google AdMob (mediation)
Mediation: Unity Ads, AppLovin MAX, Meta Audience Network

Waterfall priority (rewarded):
    1. AppLovin MAX   (highest eCPM)
    2. Unity Ads
    3. AdMob
    4. Meta AN

Implementation:
    - Pre-load rewarded ads on game start and after each show
    - Pre-load interstitial after game start
    - Fallback: if no ad available, skip placement gracefully
    - NEVER block gameplay for ad loading
    - Show loading spinner only if ad not pre-cached (max 3s timeout)
```

### 17.3 IAP Products

| Product ID              | Type          | Price (USD) | Reward              |
|-------------------------|---------------|-------------|----------------------|
| `coins_small`           | Consumable    | $0.99       | 5,000 coins          |
| `coins_medium`          | Consumable    | $4.99       | 30,000 coins         |
| `coins_large`           | Consumable    | $9.99       | 75,000 coins         |
| `keys_small`            | Consumable    | $1.99       | 10 keys              |
| `keys_large`            | Consumable    | $4.99       | 30 keys              |
| `starter_pack`          | Non-consumable| $2.99       | 10,000 coins + 5 keys + exclusive skin |
| `no_ads`                | Non-consumable| $3.99       | Remove interstitials permanently |
| `vip_bundle`            | Non-consumable| $9.99       | No ads + 50,000 coins + 20 keys |

### 17.4 IAP Receipt Validation Flow

```
Client                        Server                    Store
  │                              │                        │
  ├── Purchase initiated ────────┼────────────────────────>
  │                              │                        │
  <── Receipt returned ──────────┼────────────────────────┤
  │                              │                        │
  ├── POST /iap/verify ─────────>                        │
  │   { receipt, productId }     │                        │
  │                              ├── Verify receipt ──────>
  │                              │                        │
  │                              <── Valid/Invalid ───────┤
  │                              │                        │
  │                              ├── Credit wallet (if valid)
  │                              │                        │
  <── { valid, reward } ────────┤                        │
  │                              │                        │
  ├── Update local wallet        │                        │
  │   + show reward UI           │                        │
```

---

## 18. Analytics & Telemetry

### 18.1 Event Taxonomy

#### Core Events

| Event Name             | Parameters                                           | Trigger              |
|------------------------|------------------------------------------------------|----------------------|
| `game_start`           | character, skin, theme, multiplier_level              | Run begins           |
| `game_over`            | score, distance, coins, cause, duration, revived      | Run ends             |
| `obstacle_hit`         | obstacle_type, distance, lane, speed                  | Collision            |
| `revive`               | method (key/ad), distance                             | Player revives       |
| `coin_collected`       | count (batch per segment), distance                   | Coins picked up      |
| `powerup_collected`    | type, distance                                        | Power-up picked up   |
| `powerup_used`         | type, duration, distance_start, distance_end          | Power-up expires     |
| `lane_switch`          | from_lane, to_lane, distance                          | Lane change          |
| `jump`                 | distance, was_necessary (near obstacle)               | Jump action          |
| `slide`                | distance, was_necessary                               | Slide action         |

#### Economy Events

| Event Name             | Parameters                                           | Trigger              |
|------------------------|------------------------------------------------------|----------------------|
| `iap_initiated`        | product_id                                            | Purchase started     |
| `iap_completed`        | product_id, price, currency                           | Purchase confirmed   |
| `iap_failed`           | product_id, error_code                                | Purchase failed      |
| `ad_requested`         | placement, ad_network                                 | Ad request sent      |
| `ad_loaded`            | placement, ad_network, load_time_ms                   | Ad ready             |
| `ad_shown`             | placement, ad_network                                 | Ad displayed         |
| `ad_completed`         | placement, ad_network, watched_full                   | Ad finished          |
| `ad_failed`            | placement, ad_network, error                          | Ad load/show failed  |
| `shop_opened`          | source (menu/game_over)                               | Shop screen opened   |
| `item_purchased`       | item_id, currency_type, amount                        | Shop item bought     |

#### Progression Events

| Event Name             | Parameters                                           | Trigger              |
|------------------------|------------------------------------------------------|----------------------|
| `mission_completed`    | mission_id, mission_type                              | Mission done         |
| `mission_set_completed`| set_index, new_multiplier                             | 3 missions done      |
| `achievement_unlocked` | achievement_id                                        | Achievement earned   |
| `character_unlocked`   | character_id, method                                  | Character purchased  |
| `skin_unlocked`        | skin_id, character_id, method                         | Skin purchased       |
| `powerup_upgraded`     | type, from_level, to_level                            | Upgrade purchased    |

### 18.2 Analytics Dashboards

```
Dashboard 1: Retention & Engagement
    - D1/D7/D30 retention curves
    - DAU/WAU/MAU
    - Sessions per user per day
    - Average session duration
    - Session count distribution

Dashboard 2: Gameplay
    - Average distance per run (by cohort)
    - Score distribution histogram
    - Crash point heatmap (distance × obstacle_type)
    - Power-up usage frequency
    - Lane preference distribution
    - Revive rate and method split

Dashboard 3: Economy
    - Coin earn vs. spend (daily)
    - Key earn vs. spend (daily)
    - IAP conversion funnel
    - ARPDAU / ARPPU
    - Ad eCPM by network and placement
    - Ad fill rate and completion rate

Dashboard 4: Technical
    - FPS distribution by device tier
    - Crash-free rate
    - App start time (p50, p95, p99)
    - Memory usage peaks
    - Network error rates
```

### 18.3 A/B Testing Framework

```
Via Firebase Remote Config:
    - Difficulty curve parameters
    - Coin economy multipliers
    - Ad frequency caps
    - IAP pricing
    - Power-up spawn rates
    - UI layout variants

Experiment setup:
    - Control: 50%, Variant: 50%
    - Minimum sample: 10,000 users per arm
    - Primary metric: D7 retention
    - Secondary: ARPDAU, session count
    - Statistical significance: p < 0.05
```

---

## 19. Social & Multiplayer Features

### 19.1 Leaderboard System

| Leaderboard    | Reset Cycle  | Reward                        |
|----------------|-------------|-------------------------------|
| All-Time       | Never       | Prestige badge                |
| Weekly         | Every Monday 00:00 UTC | Top 10: keys, coins   |
| Friends        | Never       | Bragging rights               |

### 19.2 Social Features

```
- Share score to social media (screenshot with game branding)
- Friend system via platform social graph (Google Play Games / Game Center)
- Challenge a friend (send push notification with your score to beat)
```

### 19.3 Future: Asynchronous PvP

```
Phase 2 concept:
    - "Race" against a ghost of another player's run
    - Matchmaking by skill tier (based on average score)
    - Winner gets bonus coins
    - No real-time networking required (ghost data = replay of inputs)
```

---

## 20. Performance Requirements

### 20.1 Target Performance Metrics

| Metric                     | Low-End Target | Mid-Range Target | High-End Target |
|----------------------------|----------------|------------------|-----------------|
| Frame Rate                 | 30 FPS stable  | 60 FPS stable    | 60 FPS stable   |
| Frame Time Budget          | 33ms           | 16ms             | 16ms            |
| Draw Calls (gameplay)      | < 80           | < 120            | < 200           |
| Triangles (on screen)      | < 50K          | < 150K           | < 300K          |
| Texture Memory             | < 100 MB       | < 200 MB         | < 400 MB        |
| Total RAM Usage            | < 300 MB       | < 500 MB         | < 800 MB        |
| GC Allocations (gameplay)  | 0 per frame    | 0 per frame      | 0 per frame     |
| Loading Time (cold start)  | < 5s           | < 3s             | < 2s            |
| APK Size (base)            | < 80 MB        |                  |                 |
| APK + OBB (total)          | < 150 MB       |                  |                 |

### 20.2 Optimization Strategies

```
Rendering:
    - Static batching for environment objects
    - GPU instancing for coins and repeated props
    - LOD system: 2 levels (near/far) for buildings
    - Texture atlasing for UI and small props
    - Shader: mobile-optimized (URP Lit / custom unlit where possible)
    - Shadow: single directional light, cascade = 1, low resolution
    - Post-processing: NONE on low-end, minimal bloom on high-end

Memory:
    - Object pooling for ALL runtime-spawned objects (zero Instantiate during gameplay)
    - Addressables for theme/character bundles (load on demand, unload on switch)
    - Texture compression: ASTC 4x4 (Android), ASTC 4x4 (iOS)
    - Audio compression: Vorbis for music, ADPCM for short SFX
    - Mesh compression: Medium

CPU:
    - Zero GC allocations during gameplay loop (pre-allocate all buffers)
    - Collision checks: only in player's ±1 segment range
    - Physics: minimal Rigidbody use; custom movement where possible
    - Coroutines: avoid; use update loops or job system
    - String operations: never during gameplay (use cached StringBuilder)

Device Tiers (auto-detected at startup):
    Tier 1 (Low):   < 3 GB RAM or GPU < Adreno 505
        → 30 FPS cap, reduced particles, no shadows, LOD bias = 2.0
    Tier 2 (Mid):   3–5 GB RAM and GPU >= Adreno 506
        → 60 FPS target, standard particles, basic shadows
    Tier 3 (High):  > 5 GB RAM and GPU >= Adreno 620
        → 60 FPS target, full particles, full shadows, bloom
```

### 20.3 Profiling Checkpoints

```
Must profile and pass before each release:
    □ 5-minute sustained gameplay at max difficulty — no FPS drops below target
    □ 10 consecutive runs — no memory growth (leak check)
    □ Object pool audit — zero Instantiate/Destroy calls in profiler
    □ GC allocation check — zero managed allocations during gameplay
    □ Thermal throttling test — 15 minutes continuous play on low-end device
    □ Battery drain test — < 15% per hour on reference device
```

---

## 21. Testing Strategy

### 21.1 Test Pyramid

```
                    ┌───────────┐
                    │  Manual   │  ← Exploratory, UX, visual
                    │  QA (5%)  │
                ┌───┴───────────┴───┐
                │   Integration     │  ← System tests, ad/IAP flow
                │   Tests (15%)     │
            ┌───┴───────────────────┴───┐
            │      Unit Tests (80%)     │  ← Game logic, scoring, economy
            └───────────────────────────┘
```

### 21.2 Unit Tests

| System              | Test Cases                                           |
|---------------------|------------------------------------------------------|
| ScoreManager        | Score calculation, multiplier stacking, high score    |
| CurrencyManager     | Add/subtract coins/keys, overflow, underflow          |
| MissionManager      | Progress tracking, completion, set advancement        |
| SwipeDetector       | Direction detection, dead zone, edge cases            |
| DifficultyManager   | Speed curve, obstacle density, distance thresholds    |
| ObjectPool          | Get/return, pool growth, exhaustion handling          |
| PowerUpManager      | Activation, duration, stacking, expiry                |
| TrackGenerator      | Segment spawning, despawning, obstacle placement rules|
| CollisionHandler    | Hoverboard shield, game over trigger, revive logic    |
| WalletEncryption    | Encrypt/decrypt roundtrip, tamper detection           |

### 21.3 Integration Tests

```
- Full game loop: start → play → crash → game over → restart
- IAP flow: purchase → receipt verify → wallet credit
- Ad flow: request → load → show → reward
- Cloud save: save → kill app → reopen → data intact
- Leaderboard: submit score → appear in ranking
- Mission cycle: complete 3 → advance multiplier → new set
```

### 21.4 Device Testing Matrix

| Device Category   | Representative Devices                      | Priority |
|-------------------|--------------------------------------------|----------|
| Low-End Android   | Samsung Galaxy A13, Redmi 9A               | P0       |
| Mid-Range Android | Samsung Galaxy A54, Pixel 6a               | P0       |
| High-End Android  | Samsung Galaxy S24, Pixel 8 Pro            | P1       |
| Budget iOS        | iPhone SE (3rd gen)                        | P0       |
| Standard iOS      | iPhone 13                                  | P0       |
| High-End iOS      | iPhone 15 Pro                              | P1       |
| Tablets           | iPad 9th gen, Samsung Tab S6 Lite          | P2       |

### 21.5 Performance Testing

```
Automated via Unity Test Runner + custom profiler hooks:
    - FPS stability test: 5-minute run, assert avg FPS >= target
    - Memory leak test: 10 runs, assert delta heap < 5 MB
    - Load time test: cold start, assert < threshold for device tier
    - Battery test: 30-minute session, log drain rate

CI Pipeline:
    Unity Build → Unit Tests → Build APK/IPA → Deploy to BrowserStack
    → Run automated gameplay test → Capture perf metrics → Report
```

---

## 22. Security Considerations

### 22.1 Threat Model

| Threat                    | Impact  | Mitigation                                      |
|---------------------------|---------|--------------------------------------------------|
| Save file tampering       | High    | AES-256 encryption + checksum                    |
| Memory editing (GameGuardian) | High | Server-side validation for IAP/leaderboards    |
| Network packet sniffing   | Medium  | TLS 1.3 for all API calls                       |
| Fake IAP receipts         | High    | Server-side receipt verification                 |
| Bot/automation            | Medium  | Input pattern analysis, CAPTCHA for leaderboard  |
| APK decompilation         | Medium  | IL2CPP build, code obfuscation (ProGuard)        |
| Replay attacks            | Low     | Nonce + timestamp on API calls                   |

### 22.2 Build Security

```
- IL2CPP backend (not Mono) for all release builds
- ProGuard/R8 obfuscation for Android
- Strip unused engine code
- Disable Unity debug/profiler in release builds
- API keys stored in server-side config (never in client binary)
- Firebase security rules: users can only read/write own data
```

---

## 23. Release Strategy & MVP Scope

### 23.1 MVP (v1.0) — Included

| Feature                  | Scope                                      |
|--------------------------|-------------------------------------------|
| Core runner gameplay     | 3-lane, swipe controls, jump/slide         |
| Obstacles                | 3 static types + 1 dynamic type            |
| Coins                    | Collection, wallet, basic shop              |
| Power-ups                | Magnet + Jetpack (2 levels each)            |
| Characters               | 1 default + 2 unlockable                   |
| Scoring                  | Distance + multiplier                       |
| Missions                 | 3-mission sets, multiplier progression      |
| Track generation         | Procedural, 1 default theme                 |
| UI                       | All core screens (menu, HUD, game over, shop, missions) |
| Audio                    | BGM + core SFX                              |
| Local save               | Encrypted local storage                     |
| Ads                      | Rewarded (revive + double coins)            |
| Analytics                | Core events via Firebase                    |

### 23.2 MVP — Excluded (Deferred)

| Feature                  | Target Version |
|--------------------------|----------------|
| Additional themes        | v1.1           |
| Hoverboard               | v1.1           |
| Super Sneakers           | v1.1           |
| Score Multiplier power-up| v1.1           |
| Keys currency            | v1.2           |
| Skins                    | v1.2           |
| Cloud save               | v1.2           |
| Leaderboards             | v1.2           |
| Interstitial ads         | v1.2           |
| IAP                      | v1.3           |
| Push notifications       | v1.3           |
| Friend leaderboard       | v1.4           |
| Social sharing           | v1.4           |
| Events / World Tour      | v2.0           |
| PvP mode                 | v2.0           |
| Battle Pass              | v2.0           |
| Story mode               | v3.0           |

### 23.3 Release Timeline

| Milestone       | Description                                | Target         |
|-----------------|--------------------------------------------|----------------|
| Alpha           | Core loop playable, placeholder art        | Week 6         |
| Art Integration | Final character + environment art          | Week 10        |
| Beta            | All MVP features, internal testing          | Week 12        |
| Soft Launch     | Limited geo release (Philippines, Canada)   | Week 14        |
| Iterate         | Fix issues from soft launch data           | Week 14–18     |
| Global Launch   | Worldwide release on Play Store + App Store| Week 18        |
| v1.1            | Theme system + additional power-ups         | Week 22        |
| v1.2            | Cloud save, leaderboards, keys, skins       | Week 28        |

### 23.4 Soft Launch Success Criteria

```
Proceed to global launch if:
    D1 Retention  >= 35%
    D7 Retention  >= 12%
    Crash-free    >= 99%
    Avg Session   >= 3 min
    Sessions/day  >= 2.5
    Ad eCPM       >= $3 (rewarded, US equivalent)

If not met → iterate for 2–4 weeks, re-evaluate.
```

---

## 24. Future Roadmap

### Phase 1: Foundation (v1.0–v1.2)
- Core gameplay loop perfected via soft launch data
- Economy balanced based on real player behavior
- Cloud infrastructure proven at scale

### Phase 2: Engagement (v1.3–v1.5)
- World Tour / seasonal themes (monthly rotation)
- Events system with exclusive rewards
- IAP optimization based on A/B test results
- Push notification campaigns for re-engagement

### Phase 3: Social & Competitive (v2.0)
- Friend system and social leaderboards
- Asynchronous PvP (ghost races)
- Battle Pass (seasonal, 30-day cycle)
- Clan system (shared goals, clan leaderboard)

### Phase 4: Expansion (v3.0+)
- Story mode (narrative-driven levels)
- Real-time multiplayer races
- User-generated content (custom skins marketplace)
- Cross-platform progression (mobile ↔ web)
- Accessibility features (colorblind mode, one-touch controls)

---

## 25. Appendices

### Appendix A: Glossary

| Term              | Definition                                              |
|-------------------|---------------------------------------------------------|
| Lane              | One of 3 horizontal tracks the player can run on       |
| Segment           | A section of track (50 units) that is procedurally populated |
| Hoverboard        | Consumable shield item that absorbs one collision      |
| Multiplier        | Permanent score multiplier earned via mission completion|
| Revive            | Post-crash continuation (costs key or rewarded ad)     |
| eCPM              | Effective cost per mille (ad revenue per 1000 impressions) |
| ARPDAU            | Average Revenue Per Daily Active User                  |
| D1/D7/D30         | Day-1, Day-7, Day-30 retention percentage              |
| Addressables      | Unity asset management system for on-demand loading    |
| Object Pool       | Pre-instantiated object cache to avoid runtime allocation |

### Appendix B: Third-Party Dependencies

| Package / SDK        | Version    | Purpose                        | License     |
|----------------------|------------|--------------------------------|-------------|
| Unity URP            | 14.x       | Render pipeline                | Unity EULA  |
| DOTween              | 1.2.7+     | UI/gameplay tweening           | Free / Pro  |
| TextMeshPro          | 3.x        | Text rendering                 | Unity EULA  |
| Firebase Unity SDK   | 11.x       | Auth, Firestore, Analytics, etc| Apache 2.0  |
| Google AdMob SDK     | 8.x        | Ad serving                     | Proprietary |
| Unity Ads SDK        | 4.x        | Ad mediation partner           | Unity EULA  |
| AppLovin MAX SDK     | 12.x       | Ad mediation                   | Proprietary |
| Unity IAP            | 4.x        | In-app purchases               | Unity EULA  |
| Newtonsoft JSON      | 13.x       | JSON serialization             | MIT         |
| UniTask              | 2.x        | Async/await for Unity          | MIT         |

### Appendix C: Firebase Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /leaderboards/{boardId}/entries/{entryId} {
      allow read: if request.auth != null;
      allow write: if false; // Server-only writes via Admin SDK
    }

    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin-only
    }
  }
}
```

### Appendix D: Remote Config Defaults

```json
{
    "base_speed": 8.0,
    "max_speed": 22.0,
    "acceleration_rate": 0.003,
    "obstacle_min_interval": 0.8,
    "obstacle_max_interval": 3.0,
    "difficulty_ramp_distance": 5000,
    "coin_value_points": 100,
    "revive_key_cost_1": 1,
    "revive_key_cost_2": 2,
    "max_revives_per_run": 2,
    "interstitial_frequency": 3,
    "interstitial_hourly_cap": 5,
    "rewarded_daily_cap": 10,
    "active_theme": "default_city",
    "maintenance_mode": false,
    "min_client_version": "1.0.0"
}
```

---

*End of Technical PRD — v1.0*

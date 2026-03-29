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
  JUMP_FORCE: 12.0,
  GRAVITY: -28.0,
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
  MIN_SWIPE_DISTANCE: 30,   // Lower threshold for mobile (was 50)
  MAX_SWIPE_TIME: 500,      // More forgiving swipe time (was 300ms)
  DEAD_ZONE_ANGLE: 35,      // Slightly wider dead zone for finger accuracy
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

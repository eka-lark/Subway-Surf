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

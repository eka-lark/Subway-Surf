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

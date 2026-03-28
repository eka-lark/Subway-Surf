import { Howler } from 'howler';
import { SaveManager } from '@persistence/SaveManager';

type SFXName = 'coin' | 'jump' | 'slide' | 'crash' | 'powerup' | 'click' | 'achievement';

export class AudioManager {
  private musicVolume: number;
  private sfxVolume: number;
  private initialized = false;

  constructor() {
    const data = SaveManager.load();
    this.musicVolume = data.settings.musicVolume;
    this.sfxVolume = data.settings.sfxVolume;
  }

  init(): void {
    if (this.initialized) return;
    this.initialized = true;
  }

  playSFX(name: SFXName): void {
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
          osc.frequency.value = 800 + Math.random() * 200; osc.type = 'sine';
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15); break;
        case 'jump':
          osc.frequency.value = 300; osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
          osc.type = 'square'; gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15); break;
        case 'slide':
          osc.frequency.value = 400; osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
          osc.type = 'sawtooth'; gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2); break;
        case 'crash':
          osc.type = 'sawtooth'; osc.frequency.value = 150;
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4); break;
        case 'powerup':
          osc.frequency.value = 400; osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
          osc.type = 'sine'; gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3); break;
        case 'click':
          osc.frequency.value = 600; osc.type = 'sine';
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.05); break;
        case 'achievement':
          osc.frequency.value = 523; osc.type = 'sine';
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
          const osc2 = ctx.createOscillator(); const gain2 = ctx.createGain();
          osc2.connect(gain2); gain2.connect(ctx.destination);
          gain2.gain.value = this.sfxVolume * 0.15; osc2.frequency.value = 659; osc2.type = 'sine';
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
          osc2.start(ctx.currentTime + 0.15); osc2.stop(ctx.currentTime + 0.6); break;
      }
    } catch { /* Web Audio not available */ }
  }

  setMusicVolume(vol: number): void { this.musicVolume = Math.max(0, Math.min(1, vol)); this.persistSettings(); }
  setSFXVolume(vol: number): void { this.sfxVolume = Math.max(0, Math.min(1, vol)); this.persistSettings(); }
  getMusicVolume(): number { return this.musicVolume; }
  getSFXVolume(): number { return this.sfxVolume; }

  private persistSettings(): void {
    const data = SaveManager.load();
    data.settings.musicVolume = this.musicVolume;
    data.settings.sfxVolume = this.sfxVolume;
    SaveManager.save(data);
  }
}

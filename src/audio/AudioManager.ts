import { SaveManager } from '@persistence/SaveManager';

type SFXName = 'coin' | 'jump' | 'slide' | 'crash' | 'powerup' | 'click' | 'achievement';

export class AudioManager {
  private musicVolume: number;
  private sfxVolume: number;
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private musicPlaying = false;
  private musicNodes: OscillatorNode[] = [];
  private menuMusicPlaying = false;
  private menuMusicNodes: OscillatorNode[] = [];

  constructor() {
    const data = SaveManager.load();
    this.musicVolume = data.settings.musicVolume;
    this.sfxVolume = data.settings.sfxVolume;
  }

  init(): void {
    if (this.ctx) return;
    try {
      this.ctx = new AudioContext();
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume * 0.12;
      this.musicGain.connect(this.ctx.destination);
    } catch {
      // Web Audio not available
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  startMusic(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.musicGain || this.musicPlaying) return;
    this.stopMenuMusic();
    this.musicPlaying = true;
    this.playMusicLoop();
  }

  startMenuMusic(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.musicGain || this.menuMusicPlaying) return;
    this.menuMusicPlaying = true;
    this.playMenuLoop();
  }

  stopMenuMusic(): void {
    this.menuMusicPlaying = false;
    for (const node of this.menuMusicNodes) {
      try { node.stop(); } catch { /* already stopped */ }
    }
    this.menuMusicNodes = [];
  }

  stopMusic(): void {
    this.musicPlaying = false;
    for (const node of this.musicNodes) {
      try { node.stop(); } catch { /* already stopped */ }
    }
    this.musicNodes = [];
  }

  private playMusicLoop(): void {
    if (!this.ctx || !this.musicGain || !this.musicPlaying) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Simple upbeat procedural music — bass line + melody arpeggios
    // Bass pattern (4 beats, loops every 2 seconds)
    const bassNotes = [130.81, 146.83, 164.81, 146.83]; // C3, D3, E3, D3
    const beatDuration = 0.5;

    for (let i = 0; i < bassNotes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.type = 'triangle';
      osc.frequency.value = bassNotes[i];
      gain.gain.setValueAtTime(0.3, now + i * beatDuration);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 0.9) * beatDuration);
      osc.start(now + i * beatDuration);
      osc.stop(now + (i + 1) * beatDuration);
      this.musicNodes.push(osc);
    }

    // Melody arpeggios
    const melodyNotes = [523.25, 659.25, 783.99, 659.25, 587.33, 783.99, 523.25, 659.25];
    const noteDuration = 0.25;

    for (let i = 0; i < melodyNotes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.type = 'sine';
      osc.frequency.value = melodyNotes[i];
      gain.gain.setValueAtTime(0.15, now + i * noteDuration);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 0.8) * noteDuration);
      osc.start(now + i * noteDuration);
      osc.stop(now + (i + 1) * noteDuration);
      this.musicNodes.push(osc);
    }

    // Hi-hat rhythm
    for (let i = 0; i < 8; i++) {
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * 0.3;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const hihatGain = ctx.createGain();
      noise.connect(hihatGain);
      hihatGain.connect(this.musicGain);
      hihatGain.gain.setValueAtTime(0.08, now + i * noteDuration);
      hihatGain.gain.exponentialRampToValueAtTime(0.001, now + i * noteDuration + 0.05);
      noise.start(now + i * noteDuration);
      noise.stop(now + i * noteDuration + 0.06);
    }

    // Schedule next loop
    const loopDuration = 2.0;
    setTimeout(() => {
      if (this.musicPlaying) this.playMusicLoop();
    }, loopDuration * 900);
  }

  private playMenuLoop(): void {
    if (!this.ctx || !this.musicGain || !this.menuMusicPlaying) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Calm ambient melody — soft pads with gentle notes
    const notes = [261.63, 329.63, 392.00, 329.63]; // C4, E4, G4, E4
    const noteDuration = 1.0;

    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.type = 'sine';
      osc.frequency.value = notes[i];
      gain.gain.setValueAtTime(0, now + i * noteDuration);
      gain.gain.linearRampToValueAtTime(0.12, now + i * noteDuration + 0.3);
      gain.gain.linearRampToValueAtTime(0.01, now + (i + 0.95) * noteDuration);
      osc.start(now + i * noteDuration);
      osc.stop(now + (i + 1) * noteDuration);
      this.menuMusicNodes.push(osc);

      // Soft octave harmony
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(this.musicGain);
      osc2.type = 'sine';
      osc2.frequency.value = notes[i] * 2;
      gain2.gain.setValueAtTime(0, now + i * noteDuration);
      gain2.gain.linearRampToValueAtTime(0.04, now + i * noteDuration + 0.3);
      gain2.gain.linearRampToValueAtTime(0.001, now + (i + 0.95) * noteDuration);
      osc2.start(now + i * noteDuration);
      osc2.stop(now + (i + 1) * noteDuration);
      this.menuMusicNodes.push(osc2);
    }

    const loopDuration = notes.length * noteDuration;
    setTimeout(() => {
      if (this.menuMusicPlaying) this.playMenuLoop();
    }, loopDuration * 900);
  }

  playSFX(name: SFXName): void {
    if (this.sfxVolume === 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const vol = this.sfxVolume * 0.2;

      switch (name) {
        case 'coin': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880 + Math.random() * 200, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }
        case 'jump': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'square';
          osc.frequency.setValueAtTime(250, now);
          osc.frequency.exponentialRampToValueAtTime(500, now + 0.12);
          gain.gain.setValueAtTime(vol * 0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }
        case 'slide': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
          gain.gain.setValueAtTime(vol * 0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }
        case 'crash': {
          // Noise burst for crash
          const bufferSize = ctx.sampleRate * 0.3;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const gain = ctx.createGain();
          noise.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(vol * 1.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          noise.start(now);
          noise.stop(now + 0.4);

          // Low thud
          const osc = ctx.createOscillator();
          const g2 = ctx.createGain();
          osc.connect(g2);
          g2.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(100, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
          g2.gain.setValueAtTime(vol, now);
          g2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        }
        case 'powerup': {
          // Rising arpeggio
          const notes = [523, 659, 784, 1047];
          for (let i = 0; i < notes.length; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = notes[i];
            gain.gain.setValueAtTime(vol * 0.6, now + i * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.15);
            osc.start(now + i * 0.07);
            osc.stop(now + i * 0.07 + 0.15);
          }
          break;
        }
        case 'click': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.value = 700;
          gain.gain.setValueAtTime(vol * 0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.start(now);
          osc.stop(now + 0.04);
          break;
        }
        case 'achievement': {
          // Fanfare — two ascending tones
          const notes = [523, 659, 784];
          for (let i = 0; i < notes.length; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = notes[i];
            gain.gain.setValueAtTime(vol * 0.8, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.4);
          }
          break;
        }
      }
    } catch { /* Audio API error */ }
  }

  setMusicVolume(vol: number): void {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain) this.musicGain.gain.value = this.musicVolume * 0.12;
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

import { Howl, Howler } from 'howler';
import { SaveManager } from '@persistence/SaveManager';

type SFXName = 'coin' | 'jump' | 'slide' | 'crash' | 'powerup' | 'click' | 'achievement' | 'whistle' | 'train_horn';
type MusicTrack = 'gameplay' | 'gameplay2' | 'gameplay3' | 'jetpack';

export class AudioManager {
  private musicVolume: number;
  private sfxVolume: number;
  private ctx: AudioContext | null = null;
  private _muted = false;

  // Music — static file playback via Howler (zero CPU)
  private musicTracks = new Map<MusicTrack, Howl>();
  private currentTrack: MusicTrack | null = null;
  private currentGameplayPhase = 0; // 0=gameplay, 1=dance, 2=war

  constructor() {
    const data = SaveManager.load();
    this.musicVolume = data.settings.musicVolume;
    this.sfxVolume = data.settings.sfxVolume;
  }

  init(): void {
    if (this.musicTracks.size > 0) return;

    // Preload all music tracks
    const tracks: { name: MusicTrack; src: string }[] = [
      { name: 'gameplay', src: '/audio/music/gameplay.wav' },
      { name: 'gameplay2', src: '/audio/music/gameplay2.wav' },
      { name: 'gameplay3', src: '/audio/music/gameplay3.wav' },
      { name: 'jetpack', src: '/audio/music/jetpack.wav' },
    ];

    for (const t of tracks) {
      const howl = new Howl({
        src: [t.src],
        loop: true,
        volume: this.musicVolume,
        preload: true,
      });
      this.musicTracks.set(t.name, howl);
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx) {
      try { this.ctx = new AudioContext(); } catch { return null; }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  // ─── Music Control (Howler — static file playback) ───

  playTrack(track: MusicTrack): void {
    if (this._muted) return;
    if (this.currentTrack === track) return;
    this.stopAllMusic();
    this.init(); // Ensure tracks are loaded

    const howl = this.musicTracks.get(track);
    if (!howl) return;

    this.currentTrack = track;
    howl.volume(this.musicVolume);

    if (howl.state() === 'loaded') {
      howl.play();
    } else {
      // Wait for it to load, then play
      howl.once('load', () => {
        if (this.currentTrack === track) {
          howl.play();
        }
      });
    }
  }

  stopAllMusic(): void {
    if (this.currentTrack) {
      const howl = this.musicTracks.get(this.currentTrack);
      if (howl) howl.stop();
    }
    this.currentTrack = null;
  }

  // Convenience
  startMusic(): void {
    this.currentGameplayPhase = 0;
    this.playTrack('gameplay');
  }
  startMenuMusic(): void { /* No menu music — user requested silence */ }
  startJetpackMusic(): void { this.playTrack('jetpack'); }
  stopMusic(): void { this.stopAllMusic(); }
  stopMenuMusic(): void { this.stopAllMusic(); }

  /** Call from game loop — evolves music based on distance */
  updateMusicPhase(distance: number): void {
    if (this._muted) return;
    // Don't interrupt jetpack music
    if (this.currentTrack === 'jetpack') return;

    let targetPhase = 0;
    if (distance > 2000) targetPhase = 2;      // War/adventure after 2000m
    else if (distance > 800) targetPhase = 1;   // Dance party after 800m

    if (targetPhase !== this.currentGameplayPhase) {
      this.currentGameplayPhase = targetPhase;
      const tracks: MusicTrack[] = ['gameplay', 'gameplay2', 'gameplay3'];
      this.playTrack(tracks[targetPhase]);
    }
  }

  playGameOverSting(): void {
    // Short dramatic descending phrase using oscillators (one-shot, no loop)
    const ctx = this.ensureContext();
    if (!ctx || this._muted) return;
    const now = ctx.currentTime;
    const vol = this.sfxVolume * 0.5;

    const notes = [493.88, 415.30, 392.00, 277.18, 261.63];
    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = notes[i];
      gain.gain.setValueAtTime(vol, now + i * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.3 + 0.5);
      osc.start(now + i * 0.3);
      osc.stop(now + i * 0.3 + 0.5);
    }
  }

  // ─── Sound Effects (oscillators — short one-shots, no CPU drain) ───

  playSFX(name: SFXName): void {
    if (this.sfxVolume === 0 || this._muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const vol = this.sfxVolume;

      switch (name) {
        case 'coin': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880 + Math.random() * 200, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
          gain.gain.setValueAtTime(vol * 0.5, now);
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
          osc.type = 'sine';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
          gain.gain.setValueAtTime(vol * 0.4, now);
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
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
          gain.gain.setValueAtTime(vol * 0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }
        case 'crash': {
          const bufSize = Math.floor(ctx.sampleRate * 0.3);
          const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < bufSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buf;
          const nGain = ctx.createGain();
          noise.connect(nGain);
          nGain.connect(ctx.destination);
          nGain.gain.setValueAtTime(vol * 0.7, now);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          noise.start(now);
          noise.stop(now + 0.4);

          const thud = ctx.createOscillator();
          const tGain = ctx.createGain();
          thud.connect(tGain);
          tGain.connect(ctx.destination);
          thud.type = 'sine';
          thud.frequency.setValueAtTime(80, now);
          thud.frequency.exponentialRampToValueAtTime(30, now + 0.3);
          tGain.gain.setValueAtTime(vol * 0.8, now);
          tGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          thud.start(now);
          thud.stop(now + 0.35);
          break;
        }
        case 'powerup': {
          const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
          for (let i = 0; i < notes.length; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = notes[i];
            gain.gain.setValueAtTime(vol * 0.3, now + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.2);
          }
          break;
        }
        case 'whistle': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(2200, now);
          osc.frequency.setValueAtTime(2600, now + 0.15);
          osc.frequency.setValueAtTime(2200, now + 0.3);
          gain.gain.setValueAtTime(vol * 0.3, now);
          gain.gain.setValueAtTime(vol * 0.3, now + 0.35);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          break;
        }
        case 'train_horn': {
          const horn1 = ctx.createOscillator();
          const horn2 = ctx.createOscillator();
          const hGain = ctx.createGain();
          const hornFilter = ctx.createBiquadFilter();
          hornFilter.type = 'lowpass';
          hornFilter.frequency.value = 600;
          horn1.connect(hornFilter);
          horn2.connect(hornFilter);
          hornFilter.connect(hGain);
          hGain.connect(ctx.destination);
          horn1.type = 'sawtooth';
          horn2.type = 'sawtooth';
          horn1.frequency.value = 180;
          horn2.frequency.value = 220;
          hGain.gain.setValueAtTime(vol * 0.5, now);
          hGain.gain.setValueAtTime(vol * 0.5, now + 0.3);
          hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          horn1.start(now);
          horn1.stop(now + 0.8);
          horn2.start(now);
          horn2.stop(now + 0.8);
          break;
        }
        case 'click': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.value = 700;
          gain.gain.setValueAtTime(vol * 0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.start(now);
          osc.stop(now + 0.04);
          break;
        }
        case 'achievement': {
          const notes = [392, 523.25, 659.25, 783.99];
          for (let i = 0; i < notes.length; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = notes[i];
            gain.gain.setValueAtTime(vol * 0.5, now + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);
            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.5);
          }
          break;
        }
      }
    } catch { /* Audio API error */ }
  }

  // ─── Volume & Mute ────────────────────────────

  setMusicVolume(vol: number): void {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    // Update playing track volume
    if (this.currentTrack) {
      const howl = this.musicTracks.get(this.currentTrack);
      if (howl) howl.volume(this.musicVolume);
    }
    this.persistSettings();
  }

  setSFXVolume(vol: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    this.persistSettings();
  }

  getMusicVolume(): number { return this.musicVolume; }
  getSFXVolume(): number { return this.sfxVolume; }
  get isMuted(): boolean { return this._muted; }

  toggleMute(): boolean {
    this._muted = !this._muted;
    if (this._muted) {
      this.stopAllMusic();
      Howler.mute(true);
      if (this.ctx) this.ctx.suspend();
    } else {
      Howler.mute(false);
      if (this.ctx) this.ctx.resume();
    }
    return this._muted;
  }

  private persistSettings(): void {
    const data = SaveManager.load();
    data.settings.musicVolume = this.musicVolume;
    data.settings.sfxVolume = this.sfxVolume;
    SaveManager.save(data);
  }
}

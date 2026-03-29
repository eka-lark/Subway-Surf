import { SaveManager } from '@persistence/SaveManager';

type SFXName = 'coin' | 'jump' | 'slide' | 'crash' | 'powerup' | 'click' | 'achievement' | 'whistle' | 'train_horn';
type MusicTrack = 'menu' | 'gameplay' | 'jetpack' | 'gameover';

// ─── AR Rahman-Inspired Indian Scales (Ragas) ───
// Raga Yaman (evening raga — bright, uplifting): C D E F# G A B
const RAGA_YAMAN = [261.63, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88];
// Raga Bhairav (morning raga — dramatic): C Db E F G Ab B
const RAGA_BHAIRAV = [261.63, 277.18, 329.63, 349.23, 392.00, 415.30, 493.88];
// Pentatonic (universal feel): C D E G A
const PENTATONIC = [261.63, 293.66, 329.63, 392.00, 440.00];

export class AudioManager {
  private musicVolume: number;
  private sfxVolume: number;
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private currentTrack: MusicTrack | null = null;
  private _muted = false;
  private musicTimeout: ReturnType<typeof setTimeout> | null = null;
  private activeNodes: (OscillatorNode | AudioBufferSourceNode)[] = [];
  private beat = 0;

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
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.ctx.destination);
    } catch { /* Web Audio not available */ }
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  // ─── Music Control ───────────────────────────

  playTrack(track: MusicTrack): void {
    if (this.currentTrack === track) return;
    this.stopAllMusic();
    const ctx = this.ensureContext();
    if (!ctx || !this.musicGain) return;
    this.currentTrack = track;
    this.beat = 0;
    this.scheduleLoop();
  }

  stopAllMusic(): void {
    this.currentTrack = null;
    if (this.musicTimeout) { clearTimeout(this.musicTimeout); this.musicTimeout = null; }
    for (const node of this.activeNodes) {
      try { node.stop(); } catch { /* already stopped */ }
    }
    this.activeNodes = [];
  }

  // Convenience aliases
  startMusic(): void { this.playTrack('gameplay'); }
  startMenuMusic(): void { this.playTrack('menu'); }
  startJetpackMusic(): void { this.playTrack('jetpack'); }
  playGameOverSting(): void { this.playGameOver(); }
  stopMusic(): void { this.stopAllMusic(); }
  stopMenuMusic(): void { if (this.currentTrack === 'menu') this.stopAllMusic(); }

  private scheduleLoop(): void {
    if (!this.currentTrack || !this.ctx || !this.musicGain) return;

    switch (this.currentTrack) {
      case 'menu': this.loopMenu(); break;
      case 'gameplay': this.loopGameplay(); break;
      case 'jetpack': this.loopJetpack(); break;
    }
  }

  // ─── Menu Music: Raga Yaman — peaceful bansuri-like melody ───
  // Inspired by "Maa Tujhe Salaam" intro — slow, meditative, warm
  private loopMenu(): void {
    if (this.currentTrack !== 'menu' || !this.ctx || !this.musicGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const loopDuration = 8.0;

    // Tanpura drone (Sa + Pa) — continuous harmonic bed
    this.playDrone(now, loopDuration, 130.81, 0.2);   // C3 (Sa)
    this.playDrone(now, loopDuration, 196.00, 0.1);   // G3 (Pa)

    // Bansuri melody — Raga Yaman ascending/descending
    const melody = [
      { note: 0, time: 0, dur: 1.0 },    // Sa
      { note: 2, time: 1.0, dur: 0.8 },  // Ga
      { note: 4, time: 2.0, dur: 1.2 },  // Pa
      { note: 5, time: 3.2, dur: 0.8 },  // Dha
      { note: 4, time: 4.2, dur: 1.0 },  // Pa
      { note: 2, time: 5.2, dur: 0.8 },  // Ga
      { note: 1, time: 6.0, dur: 0.6 },  // Re
      { note: 0, time: 6.8, dur: 1.2 },  // Sa
    ];
    for (const m of melody) {
      this.playFlute(now + m.time, m.dur, RAGA_YAMAN[m.note], 0.3);
    }

    // Soft tabla — just a gentle heartbeat
    for (let i = 0; i < 4; i++) {
      this.playTabla(now + i * 2, 0.12, 'dha');
    }

    this.musicTimeout = setTimeout(() => this.loopMenu(), loopDuration * 950);
  }

  // ─── Gameplay Music: Fast Chaiyya Chaiyya energy ───
  // Tabla-driven rhythm + Raga Bhairav melodic hooks + synth bass
  private loopGameplay(): void {
    if (this.currentTrack !== 'gameplay' || !this.ctx || !this.musicGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const bpm = 140;
    const beatLen = 60 / bpm;
    const barLen = beatLen * 4;
    const loopDuration = barLen * 2; // 2 bars

    // ── Layer 1: Synth Bass (driving pulse) ──
    const bassPattern = [0, 0, 4, 3, 0, 0, 2, 4]; // Scale degrees
    const scale = RAGA_BHAIRAV;
    for (let i = 0; i < bassPattern.length; i++) {
      const freq = scale[bassPattern[i]] / 2; // One octave down
      this.playBass(now + i * beatLen, beatLen * 0.8, freq, 0.4);
    }

    // ── Layer 2: Tabla rhythm (Teentaal-inspired 4/4) ──
    // Dha Dhin Dhin Dha | Dha Dhin Dhin Dha
    const tablaPattern = [
      { t: 0, type: 'dha' as const, vol: 0.3 },
      { t: beatLen, type: 'dhin' as const, vol: 0.2 },
      { t: beatLen * 1.5, type: 'dhin' as const, vol: 0.15 },
      { t: beatLen * 2, type: 'dhin' as const, vol: 0.22 },
      { t: beatLen * 3, type: 'dha' as const, vol: 0.28 },
      { t: beatLen * 3.5, type: 'ti' as const, vol: 0.15 },
      // Second bar
      { t: barLen, type: 'dha' as const, vol: 0.3 },
      { t: barLen + beatLen, type: 'dhin' as const, vol: 0.2 },
      { t: barLen + beatLen * 1.5, type: 'ti' as const, vol: 0.12 },
      { t: barLen + beatLen * 2, type: 'dhin' as const, vol: 0.22 },
      { t: barLen + beatLen * 2.5, type: 'ti' as const, vol: 0.12 },
      { t: barLen + beatLen * 3, type: 'dha' as const, vol: 0.28 },
    ];
    for (const t of tablaPattern) {
      this.playTabla(now + t.t, t.vol, t.type);
    }

    // ── Layer 3: Melodic hook (every other loop, alternate phrases) ──
    const phrases = [
      [4, 5, 6, 5, 4, 2, 1, 0],   // Pa Dha Ni Dha Pa Ga Re Sa
      [0, 2, 4, 6, 5, 4, 2, 0],   // Sa Ga Pa Ni Dha Pa Ga Sa
    ];
    const phrase = phrases[this.beat % 2];
    for (let i = 0; i < phrase.length; i++) {
      const freq = scale[phrase[i]];
      this.playFlute(now + i * beatLen, beatLen * 0.7, freq, 0.2);
    }

    // ── Layer 4: Hi-hat / shaker (energy) ──
    for (let i = 0; i < 16; i++) {
      this.playHihat(now + i * (beatLen / 2), 0.08);
    }

    // ── Layer 5: Cinematic string pad (sustained harmony) ──
    this.playPad(now, loopDuration, scale[0], 0.12);
    this.playPad(now, loopDuration, scale[4], 0.08);

    this.beat++;
    this.musicTimeout = setTimeout(() => this.loopGameplay(), loopDuration * 950);
  }

  // ─── Jetpack Music: Soaring, euphoric — "Jai Ho" victory energy ───
  private loopJetpack(): void {
    if (this.currentTrack !== 'jetpack' || !this.ctx || !this.musicGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const bpm = 150;
    const beatLen = 60 / bpm;
    const loopDuration = beatLen * 8;

    // Rising arpeggio pattern — triumphant, soaring
    const notes = [0, 2, 4, 2, 4, 3, 4, 2]; // Pentatonic run
    for (let i = 0; i < notes.length; i++) {
      const freq = PENTATONIC[notes[i]] * 2; // Higher octave for brightness
      this.playFlute(now + i * beatLen, beatLen * 0.6, freq, 0.25);
      // Harmony a fifth above
      this.playFlute(now + i * beatLen, beatLen * 0.6, freq * 1.5, 0.12);
    }

    // Sustained power chord drone
    this.playPad(now, loopDuration, PENTATONIC[0], 0.15);
    this.playPad(now, loopDuration, PENTATONIC[2], 0.1);
    this.playPad(now, loopDuration, PENTATONIC[4], 0.08);

    // Light rhythmic pulse
    for (let i = 0; i < 16; i++) {
      if (i % 4 === 0) this.playTabla(now + i * (beatLen / 2), 0.15, 'dha');
      else this.playHihat(now + i * (beatLen / 2), 0.06);
    }

    this.musicTimeout = setTimeout(() => this.loopJetpack(), loopDuration * 950);
  }

  // ─── Game Over Sting: Dramatic descending phrase ───
  private playGameOver(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.musicGain) return;
    const now = ctx.currentTime;

    // Dramatic descending Bhairav phrase
    const notes = [
      { freq: RAGA_BHAIRAV[6], t: 0, dur: 0.4 },     // Ni (high tension)
      { freq: RAGA_BHAIRAV[5], t: 0.3, dur: 0.4 },   // Dha
      { freq: RAGA_BHAIRAV[4], t: 0.6, dur: 0.5 },   // Pa
      { freq: RAGA_BHAIRAV[1], t: 1.0, dur: 0.8 },   // Komal Re (tension)
      { freq: RAGA_BHAIRAV[0], t: 1.5, dur: 1.5 },   // Sa (resolve)
    ];
    for (const n of notes) {
      this.playFlute(now + n.t, n.dur, n.freq, 0.35);
      // Low octave shadow
      this.playFlute(now + n.t, n.dur, n.freq / 2, 0.18);
    }

    // Deep tabla thud
    this.playTabla(now + 1.5, 0.4, 'dha');
  }

  // ─── Instrument Helpers ───────────────────────

  /** Bansuri/flute — sine with gentle vibrato */
  private playFlute(startTime: number, duration: number, freq: number, volume: number): void {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Vibrato (subtle pitch wobble — bansuri characteristic)
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);
    vibrato.frequency.value = 5; // 5Hz vibrato
    vibratoGain.gain.value = freq * 0.008; // Very subtle
    vibrato.start(startTime);
    vibrato.stop(startTime + duration);

    // Envelope — soft attack, sustained, gentle release
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.08);
    gain.gain.setValueAtTime(volume, startTime + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
    this.activeNodes.push(osc);
  }

  /** Tanpura drone — continuous sine with gentle shimmer */
  private playDrone(startTime: number, duration: number, freq: number, volume: number): void {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.5);
    gain.gain.setValueAtTime(volume, startTime + duration - 0.5);
    gain.gain.linearRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
    this.activeNodes.push(osc);
  }

  /** Synth bass — triangle wave, punchy */
  private playBass(startTime: number, duration: number, freq: number, volume: number): void {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.type = 'triangle';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
    this.activeNodes.push(osc);
  }

  /** String pad — soft sawtooth with filter */
  private playPad(startTime: number, duration: number, freq: number, volume: number): void {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 1;

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + duration * 0.3);
    gain.gain.setValueAtTime(volume, startTime + duration * 0.7);
    gain.gain.linearRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
    this.activeNodes.push(osc);
  }

  /** Tabla hit — filtered noise burst with pitch */
  private playTabla(startTime: number, volume: number, type: 'dha' | 'dhin' | 'ti'): void {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;

    // Pitched body hit
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.musicGain);

    const config = {
      dha:  { freq: 80, decay: 0.25, type: 'sine' as OscillatorType },
      dhin: { freq: 150, decay: 0.12, type: 'triangle' as OscillatorType },
      ti:   { freq: 300, decay: 0.06, type: 'sine' as OscillatorType },
    };
    const c = config[type];
    osc.type = c.type;
    osc.frequency.setValueAtTime(c.freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(c.freq * 0.5, startTime + c.decay);

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + c.decay);

    osc.start(startTime);
    osc.stop(startTime + c.decay + 0.01);
    this.activeNodes.push(osc);

    // Noise slap (attack transient)
    const bufSize = Math.floor(ctx.sampleRate * 0.03);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.2));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const nGain = ctx.createGain();
    noise.connect(nGain);
    nGain.connect(this.musicGain);
    nGain.gain.setValueAtTime(volume * 0.5, startTime);
    nGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
    noise.start(startTime);
    noise.stop(startTime + 0.05);
  }

  /** Hi-hat / shaker */
  private playHihat(startTime: number, volume: number): void {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;

    const bufSize = Math.floor(ctx.sampleRate * 0.04);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.15));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    const gain = ctx.createGain();
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
    noise.start(startTime);
    noise.stop(startTime + 0.05);
  }

  // ─── Sound Effects ─────────────────────────────

  playSFX(name: SFXName): void {
    if (this.sfxVolume === 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const vol = this.sfxVolume;

      switch (name) {
        case 'coin': {
          // Sitar-like pluck — Indian coin sound
          const freqs = [880 + Math.random() * 200, 1320];
          for (let i = 0; i < freqs.length; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freqs[i], now);
            osc.frequency.exponentialRampToValueAtTime(freqs[i] * 1.02, now + 0.05);
            gain.gain.setValueAtTime(vol * (i === 0 ? 1 : 0.3), now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
          }
          break;
        }
        case 'jump': {
          // Quick ascending swoosh
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
          gain.gain.setValueAtTime(vol * 0.6, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }
        case 'slide': {
          // Descending whoosh
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 1500;
          osc.disconnect();
          osc.connect(filter);
          filter.connect(gain);
          gain.gain.setValueAtTime(vol * 0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }
        case 'crash': {
          // Dramatic crash — noise + low impact + dissonant chord
          const bufferSize = Math.floor(ctx.sampleRate * 0.3);
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const nGain = ctx.createGain();
          noise.connect(nGain);
          nGain.connect(ctx.destination);
          nGain.gain.setValueAtTime(vol * 1.2, now);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          noise.start(now);
          noise.stop(now + 0.4);

          // Low impact thud
          const thud = ctx.createOscillator();
          const tGain = ctx.createGain();
          thud.connect(tGain);
          tGain.connect(ctx.destination);
          thud.type = 'sine';
          thud.frequency.setValueAtTime(80, now);
          thud.frequency.exponentialRampToValueAtTime(30, now + 0.3);
          tGain.gain.setValueAtTime(vol * 1.5, now);
          tGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          thud.start(now);
          thud.stop(now + 0.35);
          break;
        }
        case 'powerup': {
          // Rising Raga arpeggio — magical pickup
          const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
          for (let i = 0; i < notes.length; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = notes[i];
            gain.gain.setValueAtTime(vol * 0.5, now + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.2);
          }
          break;
        }
        case 'whistle': {
          // Police whistle
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(2200, now);
          osc.frequency.setValueAtTime(2600, now + 0.15);
          osc.frequency.setValueAtTime(2200, now + 0.3);
          gain.gain.setValueAtTime(vol * 0.4, now);
          gain.gain.setValueAtTime(vol * 0.4, now + 0.35);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
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
          // Triumphant Raga fanfare
          const notes = [392, 523.25, 659.25, 783.99];
          for (let i = 0; i < notes.length; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = notes[i];
            gain.gain.setValueAtTime(vol * 0.7, now + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);
            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.5);
            // Octave harmony
            const osc2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            osc2.connect(g2);
            g2.connect(ctx.destination);
            osc2.type = 'sine';
            osc2.frequency.value = notes[i] * 2;
            g2.gain.setValueAtTime(vol * 0.2, now + i * 0.12);
            g2.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
            osc2.start(now + i * 0.12);
            osc2.stop(now + i * 0.12 + 0.4);
          }
          break;
        }
        case 'train_horn': {
          // Deep two-tone train horn (like Indian railways)
          const horn1 = ctx.createOscillator();
          const horn2 = ctx.createOscillator();
          const hGain = ctx.createGain();
          horn1.connect(hGain);
          horn2.connect(hGain);
          hGain.connect(ctx.destination);
          horn1.type = 'sawtooth';
          horn2.type = 'sawtooth';
          // Two-tone: low + slightly higher
          horn1.frequency.setValueAtTime(180, now);
          horn2.frequency.setValueAtTime(220, now);
          hGain.gain.setValueAtTime(vol * 0.8, now);
          hGain.gain.setValueAtTime(vol * 0.8, now + 0.3);
          hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          // Apply a low-pass filter for warmth
          const hornFilter = ctx.createBiquadFilter();
          hornFilter.type = 'lowpass';
          hornFilter.frequency.value = 600;
          horn1.disconnect();
          horn2.disconnect();
          horn1.connect(hornFilter);
          horn2.connect(hornFilter);
          hornFilter.connect(hGain);
          horn1.start(now);
          horn1.stop(now + 0.8);
          horn2.start(now);
          horn2.stop(now + 0.8);
          break;
        }
      }
    } catch { /* Audio API error */ }
  }

  // ─── Volume Control ────────────────────────────

  setMusicVolume(vol: number): void {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain) this.musicGain.gain.value = this.musicVolume;
    this.persistSettings();
  }

  setSFXVolume(vol: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    this.persistSettings();
  }

  getMusicVolume(): number { return this.musicVolume; }
  getSFXVolume(): number { return this.sfxVolume; }
  get isMuted(): boolean { return this._muted; }

  /** Toggle mute — kills all audio output instantly */
  toggleMute(): boolean {
    this._muted = !this._muted;
    if (this.ctx) {
      if (this._muted) {
        this.ctx.suspend();
      } else {
        this.ctx.resume();
      }
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

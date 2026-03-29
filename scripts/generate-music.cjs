/**
 * Generate WAV music files for Subway Surf game
 * Run: node scripts/generate-music.js
 *
 * Creates:
 * - public/audio/music/gameplay.wav  (energetic EDM runner loop)
 * - public/audio/music/menu.wav      (calm ambient loop)
 * - public/audio/music/jetpack.wav   (soaring euphoric loop)
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const CHANNELS = 1;
const BIT_DEPTH = 16;

// ─── WAV Writer ───────────────────────────────

function createWav(samples, sampleRate) {
  const numSamples = samples.length;
  const byteRate = sampleRate * CHANNELS * (BIT_DEPTH / 8);
  const blockAlign = CHANNELS * (BIT_DEPTH / 8);
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);       // chunk size
  buffer.writeUInt16LE(1, 20);        // PCM format
  buffer.writeUInt16LE(CHANNELS, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(BIT_DEPTH, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(s * 32767), 44 + i * 2);
  }

  return buffer;
}

// ─── Synth Helpers ────────────────────────────

function sine(t, freq) { return Math.sin(2 * Math.PI * freq * t); }
function square(t, freq) { return sine(t, freq) > 0 ? 1 : -1; }
function saw(t, freq) { return 2 * (t * freq % 1) - 1; }
function triangle(t, freq) { return 2 * Math.abs(2 * (t * freq % 1) - 1) - 1; }
function noise() { return Math.random() * 2 - 1; }

function envelope(t, attack, decay, sustain, release, duration) {
  if (t < attack) return t / attack;
  if (t < attack + decay) return 1 - (1 - sustain) * ((t - attack) / decay);
  if (t < duration - release) return sustain;
  if (t < duration) return sustain * (1 - (t - (duration - release)) / release);
  return 0;
}

function kick(t) {
  if (t > 0.25) return 0;
  const freq = 150 * Math.exp(-t * 30);
  const env = Math.exp(-t * 12);
  return sine(t, freq) * env * 0.9 + (t < 0.01 ? noise() * 0.3 : 0);
}

function snare(t) {
  if (t > 0.15) return 0;
  const body = sine(t, 180) * Math.exp(-t * 25) * 0.4;
  const noiseComp = noise() * Math.exp(-t * 15) * 0.5;
  return body + noiseComp;
}

function hihat(t) {
  if (t > 0.05) return 0;
  return noise() * Math.exp(-t * 80) * 0.3;
}

function bass(t, freq, duration) {
  const env = envelope(t, 0.01, 0.05, 0.7, 0.05, duration);
  return sine(t, freq) * env * 0.5;
}

function lead(t, freq, duration) {
  const env = envelope(t, 0.02, 0.1, 0.5, 0.08, duration);
  const vibrato = 1 + sine(t, 5.5) * 0.003;
  return (square(t, freq * vibrato) * 0.3 + saw(t, freq * 1.003 * vibrato) * 0.15) * env;
}

function pad(t, freq, duration) {
  const env = envelope(t, 0.3, 0.2, 0.5, 0.5, duration);
  // Low-pass simulated by using sine + quiet harmonics
  return (sine(t, freq) * 0.4 + sine(t, freq * 2) * 0.08 + sine(t, freq * 3) * 0.03) * env;
}

function flute(t, freq, duration) {
  const env = envelope(t, 0.08, 0.1, 0.6, 0.15, duration);
  const vibrato = 1 + sine(t, 5) * 0.005;
  return sine(t, freq * vibrato) * env * 0.5;
}

function tabla(t, type) {
  if (t > 0.2) return 0;
  const freq = type === 'dha' ? 80 : type === 'dhin' ? 150 : 300;
  const body = sine(t, freq * Math.exp(-t * 10)) * Math.exp(-t * 15) * 0.5;
  const slap = noise() * Math.exp(-t * 40) * 0.3;
  return body + slap;
}

// ─── Generate Gameplay Music (EDM Runner — 8 seconds loop) ───

function generateGameplay() {
  const bpm = 155;
  const beatLen = 60 / bpm;
  const bars = 8;
  const duration = beatLen * 4 * bars;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float64Array(numSamples);

  // Note frequencies
  const C3 = 130.81, D3 = 146.83, E3 = 164.81, F3 = 174.61, G3 = 196.00;
  const C4 = 261.63, D4 = 293.66, E4 = 329.63, G4 = 392.00, A4 = 440.00;
  const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99;

  // Bass pattern (per bar)
  const bassPatterns = [
    [C3, C3, C3, G3],
    [C3, C3, E3, G3],
    [D3, D3, D3, F3],
    [D3, D3, G3, E3],
  ];

  // Melody phrases
  const melodies = [
    [C5, 0, E5, 0, G5, E5, D5, 0,  C5, 0, D5, E5, G5, 0, E5, D5],
    [E5, D5, C5, 0, D5, E5, 0, G5, E5, 0, D5, C5, D5, 0, 0, 0],
    [G5, 0, E5, D5, C5, 0, D5, 0,  E5, G5, 0, E5, D5, C5, 0, 0],
    [C5, D5, E5, G5, E5, D5, C5, 0, D5, E5, G5, 0, E5, D5, C5, 0],
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const beat = t / beatLen;
    const beatInBar = beat % 4;
    const bar = Math.floor(beat / 4);
    let sample = 0;

    // Kick — every beat
    const kickPhase = (beat % 1) * beatLen;
    sample += kick(kickPhase) * 0.7;

    // Snare — beat 2 and 4
    if (beatInBar >= 1 && beatInBar < 1.15) sample += snare((beatInBar - 1) * beatLen) * 0.5;
    if (beatInBar >= 3 && beatInBar < 3.15) sample += snare((beatInBar - 3) * beatLen) * 0.5;

    // Hi-hat — offbeats
    const hihatPhase = (beat * 2 % 1) * beatLen / 2;
    sample += hihat(hihatPhase) * 0.4;

    // Bass
    const bassPattern = bassPatterns[bar % bassPatterns.length];
    const bassNote = bassPattern[Math.floor(beatInBar)];
    const bassPhase = (beatInBar % 1) * beatLen;
    sample += bass(bassPhase, bassNote, beatLen * 0.8) * 0.6;

    // Melody (starts from bar 2)
    if (bar >= 2) {
      const melodyIdx = (bar - 2) % melodies.length;
      const melody = melodies[melodyIdx];
      const noteIdx = Math.floor(beat % 4 * 4) % melody.length;
      const note = melody[noteIdx];
      if (note > 0) {
        const notePhase = (beat * 4 % 1) * beatLen / 4;
        sample += lead(notePhase, note, beatLen / 4 * 0.8) * 0.35;
      }
    }

    // Pad chord (bars 0-1 and 4-5 for intro/break feel)
    if (bar < 2 || (bar >= 4 && bar < 6)) {
      sample += pad(t, C4, duration) * 0.15;
      sample += pad(t, E4, duration) * 0.1;
      sample += pad(t, G4, duration) * 0.08;
    }

    // Build-up fill on last bar
    if (bar === bars - 1 && beatInBar >= 2) {
      const rollRate = 4 + (beatInBar - 2) * 8; // Accelerating rolls
      const rollPhase = (beat * rollRate % 1) * beatLen / rollRate;
      sample += snare(rollPhase) * 0.3;
    }

    samples[i] = sample * 0.7; // Master volume
  }

  return createWav(samples, SAMPLE_RATE);
}

// ─── Generate Menu Music (Calm Ambient — 10 seconds loop) ───

function generateMenu() {
  const bpm = 70;
  const beatLen = 60 / bpm;
  const duration = beatLen * 4 * 4; // 4 bars
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float64Array(numSamples);

  // Raga Yaman notes
  const Sa = 261.63, Re = 293.66, Ga = 329.63, Pa = 392.00, Dha = 440.00;

  // Slow bansuri melody
  const melody = [
    { note: Sa, start: 0, dur: 1.5 },
    { note: Ga, start: 1.5, dur: 1.2 },
    { note: Pa, start: 3.0, dur: 1.8 },
    { note: Dha, start: 5.0, dur: 1.0 },
    { note: Pa, start: 6.2, dur: 1.5 },
    { note: Ga, start: 8.0, dur: 1.0 },
    { note: Re, start: 9.2, dur: 0.8 },
    { note: Sa, start: 10.2, dur: 2.0 },
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    // Tanpura drone
    sample += sine(t, 130.81) * 0.08; // Sa low
    sample += sine(t, 196.00) * 0.04; // Pa low
    sample += sine(t, 130.81 * 2) * 0.02; // Sa octave shimmer

    // Bansuri melody
    for (const m of melody) {
      if (t >= m.start && t < m.start + m.dur) {
        sample += flute(t - m.start, m.note, m.dur) * 0.3;
      }
    }

    // Soft tabla heartbeat
    const tablaT = t % (beatLen * 4);
    if (tablaT < 0.2) sample += tabla(tablaT, 'dha') * 0.15;
    if (tablaT >= beatLen * 2 && tablaT < beatLen * 2 + 0.2) {
      sample += tabla(tablaT - beatLen * 2, 'dhin') * 0.08;
    }

    samples[i] = sample * 0.8;
  }

  return createWav(samples, SAMPLE_RATE);
}

// ─── Generate Jetpack Music (Soaring Euphoric — 6 seconds loop) ───

function generateJetpack() {
  const bpm = 150;
  const beatLen = 60 / bpm;
  const duration = beatLen * 4 * 4; // 4 bars
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float64Array(numSamples);

  const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880.00;
  const C4 = 261.63, E4 = 329.63, G4 = 392.00;

  // Rising arpeggio pattern
  const arp = [C5, E5, G5, E5, D5, G5, A5, G5,
               E5, G5, A5, G5, E5, D5, C5, D5];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const beat = t / beatLen;
    let sample = 0;

    // Light kick (softer than gameplay)
    if (Math.floor(beat) % 2 === 0) {
      const kPhase = (beat % 1) * beatLen;
      sample += kick(kPhase) * 0.3;
    }

    // Gentle hihat
    const hhPhase = (beat * 2 % 1) * beatLen / 2;
    sample += hihat(hhPhase) * 0.15;

    // Soaring arpeggio
    const noteIdx = Math.floor(beat * 2) % arp.length;
    const note = arp[noteIdx];
    const notePhase = (beat * 2 % 1) * beatLen / 2;
    sample += lead(notePhase, note, beatLen / 2 * 0.7) * 0.25;

    // Power chord pad
    sample += pad(t, C4, duration) * 0.12;
    sample += pad(t, E4, duration) * 0.08;
    sample += pad(t, G4, duration) * 0.06;

    // Harmony fifth
    sample += flute(notePhase, note * 1.5, beatLen / 2 * 0.5) * 0.08;

    samples[i] = sample * 0.75;
  }

  return createWav(samples, SAMPLE_RATE);
}

// ─── Generate Dance Party (170 BPM — heavy drops, fast synths) ───

function generateDanceParty() {
  const bpm = 170;
  const beatLen = 60 / bpm;
  const bars = 8;
  const duration = beatLen * 4 * bars;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float64Array(numSamples);

  const E3 = 164.81, G3 = 196.00, A3 = 220.00, B3 = 246.94;
  const E4 = 329.63, G4 = 392.00, A4 = 440.00, B4 = 493.88;
  const E5 = 659.25, G5 = 783.99, A5 = 880.00, B5 = 987.77;

  // Aggressive bass — E minor pattern
  const bassNotes = [E3, E3, G3, A3, E3, E3, B3, G3];

  // Fast synth melody — dance hooks
  const melodies = [
    [E5, 0, G5, A5, B5, A5, G5, 0,  E5, G5, A5, 0, B5, A5, G5, E5],
    [B5, A5, G5, E5, 0, G5, A5, B5, A5, G5, E5, 0, G5, A5, B5, 0],
    [E5, E5, 0, G5, G5, 0, A5, A5, B5, 0, A5, G5, E5, 0, 0, 0],
    [G5, A5, B5, 0, B5, A5, G5, E5, G5, A5, B5, A5, G5, 0, E5, 0],
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const beat = t / beatLen;
    const beatInBar = beat % 4;
    const bar = Math.floor(beat / 4);
    let sample = 0;

    // HEAVY kick — every beat with stronger punch
    const kickPhase = (beat % 1) * beatLen;
    sample += kick(kickPhase) * 0.85;

    // Fast hi-hats (16th notes feel)
    const hhPhase = (beat * 4 % 1) * beatLen / 4;
    sample += hihat(hhPhase) * (Math.floor(beat * 4) % 2 === 1 ? 0.35 : 0.15);

    // Snare — 2 and 4, with ghost notes
    if (beatInBar >= 1 && beatInBar < 1.12) sample += snare((beatInBar - 1) * beatLen) * 0.55;
    if (beatInBar >= 3 && beatInBar < 3.12) sample += snare((beatInBar - 3) * beatLen) * 0.55;
    // Ghost snare
    if (beatInBar >= 2.5 && beatInBar < 2.6) sample += snare((beatInBar - 2.5) * beatLen) * 0.2;

    // Aggressive bass
    const bassNote = bassNotes[bar % bassNotes.length];
    const bassPhase = (beatInBar % 1) * beatLen;
    sample += bass(bassPhase, bassNote, beatLen * 0.7) * 0.7;
    // Sub octave for extra weight
    sample += sine(t, bassNote / 2) * envelope(bassPhase, 0.01, 0.1, 0.3, 0.05, beatLen * 0.7) * 0.3;

    // Dance melody
    if (bar >= 1) {
      const melody = melodies[(bar - 1) % melodies.length];
      const noteIdx = Math.floor(beat % 4 * 4) % melody.length;
      const note = melody[noteIdx];
      if (note > 0) {
        const notePhase = (beat * 4 % 1) * beatLen / 4;
        sample += lead(notePhase, note, beatLen / 4 * 0.7) * 0.3;
      }
    }

    // Wobble bass drop on bars 4-7
    if (bar >= 4) {
      const wobbleRate = 6 + bar;
      const wobble = sine(t, wobbleRate) * 0.5 + 0.5;
      sample += saw(t, E3) * wobble * 0.15;
    }

    // Snare fill on last bar
    if (bar === bars - 1 && beatInBar >= 2) {
      const rollRate = 6 + (beatInBar - 2) * 12;
      const rollPhase = (beat * rollRate % 1) * beatLen / rollRate;
      sample += snare(rollPhase) * 0.35;
    }

    samples[i] = sample * 0.65;
  }

  return createWav(samples, SAMPLE_RATE);
}

// ─── Generate War/Adventure (145 BPM — epic drums, brass-like, cinematic) ───

function generateWarAdventure() {
  const bpm = 145;
  const beatLen = 60 / bpm;
  const bars = 8;
  const duration = beatLen * 4 * bars;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float64Array(numSamples);

  // D minor — dark, intense
  const D3 = 146.83, F3 = 174.61, A3 = 220.00, C4 = 261.63;
  const D4 = 293.66, F4 = 349.23, A4 = 440.00;
  const D5 = 587.33, F5 = 698.46, A5 = 880.00, C5 = 523.25;

  // War drums pattern — tribal feel
  const drumPattern = [
    { beat: 0, type: 'dha', vol: 0.6 },
    { beat: 0.75, type: 'ti', vol: 0.2 },
    { beat: 1, type: 'dhin', vol: 0.4 },
    { beat: 1.5, type: 'ti', vol: 0.15 },
    { beat: 2, type: 'dha', vol: 0.55 },
    { beat: 2.5, type: 'dhin', vol: 0.3 },
    { beat: 3, type: 'dha', vol: 0.65 },
    { beat: 3.25, type: 'ti', vol: 0.15 },
    { beat: 3.5, type: 'dhin', vol: 0.35 },
    { beat: 3.75, type: 'ti', vol: 0.2 },
  ];

  // Epic brass-like melody (using saw + filter = brass approximation)
  const epicMelodies = [
    [D5, 0, F5, 0, A5, 0, F5, D5, 0, C5, D5, 0, F5, A5, 0, 0],
    [A5, F5, D5, 0, F5, A5, C5, 0, D5, 0, F5, D5, C5, 0, D5, 0],
    [D5, D5, 0, F5, F5, 0, A5, A5, F5, D5, 0, 0, C5, D5, F5, 0],
    [F5, A5, 0, D5, F5, 0, A5, C5, D5, F5, A5, 0, F5, D5, 0, 0],
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const beat = t / beatLen;
    const beatInBar = beat % 4;
    const bar = Math.floor(beat / 4);
    let sample = 0;

    // Heavy war kick — slower, more impact
    if (Math.floor(beatInBar) === 0 || Math.floor(beatInBar) === 2) {
      const kPhase = (beatInBar % 1) * beatLen;
      sample += kick(kPhase) * 0.8;
    }

    // War drums (tabla-like)
    for (const dp of drumPattern) {
      const dBeat = beatInBar - dp.beat;
      if (dBeat >= 0 && dBeat < 0.2) {
        sample += tabla(dBeat * beatLen, dp.type) * dp.vol;
      }
    }

    // Deep bass — ominous sustained
    const bassFreq = bar % 2 === 0 ? D3 : A3;
    sample += sine(t, bassFreq) * 0.25;
    sample += sine(t, bassFreq * 2) * 0.08;
    // Pulsing bass rhythm
    const bassPulse = (sine(t, 2) * 0.5 + 0.5) * 0.15;
    sample += triangle(t, bassFreq) * bassPulse;

    // Epic "brass" melody (saw wave = brass-like timbre)
    if (bar >= 2) {
      const melody = epicMelodies[(bar - 2) % epicMelodies.length];
      const noteIdx = Math.floor(beat % 4 * 4) % melody.length;
      const note = melody[noteIdx];
      if (note > 0) {
        const notePhase = (beat * 4 % 1) * beatLen / 4;
        const brassEnv = envelope(notePhase, 0.02, 0.05, 0.7, 0.03, beatLen / 4 * 0.8);
        // Brass = saw + filtered harmonics
        sample += (saw(t, note) * 0.15 + square(t, note) * 0.08) * brassEnv;
      }
    }

    // String pad — cinematic tension
    sample += pad(t, D4, duration) * 0.1;
    sample += pad(t, F4, duration) * 0.07;
    sample += pad(t, A4, duration) * 0.05;

    // Battle cry snare roll on bars 3 and 7
    if ((bar === 3 || bar === 7) && beatInBar >= 2) {
      const rollRate = 4 + (beatInBar - 2) * 10;
      const rollPhase = (beat * rollRate % 1) * beatLen / rollRate;
      sample += snare(rollPhase) * 0.4;
    }

    // Cymbal crash on bar transitions
    if (bar % 2 === 0 && beatInBar < 0.3) {
      sample += noise() * Math.exp(-beatInBar * 10) * 0.15;
    }

    samples[i] = sample * 0.65;
  }

  return createWav(samples, SAMPLE_RATE);
}

// ─── Main ─────────────────────────────────────

const outDir = path.join(__dirname, '..', 'public', 'audio', 'music');

console.log('Generating gameplay music (phase 1 — EDM runner)...');
fs.writeFileSync(path.join(outDir, 'gameplay.wav'), generateGameplay());
console.log('  → gameplay.wav');

console.log('Generating gameplay music (phase 2 — dance party)...');
fs.writeFileSync(path.join(outDir, 'gameplay2.wav'), generateDanceParty());
console.log('  → gameplay2.wav');

console.log('Generating gameplay music (phase 3 — war adventure)...');
fs.writeFileSync(path.join(outDir, 'gameplay3.wav'), generateWarAdventure());
console.log('  → gameplay3.wav');

console.log('Generating menu music...');
fs.writeFileSync(path.join(outDir, 'menu.wav'), generateMenu());
console.log('  → menu.wav');

console.log('Generating jetpack music...');
fs.writeFileSync(path.join(outDir, 'jetpack.wav'), generateJetpack());
console.log('  → jetpack.wav');

console.log('Done! Files saved to public/audio/music/');

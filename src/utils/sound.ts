export type MusicMode = 'default' | 'finale';

const MUTE_KEY = 'bugis_quest_muted_v1';
const BGM_VOLUME = 0.11;
const BGM_DUCK_VOLUME = 0.05;
const BGM_LOWPASS_HZ = 2400;

let audioCtx: AudioContext | null = null;
let musicMode: MusicMode = 'default';
let musicInterval: number | null = null;
let musicStep = 0;

let bgmAudio: HTMLAudioElement | null = null;
let bgmSource: MediaElementAudioSourceNode | null = null;
let bgmFilter: BiquadFilterNode | null = null;
let bgmGain: GainNode | null = null;
let duckRestoreTimer: number | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function getBgm(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!bgmAudio) {
    bgmAudio = new Audio('/bgm.mp3');
    bgmAudio.loop = true;
    bgmAudio.volume = BGM_VOLUME;
    bgmAudio.preload = 'auto';
  }

  const ctx = getCtx();
  if (ctx && !bgmSource) {
    try {
      bgmSource = ctx.createMediaElementSource(bgmAudio);
      bgmFilter = ctx.createBiquadFilter();
      bgmFilter.type = 'lowpass';
      bgmFilter.frequency.value = BGM_LOWPASS_HZ;
      bgmFilter.Q.value = 0.5;

      bgmGain = ctx.createGain();
      bgmGain.gain.value = BGM_VOLUME;

      bgmSource.connect(bgmFilter);
      bgmFilter.connect(bgmGain);
      bgmGain.connect(ctx.destination);

      // Let GainNode own the level so desktop and iOS Safari behave consistently
      bgmAudio.volume = 1;
    } catch {
      // Fallback to native HTMLAudioElement volume if Web Audio routing fails
      bgmAudio.volume = BGM_VOLUME;
    }
  }

  return bgmAudio;
}

function duckBgm(durationMs: number) {
  if (isSoundMuted() || musicMode !== 'finale' || !bgmGain || !audioCtx) return;
  const now = audioCtx.currentTime;
  bgmGain.gain.cancelScheduledValues(now);
  bgmGain.gain.setValueAtTime(bgmGain.gain.value, now);
  bgmGain.gain.linearRampToValueAtTime(BGM_DUCK_VOLUME, now + 0.12);

  if (duckRestoreTimer !== null) {
    window.clearTimeout(duckRestoreTimer);
  }
  duckRestoreTimer = window.setTimeout(() => {
    duckRestoreTimer = null;
    if (!isSoundMuted() && musicMode === 'finale' && bgmGain && audioCtx) {
      const t = audioCtx.currentTime;
      bgmGain.gain.cancelScheduledValues(t);
      bgmGain.gain.setValueAtTime(bgmGain.gain.value, t);
      bgmGain.gain.linearRampToValueAtTime(BGM_VOLUME, t + 0.6);
    }
  }, durationMs);
}

export function isSoundMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setSoundMuted(muted: boolean, allowStartMusic = true): void {
  try {
    localStorage.setItem(MUTE_KEY, String(muted));
  } catch {
    // Ignore storage errors
  }
  if (muted) {
    stopAmbientMusic();
  } else if (allowStartMusic) {
    startAmbientMusic();
  }
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'triangle',
  volume = 0.08,
  delay = 0
) {
  if (isSoundMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  gain.gain.setValueAtTime(0.001, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + duration + 0.02);
}

// Cozy Stardew-inspired evening music-box / acoustic loop (Fmaj7 - Dm7 - Bbmaj7 - C6)
const MELODY_NOTES: (number | null)[] = [
  523.25, 659.25, 698.46, null, 880.0, 698.46, 659.25, null,
  587.33, 698.46, 880.0, null, 783.99, 698.46, 587.33, null,
  466.16, 587.33, 698.46, null, 880.0, 783.99, 698.46, null,
  523.25, 659.25, 783.99, null, 659.25, 523.25, null, null,
];

const BASS_NOTES: (number | null)[] = [
  174.61, null, null, null, null, null, null, null,
  146.83, null, null, null, null, null, null, null,
  116.54, null, null, null, null, null, null, null,
  130.81, null, null, null, null, null, null, null,
];

function startDefaultMusic() {
  if (isSoundMuted() || musicInterval !== null) return;
  const ctx = getCtx();
  if (!ctx) return;

  musicInterval = window.setInterval(() => {
    if (isSoundMuted() || musicMode !== 'default') return;
    const idx = musicStep % MELODY_NOTES.length;
    const melody = MELODY_NOTES[idx];
    const bass = BASS_NOTES[idx];

    if (melody) {
      playTone(melody, 0.48, 'sine', 0.028);
    }
    if (bass) {
      playTone(bass, 1.4, 'triangle', 0.022);
    }
    musicStep++;
  }, 380);
}

function stopDefaultMusic() {
  if (musicInterval !== null) {
    window.clearInterval(musicInterval);
    musicInterval = null;
  }
}

function startFinaleMusic() {
  if (isSoundMuted()) return;
  const bgm = getBgm();
  if (!bgm) return;

  if (bgmGain && audioCtx) {
    const now = audioCtx.currentTime;
    bgmGain.gain.cancelScheduledValues(now);
    bgmGain.gain.setValueAtTime(0.001, now);
    bgmGain.gain.linearRampToValueAtTime(BGM_VOLUME, now + 1.0);
  } else {
    bgm.volume = BGM_VOLUME;
  }

  bgm.play().catch(() => {});
}

function stopFinaleMusic() {
  if (duckRestoreTimer !== null) {
    window.clearTimeout(duckRestoreTimer);
    duckRestoreTimer = null;
  }
  if (bgmAudio) {
    bgmAudio.pause();
  }
}

export function setMusicMode(mode: MusicMode, allowStartMusic = true) {
  if (musicMode === mode) {
    if (allowStartMusic && !isSoundMuted()) {
      startAmbientMusic();
    }
    return;
  }

  musicMode = mode;
  if (mode === 'finale') {
    stopDefaultMusic();
  } else {
    stopFinaleMusic();
  }

  if (allowStartMusic && !isSoundMuted()) {
    startAmbientMusic();
  }
}

export function startAmbientMusic() {
  if (isSoundMuted()) return;
  if (musicMode === 'finale') {
    startFinaleMusic();
  } else {
    startDefaultMusic();
  }
}

export function stopAmbientMusic() {
  stopDefaultMusic();
  stopFinaleMusic();
}

export function ensureMusicStarted() {
  if (!isSoundMuted()) {
    startAmbientMusic();
  }
}

export function playTap() {
  playTone(520, 0.05, 'triangle', 0.06);
}

export function playSwap() {
  playTone(440, 0.06, 'sine', 0.06, 0);
  playTone(587, 0.07, 'sine', 0.06, 0.04);
}

export function playSparkle() {
  playTone(784, 0.08, 'triangle', 0.07, 0);
  playTone(1046.5, 0.12, 'triangle', 0.07, 0.06);
}

export function playError() {
  playTone(220, 0.12, 'square', 0.04, 0);
  playTone(185, 0.14, 'square', 0.04, 0.08);
}

export function playVictory() {
  duckBgm(850);
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  notes.forEach((freq, i) => {
    playTone(freq, 0.16, 'triangle', 0.08, i * 0.085);
  });
}

export function playGrandFinale() {
  duckBgm(1500);
  const lead = [
    { f: 523.25, t: 0, d: 0.14 },
    { f: 659.25, t: 0.09, d: 0.14 },
    { f: 783.99, t: 0.18, d: 0.14 },
    { f: 1046.5, t: 0.27, d: 0.22 },
    { f: 880.0, t: 0.44, d: 0.14 },
    { f: 987.77, t: 0.56, d: 0.14 },
    { f: 1046.5, t: 0.68, d: 0.55 },
    { f: 1318.51, t: 0.68, d: 0.55 },
    { f: 1567.98, t: 0.74, d: 0.55 },
  ];
  const bass = [
    { f: 261.63, t: 0, d: 0.35 },
    { f: 349.23, t: 0.44, d: 0.24 },
    { f: 261.63, t: 0.68, d: 0.65 },
  ];
  lead.forEach((n) => playTone(n.f, n.d, 'triangle', 0.075, n.t));
  bass.forEach((n) => playTone(n.f, n.d, 'sine', 0.06, n.t));
}

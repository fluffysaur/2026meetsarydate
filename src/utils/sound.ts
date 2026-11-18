const MUTE_KEY = 'bugis_quest_muted_v1';

let audioCtx: AudioContext | null = null;
let musicInterval: number | null = null;
let musicStep = 0;

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

export function startAmbientMusic() {
  if (isSoundMuted() || musicInterval !== null) return;
  const ctx = getCtx();
  if (!ctx) return;

  musicInterval = window.setInterval(() => {
    if (isSoundMuted()) return;
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

export function stopAmbientMusic() {
  if (musicInterval !== null) {
    window.clearInterval(musicInterval);
    musicInterval = null;
  }
}

export function ensureMusicStarted() {
  if (!isSoundMuted() && musicInterval === null) {
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
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  notes.forEach((freq, i) => {
    playTone(freq, 0.16, 'triangle', 0.08, i * 0.085);
  });
}

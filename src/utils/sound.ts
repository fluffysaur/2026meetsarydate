const MUTE_KEY = 'bugis_quest_muted_v1';

let audioCtx: AudioContext | null = null;

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

export function setSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, String(muted));
  } catch {
    // Ignore storage errors
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
  gain.gain.linearRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + duration + 0.02);
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

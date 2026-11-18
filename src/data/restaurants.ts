export type PuzzleId = 'wordle' | 'crossword' | 'jigsaw';

export interface RestaurantInfo {
  id: PuzzleId;
  puzzleNumber: number;
  puzzleTitle: string;
  puzzleSubtitle: string;
  mysteryTeaser: string;
  restaurantName: string;
  location: string;
  cuisine: string;
  description: string;
  directionsHint: string;
  accentColor: string;
}

export const RESTAURANTS: Record<PuzzleId, RestaurantInfo> = {
  wordle: {
    id: 'wordle',
    puzzleNumber: 1,
    puzzleTitle: 'Wordle',
    puzzleSubtitle: '7-Letter Guess',
    mysteryTeaser: 'Crack the 7-letter mystery name',
    restaurantName: 'Gochiya',
    location: 'Bugis Junction, Level 2',
    cuisine: 'Japanese Curry, Donburi & Katsu',
    description:
      'Warm, comforting bowls of Japanese curry, crispy katsu, and hearty donburi — perfect for a cozy dinner.',
    directionsHint:
      'From ATLAS Bar, stroll over to Bugis Junction and head up the escalator to Level 2.',
    accentColor: '#C85A43',
  },
  crossword: {
    id: 'crossword',
    puzzleNumber: 2,
    puzzleTitle: 'Mini Crossword',
    puzzleSubtitle: '6 Memory Clues',
    mysteryTeaser: 'Solve the sizzling clues',
    restaurantName: 'Micun / Mincheng Bibimbap',
    location: 'Bugis Junction Level 3 / Victoria Street',
    cuisine: 'Sizzling Hot-Stone Bowls & Free-Flow Kimchi',
    description:
      'Crackling dolsot bibimbap bowls served piping hot with crispy rice edges and endless free-flow kimchi.',
    directionsHint:
      'Right along Victoria Street / Bugis Junction Level 3 — just a few minutes’ walk from ATLAS.',
    accentColor: '#D9777F',
  },
  jigsaw: {
    id: 'jigsaw',
    puzzleNumber: 3,
    puzzleTitle: 'Photo Jigsaw',
    puzzleSubtitle: 'Drag or Tap',
    mysteryTeaser: 'Piece together tonight’s third spot',
    restaurantName: 'Chuan Pai (川派)',
    location: 'Victoria Street, beside Bugis Junction',
    cuisine: 'Sichuan Skewers & Mala',
    description:
      'Bold, numbing Sichuan skewers and fragrant mala bites made for sharing over late-night laughs.',
    directionsHint:
      'Right on Victoria Street beside Bugis Junction, an easy walk from ATLAS Bar.',
    accentColor: '#D49B38',
  },
};

export const STORAGE_KEY = 'bugis_dinner_quest_v1';

export interface QuestProgress {
  solved: Record<PuzzleId, boolean>;
  wordleGuesses: string[];
  crosswordGrid: Record<string, string>;
}

export const DEFAULT_PROGRESS: QuestProgress = {
  solved: {
    wordle: false,
    crossword: false,
    jigsaw: false,
  },
  wordleGuesses: [],
  crosswordGrid: {},
};

export function loadProgress(): QuestProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<QuestProgress>;
    return {
      solved: {
        ...DEFAULT_PROGRESS.solved,
        ...(parsed.solved ?? {}),
      },
      wordleGuesses: Array.isArray(parsed.wordleGuesses)
        ? parsed.wordleGuesses
        : [],
      crosswordGrid:
        parsed.crosswordGrid && typeof parsed.crosswordGrid === 'object'
          ? parsed.crosswordGrid
          : {},
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: QuestProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}

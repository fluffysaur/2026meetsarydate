import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Grid3X3,
  Heart,
  Image as ImageIcon,
  Lock,
  RotateCcw,
  Sparkles,
  Type,
} from 'lucide-react';
import {
  DEFAULT_PROGRESS,
  loadProgress,
  RESTAURANTS,
  saveProgress,
  type PuzzleId,
  type QuestProgress,
} from './data/restaurants';
import { WordlePuzzle } from './components/WordlePuzzle';
import { CrosswordPuzzle } from './components/CrosswordPuzzle';
import { JigsawPuzzle } from './components/JigsawPuzzle';
import { RevealModal } from './components/RevealModal';

const PUZZLE_ORDER: PuzzleId[] = ['wordle', 'crossword', 'jigsaw'];

const PUZZLE_ICONS: Record<PuzzleId, typeof Type> = {
  wordle: Type,
  crossword: Grid3X3,
  jigsaw: ImageIcon,
};

export function App() {
  const [progress, setProgress] = useState<QuestProgress>(() => loadProgress());
  const [activePuzzle, setActivePuzzle] = useState<PuzzleId | null>(null);
  const [modalState, setModalState] = useState<{
    puzzleId: PuzzleId | null;
    celebrate: boolean;
  }>({ puzzleId: null, celebrate: false });
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const solvedCount = PUZZLE_ORDER.filter((id) => progress.solved[id]).length;

  const handleSolve = (puzzleId: PuzzleId) => {
    setProgress((prev) => ({
      ...prev,
      solved: {
        ...prev.solved,
        [puzzleId]: true,
      },
    }));
    setModalState({ puzzleId, celebrate: true });
  };

  const handleResetAll = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      window.setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    setProgress(DEFAULT_PROGRESS);
    setConfirmReset(false);
    setActivePuzzle(null);
    setModalState({ puzzleId: null, celebrate: false });
  };

  if (activePuzzle) {
    const info = RESTAURANTS[activePuzzle];
    const isSolved = progress.solved[activePuzzle];

    return (
      <div className="h-[100dvh] flex flex-col bg-[#FDF8F4] text-[#2D221E] overflow-hidden">
        <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#EFE2DA] bg-[#FDF8F4]/95 backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setActivePuzzle(null)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F7ECE6] px-3 py-1.5 text-xs font-semibold text-[#2D221E] active:scale-95 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#C85A43]">
              Puzzle {info.puzzleNumber}
            </p>
            <h1 className="font-serif text-base font-semibold leading-tight">
              {info.puzzleTitle}
            </h1>
          </div>

          {isSolved ? (
            <button
              type="button"
              onClick={() =>
                setModalState({ puzzleId: activePuzzle, celebrate: false })
              }
              className="inline-flex items-center gap-1 rounded-full bg-[#5A8F6B] px-3 py-1.5 text-xs font-semibold text-white active:scale-95 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Reveal
            </button>
          ) : (
            <div className="w-16" aria-hidden="true" />
          )}
        </header>

        <main className="flex-1 flex flex-col min-h-0">
          {activePuzzle === 'wordle' && (
            <WordlePuzzle
              guesses={progress.wordleGuesses}
              solved={isSolved}
              onGuessesChange={(wordleGuesses) =>
                setProgress((prev) => ({ ...prev, wordleGuesses }))
              }
              onSolve={() => handleSolve('wordle')}
            />
          )}

          {activePuzzle === 'crossword' && (
            <CrosswordPuzzle
              gridValues={progress.crosswordGrid}
              solved={isSolved}
              onGridChange={(crosswordGrid) =>
                setProgress((prev) => ({ ...prev, crosswordGrid }))
              }
              onSolve={() => handleSolve('crossword')}
            />
          )}

          {activePuzzle === 'jigsaw' && (
            <JigsawPuzzle
              solved={isSolved}
              onSolve={() => handleSolve('jigsaw')}
            />
          )}
        </main>

        <RevealModal
          restaurant={
            modalState.puzzleId ? RESTAURANTS[modalState.puzzleId] : null
          }
          celebrate={modalState.celebrate}
          onClose={() => {
            setModalState({ puzzleId: null, celebrate: false });
            setActivePuzzle(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#FDF8F4] text-[#2D221E] px-5 py-8">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
        {/* Hero Header */}
        <header className="text-center pt-2 pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F7ECE6] border border-[#EAD9CF] px-3.5 py-1 text-xs font-semibold text-[#C85A43] mb-4">
            <Heart className="w-3.5 h-3.5 fill-[#C85A43]" />
            Near ATLAS Bar · Bugis
          </div>

          <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#2D221E]">
            Bugis Dinner Quest
          </h1>

          <p className="mt-2.5 text-sm text-[#7C665E] leading-relaxed max-w-xs mx-auto">
            Pick a puzzle to unlock tonight’s dinner spot.
          </p>

          {/* Progress Pill */}
          <div className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-white border border-[#EAD9CF] px-4 py-2 shadow-2xs">
            <div className="flex gap-1.5">
              {PUZZLE_ORDER.map((id) => (
                <span
                  key={id}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    progress.solved[id] ? 'bg-[#5A8F6B]' : 'bg-[#E6D6CC]'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-[#54433D]">
              {solvedCount} of 3 unlocked
            </span>
          </div>
        </header>

        {/* 3 Mystery Cards */}
        <main className="flex flex-col gap-3.5 flex-1">
          {PUZZLE_ORDER.map((id) => {
            const info = RESTAURANTS[id];
            const isSolved = progress.solved[id];
            const Icon = PUZZLE_ICONS[id];

            return (
              <div
                key={id}
                className={`rounded-3xl border p-5 transition-all ${
                  isSolved
                    ? 'bg-white border-[#C8DFCE] shadow-xs'
                    : 'bg-white border-[#EAD9CF] shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        isSolved
                          ? 'bg-[#E9F3EC] text-[#5A8F6B]'
                          : 'bg-[#F7ECE6] text-[#C85A43]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C665E]">
                        Puzzle {info.puzzleNumber} · {info.puzzleSubtitle}
                      </p>
                      <h2 className="font-serif text-xl font-semibold text-[#2D221E]">
                        {info.puzzleTitle}
                      </h2>
                    </div>
                  </div>

                  {isSolved ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#E9F3EC] px-2.5 py-1 text-[11px] font-bold text-[#3F7350]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Unlocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F7ECE6] px-2.5 py-1 text-[11px] font-semibold text-[#7C665E]">
                      <Lock className="w-3 h-3" />
                      Mystery
                    </span>
                  )}
                </div>

                {isSolved ? (
                  <div className="mt-4 pt-3.5 border-t border-[#F2E7E0] flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#2D221E]">
                        {info.restaurantName}
                      </p>
                      <p className="text-xs text-[#7C665E]">{info.location}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActivePuzzle(id)}
                        className="rounded-xl bg-[#F7ECE6] px-3 py-2 text-xs font-semibold text-[#54433D] active:scale-95 transition"
                      >
                        Board
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setModalState({ puzzleId: id, celebrate: false })
                        }
                        className="rounded-xl bg-[#5A8F6B] px-3.5 py-2 text-xs font-semibold text-white active:scale-95 transition"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-3.5 border-t border-[#F7ECE6] flex items-center justify-between gap-3">
                    <p className="text-xs text-[#7C665E]">
                      {info.mysteryTeaser}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActivePuzzle(id)}
                      className="shrink-0 rounded-xl bg-[#C85A43] px-4 py-2 text-xs font-semibold text-white shadow-2xs active:scale-95 transition"
                    >
                      Play →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </main>

        {/* Subtle Footer */}
        <footer className="pt-8 pb-2 text-center">
          <button
            type="button"
            onClick={handleResetAll}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[#9A857D] hover:text-[#C85A43] transition"
          >
            <RotateCcw className="w-3 h-3" />
            {confirmReset ? 'Tap again to confirm reset' : 'Reset All'}
          </button>
        </footer>
      </div>

      <RevealModal
        restaurant={
          modalState.puzzleId ? RESTAURANTS[modalState.puzzleId] : null
        }
        celebrate={modalState.celebrate}
        onClose={() => setModalState({ puzzleId: null, celebrate: false })}
      />
    </div>
  );
}

export default App;

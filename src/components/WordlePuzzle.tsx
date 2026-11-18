import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { MobileKeyboard, type KeyState } from './MobileKeyboard';

const SECRET = 'GOCHIYA';
const WORD_LENGTH = SECRET.length; // 7
const MIN_ROWS = 6;

interface WordlePuzzleProps {
  guesses: string[];
  solved: boolean;
  onGuessesChange: (guesses: string[]) => void;
  onSolve: () => void;
}

type CellStatus = 'correct' | 'present' | 'absent' | 'empty' | 'typing';

function evaluateGuess(guess: string, target: string): CellStatus[] {
  const result: CellStatus[] = Array(target.length).fill('absent');
  const remaining: (string | null)[] = target.split('');

  // First pass: exact matches
  for (let i = 0; i < target.length; i++) {
    if (guess[i] === target[i]) {
      result[i] = 'correct';
      remaining[i] = null;
    }
  }

  // Second pass: wrong position
  for (let i = 0; i < target.length; i++) {
    if (result[i] === 'correct') continue;
    const matchIdx = remaining.indexOf(guess[i]);
    if (matchIdx !== -1) {
      result[i] = 'present';
      remaining[matchIdx] = null;
    }
  }

  return result;
}

const CELL_STYLES: Record<CellStatus, string> = {
  correct: 'bg-[#5A8F6B] border-[#5A8F6B] text-white',
  present: 'bg-[#D49B38] border-[#D49B38] text-white',
  absent: 'bg-[#9E918A] border-[#9E918A] text-white',
  typing: 'bg-white border-[#C85A43] text-[#2D221E] scale-[1.03]',
  empty: 'bg-white/75 border-[#E6D6CC] text-[#2D221E]',
};

export function WordlePuzzle({
  guesses,
  solved,
  onGuessesChange,
  onSolve,
}: WordlePuzzleProps) {
  const [currentGuess, setCurrentGuess] = useState('');
  const [shakeRow, setShakeRow] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const activeRowRef = useRef<HTMLDivElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 1800);
  }, []);

  const handleKey = useCallback(
    (letter: string) => {
      if (solved) return;
      setCurrentGuess((prev) =>
        prev.length < WORD_LENGTH ? prev + letter : prev
      );
    },
    [solved]
  );

  const handleBackspace = useCallback(() => {
    if (solved) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [solved]);

  const handleEnter = useCallback(() => {
    if (solved) return;
    if (currentGuess.length < WORD_LENGTH) {
      setShakeRow(true);
      showToast('Enter all 7 letters');
      window.setTimeout(() => setShakeRow(false), 380);
      return;
    }

    const nextGuesses = [...guesses, currentGuess];
    onGuessesChange(nextGuesses);
    setCurrentGuess('');

    if (currentGuess === SECRET) {
      window.setTimeout(() => onSolve(), 350);
    }
  }, [solved, currentGuess, guesses, onGuessesChange, onSolve, showToast]);

  useEffect(() => {
    if (guesses.length >= MIN_ROWS && activeRowRef.current) {
      activeRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [guesses.length]);

  const keyStates = useMemo(() => {
    const priority: Record<KeyState, number> = {
      default: 0,
      absent: 1,
      present: 2,
      correct: 3,
    };
    const map: Record<string, KeyState> = {};

    for (const guess of guesses) {
      const evals = evaluateGuess(guess, SECRET);
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        const status = evals[i] as KeyState;
        const current = map[letter] ?? 'default';
        if (priority[status] > priority[current]) {
          map[letter] = status;
        }
      }
    }
    return map;
  }, [guesses]);

  const totalRows = Math.max(
    MIN_ROWS,
    solved ? guesses.length : guesses.length + 1
  );

  return (
    <div className="flex flex-col flex-1 justify-between min-h-0">
      {/* Info & Hint bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <p className="text-xs text-[#7C665E]">
          7 letters · Unlimited guesses · Any word allowed
        </p>
        <button
          type="button"
          onClick={() => setShowHint((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full bg-[#F7ECE6] px-2.5 py-1 text-xs font-semibold text-[#C85A43] active:scale-95 transition"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          Hint
        </button>
      </div>

      {showHint && (
        <div className="mx-4 mb-2 rounded-2xl bg-[#F7ECE6] border border-[#EAD9CF] px-3.5 py-2 text-xs text-[#54433D] animate-pop-in">
          Japanese curry, crispy katsu &amp; donburi spot in Bugis Junction (starts with{' '}
          <span className="font-bold text-[#C85A43]">G</span>).
        </div>
      )}

      {/* Toast */}
      <div className="h-7 flex items-center justify-center">
        {toast && (
          <div className="rounded-full bg-[#2D221E] px-3.5 py-1 text-xs font-semibold text-white shadow-md animate-pop-in">
            {toast}
          </div>
        )}
      </div>

      {/* Wordle Grid */}
      <div className="flex-1 overflow-y-auto px-3 py-1 flex flex-col items-center justify-start">
        <div className="w-full max-w-[340px] flex flex-col gap-1.5 pb-2">
          {Array.from({ length: totalRows }).map((_, rowIdx) => {
            const isSubmitted = rowIdx < guesses.length;
            const isActive = !solved && rowIdx === guesses.length;
            const word = isSubmitted
              ? guesses[rowIdx]
              : isActive
                ? currentGuess
                : '';
            const statuses: CellStatus[] = isSubmitted
              ? evaluateGuess(word, SECRET)
              : Array.from({ length: WORD_LENGTH }, (_, i) =>
                  word[i] ? 'typing' : 'empty'
                );

            return (
              <div
                key={rowIdx}
                ref={isActive ? activeRowRef : null}
                className={`grid grid-cols-7 gap-1.5 ${
                  isActive && shakeRow ? 'animate-shake' : ''
                }`}
              >
                {Array.from({ length: WORD_LENGTH }).map((__, colIdx) => {
                  const char = word[colIdx] ?? '';
                  const status = statuses[colIdx];
                  return (
                    <div
                      key={colIdx}
                      className={`aspect-square rounded-xl border-2 flex items-center justify-center font-bold text-lg sm:text-xl transition-all duration-150 select-none ${CELL_STYLES[status]}`}
                    >
                      {char}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Keyboard */}
      <div className="pt-1 pb-safe bg-[#FDF8F4] border-t border-[#EFE2DA]">
        <MobileKeyboard
          onKey={handleKey}
          onBackspace={handleBackspace}
          onEnter={handleEnter}
          enterLabel="ENTER"
          keyStates={keyStates}
          disabled={solved}
        />
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb } from 'lucide-react';
import { MobileKeyboard, type KeyState } from './MobileKeyboard';
import { playError, playSparkle, playTap } from '../utils/sound';

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

  for (let i = 0; i < target.length; i++) {
    if (guess[i] === target[i]) {
      result[i] = 'correct';
      remaining[i] = null;
    }
  }

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
  correct: 'bg-[#5FA848] border-[#3D1603] text-white',
  present: 'bg-[#E8A338] border-[#3D1603] text-[#3D1603]',
  absent: 'bg-[#8F7A68] border-[#3D1603] text-[#F5E6D3]',
  typing: 'bg-[#FFF3D1] border-[#9E3C16] text-[#421C09]',
  empty: 'bg-[#FAD998]/85 border-[#7A3710] text-[#421C09]',
};

export function WordlePuzzle({
  guesses,
  solved,
  onGuessesChange,
  onSolve,
}: WordlePuzzleProps) {
  const [currentGuess, setCurrentGuess] = useState('');
  const [shakeRow, setShakeRow] = useState(false);
  const [justSubmittedRow, setJustSubmittedRow] = useState<number | null>(null);
  const [victoryRow, setVictoryRow] = useState<number | null>(null);
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
      playError();
      setShakeRow(true);
      showToast('Enter all 7 letters!');
      window.setTimeout(() => setShakeRow(false), 380);
      return;
    }

    const submittedIdx = guesses.length;
    const nextGuesses = [...guesses, currentGuess];
    setJustSubmittedRow(submittedIdx);
    onGuessesChange(nextGuesses);
    setCurrentGuess('');

    if (currentGuess === SECRET) {
      window.setTimeout(() => {
        playSparkle();
        setVictoryRow(submittedIdx);
      }, 650);
      window.setTimeout(() => onSolve(), 1150);
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
        <p className="font-pixel-body text-lg text-[#FFF0C4] drop-shadow-[0_1px_0_#19132B]">
          7 letters · Unlimited tries
        </p>
        <button
          type="button"
          onClick={() => {
            playTap();
            setShowHint((v) => !v);
          }}
          className="sdv-btn inline-flex items-center gap-1 bg-[#FAD998] px-2.5 py-1 text-[11px] font-bold text-[#421C09]"
        >
          <Lightbulb className="w-3.5 h-3.5 text-[#C85A43]" />
          Hint
        </button>
      </div>

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mx-4 mb-1.5 sdv-parchment px-3 py-2 font-pixel-body text-lg leading-tight text-[#421C09]"
          >
            Japanese curry, crispy katsu &amp; donburi spot in Bugis Junction
            (starts with <span className="font-bold text-[#B8431D]">G</span>).
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <div className="h-7 flex items-center justify-center">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#3D1603] border-2 border-[#FAD998] px-3 py-0.5 text-xs font-bold text-[#FFF0C4]"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Wordle Grid */}
      <div className="flex-1 overflow-y-auto px-3 py-1 flex flex-col items-center justify-start">
        <div className="w-full max-w-[340px] sdv-wood-panel p-2 flex flex-col gap-1.5">
          {Array.from({ length: totalRows }).map((_, rowIdx) => {
            const isSubmitted = rowIdx < guesses.length;
            const isActive = !solved && rowIdx === guesses.length;
            const isJustSubmitted = justSubmittedRow === rowIdx;
            const isVictoryRow = victoryRow === rowIdx;

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
                className={`grid grid-cols-7 gap-1 ${
                  isActive && shakeRow ? 'animate-shake' : ''
                }`}
              >
                {Array.from({ length: WORD_LENGTH }).map((__, colIdx) => {
                  const char = word[colIdx] ?? '';
                  const status = statuses[colIdx];
                  const animClass = isVictoryRow
                    ? 'animate-victory-hop'
                    : isJustSubmitted
                      ? 'animate-wordle-flip'
                      : '';
                  const delay = isVictoryRow
                    ? `${colIdx * 65}ms`
                    : isJustSubmitted
                      ? `${colIdx * 85}ms`
                      : undefined;

                  return (
                    <motion.div
                      key={`${rowIdx}-${colIdx}-${char ? 'filled' : 'empty'}`}
                      initial={
                        isActive && char ? { scale: 1.16 } : false
                      }
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.12 }}
                      style={delay ? { animationDelay: delay } : undefined}
                      className={`aspect-square border-2 flex items-center justify-center font-bold text-lg sm:text-xl select-none shadow-[inset_1px_1px_0_rgba(255,255,255,0.3)] ${CELL_STYLES[status]} ${animClass}`}
                    >
                      {char}
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Keyboard */}
      <div className="pt-1 pb-safe sdv-wood-bar border-t-3 border-[#4A1C05]">
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

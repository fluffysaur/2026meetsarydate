import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { MobileKeyboard } from './MobileKeyboard';
import { playError, playSparkle, playTap } from '../utils/sound';

const ROWS = 13;
const COLS = 10;

type Direction = 'across' | 'down';

interface Clue {
  id: string;
  number: number;
  direction: Direction;
  row: number;
  col: number;
  answer: string;
  clue: string;
}

const CLUES: Clue[] = [
  {
    id: '1D',
    number: 1,
    direction: 'down',
    row: 0,
    col: 5,
    answer: 'FOODPOISONING',
    clue: 'Yi Jia had this and Rachel took care of him so lovingly',
  },
  {
    id: '2A',
    number: 2,
    direction: 'across',
    row: 1,
    col: 2,
    answer: 'BOBO',
    clue: 'Nickname for Yi Jia when his brain farts',
  },
  {
    id: '3A',
    number: 3,
    direction: 'across',
    row: 6,
    col: 4,
    answer: 'BIKINI',
    clue: 'Yi Jia likes to see Rachel wear this at the beach',
  },
  {
    id: '4A',
    number: 4,
    direction: 'across',
    row: 10,
    col: 0,
    answer: 'ARTEMIS',
    clue: 'Where Yi Jia put a ring on it!',
  },
];

// Numbered cells that spell out BIBIMBAP (1..8)
const SECRET_SLOTS: { slot: number; key: string; letter: string }[] = [
  { slot: 1, key: '1,2', letter: 'B' },
  { slot: 2, key: '6,5', letter: 'I' },
  { slot: 3, key: '1,4', letter: 'B' },
  { slot: 4, key: '6,7', letter: 'I' },
  { slot: 5, key: '10,4', letter: 'M' },
  { slot: 6, key: '6,4', letter: 'B' },
  { slot: 7, key: '10,0', letter: 'A' },
  { slot: 8, key: '4,5', letter: 'P' },
];

const SECRET_SLOT_BY_KEY: Record<string, number> = Object.fromEntries(
  SECRET_SLOTS.map((s) => [s.key, s.slot])
);

function keyOf(r: number, c: number): string {
  return `${r},${c}`;
}

interface CellMeta {
  solution: string;
  number?: number;
  secretSlot?: number;
  acrossClue?: Clue;
  downClue?: Clue;
}

const GRID_META: Record<string, CellMeta> = (() => {
  const map: Record<string, CellMeta> = {};
  for (const clue of CLUES) {
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.direction === 'across' ? clue.row : clue.row + i;
      const c = clue.direction === 'across' ? clue.col + i : clue.col;
      const k = keyOf(r, c);
      if (!map[k]) {
        map[k] = {
          solution: clue.answer[i],
          secretSlot: SECRET_SLOT_BY_KEY[k],
        };
      }
      if (i === 0) {
        map[k].number = clue.number;
      }
      if (clue.direction === 'across') {
        map[k].acrossClue = clue;
      } else {
        map[k].downClue = clue;
      }
    }
  }
  return map;
})();

const ALL_CELL_KEYS = Object.keys(GRID_META);

interface CrosswordPuzzleProps {
  gridValues: Record<string, string>;
  solved: boolean;
  onGridChange: (grid: Record<string, string>) => void;
  onSolve: () => void;
}

export function CrosswordPuzzle({
  gridValues,
  solved,
  onGridChange,
  onSolve,
}: CrosswordPuzzleProps) {
  const [selectedCell, setSelectedCell] = useState<[number, number]>([1, 2]);
  const [direction, setDirection] = useState<Direction>('across');
  const [checkedErrors, setCheckedErrors] = useState<Record<string, boolean>>({});
  const [showAllClues, setShowAllClues] = useState(false);

  const activeClue = useMemo(() => {
    const meta = GRID_META[keyOf(selectedCell[0], selectedCell[1])];
    if (!meta) return CLUES[0];
    if (direction === 'across') {
      return meta.acrossClue ?? meta.downClue ?? CLUES[0];
    }
    return meta.downClue ?? meta.acrossClue ?? CLUES[0];
  }, [selectedCell, direction]);

  const activeWordKeys = useMemo(() => {
    const keys = new Set<string>();
    for (let i = 0; i < activeClue.answer.length; i++) {
      const r =
        activeClue.direction === 'across'
          ? activeClue.row
          : activeClue.row + i;
      const c =
        activeClue.direction === 'across'
          ? activeClue.col + i
          : activeClue.col;
      keys.add(keyOf(r, c));
    }
    return keys;
  }, [activeClue]);

  const handleCellTap = (r: number, c: number) => {
    const meta = GRID_META[keyOf(r, c)];
    if (!meta) return;
    playTap();

    const isSameCell = selectedCell[0] === r && selectedCell[1] === c;
    if (isSameCell && meta.acrossClue && meta.downClue) {
      setDirection((d) => (d === 'across' ? 'down' : 'across'));
      return;
    }

    setSelectedCell([r, c]);
    if (direction === 'across' && !meta.acrossClue && meta.downClue) {
      setDirection('down');
    } else if (direction === 'down' && !meta.downClue && meta.acrossClue) {
      setDirection('across');
    }
  };

  const selectClue = (clue: Clue) => {
    playTap();
    setSelectedCell([clue.row, clue.col]);
    setDirection(clue.direction);
    setShowAllClues(false);
  };

  const cycleClue = useCallback(
    (delta: number) => {
      playTap();
      const idx = CLUES.findIndex((c) => c.id === activeClue.id);
      const next = CLUES[(idx + delta + CLUES.length) % CLUES.length];
      setSelectedCell([next.row, next.col]);
      setDirection(next.direction);
    },
    [activeClue]
  );

  const checkSolved = useCallback(
    (nextGrid: Record<string, string>) => {
      const isComplete = ALL_CELL_KEYS.every(
        (k) => nextGrid[k] === GRID_META[k].solution
      );
      if (isComplete) {
        playSparkle();
        window.setTimeout(() => onSolve(), 450);
      }
    },
    [onSolve]
  );

  const handleKey = useCallback(
    (letter: string) => {
      if (solved) return;
      const [r, c] = selectedCell;
      const k = keyOf(r, c);
      if (!GRID_META[k]) return;

      const nextGrid = { ...gridValues, [k]: letter };
      onGridChange(nextGrid);
      setCheckedErrors((prev) => {
        if (!prev[k]) return prev;
        const copy = { ...prev };
        delete copy[k];
        return copy;
      });

      const offset =
        activeClue.direction === 'across'
          ? c - activeClue.col
          : r - activeClue.row;
      if (offset < activeClue.answer.length - 1) {
        const nextR = activeClue.direction === 'across' ? r : r + 1;
        const nextC = activeClue.direction === 'across' ? c + 1 : c;
        setSelectedCell([nextR, nextC]);
      }

      checkSolved(nextGrid);
    },
    [solved, selectedCell, gridValues, onGridChange, activeClue, checkSolved]
  );

  const handleBackspace = useCallback(() => {
    if (solved) return;
    const [r, c] = selectedCell;
    const k = keyOf(r, c);
    if (!GRID_META[k]) return;

    if (gridValues[k]) {
      const nextGrid = { ...gridValues };
      delete nextGrid[k];
      onGridChange(nextGrid);
      setCheckedErrors((prev) => {
        if (!prev[k]) return prev;
        const copy = { ...prev };
        delete copy[k];
        return copy;
      });
      return;
    }

    const offset =
      activeClue.direction === 'across'
        ? c - activeClue.col
        : r - activeClue.row;
    if (offset > 0) {
      const prevR = activeClue.direction === 'across' ? r : r - 1;
      const prevC = activeClue.direction === 'across' ? c - 1 : c;
      const prevKey = keyOf(prevR, prevC);
      const nextGrid = { ...gridValues };
      delete nextGrid[prevKey];
      onGridChange(nextGrid);
      setSelectedCell([prevR, prevC]);
    }
  }, [solved, selectedCell, gridValues, onGridChange, activeClue]);

  const handleCheckPuzzle = () => {
    const errors: Record<string, boolean> = {};
    for (const k of ALL_CELL_KEYS) {
      const val = gridValues[k];
      if (val && val !== GRID_META[k].solution) {
        errors[k] = true;
      }
    }
    if (Object.keys(errors).length > 0) {
      playError();
    } else {
      playSparkle();
    }
    setCheckedErrors(errors);
  };

  return (
    <div className="flex flex-col flex-1 justify-between min-h-0">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-1.5">
        <button
          type="button"
          onClick={() => {
            playTap();
            setShowAllClues((v) => !v);
          }}
          className="sdv-btn inline-flex items-center gap-1 bg-[#FAD998] px-3 py-1 text-[11px] font-bold text-[#421C09]"
        >
          All Clues
          {showAllClues ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={handleCheckPuzzle}
          disabled={solved}
          className="sdv-btn inline-flex items-center gap-1 bg-[#E88D48] px-3 py-1 text-[11px] font-bold text-[#3D1603] disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
          Check
        </button>
      </div>

      {/* Expandable Full Clue List */}
      <AnimatePresence>
        {showAllClues && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mb-1.5 sdv-parchment p-2.5 max-h-40 overflow-y-auto"
          >
            <div className="grid grid-cols-1 gap-1">
              {CLUES.map((clue) => {
                const isCurrent = clue.id === activeClue.id;
                return (
                  <button
                    key={clue.id}
                    type="button"
                    onClick={() => selectClue(clue)}
                    className={`text-left px-2 py-1 font-pixel-body text-lg leading-tight transition ${
                      isCurrent
                        ? 'bg-[#FFEAB8] border-2 border-[#7A3710] text-[#B8431D] font-bold'
                        : 'text-[#421C09]'
                    }`}
                  >
                    <span className="font-bold mr-1.5">
                      {clue.number}
                      {clue.direction === 'across' ? 'A' : 'D'}.
                    </span>
                    {clue.clue}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Numbered Secret Dish Strip (1..8 -> BIBIMBAP) */}
      <div className="px-3 pb-1">
        <div className="max-w-[348px] mx-auto sdv-parchment px-2 py-1.5">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#9E3C16] text-center mb-1">
            Secret Dish Code
          </p>
          <div className="grid grid-cols-8 gap-1">
            {SECRET_SLOTS.map(({ slot, key }) => {
              const char = gridValues[key] ?? '';
              return (
                <div
                  key={slot}
                  className={`h-7 border-2 flex flex-col items-center justify-center relative ${
                    solved
                      ? 'bg-[#5FA848] border-[#3D1603] text-white'
                      : 'bg-[#FFF3D1] border-[#7A3710] text-[#421C09]'
                  }`}
                >
                  <span
                    className={`absolute top-0 left-0.5 text-[7px] font-bold leading-none ${
                      solved ? 'text-[#FFF0C4]' : 'text-[#9E3C16]'
                    }`}
                  >
                    {slot}
                  </span>
                  <span className="text-xs font-bold leading-none mt-1">
                    {char}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Crossword Grid */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center px-3 py-1 min-h-0">
        <div
          className="w-full max-w-[348px] sdv-wood-panel p-1.5 grid gap-[2px]"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: ROWS * COLS }).map((_, idx) => {
            const r = Math.floor(idx / COLS);
            const c = idx % COLS;
            const k = keyOf(r, c);
            const meta = GRID_META[k];

            if (!meta) {
              return <div key={k} className="aspect-square" aria-hidden="true" />;
            }

            const isSelected = selectedCell[0] === r && selectedCell[1] === c;
            const isInActiveWord = activeWordKeys.has(k);
            const hasError = Boolean(checkedErrors[k]);
            const val = gridValues[k] ?? '';

            let cellBg = 'bg-[#FAD998] border-[#5B2308] text-[#421C09]';
            if (solved) {
              cellBg =
                'bg-[#5FA848] border-[#3D1603] text-white animate-victory-hop';
            } else if (hasError) {
              cellBg = 'bg-[#E84A5F] border-[#3D1603] text-white';
            } else if (isSelected) {
              cellBg =
                'bg-[#FFF5D6] border-[#D9531E] text-[#421C09] ring-2 ring-[#FFE478]';
            } else if (isInActiveWord) {
              cellBg = 'bg-[#FFEAB8] border-[#7A3710] text-[#421C09]';
            }

            return (
              <motion.button
                key={k}
                type="button"
                whileTap={{ scale: 0.92 }}
                style={
                  solved ? { animationDelay: `${(r + c) * 35}ms` } : undefined
                }
                onClick={() => handleCellTap(r, c)}
                className={`relative aspect-square border-2 flex items-center justify-center font-bold text-xs sm:text-sm select-none ${cellBg}`}
              >
                {meta.number !== undefined && (
                  <span
                    className={`absolute top-0 left-0.5 text-[7px] font-bold leading-none ${
                      solved ? 'text-[#FFF0C4]' : 'text-[#7A3710]'
                    }`}
                  >
                    {meta.number}
                  </span>
                )}
                {meta.secretSlot !== undefined && (
                  <span
                    className={`absolute bottom-0 right-0.5 text-[7px] font-bold leading-none ${
                      solved ? 'text-[#FFE478]' : 'text-[#B8431D]'
                    }`}
                  >
                    {meta.secretSlot}
                  </span>
                )}
                {val}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Active Clue Banner + Keyboard */}
      <div className="sdv-wood-bar border-t-3 border-[#4A1C05]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2 px-3 py-1.5 bg-[#FAD998] border-b-2 border-[#4A1C05]">
          <button
            type="button"
            onClick={() => cycleClue(-1)}
            aria-label="Previous clue"
            className="sdv-btn w-8 h-8 bg-[#E8B878] flex items-center justify-center text-[#3D1603] shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <p className="font-pixel-body text-base sm:text-lg text-center text-[#421C09] leading-tight">
            <span className="font-bold text-[#B8431D] mr-1">
              {activeClue.number} {activeClue.direction.toUpperCase()}:
            </span>
            {activeClue.clue}
          </p>

          <button
            type="button"
            onClick={() => cycleClue(1)}
            aria-label="Next clue"
            className="sdv-btn w-8 h-8 bg-[#E8B878] flex items-center justify-center text-[#3D1603] shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <MobileKeyboard
          onKey={handleKey}
          onBackspace={handleBackspace}
          onEnter={() => cycleClue(1)}
          enterLabel="NEXT"
          disabled={solved}
        />
      </div>
    </div>
  );
}

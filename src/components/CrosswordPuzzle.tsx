import { useCallback, useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { MobileKeyboard } from './MobileKeyboard';

const ROWS = 6;
const COLS = 8;

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
    id: '3A',
    number: 3,
    direction: 'across',
    row: 1,
    col: 0,
    answer: 'BIBIMBAP',
    clue: 'Signature Korean mixed rice bowl',
  },
  {
    id: '5A',
    number: 5,
    direction: 'across',
    row: 3,
    col: 3,
    answer: 'EGG',
    clue: 'Sunny-side up topping to mix in',
  },
  {
    id: '1D',
    number: 1,
    direction: 'down',
    row: 0,
    col: 1,
    answer: 'KIMCHI',
    clue: 'Tangy fermented cabbage side dish',
  },
  {
    id: '2D',
    number: 2,
    direction: 'down',
    row: 0,
    col: 3,
    answer: 'RICE',
    clue: 'Steamed base at the bottom of the bowl',
  },
  {
    id: '4D',
    number: 4,
    direction: 'down',
    row: 1,
    col: 7,
    answer: 'POT',
    clue: 'Sizzling hot stone ___ (dolsot)',
  },
];

function keyOf(r: number, c: number): string {
  return `${r},${c}`;
}

interface CellMeta {
  solution: string;
  number?: number;
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
        map[k] = { solution: clue.answer[i] };
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
  const [selectedCell, setSelectedCell] = useState<[number, number]>([1, 0]);
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
    setSelectedCell([clue.row, clue.col]);
    setDirection(clue.direction);
    setShowAllClues(false);
  };

  const cycleClue = useCallback(
    (delta: number) => {
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
        window.setTimeout(() => onSolve(), 280);
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

      // Advance cursor within the active clue
      const offset =
        activeClue.direction === 'across'
          ? c - activeClue.col
          : r - activeClue.row;
      if (offset < activeClue.answer.length - 1) {
        const nextR =
          activeClue.direction === 'across' ? r : r + 1;
        const nextC =
          activeClue.direction === 'across' ? c + 1 : c;
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
    setCheckedErrors(errors);
  };

  return (
    <div className="flex flex-col flex-1 justify-between min-h-0">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2">
        <button
          type="button"
          onClick={() => setShowAllClues((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full bg-[#F7ECE6] px-3 py-1.5 text-xs font-semibold text-[#2D221E] active:scale-95 transition"
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
          className="inline-flex items-center gap-1 rounded-full bg-[#F7ECE6] px-3 py-1.5 text-xs font-semibold text-[#C85A43] active:scale-95 transition disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
          Check
        </button>
      </div>

      {/* Expandable Full Clue List */}
      {showAllClues && (
        <div className="mx-4 mb-2 rounded-2xl bg-white border border-[#EAD9CF] p-3 shadow-sm max-h-44 overflow-y-auto animate-pop-in">
          <div className="grid grid-cols-1 gap-1.5">
            {CLUES.map((clue) => {
              const isCurrent = clue.id === activeClue.id;
              return (
                <button
                  key={clue.id}
                  type="button"
                  onClick={() => selectClue(clue)}
                  className={`text-left rounded-xl px-2.5 py-1.5 text-xs transition ${
                    isCurrent
                      ? 'bg-[#F7ECE6] text-[#C85A43] font-semibold'
                      : 'text-[#54433D] hover:bg-[#FDF8F4]'
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
        </div>
      )}

      {/* Crossword Grid */}
      <div className="flex-1 flex items-center justify-center px-3 py-2 min-h-0">
        <div
          className="w-full max-w-[352px] grid gap-1"
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

            let cellBg = 'bg-white border-[#DCCAC0] text-[#2D221E]';
            if (solved) {
              cellBg = 'bg-[#E9F3EC] border-[#5A8F6B] text-[#2B593B]';
            } else if (hasError) {
              cellBg = 'bg-[#FDE8E8] border-[#D9534F] text-[#B52B27]';
            } else if (isSelected) {
              cellBg = 'bg-[#FCE3D8] border-[#C85A43] text-[#2D221E] ring-2 ring-[#C85A43]/30';
            } else if (isInActiveWord) {
              cellBg = 'bg-[#F7ECE6] border-[#D8B8AC] text-[#2D221E]';
            }

            return (
              <button
                key={k}
                type="button"
                onClick={() => handleCellTap(r, c)}
                className={`relative aspect-square rounded-lg border-2 flex items-center justify-center font-bold text-base sm:text-lg select-none transition-colors ${cellBg}`}
              >
                {meta.number !== undefined && (
                  <span className="absolute top-0.5 left-1 text-[9px] font-bold leading-none text-[#7C665E]">
                    {meta.number}
                  </span>
                )}
                {val}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Clue Banner + Keyboard */}
      <div className="bg-[#FDF8F4] border-t border-[#EFE2DA]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2 px-3 py-2 bg-[#F7ECE6]/80 border-b border-[#EFE2DA]">
          <button
            type="button"
            onClick={() => cycleClue(-1)}
            aria-label="Previous clue"
            className="w-8 h-8 rounded-full bg-white border border-[#E6D6CC] flex items-center justify-center text-[#2D221E] active:scale-95 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <p className="text-xs sm:text-sm text-center font-medium text-[#2D221E] leading-snug">
            <span className="font-bold text-[#C85A43] mr-1.5">
              {activeClue.number} {activeClue.direction.toUpperCase()}:
            </span>
            {activeClue.clue}
          </p>

          <button
            type="button"
            onClick={() => cycleClue(1)}
            aria-label="Next clue"
            className="w-8 h-8 rounded-full bg-white border border-[#E6D6CC] flex items-center justify-center text-[#2D221E] active:scale-95 shrink-0"
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

import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, Shuffle } from 'lucide-react';

const COLS = 5;
const ROWS = 7;
const TOTAL_TILES = COLS * ROWS; // 35 tiles for 3:4 portrait photo (~5 min solve)

interface JigsawPuzzleProps {
  solved: boolean;
  onSolve: () => void;
}

function createShuffledTiles(): number[] {
  const arr = Array.from({ length: TOTAL_TILES }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Ensure it's not accidentally already solved
  if (arr.every((v, idx) => v === idx)) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

interface DragState {
  fromIndex: number;
  pieceId: number;
  clientX: number;
  clientY: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  hoverIndex: number | null;
}

export function JigsawPuzzle({ solved, onSolve }: JigsawPuzzleProps) {
  const [tiles, setTiles] = useState<number[]>(() =>
    solved
      ? Array.from({ length: TOTAL_TILES }, (_, i) => i)
      : createShuffledTiles()
  );
  const [showPreview, setShowPreview] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (solved) {
      setTiles(Array.from({ length: TOTAL_TILES }, (_, i) => i));
    }
  }, [solved]);

  const correctCount = useMemo(
    () => tiles.filter((pieceId, slotIdx) => pieceId === slotIdx).length,
    [tiles]
  );

  const getTileStyle = (pieceId: number) => {
    const origRow = Math.floor(pieceId / COLS);
    const origCol = pieceId % COLS;
    const posX = COLS > 1 ? (origCol / (COLS - 1)) * 100 : 0;
    const posY = ROWS > 1 ? (origRow / (ROWS - 1)) * 100 : 0;
    return {
      backgroundImage: 'url(/chuan-pai.jpg)',
      backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
      backgroundPosition: `${posX}% ${posY}%`,
    };
  };

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    slotIdx: number
  ) => {
    if (solved) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);

    setDrag({
      fromIndex: slotIdx,
      pieceId: tiles[slotIdx],
      clientX: e.clientX,
      clientY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      hoverIndex: slotIdx,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const tileEl = target?.closest('[data-tile-index]') as HTMLElement | null;
    const hoverIndex = tileEl
      ? Number(tileEl.getAttribute('data-tile-index'))
      : null;

    setDrag((prev) =>
      prev
        ? {
            ...prev,
            clientX: e.clientX,
            clientY: e.clientY,
            hoverIndex,
          }
        : null
    );
  };

  const finishDrag = () => {
    if (!drag) return;
    const { fromIndex, hoverIndex } = drag;
    setDrag(null);

    if (hoverIndex !== null && hoverIndex !== fromIndex) {
      setTiles((prev) => {
        const next = [...prev];
        [next[fromIndex], next[hoverIndex]] = [
          next[hoverIndex],
          next[fromIndex],
        ];
        if (next.every((pieceId, idx) => pieceId === idx)) {
          window.setTimeout(() => onSolve(), 260);
        }
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-between min-h-0 px-4 pb-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-between py-2">
        <span className="text-xs font-medium text-[#7C665E]">
          <strong className="text-[#C85A43]">{correctCount}</strong> /{' '}
          {TOTAL_TILES} in place
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold active:scale-95 transition ${
              showPreview
                ? 'bg-[#C85A43] text-white'
                : 'bg-[#F7ECE6] text-[#2D221E]'
            }`}
          >
            {showPreview ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            Preview
          </button>

          {!solved && (
            <button
              type="button"
              onClick={() => setTiles(createShuffledTiles())}
              aria-label="Reshuffle tiles"
              className="inline-flex items-center gap-1 rounded-full bg-[#F7ECE6] px-3 py-1.5 text-xs font-semibold text-[#7C665E] active:scale-95 transition"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Jigsaw Board */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div
          ref={boardRef}
          className={`relative w-full max-w-[348px] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#E2CFC4] bg-[#2D221E]/5 shadow-md select-none touch-none grid ${
            solved ? 'gap-0' : 'gap-[1.5px] bg-[#EAD9CF]'
          }`}
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
          }}
        >
          {tiles.map((pieceId, slotIdx) => {
            const isDraggingSource = drag?.fromIndex === slotIdx;
            const isHoverTarget =
              drag &&
              drag.hoverIndex === slotIdx &&
              drag.fromIndex !== slotIdx;
            const isCorrect = !solved && pieceId === slotIdx;

            return (
              <div
                key={slotIdx}
                data-tile-index={slotIdx}
                onPointerDown={(e) => handlePointerDown(e, slotIdx)}
                onPointerMove={handlePointerMove}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
                style={getTileStyle(pieceId)}
                className={`relative w-full h-full bg-no-repeat transition-transform duration-100 ${
                  solved ? '' : 'cursor-grab active:cursor-grabbing'
                } ${isDraggingSource ? 'opacity-30 scale-95' : ''} ${
                  isHoverTarget
                    ? 'ring-2 ring-inset ring-[#C85A43] brightness-110 z-10'
                    : ''
                } ${
                  isCorrect
                    ? 'ring-1 ring-inset ring-white/45'
                    : ''
                }`}
              />
            );
          })}

          {/* Faint Reference Preview Overlay */}
          {showPreview && !solved && (
            <img
              src="/chuan-pai.jpg"
              alt="Reference preview"
              className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-30"
            />
          )}
        </div>
      </div>

      <p className="text-center text-xs text-[#7C665E] pt-2">
        {solved
          ? 'All 35 pieces matched!'
          : 'Drag any tile onto another to swap them'}
      </p>

      {/* Floating dragged tile */}
      {drag && (
        <div
          style={{
            ...getTileStyle(drag.pieceId),
            position: 'fixed',
            left: drag.clientX - drag.offsetX,
            top: drag.clientY - drag.offsetY,
            width: drag.width,
            height: drag.height,
            pointerEvents: 'none',
            zIndex: 60,
          }}
          className="rounded-md shadow-2xl ring-2 ring-[#C85A43] scale-105 bg-no-repeat"
        />
      )}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { playSparkle, playSwap, playTap } from '../utils/sound';
import { PixelJunimo } from './PixelSprites';

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
  if (arr.every((v, idx) => v === idx)) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

interface DragState {
  fromIndex: number;
  pieceId: number;
  startX: number;
  startY: number;
  clientX: number;
  clientY: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  hoverIndex: number | null;
  hasMoved: boolean;
}

export function JigsawPuzzle({ solved, onSolve }: JigsawPuzzleProps) {
  const [tiles, setTiles] = useState<number[]>(() =>
    solved
      ? Array.from({ length: TOTAL_TILES }, (_, i) => i)
      : createShuffledTiles()
  );
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [sparkledSlots, setSparkledSlots] = useState<Record<number, boolean>>({});
  const [imageLoaded, setImageLoaded] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = '/chuan-pai.jpg';
    if (img.complete) {
      setImageLoaded(true);
    } else {
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (solved) {
      setTiles(Array.from({ length: TOTAL_TILES }, (_, i) => i));
      setSelectedSlot(null);
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

  const swapTiles = (a: number, b: number) => {
    setTiles((prev) => {
      const next = [...prev];
      [next[a], next[b]] = [next[b], next[a]];

      const landedHome: number[] = [];
      if (next[a] === a) landedHome.push(a);
      if (next[b] === b) landedHome.push(b);

      if (landedHome.length > 0) {
        playSparkle();
        setSparkledSlots((s) => {
          const copy = { ...s };
          landedHome.forEach((idx) => {
            copy[idx] = true;
          });
          return copy;
        });
        window.setTimeout(() => {
          setSparkledSlots((s) => {
            const copy = { ...s };
            landedHome.forEach((idx) => {
              delete copy[idx];
            });
            return copy;
          });
        }, 720);
      } else {
        playSwap();
      }

      if (next.every((pieceId, idx) => pieceId === idx)) {
        window.setTimeout(() => onSolve(), 350);
      }
      return next;
    });
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
      startX: e.clientX,
      startY: e.clientY,
      clientX: e.clientX,
      clientY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      hoverIndex: slotIdx,
      hasMoved: false,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const moved = drag.hasMoved || Math.hypot(dx, dy) > 6;

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
            hasMoved: moved,
          }
        : null
    );
  };

  const finishDrag = () => {
    if (!drag) return;
    const { fromIndex, hoverIndex, hasMoved } = drag;
    setDrag(null);

    if (!hasMoved) {
      // Tap-to-swap
      if (selectedSlot === null) {
        playTap();
        setSelectedSlot(fromIndex);
      } else if (selectedSlot === fromIndex) {
        playTap();
        setSelectedSlot(null);
      } else {
        const first = selectedSlot;
        setSelectedSlot(null);
        swapTiles(first, fromIndex);
      }
      return;
    }

    setSelectedSlot(null);
    if (hoverIndex !== null && hoverIndex !== fromIndex) {
      swapTiles(fromIndex, hoverIndex);
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-between min-h-0 px-4 pb-3">
      {/* Controls Bar */}
      <div className="flex items-center justify-between py-2">
        <span className="sdv-parchment px-2.5 py-1 text-[11px] font-bold text-[#421C09]">
          <span className="text-[#B8431D]">{correctCount}</span> / {TOTAL_TILES}{' '}
          in place
        </span>

        {!solved && (
          <button
            type="button"
            onClick={() => {
              playTap();
              setSelectedSlot(null);
              setTiles(createShuffledTiles());
            }}
            aria-label="Reshuffle tiles"
            className="sdv-btn inline-flex items-center gap-1.5 bg-[#E8B878] px-3 py-1 text-[11px] font-bold text-[#3D1603]"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Shuffle
          </button>
        )}
      </div>

      {/* Jigsaw Board inside Stardew Wooden Frame */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center py-2 min-h-0">
        <div className="sdv-wood-panel p-2 w-full max-w-[348px] my-auto">
          <div
            ref={boardRef}
            className={`relative w-full aspect-[3/4] overflow-hidden border-2 border-[#3D1603] bg-[#FAD998] select-none touch-none grid ${
              solved ? 'gap-0' : 'gap-[1.5px]'
            }`}
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
            }}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#FAD998] text-[#421C09] gap-3">
                <div className="animate-junimo">
                  <PixelJunimo color="gold" className="w-12 h-12" />
                </div>
                <p className="font-pixel-title text-[10px] text-[#7A3710]">
                  Loading photo...
                </p>
              </div>
            )}
            {tiles.map((pieceId, slotIdx) => {
              const isDraggingSource =
                drag?.hasMoved && drag.fromIndex === slotIdx;
              const isHoverTarget =
                drag?.hasMoved &&
                drag.hoverIndex === slotIdx &&
                drag.fromIndex !== slotIdx;
              const isSelected = !solved && selectedSlot === slotIdx;
              const isCorrect = !solved && pieceId === slotIdx;
              const isSparkling = Boolean(sparkledSlots[slotIdx]);

              return (
                <div
                  key={slotIdx}
                  data-tile-index={slotIdx}
                  onPointerDown={(e) => handlePointerDown(e, slotIdx)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={finishDrag}
                  onPointerCancel={() => setDrag(null)}
                  style={getTileStyle(pieceId)}
                  className={`relative w-full h-full bg-no-repeat transition-transform duration-100 ${
                    solved ? '' : 'cursor-grab active:cursor-grabbing'
                  } ${isDraggingSource ? 'opacity-30 scale-95' : ''} ${
                    isSelected
                      ? 'ring-2 ring-inset ring-[#FFE478] brightness-115 scale-[0.96] z-10'
                      : ''
                  } ${
                    isHoverTarget
                      ? 'ring-2 ring-inset ring-[#FFE478] brightness-110 z-10'
                      : ''
                  } ${
                    isCorrect && !isSelected
                      ? 'ring-1 ring-inset ring-[#FFE478]/50'
                      : ''
                  } ${isSparkling ? 'animate-tile-sparkle z-10' : ''}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-center font-pixel-body text-lg text-[#FFF0C4] drop-shadow-[0_1px_0_#19132B] pt-2">
        {solved
          ? 'All 35 pieces matched!'
          : 'Drag or tap two tiles to swap them'}
      </p>

      {/* Floating dragged tile */}
      {drag && drag.hasMoved && (
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
          className="shadow-2xl ring-2 ring-[#FFE478] scale-105 bg-no-repeat"
        />
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
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
import { AllCompleteModal } from './components/AllCompleteModal';
import { StardewBackdrop } from './components/StardewBackdrop';
import { TitleScreen } from './components/TitleScreen';
import {
  PixelHeart,
  PixelJunimo,
  PixelStardrop,
} from './components/PixelSprites';
import {
  isSoundMuted,
  playTap,
  setSoundMuted,
  stopAmbientMusic,
} from './utils/sound';

const PUZZLE_ORDER: PuzzleId[] = ['wordle', 'crossword', 'jigsaw'];

const JUNIMO_COLORS: Record<PuzzleId, 'green' | 'rose' | 'gold'> = {
  wordle: 'green',
  crossword: 'rose',
  jigsaw: 'gold',
};

export function App() {
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState<QuestProgress>(() => loadProgress());
  const [activePuzzle, setActivePuzzle] = useState<PuzzleId | null>(null);
  const [modalState, setModalState] = useState<{
    puzzleId: PuzzleId | null;
    celebrate: boolean;
  }>({ puzzleId: null, celebrate: false });
  const [confirmReset, setConfirmReset] = useState(false);
  const [muted, setMuted] = useState<boolean>(() => isSoundMuted());
  const [pendingFinale, setPendingFinale] = useState(false);
  const [showAllComplete, setShowAllComplete] = useState(false);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    const img = new Image();
    img.src = '/chuan-pai.jpg';
  }, []);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state as { view?: string; puzzle?: PuzzleId } | null;
      setModalState({ puzzleId: null, celebrate: false });
      if (state?.view === 'puzzle' && state.puzzle) {
        setStarted(true);
        setActivePuzzle(state.puzzle);
      } else if (state?.view === 'board') {
        setStarted(true);
        setActivePuzzle(null);
      } else {
        setStarted(false);
        setActivePuzzle(null);
        stopAmbientMusic();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const enterBoard = () => {
    window.history.pushState({ view: 'board' }, '');
    setStarted(true);
  };

  const openPuzzle = (id: PuzzleId) => {
    window.history.pushState({ view: 'puzzle', puzzle: id }, '');
    setActivePuzzle(id);
  };

  const leavePuzzle = () => {
    const state = window.history.state as { view?: string } | null;
    if (state?.view === 'puzzle') {
      window.history.back();
    } else {
      setActivePuzzle(null);
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next, started);
    if (!next) playTap();
  };

  const solvedCount = PUZZLE_ORDER.filter((id) => progress.solved[id]).length;
  const hasProgress =
    solvedCount > 0 ||
    progress.wordleGuesses.length > 0 ||
    Object.keys(progress.crosswordGrid).length > 0;

  const handleSolve = (puzzleId: PuzzleId) => {
    const willCompleteAll = PUZZLE_ORDER.every(
      (id) => id === puzzleId || progress.solved[id]
    );
    setProgress((prev) => ({
      ...prev,
      solved: {
        ...prev.solved,
        [puzzleId]: true,
      },
    }));
    if (willCompleteAll) {
      setPendingFinale(true);
    }
    setModalState({ puzzleId, celebrate: true });
  };

  useEffect(() => {
    if (started && activePuzzle === null && pendingFinale) {
      setPendingFinale(false);
      const timer = window.setTimeout(() => {
        setShowAllComplete(true);
      }, 260);
      return () => window.clearTimeout(timer);
    }
  }, [started, activePuzzle, pendingFinale]);

  const handleResetAll = () => {
    playTap();
    if (!confirmReset) {
      setConfirmReset(true);
      window.setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    setProgress(DEFAULT_PROGRESS);
    setConfirmReset(false);
    setPendingFinale(false);
    setShowAllComplete(false);
    setActivePuzzle(null);
    setModalState({ puzzleId: null, celebrate: false });
  };

  return (
    <div className="relative min-h-[100dvh] text-[#421C09] overflow-x-hidden">
      <StardewBackdrop />

      <AnimatePresence mode="wait">
        {!started ? (
          <TitleScreen
            key="title"
            hasProgress={hasProgress}
            muted={muted}
            onToggleMute={toggleMute}
            onStart={enterBoard}
          />
        ) : activePuzzle ? (
          <motion.div
            key={`puzzle-${activePuzzle}`}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-0 z-10 flex flex-col overflow-hidden"
          >
            {/* Stardew Wooden Top Bar */}
            <header className="shrink-0 sdv-wood-bar grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2.5">
              <button
                type="button"
                onClick={() => {
                  playTap();
                  leavePuzzle();
                }}
                className="sdv-btn justify-self-start inline-flex items-center gap-1 bg-[#FAD998] px-2.5 py-1.5 text-[11px] font-bold text-[#421C09]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>

              <div className="text-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#FFE478]">
                  Quest {RESTAURANTS[activePuzzle].puzzleNumber}
                </p>
                <h1 className="font-pixel-title text-xs text-[#FFF0C4] drop-shadow-[0_2px_0_#3D1603]">
                  {RESTAURANTS[activePuzzle].puzzleTitle}
                </h1>
              </div>

              <div className="justify-self-end flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
                  className="sdv-btn bg-[#FAD998] p-1.5 text-[#421C09]"
                >
                  {muted ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>

                {progress.solved[activePuzzle] && (
                  <button
                    type="button"
                    onClick={() => {
                      playTap();
                      setModalState({
                        puzzleId: activePuzzle,
                        celebrate: false,
                      });
                    }}
                    className="sdv-btn inline-flex items-center gap-1 bg-[#5FA848] px-2.5 py-1.5 text-[10px] font-bold text-white"
                  >
                    <Sparkles className="w-3 h-3" />
                    Reveal
                  </button>
                )}
              </div>
            </header>

            <main className="flex-1 flex flex-col min-h-0">
              {activePuzzle === 'wordle' && (
                <WordlePuzzle
                  guesses={progress.wordleGuesses}
                  solved={progress.solved.wordle}
                  onGuessesChange={(wordleGuesses) =>
                    setProgress((prev) => ({ ...prev, wordleGuesses }))
                  }
                  onSolve={() => handleSolve('wordle')}
                />
              )}

              {activePuzzle === 'crossword' && (
                <CrosswordPuzzle
                  gridValues={progress.crosswordGrid}
                  solved={progress.solved.crossword}
                  onGridChange={(crosswordGrid) =>
                    setProgress((prev) => ({ ...prev, crosswordGrid }))
                  }
                  onSolve={() => handleSolve('crossword')}
                />
              )}

              {activePuzzle === 'jigsaw' && (
                <JigsawPuzzle
                  solved={progress.solved.jigsaw}
                  onSolve={() => handleSolve('jigsaw')}
                />
              )}
            </main>
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative z-10 min-h-[100dvh] flex flex-col px-4 py-6"
          >
            <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
              {/* Top utility row */}
              <div className="flex items-center justify-between mb-3">
                <div className="sdv-parchment px-3 py-1 inline-flex items-center gap-1.5 text-[10px] font-bold text-[#421C09]">
                  <PixelHeart className="w-3.5 h-3.5" />
                  Near ATLAS Bar · Bugis
                </div>

                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
                  className="sdv-btn bg-[#FAD998] p-2 text-[#421C09]"
                >
                  {muted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Wooden Quest Board Sign */}
              <header className="sdv-wood-panel p-2 mb-5">
                <div className="sdv-parchment px-4 py-5 text-center">
                  <h1 className="font-pixel-title text-base sm:text-lg leading-relaxed text-[#421C09] drop-shadow-[0_2px_0_#FFF0C4]">
                    Bobo &amp; Bubba 2026 Meetsary
                  </h1>

                  <p className="mt-2 font-pixel-body text-xl text-[#7A3710] leading-tight">
                    A Date Night Dinner Quest for Bubba
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4 inline-flex items-center gap-2.5 bg-[#FFEAB8] border-2 border-[#7A3710] px-3.5 py-1.5">
                    <div className="flex gap-1.5">
                      {PUZZLE_ORDER.map((id) =>
                        progress.solved[id] ? (
                          <PixelStardrop key={id} className="w-4 h-4" />
                        ) : (
                          <span
                            key={id}
                            className="w-3.5 h-3.5 border-2 border-[#7A3710] bg-[#E8C589] inline-block"
                          />
                        )
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-[#421C09]">
                      {solvedCount} / 3 Unlocked
                    </span>
                  </div>
                </div>
              </header>

              {/* All 3 Solved Persistent Congratulations Banner */}
              {solvedCount === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  className="sdv-wood-panel p-1.5 mb-4"
                >
                  <div className="bg-[#FFF3D1] border-2 border-[#5B2308] px-4 py-3 flex items-center gap-3">
                    <div className="animate-junimo shrink-0">
                      <PixelStardrop className="w-8 h-8" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-pixel-title text-[11px] leading-snug text-[#9E3C16]">
                        All 3 Spots Unlocked, Bubba!
                      </p>
                      <p className="font-pixel-body text-lg text-[#421C09] leading-tight mt-0.5 flex items-center gap-1">
                        <span>Pick where we’re eating tonight</span>
                        <PixelHeart className="w-3.5 h-3.5 inline shrink-0" />
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3 Quest Cards */}
              <main className="flex flex-col gap-3.5 flex-1">
                {PUZZLE_ORDER.map((id, index) => {
                  const info = RESTAURANTS[id];
                  const isSolved = progress.solved[id];

                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: index * 0.09,
                        type: 'spring',
                        stiffness: 320,
                        damping: 24,
                      }}
                      className="sdv-wood-panel p-1.5"
                    >
                      <div className="sdv-parchment p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#FFEAB8] border-2 border-[#7A3710] flex items-center justify-center shrink-0">
                              <div
                                className="animate-junimo"
                                style={{ animationDelay: `${index * 0.35}s` }}
                              >
                                <PixelJunimo
                                  color={JUNIMO_COLORS[id]}
                                  className="w-9 h-9"
                                />
                              </div>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E3C16]">
                                Quest {info.puzzleNumber} · {info.puzzleSubtitle}
                              </p>
                              <h2 className="font-pixel-title text-sm text-[#421C09] mt-1">
                                {info.puzzleTitle}
                              </h2>
                            </div>
                          </div>

                          {isSolved ? (
                            <span className="inline-flex items-center gap-1 bg-[#5FA848] border-2 border-[#3D1603] px-2 py-0.5 text-[10px] font-bold text-white">
                              <CheckCircle2 className="w-3 h-3" />
                              Done
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-[#E8B878] border-2 border-[#7A3710] px-2 py-0.5 text-[10px] font-bold text-[#421C09]">
                              <Lock className="w-3 h-3" />
                              Quest
                            </span>
                          )}
                        </div>

                        {isSolved ? (
                          <div className="mt-3.5 pt-3 border-t-2 border-[#DFA858]">
                            <div>
                              <p className="text-xs font-bold text-[#421C09]">
                                {info.restaurantName}
                              </p>
                              <p className="font-pixel-body text-lg text-[#7A3710] leading-tight mt-0.5">
                                {info.location}
                              </p>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  playTap();
                                  openPuzzle(id);
                                }}
                                className="sdv-btn bg-[#E8B878] py-2 text-[11px] font-bold text-[#421C09]"
                              >
                                Board
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  playTap();
                                  setModalState({
                                    puzzleId: id,
                                    celebrate: false,
                                  });
                                }}
                                className="sdv-btn bg-[#5FA848] py-2 text-[11px] font-bold text-white"
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3.5 pt-3 border-t-2 border-[#DFA858] flex items-center justify-between gap-2">
                            <p className="font-pixel-body text-lg text-[#7A3710] leading-tight">
                              {info.mysteryTeaser}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                playTap();
                                openPuzzle(id);
                              }}
                              className="sdv-btn shrink-0 bg-[#E88D48] px-3.5 py-1.5 text-xs font-bold text-[#3D1603]"
                            >
                              Play &gt;
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </main>

              {/* Subtle Footer */}
              <footer className="pt-6 pb-2 text-center">
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-[#FFF0C4]/80 hover:text-[#FFF0C4] transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  {confirmReset ? 'Tap again to confirm' : 'Reset All'}
                </button>
              </footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RevealModal
        restaurant={
          modalState.puzzleId ? RESTAURANTS[modalState.puzzleId] : null
        }
        celebrate={modalState.celebrate}
        onClose={() => {
          setModalState({ puzzleId: null, celebrate: false });
          if (activePuzzle) {
            leavePuzzle();
          }
        }}
      />

      <AllCompleteModal
        open={showAllComplete}
        onClose={() => setShowAllComplete(false)}
      />
    </div>
  );
}

export default App;

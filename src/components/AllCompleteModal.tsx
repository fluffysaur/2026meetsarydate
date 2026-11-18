import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { PixelHeart, PixelStardrop } from './PixelSprites';
import { playTap, playVictory } from '../utils/sound';

interface AllCompleteModalProps {
  open: boolean;
  onClose: () => void;
}

export function AllCompleteModal({ open, onClose }: AllCompleteModalProps) {
  useEffect(() => {
    if (!open) return;

    playVictory();

    const colors = ['#6BCB77', '#F6BD60', '#F0718D', '#9B5DE5', '#FFF0C4'];
    confetti({
      particleCount: 95,
      spread: 85,
      origin: { y: 0.55 },
      shapes: ['square'],
      scalar: 1.15,
      colors,
    });

    const t1 = window.setTimeout(() => {
      confetti({
        particleCount: 55,
        angle: 60,
        spread: 60,
        origin: { x: 0.1, y: 0.65 },
        shapes: ['square'],
        colors,
      });
      confetti({
        particleCount: 55,
        angle: 120,
        spread: 60,
        origin: { x: 0.9, y: 0.65 },
        shapes: ['square'],
        colors,
      });
    }, 260);

    return () => window.clearTimeout(t1);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="all-complete-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#19132B]/75 backdrop-blur-[2px] p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="all-complete-title"
        >
          <motion.div
            key="all-complete-box"
            initial={{ scale: 0.86, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 14, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 25 }}
            className="w-full max-w-md sdv-wood-panel p-2 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sdv-parchment px-5 py-6 text-center relative">
              <button
                type="button"
                onClick={() => {
                  playTap();
                  onClose();
                }}
                aria-label="Close celebration"
                className="sdv-btn absolute right-3 top-3 w-8 h-8 bg-[#E88D48] text-[#3D1603] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="animate-junimo">
                  <PixelStardrop className="w-10 h-10" />
                </div>
                <div
                  className="animate-junimo"
                  style={{ animationDelay: '0.25s' }}
                >
                  <PixelHeart className="w-8 h-8" />
                </div>
                <div
                  className="animate-junimo"
                  style={{ animationDelay: '0.5s' }}
                >
                  <PixelStardrop className="w-10 h-10" />
                </div>
              </div>

              <h2
                id="all-complete-title"
                className="font-pixel-title text-sm sm:text-base leading-relaxed text-[#421C09]"
              >
                All 3 quests complete, Bubba!
              </h2>

              <p className="mt-3 font-pixel-body text-2xl text-[#9E3C16] leading-tight">
                Pick where we&apos;re eating tonight!
              </p>

              <button
                type="button"
                onClick={() => {
                  playTap();
                  onClose();
                }}
                className="sdv-btn mt-6 w-full bg-[#5FA848] py-3.5 text-xs font-bold text-white uppercase tracking-wider"
              >
                See All 3 Dinner Spots
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

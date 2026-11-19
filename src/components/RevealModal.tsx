import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, MapPin, Maximize2, Utensils, X } from 'lucide-react';
import type { RestaurantInfo } from '../data/restaurants';
import { PixelStardrop } from './PixelSprites';
import { ImagePreviewModal } from './ImagePreviewModal';
import { playTap, playVictory } from '../utils/sound';

interface RevealModalProps {
  restaurant: RestaurantInfo | null;
  celebrate?: boolean;
  onClose: () => void;
}

export function RevealModal({
  restaurant,
  celebrate = false,
  onClose,
}: RevealModalProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setImageFailed(false);
    setPreviewOpen(false);
  }, [restaurant?.id]);

  useEffect(() => {
    if (!restaurant || !celebrate) return;

    playVictory();

    const colors = ['#6BCB77', '#F6BD60', '#F0718D', '#9B5DE5', '#FFF0C4'];
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.58 },
      shapes: ['square'],
      scalar: 1.1,
      colors,
    });

    const timer = window.setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.65 },
        shapes: ['square'],
        colors,
      });
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.65 },
        shapes: ['square'],
        colors,
      });
    }, 240);

    return () => window.clearTimeout(timer);
  }, [restaurant, celebrate]);

  return (
    <AnimatePresence>
      {restaurant && (
        <motion.div
          key="reveal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#19132B]/75 backdrop-blur-[2px] p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reveal-title"
        >
          <motion.div
            key="reveal-box"
            initial={{ scale: 0.88, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className="w-full max-w-md sdv-wood-panel p-2 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sdv-parchment p-5 relative max-h-[90dvh] overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  playTap();
                  onClose();
                }}
                aria-label="Close reveal"
                className="sdv-btn absolute right-3 top-3 w-8 h-8 bg-[#E88D48] text-[#3D1603] flex items-center justify-center z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-3 pr-8">
                <div className="animate-junimo shrink-0">
                  <PixelStardrop className="w-10 h-10" />
                </div>
                <div>
                  <span className="inline-block bg-[#5FA848] border-2 border-[#3D1603] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    Quest {restaurant.puzzleNumber} Complete!
                  </span>
                  <h2
                    id="reveal-title"
                    className="font-pixel-title text-base sm:text-lg text-[#421C09] mt-1.5 leading-snug"
                  >
                    {restaurant.restaurantName}
                  </h2>
                </div>
              </div>

              {!imageFailed && (
                <button
                  type="button"
                  onClick={() => {
                    playTap();
                    setPreviewOpen(true);
                  }}
                  aria-label={`Preview photo of ${restaurant.restaurantName}`}
                  className="mb-3 w-full border-2 border-[#5B2308] bg-[#FFEAB8] overflow-hidden relative group block cursor-zoom-in"
                >
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.restaurantName}
                    onError={() => setImageFailed(true)}
                    style={{ imageRendering: 'auto' }}
                    className="w-full h-40 sm:h-44 object-cover block transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                  <span className="absolute right-2 bottom-2 bg-[#19132B]/75 border border-[#FFF0C4]/60 text-[#FFF0C4] p-1 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider">
                    <Maximize2 className="w-3 h-3" />
                  </span>
                </button>
              )}

              <p className="text-xs font-bold text-[#9E3C16] flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 shrink-0" />
                {restaurant.cuisine}
              </p>

              <p className="mt-3 font-pixel-body text-xl leading-snug text-[#421C09]">
                {restaurant.description}
              </p>

              <div className="mt-4 bg-[#FFEAB8] border-2 border-[#7A3710] p-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#B8431D] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A3710]">
                      Location &amp; Directions
                    </p>
                    <p className="text-xs font-bold text-[#421C09] mt-0.5">
                      {restaurant.location}
                    </p>
                    <p className="font-pixel-body text-lg text-[#5B2308] mt-0.5 leading-tight">
                      {restaurant.directionsHint}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2.5">
                <a
                  href={restaurant.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playTap()}
                  className="sdv-btn w-full bg-[#E8A338] py-3 text-xs font-bold text-[#3D1603] uppercase tracking-wider inline-flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in Google Maps
                </a>

                <button
                  type="button"
                  onClick={() => {
                    playTap();
                    onClose();
                  }}
                  className="sdv-btn w-full bg-[#5FA848] py-3 text-xs font-bold text-white uppercase tracking-wider"
                >
                  Return to Quest Board
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <ImagePreviewModal
        src={previewOpen && restaurant ? restaurant.imageUrl : null}
        alt={restaurant?.restaurantName ?? ''}
        onClose={() => setPreviewOpen(false)}
      />
    </AnimatePresence>
  );
}

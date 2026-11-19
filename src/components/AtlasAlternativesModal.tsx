import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, MapPin, Maximize2, Wine, X } from 'lucide-react';
import { ATLAS_ALTERNATIVES } from '../data/restaurants';
import { ImagePreviewModal } from './ImagePreviewModal';
import { playTap } from '../utils/sound';

interface AtlasAlternativesModalProps {
  open: boolean;
  onClose: () => void;
}

export function AtlasAlternativesModal({
  open,
  onClose,
}: AtlasAlternativesModalProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="atlas-alts-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#19132B]/75 backdrop-blur-[2px] p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="atlas-alts-title"
        >
          <motion.div
            key="atlas-alts-box"
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
                aria-label="Close ATLAS alternatives"
                className="sdv-btn absolute right-3 top-3 w-8 h-8 bg-[#E88D48] text-[#3D1603] flex items-center justify-center z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-3 pr-8">
                <div className="w-10 h-10 bg-[#FFEAB8] border-2 border-[#7A3710] flex items-center justify-center shrink-0">
                  <Wine className="w-5 h-5 text-[#9E3C16]" />
                </div>
                <div>
                  <span className="inline-block bg-[#E8A338] border-2 border-[#3D1603] px-2 py-0.5 text-[10px] font-bold text-[#3D1603] uppercase tracking-wider">
                    Plan B Bars
                  </span>
                  <h2
                    id="atlas-alts-title"
                    className="font-pixel-title text-sm sm:text-base text-[#421C09] mt-1.5 leading-snug"
                  >
                    If ATLAS Is Full
                  </h2>
                </div>
              </div>

              <p className="font-pixel-body text-xl leading-snug text-[#5B2308] mb-3.5">
                Three great cocktail spots nearby to head to instead:
              </p>

              <div className="flex flex-col gap-3.5">
                {ATLAS_ALTERNATIVES.map((bar) => (
                  <div
                    key={bar.id}
                    className="bg-[#FFEAB8] border-2 border-[#7A3710] p-3"
                  >
                    {!failedImages[bar.id] && (
                      <button
                        type="button"
                        onClick={() => {
                          playTap();
                          setPreviewImage({ src: bar.imageUrl, alt: bar.name });
                        }}
                        aria-label={`Preview photo of ${bar.name}`}
                        className="mb-2.5 w-full border-2 border-[#5B2308] bg-[#FAD998] overflow-hidden relative group block cursor-zoom-in"
                      >
                        <img
                          src={bar.imageUrl}
                          alt={bar.name}
                          onError={() =>
                            setFailedImages((prev) => ({
                              ...prev,
                              [bar.id]: true,
                            }))
                          }
                          style={{ imageRendering: 'auto' }}
                          className="w-full h-36 object-cover block transition-transform duration-200 group-hover:scale-[1.02]"
                        />
                        <span className="absolute right-2 bottom-2 bg-[#19132B]/75 border border-[#FFF0C4]/60 text-[#FFF0C4] p-1 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider">
                          <Maximize2 className="w-3 h-3" />
                        </span>
                      </button>
                    )}

                    <h3 className="font-pixel-title text-xs sm:text-sm text-[#421C09]">
                      {bar.name}
                    </h3>

                    <p className="font-pixel-body text-lg text-[#7A3710] leading-tight mt-1">
                      {bar.vibe}
                    </p>

                    <div className="mt-2 flex items-start gap-1.5 text-xs font-bold text-[#421C09]">
                      <MapPin className="w-3.5 h-3.5 text-[#B8431D] mt-0.5 shrink-0" />
                      <span>{bar.address}</span>
                    </div>

                    <a
                      href={bar.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playTap()}
                      className="sdv-btn mt-3 w-full bg-[#E8A338] py-2.5 text-[11px] font-bold text-[#3D1603] uppercase tracking-wider inline-flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open in Google Maps
                    </a>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  playTap();
                  onClose();
                }}
                className="sdv-btn mt-4 w-full bg-[#5FA848] py-3 text-xs font-bold text-white uppercase tracking-wider"
              >
                Back to Quest Board
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <ImagePreviewModal
        src={previewImage?.src ?? null}
        alt={previewImage?.alt ?? ''}
        onClose={() => setPreviewImage(null)}
      />
    </AnimatePresence>
  );
}

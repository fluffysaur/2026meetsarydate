import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { playTap } from '../utils/sound';
import { useScrollLock } from '../hooks/useScrollLock';

interface ImagePreviewModalProps {
  src: string | null;
  alt: string;
  onClose: () => void;
}

export function ImagePreviewModal({
  src,
  alt,
  onClose,
}: ImagePreviewModalProps) {
  useScrollLock(Boolean(src));

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          key="image-preview-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#19132B]/90 backdrop-blur-[3px] p-4"
          onClick={() => {
            playTap();
            onClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo preview of ${alt}`}
        >
          <motion.div
            key="image-preview-box"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="relative max-w-2xl w-full sdv-wood-panel p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sdv-parchment p-2 relative">
              <button
                type="button"
                onClick={() => {
                  playTap();
                  onClose();
                }}
                aria-label="Close photo preview"
                className="sdv-btn absolute right-3 top-3 w-8 h-8 bg-[#E88D48] text-[#3D1603] flex items-center justify-center z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="border-2 border-[#5B2308] bg-[#19132B] overflow-hidden flex items-center justify-center">
                <img
                  src={src}
                  alt={alt}
                  style={{ imageRendering: 'auto' }}
                  className="max-h-[78dvh] w-full object-contain block"
                />
              </div>

              <p className="mt-2 text-center font-pixel-title text-[11px] text-[#421C09] truncate px-2">
                {alt}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

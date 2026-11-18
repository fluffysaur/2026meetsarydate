import { motion } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { PixelHeart, PixelJunimo } from './PixelSprites';
import { ensureMusicStarted, playTap } from '../utils/sound';

interface TitleScreenProps {
  hasProgress: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onStart: () => void;
}

export function TitleScreen({
  hasProgress,
  muted,
  onToggleMute,
  onStart,
}: TitleScreenProps) {
  const handleStart = () => {
    playTap();
    ensureMusicStarted();
    onStart();
  };

  return (
    <motion.div
      key="title-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className="relative z-10 min-h-[100dvh] flex flex-col justify-between px-4 py-6"
    >
      {/* Top Sound Toggle */}
      <div className="w-full max-w-md mx-auto flex justify-end">
        <button
          type="button"
          onClick={onToggleMute}
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

      {/* Center Stardew Signboard */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="sdv-wood-panel p-2.5"
        >
          <div className="sdv-parchment px-5 py-7 text-center">
            {/* Bobbing Junimo Trio */}
            <div className="flex items-end justify-center gap-3 mb-4">
              <div className="animate-junimo" style={{ animationDelay: '0s' }}>
                <PixelJunimo color="green" className="w-9 h-9" />
              </div>
              <div
                className="animate-junimo"
                style={{ animationDelay: '0.3s' }}
              >
                <PixelJunimo color="rose" className="w-11 h-11" />
              </div>
              <div
                className="animate-junimo"
                style={{ animationDelay: '0.6s' }}
              >
                <PixelJunimo color="gold" className="w-9 h-9" />
              </div>
            </div>

            <h1 className="font-pixel-title text-lg sm:text-xl leading-relaxed text-[#421C09] drop-shadow-[0_2px_0_#FFF0C4]">
              Bobo &amp; Bubba 2026 Meetsary
            </h1>

            <p className="mt-3 font-pixel-body text-2xl text-[#9E3C16] leading-tight">
              A Date Night Dinner Quest for Bubba
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 bg-[#FFEAB8] border-2 border-[#7A3710] px-3 py-1 text-[11px] font-bold text-[#421C09]">
              <PixelHeart className="w-3.5 h-3.5" />
              Near ATLAS Bar in Bugis
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              className="sdv-btn mt-7 w-full bg-[#5FA848] py-4 font-pixel-title text-xs sm:text-sm text-white uppercase tracking-wider"
            >
              {hasProgress ? 'Continue Quest >' : 'Start Quest >'}
            </motion.button>
          </div>
        </motion.div>
      </div>

      <p className="text-center font-pixel-body text-lg text-[#FFF0C4]/85 drop-shadow-[0_1px_0_#19132B]">
        Tap to begin with music &amp; sound
      </p>
    </motion.div>
  );
}

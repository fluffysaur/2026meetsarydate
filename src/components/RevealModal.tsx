import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MapPin, Sparkles, Utensils, X } from 'lucide-react';
import type { RestaurantInfo } from '../data/restaurants';

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
  useEffect(() => {
    if (!restaurant || !celebrate) return;

    const colors = ['#C85A43', '#D9777F', '#D49B38', '#5A8F6B', '#F7ECE6'];
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });

    const timer = window.setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.65 },
        colors,
      });
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.65 },
        colors,
      });
    }, 240);

    return () => window.clearTimeout(timer);
  }, [restaurant, celebrate]);

  if (!restaurant) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#2D221E]/45 backdrop-blur-xs p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reveal-title"
    >
      <div
        className="w-full max-w-md rounded-3xl bg-[#FDF8F4] border border-[#EAD9CF] p-6 shadow-2xl animate-pop-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reveal"
          className="absolute right-4 top-4 w-9 h-9 rounded-full bg-[#F7ECE6] text-[#7C665E] flex items-center justify-center hover:bg-[#EFE0D7] active:scale-95 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F7ECE6] px-3 py-1 text-xs font-semibold text-[#C85A43] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Dinner Option {restaurant.puzzleNumber} Unlocked
        </div>

        <h2
          id="reveal-title"
          className="font-serif text-3xl font-semibold text-[#2D221E] tracking-tight"
        >
          {restaurant.restaurantName}
        </h2>

        <p className="mt-1 text-sm font-medium text-[#C85A43] flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 shrink-0" />
          {restaurant.cuisine}
        </p>

        <p className="mt-4 text-sm leading-relaxed text-[#54433D]">
          {restaurant.description}
        </p>

        <div className="mt-4 rounded-2xl bg-[#F7ECE6]/90 border border-[#EAD9CF] p-4">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#C85A43] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7C665E]">
                Location &amp; Directions
              </p>
              <p className="text-sm font-semibold text-[#2D221E] mt-0.5">
                {restaurant.location}
              </p>
              <p className="text-xs text-[#7C665E] mt-1 leading-relaxed">
                {restaurant.directionsHint}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-[#C85A43] py-3.5 text-sm font-semibold text-white shadow-sm active:scale-[0.98] transition"
        >
          Back to Dinner Quest
        </button>
      </div>
    </div>
  );
}

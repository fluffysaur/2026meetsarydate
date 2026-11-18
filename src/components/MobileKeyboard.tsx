import { useEffect } from 'react';
import { Delete } from 'lucide-react';
import { playTap } from '../utils/sound';

export type KeyState = 'correct' | 'present' | 'absent' | 'default';

interface MobileKeyboardProps {
  onKey: (letter: string) => void;
  onBackspace: () => void;
  onEnter?: () => void;
  enterLabel?: string;
  keyStates?: Record<string, KeyState>;
  disabled?: boolean;
}

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const KEY_STYLES: Record<KeyState, string> = {
  correct: 'bg-[#5FA848] text-white',
  present: 'bg-[#E8A338] text-[#3D1603]',
  absent: 'bg-[#9E8774] text-[#F5E6D3]',
  default: 'bg-[#FAD998] text-[#421C09]',
};

export function MobileKeyboard({
  onKey,
  onBackspace,
  onEnter,
  enterLabel = 'ENTER',
  keyStates = {},
  disabled = false,
}: MobileKeyboardProps) {
  useEffect(() => {
    if (disabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        playTap();
        onBackspace();
      } else if (e.key === 'Enter' && onEnter) {
        e.preventDefault();
        playTap();
        onEnter();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        playTap();
        onKey(e.key.toUpperCase());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onKey, onBackspace, onEnter]);

  return (
    <div
      className="w-full max-w-md mx-auto select-none touch-manipulation px-1.5 pb-2 pt-1.5"
      aria-label="On-screen keyboard"
    >
      <div className="flex flex-col gap-1.5">
        {ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1">
            {rowIdx === 2 && onEnter && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  playTap();
                  onEnter();
                }}
                className="sdv-btn flex items-center justify-center bg-[#E88D48] px-2 min-h-[44px] text-[10px] font-bold tracking-wider text-[#3D1603] disabled:opacity-50"
              >
                {enterLabel}
              </button>
            )}

            {row.map((letter) => {
              const state = keyStates[letter] ?? 'default';
              return (
                <button
                  key={letter}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    playTap();
                    onKey(letter);
                  }}
                  className={`sdv-btn flex-1 max-w-[36px] min-h-[44px] text-sm font-bold flex items-center justify-center disabled:opacity-50 ${KEY_STYLES[state]}`}
                >
                  {letter}
                </button>
              );
            })}

            {rowIdx === 2 && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  playTap();
                  onBackspace();
                }}
                aria-label="Backspace"
                className="sdv-btn flex items-center justify-center bg-[#E8B878] px-2.5 min-h-[44px] text-[#3D1603] disabled:opacity-50"
              >
                <Delete className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

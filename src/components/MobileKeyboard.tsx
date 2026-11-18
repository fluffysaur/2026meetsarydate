import { useEffect } from 'react';
import { Delete } from 'lucide-react';

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
  correct: 'bg-[#5A8F6B] text-white border-[#4B7B5A]',
  present: 'bg-[#D49B38] text-white border-[#BC862B]',
  absent: 'bg-[#CFC5BE] text-[#6B5D57] border-[#BFB3AB]',
  default:
    'bg-white text-[#2D221E] border-[#E8DCD4] active:bg-[#F7ECE6] shadow-[0_1px_0_#E2D4CB]',
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
        onBackspace();
      } else if (e.key === 'Enter' && onEnter) {
        e.preventDefault();
        onEnter();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        onKey(e.key.toUpperCase());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onKey, onBackspace, onEnter]);

  return (
    <div
      className="w-full max-w-md mx-auto select-none touch-manipulation px-1.5 pb-2 pt-1"
      aria-label="On-screen keyboard"
    >
      <div className="flex flex-col gap-1.5">
        {ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1">
            {rowIdx === 2 && onEnter && (
              <button
                type="button"
                disabled={disabled}
                onClick={onEnter}
                className="flex items-center justify-center rounded-lg border border-[#D8B8AC] bg-[#F7ECE6] px-2.5 min-h-[46px] text-[11px] font-bold tracking-wider text-[#2D221E] active:scale-95 transition-transform disabled:opacity-50"
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
                  onClick={() => onKey(letter)}
                  className={`flex-1 max-w-[38px] min-h-[46px] rounded-lg border text-sm font-bold flex items-center justify-center active:scale-95 transition-all disabled:opacity-50 ${KEY_STYLES[state]}`}
                >
                  {letter}
                </button>
              );
            })}

            {rowIdx === 2 && (
              <button
                type="button"
                disabled={disabled}
                onClick={onBackspace}
                aria-label="Backspace"
                className="flex items-center justify-center rounded-lg border border-[#E8DCD4] bg-[#F2E7E0] px-3 min-h-[46px] text-[#2D221E] active:scale-95 transition-transform disabled:opacity-50"
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

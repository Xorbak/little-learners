import { useRef, useState } from 'react';

/**
 * Parent gate: must be held for a few seconds, which a toddler won't do by accident.
 */
export function HoldButton({ onHeld, seconds = 3 }: { onHeld: () => void; seconds?: number }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const start = () => {
    setHolding(true);
    timer.current = window.setTimeout(() => {
      setHolding(false);
      onHeld();
    }, seconds * 1000);
  };
  const cancel = () => {
    setHolding(false);
    window.clearTimeout(timer.current);
  };

  return (
    <button
      type="button"
      className={`hold-btn ${holding ? 'hold-btn--holding' : ''}`}
      style={{ ['--hold' as string]: `${seconds}s` }}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={`Grown-ups: hold for ${seconds} seconds`}
    >
      <svg viewBox="0 0 36 36" className="hold-ring" aria-hidden="true">
        <circle cx="18" cy="18" r="16" />
      </svg>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className="hold-icon">
        <path
          d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1L15 3.5h-4L10.6 6a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.4zM13 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}

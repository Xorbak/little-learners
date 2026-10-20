import { useEffect, useRef } from 'react';
import { fx } from '../fx';

/**
 * Confetti and bouncing stars. `big` for finishing a whole level.
 * Confetti rains on the shared particle canvas; the stars spring in and
 * each one throws out a little burst of sparkles as it lands.
 */
export function Celebration({ big = false }: { big?: boolean }) {
  const starsRef = useRef<HTMLDivElement>(null);
  const count = big ? 5 : 3;

  useEffect(() => {
    fx.rain(big ? 90 : 45);
    const timers = Array.from(starsRef.current?.children ?? []).map((el, i) =>
      window.setTimeout(() => fx.burstAt(el, 'sparkles', { count: 5, colour: '#fff3bf', power: 1.2 }), 280 + i * 120),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [big]);

  return (
    <div className="celebration" aria-hidden="true">
      <div className="celebration-stars" ref={starsRef}>
        {Array.from({ length: count }, (_, i) => (
          <svg key={i} viewBox="0 0 24 24" className="star" style={{ animationDelay: `${i * 0.12}s` }}>
            <path
              d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2l-5.9 3.2 1.3-6.5L2.5 9.3l6.6-.8z"
              fill="#ffd43b"
              stroke="#f08c00"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </div>
    </div>
  );
}

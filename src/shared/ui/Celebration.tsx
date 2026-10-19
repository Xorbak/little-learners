import { useState } from 'react';
import type { CSSProperties } from 'react';

const COLOURS = ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#b197fc', '#ffa94d', '#f783ac'];

/** Confetti and bouncing stars. `big` for finishing a whole level. */
export function Celebration({ big = false }: { big?: boolean }) {
  const [pieces] = useState(() =>
      Array.from({ length: big ? 70 : 36 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.6 + Math.random() * 1.4,
        colour: COLOURS[i % COLOURS.length],
        spin: Math.random() * 720 - 360,
        round: i % 3 === 0,
      })),
  );

  return (
    <div className="celebration" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={`confetti ${p.round ? 'confetti--round' : ''}`}
          style={
            {
              left: `${p.left}%`,
              background: p.colour,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              '--spin': `${p.spin}deg`,
            } as CSSProperties
          }
        />
      ))}
      <div className="celebration-stars">
        {Array.from({ length: big ? 5 : 3 }, (_, i) => (
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

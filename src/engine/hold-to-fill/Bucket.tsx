import type { CSSProperties } from 'react';

export type BucketMood = 'happy' | 'shout' | 'proud' | 'splash' | 'oops' | 'tip';

/** The paint bucket, with a face that reacts. `level` is 0 (empty) to 1 (full). */
export function Bucket({ level, colour, mood, halfLine }: { level: number; colour: string; mood: BucketMood; halfLine: boolean }) {
  // The inside of the bucket runs from y=46 (rim) to y=186 (bottom)
  const top = 46;
  const bottom = 186;
  const paintY = bottom - (bottom - top) * level;

  return (
    <div className={`bucket bucket--${mood}`}>
      <svg viewBox="0 0 200 210" width="100%" height="100%" aria-hidden="true">
        <defs>
          <clipPath id="bucket-inside">
            <path d="M28 46 L172 46 L156 186 Q100 196 44 186 Z" />
          </clipPath>
        </defs>

        {/* handle */}
        <path d="M30 50 Q100 -20 170 50" stroke="#868e96" strokeWidth="7" fill="none" strokeLinecap="round" />

        {/* bucket body */}
        <path d="M28 46 L172 46 L156 186 Q100 196 44 186 Z" fill="#e9ecef" stroke="#adb5bd" strokeWidth="5" strokeLinejoin="round" />

        {/* paint, with a gently wavy surface */}
        <g clipPath="url(#bucket-inside)">
          <path
            className="bucket-paint"
            d={`M0 ${paintY} q25 -6 50 0 t50 0 t50 0 t50 0 V210 H0 Z`}
            fill={colour}
            style={{ transition: 'fill 0.3s' }}
          />
        </g>

        {/* halfway line */}
        {halfLine && (
          <g>
            <line x1="34" y1="116" x2="166" y2="116" stroke="#2b2d42" strokeWidth="4" strokeDasharray="10 7" strokeLinecap="round" />
            <text x="176" y="124" fontSize="24">⭐</text>
          </g>
        )}

        {/* rim */}
        <rect x="20" y="38" width="160" height="14" rx="7" fill="#ced4da" stroke="#adb5bd" strokeWidth="4" />

        {/* face, drawn over the paint so it's always visible */}
        <g className="bucket-face">
          <circle cx="78" cy="132" r="15" fill="#fff" />
          <circle cx="122" cy="132" r="15" fill="#fff" />
          <circle cx="78" cy={mood === 'shout' ? 130 : 135} r={mood === 'shout' ? 9 : 7} fill="#2b2d42" />
          <circle cx="122" cy={mood === 'shout' ? 130 : 135} r={mood === 'shout' ? 9 : 7} fill="#2b2d42" />
          {mood === 'shout' || mood === 'splash' || mood === 'oops' ? (
            <ellipse cx="100" cy="166" rx="12" ry="14" fill="#2b2d42" />
          ) : (
            <path
              d={mood === 'proud' ? 'M80 158 Q100 182 120 158 Z' : 'M84 160 Q100 172 116 160'}
              stroke="#2b2d42"
              strokeWidth="5"
              fill={mood === 'proud' ? '#2b2d42' : 'none'}
              strokeLinecap="round"
            />
          )}
        </g>
      </svg>
      {mood === 'splash' && (
        <span className="bucket-splash" aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className="bucket-drop" style={{ background: colour, '--a': `${-80 + i * 18}deg` } as CSSProperties} />
          ))}
        </span>
      )}
    </div>
  );
}

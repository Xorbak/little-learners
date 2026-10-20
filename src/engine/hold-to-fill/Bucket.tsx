import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { fx } from '../../shared/fx';

export type BucketMood = 'happy' | 'shout' | 'proud' | 'splash' | 'oops' | 'tip';

// The inside of the bucket runs from y=46 (rim) to y=186 (bottom)
const TOP = 46;
const BOTTOM = 186;
const INSIDE = 'M28 46 L172 46 L156 186 Q100 196 44 186 Z';

/** A wavy surface (wavelength 50) from x=-100 to x=300, filled down to the bottom */
const wave = (y: number, amp: number) => {
  let d = `M-100 ${y.toFixed(1)} q12.5 ${-amp} 25 0`;
  for (let x = -75; x < 300; x += 25) d += ` t25 0`;
  return `${d} V212 H-100 Z`;
};

/** Paint's y position for a fill level (0 empty – 1 full) */
export const paintYFor = (level: number) => BOTTOM - (BOTTOM - TOP) * level;

/**
 * The paint bucket, with a face that reacts. `level` is 0 (empty) to 1 (full).
 * It has weight (sinks and squashes as it fills), sloshes when pouring starts or
 * stops or when it slides to a new pipe, and splashes, drips and tips out.
 * `incoming`: the colour pouring in while mixing, swirled into the paint.
 */
export function Bucket({
  level,
  colour,
  mood,
  halfLine,
  pouring = false,
  at = 0,
  incoming = null,
}: {
  level: number;
  colour: string;
  mood: BucketMood;
  halfLine: boolean;
  pouring?: boolean;
  at?: number;
  incoming?: string | null;
}) {
  const paintY = paintYFor(level);
  const rootRef = useRef<HTMLDivElement>(null);
  const leanRef = useRef<HTMLDivElement>(null);

  // Slosh: restart the slosh animation whenever pouring starts/stops or the bucket moves
  const [slosh, setSlosh] = useState(0);
  const prev = useRef({ pouring, at });
  useEffect(() => {
    const p = prev.current;
    if (p.at !== at) {
      // Follow-through: it leans back as it slides, then swings past and settles
      const dir = at > p.at ? 1 : -1;
      leanRef.current?.animate(
        [
          { transform: 'rotate(0)' },
          { transform: `rotate(${-dir * 9}deg)`, offset: 0.25 },
          { transform: `rotate(${dir * 6}deg)`, offset: 0.55 },
          { transform: `rotate(${-dir * 2.5}deg)`, offset: 0.8 },
          { transform: 'rotate(0)' },
        ],
        { duration: 700, easing: 'ease-out' },
      );
    }
    if (p.at !== at || p.pouring !== pouring) setSlosh((s) => s + 1);
    prev.current = { pouring, at };
  }, [pouring, at]);

  // Mixing: show the incoming colour swirling round, then fading into the mix
  const [swirl, setSwirl] = useState<{ colour: string; on: boolean; key: number } | null>(null);
  useEffect(() => {
    if (incoming) setSwirl((s) => ({ colour: incoming, on: true, key: (s?.key ?? 0) + (s?.on && s.colour === incoming ? 0 : 1) }));
    else setSwirl((s) => (s ? { ...s, on: false } : s));
  }, [incoming]);

  // Big moments: shake, splash particles, haptics
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const rimY = r.top + r.height * (TOP / 210);
    if (mood === 'shout') fx.shake(0.4);
    if (mood === 'splash') {
      fx.burst(r.left + r.width / 2, rimY, 'droplets', { colour, count: 26, power: 1.4, angle: -90, spread: 160 });
      fx.burst(r.left + r.width * 0.2, rimY, 'droplets', { colour, count: 8, angle: -120, spread: 60 });
      fx.burst(r.left + r.width * 0.8, rimY, 'droplets', { colour, count: 8, angle: -60, spread: 60 });
      fx.shake(1.6);
      fx.haptic([30, 40, 30]);
    }
    if (mood === 'oops') {
      fx.burst(r.left + r.width / 2, r.top + r.height * (paintYFor(0.15) / 210), 'droplets', { colour, count: 10, power: 0.7 });
    }
    if (mood === 'tip') {
      window.setTimeout(() => {
        const b = rootRef.current?.getBoundingClientRect();
        if (b) fx.burst(b.left - b.width * 0.15, b.bottom - 6, 'droplets', { colour, count: 14, power: 0.8, angle: -100, spread: 120 });
      }, 380);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood]);

  const shake = mood === 'shout' ? 1 + Math.max(0, level - 0.6) * 6 : 1;
  // Weight: sinks a little and squashes as it fills
  const weight = `translateY(${(level * 2.5).toFixed(2)}%) scale(${(1 + level * 0.035).toFixed(3)}, ${(1 - level * 0.045).toFixed(3)})`;
  const spiral = swirlPath(100, (paintY + BOTTOM) / 2, Math.max(8, (BOTTOM - paintY) * 0.45));

  return (
    <div ref={rootRef} className="bucket-wrap">
      {mood === 'tip' && <span className="bucket-puddle" style={{ background: colour }} aria-hidden="true" />}
    <div className={`bucket bucket--${mood}`} style={{ '--shake': shake.toFixed(2) } as CSSProperties}>
      <div ref={leanRef} className="bucket-lean">
        <div className="bucket-weight" style={{ transform: weight }}>
          <svg viewBox="0 0 200 210" width="100%" height="100%" aria-hidden="true" overflow="visible">
            <defs>
              <clipPath id="bucket-inside">
                <path d={INSIDE} />
              </clipPath>
            </defs>

            {/* handle */}
            <path d="M30 50 Q100 -20 170 50" stroke="#868e96" strokeWidth="7" fill="none" strokeLinecap="round" />

            {/* bucket body */}
            <path d={INSIDE} fill="#e9ecef" stroke="#adb5bd" strokeWidth="5" strokeLinejoin="round" />

            {/* paint: two wavy layers that drift, sloshing as a whole */}
            {level > 0.002 && (
              <g clipPath="url(#bucket-inside)">
                <g key={slosh} className={slosh ? 'bucket-slosh' : ''} style={{ transformOrigin: `100px ${paintY}px` }}>
                  <path className="bucket-wave bucket-wave--back" d={wave(paintY - 1.5, pouring ? 5 : 3)} fill={colour} />
                  <path className="bucket-wave bucket-wave--back-tint" d={wave(paintY - 1.5, pouring ? 5 : 3)} fill="#fff" opacity="0.28" />
                  <path className="bucket-wave" d={wave(paintY + 1.5, pouring ? 4 : 2.5)} fill={colour} style={{ transition: 'fill 0.3s' }} />
                  {swirl && (
                    <g key={swirl.key} className={`bucket-swirl ${swirl.on ? '' : 'bucket-swirl--fade'}`} style={{ transformOrigin: `100px ${(paintY + BOTTOM) / 2}px` }}>
                      <path d={spiral} fill="none" stroke={swirl.colour} strokeWidth="7" strokeLinecap="round" strokeOpacity="0.8" />
                    </g>
                  )}
                  <path d={`M40 ${paintY + 9} Q70 ${paintY + 5} 95 ${paintY + 9}`} stroke="#fff" strokeOpacity="0.45" strokeWidth="4" fill="none" strokeLinecap="round" />
                </g>
              </g>
            )}

            {/* halfway line */}
            {halfLine && (
              <g>
                <line x1="34" y1="116" x2="166" y2="116" stroke="#2b2d42" strokeWidth="4" strokeDasharray="10 7" strokeLinecap="round" />
                <text x="176" y="124" fontSize="24">⭐</text>
              </g>
            )}

            {/* rim */}
            <rect x="20" y="38" width="160" height="14" rx="7" fill="#ced4da" stroke="#adb5bd" strokeWidth="4" />

            {/* overflow: paint dripping down the sides */}
            {mood === 'splash' && (
              <g className="bucket-drips">
                {[
                  [24, 1, 110, 0],
                  [27, 1, 60, 0.1],
                  [176, -1, 90, 0.05],
                  [173, -1, 45, 0.14],
                ].map(([x, side, len, delay]) => (
                  <path
                    key={x}
                    d={`M${x} 48 L${x + side * len * 0.11} ${48 + len}`}
                    pathLength={1}
                    stroke={colour}
                    strokeWidth="11"
                    strokeLinecap="round"
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
                <path d="M22 45 H178" stroke={colour} strokeWidth="12" strokeLinecap="round" />
              </g>
            )}

            {/* face, drawn over the paint so it's always visible; it blinks */}
            <g className="bucket-face">
              <g className="bucket-eyes">
                <circle cx="78" cy="132" r="15" fill="#fff" />
                <circle cx="122" cy="132" r="15" fill="#fff" />
                <circle cx="78" cy={mood === 'shout' ? 130 : 135} r={mood === 'shout' ? 9 : 7} fill="#2b2d42" />
                <circle cx="122" cy={mood === 'shout' ? 130 : 135} r={mood === 'shout' ? 9 : 7} fill="#2b2d42" />
              </g>
              {mood === 'shout' || mood === 'splash' || mood === 'oops' ? (
                <ellipse className="bucket-mouth--shout" cx="100" cy="166" rx="12" ry="14" fill="#2b2d42" />
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
        </div>
      </div>
    </div>
    </div>
  );
}

/** An Archimedean spiral (two turns) centred at (cx, cy) */
function swirlPath(cx: number, cy: number, r: number) {
  let d = '';
  const turns = 2.2;
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    const rr = r * t;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr * 1.5).toFixed(1)} ${(cy + Math.sin(a) * rr * 0.7).toFixed(1)} `;
  }
  return d;
}

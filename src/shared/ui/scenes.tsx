import type { CSSProperties, ReactNode } from 'react';
import './scenes.css';

/**
 * Little drawings for questions (Pick It) and faces (Match It): hands showing
 * fingers, a table and a box to put things on/under/in, pencils, towers, glasses,
 * a balance, a sweet jar. All drawn in code so they scale to any size.
 */

/** Skin tones, so the hands (and people) in the app look like lots of different children */
export const SKIN = ['#f1c27d', '#c68642', '#8d5524', '#e0ac69', '#ffdbac', '#a0662f'];

/** A picture made of an emoji */
export function Pic({ e, size, scale = 1, style }: { e: string; size: number; scale?: number; style?: CSSProperties }) {
  return (
    <span className="pic" style={{ fontSize: size * 0.72 * scale, ...style }} aria-hidden="true">
      {e}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Fingers
// ---------------------------------------------------------------------------
/** Order fingers go up when counting: index, middle, ring, little finger, thumb */
const FINGERS = [
  { x: 33, w: 11 },
  { x: 46, w: 11.5 },
  { x: 59, w: 11 },
  { x: 71, w: 9.5 },
];

/** One hand with `up` fingers held up (0–5). `lit`: how many of them are being counted. */
function Hand({ up, tone, lit = 0, mirror }: { up: number; tone: string; lit?: number; mirror?: boolean }) {
  const line = 'rgba(0,0,0,0.28)';
  const glow = (i: number) => (i < lit ? '#ffd43b' : tone);
  return (
    <svg viewBox="0 0 100 120" className="hand" style={{ transform: mirror ? 'scaleX(-1)' : undefined }} aria-hidden="true">
      {FINGERS.map((f, i) => {
        const isUp = i < up;
        const top = isUp ? (i === 1 ? 6 : i === 3 ? 22 : 12) : 52;
        return <rect key={i} x={f.x - f.w / 2} y={top} width={f.w} height={70 - top} rx={f.w / 2} fill={glow(i)} stroke={line} strokeWidth="1.6" />;
      })}
      {/* Thumb: out to the side when up, folded across the palm when down */}
      {up >= 5 && <rect x="19" y="56" width="13" height="44" rx="6.5" fill={glow(4)} stroke={line} strokeWidth="1.6" transform="rotate(-36 26 98)" />}
      <rect x="24" y="58" width="56" height="54" rx="20" fill={tone} stroke={line} strokeWidth="1.6" />
      {/* Folded thumb: across the palm */}
      {up < 5 && (
        <>
          <path d="M 27 96 Q 36 80 54 82" fill="none" stroke={line} strokeWidth="13" strokeLinecap="round" />
          <path d="M 27 96 Q 36 80 54 82" fill="none" stroke={tone} strokeWidth="10" strokeLinecap="round" />
        </>
      )}
      {/* Folded fingers show their knuckles */}
      {FINGERS.map((f, i) => (i >= up ? <path key={i} d={`M ${f.x - f.w / 2 + 1} 62 q ${f.w / 2 - 1} 5 ${f.w - 2} 0`} fill="none" stroke={line} strokeWidth="1.4" /> : null))}
    </svg>
  );
}

/** n fingers (0–10): one hand up to five, two hands after that */
export function Fingers({ n, size, tone = SKIN[0], counting = 0 }: { n: number; size: number; tone?: string; counting?: number }) {
  const two = n > 5;
  return (
    <span className="fingers" style={{ width: size, height: size }} aria-hidden="true">
      {two ? (
        <>
          <span style={{ width: size * 0.5, height: size * 0.62 }}>
            <Hand up={5} tone={tone} lit={Math.min(5, counting)} mirror />
          </span>
          <span style={{ width: size * 0.5, height: size * 0.62 }}>
            <Hand up={n - 5} tone={tone} lit={Math.max(0, counting - 5)} />
          </span>
        </>
      ) : (
        <span style={{ width: size * 0.78, height: size * 0.9 }}>
          <Hand up={n} tone={tone} lit={counting} />
        </span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Where is it? A thing on, under, next to a table; in, behind, in front of a box
// ---------------------------------------------------------------------------
export type Place = 'on' | 'under' | 'next-to' | 'in' | 'behind' | 'in-front';

function Table() {
  return (
    <svg viewBox="0 0 100 100" className="scene-layer" aria-hidden="true">
      <rect x="2" y="93" width="96" height="3" rx="1.5" fill="rgba(0,0,0,0.12)" />
      <rect x="26" y="54" width="6" height="40" rx="2" fill="#a0522d" />
      <rect x="68" y="54" width="6" height="40" rx="2" fill="#a0522d" />
      <rect x="18" y="47" width="64" height="9" rx="3" fill="#c0703a" stroke="#8b4513" strokeWidth="1.2" />
    </svg>
  );
}

function Box({ open, tall }: { open?: boolean; tall?: boolean }) {
  const top = tall ? 44 : 56;
  return (
    <svg viewBox="0 0 100 100" className="scene-layer" aria-hidden="true">
      <rect x="2" y="93" width="96" height="3" rx="1.5" fill="rgba(0,0,0,0.12)" />
      {open && (
        <>
          <path d={`M 24 ${top} L 10 ${top - 12} L 30 ${top - 14} L 38 ${top} Z`} fill="#d8b07a" stroke="#9c6b30" strokeWidth="1.2" />
          <path d={`M 76 ${top} L 90 ${top - 12} L 70 ${top - 14} L 62 ${top} Z`} fill="#d8b07a" stroke="#9c6b30" strokeWidth="1.2" />
        </>
      )}
      <rect x="22" y={top} width="56" height={94 - top} rx="2" fill="#c8995a" stroke="#9c6b30" strokeWidth="1.4" />
      {!open && <line x1="22" y1={top + 7} x2="78" y2={top + 7} stroke="#9c6b30" strokeWidth="1.2" />}
      <rect x="44" y={top} width="12" height={94 - top} fill="rgba(255,255,255,0.18)" />
    </svg>
  );
}

/** Where things sit (centre, as % of the picture), and whether the table/box is drawn over them */
const SPOT: Record<Place, { x: number; y: number; scale: number; under?: boolean }> = {
  on: { x: 50, y: 33, scale: 1 },
  under: { x: 50, y: 78, scale: 0.85 },
  'next-to': { x: 88, y: 79, scale: 0.85 },
  in: { x: 50, y: 50, scale: 0.95, under: true },
  behind: { x: 66, y: 38, scale: 0.9, under: true },
  'in-front': { x: 48, y: 82, scale: 1.05 },
};

export function PlaceScene({ place, thing, size }: { place: Place; thing: string; size: number }) {
  const spot = SPOT[place];
  const box = place === 'in' || place === 'behind' || place === 'in-front';
  const t = (
    <span className="scene-thing" style={{ left: `${spot.x}%`, top: `${spot.y}%`, fontSize: size * 0.26 * spot.scale, zIndex: spot.under ? 0 : 2 }}>
      {thing}
    </span>
  );
  return (
    <span className="scene" style={{ width: size, height: size }} aria-hidden="true">
      {spot.under && t}
      <span className="scene-layer-wrap">{box ? <Box open={place === 'in'} tall={place === 'behind'} /> : <Table />}</span>
      {!spot.under && t}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Bigger or smaller: pencils (long/short), towers (tall/short), glasses (full/empty), a balance (heavy/light)
// ---------------------------------------------------------------------------
export function Pencil({ length, size, colour = '#fcc419' }: { length: number; size: number; colour?: string }) {
  const w = size * length;
  return (
    <svg viewBox="0 0 100 20" preserveAspectRatio="none" style={{ width: w, height: size * 0.16 }} aria-hidden="true">
      <rect x="0" y="3" width="10" height="14" rx="3" fill="#f783ac" />
      <rect x="9" y="3" width="4" height="14" fill="#adb5bd" />
      <rect x="13" y="3" width="70" height="14" fill={colour} />
      <rect x="13" y="8.5" width="70" height="3" fill="rgba(0,0,0,0.08)" />
      <path d="M 83 3 L 100 10 L 83 17 Z" fill="#ffe8cc" />
      <path d="M 95 8 L 100 10 L 95 12 Z" fill="#495057" />
    </svg>
  );
}

const BLOCKS = ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#b197fc', '#ffa94d', '#f06595', '#38d9a9', '#ff8787', '#74c0fc'];
export function Tower({ n, size, from = 0 }: { n: number; size: number; from?: number }) {
  const block = size / 9;
  return (
    <span className="tower" style={{ height: size, width: block * 2.2 }} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="tower-block" style={{ width: block * 2, height: block, background: BLOCKS[(i + from) % BLOCKS.length] }} />
      ))}
    </span>
  );
}

export function Glass({ level, size, drink = '#74c0fc' }: { level: number; size: number; drink?: string }) {
  const top = 12 + (1 - level) * 78;
  return (
    <svg viewBox="0 0 100 100" style={{ width: size * 0.7, height: size * 0.9 }} aria-hidden="true">
      <defs>
        <clipPath id="glass-inside">
          <path d="M 22 10 L 30 92 L 70 92 L 78 10 Z" />
        </clipPath>
      </defs>
      {level > 0 && <rect x="0" y={top} width="100" height={100 - top} fill={drink} clipPath="url(#glass-inside)" />}
      {level > 0 && <rect x="0" y={top} width="100" height="3" fill="rgba(255,255,255,0.5)" clipPath="url(#glass-inside)" />}
      <path d="M 22 10 L 30 92 L 70 92 L 78 10" fill="rgba(255,255,255,0.25)" stroke="#868e96" strokeWidth="3" strokeLinejoin="round" />
      <path d="M 32 18 L 37 80" stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** A see-saw balance with two things; it tips down on the heavier side */
export function Balance({ left, right, heavier, width, height }: { left: string; right: string; heavier: 'left' | 'right'; width: number; height: number }) {
  const s = Math.min(width, height * 1.3);
  const tilt = heavier === 'left' ? -14 : 14;
  return (
    <span className="balance" style={{ width: s, height: s * 0.75 }} aria-hidden="true">
      <span className="balance-beam" style={{ transform: `rotate(${tilt}deg)` }}>
        <span className="balance-thing" style={{ left: '4%', fontSize: s * 0.2 }}>
          {left}
        </span>
        <span className="balance-thing" style={{ right: '4%', fontSize: s * 0.2 }}>
          {right}
        </span>
      </span>
      <span className="balance-stand" />
    </span>
  );
}

// ---------------------------------------------------------------------------
// The sweet jar (guess then count)
// ---------------------------------------------------------------------------
/** Spots inside the jar (fractions), made up once so the sweets don't jump around */
const JAR_SPOTS: [number, number][] = Array.from({ length: 24 }, (_, i) => {
  const row = Math.floor(i / 4);
  const col = i % 4;
  return [0.24 + col * 0.17 + (row % 2) * 0.06 + ((i * 37) % 7) / 140, 0.8 - row * 0.105 + ((i * 53) % 5) / 160];
});

export function Jar({ n, size, sweet = '🍬', covered }: { n: number; size: number; sweet?: string; covered?: boolean }) {
  return (
    <span className="jar" style={{ width: size * 0.8, height: size }} aria-hidden="true">
      <svg viewBox="0 0 80 100" className="scene-layer">
        <rect x="18" y="4" width="44" height="10" rx="3" fill="#e64980" />
        <path d="M 14 18 Q 10 22 10 32 L 10 88 Q 10 96 18 96 L 62 96 Q 70 96 70 88 L 70 32 Q 70 22 66 18 Z" fill="rgba(208,235,255,0.55)" stroke="#74c0fc" strokeWidth="2.5" />
      </svg>
      {JAR_SPOTS.slice(0, n).map(([x, y], i) => (
        <span key={i} className="jar-sweet" style={{ left: `${x * 100}%`, top: `${y * 100}%`, fontSize: size * 0.13 }}>
          {sweet}
        </span>
      ))}
      <span className={`jar-cloth ${covered ? 'jar-cloth--on' : ''}`} />
    </span>
  );
}

/** A row of things, some arriving or leaving (number stories) */
export function StoryRow({ n, arrive = 0, leave = 0, emoji, width, height, moved }: { n: number; arrive?: number; leave?: number; emoji: string; width: number; height: number; moved: boolean }) {
  const total = n + arrive;
  const each = Math.min(height * 0.32, (width * 0.9) / Math.min(total, 5));
  const items: ReactNode[] = [];
  for (let i = 0; i < total; i++) {
    const coming = i >= n;
    const going = i >= n - leave && i < n;
    const cls = ['story-thing', coming && (moved ? 'story-thing--arrived' : 'story-thing--away'), going && moved && 'story-thing--gone'].filter(Boolean).join(' ');
    items.push(
      <span key={i} className={cls} style={{ fontSize: each * 0.82, width: each, height: each }}>
        {emoji}
      </span>,
    );
  }
  return (
    <span className="story-row" style={{ width, maxWidth: width, height }} aria-hidden="true">
      {items}
    </span>
  );
}

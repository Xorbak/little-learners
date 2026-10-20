import type { CalmTheme } from './themes';

const INK = '#3d2c4e';

/** Sleepy closed eyes and a little smile */
function SleepyFace({ cx, cy, s, colour = INK }: { cx: number; cy: number; s: number; colour?: string }) {
  return (
    <g fill="none" stroke={colour} strokeWidth={4 * s} strokeLinecap="round">
      <path d={`M${cx - 26 * s} ${cy} q${9 * s} ${8 * s} ${18 * s} 0`} />
      <path d={`M${cx + 8 * s} ${cy} q${9 * s} ${8 * s} ${18 * s} 0`} />
      <path d={`M${cx - 9 * s} ${cy + 20 * s} q${9 * s} ${7 * s} ${18 * s} 0`} />
      <ellipse cx={cx - 34 * s} cy={cy + 13 * s} rx={8 * s} ry={5 * s} fill="#ff8fab" stroke="none" opacity="0.55" />
      <ellipse cx={cx + 34 * s} cy={cy + 13 * s} rx={8 * s} ry={5 * s} fill="#ff8fab" stroke="none" opacity="0.55" />
    </g>
  );
}

/** What grows and shrinks with her breath, one per calm theme */
export function BreathGuide({ guide }: { guide: CalmTheme['guide'] }) {
  switch (guide) {
    case 'moon':
      return (
        <svg viewBox="0 0 200 200" className="breath-svg">
          <circle cx="100" cy="100" r="78" fill="#fff3bf" />
          <circle cx="62" cy="70" r="12" fill="#ffe8a3" />
          <circle cx="140" cy="132" r="9" fill="#ffe8a3" />
          <circle cx="146" cy="74" r="6" fill="#ffe8a3" />
          <SleepyFace cx={100} cy={104} s={1} />
        </svg>
      );
    case 'sun':
      return (
        <svg viewBox="0 0 200 200" className="breath-svg">
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return <circle key={i} cx={100 + Math.cos(a) * 84} cy={100 + Math.sin(a) * 84} r="12" fill="#ffc078" />;
          })}
          <circle cx="100" cy="100" r="68" fill="#ffd43b" />
          <SleepyFace cx={100} cy={100} s={0.95} />
        </svg>
      );
    case 'jellyfish':
      return (
        <svg viewBox="0 0 200 220" className="breath-svg">
          <g className="jelly-tentacles" stroke="#e599f7" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.85">
            <path d="M60 118 q-10 22 0 44 q10 22 0 44" />
            <path d="M85 122 q10 22 0 44 q-10 22 0 40" />
            <path d="M115 122 q-10 22 0 44 q10 22 0 40" />
            <path d="M140 118 q10 22 0 44 q-10 22 0 44" />
          </g>
          <path d="M28 120 C28 50 70 22 100 22 C130 22 172 50 172 120 C150 112 130 128 100 120 C70 128 50 112 28 120 Z" fill="#f3d9fa" opacity="0.95" />
          <path d="M48 70 C60 44 80 36 96 36" stroke="#fff" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.7" />
          <SleepyFace cx={100} cy={84} s={0.85} />
        </svg>
      );
    case 'cloud':
      return (
        <svg viewBox="0 0 220 160" className="breath-svg">
          <path
            d="M50 130 C20 130 12 98 36 88 C30 58 66 44 86 62 C94 30 146 26 156 60 C186 54 206 84 190 104 C210 116 200 140 176 138 C140 142 90 140 50 130 Z"
            fill="#f8f9fa"
          />
          <SleepyFace cx={110} cy={96} s={0.9} />
        </svg>
      );
    case 'firefly':
      return (
        <svg viewBox="0 0 200 200" className="breath-svg">
          <defs>
            <radialGradient id="ff-glow">
              <stop offset="0" stopColor="#f4fce3" stopOpacity="1" />
              <stop offset="0.35" stopColor="#d8f5a2" stopOpacity="0.85" />
              <stop offset="1" stopColor="#c0eb75" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="96" fill="url(#ff-glow)" />
          <ellipse cx="78" cy="78" rx="22" ry="14" fill="#e7f5ff" opacity="0.8" transform="rotate(-30 78 78)" />
          <ellipse cx="122" cy="78" rx="22" ry="14" fill="#e7f5ff" opacity="0.8" transform="rotate(30 122 78)" />
          <ellipse cx="100" cy="112" rx="20" ry="26" fill="#ffe066" />
          <circle cx="100" cy="78" r="18" fill="#5c3d2e" />
          <path d="M92 62 q-6 -14 -14 -16 M108 62 q6 -14 14 -16" stroke="#5c3d2e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <SleepyFace cx={100} cy={76} s={0.32} colour="#fff" />
        </svg>
      );
  }
}

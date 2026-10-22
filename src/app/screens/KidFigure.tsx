import type { KidPose } from '../exercises';

/**
 * A little cartoon kid (front view) whose arms, legs and body can be moved, so
 * she can see how to do jumping jacks, marching, toe touches… The wheelbarrow
 * walk is drawn from the side with a grown-up holding her legs.
 * kidBeat() plays one repeat of the move.
 */

const SKIN = '#f7c59f';
const INK = '#3d2c4e';
const SHIRT = '#f783ac';
const SHORTS = '#4dabf7';
const HAIR = '#8d5524';
const ol = { stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

function Limb({ x, y, length, width, colour, sleeve, end }: { x: number; y: number; length: number; width: number; colour: string; sleeve?: string; end: 'hand' | 'shoe' }) {
  return (
    <>
      <line x1={x} y1={y} x2={x} y2={y + length} stroke={INK} strokeWidth={width + 8} strokeLinecap="round" />
      <line x1={x} y1={y} x2={x} y2={y + length} stroke={colour} strokeWidth={width} strokeLinecap="round" />
      {sleeve && <line x1={x} y1={y} x2={x} y2={y + 14} stroke={sleeve} strokeWidth={width + 2} strokeLinecap="round" />}
      {end === 'hand' ? (
        <circle cx={x} cy={y + length + 2} r={9} fill={SKIN} {...ol} />
      ) : (
        <ellipse cx={x} cy={y + length + 6} rx={14} ry={9} fill="#ff6b6b" {...ol} />
      )}
    </>
  );
}

export function KidFigure({ pose }: { pose: KidPose }) {
  if (pose === 'wheelbarrow') return <Wheelbarrow />;
  return (
    <svg viewBox="0 0 200 260" className="kid" aria-hidden="true" overflow="visible">
      <ellipse cx="100" cy="252" rx="52" ry="7" fill="rgba(43,45,66,0.15)" className="kid-shadow" style={{ transformOrigin: '100px 252px' }} />
      <g className="kid-body" style={{ transformOrigin: '100px 250px' }}>
        <g className="kid-leg-l" style={{ transformOrigin: '89px 160px' }}>
          <Limb x={89} y={160} length={66} width={16} colour={SKIN} end="shoe" />
        </g>
        <g className="kid-leg-r" style={{ transformOrigin: '111px 160px' }}>
          <Limb x={111} y={160} length={66} width={16} colour={SKIN} end="shoe" />
        </g>
        <path d="M76 148 H124 L126 180 H104 L100 170 L96 180 H74 Z" fill={SHORTS} {...ol} />
        <g className="kid-upper" style={{ transformOrigin: '100px 165px' }}>
          <g className="kid-arm-l" style={{ transformOrigin: '80px 104px' }}>
            <Limb x={80} y={104} length={56} width={14} colour={SKIN} sleeve={SHIRT} end="hand" />
          </g>
          <g className="kid-arm-r" style={{ transformOrigin: '120px 104px' }}>
            <Limb x={120} y={104} length={56} width={14} colour={SKIN} sleeve={SHIRT} end="hand" />
          </g>
          <rect x="76" y="94" width="48" height="66" rx="18" fill={SHIRT} {...ol} />
          <path d="M100 112 l5 10 l11 1 l-8 7 l3 11 l-11 -6 l-11 6 l3 -11 l-8 -7 l11 -1 Z" fill="#ffe066" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          {/* head */}
          <circle cx="62" cy="52" r="13" fill={HAIR} {...ol} />
          <circle cx="138" cy="52" r="13" fill={HAIR} {...ol} />
          <circle cx="100" cy="60" r="36" fill={SKIN} {...ol} />
          <path d="M64 58 C62 26 88 18 100 20 C120 18 140 30 136 58 C126 44 112 40 100 44 C88 40 74 46 64 58 Z" fill={HAIR} {...ol} />
          <circle cx="86" cy="64" r="5.5" fill={INK} />
          <circle cx="114" cy="64" r="5.5" fill={INK} />
          <circle cx="84" cy="62" r="1.8" fill="#fff" />
          <circle cx="112" cy="62" r="1.8" fill="#fff" />
          <ellipse cx="76" cy="76" rx="7" ry="4.5" fill="#ff8fab" opacity="0.7" />
          <ellipse cx="124" cy="76" rx="7" ry="4.5" fill="#ff8fab" opacity="0.7" />
          <path d="M90 78 Q100 88 110 78" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

/** Side view: the kid walks on her hands while a grown-up holds her legs */
function Wheelbarrow() {
  return (
    <svg viewBox="0 0 300 220" className="kid kid--wide" aria-hidden="true" overflow="visible">
      <ellipse cx="150" cy="212" rx="120" ry="7" fill="rgba(43,45,66,0.15)" />
      <g className="wb-all">
        {/* grown-up */}
        <g className="wb-adult">
          <line x1="236" y1="140" x2="226" y2="206" stroke={INK} strokeWidth="22" strokeLinecap="round" />
          <line x1="236" y1="140" x2="226" y2="206" stroke="#495057" strokeWidth="14" strokeLinecap="round" />
          <line x1="246" y1="140" x2="258" y2="206" stroke={INK} strokeWidth="22" strokeLinecap="round" />
          <line x1="246" y1="140" x2="258" y2="206" stroke="#495057" strokeWidth="14" strokeLinecap="round" />
          <rect x="222" y="62" width="40" height="84" rx="16" fill="#69db7c" {...ol} />
          <circle cx="242" cy="40" r="22" fill="#e8b58a" {...ol} />
          <path d="M222 36 C222 16 262 14 262 36 C252 28 232 28 222 36 Z" fill="#495057" {...ol} />
          <circle cx="234" cy="40" r="3" fill={INK} />
          <path d="M230 50 q6 5 12 0" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          {/* arms reaching to the kid's ankles */}
          <path d="M232 80 L196 112" stroke={INK} strokeWidth="18" strokeLinecap="round" />
          <path d="M232 80 L196 112" stroke="#e8b58a" strokeWidth="11" strokeLinecap="round" />
        </g>
        {/* kid, lying along the floor, held by the legs */}
        <g className="wb-kid">
          <line x1="132" y1="128" x2="196" y2="112" stroke={INK} strokeWidth="22" strokeLinecap="round" />
          <line x1="132" y1="128" x2="196" y2="112" stroke={SKIN} strokeWidth="14" strokeLinecap="round" />
          <ellipse cx="200" cy="111" rx="10" ry="13" fill="#ff6b6b" {...ol} />
          <path d="M112 118 L146 112 L150 138 L118 144 Z" fill={SHORTS} {...ol} />
          <rect x="66" y="118" width="58" height="34" rx="16" fill={SHIRT} {...ol} transform="rotate(-8 95 135)" />
          <g className="wb-arm-a" style={{ transformOrigin: '76px 140px' }}>
            <line x1="76" y1="140" x2="70" y2="196" stroke={INK} strokeWidth="22" strokeLinecap="round" />
            <line x1="76" y1="140" x2="70" y2="196" stroke={SKIN} strokeWidth="14" strokeLinecap="round" />
          </g>
          <g className="wb-arm-b" style={{ transformOrigin: '84px 138px' }}>
            <line x1="84" y1="138" x2="80" y2="196" stroke={INK} strokeWidth="22" strokeLinecap="round" />
            <line x1="84" y1="138" x2="80" y2="196" stroke="#f0b48a" strokeWidth="14" strokeLinecap="round" />
          </g>
          <circle cx="46" cy="132" r="28" fill={SKIN} {...ol} />
          <path d="M22 128 C20 104 54 98 70 118 C58 114 40 116 22 128 Z" fill={HAIR} {...ol} />
          <circle cx="36" cy="138" r="4" fill={INK} />
          <path d="M28 150 q8 6 14 0" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="50" cy="148" rx="6" ry="4" fill="#ff8fab" opacity="0.7" />
        </g>
      </g>
    </svg>
  );
}

type Part = 'body' | 'upper' | 'arm-l' | 'arm-r' | 'leg-l' | 'leg-r' | 'shadow';

const rot = (...deg: number[]) => deg.map((d) => ({ transform: `rotate(${d}deg)` }));

/** One repeat of each move, part by part */
const MOVES: Record<Exclude<KidPose, 'wheelbarrow'>, { ms: number; parts: Partial<Record<Part, Keyframe[]>> }> = {
  jacks: {
    ms: 700,
    parts: {
      'arm-l': rot(8, 165, 8),
      'arm-r': rot(-8, -165, -8),
      'leg-l': rot(2, 26, 2),
      'leg-r': rot(-2, -26, -2),
      body: [{ transform: 'translateY(0)' }, { transform: 'translateY(-18px)' }, { transform: 'translateY(0)' }],
      shadow: [{ transform: 'scale(1)' }, { transform: 'scale(0.8)' }, { transform: 'scale(1)' }],
    },
  },
  run: {
    ms: 560,
    parts: {
      'leg-l': [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.6)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }],
      'leg-r': [{ transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(0.6)' }, { transform: 'scaleY(1)' }],
      'arm-l': rot(-15, 25, -15, 25, -15),
      'arm-r': rot(-25, 15, -25, 15, -25),
      body: [{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0)' }],
    },
  },
  march: {
    ms: 900,
    parts: {
      'leg-l': [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.45)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }],
      'leg-r': [{ transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(0.45)' }, { transform: 'scaleY(1)' }],
      'arm-l': rot(0, -40, 0, 40, 0),
      'arm-r': rot(0, -40, 0, 40, 0),
      body: [{ transform: 'translateY(0)' }, { transform: 'translateY(-4px)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-4px)' }, { transform: 'translateY(0)' }],
    },
  },
  toes: {
    ms: 1700,
    parts: {
      'arm-l': rot(8, 170, 170, 10, 10, 8),
      'arm-r': rot(-8, -170, -170, -10, -10, -8),
      upper: [
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(-10px) scale(1, 1.05)', offset: 0.25 },
        { transform: 'translateY(-10px) scale(1, 1.05)', offset: 0.35 },
        { transform: 'translateY(70px) scale(0.95, 0.75)', offset: 0.6 },
        { transform: 'translateY(70px) scale(0.95, 0.75)', offset: 0.8 },
        { transform: 'translateY(0) scale(1)' },
      ],
    },
  },
  hop: {
    ms: 650,
    parts: {
      'leg-r': [{ transform: 'rotate(-30deg) scaleY(0.6)' }, { transform: 'rotate(-34deg) scaleY(0.55)' }, { transform: 'rotate(-30deg) scaleY(0.6)' }],
      'arm-l': rot(70, 80, 70),
      'arm-r': rot(-70, -80, -70),
      body: [{ transform: 'translateY(0)' }, { transform: 'translateY(-20px)' }, { transform: 'translateY(0)' }],
      shadow: [{ transform: 'scale(1)' }, { transform: 'scale(0.8)' }, { transform: 'scale(1)' }],
    },
  },
  twirl: {
    ms: 1800,
    parts: {
      body: [
        { transform: 'scaleX(1)' },
        { transform: 'scaleX(0.05) translateY(-4px)', offset: 0.25 },
        { transform: 'scaleX(-1)', offset: 0.5 },
        { transform: 'scaleX(-0.05) translateY(-4px)', offset: 0.75 },
        { transform: 'scaleX(1)' },
      ],
      'arm-l': rot(80, 90, 80),
      'arm-r': rot(-80, -90, -80),
    },
  },
  skip: {
    ms: 800,
    parts: {
      'leg-l': [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.5)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }],
      'leg-r': [{ transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(0.5)' }, { transform: 'scaleY(1)' }],
      'arm-l': rot(-30, 35, -30, 35, -30),
      'arm-r': rot(-35, 30, -35, 30, -35),
      body: [{ transform: 'translateY(0)' }, { transform: 'translateY(-16px)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-16px)' }, { transform: 'translateY(0)' }],
      shadow: [{ transform: 'scale(1)' }, { transform: 'scale(0.85)' }, { transform: 'scale(1)' }, { transform: 'scale(0.85)' }, { transform: 'scale(1)' }],
    },
  },
  gallop: {
    ms: 650,
    parts: {
      'leg-l': rot(0, 24, 0),
      'leg-r': rot(0, -14, 0),
      'arm-l': rot(-55, -45, -55),
      'arm-r': rot(55, 45, 55),
      body: [{ transform: 'translate(0, 0)' }, { transform: 'translate(-6px, -18px)' }, { transform: 'translate(0, 0)' }],
      shadow: [{ transform: 'scale(1)' }, { transform: 'scale(0.8)' }, { transform: 'scale(1)' }],
    },
  },
  'jump-fb': {
    ms: 1300,
    parts: {
      body: [
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(-20px) scale(1.06)', offset: 0.25 },
        { transform: 'translateY(0) scale(1.12)', offset: 0.5 },
        { transform: 'translateY(-20px) scale(1.06)', offset: 0.75 },
        { transform: 'translateY(0) scale(1)' },
      ],
      'arm-l': rot(10, 70, 10, 70, 10),
      'arm-r': rot(-10, -70, -10, -70, -10),
    },
  },
  balance: {
    ms: 1200,
    parts: {
      'leg-r': [{ transform: 'rotate(-30deg) scaleY(0.6)' }, { transform: 'rotate(-34deg) scaleY(0.58)' }, { transform: 'rotate(-30deg) scaleY(0.6)' }],
      'arm-l': rot(80, 72, 86, 80),
      'arm-r': rot(-80, -86, -72, -80),
      body: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }, { transform: 'rotate(0deg)' }],
    },
  },
  dance: {
    ms: 1100,
    parts: {
      'arm-l': rot(10, 160, 160, 10, 10),
      'arm-r': rot(-10, -10, -160, -160, -10),
      body: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(0deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0deg)' }],
      'leg-l': [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.85)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }],
      'leg-r': [{ transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(0.85)' }, { transform: 'scaleY(1)' }],
    },
  },
  tiptoe: {
    ms: 700,
    parts: {
      body: [{ transform: 'translateY(-8px)' }, { transform: 'translateY(-12px) translateX(-4px)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(-12px) translateX(4px)' }, { transform: 'translateY(-8px)' }],
      'arm-l': rot(40, 45, 40, 35, 40),
      'arm-r': rot(-40, -35, -40, -45, -40),
      'leg-l': [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.85)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }],
      'leg-r': [{ transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(0.85)' }, { transform: 'scaleY(1)' }],
    },
  },
};

/** Play one repeat of the move on a rendered KidFigure (root = its wrapper) */
export function kidBeat(root: Element | null, pose: KidPose, speed = 1) {
  if (!root) return;
  if (pose === 'wheelbarrow') {
    const ms = 900 / speed;
    root.querySelector('.wb-arm-a')?.animate(rot(-18, 18, -18), { duration: ms, easing: 'ease-in-out' });
    root.querySelector('.wb-arm-b')?.animate(rot(18, -18, 18), { duration: ms, easing: 'ease-in-out' });
    root.querySelector('.wb-all')?.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(0)' }], { duration: ms, easing: 'ease-in-out' });
    root.querySelector('.wb-adult')?.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)' }, { transform: 'translateY(0)' }], { duration: ms / 2, iterations: 2 });
    return;
  }
  const move = MOVES[pose];
  for (const [part, frames] of Object.entries(move.parts)) {
    const el = root.querySelector(`.kid-${part}`);
    el?.getAnimations().forEach((a) => a.cancel());
    el?.animate(frames as Keyframe[], { duration: move.ms / speed, easing: 'ease-in-out' });
  }
}

/** How long one repeat takes (ms) */
export const kidBeatMs = (pose: KidPose) => (pose === 'wheelbarrow' ? 900 : MOVES[pose].ms);

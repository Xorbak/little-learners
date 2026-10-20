import type { CSSProperties, FC } from 'react';

export interface BalloonState {
  id: number;
  itemKey: string;
  lane: number;
  /** Still mode: which row it sits in */
  row?: number;
  colour: string;
  duration: number;
  delay: number;
  status: 'flying' | 'wobble' | 'squish' | 'popped';
}

interface Props {
  balloon: BalloonState;
  left: string;
  /** Still mode: fixed position from the top instead of floating */
  top?: string;
  size: number;
  Label?: FC<{ size: number }>;
  onTap: (el: HTMLElement) => void;
}

export function Balloon({ balloon, left, top, size, Label, onTap }: Props) {
  const height = size * 1.5;
  return (
    <div
      className={`balloon ${top !== undefined ? 'balloon--still' : ''}`}
      style={{
        left,
        top,
        width: size,
        height,
        marginLeft: -size / 2,
        // Floating timing only applies when it floats; still balloons just pop in
        ...(top === undefined && { animationDuration: `${balloon.duration}s`, animationDelay: `${balloon.delay}s` }),
      }}
    >
      <div className="balloon-sway" style={{ animationDuration: `${2.5 + (balloon.id % 3) * 0.6}s` }}>
        {balloon.status === 'popped' ? (
          <FallingString size={size} swing={balloon.id % 2 ? 1 : -1} />
        ) : (
          <button
            type="button"
            className={`balloon-body ${balloon.status === 'wobble' ? 'balloon-body--wobble' : ''} ${balloon.status === 'squish' ? 'balloon-body--squish' : ''}`}
            onPointerDown={(e) => {
              e.preventDefault();
              onTap(e.currentTarget);
            }}
            aria-label="balloon"
          >
            <svg viewBox="0 0 100 150" width={size} height={height} aria-hidden="true">
              <path d="M50 106 Q42 122 52 134 Q60 144 48 150" stroke="#8a8a8a" strokeWidth="2" fill="none" />
              <ellipse cx="50" cy="52" rx="44" ry="50" fill={balloon.colour} />
              <polygon points="44,104 56,104 50,96" fill={balloon.colour} />
              <ellipse cx="34" cy="30" rx="9" ry="15" fill="#fff" opacity="0.35" transform="rotate(-20 34 30)" />
            </svg>
            {Label && (
              <span className="balloon-label" style={{ height: size * 1.04 }}>
                <Label size={size * 0.62} />
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/** After the pop: the string falls with gravity, swinging as it drops */
function FallingString({ size, swing }: { size: number; swing: number }) {
  const height = size * 1.5;
  return (
    <div className="balloon-string-fall" style={{ width: size, height, '--swing': swing } as CSSProperties} aria-hidden="true">
      <svg viewBox="0 0 100 150" width={size} height={height}>
        <polygon points="44,104 56,104 50,96" fill="#8a8a8a" opacity="0.6" />
        <path d="M50 104 Q42 122 52 134 Q60 144 48 150" stroke="#8a8a8a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

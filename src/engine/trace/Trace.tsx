import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { TraceConfig } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fanfare } from '../../shared/audio/music';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import './trace.css';

/**
 * Trace It
 * The shape is a wide grey track with a dashed line down the middle; a green dot
 * shows where to start. Her finger leaves a line. When the two ends of her line
 * meet (and she has gone most of the way round), the shape is done and she gets
 * a score out of 10:
 *   coverage = how much of the outline her line passed over (half the score)
 *   accuracy = how close her line stayed to the dashed line (half the score)
 *
 * Works with any item whose Plain drawing is a single outline (shapes for now).
 * All maths is in the drawing's own units (a 100×100 box).
 */

const PAD = 14; //            room around the 100×100 shape for the track
const TRACK = 18; //          track width
const NEAR = 8; //            how close counts as passing over the outline (inside the track)
const ENDS_TOUCH = 12; //     how close the two ends must be
const MIN_ROUND = 0.6; //     must have drawn at least this much of the perimeter
const SAMPLES = 120;
const PERFECT = 3; //         this close to the dashed line = full marks
const SLOPPY = 15; //         this far away = no marks

type Pt = { x: number; y: number };
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

function TraceRound({ target, onCorrect, onRoundComplete }: RoundProps<TraceConfig>) {
  const Shape = target.Plain ?? target.Display;
  const svgRef = useRef<SVGSVGElement>(null);
  const bandRef = useRef<SVGGElement>(null);
  const [outline, setOutline] = useState<Pt[]>([]);
  const [perimeter, setPerimeter] = useState(0);
  const [strokes, setStrokes] = useState<Pt[][]>([]);
  const [score, setScore] = useState<number | null>(null);
  const drawing = useRef(false);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const ask = useCallback(() => void narrator.say(['trace.trace-the', target.nameClip]), [target.nameClip]);

  // Read the outline from the drawing itself: points all the way round it
  useEffect(() => {
    const el = bandRef.current?.querySelector('circle, ellipse, rect, polygon, path') as SVGGeometryElement | null;
    if (!el) return;
    const total = el.getTotalLength();
    setPerimeter(total);
    setOutline(Array.from({ length: SAMPLES }, (_, i) => {
      const p = el.getPointAtLength((total * i) / SAMPLES);
      return { x: p.x, y: p.y };
    }));
    ask();
  }, [ask]);

  const toShape = (e: ReactPointerEvent): Pt | null => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  const all = strokes.flat();
  const drawnLength = all.reduce((sum, p, i) => (i ? sum + dist(all[i - 1], p) : 0), 0);

  const doneRef = useRef(false);
  const finish = (ink: Pt[]) => {
    if (doneRef.current) return;
    doneRef.current = true;
    // Coverage: how much of the outline her line passed over
    const covered = outline.filter((o) => ink.some((p) => dist(o, p) <= NEAR)).length / outline.length;
    // Accuracy: each bit of her line scores by how close it is to the dashed line
    // (full marks within PERFECT, nothing beyond SLOPPY), averaged
    const closeness = ink.map((p) => {
      const d = Math.min(...outline.map((o) => dist(o, p)));
      return Math.max(0, Math.min(1, 1 - (d - PERFECT) / (SLOPPY - PERFECT)));
    });
    const accuracy = closeness.reduce((a, b) => a + b, 0) / closeness.length;
    const raw = 0.5 * accuracy + 0.5 * covered;
    const s = Math.max(1, Math.min(10, Math.round(raw * 10 + 0.3))); // rounds kindly
    setScore(s);
    fanfare();
    void narrator.say(['trace.you-got', `numbers.name.${s}`, 'trace.out-of-ten', s >= 8 ? 'trace.great' : s >= 5 ? 'trace.good' : 'trace.keep-going']);
    if (s >= 6) onCorrect(target);
    later(onRoundComplete, 4200);
  };

  const checkDone = (next: Pt[][]) => {
    const ink = next.flat();
    if (ink.length < 8 || !perimeter) return;
    const length = ink.reduce((sum, p, i) => (i ? sum + dist(ink[i - 1], p) : 0), 0);
    if (length >= perimeter * MIN_ROUND && dist(ink[0], ink[ink.length - 1]) <= ENDS_TOUCH) finish(ink);
  };

  // Each time her line grows, see whether the two ends have met
  useEffect(() => {
    if (score === null) checkDone(strokes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes]);

  const down = (e: ReactPointerEvent) => {
    if (score !== null) return;
    const p = toShape(e);
    if (!p) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* fine */
    }
    drawing.current = true;
    setStrokes((s) => [...s, [p]]);
  };

  const move = (e: ReactPointerEvent) => {
    if (!drawing.current || score !== null) return;
    const p = toShape(e);
    if (!p) return;
    setStrokes((s) => {
      const last = s[s.length - 1];
      if (dist(last[last.length - 1], p) < 1.2) return s;
      return [...s.slice(0, -1), [...last, p]];
    });
  };

  const up = () => {
    drawing.current = false;
  };

  const clear = () => {
    if (score !== null) return;
    sfx.flip();
    setStrokes([]);
    ask();
  };

  const start = outline[0];
  const view = `${-PAD} ${-PAD} ${100 + PAD * 2} ${100 + PAD * 2}`;

  return (
    <div className="trace-round">
      <header className="trace-top">
        <SpeakerButton onPress={ask} />
        <button type="button" className="trace-clear" onClick={clear} aria-label="Start again">
          🔄
        </button>
      </header>

      <div className="trace-stage">
        <svg
          ref={svgRef}
          viewBox={view}
          className={`trace-svg ${score !== null ? 'trace-svg--done' : ''}`}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          role="img"
          aria-label={narrator.allClips()[target.nameClip]}
        >
          {/* The track and the dashed middle line, drawn from the shape's own outline */}
          <g ref={bandRef} className="trace-band" style={{ '--track': TRACK } as CSSProperties}>
            <Shape size={100} />
          </g>
          <g className="trace-dashes">
            <Shape size={100} />
          </g>

          {/* Where to start */}
          {start && strokes.length === 0 && (
            <g className="trace-start" transform={`translate(${start.x} ${start.y})`}>
              <circle r="7" />
            </g>
          )}

          {/* Her line */}
          {strokes.map((s, i) => (
            <polyline key={i} className="trace-ink" points={s.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} />
          ))}
          {/* Little dot at her pen tip */}
          {all.length > 0 && score === null && <circle className="trace-tip" cx={all[all.length - 1].x} cy={all[all.length - 1].y} r="4" />}
        </svg>

        {score !== null && (
          <div className="trace-score" aria-label={`${score} out of 10`}>
            <span className="trace-score-num">{score}</span>
            <span className="trace-stars">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className={`trace-star ${i < score ? 'trace-star--on' : ''}`} style={{ animationDelay: `${0.3 + i * 0.12}s` }}>
                  ★
                </span>
              ))}
            </span>
          </div>
        )}
      </div>

      {/* How far round she is (for grown-ups watching): hidden from her */}
      <span className="trace-sr" aria-live="polite">{perimeter ? Math.min(100, Math.round((drawnLength / perimeter) * 100)) : 0}%</span>
    </div>
  );
}

export const trace: Mechanic<TraceConfig> = {
  Round: TraceRound,
  clips: {
    'trace.title': 'Trace the shape!',
    'trace.trace-the': 'Trace the',
    'trace.you-got': 'You got',
    'trace.out-of-ten': 'out of ten!',
    'trace.great': 'Super tracing!',
    'trace.good': 'Good job!',
    'trace.keep-going': "Good try! Let's practise more.",
  },
};

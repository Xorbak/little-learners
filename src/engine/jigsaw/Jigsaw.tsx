import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { JigsawConfig, LearningItem } from '../../types/learning';
import { PictureGallery } from '../../shared/ui/PictureGallery';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fanfare } from '../../shared/audio/music';
import { progress } from '../../shared/progress/store';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import { fx } from '../../shared/fx';
import './jigsaw.css';

/**
 * Jigsaw puzzle
 * The picture is cut into real jigsaw pieces (with knobs). Pieces lie in a tray;
 * she drags each one onto the board and it snaps in when it's close to its spot
 * (generously). A wrong spot: a little squeak or boing and the piece slides back.
 * Tapping a piece makes its spot flash; after 2 wrong tries the spot glows while
 * she carries that piece. Early levels show the picture faintly on the board.
 *
 * All piece maths is in the picture's own pixels; the screen scale is applied on top.
 */

type Rect = { x: number; y: number; w: number; h: number };
type Piece = {
  id: number;
  r: number;
  c: number;
  d: string;
  placed: boolean;
  /** Its own spot in the tray (shuffled) and a little wonkiness */
  spot: number;
  jx: number;
  jy: number;
  /** Where she left it in the tray, as fractions of the tray (once she has moved it) */
  fx?: number;
  fy?: number;
  misses: number;
  /** Lies a little crooked in the tray, like real pieces on a table */
  rot: number;
};

/** One side of a piece, from (x1,y1) to (x2,y2). dir 0 = flat, 1 = knob out, -1 = knob in. */
function edge(x1: number, y1: number, x2: number, y2: number, dir: number, k: number): string {
  if (!dir) return `L${x2} ${y2}`;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  // outward normal for a clockwise outline
  const nx = uy * dir;
  const ny = -ux * dir;
  const m = len / 2;
  const P = (a: number, v: number) => `${(x1 + ux * a + nx * v).toFixed(1)} ${(y1 + uy * a + ny * v).toFixed(1)}`;
  return [
    `L${P(m - 0.1 * k, 0)}`,
    `C${P(m - 0.04 * k, 0.12 * k)} ${P(m - 0.27 * k, 0.25 * k)} ${P(m, 0.25 * k)}`,
    `C${P(m + 0.27 * k, 0.25 * k)} ${P(m + 0.04 * k, 0.12 * k)} ${P(m + 0.1 * k, 0)}`,
    `L${x2} ${y2}`,
  ].join(' ');
}

function cutPieces(cols: number, rows: number, W: number, H: number): Piece[] {
  const cw = W / cols;
  const ch = H / rows;
  const k = Math.min(cw, ch);
  const flip = () => (Math.random() < 0.5 ? 1 : -1);
  // hz[r][c]: edge under row r (+1 = knob points down); vt[r][c]: edge right of col c (+1 = knob points right)
  const hz = Array.from({ length: rows }, () => Array.from({ length: cols }, flip));
  const vt = Array.from({ length: rows }, () => Array.from({ length: cols }, flip));
  const pieces: Piece[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = c * cw;
      const y0 = r * ch;
      const x1 = x0 + cw;
      const y1 = y0 + ch;
      const d = [
        `M${x0} ${y0}`,
        edge(x0, y0, x1, y0, r > 0 ? -hz[r - 1][c] : 0, k),
        edge(x1, y0, x1, y1, c < cols - 1 ? vt[r][c] : 0, k),
        edge(x1, y1, x0, y1, r < rows - 1 ? hz[r][c] : 0, k),
        edge(x0, y1, x0, y0, c > 0 ? -vt[r][c - 1] : 0, k),
        'Z',
      ].join(' ');
      pieces.push({ id: r * cols + c, r, c, d, placed: false, spot: 0, jx: Math.random() - 0.5, jy: Math.random() - 0.5, misses: 0, rot: Math.random() * 20 - 10 });
    }
  }
  // Each piece gets its own spot in the tray, in a random order
  const spots = pieces.map((_, i) => i).sort(() => Math.random() - 0.5);
  pieces.forEach((p, i) => (p.spot = spots[i]));
  return pieces;
}

function useSize(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/** Let her pick the picture first (unless it's a quick Today's lessons round) */
function JigsawStart(props: RoundProps<JigsawConfig>) {
  const { config, items, timesRight, daily } = props;
  const [picked, setPicked] = useState<LearningItem | null>(config.choose && !daily && config.pool.length > 1 ? null : props.target);
  if (!picked) {
    return (
      <PictureGallery
        items={config.pool.map((key) => items[key])}
        askClip="puzzle.choose"
        isDone={(item) => timesRight(item) > 0}
        onPick={setPicked}
      />
    );
  }
  return <JigsawRound {...props} target={picked} />;
}

function JigsawRound({ config, target, onCorrect, onRoundComplete }: RoundProps<JigsawConfig>) {
  const url = target.photo ?? '';
  const uid = useId().replace(/:/g, '');
  const stageRef = useRef<HTMLDivElement>(null);
  const stage = useSize(stageRef);
  const [img, setImg] = useState<{ W: number; H: number } | null>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [drag, setDrag] = useState<{ id: number; x: number; y: number; dx: number; dy: number; sx: number; sy: number } | null>(null);
  const [flash, setFlash] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  /** Tilt while carrying a piece, from how fast it's moving sideways */
  const [tilt, setTilt] = useState(0);
  const lastMove = useRef<{ x: number; t: number } | null>(null);
  const tiltTimer = useRef(0);
  /** A piece flying back to the tray along an arc */
  const [returning, setReturning] = useState<{ id: number; dx: number; dy: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const pieceEl = (id: number) => stageRef.current?.querySelector<HTMLElement>(`[data-id="${id}"]`);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const ask = useCallback(() => void narrator.say(['puzzle.ask']), []);

  // Load the picture to learn its shape, then cut it up
  useEffect(() => {
    const im = new Image();
    im.onload = () => {
      const W = im.naturalWidth;
      const H = im.naturalHeight;
      setImg({ W, H });
      setPieces(cutPieces(config.cols, config.rows, W, H));
    };
    im.src = url;
    ask();
  }, [url, config.cols, config.rows, ask]);

  // Where the board and tray go. Try the board on top and on the left, shrinking it
  // until every piece has its own place in the tray, and keep whichever is bigger.
  const layout = useMemo(() => {
    if (!img || !stage.w || !stage.h) return null;
    const n = config.cols * config.rows;
    const aspect = img.W / img.H;
    const pad = 12;
    const cw = img.W / config.cols;
    const ch = img.H / config.rows;
    const t = Math.min(cw, ch) * 0.27; // room for the knobs
    const plan = (bw: number, side: boolean) => {
      const bh = bw / aspect;
      const s = bw / img.W;
      const boxW = (cw + 2 * t) * s;
      const boxH = (ch + 2 * t) * s;
      let board: Rect;
      let tray: Rect;
      if (side) {
        tray = { x: bw + pad * 2.5, y: pad, w: stage.w - bw - pad * 3.5, h: stage.h - pad * 2 };
        board = { x: pad, y: (stage.h - bh) / 2, w: bw, h: bh };
      } else {
        tray = { x: pad, y: bh + pad * 2.5, w: stage.w - pad * 2, h: stage.h - bh - pad * 3.5 };
        board = { x: (stage.w - bw) / 2, y: pad, w: bw, h: bh };
      }
      // pieces may overlap a little (their knob corners are see-through)
      const gc = Math.floor(tray.w / (boxW * 0.82));
      const gr = Math.floor(tray.h / (boxH * 0.82));
      const ok = gc >= 1 && gr >= 1 && gc * gr >= n;
      return { ok, board, tray, s, cw, ch, t, boxW, boxH, gc: Math.max(1, Math.min(gc, n)) };
    };
    const best = (side: boolean) => {
      let bw = side ? Math.min(stage.w * 0.7, (stage.h - pad * 2) * aspect) : Math.min(stage.w - pad * 2, stage.h * 0.62 * aspect);
      let p = plan(bw, side);
      while (!p.ok && bw > stage.w * 0.25) {
        bw *= 0.96;
        p = plan(bw, side);
      }
      return p;
    };
    const top = best(false);
    const side = best(true);
    return side.board.w > top.board.w ? side : top;
  }, [img, stage.w, stage.h, config.cols, config.rows]);

  const slotPos = (p: Piece) => {
    const L = layout!;
    return { x: L.board.x + (p.c * L.cw - L.t) * L.s, y: L.board.y + (p.r * L.ch - L.t) * L.s };
  };
  const trayPos = (p: Piece) => {
    const L = layout!;
    const clampX = (x: number) => Math.min(L.tray.x + Math.max(0, L.tray.w - L.boxW), Math.max(L.tray.x, x));
    const clampY = (y: number) => Math.min(L.tray.y + Math.max(0, L.tray.h - L.boxH), Math.max(L.tray.y, y));
    if (p.fx !== undefined && p.fy !== undefined) {
      return { x: L.tray.x + p.fx * Math.max(0, L.tray.w - L.boxW), y: L.tray.y + p.fy * Math.max(0, L.tray.h - L.boxH) };
    }
    // its own cell in a grid, the whole grid centred in the tray
    const n = pieces.length;
    const rowsUsed = Math.ceil(n / L.gc);
    const cellW = L.tray.w / L.gc;
    const cellH = Math.min(L.tray.h / rowsUsed, L.boxH * 1.15);
    const top = L.tray.y + (L.tray.h - cellH * rowsUsed) / 2;
    const col = p.spot % L.gc;
    const row = Math.floor(p.spot / L.gc);
    const wiggle = Math.min(cellW - L.boxW * 0.82, L.boxW * 0.1);
    return {
      x: clampX(L.tray.x + (col + 0.5) * cellW - L.boxW / 2 + p.jx * Math.max(0, wiggle)),
      y: clampY(top + (row + 0.5) * cellH - L.boxH / 2 + p.jy * Math.max(0, cellH - L.boxH * 0.82) * 0.5),
    };
  };

  const down = (e: ReactPointerEvent<HTMLDivElement>, p: Piece) => {
    if (p.placed || done || !layout) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* some browsers refuse; dragging still works while over the piece */
    }
    const pos = trayPos(p);
    lastMove.current = { x: e.clientX, t: performance.now() };
    setTilt(0);
    setDrag({ id: p.id, x: pos.x, y: pos.y, dx: e.clientX - pos.x, dy: e.clientY - pos.y, sx: e.clientX, sy: e.clientY });
  };

  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    setDrag({ ...drag, x: e.clientX - drag.dx, y: e.clientY - drag.dy });
    // Tilt in the direction it's dragged, springing back when it slows down
    const now = performance.now();
    const prev = lastMove.current;
    if (prev && now > prev.t) {
      const vx = (e.clientX - prev.x) / (now - prev.t); // px per ms
      setTilt(Math.max(-14, Math.min(14, vx * 9)));
    }
    lastMove.current = { x: e.clientX, t: now };
    window.clearTimeout(tiltTimer.current);
    tiltTimer.current = window.setTimeout(() => setTilt(0), 90);
  };

  const up = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag || !layout) return;
    const p = pieces.find((q) => q.id === drag.id)!;
    setDrag(null);
    const L = layout;

    // A tap, not a drag: show where it goes
    if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 8) {
      sfx.flip();
      setFlash(p.id);
      later(() => setFlash((f) => (f === p.id ? null : f)), 1400);
      return;
    }

    const slot = slotPos(p);
    const snap = Math.max(30, Math.min(L.cw, L.ch) * L.s * 0.5);
    if (Math.hypot(drag.x - slot.x, drag.y - slot.y) < snap) {
      const next = pieces.map((q) => (q.id === p.id ? { ...q, placed: true } : q));
      setPieces(next);
      setFlash(null);
      // It drops the last bit into its spot (CSS spring), then lands with a thunk
      later(() => {
        const el = pieceEl(p.id);
        sfx.thunk();
        fx.squash(el, 0.7);
        fx.haptic('thud');
        const sr = stageRef.current!.getBoundingClientRect();
        fx.burst(sr.left + slot.x + L.boxW / 2, sr.top + slot.y + L.boxH / 2, 'dust', { count: 8, power: L.boxW / 120 });
      }, 170);
      if (next.every((q) => q.placed)) finish();
      return;
    }

    const cx = drag.x + L.boxW / 2;
    const cy = drag.y + L.boxH / 2;
    const onBoard = cx > L.board.x && cx < L.board.x + L.board.w && cy > L.board.y && cy < L.board.y + L.board.h;
    if (onBoard) {
      // Wrong spot: back to the tray, gently
      if (progress.sillySounds()) sfx.fart('squeak');
      else sfx.boing();
      sfx.whoosh(false);
      const home = trayPos(p);
      setReturning({ id: p.id, dx: drag.x - home.x, dy: drag.y - home.y });
      setPieces(pieces.map((q) => (q.id === p.id ? { ...q, misses: q.misses + 1 } : q)));
      return;
    }

    // Dropped in the tray: it stays where she put it
    const fracX = L.tray.w > L.boxW ? (drag.x - L.tray.x) / (L.tray.w - L.boxW) : 0;
    const fracY = L.tray.h > L.boxH ? (drag.y - L.tray.y) / (L.tray.h - L.boxH) : 0;
    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    setPieces(pieces.map((q) => (q.id === p.id ? { ...q, fx: clamp(fracX), fy: clamp(fracY) } : q)));
    sfx.thunk();
    fx.squash(pieceEl(p.id), 0.4);
  };

  // Wrong spot: the piece arcs back to the tray (not a straight slide), then wobbles
  useLayoutEffect(() => {
    if (!returning) return;
    const el = pieceEl(returning.id);
    const { dx, dy } = returning;
    const lift = Math.min(160, 60 + Math.hypot(dx, dy) * 0.25);
    const frames: Keyframe[] = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const x = dx * (1 - t);
      const y = dy * (1 - t) - 4 * lift * t * (1 - t);
      frames.push({ translate: `${x.toFixed(1)}px ${y.toFixed(1)}px` });
    }
    const anim = el?.animate(frames, { duration: 520, easing: 'cubic-bezier(.3,.1,.3,1)' });
    const t = window.setTimeout(() => {
      fx.wobble(el);
      setReturning(null);
    }, 520);
    return () => {
      window.clearTimeout(t);
      anim?.finish();
    };
  }, [returning]);

  const finish = () => {
    setDone(true);
    later(() => {
      fanfare();
      sfx.sparkle();
      void narrator.say(['puzzle.done']);
      fx.jump(stageRef.current, 26);
      fx.rain(70);
      fx.haptic('big-win');
      onCorrect(target);
    }, 450);
    later(onRoundComplete, 3000);
  };

  const left = pieces.filter((p) => !p.placed).length;
  const dragging = drag ? pieces.find((p) => p.id === drag.id) : undefined;
  const glow = (p: Piece) => flash === p.id || (dragging?.id === p.id && p.misses >= 2);

  // Placed pieces underneath, then tray pieces, the one being dragged on top
  const order = [...pieces].sort((a, b) => Number(!a.placed) - Number(!b.placed) || Number(a.id === drag?.id) - Number(b.id === drag?.id));

  return (
    <div className="jigsaw-round">
      <header className="jigsaw-top">
        <SpeakerButton onPress={ask} />
        {!done && pieces.length > 0 && <div className="jigsaw-count">🧩 {left}</div>}
      </header>
      <div className="jigsaw-stage" ref={stageRef} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {layout && img && (
          <>
            <div ref={boardRef} className={`jigsaw-board${done ? ' done' : ''}`} style={{ left: layout.board.x, top: layout.board.y, width: layout.board.w, height: layout.board.h }}>
              <svg viewBox={`0 0 ${img.W} ${img.H}`} width="100%" height="100%">
                {config.ghost && <image href={url} width={img.W} height={img.H} opacity={0.28} preserveAspectRatio="none" />}
                {pieces.map((p) => (
                  <path key={p.id} d={p.d} className={`jigsaw-slot${glow(p) ? ' glow' : ''}`} vectorEffect="non-scaling-stroke" />
                ))}
              </svg>
            </div>

            {order.map((p) => {
              const isDrag = drag?.id === p.id;
              const pos = p.placed ? slotPos(p) : isDrag ? { x: drag.x, y: drag.y } : trayPos(p);
              const vx = p.c * layout.cw - layout.t;
              const vy = p.r * layout.ch - layout.t;
              const vw = layout.cw + 2 * layout.t;
              const vh = layout.ch + 2 * layout.t;
              const isBack = returning?.id === p.id;
              const cls = ['jigsaw-piece', p.placed && 'placed', isDrag && 'dragging', isBack && 'returning', done && 'done'].filter(Boolean).join(' ');
              const transform = p.placed ? 'none' : isDrag ? `scale(1.1) rotate(${tilt.toFixed(1)}deg)` : `rotate(${p.rot.toFixed(1)}deg)`;
              const bevel = 1.6 / layout.s;
              return (
                <div
                  key={p.id}
                  className={cls}
                  data-id={p.id}
                  data-r={p.r}
                  data-c={p.c}
                  style={{ left: pos.x, top: pos.y, width: layout.boxW, height: layout.boxH, transform }}
                  onPointerDown={(e) => down(e, p)}
                >
                  <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} width="100%" height="100%">
                    <defs>
                      <clipPath id={`${uid}-${p.id}`}>
                        <path d={p.d} />
                      </clipPath>
                    </defs>
                    <image href={url} width={img.W} height={img.H} preserveAspectRatio="none" clipPath={`url(#${uid}-${p.id})`} />
                    {/* Cardboard thickness: light along the top-left of the cut, shade along the bottom-right */}
                    <g clipPath={`url(#${uid}-${p.id})`} className="jigsaw-bevel">
                      <path d={p.d} transform={`translate(${bevel} ${bevel})`} className="jigsaw-bevel-light" vectorEffect="non-scaling-stroke" />
                      <path d={p.d} transform={`translate(${-bevel} ${-bevel})`} className="jigsaw-bevel-dark" vectorEffect="non-scaling-stroke" />
                    </g>
                    <path d={p.d} className="jigsaw-edge" vectorEffect="non-scaling-stroke" />
                  </svg>
                </div>
              );
            })}
            {done && (
              <div className="jigsaw-shimmer" style={{ left: layout.board.x, top: layout.board.y, width: layout.board.w, height: layout.board.h }} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export const jigsaw: Mechanic<JigsawConfig> = {
  Round: JigsawStart,
  clips: {
    'puzzle.title': 'Puzzles',
    'puzzle.choose': 'Which puzzle do you want to make?',
    'puzzle.ask': "Let's make the picture! Put the pieces where they go.",
    'puzzle.done': 'You did it! You finished the puzzle!',
  },
};

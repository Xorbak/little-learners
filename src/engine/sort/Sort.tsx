import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { SortConfig } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import './sort.css';

/**
 * Sort It: drag each thing into the right basket. On a phone, tapping is easier:
 * tap a thing (it lifts up), then tap a basket. Wrong basket: it hops back and
 * the narrator says where it goes. All sorted: the baskets dance.
 */

const DRAG_THRESHOLD = 10;
const REMIND_AFTER_MS = 14000;

const shuffle = <T,>(list: T[]): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

interface Piece {
  id: number;
  emoji: string;
  basket: string;
  scale: number;
  sortedInto?: string;
}

function SortRound({ config, target, onCorrect, onRoundComplete }: RoundProps<SortConfig>) {
  const set = target.sortSet!;
  const [pieces, setPieces] = useState<Piece[]>(() => {
    // An even mix across the baskets
    const per = Math.ceil(config.pieces / set.baskets.length);
    const picked = set.baskets.flatMap((b) => shuffle(set.pieces.filter((p) => p.basket === b.key)).slice(0, per));
    return shuffle(picked.slice(0, config.pieces)).map((p, id) => ({ id, emoji: p.emoji, basket: p.basket, scale: p.scale ?? 1 }));
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ id: number; x: number; y: number } | null>(null);
  const [wobble, setWobble] = useState<number | null>(null);
  const [glow, setGlow] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const basketRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const pressRef = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const lastTapRef = useRef(0);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const ask = () => void narrator.say([set.askClip]);
  useEffect(() => {
    lastTapRef.current = Date.now();
    ask();
    const t = window.setInterval(() => {
      if (Date.now() - lastTapRef.current > REMIND_AFTER_MS) {
        lastTapRef.current = Date.now();
        ask();
      }
    }, 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drop = (pieceId: number, basketKey: string) => {
    lastTapRef.current = Date.now();
    const piece = pieces.find((p) => p.id === pieceId);
    if (!piece || piece.sortedInto || done) return;
    setSelected(null);
    if (piece.basket === basketKey) {
      sfx.pop();
      const next = pieces.map((p) => (p.id === pieceId ? { ...p, sortedInto: basketKey } : p));
      setPieces(next);
      setGlow(basketKey);
      later(() => setGlow((g) => (g === basketKey ? null : g)), 500);
      const basketEl = document.querySelector(`[data-basket="${basketKey}"]`);
      fx.squash(basketEl, 0.8);
      fx.burstAt(basketEl, 'stars', { count: 5, power: 0.8 });
      fx.haptic(10);
      if (next.every((p) => p.sortedInto)) {
        setDone(true);
        later(() => {
          sfx.sparkle();
          document.querySelectorAll('[data-basket]').forEach((b, i) => window.setTimeout(() => fx.jump(b, 28), i * 110));
          void narrator.say(['sort.all-sorted']);
          onCorrect(target);
        }, 400);
        later(onRoundComplete, 2400);
      }
      return;
    }
    sfx.boing();
    setWobble(pieceId);
    later(() => setWobble((w) => (w === pieceId ? null : w)), 600);
    const right = set.baskets.find((b) => b.key === piece.basket)!;
    void narrator.say(['sort.goes-in', right.clip]);
  };

  const basketAt = (x: number, y: number) =>
    set.baskets.find((b) => {
      const r = basketRefs.current[b.key]?.getBoundingClientRect();
      return r && x > r.left - 30 && x < r.right + 30 && y > r.top - 40 && y < r.bottom + 30;
    })?.key;

  const onDown = (e: ReactPointerEvent, id: number) => {
    // Keep following the finger even if it slides off (some browsers refuse; that's fine)
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* tap still works */
    }
    pressRef.current = { id, x: e.clientX, y: e.clientY, moved: false };
  };
  const onMove = (e: ReactPointerEvent) => {
    const p = pressRef.current;
    if (!p) return;
    if (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) < DRAG_THRESHOLD) return;
    p.moved = true;
    setDrag({ id: p.id, x: e.clientX, y: e.clientY });
  };
  const onUp = (e: ReactPointerEvent) => {
    const p = pressRef.current;
    pressRef.current = null;
    setDrag(null);
    if (!p) return;
    if (!p.moved) {
      // Tap: pick it up (or put it down again)
      sfx.flip();
      setSelected((s) => (s === p.id ? null : p.id));
      return;
    }
    const b = basketAt(e.clientX, e.clientY);
    if (b) drop(p.id, b);
  };

  const dragging = drag ? pieces.find((p) => p.id === drag.id) : undefined;

  return (
    <div className="sort-round">
      <header className="sort-top">
        <SpeakerButton onPress={ask} />
      </header>

      <div className="sort-pile">
        {pieces.map((p) =>
          p.sortedInto ? null : (
            <button
              key={p.id}
              type="button"
              className={`sort-piece ${selected === p.id ? 'sort-piece--selected' : ''} ${wobble === p.id ? 'sort-piece--wobble' : ''} ${drag?.id === p.id ? 'sort-piece--lifted' : ''}`}
              onPointerDown={(e) => onDown(e, p.id)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={() => {
                pressRef.current = null;
                setDrag(null);
              }}
              aria-label="Thing to sort"
            >
              <span style={{ fontSize: `calc(var(--piece) * 0.62 * ${p.scale})` }}>{p.emoji}</span>
            </button>
          ),
        )}
      </div>

      <div className="sort-baskets">
        {set.baskets.map((b) => (
          <button
            data-basket={b.key}
            key={b.key}
            ref={(el) => {
              basketRefs.current[b.key] = el;
            }}
            type="button"
            className={`sort-basket ${glow === b.key ? 'sort-basket--glow' : ''} ${selected !== null ? 'sort-basket--ready' : ''} ${done ? 'sort-basket--done' : ''}`}
            style={{ '--basket': b.colour ?? '#e8c39e' } as CSSProperties}
            onClick={() => {
              if (selected !== null) drop(selected, b.key);
              else void narrator.say([b.clip]);
            }}
            aria-label={narrator.allClips()[b.clip]}
          >
            <span className="sort-basket-icon" style={{ fontSize: `calc(var(--basket-icon) * ${b.scale ?? 1})` }}>
              {b.icon}
            </span>
            <span className="sort-basket-inside">
              {pieces
                .filter((p) => p.sortedInto === b.key)
                .map((p) => (
                  <span key={p.id} className="sort-in" style={{ fontSize: `${22 * p.scale + 6}px` }}>
                    {p.emoji}
                  </span>
                ))}
            </span>
          </button>
        ))}
      </div>

      {dragging && drag && (
        <div className="sort-drag" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          <span style={{ fontSize: `${64 * dragging.scale}px` }}>{dragging.emoji}</span>
        </div>
      )}
    </div>
  );
}

export const sort: Mechanic<SortConfig> = {
  Round: SortRound,
  clips: {
    'sort.title': 'Sort it!',
    'sort.goes-in': 'Oops! That one goes in',
    'sort.all-sorted': 'All sorted! Well done!',
  },
};

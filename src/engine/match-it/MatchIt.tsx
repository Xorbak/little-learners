import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FC } from 'react';
import type { ClipId, LearningItem, MatchItConfig, MatchWay } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import './matchIt.css';

/**
 * Match It: one thing at the top, cards underneath; she finds the card that
 * goes with it. The same item shown two ways ("faces", see LearningItem.faces):
 *   3  →  🍎🍎🍎        (a number and how many)      🍎🍎🍎  →  3
 *   S  →  s             (capital and small letter)    🐱  →  c  (first sound)
 *   red splat → 🍓      (a colour and a thing)        🍌  →  yellow splat
 *   circle → 🕐         (a shape and a thing)         🍕  →  triangle
 * Levels can go one way or both. With amounts, the right answer is counted out
 * loud, the things lighting up one by one.
 */

const REMIND_AFTER_MS = 12000;
const HINT_AFTER_MISSES = 2;
const COUNT_MS = 520;

const shuffle = <T,>(list: T[]): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

type View = FC<{ size: number; counting?: number }>;

/** An item's face ('display' = its own picture) */
function faceOf(item: LearningItem, face: string, seed: number): { View: View; clip?: ClipId } | null {
  if (face === 'display') return { View: item.Display };
  const f = item.faces?.[face];
  return f ? f(seed) : null;
}

const hasFace = (item: LearningItem | undefined, face: string) => !!item && (face === 'display' || !!item.faces?.[face]);

interface Card {
  item: LearningItem;
  View: View;
  clip?: ClipId;
}

function useSizes(count: number) {
  const measure = useCallback(() => {
    const w = window.innerWidth - 32;
    const h = window.innerHeight - 100;
    const landscape = w > h * 1.15;
    if (landscape) {
      // Prompt on the left, cards in a grid on the right
      const top = Math.min(260, h * 0.8, w * 0.32);
      const cols = count <= 2 ? 2 : count <= 4 ? 2 : 3;
      const rows = Math.ceil(count / cols);
      const area = w - top - 48;
      const card = Math.min(200, (area - 16 * (cols - 1)) / cols, (h - 16 * (rows - 1)) / rows);
      return { top: Math.floor(top), card: Math.floor(card), landscape, cols };
    }
    const top = Math.min(240, w * 0.5, h * 0.3);
    // Two across (a third card sits centred underneath): big enough to count ten things
    const cols = 2;
    const rows = Math.ceil(count / cols);
    const card = Math.min(200, (w - 16 * (cols - 1)) / cols, (h - top - 40 - 16 * (rows - 1)) / rows);
    return { top: Math.floor(top), card: Math.floor(card), landscape, cols };
  }, [count]);
  const [sizes, setSizes] = useState(measure);
  useEffect(() => {
    const update = () => setSizes(measure());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [measure]);
  return sizes;
}

function MatchItRound({ config, target, items, onCorrect, onWrong, onRoundComplete }: RoundProps<MatchItConfig>) {
  // This round: which way round, which variety of pictures, and the cards
  const [round] = useState(() => {
    const ways = config.ways.filter((w) => hasFace(target, w.show) && hasFace(target, w.pick));
    const way: MatchWay = ways[Math.floor(Math.random() * ways.length)] ?? config.ways[0];
    const seed = Math.floor(Math.random() * 1000);
    const others = shuffle(config.pool.filter((k) => k !== target.key && hasFace(items[k], way.pick))).slice(0, config.choices - 1);
    const cards: Card[] = shuffle([target.key, ...others]).map((k) => {
      const face = faceOf(items[k], way.pick, seed)!;
      return { item: items[k], View: face.View, clip: face.clip };
    });
    const top = faceOf(target, way.show, seed)!;
    return { way, cards, top };
  });
  const { way, cards, top } = round;
  const targetCard = cards.find((c) => c.item.key === target.key)!;
  const sizes = useSizes(cards.length);

  const [wobble, setWobble] = useState<string | null>(null);
  const [found, setFound] = useState(false);
  const [hint, setHint] = useState(false);
  const [counting, setCounting] = useState(0);
  const misses = useRef(0);
  const lastTap = useRef(0);
  const done = useRef(false);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  /** Fill in a phrase: $name, $top (what the top picture is called), $card, $key:<prefix>, $count */
  const phrase = useCallback(
    (clips: ClipId[]): ClipId[] =>
      clips.flatMap((c) => {
        if (c === '$name') return [target.nameClip];
        if (c === '$top') return [top.clip ?? target.nameClip];
        if (c === '$card') return [targetCard.clip ?? target.nameClip];
        if (c.startsWith('$key:')) return [`${c.slice(5)}.${target.key}`];
        if (c === '$count') return Array.from({ length: target.value ?? 0 }, (_, i) => `match.count.${i + 1}`);
        return [c];
      }),
    [target, top.clip, targetCard.clip],
  );

  const ask = useMemo(() => phrase(way.ask), [phrase, way.ask]);
  const sayAsk = useCallback(() => void narrator.say(ask), [ask]);

  useEffect(() => {
    lastTap.current = Date.now();
    sayAsk();
    const t = window.setInterval(() => {
      if (!done.current && Date.now() - lastTap.current > REMIND_AFTER_MS) {
        lastTap.current = Date.now();
        sayAsk();
      }
    }, 1000);
    return () => window.clearInterval(t);
  }, [sayAsk]);

  const tap = (card: Card, el: HTMLElement) => {
    if (done.current) return;
    lastTap.current = Date.now();
    if (card.item.key === target.key) {
      done.current = true;
      setFound(true);
      setHint(false);
      sfx.pop();
      fx.yay(el, { jump: 34 });
      onCorrect(target);
      const yes = phrase(way.yes);
      void narrator.say(yes);
      // Count the things out loud, lighting them up one by one
      const counts = way.yes.includes('$count') ? (target.value ?? 0) : 0;
      for (let i = 1; i <= counts; i++) later(() => setCounting(i), 250 + i * COUNT_MS);
      later(onRoundComplete, 1600 + counts * COUNT_MS);
      return;
    }
    sfx.boing();
    fx.wobble(el);
    setWobble(card.item.key);
    later(() => setWobble((w) => (w === card.item.key ? null : w)), 600);
    onWrong(target, card.item);
    void narrator.say(['match.oops', card.clip ?? card.item.nameClip, ...ask]);
    misses.current += 1;
    if (misses.current >= HINT_AFTER_MISSES) setHint(true);
  };

  const Top = top.View;
  return (
    <div className={`match-round ${sizes.landscape ? 'match-round--wide' : ''}`}>
      <header className="match-header">
        <SpeakerButton onPress={sayAsk} />
      </header>
      <div className="match-body">
        <div className="match-top" style={{ width: sizes.top, height: sizes.top }} aria-label="Match this">
          <Top size={Math.round(sizes.top * 0.86)} counting={counting} />
        </div>
        <div className="match-cards" style={{ maxWidth: sizes.cols * sizes.card + (sizes.cols - 1) * 16 }}>
          {cards.map((c, i) => {
            const isTarget = c.item.key === target.key;
            const classes = [
              'match-card',
              wobble === c.item.key && 'match-card--wobble',
              found && isTarget && 'match-card--found',
              found && !isTarget && 'match-card--fade',
              hint && isTarget && !found && 'match-card--hint',
            ]
              .filter(Boolean)
              .join(' ');
            const Face = c.View;
            return (
              <button
                key={c.item.key}
                type="button"
                className={classes}
                style={{ width: sizes.card, height: sizes.card, animationDelay: `${0.15 + i * 0.07}s` }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  tap(c, e.currentTarget);
                }}
                aria-label={narrator.allClips()[c.clip ?? c.item.nameClip]}
              >
                <Face size={Math.round(sizes.card * 0.86)} counting={found && isTarget ? counting : 0} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const matchIt: Mechanic<MatchItConfig> = {
  Round: MatchItRound,
  clips: {
    'match.title': 'Match it!',
    'match.oops': "Oops! That's",
    'match.yes': 'Yes!',
    'match.yes-thats': "Yes! That's",
    'match.yes-the': 'Yes! The',
    'match.thats': "that's",
    'match.is': 'is',
    'match.is-a': 'is a',
    ...Object.fromEntries(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'].map((w, i) => [`match.count.${i + 1}`, `${w},`])),
  },
};

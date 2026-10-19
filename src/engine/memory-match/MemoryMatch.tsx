import { useCallback, useEffect, useRef, useState } from 'react';
import type { ClipId, LearningItem, MemoryMatchConfig } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { progress } from '../../shared/progress/store';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import { CardBack, StinkyCloud } from './pictures';
import './memoryMatch.css';

/**
 * Memory Match
 * Cards lie face down. She turns over two: if they're the same they stay up,
 * if not they blow a raspberry and hide again. Works with any items.
 *
 * Mismatches are memory slips, not knowledge mistakes, so they are not recorded
 * as mix-ups in her progress.
 */

const STINKY = '__stinky__';
const REMIND_AFTER_MS = 12000;
/** After this many misses in a row, the partner of the next card she turns wiggles as a hint */
const HINT_AFTER_MISSES = 4;

type CardStatus = 'down' | 'up' | 'matched';
interface Card {
  id: number;
  itemKey: string;
  status: CardStatus;
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function dealCards(config: MemoryMatchConfig, target: LearningItem): Card[] {
  const totalPairs = Math.floor((config.rows * config.cols) / 2);
  const itemPairs = config.stinkyPair && totalPairs > 2 ? totalPairs - 1 : totalPairs;

  // Today's target always gets a pair; the rest come from the pool, repeating if needed
  const others = shuffle(config.pool.filter((k) => k !== target.key));
  const order = [target.key, ...others];
  const keys = Array.from({ length: itemPairs }, (_, i) => order[i % order.length]);
  if (itemPairs < totalPairs) keys.push(STINKY);

  return shuffle(keys.flatMap((k) => [k, k])).map((itemKey, id) => ({ id, itemKey, status: 'down' }));
}

/** Fit the grid to the screen; turn it sideways when the screen is taller than wide */
function useBoardLayout(rows: number, cols: number) {
  const measure = useCallback(() => {
    const width = window.innerWidth - 32;
    const height = window.innerHeight - 150;
    const landscape = width >= height;
    const r = landscape ? Math.min(rows, cols) : Math.max(rows, cols);
    const c = landscape ? Math.max(rows, cols) : Math.min(rows, cols);
    const gap = r * c > 20 ? 8 : 14;
    const size = Math.floor(Math.min((width - gap * (c - 1)) / c, (height - gap * (r - 1)) / r, 220));
    return { rows: r, cols: c, gap, size };
  }, [rows, cols]);

  const [layout, setLayout] = useState(measure);
  useEffect(() => {
    const update = () => setLayout(measure());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [measure]);
  return layout;
}

function MemoryMatchRound({ config, target, items, onRoundComplete }: RoundProps<MemoryMatchConfig>) {
  const [cards, setCards] = useState(() => dealCards(config, target));
  const [peeking, setPeeking] = useState(() => (config.peekSeconds ?? 0) > 0);
  const [busy, setBusy] = useState(false);
  const [wobbling, setWobbling] = useState<number[]>([]);
  const [hintId, setHintId] = useState<number | null>(null);
  const [stinkCloud, setStinkCloud] = useState(false);
  const layout = useBoardLayout(config.rows, config.cols);

  const firstRef = useRef<number | null>(null);
  const missStreak = useRef(0);
  const lastTapRef = useRef(0);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const totalPairs = cards.length / 2;
  const pairsFound = cards.filter((c) => c.status === 'matched').length / 2;
  const finished = pairsFound === totalPairs;

  const nameOf = (key: string): ClipId => (key === STINKY ? 'memory.stinky-name' : items[key].nameClip);

  const sayPrompt = useCallback(() => void narrator.say(['memory.find-two']), []);

  // Start: optional peek at all the cards, then ask
  useEffect(() => {
    lastTapRef.current = Date.now();
    const peekMs = (config.peekSeconds ?? 0) * 1000;
    if (peekMs > 0) {
      void narrator.say(['memory.look']);
      const t = window.setTimeout(() => {
        sfx.flip();
        setPeeking(false);
        sayPrompt();
        lastTapRef.current = Date.now();
      }, peekMs);
      return () => window.clearTimeout(t);
    }
    sayPrompt();
  }, [config.peekSeconds, sayPrompt]);

  // Gentle reminder if nothing happens for a while
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!peeking && !finished && Date.now() - lastTapRef.current > REMIND_AFTER_MS) {
        lastTapRef.current = Date.now();
        sayPrompt();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [peeking, finished, sayPrompt]);

  useEffect(() => {
    if (!finished) return;
    const t = window.setTimeout(onRoundComplete, 1100);
    return () => window.clearTimeout(t);
  }, [finished, onRoundComplete]);

  const setStatus = (ids: number[], status: CardStatus) =>
    setCards((list) => list.map((c) => (ids.includes(c.id) ? { ...c, status } : c)));

  const handleTap = (card: Card) => {
    if (peeking || busy || finished || card.status !== 'down') return;
    lastTapRef.current = Date.now();
    sfx.flip();
    setStatus([card.id], 'up');
    const silly = progress.sillySounds();

    // First card of the pair
    if (firstRef.current === null) {
      firstRef.current = card.id;
      if (card.itemKey === STINKY && silly) {
        sfx.fart('squeak');
        void narrator.say(['memory.stinky-flip']);
      } else {
        void narrator.say([nameOf(card.itemKey)]);
      }
      if (missStreak.current >= HINT_AFTER_MISSES) {
        const partner = cards.find((c) => c.id !== card.id && c.itemKey === card.itemKey && c.status === 'down');
        if (partner) setHintId(partner.id);
      }
      return;
    }

    // Second card
    const first = cards.find((c) => c.id === firstRef.current)!;
    firstRef.current = null;
    setHintId(null);
    setBusy(true);
    const pair = [first.id, card.id];

    if (first.itemKey === card.itemKey) {
      missStreak.current = 0;
      if (card.itemKey === STINKY && silly) {
        // The big one
        later(() => {
          sfx.fart('big');
          setStinkCloud(true);
          void narrator.say(['memory.stinky-match']);
        }, 250);
        later(() => setStinkCloud(false), 2600);
        later(() => {
          setStatus(pair, 'matched');
          setBusy(false);
        }, 1600);
      } else {
        sfx.pop();
        void narrator.say([nameOf(card.itemKey)]);
        later(() => {
          setStatus(pair, 'matched');
          setBusy(false);
        }, 500);
      }
      return;
    }

    // Not the same: say the second one's name, then a raspberry, then hide them again
    missStreak.current += 1;
    void narrator.say([nameOf(card.itemKey)]);
    later(() => {
      setWobbling(pair);
      if (silly) {
        sfx.fart(Math.random() < 0.25 ? 'squeak' : 'pfft');
        later(() => void narrator.say([pick(SILLY_MISS_LINES)]), 450);
      } else {
        sfx.boing();
        void narrator.say(['memory.not-same']);
      }
    }, 900);
    later(() => {
      setWobbling([]);
      setStatus(pair, 'down');
      setBusy(false);
    }, 2300);
  };

  return (
    <div className="mem-round">
      <header className="mem-prompt">
        <SpeakerButton onPress={sayPrompt} />
        <div className="mem-counter" aria-label={`${pairsFound} of ${totalPairs} pairs found`}>
          {Array.from({ length: totalPairs }, (_, i) => (
            <span key={i} className={`mem-dot ${i < pairsFound ? 'mem-dot--done' : ''}`} />
          ))}
        </div>
      </header>

      <div className="mem-board-wrap">
        <div
          className="mem-board"
          style={{
            gridTemplateColumns: `repeat(${layout.cols}, ${layout.size}px)`,
            gridAutoRows: `${layout.size}px`,
            gap: layout.gap,
          }}
        >
          {cards.map((card) => {
            const faceUp = peeking || card.status !== 'down';
            const stinky = card.itemKey === STINKY;
            const Face = stinky ? null : items[card.itemKey].Display;
            const classes = [
              'mem-card',
              faceUp && 'mem-card--up',
              card.status === 'matched' && 'mem-card--matched',
              wobbling.includes(card.id) && 'mem-card--wobble',
              hintId === card.id && 'mem-card--hint',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <button
                key={card.id}
                type="button"
                className={classes}
                onClick={() => handleTap(card)}
                aria-label={faceUp ? narrator.allClips()[nameOf(card.itemKey)] : 'Card'}
              >
                <span className="mem-card-inner">
                  <span className="mem-face mem-face--back">
                    <CardBack />
                  </span>
                  <span className="mem-face mem-face--front">
                    {Face ? <Face size={Math.round(layout.size * 0.62)} /> : <StinkyCloud size={Math.round(layout.size * 0.8)} />}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {stinkCloud && (
        <div className="stink-cloud" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className="stink-puff" style={{ left: `${8 + i * 10}%`, animationDelay: `${(i % 3) * 0.15}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}

const SILLY_MISS_LINES: ClipId[] = ['memory.oops', 'memory.excuse-me', 'memory.who-did-that', 'memory.cards-tooted'];

export const memoryMatch: Mechanic<MemoryMatchConfig> = {
  Round: MemoryMatchRound,
  clips: {
    'memory.title': 'Memory match!',
    'memory.find-two': 'Turn over two cards. Find two the same!',
    'memory.look': 'Look at all the cards! Try to remember where they are.',
    'memory.not-same': 'Not the same. They hide again!',
    'memory.oops': 'Oops! Not the same!',
    'memory.excuse-me': 'Excuse me!',
    'memory.who-did-that': 'Hee hee! Who did that?',
    'memory.cards-tooted': 'The cards did a toot!',
    'memory.stinky-name': 'stinky',
    'memory.stinky-flip': 'Ooh, a stinky card! Find the other one!',
    'memory.stinky-match': 'Pee-yew! You found the stinky pair!',
  },
};

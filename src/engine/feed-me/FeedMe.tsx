import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { ClipId, FeedMeConfig, LearningItem } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { progress } from '../../shared/progress/store';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import { fx } from '../../shared/fx';
import { ANIMALS, FOODS, feedClips, type AnimalId, type FoodId } from './world';
import './feedMe.css';

/**
 * Feed Me
 * "Bunny wants three carrots!" She drags (or taps) food to the animal, which
 * munches and counts aloud. Too many: "I'm so full!" and the extra comes back.
 * Early levels finish by themselves at the right amount; later ones wait for
 * her to press "Here you go!" so she decides when to stop.
 */

const REMIND_AFTER_MS = 12000;
/** How far outside the animal a drop still counts (px): be generous with small hands */
const DROP_MARGIN = 90;
/** Finger movement before a press becomes a drag rather than a tap */
const DRAG_THRESHOLD = 10;
/** How long food takes to fly into the mouth */
const FLY_MS = 420;

interface Flying {
  key: number;
  emoji: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** A piece of food flying in an arc into the animal's mouth, shrinking as it goes in */
function FlyingFood({ emoji, x0, y0, x1, y1 }: Omit<Flying, 'key'>) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const lift = Math.min(180, 70 + Math.hypot(x1 - x0, y1 - y0) * 0.3);
    const spin = x1 > x0 ? 1 : -1;
    const frames: Keyframe[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const x = (x1 - x0) * t;
      const y = (y1 - y0) * t - 4 * lift * t * (1 - t);
      const sc = t < 0.15 ? 1 + t * 1.2 : 1.18 - 0.6 * ((t - 0.15) / 0.85) ** 2;
      frames.push({ transform: `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(spin * 300 * t).toFixed(0)}deg) scale(${sc.toFixed(3)})` });
    }
    ref.current?.animate(frames, { duration: FLY_MS, easing: 'cubic-bezier(.35,.1,.6,1)', fill: 'forwards' });
  }, [x0, y0, x1, y1]);
  return (
    <div ref={ref} className="feed-fly" style={{ left: x0, top: y0 }} aria-hidden="true">
      {emoji}
    </div>
  );
}

type Mood = 'idle' | 'chomp' | 'shake' | 'full' | 'hungry' | 'happy';

interface PileFood {
  id: number;
  food: FoodId;
  eaten: boolean;
  /** Just pushed back after too many: plays a bounce-in */
  returned?: boolean;
}

interface Want {
  food: FoodId;
  item: LearningItem;
  count: number;
  showDots: boolean;
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Crumb colour for each food */
const crumbColour = (food: FoodId): string =>
  ({ carrot: '#ff922b', apple: '#ffe8cc', banana: '#ffe066', grapes: '#9775fa', cheese: '#ffd43b', strawberry: '#ff6b6b', bone: '#f1f3f5', cookie: '#c08552' })[food as string] ?? '#d9a066';

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
const countOf = (item: LearningItem) => item.value ?? Number(item.key);
const foodClip = (food: FoodId, n: number): ClipId => `feed.food.${food}.${n === 1 ? 'one' : 'many'}`;

function setUpRound(config: FeedMeConfig, target: LearningItem, items: Record<string, LearningItem>, isKnown: (i: LearningItem) => boolean) {
  const animalId = pick(Object.keys(ANIMALS) as AnimalId[]);
  const animal = ANIMALS[animalId];
  const dotsFor = (item: LearningItem) => config.dots === 'always' || (config.dots === 'until-known' && !isKnown(item));

  const wants: Want[] = [{ food: animal.foods[0], item: target, count: countOf(target), showDots: dotsFor(target) }];
  if (config.secondFoodPool?.length) {
    const second = items[pick(config.secondFoodPool)];
    wants.push({ food: animal.foods[1], item: second, count: countOf(second), showDots: dotsFor(second) });
  }

  const pile: FoodId[] = [];
  wants.forEach((w, i) => {
    const extra = i === 0 ? config.extraFood : Math.min(config.extraFood, 1);
    for (let n = 0; n < w.count + extra; n++) pile.push(w.food);
  });
  // Wrong foods come from other animals, so Bunny is never offered her own apples as "wrong"
  const ownFoods = new Set<FoodId>(animal.foods);
  const otherFoods = (Object.keys(FOODS) as FoodId[]).filter((f) => !ownFoods.has(f));
  // A mix of different decoys rather than six of the same thing
  const decoys = shuffle(otherFoods);
  for (let n = 0; n < (config.wrongFood ?? 0); n++) pile.push(decoys[n % decoys.length]);

  return {
    animalId,
    wants,
    pile: shuffle(pile).map((food, id): PileFood => ({ id, food, eaten: false })),
  };
}

function FeedMeRound({ config, target, items, onCorrect, onWrong, onRoundComplete, isKnown }: RoundProps<FeedMeConfig>) {
  const [round] = useState(() => setUpRound(config, target, items, isKnown));
  const { animalId, wants } = round;
  const animal = ANIMALS[animalId];

  const [pile, setPile] = useState(round.pile);
  const [mood, setMood] = useState<Mood>('idle');
  const [drag, setDrag] = useState<{ id: number; x: number; y: number; over: boolean } | null>(null);
  const [done, setDone] = useState(false);
  const [flying, setFlying] = useState<Flying[]>([]);

  const animalRef = useRef<HTMLDivElement>(null);
  const flyKey = useRef(0);
  /** Where the mouth is, on screen */
  const mouth = () => {
    const r = animalRef.current?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height * 0.62 } : { x: window.innerWidth / 2, y: window.innerHeight / 3 };
  };
  const busyRef = useRef(false);
  const doneRef = useRef(false);
  const eatenRef = useRef<Partial<Record<FoodId, number>>>({});
  const pressRef = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const lastTapRef = useRef(0);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const request = useCallback((): ClipId[] => {
    const [first, second] = wants;
    const phrase: ClipId[] = [`feed.wants.${animalId}`, first.item.nameClip, foodClip(first.food, first.count)];
    if (second) phrase.push('feed.and', second.item.nameClip, foodClip(second.food, second.count));
    return phrase;
  }, [wants, animalId]);

  const sayRequest = useCallback(() => void narrator.say(request()), [request]);

  // Ask at the start, and gently remind her if nothing happens for a while
  useEffect(() => {
    lastTapRef.current = Date.now();
    sayRequest();
    const timer = window.setInterval(() => {
      if (!doneRef.current && !busyRef.current && Date.now() - lastTapRef.current > REMIND_AFTER_MS) {
        lastTapRef.current = Date.now();
        sayRequest();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sayRequest]);

  const eaten = (food: FoodId) => eatenRef.current[food] ?? 0;
  const allRight = () => wants.every((w) => eaten(w.food) === w.count);

  const finish = () => {
    doneRef.current = true;
    busyRef.current = true;
    setDone(true);
    later(() => {
      setMood('happy');
      void narrator.say(['feed.yum']);
      const m = mouth();
      fx.burst(m.x, m.y - 40, 'hearts', { count: 7 });
      fx.burst(m.x, m.y - 40, 'stars', { count: 8 });
      sfx.sparkle();
      fx.haptic('big-win');
      onCorrect(target);
    }, 450 + FLY_MS);
    later(onRoundComplete, 2300 + FLY_MS);
  };

  const feed = (id: number, from?: { x: number; y: number }) => {
    if (busyRef.current || doneRef.current) return;
    const piece = pile.find((p) => p.id === id);
    if (!piece || piece.eaten) return;
    lastTapRef.current = Date.now();
    const want = wants.find((w) => w.food === piece.food);

    // Not something this animal eats: a polite "no thank you", food stays in the pile
    if (!want) {
      busyRef.current = true;
      setMood('shake');
      sfx.boing();
      fx.wobble(document.querySelector(`[data-food-id="${id}"]`));
      void narrator.say(['feed.no-thanks', 'feed.i-eat', foodClip(wants[0].food, 2)]);
      later(() => {
        setMood('idle');
        busyRef.current = false;
      }, 1500);
      return;
    }

    const count = eaten(piece.food) + 1;
    eatenRef.current = { ...eatenRef.current, [piece.food]: count };
    setPile((list) => list.map((p) => (p.id === id ? { ...p, eaten: true, returned: false } : p)));

    // It flies into the mouth on an arc; the munch happens when it lands
    const m = mouth();
    const start = from ?? { x: window.innerWidth / 2, y: window.innerHeight - 80 };
    const key = ++flyKey.current;
    setFlying((list) => [...list, { key, emoji: FOODS[piece.food].emoji, x0: start.x, y0: start.y, x1: m.x, y1: m.y }]);
    sfx.whoosh();
    later(() => setFlying((list) => list.filter((f) => f.key !== key)), FLY_MS + 30);
    later(() => {
      setMood('chomp');
      sfx.munch();
      fx.burst(m.x, m.y + 10, 'crumbs', { count: 7, colour: crumbColour(piece.food) });
      fx.haptic('pop');
      const countClip = items[String(count)]?.nameClip;
      if (countClip) void narrator.say([countClip]);
    }, FLY_MS);

    if (count > want.count) {
      // Too many: so full! The extra one comes back
      busyRef.current = true;
      onWrong(target, items[String(count)] ?? target);
      later(() => {
        setMood('full');
        if (progress.sillySounds()) {
          if (Math.random() < 0.5) sfx.burp();
          else {
            sfx.fart('pfft');
            const r = animalRef.current?.getBoundingClientRect();
            if (r) fx.burst(r.left + r.width * 0.3, r.bottom - 10, 'stink', { count: 6 });
          }
        } else {
          sfx.boing();
        }
        later(() => void narrator.say(['feed.full', 'feed.too-many']), 700);
      }, 600 + FLY_MS);
      later(() => {
        eatenRef.current = { ...eatenRef.current, [piece.food]: count - 1 };
        setPile((list) => list.map((p) => (p.id === id ? { ...p, eaten: false, returned: true } : p)));
        setMood('idle');
        busyRef.current = false;
      }, 3200 + FLY_MS);
      return;
    }

    if (config.autoComplete && allRight()) {
      finish();
      return;
    }
    later(() => setMood((md) => (md === 'chomp' ? 'idle' : md)), 500 + FLY_MS);
  };

  const hereYouGo = () => {
    if (busyRef.current || doneRef.current) return;
    lastTapRef.current = Date.now();
    if (allRight()) {
      finish();
      return;
    }
    // Not enough yet: rub tummy and ask again
    busyRef.current = true;
    setMood('hungry');
    onWrong(target, items[String(eaten(wants[0].food))] ?? target);
    void narrator.say(['feed.hungry', ...request()]);
    later(() => {
      setMood('idle');
      busyRef.current = false;
    }, 2600);
  };

  // ---- Dragging (tap also works) ----
  const overAnimal = (x: number, y: number) => {
    const r = animalRef.current?.getBoundingClientRect();
    if (!r) return false;
    return x > r.left - DROP_MARGIN && x < r.right + DROP_MARGIN && y > r.top - DROP_MARGIN && y < r.bottom + DROP_MARGIN;
  };

  const onPointerDown = (e: ReactPointerEvent, id: number) => {
    if (doneRef.current) return;
    // Keep following the finger even if it slides off (some browsers refuse; that's fine)
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* tap still works */
    }
    pressRef.current = { id, x: e.clientX, y: e.clientY, moved: false };
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const press = pressRef.current;
    if (!press) return;
    if (!press.moved && Math.hypot(e.clientX - press.x, e.clientY - press.y) < DRAG_THRESHOLD) return;
    press.moved = true;
    setDrag({ id: press.id, x: e.clientX, y: e.clientY, over: overAnimal(e.clientX, e.clientY) });
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    const press = pressRef.current;
    pressRef.current = null;
    setDrag(null);
    if (!press) return;
    if (press.moved && overAnimal(e.clientX, e.clientY)) feed(press.id, { x: e.clientX, y: e.clientY });
    else if (!press.moved) {
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      feed(press.id, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    }
  };

  const onPointerCancel = () => {
    pressRef.current = null;
    setDrag(null);
  };

  const dragging = drag ? pile.find((p) => p.id === drag.id) : undefined;

  return (
    <div className="feed-round">
      <header className="feed-top">
        <SpeakerButton onPress={sayRequest} />
      </header>

      <div className="feed-stage">
        <div className="feed-animal-col">
          <div
            ref={animalRef}
            className={`feed-animal feed-animal--${mood} ${drag?.over ? 'feed-animal--ready' : ''}`}
            role="img"
            aria-label={narrator.allClips()[`feed.wants.${animalId}`]}
          >
            {animal.emoji}
            {mood === 'happy' && <span className="feed-hearts" aria-hidden="true">💖</span>}
          </div>
          <div className="feed-plate" aria-label="Eaten">
            {wants.map((w) => (
              <span key={w.food} className="feed-plate-row">
                {Array.from({ length: Math.min(pile.filter((p) => p.eaten && p.food === w.food).length, 12) }, (_, i) => (
                  <span key={i} className="feed-plate-food">
                    {FOODS[w.food].emoji}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <div className="feed-bubble" aria-label="What I want">
          {wants.map((w) => (
            <div key={w.food} className="feed-want">
              <div className="feed-want-row">
                <w.item.Display size={wants.length > 1 ? 72 : 96} />
                <span className="feed-want-food">{FOODS[w.food].emoji}</span>
              </div>
              {w.showDots && (
                <div className="feed-dots">
                  {Array.from({ length: w.count }, (_, i) => (
                    <span key={i} className="feed-dot" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="feed-bottom">
        <div className="feed-pile">
          {pile.map((p) => (
            <button
              key={p.id}
              type="button"
              data-food-id={p.id}
              className={`feed-food ${p.eaten ? 'feed-food--eaten' : ''} ${p.returned ? 'feed-food--returned' : ''} ${drag?.id === p.id ? 'feed-food--lifted' : ''}`}
              onPointerDown={(e) => onPointerDown(e, p.id)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              aria-label={narrator.allClips()[foodClip(p.food, 1)]}
              disabled={p.eaten}
            >
              {FOODS[p.food].emoji}
            </button>
          ))}
        </div>

        {!config.autoComplete && (
          <button type="button" className="feed-give" onClick={hereYouGo} aria-label="Here you go!" disabled={done}>
            🍽️
          </button>
        )}
      </div>

      {flying.map((f) => (
        <FlyingFood key={f.key} emoji={f.emoji} x0={f.x0} y0={f.y0} x1={f.x1} y1={f.y1} />
      ))}

      {dragging && drag && (
        <div className="feed-drag" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          {FOODS[dragging.food].emoji}
        </div>
      )}
    </div>
  );
}

export const feedMe: Mechanic<FeedMeConfig> = {
  Round: FeedMeRound,
  clips: feedClips,
};

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ShareConfig } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import '../touch-it/touchIt.css';
import './share.css';

/**
 * Share It Fairly: two or three friends, a pile of treats. She taps a friend to
 * give them one ("one for you, one for you…"); tapping a treat on a plate takes
 * it back. When the pile is empty: if everyone has the same, they all eat
 * ("That's fair! Everyone has three!"); if not, the friend with fewer looks sad
 * and she can move treats until it's fair. Equal groups, without any sums.
 */

const FRIENDS = [
  { emoji: '🧸', clip: 'share.teddy' },
  { emoji: '🐰', clip: 'share.bunny' },
  { emoji: '🐵', clip: 'share.monkey' },
  { emoji: '🐼', clip: 'share.panda' },
  { emoji: '🦊', clip: 'share.fox' },
];
const TREATS = [
  { emoji: '🍪', clip: 'share.cookies' },
  { emoji: '🍓', clip: 'share.strawberries' },
  { emoji: '🧁', clip: 'share.cupcakes' },
  { emoji: '🍌', clip: 'share.bananas' },
  { emoji: '🍬', clip: 'share.sweets' },
];

const rand = (from: number, to: number) => from + Math.floor(Math.random() * (to - from + 1));
const shuffle = <T,>(list: T[]): T[] => [...list].sort(() => Math.random() - 0.5);

function useSizes(friends: number, treats: number) {
  const measure = useCallback(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const small = W <= 600 || H <= 500;
    const w = W - 32;
    const h = H - (small ? 76 : 92) - 24;
    const friend = Math.floor(Math.min(200, (w - 16 * (friends - 1)) / friends, h * 0.5));
    const treat = Math.floor(Math.min(64, (w - 8 * 6) / 6, (h - friend - 20) / Math.ceil(treats / 6) - 8));
    return { friend, treat };
  }, [friends, treats]);
  const [sizes, setSizes] = useState(measure);
  useEffect(() => {
    const update = () => setSizes(measure());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [measure]);
  return sizes;
}

function ShareRound({ config, target, onCorrect, onWrong, onRoundComplete }: RoundProps<ShareConfig>) {
  const [setup] = useState(() => {
    const count = rand(config.friends[0], config.friends[1]);
    const each = rand(config.each[0], config.each[1]);
    return { friends: shuffle(FRIENDS).slice(0, count), treat: TREATS[Math.floor(Math.random() * TREATS.length)], each, total: count * each };
  });
  const { friends, treat, total } = setup;
  const [plates, setPlates] = useState<number[]>(() => friends.map(() => 0));
  const [state, setState] = useState<'sharing' | 'unfair' | 'fair'>('sharing');
  const sizes = useSizes(friends.length, total);
  const pile = total - plates.reduce((a, b) => a + b, 0);
  const missed = useRef(false);
  const alive = useRef(true);
  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );

  const ask = useCallback(() => void narrator.say(['share.share-the', treat.clip, 'share.fairly']), [treat.clip]);
  useEffect(() => {
    ask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const check = (now: number[]) => {
    if (now.reduce((a, b) => a + b, 0) < total) return;
    const most = Math.max(...now);
    const least = Math.min(...now);
    if (most === least) {
      setState('fair');
      if (!missed.current) onCorrect(target);
      fx.yay(undefined, { stars: 16 });
      void (async () => {
        await narrator.say(['share.fair', 'share.everyone-has', `numbers.name.${most}`]);
        if (!alive.current) return;
        sfx.munch();
        await new Promise((r) => setTimeout(r, 700));
        if (alive.current) onRoundComplete();
      })();
    } else {
      setState('unfair');
      if (!missed.current) onWrong(target, target);
      missed.current = true;
      sfx.boing();
      const rich = friends[now.indexOf(most)];
      const poor = friends[now.indexOf(least)];
      void narrator.say(['share.not-fair', rich.clip, 'share.has-more-than', poor.clip, 'share.take-back']);
    }
  };

  const give = (i: number, el: HTMLElement) => {
    if (state === 'fair' || pile <= 0) return;
    const now = plates.map((n, k) => (k === i ? n + 1 : n));
    setPlates(now);
    sfx.pop();
    fx.squash(el, 0.6);
    if (state === 'unfair') setState('sharing');
    check(now);
  };

  const takeBack = (i: number) => {
    if (state === 'fair' || plates[i] === 0) return;
    setPlates(plates.map((n, k) => (k === i ? n - 1 : n)));
    sfx.flip();
    setState('sharing');
  };

  const most = Math.max(...plates);
  const least = Math.min(...plates);

  return (
    <div className="share-round">
      <header className="touch-top">
        <SpeakerButton onPress={ask} />
      </header>
      <div className="share-friends">
        {friends.map((f, i) => {
          const sad = state === 'unfair' && plates[i] === least;
          const greedy = state === 'unfair' && plates[i] === most;
          return (
            <div key={f.clip} className="share-friend" style={{ width: sizes.friend }}>
              <button
                type="button"
                className={`share-friend-btn ${state === 'fair' ? 'share-friend-btn--happy' : ''}`}
                style={{ fontSize: sizes.friend * 0.5, animationDelay: `${i * 0.15}s` } as CSSProperties}
                onPointerDown={(e) => {
                  e.preventDefault();
                  give(i, e.currentTarget);
                }}
                aria-label={`Give ${narrator.allClips()[f.clip]} one`}
              >
                {f.emoji}
                {sad && <span className="share-mood">😢</span>}
                {state === 'fair' && <span className="share-mood">😋</span>}
              </button>
              <div
                className={`share-plate ${greedy ? 'share-plate--hint' : ''}`}
                style={{ minHeight: sizes.treat * 1.3 }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  give(i, e.currentTarget);
                }}
              >
                {Array.from({ length: plates[i] }, (_, k) => (
                  <button
                    key={k}
                    type="button"
                    className="share-treat share-treat--on-plate"
                    style={{ fontSize: sizes.treat * 0.6, width: sizes.treat * 0.75, height: sizes.treat * 0.75 }}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      takeBack(i);
                    }}
                    aria-label="Take it back"
                  >
                    {treat.emoji}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="share-pile" aria-label={`${pile} left`}>
        {Array.from({ length: pile }, (_, k) => (
          <span key={k} className="share-treat" style={{ fontSize: sizes.treat * 0.75, width: sizes.treat, height: sizes.treat, animationDelay: `${k * 0.04}s` }}>
            {treat.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}

export const share: Mechanic<ShareConfig> = {
  Round: ShareRound,
  clips: {
    'share.share-the': 'Share the',
    'share.fairly': 'so everyone gets the same! Tap a friend to give them one.',
    'share.fair': "That's fair!",
    'share.everyone-has': 'Everyone has',
    'share.not-fair': "Oh no! That's not fair.",
    'share.has-more-than': 'has more than',
    'share.take-back': 'Tap a treat on a plate to take it back.',
    'share.teddy': 'Teddy',
    'share.bunny': 'Bunny',
    'share.monkey': 'Monkey',
    'share.panda': 'Panda',
    'share.fox': 'Fox',
    'share.cookies': 'cookies,',
    'share.strawberries': 'strawberries,',
    'share.cupcakes': 'cupcakes,',
    'share.bananas': 'bananas,',
    'share.sweets': 'sweets,',
  },
};

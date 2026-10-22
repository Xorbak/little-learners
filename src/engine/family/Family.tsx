import { useEffect, useRef, useState } from 'react';
import type { FamilyConfig } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { family, familyClip, type FamilyMember } from '../../shared/family';
import { Pic } from '../../shared/ui/scenes';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import { useChoiceSize } from '../touch-it/TouchIt';
import '../touch-it/touchIt.css';
import '../say-it/sayIt.css';
import '../about-me/aboutMe.css';

/**
 * My Family: photos a grown-up added. First "Who is this? … It's Gogo!" with
 * one photo; then "Touch Mama!" with two, three or four photos.
 */

let last: string | undefined;
const shuffle = <T,>(list: T[]): T[] => [...list].sort(() => Math.random() - 0.5);

function FamilyRound({ config, target, onCorrect, onWrong, onRoundComplete }: RoundProps<FamilyConfig>) {
  const [deal] = useState(() => {
    const all = family.all();
    if (!all.length) return null;
    const fresh = all.filter((m) => m.id !== last);
    const who = (fresh.length ? fresh : all)[Math.floor(Math.random() * (fresh.length || all.length))];
    last = who.id;
    const others = shuffle(all.filter((m) => m !== who)).slice(0, Math.max(0, config.choices - 1));
    return { who, cards: shuffle([who, ...others]) };
  });
  const meet = !deal || deal.cards.length === 1;
  const size = useChoiceSize(deal?.cards.length ?? 1);
  const [named, setNamed] = useState(false);
  const [found, setFound] = useState(false);
  const [wobble, setWobble] = useState<string | null>(null);
  const missed = useRef(false);
  const alive = useRef(true);
  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );

  const ask = () => deal && void narrator.say(meet ? ['fam.who-is-this'] : ['fam.touch', familyClip(deal.who)]);

  useEffect(() => {
    void (async () => {
      if (!deal) {
        await narrator.say(['fam.none']);
        if (alive.current) window.setTimeout(onRoundComplete, 600);
        return;
      }
      if (!meet) return ask();
      await narrator.say(['fam.who-is-this']);
      await new Promise((r) => setTimeout(r, 2200));
      if (!alive.current) return;
      setNamed(true);
      sfx.pop();
      await narrator.say(['fam.its', familyClip(deal.who), 'fam.say-hello', familyClip(deal.who)]);
      if (!alive.current) return;
      onCorrect(target);
      window.setTimeout(onRoundComplete, 800);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = (m: FamilyMember, el: HTMLElement) => {
    if (!deal || meet || found) return;
    if (m.id === deal.who.id) {
      setFound(true);
      sfx.pop();
      fx.yay(el, { jump: 40 });
      if (!missed.current) onCorrect(target);
      void (async () => {
        await narrator.say(['fam.yes', familyClip(m)]);
        if (alive.current) window.setTimeout(onRoundComplete, 500);
      })();
      return;
    }
    sfx.boing();
    setWobble(m.id);
    window.setTimeout(() => alive.current && setWobble(null), 600);
    if (!missed.current) onWrong(target, target);
    missed.current = true;
    void narrator.say(['fam.thats', familyClip(m), 'fam.touch', familyClip(deal.who)]);
  };

  if (!deal) {
    return (
      <div className="touch-round sayit-round">
        <header className="touch-top" />
        <div className="sayit-body">
          <div className="me-card">
            <Pic e="📷" size={Math.min(window.innerWidth * 0.4, 180)} />
            <p className="me-words me-words--small">Grown-ups: add family photos in the grown-ups area (hold the ⚙️ button).</p>
          </div>
        </div>
      </div>
    );
  }

  if (meet) {
    const big = Math.min(window.innerWidth * 0.7, window.innerHeight * 0.5, 360);
    return (
      <div className="touch-round sayit-round">
        <header className="touch-top">
          <SpeakerButton onPress={() => void narrator.say(named ? ['fam.its', familyClip(deal.who)] : ['fam.who-is-this'])} />
        </header>
        <div className="sayit-body">
          <img className="family-photo" src={deal.who.photo} alt="" style={{ width: big, height: big }} />
          <p className="family-name" style={{ visibility: named ? 'visible' : 'hidden' }}>
            {deal.who.name}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="touch-round">
      <header className="touch-top">
        <SpeakerButton onPress={ask} />
      </header>
      <div className="touch-field">
        {deal.cards.map((m, i) => (
          <button
            key={m.id}
            type="button"
            className={['touch-choice', 'family-card', wobble === m.id && 'touch-choice--wobble', found && m.id === deal.who.id && 'touch-choice--found', found && m.id !== deal.who.id && 'touch-choice--fade'].filter(Boolean).join(' ')}
            style={{ width: size, height: size, animationDelay: `${i * 0.07}s` }}
            onPointerDown={(e) => {
              e.preventDefault();
              tap(m, e.currentTarget);
            }}
            aria-label={m.name}
            data-right={m.id === deal.who.id ? 'true' : undefined}
          >
            <img src={m.photo} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}

export const familyGame: Mechanic<FamilyConfig> = {
  Round: FamilyRound,
  clips: {
    'fam.who-is-this': 'Who is this?',
    'fam.its': "It's",
    'fam.say-hello': '! Say hello to',
    'fam.touch': 'Touch',
    'fam.yes': "Yes! That's",
    'fam.thats': "That's",
    'fam.none': 'Ask a grown-up to add photos of your family, and then we can play!',
  },
};

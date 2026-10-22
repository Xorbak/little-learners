import { useEffect, useRef, useState } from 'react';
import type { BeatsConfig } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { Pic } from '../../shared/ui/scenes';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import '../touch-it/touchIt.css';
import './beats.css';

/**
 * Beats: tap the drum once for each part.
 *  - 'syllables': clap the word (el-e-phant: 3 taps)
 *  - 'words': count the words in a sentence (I like cake: 3 taps)
 *  - 'copy': copy the drum pattern she hears
 * With `demo`, the narrator does it first while the drum bounces; with `guide`,
 * each tap says the next part, so she hears the word broken up as she taps.
 * She stops tapping and the drum checks: too few ("There's more!") or too many
 * shows it again, together.
 */

const DONE_AFTER_MS = 1700;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function BeatsRound({ config, target, onCorrect, onWrong, onRoundComplete }: RoundProps<BeatsConfig>) {
  const beats = target.beats!;
  const copy = config.mode === 'copy';
  const parts = copy ? (beats.rhythm ?? []).length + 1 : beats.parts.length;
  const [taps, setTaps] = useState(0);
  const [lit, setLit] = useState(-1);
  const [ready, setReady] = useState(false);
  const [solved, setSolved] = useState(false);
  const [bounce, setBounce] = useState(0);
  const tapsRef = useRef(0);
  const missed = useRef(false);
  const alive = useRef(true);
  const idle = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      alive.current = false;
      window.clearTimeout(idle.current);
    },
    [],
  );

  const hit = (k: number) => {
    sfx.thud();
    setBounce((b) => b + 1);
    setLit(k);
  };

  /** The narrator (or the drum) does it, one part at a time */
  const show = async () => {
    setReady(false);
    setTaps(0);
    tapsRef.current = 0;
    if (copy) {
      const gaps = beats.rhythm ?? [];
      await narrator.say(['beats.listen']);
      await wait(300);
      for (let k = 0; k < parts; k++) {
        if (!alive.current) return;
        hit(k);
        if (k < gaps.length) await wait(gaps[k]);
      }
      await wait(500);
    } else {
      await narrator.say(['beats.listen']);
      for (let k = 0; k < parts; k++) {
        if (!alive.current) return;
        hit(k);
        await narrator.say([beats.parts[k]]);
        await wait(140);
      }
    }
    if (!alive.current) return;
    setLit(-1);
  };

  const begin = async (again: boolean) => {
    if (!again) await narrator.say(copy ? ['beats.copy-intro'] : [beats.whole]);
    if (!alive.current) return;
    if (config.demo || again) await show();
    if (!alive.current) return;
    setLit(-1);
    setTaps(0);
    tapsRef.current = 0;
    await narrator.say(copy ? ['beats.your-turn-copy'] : config.mode === 'words' ? ['beats.your-turn-words'] : ['beats.your-turn']);
    if (alive.current) setReady(true);
  };

  useEffect(() => {
    void begin(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const check = () => {
    const n = tapsRef.current;
    if (n === parts) {
      setSolved(true);
      setReady(false);
      if (!missed.current) onCorrect(target);
      fx.yay(undefined, { stars: 14 });
      void (async () => {
        const unit = copy ? 'beats.beats' : config.mode === 'words' ? (parts === 1 ? 'beats.word' : 'beats.words') : parts === 1 ? 'beats.clap' : 'beats.claps';
        // Syllables: the parts once more ("Yes! Ted, dee. Two claps!"); sentences: the sentence and how many words
        await narrator.say(copy ? ['beats.yes-copy'] : config.mode === 'words' ? ['beats.yes', beats.whole, `numbers.name.${parts}`, unit] : ['beats.yes', ...beats.parts, `numbers.name.${parts}`, unit]);
        await wait(500);
        if (alive.current) onRoundComplete();
      })();
      return;
    }
    // Too few: show it again, together
    if (!missed.current) onWrong(target, target);
    missed.current = true;
    setReady(false);
    void (async () => {
      await narrator.say([n < parts ? 'beats.more' : 'beats.too-many']);
      if (alive.current) await begin(true);
    })();
  };

  const tap = () => {
    if (!ready || solved) return;
    const n = tapsRef.current + 1;
    tapsRef.current = n;
    setTaps(n);
    hit(n - 1);
    fx.haptic('tap');
    window.clearTimeout(idle.current);
    if (n > parts) {
      check();
      return;
    }
    if (config.guide && !copy) void narrator.say([beats.parts[n - 1]]);
    idle.current = window.setTimeout(check, DONE_AFTER_MS);
  };

  const dots = Math.max(parts, taps);
  return (
    <div className="beats-round">
      <header className="touch-top">
        <SpeakerButton onPress={() => void narrator.say(copy ? ['beats.copy-intro'] : [beats.whole])} />
      </header>
      <div className="beats-body">
        <div className="beats-picture">
          <Pic e={beats.picture} size={Math.min(window.innerWidth * 0.5, window.innerHeight * 0.3)} />
          {beats.text && <div className="beats-text">{beats.text}</div>}
        </div>
        <div className="beats-dots" aria-label={`${taps} taps`}>
          {Array.from({ length: dots }, (_, k) => (
            <span key={k} className={['beats-dot', (ready || solved ? k < taps : k <= lit) && 'beats-dot--on', k >= parts && 'beats-dot--extra', solved && 'beats-dot--done'].filter(Boolean).join(' ')} />
          ))}
        </div>
        <button
          type="button"
          className={`beats-drum ${ready ? 'beats-drum--ready' : ''}`}
          key={bounce}
          onPointerDown={(e) => {
            e.preventDefault();
            tap();
          }}
          aria-label="Drum"
        >
          <span className="beats-drum-top" />
          <span className="beats-drum-body" />
        </button>
      </div>
    </div>
  );
}

export const beats: Mechanic<BeatsConfig> = {
  Round: BeatsRound,
  clips: {
    'beats.listen': 'Listen!',
    'beats.your-turn': 'Your turn! Tap the drum for each part.',
    'beats.your-turn-words': 'Your turn! Tap the drum for each word.',
    'beats.your-turn-copy': 'Your turn! Play it back on the drum.',
    'beats.copy-intro': 'Listen to the drum, then copy it!',
    'beats.yes': 'Yes!',
    'beats.clap': 'clap!',
    'beats.claps': 'claps!',
    'beats.word': 'word!',
    'beats.words': 'words!',
    'beats.beats': 'beats',
    'beats.yes-copy': 'Yes! You copied it!',
    'beats.more': "There's more! Let's do it together.",
    'beats.too-many': "Oops, that's too many! Let's do it together.",
  },
};

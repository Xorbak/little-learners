import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { PickItConfig, QuizAnswer, QuizQuestion } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import '../touch-it/touchIt.css';
import './pickIt.css';

/**
 * Pick It: one engine for many kinds of question. Each question item makes a
 * fresh question every round (see QuizQuestion): something to look at (a scene
 * that can change while a little story is told), or to hear (a sound), then a
 * question and answers to tap.
 *
 * Used for: more or fewer, number stories, where is it?, bigger or smaller,
 * rhymes, sounds around us, riddles (clues one at a time), listen and touch in
 * order, feelings in situations, what should I do?, and more.
 *
 * Never punishes: a wrong tap wobbles and says what it was, then asks again;
 * after two misses the right answer glows.
 */

const REMIND_AFTER_MS = 12000;
const HINT_AFTER_MISSES = 2;

const shuffle = <T,>(list: T[]): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const prepare = (q: QuizQuestion): QuizQuestion => (q.fixedOrder ? q : { ...q, answers: shuffle(q.answers) });

/** Where the scene and the answer cards go, and how big the cards can be */
function useLayout(hasScene: boolean, count: number, wide: boolean) {
  const measure = useCallback(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const small = W <= 600 || H <= 500;
    const top = small ? 76 : 92;
    const bottom = small ? 30 : 46;
    const w = W - 32;
    const h = H - top - bottom;
    const landscape = w > h * 1.15;
    let scene = { width: 0, height: 0 };
    let area = { w, h };
    if (hasScene) {
      if (landscape) {
        scene = { width: Math.floor(w * 0.5), height: h };
        area = { w: Math.floor(w * 0.5) - 16, h };
      } else {
        scene = { width: w, height: Math.floor(h * 0.42) };
        area = { w, h: Math.floor(h * 0.58) - 12 };
      }
    }
    const gap = small ? 12 : 20;
    const aspect = wide ? 1.3 : 1;
    let best = 0;
    for (let cols = 1; cols <= count; cols++) {
      const rows = Math.ceil(count / cols);
      const cardH = Math.min((area.h - gap * (rows - 1)) / rows, (area.w - gap * (cols - 1)) / cols / aspect);
      best = Math.max(best, cardH);
    }
    const cardH = Math.floor(Math.min(wide ? 190 : 220, best));
    return { landscape: hasScene && landscape, scene, cardH, cardW: Math.floor(cardH * aspect), gap };
  }, [hasScene, count, wide]);
  const [layout, setLayout] = useState(measure);
  useEffect(() => {
    const update = () => setLayout(measure());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [measure]);
  return layout;
}

function PickItRound({ config, target, onCorrect, onWrong, onRoundComplete }: RoundProps<PickItConfig>) {
  const [question, setQuestion] = useState(() => prepare(target.quiz!(config)));
  const [n, setN] = useState(0);
  const first = useRef(true);
  const missed = useRef(false);

  const solved = useCallback(() => {
    // Only the first question of a round counts towards her progress
    if (first.current && !missed.current) onCorrect(target);
    first.current = false;
    if (question.then) {
      setQuestion(prepare(question.then()));
      setN((x) => x + 1);
    } else onRoundComplete();
  }, [question, onCorrect, onRoundComplete, target]);

  const miss = useCallback(() => {
    if (first.current && !missed.current) onWrong(target, target);
    missed.current = true;
  }, [onWrong, target]);

  return <QuestionView key={n} question={question} onSolved={solved} onMiss={miss} />;
}

function QuestionView({ question, onSolved, onMiss }: { question: QuizQuestion; onSolved: () => void; onMiss: () => void }) {
  const { Scene } = question;
  const tell = question.tell ?? [];
  const [stage, setStage] = useState(0);
  const [asking, setAsking] = useState(tell.length === 0);
  const [solved, setSolved] = useState(false);
  const [placed, setPlaced] = useState<string[]>([]);
  const [wobble, setWobble] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const layout = useLayout(!!Scene, question.answers.length, question.cards === 'wide');

  const clue = useRef(0);
  const misses = useRef(0);
  const lastTap = useRef(Date.now());
  const done = useRef(false);
  const alive = useRef(true);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(
    () => () => {
      alive.current = false;
      timers.current.forEach(window.clearTimeout);
    },
    [],
  );

  const clues = question.clues ?? [];
  /** The question (with the current clue), then the sound if there is one */
  const ask = useCallback(
    async (before: string[] = []) => {
      lastTap.current = Date.now();
      await narrator.say([...before, ...(clues[clue.current] ?? []), ...question.ask]);
      if (alive.current && question.sound && !done.current) await question.sound();
    },
    [clues, question],
  );
  /** Riddles: the next clue (the last one stays) */
  const nextClue = () => {
    if (clue.current < clues.length - 1) clue.current += 1;
  };

  // Tell the little story part by part (the scene changes after each), then ask
  useEffect(() => {
    void (async () => {
      for (let i = 0; i < tell.length; i++) {
        await narrator.say(tell[i]);
        if (!alive.current) return;
        setStage(i + 1);
        await wait(i === tell.length - 1 ? 900 : 600);
        if (!alive.current) return;
      }
      setAsking(true);
      await ask();
    })();
    const t = window.setInterval(() => {
      if (!done.current && Date.now() - lastTap.current > REMIND_AFTER_MS && !narrator.isSpeaking()) {
        if (clues.length) {
          nextClue();
          void ask(['pick.next-clue']);
        } else void ask();
      }
    }, 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rights = question.answers.filter((a) => a.right).sort((a, b) => Number(a.right) - Number(b.right));

  const finish = (el?: HTMLElement) => {
    done.current = true;
    setSolved(true);
    setHint(false);
    sfx.pop();
    fx.yay(el, { jump: 40 });
    const yes = question.yes ?? ['pick.yes', ...(question.inOrder ? [] : rights[0]?.clip ? [rights[0].clip] : [])];
    void (async () => {
      await narrator.say(yes);
      if (!alive.current) return;
      later(onSolved, question.then ? 300 : 500);
    })();
  };

  const wrong = (a: QuizAnswer) => {
    sfx.boing();
    setWobble(a.key);
    later(() => setWobble((w) => (w === a.key ? null : w)), 600);
    onMiss();
    misses.current += 1;
    if (misses.current >= HINT_AFTER_MISSES) setHint(true);
    const oops = question.oops ?? a.says ?? (a.clip ? ['pick.oops', a.clip] : ['pick.not-that']);
    if (clues.length) {
      nextClue();
      void ask([...oops, 'pick.next-clue']);
    } else void ask(oops);
  };

  const tap = (a: QuizAnswer, el: HTMLElement) => {
    if (done.current || !asking) return;
    lastTap.current = Date.now();
    if (question.inOrder) {
      if (placed.includes(a.key)) return;
      if (a.right === placed.length + 1) {
        const now = [...placed, a.key];
        setPlaced(now);
        if (now.length === rights.length) finish(el);
        else {
          sfx.pop();
          fx.yay(el, { jump: 20 });
          if (a.clip) void narrator.say([a.clip]);
        }
        return;
      }
      wrong(a);
      return;
    }
    if (a.right) finish(el);
    else wrong(a);
  };

  const nextRight = question.inOrder ? rights[placed.length] : rights[0];

  return (
    <div className={`touch-round pick-round ${layout.landscape ? 'pick-round--side' : ''}`}>
      <header className="touch-top">
        {asking && (
          <SpeakerButton
            onPress={() => {
              if (clues.length && clue.current < clues.length - 1) {
                nextClue();
                void ask(['pick.next-clue']);
              } else void ask();
            }}
          />
        )}
      </header>
      <div className="pick-body">
        {Scene && (
          <div className="pick-scene" style={{ width: layout.scene.width, height: layout.scene.height }}>
            <Scene width={layout.scene.width} height={layout.scene.height} stage={stage} solved={solved} />
          </div>
        )}
        <div className="pick-answers" style={{ gap: layout.gap }}>
          {asking &&
            question.answers.map((a, i) => {
              const order = placed.indexOf(a.key);
              const isRight = question.inOrder ? order >= 0 : !!a.right;
              const classes = [
                'touch-choice',
                'pick-answer',
                wobble === a.key && 'touch-choice--wobble',
                solved && isRight && 'touch-choice--found',
                solved && !isRight && 'touch-choice--fade',
                order >= 0 && !solved && 'pick-answer--placed',
                hint && !solved && nextRight?.key === a.key && 'touch-choice--hint',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <button
                  key={a.key}
                  type="button"
                  className={classes}
                  style={{ width: layout.cardW, height: layout.cardH, animationDelay: `${i * 0.07}s` } as CSSProperties}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    tap(a, e.currentTarget);
                  }}
                  aria-label={a.clip ? narrator.allClips()[a.clip] ?? a.key : a.key}
                  data-right={a.right ? String(a.right) : undefined}
                >
                  <a.View size={Math.round(Math.min(layout.cardW, layout.cardH) * 0.84)} />
                  {order >= 0 && <span className="pick-badge">{order + 1}</span>}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export const pickIt: Mechanic<PickItConfig> = {
  Round: PickItRound,
  clips: {
    'pick.yes': 'Yes!',
    'pick.oops': "Oops! That's",
    'pick.not-that': 'Not that one!',
    'pick.next-clue': "Here's another clue.",
  },
};

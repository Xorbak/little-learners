import { useEffect, useMemo, useRef, useState } from 'react';
import type { QuizQuestion, StoryConfig } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { Pic } from '../../shared/ui/scenes';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import { QuestionView } from '../pick-it/PickIt';
import '../touch-it/touchIt.css';
import './story.css';

/**
 * Story Time: a short picture story, read aloud page by page. Each word lights
 * up as it is read, left to right, so she sees that the words say the story.
 * She turns the pages herself (the arrow wiggles when a page has been read).
 * Then a few questions about the story; or, before the last page, "What do you
 * think happens next?" (any guess is fine: then she finds out).
 */

const shuffle = <T,>(list: T[]): T[] => [...list].sort(() => Math.random() - 0.5);
/** How many pictures are in a scene (so a crowded scene is drawn smaller) */
const count = (s: string) => {
  try {
    return [...new Intl.Segmenter().segment(s)].length;
  } catch {
    return Math.ceil(s.length / 2);
  }
};

/** A scene of a few pictures in a row, as big as fits */
function Scene({ e }: { e: string }) {
  const n = count(e);
  const landscape = window.innerWidth > window.innerHeight;
  const w = Math.min(window.innerWidth * (landscape ? 0.42 : 1) - 80, 640);
  const h = window.innerHeight * (landscape ? 0.5 : 0.3);
  return (
    <span className="story-pic" style={{ fontSize: Math.min(h * 0.8, (w * 0.9) / (n * 1.25)) }} aria-hidden="true">
      {e}
    </span>
  );
}

type Phase = { name: 'cover' } | { name: 'page'; page: number } | { name: 'guess' } | { name: 'question'; index: number };

function Words({ text, word }: { text: string; word: number }) {
  return (
    <p className="story-words">
      {text.split(' ').map((w, i) => (
        <span key={i} className={`story-word ${i === word ? 'story-word--now' : i < word ? 'story-word--read' : ''}`}>
          {w}{' '}
        </span>
      ))}
    </p>
  );
}

function StoryRound({ config, target, onCorrect, onWrong, onRoundComplete }: RoundProps<StoryConfig>) {
  const story = target.story!;
  const [phase, setPhase] = useState<Phase>({ name: 'cover' });
  const [word, setWord] = useState(-1);
  const [read, setRead] = useState(false);
  const alive = useRef(true);
  const missed = useRef(false);
  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );

  const questions = useMemo<QuizQuestion[]>(
    () =>
      shuffle(story.questions)
        .slice(0, config.questions)
        .map((q) => ({
          ask: [q.ask],
          answers: q.answers.map((a, i) => ({ key: a.clip, clip: a.clip, right: i === 0, View: ({ size }) => <Pic e={a.emoji} size={size} scale={count(a.emoji) > 1 ? 0.6 : 1} /> })),
        })),
    [story, config.questions],
  );

  const pageText = (p: number) => narrator.allClips()[story.pages[p].clip] ?? '';
  const lastPage = story.pages.length - 1;

  /** Reads a page, lighting up each word as it is said */
  const readPage = async (p: number) => {
    setRead(false);
    setWord(-1);
    const text = pageText(p);
    const starts: number[] = [];
    let at = 0;
    for (const w of text.split(' ')) {
      starts.push(at);
      at += w.length + 1;
    }
    // The voice says which word it's on; if it doesn't (recordings, some phones), keep time instead
    let heard = false;
    const off = narrator.onWord(({ text: said, charIndex }) => {
      if (said !== text) return;
      heard = true;
      let i = starts.length - 1;
      while (i > 0 && starts[i] > charIndex) i--;
      setWord(i);
    });
    const words = text.split(' ');
    let i = 0;
    let timer = 0;
    const tick = () => {
      if (heard || !alive.current) return;
      setWord(i);
      const w = words[i] ?? '';
      i += 1;
      if (i < words.length) timer = window.setTimeout(tick, 300 + w.length * 45 + (/[.,!?]$/.test(w) ? 280 : 0));
    };
    timer = window.setTimeout(tick, 350);
    await narrator.say([story.pages[p].clip]);
    off();
    window.clearTimeout(timer);
    if (!alive.current) return;
    setWord(words.length);
    setRead(true);
  };

  useEffect(() => {
    void (async () => {
      await narrator.say(['story.intro', story.title]);
      if (!alive.current) return;
      setPhase({ name: 'page', page: 0 });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase.name === 'page') void readPage(phase.page);
    if (phase.name === 'guess') void narrator.say(['story.what-next']);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const turn = (dir: 1 | -1) => {
    if (phase.name !== 'page') return;
    sfx.flip();
    narrator.stop();
    const next = phase.page + dir;
    if (next < 0) return;
    if (next > lastPage) {
      void (async () => {
        await narrator.say(['story.the-end']);
        if (!alive.current) return;
        if (questions.length) setPhase({ name: 'question', index: 0 });
        else onRoundComplete();
      })();
      setPhase({ name: 'question', index: -1 });
      return;
    }
    if (next === lastPage && dir === 1 && config.guessNext) setPhase({ name: 'guess' });
    else setPhase({ name: 'page', page: next });
  };

  const [guesses] = useState(() => shuffle(story.next.map((n, i) => ({ ...n, real: i === 0 }))));
  const guess = (real: boolean, el: HTMLElement) => {
    sfx.pop();
    fx.yay(el, { jump: 30 });
    void (async () => {
      await narrator.say([real ? 'story.you-guessed' : 'story.good-idea']);
      if (alive.current) setPhase({ name: 'page', page: lastPage });
    })();
  };

  if (phase.name === 'question') {
    if (phase.index < 0) return <div className="story-round story-end">📖</div>;
    return (
      <QuestionView
        key={phase.index}
        question={questions[phase.index]}
        onMiss={() => {
          if (!missed.current) onWrong(target, target);
          missed.current = true;
        }}
        onSolved={() => {
          if (phase.index === 0 && !missed.current) onCorrect(target);
          if (phase.index + 1 < questions.length) setPhase({ name: 'question', index: phase.index + 1 });
          else onRoundComplete();
        }}
      />
    );
  }

  return (
    <div className="story-round">
      <header className="touch-top">
        {phase.name === 'page' && <SpeakerButton onPress={() => void readPage(phase.page)} />}
      </header>
      {phase.name === 'cover' && (
        <div className="story-page story-page--cover">
          <div className="story-scene">
            <Scene e={story.cover} />
          </div>
          <Words text={narrator.allClips()[story.title] ?? ''} word={99} />
        </div>
      )}
      {phase.name === 'page' && (
        <div className="story-page" key={phase.page}>
          <div className="story-scene">
            <Scene e={story.pages[phase.page].scene} />
          </div>
          <Words text={pageText(phase.page)} word={word} />
          <div className="story-nav">
            {phase.page > 0 ? (
              <button type="button" className="story-turn story-turn--back" onClick={() => turn(-1)} aria-label="Page back">
                ◀
              </button>
            ) : (
              <span />
            )}
            <span className="story-page-num">
              {phase.page + 1} / {story.pages.length}
            </span>
            <button type="button" className={`story-turn ${read ? 'story-turn--ready' : ''}`} onClick={() => turn(1)} aria-label="Turn the page">
              ▶
            </button>
          </div>
        </div>
      )}
      {phase.name === 'guess' && (
        <div className="story-page">
          <div className="story-guess">
            {guesses.map((g) => (
              <button key={g.clip} type="button" className="touch-choice story-guess-card" onPointerDown={(e) => guess(g.real, e.currentTarget)} aria-label={narrator.allClips()[g.clip]}>
                <Pic e={g.emoji} size={Math.min(170, (window.innerWidth - 80) / 3)} scale={count(g.emoji) > 1 ? 0.6 : 1} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const storyTime: Mechanic<StoryConfig> = {
  Round: StoryRound,
  clips: {
    'story.intro': 'Story time!',
    'story.the-end': 'The end!',
    'story.what-next': 'What do you think happens next?',
    'story.you-guessed': 'Ooh, good guess! Let’s see!',
    'story.good-idea': 'Ooh, that’s an idea! Let’s see what happens!',
  },
};

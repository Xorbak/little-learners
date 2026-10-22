import { useEffect, useRef, useState } from 'react';
import type { AboutMeConfig, ClipId } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { progress, type AboutMe } from '../../shared/progress/store';
import { canRecord, micDenied, playRecording, recordVoice } from '../../shared/audio/recorder';
import { hasName } from '../../app/name';
import { Pic } from '../../shared/ui/scenes';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import '../touch-it/touchIt.css';
import '../say-it/sayIt.css';
import './aboutMe.css';

/**
 * About Me: practising her own details (NCF: "give personal details: name, age,
 * address, contact number"). The narrator asks ("Where do you live?"), she says
 * it out loud (the microphone plays her answer back), then the answer appears,
 * written, and they say it together. A grown-up types the details in the
 * grown-ups area; they stay on this phone.
 */

interface MeQuestion {
  ask: ClipId[];
  answer: ClipId[];
  /** What must be filled in */
  need: (keyof AboutMe | 'name')[];
  picture: string;
  /** Written on the answer card */
  write: ClipId;
}

export const ME_QUESTIONS: Record<string, MeQuestion> = {
  'me-name': { ask: ['me.q.name'], answer: ['me.a.name', 'me.v.full-name'], need: ['name'], picture: '🙋', write: 'me.v.full-name' },
  'me-surname': { ask: ['me.q.surname'], answer: ['me.a.surname', 'me.v.surname'], need: ['name', 'surname'], picture: '👨‍👩‍👧', write: 'me.v.surname' },
  'me-age': { ask: ['me.q.age'], answer: ['me.a.age', 'me.v.age'], need: ['birthday'], picture: '🎂', write: 'me.v.age-number' },
  'me-birthday': { ask: ['me.q.birthday'], answer: ['me.a.birthday', 'me.v.birthday'], need: ['birthday'], picture: '🎉', write: 'me.v.birthday' },
  'me-town': { ask: ['me.q.town'], answer: ['me.a.town', 'me.v.town'], need: ['town'], picture: '🏘️', write: 'me.v.town' },
  'me-street': { ask: ['me.q.street'], answer: ['me.a.street', 'me.v.street'], need: ['street'], picture: '🏠', write: 'me.v.street' },
  'me-phone': { ask: ['me.q.phone'], answer: ['me.a.phone', 'me.v.phone-of', 'me.a.number', 'me.v.phone'], need: ['phone'], picture: '📱', write: 'me.v.phone' },
  'me-school': { ask: ['me.q.school'], answer: ['me.a.school', 'me.v.school'], need: ['school'], picture: '🏫', write: 'me.v.school' },
};

const HELP_AFTER_MS = 9000;

function AboutMeRound({ target, onCorrect, onRoundComplete }: RoundProps<AboutMeConfig>) {
  const q = ME_QUESTIONS[target.key];
  const profile = progress.profile();
  const filled = q.need.every((k) => (k === 'name' ? hasName(profile.name) : !!profile.aboutMe?.[k]?.trim()));
  const [phase, setPhase] = useState<'ask' | 'ready' | 'recording' | 'playing' | 'answer'>('ask');
  const [level, setLevel] = useState(0);
  const alive = useRef(true);
  const rec = useRef<ReturnType<typeof recordVoice> | null>(null);
  const idle = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      alive.current = false;
      rec.current?.stop();
      window.clearTimeout(idle.current);
    },
    [],
  );
  const mic = canRecord() && !micDenied();

  const reveal = async (heard: boolean) => {
    window.clearTimeout(idle.current);
    setPhase('answer');
    sfx.pop();
    fx.yay(undefined, { stars: 12 });
    await narrator.say([heard ? 'me.yes' : 'me.here-it-is', ...q.answer]);
    if (!alive.current) return;
    await narrator.say(['me.say-with-me', ...q.answer.slice(-1)]);
    if (!alive.current) return;
    onCorrect(target);
    window.setTimeout(onRoundComplete, 700);
  };

  const ask = async () => {
    setPhase('ask');
    await narrator.say([...q.ask, 'me.say-it']);
    if (!alive.current) return;
    setPhase('ready');
    // No answer for a while: help her
    idle.current = window.setTimeout(() => void reveal(false), HELP_AFTER_MS);
  };

  useEffect(() => {
    if (!filled) {
      void (async () => {
        await narrator.say(['me.ask-grown-up']);
        if (alive.current) window.setTimeout(onRoundComplete, 600);
      })();
      return;
    }
    void ask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const press = async () => {
    if (phase !== 'ready') return;
    window.clearTimeout(idle.current);
    if (!mic) {
      void reveal(true);
      return;
    }
    narrator.stop();
    setPhase('recording');
    rec.current = recordVoice(3500, setLevel);
    const blob = await rec.current.done;
    if (!alive.current) return;
    setLevel(0);
    if (blob) {
      setPhase('playing');
      await narrator.say(['say.listen-to-you']);
      await playRecording(blob);
    }
    if (alive.current) void reveal(true);
  };

  const words = narrator.allClips()[q.write] ?? '';
  const size = Math.min(window.innerWidth * 0.42, window.innerHeight * 0.24);
  return (
    <div className="touch-round sayit-round">
      <header className="touch-top">{filled && <SpeakerButton onPress={() => void narrator.say(q.ask)} />}</header>
      <div className="sayit-body">
        {!filled ? (
          <div className="me-card">
            <Pic e="🧑‍🍼" size={size} />
            <p className="me-words me-words--small">Grown-ups: add her details in the grown-ups area (hold the ⚙️ button).</p>
          </div>
        ) : (
          <>
            <div className={`me-card ${phase === 'answer' ? 'me-card--answer' : ''}`}>
              <Pic e={q.picture} size={size} />
              {phase === 'answer' && <p className="me-words">{words}</p>}
            </div>
            {phase !== 'answer' && (
              <button
                type="button"
                className={`say-mic say-mic--${phase}`}
                style={{ ['--level' as string]: level }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  void press();
                }}
                aria-label={mic ? 'Record' : 'I said it'}
              >
                <span className="say-mic-ring" />
                <span className="say-mic-icon">{phase === 'playing' ? '👂' : mic ? '🎤' : '👄'}</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export const aboutMe: Mechanic<AboutMeConfig> = {
  Round: AboutMeRound,
  clips: {
    'me.q.name': "What's your name?",
    'me.q.surname': "What's your surname? That's your family name.",
    'me.q.age': 'How old are you?',
    'me.q.birthday': 'When is your birthday?',
    'me.q.town': 'Where do you live?',
    'me.q.street': 'What is your address? Which street do you live in?',
    'me.q.phone': 'If you ever get lost, which phone number can a grown-up call?',
    'me.q.school': 'What is your school called?',
    'me.say-it': 'Say it out loud!',
    'me.a.name': 'My name is',
    'me.a.surname': 'My surname is',
    'me.a.age': 'I am',
    'me.a.birthday': 'My birthday is on',
    'me.a.town': 'I live in',
    'me.a.street': 'I live at',
    'me.a.phone': 'They can phone',
    'me.a.number': 'number:',
    'me.a.school': 'My school is',
    'me.yes': 'Well done!',
    'me.here-it-is': "Let's say it together.",
    'me.say-with-me': 'Say it with me!',
    'me.ask-grown-up': 'Ask a grown-up to fill in your details, and then we can practise!',
  },
};

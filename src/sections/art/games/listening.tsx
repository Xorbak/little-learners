import type { Game, LearningItem } from '../../../types/learning';
import { audioContext } from '../../../shared/audio/sfx';
import { narrator } from '../../../shared/audio/narrator';
import { Pic } from '../../../shared/ui/scenes';
import { picAnswer, pickOne, quizItem } from '../../../shared/quiz';

/**
 * Music games (NCF Creativity: music): is it loud or soft, high or low, fast or
 * slow? Copy the beat on the drum. Free drawing and playing along live here too.
 */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function note(a: AudioContext, freq: number, at: number, length: number, volume: number, type: OscillatorType = 'triangle') {
  const t = a.currentTime + at;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + length);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + length + 0.05);
}
function drum(a: AudioContext, at: number, volume: number) {
  const t = a.currentTime + at;
  const o = a.createOscillator();
  const g = a.createGain();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(50, t + 0.3);
  g.gain.setValueAtTime(volume, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + 0.4);
}

const SOUNDS: Record<string, () => number> = {
  loud: () => {
    const a = audioContext();
    if (a) [0, 0.45, 0.9].forEach((at) => drum(a, at, 1));
    return 1300;
  },
  soft: () => {
    const a = audioContext();
    if (a) [0, 0.45, 0.9].forEach((at) => drum(a, at, 0.07));
    return 1300;
  },
  high: () => {
    const a = audioContext();
    if (a) [1568, 1760, 2093, 1760].forEach((f, i) => note(a, f, i * 0.3, 0.28, 0.2, 'sine'));
    return 1300;
  },
  low: () => {
    const a = audioContext();
    if (a) [98, 110, 87, 98].forEach((f, i) => note(a, f, i * 0.3, 0.3, 0.5, 'triangle'));
    return 1300;
  },
  fast: () => {
    const a = audioContext();
    if (a) [523, 587, 659, 698, 784, 698, 659, 587, 523, 587].forEach((f, i) => note(a, f, i * 0.12, 0.11, 0.22));
    return 1300;
  },
  slow: () => {
    const a = audioContext();
    if (a) [523, 587, 659, 523].forEach((f, i) => note(a, f, i * 0.7, 0.65, 0.22));
    return 2900;
  },
};

const PAIRS: Record<string, [string, string, string, string, string]> = {
  // kind: [first, firstEmoji, second, secondEmoji, question]
  loud: ['loud', '🦁', 'soft', '🐭', 'mus.loud-soft'],
  high: ['high', '🐦', 'low', '🐻', 'mus.high-low'],
  fast: ['fast', '🐇', 'slow', '🐢', 'mus.fast-slow'],
};

const listenMusic = quizItem('q-music', (c) => {
  const kind = pickOne(c.modes ?? ['loud']);
  const [a, ea, b, eb, question] = PAIRS[kind];
  const answer = Math.random() < 0.5 ? a : b;
  return {
    Scene: ({ width, height }) => <Pic e="🎵" size={Math.min(width, height) * 0.8} style={{ animation: 'fx-bob 1.4s ease-in-out infinite' }} />,
    ask: ['mus.listen'],
    sound: async () => {
      await wait(SOUNDS[answer]());
      // then the question
      await narrator.say([question]);
    },
    answers: [picAnswer(a, ea, `mus.${a}`, answer === a), picAnswer(b, eb, `mus.${b}`, answer === b)],
    fixedOrder: true,
    yes: ['pick.yes', `mus.it-was`, `mus.${answer}`],
    oops: ['mus.listen-again'],
  };
});

// ---------------------------------------------------------------------------
// Copy the beat: drum patterns to play back (the number of beats is what counts)
// ---------------------------------------------------------------------------
const RHYTHMS: number[][] = [[600], [500, 500], [300, 600], [450, 450, 450], [300, 300, 600], [600, 300, 300], [300, 300, 300, 600], [250, 250, 500, 250, 250]];
const beatItems: Record<string, LearningItem> = Object.fromEntries(
  RHYTHMS.map((r, i) => [
    `beat-${i}`,
    { key: `beat-${i}`, nameClip: 'beats.copy-intro', pluralClip: 'beats.copy-intro', track: false, Display: () => null, beats: { whole: 'beats.copy-intro', parts: [], picture: '🥁', rhythm: r } },
  ]),
);
const beatsWith = (min: number, max: number) => RHYTHMS.map((r, i) => [r, i] as const).filter(([r]) => r.length + 1 >= min && r.length + 1 <= max).map(([, i]) => `beat-${i}`);

const one = (key: string, clip: string): LearningItem => ({ key, nameClip: clip, pluralClip: clip, track: false, Display: () => null });

export const musicItems: Record<string, LearningItem> = { 'q-music': listenMusic, ...beatItems, draw: one('draw', 'art.draw-title'), band: one('band', 'art.band-title') };

export const musicClips = {
  'art.draw-title': 'Draw!',
  'art.listen-title': 'Loud or soft?',
  'art.beat-title': 'Copy the beat',
  'art.band-title': 'Play along',
  'art.my-art': 'My art',
  'mus.listen': 'Listen!',
  'mus.loud-soft': 'Was that loud, like a lion? Or soft, like a mouse?',
  'mus.high-low': 'Was that high, like a bird? Or low, like a bear?',
  'mus.fast-slow': 'Was that fast, like a rabbit? Or slow, like a tortoise?',
  'mus.loud': 'loud!',
  'mus.soft': 'soft.',
  'mus.high': 'high!',
  'mus.low': 'low!',
  'mus.fast': 'fast!',
  'mus.slow': 'slow.',
  'mus.it-was': 'It was',
  'mus.listen-again': 'Hmm, listen again!',
};

export const drawGame: Game = {
  id: 'draw',
  titleClip: 'art.draw-title',
  icon: '🖍️',
  levels: [
    { id: 'free', parentLabel: 'Draw anything, then tell me about it (records her voice)', rounds: 1, activity: { kind: 'draw', pool: ['draw'] } },
    { id: 'ideas', parentLabel: 'Draw with an idea: yourself, your family, a house…', rounds: 1, activity: { kind: 'draw', pool: ['draw'], ideas: true } },
  ],
};

export const listenMusicGame: Game = {
  id: 'listen-music',
  titleClip: 'art.listen-title',
  icon: '🦁',
  levels: [
    { id: 'loud', parentLabel: 'Loud or soft?', rounds: 5, activity: { kind: 'pick-it', pool: ['q-music'], modes: ['loud'] } },
    { id: 'high', parentLabel: 'High or low?', rounds: 5, activity: { kind: 'pick-it', pool: ['q-music'], modes: ['high'] } },
    { id: 'fast', parentLabel: 'Fast or slow?', rounds: 5, activity: { kind: 'pick-it', pool: ['q-music'], modes: ['fast'] } },
    { id: 'all', parentLabel: 'All three, mixed', rounds: 6, activity: { kind: 'pick-it', pool: ['q-music'], modes: ['loud', 'high', 'fast'] } },
  ],
};

export const copyBeatGame: Game = {
  id: 'copy-beat',
  titleClip: 'art.beat-title',
  icon: '🥁',
  levels: [
    { id: '2-3', parentLabel: 'Copy 2–3 drum beats', rounds: 5, activity: { kind: 'beats', pool: beatsWith(2, 3), mode: 'copy', demo: true } },
    { id: '3-4', parentLabel: 'Copy 3–4 beats', rounds: 5, activity: { kind: 'beats', pool: beatsWith(3, 4), mode: 'copy', demo: true } },
    { id: '4-6', parentLabel: 'Copy 4–6 beats', rounds: 6, activity: { kind: 'beats', pool: beatsWith(4, 6), mode: 'copy', demo: true } },
  ],
};

export const bandGame: Game = {
  id: 'band',
  titleClip: 'art.band-title',
  icon: '🎺',
  levels: [{ id: 'play', parentLabel: 'Play along with a song: drum, clap, bell, shaker', rounds: 1, activity: { kind: 'band', pool: ['band'], seconds: 40 } }],
};

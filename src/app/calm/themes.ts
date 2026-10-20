import type { AmbientTheme } from '../../shared/audio/ambient';
import type { ClipTable } from '../../types/learning';

/** The five calm places. Each has its own colours, breathing guide, scene and music. */
export interface CalmTheme {
  id: AmbientTheme;
  icon: string;
  name: string;
  /** Background of the place */
  sky: string;
  /** Colour of the soft pulse on the in-breath */
  glow: string;
  /** What grows and shrinks with the breath */
  guide: 'moon' | 'sun' | 'jellyfish' | 'cloud' | 'firefly';
  intro: string;
}

export const CALM_THEMES: CalmTheme[] = [
  {
    id: 'stars',
    icon: '🌙',
    name: 'Starry night',
    sky: 'linear-gradient(180deg, #0b1d3a 0%, #23205c 55%, #3b2a6b 100%)',
    glow: 'rgba(255, 243, 191, 0.5)',
    guide: 'moon',
    intro: "Let's look at the stars. The sleepy moon gets bigger when you breathe in, and smaller when you breathe out.",
  },
  {
    id: 'leaves',
    icon: '🍂',
    name: 'Falling leaves',
    sky: 'linear-gradient(180deg, #fff4e6 0%, #ffd8a8 55%, #ffc078 100%)',
    glow: 'rgba(255, 212, 59, 0.45)',
    guide: 'sun',
    intro: 'The leaves are falling, slowly, slowly. Breathe in with the warm sun, and breathe out.',
  },
  {
    id: 'ocean',
    icon: '🌊',
    name: 'Under the sea',
    sky: 'linear-gradient(180deg, #0c8599 0%, #1971c2 60%, #1b3a6b 100%)',
    glow: 'rgba(229, 153, 247, 0.4)',
    guide: 'jellyfish',
    intro: 'Deep under the sea, a little jellyfish is floating. Breathe in as it gets bigger, and out as it gets smaller.',
  },
  {
    id: 'rain',
    icon: '🌧️',
    name: 'Gentle rain',
    sky: 'linear-gradient(180deg, #495057 0%, #5c7cfa 70%, #748ffc 100%)',
    glow: 'rgba(231, 245, 255, 0.4)',
    guide: 'cloud',
    intro: 'Listen to the gentle rain. Breathe in as the cloud puffs up, and out as it gets small.',
  },
  {
    id: 'fireflies',
    icon: '✨',
    name: 'Fireflies',
    sky: 'linear-gradient(180deg, #1c1b4d 0%, #3b2a6b 55%, #862e9c 82%, #e8590c 100%)',
    glow: 'rgba(216, 245, 162, 0.4)',
    guide: 'firefly',
    intro: 'The fireflies are glowing in the evening. Breathe in as the light grows, and out as it fades.',
  },
];

export const calmClips: ClipTable = {
  'calm.title': 'Calm corner',
  'calm.choose': 'Where shall we go, to feel calm?',
  'calm.in': 'Breathe in…',
  'calm.out': 'and out…',
  ...Object.fromEntries(CALM_THEMES.flatMap((t) => [
    [`calm.name.${t.id}`, t.name],
    [`calm.intro.${t.id}`, t.intro],
  ])),
};

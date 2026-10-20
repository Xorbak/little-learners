import type { ClipTable } from '../types/learning';

/**
 * Missions: something to do away from the screen at the end of Today's lessons,
 * linked to what she practises (colours, shapes, counting, feelings, nature).
 * A grown-up ticks it off when it's done and she gets a sticker for it.
 */
export interface Mission {
  id: string;
  /** Pictures that show the mission (she can't read yet) */
  picture: string[];
  says: string;
}

export const MISSIONS: Mission[] = [
  { id: 'red-things', picture: ['🔴', '🔴', '🔴'], says: 'Find three red things in your house!' },
  { id: 'count-spoons', picture: ['🥄', '🥄', '🥄'], says: 'Help set the table, and count the spoons!' },
  { id: 'bug-hunt', picture: ['🐞', '🐦', '🔍'], says: 'Go outside and look for a bug or a bird!' },
  { id: 'hug', picture: ['🤗', '❤️'], says: 'Give someone you love a big hug!' },
  { id: 'round-things', picture: ['⚪', '🔍'], says: 'Find something round, like a circle!' },
  { id: 'toy-line', picture: ['🧸', '🚗', '⚽', '🦕', '🎈'], says: 'Line up five toys, and count them!' },
  { id: 'weather', picture: ['🪟', '🌦️'], says: 'Look out of the window. What is the weather doing today?' },
  { id: 'blue-things', picture: ['🔵', '🔵', '🔵'], says: 'Find three blue things!' },
  { id: 'sort-socks', picture: ['🧦', '🧦'], says: 'Help match the socks into pairs!' },
  { id: 'happy-thing', picture: ['😊', '💬'], says: 'Tell a grown-up something that made you happy today!' },
  { id: 'count-stairs', picture: ['👣', '🔢'], says: 'Count the steps when you walk up the stairs, or count your big steps across the room!' },
  { id: 'water-plant', picture: ['🪴', '💧'], says: 'Help water a plant!' },
  { id: 'square-things', picture: ['🟦', '🔍'], says: 'Find something shaped like a square!' },
  { id: 'draw-family', picture: ['🖍️', '👨‍👩‍👧'], says: 'Draw a picture of your family!' },
  { id: 'yellow-things', picture: ['🟡', '🟡', '🟡'], says: 'Find three yellow things!' },
  { id: 'tower', picture: ['🧱', '🧱', '🧱'], says: 'Build a tower with blocks. How tall can you make it?' },
  { id: 'dance', picture: ['🎵', '💃'], says: 'Put on some music and dance!' },
  { id: 'animal-sound', picture: ['🐮', '🔊'], says: 'Show a grown-up your best animal noise!' },
  { id: 'tidy', picture: ['🧸', '📦'], says: 'Help tidy up your toys! Count them as you put them away.' },
  { id: 'green-walk', picture: ['🌳', '🍃', '🥦'], says: 'Find three green things! Inside or outside.' },
];

export const missionById = (id: string) => MISSIONS.find((m) => m.id === id);

/** Today's mission, changing day by day */
export function missionFor(day: number): Mission {
  return MISSIONS[day % MISSIONS.length];
}

export const missionClips: ClipTable = {
  'mission.title': 'Mission!',
  'mission.intro': "Here's your mission!",
  'mission.go': 'Off you go! When you have done it, show a grown-up, and they will tick it.',
  'mission.again': 'Your mission!',
  'mission.done': 'Mission done! Well done! Here is a sticker!',
  'mission.time': 'You did all your games! Now, a special mission!',
  ...Object.fromEntries(MISSIONS.map((m) => [`mission.${m.id}`, m.says])),
};

import type { ClipTable } from '../types/learning';

/**
 * Missions: something to do away from the screen at the end of Today's lessons,
 * linked to what she practises (colours, shapes, counting, feelings, nature).
 * A grown-up ticks it off when it's done and she gets a sticker for it.
 */
/** The NCF's six areas (Early Learning and Development Areas), for the Grade R report */
export type Area = 'wellbeing' | 'identity' | 'communication' | 'maths' | 'creativity' | 'world';

export interface Mission {
  id: string;
  /** Pictures that show the mission (she can't read yet) */
  picture: string[];
  says: string;
  /** Which NCF area it belongs to */
  area: Area;
}

export const MISSIONS: Mission[] = [
  { id: 'red-things', picture: ['🔴', '🔴', '🔴'], says: 'Find three red things in your house!', area: 'maths' },
  { id: 'count-spoons', picture: ['🥄', '🥄', '🥄'], says: 'Help set the table, and count the spoons!', area: 'maths' },
  { id: 'bug-hunt', picture: ['🐞', '🐦', '🔍'], says: 'Go outside and look for a bug or a bird!', area: 'world' },
  { id: 'hug', picture: ['🤗', '❤️'], says: 'Give someone you love a big hug!', area: 'identity' },
  { id: 'round-things', picture: ['⚪', '🔍'], says: 'Find something round, like a circle!', area: 'maths' },
  { id: 'toy-line', picture: ['🧸', '🚗', '⚽', '🦕', '🎈'], says: 'Line up five toys, and count them!', area: 'maths' },
  { id: 'weather', picture: ['🪟', '🌦️'], says: 'Look out of the window. What is the weather doing today?', area: 'world' },
  { id: 'blue-things', picture: ['🔵', '🔵', '🔵'], says: 'Find three blue things!', area: 'maths' },
  { id: 'sort-socks', picture: ['🧦', '🧦'], says: 'Help match the socks into pairs!', area: 'maths' },
  { id: 'happy-thing', picture: ['😊', '💬'], says: 'Tell a grown-up something that made you happy today!', area: 'wellbeing' },
  { id: 'count-stairs', picture: ['👣', '🔢'], says: 'Count the steps when you walk up the stairs, or count your big steps across the room!', area: 'maths' },
  { id: 'water-plant', picture: ['🪴', '💧'], says: 'Help water a plant!', area: 'world' },
  { id: 'square-things', picture: ['🟦', '🔍'], says: 'Find something shaped like a square!', area: 'maths' },
  { id: 'draw-family', picture: ['🖍️', '👨‍👩‍👧'], says: 'Draw a picture of your family!', area: 'identity' },
  { id: 'yellow-things', picture: ['🟡', '🟡', '🟡'], says: 'Find three yellow things!', area: 'maths' },
  { id: 'tower', picture: ['🧱', '🧱', '🧱'], says: 'Build a tower with blocks. How tall can you make it?', area: 'world' },
  { id: 'dance', picture: ['🎵', '💃'], says: 'Put on some music and dance!', area: 'creativity' },
  { id: 'animal-sound', picture: ['🐮', '🔊'], says: 'Show a grown-up your best animal noise!', area: 'communication' },
  { id: 'tidy', picture: ['🧸', '📦'], says: 'Help tidy up your toys! Count them as you put them away.', area: 'identity' },
  { id: 'green-walk', picture: ['🌳', '🍃', '🥦'], says: 'Find three green things! Inside or outside.', area: 'maths' },
  // Well-being: hands and body, health, safety
  { id: 'cut-line', picture: ['✂️', '📄'], says: 'With a grown-up, cut along a line with scissors! Snip, snip, snip.', area: 'wellbeing' },
  { id: 'play-dough', picture: ['🟣', '🐍', '⚪'], says: 'Make a snake and a ball with play dough!', area: 'wellbeing' },
  { id: 'threading', picture: ['🧵', '🔴', '🟡', '🔵'], says: 'Thread some beads, or pasta, onto a string!', area: 'wellbeing' },
  { id: 'pegs', picture: ['📎', '📦'], says: 'Put pegs around the edge of a box. How many can you fit?', area: 'wellbeing' },
  { id: 'wash-hands', picture: ['🧼', '👐'], says: 'Wash your hands with soap, while you sing a whole song!', area: 'wellbeing' },
  { id: 'brush-teeth', picture: ['🪥', '😁'], says: 'Brush your teeth all by yourself, round and round, for a whole song!', area: 'wellbeing' },
  { id: 'healthy-snack', picture: ['🍎', '🥕', '🥛'], says: 'Choose a healthy snack with a grown-up!', area: 'wellbeing' },
  { id: 'address', picture: ['🏠', '🗣️'], says: 'Tell a grown-up where you live, and your surname!', area: 'wellbeing' },
  { id: 'obstacle', picture: ['🪑', '🛋️', '🏃'], says: 'Make an obstacle course with a grown-up: over, under, and around!', area: 'wellbeing' },
  { id: 'ball-throw', picture: ['⚽', '👐'], says: 'Throw a ball to a grown-up, and catch it when they throw it back!', area: 'wellbeing' },
  // Identity: looking after herself, helping, taking turns
  { id: 'dress-self', picture: ['👕', '👖', '🧦'], says: 'Get dressed all by yourself today!', area: 'identity' },
  { id: 'shoes', picture: ['👟', '👟'], says: 'Put on your own shoes!', area: 'identity' },
  { id: 'set-table', picture: ['🍽️', '🥄', '🥤'], says: 'Be a helper: help set the table for dinner!', area: 'identity' },
  { id: 'feed-pet', picture: ['🐶', '🥣'], says: 'Be a helper: help feed a pet, or the birds!', area: 'identity' },
  { id: 'turns-game', picture: ['🎲', '👧', '🧑'], says: 'Play a game with a grown-up, and take turns!', area: 'identity' },
  { id: 'baby-photos', picture: ['👶', '📷'], says: 'Look at photos of when you were a baby! How have you grown?', area: 'identity' },
  { id: 'kind-words', picture: ['💬', '💖'], says: 'Say something kind to someone in your family!', area: 'identity' },
  // Communication
  { id: 'stop-sign', picture: ['🛑', '🚶'], says: 'On a walk or in the car, find a STOP sign!', area: 'communication' },
  { id: 'read-book', picture: ['📖', '🧑'], says: 'Read a book with a grown-up. Turn the pages yourself!', area: 'communication' },
  { id: 'what-next', picture: ['📖', '❓'], says: 'Read a story with a grown-up. Before the end, guess what happens next!', area: 'communication' },
  { id: 'rhyme', picture: ['🎵', '🐱', '👒'], says: 'Sing a nursery rhyme with a grown-up!', area: 'communication' },
  { id: 'name-letters', picture: ['🔤', '🏷️'], says: 'Find the first letter of your name, on a box or a sign!', area: 'communication' },
  { id: 'phone-call', picture: ['📱', '👵'], says: 'Phone or video call Gogo, Ouma or a friend, and tell them about your day!', area: 'communication' },
  { id: 'listen-sounds', picture: ['👂', '🌳'], says: 'Sit still outside, and listen. What sounds can you hear?', area: 'communication' },
  // Maths
  { id: 'treasure-hunt', picture: ['🧸', '🛏️', '🔍'], says: 'Treasure hunt! A grown-up hides teddy and says where: under the bed, behind the door…', area: 'maths' },
  { id: 'heavy-light', picture: ['🧱', '🪶'], says: 'Find something heavy, and something light!', area: 'maths' },
  { id: 'hands-long', picture: ['✋', '📏'], says: 'How many hands long is the table? Measure it with your hands!', area: 'maths' },
  { id: 'pour-water', picture: ['🥛', '💧'], says: 'In the bath or the sink: pour water from cup to cup. Make one full and one empty!', area: 'maths' },
  { id: 'share-snack', picture: ['🍪', '👧', '🧑'], says: 'Share a snack fairly with someone, so you both have the same!', area: 'maths' },
  { id: 'shape-walk', picture: ['🔺', '🟦', '⚪'], says: 'Go on a shape walk! Find a circle, a square and a triangle.', area: 'maths' },
  { id: 'big-small', picture: ['🐘', '🐭'], says: 'Put three toys in a line, from smallest to biggest!', area: 'maths' },
  // Creativity
  { id: 'pot-band', picture: ['🍳', '🥄', '🥁'], says: 'Make a band with pots, pans and spoons! Play loud, then soft.', area: 'creativity' },
  { id: 'act-story', picture: ['🎭', '📖'], says: 'Act out a story with a grown-up, like the three little pigs!', area: 'creativity' },
  { id: 'draw-me', picture: ['🖍️', '🙋'], says: 'Draw a picture of yourself, with your head, body, arms and legs!', area: 'creativity' },
  { id: 'build-box', picture: ['📦', '🏠'], says: 'Make a house or a car out of a big box!', area: 'creativity' },
  { id: 'leaf-art', picture: ['🍂', '🎨'], says: 'Collect some leaves, and make a picture with them!', area: 'creativity' },
  // World
  { id: 'float-sink', picture: ['🛁', '🦆', '🪨'], says: 'In the bath: which things float, and which things sink?', area: 'world' },
  { id: 'plant-seed', picture: ['🌰', '🪴', '💧'], says: 'Plant a seed in a pot with a grown-up, and water it every day!', area: 'world' },
  { id: 'nature-walk', picture: ['🍃', '🪨', '🌸'], says: 'Go on a nature walk. Collect a leaf, a stone and a flower!', area: 'world' },
  { id: 'smell', picture: ['👃', '🍋', '🌸'], says: 'Smell three things in the kitchen or garden. Which one smells best?', area: 'world' },
  { id: 'moon', picture: ['🌙', '⭐'], says: 'Tonight, look out of the window. Can you see the moon and the stars?', area: 'world' },
  { id: 'help-cook', picture: ['🥕', '🧑‍🍳'], says: 'Help a grown-up cook: wash the vegetables, or stir the pot!', area: 'world' },
];

export const missionById = (id: string) => MISSIONS.find((m) => m.id === id);

/** Today's mission, changing day by day: a different area each day, and a different mission each time round */
const AREA_ORDER: Area[] = ['maths', 'wellbeing', 'communication', 'world', 'identity', 'creativity'];
export function missionFor(day: number): Mission {
  const area = AREA_ORDER[day % AREA_ORDER.length];
  const list = MISSIONS.filter((m) => m.area === area);
  return list[Math.floor(day / AREA_ORDER.length) % list.length];
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

import type { Area } from './missions';

/**
 * The "Ready for Grade R" report, in the NCF's own terms: the six Early Learning
 * and Development Areas, each with its aims. For each aim: what her games show,
 * things only a grown-up can see (ticked off), and the stage she is at:
 * Beginning, Moving on, Advancing further, or Ready for Grade R.
 * The NCF says: no marks or percentages, comments only. So the games only
 * suggest; the grown-up decides.
 */

export const AREAS: { id: Area; title: string; icon: string }[] = [
  { id: 'wellbeing', title: 'Well-being', icon: '🌱' },
  { id: 'identity', title: 'Identity and belonging', icon: '🙋' },
  { id: 'communication', title: 'Communication', icon: '💬' },
  { id: 'maths', title: 'Exploring mathematics', icon: '🔢' },
  { id: 'creativity', title: 'Creativity', icon: '🎨' },
  { id: 'world', title: 'Knowledge and understanding of the world', icon: '🌍' },
];

export const STAGES = ['Beginning', 'Moving on', 'Advancing further', 'Ready for Grade R'];

export interface Aim {
  id: string;
  area: Area;
  /** The NCF's aim */
  title: string;
  /** What "towards Grade R" looks like, in short */
  ready: string;
  /** Games that practise it ("sectionId/gameId") */
  games: string[];
  /** Things a grown-up sees away from the screen */
  ticks: string[];
}

export const AIMS: Aim[] = [
  // ELDA 1 Well-being
  {
    id: 'w1',
    area: 'wellbeing',
    title: 'Being well-nourished',
    ready: 'Names healthy foods and food groups, and knows where food comes from.',
    games: ['me/healthy-food'],
    ticks: ['Eats a range of healthy foods', 'Knows that sweets and chips are sometimes food', 'Helps prepare a simple snack'],
  },
  {
    id: 'w2',
    area: 'wellbeing',
    title: 'Having good health',
    ready: 'Washes hands, brushes teeth and blows her nose with little help, and knows why.',
    games: ['me/routines', 'me/what-to-do', 'world/touch-body'],
    ticks: ['Washes and dries her hands on her own', 'Brushes her teeth (with a grown-up checking)', 'Uses the toilet on her own', 'Coughs and sneezes into her elbow'],
  },
  {
    id: 'w3',
    area: 'wellbeing',
    title: 'Being safe and secure',
    ready: 'Knows dangerous things and signs, and gives her name, address and a contact number.',
    games: ['me/safety', 'me/about-me', 'stories/signs'],
    ticks: ['Says her full name', 'Says where she lives', 'Says a grown-up’s phone number', 'Knows what to do if she is lost', 'Holds hands to cross the road'],
  },
  {
    id: 'w4',
    area: 'wellbeing',
    title: 'Developing physical abilities',
    ready: 'Hops, skips, jumps and balances; cuts along a line; holds a crayon well.',
    games: ['shapes/trace-shape', 'colours/paint-bucket', 'art/paint-by-numbers'],
    ticks: ['Hops on one foot', 'Skips or gallops', 'Catches a big ball', 'Cuts along a line with scissors', 'Holds a crayon with a good grip', 'Threads beads'],
  },
  {
    id: 'w5',
    area: 'wellbeing',
    title: 'Building resilience',
    ready: 'Names her feelings, calms herself with help, waits her turn, and asks for help.',
    games: ['feelings/check-in', 'feelings/who-is', 'feelings/how-feel', 'thinking/wait-for-it'],
    ticks: ['Says how she feels', 'Calms down with big breaths (with help)', 'Asks for help when she needs it', 'Tries again when something is hard'],
  },
  // ELDA 2 Identity and belonging
  {
    id: 'i1',
    area: 'identity',
    title: 'Children are aware of themselves as capable and confident learners',
    ready: 'Shows what she can do, tries new things, and talks about what she likes.',
    games: ['me/about-me'],
    ticks: ['Tries new activities', 'Says what she is good at', 'Chooses her own activities'],
  },
  {
    id: 'i2',
    area: 'identity',
    title: 'Children have a strong sense of self-care',
    ready: 'Dresses and undresses, follows routines, and helps with little jobs.',
    games: ['me/routines'],
    ticks: ['Dresses herself', 'Puts on her own shoes', 'Packs away her toys', 'Helps with a job at home'],
  },
  {
    id: 'i3',
    area: 'identity',
    title: 'Children form relationships and work with others',
    ready: 'Takes turns, shares, follows simple rules and plays with other children.',
    games: ['me/take-turns', 'me/what-to-do', 'numbers/share'],
    ticks: ['Takes turns in a game', 'Shares toys', 'Plays with other children', 'Follows simple rules'],
  },
  {
    id: 'i4',
    area: 'identity',
    title: 'Children have a sense of group identity and celebrate differences',
    ready: 'Knows her family, talks about celebrations, and knows people have different languages and customs.',
    games: ['me/family', 'me/celebrate', 'afrikaans/touch-word'],
    ticks: ['Names the people in her family', 'Talks about a celebration', 'Knows some words in another language'],
  },
  // ELDA 3 Communication
  {
    id: 'c1',
    area: 'communication',
    title: 'Children listen to sounds and speech',
    ready: 'Hears rhymes and syllables, recognises many sounds, remembers what she hears, and follows instructions.',
    games: ['stories/sounds', 'stories/rhyme', 'stories/clap', 'stories/listen-order', 'stories/count-words', 'world/who-says'],
    ticks: ['Follows 2–3 step instructions', 'Listens to a story to the end', 'Joins in with rhymes and songs'],
  },
  {
    id: 'c2',
    area: 'communication',
    title: 'Children speak using different styles of communication',
    ready: 'Speaks in sentences, tells about her day, uses new words, and asks questions.',
    games: ['stories/say-it', 'stories/new-words', 'afrikaans/touch-word'],
    ticks: ['Speaks in full sentences', 'Tells a grown-up about her day', 'Asks why and how questions', 'Uses new words she has learned'],
  },
  {
    id: 'c3',
    area: 'communication',
    title: 'Children make meaning by “reading” what they see, hear, feel, taste and touch',
    ready: 'Retells stories, predicts what happens next, recognises her written name and signs around her.',
    games: ['stories/story-time', 'stories/find-name', 'stories/signs', 'letters/touch-letter', 'letters/match-it'],
    ticks: ['Holds a book the right way and turns the pages', 'Retells a favourite story', 'Recognises her written name', 'Points to signs (STOP, toilets)'],
  },
  {
    id: 'c4',
    area: 'communication',
    title: 'Children record their experiences and ideas through language, art, drama and later “writing”',
    ready: 'Draws and talks about her drawings, makes marks and pretend writing.',
    games: ['art/draw', 'shapes/trace-shape'],
    ticks: ['Talks about what she has drawn', 'Makes marks or pretend writing', 'Draws a person with a head, body, arms and legs'],
  },
  // ELDA 4 Exploring mathematics
  {
    id: 'm1',
    area: 'maths',
    title: 'Children show awareness of and are responsive to number and counting',
    ready: 'Counts objects to 10, knows numerals, shows numbers on her fingers, and solves little number stories.',
    games: ['numbers/touch-number', 'numbers/match-it', 'numbers/feed-me', 'numbers/fingers', 'numbers/number-stories', 'numbers/guess-count'],
    ticks: ['Counts 10 things, touching each one', 'Shows numbers on her fingers', 'Counts stairs or spoons in everyday life'],
  },
  {
    id: 'm2',
    area: 'maths',
    title: 'Children sort, classify, make comparisons and solve problems',
    ready: 'Sorts by colour, size and shape, uses more, fewer and the same, shares fairly, finds the odd one out.',
    games: ['thinking/sort', 'thinking/odd-one-out', 'numbers/more-fewer', 'numbers/share', 'colours/touch-colour'],
    ticks: ['Sorts toys or laundry into groups', 'Uses the words more, fewer and the same', 'Shares things out fairly'],
  },
  {
    id: 'm3',
    area: 'maths',
    title: 'Children explore shape, space and measurement',
    ready: 'Names shapes, uses position words, compares sizes and continues patterns.',
    games: ['shapes/touch-shape', 'shapes/match-it', 'thinking/where-is-it', 'thinking/compare', 'thinking/pattern'],
    ticks: ['Uses on, under, behind, next to', 'Says which is longer, taller or heavier', 'Makes a pattern with toys or blocks'],
  },
  // ELDA 5 Creativity
  {
    id: 'cr1',
    area: 'creativity',
    title: 'Creating solutions through problem solving',
    ready: 'Does puzzles, guesses from clues, and tries different ways to solve a problem.',
    games: ['thinking/puzzle', 'thinking/riddles', 'thinking/odd-one-out'],
    ticks: ['Does a puzzle of 12 or more pieces', 'Tries another way when stuck'],
  },
  {
    id: 'cr2',
    area: 'creativity',
    title: 'Creating solutions through play and make-believe',
    ready: 'Plays pretend, acts out stories and invents games.',
    games: [],
    ticks: ['Plays pretend (shop, house, doctor)', 'Acts out a story', 'Makes up her own games'],
  },
  {
    id: 'cr3',
    area: 'creativity',
    title: 'Creating solutions through visual art',
    ready: 'Paints, draws, mixes colours and makes things, and tells about her art.',
    games: ['art/draw', 'art/paint-by-numbers', 'colours/mix-paint'],
    ticks: ['Draws and paints freely', 'Makes things with play dough or boxes'],
  },
  {
    id: 'cr4',
    area: 'creativity',
    title: 'Creating solutions through music, dance and drama',
    ready: 'Sings, dances, claps a beat, and hears high/low, fast/slow, loud/soft.',
    games: ['art/music', 'art/listen-music', 'art/copy-beat', 'stories/clap'],
    ticks: ['Sings songs and rhymes', 'Dances to music', 'Claps or drums a rhythm'],
  },
  // ELDA 6 Knowledge and understanding of the world
  {
    id: 'k1',
    area: 'world',
    title: 'Children explore and investigate their life world',
    ready: 'Knows animals and their babies and homes, her senses, the weather, how living things grow.',
    games: ['world/touch-animal', 'world/babies', 'world/senses', 'world/weather', 'world/dress-weather', 'world/grow'],
    ticks: ['Explores nature (bugs, plants, the weather)', 'Asks questions about how things work'],
  },
  {
    id: 'k2',
    area: 'world',
    title: 'Children explore, design, make items and use technology',
    ready: 'Builds and makes things, uses simple tools, and uses technology safely.',
    games: ['thinking/puzzle'],
    ticks: ['Builds with blocks or boxes', 'Uses simple tools (scissors, a spoon to scoop)', 'Knows to ask before using a phone or tablet'],
  },
  {
    id: 'k3',
    area: 'world',
    title: 'Children explore and investigate time and place',
    ready: 'Knows morning and night and the order of her day, people who help us, and places in her community.',
    games: ['world/time', 'world/helpers', 'me/family'],
    ticks: ['Talks about yesterday and tomorrow', 'Knows the order of her day', 'Names places she goes (shop, clinic, school)'],
  },
];

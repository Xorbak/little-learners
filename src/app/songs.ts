import type { ClipTable } from '../types/learning';
import { hasTrack } from '../shared/audio/music';

/**
 * Sing-along songs (made with Suno; files in src/music/, see the README there).
 * A song shows up in Art and music → Sing along once its file is in src/music.
 * The words are shown while it plays so a grown-up can sing along; if a song
 * was made with different words, change them here.
 */
export interface Song {
  key: string;
  icon: string;
  name: string;
  /** Beats per minute (the picture bounces along) */
  bpm: number;
  words: string;
}

export const SONGS: Song[] = [
  {
    key: 'song-count',
    bpm: 100,
    icon: '🔢',
    name: 'Count to ten',
    words: `One, two, clap with me!
Three, four, tap your knee!
Five, six, touch your nose!
Seven, eight, wiggle your toes!
Nine, ten, jump up high!
Count to ten and wave goodbye!

Count with me, count with me
One, two, three, four, five
Six, seven, eight, nine, ten
Let's count it all again!

One, two, stamp your feet!
Three, four, turn around so neat!
Five, six, pat your head!
Seven, eight, touch something red!
Nine, ten, stretch up tall!
Count to ten, the best of all!

Count with me, count with me
One, two, three, four, five
Six, seven, eight, nine, ten
Let's count it all again!

Ten! Hooray!`,
  },
  {
    key: 'song-colours',
    bpm: 100,
    icon: '🌈',
    name: 'Colours all around',
    words: `Red like a strawberry, red like a fire truck
Blue like the sky and the little blue duck
Yellow like the sunshine, yellow like a chick
Green like the grass and a crunchy green stick

Colours, colours, all around
In the sky and on the ground
Point and say them, one, two, three
How many colours can you see?

Orange like an orange, round and bright
Purple like the grapes and the sky at night
Pink like a flamingo standing on one leg
Brown like a teddy and a chocolate egg

Colours, colours, all around
In the sky and on the ground
Point and say them, one, two, three
How many colours can you see?

Rainbow colours, look at me!`,
  },
  {
    key: 'song-move',
    bpm: 116,
    icon: '🐸',
    name: 'Move like the animals',
    words: `Are you ready? Stand up tall!
Let's move like the animals, one and all!

Hop like a frog, hop, hop, hop! (Hop, hop, hop!)
Hop like a frog, and now we stop!
Stomp like a dinosaur, stomp, stomp, stomp! (Stomp, stomp, stomp!)
Stomp like a dinosaur, big feet, romp!

Move, move, move like the animals
Wiggle and jiggle and jump!
Move, move, move like the animals
Bump, bump, bumpity bump!

Waddle like a penguin, side to side (Side to side!)
Flap like a bird and fly so wide (Fly so wide!)
Reach like a giraffe up to the sky (Up so high!)
Then curl up small like a snail, oh my!

Move, move, move like the animals
Wiggle and jiggle and jump!
Move, move, move like the animals
Bump, bump, bumpity bump!

Now breathe in slow… and breathe out too…
Well done, animals! I'm proud of you!`,
  },
  {
    key: 'song-tidy',
    bpm: 108,
    icon: '🧸',
    name: 'Tidy up',
    words: `Toys are sleepy, time for bed
Blocks and teddies, cars and Ted
Pick them up and count them in
One, two, three, let's all begin!

Tidy, tidy, tidy up
Every toy has a home
Tidy, tidy, tidy up
No toy is left alone!

Books go on the shelf so high
Balls roll in the box, bye bye
Four, five, six, we're nearly there
Seven, eight, the floor is bare!

Tidy, tidy, tidy up
Every toy has a home
Tidy, tidy, tidy up
No toy is left alone!

Hooray, all done! High five!`,
  },
  {
    key: 'calm-breathe-song',
    bpm: 60,
    icon: '🌸',
    name: 'Breathe with me',
    words: `Smell the flower, breathe in slow
Blow the candle, out we go
Smell the flower, nice and deep
Blow the candle, soft and sweet

In… and out…
In… and out…
My body's calm, my heart is slow
In… and out…

Like a balloon I fill up wide
Then let the air float out outside
Like the waves upon the sea
In and out, so peacefully

In… and out…
In… and out…
My body's calm, my heart is slow
In… and out…

Smell the flower…
Blow the candle…`,
  },
  {
    key: 'song-break',
    bpm: 72,
    icon: '🦉',
    name: 'Off we go',
    words: `Time to let the screen go sleep
The owl is yawning, not a peep
We played so well, we learned a lot
Now let's go play, ready or not!

Off we go, off we go
Jump and run and twirl just so
Build a tower, roll a ball
Playing together is best of all

Find your teddy, hug him tight
Look for birds up in the light
When it's time, we'll play some more
But now let's run out through the door!

Off we go, off we go
Jump and run and twirl just so
Build a tower, roll a ball
Playing together is best of all

Bye bye, screen! See you later!`,
  },
];

/** Songs whose file is in src/music */
export const availableSongs = () => SONGS.filter((s) => hasTrack(s.key));

/** A song to go with a mission, played while she does it */
export const MISSION_SONGS: Record<string, string> = {
  tidy: 'song-tidy',
  dance: 'song-move',
  'red-things': 'song-colours',
  'blue-things': 'song-colours',
  'yellow-things': 'song-colours',
  'green-walk': 'song-colours',
  'toy-line': 'song-count',
  'count-spoons': 'song-count',
  'count-stairs': 'song-count',
};

export const songClips: ClipTable = {
  'songs.title': 'Sing along',
  'songs.choose': 'Pick a song, and sing along!',
  'songs.again': 'Shall we sing another one?',
  'songs.mission': 'Play a song while you do it!',
  ...Object.fromEntries(SONGS.map((s) => [`song.${s.key}`, s.name])),
};

import type { ClipTable } from '../../types/learning';

/** Narration used across the whole app */
export const sharedClips: ClipTable = {
  'shared.welcome': "Hello! Let's play!",
  'shared.thats': "That's",
  'shared.praise.1': 'Well done!',
  'shared.praise.2': 'You did it!',
  'shared.praise.3': 'Wow, amazing!',
  'shared.praise.4': 'Yay! Super job!',
  'shared.level-done': 'Hooray! You finished them all!',
  'shared.something-new': 'Ooh! Next time, something new!',
  'shared.play-again': "Let's play again!",
  'shared.hello': 'Hello',
  'shared.lets-play': "Let's play!",
  'shared.well-done-step': 'Well done!',
  'sticker.got': 'You got a sticker!',
  'sticker.got-for': 'You got a sticker for finishing',
  'sticker.when.today': 'You got this one today,',
  'sticker.when.yesterday': 'You got this one yesterday,',
  'sticker.when.before': 'You got this one',
  'sticker.why.in': 'in',
  'sticker.why.for': 'for finishing',
  'sticker.why.trophy-today': 'You got it today, for doing all your games!',
  'sticker.why.trophy': 'You got it for doing all your games!',
  'sticker.why.unknown': 'You got it for finishing a game. Well done!',
  'sticker.book': 'Your sticker book!',
  'sticker.empty': 'Your sticker book! Finish a game to get your first sticker.',
  'today.title': "Today's lessons",
  'today.hello': "Today's lessons! A little bit of everything. Press play!",
  'today.next': 'Well done! Ready for the next one?',
  'today.all-done': 'You did all of today’s lessons! Here is a golden trophy!',
  'today.all-done-again': 'All done for today! You can play anything you like.',
};

export const praiseClips = ['shared.praise.1', 'shared.praise.2', 'shared.praise.3', 'shared.praise.4'];

export function randomPraise(): string {
  return praiseClips[Math.floor(Math.random() * praiseClips.length)];
}

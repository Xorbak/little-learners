import type { Game } from '../../../types/learning';
import { lettersFor } from '../words';

/** "Touch the letter s" works with a recorded sound and with the computer saying the name */
const LETTER_WORDS = { askClip: 'letters.touch-the-letter', yesClip: 'letters.yes-letter', oopsClip: 'letters.oops-letter' };

/** Touch the Letter: "Touch the sss!" Same order as the flash cards. Letters are named by their sound once you record them (the computer says the letter name until then). */
export const touchLetter: Game = {
  id: 'touch-letter',
  titleClip: 'letters.touch-title',
  icon: '👆',
  levels: [
    { id: 'sat', parentLabel: 's a t: pick from 2', rounds: 5, activity: { kind: 'touch-it', pool: lettersFor('sat'), choices: 2, varied: 'none', ...LETTER_WORDS } },
    { id: 'satpin', parentLabel: 's a t p i n: pick from 3', rounds: 6, activity: { kind: 'touch-it', pool: lettersFor('satpin'), choices: 3, varied: 'colour', ...LETTER_WORDS } },
    { id: 'mdgock', parentLabel: '+ m d g o c k', rounds: 6, activity: { kind: 'touch-it', pool: lettersFor('satpinmdgock'), choices: 4, varied: 'colour', ...LETTER_WORDS } },
    { id: 'eurhbfl', parentLabel: '+ e u r h b f l', rounds: 6, activity: { kind: 'touch-it', pool: lettersFor('satpinmdgockeurhbfl'), choices: 4, varied: 'colour', ...LETTER_WORDS } },
    { id: 'all', parentLabel: 'All the letters', rounds: 6, activity: { kind: 'touch-it', pool: lettersFor('abcdefghijklmnopqrstuvwyz'), choices: 5, varied: 'colour', ...LETTER_WORDS } },
    { id: 'look-alikes', parentLabel: 'Look-alikes: b d p q, m n, u n', rounds: 6, activity: { kind: 'touch-it', pool: lettersFor('bdpqmnu'), choices: 4, varied: 'none', ...LETTER_WORDS } },
  ],
};

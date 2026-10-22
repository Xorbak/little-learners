import type { AboutMe } from '../shared/progress/store';
import type { FamilyMember } from '../shared/family';
import { familyClip } from '../shared/family';
import { hasName } from './name';

/**
 * Her details (typed by a grown-up) as narrator clips, so the About Me game can
 * say "Your name is Mia Star!" and "You live at 12 Rose Street". Recorded
 * versions are welcome: record e.g. me.v.full-name.
 */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;

/** Her age in whole years, from her birthday */
export function ageOf(birthday?: string): number | undefined {
  if (!birthday) return undefined;
  const [y, m, d] = birthday.split('-').map(Number);
  if (!y) return undefined;
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age -= 1;
  return age >= 0 && age < 20 ? age : undefined;
}

export const isBirthdayToday = (birthday?: string) => {
  if (!birthday) return false;
  const [, m, d] = birthday.split('-').map(Number);
  const now = new Date();
  return now.getMonth() + 1 === m && now.getDate() === d;
};

/** "0 8 2, 5 5 5, 1 2 3 4": digit by digit, in little groups, so it's easy to say along */
export function phoneWords(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const groups = digits.length === 10 ? [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)] : digits.match(/.{1,3}/g) ?? [];
  return groups.map((g) => g.split('').join(' ')).join(', ');
}

export function aboutMeClips(name: string, me: AboutMe = {}, family: FamilyMember[] = []): Record<string, string> {
  const first = hasName(name) ? name.trim() : '';
  const age = ageOf(me.birthday);
  const [, bm, bd] = (me.birthday ?? '').split('-').map(Number);
  const clips: Record<string, string> = {
    'me.v.name': first,
    'me.v.full-name': [first, me.surname?.trim()].filter(Boolean).join(' '),
    'me.v.surname': me.surname?.trim() ?? '',
    'me.v.age': age !== undefined ? `${age} years old` : '',
    'me.v.age-number': age !== undefined ? String(age) : '',
    'me.v.birthday': bm && bd ? `the ${ordinal(bd)} of ${MONTHS[bm - 1]}` : '',
    'me.v.town': me.town?.trim() ?? '',
    'me.v.street': [me.street?.trim(), me.town?.trim()].filter(Boolean).join(', '),
    'me.v.phone': me.phone ? phoneWords(me.phone) : '',
    'me.v.phone-of': me.phoneOf?.trim() || "a grown-up's",
    'me.v.school': me.school?.trim() ?? '',
  };
  for (const m of family) clips[familyClip(m)] = m.name;
  return clips;
}

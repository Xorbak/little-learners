import type { ClipTable, LearningItem } from '../../types/learning';

/**
 * Builds learning items whose picture is an emoji (animals, weather, faces, things).
 * Clips are made from the words given, under `${prefix}.name.<key>` etc.
 */
export interface EmojiEntry {
  key: string;
  emoji: string;
  name: string;
  plural?: string;
  /** What it says or sounds like ("moo") */
  sound?: string;
  /** What kind of thing it is (for odd-one-out) */
  group?: string;
  /** Show the emoji at this size (1 = normal), e.g. 0.55 for "small" */
  scale?: number;
}

export function EmojiPicture({ emoji, size, scale = 1 }: { emoji: string; size: number; scale?: number }) {
  return (
    <span className="emoji-picture" style={{ fontSize: size * 0.8 * scale, lineHeight: 1 }} aria-hidden="true">
      {emoji}
    </span>
  );
}

export function emojiItems(prefix: string, list: EmojiEntry[], groupWords: Record<string, string> = {}) {
  const items: Record<string, LearningItem> = {};
  const clips: ClipTable = {};
  for (const e of list) {
    clips[`${prefix}.name.${e.key}`] = e.name;
    clips[`${prefix}.plural.${e.key}`] = e.plural ?? `${e.name}s`;
    if (e.sound) clips[`${prefix}.sound.${e.key}`] = e.sound;
    items[e.key] = {
      key: e.key,
      nameClip: `${prefix}.name.${e.key}`,
      pluralClip: `${prefix}.plural.${e.key}`,
      soundClip: e.sound ? `${prefix}.sound.${e.key}` : undefined,
      group: e.group ? { key: e.group, clip: `${prefix}.group.${e.group}` } : undefined,
      Display: ({ size }: { size: number }) => <EmojiPicture emoji={e.emoji} size={size} scale={e.scale} />,
      BalloonLabel: ({ size }: { size: number }) => <EmojiPicture emoji={e.emoji} size={size * 0.9} scale={e.scale} />,
    };
  }
  for (const [g, word] of Object.entries(groupWords)) clips[`${prefix}.group.${g}`] = word;
  return { items, clips };
}

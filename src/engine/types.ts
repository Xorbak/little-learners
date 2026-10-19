import type { FC } from 'react';
import type { ActivityConfig, ClipTable, LearningItem } from '../types/learning';

/** What every game mechanic receives for one round */
export interface RoundProps<C extends ActivityConfig> {
  config: C;
  /** The item she is looking for this round */
  target: LearningItem;
  /** All items in the section, for distractors */
  items: Record<string, LearningItem>;
  /** She got one right */
  onCorrect: (item: LearningItem) => void;
  /** She tapped the wrong thing (never punished, only recorded) */
  onWrong: (target: LearningItem, tapped: LearningItem) => void;
  /** The round is finished */
  onRoundComplete: () => void;
  /** Does she already know this item well? (from her saved progress) */
  isKnown: (item: LearningItem) => boolean;
  /** How many times she has got this item right (e.g. pictures she has finished) */
  timesRight: (item: LearningItem) => number;
}

export interface Mechanic<C extends ActivityConfig> {
  Round: FC<RoundProps<C>>;
  /** Narration this mechanic needs */
  clips: ClipTable;
}

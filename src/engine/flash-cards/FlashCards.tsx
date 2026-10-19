import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ClipId, FlashCardsConfig, LearningItem } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import './flashCards.css';

/**
 * Flash Cards (phonics)
 * Front: a big picture, "What's this?" so she can have a go at naming it.
 * Tap: the card flips. Back: the picture and the word, first letter highlighted:
 * "cat… starts with k… k… cat". Tap the first letter to hear its sound again,
 * tap the word to hear the word. The arrow brings the next card.
 * There's no right or wrong here: it's look, listen and say.
 */

const shuffle = <T,>(list: T[]): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function dealDeck(config: FlashCardsConfig, target: LearningItem, items: Record<string, LearningItem>): LearningItem[] {
  const others = shuffle(config.pool.filter((k) => k !== target.key)).slice(0, config.cardsPerDeck - 1);
  return shuffle([target.key, ...others]).map((k) => items[k]);
}

function FlashCardsRound({ config, target, items, onRoundComplete }: RoundProps<FlashCardsConfig>) {
  const [deck] = useState(() => dealDeck(config, target, items));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const card = deck[index];

  const sayFront = useCallback(() => void narrator.say(['cards.whats-this']), []);
  const sayBack = useCallback(() => {
    // With your recorded letter sound: "cat… starts with k… k… cat".
    // Without it, the computer can't say sounds well, so: "cat… starts with the letter C".
    const phonics: ClipId[] = !card.soundClip
      ? []
      : narrator.hasRecording(card.soundClip)
        ? ['cards.starts-with', card.soundClip, card.soundClip, card.nameClip]
        : ['cards.starts-with-letter', card.soundClip];
    void narrator.say([card.nameClip, ...phonics]);
  }, [card]);

  // Each new card asks "What's this?"
  useEffect(() => {
    sayFront();
  }, [index, sayFront]);

  const flip = () => {
    if (flipped) {
      sayBack();
      return;
    }
    sfx.flip();
    setFlipped(true);
    window.setTimeout(sayBack, 350);
  };

  const next = () => {
    sfx.pop();
    if (index + 1 >= deck.length) {
      narrator.stop();
      onRoundComplete();
      return;
    }
    setLeaving(true);
    window.setTimeout(() => {
      setFlipped(false);
      setLeaving(false);
      setIndex((i) => i + 1);
    }, 320);
  };

  const word = card.word ?? narrator.allClips()[card.nameClip] ?? '';

  return (
    <div className="fc-round">
      <header className="fc-top">
        <SpeakerButton onPress={flipped ? sayBack : sayFront} />
        <div className="fc-progress" aria-label={`Card ${index + 1} of ${deck.length}`}>
          {deck.map((_, i) => (
            <span key={i} className={`fc-dot ${i < index || (i === index && flipped) ? 'fc-dot--done' : ''}`} />
          ))}
        </div>
      </header>

      <div className="fc-stage">
        <div
          key={card.key}
          className={`fc-card ${flipped ? 'fc-card--flipped' : ''} ${leaving ? 'fc-card--leaving' : ''}`}
          onClick={flip}
          role="button"
          aria-label={flipped ? word : 'Turn the card over'}
        >
          <div className="fc-inner">
            <div className="fc-face fc-face--front">
              <card.Display size={220} />
            </div>
            <div className="fc-face fc-face--back">
              <card.Display size={170} />
              <div className="fc-word" style={{ '--len': word.length } as CSSProperties} aria-hidden="true">
                <span
                  className="fc-first"
                  onClick={(e) => {
                    if (!flipped || !card.soundClip) return;
                    e.stopPropagation();
                    void narrator.say([card.soundClip]);
                  }}
                >
                  {word.charAt(0)}
                </span>
                {word.slice(1)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fc-bottom">
        {flipped && (
          <button type="button" className="fc-next" onClick={next} aria-label="Next card">
            <svg viewBox="0 0 24 24" width="56" height="56" aria-hidden="true">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export const flashCards: Mechanic<FlashCardsConfig> = {
  Round: FlashCardsRound,
  clips: {
    'cards.title': 'Flash cards!',
    'cards.whats-this': "What's this?",
    'cards.starts-with': 'starts with',
    'cards.starts-with-letter': 'starts with the letter',
  },
};

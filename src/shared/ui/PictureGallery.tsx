import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ClipId, LearningItem } from '../../types/learning';
import { narrator } from '../audio/narrator';
import { sfx } from '../audio/sfx';
import { SpeakerButton } from './SpeakerButton';
import './pictureGallery.css';

/**
 * A gallery of pictures to choose from (Paint by Numbers, Puzzles).
 * She taps the one she wants; a ⭐ marks pictures she has finished before.
 * Items with a photo show the photo; others show their Display drawing.
 */
export function PictureGallery({
  items,
  askClip,
  isDone,
  onPick,
  extra,
}: {
  items: LearningItem[];
  /** What the narrator asks, e.g. "Which picture do you want to paint?" */
  askClip: ClipId;
  isDone: (item: LearningItem) => boolean;
  onPick: (item: LearningItem) => void;
  /** Anything else for the top bar (e.g. the numbers / free painting switch) */
  extra?: ReactNode;
}) {
  useEffect(() => {
    void narrator.say([askClip]);
  }, [askClip]);

  return (
    <div className="gallery-round">
      <header className={`gallery-top${extra ? ' gallery-top--extra' : ''}`}>
        <SpeakerButton onPress={() => void narrator.say([askClip])} />
        {extra}
      </header>
      <div className="gallery">
        {items.map((item, i) => (
          <button
            key={item.key}
            type="button"
            className={`gallery-card${item.photo ? ' gallery-card--photo' : ''}`}
            style={{ animationDelay: `${i * 0.05}s` }}
            onClick={() => {
              sfx.pop();
              onPick(item);
            }}
            aria-label={narrator.allClips()[item.nameClip]}
          >
            {item.photo ? <img src={item.photo} alt="" draggable={false} /> : <item.Display size={150} />}
            {isDone(item) && (
              <span className="gallery-star" aria-label="Done before">
                ⭐
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

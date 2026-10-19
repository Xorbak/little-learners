import { useEffect, useState } from 'react';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { STICKERS, TROPHY, useProgress } from '../../shared/progress/store';
import { HomeIcon, RoundButton } from '../../shared/ui/RoundButton';
import type { Navigate } from '../App';

/** Her sticker book: every sticker she has earned, and empty spots for ones still to find. */
export function StickerBook({ navigate }: { navigate: Navigate }) {
  const saved = useProgress();
  const mine = saved.profiles[saved.activeProfileId].stickers ?? [];
  const trophies = mine.filter((s) => s === TROPHY).length;
  const [wiggle, setWiggle] = useState<string | null>(null);

  useEffect(() => {
    void narrator.say([mine.length ? 'sticker.book' : 'sticker.empty']);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="screen screen--stickers">
      <div className="corner-left">
        <RoundButton label="Home" variant="home" onPress={() => navigate({ name: 'home' })}>
          <HomeIcon />
        </RoundButton>
      </div>
      <header className="book-top">
        <span className="book-title" aria-hidden="true">📒</span>
        {trophies > 0 && (
          <span className="book-trophies" aria-label={`${trophies} trophies`}>
            {TROPHY} × {trophies}
          </span>
        )}
      </header>
      <div className="book-page">
        {STICKERS.map((s) => {
          const have = mine.includes(s);
          return (
            <button
              key={s}
              type="button"
              className={`book-slot ${have ? 'book-slot--have' : ''} ${wiggle === s ? 'book-slot--wiggle' : ''}`}
              onClick={() => {
                if (!have) return;
                sfx.pop();
                setWiggle(s);
                window.setTimeout(() => setWiggle((w) => (w === s ? null : w)), 600);
              }}
              aria-label={have ? 'Sticker' : 'Empty spot'}
            >
              {have ? s : ''}
            </button>
          );
        })}
      </div>
    </main>
  );
}

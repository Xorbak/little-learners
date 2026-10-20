import type { Section } from '../../types/learning';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { HomeIcon, RoundButton } from '../../shared/ui/RoundButton';
import type { Navigate } from '../App';
import { Tag, words } from '../../shared/ui/Tag';
import { availableSongs } from '../songs';

/** The games inside one section. She taps a game and it starts at her current level. */
export function SectionScreen({ section, navigate }: { section: Section; navigate: Navigate }) {
  return (
    <main className="screen" style={{ background: `color-mix(in srgb, ${section.colour} 25%, var(--sky))` }}>
      <div className="corner-left">
        <RoundButton label="Home" variant="home" onPress={() => navigate({ name: 'home' })}>
          <HomeIcon />
        </RoundButton>
      </div>

      <div className="tile-grid">
        {section.games.map((game, i) => (
          <button
            key={game.id}
            type="button"
            className="tile tile--game"
            style={{ animationDelay: `${i * 0.08}s` }}
            onClick={() => {
              sfx.pop();
              navigate({ name: 'play', sectionId: section.id, gameId: game.id });
            }}
            aria-label={narrator.allClips()[game.titleClip]}
          >
            <span className="tile-icon">{game.icon}</span>
            <Tag>{words(game.titleClip)}</Tag>
          </button>
        ))}
        {/* Sing along, once there are songs in src/music */}
        {section.id === 'art' && availableSongs().length > 0 && (
          <button
            type="button"
            className="tile tile--game"
            style={{ animationDelay: `${section.games.length * 0.08}s` }}
            onClick={() => {
              sfx.pop();
              navigate({ name: 'songs' });
            }}
            aria-label={narrator.allClips()['songs.title']}
          >
            <span className="tile-icon">🎤</span>
            <Tag>{words('songs.title')}</Tag>
          </button>
        )}
      </div>
    </main>
  );
}

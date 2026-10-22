import type { Section } from '../../types/learning';
import { worldClips, worldItems } from './things';
import { touchAnimal, touchBody, touchWeather, whoSays } from './games';
import { babiesGame, dressGame, growGame, helpersGame, moreWorldClips, moreWorldItems, sensesGame, timeGame } from './more';

/** My World: animals and their sounds, my body, and the weather. */
const world: Section = {
  id: 'world',
  order: 5,
  titleClip: 'world.title',
  icon: '🌍',
  colour: '#94d82d',
  items: { ...worldItems, ...moreWorldItems },
  clips: {
    'world.title': 'My world',
    'world.who-says-title': 'Who says moo?',
    'world.animals-title': 'Touch the animal!',
    'world.body-title': 'My body',
    'world.weather-title': 'The weather',
    'world.who-says': 'Who says',
    'world.which-is': 'Which one is',
    'world.yes': 'Yes! It is',
    'world.that-one-is': 'Oops! That one is',
    'world.babies-title': 'Baby animals',
    'world.helpers-title': 'Who helps us?',
    'world.dress-title': 'Dress for the weather',
    'world.senses-title': 'My senses',
    'world.grow-title': 'How things grow',
    'world.time-title': 'Morning or night?',
    ...worldClips,
    ...moreWorldClips,
  },
  games: [whoSays, touchAnimal, touchBody, touchWeather, babiesGame, helpersGame, dressGame, sensesGame, growGame, timeGame],
};

export default world;

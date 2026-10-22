import type { Game } from '../../types/learning';
import { allAnimals, animalKeys, bodyKeys, saAnimals, weatherKeys } from './things';

/** "Who says moo?" She hears the sound and touches the animal; it answers with its name and sound. */
export const whoSays: Game = {
  id: 'who-says',
  titleClip: 'world.who-says-title',
  icon: '🐮',
  levels: [
    { id: 'three-from-2', parentLabel: 'Cow, dog, cat: pick from 2', rounds: 5, activity: { kind: 'touch-it', pool: animalKeys.firstThree, choices: 2, varied: 'none', askWith: 'sound', askClip: 'world.who-says' } },
    { id: 'three', parentLabel: 'Cow, dog, cat: pick from 3', rounds: 5, activity: { kind: 'touch-it', pool: animalKeys.firstThree, choices: 3, varied: 'none', askWith: 'sound', askClip: 'world.who-says' } },
    { id: 'farm', parentLabel: 'On the farm', rounds: 6, activity: { kind: 'touch-it', pool: animalKeys.farm, choices: 4, varied: 'none', askWith: 'sound', askClip: 'world.who-says' } },
    { id: 'wild', parentLabel: 'Wild animals', rounds: 6, activity: { kind: 'touch-it', pool: animalKeys.wild, choices: 4, varied: 'none', askWith: 'sound', askClip: 'world.who-says' } },
    { id: 'all', parentLabel: 'All the animals', rounds: 6, activity: { kind: 'touch-it', pool: allAnimals, choices: 6, varied: 'none', askWith: 'sound', askClip: 'world.who-says' } },
  ],
};

/** "Touch the cow!" Animal names. */
export const touchAnimal: Game = {
  id: 'touch-animal',
  titleClip: 'world.animals-title',
  icon: '🦁',
  levels: [
    { id: 'farm', parentLabel: 'Farm animals', rounds: 6, activity: { kind: 'touch-it', pool: animalKeys.farm, choices: 3, varied: 'none' } },
    { id: 'wild', parentLabel: 'Wild animals', rounds: 6, activity: { kind: 'touch-it', pool: animalKeys.wild, choices: 4, varied: 'none' } },
    { id: 'all', parentLabel: 'All the animals', rounds: 6, activity: { kind: 'touch-it', pool: allAnimals, choices: 6, varied: 'none' } },
    { id: 'south-africa', parentLabel: 'South African animals (the Big Five and friends)', rounds: 6, activity: { kind: 'touch-it', pool: saAnimals, choices: 4, varied: 'none' } },
  ],
};

/** "Touch the nose!" Body parts. */
export const touchBody: Game = {
  id: 'touch-body',
  titleClip: 'world.body-title',
  icon: '👃',
  levels: [
    { id: 'face', parentLabel: 'Nose, eye, ear, mouth', rounds: 6, activity: { kind: 'touch-it', pool: bodyKeys.face, choices: 3, varied: 'none' } },
    { id: 'more', parentLabel: '+ hand, foot, tongue, tooth, leg, arm', rounds: 6, activity: { kind: 'touch-it', pool: bodyKeys.more, choices: 4, varied: 'none' } },
  ],
};

/** "Which one is sunny?" Weather words. */
export const touchWeather: Game = {
  id: 'weather',
  titleClip: 'world.weather-title',
  icon: '🌦️',
  levels: [
    { id: 'first', parentLabel: 'Sunny, rainy, snowy', rounds: 5, activity: { kind: 'touch-it', pool: weatherKeys.first, choices: 3, varied: 'none', askClip: 'world.which-is', yesClip: 'world.yes', oopsClip: 'world.that-one-is' } },
    { id: 'all', parentLabel: '+ windy, cloudy, stormy', rounds: 6, activity: { kind: 'touch-it', pool: weatherKeys.all, choices: 4, varied: 'none', askClip: 'world.which-is', yesClip: 'world.yes', oopsClip: 'world.that-one-is' } },
  ],
};

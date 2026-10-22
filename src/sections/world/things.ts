import { emojiItems } from '../../shared/ui/emojiItems';

/** My World: animals (with their sounds), body parts and weather. */

export const animalKeys = {
  firstThree: ['cow', 'dog', 'cat'],
  farm: ['cow', 'pig', 'sheep', 'horse', 'duck', 'chicken', 'goat'],
  wild: ['lion', 'monkey', 'elephant', 'snake', 'frog', 'owl', 'bee'],
};
export const allAnimals = [...new Set([...animalKeys.firstThree, ...animalKeys.farm, ...animalKeys.wild, 'mouse'])];
/** South African animals (the Big Five and friends) */
export const saAnimals = ['lion', 'elephant', 'rhino', 'leopard', 'buffalo', 'zebra', 'giraffe', 'hippo', 'penguin', 'baboon', 'springbok', 'crocodile'];

export const bodyKeys = {
  face: ['nose', 'eye', 'ear', 'mouth'],
  more: ['nose', 'eye', 'ear', 'mouth', 'hand', 'foot', 'tongue', 'tooth', 'leg', 'arm'],
};

export const weatherKeys = {
  first: ['sunny', 'rainy', 'snowy'],
  all: ['sunny', 'rainy', 'snowy', 'windy', 'cloudy', 'stormy'],
};

export const { items: worldItems, clips: worldClips } = emojiItems('world', [
  // Animals and what they say
  { key: 'cow', emoji: '🐮', name: 'cow', sound: 'Moo!' },
  { key: 'dog', emoji: '🐶', name: 'dog', sound: 'Woof woof!' },
  { key: 'cat', emoji: '🐱', name: 'cat', sound: 'Meow!' },
  { key: 'pig', emoji: '🐷', name: 'pig', sound: 'Oink oink!' },
  { key: 'sheep', emoji: '🐑', name: 'sheep', plural: 'sheep', sound: 'Baa!' },
  { key: 'horse', emoji: '🐴', name: 'horse', sound: 'Neigh!' },
  { key: 'duck', emoji: '🦆', name: 'duck', sound: 'Quack quack!' },
  { key: 'chicken', emoji: '🐔', name: 'chicken', sound: 'Cluck cluck!' },
  { key: 'goat', emoji: '🐐', name: 'goat', sound: 'Maa!' },
  { key: 'lion', emoji: '🦁', name: 'lion', sound: 'Roar!' },
  { key: 'monkey', emoji: '🐵', name: 'monkey', sound: 'Ooh ooh, aah aah!' },
  { key: 'elephant', emoji: '🐘', name: 'elephant', sound: 'Pawoo!' },
  { key: 'snake', emoji: '🐍', name: 'snake', sound: 'Hissss!' },
  { key: 'frog', emoji: '🐸', name: 'frog', sound: 'Ribbit!' },
  { key: 'owl', emoji: '🦉', name: 'owl', sound: 'Hoo hoo!' },
  { key: 'bee', emoji: '🐝', name: 'bee', sound: 'Bzzzz!' },
  { key: 'mouse', emoji: '🐭', name: 'mouse', plural: 'mice', sound: 'Squeak squeak!' },
  // South African animals
  { key: 'rhino', emoji: '🦏', name: 'rhino' },
  { key: 'leopard', emoji: '🐆', name: 'leopard' },
  { key: 'buffalo', emoji: '🐃', name: 'buffalo', plural: 'buffalo' },
  { key: 'zebra', emoji: '🦓', name: 'zebra' },
  { key: 'giraffe', emoji: '🦒', name: 'giraffe' },
  { key: 'hippo', emoji: '🦛', name: 'hippo' },
  { key: 'penguin', emoji: '🐧', name: 'penguin' },
  { key: 'baboon', emoji: '🐒', name: 'baboon' },
  { key: 'springbok', emoji: '🦌', name: 'springbok', plural: 'springbok' },
  { key: 'crocodile', emoji: '🐊', name: 'crocodile' },
  // Body
  { key: 'nose', emoji: '👃', name: 'nose' },
  { key: 'eye', emoji: '👁️', name: 'eye' },
  { key: 'ear', emoji: '👂', name: 'ear' },
  { key: 'mouth', emoji: '👄', name: 'mouth' },
  { key: 'hand', emoji: '✋', name: 'hand' },
  { key: 'foot', emoji: '🦶', name: 'foot', plural: 'feet' },
  { key: 'tongue', emoji: '👅', name: 'tongue' },
  { key: 'tooth', emoji: '🦷', name: 'tooth', plural: 'teeth' },
  { key: 'leg', emoji: '🦵', name: 'leg' },
  { key: 'arm', emoji: '💪', name: 'arm' },
  // Weather
  { key: 'sunny', emoji: '☀️', name: 'sunny', plural: 'sunny' },
  { key: 'rainy', emoji: '🌧️', name: 'rainy', plural: 'rainy' },
  { key: 'snowy', emoji: '❄️', name: 'snowy', plural: 'snowy' },
  { key: 'windy', emoji: '🌬️', name: 'windy', plural: 'windy' },
  { key: 'cloudy', emoji: '☁️', name: 'cloudy', plural: 'cloudy' },
  { key: 'stormy', emoji: '⛈️', name: 'stormy', plural: 'stormy' },
]);

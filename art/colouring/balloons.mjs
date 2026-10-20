import { page, sky, ground, cloud, eye, smile, L, path, ellipse } from './_page.mjs';
const balloon = (c, x, y, colour, face) =>
  path(`M${x} ${y + 150} C${x - 20} ${y + 300} ${x + 60} ${y + 400} 800 1010`, 'none', L(7)) +
  ellipse(x, y, 125, 150, c(colour), L(11)) +
  path(`M${x - 18} ${y + 160} L${x + 18} ${y + 160} L${x} ${y + 140} Z`, c(colour), L(7)) +
  (face ? eye(x - 40, y - 20, 24) + eye(x + 40, y - 20, 24) + smile(x, y + 35, 30) : '');
export default (c) =>
  page(
    [
      sky(c),
      cloud(c, 230, 160, 0.9),
      cloud(c, 1380, 230, 0.8),
      ground(c, 1010),
      balloon(c, 420, 480, '#ff6b6b', true),
      balloon(c, 1180, 470, '#4dabf7', true),
      balloon(c, 800, 330, '#ffe066', true),
      balloon(c, 600, 640, '#69db7c', false),
      balloon(c, 1000, 650, '#b197fc', false),
      path('M760 1010 L840 1010 L820 1080 L780 1080 Z', c('#ffa94d'), L(9)),
    ].join(''),
  );

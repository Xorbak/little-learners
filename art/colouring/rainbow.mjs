import { page, sky, eye, smile, L, path, blob, ground } from './_page.mjs';
const band = (c, R, ri, colour) => path(`M${800 - R} 940 A${R} ${R} 0 0 1 ${800 + R} 940 L${800 + ri} 940 A${ri} ${ri} 0 0 0 ${800 - ri} 940 Z`, c(colour), L(10));
const fluffy = (c, x, y, s) =>
  path(blob([[-170, 40], [-150, -30], [-90, -70], [-30, -120], [60, -110], [110, -60], [170, -40], [190, 30], [120, 80], [0, 90], [-120, 85]].map(([a, b]) => [x + a * s, y + b * s])), c('#fff'), L(10)) +
  eye(x - 45 * s, y - 10 * s, 22 * s) + eye(x + 45 * s, y - 10 * s, 22 * s) + smile(x, y + 30 * s, 30 * s);
export default (c) =>
  page(
    [
      sky(c),
      ground(c, 1040),
      band(c, 720, 615, '#ff6b6b'),
      band(c, 615, 510, '#ffa94d'),
      band(c, 510, 405, '#ffe066'),
      band(c, 405, 300, '#69db7c'),
      band(c, 300, 195, '#4dabf7'),
      band(c, 195, 90, '#b197fc'),
      fluffy(c, 160, 930, 1.0),
      fluffy(c, 1440, 930, 1.0),
    ].join(''),
  );

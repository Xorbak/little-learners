/** Shared bits for colouring pages: a 1600×1200 page, plus a few ready-made pieces. */
import { INK, ol, circle, ellipse, path, blob, rect, star } from '../lib.mjs';

export const PW = 1600;
export const PH = 1200;
export const page = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}" viewBox="0 0 ${PW} ${PH}">${body}</svg>`;

/** Line width for colouring pages (thick: clear areas for small fingers) */
export const L = (w = 9) => ol(w);

/** Cute eye that survives as line art: white, big ink pupil, sparkle */
export const eye = (x, y, r, look = [0, 0]) =>
  circle(x, y, r, '#fff', L(Math.max(5, r * 0.22))) +
  circle(x + look[0] * r * 0.25, y + look[1] * r * 0.25, r * 0.6, INK) +
  circle(x + look[0] * r * 0.25 - r * 0.22, y + look[1] * r * 0.25 - r * 0.25, r * 0.2, '#fff');

export const smile = (x, y, w) => path(`M${x - w} ${y} Q${x} ${y + w * 0.9} ${x + w} ${y}`, 'none', L(Math.max(6, w * 0.25)));

/** Sky + rolling ground: two big easy areas */
export const sky = (c, colour = '#a5d8ff') => `<rect x="0" y="0" width="${PW}" height="${PH}" fill="${c(colour)}"/>`;
export const ground = (c, y = 960, colour = '#8ce99a') =>
  path(`M-20 ${y} C400 ${y - 70} 1000 ${y + 60} 1620 ${y - 30} L1620 1220 L-20 1220 Z`, c(colour), L());

export const cloud = (c, x, y, s = 1) =>
  path(
    blob(
      [
        [-120, 25],
        [-105, -20],
        [-60, -40],
        [-25, -80],
        [35, -78],
        [65, -40],
        [110, -32],
        [130, 12],
        [90, 45],
        [0, 50],
        [-80, 50],
      ].map(([a, b]) => [x + a * s, y + b * s]),
    ),
    c('#fff'),
    L(),
  );

export const sunSimple = (c, x, y, r) => {
  let rays = '';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    rays += path(
      `M${(x + Math.cos(a - 0.2) * r * 1.15).toFixed(1)} ${(y + Math.sin(a - 0.2) * r * 1.15).toFixed(1)} L${(x + Math.cos(a) * r * 1.7).toFixed(1)} ${(y + Math.sin(a) * r * 1.7).toFixed(1)} L${(x + Math.cos(a + 0.2) * r * 1.15).toFixed(1)} ${(y + Math.sin(a + 0.2) * r * 1.15).toFixed(1)} Z`,
      c('#ffa94d'),
      L(7),
    );
  }
  return rays + circle(x, y, r, c('#ffd43b'), L()) + eye(x - r * 0.35, y - r * 0.1, r * 0.17) + eye(x + r * 0.35, y - r * 0.1, r * 0.17) + smile(x, y + r * 0.3, r * 0.25);
};

export { INK, ol, circle, ellipse, path, blob, rect, star };

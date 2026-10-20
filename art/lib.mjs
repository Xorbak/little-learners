/**
 * Little drawing kit for the app's own pictures (puzzle scenes).
 * Every helper returns an SVG string. Cartoon style: thick dark outlines,
 * round joins, flat bright colours, cute faces.
 */

export const INK = '#3d2c4e';
export const W = 1600;
export const H = 900;

const n = (v) => +v.toFixed(1);

/** Outline style used everywhere */
export const ol = (w = 7) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

export const svg = (body, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${body}</svg>`;

export const vgrad = (id, stops) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join('')}</linearGradient>`;

export const rgrad = (id, stops) =>
  `<radialGradient id="${id}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;

export const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
export const circle = (cx, cy, r, fill, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}" ${extra}/>`;
export const ellipse = (cx, cy, rx, ry, fill, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}" ${extra}/>`;
export const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
export const g = (body, transform = '') => `<g${transform ? ` transform="${transform}"` : ''}>${body}</g>`;

/** A smooth closed blob through points (Catmull-Rom → Bézier) */
export function blob(pts, tension = 1) {
  const p = pts;
  const len = p.length;
  let d = `M${n(p[0][0])} ${n(p[0][1])}`;
  for (let i = 0; i < len; i++) {
    const p0 = p[(i - 1 + len) % len];
    const p1 = p[i];
    const p2 = p[(i + 1) % len];
    const p3 = p[(i + 2) % len];
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    d += ` C${n(c1[0])} ${n(c1[1])} ${n(c2[0])} ${n(c2[1])} ${n(p2[0])} ${n(p2[1])}`;
  }
  return d + ' Z';
}

/** A wavy hill: top edge through points, filled down to the bottom */
export function hill(points, fill, bottom = H + 20, extra = ol(7)) {
  const pts = points;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const mx = (x1 + x2) / 2;
    d += ` C${n(mx)} ${y1} ${n(mx)} ${y2} ${x2} ${y2}`;
  }
  d += ` L${pts[pts.length - 1][0]} ${bottom} L${pts[0][0]} ${bottom} Z`;
  return path(d, fill, extra);
}

/** Cute eyes: white, big pupil, sparkle */
export function eye(x, y, r, look = [0, 0]) {
  return (
    circle(x, y, r, '#fff', ol(Math.max(3, r * 0.22))) +
    circle(x + look[0] * r * 0.25, y + look[1] * r * 0.25, r * 0.62, INK) +
    circle(x + look[0] * r * 0.25 - r * 0.22, y + look[1] * r * 0.25 - r * 0.25, r * 0.22, '#fff')
  );
}

/** Closed happy eye ^ */
export const happyEye = (x, y, r) => path(`M${x - r} ${y + r * 0.3} Q${x} ${y - r} ${x + r} ${y + r * 0.3}`, 'none', ol(Math.max(4, r * 0.35)));

export const smile = (x, y, w, open = false) =>
  open
    ? path(`M${x - w} ${y} Q${x} ${y + w * 1.3} ${x + w} ${y} Z`, '#c92a2a', ol(Math.max(4, w * 0.22))) +
      path(`M${x - w * 0.45} ${y + w * 0.55} Q${x} ${y + w * 0.3} ${x + w * 0.45} ${y + w * 0.55} Q${x} ${y + w * 0.95} ${x - w * 0.45} ${y + w * 0.55}Z`, '#ff8fa3')
    : path(`M${x - w} ${y} Q${x} ${y + w * 0.9} ${x + w} ${y}`, 'none', ol(Math.max(4, w * 0.25)));

export const cheek = (x, y, r) => ellipse(x, y, r, r * 0.65, '#ff8fab', 'opacity="0.7"');

/** A face: two eyes, cheeks and a smile, centred at (x, y), s = size */
export function face(x, y, s, { open = false, look = [0, 0], happy = false, cheeks = true } = {}) {
  const e = s * 0.18;
  const dx = s * 0.32;
  const eyes = happy ? happyEye(x - dx, y, e) + happyEye(x + dx, y, e) : eye(x - dx, y, e, look) + eye(x + dx, y, e, look);
  return (
    eyes +
    (cheeks ? cheek(x - dx * 1.45, y + s * 0.28, e * 0.9) + cheek(x + dx * 1.45, y + s * 0.28, e * 0.9) : '') +
    smile(x, y + s * 0.25, s * 0.2, open)
  );
}

export function cloud(x, y, s = 1, fill = '#fff') {
  const d = blob(
    [
      [-90, 20],
      [-80, -15],
      [-45, -30],
      [-20, -60],
      [25, -58],
      [50, -30],
      [85, -25],
      [100, 10],
      [70, 35],
      [0, 38],
      [-60, 38],
    ].map(([a, b]) => [x + a * s, y + b * s]),
  );
  return path(d, fill, ol(6));
}

export function sun(x, y, r, withFace = true) {
  let rays = '';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const a1 = a - 0.13;
    const a2 = a + 0.13;
    const R = r * 1.55;
    const ri = r * 1.08;
    rays += path(
      `M${n(x + Math.cos(a1) * ri)} ${n(y + Math.sin(a1) * ri)} L${n(x + Math.cos(a) * R)} ${n(y + Math.sin(a) * R)} L${n(x + Math.cos(a2) * ri)} ${n(y + Math.sin(a2) * ri)} Z`,
      '#ffa94d',
      ol(5),
    );
  }
  return rays + circle(x, y, r, '#ffd43b', ol(7)) + (withFace ? face(x, y - r * 0.05, r * 1.1, { happy: true }) : '');
}

export function star(x, y, r, fill = '#ffe066', extra = ol(5)) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.48 : r;
    d += `${i ? 'L' : 'M'}${n(x + Math.cos(a) * rr)} ${n(y + Math.sin(a) * rr)} `;
  }
  return path(d + 'Z', fill, extra + ' stroke-linejoin="round"');
}

export function flower(x, y, s, petal = '#ff8787', centre = '#ffd43b', stem = true) {
  let out = '';
  if (stem) out += path(`M${x} ${y} Q${x - 6 * s} ${y + 40 * s} ${x} ${y + 80 * s}`, 'none', ol(6 * s) .replace(`stroke="${INK}"`, 'stroke="#2b8a3e"'));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    out += circle(x + Math.cos(a) * 16 * s, y + Math.sin(a) * 16 * s, 13 * s, petal, ol(4 * s));
  }
  return out + circle(x, y, 11 * s, centre, ol(4 * s));
}

export function tree(x, y, s = 1, leaf = '#51cf66') {
  const trunk = path(`M${x - 18 * s} ${y} L${x - 12 * s} ${y - 110 * s} L${x + 12 * s} ${y - 110 * s} L${x + 18 * s} ${y} Z`, '#a0522d', ol(6));
  const top = path(
    blob(
      [
        [-80, -120],
        [-95, -180],
        [-60, -235],
        [0, -260],
        [60, -235],
        [95, -180],
        [80, -120],
        [0, -95],
      ].map(([a, b]) => [x + a * s, y + b * s]),
    ),
    leaf,
    ol(7),
  );
  const apples = [
    [-40, -170],
    [35, -200],
    [45, -140],
  ]
    .map(([a, b]) => circle(x + a * s, y + b * s, 11 * s, '#ff6b6b', ol(4)))
    .join('');
  return trunk + top + apples;
}

export function grassTufts(y, from = 0, to = W, step = 90, colour = '#2f9e44') {
  let d = '';
  for (let x = from + 20; x < to; x += step + ((x * 7) % 40)) {
    d += `M${x} ${y} l8 -22 l6 22 l8 -28 l6 28 `;
  }
  return path(d, 'none', `stroke="${colour}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"`);
}

export function bubbles(list) {
  return list
    .map(([x, y, r]) => circle(x, y, r, 'rgba(255,255,255,0.35)', 'stroke="#fff" stroke-width="4"') + circle(x - r * 0.35, y - r * 0.35, r * 0.25, '#fff'))
    .join('');
}

/** Seeded random so pictures come out the same each time */
export function rng(seed = 1) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** A rainbow arc centred at (cx, cy) with outer radius R and band width b */
export function rainbow(cx, cy, R, b, colours = ['#ff6b6b', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#b197fc']) {
  let out = '';
  colours.forEach((c, i) => {
    const r = R - i * b - b / 2;
    out += path(`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`, 'none', `stroke="${c}" stroke-width="${b}"`);
  });
  const ri = R - colours.length * b;
  out += path(`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy} M${cx - ri} ${cy} A${ri} ${ri} 0 0 1 ${cx + ri} ${cy}`, 'none', ol(6));
  return out;
}

export const bird = (x, y, s = 1) => path(`M${x - 22 * s} ${y} q11 -14 22 0 q11 -14 22 0`, 'none', ol(5));

export function butterfly(x, y, s = 1, wing = '#f783ac', spot = '#ffe066') {
  return (
    ellipse(x - 26 * s, y - 18 * s, 26 * s, 22 * s, wing, ol(5)) +
    ellipse(x + 26 * s, y - 18 * s, 26 * s, 22 * s, wing, ol(5)) +
    ellipse(x - 20 * s, y + 16 * s, 18 * s, 15 * s, wing, ol(5)) +
    ellipse(x + 20 * s, y + 16 * s, 18 * s, 15 * s, wing, ol(5)) +
    circle(x - 26 * s, y - 18 * s, 8 * s, spot) +
    circle(x + 26 * s, y - 18 * s, 8 * s, spot) +
    ellipse(x, y, 7 * s, 30 * s, INK) +
    path(`M${x - 3 * s} ${y - 28 * s} q-8 -16 -16 -18 M${x + 3 * s} ${y - 28 * s} q8 -16 16 -18`, 'none', ol(4))
  );
}

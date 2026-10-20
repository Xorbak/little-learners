import { INK, ol, svg, vgrad, rect, circle, ellipse, path, g, blob, eye, face, cheek, smile, star, rng } from '../lib.mjs';

const T = (x, y, s = 1, rot = 0) => `translate(${x} ${y}) rotate(${rot}) scale(${s})`;

function twinkle(x, y, r, c = '#fff') {
  return path(`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`, c);
}

function moon(x, y, r) {
  return (
    circle(x, y, r, '#fff3bf', ol(8)) +
    circle(x - r * 0.45, y - r * 0.4, r * 0.16, '#ffe8a3', ol(4)) +
    circle(x + r * 0.5, y + r * 0.45, r * 0.12, '#ffe8a3', ol(4)) +
    circle(x + r * 0.55, y - r * 0.35, r * 0.09, '#ffe8a3', ol(4)) +
    face(x - r * 0.05, y + r * 0.02, r * 0.95, { happy: true })
  );
}

function ringPlanet(x, y, r) {
  return (
    path(`M${x - r * 1.75} ${y + r * 0.1} A${r * 1.75} ${r * 0.45} -12 0 1 ${x + r * 1.75} ${y - r * 0.1}`, 'none', `stroke="${INK}" stroke-width="34" fill="none" transform="rotate(-12 ${x} ${y})"`) +
    path(`M${x - r * 1.75} ${y + r * 0.1} A${r * 1.75} ${r * 0.45} -12 0 1 ${x + r * 1.75} ${y - r * 0.1}`, 'none', `stroke="#b197fc" stroke-width="20" fill="none" transform="rotate(-12 ${x} ${y})"`) +
    `<clipPath id="saturn"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath>` +
    circle(x, y, r, '#ffa94d') +
    `<g clip-path="url(#saturn)">${rect(x - r, y - r * 0.55, r * 2, r * 0.28, '#ffc078')}${rect(x - r, y + r * 0.35, r * 2, r * 0.3, '#ff922b')}</g>` +
    circle(x, y, r, 'none', ol(8)) +
    face(x, y - r * 0.1, r * 0.9) +
    path(`M${x - r * 1.75} ${y + r * 0.1} A${r * 1.75} ${r * 0.45} -12 0 0 ${x + r * 1.75} ${y - r * 0.1}`, 'none', `stroke="${INK}" stroke-width="34" fill="none" stroke-linecap="round" transform="rotate(-12 ${x} ${y})"`) +
    path(`M${x - r * 1.75} ${y + r * 0.1} A${r * 1.75} ${r * 0.45} -12 0 0 ${x + r * 1.75} ${y - r * 0.1}`, 'none', `stroke="#b197fc" stroke-width="20" fill="none" stroke-linecap="round" transform="rotate(-12 ${x} ${y})"`)
  );
}

function rocket(x, y, s, rot) {
  return g(
    // flame
    path('M-45 150 Q-30 260 0 300 Q30 260 45 150 Z', '#ff922b', ol(7)) +
      path('M-25 150 Q-15 220 0 245 Q15 220 25 150 Z', '#ffe066') +
      // fins
      path('M-60 60 L-120 150 L-110 175 L-55 140 Z', '#ff6b6b', ol(7)) +
      path('M60 60 L120 150 L110 175 L55 140 Z', '#ff6b6b', ol(7)) +
      // body
      path('M0 -210 C80 -140 85 40 60 150 H-60 C-85 40 -80 -140 0 -210 Z', '#f8f9fa', ol(8)) +
      path('M0 -210 C35 -180 55 -150 62 -120 H-62 C-55 -150 -35 -180 0 -210 Z', '#ff6b6b', ol(7)) +
      rect(-60, 110, 120, 40, '#ff6b6b', ol(7)) +
      path('M-20 150 V170 H20 V150', '#adb5bd', ol(6)) +
      // window with a little bear astronaut
      circle(0, -30, 56, '#4dabf7', ol(8)) +
      circle(-26, -58, 12, '#c08552', ol(4)) +
      circle(26, -58, 12, '#c08552', ol(4)) +
      circle(0, -28, 36, '#c08552', ol(5)) +
      ellipse(0, -16, 16, 12, '#f1d3b3') +
      eye(-13, -36, 7) +
      eye(13, -36, 7) +
      circle(0, -21, 4, INK) +
      circle(-20, -45, 9, 'rgba(255,255,255,0.5)') +
      circle(0, 50, 12, '#74c0fc', ol(5)),
    T(x, y, s, rot),
  );
}

function ufo(x, y, s) {
  return g(
    path('M-85 -20 C-85 -165 85 -165 85 -20 Z', '#a5d8ff', ol(7)) +
      // alien
      ellipse(0, -62, 36, 40, '#8ce99a', ol(6)) +
      path('M-15 -98 L-25 -125 M15 -98 L25 -125', 'none', ol(5)) +
      circle(-25, -128, 8, '#ffe066', ol(4)) +
      circle(25, -128, 8, '#ffe066', ol(4)) +
      eye(0, -70, 15) +
      smile(0, -46, 11) +
      cheek(-22, -50, 7) +
      cheek(22, -50, 7) +
      path('M-62 -80 Q-50 -112 -22 -122', 'none', 'stroke="#fff" stroke-width="7" stroke-linecap="round"') +
      ellipse(0, 0, 150, 42, '#ced4da', ol(8)) +
      ellipse(0, -8, 120, 20, '#e9ecef') +
      [-95, -35, 35, 95].map((dx) => circle(dx, 12, 12, '#ffe066', ol(4))).join('') +
      path('M-60 40 L-100 150 H100 L60 40 Z', '#ffec99', 'opacity="0.45"'),
    T(x, y, s, -8),
  );
}

function earth(x, y, r) {
  return (
    `<clipPath id="earth"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath>` +
    circle(x, y, r, '#4dabf7') +
    `<g clip-path="url(#earth)">${path(blob([[x - 140, y - 90], [x - 60, y - 140], [x + 10, y - 100], [x - 20, y - 30], [x - 110, y - 10]]), '#69db7c', ol(5))}${path(
      blob([[x + 40, y + 10], [x + 150, y - 30], [x + 170, y + 60], [x + 80, y + 120], [x + 20, y + 80]]),
      '#69db7c',
      ol(5),
    )}</g>` +
    circle(x, y, r, 'none', ol(8)) +
    face(x + 10, y - 80, r * 0.55, { open: true })
  );
}

function comet(x, y) {
  return (
    path(`M${x} ${y - 26} C${x - 120} ${y - 40} ${x - 230} ${y - 70} ${x - 330} ${y - 110} C${x - 240} ${y - 40} ${x - 120} ${y + 20} ${x} ${y + 26} Z`, '#ffd43b', 'opacity="0.9"') +
    path(`M${x} ${y - 14} C${x - 90} ${y - 22} ${x - 160} ${y - 40} ${x - 230} ${y - 70} C${x - 160} ${y - 20} ${x - 90} ${y + 12} ${x} ${y + 14} Z`, '#fff9db') +
    circle(x, y, 26, '#ffe066', ol(6))
  );
}

function stripedPlanet(x, y, r, base, stripe, id) {
  return (
    `<clipPath id="${id}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath>` +
    circle(x, y, r, base) +
    `<g clip-path="url(#${id})">${path(`M${x - r} ${y - r * 0.3} Q${x} ${y - r * 0.55} ${x + r} ${y - r * 0.3} V${y - r * 0.05} Q${x} ${y - r * 0.3} ${x - r} ${y - r * 0.05} Z`, stripe)}${path(
      `M${x - r} ${y + r * 0.3} Q${x} ${y + r * 0.05} ${x + r} ${y + r * 0.3} V${y + r * 0.55} Q${x} ${y + r * 0.3} ${x - r} ${y + r * 0.55} Z`,
      stripe,
    )}</g>` +
    circle(x, y, r, 'none', ol(7))
  );
}

const rand = rng(11);
const dots = Array.from({ length: 90 }, () => circle(rand() * 1600, rand() * 900, 1.5 + rand() * 2.5, 'rgba(255,255,255,0.85)')).join('');
const twinkles = [
  [520, 90, 18],
  [960, 70, 22],
  [1520, 520, 16],
  [380, 420, 14],
  [1120, 820, 18],
  [60, 520, 16],
  [880, 840, 12],
]
  .map(([x, y, r]) => twinkle(x, y, r))
  .join('');

const defs = vgrad('night', [
  [0, '#1c1b4d'],
  [1, '#4b2c7a'],
]);

const body = [
  rect(0, 0, 1600, 900, 'url(#night)'),
  dots,
  twinkles,
  comet(1000, 150),
  moon(220, 190, 115),
  ringPlanet(1330, 250, 105),
  stripedPlanet(480, 640, 62, '#ff8fab', '#ffc9d4', 'pinkplanet'),
  stripedPlanet(1500, 700, 46, '#63e6be', '#c3fae8', 'greenplanet'),
  star(640, 300, 34),
  star(1100, 420, 28, '#ffa8c5'),
  star(90, 380, 26, '#a5d8ff'),
  earth(170, 860, 230),
  rocket(780, 470, 1.15, 22),
  ufo(1230, 640, 1.05),
].join('');

export default svg(body, defs);

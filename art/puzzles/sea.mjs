import { INK, ol, svg, vgrad, rect, circle, ellipse, path, g, blob, hill, eye, face, cheek, smile, bubbles, star, rng } from '../lib.mjs';

const T = (x, y, s = 1) => `translate(${x} ${y}) scale(${s})`;

function dolphin(x, y, s = 1) {
  const bodyD = 'M-210 -10 C-120 -75 10 -105 95 -80 C150 -62 168 -30 160 -6 C185 -8 212 -2 226 10 C218 26 190 30 158 26 C100 58 -100 62 -210 15 Z';
  return g(
    path('M-40 -72 C-30 -130 0 -140 22 -135 C5 -110 10 -90 32 -76 Z', '#5c7cfa', ol(6)) +
      path('M-205 -5 C-240 -50 -270 -62 -295 -55 C-272 -22 -262 -6 -252 0 C-262 6 -272 25 -295 55 C-268 62 -240 45 -205 10 Z', '#5c7cfa', ol(6)) +
      `<clipPath id="dolphinbody"><path d="${bodyD}"/></clipPath>` +
      path(bodyD, '#748ffc') +
      `<g clip-path="url(#dolphinbody)">${ellipse(-10, 52, 230, 42, '#dbe4ff')}</g>` +
      path(bodyD, 'none', ol(7)) +
      path('M30 32 C25 75 0 98 -25 105 C-8 75 -3 55 5 35 Z', '#5c7cfa', ol(6)) +
      eye(112, -32, 15, [0.4, 0]) +
      cheek(130, 2, 11) +
      path('M222 12 Q190 22 152 12 Q145 4 140 10', 'none', ol(5)),
    T(x, y, s),
  );
}

function clownfish(x, y, s = 1, flip = false) {
  const body = ellipse(0, 0, 78, 50, '#ff922b');
  return g(
    path('M-70 0 L-120 -42 Q-105 0 -120 42 Z', '#ff922b', ol(6)) +
      path('M-20 -46 Q10 -85 40 -44 Z', '#ff922b', ol(5)) +
      `<clipPath id="cf${x}"><ellipse cx="0" cy="0" rx="78" ry="50"/></clipPath>` +
      body +
      `<g clip-path="url(#cf${x})">${rect(18, -60, 22, 120, '#fff', ol(5))}${rect(-40, -60, 22, 120, '#fff', ol(5))}</g>` +
      ellipse(0, 0, 78, 50, 'none', ol(7)) +
      path('M-5 20 Q-10 45 -30 42 Q-25 25 -15 18 Z', '#ff922b', ol(5)) +
      eye(48, -10, 13, [0.4, 0]) +
      smile(60, 16, 9) +
      cheek(40, 18, 8),
    `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`,
  );
}

function smallFish(x, y, s, colour) {
  return g(
    path('M-30 0 L-55 -20 L-55 20 Z', colour, ol(5)) + ellipse(0, 0, 38, 24, colour, ol(6)) + eye(16, -4, 7, [0.5, 0]),
    T(x, y, s),
  );
}

function octopus(x, y, s = 1) {
  const purple = '#b197fc';
  const legs = [
    'M-60 20 C-110 60 -70 110 -120 130 C-140 135 -150 115 -135 110',
    'M-30 30 C-50 90 -20 120 -50 150 C-62 160 -78 150 -70 140',
    'M0 35 C5 90 -10 120 10 155 C18 168 36 160 30 148',
    'M30 30 C55 85 30 115 65 145 C76 152 90 140 80 132',
    'M60 20 C110 55 80 100 125 125 C140 130 152 112 138 106',
  ];
  const legsOut = legs.map((d) => path(d, 'none', `stroke="${INK}" stroke-width="38" stroke-linecap="round" fill="none"`)).join('');
  const legsIn = legs.map((d) => path(d, 'none', `stroke="${purple}" stroke-width="25" stroke-linecap="round" fill="none"`)).join('');
  return g(
    legsOut +
      legsIn +
      path('M-95 30 C-110 -60 -60 -120 0 -120 C60 -120 110 -60 95 30 C60 50 -60 50 -95 30 Z', purple, ol(7)) +
      circle(-40, -70, 12, '#d0bfff') +
      circle(45, -85, 8, '#d0bfff') +
      face(0, -20, 95, { open: true }),
    T(x, y, s),
  );
}

function turtle(x, y, s = 1) {
  const green = '#8ce99a';
  return g(
    ellipse(-95, 30, 35, 18, green, ol(6) + ' transform="rotate(30 -95 30)"') +
      ellipse(70, 45, 38, 18, green, ol(6) + ' transform="rotate(-30 70 45)"') +
      ellipse(-75, -45, 40, 18, green, ol(6) + ' transform="rotate(-35 -75 -45)"') +
      ellipse(70, -50, 45, 20, green, ol(6) + ' transform="rotate(35 70 -50)"') +
      circle(130, -5, 42, green, ol(7)) +
      eye(142, -15, 11, [0.5, 0]) +
      smile(148, 12, 10) +
      cheek(128, 12, 8) +
      ellipse(0, 0, 110, 72, '#2f9e44', ol(7)) +
      path('M-40 -30 L0 -50 L40 -30 L40 10 L0 30 L-40 10 Z', '#69db7c', ol(5)) +
      path('M-40 -30 L-80 -20 M40 -30 L80 -20 M-40 10 L-75 30 M40 10 L75 30 M0 30 L0 70 M0 -50 L0 -72', 'none', ol(5)),
    T(x, y, s),
  );
}

function crab(x, y, s = 1) {
  const red = '#ff6b6b';
  return g(
    path('M-60 10 l-40 30 M-55 25 l-35 35 M60 10 l40 30 M55 25 l35 35', 'none', ol(8)) +
      path('M-70 -10 C-100 -30 -110 -60 -100 -80', 'none', ol(8)) +
      path('M70 -10 C100 -30 110 -60 100 -80', 'none', ol(8)) +
      path('M-100 -80 C-140 -90 -140 -130 -105 -135 L-95 -105 L-75 -125 C-60 -100 -75 -80 -100 -80 Z', red, ol(6)) +
      path('M100 -80 C140 -90 140 -130 105 -135 L95 -105 L75 -125 C60 -100 75 -80 100 -80 Z', red, ol(6)) +
      path('M-25 -40 V-75 M25 -40 V-75', 'none', ol(6)) +
      ellipse(0, 0, 80, 48, red, ol(7)) +
      eye(-25, -80, 14) +
      eye(25, -80, 14) +
      smile(0, 10, 20, true) +
      cheek(-45, 5, 10) +
      cheek(45, 5, 10),
    T(x, y, s),
  );
}

function chest(x, y) {
  return (
    path(`M${x - 90} ${y - 70} Q${x} ${y - 140} ${x + 90} ${y - 70} L${x + 80} ${y - 50} H${x - 80} Z`, '#c0803a', ol(6) + ` transform="rotate(-18 ${x - 90} ${y - 70})"`) +
    circle(x - 40, y - 62, 18, '#ffd43b', ol(4)) +
    circle(x - 5, y - 72, 18, '#ffd43b', ol(4)) +
    circle(x + 30, y - 62, 18, '#ffd43b', ol(4)) +
    circle(x + 55, y - 75, 14, '#ff8787', ol(4)) +
    rect(x - 90, y - 60, 180, 100, '#c0803a', ol(7) + ' rx="10"') +
    rect(x - 90, y - 60, 180, 22, '#e8a85f', ol(6)) +
    rect(x - 16, y - 40, 32, 36, '#ffd43b', ol(5) + ' rx="5"')
  );
}

function seaweed(x, y, h, colour = '#40c057') {
  const d = `M${x} ${y} C${x - 30} ${y - h * 0.25} ${x + 30} ${y - h * 0.5} ${x} ${y - h * 0.75} C${x - 25} ${y - h * 0.9} ${x + 10} ${y - h} ${x + 5} ${y - h}`;
  return path(d, 'none', `stroke="${INK}" stroke-width="34" stroke-linecap="round" fill="none"`) + path(d, 'none', `stroke="${colour}" stroke-width="22" stroke-linecap="round" fill="none"`);
}

function coral(x, y, s, colour) {
  const arms = ['M0 0 V-120', 'M0 -40 C-40 -60 -50 -90 -55 -130', 'M0 -60 C40 -80 50 -110 55 -150', 'M-30 -75 C-70 -90 -80 -100 -90 -110', 'M35 -95 C60 -110 85 -110 95 -100'];
  const all = arms.join(' ');
  return g(
    path(all, 'none', `stroke="${INK}" stroke-width="38" stroke-linecap="round" stroke-linejoin="round" fill="none"`) +
      path(all, 'none', `stroke="${colour}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" fill="none"`),
    T(x, y, s),
  );
}

const rand = rng(7);
const rays = [100, 420, 780, 1150, 1450]
  .map((x) => path(`M${x} -10 L${x + 90} -10 L${x + 260} 900 L${x + 120} 900 Z`, 'rgba(255,255,255,0.12)'))
  .join('');

const defs = vgrad('water', [
  [0, '#66d9e8'],
  [0.5, '#339af0'],
  [1, '#1c5fa8'],
]);

const body = [
  rect(0, 0, 1600, 900, 'url(#water)'),
  rays,
  bubbles([
    [740, 120, 20],
    [770, 70, 12],
    [1200, 420, 16],
    [1230, 380, 10],
    [430, 650, 14],
    [1520, 120, 18],
    [1480, 80, 11],
    [260, 110, 15],
    [1000, 520, 12],
  ]),
  dolphin(470, 300, 1.15),
  [
    [1320, 150, 0.9, '#ffe066'],
    [1440, 210, 0.8, '#ffe066'],
    [1330, 260, 0.75, '#ffe066'],
  ]
    .map(([x, y, s, c]) => smallFish(x, y, s, c))
    .join(''),
  clownfish(1060, 330, 1.1),
  turtle(260, 560, 0.9),
  hill([[-20, 760], [300, 730], [700, 770], [1100, 735], [1620, 770]], '#ffe8a3'),
  seaweed(60, 800, 330),
  seaweed(130, 820, 220, '#69db7c'),
  seaweed(1480, 790, 300),
  seaweed(1550, 820, 200, '#69db7c'),
  coral(380, 800, 1.1, '#ff8fab'),
  coral(1250, 790, 1, '#ffa94d'),
  chest(700, 820),
  octopus(990, 650, 1),
  star(220, 845, 42, '#ff922b', ol(6)),
  star(560, 860, 36, '#f783ac', ol(6)),
  crab(1400, 855, 0.6),
  ...Array.from({ length: 14 }, () => circle(rand() * 1600, 800 + rand() * 90, 4 + rand() * 4, '#e0b973')),
].join('');

export default svg(body, defs);

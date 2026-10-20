import { INK, ol, svg, vgrad, rect, circle, ellipse, path, g, blob, hill, eye, face, cheek, smile, cloud, flower, grassTufts } from '../lib.mjs';

const T = (x, y, s = 1, flip = false) => `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`;

function longNeck(x, y, s = 1) {
  const green = '#69db7c';
  const legs = [-90, -40, 60, 110].map((dx) => rect(dx - 24, 20, 48, 120, dx === -40 || dx === 110 ? '#51cf66' : green, ol(7) + ' rx="16"')).join('');
  const neck = path('M70 -40 C110 -120 120 -230 150 -300 L215 -285 C185 -220 180 -110 140 -10 Z', green, ol(7));
  const head = ellipse(190, -310, 70, 45, green, ol(7)) + eye(195, -322, 15, [0.5, 0]) + smile(225, -295, 18) + cheek(220, -300, 10) + circle(248, -318, 4, INK);
  const tail = path('M-140 -10 C-230 0 -300 40 -360 30 C-300 70 -210 60 -130 40 Z', green, ol(7));
  const bodyE = ellipse(0, 0, 160, 95, green, ol(8));
  const spots = circle(-50, -40, 20, '#b2f2bb') + circle(20, -55, 15, '#b2f2bb') + circle(70, -20, 18, '#b2f2bb') + circle(-90, 10, 13, '#b2f2bb');
  return g(legs + tail + neck + bodyE + spots + head, T(x, y, s));
}

function trex(x, y, s = 1) {
  const orange = '#ffa94d';
  return g(
    // tail and legs
    path('M-40 20 C-120 30 -200 0 -250 -40 C-190 60 -110 80 -30 70 Z', orange, ol(7)) +
      rect(-50, 40, 50, 110, '#ff922b', ol(7) + ' rx="18"') +
      rect(15, 40, 50, 110, orange, ol(7) + ' rx="18"') +
      path('M-50 150 h50 M15 150 h50', 'none', ol(7)) +
      // body
      ellipse(0, 0, 100, 95, orange, ol(8)) +
      ellipse(15, 25, 60, 55, '#ffe8cc') +
      // spikes on the back
      path('M-80 -60 l-10 -35 l35 15 Z M-45 -88 l0 -38 l30 25 Z', '#ff6b6b', ol(5)) +
      // head
      path('M10 -90 C10 -180 90 -200 160 -170 C200 -150 200 -90 170 -75 C120 -60 40 -55 10 -90 Z', orange, ol(8)) +
      path('M170 -75 C140 -70 120 -80 90 -82', 'none', ol(6)) +
      path('M110 -82 l8 14 l8 -14 M140 -78 l8 14 l8 -14', '#fff', ol(4)) +
      eye(95, -145, 18, [0.4, 0]) +
      cheek(130, -110, 12) +
      circle(178, -150, 5, INK) +
      // tiny arms
      path('M70 -10 q35 5 40 25 M60 15 q30 10 30 30', 'none', ol(14)) +
      path('M70 -10 q35 5 40 25 M60 15 q30 10 30 30', 'none', `stroke="${orange}" stroke-width="6" stroke-linecap="round"`),
    T(x, y, s),
  );
}

function egg(x, y, s = 1) {
  return g(
    ellipse(0, 0, 70, 85, '#fff9db', ol(7)) +
      circle(-25, -30, 10, '#a5d8ff') +
      circle(30, 10, 12, '#a5d8ff') +
      circle(-15, 40, 8, '#a5d8ff'),
    T(x, y, s),
  );
}

function babyDino(x, y, s = 1) {
  const blue = '#74c0fc';
  return g(
    ellipse(0, -50, 55, 50, blue, ol(7)) +
      face(0, -55, 70, { open: true }) +
      // bottom half of the shell
      path('M-75 -20 L-50 -40 L-25 -15 L0 -40 L25 -15 L50 -40 L75 -20 C80 40 50 80 0 80 C-50 80 -80 40 -75 -20 Z', '#fff9db', ol(7)) +
      circle(25, 30, 11, '#a5d8ff') +
      circle(-30, 20, 8, '#a5d8ff') +
      // shell top as a hat
      path('M-40 -95 C-30 -140 30 -140 40 -95 L20 -110 L0 -92 L-20 -110 Z', '#fff9db', ol(6)),
    T(x, y, s),
  );
}

function ptero(x, y, s = 1) {
  const purple = '#b197fc';
  return g(
    path('M0 0 C-60 -70 -140 -60 -200 -20 C-140 -20 -80 0 -20 25 Z', purple, ol(6)) +
      path('M0 0 C60 -70 140 -60 200 -20 C140 -20 80 0 20 25 Z', purple, ol(6)) +
      ellipse(0, 10, 28, 40, purple, ol(6)) +
      path('M-10 -40 C-30 -70 -70 -70 -60 -40 C-40 -50 -25 -45 -15 -30 Z', purple, ol(5)) +
      circle(0, -30, 28, purple, ol(6)) +
      path('M20 -30 L75 -18 L18 -14 Z', '#ffd43b', ol(5)) +
      eye(5, -36, 9, [0.5, 0]),
    T(x, y, s),
  );
}

function palm(x, y, s = 1) {
  const trunk = path(`M${x - 18 * s} ${y} C${x - 10 * s} ${y - 120 * s} ${x + 20 * s} ${y - 220 * s} ${x + 40 * s} ${y - 300 * s} L${x + 62 * s} ${y - 295 * s} C${x + 45 * s} ${y - 210 * s} ${x + 18 * s} ${y - 120 * s} ${x + 18 * s} ${y} Z`, '#c0803a', ol(7));
  const tx = x + 50 * s;
  const ty = y - 300 * s;
  const leaves = [
    [-170, 40],
    [-150, -40],
    [-60, -90],
    [60, -90],
    [150, -40],
    [170, 40],
  ]
    .map(([dx, dy]) => path(`M${tx} ${ty} Q${tx + dx * 0.5 * s} ${ty + (dy - 60) * s} ${tx + dx * s} ${ty + dy * s} Q${tx + dx * 0.55 * s} ${ty + (dy - 10) * s} ${tx} ${ty} Z`, '#40c057', ol(6)))
    .join('');
  const nuts = circle(tx - 15 * s, ty + 15 * s, 14 * s, '#8d5524', ol(4)) + circle(tx + 15 * s, ty + 18 * s, 14 * s, '#8d5524', ol(4));
  return trunk + leaves + nuts;
}

function volcano(x, y) {
  return (
    cloud(x - 30, y - 330, 0.9, '#dee2e6') +
    cloud(x + 60, y - 400, 0.7, '#e9ecef') +
    path(`M${x - 330} ${y} L${x - 70} ${y - 250} H${x + 70} L${x + 330} ${y} Z`, '#a5734f', ol(8)) +
    path(`M${x - 70} ${y - 250} H${x + 70} L${x + 95} ${y - 225} C${x + 60} ${y - 200} ${x + 70} ${y - 150} ${x + 40} ${y - 140} C${x + 20} ${y - 180} ${x} ${y - 200} ${x - 20} ${y - 170} C${x - 40} ${y - 130} ${x - 70} ${y - 180} ${x - 95} ${y - 225} Z`, '#ff6b6b', ol(7)) +
    path(`M${x - 55} ${y - 250} Q${x} ${y - 275} ${x + 55} ${y - 250}`, '#ffd43b', ol(5))
  );
}

function fern(x, y, s = 1) {
  return [-50, -20, 15, 45]
    .map((a) => {
      const r = (a * Math.PI) / 180;
      const ex = x + Math.sin(r) * 120 * s;
      const ey = y - Math.cos(r) * 120 * s;
      return path(`M${x} ${y} Q${(x + ex) / 2 - 20 * s} ${(y + ey) / 2} ${ex} ${ey} Q${(x + ex) / 2 + 20 * s} ${(y + ey) / 2} ${x} ${y} Z`, '#2f9e44', ol(5));
    })
    .join('');
}

const defs = vgrad('dinosky', [
  [0, '#a5d8ff'],
  [0.7, '#fff3bf'],
]);

const body = [
  rect(0, 0, 1600, 900, 'url(#dinosky)'),
  circle(1450, 120, 60, '#ffe066', ol(7)),
  cloud(250, 120, 1),
  cloud(850, 90, 0.75),
  hill([[-20, 520], [300, 470], [600, 510]], '#b2f2bb'),
  volcano(1150, 560),
  hill([[-20, 560], [350, 520], [800, 560], [1250, 540], [1620, 570]], '#8ce99a'),
  ptero(640, 230, 0.9),
  ptero(1000, 330, 0.55),
  palm(1490, 760, 1.2),
  hill([[-20, 680], [500, 650], [1000, 690], [1620, 660]], '#69db7c'),
  ellipse(1180, 820, 200, 55, '#74c0fc', ol(7)),
  path('M1060 815 q20 -10 40 0 M1240 830 q20 -10 40 0', 'none', 'stroke="#fff" stroke-width="5" stroke-linecap="round"'),
  palm(90, 700, 1),
  longNeck(450, 650, 1),
  trex(1030, 650, 0.95),
  egg(780, 820, 0.8),
  egg(860, 840, 0.6),
  babyDino(690, 800, 0.85),
  fern(1400, 900, 1),
  fern(250, 900, 0.9),
  grassTufts(895, 0, 1600, 120),
  flower(560, 840, 0.9, '#ffa8c5'),
  flower(1560, 840, 0.9, '#b197fc'),
].join('');

export default svg(body, defs);

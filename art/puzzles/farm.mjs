import { rainbow, bird, butterfly, INK, ol, svg, vgrad, rect, circle, ellipse, path, g, blob, hill, eye, face, cheek, smile, cloud, sun, flower, tree, grassTufts } from '../lib.mjs';

function cow(x, y) {
  // (x, y) = middle of the body
  const legs = [-110, -60, 50, 100]
    .map((dx) => rect(x + dx - 16, y + 30, 32, 95, '#fff', ol(6) + ' rx="10"') + rect(x + dx - 16, y + 105, 32, 22, INK, 'rx="6"'))
    .join('');
  const tail = path(`M${x + 145} ${y - 30} Q${x + 190} ${y + 10} ${x + 175} ${y + 70}`, 'none', ol(7)) + path(blob([[x + 165, y + 62], [x + 188, y + 60], [x + 192, y + 92], [x + 170, y + 95]]), INK);
  const body = ellipse(x, y, 155, 88, '#fff', ol(7));
  const spots =
    `<clipPath id="cowbody"><ellipse cx="${x}" cy="${y}" rx="152" ry="85"/></clipPath>` +
    g(
      path(blob([[x - 60, y - 90], [x + 10, y - 70], [x + 20, y - 20], [x - 40, y - 5], [x - 80, y - 40]]), INK) +
        path(blob([[x + 70, y - 10], [x + 130, y - 30], [x + 160, y + 30], [x + 110, y + 60], [x + 70, y + 35]]), INK) +
        path(blob([[x - 140, y + 20], [x - 90, y + 30], [x - 100, y + 90], [x - 150, y + 80]]), INK),
      '',
    ).replace('<g>', '<g clip-path="url(#cowbody)">');
  const udder = ellipse(x + 55, y + 82, 32, 18, '#ffc9de', ol(5));
  const hx = x - 175;
  const hy = y - 55;
  const head =
    path(`M${hx - 45} ${hy - 55} q-20 -30 -5 -45 q10 25 25 30Z`, '#ffe8a3', ol(5)) +
    path(`M${hx + 45} ${hy - 55} q20 -30 5 -45 q-10 25 -25 30Z`, '#ffe8a3', ol(5)) +
    ellipse(hx - 78, hy - 25, 34, 18, '#fff', ol(6) + ` transform="rotate(-20 ${hx - 78} ${hy - 25})"`) +
    ellipse(hx + 78, hy - 25, 34, 18, '#fff', ol(6) + ` transform="rotate(20 ${hx + 78} ${hy - 25})"`) +
    ellipse(hx, hy, 78, 70, '#fff', ol(7)) +
    path(blob([[hx + 15, hy - 65], [hx + 60, hy - 50], [hx + 60, hy - 5], [hx + 25, hy - 15]]), INK) +
    ellipse(hx, hy + 45, 64, 38, '#ffc9de', ol(6)) +
    ellipse(hx - 20, hy + 42, 7, 10, INK) +
    ellipse(hx + 20, hy + 42, 7, 10, INK) +
    smile(hx, hy + 60, 18) +
    eye(hx - 28, hy - 15, 16, [0.3, 0.2]) +
    eye(hx + 28, hy - 15, 16, [0.3, 0.2]) +
    cheek(hx - 55, hy + 12, 12) +
    cheek(hx + 55, hy + 12, 12);
  return legs + tail + body + spots + udder + head;
}

function pig(x, y) {
  const pink = '#ffa8c5';
  const legs = [-70, -30, 35, 70].map((dx) => rect(x + dx - 14, y + 30, 28, 55, pink, ol(6) + ' rx="10"')).join('');
  const tail = path(`M${x - 110} ${y - 10} c-30 -10 -35 -40 -15 -42 c20 -2 15 30 -12 30`, 'none', ol(6));
  const body = ellipse(x, y, 115, 75, pink, ol(7));
  const hx = x + 105;
  const hy = y - 25;
  const head =
    path(`M${hx - 50} ${hy - 35} l-10 -55 l45 30 Z`, pink, ol(6)) +
    path(`M${hx + 40} ${hy - 40} l20 -50 l25 50 Z`, pink, ol(6)) +
    circle(hx, hy, 62, pink, ol(7)) +
    ellipse(hx + 12, hy + 20, 30, 22, '#ff8fb1', ol(6)) +
    ellipse(hx + 2, hy + 20, 5, 8, INK) +
    ellipse(hx + 22, hy + 20, 5, 8, INK) +
    eye(hx - 20, hy - 18, 13) +
    eye(hx + 30, hy - 20, 13) +
    cheek(hx - 38, hy + 18, 10) +
    smile(hx + 10, hy + 46, 12);
  return legs + tail + body + head;
}

function chick(x, y, s = 1) {
  return (
    path(`M${x - 12 * s} ${y + 40 * s} v18 M${x + 12 * s} ${y + 40 * s} v18`, 'none', ol(5).replace(`stroke="${INK}"`, 'stroke="#f08c00"')) +
    circle(x, y, 45 * s, '#ffe066', ol(6)) +
    path(`M${x - 5 * s} ${y - 45 * s} q-5 -25 10 -22 q-8 10 0 22`, '#ffe066', ol(4)) +
    path(`M${x + 35 * s} ${y - 2 * s} l28 8 l-28 10 Z`, '#ff922b', ol(4)) +
    path(`M${x - 25 * s} ${y + 5 * s} q-25 0 -18 25 q15 0 28 -10`, '#fcc419', ol(5)) +
    eye(x + 14 * s, y - 12 * s, 9 * s, [0.5, 0]) +
    cheek(x + 22 * s, y + 10 * s, 7 * s)
  );
}

function duck(x, y) {
  return (
    ellipse(x, y, 55, 32, '#fff3bf', ol(6)) +
    circle(x + 40, y - 40, 30, '#fff3bf', ol(6)) +
    path(`M${x + 66} ${y - 42} q28 2 30 12 q-18 8 -32 2 Z`, '#ff922b', ol(5)) +
    path(`M${x - 25} ${y - 5} q20 -20 40 0`, 'none', ol(5)) +
    eye(x + 48, y - 50, 8, [0.5, 0])
  );
}

function barn(x, y) {
  // x, y = bottom-left corner
  const red = '#fa5252';
  const w = 300;
  return (
    path(`M${x} ${y} V${y - 210} L${x + w / 2} ${y - 310} L${x + w} ${y - 210} V${y} Z`, red, ol(8)) +
    path(`M${x - 20} ${y - 205} L${x + w / 2} ${y - 330} L${x + w + 20} ${y - 205}`, 'none', `stroke="#862e2e" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"`) +
    path(`M${x - 20} ${y - 205} L${x + w / 2} ${y - 330} L${x + w + 20} ${y - 205}`, 'none', ol(5)) +
    rect(x + 95, y - 135, 110, 135, '#fff', ol(7)) +
    path(`M${x + 95} ${y - 135} L${x + 205} ${y} M${x + 205} ${y - 135} L${x + 95} ${y}`, 'none', ol(6)) +
    rect(x + 102, y - 128, 96, 121, 'none', 'stroke="#fff" stroke-width="0"') +
    circle(x + w / 2, y - 220, 32, '#ffe066', ol(6)) +
    path(`M${x + w / 2} ${y - 252} V${y - 188} M${x + w / 2 - 32} ${y - 220} H${x + w / 2 + 32}`, 'none', ol(5)) +
    rect(x + 22, y - 180, 50, 50, '#ffe066', ol(6)) +
    rect(x + w - 72, y - 180, 50, 50, '#ffe066', ol(6))
  );
}

function fence(x1, x2, y) {
  let out = path(`M${x1} ${y - 50} H${x2} M${x1} ${y - 15} H${x2}`, 'none', `stroke="${INK}" stroke-width="22" stroke-linecap="round"`);
  out += path(`M${x1} ${y - 50} H${x2} M${x1} ${y - 15} H${x2}`, 'none', `stroke="#fff4e6" stroke-width="10" stroke-linecap="round"`);
  for (let x = x1; x <= x2; x += 70) out += path(`M${x - 13} ${y + 10} V${y - 70} l13 -16 l13 16 V${y + 10} Z`, '#fff4e6', ol(6));
  return out;
}

const defs = vgrad('sky', [
  [0, '#74c0fc'],
  [0.7, '#d0ebff'],
]);

const body = [
  rect(0, 0, 1600, 900, 'url(#sky)'),
  rainbow(620, 470, 330, 26),
  sun(1460, 130, 62),
  bird(980, 260, 1.2),
  bird(1050, 230, 0.9),
  bird(420, 260, 1),
  cloud(260, 120, 1.1),
  cloud(760, 80, 0.8),
  cloud(1130, 150, 1),
  hill([[-20, 470], [280, 390], [620, 450], [960, 370], [1300, 440], [1620, 380]], '#8ce99a'),
  tree(1500, 560, 0.85, '#40c057'),
  hill([[-20, 590], [420, 540], [820, 590], [1220, 550], [1620, 580]], '#69db7c'),
  barn(1040, 640),
  path('M1150 640 C1150 720 1000 760 980 910 L1180 910 C1180 800 1260 720 1250 640 Z', '#e8c39e', ol(6)),
  tree(120, 620, 1.15),
  fence(250, 880, 640),
  cow(560, 640),
  ellipse(1360, 800, 180, 60, '#74c0fc', ol(7)),
  path('M1240 800 q20 -10 40 0 M1420 815 q20 -10 40 0', 'none', 'stroke="#fff" stroke-width="5" stroke-linecap="round"'),
  duck(1390, 785),
  pig(820, 790),
  chick(220, 800, 1),
  chick(330, 830, 0.7),
  butterfly(950, 560, 1.1),
  butterfly(80, 260, 0.8, '#74c0fc', '#fff'),
  grassTufts(895, 0, 1600, 110),
  flower(60, 760, 1.2, '#ff8787'),
  flower(460, 840, 1, '#b197fc'),
  flower(1560, 700, 1.1, '#ffa8c5'),
  flower(1110, 850, 0.9, '#74c0fc'),
].join('');

export default svg(body, defs);

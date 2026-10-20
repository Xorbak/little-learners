import { page, sky, ground, eye, smile, L, circle, ellipse, path } from './_page.mjs';
const flowerHead = (c, x, y, colour) =>
  [0, 1, 2, 3, 4].map((i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    return circle(x + Math.cos(a) * 46, y + Math.sin(a) * 46, 40, c(colour), L(8));
  }).join('') + circle(x, y, 32, c('#ffd43b'), L(8));
export default (c) =>
  page(
    [
      sky(c),
      ground(c, 1000),
      path('M240 1220 V1010 M1360 1220 V1030', 'none', L(10)),
      flowerHead(c, 240, 980, '#ff8787'),
      flowerHead(c, 1360, 1000, '#4dabf7'),
      // wings
      path('M790 520 C640 230 330 160 290 330 C250 500 450 610 780 600 Z', c('#f783ac'), L(11)),
      path('M810 520 C960 230 1270 160 1310 330 C1350 500 1150 610 820 600 Z', c('#f783ac'), L(11)),
      path('M780 610 C560 610 400 700 430 830 C460 940 640 900 790 680 Z', c('#b197fc'), L(11)),
      path('M820 610 C1040 610 1200 700 1170 830 C1140 940 960 900 810 680 Z', c('#b197fc'), L(11)),
      circle(500, 380, 70, c('#ffe066'), L(9)),
      circle(1100, 380, 70, c('#ffe066'), L(9)),
      circle(560, 790, 50, c('#ffe066'), L(9)),
      circle(1040, 790, 50, c('#ffe066'), L(9)),
      // body and head
      ellipse(800, 650, 48, 210, c('#a9744f'), L(10)),
      circle(800, 400, 85, c('#a9744f'), L(10)),
      path('M770 330 C740 250 690 220 650 230 M830 330 C860 250 910 220 950 230', 'none', L(9)),
      circle(645, 230, 20, c('#a9744f'), L(7)),
      circle(955, 230, 20, c('#a9744f'), L(7)),
      eye(765, 395, 25),
      eye(835, 395, 25),
      smile(800, 435, 26),
    ].join(''),
  );

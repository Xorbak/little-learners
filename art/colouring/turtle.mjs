import { page, sky, cloud, sunSimple, eye, smile, L, circle, path, ellipse } from './_page.mjs';
export default (c) =>
  page(
    [
      sky(c),
      sunSimple(c, 1380, 200, 95),
      cloud(c, 300, 180, 1),
      path('M-20 940 C400 900 900 980 1620 920 L1620 1220 L-20 1220 Z', c('#ffe066'), L()),
      // legs and head
      ellipse(480, 930, 80, 55, c('#69db7c'), L(10)),
      ellipse(1020, 930, 80, 55, c('#69db7c'), L(10)),
      path('M300 780 C240 790 220 830 250 850 C280 860 320 830 330 800 Z', c('#69db7c'), L(9)),
      circle(1210, 650, 140, c('#69db7c'), L(11)),
      eye(1180, 620, 36, [0.4, 0]),
      eye(1280, 620, 36, [0.4, 0]),
      smile(1250, 720, 40),
      // shell
      path('M300 840 C300 520 520 380 760 380 C1000 380 1180 520 1180 840 Z', c('#37b24d'), L(12)),
      path('M650 560 L760 500 L870 560 L870 690 L760 750 L650 690 Z', c('#ffa94d'), L(10)),
      path('M650 560 L520 520 M870 560 L1000 520 M650 690 L500 740 M870 690 L1020 740 M760 500 V390 M760 750 V840', 'none', L(10)),
      path('M270 840 H1210', 'none', L(14)),
    ].join(''),
  );

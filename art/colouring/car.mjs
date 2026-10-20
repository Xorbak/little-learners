import { page, sky, cloud, sunSimple, eye, smile, L, circle, path, rect } from './_page.mjs';
export default (c) =>
  page(
    [
      sky(c),
      sunSimple(c, 260, 220, 100),
      cloud(c, 1250, 200, 1),
      rect(-20, 960, 1640, 260, c('#adb5bd'), L(10)),
      path('M100 1080 H300 M500 1080 H700 M900 1080 H1100 M1300 1080 H1500', 'none', L(14)),
      // body
      path('M230 900 C230 760 280 700 400 690 L520 690 L640 470 C660 440 690 430 720 430 L1060 430 C1100 430 1120 450 1140 480 L1260 690 L1300 690 C1400 700 1430 760 1430 900 Z', c('#ff6b6b'), L(12)),
      // windows
      path('M690 670 L760 500 L900 500 L900 670 Z', c('#74c0fc'), L(10)),
      path('M960 670 L960 500 L1080 500 L1170 670 Z', c('#74c0fc'), L(10)),
      eye(830, 590, 40, [0.4, 0]),
      eye(1050, 590, 40, [0.4, 0]),
      smile(1300, 800, 40),
      circle(1380, 760, 26, c('#ffe066'), L(8)),
      // wheels
      circle(490, 900, 120, c('#495057'), L(12)),
      circle(490, 900, 50, c('#dee2e6'), L(9)),
      circle(1150, 900, 120, c('#495057'), L(12)),
      circle(1150, 900, 50, c('#dee2e6'), L(9)),
    ].join(''),
  );

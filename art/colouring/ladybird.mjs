import { page, sky, ground, cloud, sunSimple, eye, smile, L, INK, circle, ellipse, path } from './_page.mjs';

export default (c) =>
  page(
    [
      sky(c),
      cloud(c, 300, 180, 1.1),
      sunSimple(c, 1340, 210, 110),
      ground(c, 1000),
      // the leaf
      path('M220 1010 C260 640 700 420 1180 470 C1320 700 1150 1030 700 1080 C520 1100 330 1080 220 1010 Z', c('#69db7c'), L()),
      path('M300 990 C560 820 850 640 1120 520', 'none', L(8)),
      // legs
      path('M620 860 l-60 70 M650 900 l-30 90 M960 860 l60 70 M930 900 l30 90', 'none', L(10)),
      // body
      ellipse(790, 760, 270, 220, c('#ff6b6b'), L(10)),
      path('M790 545 V980', 'none', L(9)),
      // spots
      circle(660, 700, 52, c(INK), L()),
      circle(925, 700, 52, c(INK), L()),
      circle(680, 860, 45, c(INK), L()),
      circle(905, 860, 45, c(INK), L()),
      // head
      path('M640 600 C650 430 930 430 940 600 Z', c('#495057'), L(10)),
      path('M720 470 C690 380 640 360 610 370 M860 470 C890 380 940 360 970 370', 'none', L(9)),
      circle(605, 372, 22, c('#ff6b6b'), L(7)),
      circle(975, 372, 22, c('#ff6b6b'), L(7)),
      eye(740, 535, 34, [0.2, 0.2]),
      eye(840, 535, 34, [0.2, 0.2]),
      smile(790, 575, 30),
    ].join(''),
  );

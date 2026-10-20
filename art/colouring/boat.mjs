import { page, sky, cloud, sunSimple, eye, smile, L, path, rect } from './_page.mjs';
export default (c) =>
  page(
    [
      sky(c),
      sunSimple(c, 1360, 210, 100),
      cloud(c, 300, 190, 1),
      // mast and sails
      rect(780, 210, 36, 620, c('#a9744f'), L(9)),
      path('M820 230 L820 760 L1200 760 Z', c('#ffe066'), L(10)),
      path('M775 300 L775 760 L470 760 Z', c('#ff6b6b'), L(10)),
      path('M816 210 L960 250 L816 290 Z', c('#4dabf7'), L(8)),
      // hull
      path('M330 800 L1270 800 C1240 920 1150 980 1030 990 L560 990 C440 980 360 920 330 800 Z', c('#a9744f'), L(12)),
      eye(660, 880, 36),
      eye(900, 880, 36),
      smile(780, 935, 40),
      // sea
      path('M-20 960 C100 920 200 920 300 960 C400 1000 500 1000 600 960 C700 920 800 920 900 960 C1000 1000 1100 1000 1200 960 C1300 920 1400 920 1500 960 C1560 980 1600 980 1620 970 L1620 1220 L-20 1220 Z', c('#4dabf7'), L(10)),
    ].join(''),
  );

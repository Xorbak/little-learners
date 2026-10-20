import { page, sky, ground, cloud, eye, smile, L, circle, path } from './_page.mjs';
const petal = (c, a, colour) => {
  const x = 800 + Math.cos(a) * 170;
  const y = 420 + Math.sin(a) * 170;
  const deg = (a * 180) / Math.PI + 90;
  return `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="105" ry="140" fill="${c(colour)}" ${L(10)} transform="rotate(${deg.toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
};
export default (c) =>
  page(
    [
      sky(c),
      cloud(c, 260, 170, 0.9),
      cloud(c, 1360, 220, 0.8),
      ground(c, 1020),
      path('M780 560 C760 760 820 900 790 1080 L830 1080 C860 900 800 760 820 560 Z', c('#37b24d'), L(9)),
      path('M800 860 C700 760 560 760 500 820 C580 900 700 910 800 880 Z', c('#69db7c'), L(9)),
      path('M810 780 C900 680 1040 680 1100 740 C1020 820 900 830 810 800 Z', c('#69db7c'), L(9)),
      ...[0, 1, 2, 3, 4, 5].map((i) => petal(c, (i / 6) * Math.PI * 2 - Math.PI / 2, i % 2 ? '#da77f2' : '#f783ac')),
      circle(800, 420, 140, c('#ffd43b'), L(10)),
      eye(750, 400, 30),
      eye(850, 400, 30),
      smile(800, 460, 40),
      path('M600 1060 L1000 1060 L960 1190 L640 1190 Z', c('#ff922b'), L(10)),
      path('M570 1000 H1030 V1070 H570 Z', c('#ff922b'), L(10)),
    ].join(''),
  );

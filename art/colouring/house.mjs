import { page, sky, ground, cloud, sunSimple, eye, smile, L, rect, path, circle } from './_page.mjs';
export default (c) =>
  page(
    [
      sky(c),
      sunSimple(c, 1360, 200, 100),
      cloud(c, 300, 170, 1),
      ground(c, 960),
      path('M760 1220 C780 1120 720 1080 760 1000 L880 1000 C860 1080 930 1120 900 1220 Z', c('#e9c46a'), L()),
      rect(1010, 300, 110, 220, c('#ff6b6b'), L(10)),
      rect(430, 560, 740, 450, c('#ffe066'), L(11)),
      path('M370 580 L800 250 L1230 580 Z', c('#ff6b6b'), L(11)),
      `<rect x="720" y="760" width="170" height="250" rx="80" fill="${c('#a9744f')}" ${L(10)}/>`,
      circle(860, 890, 12, '#3d2c4e'),
      `<rect x="500" y="660" width="160" height="150" rx="20" fill="${c('#74c0fc')}" ${L(10)}/>`,
      `<rect x="950" y="660" width="160" height="150" rx="20" fill="${c('#74c0fc')}" ${L(10)}/>`,
      eye(580, 735, 32),
      eye(1030, 735, 32),
      smile(805, 690, 50),
      circle(805, 440, 56, c('#74c0fc'), L(10)),
    ].join(''),
  );

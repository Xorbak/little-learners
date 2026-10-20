import { page, sky, ground, cloud, sunSimple, eye, smile, L, circle, path, blob } from './_page.mjs';
export default (c) =>
  page(
    [
      sky(c),
      sunSimple(c, 1380, 200, 95),
      cloud(c, 230, 170, 0.9),
      ground(c, 1000),
      path('M720 1080 C740 900 740 760 720 640 L880 640 C860 760 860 900 880 1080 Z', c('#a9744f'), L(11)),
      path(blob([[400, 640], [330, 470], [420, 290], [600, 180], [800, 150], [1000, 180], [1180, 290], [1270, 470], [1200, 640], [1000, 720], [800, 700], [600, 720]]), c('#51cf66'), L(12)),
      circle(500, 420, 55, c('#ff6b6b'), L(9)),
      circle(700, 300, 55, c('#ff6b6b'), L(9)),
      circle(1060, 360, 55, c('#ff6b6b'), L(9)),
      circle(1120, 560, 55, c('#ff6b6b'), L(9)),
      circle(600, 600, 55, c('#ff6b6b'), L(9)),
      eye(745, 470, 34),
      eye(855, 470, 34),
      smile(800, 540, 40),
      circle(1250, 1060, 45, c('#ff6b6b'), L(9)),
    ].join(''),
  );

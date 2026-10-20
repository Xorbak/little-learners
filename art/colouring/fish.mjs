import { page, sky, eye, smile, L, circle, ellipse, path } from './_page.mjs';
const weed = (c, x, h) => path(`M${x} 1210 C${x - 60} ${1210 - h * 0.3} ${x + 60} ${1210 - h * 0.6} ${x} ${1210 - h} C${x + 50} ${1210 - h * 0.6} ${x - 10} ${1210 - h * 0.3} ${x + 50} 1210 Z`, c('#69db7c'), L());
export default (c) =>
  page(
    [
      sky(c, '#74c0fc'),
      path('M-20 1030 C400 980 900 1080 1620 1010 L1620 1220 L-20 1220 Z', c('#ffe066'), L()),
      weed(c, 170, 520),
      weed(c, 1420, 460),
      // tail and fins
      path('M1080 560 L1360 330 C1400 480 1400 640 1360 790 Z', c('#ff6b6b'), L(10)),
      path('M640 350 C700 180 900 170 1000 330 Z', c('#ff6b6b'), L(10)),
      path('M700 760 C720 880 820 900 900 830 Z', c('#ff6b6b'), L(10)),
      // body
      ellipse(780, 560, 380, 250, c('#ffa94d'), L(11)),
      // white stripes (left as paper)
      path('M930 330 C980 450 980 670 930 790 L1010 760 C1060 640 1060 480 1010 360 Z', '#fff', L(9)),
      path('M600 320 C560 450 560 670 600 800 L690 808 C650 670 650 450 690 312 Z', '#fff', L(9)),
      eye(510, 500, 58, [-0.3, 0]),
      smile(470, 640, 55),
      circle(330, 300, 34, '#fff', L(7)),
      circle(270, 190, 24, '#fff', L(7)),
      circle(1250, 200, 30, '#fff', L(7)),
    ].join(''),
  );

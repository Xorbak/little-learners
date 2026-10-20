import { page, sky, ground, cloud, eye, smile, L, path, rect, circle } from './_page.mjs';
const tower = (c, x, w, top, roof) =>
  rect(x, top, w, 1010 - top, c('#ced4da'), L(11)) + path(`M${x - 30} ${top} L${x + w / 2} ${top - 260} L${x + w + 30} ${top} Z`, c(roof), L(11)) +
  path(`M${x + w / 2} ${top - 260} V${top - 360}`, 'none', L(9)) + path(`M${x + w / 2} ${top - 360} L${x + w / 2 + 90} ${top - 330} L${x + w / 2} ${top - 300} Z`, c('#ff6b6b'), L(8));
export default (c) =>
  page(
    [
      sky(c),
      cloud(c, 800, 150, 0.9),
      ground(c, 990),
      tower(c, 200, 260, 520, '#b197fc'),
      tower(c, 1140, 260, 520, '#b197fc'),
      rect(460, 600, 680, 410, c('#dee2e6'), L(11)),
      path('M460 600 V540 H560 V600 M640 600 V540 H740 V600 M860 600 V540 H960 V600 M1040 600 V540 H1140 V600', c('#dee2e6'), L(11)),
      path('M690 1010 V840 C690 740 910 740 910 840 V1010 Z', c('#a9744f'), L(11)),
      `<rect x="270" y="640" width="120" height="150" rx="60" fill="${c('#ffe066')}" ${L(10)}/>`,
      `<rect x="1210" y="640" width="120" height="150" rx="60" fill="${c('#ffe066')}" ${L(10)}/>`,
      eye(700, 680, 34),
      eye(900, 680, 34),
      smile(800, 740, 34),
      circle(330, 300, 0, 'none'),
    ].join(''),
  );

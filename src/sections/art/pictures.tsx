import type { LearningItem, PaintPicture, PaintRegion } from '../../types/learning';
import { colourItems } from '../colours/items';

/**
 * Pictures for Paint by Numbers. Each region is an SVG path plus the colour it
 * should be (a colour key from the Colours section). Keep regions big: small
 * fingers. Add a picture by adding an entry to `pictureList`.
 */

/** A region painted `colour`, with its number/dot at (x, y) */
const r = (d: string, colour: string, x: number, y: number): PaintRegion => {
  const c = colourItems[colour];
  return { d, hex: c.hex!, colourClip: c.nameClip, label: [x, y] };
};

const circle = (cx: number, cy: number, rad: number) =>
  `M${cx - rad} ${cy} a${rad} ${rad} 0 1 0 ${rad * 2} 0 a${rad} ${rad} 0 1 0 ${-rad * 2} 0 Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;
/** Half ring for the rainbow: outer radius R, inner radius ri, centred at (cx, cy) */
const band = (cx: number, cy: number, R: number, ri: number) =>
  `M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy} L${cx + ri} ${cy} A${ri} ${ri} 0 0 0 ${cx - ri} ${cy} Z`;

const VIEW = '0 0 400 300';
const ink = { stroke: '#2b2d42', strokeWidth: 3, strokeLinecap: 'round' as const, fill: 'none', pointerEvents: 'none' as const };

const ladybird: PaintPicture = {
  viewBox: VIEW,
  regions: [
    r('M40 260 Q60 60 200 30 Q340 60 360 260 Q200 300 40 260 Z', 'green', 70, 230),
    r(circle(200, 175, 88), 'red', 200, 240),
    r(circle(200, 82, 40), 'black', 200, 70),
    r(circle(160, 145, 20), 'black', 160, 145),
    r(circle(240, 145, 20), 'black', 240, 145),
    r(circle(150, 205, 20), 'black', 150, 205),
    r(circle(250, 205, 20), 'black', 250, 205),
  ],
  Details: () => (
    <g>
      <line x1="200" y1="122" x2="200" y2="262" {...ink} />
      <circle cx="186" cy="88" r="7" fill="#fff" pointerEvents="none" />
      <circle cx="214" cy="88" r="7" fill="#fff" pointerEvents="none" />
      <path d="M182 46 Q170 20 158 18 M218 46 Q230 20 242 18" {...ink} />
    </g>
  ),
};

const fish: PaintPicture = {
  viewBox: VIEW,
  regions: [
    r('M0 0 H400 V300 H0 Z', 'blue', 40, 40),
    r('M0 255 Q100 232 200 252 T400 248 V300 H0 Z', 'yellow', 340, 280),
    r('M262 150 L350 92 L332 150 L350 208 Z', 'red', 318, 150),
    r(ellipse(185, 150, 95, 62), 'orange', 205, 165),
    r('M150 96 Q190 40 236 100 Q195 86 150 96 Z', 'red', 192, 76),
  ],
  Details: () => (
    <g>
      <circle cx="128" cy="135" r="13" fill="#fff" stroke="#2b2d42" strokeWidth="3" pointerEvents="none" />
      <circle cx="131" cy="137" r="5" fill="#2b2d42" pointerEvents="none" />
      <path d="M100 162 Q112 172 124 164" {...ink} />
      <circle cx="70" cy="110" r="9" {...ink} />
      <circle cx="58" cy="80" r="6" {...ink} />
    </g>
  ),
};

const flower: PaintPicture = {
  viewBox: VIEW,
  regions: [
    r('M193 118 H207 V225 H193 Z', 'green', 200, 212),
    r('M195 192 Q150 150 120 182 Q160 212 195 200 Z', 'green', 152, 186),
    r('M205 168 Q250 126 282 156 Q244 186 205 176 Z', 'green', 262, 162),
    r('M142 222 H258 L242 292 H158 Z', 'orange', 200, 258),
    ...[0, 72, 144, 216, 288].map((deg) => {
      const a = ((deg - 90) * Math.PI) / 180;
      const x = Math.round(200 + Math.cos(a) * 46);
      const y = Math.round(92 + Math.sin(a) * 46);
      return r(circle(x, y, 30), 'pink', Math.round(200 + Math.cos(a) * 56), Math.round(92 + Math.sin(a) * 56));
    }),
    r(circle(200, 92, 26), 'yellow', 200, 92),
  ],
};

const house: PaintPicture = {
  viewBox: VIEW,
  regions: [
    r('M0 0 H400 V300 H0 Z', 'light-blue', 40, 40),
    r('M0 232 Q200 214 400 232 V300 H0 Z', 'green', 60, 270),
    r(circle(340, 62, 34), 'yellow', 340, 62),
    r('M112 140 H288 V244 H112 Z', 'yellow', 145, 220),
    r('M92 146 L200 66 L308 146 Z', 'red', 200, 118),
    r('M178 176 H222 V244 H178 Z', 'brown', 200, 212),
    r('M234 160 H274 V196 H234 Z', 'blue', 254, 178),
    r('M126 160 H166 V196 H126 Z', 'blue', 146, 178),
  ],
  Details: () => <circle cx="213" cy="212" r="4" fill="#2b2d42" pointerEvents="none" />,
};

const rainbow: PaintPicture = {
  viewBox: VIEW,
  regions: [
    r('M0 0 H400 V300 H0 Z', 'light-blue', 36, 36),
    r(band(200, 258, 186, 160), 'red', 200, 85),
    r(band(200, 258, 160, 134), 'orange', 200, 111),
    r(band(200, 258, 134, 108), 'yellow', 200, 137),
    r(band(200, 258, 108, 82), 'green', 200, 163),
    r(band(200, 258, 82, 56), 'blue', 200, 189),
    r(band(200, 258, 56, 30), 'purple', 200, 215),
    r('M0 252 Q200 236 400 252 V300 H0 Z', 'green', 340, 280),
  ],
};


const car: PaintPicture = {
  viewBox: VIEW,
  regions: [
    r(circle(60, 60, 32), 'yellow', 60, 60),
    r('M0 248 H400 V300 H0 Z', 'grey', 40, 276),
    r('M58 232 V200 Q58 168 92 164 H122 L152 112 H262 L298 164 H312 Q344 168 346 200 V232 Z', 'red', 100, 205),
    r('M162 160 L182 124 H204 V160 Z', 'light-blue', 188, 146),
    r('M216 160 V124 H252 L276 160 Z', 'light-blue', 238, 146),
    r(circle(122, 234, 32), 'black', 122, 252),
    r(circle(288, 234, 32), 'black', 288, 252),
  ],
  Details: () => (
    <g pointerEvents="none">
      <circle cx="122" cy="234" r="11" fill="#adb5bd" stroke="#2b2d42" strokeWidth="3" />
      <circle cx="288" cy="234" r="11" fill="#adb5bd" stroke="#2b2d42" strokeWidth="3" />
      <path d="M210 168 V226" {...ink} />
    </g>
  ),
};

const boat: PaintPicture = {
  viewBox: VIEW,
  regions: [
    r('M0 0 H400 V300 H0 Z', 'light-blue', 40, 40),
    r('M0 222 Q50 206 100 222 T200 222 T300 222 T400 222 V300 H0 Z', 'blue', 60, 272),
    r('M78 200 H322 L286 252 H114 Z', 'brown', 200, 226),
    r('M208 56 V190 H306 Z', 'yellow', 238, 162),
    r('M192 78 V190 H116 Z', 'red', 168, 168),
  ],
  Details: () => <path d="M200 40 V200" stroke="#2b2d42" strokeWidth="6" strokeLinecap="round" pointerEvents="none" />,
};

const butterfly: PaintPicture = {
  viewBox: VIEW,
  regions: [
    r(ellipse(135, 105, 66, 56), 'purple', 158, 130),
    r(ellipse(265, 105, 66, 56), 'purple', 242, 130),
    r(ellipse(148, 198, 52, 44), 'pink', 136, 206),
    r(ellipse(252, 198, 52, 44), 'pink', 264, 206),
    r(circle(115, 92, 22), 'yellow', 115, 92),
    r(circle(285, 92, 22), 'yellow', 285, 92),
    r(ellipse(200, 152, 17, 82), 'black', 200, 160),
  ],
  Details: () => <path d="M194 76 Q180 40 160 34 M206 76 Q220 40 240 34" {...ink} />,
};

const rocket: PaintPicture = {
  viewBox: VIEW,
  regions: [
    r('M0 0 H400 V300 H0 Z', 'dark-blue', 40, 40),
    r('M152 176 L108 242 H152 Z', 'red', 138, 224),
    r('M248 176 L292 242 H248 Z', 'red', 262, 224),
    r('M164 232 H236 L216 286 L200 266 L184 286 Z', 'orange', 200, 250),
    r('M200 36 Q252 88 252 170 V234 H148 V170 Q148 88 200 36 Z', 'grey', 200, 206),
    r('M200 36 Q238 74 246 108 H154 Q162 74 200 36 Z', 'red', 200, 84),
    r(circle(200, 146, 24), 'light-blue', 200, 146),
  ],
  Details: () => (
    <g fill="#fff" pointerEvents="none">
      <circle cx="70" cy="120" r="4" />
      <circle cx="330" cy="60" r="5" />
      <circle cx="320" cy="200" r="4" />
      <circle cx="90" cy="230" r="3" />
    </g>
  ),
};

const iceCream: PaintPicture = {
  viewBox: VIEW,
  regions: [
    r('M0 0 H400 V300 H0 Z', 'light-blue', 40, 40),
    r('M140 150 L200 288 L260 150 Z', 'orange', 200, 226),
    r(circle(200, 142, 58), 'pink', 200, 166),
    r(circle(200, 76, 46), 'brown', 200, 70),
    r(circle(200, 24, 18), 'red', 200, 24),
  ],
  Details: () => <path d="M166 200 L222 236 M180 230 L212 210 M232 196 L176 232" stroke="#2b2d42" strokeWidth="2" opacity="0.5" pointerEvents="none" />,
};

const tree: PaintPicture = {
  viewBox: VIEW,
  regions: [
    r('M0 0 H400 V300 H0 Z', 'light-blue', 40, 40),
    r('M0 240 Q200 220 400 240 V300 H0 Z', 'green', 60, 276),
    r('M180 150 H220 V252 H180 Z', 'brown', 200, 228),
    r(circle(200, 108, 74), 'green', 176, 140),
    r(circle(160, 88, 18), 'red', 160, 88),
    r(circle(236, 78, 18), 'red', 236, 78),
    r(circle(226, 140, 18), 'red', 226, 140),
  ],
};

const snail: PaintPicture = {
  viewBox: VIEW,
  regions: [
    r('M0 0 H400 V300 H0 Z', 'light-blue', 40, 40),
    r('M0 244 H400 V300 H0 Z', 'green', 40, 276),
    r('M64 244 Q64 204 106 204 H300 Q334 204 338 244 Z', 'yellow', 312, 228),
    r('M292 210 Q294 150 322 150 Q350 150 344 210 Z', 'yellow', 320, 180),
    r(circle(196, 160, 76), 'orange', 196, 106),
    r(circle(200, 168, 34), 'brown', 200, 168),
  ],
  Details: () => (
    <g pointerEvents="none">
      <path d="M312 152 L304 116 M332 152 L340 116" {...ink} />
      <circle cx="304" cy="114" r="6" fill="#2b2d42" />
      <circle cx="340" cy="114" r="6" fill="#2b2d42" />
      <path d="M318 182 Q326 190 336 182" {...ink} />
    </g>
  ),
};

const cupcake: PaintPicture = {
  viewBox: VIEW,
  regions: [
    r('M0 0 H400 V300 H0 Z', 'yellow', 40, 40),
    r('M120 170 H280 L260 272 H140 Z', 'blue', 200, 236),
    r('M108 176 Q98 140 140 130 Q150 92 200 96 Q250 92 260 130 Q302 140 292 176 Z', 'pink', 150, 156),
    r(circle(200, 82, 22), 'red', 200, 82),
  ],
  Details: () => (
    <g pointerEvents="none">
      <path d="M160 176 L168 270 M200 176 V270 M240 176 L232 270" stroke="#2b2d42" strokeWidth="3" opacity="0.5" />
      <path d="M214 74 Q222 56 236 50" {...ink} />
    </g>
  ),
};

const duck: PaintPicture = {
  viewBox: VIEW,
  regions: [
    r('M0 0 H400 V300 H0 Z', 'light-blue', 40, 40),
    r('M0 222 Q100 206 200 222 T400 222 V300 H0 Z', 'blue', 60, 272),
    r(ellipse(204, 200, 96, 50), 'yellow', 150, 216),
    r(circle(132, 130, 42), 'yellow', 140, 146),
    r('M94 124 L54 140 L94 154 Z', 'orange', 80, 140),
    r('M192 192 Q242 158 274 196 Q236 218 192 192 Z', 'orange', 234, 192),
  ],
  Details: () => <circle cx="124" cy="118" r="6" fill="#2b2d42" pointerEvents="none" />,
};

const castle: PaintPicture = {
  viewBox: VIEW,
  regions: [
    r('M0 0 H400 V300 H0 Z', 'light-blue', 40, 40),
    r('M0 252 H400 V300 H0 Z', 'green', 40, 278),
    r('M110 140 H290 V260 H110 Z', 'grey', 152, 200),
    r('M68 110 H132 V260 H68 Z', 'grey', 100, 200),
    r('M268 110 H332 V260 H268 Z', 'grey', 300, 200),
    r('M60 112 L100 48 L140 112 Z', 'purple', 100, 92),
    r('M260 112 L300 48 L340 112 Z', 'purple', 300, 92),
    r('M174 260 V214 Q200 182 226 214 V260 Z', 'brown', 200, 238),
  ],
  Details: () => (
    <g pointerEvents="none">
      <path d="M92 140 h16 v22 h-16 Z M292 140 h16 v22 h-16 Z" fill="#2b2d42" />
      <path d="M110 140 V126 h20 v14 M150 140 V126 h20 v14 M190 140 V126 h20 v14 M230 140 V126 h20 v14 M270 140" stroke="#2b2d42" strokeWidth="3" fill="none" />
    </g>
  ),
};

const turtle: PaintPicture = {
  viewBox: VIEW,
  regions: [
    r('M0 0 H400 V300 H0 Z', 'light-blue', 40, 40),
    r(circle(140, 226, 26), 'yellow', 140, 230),
    r(circle(262, 226, 26), 'yellow', 262, 230),
    r(circle(326, 168, 34), 'yellow', 336, 164),
    r('M96 212 Q106 88 200 88 Q294 88 304 212 Z', 'green', 120, 190),
    r(circle(200, 146, 24), 'brown', 200, 146),
    r(circle(150, 176, 18), 'brown', 150, 176),
    r(circle(250, 176, 18), 'brown', 250, 176),
  ],
  Details: () => (
    <g pointerEvents="none">
      <circle cx="338" cy="158" r="5" fill="#2b2d42" />
      <path d="M332 178 Q342 184 352 176" {...ink} />
    </g>
  ),
};

const balloons: PaintPicture = {
  viewBox: VIEW,
  regions: [
    r('M0 0 H400 V300 H0 Z', 'light-blue', 40, 40),
    r(ellipse(128, 110, 48, 58), 'red', 124, 104),
    r(ellipse(210, 88, 48, 58), 'yellow', 210, 74),
    r(ellipse(288, 118, 48, 58), 'blue', 296, 112),
    r(ellipse(232, 190, 38, 46), 'green', 226, 200),
  ],
  Details: () => <path d="M128 168 Q150 230 200 286 M210 146 Q195 220 200 286 M288 176 Q250 230 200 286 M232 236 Q215 262 200 286" {...ink} strokeWidth={2} />,
};

export const pictureList: { key: string; name: string; picture: PaintPicture }[] = [
  { key: 'ladybird', name: 'ladybird', picture: ladybird },
  { key: 'fish', name: 'fish', picture: fish },
  { key: 'flower', name: 'flower', picture: flower },
  { key: 'house', name: 'house', picture: house },
  { key: 'rainbow', name: 'rainbow', picture: rainbow },
  { key: 'car', name: 'car', picture: car },
  { key: 'boat', name: 'boat', picture: boat },
  { key: 'butterfly', name: 'butterfly', picture: butterfly },
  { key: 'rocket', name: 'rocket', picture: rocket },
  { key: 'ice-cream', name: 'ice cream', picture: iceCream },
  { key: 'tree', name: 'apple tree', picture: tree },
  { key: 'snail', name: 'snail', picture: snail },
  { key: 'cupcake', name: 'cupcake', picture: cupcake },
  { key: 'duck', name: 'duck', picture: duck },
  { key: 'castle', name: 'castle', picture: castle },
  { key: 'turtle', name: 'turtle', picture: turtle },
  { key: 'balloons', name: 'balloons', picture: balloons },
];

/** Every picture, in gallery order */
export const allPictures = pictureList.map((p) => p.key);

/** A small finished version of the picture */
function Thumbnail({ picture, size }: { picture: PaintPicture; size: number }) {
  const { Details } = picture;
  return (
    <svg viewBox={picture.viewBox} width={size} height={(size * 3) / 4} aria-hidden="true">
      {picture.regions.map((reg, i) => (
        <path key={i} d={reg.d} fill={reg.hex} stroke="#2b2d42" strokeWidth="3" />
      ))}
      {Details && <Details />}
    </svg>
  );
}

export const pictureItems: Record<string, LearningItem> = Object.fromEntries(
  pictureList.map(({ key, picture }) => [
    key,
    {
      key,
      nameClip: `art.picture.${key}`,
      pluralClip: `art.picture.${key}`,
      picture,
      Display: ({ size }: { size: number }) => <Thumbnail picture={picture} size={size} />,
    } satisfies LearningItem,
  ]),
);

export const pictureClips = Object.fromEntries(pictureList.map(({ key, name }) => [`art.picture.${key}`, name]));

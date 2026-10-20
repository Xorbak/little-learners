import type { LearningItem, PaintPicture, PaintRegion } from '../../types/learning';
import { colourItems } from '../colours/items';

/**
 * Pictures for Paint by Numbers, made from colouring pages.
 * Add a picture: put a colouring page (and ideally a coloured-in copy) in
 * colouring-pages/ and run `npm run colouring` (see scripts/colouring.mjs).
 * The app's own pages are drawn in code in art/colouring/ and rendered with
 * `node art/render-colouring.mjs`.
 */

/** A region painted `colour`, with its number/dot at (x, y) */
const r = (d: string, colour: string, x: number, y: number): PaintRegion => {
  const c = colourItems[colour];
  return { d, hex: c.hex!, colourClip: c.nameClip, label: [x, y] };
};

// ---------------------------------------------------------------------------
// Pictures made from colouring pages (scripts/colouring.mjs writes ./colouring/*.json)
// ---------------------------------------------------------------------------
interface ColouringJson {
  name: string;
  viewBox: string;
  regions: { d: string; colour: string; label: [number, number] }[];
  fixed: { d: string; hex: string }[];
  lines: string;
}

const colouringFiles = import.meta.glob('./colouring/*.json', { eager: true, import: 'default' }) as Record<string, ColouringJson>;

const fromColouringPage = (json: ColouringJson): PaintPicture => ({
  viewBox: json.viewBox,
  lineArt: true,
  regions: json.regions.map((reg) => r(reg.d, colourItems[reg.colour] ? reg.colour : 'grey', reg.label[0], reg.label[1])),
  Details: () => (
    <g pointerEvents="none">
      {json.fixed.map((f, i) => (
        <path key={i} d={f.d} fill={f.hex} />
      ))}
      <path d={json.lines} fill="#2b2d42" />
    </g>
  ),
});

const colouringPictures = Object.entries(colouringFiles).map(([path, json]) => ({
  key: path.replace(/^.*\/|\.json$/g, ''),
  name: json.name,
  picture: fromColouringPage(json),
}));

/** Every picture, easiest (fewest parts) first */
export const pictureList = colouringPictures.sort((x, y) => x.picture.regions.length - y.picture.regions.length || x.key.localeCompare(y.key));

/** Every picture, in gallery order */
export const allPictures = pictureList.map((p) => p.key);

/** A small finished version of the picture */
function Thumbnail({ picture, size }: { picture: PaintPicture; size: number }) {
  const { Details } = picture;
  const [, , vw, vh] = picture.viewBox.split(' ').map(Number);
  return (
    <svg viewBox={picture.viewBox} width={size} height={(size * vh) / vw} aria-hidden="true">
      <rect width={vw} height={vh} fill="#fff" />
      {picture.regions.map((reg, i) => (
        <path key={i} d={reg.d} fill={reg.hex} {...(picture.lineArt ? {} : { stroke: '#2b2d42', strokeWidth: 3 })} />
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

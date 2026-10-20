#!/usr/bin/env node
/**
 * Colouring page → Paint by Numbers picture.
 *
 *   npm run colouring                 converts every page in colouring-pages/
 *   npm run colouring -- unicorn      just that one
 *
 * Put in colouring-pages/:
 *   unicorn.png             the colouring page: black lines on white, closed shapes
 *   unicorn-coloured.png    (optional, recommended) the same picture coloured in with flat colours
 *   unicorn.json            (optional) settings, e.g.
 *                           { "name": "unicorn", "max": 12, "colours": { "4": "pink" }, "paintWhite": false }
 *
 * Writes src/sections/art/colouring/unicorn.json, which the Art section picks up
 * automatically (it appears in the Paint by Numbers gallery).
 *
 * How it works: the lines are found by brightness, small gaps are closed, each
 * enclosed area is found with a flood fill, its colour is taken from the
 * coloured version (averaged, snapped to the app's paint colours), areas too
 * small for a finger are painted in already, every area is traced into a smooth
 * SVG outline, and the number goes at the widest point inside each area. The
 * black line art is traced too and drawn on top.
 *
 * The report it prints lists every area with its number, so colours can be
 * fixed by hand in the settings file ("colours": { "<area number>": "<colour>" }).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = join(root, 'colouring-pages');
const outDir = join(root, 'src', 'sections', 'art', 'colouring');

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
const DEFAULTS = {
  /** Working size (longest side, pixels); the output viewBox is 1000 wide */
  size: 1000,
  /** Darker than this (0–255) counts as line */
  threshold: 150,
  /** Close gaps in the lines up to about this many working pixels */
  close: 2,
  /** Most areas to paint (toddlers: 5–15); the smallest extra ones are painted in already */
  max: 14,
  /** An area needs a circle this big inside it to be tappable (fraction of the width) */
  minTap: 0.022,
  /** Areas smaller than this (fraction of the picture) are just bits of line */
  speck: 0.00025,
  /** Paint white areas too (normally white is left as paper) */
  paintWhite: false,
};

// The app's paint colours (read from the Colours section, so they always match)
const coloursSrc = readFileSync(join(root, 'src', 'sections', 'colours', 'items.tsx'), 'utf8');
const PALETTE = [...coloursSrc.matchAll(/\{\s*key:\s*'([\w-]+)',\s*hex:\s*'(#[0-9a-fA-F]{6})'/g)].map((m) => ({ key: m[1], hex: m[2] }));
if (!PALETTE.length) throw new Error('Could not read the colour palette from src/sections/colours/items.tsx');

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------
function load(file) {
  const buf = readFileSync(file);
  const ext = extname(file).toLowerCase();
  if (ext === '.png') {
    const png = PNG.sync.read(buf);
    return { w: png.width, h: png.height, data: png.data };
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    const img = jpeg.decode(buf, { useTArray: true, formatAsRGBA: true, maxMemoryUsageInMB: 1024 });
    return { w: img.width, h: img.height, data: img.data };
  }
  throw new Error(`Use PNG or JPG: ${file}`);
}

/** Box-filter resize to (W, H), flattening transparency onto white. Returns Float32 RGB. */
function resize(img, W, H) {
  const out = new Float32Array(W * H * 3);
  const sx = img.w / W;
  const sy = img.h / H;
  for (let y = 0; y < H; y++) {
    const y0 = Math.floor(y * sy);
    const y1 = Math.max(y0 + 1, Math.floor((y + 1) * sy));
    for (let x = 0; x < W; x++) {
      const x0 = Math.floor(x * sx);
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * sx));
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * img.w + xx) * 4;
          const a = img.data[i + 3] / 255;
          r += img.data[i] * a + 255 * (1 - a);
          g += img.data[i + 1] * a + 255 * (1 - a);
          b += img.data[i + 2] * a + 255 * (1 - a);
          n++;
        }
      }
      const o = (y * W + x) * 3;
      out[o] = r / n;
      out[o + 1] = g / n;
      out[o + 2] = b / n;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------
const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const rgbToHex = (rgb) => '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
function toLab([r, g, b]) {
  const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);
  const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
/**
 * Lighter and darker tints that still count as each paint colour (a lavender is
 * "purple" to a 3-year-old, a pale green is "green"), so coloured pages made with
 * soft colours snap to the colour she would call them.
 */
const TINTS = {
  red: ['#ff6b6b', '#ff8787', '#fa5252', '#e03131', '#c92a2a'],
  orange: ['#ffa94d', '#ff922b', '#ffc078', '#f76707'],
  yellow: ['#ffe066', '#ffd43b', '#fff3bf', '#ffec99', '#fab005'],
  green: ['#8ce99a', '#69db7c', '#b2f2bb', '#51cf66', '#2f9e44', '#a9e34b', '#63e6be'],
  blue: ['#4dabf7', '#339af0', '#228be6', '#1971c2', '#4c6ef5', '#5c7cfa'],
  'light-blue': ['#a5d8ff', '#d0ebff', '#99e9f2', '#66d9e8', '#c5f6fa'],
  purple: ['#b197fc', '#d0bfff', '#9775fa', '#cc5de8', '#da77f2', '#e599f7', '#845ef7'],
  pink: ['#ffa8c5', '#ffdeeb', '#ff8fab', '#faa2c1', '#ffd8e8', '#f06595'],
  brown: ['#a9744f', '#c0803a', '#a0522d', '#6f4518', '#b5835a'],
  grey: ['#ced4da', '#dee2e6', '#868e96', '#e9ecef'],
  black: ['#212529', '#343a40', '#3d2c4e'],
};
const PALETTE_LAB = [
  ...PALETTE.map((p) => ({ ...p, lab: toLab(hexToRgb(p.hex)) })),
  ...Object.entries(TINTS).flatMap(([key, list]) => (PALETTE.some((p) => p.key === key) ? list.map((hex) => ({ key, hex, lab: toLab(hexToRgb(hex)) })) : [])),
];
function snap(rgb) {
  const lab = toLab(rgb);
  let best = PALETTE_LAB[0];
  let bd = Infinity;
  for (const p of PALETTE_LAB) {
    // Weight hue/chroma a bit more than lightness: a light pink is still pink
    const d = 0.6 * (lab[0] - p.lab[0]) ** 2 + (lab[1] - p.lab[1]) ** 2 + (lab[2] - p.lab[2]) ** 2;
    if (d < bd) {
      bd = d;
      best = p;
    }
  }
  return best.key;
}

// ---------------------------------------------------------------------------
// Masks
// ---------------------------------------------------------------------------
/** Grow a mask by r pixels (round-ish brush) */
function dilate(mask, W, H, r) {
  if (r <= 0) return mask.slice();
  const out = new Uint8Array(W * H);
  const offs = [];
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r + r) offs.push([dx, dy]);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!mask[y * W + x]) continue;
      for (const [dx, dy] of offs) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx >= 0 && yy >= 0 && xx < W && yy < H) out[yy * W + xx] = 1;
      }
    }
  }
  return out;
}

/** Connected components of `on` pixels (4-connected). Returns labels (0 = none) and count. */
function components(on, W, H) {
  const labels = new Int32Array(W * H);
  const stack = new Int32Array(W * H);
  let n = 0;
  for (let i = 0; i < W * H; i++) {
    if (!on[i] || labels[i]) continue;
    n++;
    let sp = 0;
    stack[sp++] = i;
    labels[i] = n;
    while (sp) {
      const p = stack[--sp];
      const x = p % W;
      const y = (p - x) / W;
      const nb = [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1];
      for (const q of nb) {
        if (q >= 0 && on[q] && !labels[q]) {
          labels[q] = n;
          stack[sp++] = q;
        }
      }
    }
  }
  return { labels, n };
}

/** Chamfer distance (3-4) from every `on` pixel to the nearest `off` pixel or the edge, in pixels */
function distance(on, W, H) {
  const INF = 1e9;
  const d = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) d[i] = on[i] ? INF : 0;
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : d[y * W + x]);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!d[i]) continue;
      d[i] = Math.min(d[i], at(x - 1, y) + 3, at(x, y - 1) + 3, at(x - 1, y - 1) + 4, at(x + 1, y - 1) + 4);
    }
  for (let y = H - 1; y >= 0; y--)
    for (let x = W - 1; x >= 0; x--) {
      const i = y * W + x;
      if (!d[i]) continue;
      d[i] = Math.min(d[i], at(x + 1, y) + 3, at(x, y + 1) + 3, at(x + 1, y + 1) + 4, at(x - 1, y + 1) + 4);
    }
  for (let i = 0; i < W * H; i++) d[i] /= 3;
  return d;
}

// ---------------------------------------------------------------------------
// Tracing: pixel edges → loops → simplified → smooth SVG path
// ---------------------------------------------------------------------------
const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];

/** Outline loops of a mask (within a bounding box), as lists of corner points */
function traceLoops(isOn, x0, y0, x1, y1) {
  const VW = x1 - x0 + 2;
  const key = (x, y) => (y - y0) * VW + (x - x0);
  const out = new Map(); // vertex → [dir, dir]
  const add = (x, y, dir) => {
    const k = key(x, y);
    const list = out.get(k);
    if (list) list.push(dir);
    else out.set(k, [dir]);
  };
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (!isOn(x, y)) continue;
      if (!isOn(x, y - 1)) add(x, y, 0); // top: → (clockwise round the pixel)
      if (!isOn(x + 1, y)) add(x + 1, y, 1); // right: ↓
      if (!isOn(x, y + 1)) add(x + 1, y + 1, 2); // bottom: ←
      if (!isOn(x - 1, y)) add(x, y + 1, 3); // left: ↑
    }
  }
  const loops = [];
  for (const [startKey, dirs] of out) {
    while (dirs.length) {
      const sx = (startKey % VW) + x0;
      const sy = Math.floor(startKey / VW) + y0;
      let x = sx;
      let y = sy;
      let dir = dirs.pop();
      const pts = [[x, y]];
      let guard = 0;
      for (;;) {
        x += DX[dir];
        y += DY[dir];
        if (x === sx && y === sy) {
          // There might be a second loop through this corner; it is picked up later
          break;
        }
        const k = key(x, y);
        const opts = out.get(k);
        if (!opts || !opts.length) break;
        // At a corner where two outlines touch, turn right first (keeps diagonal pixels apart)
        let pickIdx = 0;
        if (opts.length > 1) {
          const prefer = [(dir + 1) % 4, dir, (dir + 3) % 4];
          pickIdx = opts.findIndex((o) => o === prefer[0]);
          if (pickIdx < 0) pickIdx = opts.findIndex((o) => o === prefer[1]);
          if (pickIdx < 0) pickIdx = 0;
        }
        const nd = opts.splice(pickIdx, 1)[0];
        if (nd !== dir) pts.push([x, y]);
        dir = nd;
        if (++guard > 4e6) break;
      }
      if (pts.length >= 4) loops.push(pts);
    }
  }
  return loops;
}

function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0];
  const [bx, by] = pts[pts.length - 1];
  const len = Math.hypot(bx - ax, by - ay) || 1;
  let max = 0;
  let idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i];
    const d = len > 1e-9 ? Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / len : Math.hypot(px - ax, py - ay);
    if (d > max) {
      max = d;
      idx = i;
    }
  }
  if (max <= eps) return [pts[0], pts[pts.length - 1]];
  return [...rdp(pts.slice(0, idx + 1), eps).slice(0, -1), ...rdp(pts.slice(idx), eps)];
}

function simplifyLoop(loop, eps) {
  // Split the loop at the point farthest from its start, simplify both halves
  const [sx, sy] = loop[0];
  let far = 0;
  let fd = -1;
  loop.forEach(([x, y], i) => {
    const d = (x - sx) ** 2 + (y - sy) ** 2;
    if (d > fd) {
      fd = d;
      far = i;
    }
  });
  const a = rdp(loop.slice(0, far + 1), eps);
  const b = rdp([...loop.slice(far), loop[0]], eps);
  return [...a.slice(0, -1), ...b.slice(0, -1)];
}

const area2 = (pts) => pts.reduce((s, [x, y], i) => {
  const [nx, ny] = pts[(i + 1) % pts.length];
  return s + x * ny - nx * y;
}, 0);

/**
 * Smooth closed path through simplified corners: straight along each side, with
 * every corner rounded off over at most `round` pixels (so long straight edges
 * stay straight and pixel staircases become smooth curves).
 */
function smoothPath(loops, scale, eps = 1.1, minArea = 6, round = 7) {
  let d = '';
  const f = (v) => Math.round(v * scale);
  for (const loop of loops) {
    if (Math.abs(area2(loop)) / 2 < minArea) continue;
    const p = simplifyLoop(loop, eps);
    if (p.length < 3) continue;
    const n = p.length;
    const toward = (a, b, dist) => {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const t = Math.min(0.5, dist / len);
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    };
    // For each corner: where the rounding starts (on the side before) and ends (on the side after)
    const ins = p.map((c, i) => toward(c, p[(i - 1 + n) % n], round));
    const outs = p.map((c, i) => toward(c, p[(i + 1) % n], round));
    // Compact output: whole numbers, relative moves, no line when there is nothing between two corners
    let cx = f(outs[0][0]);
    let cy = f(outs[0][1]);
    d += `M${cx} ${cy}`;
    for (let k = 1; k <= n; k++) {
      const i = k % n;
      const ix = f(ins[i][0]);
      const iy = f(ins[i][1]);
      if (ix !== cx || iy !== cy) d += `l${ix - cx} ${iy - cy}`;
      const px = f(p[i][0]);
      const py = f(p[i][1]);
      const ox = f(outs[i][0]);
      const oy = f(outs[i][1]);
      d += `q${px - ix} ${py - iy} ${ox - ix} ${oy - iy}`;
      cx = ox;
      cy = oy;
    }
    d += 'z';
  }
  return d.replace(/ -/g, '-');
}

// ---------------------------------------------------------------------------
// One page
// ---------------------------------------------------------------------------
function convert(name) {
  const find = (base) => ['.png', '.jpg', '.jpeg'].map((e) => join(pagesDir, base + e)).find(existsSync);
  const pageFile = find(name);
  if (!pageFile) throw new Error(`No colouring page for "${name}"`);
  const colouredFile = find(`${name}-coloured`) ?? find(`${name}-colored`);
  const settingsFile = join(pagesDir, `${name}.json`);
  const settings = { ...DEFAULTS, ...(existsSync(settingsFile) ? JSON.parse(readFileSync(settingsFile, 'utf8')) : {}) };

  const page = load(pageFile);
  const k = settings.size / Math.max(page.w, page.h);
  const W = Math.round(page.w * Math.min(1, k) || page.w);
  const H = Math.round(page.h * Math.min(1, k) || page.h);
  const px = resize(page, W, H);
  const N = W * H;
  const scale = 1000 / W;

  // 1. Lines: dark pixels. Drop little specks of dirt.
  let ink = new Uint8Array(N);
  for (let i = 0; i < N; i++) ink[i] = 0.299 * px[i * 3] + 0.587 * px[i * 3 + 1] + 0.114 * px[i * 3 + 2] < settings.threshold ? 1 : 0;
  {
    const { labels, n } = components(ink, W, H);
    const size = new Int32Array(n + 1);
    for (let i = 0; i < N; i++) size[labels[i]]++;
    const tiny = Math.max(4, N * 0.00003);
    for (let i = 0; i < N; i++) if (ink[i] && size[labels[i]] < tiny) ink[i] = 0;
  }

  // 2. Close small gaps, then find the enclosed areas
  const walls = dilate(ink, W, H, settings.close);
  const open = new Uint8Array(N);
  for (let i = 0; i < N; i++) open[i] = walls[i] ? 0 : 1;
  const { labels, n } = components(open, W, H);
  const dist = distance(open, W, H);

  // 3. Coloured version (same size)
  const col = colouredFile ? resize(load(colouredFile), W, H) : null;

  const areas = Array.from({ length: n + 1 }, (_, id) => ({ id, size: 0, r: 0, lx: 0, ly: 0, sum: [0, 0, 0], cnt: 0, x0: W, y0: H, x1: 0, y1: 0 }));
  for (let i = 0; i < N; i++) {
    const a = areas[labels[i]];
    if (!labels[i]) continue;
    const x = i % W;
    const y = (i - x) / W;
    a.size++;
    if (dist[i] > a.r) {
      a.r = dist[i];
      a.lx = x;
      a.ly = y;
    }
    // Colour from the middle of the area (away from the lines' soft edges)
    if (col && dist[i] >= 2) {
      a.sum[0] += col[i * 3];
      a.sum[1] += col[i * 3 + 1];
      a.sum[2] += col[i * 3 + 2];
      a.cnt++;
    }
  }

  // 4. Decide what each area is
  const speck = N * settings.speck;
  const tapR = W * settings.minTap;
  const placeholder = ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink', 'light-blue', 'brown'];
  let pi = 0;
  const list = areas.slice(1).filter((a) => a.size > 0);
  for (const a of list) {
    const avg = a.cnt ? a.sum.map((v) => v / a.cnt) : [255, 255, 255];
    a.avgHex = rgbToHex(avg);
    a.colour = col ? snap(avg) : null;
    a.kind = 'paint';
    if (a.size < speck) a.kind = 'speck';
    else if (col && a.colour === 'white' && !settings.paintWhite) a.kind = 'paper';
    else if (a.r < tapR) a.kind = 'fixed';
  }
  // Too many areas for little fingers: paint in the smallest extra ones already
  const paintable = list.filter((a) => a.kind === 'paint').sort((a, b) => b.r - a.r);
  paintable.slice(settings.max).forEach((a) => (a.kind = 'fixed'));
  // Without a coloured version every area gets a stand-in colour (fix them in the settings file)
  const order = list.filter((a) => a.kind === 'paint').sort((a, b) => a.ly - b.ly || a.lx - b.lx);
  order.forEach((a, i) => {
    a.number = i + 1;
    const override = settings.colours?.[String(i + 1)];
    if (override) a.colour = override;
    else if (!a.colour) a.colour = placeholder[pi++ % placeholder.length];
  });
  for (const a of list) {
    if (a.kind === 'fixed' && !col) a.kind = 'paper';
  }

  // 5. Let every area reach under the lines (each line pixel goes to the nearest area)
  const owner = new Int32Array(N);
  const queue = new Int32Array(N);
  let qh = 0;
  let qt = 0;
  for (let i = 0; i < N; i++) {
    const a = labels[i] ? areas[labels[i]] : null;
    if (a && (a.kind === 'paint' || a.kind === 'fixed' || a.kind === 'paper')) {
      owner[i] = labels[i];
      queue[qt++] = i;
    }
  }
  while (qh < qt) {
    const p = queue[qh++];
    const x = p % W;
    const y = (p - x) / W;
    for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) {
      if (q >= 0 && !owner[q]) {
        owner[q] = owner[p];
        queue[qt++] = q;
      }
    }
  }

  const traceArea = (id, a) => {
    const isOn = (x, y) => x >= 0 && y >= 0 && x < W && y < H && owner[y * W + x] === id;
    // owner can reach outside the area's own box (under lines); widen the box generously
    const m = settings.close + 12;
    // Area edges sit under the lines, so they can be a little rougher than the lines themselves
    return smoothPath(traceLoops(isOn, Math.max(0, a.x0 - m), Math.max(0, a.y0 - m), Math.min(W - 1, a.x1 + m), Math.min(H - 1, a.y1 + m)), scale, 1.6);
  };
  // bounding boxes of the grown areas
  for (let i = 0; i < N; i++) {
    const a = areas[owner[i]];
    if (!owner[i]) continue;
    const x = i % W;
    const y = (i - x) / W;
    if (x < a.x0) a.x0 = x;
    if (y < a.y0) a.y0 = y;
    if (x > a.x1) a.x1 = x;
    if (y > a.y1) a.y1 = y;
  }

  const regions = order.map((a) => ({
    d: traceArea(a.id, a),
    colour: a.colour,
    label: [+(a.lx * scale).toFixed(1), +(a.ly * scale).toFixed(1)],
    r: +(a.r * scale).toFixed(1),
  }));
  const fixed = list
    .filter((a) => a.kind === 'fixed')
    .map((a) => ({ d: traceArea(a.id, a), hex: a.avgHex }));

  // 6. The line art itself, traced from the original lines
  const lines = smoothPath(traceLoops((x, y) => x >= 0 && y >= 0 && x < W && y < H && ink[y * W + x] === 1, 0, 0, W - 1, H - 1), scale, 0.8, 3);

  const out = {
    name: settings.name ?? name.replace(/[-_]+/g, ' '),
    viewBox: `0 0 1000 ${Math.round(H * scale)}`,
    regions,
    fixed,
    lines,
  };
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `${name}.json`);
  writeFileSync(outFile, JSON.stringify(out));

  // Report
  const counts = list.reduce((m, a) => ((m[a.kind] = (m[a.kind] ?? 0) + 1), m), {});
  console.log(`\n${name}: ${regions.length} areas to paint, ${fixed.length} painted in already, ${counts.paper ?? 0} left white${col ? '' : ' (no coloured version: stand-in colours!)'}`);
  for (const a of order) console.log(`  ${String(a.number).padStart(2)}  ${a.colour.padEnd(10)} at (${Math.round(a.lx * scale)}, ${Math.round(a.ly * scale)})${col ? `  from ${a.avgHex}` : ''}`);
  console.log(`  → ${outFile.replace(root + '/', '')} (${Math.round(JSON.stringify(out).length / 1024)} KB)`);
  if (regions.length < 3) console.log('  ! Very few areas: are the lines dark and closed? Try "threshold" or "close" in the settings file.');
}

// ---------------------------------------------------------------------------
const wanted = process.argv.slice(2).filter((a) => !a.startsWith('-'));
if (!existsSync(pagesDir)) {
  console.log('Make a folder colouring-pages/ next to package.json and put colouring pages in it.');
  process.exit(1);
}
const names = wanted.length
  ? wanted
  : readdirSync(pagesDir)
      .filter((f) => /\.(png|jpe?g)$/i.test(f) && !/-colou?red\.(png|jpe?g)$/i.test(f))
      .map((f) => basename(f, extname(f)));
if (!names.length) console.log('No colouring pages found in colouring-pages/.');
for (const name of names) convert(name);

/**
 * Particles on one shared canvas over the whole screen (pointer-events off).
 * burst(x, y, kind) throws out a little puff of things from a point, in screen
 * pixels (clientX/clientY). The loop only runs while something is moving.
 */

export type BurstKind = 'confetti' | 'shards' | 'droplets' | 'dust' | 'stars' | 'sparkles' | 'crumbs' | 'stink' | 'hearts';

export interface BurstOptions {
  /** Main colour (shards, droplets, crumbs); confetti and stars use their own */
  colour?: string;
  /** How many (each kind has a sensible default) */
  count?: number;
  /** Spread size, 1 = normal */
  power?: number;
  /** Throw direction in degrees (0 = right, -90 = up); default all round */
  angle?: number;
  /** Spread around that direction in degrees (default 360) */
  spread?: number;
}

interface P {
  kind: BurstKind | 'ring';
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  drag: number;
  rot: number;
  vr: number;
  size: number;
  grow: number;
  life: number;
  age: number;
  colour: string;
  shape: number[];
  flutter: number;
}

const CONFETTI = ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#b197fc', '#ffa94d', '#f783ac'];
const MAX = 220;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let parts: P[] = [];
let running = false;
let last = 0;
let scale = 1;

function ensure() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.className = 'fx-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '60' });
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  const fit = () => {
    scale = Math.min(2, window.devicePixelRatio || 1);
    canvas!.width = Math.round(window.innerWidth * scale);
    canvas!.height = Math.round(window.innerHeight * scale);
  };
  fit();
  window.addEventListener('resize', fit);
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

let density = 1;
/** Fewer particles (Less motion) */
export function setParticleDensity(d: number) {
  density = d;
}

function add(p: Partial<P> & { x: number; y: number }) {
  if (parts.length >= MAX) parts.shift();
  parts.push({
    kind: 'confetti',
    vx: 0,
    vy: 0,
    g: 0,
    drag: 0,
    rot: 0,
    vr: 0,
    size: 8,
    grow: 0,
    life: 1,
    age: 0,
    colour: '#fff',
    shape: [],
    flutter: 0,
    ...p,
  });
}

function throwSpeed(o: BurstOptions, min: number, max: number) {
  const base = o.angle === undefined ? rand(0, Math.PI * 2) : ((o.angle + rand(-0.5, 0.5) * (o.spread ?? 360)) * Math.PI) / 180;
  const sp = rand(min, max) * (o.power ?? 1);
  return [Math.cos(base) * sp, Math.sin(base) * sp];
}

export function burst(x: number, y: number, kind: BurstKind, o: BurstOptions = {}) {
  ensure();
  const defaults: Record<BurstKind, number> = { confetti: 36, shards: 14, droplets: 16, dust: 10, stars: 8, sparkles: 8, crumbs: 8, stink: 7, hearts: 6 };
  const n = Math.max(1, Math.round((o.count ?? defaults[kind]) * density));
  for (let i = 0; i < n; i++) {
    switch (kind) {
      case 'confetti': {
        const [vx, vy] = throwSpeed({ angle: -90, spread: 120, ...o }, 350, 900);
        add({ kind, x, y, vx, vy, g: 1300, drag: 2.2, rot: rand(0, 6), vr: rand(-12, 12), size: rand(7, 12), life: rand(1.6, 2.6), colour: pick(CONFETTI), flutter: rand(0, 6) });
        break;
      }
      case 'shards': {
        const [vx, vy] = throwSpeed(o, 300, 750);
        const s = rand(10, 20);
        add({
          kind,
          x,
          y,
          vx,
          vy,
          g: 1200,
          drag: 2.5,
          rot: rand(0, 6),
          vr: rand(-18, 18),
          size: s,
          life: rand(0.6, 1),
          colour: o.colour ?? '#ff6b6b',
          shape: [rand(-1, -0.3), rand(-1, -0.2), rand(0.4, 1), rand(-0.6, 0.2), rand(-0.4, 0.5), rand(0.4, 1)],
        });
        break;
      }
      case 'droplets': {
        const [vx, vy] = throwSpeed({ angle: -90, spread: 150, ...o }, 250, 650);
        add({ kind, x, y, vx, vy, g: 1500, drag: 0.8, size: rand(5, 11), life: rand(0.7, 1.2), colour: o.colour ?? '#4dabf7' });
        break;
      }
      case 'dust': {
        const [vx, vy] = throwSpeed({ angle: -90, spread: 200, ...o }, 60, 200);
        add({ kind, x: x + rand(-14, 14), y, vx, vy: vy * 0.5, g: -40, drag: 3, size: rand(6, 12), grow: rand(14, 26), life: rand(0.5, 0.8), colour: o.colour ?? '#e9dcc9' });
        break;
      }
      case 'stars': {
        const [vx, vy] = throwSpeed(o, 200, 520);
        add({ kind, x, y, vx, vy, g: 500, drag: 2.5, rot: rand(0, 6), vr: rand(-6, 6), size: rand(10, 18), life: rand(0.7, 1.1), colour: pick(['#ffd43b', '#ffe066', '#fff3bf', '#ffa94d']) });
        break;
      }
      case 'sparkles': {
        add({ kind, x: x + rand(-50, 50) * (o.power ?? 1), y: y + rand(-50, 50) * (o.power ?? 1), size: rand(8, 16), life: rand(0.5, 0.9), age: -rand(0, 0.25), colour: o.colour ?? '#fff' });
        break;
      }
      case 'crumbs': {
        const [vx, vy] = throwSpeed({ angle: 90, spread: 100, ...o }, 60, 260);
        add({ kind, x, y, vx, vy, g: 1400, drag: 1, rot: rand(0, 6), vr: rand(-10, 10), size: rand(4, 8), life: rand(0.6, 1), colour: o.colour ?? '#d9a066' });
        break;
      }
      case 'stink': {
        add({ kind, x: x + rand(-30, 30), y: y + rand(-10, 10), vx: rand(-40, 40), vy: rand(-90, -40), drag: 0.6, size: rand(16, 26), grow: rand(18, 30), life: rand(1.2, 1.8), colour: pick(['#a9e34b', '#8ce99a', '#c0eb75']) });
        break;
      }
      case 'hearts': {
        const [vx, vy] = throwSpeed({ angle: -90, spread: 90, ...o }, 120, 320);
        add({ kind, x, y, vx, vy, g: -60, drag: 1.5, vr: rand(-2, 2), size: rand(12, 20), life: rand(0.9, 1.4), colour: pick(['#ff6b6b', '#f783ac', '#ff8787']) });
        break;
      }
    }
  }
  start();
}

/** A quick expanding ring (shockwave) */
export function ring(x: number, y: number, colour = '#fff', size = 1) {
  ensure();
  add({ kind: 'ring', x, y, size: 10 * size, grow: 260 * size, life: 0.32, colour });
  start();
}

/** Confetti falling from the top of the screen (celebrations) */
export function rain(count = 60) {
  ensure();
  const n = Math.round(count * density);
  for (let i = 0; i < n; i++) {
    add({
      kind: 'confetti',
      x: rand(0, window.innerWidth),
      y: rand(-200, -10),
      vx: rand(-40, 40),
      vy: rand(80, 260),
      g: 260,
      drag: 0.4,
      rot: rand(0, 6),
      vr: rand(-8, 8),
      size: rand(7, 12),
      life: rand(2.6, 3.6),
      colour: pick(CONFETTI),
      flutter: rand(2, 6),
    });
  }
  start();
}

function start() {
  if (running) return;
  running = true;
  last = performance.now();
  requestAnimationFrame(frame);
}

function star(c: CanvasRenderingContext2D, r: number) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  c.closePath();
}

function heart(c: CanvasRenderingContext2D, r: number) {
  c.beginPath();
  c.moveTo(0, r * 0.9);
  c.bezierCurveTo(-r * 1.4, -r * 0.1, -r * 0.6, -r * 1.2, 0, -r * 0.4);
  c.bezierCurveTo(r * 0.6, -r * 1.2, r * 1.4, -r * 0.1, 0, r * 0.9);
  c.closePath();
}

function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const c = ctx!;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, canvas!.width, canvas!.height);
  c.setTransform(scale, 0, 0, scale, 0, 0);

  parts = parts.filter((p) => p.age < p.life);
  for (const p of parts) {
    p.age += dt;
    if (p.age < 0) continue;
    const k = Math.exp(-p.drag * dt);
    p.vx *= k;
    p.vy = p.vy * k + p.g * dt;
    p.x += p.vx * dt + (p.flutter ? Math.sin(p.age * p.flutter * 2) * 30 * dt : 0);
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    p.size += p.grow * dt;
    const t = p.age / p.life;
    const fade = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;

    c.save();
    c.globalAlpha = Math.max(0, fade);
    c.translate(p.x, p.y);
    c.rotate(p.rot);
    c.fillStyle = p.colour;
    switch (p.kind) {
      case 'confetti':
        c.scale(1, Math.cos(p.age * 9 + p.flutter));
        c.fillRect(-p.size / 2, -p.size * 0.35, p.size, p.size * 0.7);
        break;
      case 'shards': {
        const s = p.shape;
        c.beginPath();
        c.moveTo(s[0] * p.size, s[1] * p.size);
        c.lineTo(s[2] * p.size, s[3] * p.size);
        c.lineTo(s[4] * p.size, s[5] * p.size);
        c.closePath();
        c.fill();
        c.strokeStyle = 'rgba(0,0,0,0.18)';
        c.lineWidth = 1.5;
        c.stroke();
        break;
      }
      case 'droplets': {
        const sp = Math.hypot(p.vx, p.vy);
        c.rotate(Math.atan2(p.vy, p.vx) - p.rot);
        c.beginPath();
        c.ellipse(0, 0, p.size * (1 + Math.min(sp, 900) / 900), p.size * 0.8, 0, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = 'rgba(255,255,255,0.5)';
        c.beginPath();
        c.arc(-p.size * 0.2, -p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
        c.fill();
        break;
      }
      case 'dust':
      case 'stink':
        c.globalAlpha = Math.max(0, fade) * (p.kind === 'dust' ? 0.7 : 0.6);
        c.beginPath();
        c.arc(0, 0, p.size, 0, Math.PI * 2);
        c.fill();
        break;
      case 'stars':
        star(c, p.size);
        c.fill();
        c.strokeStyle = '#f08c00';
        c.lineWidth = 2;
        c.lineJoin = 'round';
        c.stroke();
        break;
      case 'sparkles': {
        const s = p.size * Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
        c.beginPath();
        c.moveTo(0, -s);
        c.quadraticCurveTo(0, 0, s, 0);
        c.quadraticCurveTo(0, 0, 0, s);
        c.quadraticCurveTo(0, 0, -s, 0);
        c.quadraticCurveTo(0, 0, 0, -s);
        c.fill();
        break;
      }
      case 'crumbs':
        c.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.8);
        break;
      case 'hearts':
        heart(c, p.size);
        c.fill();
        break;
      case 'ring':
        c.globalAlpha = 1 - t;
        c.strokeStyle = p.colour;
        c.lineWidth = 10 * (1 - t) + 1;
        c.beginPath();
        c.arc(0, 0, p.size, 0, Math.PI * 2);
        c.stroke();
        break;
    }
    c.restore();
  }

  if (parts.length) requestAnimationFrame(frame);
  else {
    running = false;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, canvas!.width, canvas!.height);
  }
}

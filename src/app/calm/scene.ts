/**
 * The moving background of each calm theme, on one canvas:
 *   stars      twinkling stars, now and then a shooting star, dark hills
 *   leaves     autumn leaves drifting down and turning
 *   ocean      bubbles rising, little fish drifting, seaweed swaying
 *   rain       soft rain falling, ripples in the puddle
 *   fireflies  glowing fireflies wandering over the grass at dusk
 * Everything moves slowly. `breath` (0–1) gently brightens things on the in-breath.
 */
import type { AmbientTheme } from '../../shared/audio/ambient';

type P = Record<string, number>;

export interface Scene {
  frame: (t: number, dt: number, breath: number) => void;
  resize: () => void;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function makeScene(canvas: HTMLCanvasElement, theme: AmbientTheme, calm: boolean): Scene {
  const ctx = canvas.getContext('2d')!;
  let W = 0;
  let H = 0;
  let scale = 1;
  const amount = calm ? 0.5 : 1;
  let parts: P[] = [];

  const resize = () => {
    scale = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * scale);
    canvas.height = Math.round(H * scale);
    seed();
  };

  const seed = () => {
    const area = (W * H) / (390 * 844);
    const n = (k: number) => Math.max(6, Math.round(k * amount * Math.min(2, Math.max(0.6, area))));
    switch (theme) {
      case 'stars':
        parts = Array.from({ length: n(150) }, () => ({ x: rand(0, W), y: rand(0, H * 0.85), r: rand(0.6, 2.2), ph: rand(0, 6.3), sp: rand(0.4, 1.4) }));
        break;
      case 'leaves':
        parts = Array.from({ length: n(22) }, () => leaf(true));
        break;
      case 'ocean':
        parts = [
          ...Array.from({ length: n(34) }, () => ({ kind: 0, x: rand(0, W), y: rand(0, H), r: rand(3, 11), sp: rand(14, 34), ph: rand(0, 6.3) })),
          ...Array.from({ length: 4 }, (_, i) => ({ kind: 1, x: rand(0, W), y: H * (0.25 + i * 0.15), sp: rand(10, 22) * (i % 2 ? -1 : 1), s: rand(0.7, 1.2), hue: i })),
        ];
        break;
      case 'rain':
        parts = [
          ...Array.from({ length: n(120) }, () => ({ kind: 0, x: rand(0, W), y: rand(-H, H), len: rand(10, 22), sp: rand(260, 420) })),
        ];
        break;
      case 'fireflies':
        parts = Array.from({ length: n(30) }, () => ({ x: rand(0, W), y: rand(H * 0.25, H * 0.9), ax: rand(0, 6.3), ay: rand(0, 6.3), fx: rand(0.05, 0.15), fy: rand(0.05, 0.12), ph: rand(0, 6.3), r: rand(2.5, 4.5) }));
        break;
    }
  };

  const LEAF_COLOURS = ['#e8590c', '#f08c00', '#fab005', '#c92a2a', '#a9744f', '#d9480f'];
  const leaf = (anywhere: boolean): P => ({
    x: rand(-20, W + 20),
    y: anywhere ? rand(-H, H) : rand(-80, -20),
    s: rand(12, 24),
    rot: rand(0, 6.3),
    vr: rand(-0.8, 0.8),
    sp: rand(18, 38),
    sw: rand(20, 50),
    ph: rand(0, 6.3),
    c: Math.floor(rand(0, LEAF_COLOURS.length)),
  });

  const ripples: P[] = [];
  let shooting: P | null = null;
  let nextShooting = 4;

  const hills = (colour: string, base: number, amp: number, phase: number) => {
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W + 20; x += 20) ctx.lineTo(x, H * base + Math.sin(x / (W * 0.35) + phase) * H * amp);
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  };

  const frame = (t: number, dt: number, breath: number) => {
    const k = calm ? 0.6 : 1;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, W, H);

    switch (theme) {
      case 'stars': {
        for (const s of parts) {
          const a = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph))) * (0.75 + 0.25 * breath);
          ctx.globalAlpha = a;
          ctx.fillStyle = '#fff9db';
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * (0.9 + 0.2 * breath), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        // A shooting star now and then
        nextShooting -= dt;
        if (!shooting && nextShooting <= 0) {
          shooting = { x: rand(W * 0.1, W * 0.8), y: rand(0, H * 0.3), age: 0 };
          nextShooting = rand(7, 14);
        }
        if (shooting) {
          shooting.age += dt;
          const p = shooting.age / 1.3;
          const x = shooting.x + p * W * 0.35;
          const y = shooting.y + p * H * 0.12;
          const g = ctx.createLinearGradient(x - 90, y - 30, x, y);
          g.addColorStop(0, 'rgba(255,249,219,0)');
          g.addColorStop(1, `rgba(255,249,219,${0.9 * (1 - p)})`);
          ctx.strokeStyle = g;
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x - 90, y - 30);
          ctx.lineTo(x, y);
          ctx.stroke();
          if (p >= 1) shooting = null;
        }
        hills('#14123a', 0.86, 0.025, 0.4);
        hills('#0d0b2a', 0.92, 0.02, 2.1);
        break;
      }
      case 'leaves': {
        hills('#f4a261', 0.8, 0.03, 1);
        hills('#e76f51', 0.88, 0.025, 2.6);
        for (const l of parts) {
          l.y += l.sp * dt * k;
          l.rot += l.vr * dt * k;
          const x = l.x + Math.sin(t * 0.6 * k + l.ph) * l.sw;
          if (l.y > H + 40) Object.assign(l, leaf(false));
          ctx.save();
          ctx.translate(x, l.y);
          ctx.rotate(l.rot + Math.sin(t + l.ph) * 0.4);
          ctx.fillStyle = LEAF_COLOURS[l.c];
          ctx.beginPath();
          ctx.moveTo(0, -l.s);
          ctx.bezierCurveTo(l.s * 0.7, -l.s * 0.5, l.s * 0.6, l.s * 0.5, 0, l.s);
          ctx.bezierCurveTo(-l.s * 0.6, l.s * 0.5, -l.s * 0.7, -l.s * 0.5, 0, -l.s);
          ctx.fill();
          ctx.strokeStyle = 'rgba(80,40,20,0.35)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -l.s * 0.8);
          ctx.lineTo(0, l.s * 1.25);
          ctx.stroke();
          ctx.restore();
        }
        break;
      }
      case 'ocean': {
        // light rays
        ctx.globalAlpha = 0.07 + 0.05 * breath;
        ctx.fillStyle = '#e3fafc';
        for (let i = 0; i < 5; i++) {
          const x = W * (0.1 + i * 0.2) + Math.sin(t * 0.2 + i) * 20;
          ctx.beginPath();
          ctx.moveTo(x - 20, 0);
          ctx.lineTo(x + 30, 0);
          ctx.lineTo(x + 140, H);
          ctx.lineTo(x + 40, H);
          ctx.closePath();
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        for (const p of parts) {
          if (p.kind === 0) {
            p.y -= p.sp * dt * k;
            if (p.y < -20) {
              p.y = H + 20;
              p.x = rand(0, W);
            }
            const x = p.x + Math.sin(t * 1.2 + p.ph) * 8;
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.beginPath();
            ctx.arc(x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.25, 0, Math.PI * 2);
            ctx.fill();
          } else {
            p.x += p.sp * dt * k;
            if (p.sp > 0 && p.x > W + 60) p.x = -60;
            if (p.sp < 0 && p.x < -60) p.x = W + 60;
            const y = p.y + Math.sin(t * 0.8 + p.hue) * 10;
            ctx.save();
            ctx.translate(p.x, y);
            ctx.scale(p.sp > 0 ? p.s : -p.s, p.s);
            ctx.fillStyle = ['#ffa94d', '#ffd43b', '#f783ac', '#63e6be'][p.hue % 4];
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.ellipse(0, 0, 22, 13, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-18, 0);
            ctx.lineTo(-34, -11 + Math.sin(t * 4 + p.hue) * 3);
            ctx.lineTo(-34, 11 + Math.sin(t * 4 + p.hue) * 3);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#2b2d42';
            ctx.beginPath();
            ctx.arc(11, -3, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.globalAlpha = 1;
          }
        }
        // seaweed and sand
        ctx.fillStyle = '#e9c46a';
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W + 20; x += 20) ctx.lineTo(x, H * 0.93 + Math.sin(x / 90) * 6);
        ctx.lineTo(W, H);
        ctx.fill();
        ctx.lineCap = 'round';
        for (let i = 0; i < 7; i++) {
          const x0 = (W / 7) * (i + 0.5);
          ctx.strokeStyle = i % 2 ? '#2b8a3e' : '#40c057';
          ctx.lineWidth = 9;
          ctx.beginPath();
          ctx.moveTo(x0, H * 0.95);
          for (let s = 1; s <= 6; s++) ctx.lineTo(x0 + Math.sin(t * 0.8 + s * 0.6 + i) * s * 3, H * 0.95 - s * H * 0.035);
          ctx.stroke();
        }
        break;
      }
      case 'rain': {
        ctx.strokeStyle = 'rgba(208,235,255,0.55)';
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        const ground = H * 0.9;
        for (const d of parts) {
          d.y += d.sp * dt * k;
          d.x += d.sp * 0.12 * dt * k;
          if (d.y > ground) {
            if (Math.random() < 0.25) ripples.push({ x: d.x, y: ground + rand(0, H * 0.08), age: 0 });
            d.y = rand(-60, -10);
            d.x = rand(-40, W);
          }
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - d.len * 0.12, d.y - d.len);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(52,58,64,0.35)';
        ctx.fillRect(0, ground, W, H - ground);
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.age += dt;
          if (r.age > 1) {
            ripples.splice(i, 1);
            continue;
          }
          ctx.strokeStyle = `rgba(208,235,255,${0.5 * (1 - r.age)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, 4 + r.age * 18, 1.5 + r.age * 5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (ripples.length > 80) ripples.splice(0, ripples.length - 80);
        break;
      }
      case 'fireflies': {
        // crescent moon
        ctx.fillStyle = 'rgba(255,249,219,0.9)';
        ctx.beginPath();
        ctx.arc(W * 0.82, H * 0.14, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3b2a6b';
        ctx.beginPath();
        ctx.arc(W * 0.82 + 11, H * 0.14 - 6, 24, 0, Math.PI * 2);
        ctx.fill();
        for (const f of parts) {
          const x = f.x + Math.sin(t * f.fx * 6 * k + f.ax) * 40 + Math.sin(t * f.fx * 2.3 + f.ay) * 30;
          const y = f.y + Math.cos(t * f.fy * 6 * k + f.ay) * 30;
          const glow = Math.max(0, Math.sin(t * 0.9 + f.ph)) * (0.7 + 0.3 * breath);
          const g = ctx.createRadialGradient(x, y, 0, x, y, f.r * 7);
          g.addColorStop(0, `rgba(216,245,162,${0.85 * glow})`);
          g.addColorStop(0.3, `rgba(192,235,117,${0.35 * glow})`);
          g.addColorStop(1, 'rgba(192,235,117,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, f.r * 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(244,252,200,${0.4 + 0.6 * glow})`;
          ctx.beginPath();
          ctx.arc(x, y, f.r * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
        // grass
        ctx.fillStyle = '#1b1340';
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 8) {
          const sway = Math.sin(t * 0.7 + x * 0.05) * 4;
          ctx.lineTo(x + sway, H * 0.86 - ((x * 37) % 23));
          ctx.lineTo(x + 4, H * 0.92);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
        break;
      }
    }
  };

  resize();
  return { frame, resize };
}

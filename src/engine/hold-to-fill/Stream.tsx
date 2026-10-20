import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { fx } from '../../shared/fx';
import { paintYFor } from './Bucket';

/**
 * The paint stream from the held pipe down to the paint in the bucket:
 * a wobbly ribbon whose width pulses, thinning as it falls, with little
 * splashes where it hits the surface. When she lets go, the tail falls in.
 * Drawn on its own SVG over the round; positions are read from the page
 * each frame so it always joins the pipe to the paint.
 */
export function Stream({
  rootRef,
  active,
  colour,
  level,
}: {
  rootRef: RefObject<HTMLElement | null>;
  active: boolean;
  colour: string;
  /** Current fill level (0–1), read every frame */
  level: () => number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const bodyRef = useRef<SVGPathElement>(null);
  const shineRef = useRef<SVGPathElement>(null);
  const state = useRef({ active, cut: 0, x: 0, top: 0, width: 0, colour, running: false, frame: 0 });
  state.current.active = active;
  state.current.colour = colour;

  useEffect(() => {
    const s = state.current;
    if (active) s.cut = 0;
    if (s.running || !active) return;
    s.running = true;
    let lastDrop = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const root = rootRef.current;
      const svg = svgRef.current;
      const body = bodyRef.current;
      if (!root || !svg || !body) {
        s.running = false;
        return;
      }
      const box = svg.getBoundingClientRect();
      const nozzle = root.querySelector('.fill-pipe--held .fill-pipe-nozzle');
      const bucket = root.querySelector('.bucket svg');
      if (nozzle) {
        const n = nozzle.getBoundingClientRect();
        s.x = n.left + n.width / 2 - box.left;
        s.top = n.bottom - box.top - 4;
        s.width = n.width * 0.5;
      }
      let bottom = s.top + 200;
      if (bucket) {
        const b = bucket.getBoundingClientRect();
        bottom = b.top + b.height * (paintYFor(Math.min(1, level())) / 210) - box.top + 4;
      }
      // Let go: the stream's tail drops into the bucket
      if (!s.active) s.cut = Math.min(1, s.cut + 0.09);
      const top = s.top + (bottom - s.top) * s.cut;
      const t = (now - start) / 1000;
      const len = Math.max(1, bottom - top);

      // Build the ribbon: wobble sideways, pulse in width, thinner as it falls
      const left: string[] = [];
      const right: string[] = [];
      const steps = 14;
      for (let i = 0; i <= steps; i++) {
        const f = i / steps;
        const y = top + len * f;
        const fall = (y - s.top) / Math.max(1, bottom - s.top);
        const w = s.width * (1 - fall * 0.38) * (1 + 0.16 * Math.sin(t * 14 - y * 0.06)) * (i === 0 && s.cut > 0 ? 0.5 : 1);
        const wob = Math.sin(t * 9 + y * 0.045) * 2.2 * fall;
        left.push(`${(s.x + wob - w / 2).toFixed(1)} ${y.toFixed(1)}`);
        right.unshift(`${(s.x + wob + w / 2).toFixed(1)} ${y.toFixed(1)}`);
      }
      const d = `M${left.join(' L')} L${right.join(' L')} Z`;
      body.setAttribute('d', d);
      body.setAttribute('fill', s.colour);
      shineRef.current?.setAttribute('d', `M${(s.x - s.width * 0.12).toFixed(1)} ${(top + 6).toFixed(1)} L${(s.x - s.width * 0.08).toFixed(1)} ${(bottom - 10).toFixed(1)}`);

      // Little splashes where it lands
      if (s.cut < 1 && now - lastDrop > 110) {
        lastDrop = now;
        fx.burst(box.left + s.x, box.top + bottom - 2, 'droplets', { colour: s.colour, count: 2, power: 0.42, angle: -90, spread: 150 });
      }

      if (!s.active && s.cut >= 1) {
        body.setAttribute('d', '');
        shineRef.current?.setAttribute('d', '');
        s.running = false;
        return;
      }
      s.frame = requestAnimationFrame(tick);
    };
    s.frame = requestAnimationFrame(tick);
    // The loop keeps going after she lets go until the tail has fallen in (no cleanup here)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    const s = state.current;
    return () => {
      cancelAnimationFrame(s.frame);
      s.running = false;
    };
  }, []);

  return (
    <svg ref={svgRef} className="fill-stream-svg" aria-hidden="true">
      <path ref={bodyRef} />
      <path ref={shineRef} stroke="#fff" strokeOpacity="0.4" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

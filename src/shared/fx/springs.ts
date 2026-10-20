/**
 * Spring easing. A damped spring is simulated once and sampled into a CSS
 * linear() curve, which gives real overshoot-and-settle in plain CSS and in the
 * Web Animations API. Browsers without linear() get a cubic-bezier fallback.
 */

export interface Spring {
  /** CSS easing string */
  easing: string;
  /** How long the spring takes to settle, in ms (use this as the duration) */
  duration: number;
}

const supportsLinear = typeof CSS !== 'undefined' && CSS.supports?.('animation-timing-function', 'linear(0, 0.5 30%, 1)');

function simulate(stiffness: number, damping: number, mass = 1): Spring {
  const dt = 1 / 240;
  let x = 0;
  let v = 0;
  const xs: number[] = [];
  let t = 0;
  let still = 0;
  while (t < 3) {
    const a = (-stiffness * (x - 1) - damping * v) / mass;
    v += a * dt;
    x += v * dt;
    xs.push(x);
    t += dt;
    if (Math.abs(x - 1) < 0.002 && Math.abs(v) < 0.02) {
      if (++still > 12) break;
    } else still = 0;
  }
  const duration = Math.round(t * 1000);
  if (!supportsLinear) return { easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', duration: Math.min(duration, 700) };
  const samples = 48;
  const points: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const v2 = xs[Math.min(xs.length - 1, Math.round((i / samples) * (xs.length - 1)))];
    points.push(i === samples ? '1' : v2.toFixed(3));
  }
  return { easing: `linear(${points.join(', ')})`, duration };
}

/** Lively: a clear overshoot and one or two small bounces */
export const bouncy = simulate(260, 14);
/** Gentle: a little overshoot, settles quickly */
export const soft = simulate(220, 22);
/** Wobbly jelly: for landing squash and big pops */
export const jelly = simulate(320, 9);

/** Make the springs available to CSS as var(--spring), var(--spring-soft), var(--spring-jelly) */
export function installSpringVars() {
  const root = document.documentElement.style;
  root.setProperty('--spring', bouncy.easing);
  root.setProperty('--spring-soft', soft.easing);
  root.setProperty('--spring-jelly', jelly.easing);
}

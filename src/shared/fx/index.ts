/**
 * Game feel ("juice") shared by every game: springy motion, screen shake,
 * particles, haptics. Everything here is fire-and-forget and safe to call
 * anywhere; with "Less motion" on, shakes are skipped and particles are fewer.
 *
 *   fx.burst(x, y, 'stars')       particles from a screen point
 *   fx.burstAt(el, 'confetti')    …from the middle of an element
 *   fx.shake(1)                   short decaying shake of the game screen
 *   fx.haptic('right')            a buzz on phones that can vibrate (see shared/haptics.ts)
 *   fx.jump(el) / fx.pop(el) / fx.squash(el) / fx.wobble(el) / fx.press(el)
 *
 * Animate transform and opacity only. Element animations use composite: 'add'
 * so they stack on top of whatever transform the element already has.
 */
import { progress } from '../progress/store';
import { sfx } from '../audio/sfx';
import { haptic, installTouchHaptics, shakeHaptic, type HapticKind } from '../haptics';
import { burst, rain, ring, setParticleDensity } from './particles';
import type { BurstKind, BurstOptions } from './particles';
import { bouncy, installSpringVars, jelly, soft } from './springs';
import './fx.css';

export type { BurstKind, BurstOptions };
export { bouncy, soft, jelly };

const systemPrefersLess = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Less motion: the grown-ups' setting, or the device's own setting if they haven't chosen */
export function lessMotion(): boolean {
  return progress.lessMotion() ?? systemPrefersLess();
}

/** Apply the motion setting (call at start-up and when it changes) */
export function applyMotionSetting() {
  const less = lessMotion();
  document.documentElement.toggleAttribute('data-less-motion', less);
  setParticleDensity(less ? 0.35 : 1);
}

export function initFx() {
  installSpringVars();
  installTouchHaptics();
  applyMotionSetting();
}

function animate(el: Element | null | undefined, frames: Keyframe[], opts: KeyframeAnimationOptions): Animation | null {
  if (!el || !(el as HTMLElement).animate) return null;
  try {
    return (el as HTMLElement).animate(frames, { composite: 'add', ...opts });
  } catch {
    try {
      return (el as HTMLElement).animate(frames, { ...opts, easing: 'ease-out' });
    } catch {
      return null;
    }
  }
}

const centre = (el: Element) => {
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2] as const;
};

export const fx = {
  burst,
  ring,
  rain,

  burstAt(el: Element | null | undefined, kind: BurstKind, o?: BurstOptions) {
    if (!el) return;
    const [x, y] = centre(el);
    burst(x, y, kind, o);
  },

  /** Short decaying shake of the whole game screen. 1 = a bump, 2 = a big splash. */
  shake(intensity = 1, el?: Element | null) {
    // Phones feel every shake (even with Less motion, which only stops the screen moving)
    shakeHaptic(intensity);
    if (lessMotion()) return;
    const target = el ?? document.querySelector('main.screen');
    const frames: Keyframe[] = [];
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
      const k = (1 - i / steps) ** 2 * 7 * intensity;
      const x = i === steps ? 0 : (Math.random() * 2 - 1) * k;
      const y = i === steps ? 0 : (Math.random() * 2 - 1) * k;
      const r = i === steps ? 0 : (Math.random() * 2 - 1) * k * 0.12;
      frames.push({ transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${r.toFixed(2)}deg)` });
    }
    animate(target, frames, { duration: 260 + 90 * intensity, easing: 'linear' });
  },

  /** A tiny buzz (Android phones; does nothing elsewhere) */
  haptic(kind: HapticKind | number | number[] = 'tap') {
    haptic(kind);
  },

  /** Springs in from nothing, with overshoot */
  pop(el: Element | null | undefined, delay = 0) {
    animate(
      el,
      [
        { transform: 'scale(0)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 },
      ],
      { duration: bouncy.duration, easing: bouncy.easing, delay, fill: 'backwards' },
    );
  },

  /** A happy jump: crouch, leap, squash on landing, settle */
  jump(el: Element | null | undefined, height = 36) {
    const h = lessMotion() ? height * 0.4 : height;
    animate(
      el,
      [
        { transform: 'translateY(0) scale(1, 1)' },
        { transform: 'translateY(0) scale(1.12, 0.86)', offset: 0.14, easing: 'cubic-bezier(.2,.7,.3,1)' },
        { transform: `translateY(${-h}px) scale(0.92, 1.1)`, offset: 0.48, easing: 'cubic-bezier(.6,0,.9,.5)' },
        { transform: 'translateY(0) scale(1.16, 0.84)', offset: 0.76 },
        { transform: 'translateY(0) scale(0.96, 1.04)', offset: 0.88 },
        { transform: 'translateY(0) scale(1, 1)' },
      ],
      { duration: 640, easing: 'linear' },
    );
  },

  /** Lands with a squash and a wobbly settle */
  squash(el: Element | null | undefined, amount = 1) {
    const a = 0.16 * amount;
    animate(
      el,
      [
        { transform: `scale(${1 + a}, ${1 - a})` },
        { transform: 'scale(1, 1)' },
      ],
      { duration: jelly.duration, easing: jelly.easing },
    );
  },

  /** Gentle "not that one" wobble: bouncy, never harsh */
  wobble(el: Element | null | undefined) {
    animate(
      el,
      [
        { transform: 'rotate(0) translateX(0)' },
        { transform: 'rotate(-7deg) translateX(-4px)', offset: 0.18 },
        { transform: 'rotate(6deg) translateX(4px)', offset: 0.4 },
        { transform: 'rotate(-3.5deg) translateX(-2px)', offset: 0.62 },
        { transform: 'rotate(1.5deg)', offset: 0.82 },
        { transform: 'rotate(0) translateX(0)' },
      ],
      { duration: 620, easing: 'ease-out' },
    );
  },

  /** Pressed-in squash on tap, springing back */
  press(el: Element | null | undefined) {
    animate(
      el,
      [
        { transform: 'scale(0.9, 0.84)' },
        { transform: 'scale(1, 1)' },
      ],
      { duration: soft.duration, easing: soft.easing },
    );
  },

  /** A right answer: the thing jumps, stars and sparkles burst out, a twinkle and a buzz */
  yay(el: Element | null | undefined, opts: { stars?: number; jump?: number; sound?: boolean } = {}) {
    if (!el) return;
    fx.jump(el, opts.jump ?? 30);
    fx.burstAt(el, 'stars', { count: opts.stars ?? 8 });
    fx.burstAt(el, 'sparkles', { count: 6, power: 1.2 });
    if (opts.sound !== false) sfx.sparkle();
    fx.haptic('right');
  },

  /** Little shove away from a point (neighbours of a pop) */
  nudge(el: Element | null | undefined, fromX: number, fromY: number, strength = 18) {
    if (!el) return;
    const [x, y] = centre(el);
    const d = Math.hypot(x - fromX, y - fromY) || 1;
    const k = Math.max(0, 1 - d / 320) * strength;
    if (k < 1) return;
    const dx = ((x - fromX) / d) * k;
    const dy = ((y - fromY) / d) * k;
    animate(
      el,
      [
        { transform: 'translate(0, 0) rotate(0)' },
        { transform: `translate(${dx}px, ${dy}px) rotate(${(dx / 3).toFixed(1)}deg)`, offset: 0.25 },
        { transform: 'translate(0, 0) rotate(0)' },
      ],
      { duration: 700, easing: 'cubic-bezier(.2,.8,.3,1)' },
    );
  },
};

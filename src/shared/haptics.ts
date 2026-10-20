/**
 * Vibration feedback ("haptics") on phones that can vibrate.
 *
 * Every touch on something she can press gives a tiny tick, and each kind of
 * moment has its own feel, so she can feel what happened:
 *   tap      a tiny tick (any button, card, balloon, paint pot, piece…)
 *   pop      a crisp tap (popping, picking, matching)
 *   right    two happy taps (a right answer)
 *   oops     a soft, short double (a gentle "not that one", never harsh)
 *   win      a little drum roll (a round or level finished)
 *   thud     one solid bump (landing, stomping, a sticker slapping down)
 *   shake    a buzz as long as the screen shake is strong
 *   count    a short pulse on each count in the exercises
 *   texture  very light (pouring paint, xylophone notes)
 *
 * Works through navigator.vibrate (Android phones and tablets). iPhones don't
 * support it in the browser; on iOS 18+ a single tick is made with a hidden
 * switch (the same click iPhone settings switches make), for taps only.
 * Grown-ups can turn vibration off (Grown-ups → Vibration).
 */

export type HapticKind = 'tap' | 'pop' | 'right' | 'oops' | 'win' | 'big-win' | 'thud' | 'count' | 'texture' | 'silly' | 'splash';

const PATTERNS: Record<HapticKind, number | number[]> = {
  tap: 8,
  pop: 16,
  right: [16, 50, 22],
  oops: [10, 60, 10],
  win: [14, 40, 14, 40, 30],
  'big-win': [20, 50, 20, 50, 20, 50, 60],
  thud: 28,
  count: 14,
  texture: 5,
  silly: [25, 25, 25, 25, 40],
  splash: [40, 30, 20],
};

let enabled = true;
/** Grown-ups' setting (App applies it at start and when it changes) */
export function setHapticsEnabled(on: boolean) {
  enabled = on;
}

const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
const isIOS = typeof navigator !== 'undefined' && /iP(hone|ad|od)/.test(navigator.userAgent);

// iOS 18+: clicking a <input type="checkbox" switch> makes a light haptic tick
let iosSwitch: HTMLLabelElement | null = null;
function iosTick() {
  try {
    if (!iosSwitch) {
      iosSwitch = document.createElement('label');
      iosSwitch.setAttribute('aria-hidden', 'true');
      Object.assign(iosSwitch.style, { position: 'fixed', left: '-100px', top: '0', width: '1px', height: '1px', overflow: 'hidden', opacity: '0' });
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      input.tabIndex = -1;
      iosSwitch.appendChild(input);
      document.body.appendChild(iosSwitch);
    }
    iosSwitch.click();
  } catch {
    /* not supported */
  }
}

let lastAt = 0;
let lastWeight = 0;

/** Vibrate: a kind of moment, or a pattern in milliseconds */
export function haptic(kind: HapticKind | number | number[] = 'tap') {
  if (!enabled) return;
  const pattern = typeof kind === 'string' ? PATTERNS[kind] : kind;
  const weight = (Array.isArray(pattern) ? pattern.reduce((a, b) => a + b, 0) : pattern) || 0;
  // A tiny tick straight after something bigger shouldn't cut the bigger one short
  const now = performance.now();
  if (weight < lastWeight && now - lastAt < lastWeight) return;
  lastAt = now;
  lastWeight = weight;
  if (canVibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* not allowed yet (needs a first tap) */
    }
  } else if (isIOS && (kind === 'tap' || kind === 'pop' || kind === 'right' || kind === 'count')) {
    iosTick();
  }
}

/** A buzz for a screen shake: stronger shake, longer buzz */
export function shakeHaptic(intensity: number) {
  haptic(Math.round(18 + 22 * Math.min(2, intensity)));
}

/** Things she can press: buttons, cards, balloons, pieces, paint areas… (anything with a pointer or grab cursor) */
function isPressable(target: EventTarget | null): boolean {
  let el = target instanceof Element ? target : null;
  for (let i = 0; el && i < 6; i++, el = el.parentElement) {
    if (el.closest('.parent')) return false; // not in the grown-ups area
    if (el.matches('button, [role="button"], a, input, select, label')) return true;
    const cursor = getComputedStyle(el).cursor;
    if (cursor === 'pointer' || cursor === 'grab' || cursor === 'grabbing') return true;
  }
  return false;
}

/** Every touch on something pressable gives a tiny tick */
export function installTouchHaptics() {
  document.addEventListener(
    'pointerdown',
    (e) => {
      if (isPressable(e.target)) haptic('tap');
    },
    { capture: true, passive: true },
  );
}

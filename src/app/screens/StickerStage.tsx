import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx, lessMotion } from '../../shared/fx';
import { TROPHY, today, type StickerWhy } from '../../shared/progress/store';
import type { ClipId } from '../../types/learning';
import { findSection } from '../registry';
import { stickerInfo, type StickerAction } from '../stickers';

/** "You got this one today, in Numbers, for finishing Pop the balloons!" */
function whyClips(emoji: string, why?: StickerWhy): ClipId[] {
  if (emoji === TROPHY) return [why?.date === today() ? 'sticker.why.trophy-today' : 'sticker.why.trophy'];
  const section = why?.sectionId ? findSection(why.sectionId) : undefined;
  const game = section?.games.find((g) => g.id === why?.gameId);
  if (!why || !section || !game) return ['sticker.why.unknown'];
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
  const when = why.date === today() ? 'sticker.when.today' : why.date === yesterday ? 'sticker.when.yesterday' : 'sticker.when.before';
  return [when, 'sticker.why.in', section.titleClip, 'sticker.why.for', game.titleClip];
}

/** Pictures of where she got it, for a child who can't read yet: the section tile and the game */
function WhyCard({ emoji, why }: { emoji: string; why?: StickerWhy }) {
  if (emoji === TROPHY || why?.today) {
    return (
      <div className="sticker-why" aria-hidden="true">
        <span className="sticker-why-tile" style={{ background: '#fab005' }}>☀️</span>
      </div>
    );
  }
  const section = why?.sectionId ? findSection(why.sectionId) : undefined;
  const game = section?.games.find((g) => g.id === why?.gameId);
  if (!section || !game) return null;
  return (
    <div className="sticker-why" aria-hidden="true">
      <span className="sticker-why-tile" style={{ background: section.colour }}>{section.icon}</span>
      <span className="sticker-why-arrow">→</span>
      <span className="sticker-why-tile sticker-why-tile--game">{game.icon}</span>
    </div>
  );
}

/**
 * A sticker from the book, big in the middle of the screen, doing its thing:
 * the puppy hops and says woof, the rocket blasts off, the cupcake gets eaten.
 * Tap the sticker to see it again; tap anywhere else to put it back in the book.
 */
export function StickerStage({ emoji, from, why, onClose }: { emoji: string; from: DOMRect | null; why?: StickerWhy; onClose: () => void }) {
  const flyRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const closing = useRef(false);
  const info = stickerInfo(emoji);

  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  /** Where the sticker sits in the book, relative to its big spot on stage */
  const offset = useCallback(() => {
    const el = flyRef.current;
    if (!el || !from) return null;
    const r = el.getBoundingClientRect();
    return {
      dx: from.left + from.width / 2 - (r.left + r.width / 2),
      dy: from.top + from.height / 2 - (r.top + r.height / 2),
      s: Math.max(0.08, from.height / r.height),
    };
  }, [from]);

  const play = useCallback(() => {
    const actor = actorRef.current;
    if (!actor) return;
    clearTimers();
    actor.getAnimations().forEach((a) => a.cancel());
    void narrator.say([`sticker.do.${info.key}`, ...whyClips(emoji, why)]);
    perform(info.action, actor, (fn, ms) => timers.current.push(window.setTimeout(fn, ms)));
  }, [info, emoji, why]);

  // Fly out of the book to the middle, then do its thing
  useLayoutEffect(() => {
    const o = offset();
    sfx.whoosh();
    const anim = flyRef.current?.animate(
      [
        { transform: o ? `translate(${o.dx}px, ${o.dy}px) scale(${o.s})` : 'scale(0)' },
        { transform: 'translate(0, 0) scale(1)' },
      ],
      { duration: 520, easing: 'cubic-bezier(.3,1.35,.5,1)' },
    );
    if (anim) anim.onfinish = play;
    else play();
  }, [offset, play]);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    clearTimers();
    narrator.stop();
    actorRef.current?.getAnimations().forEach((a) => a.cancel());
    const o = offset();
    sfx.whoosh(false);
    const anim = flyRef.current?.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: o ? `translate(${o.dx}px, ${o.dy}px) scale(${o.s})` : 'scale(0)', opacity: o ? 1 : 0 },
      ],
      { duration: 380, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' },
    );
    if (anim) anim.onfinish = onClose;
    else onClose();
  };

  return (
    <div className="sticker-stage" onClick={close} role="dialog" aria-label="Sticker">
      <div className="sticker-stage-fly" ref={flyRef}>
        <div
          className="sticker-stage-actor"
          ref={actorRef}
          onClick={(e) => {
            e.stopPropagation();
            if (!closing.current) play();
          }}
          aria-label="Do it again"
        >
          {emoji}
        </div>
      </div>
      <WhyCard emoji={emoji} why={why} />
    </div>
  );
}

type Later = (fn: () => void, ms: number) => void;

/** The moves. Distances in vw/vh so they suit any screen. */
function perform(action: StickerAction, el: HTMLElement, later: Later) {
  const calm = lessMotion();
  const at = (sel: 'centre' | 'feet' | 'top') => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: sel === 'feet' ? r.bottom - r.height * 0.1 : sel === 'top' ? r.top + r.height * 0.15 : r.top + r.height / 2 };
  };
  const anim = (frames: Keyframe[], duration: number, easing = 'ease-in-out', origin = '50% 50%') => {
    el.style.transformOrigin = origin;
    el.animate(frames, { duration: calm ? duration * 1.3 : duration, easing });
  };
  const sparkles = (n = 8) => fx.burstAt(el, 'sparkles', { count: n, power: 2.2 });

  switch (action) {
    case 'hop': {
      const hop = (o: number) => [
        { transform: 'translateY(0) scale(1.15, 0.85)', offset: o },
        { transform: 'translateY(-16vh) scale(0.92, 1.1)', offset: o + 0.14 },
        { transform: 'translateY(0) scale(1.18, 0.82)', offset: o + 0.28 },
      ];
      anim([{ transform: 'none' }, ...hop(0.04), ...hop(0.34), ...hop(0.64), { transform: 'none' }], 1700, 'linear', '50% 100%');
      [0.32, 0.62, 0.92].forEach((t) =>
        later(() => {
          sfx.tap();
          const p = at('feet');
          fx.burst(p.x, p.y, 'dust', { count: 5 });
        }, t * 1700),
      );
      break;
    }
    case 'gallop': {
      anim(
        [
          { transform: 'translate(0, 0) rotate(0)' },
          { transform: 'translate(14vw, -6vh) rotate(-8deg)', offset: 0.15 },
          { transform: 'translate(26vw, 0) rotate(4deg)', offset: 0.3 },
          { transform: 'translate(12vw, -6vh) scaleX(-1) rotate(-8deg)', offset: 0.45 },
          { transform: 'translate(-12vw, 0) scaleX(-1) rotate(4deg)', offset: 0.6 },
          { transform: 'translate(-26vw, -6vh) scaleX(-1) rotate(-8deg)', offset: 0.72 },
          { transform: 'translate(-12vw, 0) rotate(4deg)', offset: 0.86 },
          { transform: 'translate(0, 0) rotate(0)' },
        ],
        2400,
      );
      for (let t = 0; t < 2400; t += 220) later(() => sparkles(3), t);
      later(() => sfx.sparkle(), 300);
      break;
    }
    case 'wiggle':
      anim(
        [
          { transform: 'rotate(0) scale(1)' },
          { transform: 'rotate(-14deg) scale(1.08, 0.94)', offset: 0.15 },
          { transform: 'rotate(12deg) scale(0.96, 1.06)', offset: 0.35 },
          { transform: 'rotate(-10deg) scale(1.06, 0.95)', offset: 0.55 },
          { transform: 'rotate(6deg)', offset: 0.75 },
          { transform: 'rotate(0) scale(1)' },
        ],
        1300,
      );
      later(() => fx.burstAt(el, 'hearts', { count: 6 }), 350);
      later(() => sfx.sparkle(), 350);
      break;
    case 'roll':
      anim(
        [
          { transform: 'translateX(0) rotate(0)' },
          { transform: 'translateX(22vw) rotate(360deg)', offset: 0.45 },
          { transform: 'translateX(-6vw) rotate(-60deg)', offset: 0.8 },
          { transform: 'translateX(0) rotate(0)' },
        ],
        2000,
      );
      later(() => sfx.whoosh(), 0);
      later(() => fx.burstAt(el, 'stars', { count: 6 }), 900);
      break;
    case 'roar':
      anim(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(0.86, 0.8) translateY(4%)', offset: 0.2 },
          { transform: 'scale(1.45) rotate(-4deg)', offset: 0.32 },
          { transform: 'scale(1.42) rotate(4deg)', offset: 0.4 },
          { transform: 'scale(1.45) rotate(-3deg)', offset: 0.48 },
          { transform: 'scale(1.4) rotate(2deg)', offset: 0.6 },
          { transform: 'scale(1)' },
        ],
        1800,
        'ease-out',
      );
      later(() => {
        sfx.thud();
        fx.shake(1.4);
        fx.haptic(40);
        const p = at('centre');
        fx.ring(p.x, p.y, '#fff', 3);
      }, 1800 * 0.3);
      break;
    case 'stomp': {
      const step = (o: number, dir: number) => [
        { transform: `translateY(-8vh) rotate(${dir * 10}deg)`, offset: o },
        { transform: 'translateY(0) rotate(0) scale(1.14, 0.86)', offset: o + 0.12 },
        { transform: 'translateY(0) scale(1)', offset: o + 0.22 },
      ];
      anim([{ transform: 'none' }, ...step(0.12, -1), ...step(0.46, 1), { transform: 'none' }], 1900, 'ease-in', '50% 100%');
      [0.24, 0.58].forEach((t) =>
        later(() => {
          sfx.thud();
          fx.shake(1.2);
          fx.haptic(30);
          const p = at('feet');
          fx.burst(p.x, p.y, 'dust', { count: 12, power: 1.6 });
        }, t * 1900),
      );
      break;
    }
    case 'swing':
      anim(
        [
          { transform: 'rotate(0)' },
          { transform: 'rotate(32deg)', offset: 0.2 },
          { transform: 'rotate(-26deg)', offset: 0.42 },
          { transform: 'rotate(18deg)', offset: 0.62 },
          { transform: 'rotate(-9deg)', offset: 0.8 },
          { transform: 'rotate(0)' },
        ],
        2000,
        'ease-in-out',
        '50% -20%',
      );
      later(() => fx.burstAt(el, 'stars', { count: 5 }), 400);
      break;
    case 'waddle': {
      const frames: Keyframe[] = [];
      for (let i = 0; i <= 8; i++) {
        const x = i <= 4 ? i * 4 : (8 - i) * 4;
        frames.push({ transform: `translateX(${x}vw) rotate(${i % 2 ? 10 : -10}deg)${i > 4 ? ' scaleX(-1)' : ''}` });
      }
      frames[8] = { transform: 'none' };
      anim(frames, 2200, 'linear', '50% 100%');
      for (let i = 1; i <= 8; i++) later(() => sfx.tap(), i * 270);
      break;
    }
    case 'fly':
      anim(
        [
          { transform: 'translate(0, 0) rotate(0)' },
          { transform: 'translate(22vw, -18vh) rotate(14deg)', offset: 0.25 },
          { transform: 'translate(0, -26vh) rotate(0)', offset: 0.45 },
          { transform: 'translate(-22vw, -14vh) rotate(-14deg)', offset: 0.68 },
          { transform: 'translate(-8vw, 4vh) rotate(-6deg)', offset: 0.86 },
          { transform: 'translate(0, 0) rotate(0)' },
        ],
        2400,
        'ease-in-out',
      );
      for (let t = 200; t < 2300; t += 260) later(() => sparkles(2), t);
      later(() => sfx.whoosh(), 100);
      later(() => sfx.whoosh(false), 1400);
      break;
    case 'buzz': {
      const frames: Keyframe[] = [];
      for (let i = 0; i <= 14; i++) {
        const x = Math.sin(i * 1.3) * 22;
        const y = Math.cos(i * 2.1) * 12 - (i > 0 && i < 14 ? 6 : 0);
        frames.push({ transform: i === 14 ? 'none' : `translate(${x.toFixed(1)}vw, ${y.toFixed(1)}vh) rotate(${(Math.cos(i * 1.3) * 20).toFixed(0)}deg)` });
      }
      anim(frames, 2000, 'ease-in-out');
      later(() => sfx.buzz(1.8), 0);
      break;
    }
    case 'crawl': {
      const frames: Keyframe[] = [];
      for (let i = 0; i <= 10; i++) {
        const x = i <= 5 ? i * 4 : (10 - i) * 4;
        frames.push({ transform: `translate(${x}vw, ${i % 2 ? -1 : 0}vh)${i > 5 ? ' scaleX(-1)' : ''}` });
      }
      frames[10] = { transform: 'none' };
      anim(frames, 2600, 'linear', '50% 100%');
      break;
    }
    case 'swim': {
      const frames: Keyframe[] = [];
      for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        const x = Math.sin(t * Math.PI * 2) * 26;
        const y = Math.sin(t * Math.PI * 4) * 6;
        frames.push({ transform: `translate(${x.toFixed(1)}vw, ${y.toFixed(1)}vh) rotate(${(Math.cos(t * Math.PI * 4) * 10).toFixed(0)}deg)${t > 0.25 && t < 0.75 ? ' scaleX(-1)' : ''}` });
      }
      anim(frames, 2600, 'linear');
      for (let t = 200; t < 2500; t += 380) later(() => fx.burstAt(el, 'droplets', { count: 2, colour: '#a5d8ff', power: 0.5, angle: -90, spread: 40 }), t);
      later(() => sfx.splash(), 1300);
      break;
    }
    case 'leap':
      anim(
        [
          { transform: 'translateY(0) scale(1.15, 0.85) rotate(0)' },
          { transform: 'translateY(-34vh) scale(0.95, 1.08) rotate(-20deg)', offset: 0.45, easing: 'ease-in' },
          { transform: 'translateY(0) scale(1.2, 0.8) rotate(10deg)', offset: 0.8 },
          { transform: 'translateY(0) scale(1) rotate(0)' },
        ],
        1600,
        'ease-out',
        '50% 100%',
      );
      later(() => {
        sfx.splash();
        const p = at('feet');
        fx.burst(p.x, p.y, 'droplets', { count: 18, colour: '#74c0fc', power: 1.2 });
      }, 1600 * 0.8);
      break;
    case 'blast': {
      anim(
        [
          { transform: 'translate(0, 0)' },
          { transform: 'translate(-1vw, 0)', offset: 0.06 },
          { transform: 'translate(1vw, 0)', offset: 0.12 },
          { transform: 'translate(-1vw, 0)', offset: 0.18 },
          { transform: 'translate(1vw, 0)', offset: 0.24 },
          { transform: 'translate(0, 2vh) scale(1.05, 0.92)', offset: 0.3 },
          { transform: 'translate(0, -130vh)', offset: 0.55, easing: 'ease-in' },
          { transform: 'translate(0, 130vh)', offset: 0.56 },
          { transform: 'translate(0, -4vh)', offset: 0.9 },
          { transform: 'translate(0, 0)' },
        ],
        3000,
        'ease-out',
      );
      for (let t = 0; t < 900; t += 150) later(() => fx.burst(at('feet').x, at('feet').y, 'dust', { count: 4, colour: '#dee2e6' }), t);
      later(() => {
        sfx.whoosh();
        fx.shake(1.5);
        fx.haptic([30, 30, 60]);
        fx.burst(at('feet').x, at('feet').y, 'dust', { count: 14, power: 2, colour: '#ffd8a8' });
      }, 900);
      later(() => fx.rain(30), 1700);
      break;
    }
    case 'drive':
      anim(
        [
          { transform: 'translateX(0) rotate(0)' },
          { transform: 'translateX(-4vw) rotate(3deg)', offset: 0.12 },
          { transform: 'translateX(130vw) rotate(-2deg)', offset: 0.45, easing: 'ease-in' },
          { transform: 'translateX(-130vw)', offset: 0.46 },
          { transform: 'translateX(4vw) rotate(-3deg)', offset: 0.88 },
          { transform: 'translateX(0) rotate(0)' },
        ],
        2800,
        'ease-out',
      );
      later(() => sfx.whoosh(), 300);
      later(() => fx.burst(at('feet').x, at('feet').y, 'dust', { count: 8 }), 320);
      later(() => sfx.thud(), 2500);
      break;
    case 'spin':
      anim(
        [
          { transform: 'rotate(0) scale(1)' },
          { transform: 'rotate(360deg) scale(1.3)', offset: 0.5 },
          { transform: 'rotate(720deg) scale(1)' },
        ],
        1600,
        'cubic-bezier(.4,0,.2,1)',
      );
      later(() => {
        sparkles(14);
        sfx.sparkle();
      }, 600);
      break;
    case 'grow':
      anim(
        [
          { transform: 'scale(0.1, 0.1)' },
          { transform: 'scale(1.1, 1.35)', offset: 0.5 },
          { transform: 'scale(0.95, 0.9)', offset: 0.7 },
          { transform: 'scale(1)' },
        ],
        1500,
        'ease-out',
        '50% 100%',
      );
      later(() => {
        sparkles(10);
        sfx.sparkle();
      }, 700);
      break;
    case 'munch': {
      const sizes = [1, 0.82, 0.64, 0.44];
      anim(
        [
          ...sizes.flatMap((s, i) => [
            { transform: `scale(${s}) rotate(0)`, offset: i * 0.2 },
            { transform: `scale(${s * 0.94}) rotate(${i % 2 ? 8 : -8}deg)`, offset: i * 0.2 + 0.08 },
          ]),
          { transform: 'scale(0)', offset: 0.8 },
          { transform: 'scale(1)' },
        ],
        2400,
        'ease-out',
      );
      [0.08, 0.28, 0.48, 0.68].forEach((t) =>
        later(() => {
          sfx.munch();
          fx.burstAt(el, 'crumbs', { count: 7, power: 1.6, colour: '#e8a85f' });
        }, t * 2400),
      );
      later(() => {
        fx.burstAt(el, 'hearts', { count: 6 });
        sfx.sparkle();
      }, 0.88 * 2400);
      break;
    }
    case 'float':
      anim(
        [
          { transform: 'translate(0, 0) rotate(0)' },
          { transform: 'translate(4vw, -20vh) rotate(6deg)', offset: 0.3 },
          { transform: 'translate(-4vw, -38vh) rotate(-6deg)', offset: 0.55 },
          { transform: 'translate(2vw, -20vh) rotate(4deg)', offset: 0.78 },
          { transform: 'translate(0, 0) rotate(0)' },
        ],
        2800,
        'ease-in-out',
      );
      break;
    case 'open':
      anim(
        [
          { transform: 'rotate(0)' },
          { transform: 'rotate(-10deg)', offset: 0.08 },
          { transform: 'rotate(10deg)', offset: 0.16 },
          { transform: 'rotate(0)', offset: 0.24 },
          { transform: 'rotate(-12deg) scale(1.05)', offset: 0.36 },
          { transform: 'rotate(12deg) scale(1.05)', offset: 0.44 },
          { transform: 'rotate(0) scale(0.9, 0.85)', offset: 0.55 },
          { transform: 'translateY(-14vh) scale(1.2)', offset: 0.68 },
          { transform: 'translateY(0) scale(1.1, 0.9)', offset: 0.85 },
          { transform: 'none' },
        ],
        2200,
      );
      later(() => {
        sfx.pop();
        sfx.sparkle();
        fx.burstAt(el, 'confetti', { count: 50, power: 1.4 });
        fx.burstAt(el, 'stars', { count: 10 });
        fx.haptic(25);
      }, 2200 * 0.66);
      break;
    case 'bounce': {
      const frames: Keyframe[] = [{ transform: 'translateY(0) scale(1)' }];
      const heights = [30, 18, 9, 4];
      let o = 0;
      heights.forEach((h, i) => {
        frames.push({ transform: `translateY(-${h}vh) scale(1) rotate(${(i + 1) * 90}deg)`, offset: o + 0.1 });
        frames.push({ transform: `translateY(0) scale(1.2, 0.8) rotate(${(i + 1) * 180}deg)`, offset: o + 0.2 });
        o += 0.22;
      });
      frames.push({ transform: 'translateY(0) scale(1) rotate(720deg)' });
      anim(frames, 2200, 'ease-in-out', '50% 100%');
      [0.2, 0.42, 0.64, 0.86].forEach((t) =>
        later(() => {
          sfx.tap();
          fx.burst(at('feet').x, at('feet').y, 'dust', { count: 4 });
        }, t * 2200),
      );
      break;
    }
    case 'splat':
      anim(
        [
          { transform: 'rotate(0)' },
          { transform: 'rotate(-10deg) scale(0.9)', offset: 0.2 },
          { transform: 'rotate(10deg) scale(1.25)', offset: 0.4 },
          { transform: 'rotate(0) scale(1)' },
        ],
        1400,
      );
      later(() => {
        sfx.splash();
        ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#b197fc', '#ffa94d'].forEach((colour) =>
          fx.burstAt(el, 'droplets', { colour, count: 5, power: 1.3, spread: 360 }),
        );
      }, 560);
      break;
    case 'dance':
      anim(
        [
          { transform: 'rotate(0) translateY(0)' },
          { transform: 'rotate(-14deg) translateY(-4vh)', offset: 0.15 },
          { transform: 'rotate(14deg) translateY(0)', offset: 0.3 },
          { transform: 'rotate(-14deg) translateY(-4vh)', offset: 0.45 },
          { transform: 'rotate(14deg) translateY(0)', offset: 0.6 },
          { transform: 'rotate(0) translateY(-6vh) scale(1.2)', offset: 0.8 },
          { transform: 'none' },
        ],
        2200,
      );
      [0, 2, 4, 7, 4, 7].forEach((n, i) => later(() => sfx.note(n, 0.4), i * 300));
      later(() => sparkles(10), 1700);
      break;
    case 'hug':
      anim(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.25, 0.82)', offset: 0.18 },
          { transform: 'scale(0.95, 1.06)', offset: 0.34 },
          { transform: 'scale(1.25, 0.82)', offset: 0.52 },
          { transform: 'scale(0.97, 1.04)', offset: 0.7 },
          { transform: 'scale(1)' },
        ],
        1800,
      );
      later(() => fx.burstAt(el, 'hearts', { count: 8, power: 1.3 }), 300);
      later(() => fx.burstAt(el, 'hearts', { count: 6 }), 950);
      break;
    case 'sleepy':
      anim(
        [
          { transform: 'rotate(0) scale(1)' },
          { transform: 'rotate(-10deg) scale(0.96)', offset: 0.3 },
          { transform: 'rotate(8deg) scale(0.94)', offset: 0.6 },
          { transform: 'rotate(0) scale(1)' },
        ],
        2600,
      );
      for (let t = 200; t < 2400; t += 400) later(() => fx.burstAt(el, 'sparkles', { count: 3, colour: '#fff3bf', power: 2.6 }), t);
      break;
    case 'stretch':
      anim(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(0.9, 0.85)', offset: 0.15 },
          { transform: 'scale(0.85, 1.6)', offset: 0.45 },
          { transform: 'scale(0.86, 1.55)', offset: 0.6 },
          { transform: 'scale(1.1, 0.9)', offset: 0.8 },
          { transform: 'scale(1)' },
        ],
        2000,
        'ease-in-out',
        '50% 100%',
      );
      later(() => fx.burstAt(el, 'stars', { count: 6 }), 900);
      break;
    case 'sparkle':
      anim(
        [
          { transform: 'translateY(0) scale(1) rotate(0)' },
          { transform: 'translateY(0) scale(1.1, 0.9)', offset: 0.12 },
          { transform: 'translateY(-10vh) scale(1.2) rotate(-8deg)', offset: 0.4 },
          { transform: 'translateY(0) scale(1.1, 0.92) rotate(6deg)', offset: 0.7 },
          { transform: 'none' },
        ],
        1600,
      );
      later(() => {
        sfx.sparkle();
        sparkles(16);
        fx.burstAt(el, 'stars', { count: 10, power: 1.3 });
      }, 600);
      later(() => fx.rain(30), 700);
      break;
  }
}

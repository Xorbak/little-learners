import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { startAmbient, type Ambient } from '../../shared/audio/ambient';
import { hasTrack, playLoop, type LoopHandle } from '../../shared/audio/music';
import { lessMotion } from '../../shared/fx';
import { BackIcon, HomeIcon, RoundButton } from '../../shared/ui/RoundButton';
import type { Navigate } from '../App';
import { BreathGuide } from '../calm/BreathGuide';
import { makeScene } from '../calm/scene';
import { CALM_THEMES, type CalmTheme } from '../calm/themes';
import { Tag } from '../../shared/ui/Tag';

/** One breath: in for 3.5 s, out for 4.5 s */
const IN = 3.5;
const OUT = 4.5;
const CYCLE = IN + OUT;
/** Volume of a calm track from src/music, and while the narrator talks */
const TRACK_LEVEL = 0.75;
const TRACK_DUCK = 0.4;
/** How many breaths the narrator guides at the start (tap the guide for more) */
const GUIDED = 4;

/** 0 (breathed out) … 1 (breathed in), smoothly */
const breathAt = (t: number) => {
  const p = t % CYCLE;
  return p < IN ? 0.5 - 0.5 * Math.cos((Math.PI * p) / IN) : 0.5 + 0.5 * Math.cos((Math.PI * (p - IN)) / OUT);
};

/**
 * Calm corner: pick a calm place (starry night, falling leaves, under the sea,
 * gentle rain, fireflies). Each has soft music (src/music/calm-<place>.mp3 if it is
 * there, otherwise music made in code), slow moving things,
 * and a breathing guide in the middle that grows as she breathes in and shrinks
 * as she breathes out, with the whole screen glowing gently in time.
 */
export function CalmScreen({ navigate }: { navigate: Navigate }) {
  const [theme, setTheme] = useState<CalmTheme | null>(null);

  useEffect(() => {
    if (!theme) void narrator.say(['calm.choose']);
  }, [theme]);

  if (theme) return <CalmPlace theme={theme} onBack={() => setTheme(null)} />;

  return (
    <main className="screen screen--scroll screen--calm-pick">
      <div className="corner-left">
        <RoundButton label="Home" variant="home" onPress={() => navigate({ name: 'home' })}>
          <HomeIcon />
        </RoundButton>
      </div>
      <header className="calm-top">
        <span className="calm-title" aria-hidden="true">
          🌙
        </span>
      </header>
      <div className="calm-picks">
        {CALM_THEMES.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className="calm-pick"
            style={{ background: t.sky, animationDelay: `${i * 0.07}s` }}
            onClick={() => {
              sfx.pop();
              setTheme(t);
            }}
            aria-label={t.name}
          >
            <span className="calm-pick-icon">{t.icon}</span>
            <Tag>{t.name}</Tag>
          </button>
        ))}
      </div>
    </main>
  );
}

function CalmPlace({ theme, onBack }: { theme: CalmTheme; onBack: () => void }) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ambient = useRef<Ambient | null>(null);
  const track = useRef<LoopHandle | null>(null);
  const guided = useRef(GUIDED);
  const introDone = useRef(false);
  const [music, setMusic] = useState(true);
  const musicOn = useRef(true);

  useEffect(() => {
    const alive = { current: true };
    const calm = lessMotion();
    const scene = makeScene(canvasRef.current!, theme.id, calm);
    // Its own music track if there is one (falls back to the music made in code if it can't load)
    const startMade = () => {
      if (alive.current && !ambient.current) {
        ambient.current = startAmbient(theme.id, CYCLE);
        ambient.current?.setMusic(musicOn.current);
      }
    };
    const name = `calm-${theme.id}`;
    if (hasTrack(name)) track.current = playLoop(name, { level: musicOn.current ? TRACK_LEVEL : 0, duck: musicOn.current ? TRACK_DUCK : 0, onFail: startMade });
    else startMade();
    const start = performance.now();
    let last = start;
    let lastHalf = -1;
    let saidIn = false;
    let frame = 0;

    void narrator.say([`calm.intro.${theme.id}`]).then(() => {
      if (alive.current) introDone.current = true;
    });

    const onResize = () => scene.resize();
    window.addEventListener('resize', onResize);

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const b = breathAt(t);
      rootRef.current?.style.setProperty('--b', b.toFixed(3));
      scene.frame(t, dt, b);
      ambient.current?.setBreath(b);
      // Guide the first few breaths out loud (in at the start of a breath, out at the top)
      const half = Math.floor(t / CYCLE) * 2 + (t % CYCLE < IN ? 0 : 1);
      if (half !== lastHalf) {
        lastHalf = half;
        if (introDone.current && guided.current > 0) {
          // Always start on an in-breath
          if (half % 2 === 0) {
            saidIn = true;
            void narrator.say(['calm.in']);
          } else if (saidIn) {
            void narrator.say(['calm.out']);
            guided.current--;
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      alive.current = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      ambient.current?.stop();
      ambient.current = null;
      track.current?.stop(1.5);
      track.current = null;
      narrator.stop();
    };
  }, [theme]);

  return (
    <main ref={rootRef} className={`screen screen--calm calm--${theme.id}`} style={{ background: theme.sky, '--glow': theme.glow } as CSSProperties}>
      <canvas ref={canvasRef} className="calm-canvas" aria-hidden="true" />
      <div className="calm-pulse" aria-hidden="true" />
      <div className="corner-left">
        <RoundButton label="Back" variant="home" onPress={onBack}>
          <BackIcon />
        </RoundButton>
      </div>
      <div className="corner-right">
        <button
          type="button"
          className={`calm-music ${music ? '' : 'calm-music--off'}`}
          onClick={() => {
            const on = !music;
            setMusic(on);
            musicOn.current = on;
            ambient.current?.setMusic(on);
            track.current?.setLevel(on ? TRACK_LEVEL : 0, on ? TRACK_DUCK : 0);
          }}
          aria-label={music ? 'Music off' : 'Music on'}
        >
          🎵
        </button>
      </div>
      <button
        type="button"
        className={`calm-guide calm-guide--${theme.guide}`}
        onClick={() => {
          // Tap the guide: breathe together for a few more breaths
          guided.current = 3;
          introDone.current = true;
        }}
        aria-label="Breathe with me"
      >
        <BreathGuide guide={theme.guide} />
      </button>
    </main>
  );
}

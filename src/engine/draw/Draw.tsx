import { useEffect, useRef, useState } from 'react';
import type { DrawConfig } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { art, blobToDataUrl } from '../../shared/art';
import { today } from '../../shared/progress/store';
import { canRecord, micDenied, playRecording, recordVoice } from '../../shared/audio/recorder';
import '../touch-it/touchIt.css';
import '../say-it/sayIt.css';
import './draw.css';

/**
 * Draw: a blank page, crayons, stamps and an eraser. When she's done (✓), the
 * picture goes into "My art", and the narrator asks "Tell me about your
 * picture!" (NCF: tell stories about their work): she talks, and her words are
 * kept with the picture.
 */

const COLOURS = ['#212529', '#e03131', '#f76707', '#fcc419', '#37b24d', '#1c7ed6', '#9c36b5', '#f06595', '#8d5524'];
const SIZES = [6, 14, 28];
const STAMPS = ['⭐', '❤️', '🌸', '🐞', '☀️', '🐟', '🌳', '🏠'];
const IDEAS = ['draw.idea.me', 'draw.idea.family', 'draw.idea.house', 'draw.idea.animal', 'draw.idea.weather', 'draw.idea.food', 'draw.idea.happy'];
const TALK_MS = 7000;

type Tool = { kind: 'crayon'; colour: string } | { kind: 'stamp'; emoji: string } | { kind: 'eraser' };

function DrawRound({ config, target, onCorrect, onRoundComplete }: RoundProps<DrawConfig>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>({ kind: 'crayon', colour: COLOURS[1] });
  const [size, setSize] = useState(SIZES[1]);
  const [phase, setPhase] = useState<'drawing' | 'talk' | 'recording' | 'playing' | 'saved'>('drawing');
  const [picture, setPicture] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const history = useRef<ImageData[]>([]);
  const drawn = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const alive = useRef(true);
  const rec = useRef<ReturnType<typeof recordVoice> | null>(null);
  const [idea] = useState(() => (config.ideas ? IDEAS[Math.floor(Math.random() * IDEAS.length)] : null));
  useEffect(
    () => () => {
      alive.current = false;
      rec.current?.stop();
    },
    [],
  );

  // A white page at the screen's resolution
  useEffect(() => {
    const canvas = canvasRef.current!;
    const fit = () => {
      const r = canvas.getBoundingClientRect();
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      const old = drawn.current ? canvas.toDataURL() : null;
      canvas.width = Math.round(r.width * ratio);
      canvas.height = Math.round(r.height * ratio);
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio, ratio);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, r.width, r.height);
      if (old) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, r.width, r.height);
        img.src = old;
      }
    };
    fit();
    window.addEventListener('resize', fit);
    void narrator.say(idea ? ['draw.hello', idea] : ['draw.hello-free']);
    return () => window.removeEventListener('resize', fit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ctx = () => canvasRef.current!.getContext('2d')!;
  const point = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const remember = () => {
    const c = canvasRef.current!;
    history.current.push(c.getContext('2d')!.getImageData(0, 0, c.width, c.height));
    if (history.current.length > 15) history.current.shift();
  };

  const line = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const c = ctx();
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.lineWidth = tool.kind === 'eraser' ? size * 2 : size;
    c.strokeStyle = tool.kind === 'crayon' ? tool.colour : '#fff';
    c.beginPath();
    c.moveTo(from.x, from.y);
    c.lineTo(to.x, to.y);
    c.stroke();
  };

  const down = (e: React.PointerEvent) => {
    if (phase !== 'drawing') return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    remember();
    const p = point(e);
    drawn.current = true;
    if (tool.kind === 'stamp') {
      const c = ctx();
      c.save();
      c.translate(p.x, p.y);
      c.rotate((Math.random() - 0.5) * 0.5);
      c.font = `${size * 2.6 + 16}px serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(tool.emoji, 0, 0);
      c.restore();
      sfx.pop();
      last.current = null;
      return;
    }
    last.current = p;
    line(p, { x: p.x + 0.1, y: p.y + 0.1 });
  };
  const move = (e: React.PointerEvent) => {
    if (!last.current) return;
    const p = point(e);
    line(last.current, p);
    last.current = p;
  };
  const up = () => {
    last.current = null;
  };

  const undo = () => {
    const prev = history.current.pop();
    if (!prev) return;
    sfx.flip();
    canvasRef.current!.getContext('2d')!.putImageData(prev, 0, 0);
  };

  const finish = async () => {
    if (phase !== 'drawing') return;
    if (!drawn.current) {
      void narrator.say(['draw.draw-first']);
      return;
    }
    const image = canvasRef.current!.toDataURL('image/jpeg', 0.7);
    setPicture(image);
    const id = art.add({ date: today(), image });
    onCorrect(target);
    fx.yay(undefined, { stars: 16 });
    sfx.cheer();
    const mic = canRecord() && !micDenied();
    if (!mic) {
      setPhase('saved');
      await narrator.say(['draw.lovely', 'draw.kept']);
      if (alive.current) onRoundComplete();
      return;
    }
    setPhase('talk');
    await narrator.say(['draw.lovely', 'draw.tell-me']);
    if (!alive.current) return;
    setPhase('recording');
    rec.current = recordVoice(TALK_MS, setLevel);
    const blob = await rec.current.done;
    if (!alive.current) return;
    setLevel(0);
    if (blob) {
      art.setVoice(id, await blobToDataUrl(blob));
      setPhase('playing');
      await playRecording(blob);
    }
    if (!alive.current) return;
    setPhase('saved');
    await narrator.say(['draw.thank-you', 'draw.kept']);
    if (alive.current) onRoundComplete();
  };

  const pick = (t: Tool) => {
    sfx.tap();
    setTool(t);
  };

  return (
    <div className="draw-round">
      <div className="draw-paper">
        <canvas ref={canvasRef} className="draw-canvas" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
        {picture && phase !== 'drawing' && (
          <div className="draw-talk">
            <img src={picture} alt="" />
            <button type="button" className={`say-mic say-mic--${phase === 'recording' ? 'recording' : phase === 'playing' ? 'playing' : 'ask'}`} style={{ ['--level' as string]: level }} onClick={() => rec.current?.stop()} aria-label="Done talking">
              <span className="say-mic-ring" />
              <span className="say-mic-icon">{phase === 'playing' ? '👂' : phase === 'saved' ? '🖼️' : '🎤'}</span>
            </button>
          </div>
        )}
      </div>
      <div className="draw-tools" aria-label="Crayons">
        {COLOURS.map((c) => (
          <button key={c} type="button" className={`draw-swatch ${tool.kind === 'crayon' && tool.colour === c ? 'draw-tool--on' : ''}`} style={{ background: c }} onClick={() => pick({ kind: 'crayon', colour: c })} aria-label="Crayon" />
        ))}
        <span className="draw-gap" />
        {SIZES.map((s) => (
          <button key={s} type="button" className={`draw-size ${size === s ? 'draw-tool--on' : ''}`} onClick={() => setSize(s)} aria-label={`Size ${s}`}>
            <span style={{ width: s + 4, height: s + 4 }} />
          </button>
        ))}
        <span className="draw-gap" />
        {STAMPS.map((st) => (
          <button key={st} type="button" className={`draw-stamp ${tool.kind === 'stamp' && tool.emoji === st ? 'draw-tool--on' : ''}`} onClick={() => pick({ kind: 'stamp', emoji: st })} aria-label="Stamp">
            {st}
          </button>
        ))}
        <span className="draw-gap" />
        <button type="button" className={`draw-stamp ${tool.kind === 'eraser' ? 'draw-tool--on' : ''}`} onClick={() => pick({ kind: 'eraser' })} aria-label="Eraser">
          🧽
        </button>
        <button type="button" className="draw-stamp" onClick={undo} aria-label="Undo">
          ↩️
        </button>
        <button type="button" className="draw-done" onClick={() => void finish()} aria-label="Finished">
          ✓
        </button>
      </div>
    </div>
  );
}

export const draw: Mechanic<DrawConfig> = {
  Round: DrawRound,
  clips: {
    'draw.hello-free': 'Draw anything you like! Press the tick when you are finished.',
    'draw.hello': "Let's draw!",
    'draw.idea.me': 'Can you draw yourself? A head, a body, arms and legs!',
    'draw.idea.family': 'Can you draw your family?',
    'draw.idea.house': 'Can you draw a house, with a door and windows?',
    'draw.idea.animal': 'Can you draw your favourite animal?',
    'draw.idea.weather': 'What is the weather like today? Draw it!',
    'draw.idea.food': 'Draw your favourite food!',
    'draw.idea.happy': 'Draw something that makes you happy!',
    'draw.draw-first': 'Draw something first!',
    'draw.lovely': 'What a lovely picture!',
    'draw.tell-me': 'Tell me about your picture!',
    'draw.thank-you': 'Thank you for telling me!',
    'draw.kept': "I'll keep it in My art.",
  },
};

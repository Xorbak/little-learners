import { useEffect, useRef, useState } from 'react';
import type { SayItConfig } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { canRecord, micDenied, playRecording, recordVoice } from '../../shared/audio/recorder';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import '../touch-it/touchIt.css';
import './sayIt.css';

/**
 * Say It: "This is a giraffe. Can you say giraffe?" She taps the microphone and
 * says it; the phone plays her own voice back ("Listen to you!"), then says the
 * word again. Never graded: hearing herself is the fun part.
 * Without a microphone (or permission) she taps "I said it!" instead.
 */

const RECORD_MS = 2600;

function SayItRound({ config, target, onCorrect, onRoundComplete }: RoundProps<SayItConfig>) {
  const [phase, setPhase] = useState<'ask' | 'ready' | 'recording' | 'playing' | 'done'>('ask');
  const [level, setLevel] = useState(0);
  const recording = useRef<ReturnType<typeof recordVoice> | null>(null);
  const alive = useRef(true);
  useEffect(
    () => () => {
      alive.current = false;
      recording.current?.stop();
    },
    [],
  );
  const mic = canRecord() && !micDenied();

  const ask = async () => {
    setPhase('ask');
    await narrator.say(['say.look', target.nameClip, config.askClip ?? 'say.can-you-say', target.nameClip]);
    if (alive.current) setPhase('ready');
  };
  useEffect(() => {
    void ask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = async (heard: boolean) => {
    setPhase('done');
    sfx.pop();
    fx.yay(undefined, { stars: 14 });
    onCorrect(target);
    await narrator.say([heard ? 'say.well-said' : 'say.well-done', target.nameClip]);
    if (alive.current) window.setTimeout(onRoundComplete, 400);
  };

  const press = async () => {
    if (phase !== 'ready') return;
    if (!mic) {
      void finish(false);
      return;
    }
    narrator.stop();
    setPhase('recording');
    sfx.tap();
    recording.current = recordVoice(RECORD_MS, setLevel);
    const blob = await recording.current.done;
    if (!alive.current) return;
    setLevel(0);
    if (!blob) {
      // No permission after all: carry on without the microphone
      void finish(false);
      return;
    }
    setPhase('playing');
    await narrator.say(['say.listen-to-you']);
    await playRecording(blob);
    if (alive.current) void finish(true);
  };

  return (
    <div className="touch-round sayit-round">
      <header className="touch-top">
        <SpeakerButton onPress={() => void ask()} />
      </header>
      <div className="sayit-body">
        <div className={`sayit-picture ${phase === 'done' ? 'sayit-picture--done' : ''}`}>
          <target.Display size={Math.min(window.innerWidth * 0.55, window.innerHeight * 0.32)} />
        </div>
        <button
          type="button"
          className={`say-mic say-mic--${phase}`}
          style={{ ['--level' as string]: level }}
          onPointerDown={(e) => {
            e.preventDefault();
            void press();
          }}
          aria-label={mic ? 'Record' : 'I said it'}
        >
          <span className="say-mic-ring" />
          <span className="say-mic-icon">{phase === 'playing' ? '👂' : mic ? '🎤' : '👄'}</span>
        </button>
      </div>
    </div>
  );
}

export const sayIt: Mechanic<SayItConfig> = {
  Round: SayItRound,
  clips: {
    'say.look': 'Look!',
    'say.can-you-say': '. Can you say',
    'say.listen-to-you': 'Listen to you!',
    'say.well-said': 'Well said!',
    'say.well-done': 'Well done!',
  },
};

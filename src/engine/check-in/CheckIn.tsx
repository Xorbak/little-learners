import { useEffect, useRef, useState } from 'react';
import type { CheckInConfig, LearningItem } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { progress } from '../../shared/progress/store';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import './checkIn.css';

/**
 * How do you feel today?
 * Big faces; she taps how she feels and gets a kind reply (the item's soundClip).
 * Feelings marked 'calm' (cross, scared) also get three slow breaths with a
 * balloon that grows and shrinks. There is no wrong answer. Saved for grown-ups.
 */

const BREATHS = 3;
const BREATH_MS = 4200;

function CheckInRound({ config, items, onRoundComplete }: RoundProps<CheckInConfig>) {
  const faces = config.pool.map((k) => items[k]);
  const [chosen, setChosen] = useState<LearningItem | null>(null);
  const [breath, setBreath] = useState<'in' | 'out' | null>(null);

  const ask = () => void narrator.say(['feel.how-today']);
  useEffect(ask, []);

  const alive = useRef(true);
  // (Set true again on mount: React's development mode mounts everything twice)
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const choose = async (face: LearningItem) => {
    if (chosen) return;
    sfx.pop();
    setChosen(face);
    progress.logFeeling(face.key);
    // Say the whole kind reply before anything else happens
    await narrator.say([face.nameClip, ...(face.soundClip ? [face.soundClip] : [])]);
    if (!alive.current) return;
    if (face.group?.key === 'calm') {
      // Breathe together: in… and out… three times
      for (let i = 0; i < BREATHS; i++) {
        setBreath('in');
        void narrator.say(['feel.breathe-in']);
        await wait(BREATH_MS / 2);
        if (!alive.current) return;
        setBreath('out');
        void narrator.say(['feel.breathe-out']);
        await wait(BREATH_MS / 2);
        if (!alive.current) return;
      }
      setBreath(null);
      await narrator.say(['feel.well-done-breathing']);
      if (!alive.current) return;
    }
    await wait(700);
    if (alive.current) onRoundComplete();
  };

  return (
    <div className="ci-round">
      <header className="ci-top">
        <SpeakerButton onPress={chosen ? () => void narrator.say([chosen.nameClip, ...(chosen.soundClip ? [chosen.soundClip] : [])]) : ask} />
      </header>
      {!chosen ? (
        <div className="ci-faces">
          {faces.map((f, i) => (
            <button key={f.key} type="button" className="ci-face" style={{ animationDelay: `${i * 0.06}s` }} onClick={() => void choose(f)} aria-label={narrator.allClips()[f.nameClip]}>
              <f.Display size={110} />
            </button>
          ))}
        </div>
      ) : (
        <div className="ci-chosen">
          {breath ? (
            <div className={`ci-breath ci-breath--${breath}`} style={{ animationDuration: `${BREATH_MS / 2}ms` }}>
              <chosen.Display size={120} />
            </div>
          ) : (
            <div className="ci-big">
              <chosen.Display size={200} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const checkIn: Mechanic<CheckInConfig> = {
  Round: CheckInRound,
  clips: {
    'feel.how-today': 'How do you feel today?',
    'feel.breathe-in': 'Breathe in…',
    'feel.breathe-out': 'and out…',
    'feel.well-done-breathing': 'Well done. That was lovely breathing.',
  },
};

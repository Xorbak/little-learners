import { useState } from 'react';
import { playClock } from '../../shared/playtime';
import { BackIcon, RoundButton } from '../../shared/ui/RoundButton';
import type { Navigate } from '../App';
import { dayNumber } from '../daily';
import { exercisesForToday } from '../exercises';
import { ExerciseRun } from './ExerciseRun';

/** Movement break in Today's lessons: two exercises, then back to Today */
export function MoveBreak({ navigate, stepId, n }: { navigate: Navigate; stepId: string; n: number }) {
  const [exercises] = useState(() => exercisesForToday(dayNumber(), n));
  return (
    <main className="screen screen--move">
      <div className="corner-left">
        <RoundButton label="Back" variant="home" onPress={() => navigate({ name: 'today' })}>
          <BackIcon />
        </RoundButton>
      </div>
      <header className="move-top">
        <span className="move-badge" aria-hidden="true">🤸</span>
      </header>
      <ExerciseRun
        exercises={exercises}
        doneLabel="Back to today"
        onDone={() => {
          // Counts as a play-time exercise break too
          playClock.breakDone();
          navigate({ name: 'today', justFinished: stepId });
        }}
      />
    </main>
  );
}

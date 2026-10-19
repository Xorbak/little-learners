import { useCallback, useEffect, useRef, useState } from 'react';
import type { Game, LearningItem, Section } from '../../types/learning';
import { mechanicFor } from '../../engine';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { randomPraise } from '../../shared/audio/sharedClips';
import { masteryOf, pickAdaptive } from '../../shared/progress/adaptive';
import { progress } from '../../shared/progress/store';
import { Celebration } from '../../shared/ui/Celebration';
import { HomeIcon, BackIcon, PlayIcon, RoundButton } from '../../shared/ui/RoundButton';
import type { Navigate } from '../App';
import { gameKey } from '../registry';

interface Props {
  section: Section;
  game: Game;
  navigate: Navigate;
  /** Part of Today's lessons: play a short session, then go back to the Today screen */
  daily?: { stepId: string; rounds: number };
}

/**
 * Runs any game: picks what to practise each round, records answers,
 * celebrates, and moves her up a level when she finishes one.
 * It doesn't know how the game is played; that's the mechanic's job.
 */
export function GameScreen(props: Props) {
  const [session, setSession] = useState(0);
  return <LevelSession key={session} {...props} onPlayAgain={() => setSession((s) => s + 1)} />;
}

type Phase = 'playing' | 'cheer' | 'done';

function LevelSession({ section, game, navigate, daily, onPlayAgain }: Props & { onPlayAgain: () => void }) {
  const key = gameKey(section.id, game.id);
  const [levelIndex] = useState(() => Math.min(progress.game(key).currentLevel, game.levels.length - 1));
  const level = game.levels[levelIndex];
  // A daily session is a couple of rounds; they add up towards finishing the level
  const [sessionRounds] = useState(() =>
    daily ? Math.max(1, Math.min(daily.rounds, level.rounds - (progress.game(key).roundsDone ?? 0))) : level.rounds,
  );
  const [sticker, setSticker] = useState<string | null>(null);
  const goBack = () => (daily ? navigate({ name: 'today' }) : navigate({ name: 'section', sectionId: section.id }));
  const { Round } = mechanicFor(level.activity);

  const [round, setRound] = useState(0);
  const [targetKey, setTargetKey] = useState(() => pickAdaptive(section.id, level.activity.pool));
  const [phase, setPhase] = useState<Phase>('playing');
  const [unlockedNext, setUnlockedNext] = useState(false);

  const onCorrect = useCallback(
    (item: LearningItem) => progress.recordAnswer(`${section.id}/${item.key}`, true),
    [section.id],
  );
  const timesRight = useCallback((item: LearningItem) => progress.item(`${section.id}/${item.key}`)?.correct ?? 0, [section.id]);
  const isKnown = useCallback((item: LearningItem) => masteryOf(section.id, item.key) === 'knows', [section.id]);
  const onWrong = useCallback(
    (target: LearningItem) => progress.recordAnswer(`${section.id}/${target.key}`, false),
    [section.id],
  );

  // Keep the latest round number available to the stable callback below
  const roundRef = useRef(round);
  const targetRef = useRef(targetKey);
  useEffect(() => {
    roundRef.current = round;
    targetRef.current = targetKey;
  }, [round, targetKey]);

  const mounted = useRef(true);
  // (Set true again on mount: React's development mode mounts everything twice)
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const onRoundComplete = useCallback(() => {
    setPhase('cheer');
    sfx.cheer();
    const startedAt = Date.now();

    void (async () => {
      // Let the game finish what it's saying ("Yes! That's the circle!") before praising
      await narrator.idle();
      if (!mounted.current) return;
      await narrator.say([randomPraise()]);
      const left = 2200 - (Date.now() - startedAt);
      if (left > 0) await new Promise((r) => setTimeout(r, left));
      if (!mounted.current) return;

      const nextRound = roundRef.current + 1;
      if (nextRound >= sessionRounds) {
        const result = daily
          ? progress.addRounds(key, sessionRounds, level.rounds, levelIndex, game.levels.length)
          : { completed: true, unlocked: progress.completeLevel(key, levelIndex, game.levels.length) };
        const won = result.completed ? progress.awardSticker() : null;
        setSticker(won);
        setUnlockedNext(result.unlocked);
        setPhase('done');
        sfx.fanfare();
        const lines = daily ? ['shared.well-done-step'] : ['shared.level-done'];
        if (result.unlocked) lines.push('shared.something-new');
        if (won) lines.push('sticker.got');
        void narrator.say(lines);
      } else {
        setTargetKey(pickAdaptive(section.id, level.activity.pool, targetRef.current));
        setRound(nextRound);
        setPhase('playing');
      }
    })();
  }, [key, levelIndex, level, game.levels.length, section.id, sessionRounds, daily]);

  return (
    <main className="screen screen--game">
      <div className="corner-left">
        <RoundButton label="Back" variant="home" onPress={goBack}>
          <BackIcon />
        </RoundButton>
      </div>

      <div className="round-progress" aria-label={`Round ${round + 1} of ${sessionRounds}`}>
        {Array.from({ length: sessionRounds }, (_, i) => (
          <span key={i} className={`round-pip ${i < round || (i === round && phase !== 'playing') ? 'round-pip--done' : ''}`} />
        ))}
      </div>

      {phase !== 'done' && (
        <Round
          key={round}
          config={level.activity}
          target={section.items[targetKey]}
          items={section.items}
          onCorrect={onCorrect}
          onWrong={onWrong}
          onRoundComplete={onRoundComplete}
          isKnown={isKnown}
          timesRight={timesRight}
        />
      )}

      {phase === 'cheer' && <Celebration />}

      {phase === 'done' && (
        <div className="level-done">
          <Celebration big />
          {sticker && (
            <div className="sticker-won" aria-label="You got a sticker">
              <span className="sticker-won-face">{sticker}</span>
            </div>
          )}
          <div className="level-done-buttons">
            {daily ? (
              <RoundButton
                label="Back to today"
                variant="play"
                onPress={() => {
                  narrator.stop();
                  navigate({ name: 'today', justFinished: daily.stepId });
                }}
                className="round-btn--huge"
              >
                <PlayIcon size={72} />
              </RoundButton>
            ) : (
              <>
                <RoundButton label="Home" variant="home" onPress={() => navigate({ name: 'home' })} className="round-btn--big">
                  <HomeIcon />
                </RoundButton>
                <RoundButton
                  label={unlockedNext ? 'Play the next level' : 'Play again'}
                  variant="play"
                  onPress={() => {
                    narrator.stop();
                    onPlayAgain();
                  }}
                  className="round-btn--huge"
                >
                  <PlayIcon size={72} />
                </RoundButton>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

import { useEffect, useState } from 'react';
import { narrator } from '../../shared/audio/narrator';
import { masteryOf } from '../../shared/progress/adaptive';
import { applyMotionSetting, lessMotion } from '../../shared/fx';
import { progress, useProgress } from '../../shared/progress/store';
import type { Navigate } from '../App';
import { findSection, gameKey, sections } from '../registry';
import { hasName } from '../name';
import { todaysPlan } from '../daily';
import { missionById } from '../missions';
import { EXERCISES } from '../exercises';
import { playClock, UNTIL_TOMORROW } from '../../shared/playtime';
import { soundExamples } from '../../sections/letters/words';

/**
 * Grown-ups only (behind the hold-to-enter button).
 * Choose levels, pick the voice, see what she knows, and see which clips still need recording.
 */
export function ParentArea({ navigate }: { navigate: Navigate }) {
  const saved = useProgress();
  const profile = saved.profiles[saved.activeProfileId];
  const [voices, setVoices] = useState(() => narrator.voices());

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const update = () => setVoices(narrator.voices());
    speechSynthesis.addEventListener('voiceschanged', update);
    return () => speechSynthesis.removeEventListener('voiceschanged', update);
  }, []);

  const clips = narrator.allClips();
  const clipIds = Object.keys(clips).sort();
  const recordedCount = clipIds.filter((id) => narrator.hasRecording(id)).length;

  return (
    <main className="parent">
      <header className="parent-header">
        <h1>Grown-ups</h1>
        <button type="button" className="parent-btn" onClick={() => navigate({ name: 'home' })}>
          Back to the app
        </button>
      </header>

      <section className="parent-card">
        <h2>Her name</h2>
        <p className="parent-hint">Used on the start screen and by the narrator ("Hello, …! Let's play!"). Record it as <code>shared.child-name</code> for your own voice.</p>
        <input
          className="parent-input"
          type="text"
          defaultValue={hasName(profile.name) ? profile.name : ''}
          placeholder="Her name"
          onBlur={(e) => progress.setName(e.target.value.trim() || 'My little one')}
        />
      </section>

      <PlayTimeCard />

      <section className="parent-card">
        <h2>Today's lessons this week</h2>
        <p className="parent-hint">
          The ☀️ button on the home screen: a bit of every subject, {todaysPlan().filter((s) => !s.treat && !s.move).length} short games and{' '}
          {todaysPlan().filter((s) => s.move).length} 🤸 movement breaks a day. 🏆 = she finished them all; then she gets a 🔍 mission to do away from the
          screen.
        </p>
        <div className="week-row">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const entry = profile.daily?.[key];
            return (
              <div key={key} className="week-day">
                <span className="week-name">{d.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                <span className="week-mark">{entry?.trophy ? '🏆' : entry?.done.length ? `${entry.done.length} ✓` : '–'}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="parent-card">
        <h2>Missions</h2>
        <p className="parent-hint">
          After Today's lessons she gets a mission to do away from the screen. When she has done it, tick it here (or hold the ✓ on the mission screen) and
          she gets a sticker for it.
        </p>
        <div className="mission-log">
          {Object.keys(profile.missions ?? {}).length === 0 && <span className="parent-hint">No missions yet.</span>}
          {Object.entries(profile.missions ?? {})
            .sort(([a], [b]) => (a < b ? 1 : -1))
            .slice(0, 7)
            .map(([day, m]) => {
              const mission = missionById(m.id);
              return (
                <div key={day} className="mission-row">
                  <span className="mission-row-day">{new Date(`${day}T12:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <span className="mission-row-pic">{mission?.picture.join('')}</span>
                  <span className="mission-row-text">{narrator.allClips()[`mission.${m.id}`]}</span>
                  {m.done ? (
                    <span className="mission-row-done">✓ done</span>
                  ) : (
                    <button
                      type="button"
                      className="parent-btn"
                      onClick={() => {
                        progress.missionDone(day);
                        progress.awardSticker(undefined, { mission: m.id });
                      }}
                    >
                      Tick (gives a sticker)
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </section>

      <section className="parent-card">
        <h2>How she felt</h2>
        <p className="parent-hint">From "How do you feel today?" in Feelings (and the first stop of Today's lessons).</p>
        <div className="feel-log">
          {(profile.feelings ?? []).length === 0 && <span className="parent-hint">Nothing yet.</span>}
          {(profile.feelings ?? [])
            .slice(-14)
            .reverse()
            .map((f, i) => {
              const item = findSection('feelings')?.items[f.feeling];
              return (
                <span key={i} className="feel-entry" title={f.feeling}>
                  {item ? <item.Display size={30} /> : f.feeling}
                  <small>{new Date(f.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</small>
                </span>
              );
            })}
        </div>
      </section>

      <section className="parent-card">
        <h2>Levels</h2>
        <p className="parent-hint">She starts each game on the highlighted level. Finishing a level moves her up automatically.</p>
        {sections.map((section) =>
          section.games.map((game) => {
            const key = gameKey(section.id, game.id);
            const g = profile.games[key];
            const current = Math.min(g?.currentLevel ?? 0, game.levels.length - 1);
            return (
              <div key={key} className="parent-game">
                <h3>
                  {clips[section.titleClip]} · {clips[game.titleClip]}
                </h3>
                <div className="level-list">
                  {game.levels.map((level, i) => (
                    <button
                      key={level.id}
                      type="button"
                      className={`level-chip ${i === current ? 'level-chip--current' : ''}`}
                      onClick={() => progress.setLevel(key, i)}
                    >
                      <span className="level-num">{i + 1}</span>
                      {level.parentLabel}
                      {g && i <= g.bestCompleted && <span title="Finished"> ★</span>}
                    </button>
                  ))}
                </div>
              </div>
            );
          }),
        )}
      </section>

      <section className="parent-card">
        <h2>What she knows</h2>
        {sections.filter((section) => section.trackProgress !== false).map((section) => (
          <div key={section.id} className="parent-game">
            <h3>{clips[section.titleClip]}</h3>
            <div className="mastery-row">
              {Object.values(section.items).filter((item) => item.track !== false).map((item) => {
                const m = masteryOf(section.id, item.key);
                const s = profile.items[`${section.id}/${item.key}`];
                return (
                  <div key={item.key} className={`mastery mastery--${m}`} title={s ? `${s.correct} right, ${s.wrong} mix-ups` : 'Not seen yet'}>
                    <item.Display size={34} />
                    <span>{m === 'knows' ? 'Knows' : m === 'practising' ? 'Practising' : 'New'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="parent-card">
        <h2>Voice</h2>
        <p className="parent-hint">Used for anything you haven't recorded yet.</p>
        <div className="voice-row">
          <select
            value={saved.voice.voiceURI ?? ''}
            onChange={(e) => progress.setVoice({ ...saved.voice, voiceURI: e.target.value || undefined })}
          >
            <option value="">Automatic (best English voice)</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
          <label>
            Speed
            <input
              type="range"
              min={0.6}
              max={1.2}
              step={0.05}
              value={saved.voice.rate}
              onChange={(e) => progress.setVoice({ ...saved.voice, rate: Number(e.target.value) })}
            />
          </label>
          <button type="button" className="parent-btn" onClick={() => void narrator.say(['pop.pop-all-the', 'numbers.plural.3'])}>
            Test
          </button>
        </div>
      </section>

      <section className="parent-card">
        <h2>Silly sounds</h2>
        <p className="parent-hint">Raspberry noises when cards don't match, and the stinky bonus pair in Memory Match.</p>
        <label className="voice-row">
          <input
            type="checkbox"
            checked={saved.sillySounds !== false}
            onChange={(e) => progress.setSillySounds(e.target.checked)}
          />
          Farts on
        </label>
      </section>

      <section className="parent-card">
        <h2>Words under pictures</h2>
        <p className="parent-hint">
          Short labels under the tiles, Today's games, gallery pictures, stickers, missions, exercises and calm places, so you can read along. They are
          never shown on the answers inside the games.
        </p>
        <label className="voice-row">
          <input type="checkbox" checked={saved.showLabels !== false} onChange={(e) => progress.setShowLabels(e.target.checked)} />
          Show words
        </label>
      </section>

      <section className="parent-card">
        <h2>Less motion</h2>
        <p className="parent-hint">
          Turns off screen shakes and uses fewer confetti and sparkles. Starts on if the phone is set to reduce motion.
        </p>
        <label className="voice-row">
          <input
            type="checkbox"
            checked={saved.lessMotion ?? lessMotion()}
            onChange={(e) => {
              progress.setLessMotion(e.target.checked);
              applyMotionSetting();
            }}
          />
          Less motion
        </label>
      </section>

      <section className="parent-card">
        <h2>Record these first: letter sounds</h2>
        <p className="parent-hint">
          The computer voice can't say letter sounds, so it says the letter's name ("C") until you record the sound. Say just the
          sound, short and clear, the way it starts the example word. Save each in <code>src/recordings/</code> with the file name shown
          (.mp3, .m4a, .wav, .ogg or .webm). {Object.keys(soundExamples).filter((l) => narrator.hasRecording(`letters.sound.${l}`)).length} of 26 done.
        </p>
        <table className="clip-table">
          <thead>
            <tr>
              <th>File name</th>
              <th>Say the sound…</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {Object.entries(soundExamples).map(([l, example]) => {
              const id = `letters.sound.${l}`;
              return (
                <tr key={l}>
                  <td>
                    <code>{id}.mp3</code>
                  </td>
                  <td>{example}</td>
                  <td>{narrator.hasRecording(id) ? '✅ Recorded' : 'Not yet'}</td>
                  <td>
                    <button type="button" className="parent-btn parent-btn--small" onClick={() => void narrator.say([id])}>
                      Play
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="parent-card">
        <h2>Recording checklist</h2>
        <p className="parent-hint">
          {recordedCount} of {clipIds.length} clips recorded. Save each recording in <code>src/recordings/</code> using the
          file name shown, e.g. <code>pop.pop-all-the.mp3</code>.
        </p>
        <table className="clip-table">
          <thead>
            <tr>
              <th>File name</th>
              <th>Says</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {clipIds.map((id) => (
              <tr key={id}>
                <td>
                  <code>{id}</code>
                </td>
                <td>{clips[id]}</td>
                <td>{narrator.hasRecording(id) ? '✅ Recorded' : 'Computer voice'}</td>
                <td>
                  <button type="button" className="parent-btn parent-btn--small" onClick={() => void narrator.say([id])}>
                    Play
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="parent-card">
        <h2>Start over</h2>
        <button
          type="button"
          className="parent-btn parent-btn--danger"
          onClick={() => {
            if (window.confirm(`Clear all progress for ${profile.name}?`)) progress.resetProfile();
          }}
        >
          Reset progress
        </button>
      </section>
    </main>
  );
}

/** Play-time limits: session length, exercise breaks, rest time, which exercises */
function PlayTimeCard() {
  useProgress();
  const [, setTick] = useState(0);
  useEffect(() => {
    const off = playClock.subscribe(() => setTick((t) => t + 1));
    const t = window.setInterval(() => setTick((n) => n + 1), 5000);
    return () => {
      off();
      window.clearInterval(t);
    };
  }, []);
  const set = playClock.settings();
  const until = playClock.lockedUntil();
  const toggle = (key: string, on: boolean) =>
    progress.setPlayTime({ exercisesOff: on ? set.exercisesOff.filter((k) => k !== key) : [...set.exercisesOff, key] });

  return (
    <section className="parent-card">
      <h2>Play time</h2>
      <p className="parent-hint">
        How long she can play in one go, how often she stops to move, and how long she rests before playing again. Only time playing counts (not the
        start screen, this area or the exercise breaks). When time is up she sees a sleepy owl and the app stays closed until the rest time is over or
        you unlock it (hold the ⚙️ on that screen).
      </p>
      <div className="voice-row">
        <label>
          Play time
          <select value={set.sessionMin} onChange={(e) => progress.setPlayTime({ sessionMin: Number(e.target.value) })}>
            {[10, 15, 20, 30, 45, 60].map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
            <option value={0}>No limit</option>
          </select>
        </label>
        <label>
          Exercise break every
          <select value={set.breakEveryMin} onChange={(e) => progress.setPlayTime({ breakEveryMin: Number(e.target.value) })}>
            {[5, 7, 10, 15].map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
            <option value={0}>No breaks</option>
          </select>
        </label>
        <label>
          Rest before playing again
          <select value={set.restMin} onChange={(e) => progress.setPlayTime({ restMin: Number(e.target.value) })}>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={UNTIL_TOMORROW}>Until tomorrow</option>
          </select>
        </label>
      </div>

      <p className="playtime-status">
        {until
          ? `Resting until ${new Date(until).toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })}.`
          : `Played ${playClock.usedMin()} min this session${set.sessionMin ? ` of ${set.sessionMin}` : ''}.`}
      </p>
      <div className="voice-row">
        {until && (
          <button type="button" className="parent-btn" onClick={() => playClock.unlock()}>
            Unlock now
          </button>
        )}
        {!until && (
          <button type="button" className="parent-btn" onClick={() => playClock.unlock()}>
            Start a new session
          </button>
        )}
      </div>

      <h3 className="playtime-sub">Exercises in the breaks</h3>
      <p className="parent-hint">Two are picked for each break. The wheelbarrow needs a grown-up to hold her legs, so switch it off if nobody is around.</p>
      <div className="exercise-grid">
        {EXERCISES.map((e) => (
          <label key={e.key} className="exercise-pick">
            <input type="checkbox" checked={!set.exercisesOff.includes(e.key)} onChange={(ev) => toggle(e.key, ev.target.checked)} />
            <span className="exercise-pick-icon">{e.icon}</span>
            {e.name}
          </label>
        ))}
      </div>
    </section>
  );
}


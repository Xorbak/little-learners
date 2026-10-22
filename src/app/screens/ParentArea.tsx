import { useEffect, useRef, useState } from 'react';
import { narrator } from '../../shared/audio/narrator';
import { masteryOf } from '../../shared/progress/adaptive';
import { applyMotionSetting, lessMotion } from '../../shared/fx';
import { afrikaansWords } from '../../sections/afrikaans/words';
import { LEARNED_BOX, choicesFor, isLearned } from '../../shared/progress/spaced';
import { today } from '../../shared/progress/store';
import { hasTrack, musicProblems, playSong, type SongHandle } from '../../shared/audio/music';
import { audioState } from '../../shared/audio/sfx';
import { progress, useProgress } from '../../shared/progress/store';
import type { Navigate } from '../App';
import { findSection, gameKey, sections } from '../registry';
import { hasName } from '../name';
import { todaysPlan } from '../daily';
import { missionById } from '../missions';
import { EXERCISES } from '../exercises';
import { playClock, UNTIL_TOMORROW } from '../../shared/playtime';
import { soundExamples } from '../../sections/letters/words';
import { haptic, setHapticsEnabled } from '../../shared/haptics';
import { AboutHerCard, FamilyCard } from './parent/AboutHerCards';
import { FAMILY_KEY } from '../../shared/family';

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

      <AboutHerCard />

      <FamilyCard />

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

      <AfrikaansCard />

      <BackupCard />

      <section className="parent-card">
        <h2>Listen first</h2>
        <p className="parent-hint">
          For the excited tapper: in the choosing games (Touch it, Match it, Odd one out, Patterns) the cards go sleepy and an 👂 shows while the
          question is being asked, and wake up when it's finished. Taps before then do nothing, so she learns to listen, then choose. The 🚦 Wait
          for it game in Thinking practises waiting on its own.
        </p>
        <label className="voice-row">
          <input type="checkbox" checked={saved.listenFirst !== false} onChange={(e) => progress.setListenFirst(e.target.checked)} />
          Listen first
        </label>
      </section>

      <section className="parent-card">
        <h2>Music and songs</h2>
        <p className="parent-hint">
          Songs you make (with Suno, say) go in <code>src/music/</code> with the names below; see the README there. Background music plays
          quietly on the menus, in Paint by Numbers, the thinking games and exercise breaks, and goes quieter while the narrator talks. The calm
          places use their own music, and songs show up in Art and music → Sing along.
        </p>
        <label className="voice-row">
          <input type="checkbox" checked={saved.backgroundMusic !== false} onChange={(e) => progress.setBackgroundMusic(e.target.checked)} />
          Background music
        </label>
        <MusicCheck />
      </section>

      <section className="parent-card">
        <h2>Vibration</h2>
        <p className="parent-hint">
          On phones that can vibrate: a tiny tick on every tap, two happy taps for a right answer, a soft double for a miss, a little drum roll when
          she finishes, and a buzz with every screen shake. (iPhones only allow a light tick on taps.)
        </p>
        <label className="voice-row">
          <input
            type="checkbox"
            checked={saved.vibration !== false}
            onChange={(e) => {
              progress.setVibration(e.target.checked);
              setHapticsEnabled(e.target.checked);
              if (e.target.checked) haptic('right');
            }}
          />
          Vibrate
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

/** The music files the app looks for in src/music, and where each plays */
const MUSIC_FILES: [string, string][] = [
  ['calm-stars', 'Calm corner: starry night'],
  ['calm-leaves', 'Calm corner: falling leaves'],
  ['calm-ocean', 'Calm corner: under the sea'],
  ['calm-rain', 'Calm corner: gentle rain'],
  ['calm-fireflies', 'Calm corner: fireflies'],
  ['bg-home', 'Home and menus'],
  ['bg-art', 'Paint by Numbers'],
  ['bg-thinking', 'Thinking games'],
  ['bg-move', 'Exercise breaks'],
  ['jingle-win', 'Level done (instead of the fanfare)'],
  ['song-break', "Time's up (after the owl)"],
  ['song-move', 'Sing along; dance mission'],
  ['song-count', 'Sing along; counting missions'],
  ['song-colours', 'Sing along; colour-hunt missions'],
  ['song-tidy', 'Sing along; tidy-up mission'],
  ['calm-breathe-song', 'Sing along'],
];

/** Which music files are in, a ▶ to hear each one on this phone, and how the sound is doing */
function MusicCheck() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [, refresh] = useState(0);
  const handle = useRef<SongHandle | null>(null);
  useEffect(() => {
    const t = window.setInterval(() => refresh((n) => n + 1), 1000);
    return () => {
      window.clearInterval(t);
      handle.current?.stop();
    };
  }, []);
  const toggle = (file: string) => {
    handle.current?.stop();
    if (playing === file) {
      setPlaying(null);
      return;
    }
    handle.current = playSong(file, { level: 0.9, onEnd: () => setPlaying(null) });
    setPlaying(file);
  };
  const problems = musicProblems();
  return (
    <>
      <ul className="music-list">
        {MUSIC_FILES.map(([file, use]) => (
          <li key={file} className={hasTrack(file) ? 'music-list--have' : ''}>
            {hasTrack(file) ? (
              <button type="button" className="music-play" onClick={() => toggle(file)} aria-label={playing === file ? `Stop ${file}` : `Play ${file}`}>
                {playing === file ? '■' : '▶'}
              </button>
            ) : (
              <span className="music-missing" aria-hidden="true">
                ·
              </span>
            )}{' '}
            <code>{file}.mp3</code> {use}
          </li>
        ))}
      </ul>
      <p className="parent-hint">
        Sound check: {audioState() === 'running' ? 'sound is on' : `sound is ${audioState()} (tap anything to start it)`}. Tap ▶ to hear a track on
        this phone. No ticks above? The phone has an older version: close the app completely (swipe it away) and open it again.
        <br />
        This version: {new Date(__BUILD_TIME__).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        {problems.length > 0 && (
          <>
            <br />
            Couldn't load: {problems.join('; ')}
          </>
        )}
      </p>
    </>
  );
}

/** Afrikaans: which voice says the words, and where each word is in its spaced repetition */
function AfrikaansCard() {
  useProgress();
  const voice = narrator.languageVoice('af');
  const day = today();
  const rows = afrikaansWords.map((w) => ({ ...w, s: progress.item(`afrikaans/${w.key}`) }));
  const learned = rows.filter((r) => isLearned(r.s)).length;
  const met = rows.filter((r) => r.s?.box).length;
  const when = (due?: string) => {
    if (!due || due <= day) return 'today';
    const days = Math.round((new Date(due).getTime() - new Date(day).getTime()) / 86400000);
    return days === 1 ? 'tomorrow' : `in ${days} days`;
  };
  return (
    <section className="parent-card">
      <h2>Afrikaans</h2>
      <p className="parent-hint">
        Touch the word, run by spaced repetition: a new word comes on its own with its meaning, then comes back after longer and longer gaps
        (same day, next day, 2 days, 4, a week, 2 weeks). It counts as learned once she gets it right on {LEARNED_BOX} different days. Up to 2 new
        words a day, and none while 3 are still being learned. She chooses from {choicesFor(learned)} picture{choicesFor(learned) > 1 ? 's' : ''}{' '}
        now (2 from 3 learned words, 3 from 6, 4 from 10). It's in Today's lessons every day.
      </p>
      <p className="parent-hint">
        Voice for the words:{' '}
        {voice.match === 'own'
          ? `${voice.name} (Afrikaans).`
          : voice.match === 'close'
            ? `${voice.name}: Dutch, the closest this phone has. Recording the words yourself will sound best.`
            : 'none on this phone, so please record the words.'}{' '}
        To record a word, save it as <code>src/recordings/af.word.&lt;word&gt;.mp3</code>, e.g. <code>af.word.hond.mp3</code> (🎙️ = recorded; voël is{' '}
        <code>af.word.voel.mp3</code>).
      </p>
      <p className="parent-hint">
        Met {met} of {rows.length} words, learned {learned}.
      </p>
      <table className="clip-table">
        <thead>
          <tr>
            <th />
            <th>Word, and where she is</th>
            <th>File name</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td>{r.emoji}</td>
              <td>
                <b>{r.af}</b> ({r.en}) {narrator.hasRecording(`af.word.${r.key}`) ? '🎙️' : ''}
                <br />
                <span className={isLearned(r.s) ? 'af-learned' : 'af-status'}>
                  {!r.s?.box ? 'not met yet' : isLearned(r.s) ? `✓ learned (box ${r.s.box}), next ${when(r.s.due)}` : `learning (box ${r.s.box}), next ${when(r.s.due)}`}
                </span>
              </td>
              <td>
                <code>af.word.{r.key}.mp3</code>
              </td>
              <td>
                <button type="button" className="parent-btn parent-btn--small" onClick={() => void narrator.say([`af.word.${r.key}`])}>
                  Play
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/** Save all her progress to a file, and bring it back (new phone, cleared browser) */
function BackupCard() {
  const [message, setMessage] = useState('');
  const KEYS = ['little-learners', 'little-learners-clock', FAMILY_KEY];
  const save = () => {
    const data: Record<string, unknown> = { app: 'little-learners', saved: new Date().toISOString() };
    for (const k of KEYS) {
      const v = localStorage.getItem(k);
      if (v) data[k] = JSON.parse(v);
    }
    const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `little-learners-backup-${today()}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    setMessage('Backup saved to your downloads.');
  };
  const restore = async (file: File | undefined) => {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data.app !== 'little-learners' || !data['little-learners']?.profiles) throw new Error('not a Little Learners backup');
      for (const k of KEYS) if (data[k] !== undefined) localStorage.setItem(k, JSON.stringify(data[k]));
      setMessage('Restored. Starting again…');
      window.setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      setMessage(`Couldn't restore that file (${e instanceof Error ? e.message : 'unreadable'}).`);
    }
  };
  return (
    <section className="parent-card">
      <h2>Backup</h2>
      <p className="parent-hint">
        Everything she has done (progress, stickers, Afrikaans words, settings, her details and family photos) is kept on this phone, in the browser. The app asks the
        browser never to clear it, but clearing Chrome's data would. Save a backup now and then; restore it on a new phone or after clearing.
      </p>
      <div className="rest-panel-buttons">
        <button type="button" className="parent-btn" onClick={save}>
          Save a backup
        </button>
        <label className="parent-btn">
          Restore from a backup
          <input type="file" accept="application/json,.json" hidden onChange={(e) => void restore(e.target.files?.[0])} />
        </label>
      </div>
      {message && <p className="parent-hint">{message}</p>}
    </section>
  );
}

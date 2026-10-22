import { narrator } from '../../shared/audio/narrator';
import { progress, useProgress } from '../../shared/progress/store';
import type { Navigate } from '../App';
import { findSection, gameKey } from '../registry';
import { AIMS, AREAS, STAGES, type Aim } from '../report';
import { MISSIONS } from '../missions';
import { ageOf } from '../aboutMe';
import { hasName } from '../name';

/**
 * Grown-ups: the "Ready for Grade R" report in the NCF's words. For each aim:
 * what her games show, things you have seen her do, the stage she is at (your
 * choice, with a suggestion), and a note. Printable for her school.
 */

interface GameEvidence {
  key: string;
  title: string;
  section: string;
  done: number;
  levels: number;
  played: boolean;
}

function evidence(aim: Aim): GameEvidence[] {
  const out: GameEvidence[] = [];
  for (const key of aim.games) {
    const [sectionId, gameId] = key.split('/');
    const section = findSection(sectionId);
    const game = section?.games.find((g) => g.id === gameId);
    if (!section || !game) continue;
    const g = progress.game(gameKey(sectionId, gameId));
    out.push({
      key,
      title: narrator.allClips()[game.titleClip] ?? gameId,
      section: narrator.allClips()[section.titleClip] ?? sectionId,
      done: Math.max(0, g.bestCompleted + 1),
      levels: game.levels.length,
      played: g.timesPlayed > 0 || g.bestCompleted >= 0 || (g.roundsDone ?? 0) > 0,
    });
  }
  return out;
}

/** A suggestion from her games and your ticks (never "Beginning": that's for babies) */
function suggest(games: GameEvidence[], ticked: number, ticks: number): number | null {
  const parts: number[] = [];
  if (games.length) parts.push(games.reduce((a, g) => a + g.done / g.levels, 0) / games.length);
  if (ticks) parts.push(ticked / ticks);
  if (!parts.length || parts.every((p) => p === 0)) return null;
  const f = parts.reduce((a, b) => a + b, 0) / parts.length;
  return f < 0.25 ? 1 : f < 0.7 ? 2 : 3;
}

export function ReportScreen({ navigate }: { navigate: Navigate }) {
  const saved = useProgress();
  const profile = saved.profiles[saved.activeProfileId];
  const report = profile.report ?? {};
  const age = ageOf(profile.aboutMe?.birthday);
  const name = hasName(profile.name) ? profile.name : 'Your child';
  const missionsDone = (area: string) => Object.values(profile.missions ?? {}).filter((m) => m.done && MISSIONS.find((x) => x.id === m.id)?.area === area).length;

  return (
    <main className="parent report">
      <header className="parent-header no-print">
        <h1>Ready for Grade R</h1>
        <div className="report-actions">
          <button type="button" className="parent-btn" onClick={() => window.print()}>
            🖨️ Print or save as PDF
          </button>
          <button type="button" className="parent-btn" onClick={() => navigate({ name: 'parent' })}>
            Back
          </button>
        </div>
      </header>

      <section className="parent-card report-title">
        <h1 className="print-only">Ready for Grade R</h1>
        <p>
          <b>
            {name}
            {profile.aboutMe?.surname ? ` ${profile.aboutMe.surname}` : ''}
          </b>
          {age !== undefined && <> · {age} years old</>} · {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p className="parent-hint">
          Organised by the National Curriculum Framework for children from birth to four (NCF): six Early Learning and Development Areas, each with its aims.
          As the NCF asks, there are no marks: for each aim, the stage she is at (Beginning, Moving on, Advancing further, Ready for Grade R) and comments.
          Her games give a suggestion; you decide. Tick things you have seen her do away from the screen.
        </p>
      </section>

      {AREAS.map((area) => {
        const aims = AIMS.filter((a) => a.area === area.id);
        const interests = report[`area:${area.id}:interests`]?.note ?? '';
        const next = report[`area:${area.id}:next`]?.note ?? '';
        const missions = missionsDone(area.id);
        return (
          <section key={area.id} className="parent-card report-area">
            <h2>
              {area.icon} {area.title}
            </h2>
            {missions > 0 && <p className="parent-hint">🔍 Missions done in this area: {missions}</p>}
            {aims.map((aim) => {
              const games = evidence(aim);
              const ticked = aim.ticks.filter((_, i) => (report[`${aim.id}#${i}`]?.stage ?? 0) > 0).length;
              const hint = suggest(games, ticked, aim.ticks.length);
              const stage = report[aim.id]?.stage ?? 0;
              const note = report[aim.id]?.note ?? '';
              return (
                <div key={aim.id} className="report-aim">
                  <h3>{aim.title}</h3>
                  <p className="report-ready">
                    <b>Towards Grade R:</b> {aim.ready}
                  </p>
                  {games.length > 0 && (
                    <ul className="report-games">
                      {games.map((g) => (
                        <li key={g.key}>
                          <span className="report-game-name">
                            {g.title} <small>({g.section})</small>
                          </span>
                          <span className="report-bar" aria-hidden="true">
                            <span style={{ width: `${(g.done / g.levels) * 100}%` }} />
                          </span>
                          <span className="report-game-level">{g.done >= g.levels ? 'all levels ✓' : g.played || g.done ? `level ${g.done} of ${g.levels}` : 'not tried yet'}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <ul className="report-ticks">
                    {aim.ticks.map((t, i) => {
                      const on = (report[`${aim.id}#${i}`]?.stage ?? 0) > 0;
                      return (
                        <li key={t} className={on ? 'report-tick--on' : 'report-tick--off'}>
                          <label>
                            <input type="checkbox" checked={on} onChange={(e) => progress.setReport(`${aim.id}#${i}`, e.target.checked ? 1 : 0)} />
                            {t}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="report-stages" role="radiogroup" aria-label="Stage">
                    {STAGES.map((s, i) => (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={stage === i + 1}
                        className={`report-stage ${stage === i + 1 ? 'report-stage--on' : ''} ${!stage && hint === i ? 'report-stage--hint' : ''}`}
                        onClick={() => progress.setReport(aim.id, stage === i + 1 ? 0 : i + 1, note || undefined)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {!stage && hint !== null && <p className="parent-hint no-print">Her games and your ticks suggest: {STAGES[hint]}</p>}
                  <textarea
                    className="parent-input report-note"
                    placeholder="A comment (what she can do, what she enjoys)"
                    defaultValue={note}
                    onBlur={(e) => progress.setReport(aim.id, stage, e.target.value.trim() || undefined)}
                  />
                </div>
              );
            })}
            <div className="report-area-notes">
              <label>
                <b>Her interests in this area</b>
                <textarea className="parent-input report-note" defaultValue={interests} onBlur={(e) => progress.setReport(`area:${area.id}:interests`, 0, e.target.value.trim() || undefined)} />
              </label>
              <label>
                <b>We will give her chances each day to…</b>
                <textarea className="parent-input report-note" defaultValue={next} onBlur={(e) => progress.setReport(`area:${area.id}:next`, 0, e.target.value.trim() || undefined)} />
              </label>
            </div>
          </section>
        );
      })}
    </main>
  );
}

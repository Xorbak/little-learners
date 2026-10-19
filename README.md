# Little Learners

An educational play space for a 3–4 year old, built with React and TypeScript.

## Run it

```bash
npm install
npm run dev        # opens on http://localhost:5173
```

To try it on a tablet on the same Wi-Fi: `npm run dev -- --host`, then open the "Network" address it prints.

## How it's organised

```
src/
├── app/            Screens and navigation (start, home, section, game, grown-ups area)
│   └── registry.ts Finds every section automatically
├── engine/         Game mechanics, reusable by any section
│   └── pop-balloons/
├── sections/       One folder per learning area
│   ├── numbers/    characters.tsx (the number "characters"), games/
│   └── colours/
├── shared/
│   ├── audio/      Narrator (your recordings, or text-to-speech), sound effects
│   ├── progress/   Saved progress, adaptive practice
│   └── ui/         Buttons, celebration, parent gate
├── recordings/     Drop your voice recordings here
└── types/          Shared TypeScript types
```

### Add a level
Add an entry to the `levels` list in a game file, e.g. `src/sections/numbers/games/popBalloons.ts`.

### Add a section (Letters, Shapes...)
Create `src/sections/<name>/index.ts` that default-exports a `Section`. It appears on the home screen automatically.

### Add a game mechanic (Feed Me, Paint Bucket...)
1. Add its config type to `ActivityConfig` in `src/types/learning.ts`
2. Build it in `src/engine/<name>/`
3. Register it in `src/engine/index.ts` (TypeScript reminds you if you forget)

### Record your voice
See `src/recordings/README.md`. Name each file after its clip id (e.g. `pop.pop-all-the.mp3`, `numbers.plural.1.mp3`).
The full list is in the app's grown-ups area under **Recording checklist**. Anything not recorded uses text-to-speech.

## Grown-ups area
Hold the small gear button on the home screen for 3 seconds. You can choose levels, pick the voice and speed,
see which numbers and colours she knows, and see which clips still need recording.

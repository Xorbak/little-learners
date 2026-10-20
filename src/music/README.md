# Music

Songs and background music (made with Suno; the prompts are in the project doc "Suno prompts").
Save each one here with the file name below. The app uses whatever is here and works without the
rest: missing calm tracks keep the music made in code, a missing jingle keeps the fanfare sound.

| File | Plays |
|---|---|
| `calm-stars.mp3` | Calm corner: starry night (instead of the music made in code) |
| `calm-leaves.mp3` | Calm corner: falling leaves |
| `calm-ocean.mp3` | Calm corner: under the sea |
| `calm-rain.mp3` | Calm corner: gentle rain |
| `calm-fireflies.mp3` | Calm corner: fireflies |
| `bg-home.mp3` | Home screen, section menus, Today's lessons, stickers, missions |
| `bg-art.mp3` | Paint by Numbers |
| `bg-thinking.mp3` | Thinking games (puzzles, memory, sorting, patterns…) |
| `bg-move.mp3` | Exercise breaks |
| `jingle-win.mp3` | Level done, picture or puzzle finished (instead of the fanfare) |
| `song-break.mp3` | Time's up: after the sleepy owl has spoken, once |
| `song-move.mp3` | Sing along; the dance mission |
| `song-count.mp3` | Sing along; counting missions |
| `song-colours.mp3` | Sing along; colour-hunt missions |
| `song-tidy.mp3` | Sing along; the tidy-up mission |
| `calm-breathe-song.mp3` | Sing along |

- `.mp3`, `.m4a`, `.ogg` and `.wav` all work. Refresh the app (or rebuild) and it is used.
- Background music loops with a 4-second crossfade, so tracks don't need a perfect loop. It plays
  quietly, goes quieter while the narrator talks, and stops while a song plays.
  Grown-ups → Music and songs turns it off, and shows which files are in.
- Songs show up in Art and music → Sing along once their file is here; the words shown while a
  song plays are in `src/app/songs.ts` (change them there if a song was made with other words).
- Smaller files load faster on phones: about 2 minutes is plenty for a background loop.
  The app is public, so anyone with the link can download what is in here.

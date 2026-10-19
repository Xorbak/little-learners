/**
 * Your own pictures, found automatically in src/pictures/ (like recordings).
 * pictureFor('words/cat') gives the URL of src/pictures/words/cat.png, if it exists.
 */
const files = import.meta.glob('../pictures/**/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const pictures: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const key = path.replace('../pictures/', '').replace(/\.[^.]+$/, '').toLowerCase();
  pictures[key] = url;
}

export const pictureFor = (key: string): string | undefined => pictures[key.toLowerCase()];

/** Every picture in a folder, e.g. picturesIn('puzzles') → [{ name: 'unicorn-land', url }] */
export const picturesIn = (folder: string): { name: string; url: string }[] =>
  Object.entries(pictures)
    .filter(([key]) => key.startsWith(`${folder.toLowerCase()}/`))
    .map(([key, url]) => ({ name: key.slice(folder.length + 1), url }))
    .sort((a, b) => a.name.localeCompare(b.name));

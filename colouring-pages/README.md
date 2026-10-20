# Colouring pages → Paint by Numbers

Put a colouring page here and run `npm run colouring`. It appears in the Paint by Numbers gallery.

For each picture (use a short name with no spaces, e.g. `unicorn`):

- `unicorn.png` (or `.jpg`): the colouring page. Bold black outlines on white, every area closed, no shading. Square or landscape, about 1500 px or larger.
- `unicorn-coloured.png` (recommended): the same picture coloured in with flat colours. Each area's colour is taken from it and snapped to the app's paint colours (light purple → purple, pale green → green, and so on). White areas are left as paper.
- `unicorn.json` (optional) settings:

```json
{ "name": "magic unicorn", "max": 12, "colours": { "3": "pink" } }
```

  - `name`: what the narrator calls it (default: the file name)
  - `max`: most areas to paint (default 14); the smallest extra ones are painted in already
  - `colours`: fix an area's colour by its number (the numbers are printed when you run the script)
  - `threshold` (default 150): raise it if faint lines are missed
  - `close` (default 2): raise it to close bigger gaps in the lines
  - `minTap` (default 0.022): smallest tappable area, as a fraction of the width
  - `paintWhite`: true to make white areas paintable too
  - `keep`: colours from the coloured version that are painted in already instead of left for her, e.g. `["#fcd5b5"]` for skin (there is no skin-colour paint pot). Any area close to one of these colours is pre-painted with its own colour.

Without a coloured version every area gets a stand-in colour; set them with `colours`.

A page with the same name as an existing picture replaces it (her ⭐ stays).

The pages in here were drawn in code (`art/colouring/*.mjs`, rendered with `node art/render-colouring.mjs`). Your own pages just go in as image files.

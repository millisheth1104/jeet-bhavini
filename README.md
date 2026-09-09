# Jeet &amp; Bhavini — Wedding Invitation

A bilingual (Gujarati / English) digital wedding invitation.
**1–2 December 2026, Gandhidham.**

No build step, no framework. Open `index.html` through a local server and it runs.

```bash
python scripts/devserver.py 5179
```

Then visit <http://localhost:5179>.

> Use `devserver.py`, not `python -m http.server` — the latter sends
> `Last-Modified`, so browsers keep serving stale images after you edit an asset
> and it looks like your change did nothing.

## Editing content

**Every word and date lives in [`content.js`](content.js).** Nothing is
hard-coded in the markup. Any field left as `""` hides itself, and a section
with nothing to show removes itself, so it is safe to leave details blank until
you have them.

Currently blank and awaiting details: the **venue** (both in `headline` and on
each event), **dress code**, and per-event `mapsUrl`.

| File | Role |
|---|---|
| `index.html` | Page shell and the inline SVG ornament library |
| `styles.css` | Palette, type scale, layout, all motion |
| `content.js` | **Single source of truth for copy and dates** |
| `main.js` | Rendering, scroll reveal, countdown, gallery, calendar |
| `assets/wedding.ics` | All four events, for Apple/Outlook |
| `BUILD_LOG.md` | Full history, including every bug and why it happened |

## Sections

Intro (elephant rings the bell) → hero → invitation → **અમારા પ્રસંગો / events**
→ families → gallery → RSVP → countdown → compliments.

Add `?hold` to the URL to freeze the intro screen instead of letting it
auto-dismiss.

## Artwork

The illustrations are generated through [fal.ai](https://fal.ai) and committed
to `assets/generated/`. You do not need a key to run the site — only to
regenerate art.

```bash
export FAL_KEY="your-key"           # never commit this
python scripts/gen_assets.py --list # see every asset
python scripts/gen_assets.py mogra_long
python scripts/trim_alpha.py        # crop cutouts to their alpha bounds
python scripts/gen_bird_frames.py a # rebuild a bird's wingbeat frames
```

Two notes that cost real time to learn, both explained in `BUILD_LOG.md`:

- Thin subjects (flower garlands, filigree) must be matted with **BiRefNet**,
  not `rembg`, which shreds them.
- Multi-frame character animation must come from **one sprite-sheet image**
  sliced into frames. Separate generations give a different bird each time, and
  seed-locking keeps the bird but makes the model ignore the pose change.

## Fonts

Cormorant Garamond, Jost, Noto Serif Gujarati, Rasa, Great Vibes — all Google
Fonts, loaded from the CDN.

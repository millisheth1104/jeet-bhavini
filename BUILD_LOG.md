# Build Log — Jeet × Bhavini Wedding Site

## 2026-09-09 — Asset pipeline + illustration pack

### Done

**Design reference established.** Analysed the Instagram reel
(`instagram.com/reel/DaU1wr-TItF`, @shaadipath) frame by frame — a scroll-driven
digital wedding invite microsite. Mapped its 8 sections and motion model.
Then took direction from two Pinterest pins, which superseded the reel's
visual style while keeping its scroll behaviour.

**Locked art direction: blend.**
- Shell from pin 1 — pale grey-ivory ground (`#F2F1ED`), hanging mogra
  garlands, banana palm, brass kalash/elephant/lotus bowl, high-contrast
  modern serif names, letterspaced dusty-rose labels.
- Events from pins 2/3 — one card per event, each with its own accent colour,
  its own illustrated object, and a large **Gujarati** title plus English
  tagline.
- Motion from the reel — reveal-on-scroll (fade + 24px rise, 0.7s, 80ms
  stagger), parallax on garlands and palm, palette inversion to navy at RSVP.

**Content extracted** from `Wedding Invite Details.xlsx` and the three Gujarati
કંકોત્રી images. Note: the spreadsheet's `Bride Side` / `Groom Side` column
headers are swapped — corrected against the Gujarati લી. સ્નેહાધીન list, which
places જીત અરવિંદભાઈ જબુઆણી among the hosting men. **Flagged to user for
confirmation.**

**Asset pipeline built** — `scripts/gen_assets.py`, fal.ai FLUX-dev + matting.
- Single shared `BASE` style string so all 20 renders read as one hand.
- Two matting backends: `rembg` for solid props, **BiRefNet** for thin
  structures. This mattered: the first pass ran everything through rembg and it
  shredded all three mogra garlands (34–58 KB of fragments). Re-run on BiRefNet
  with denser prompts on a mid-grey ground → 224–552 KB, clean alpha.
- 5-way parallel, retries transient errors but not 4xx.
- Reads `FAL_KEY` from environment. **Key is not stored in the repo.**

**20 generated assets** in `assets/generated/` (8.6 MB) — all reviewed on a
contact sheet, all passing.

**2 hand-authored SVG ornaments** in `assets/ornaments/` —
`divider-rule.svg`, `photo-frame.svg`. Pure geometry mattes badly and vector
stays crisp and recolourable at ~1 KB. Both driven by `--brass` / `--rose`
custom properties, so **they must be inlined in the HTML, not loaded via
`<img>`** — an `<img>`-referenced SVG is style-isolated and would fall back to
its hard-coded defaults.

**Photos and source images** filed into `assets/photos/` and `assets/source/`.

### Decisions worth remembering

- `DATE` / `TIME` / `VENUE` row icons will be inline SVG, not generated —
  crisper at 16px and consistent in weight.
- The site is **bilingual**. Needs a real Gujarati webfont (Noto Serif
  Gujarati or Hind Vadodara); the Latin serif stack has no Gujarati coverage.
- 4 events, not 5. હસ્તમેળાપ (5:41 pm) is a *timing within* લગ્ન, alongside
  Bharat Prastan (4:00 PM) and Bharat Aagman (5:00 PM).

### Reproduce

```bash
export FAL_KEY="..."          # not committed
python scripts/gen_assets.py            # all 20
python scripts/gen_assets.py mogra_long # one
python scripts/gen_assets.py --list
python scripts/trim_alpha.py            # crop cutouts to alpha bounds
```

---

## 2026-09-09 — Site built

Confirmed with the user: **Jeet is the groom.** Taglines drafted and approved
in the same message.

### Files

| File | Role |
|---|---|
| `index.html` | Shell + inline SVG ornament/icon library |
| `styles.css` | Palette, type scale, layout, scroll-reveal |
| `content.js` | **Single source of truth for every word and date** |
| `main.js` | Rendering, reveal, parallax, countdown, gallery, calendar |
| `assets/wedding.ics` | All four events, for Apple/Outlook |
| `scripts/devserver.py` | Static server that sends `no-store` |
| `scripts/trim_alpha.py` | Crops cutouts to their alpha bounds |

Page weight excluding images: **72 KB**. Generated art 8.3 MB, photos 8.8 MB.

### Sections

Hero → Invitation → Our Events (4 cards) → Families → Gallery →
Things to Know → RSVP → Countdown → Compliments → Footer.

Empty fields in `content.js` hide themselves; a section with nothing to show
removes itself. Right now that means **Things to Know renders only the Hashtag
card** — Dress Code, Venue and Accommodation are deliberately blank.

### Bugs found and fixed while building

1. **Garlands invisible.** Sized by width (`52px`), but the PNGs are tall with
   transparent margins, so only a stub of empty padding was on screen. Root
   cause was the padding itself → wrote `scripts/trim_alpha.py` to crop every
   cutout to its alpha bbox (`mogra_long` 576×1024 → 155×994, 26% of area).
   Garlands are now sized by **height**, which is what actually reads.
2. **Stale assets after trimming.** `python -m http.server` sends
   `Last-Modified`, so the browser kept serving old PNGs and silently hid the
   fix. Replaced with `scripts/devserver.py`, which sends `no-store`.
3. **Event motifs never alternated.** `.event:nth-child(even)` never matched,
   because the garland swags inserted between cards make every `.event` an odd
   child. Changed to `:nth-of-type(even)`.
4. **Icons rendered as fragments.** The four inline `<svg><use/></svg>` icon
   holders had no `viewBox`, so they defaulted to 100×100 user units and
   cropped a 24×24 icon. Added `viewBox="0 0 24 24"`.
5. **Gallery frame filigree distorted.** One 400×520 frame SVG stretched with
   `preserveAspectRatio="none"`. Rebuilt as CSS borders + four fixed-size
   corner ornaments.
6. **`01` read as `OI`.** Cormorant Garamond defaults to oldstyle figures.
   Forced `lining-nums tabular-nums` on the date numeral and countdown.
7. **`.ics` via `data:` URL.** Works on desktop but iOS Safari refuses to hand
   a `data:` URL to Calendar — and most guests open WhatsApp links on phones.
   Replaced with a real `assets/wedding.ics` served as `text/calendar`.

### Verified

- No console errors, no 404s, no broken images, no horizontal overflow.
- Google Calendar stamp `20261202T121100Z` = 5:41 PM IST. Correct.
- WhatsApp deep link resolves with country code (`917738047555`).
- `.ics` is CRLF per RFC 5545 and served as `text/calendar`.
- Gujarati resolves to Noto Serif Gujarati; `.gu` gets extra line-height for
  matras.
- Event accents correct: sage / charcoal / terracotta / magenta.
- લગ્ન card carries all three timings; the others carry one.
- Motifs alternate left/right/left/right at ≥780px.
- One `<h1>`, every `<img>` has `alt`, `prefers-reduced-motion` disables all
  transforms and transitions.

### Still open

- **Venue, dress code and accommodation are blank** — fill in `content.js`.
  Add `mapsUrl` per event to surface the "Open in Maps" buttons.
- **Gallery has 2 photos**, both from the same beach shoot, and the couple sits
  small in a `4/5` crop. More photos in `assets/photos/` + a `content.js` entry.
- **Music button hides itself** unless `assets/audio/theme.mp3` exists.
- The Gujarati કંકોત્રી sponsor panel is reproduced in English; the
  "With Best Compliments From" source image is in `assets/source/`.
- `motif_baraat` is generated but unused — the લગ્ન card uses `motif_lagna`.
  Available if a બારાત card is wanted.

### Run

```bash
python scripts/devserver.py 5179
```

Then open <http://localhost:5179>.

---

## 2026-09-09 — Round 2: intro screen, birds, reference-exact cards, oxblood

Five changes requested off the first build.

### 1. Intro screen with the elephant ringing the bell

New full-screen `#intro` overlay, shown on load and removed after 4.2s (tap
anywhere, Esc/Enter, or the Skip button dismisses it early; `prefers-reduced-
motion` skips straight past). This also absorbed the hero's empty space.

Three separate layers — `intro_backdrop`, `intro_elephant`, `intro_bell` — so
the elephant and bell can animate against a static scene. The backdrop was
generated with its centre deliberately empty for them to occupy.

**Aligning the trunk to the bell was the fiddly part.** Rather than eyeball
percentages that drift with viewport, the trunk tip was measured off the PNG
itself: the topmost opaque pixel of `intro_elephant.png` *is* the raised trunk
tip, at **85.5% across, 0% down**. Both images then go inside `.intro__pair`,
an aspect-locked box one elephant-width wide, so the bell's centre lands on
85.5% at every size. Verified in the browser: **dx 5px, dy 10px.**

The motion is one shared 3.6s timeline. The elephant lifts onto its front feet
at 58%; the bell is struck at 57% and swings 12° → -8.5° → 5.5° → -3.4° → 2°,
damping out by 100%. Because both animations share a duration and delay, the
swing always reads as a consequence of the reach.

### 2. Birds

`bird_a` and `bird_b` cross the names on long (26s / 33s) loops, drifting up
and down and fading out off-screen for roughly half the cycle so the hero stays
calm. Both source birds face right, so one is flipped with `scaleX(-1)`.

### 3. Larger hero elements

Garlands ~27% taller, palm ~33% wider, brass props ~34% wider. The hero's
palace wash was dropped from `.16` to `.1` opacity because the bigger elements
made it compete with the names.

### 4. Event cards rebuilt to the reference

Replaced `.event` with `.ecard`, matching the reference card anatomy exactly:

- Aged parchment ground with a faint palace elevation behind the copy
- **Gujarati title large and flush left** in **Rasa 600** (a display Gujarati
  serif — heavier and more calligraphic than Noto, which is what the reference
  uses), 2.5–3.9rem
- **English name in Great Vibes script**, tucked up under it (`-.28em`) and
  offset right (`padding-left: 1.9em`), in a *different colour* from the title
- Left-aligned `02 | December / 4:00 PM`, numeral in the accent colour
- Centred venue, then the illustrated object anchored at the bottom
- Hanging lanterns on alternating cards, swaying on a 7s loop

Two new webfonts: **Rasa** and **Great Vibes**.

Layout is capped at **two columns** (`max-width: 46rem`) — at three, the fourth
card stranded alone on its own row. Alternate cards are offset ~41px vertically
for the hand-laid feel of the reference set.

### 5. Blue → oxblood

`--night` `#101C3A` → `#3B1220`, `--night-deep` → `#260A15`. Regenerated the
sky as `night_sky_warm` (deep burgundy, prompted with "absolutely no blue").
Locket numerals and the floating controls' dark state were re-toned to match.
**All four night tones are variables — change them in one place.**

### Also fixed

- Stray Gujarati inside Latin sans runs (the હસ્તમેળાપ label) fell back to
  whatever the OS picked. Noto Serif Gujarati now sits behind Jost in `--sans`.
- Card `min-height` reduced — with venue still blank, the cards left a large
  void above the motif.
- The magenta card had the same colour on both title lines; the English is now
  a lighter tint via `color-mix`.

### New dev affordance

`?hold` on the URL keeps the intro up instead of auto-dismissing, so it can be
inspected without racing the 4.2s timer.

### Verified

No console errors, no broken images, no horizontal overflow. Intro removes
itself and unlocks scroll. 4 cards, 2 birds, night = `rgb(59,18,32)`.
2×2 grid at 1100px with the alternating offset.

### Still open

Unchanged from round 1 — venue, dress code and accommodation are still blank in
`content.js`, and the gallery still has two photos.

---

## 2026-09-09 — Round 3: sections 1 & 2 rebuilt against the reel

User feedback, all three valid: the bell hung in mid-air, the elephant stood in
water, and the birds moved without flapping.

### What was actually wrong

1. **Bell in mid-air** — `intro_bell` was a bell on a long chain running up into
   open sky. Nothing anchored it, because the backdrop had no structure at that
   point to anchor to.
2. **Elephant in water** — `intro_backdrop` was generated with a long reflecting
   pool running down the centre, which is exactly where the elephant was placed.
   A prompt fault, not a CSS one.
3. **Birds not flapping** — they were single static PNGs being translated across
   the screen. No wing motion existed to begin with.

Also: both assets had come out semi-realistic, where the reel is flat
watercolour.

### Fixes

**Backdrop regenerated** as flat watercolour with a blue tiled dome and gold
finial, a cusped arch, **a carved beam with a hook at the arch apex**, and — the
key change — a **dry pale tiled courtyard** across the whole foreground, with
the lotus pool confined to the very bottom edge.

**Geometry read off the image rather than guessed.** A 10% grid was overlaid on
the backdrop to locate the arch apex (**50% across, 42% down**) and the
courtyard line (**80% down**). The trunk tip and bell hook were measured from
their alpha channels as before: trunk tip **25.4% / 0%**, bell hook **51%**.

`.intro__pair` is then an aspect-locked box (76.5 : 100) whose top is pinned to
the arch apex, with `translate: -25.4% 0` putting the bell's hook exactly on the
50% mark. Verified in-browser:

    archApex  [188, 270]      bellHook   [188, 270]     <- exact
    trunkTip  [188, 352]      bellBottom 354            <- touching
    feet      552             courtyard begins 514      <- on dry ground

**Birds now genuinely flap.** Each bird is a *pair* of frames generated with a
**fixed seed** and a minimal prompt delta (wings raised vs wings swept low), so
the same bird appears in both. `seed` support was added to `gen_assets.py`.

The frames must share identical framing or the bird jumps when they alternate —
`trim_alpha.py` crops each file to its own bounds, which is wrong here. Added
`scripts/crop_pairs.py`, which crops both frames by the **union** of their alpha
bounds, and a `SKIP` set in `trim_alpha.py` so it leaves animation frames alone.
Both pairs now share a canvas (647×599 and 480×543). The top frame's opacity is
stepped on and off every 260ms (300ms for the second bird, so they are not in
lockstep).

**Section 2 rebuilt too.** The faint sepia `palace_lineart` was replaced with
`hero_garden` — a watercolour Mughal charbagh with blue domes, a marble
fountain and cypresses, matching the reel's second screen. A radial scrim of the
paper colour sits behind `.hero__inner` so the names, date and venue stay
legible over the fountain.

### Verified

No console errors, no broken images, no horizontal overflow. Intro auto-removes.
4 bird frames, 2 flap animations running. Flap samples step 1→0 at the midpoint.

### Note on the palette

The intro pavilion and the hero garden use **blue domes**, per the reel. This is
not a contradiction of "no blue" — that instruction was about the RSVP/countdown
background, which remains oxblood.

---

## 2026-09-09 — Round 4: trims

Three removals/adjustments requested.

**Removed the Guest Essentials / "Things to Know" section.** Taken out of
`index.html`, `main.js`, `content.js` and `styles.css`, along with everything
that only existed to serve it: the `ic-dress` / `ic-pin` / `ic-haveli` /
`ic-hash` SVG defs, the `svgIcon()` helper, and the `.cards` / `.card` rules.

Note: `#JeetWedsBhavini` was displayed in that section's Hashtag card, but it
still appears in the **footer** and in the calendar event description, so it has
not been lost.

**Removed the mogra swag above the countdown lockets.**

**Countdown type scaled up** — numerals `1.15→1.7rem` min / `2→3rem` max
(28.5px at mobile, was 19.5px, +46%), unit labels `.42→.55rem` min / `.56→.8rem`
max (8.8px, was 5.6px, +57%). Grid gap tightened and max-width widened to
40rem so the larger digits still sit inside the lockets.

**Section flow is now:** hero → invitation → events → families → gallery →
RSVP → countdown → compliments. Page height 8222 → 7509.

**Three assets are now unreferenced** and were moved to `assets/unused/` with a
README rather than deleted, since regenerating costs a fal.ai call:
`mogra_swag.png`, `motif_baraat.png`, `divider_lotus.png`.

Verified: no console errors, no broken images, no horizontal overflow.

---

## 2026-09-09 — Round 5: hero arrangement matched to the reel

**Names lifted to the top.** `.hero` was `place-items: center`, which centred the
block vertically; the reel puts the names high with the garden filling the space
beneath. Now `place-items: start center` with a `13vh` top padding. Names sit at
**20% of the viewport**, down from ~44%.

**Birds are stationary and only beat their wings.** The `flyRight` / `flyLeft`
keyframes were removed entirely — they now hold position beside the names and
just flap, which is what the reel does.

**Birds enlarged** — bird A `clamp(72px, 17vw, 168px)`, bird B
`clamp(62px, 15vw, 146px)`, up from a shared `clamp(58px, 11vw, 118px)`.

Two things this surfaced:

- The shared `aspect-ratio: 1 / .92` on `.bird` was wrong. The two frame pairs
  were cropped to *different* shared boxes — 647×599 and 480×543 — so bird B is
  taller than wide. Aspect is now set per bird.
- Positioning by viewport percentage stranded them at the screen edges on a wide
  desktop. They are now anchored to the text column:
  `left: clamp(1.5rem, calc(50% - 19rem), 50%)`. The calc tracks the centre so
  they flank the names on a wide screen; the clamp floor keeps them on-screen on
  a narrow one.

Verified at 375px and 1200px: no clipping, no horizontal overflow, both `flap`
animations running, no console errors.

---

## 2026-09-09 — Round 6: the wingbeat actually works

User: "their wings are not moving properly". Correct — and the diagnosis was
worth having before changing anything.

### What was wrong

The two-frame approach produced **both frames with wings UP**. Measured: the
silhouette differed on only **19%** of the bird between frames, and most of that
was the *body* shifting, not the wings. So it read as a twitch.

Root cause: seed-locking and pose-change work against each other. The fixed seed
is what kept the bird consistent, and it is also what made FLUX ignore
"wings swept low" and merely re-pose the body.

### Two approaches tried and rejected

1. **Image-to-image** (`fal-ai/flux/dev/image-to-image`, strength 0.62, source
   fed as a base64 data URI). Preserved the bird beautifully — and still came
   back wings-up. FLUX's prior for "bird in flight" is strong enough to refuse a
   downstroke in this composition.
2. Separating the wing as its own layer to rotate in CSS. Would work, but needs
   a body with the wing removed, which means inpainting a hole in the back.

### What worked: one sprite sheet, sliced

Drawing all four wing positions **inside a single image** sidesteps the whole
problem — the model keeps the bird consistent within one canvas, and the wing
positions genuinely differ because nothing is fighting a seed.

`scripts/gen_bird_frames.py` does it end to end: generate a 4-cell sheet →
slice into equal columns → matte each cell with BiRefNet → crop every frame by
the **union** of their alpha bounds so the body stays put and only wings move.

Frame-to-frame silhouette change went from **19%** to **43–92%**.

The cycle is a ping-pong — folded → spread → raised → spread — driven by three
stacked images whose opacity is stepped on for its quarter. Verified in-browser
as `100 → 010 → 001 → 010`. Beats are 520ms and 600ms so the two birds are not
in lockstep.

Frames are landscape (232×158 and 205×196), so per-bird `aspect-ratio` was
updated and the widths raised again (to `clamp(92px, 21vw, 205px)` and
`clamp(78px, 18vw, 178px)`) to keep the rendered birds large.

`scripts/crop_pairs.py` was deleted — it existed only for the two-frame
approach, and `gen_bird_frames.py` now does the shared-box crop itself.
`trim_alpha.py`'s SKIP set covers `bird_[ab]_1..4`.

The old `bird_*_up/down.png` moved to `assets/unused/`.

Verified: no console errors, no broken images, no clipping, no overflow.

---

## 2026-09-09 — Wingbeat slowed, pushed to GitHub

**Birds slowed.** Cycle `.52s → .95s` (bird A) and `.6s → 1.15s` (bird B) —
roughly 4.2 and 3.5 frames per second, down from 7.7 and 6.7. Still offset from
each other so they never beat in lockstep.

**Published** to <https://github.com/millisheth1104/jeet-bhavini> — 59 files,
22 MB, on `main`.

Before pushing, the project was scanned for key material. The only hit was the
`export FAL_KEY="..."` placeholder in this log; **no real key is in the repo**.
`.gitignore` covers `.env*` and `*.key`. The generation scripts read `FAL_KEY`
from the environment.

Added a `README.md` covering how to run it, that `content.js` is the single
source of truth, which fields are still blank, and the two hard-won asset
lessons (BiRefNet for thin subjects; sprite sheets for animation frames).

### Privacy note

The repo is **public**, and this was raised with the user before pushing. They
chose to publish as-is. Publicly visible and search-indexable:

- `content.js` — the WhatsApp number `917738047555` and ~30 family names
  including 10 children's first names
- `assets/source/` — the three Gujarati કંકોત્રી images
- `assets/photos/` — the couple's engagement photos
- `Wedding Invite Details.xlsx` — the original spreadsheet, contact included

If that is ever reconsidered, note that making the repo private later does not
un-index what was already crawled; the contact number would need changing too.

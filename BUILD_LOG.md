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

---

## 2026-09-12 — Removed the tile lines across the site

User reported faint horizontal and vertical lines throughout. They were seams
from `paper_grain.png`, the only repeating background on the page
(`body`, `background-size: 520px`).

### Why it seamed

Measured on the original texture:

| | value |
|---|---|
| Top-vs-bottom edge mismatch | **15.9 levels** |
| Left-vs-right edge mismatch | 3.1 levels |
| Vignette (corners vs centre) | **18.5 levels** |

Two independent faults. The edge mismatch drew the lines; the vignette made the
whole 520px grid readable as a field of patches even away from the seams. The
second is the more visible of the two and is easy to miss.

### Two attempts

**High-pass + mirror-tile.** Killed both faults numerically — edge mismatch
0.00, vignette 0.6 — but mirroring puts a *crease* down the middle of every
tile, where the shading reverses direction. Side-by-side against the original
this was clearly still lined, just differently. Rejected.

**Synthesised grain, wraparound-blurred.** `scripts/make_seamless.py` now
generates the tile instead of repairing one:

- noise is tiled 3×3 *before* blurring and the centre cropped back out, so the
  blur kernel wraps at the edges rather than running off them — seamless by
  construction, with no mirror symmetry
- a heavily blurred copy is subtracted, leaving only fine grain and no
  low-frequency structure to form a grid
- output is centred near white (mean 249.5) so the `multiply` blend stays a
  whisper

Verified by comparing the tile join against the tile interior — if a join is
seamless, a neighbouring-pixel difference across it should look exactly like one
anywhere else:

```
neighbour diff   interior  H 1.58  V 1.60
                 at join   H 1.78  V 1.54
ratio                      H 1.07  V 0.98      (1.0 = indistinguishable)
```

Vignette 18.5 → **0.12**. `background-size` now 640px, matching the tile 1:1.

Confirmed visually against the original on an isolation page, then on the live
site at the invitation, events and families sections — no lines anywhere.

Tuned to `--amp 2.6 --grain 1.7` (grain sd 2.6 levels); those are baked in as
the script defaults so a rerun reproduces this exact tile (fixed seed).

---

## 2026-09-13 — Events rebuilt as five invitation cards; paper warmth restored

### 1. The site's warmth came back

User: *"the whole site's vibe was changed yesterday when I asked to remove the
line."* Correct, and it was a regression I introduced, not a style choice.

The seam fix replaced the warm cream paper texture with a **greyscale** one
(`250, 250, 250`). That tile multiplies over `--paper`, so it drained the warmth
out of every section at once — the ground went from warm ivory to pale grey:

```
effective ground before the seam fix : warm ivory
effective ground after  the seam fix : rgb(237, 236, 232)   <- neutral
effective ground now                 : rgb(237, 231, 216)   <- warm ivory
```

`make_seamless.py` now carries the grain into three warm-tinted channels
(`TINT = (1.0, 0.978, 0.933)`) instead of shipping grey. Seamlessness is
unaffected — join/interior ratio is still 1.07.

**Lesson:** a texture used with `background-blend-mode: multiply` is not a
neutral overlay. Making it greyscale desaturates everything under it.

### 2. Events section rebuilt to the reference card set

Four real ceremonies plus the central invitation — **five separate cards**, each
its own element rendered from its own entry in `content.js`, independently
editable and clickable. Not one composite image.

The spec asked for Hindi Mehndi/Haldi cards, which this wedding does not have,
while also saying not to invent event information. Confirmed with the user:
real Gujarati events win. **Tiro Gujarati** rather than Tiro Devanagari Hindi —
same family and feel, but the Devanagari face has no Gujarati glyphs and would
have rendered every title as boxes.

Matched to the reference, point by point:

| Reference | Implementation |
|---|---|
| No keyline at all | borders removed; the card is just the sheet |
| Title nearly spans the card | `clamp(3.2rem, 19cqw, 5rem)` in Tiro Gujarati |
| Title in the event colour | `--ink-c` per card |
| English in **warm orange**, offset right | `--ink-en`, Playfair Display italic, `padding-left: 1.5em` |
| Full-bleed sepia architecture | `card_wash_a/b/c`, `cover`, 22% multiply |
| Big numeral \| month over time | `.inv__day` + `.inv__md` with a rule between |
| Large illustration across the foot | `clamp(150px, 80%, 240px)` |
| Hanging ornaments on some cards | `orn_hanging`, alternating |

Type inside a card scales with **the card** (`container-type: inline-size`,
`cqw` units), not the viewport, so a card reads identically whether it is one of
five across or alone on a phone.

Layout: 1 per row on mobile, 2–3 on tablet, five across on desktop with
per-card rotation and vertical offset so they sit like sheets laid on a table.
Hover straightens and lifts the sheet. Clicking opens that event's details in a
dialog built from the same data — Esc and backdrop-click close, focus returns to
the card.

### New assets

`card_paper_a/b/c` (the generated sheets came with printed borders baked in, so
only the borderless centres are kept), `card_wash_a/b/c`, `ill_mameru`,
`ill_sangeet`, `ill_mandap`, `ill_lagna`, `ill_om`, `orn_hanging`, `orn_corner`,
`orn_rule_band`.

`ill_lagna` matted to nothing on the first pass — faded ink on white gives
BiRefNet nothing to separate. Re-rendered on a mid-grey ground, which is the
same fix the mogra garlands needed.

---

## 2026-09-13 — Card lettering, corrected properly

The cards' titles were not calligraphic because of a mistake worth recording.

### The bug: a font that does not exist

`--gu-card` was set to **Tiro Gujarati**, which is **not on Google Fonts**. The
`@font-face` request silently returned nothing and every title fell through to
**Noto Serif Gujarati** — a plain book serif. So the cards were rendering in the
most ordinary face available while the CSS claimed otherwise. A missing webfont
fails silently; it must be verified, not assumed.

### What is actually available

Checked against Google's own metadata rather than guessing. **Only 13 families
carry Gujarati**, and just six are display faces:

```
Display     Shrikhand · Mogra · Kumar One · Kumar One Outline
            Farsan · Baloo Bhai 2
Sans        Anek Gujarati · Hind Vadodara · Mukta Vaani · Noto Sans Gujarati
Serif       Noto Serif Gujarati · Rasa
```

Every font on the user's list — **Kalam, Tiro Devanagari Hindi, Yatra One,
Modak, Khand** — is **Devanagari-only** and carries no Gujarati glyphs at all.
They cannot set મામેરું. This was shown to the user as a rendered specimen of
all six display faces rather than argued in prose.

### Chosen

- **Gujarati → Shrikhand.** The calligraphic one of the six: heavy
  thick-to-thin contrast, sweeping curves, elongated terminals. Single weight;
  needs `line-height: 1.36` for matra headroom. `Mogra` is the swap for a more
  handwritten, brush-drawn feel — one line in `--gu-card`.
- **English → Great Vibes.** User's call, and the right one: the reference's
  long swashes on M, S and g are a *connected script*, not a serif with
  alternates, so no amount of Playfair or Bodoni would have reached it.

### Also fixed

**The wash was burying the copy.** At 22% multiply over an already-textured
paper the content was barely readable. Dropped to 13% and masked back to ~30%
over the top half, where the title and date sit, so the wash still reads as
full-bleed architecture without fighting the type.

**The cards read as empty.** The date block and venue were set far too small
relative to the card. Numeral `11cqw → 16cqw`, month/time `4.4cqw → 6cqw`,
venue `3.8cqw → 5.2cqw`, with the vertical rhythm tightened to match.

---

## 2026-09-13 — Title placement matched to the reference

The card titles were centred; on the reference they are not.

Reading the reference crops: the vernacular title sits **flush left** at the top
of the card — on the સંગીત card it rides slightly past the left edge — and the
English drops **below it, aligned right**, finishing at about the same place the
title does. Everything below the title (date, venue, illustration) stays centred.

Implemented by stretching just those two elements across the card and giving
them opposite alignment, rather than wrapping them in another element:

```css
.inv__gu { align-self: stretch; text-align: left;  margin-left: -.06em; }
.inv__en { align-self: stretch; text-align: right; padding-right: 8%; }
```

The negative margin is the optical bleed past the left edge. It raises the
card's `scrollWidth`, which is harmless — `.inv` is `overflow: hidden`, so it
reads as the intended bleed rather than a scrollbar.

Verified at 430px and 1280px: titles fit within their cards on every card,
including શામ શાનદાર which wraps to two lines, and the page has no horizontal
overflow.

---

## 2026-09-13 — Mogra, and the reason the title fix kept "not working"

### The real bug: silent no-op edits

The user asked three times for the title to sit left with the English right, and
each time it appeared unchanged. The CSS edits were **silently doing nothing**.

Every edit to `.inv__gu` was made with a Python `str.replace()` whose search
text omitted a comment line that was actually present in the file:

```
    /* large enough to nearly span the card, as in the reference */
```

`str.replace()` returns the string untouched when the pattern does not match —
no error, no warning. So the `align-self`/`text-align` change, and two separate
font-size changes, all no-opped while the script reported success. `.inv__en`
happened to match, which made it look like a specificity or cascade problem
rather than an edit that never landed.

**Rule going forward: every string replacement asserts the pattern matched, and
the result is verified against computed style in the browser, not assumed.**

Fixed by replacing the whole `.inv__gu` block by regex on its braces and
printing the before/after, then confirming in the page:

```
guFont Mogra · guAlign left · enAlign right
title starts 14px from the card's left edge
english ends 17px from the card's right edge
```

### Font

**Mogra**, chosen by the user from a rendered comparison of all six decorative
Gujarati faces shown on a real card. Brush-drawn with the largest flowing
curves of the set — the "cursive with large curves" that was asked for.
It is also narrower than Shrikhand, so શામ શાનદાર now sets on one line.
`line-height: 1.42` for matra headroom.

---

## 2026-09-13 — Title/English pairing balanced across very different lengths

The three cards looked wrong for a reason the reference never had to solve: its
titles are all the same length (मेहंदी, हल्दी, संगीत, विवाह — three glyphs
each). Ours run from **2 glyphs (લગ્ન) to 10 (શામ શાનદાર)**.

Two separate faults fell out of that:

**1. The English was pinned to the card's right edge**, so on a short title it
flew away from its own title and tore a hole through the middle of the card.
Fixed by wrapping both lines in `.inv__title`, a `width: fit-content` group, so
the English right-aligns to the **title's** right edge instead. Measured at
`0px` offset on all four cards.

**2. A 2-glyph title read as half the weight of a 10-glyph one.** Hand-set
per-event scales were tried first and could not balance it — the metric that
matters is the share of card width each title occupies, which hand values
cannot track. Replaced with `fitTitles()`, which measures each title and scales
it to ~64% of its card.

### Two bugs found while fitting

**Fitting ran before the illustrations loaded.** The `.inv__ill` images are
`loading="lazy"` and contribute no height until they arrive, so the card
measured as fitting, the title was scaled up, and then the picture landed and
pushed the content out of the bottom. The fit now re-runs on `fonts.ready`,
`window.load`, resize, **and each image's own `load`/`error`**.

**Scaling the title was the wrong lever on the લગ્ન card.** It carries three
timings, so it is genuinely content-heavy; the fit loop shrank its title to 20%
of the card and it *still* overflowed by 36px. The illustration is now
constrained by `max-height: 34%` with `object-fit: contain` rather than a fixed
width, so it yields space instead of forcing the title to disappear.

### Verified

```
        share  scale   english offset   overflow
sage     64%   1.893        0px            0
indigo   64%   0.849        0px            0
gold     64%   0.925        0px            0
rose     32%   1.147        0px            0
```

`rose` sits at 32% because લગ્ન is two glyphs on the most content-heavy card —
it is as large as that card can carry, and the English stays anchored to it.

---

## 2026-09-13 — Engravings moved to the corner; spelling; the inverted floral

### The cards read as boxes because the engraving was in the wrong place

Looking at the reference again: its illustrations are **anchored to a bottom
corner and run off the card's edge** — the dholaks bleed off the left of the
Sangeet card, the elephant off the right of Vivah. Mine were centred at the
foot, in normal flow. That is the single biggest reason the set read as stacked
boxes rather than printed stationery.

`.inv__ill` is now `position: absolute`, pinned to a bottom corner with a ~6%
overhang, and which corner is data-driven per event (`illSide` in
`content.js`). Sides follow the reference: Sangeet left, the rest right.

Taking it out of flow also fixed a knock-on problem. The engraving could no
longer squeeze the copy, so the fit loop stopped having to shrink titles to
make room for it — **લગ્ન's title went from 32% of the card to 50%**.

`.inv__venue` carries a bottom margin so the copy always clears the corner
piece; verified as `clear` on every card.

### The Ganesha was being cut

It was centred at the foot with `max-height`, so the card's `overflow: hidden`
clipped its base — a crop that read as a mistake rather than a bleed. Replaced
for this card with `ill_lagna_elephant`, a caparisoned elephant among lavender
blooms, matched to the reference's વિવાહ card and anchored bottom-right where a
bleed is clearly deliberate.

### Spelling

**માંડવ રોપણ → મંડપ રોપણ**, as corrected by the user.

### The upside-down floral

`.invite .deco--corner-br` was set to `rotate: 180deg`, which turned the
botanical spray literally upside down — blooms pointing at the floor. Changed to
`scale: -1 1`, so it mirrors into the corner and the flowers still grow upward.

### Verified

Every card: zero overflow, copy clear of the engraving, 15px of deliberate
bleed below the card edge.

## લગ્ન card — measured against the reference (ss1 vs ss2)

Compared the reference card (Hindi "विवाह / wedding", elephant bleeding off the
bottom-right) against ours side by side and closed four measured gaps.

| | reference | ours (before) | ours (now) |
|---|---|---|---|
| engraving width | ~45% of card | 38% (px cap bound) | 49% |
| cut by card edge | yes, feet + flank | 2% / 5% | 3.5% foot, 7% flank |
| empty band under the copy | ~6% of card height | 16% | 9% |
| English word | dark warm ink | orange `#C9822F` | `#6B3A24` |

**Why the engravings were small.** `.inv__cornerill` was `clamp(96px, 45%, 150px)`.
The 150px ceiling binds on any card wider than 333px, so on a desktop the pieces
shrank to 38% and pulled away from the edges — exactly the "floating, too small"
look in ss2. Replaced with `clamp(140px, 55cqw, 260px)`, which tracks the card
through the container query instead of topping out.

**Why the empty band stayed.** The card is a fixed 2:3 box, so the venue's
`margin-bottom` only does work when the copy would otherwise overflow — it never
pushed anything down. The band is card height minus copy minus engraving. Closed
it from both ends: bigger engravings, plus a scoped `margin-top` on the venue so
the copy reaches 63% instead of 60%.

**Wash.** The full-card architecture ran at full mask strength exactly where the
engravings sit, so Ganesha and the elephant read against a busy palace. Opacity
`.13 → .115`, and the mask now falls to 40% at the foot — the wash still covers
the whole card, it just gets out of the way underneath.

Verified in-browser after each change: three cards centred with 0 corner pieces,
લગ્ન with 2, **0px text overflow on all five**.

## Cards, round 2 — the two things that were actually wrong

User: *"ek bhi card ka event likha hua acha nai lag raha hai naa toh uske
illustrations ache hai"*. Two root causes, neither of them cosmetic.

### 1. The Gujarati titles could never have matched the reference

The fonts specified — **Kalam, Tiro Devanagari Hindi, Yatra One, Modak, Khand** —
are **Devanagari-only**. They carry no Gujarati glyphs, so `લગ્ન` in any of them
falls through to the next family in the stack. It had been falling through to
**Mogra**, a rounded informal display face — nothing like the reference's
calligraphy — and doing it *silently*, which is why the problem survived several
rounds of "fix the font".

Google Fonts carries **13 Gujarati families in total**, 6 of them display:

    Mogra · Shrikhand · Farsan · Kumar One · Kumar One Outline · Baloo Bhai 2
    Rasa · Noto Serif Gujarati · Anek Gujarati · Hind Vadodara · Mukta Vaani …

Rendered all of them at card size and put the choice to the user. Chosen:
**Rasa at weight 600** — the only Gujarati face with genuine calligraphic stroke
contrast. Rasa was already in the `<link>`; only `--gu-card` needed swapping.

### 2. The five illustrations were five different pictures, not a set

Each prompt carried its own colour instruction — *"muted sage green and faded
brass"*, *"muted indigo and faded terracotta"*, *"muted antique gold and olive"*,
*"muted dusty rose and faded gold"*. Five palettes: green, teal, mustard, pastel
pink, grey-magenta. `filter: saturate(.88)` in CSS was a band-aid over it; no
filter turns green into rose.

Replaced with a single `PALETTE` + `WC` constant that every card illustration
concatenates, and stripped the per-subject colour calls. Two needed a second
pass: the kalash's "mango leaves" forced green into the frame, and the elephant's
jhool came back scarlet with the lavender dropped — both re-worded at the subject
level, not the style level.

Per-card ink followed: a sage-green and an indigo title no longer belonged on a
card whose art is rose and gold, so the ladder is now berry → terracotta →
bronze → rose → terracotta.

### Three bugs this surfaced in fitTitles()

1. **The deliberate bleed read as overflow.** The લગ્ન card's corner
   engravings run past the card foot on purpose, so `card.scrollHeight` is
   permanently over `clientHeight`. The shrink loop treated that as the title
   overflowing and ground it down to the 0.75 floor on every pass. Now measures
   the copy elements' rects instead.
2. **Clearing the foot is not clearing the engravings.** With that fixed the
   title grew until the venue sat *between* Ganesha and the elephant. The
   overflow test now takes the engravings' top edge as the floor.
3. **Normalising by width share made short titles enormous.** Every title was
   pinned to 64% of the card, so મામેરું (4 glyphs) rendered at 101px against
   શામ શાનદાર's 49px. Titles now run at one base size, and only shrink when too
   wide to fit — all four land at 64px desktop / 70px mobile.

Also damped `.inv__en`: at `--tscale` 2.29 it had blown "Wedding" up to almost
the full card width. It now takes 38% of the title's scaling.

Verified 375px and desktop: four titles at one size, **0px copy collision on all
five cards**.

## Cards, round 3 — English placement, and the લગ્ન corners

**English word, per card.** It right-aligns to the *title's* right edge, and the
title's width swings from 28% of the card (લગ્ન) to 88% (શામ શાનદાર) — so one
rule could never place it well on all four. Added `enShift` to `content.js`,
applied as `translate` on `.inv__en`:

| card | shift | English text now sits | note |
|---|---|---|---|
| મામેરું | `0.6em` | 20–51% | tucked under a short title |
| શામ શાનદાર | `-1.7em` | 44–71% | ornament starts at 76% — was running under it |
| મંડપ રોપણ | — | 22–78% | already right |
| લગ્ન | `0.9em` | 14–46% | tucked under a 2-glyph title |

Measured with a `Range` over the text node, not the element rect: `.inv__en` is a
right-aligned block, so its *box* spans the whole title width and reports the
text as starting 12% off the left edge of the card when it plainly does not.

**Ganesha replaced with lavender blooms.** The reference card puts a spray of
crocus and iris in that corner, not a deity. New asset `ill_lagna_blooms`. The
elephant was re-specified too — the reference's is pale gold and cream with a
rose-and-violet caparison; ours had come back grey.

**The engravings were being cut through, not bled off.** Two faults:

- `left/right: -9%` pushed a ninth of each piece outside the card. Back to `-2%`,
  which reads as a bleed (6px) rather than a crop.
- They were sized by **width**, but the blooms are 0.62 aspect against the
  elephant's 1.09 — equal widths made the blooms tower. Now sized by **height**
  (`clamp(120px, 42cqw, 210px)`, `width: auto`, `max-width: 48%`), so both stand
  26% of the card tall: blooms 24% wide, elephant 43%.

Verified: no English escapes its card, none runs under an ornament, 0px copy
collision on all five.

## Gallery — five photos added, and all seven put on a diet

Five pre-wedding photos dropped into the project root (`DSCF*.jpeg`,
`_MGL*.jpeg`) at 2–4 MB each. The two already in the gallery were 3.9 and
5.3 MB. Twenty-two megabytes of photographs on an invitation most guests open on
mobile data.

All seven re-encoded: EXIF orientation applied then stripped, long edge capped at
1600px, JPEG q82 progressive.

    22.1 MB  ->  2.1 MB      (196-465 KB each)

Originals are untouched in `%TEMP%\photo_originals`. Re-run the compression from
there if a larger size is ever wanted — do not re-compress the published files, a
second pass at q82 loses more than it saves.

Two ordering notes: the whole set is read into memory before anything is written,
because `couple-beach-02.jpg` is both an existing published name and a new
destination; and the carousel eager-loads only the first slide, so seven photos
cost the same first paint as two.

`gallery__stage` is `aspect-ratio: 4/5` with `object-fit: cover`. The one
landscape frame (the beach run) crops to it cleanly — checked all seven, nobody
is cut.

## Bilingual — English and ગુજરાતી, one language at a time

The site had Gujarati and English *mixed on the same page*: English headings over
a Gujarati sub-line, English host names above a Gujarati host list. It now reads
in one language at a time, with a toggle pinned top right.

**Shape.** Every string a guest reads is an `{ en, gu }` pair in `content.js`.
A plain string means the text is the same in both languages — a time, a number,
a brand. `t(v)` in `main.js` resolves either, so a value can be upgraded from a
string to a pair without touching the render code.

**The four card headings are the deliberate exception.** They show `gu` and `en`
together on every card, because that is how the printed kankotri reads. Those two
fields are NOT a translation pair and must never be turned into one.

The couple's names follow the same logic: large in the reading language, small in
the other. So does the line under "Our Events".

**Switching reloads.** Re-rendering in place would mean tearing down the
carousel, the countdown interval and every IntersectionObserver, and a half-
applied switch is worse than a reload. `setLang` stashes the scroll position in
`sessionStorage` under `wedding-langswitch`; the presence of that key is also
what tells the intro not to replay. The key clears itself on read, so an ordinary
reload still gets the full intro.

**Typography.** `html[data-lang="gu"]` re-points `--serif` and `--sans` at the
Gujarati stack (Rasa, then Noto Serif Gujarati) — Cormorant carries no Gujarati
glyphs at all. Body leading goes to 1.65: Gujarati hangs matras above and below
the line.

Then the part that is easy to miss — **Gujarati must not be letter-spaced.**
Fourteen small-caps labels on this page use tracking of .2–.3em, which in
Gujarati pulls a matra clear of the consonant it belongs to and reads as a
spelling error. Those rules are reset under `html[data-lang="gu"]`, and the
labels that leaned on tracking for their weight get it back as size.
`text-transform: uppercase` comes off with it: it does nothing to the script and
mangles any Latin word standing beside it.

**Names.** The eight host couples were Latin-only and the eleven awaiting names
Gujarati-only, so each set needed its twin written. **These transliterations are
mine and want a family member's eye before printing** — a misspelled relative's
name is the one error on a wedding invitation nobody forgives.

Verified in both languages: a DOM sweep for leaf nodes carrying both scripts
returns one hit, "WhatsApp" inside a Gujarati sentence, which is correct; no
element that should be Gujarati is still English; and switching mid-page returns
to the same scroll position (y=7076 → 7076) with the intro skipped.

## The maroon half is now a lighter register of the same paper

The RSVP and countdown sat on a deep oxblood with a lantern-lit night sky behind
them. Once the cards went to dusty rose, lavender and antique gold, that panel
was the only saturated dark thing left on the site — it read as a different
website bolted to the bottom.

It is now **a deeper register of the same paper**: the last leaf of the
kankotri rather than a separate surface.

| | was | now |
|---|---|---|
| ground | `#3B1220` oxblood | `#E8E1D2` ivory |
| deep band | `#260A15` | `#DFD5C1` |
| copy | cream on black | `#3A332A` ink |
| headings | `#fff` | `#8E3A5D`, the cards' berry plum |
| backdrop | `night_sky_warm.png` @ .75 | `card_wash_b.png` @ .085, multiply |

The backdrop is the invitation cards' **own** architecture wash, so the closing
reads as the back of the same card. `night_sky_warm.png` is retired to
`assets/unused/`.

**The seam.** The old one ramped over 14rem, which a hard black-to-cream join
needed. Between two papers a shade apart that ramp is a grey smear across the
page — the user called it exactly that. Cut to 4.5rem over three stops.

**Contrast is where a light ground actually bites.** Every one of these colours
was legible as light-on-black and stopped being legible as dark-on-cream:

| | on cream | needed |
|---|---|---|
| `--dusk-faint` `#8C8479` | 2.53 | 4.5 |
| brass `#9A7A40` as text | 3.08 | 4.5 |
| cream on brass button | 3.43 | 4.5 |

Fixed by darkening `--dusk-faint` to `#645B51`, splitting the brass in two —
`--gold` keeps its brightness for rules, icons and fills, `--gold-ink` `#74592B`
is the one that gets read — and putting the button back to dark ink on bright
brass, which was the only way to clear 4.5:1 without the button turning to mud.
**All 16 pairs now pass**, measured in-browser against the live computed colours.

**Renamed.** `.night` → `.closing`, `#night` → `#closing`, `body.is-night` →
`body.is-closing`, `--night*` → `--dusk*`, across all three files. A variable
called `--night` holding `#E8E1D2` is a trap for whoever edits this next.

## Families moved down, and a font bug it exposed

`Our Families / With Love` now sits inside the closing half, directly above
`With Best Compliments From`. Order is hero → invitation → events → gallery →
rsvp → countdown → **families** → compliments → footer.

It moved onto the closing's paper, which is a shade deeper than the one its
greys were picked against, so `--ink-soft` fell to **4.27:1** on the host names.
Those are relatives' names on a wedding invitation. Scoped under `.closing` they
now take the closing's own body ink, and all seven pairs pass.

### The bug the move surfaced

`With love, yours affectionately` was rendering in **Jost Bold** — a geometric
sans, next to a page of Cormorant.

Not caused by the move. Before the site was bilingual, `.hosts__heading`,
`.pairs li`, `.awaiting li`, `.awaiting--solo` and `.awaiting--kids` carried the
`.gu` class *unconditionally*, because their text was always Gujarati. `.gu`
sets `font-family: var(--gujarati)` — a **serif**. None of those rules ever
named a face of their own; they were all riding on `.gu`.

Making the site bilingual applied `.gu` only in Gujarati, so the English side
fell through to the body font, which is Jost. Every family name on the English
page had been set in a sans since that commit, and the heading in sans bold. It
was simply below the fold of anything I had looked at.

Fixed by naming the face: `var(--serif)` on all five, weight 500 on the heading.
In Gujarati `--serif` is already re-pointed to Rasa, so one declaration holds in
both languages and the `.gu` layering still works.

**The lesson is the same one this log keeps recording**: a style that only works
because of a class applied somewhere else breaks silently the moment that class
becomes conditional. Grep for `.gu` before assuming a font is set.

## Save the date is now a calendar, not two buttons

The `SAVE THE DATE` label and the Google / Apple Calendar buttons are gone,
replaced by a leaf of the wedding month with the two days marked — the printed
save-the-date card the user referenced, with peacocks in place of its lovebirds.

**Nothing about the calendar is typed in.** The month, its length and the weekday
it starts on all come from `countdownTo`; the marked days come from the event
cards' `dateShort.day`. Change a date in `content.js` and the calendar follows.
A hand-built grid would have gone stale the first time a date moved.

    1 December 2026 → Tuesday → 2 leading blanks, 31 cells, 1 and 2 marked

Reference marks its one date with a heart. Two adjacent days as two hearts is a
lot of heart, so they are filled discs in the cards' berry plum.

Bilingual: the month name is the one already written on the cards
(`dateShort.month`), and `ui.calWeekdays` carries both sets of heads — Gujarati
runs ર સો મં બુ ગુ શુ શ, two letters where one is ambiguous. The script face has
no Gujarati, so `.cal__month` falls to Rasa under `html[data-lang="gu"]`.

Removed with the buttons: `rsvp.saveLabel`, `ui.calGoogle`, `ui.calApple`, the
Google Calendar URL builder, the `.save`/`.btn-ghost`/`.save__label` rules and
their Gujarati overrides. `assets/wedding.ics` is retired to `assets/unused/` —
nothing links it now.

**What this costs**: guests can no longer add the wedding to their phone in one
tap. That was the user's call, made explicitly. The `.ics` is still in the repo
if it is ever wanted back.

Contrast on the card: day 10.95, weekday head 5.34, marked day 6.7. Checked at
375px — no horizontal overflow, cells 27px.

## RSVP removed; calendar goes seamless

Three changes, all asked for.

**1. `Jay Pankaj Jabuvani` no longer reads as a heading.** `.awaiting--solo`
never declared a `font-size`, so it inherited the section's larger body size and
sat under the list looking like a subheading rather than the last name in it. It
now carries the same size and ink as the names above it. (Removing its colour
override collapsed two selectors and dragged `.hosts__heading` down to
`--dusk-faint` with it — caught and put back to `--dusk-ink`.)

**2. The whole RSVP section is gone** — heading, body, the gold button and the
WhatsApp note. Removed with it: `W.rsvp` from content.js, the `rsvp()` renderer,
and the `.rsvp*` / `.btn-gold` rules with their Gujarati overrides. The section
that held it is now `#savedate`, carrying only the calendar. `startDate` was
declared inside `rsvp()` and is used by both the calendar and the countdown, so
it was lifted out rather than deleted.

**This means guests can no longer RSVP from the site.** The WhatsApp number is
out of `content.js` too. It was asked for explicitly, after the option said so;
`git show` on this commit brings all of it back.

**3. The calendar is seamless** — no ground, no keyline, no shadow, printed
directly on the closing's paper. Chosen from three samples (seamless / hairline
frame / the event cards' aged paper) rendered on the real background.

Final order: hero → invitation → events → gallery → **save the date** →
countdown → families → compliments → footer.

## Central invitation card removed; solo name tightened

The fifth card — the Om motif with `Jeet weds Bhavini` and both sets of parents —
is gone. The events row is now the four ceremonies and nothing else.

Removed with it: `W.invitationCard`, the `mainCard()` factory and its call, the
eight `.inv--main *` rules, and the orphaned `html[data-lang="gu"] .inv__eyebrow`
selector. `ill_om.png` is retired to `assets/unused/`.

`W.invitation` stays — the formal invitation panel near the top of the page is a
different thing and still uses `blessing`, `lead`, `groomLine`, `brideLine` and
`weds`. Only the *card* went.

`.awaiting--solo` also drops from `margin-top: 1.2rem` to `.6rem`, the list's own
gap, so `Jay Pankaj Jabuvani` sits as the last line of the list rather than as a
block after it.

Checked every referenced asset with a HEAD request afterwards — nothing 404s.

## Gallery: carousel out, scattered prints in

Seven photographs tipped onto the paper as aged prints, replacing the one-at-a-
time carousel with its arrows, dots, swipe handler and filigree frame. Every
photo is now visible without a guest touching anything.

**Laid out in CSS columns, not at absolute positions.** An absolute scatter is
pinned to one viewport width and falls apart at every other; columns hold at any
width — two on a phone, three from 760px up. Each print's tilt, width and
horizontal nudge come from a fixed table in `main.js`, not `Math.random()`: a
random scatter re-rolls on every load and roughly one roll in ten looks wrong.

**Burnt edges.** The mount is aged stock `#F7F2E4`, corners are unequal
(`border-radius: 2px 3px 2px 4px`), padding is heavier at the foot the way a
photo print is, and a `::after` multiplies four corner scorches of different
sizes and strengths over one all-round edge darkening — through the picture as
well as the mount, because an old print browns right through.

### Two bugs worth recording

**`startDate` went out with the gallery.** It had been lifted out of the deleted
`rsvp()` and left sitting between `gallery()` and the calendar. The gallery
rewrite's cut ran from `(function gallery() {` to the save-the-date comment and
swallowed it. `main.js` then threw at the calendar, which killed everything after
it — **all 49 `.reveal` elements stayed invisible and the countdown never
started**. The assertion guarding that cut only checked the chunk *contained*
`galPrev` and `touchstart`; it never checked what else was in there. A cut by
landmarks needs to assert on what it is *removing*, not just on what it expects
to find.

**`.reveal` owns `translate`.** `.print` set `translate: var(--dx) 0` for its
nudge and `.reveal` sets `translate: 0 24px` for the rise — and `.reveal` is
declared later, so it won both the nudge and the hover lift. The nudge moved to
`margin-left`, which the reveal animation does not touch.

Also: `.gallery__caption` lost its body to a mis-sliced replacement and was
restored from `git show HEAD:styles.css`; brace balance checked afterwards.

Verified clean on a fresh load: no failed requests, reveal running, countdown
ticking, calendar marked, seven prints, and the whole thing switching to
તસવીરો / અમને પ્રિય ક્ષણો with Gujarati alt text.

## Event cards rebuilt as hanging invitations

Rebuilt against the screen recording's three frames. Each card now hangs from a
brass stave with beaded strings below it and sways — a punkah, which is what
"like an old fan" meant.

**The card**: rounded double keyline in the card's own ink with a flourish over
each corner, the event's own subject at the head, both languages centred, date,
times, venue, its one-line tagline, an `OPEN IN MAPS` button, and the floral
border across the foot.

**The hanger**: `.hang` wraps rod, card and tassels and carries both the reveal
and the sway, so the three move as one. `transform-origin: 50% -6%` puts the
pivot above the rod's top finial. The rod alternates sides card to card, as the
reference does, and each card's sway is offset by `--sway-delay` so they do not
move in lockstep. `prefers-reduced-motion` stops it.

**The rod is drawn, not generated.** Three renders of a brass stave all came back
with a finial far too heavy for its height — the reference's is hair-thin. Two
gradients and two pseudo-elements hold it at any size, and it costs no request.
The generated attempt is in `assets/unused/`.

**Gone with the redesign**: the detail dialog (everything is on the face now, so
nothing is behind a tap), `.evdlg*` markup and CSS, and the `viewDetails`,
`timeBegins`, `venueToFollow`, `aEventDetails` and `aClose` labels.

### Four things that broke on the way

1. **`startDate` was read before it was assigned.** It sat at line 545; the card
   factory runs at 253. `var` hoists the name but not the value, so every card
   threw on `startDate.getFullYear()` and the events list rendered empty. Moved
   above `events()`.
2. **The card lost its width.** The rewrite of `.inv` dropped `width: 100%;
   max-width: 21rem` and the tablet media query with it, so `justify-items:
   center` shrank each card to its min-content width — 68px.
3. **`.gallery__caption` lost its body** to a mis-sliced replacement; restored
   from git, brace balance checked.
4. **The maps query read `Gandhidham,, Gujarat`** — the venue's own trailing
   comma plus the joiner. Each line is now trimmed of trailing commas first.

Card content had to come down to fit: it overflowed its own 2:3 box by 365–470px
at first. The subject illustration moved up to become the crest instead of
sitting separately, and the one-line `tagline` replaced the sentence-long `note`.
Zero overflow on all four, desktop and 375px, in both languages.

## Card shape and the swing-in

Two corrections from the latest frame.

**The outline is cusped, not rounded.** The reference's frame turns inward at
each corner and peaks at the top centre — a shape `border-radius` cannot
describe. Both keylines are now one inline SVG on a 200×300 field (the card's
own ratio), `preserveAspectRatio="none"` to stretch to the card and
`vector-effect: non-scaling-stroke` so the two lines keep an even weight at any
size. `framePath(inset, cusp)` builds either line from the same geometry.

**"Animate hoke aara hai" means it swings in, not that it sways forever.** The
constant sway was the wrong reading. It now swings in when it scrolls into view
and settles — a damped pendulum — then breathes:

    -9°  →  +5.2°  →  -2.8°  →  +1.5°  →  -0.7°  →  -1.15°

The last keyframe lands exactly where the idle sway begins, so the handover
between the two animations has no jump. Both ride on `.hang.is-in`, so the swing
fires on reveal rather than on load, and each card's idle sway is offset by
`--sway-delay`. `prefers-reduced-motion` stops both.

**On the recording**: I cannot process video of any kind — Instagram, Drive, or
otherwise — so the three still frames the client sent are the whole source for
this. Stills or a sentence work; links to video do not.

## Event cards reverted to the pre-hanging design

User: *"can u revert the card changes to how it was before?"* — the hanging
punkah design (rod + tassels + swing-in + cusped frame) went further than
wanted. Reverted `index.html`, `main.js`, `styles.css`, `content.js` and
`scripts/gen_assets.py` to their state at `7041055` (immediately before commits
`814dca0` and `747139a`), discarding both those commits' effects and the
in-progress uncommitted work on top of them (blush background, drapes, corner
florals, staged text reveal — none of that had been committed, so nothing else
is lost). That in-progress work is kept safe in
`git stash@{0}` if any piece of it is wanted later.

Cards are back to the centred `<button>` design: Gujarati title top-left, date
block, one illustration at the foot (two for લગ્ન, one per bottom corner), and
a "View details" tap that opens the `evdlg` dialog. `card_crest.png` and
`card_spray.png` — generated for the hanging design, now unreferenced — move to
`assets/unused/`.

**This revert also fixed something unrelated that had been silently broken
since `814dca0`**: that commit's styles.css rewrite (540 lines changed in one
pass) dropped `.pairs`, `.awaiting` and `.hosts__heading` entirely — the rules
that give the "Our Families" list its layout. Every commit since had it
rendering as a bare browser `<ul>`: default bullets, no left/right name split,
no ◆ separator spacing, "Mr. Naran Kanji Jabuvani◆Mrs. Premila Naran Jabuvani"
run together as one line. The user flagged it from a screenshot without
knowing the cause. Reverting styles.css to `7041055` restored it as a side
effect, since `7041055` predates the deletion. Confirmed present:
`.pairs { list-style: none; ...; display: grid; gap: .85rem; }` at line 1056.

Verified at 375px: dialog markup back (`evdlg` in all three files), cards
render as buttons not `<article>`, 0px overflow on three of four cards — લગ્ન
runs 15px over at this exact viewport, which is a pre-existing characteristic
of the `7041055` code being restored, not something this revert introduced.
Left as-is since the ask was to match the prior state exactly, not to improve
on it.
## 2026-09-13 — Intro: the elephant now stands on the ground

### The bug

The elephant floated. Its feet were pinned at 90% of the **scene**, but the
"ground" they were meant to land on is painted into `intro_backdrop.png`, which
is a 576×1024 portrait cropped with `object-fit: cover`. How much of that
painting a viewport actually shows swings wildly — a phone sees ~97% of its
height, a 1440×900 desktop sees a ~27% band — so a point measured in the
painting lands somewhere different at every size. With `object-position:
center 42%` the desktop band was image 30%–58%: mid-column, no floor anywhere
on screen. Hence an elephant hanging in mid-air.

Two smaller faults in the motion:

- `rotate(-2.6deg)` about the back feet rotates the **front down**, not up. The
  trunk tip actually moved *away* from the bell (+2.3% of the elephant's height
  down); the only thing lifting it was a flat `translateY(-10px)`, which is a
  fixed pixel nudge on an element whose size is a viewport percentage.
- `bellSwing` left 0° at 57% while `elephantRing` peaked at 58% — the bell
  began moving *before* it was struck.

### The fix

**Ground line.** Laid the figures out against the one thing that is stable —
the bottom edge of the scene — and picked the backdrop crop to suit, rather
than the other way round. `object-position: center 67%` puts a floor under the
90% line at every size: the pavilion deck on wide screens, the courtyard tiles
on phones. Verified at 1440×697, 900×597, 390×674, 375×645 by reproducing the
CSS geometry in Pillow and compositing the frames.

**`.intro__pair` is now exactly the elephant** — `aspect-ratio: 800/742`,
`bottom: 10%`, `height: 46%` (39% under 560px). Everything else is a percentage
of that box, so the whole composition is viewport-independent. Added a
radial-gradient contact shadow under the four feet (27%–95% of the width).

**Bell chain.** The bell used to hang from `top: 0` of the pair box, so its
chain ended in mid-air. `scripts/`-style one-off: tiled the straight 22px link
pitch from the top of `intro_bell.png` to build
`assets/generated/intro_bell_long.png` (339×2893, ratio 8.53, 218 KB), faded
over the top 60px. The bell is now placed by its *bottom* (`bottom: 101.6%`, so
the clapper sits just clear of the trunk) and the chain is long enough to leave
the top of the frame at any viewport — guaranteed, since `bell top = 0.9·SH −
2.95·He` is negative for every height the pair can take.

**Sizes.** Elephant +35% (34% → 46% of scene height), bell +44%.

**Motion.** Strike moved to 56%. Elephant: `rotate(2deg)` — clockwise, which is
what lifts the front — plus `translateY(-1.2%)`, both relative so the reach
scales; pivot moved from 70% to 78% (the back feet). Trunk now rises 3.1% of
its own height into a 1.6% gap, so it visibly taps. Bell holds flat until 56%
and swings *right*, the direction the trunk pushes it; max cut 12° → 2.4°,
because the pivot is now the top of a very long chain and a few degrees is
already a wide travel at the bell.

### Files

- `assets/generated/intro_bell_long.png` — new
- `styles.css` — intro geometry, `elephantRing`, `bellSwing`
- `index.html`, `main.js` — bell src, comments

## 2026-09-13 — Intro: chain hung from the pavilion, trunk articulated

### The chain ran over the roof

Hanging the bell from a long fixed chain solved "the chain ends in mid-air" by
running it off the top of the frame — but on a phone, where most of the
backdrop is visible, it crossed the pavilion's dome on its way out. The bell
read as hanging from the sky rather than from inside the chhatri.

The cause is the same two-coordinate-system problem as the floating feet, in
the other direction. The chain's top belongs to the **stage** (the painting as
rendered) — there is a brass pendant painted under the eave at 49.7% × 38.3%
of the image. Its bottom belongs to the **scene** (the trunk). The two do not
scale together, so no single-piece bell image can span them.

So the chain is no longer part of the bell. `intro_chain.png` is one 46×22 link
pitch, tiled down `.intro__rig`, whose top is the hook converted into the pair
box's coordinates and whose bottom is the clapper:

    top = min(46cqh, 58cqw) − 23cqh − 0.287 · max(100cqh, 177.7778cqw)

`container-type: size` on `.intro__scene` makes `cq*` the scene box. Both
branches are proved non-degenerate — the chain's length bottoms out at 4.3cqh
and can never invert. The nice property is that `top` goes negative exactly
when the eave leaves the crop, so on wide screens the chain runs out of frame
at the same moment the roof stops being visible. `intro_bell_long.png` is gone;
`intro_bell_body.png` is the bell from its ring down.

The bell now rocks about **its own ring** (`transform-origin: 50.3% 13%`)
rather than about the top of the chain. That is where a lightly tapped bell
actually articulates, and — unlike rotating the whole chain, whose length now
varies 120px to 570px between viewports — it keeps the swing proportional to
the bell at every size. 7°, damping out.

### The trunk

Cut the trunk off the elephant and gave it its own layer.

- Flood-filled the trunk from its tip with a hard stop at y=214, the last row
  where it is still a separate alpha run from the face. Above that line the
  trunk and the head never touch, so removing it leaves clean transparency —
  nothing to inpaint.
- The first fill only caught `alpha > 60`, which left the trunk's soft matte
  edge behind in the body as a pale ghost of the old pose. Dilated by 11px
  (the head is never nearer than ~25px) and blurred.
- Split the two layers with a **complementary** alpha ramp over the 18 rows
  above the cut, so they always sum back to the original.
- 11 poses in `intro_trunk_sheet.png` (240×260 each): a twirl about the joint
  plus a lift, both weighted by the same radial profile that is 0 at the joint,
  so the seam cannot open however far the tip travels. Frame 5 is rest, 10 the
  reach. Tip travel 35px vertical, 17px lateral.
- Played on `step-end` — held frames, not a rubber tween, which suits an
  illustrated invite and reads as drawn animation.

The trunk now carries most of the reach, so the body only leans: `elephantRing`
cut from 2° to 1.2° and −1.2% to −0.6%. Contact budget, in elephant heights:
body 1.97% + trunk 2.43% = 4.40% against a 3.54% resting gap, so the tip closes
the gap and presses ~0.9% into the clapper. Bell moved to `bottom: 103%` to
open that gap.

The elephant is now capped at `58cqw` so aligning the trunk under the centred
hook cannot push its rump off a narrow screen; on a phone the width, not the
height, sets its size. The `max-width: 560px` query is gone — the cap does that
job continuously.

### Cost

Shipped intro assets 1.45 MB → 1.71 MB (trunk sheet 308 KB, and the body PNG
replaces the elephant). `intro_elephant.png` and `intro_bell.png` stay in the
repo as the sources the crops are cut from, but are no longer referenced.

### Files

- `assets/generated/` — `intro_chain.png`, `intro_bell_body.png`,
  `intro_elephant_body.png`, `intro_trunk_sheet.png` new;
  `intro_bell_long.png` deleted
- `styles.css` — `.intro__rig`, `.intro__bell`, `.intro__ele`, `.intro__trunk`,
  `bellRock`, `trunkCurl`, `elephantRing`
- `index.html` — intro markup

### Bell enlarged (same day)

The bell had got *smaller*, not bigger: its width is a fraction of the
elephant's, and capping the elephant at `58cqw` to keep its rump on screen shrank
both. Bell 21% → 27% of the elephant's width — 93×134 on a wide screen, 63×91
on a phone.

That has a cost: the bell hangs at the bottom of the chain box, so making it
taller eats the chain. Bought the space back by dropping the ground line from
90% to 92% of the scene (feet still land on the deck on wide screens, the tiles
on phones — rechecked). Chain visible above the bell is now 445px at 1440×697,
211px at 900×597, 38px at 375×645.

Solving `25cqh + .287·stage − 1.4482·He ≥ 0` over all scene aspect ratios leaves
one band, roughly 0.76–0.82, where it falls about 1cqh short and the bell would
cover the hook. `top: min(…, -50%)` floors it; in that band the chain starts a
hair above the hook instead. Checked at 420×530, the worst point.

### Why none of that was visible

`img { max-width: 100% }` (styles.css:102). The bell's width is a percentage of
the chain strip it hangs from — 947% of a 2.85%-wide box — so the global rule
had been clamping it to the chain's own width, about a ninth of its intended
size, ever since the bell was moved inside `.intro__rig`. Both enlargements
were correct in the stylesheet and neither could render. `max-width: none` on
`.intro__bell`.

## 2026-09-13 — Two bells, and a trunk that swings

### There were two bells

The backdrop has a small bell painted into the pavilion ceiling — the thing
earlier entries call "the hook" and pin the chain to. It is about 17x38px in a
576x1024 image and far too soft to enlarge, so it was never a candidate for the
bell; but it is not fully hidden behind the chain either, so on any viewport
where the eave is in frame it showed as a second, tiny bell right above the
real one.

Painted it out. The ceiling band is a row of brackets; copied one pitch across
(22px), corrected each row by a linear ramp so its ends meet the neighbours
exactly, and feathered the boundary. The chain now starts on a clean ceiling —
and since the chain runs down that exact column, what little is imperfect about
the patch is covered anyway.

### The trunk swings instead of lifting

The previous sheet was a monotone slider — one parameter, rest to reach, mostly
vertical. It read as the trunk extending, not striking. The 11 poses are now a
designed sequence:

    0 rest   1 idle L   2 idle R   3 rise   4 wound left   5 swing
    6 strike   7 follow through   8-9 return   10 settle

The tip covers 62.5px between 4 and 7 — 7.8% of the elephant's width, 27px on a
wide screen — which is what makes it read as a swing rather than a stretch. It
crosses the bell's axis at frame 6 moving right, so the bell is pushed the way
the trunk is travelling. Contact budget unchanged: trunk 2.29% of the
elephant's height plus body 1.97% against a 3.54% gap.

Canvas grew to 270x276 per frame (from 240x260) to hold the wider swing; the
generator now asserts nothing clips. `bellRock` up from 7° to 9° so the swing
reads at the same weight as the trunk that caused it.

### Files

- `assets/generated/intro_backdrop.png` — painted bell removed
- `assets/generated/intro_trunk_sheet.png` — regenerated, 11 designed poses
- `styles.css` — `.intro__trunk` geometry, `trunkCurl`, `bellRock`

### "Can't see the changes"

Two causes, neither in the intro code — which was verified correct on disk:
CSS braces balance, one rule per class with no leftovers, the sheet is 11
frames of 270x276 exactly matching `.intro__trunk`'s 33.75% x 37.197%, and
`background-size: 1100%` maps one frame to the element.

1. **Stale assets.** The site is edited in place with no build step, so a
   browser holds on to `styles.css` and the PNGs. Added `?v=20260913a` to the
   stylesheet link and to every `intro_*` URL in both `index.html` and
   `styles.css`. Bump it whenever one of them changes.
2. **`sessionStorage["wedding-langswitch"]`.** main.js:177 removes the intro
   outright when that key is set, by design — a language switch returns
   mid-page and should not replay the intro. But it is *session* storage, so
   once the language has been toggled, every reload **in that tab** skips the
   intro entirely. A fresh tab is needed, or `?hold` with the key cleared.

Also noted: `intro_backdrop.png` went 560 KB -> 865 KB, entirely Pillow's
encoder (re-saving the untouched original through Pillow gives the same 865 KB)
rather than the patch. The asset pipeline's original encoder did better; worth
a pass with oxipng if the weight matters.

### Verified against the running server

Stopped simulating and checked the real thing. The dev server on 5179 is
`python scripts/devserver.py 5179`; `curl -D -` against it returns
`Cache-Control: no-store` and a `styles.css` containing the new rules, and the
served `index.html` has the new intro markup.

Chrome is installed (`C:\Program Files\Google\Chrome\Application\chrome.exe`)
and screenshots the page headlessly, which is a far better check than the
Pillow composites used up to now — those verify arithmetic but not the cascade,
and cannot show whether an animation runs:

    chrome.exe --headless=new --disable-gpu --hide-scrollbars \
      --virtual-time-budget=2320 --window-size=420,760 \
      --screenshot=out.png "http://localhost:5179/"

`--virtual-time-budget` doubles as a clock — 500ms, 2320ms and 2600ms give
rest, strike and follow-through. All three render correctly at 420x760 and
1440x900: big bell on a chain from the pavilion ceiling, no duplicate painted
bell, elephant's feet on the floor, trunk swinging up to the clapper, bell
rocking after. The changes are live and correct on the server.

## Save-the-date calendar: postcard framing to match the reference

User sent a Pinterest-style save-the-date reference (a repeating floral border
across the top, gold corner flourishes, bold caps month heading, an
illustrated garden scene at the foot) and asked for the calendar section to
match. Kept the site's own peacocks and marked-day discs — both were
deliberate choices from an earlier round in this session — and adopted the
reference's framing and typography around them, rather than replacing what
already fit.

**New asset**: `cal_border_top.png`, a thin repeating row of small watercolour
blossoms, generated with the same `WC` style constant every other card
illustration uses, so it reads as part of the same set rather than a new one.

**Reused rather than regenerated**: `orn_corner.png`, a gold vine flourish
already in the project and unused since the card revert, placed top-left and
mirrored bottom-right at the `.savedate` section level — the identical pattern
the invite section already uses for its own corner botanicals
(`.invite .deco--corner-tl/br`). Consistency over novelty was the whole lesson
from the illustration-palette work earlier in this session; this is that
lesson applied rather than re-learned.

**Typography**: `.cal__month` moved from the script face to a bold small-caps
serif (`var(--serif)`, weight 600, `.16em` tracking) — a postcard masthead
rather than another card title. Gujarati keeps its own untracked, non-uppercase
rule, per the standing rule that Gujarati is never tracked.

**Tried and reverted**: a banana palm frond bleeding in from the side, to
echo the reference's tree. It is the only "tree" asset on hand and it is
green — the one colour the `PALETTE` constant explicitly bans, established
earlier this session after the illustrations first shipped in five
uncoordinated palettes. Pulling it in here would have reintroduced exactly
that problem for one section. Removed; two corner flourishes carry the frame
on their own.

**Left out**: the reference's venue line and "Warm Regards / [Family] Name"
signoff beneath the calendar. The site already closes with an equivalent
signoff in the countdown section (couple's names, date, "Forever begins
today"), and `W.headline.venue` is currently blank — adding a second,
redundant closing statement with invented venue text was judged out of scope
for a framing request. Easy to add later once a venue is confirmed.

Verified in both languages at 375px and desktop: no failed requests, no
horizontal overflow, Gujarati renders in Rasa without tracking.

## Save-the-date calendar: side medallions, foot urns, and a location line

Continued the postcard framing from the earlier commit. The top floral border
strip was tried and dropped per direct feedback - too busy for what the
section needed. In its place:

- Three small gold medallions stepped down the left edge of the section
  (`gold_medallion.png`, one new asset reused three times at shrinking scale
  and opacity), echoing the reference's own stacked corner motifs without
  needing three different images.
- A location line beneath the grid - `Gandhidham, Gujarat` - built from
  `W.headline.city`, since no separate venue name is set yet. Bilingual, and
  hidden entirely if the city field is ever cleared.
- A small gold urn of dusty rose blooms (`cal_foot_urn.png`) flanking the
  peacock motif on both sides (mirrored via CSS), for a touch of the
  reference's garden richness at the foot.

The event cards also gained a single gold corner flourish, top-left
(`orn_corner.png`, already in the project, unused since the earlier card
revert) - the same ornament language as the calendar, so the two don't read
as two different decisions. Kept deliberately light: top-left only, since
top-right is already claimed by the hanging ornament on two cards and the
bottom corners by the foot illustration.

**A real bug this caught**: the flourish rendered in the wrong place entirely
on the first pass - center-ish, not the corner - because `.inv > *` (added
long ago to hold every direct child above the card's `::before` wash via
`position: relative`) has the same specificity as a bare `.inv__flourish`
rule and comes later in the file, so it silently won and overrode the
`position: absolute` the flourish needed. Fixed by writing `.inv > .inv__flourish`,
which the existing `.inv__cornerill` and `.inv__ill` rules already do for
exactly this reason - the fix was already a pattern in the file, just not one
I'd matched.

**On the reference images from Pinterest**: several were screenshots of the
Pinterest app itself (visible status bar, Visit/Save buttons, an attribution
line reading "Wedding Invitation Video | Modern • Arden Lane") showing a
template for a different couple, a different venue and a different family
name. However these were produced, they are not ours to reproduce directly,
and I did not - the medallion, urn, and corner flourish above are original,
generated in the site's own established palette.

## Directional scroll reveals, sitewide

User asked for "immersive animation throughout the site" and specifically
for the event cards to alternate in from left and right as you scroll to
them. Scoped down after a few back-and-forth questions to: subtle CSS
slide+fade, reusing the existing `.reveal` + IntersectionObserver system
rather than a new animation engine, applied broadly rather than to cards
alone.

Two new variants alongside the existing `.reveal`/`.reveal--drop`:

    .reveal--left   translate: -32px 0  (-16px under 30rem, so the
    .reveal--right  translate:  32px 0   sideways travel doesn't read as a
                                          lurch on a narrow card)

Applied alternating by index (even = left, odd = right) to:

- the four event cards (Mameru/Mandap from the left, Sangeet/Lagna from the
  right, per the user's explicit pattern)
- the seven gallery prints
- the four countdown lockets
- every row of the hosts-paired list and every name in the awaiting list
  (19 items total), which previously revealed as one flat block rather than
  per row

Hero and the intro were left alone - both already carry dedicated motion
(parallax layers, the elephant/bell sequence) built earlier, and stacking a
directional slide on top risked fighting those rather than adding to them.

No JS beyond assigning the class name changed; `.reveal--left`/`--right`
combine with the base `.reveal` class exactly the way `.reveal--drop` already
does; reduced-motion continues to work through `.reveal`'s existing
`!important` overrides in the reduced-motion query, which apply regardless of
which direction variant is also present.

**Testing note for the log, not a site bug**: while verifying this, every
`.reveal` element read as permanently un-revealed (0 elements with `is-in`,
even ones plainly on screen) and a fresh IntersectionObserver placed on the
same elements never fired at all. `document.hidden` was `true` on the
preview tab at the time - browsers throttle IntersectionObserver (and
timers, rAF) on backgrounded tabs, which is exactly what was happening to
this session's own preview tab, not a defect in the reveal system. Confirmed
by forcing `is-in` directly and screenshotting the settled layout for events,
gallery and the families lists, all of which held up with no positioning
issues, no failed asset loads, and no horizontal overflow in either
language.

## Gallery rebuilt as a depth carousel

User linked a Framer plugin ("Depthline Carousel") and asked for its behaviour
on the gallery: a focused centre card, cards scaling down toward the edges,
smooth drag with momentum, snap-to-centre, wheel navigation, hover lift. The
plugin itself only runs inside Framer's own builder - this site has no build
step and no dependencies - so the mechanics are rebuilt from scratch in plain
JS/CSS rather than installed, and skinned in the site's own aged-print look
(cream mount, corner scorch, soft shadow) rather than the reference's plain
stark cards, so it reads as part of this invitation rather than a dropped-in
widget.

Replaces the "scattered prints" layout from two sessions ago (a static CSS-
column grid, every photo visible at once, each with a fixed tilt). That
approach and this one solve different problems - all-at-once vs. one focused
photo at a time - so this is a real swap, not a refinement.

**The mechanics**: `current` is one continuous number (not an integer) - the
position of the deck relative to its centre. Every card's transform is a pure
function of its own index distance from `current`:

    translateX = distance * gap        scale = 1 - |distance| * falloff

Drag, wheel, buttons and arrow keys all just change `current` and re-run that
same function - there's one layout path, not four.

- **Drag**: Pointer Events (one code path for mouse and touch). While
  dragging, `current` tracks the pointer 1:1 with no CSS transition, so there
  is no lag between the finger and the deck. On release, velocity from the
  last move carries into a short glide before it snaps to the nearest card -
  a fast flick lands a card or two further than a slow one.
- **Snap**: a `.is-settling` class toggles a `transition: transform` on the
  cards only while animating to rest; it's removed again on the next drag or
  wheel so the next interaction is instant, not fighting a transition already
  in flight.
- **Wheel**: trackpad `deltaX` or a plain mouse `deltaY` both drive `current`
  directly, debounced to a snap once scrolling stops.
- **Responsive**: card width, the gap between centres, and the falloff curve
  are all recomputed from the stage's own width on load and on resize, so the
  deck occupies the same share of the screen on a phone as on a desktop
  rather than spilling past the edges or shrinking to a strip. Nav arrows
  hide under 30rem, where they'd crowd the deck more than help it.
- Off-centre cards are click-to-focus; the centred card is not (nothing to
  do by clicking it). `aria-hidden` follows which one is centred.

Verified: dragging, wheel, both nav buttons, arrow keys and click-to-focus
each land on the expected card, checked by dispatching real `PointerEvent`/
`WheelEvent`/`KeyboardEvent`s and reading which card's `aria-hidden` flipped
- not by eyeballing a screenshot. One photo that looked blank in a first
screenshot turned out to be real image data at reduced opacity (a bright
beach photo faded toward the edge of the deck), confirmed by sampling its
pixels on a canvas rather than assumed. No failed loads, no horizontal
overflow, correct in both languages.

## Gallery: autoplay, and a slightly bigger stage

Two follow-ups on the depth carousel.

**Autoplay**, medium-high pace (1.9s per step), advancing forward and
wrapping from the last photo back to the first rather than stopping there -
`(Math.round(current) + 1) % cards.length`, the one piece of arithmetic this
added on top of the already-proven `snapTo()`.

It steps aside the moment anyone actually touches the deck: a drag, a wheel
nudge, either nav button, or an arrow key all pause it for 3.2s before it
resumes; hovering pauses it for as long as the pointer stays and resumes the
instant it leaves, with no countdown. It also will not run at all under
`prefers-reduced-motion` - a carousel that moves on its own is exactly the
kind of motion that setting exists to suppress - and it stops while the tab
is backgrounded or the gallery has scrolled out of view, via
`visibilitychange` and an `IntersectionObserver` on the stage, so it can't
burn through several photos while nobody is looking and then dump the
visitor several cards further along than where they left it.

**Stage size**: `.depthcar` height `380px → 440px` at its ceiling,
`.depthcar__card` width `230px → 270px`, and the JS-side gap ceiling raised
to match (`220px → 250px`) so the spacing between card centres keeps the
same proportion to the now-larger cards rather than compressing their
overlap.

**Verification note**: the live "does it actually tick every 1.9s" behaviour
could not be observed directly in this session's own preview tab -
`document.hidden` reads `true` there regardless of front/back state, which
throttles `IntersectionObserver` entirely (established earlier this session
with an unrelated, freshly-created observer that also never fired under the
same condition). That gate is exactly what should stop autoplay on a
real visitor's backgrounded tab, so the same thing blocking my test here is
the feature working, not evidence against it. What's independently
verified: the wrap-around arithmetic lands correctly at the boundary
(index 6 of 7 wraps to 0), and the full existing interaction battery -
drag, wheel, both buttons, both arrow keys, hover in/out - all still fire
without error now that each one also calls into the new pause logic.

## Invite card: garlands moved onto the card's own corner

User: the corner floral decorations on the formal invitation panel were
floating in the empty page margin beside the card, not attached to it.

The cause: `.deco--corner-tl`/`.deco--corner-br` were positioned against
`.invite` - the full-width section - with `left: 0` / `right: 0`. That
placed them at the section's own edges. `.invite__card`, the thing they were
meant to decorate, is centred and capped at `33rem`, so on anything wider
than a phone there was a gap of empty section between the card's actual edge
and where the flowers sat.

Moved the two `<div class="deco...">` elements from being children of
`.invite` (siblings of the card) to children of `.invite__card` itself, so
`position: absolute` resolves against the card's own box - the nearest
positioned ancestor - not the section's. Small negative insets (`-7%`, `-4%`
under 26rem) let them spill slightly over the card's actual border, which is
what "at the edge" means for a corner flourish: straddling it, not floating
near it.

Verified at 375px and desktop, both languages: no horizontal overflow, no
failed loads, flowers sit on the card's own corner in both.

## Gallery: faster autoplay, and a touch-safe hover pause

User: the gallery's autoplay should move faster, and keep going rather than
stopping before every photo has had its turn.

- Step interval `1.9s → 1.1s`, snap transition `.5s → .38s` to match - the
  whole thing reads noticeably quicker rather than just ticking faster with
  the same slow settle in between.
- The wraparound step (`(current + 1) % cards.length`) already guarantees
  every photo comes up on a perpetual loop; nothing changed there.
- Hardened the one way autoplay could get stuck rather than looping forever:
  hover-pause was on `mouseenter`/`mouseleave`, and some browsers fire a
  synthetic `mouseenter` for a touch tap with no matching `mouseleave` -
  which would pause it for good after a single tap on a phone, with nothing
  to un-pause it. Switched to `pointerenter`/`pointerleave` gated on
  `e.pointerType === "mouse"`, so only a real mouse hover pauses indefinitely;
  a touch tap still pauses briefly (through the existing `pointerdown`
  handler) and resumes on its own after 3.2s same as any other interaction.

Verified: no console errors and no horizontal overflow after simulating a
touch tap (`pointerenter`/`pointerdown`/`pointerup` with `pointerType:
"touch"`) on the stage.

## Event cards: closed the gap, fixed the Lagna schedule, and dropped the boxed time list

Three asks from one set of screenshots.

**1. Too much empty space above the illustration.** `.inv__ill` sits with
`margin: auto auto 0`, which means it always claims the bottom of the card
and pushes ALL the leftover vertical space into the gap directly above it -
the emptier the text content, the bigger that gap. Rather than shrinking the
gap directly (there's nothing to set it *to* - it's whatever's left over),
closed it from the other end: bumped the size and top margin on every text
element in the content block (`.inv__day`, `.inv__md`, `.inv__times`,
`.inv__tagline`, `.inv__venue`, and the `.inv__when` row that holds the
date). A taller content block leaves the auto-margin less to eat. Matched
the same increases in the `@media (max-width: 39.99rem)` block, which
overrides several of these with fixed values for phones and would otherwise
have silently undone the fix there.

**2. The Lagna card's baraat schedule.** Two fixes:
- The compact time shown under "DECEMBER" (`4:00 PM`) was `times[0].value` -
  correct for a card with one time, but Lagna has three, and showing just
  the first implied it was *the* time when the full breakdown sits right
  below it. Now falls back to the year instead, exactly like a card with no
  time at all does - `times.length === 1 ? times[0].value : "2026"`.
- `Bharat Prastan` / `Bharat Aagman` → `Baraat Prastan` / `Baraat Aagman`.
  Bharat is the country; baraat is the groom's wedding procession, which is
  what these actually are. The Gujarati (`બરાત`) already had it right - only
  the English label was wrong.

**3. The boxed time list.** Each row was its own white, rounded, backdrop-
blurred pill with a coloured left border - a UI-component look, not
stationery, and nothing else on any card is styled that way. Replaced with
plain rows separated by a thin hairline (no fill, no border-radius, no
backdrop-filter), matching how `.inv__venue`/`.inv__tagline` just sit on the
card's own paper.

Verified in both languages, 375px and desktop: 0px overflow on all four
cards (`.inv` clips overflow silently rather than erroring, so this was
checked by measurement, not assumed), no failed loads.

## Language switch is now a two-segment toggle, and the scroll cue is gone

**Language toggle.** Was a single pill that always named the OTHER language
("read in Gujarati" while reading English, "read in English" while reading
Gujarati") - one tap target, one label, the current language never shown.
Replaced with a two-segment switch, both languages visible at once
(`EN` | `ગુ`), the active one filled in the cards' own berry plum, matching
the reference sent. `content.js` gained `ui.langShort` (`EN`/`ગુ`) alongside
the existing full-name `langName`, which nothing else used and is now gone.
Each segment is its own button; only the inactive one is clickable, so a tap
on the language already showing does nothing rather than reloading the page
for no reason.

Gujarati keeps its own rule inside the toggle too - `.langswitch__opt--gu`
carries no letter-spacing and a slightly larger size for the same reason
every other Gujarati label on the page doesn't: tracking pulls a matra away
from its consonant.

**Scroll cue removed.** The "SCROLL" label and falling line beneath the hero
fountain - `.scroll-cue`, `#scrollCue`, and its `content.js` entry are gone
outright, along with the reduced-motion and Gujarati overrides that only
existed to adjust it.

Verified at 375px and desktop, both languages: switching works in both
directions, the correct segment is marked `is-active`/`aria-pressed`, no
horizontal overflow, no failed loads, scroll cue confirmed absent from the
DOM.

## Hero: Ganesha at the top, a welcome line into the date, scroll cue back

User marked up a screenshot with three annotations.

**Ganesha (red box).** Added `ganesha_motif.png` - the same illustration
already used in the formal invitation panel below - centred above the
"TOGETHER WITH THEIR FAMILIES" eyebrow, small (blessing, not the hero's
subject). Reused rather than generated: a printed kankotri repeats its
Ganesha across panels as a matter of convention, not an accident, and the
asset already exists.

**Welcome line (green scribble).** New `headline.welcomeLine` in
content.js, rendered between the Gujarati names and the date rule so
"Welcomes you to their wedding on / 1 – 2 December 2026" reads as one
sentence split across two lines, in the serif italic rather than the tracked
caps the date/venue rows use - it's a sentence, not a label.

**Scroll cue (blue scribble).** Re-added - it had been removed two commits
ago on a different, narrower request that turned out not to mean this. Built
it back rather than reverting, since content.js/index.html/main.js have all
moved on since.

It's back in normal document flow this time, not pinned to the hero's bottom
edge like before. The Ganesha and welcome line are two more lines of content
than the original spacing was tuned for, and a fixed-position cue doesn't
know that - on a short viewport it ran 14-38px into the venue/city text
depending on exactly how short. Flow doesn't have that failure mode: the cue
just settles under however tall the content actually is, on any screen, and
physically cannot overlap it. The trade-off is it can sit below the first
fold on a very short viewport - a minor cost against a cue that used to
collide with real text.

Verified in both languages, 375px and desktop: no horizontal overflow, no
failed loads, zero gap turned negative between the venue text and the cue
at a deliberately short 699px test viewport (11px clear, was -38px pinned).

## Interactive temple bell intro screen and corner flourishes alignment

- Retained interactive intro scene (temple bell and elephant with strike animation and bilingual ring cue).
- Fixed invitation card corner botanical flourishes (`corner_botanical.png`):
  - Bottom-right corner lifted up (`bottom: -1.5%`, `right: -7%`, `scale: -1 1`) to sit flush against the card's double gold border.
  - Top-left corner flipped and raised (`top: -1.5%`, `left: -7%`, `scale: 1 -1`) so the rose cluster sits directly in the corner with sprigs framing the top and left borders symmetrically with the bottom-right corner.

## Merge: intro3 temple-bell rebuild with hero Ganesha/welcome/scroll-cue

Concurrent session pushed `08a8fd4` (interactive temple-bell intro rebuild,
new `intro3_*` assets, corner-botanical alignment) while this session had
`39a9aab` (hero Ganesha/welcome-line/scroll-cue) on top of the same base.

Two conflicts, both from unrelated content landing at the same line:
- `content.js`: kept `scrollCue` (this session) alongside `introCueTitle`/
  `introCueSub` (other session) - different features, no overlap.
- `BUILD_LOG.md`: kept both sessions' appended entries.

`index.html`/`main.js`/`styles.css` auto-merged without conflict. Re-verified
by hand anyway, since the other session's stated focus ("align invitation
corner botanicals") directly overlaps `.invite`'s corner-garland fix from
`219cc7a`: confirmed `.deco--corner-tl`/`.deco--corner-br` are still children
of `.invite__card` (not `.invite`), so their negative-percentage insets
resolve against the card's own box, not the section - the fix survived.

Verified in-browser post-merge: no console errors, no horizontal overflow,
EN/GU toggle switches both directions, Ganesha + welcome line + scroll cue
render without overlapping the temple-bell intro. Pushed as `7e388ee`.

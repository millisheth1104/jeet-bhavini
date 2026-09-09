#!/usr/bin/env python3
"""Crop every transparent cutout to its alpha bounding box.

The matting models return the object centred inside the full canvas, padded
with transparency. That padding is invisible but still occupies layout space,
so an element sized by height ends up several times wider than the artwork it
shows. Trimming to the alpha bounds makes CSS sizing mean what it says.

Opaque images (backdrops, textures) are left alone.

    python scripts/trim_alpha.py            # trim in place, report
    python scripts/trim_alpha.py --dry-run
"""
import sys
import pathlib
from PIL import Image

SRC = pathlib.Path("assets/generated")
# Ignore near-zero alpha so faint matting halos don't defeat the crop.
ALPHA_FLOOR = 8

# Animation frames must keep identical framing across the whole cycle, so
# they are cropped together by scripts/gen_bird_frames.py, not here.
SKIP = {"bird_%s_%d" % (k, i) for k in "ab" for i in range(1, 5)}


def trim(path, dry=False):
    im = Image.open(path)
    if im.mode != "RGBA":
        return None                      # opaque backdrop, nothing to do

    alpha = im.getchannel("A")
    mask = alpha.point(lambda a: 255 if a > ALPHA_FLOOR else 0)
    box = mask.getbbox()
    if box is None:
        return ("EMPTY", im.size, im.size)   # fully transparent - a failed matte
    if box == (0, 0) + im.size:
        return ("FULL", im.size, im.size)    # already tight

    out = im.crop(box)
    if not dry:
        out.save(path)
    return ("TRIM", im.size, out.size)


def main():
    dry = "--dry-run" in sys.argv
    files = sorted(SRC.glob("*.png"))
    if not files:
        sys.exit("no PNGs in %s" % SRC)

    empty = []
    for f in files:
        if f.stem in SKIP:
            print("skip  %-20s animation frame (see gen_bird_frames.py)" % f.stem)
            continue
        r = trim(f, dry)
        if r is None:
            print("skip  %-20s opaque" % f.stem)
            continue
        kind, before, after = r
        if kind == "EMPTY":
            empty.append(f.stem)
            print("EMPTY %-20s matte removed everything" % f.stem)
        elif kind == "FULL":
            print("keep  %-20s %dx%d already tight" % (f.stem, *before))
        else:
            pct = 100 * (after[0] * after[1]) / (before[0] * before[1])
            print("trim  %-20s %dx%d -> %dx%d  (%.0f%% of area)"
                  % (f.stem, before[0], before[1], after[0], after[1], pct))

    if empty:
        print("\nfully transparent, regenerate these: %s" % " ".join(empty))
        return 1
    print("\n%s%d files" % ("(dry run) " if dry else "", len(files)))
    return 0


if __name__ == "__main__":
    sys.exit(main())

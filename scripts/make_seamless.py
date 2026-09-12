#!/usr/bin/env python3
"""Build a paper-grain tile that repeats invisibly.

Why not just use the generated texture: an image model paints large-scale
shading - edge toning, a vignette - and its edges do not match. Tiled, that
shows as a grid of lines across the whole page.

Why not just mirror it: mirroring makes opposite edges identical, so the seams
go, but it puts a crease down the middle of every tile where the shading
reverses direction. That is just a different visible line.

So the grain is synthesised instead, with two properties that make a repeat
impossible to see:

  - **Seamless by construction.** The noise is tiled 3x3 *before* blurring and
    the centre is cropped back out, so the blur kernel wraps around the edges
    instead of running off them. Opposite edges then match exactly.
  - **No low frequencies.** A heavily blurred copy is subtracted, leaving only
    fine grain. This is the part that matters most: without it, even a
    perfectly seamless tile reads as a grid of patches.

    python scripts/make_seamless.py                 # write the default tile
    python scripts/make_seamless.py --size 512 --amp 3.5 --grain 1.1
"""
import sys
import pathlib

import numpy as np
from PIL import Image, ImageFilter

OUT = pathlib.Path("assets/generated/paper_grain.png")
SIZE = 640          # tile edge, px
AMP = 2.6           # grain amplitude in levels; keep small, it multiplies
GRAIN = 1.7         # blur radius for the fibre, px
FLATTEN = 24.0      # radius of the low-frequency copy that gets subtracted
TARGET = 250.0      # near-white, so the multiply blend is a whisper
SEED = 20261202


def _wrap_blur(a, radius):
    """Gaussian blur that wraps at the edges, so the result still tiles."""
    s = a.shape[0]
    big = np.tile(a, (3, 3))
    img = Image.fromarray(np.clip(big, 0, 255).astype(np.uint8), "L")
    img = img.filter(ImageFilter.GaussianBlur(radius))
    return np.asarray(img).astype(np.float64)[s:2 * s, s:2 * s]


def build(size=SIZE, amp=AMP, grain=GRAIN, seed=SEED):
    rng = np.random.default_rng(seed)
    noise = rng.normal(128.0, 26.0, (size, size))

    fibre = _wrap_blur(noise, grain)          # soften into paper fibre
    low = _wrap_blur(fibre, FLATTEN)          # the part that would form a grid
    detail = fibre - low                      # fine grain only

    sd = detail.std() or 1.0
    out = TARGET + (detail / sd) * amp
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "L")


def report(img, label):
    a = np.asarray(img.convert("L")).astype(float)
    h, w = a.shape
    corners = np.mean([a[:h // 6, :w // 6].mean(), a[:h // 6, -w // 6:].mean(),
                       a[-h // 6:, :w // 6].mean(), a[-h // 6:, -w // 6:].mean()])
    centre = a[h // 3:2 * h // 3, w // 3:2 * w // 3].mean()
    # a mirror crease shows as a jump across the tile's middle column/row
    midc = abs(a[:, w // 2 - 1] - a[:, w // 2]).mean()
    midr = abs(a[h // 2 - 1, :] - a[h // 2, :]).mean()
    print("%-7s %dx%d  mean %.1f  edges L-R %.2f T-B %.2f  vignette %.2f  "
          "crease %.2f/%.2f"
          % (label, w, h, a.mean(),
             abs(a[:, 0] - a[:, -1]).mean(), abs(a[0, :] - a[-1, :]).mean(),
             abs(corners - centre), midc, midr))


def main():
    size, amp, grain = SIZE, AMP, GRAIN
    for i, a in enumerate(sys.argv):
        if a == "--size":  size = int(sys.argv[i + 1])
        if a == "--amp":   amp = float(sys.argv[i + 1])
        if a == "--grain": grain = float(sys.argv[i + 1])

    if OUT.exists():
        report(Image.open(OUT), "before")
    img = build(size, amp, grain)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT)
    report(img, "after")
    print("wrote %s  (tile with background-size: %dpx)" % (OUT, size))


if __name__ == "__main__":
    main()

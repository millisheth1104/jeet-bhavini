"""Cut the palace doors out of royal_door_frame.png into a real portal.

The original art has the two doors *painted into* the facade, and the old
royal_door_left/right.png were plain rectangular crops that carried a slice of
the pink scallop arch with them. Rotating those looked wrong twice over: the
arch swung with the leaf, and the painted doors underneath showed through the
seam.

This produces three files instead:

  portal_facade.png      the facade with the doorway punched out (alpha 0),
                         so whatever sits behind it is what you see through
                         the opening
  portal_leaf_left.png   the left half of the door, alpha-cut to the arch
  portal_leaf_right.png  the right half, likewise

The doorway outline is measured off the art rather than guessed: the door is
far darker than the pink surround, so the first run of dark pixels down each
column gives the arch curve. Those samples are then fitted to a circle, which
is what the painter drew - a segmental arch - and the fit is used for the cut
so the edge is smooth and exactly symmetric. Reading the detected curve
directly does not work: the meeting stile is bright gold and the jamb shadow
runs high, both of which put spikes in it.

Run from the repo root:  python scripts/gen_portal.py
"""

import os

import numpy as np
from PIL import Image, ImageFilter

SRC = "assets/generated/royal_door_frame.png"
OUT = "assets/generated"

# Doorway bounds in the 768x1376 plate, read off the art with a coordinate
# grid overlay.
LEFT, RIGHT = 258, 526
CENTRE = (LEFT + RIGHT) // 2
BOTTOM = 1152

# Circle fitted to the detected arch samples: centre (CENTRE, ARC_CY),
# radius ARC_R. Apex lands at y = ARC_CY - ARC_R = 562, and the arc meets the
# jambs at y = 652, below which the doorway is a plain rectangle.
ARC_CY, ARC_R = 707.0, 145.0


def arch_top(x):
    """y of the doorway's top edge at column x."""
    dx = x - CENTRE
    if abs(dx) >= ARC_R:
        return BOTTOM
    return ARC_CY - (ARC_R ** 2 - dx ** 2) ** 0.5


def build():
    plate = Image.open(SRC).convert("RGBA")
    w, h = plate.size

    # Solid silhouette of the doorway: everything between the arch curve and
    # the threshold. Nothing inside is cut out - the meeting stile and the
    # gold ornament are door, they just are not dark.
    mask = np.zeros((h, w), dtype=np.uint8)
    for x in range(LEFT, RIGHT):
        mask[int(round(arch_top(x))):BOTTOM, x] = 255
    mask_img = Image.fromarray(mask, "L").filter(ImageFilter.GaussianBlur(0.8))

    # --- facade: the plate with the doorway punched out ------------------
    # The plate's own alpha already has a hole, but a far bigger one: it runs
    # up to y=415 and takes the whole scalloped surround with it, which is why
    # the old leaves had crimson scallops baked into their top corners and
    # swung them open too. The painting itself is intact in the RGB channels
    # under that hole, so the alpha is rebuilt from scratch here - opaque
    # everywhere, minus the door.
    facade = plate.copy()
    facade.putalpha(Image.eval(mask_img, lambda v: 255 - v))
    facade.save(os.path.join(OUT, "portal_facade.png"))

    # --- leaves: the door itself, split down the meeting stile -----------
    door = plate.copy()
    door.putalpha(mask_img)
    apex = int(arch_top(CENTRE))
    for name, x0, x1 in (("left", LEFT, CENTRE), ("right", CENTRE, RIGHT)):
        leaf = door.crop((x0, apex, x1, BOTTOM))
        leaf.save(os.path.join(OUT, "portal_leaf_%s.png" % name))
        print("portal_leaf_%s.png %s" % (name, leaf.size))

    # Geometry the stylesheet needs, as percentages of the plate.
    print("plate %dx%d" % (w, h))
    print("aperture  left %.3f%%  top %.3f%%  width %.3f%%  height %.3f%%" % (
        100 * LEFT / w, 100 * apex / h,
        100 * (RIGHT - LEFT) / w, 100 * (BOTTOM - apex) / h))
    print("apex y=%d  jamb y=%d  bottom y=%d" % (apex, arch_top(LEFT), BOTTOM))


if __name__ == "__main__":
    build()

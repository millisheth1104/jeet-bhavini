"""Cut the royal palace doors out of royal_palace_master.jpg into a real portal.

Generates:
  portal_facade.png      the facade with the arched doorway smoothly punched out (alpha 0)
  portal_leaf_left.png   the left half of the carved golden sandalwood door, alpha-cut to the arch
  portal_leaf_right.png  the right half, with 1px overlap at center to eliminate seams

Run from the repo root:  python scripts/gen_portal.py
"""

import os
from PIL import Image, ImageFilter
import numpy as np

SRC = "assets/generated/royal_palace_master.jpg"
OUT = "assets/generated"

# Doorway bounds in the 768x1376 plate
LEFT = 143
RIGHT = 624
BOTTOM = 1202
CX = 384
R = 241.0
CY = 551.0
APEX = 310

def arch_top(x):
    """y coordinate of the round arch at column x."""
    dx = abs(x - CX)
    if dx >= R:
        return CY
    return CY - np.sqrt(R * R - dx * dx)

def build():
    src = Image.open(SRC).convert("RGBA")
    w, h = src.size

    # Create smooth anti-aliased door aperture mask
    mask_arr = np.zeros((h, w), dtype=np.uint8)
    for x in range(LEFT, RIGHT):
        y_top = int(round(arch_top(x)))
        mask_arr[y_top:BOTTOM, x] = 255

    mask = Image.fromarray(mask_arr, "L").filter(ImageFilter.GaussianBlur(0.6))

    # 1. Facade: plate with the doorway punched out
    facade = src.copy()
    facade.putalpha(Image.eval(mask, lambda v: 255 - v))
    facade.save(os.path.join(OUT, "portal_facade.png"))
    print("Saved portal_facade.png:", facade.size)

    # 2. Door leaves
    door = src.copy()
    door.putalpha(mask)

    # Left leaf: LEFT to CX + 1
    leaf_l = door.crop((LEFT, APEX, CX + 1, BOTTOM))
    leaf_l.save(os.path.join(OUT, "portal_leaf_left.png"))
    print("Saved portal_leaf_left.png:", leaf_l.size)

    # Right leaf: CX - 1 to RIGHT
    leaf_r = door.crop((CX - 1, APEX, RIGHT, BOTTOM))
    leaf_r.save(os.path.join(OUT, "portal_leaf_right.png"))
    print("Saved portal_leaf_right.png:", leaf_r.size)

    # Print geometry percentages for styles.css
    door_w = RIGHT - LEFT
    door_h = BOTTOM - APEX
    cx_pct = 100.0 * CX / w
    cy_pct = 100.0 * ((APEX + BOTTOM) / 2.0) / h
    print("plate %dx%d" % (w, h))
    print("doorway left=%.3f%% top=%.3f%% width=%.3f%% height=%.3f%%" % (
        100.0 * LEFT / w, 100.0 * APEX / h,
        100.0 * door_w / w, 100.0 * door_h / h))
    print("center x=%.3f%% y=%.3f%%" % (cx_pct, cy_pct))

if __name__ == "__main__":
    build()

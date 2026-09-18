#!/usr/bin/env python3
"""Slice royal_palace_entrance.jpg into:
- royal_door_frame.png: Palace facade with transparent doorway opening.
- royal_door_left.png: Left door leaf.
- royal_door_right.png: Right door leaf.
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def main():
    im = Image.open("assets/generated/royal_palace_entrance.jpg").convert("RGBA")
    W, H = im.size
    print(f"Palace entrance: {W}x{H}")

    # Geometry coordinates
    CX = 385
    LEFT_X = 236
    RIGHT_X = 533
    APEX_Y = 412
    SPRING_Y = 535
    BOTTOM_Y = 1154

    # Arch points left side: from (CX, APEX_Y) to (LEFT_X, SPRING_Y)
    # Cubic bezier arch curve:
    steps = 40
    p0 = (CX, APEX_Y)
    p1 = (CX - 40, APEX_Y + 15)
    p2 = (LEFT_X + 20, SPRING_Y - 40)
    p3 = (LEFT_X, SPRING_Y)

    arch_l = []
    for i in range(steps + 1):
        t = i / steps
        x = (1-t)**3 * p0[0] + 3*(1-t)**2*t * p1[0] + 3*(1-t)*t**2 * p2[0] + t**3 * p3[0]
        y = (1-t)**3 * p0[1] + 3*(1-t)**2*t * p1[1] + 3*(1-t)*t**2 * p2[1] + t**3 * p3[1]
        arch_l.append((x, y))

    # Arch points right side: symmetrical
    p0_r = (CX, APEX_Y)
    p1_r = (CX + 40, APEX_Y + 15)
    p2_r = (RIGHT_X - 20, SPRING_Y - 40)
    p3_r = (RIGHT_X, SPRING_Y)

    arch_r = []
    for i in range(steps + 1):
        t = i / steps
        x = (1-t)**3 * p0_r[0] + 3*(1-t)**2*t * p1_r[0] + 3*(1-t)*t**2 * p2_r[0] + t**3 * p3_r[0]
        y = (1-t)**3 * p0_r[1] + 3*(1-t)**2*t * p1_r[1] + 3*(1-t)*t**2 * p2_r[1] + t**3 * p3_r[1]
        arch_r.append((x, y))

    full_door_poly = (
        arch_l +
        [(LEFT_X, BOTTOM_Y), (RIGHT_X, BOTTOM_Y)] +
        list(reversed(arch_r))
    )

    # 1. Left Door Mask & Crop
    # Bounding box for left door: (LEFT_X, APEX_Y, CX, BOTTOM_Y)
    mask_l = Image.new("L", (W, H), 0)
    draw_l = ImageDraw.Draw(mask_l)
    poly_l = arch_l + [(LEFT_X, BOTTOM_Y), (CX, BOTTOM_Y), (CX, APEX_Y)]
    draw_l.polygon(poly_l, fill=255)

    left_im = im.copy()
    left_im.putalpha(mask_l)
    crop_l = left_im.crop((LEFT_X, APEX_Y, CX, BOTTOM_Y))
    crop_l.save("assets/generated/royal_door_left.png")
    print(f"Saved royal_door_left.png: {crop_l.size}")

    # 2. Right Door Mask & Crop
    # Bounding box for right door: (CX, APEX_Y, RIGHT_X, BOTTOM_Y)
    mask_r = Image.new("L", (W, H), 0)
    draw_r = ImageDraw.Draw(mask_r)
    poly_r = [(CX, APEX_Y), (CX, BOTTOM_Y), (RIGHT_X, BOTTOM_Y)] + list(reversed(arch_r))
    draw_r.polygon(poly_r, fill=255)

    right_im = im.copy()
    right_im.putalpha(mask_r)
    crop_r = right_im.crop((CX, APEX_Y, RIGHT_X, BOTTOM_Y))
    crop_r.save("assets/generated/royal_door_right.png")
    print(f"Saved royal_door_right.png: {crop_r.size}")

    # 3. Outer Frame Mask
    mask_frame = Image.new("L", (W, H), 255)
    draw_f = ImageDraw.Draw(mask_frame)
    # Erode doorway cutout by 1px so door leaves sit under frame without hair gap
    draw_f.polygon(full_door_poly, fill=0)

    frame = im.copy()
    frame.putalpha(mask_frame)
    frame.save("assets/generated/royal_door_frame.png")
    print(f"Saved royal_door_frame.png: {frame.size}")

    # 4. Recomposite test
    test = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    test.paste(crop_l, (LEFT_X, APEX_Y))
    test.paste(crop_r, (CX, APEX_Y))
    test.alpha_composite(frame)
    test.save("assets/generated/test_entrance_composite.png")
    print("Saved test_entrance_composite.png")

if __name__ == "__main__":
    main()

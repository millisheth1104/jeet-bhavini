#!/usr/bin/env python3
"""
Slice jaipur_royal_door.jpg into:
1. royal_door_frame.png: Outer facade with transparent doorway cutout.
2. royal_door_left.png: Left door leaf.
3. royal_door_right.png: Right door leaf.
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def main():
    im = Image.open("assets/generated/jaipur_royal_door.jpg").convert("RGBA")
    W, H = im.size
    print(f"Source size: {W}x{H}")

    # Precise door coordinates
    LEFT_X = 275
    RIGHT_X = 496
    CX = 386
    TOP_Y = 516
    BOTTOM_Y = 1100

    door_w = RIGHT_X - LEFT_X
    door_h = BOTTOM_Y - TOP_Y
    print(f"Door box: ({LEFT_X}, {TOP_Y}) to ({RIGHT_X}, {BOTTOM_Y}), size: {door_w}x{door_h}")

    # 1. Left Door Leaf
    left_crop = im.crop((LEFT_X, TOP_Y, CX, BOTTOM_Y))
    left_crop.save("assets/generated/royal_door_left.png")
    print(f"Saved royal_door_left.png: {left_crop.size}")

    # 2. Right Door Leaf
    right_crop = im.crop((CX, TOP_Y, RIGHT_X, BOTTOM_Y))
    right_crop.save("assets/generated/royal_door_right.png")
    print(f"Saved royal_door_right.png: {right_crop.size}")

    # 3. Outer Frame (Doorway cut out with clean alpha)
    frame = im.copy()
    # Mask is white (opaque) everywhere except the doorway
    mask = Image.new("L", (W, H), 255)
    draw = ImageDraw.Draw(mask)
    # Cutout rectangle (slightly inset by 1px so door leaves sit under frame without gap)
    draw.rectangle([LEFT_X + 1, TOP_Y + 1, RIGHT_X - 1, BOTTOM_Y - 1], fill=0)

    frame.putalpha(mask)
    frame.save("assets/generated/royal_door_frame.png")
    print(f"Saved royal_door_frame.png: {frame.size}")

    # 4. Also create a test composite to verify pixel-perfect reconstruction
    test = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    test.paste(left_crop, (LEFT_X, TOP_Y))
    test.paste(right_crop, (CX, TOP_Y))
    test.alpha_composite(frame)
    test.save("assets/generated/test_door_composite.png")
    print("Saved test_door_composite.png")

if __name__ == "__main__":
    main()

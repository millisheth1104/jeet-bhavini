#!/usr/bin/env python3
"""Slice the royal palace door into:
- royal_door_frame.png (outer wall, pillars, and arch with transparent doorway)
- royal_door_left.png (left swinging leaf)
- royal_door_right.png (right swinging leaf)
"""

import numpy as np
from PIL import Image, ImageDraw

def slice_doors():
    im = Image.open("assets/generated/royal_palace_door.jpg").convert("RGBA")
    W, H = im.size
    
    # Door parameters (refined from pixel measurement)
    CX = 514
    APEX_Y = 328
    SPRING_Y = 690
    BOTTOM_Y = 1346
    LEFT_X = 280
    RIGHT_X = 748
    
    # We create a polygon/bezier mask for the doorway opening:
    # From (CX, APEX_Y), curves down to (LEFT_X, SPRING_Y), down to (LEFT_X, BOTTOM_Y),
    # across to (RIGHT_X, BOTTOM_Y), up to (RIGHT_X, SPRING_Y), and curves up to (CX, APEX_Y).
    
    mask_doorway = Image.new("L", (W, H), 0)
    draw = ImageDraw.Draw(mask_doorway)
    
    # Generate points along the arch
    arch_pts_left = []
    steps = 40
    # Left arch: cubic bezier or ellipse
    # Curve from (CX, APEX_Y) to (LEFT_X, SPRING_Y)
    # The arch has a slight ogee point at apex:
    # Control points: (CX, APEX_Y) -> (CX - 30, APEX_Y + 40) -> (LEFT_X + 20, SPRING_Y - 140) -> (LEFT_X, SPRING_Y)
    p0 = (CX, APEX_Y)
    p1 = (CX - 35, APEX_Y + 50)
    p2 = (LEFT_X + 25, SPRING_Y - 120)
    p3 = (LEFT_X, SPRING_Y)
    for i in range(steps + 1):
        t = i / steps
        x = (1-t)**3 * p0[0] + 3*(1-t)**2*t * p1[0] + 3*(1-t)*t**2 * p2[0] + t**3 * p3[0]
        y = (1-t)**3 * p0[1] + 3*(1-t)**2*t * p1[1] + 3*(1-t)*t**2 * p2[1] + t**3 * p3[1]
        arch_pts_left.append((x, y))
        
    arch_pts_right = []
    # Right arch: symmetrical
    p0_r = (CX, APEX_Y)
    p1_r = (CX + 35, APEX_Y + 50)
    p2_r = (RIGHT_X - 25, SPRING_Y - 120)
    p3_r = (RIGHT_X, SPRING_Y)
    for i in range(steps + 1):
        t = i / steps
        x = (1-t)**3 * p0_r[0] + 3*(1-t)**2*t * p1_r[0] + 3*(1-t)*t**2 * p2_r[0] + t**3 * p3_r[0]
        y = (1-t)**3 * p0_r[1] + 3*(1-t)**2*t * p1_r[1] + 3*(1-t)*t**2 * p2_r[1] + t**3 * p3_r[1]
        arch_pts_right.append((x, y))
        
    full_door_polygon = (
        arch_pts_left +
        [(LEFT_X, BOTTOM_Y), (RIGHT_X, BOTTOM_Y)] +
        list(reversed(arch_pts_right))
    )
    
    draw.polygon(full_door_polygon, fill=255)
    
    # 1. Left Door Mask
    mask_left = Image.new("L", (W, H), 0)
    draw_l = ImageDraw.Draw(mask_left)
    left_polygon = (
        arch_pts_left +
        [(LEFT_X, BOTTOM_Y), (CX, BOTTOM_Y), (CX, APEX_Y)]
    )
    draw_l.polygon(left_polygon, fill=255)
    
    # Crop left door to its bounding box
    left_door_rgba = im.copy()
    left_door_rgba.putalpha(mask_left)
    left_crop = left_door_rgba.crop((LEFT_X, APEX_Y, CX, BOTTOM_Y))
    left_crop.save("assets/generated/royal_door_left.png")
    print(f"Saved royal_door_left.png: {left_crop.size}")
    
    # 2. Right Door Mask
    mask_right = Image.new("L", (W, H), 0)
    draw_r = ImageDraw.Draw(mask_right)
    right_polygon = (
        [(CX, APEX_Y), (CX, BOTTOM_Y), (RIGHT_X, BOTTOM_Y)] +
        list(reversed(arch_pts_right))
    )
    draw_r.polygon(right_polygon, fill=255)
    
    # Crop right door to its bounding box
    right_door_rgba = im.copy()
    right_door_rgba.putalpha(mask_right)
    right_crop = right_door_rgba.crop((CX, APEX_Y, RIGHT_X, BOTTOM_Y))
    right_crop.save("assets/generated/royal_door_right.png")
    print(f"Saved royal_door_right.png: {right_crop.size}")
    
    # 3. Outer Frame Mask (Frame has full image, but doorway polygon is 0 alpha)
    mask_frame = Image.new("L", (W, H), 255)
    draw_f = ImageDraw.Draw(mask_frame)
    draw_f.polygon(full_door_polygon, fill=0)
    
    frame_rgba = im.copy()
    frame_rgba.putalpha(mask_frame)
    frame_rgba.save("assets/generated/royal_door_frame.png")
    print(f"Saved royal_door_frame.png: {frame_rgba.size}")

if __name__ == "__main__":
    slice_doors()

#!/usr/bin/env python3
"""Slice the generated royal pink palace entrance into frame and door leaves."""
from PIL import Image, ImageDraw

def process():
    src_path = r"C:\Users\vedant\.gemini\antigravity-ide\brain\bb0a640f-8f4d-4563-81d2-2f19429ec233\royal_pink_palace_entrance_1789679810842.jpg"
    im = Image.open(src_path).convert("RGBA")
    W, H = im.size
    print(f"Image dimensions: {W} x {H}")
    
    # Save a master copy to assets/generated/royal_palace_entrance.jpg
    im.convert("RGB").save("assets/generated/royal_palace_entrance.jpg", quality=95)
    print("Saved assets/generated/royal_palace_entrance.jpg")

if __name__ == "__main__":
    process()

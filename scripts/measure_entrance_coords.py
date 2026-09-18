from PIL import Image, ImageDraw
import numpy as np

im = Image.open('assets/generated/royal_palace_entrance.jpg')
W, H = im.size

# Let's inspect the door in royal_palace_entrance.jpg:
# Looking at the image:
# Center is x=385
# Bottom threshold of the door: where does it meet the top marble step?
# Let's check vertical strip along x=385 from y=1100 to 1160
for y in range(1120, 1160):
    print(f"y={y}: {im.getpixel((385, y))}")
    
# Left edge at y=900 (bottom panel)
for x in range(235, 255):
    print(f"L x={x}: {im.getpixel((x, 900))}")

# Right edge at y=900 (bottom panel)
for x in range(515, 535):
    print(f"R x={x}: {im.getpixel((x, 900))}")

# Apex at x=385
for y in range(410, 445):
    print(f"Apex y={y}: {im.getpixel((385, y))}")

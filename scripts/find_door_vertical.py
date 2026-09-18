from PIL import Image, ImageDraw
import numpy as np

im = Image.open("assets/generated/royal_palace_entrance.jpg").convert("RGBA")
W, H = im.size

# Let's find vertical bounds (top of inner door arch and bottom of door above the steps)
# Let's check vertical line at x = 385 (near center):
arr = np.array(im)
print("Vertical slice at x=385:")
for y in range(450, 1200, 20):
    r, g, b, _ = arr[y, 385]
    print(f"y={y}: R={r}, G={g}, B={b}")

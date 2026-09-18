from PIL import Image, ImageDraw
import numpy as np

im = Image.open('assets/generated/royal_palace_entrance.jpg').convert('RGBA')
W, H = im.size
print(f"Palace entrance: {W}x{H}")

# Let's find the exact door arch and frame
# In royal_palace_entrance.jpg:
# The door has two arched leaves meeting at center CX.
# Let's inspect the center vertical line between x=380 and 390
arr = np.array(im)
for x in range(380, 390):
    col = arr[700:1000, x]
    print(f"x={x}: avg RGB = {col.mean(axis=0).astype(int)}")

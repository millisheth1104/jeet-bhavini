from PIL import Image
import numpy as np

im = Image.open("assets/generated/royal_palace_entrance.jpg")
W, H = im.size
arr = np.array(im)

# Door center X is expected around W // 2 = 384
# Let's inspect horizontal line at y = 800 (mid-door)
mid_y = 800
print("Line at y=800:")
# Find where the door starts and ends on line y=800
# The doors are dark maroon (low G and B, moderate R)
# The pillars/frame are light pink/peach (high R, high G, moderate B)
for x in range(150, 650, 10):
    r, g, b = arr[mid_y, x]
    print(f"x={x}: R={r}, G={g}, B={b}")

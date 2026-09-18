from PIL import Image
import numpy as np

im = Image.open('assets/generated/royal_palace_entrance.jpg')
arr = np.array(im)
W, H = im.size
print(f"Size: {W}x{H}")

# The doors are deep purple/magenta/ruby with gold trim, inside the scalloped arch.
# Let's inspect horizontal row at y=900 (across the door)
row = arr[900]
print("Row at y=900, finding left and right door boundaries:")
for x in range(200, 300, 5):
    print(f"x={x}: {row[x]}")

for x in range(480, 580, 5):
    print(f"x={x}: {row[x]}")

# Center dividing line at y=900:
for x in range(375, 395):
    print(f"center x={x}: {row[x]}")

# Vertical bottom threshold:
cx = 385
print("Bottom threshold around cx=385:")
for y in range(1050, 1160, 5):
    print(f"y={y}: {arr[y, cx]}")

# Top of doors (the arched top of the doors):
print("Top of door arch around cx=385:")
for y in range(350, 480, 5):
    print(f"y={y}: {arr[y, cx]}")

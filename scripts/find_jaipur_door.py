from PIL import Image
import numpy as np

im = Image.open('assets/generated/jaipur_royal_door.jpg')
arr = np.array(im)

for x in range(265, 285):
    print(f"L x={x}: {arr[850, x]}")

for x in range(485, 505):
    print(f"R x={x}: {arr[850, x]}")

cx = 384
for y in range(500, 750, 10):
    print(f"Top y={y}: {arr[y, cx]}")

for y in range(1050, 1120, 5):
    print(f"Bot y={y}: {arr[y, cx]}")

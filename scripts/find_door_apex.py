from PIL import Image
import numpy as np

im = Image.open('assets/generated/jaipur_royal_door.jpg')
arr = np.array(im)
cx = 385

for y in range(480, 540, 2):
    print(f"y={y}: {arr[y, cx]}")

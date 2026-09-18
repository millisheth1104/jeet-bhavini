from PIL import Image
import numpy as np

im = Image.open('assets/generated/jaipur_royal_door.jpg')
arr = np.array(im)

print("Left border:")
for x in range(270, 285):
    print(f"x={x}: avg = {arr[800:1000, x].mean(axis=0).astype(int)}")

print("Right border:")
for x in range(485, 500):
    print(f"x={x}: avg = {arr[800:1000, x].mean(axis=0).astype(int)}")

print("Bottom threshold:")
for y in range(1090, 1106):
    print(f"y={y}: avg = {arr[y, 300:470].mean(axis=0).astype(int)}")

print("Top lintel / arch apex:")
for y in range(500, 545):
    print(f"y={y}: avg = {arr[y, 350:420].mean(axis=0).astype(int)}")

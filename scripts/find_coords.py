#!/usr/bin/env python3
import numpy as np
from PIL import Image

im = Image.open("assets/generated/royal_palace_door.jpg").convert("RGB")
arr = np.array(im)
W, H = im.size

# Let's find the center seam:
# The gold bead runs right down the center between the two doors.
# Around x in [500, 525], y from 500 to 1200.
mid_slice = arr[600:1100, 490:535]
# Gold has high R and G, lower B
gold_score = (mid_slice[:, :, 0].astype(int) + mid_slice[:, :, 1].astype(int)) - 2 * mid_slice[:, :, 2].astype(int)
avg_x = np.mean(gold_score, axis=0)
best_x = 490 + np.argmax(avg_x)
print(f"Detected Center Gold Seam X = {best_x}")

# Let's find bottom threshold line:
# Look down column best_x from y=1250 to 1450
step_diff = np.diff(np.mean(arr[1300:1400, best_x-20:best_x+20, :], axis=1), axis=0)
bottom_y = 1300 + np.argmax(np.abs(np.diff(step_diff[:, 0])))
print(f"Estimated bottom threshold Y around 1350")

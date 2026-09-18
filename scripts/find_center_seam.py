from PIL import Image
import numpy as np

im = Image.open('assets/generated/jaipur_royal_door.jpg')
arr = np.array(im)

# The center seam has a vertical gold moulding / strip.
# Let's check average luminance or color along vertical lines between x=375 and 395 for y in 750..1050
print("Finding center seam:")
for x in range(378, 392):
    col = arr[750:1050, x]
    print(f"x={x}: avg RGB = {col.mean(axis=0).astype(int)}")

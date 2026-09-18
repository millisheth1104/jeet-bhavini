from PIL import Image
import numpy as np

im = Image.open('assets/generated/jaipur_royal_door.jpg')
arr = np.array(im)

# For each x in 275..496, find the first y where the dark door begins
# The door is dark red (R < 130, G < 70, B < 50) while the arch above has pastel flowers & sandstone (R > 160, G > 120)
print("Door top edge profile:")
edge = []
for x in range(275, 497, 5):
    # Scan from y=480 down to 700
    found_y = None
    for y in range(500, 680):
        r, g, b = arr[y, x][:3]
        # Dark crimson door criterion
        if r < 140 and g < 75 and b < 50:
            found_y = y
            break
    edge.append((x, found_y))
    print(f"x={x}: y={found_y}")

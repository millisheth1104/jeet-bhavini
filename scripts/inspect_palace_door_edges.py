from PIL import Image
import numpy as np

im = Image.open('assets/generated/royal_palace_entrance.jpg')
arr = np.array(im)

# Let's inspect left edge (where pink pillar/arch meets dark door)
# and right edge (where dark door meets right pillar/arch)
# at y = 600, 700, 800, 900, 1000, 1100
for y in [600, 700, 800, 900, 1000, 1100]:
    # Left edge search from x=210 to 260
    left_x = None
    for x in range(210, 260):
        # Pillars are bright pink/cream (R > 200, G > 120, B > 120)
        # Door frame is dark ruby (R < 150, G < 50, B < 80)
        if arr[y, x, 0] < 150 and arr[y, x, 1] < 50:
            left_x = x
            break
            
    # Right edge search from x=550 down to 500
    right_x = None
    for x in range(550, 500, -1):
        if arr[y, x, 0] < 150 and arr[y, x, 1] < 50:
            right_x = x
            break
            
    print(f"y={y}: left_x={left_x}, right_x={right_x}")

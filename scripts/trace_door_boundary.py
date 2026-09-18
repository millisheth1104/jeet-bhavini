from PIL import Image, ImageDraw
import numpy as np

im = Image.open('assets/generated/royal_palace_entrance.jpg')
arr = np.array(im)

# Let's find the door opening boundary across y from 400 to 1150
# At each y, find left_x and right_x where the dark door begins
print("Door boundary trace:")
lefts = []
rights = []

for y in range(410, 1150, 10):
    # Left search from 385 down to 200
    lx = 385
    for x in range(385, 200, -1):
        # Sandstone/pink frame is lighter than dark door panel
        # Let's check when we hit the pink arch border
        # The pink border has high G and B compared to dark ruby door
        r, g, b = arr[y, x][:3]
        if r > 210 and g > 130 and b > 130:
            lx = x
            break
            
    # Right search from 385 up to 600
    rx = 385
    for x in range(385, 600):
        r, g, b = arr[y, x][:3]
        if r > 210 and g > 130 and b > 130:
            rx = x
            break
            
    print(f"y={y}: lx={lx}, rx={rx}, width={rx - lx}")

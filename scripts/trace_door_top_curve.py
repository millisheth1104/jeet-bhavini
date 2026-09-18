from PIL import Image
import numpy as np

im = Image.open('assets/generated/royal_palace_entrance.jpg')
arr = np.array(im)

# Let's find the top edge of the door for each x from 236 to 533 in steps of 10
print("Door top curve:")
cx = 385
for x in range(236, 534, 10):
    # Search y from 380 down to 700
    top_y = None
    for y in range(380, 700):
        # Look for door color: dark ruby/maroon
        # The frame above is bright pink/gold arch
        r, g, b = arr[y, x][:3]
        if r < 160 and g < 60 and b < 70:
            top_y = y
            break
    print(f"x={x}: top_y={top_y}")

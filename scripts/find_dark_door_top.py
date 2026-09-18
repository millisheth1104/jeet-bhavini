from PIL import Image
import numpy as np

im = Image.open('assets/generated/royal_palace_entrance.jpg')
arr = np.array(im)

# Let's check the top of the dark door itself across x in 240..530
print("Dark door top:")
for x in range(250, 520, 20):
    # Find where the dark door begins
    found_y = None
    for y in range(480, 600):
        r, g, b = arr[y, x][:3]
        # Pink arch has R > 200, G > 100
        # Dark door has R < 160, G < 60
        if r < 160 and g < 60:
            found_y = y
            break
    print(f"x={x}: dark door y={found_y}")

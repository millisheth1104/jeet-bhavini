from PIL import Image
import math

print("Left door hinge is at left (x=0). Handle is at right (x=W).")
print("Viewer is at +Z.")
print("In CSS right-handed 3D: +X is right, +Y is down, +Z is out towards viewer.")
print("rotateY(angle): rotation around Y axis (downwards).")
print("Standard right-hand rule with thumb pointing DOWN (+Y):")
print("Fingers curl from +Z -> -X -> -Z -> +X.")
print("So positive angle rotates +Z towards -X.")
print("For a point at (W, 0, 0) on the +X axis:")
print("At angle theta:")
print("x' = W * cos(theta)")
print("z' = -W * sin(theta)")
print("If theta = -60 deg: z' = -W * sin(-60) = +0.866 W > 0 (TOWARDS VIEWER!)")
print("If theta = +60 deg: z' = -W * sin(60) = -0.866 W < 0 (AWAY FROM VIEWER!)")

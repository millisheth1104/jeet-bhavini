#!/usr/bin/env python3
"""
generate_invite_assets.py

Extracts the traditional auspicious elements from the user's uploaded reference image
(media_1789753554971.jpg):
  1. invite_ganesha_lotus.png - Lord Ganesha seated on a pink lotus
  2. invite_hanging_lamps.png - Two hanging brass temple lamps with pink lotuses on chains
  3. invite_banana_leaves.png - Banana tree leaves, banana bunch, and hanging flower
  4. invite_samai_kalash.png  - Brass samai lamp pedestal and two lotus kalash pots
  5. invite_traditional_frame.png - The full composite transparent decorative frame
"""

import os
import cv2
import numpy as np
from PIL import Image

SRC_IMG = r"C:\Users\Lenovo\.gemini\antigravity-ide\brain\e6acddd0-8546-47c4-a2db-aced886e37fb\.user_uploaded\media_1789753554971.jpg"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "generated")

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    assert os.path.exists(SRC_IMG), f"Source image not found: {SRC_IMG}"

    bgr = cv2.imread(SRC_IMG)
    h, w, _ = bgr.shape
    bgr_f = bgr.astype(np.float32)
    b, g, r = cv2.split(bgr_f)

    # 1. Precise chroma and luma computation
    chroma = np.sqrt(0.5 * ((r - g)**2 + (g - b)**2 + (b - r)**2))
    luma = 0.299 * r + 0.587 * g + 0.114 * b

    # 2. Foreground core identification
    # The checkerboard is high luma (> 225) and near-zero chroma (< 14).
    # Foreground elements are either saturated (chroma > 18) or darker (luma < 210).
    core_fg = (chroma > 18) | (luma < 210)

    # Keep only significant connected components to eliminate JPEG DCT compression noise in empty background
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(core_fg.astype(np.uint8))
    keep_mask = np.zeros((h, w), dtype=np.uint8)
    for i in range(1, num_labels):
        area = stats[i, cv2.CC_STAT_AREA]
        if area > 1000:
            keep_mask[labels == i] = 255

    # Dilate core mask so anti-aliased edge transitions are fully captured
    dilated_mask = cv2.dilate(keep_mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))

    # Compute soft alpha matte along the edge
    bg_cert = np.clip((luma - 225.0) / 12.0, 0, 1) * np.clip((16.0 - chroma) / 12.0, 0, 1)
    raw_alpha = np.clip(1.0 - bg_cert, 0, 1)

    # Restrict to dilated core to guarantee zero noise outside artwork
    final_alpha = raw_alpha * (dilated_mask.astype(np.float32) / 255.0)

    # Slight Gaussian smoothing on alpha edge for silky anti-aliasing
    final_alpha = cv2.GaussianBlur(final_alpha, (3, 3), 0.5)
    final_alpha[final_alpha < 0.05] = 0.0
    final_alpha[final_alpha > 0.95] = 1.0

    # 3. Despill: recover true foreground RGB without the light background contamination
    bg_color = np.array([245.0, 245.0, 245.0], dtype=np.float32)
    a3 = np.clip(final_alpha[:, :, None], 0.01, 1.0)
    fg_recovered = (bgr_f - (1.0 - a3) * bg_color) / a3
    fg_recovered = np.clip(fg_recovered, 0, 255).astype(np.uint8)

    # Full RGBA image
    rgba = np.dstack([fg_recovered, (final_alpha * 255).astype(np.uint8)])
    rgba_rgb = cv2.cvtColor(rgba, cv2.COLOR_BGRA2RGBA)
    full_img = Image.fromarray(rgba_rgb)

    # Save full transparent composite frame
    frame_path = os.path.join(OUT_DIR, "invite_traditional_frame.png")
    full_img.save(frame_path)
    print(f"Saved: {frame_path} ({full_img.size})")

    arr = np.array(full_img)

    # 4. Extract individual elements with precise boundaries:
    # A. Lord Ganesha on Pink Lotus
    # Located at top center (y < 220, x between 200 and 361)
    g_mask = np.zeros(arr.shape[:2], dtype=bool)
    g_mask[:155, 200:361] = True
    g_mask[155:220, 200:380] = True
    g_arr = np.zeros_like(arr)
    g_arr[g_mask] = arr[g_mask]
    g_img = Image.fromarray(g_arr)
    g_bbox = g_img.getchannel('A').getbbox()
    if g_bbox:
        g_trimmed = g_img.crop(g_bbox)
        p = os.path.join(OUT_DIR, "invite_ganesha_lotus.png")
        g_trimmed.save(p)
        print(f"Saved Ganesha: {p} ({g_trimmed.size})")

    # B. Hanging Brass Lamps with Pink Lotuses on chains
    # Located at top right (y < 280, x >= 361)
    l_mask = np.zeros(arr.shape[:2], dtype=bool)
    l_mask[:155, 361:] = True
    l_mask[155:280, 380:] = True
    l_arr = np.zeros_like(arr)
    l_arr[l_mask] = arr[l_mask]
    l_img = Image.fromarray(l_arr)
    l_bbox = l_img.getchannel('A').getbbox()
    if l_bbox:
        l_trimmed = l_img.crop(l_bbox)
        p = os.path.join(OUT_DIR, "invite_hanging_lamps.png")
        l_trimmed.save(p)
        print(f"Saved Hanging Lamps: {p} ({l_trimmed.size})")

    # C. Banana foliage, bananas & blossom
    # Located along left side (y < 515, x < 250)
    b_mask = np.zeros(arr.shape[:2], dtype=bool)
    b_mask[:515, :250] = True
    b_arr = np.zeros_like(arr)
    b_arr[b_mask] = arr[b_mask]
    b_img = Image.fromarray(b_arr)
    b_bbox = b_img.getchannel('A').getbbox()
    if b_bbox:
        b_trimmed = b_img.crop(b_bbox)
        p = os.path.join(OUT_DIR, "invite_banana_leaves.png")
        b_trimmed.save(p)
        print(f"Saved Banana Foliage: {p} ({b_trimmed.size})")

    # D. Brass Samai Pedestal Lamp & Lotus Kalash Pots
    # Located at bottom left (y >= 515, x < 250)
    s_mask = np.zeros(arr.shape[:2], dtype=bool)
    s_mask[515:, :250] = True
    s_arr = np.zeros_like(arr)
    s_arr[s_mask] = arr[s_mask]
    s_img = Image.fromarray(s_arr)
    s_bbox = s_img.getchannel('A').getbbox()
    if s_bbox:
        s_trimmed = s_img.crop(s_bbox)
        p = os.path.join(OUT_DIR, "invite_samai_kalash.png")
        s_trimmed.save(p)
        print(f"Saved Samai & Kalash: {p} ({s_trimmed.size})")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
generate_palace_card.py

Generates the exact royal palace card assets matching reference Image 2 (ss2):
  1. assets/generated/palace_card_backdrop.jpg - High-resolution royal palace arch frame with Pichwai lake, swans, marble pavilion, and clean damask wallpaper interior.
  2. assets/generated/palace_ganesha.png - Golden Ganesha motif with peacock feather crown.
  3. assets/generated/palace_monogram_jb.png - Gold infinity laurel wreath with initials J & B.
"""

import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

SRC_IMG = r"C:\Users\Lenovo\.gemini\antigravity-ide\brain\e6acddd0-8546-47c4-a2db-aced886e37fb\.user_uploaded\media_1789800704047.jpg"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "generated")

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    assert os.path.exists(SRC_IMG), f"Source image not found: {SRC_IMG}"

    bgr = cv2.imread(SRC_IMG)
    h, w, c = bgr.shape

    # -------------------------------------------------------------------------
    # 1. Extract Ganesha motif (y=118..188, x=235..335)
    # -------------------------------------------------------------------------
    g_crop = bgr[115:190, 235:335]
    # Ganesha lines are darker than the blush background
    g_gray = cv2.cvtColor(g_crop, cv2.COLOR_BGR2GRAY)
    g_bg = cv2.medianBlur(g_gray, 25)
    g_diff = g_bg.astype(float) - g_gray.astype(float)
    g_alpha = np.clip((g_diff - 4.0) / 14.0, 0, 1) * 255
    g_alpha = cv2.GaussianBlur(g_alpha, (3, 3), 0.5)

    # Recover foreground color
    a_norm = np.clip(g_alpha / 255.0, 0.01, 1.0)[:, :, None]
    bg_col = np.array([218.0, 232.0, 250.0], dtype=np.float32)
    g_fg = (g_crop.astype(np.float32) - (1.0 - a_norm) * bg_col) / a_norm
    g_fg = np.clip(g_fg, 0, 255).astype(np.uint8)

    g_rgba = np.dstack([g_fg, g_alpha.astype(np.uint8)])
    g_pil = Image.fromarray(cv2.cvtColor(g_rgba, cv2.COLOR_BGRA2RGBA))
    g_bbox = g_pil.getchannel('A').getbbox()
    if g_bbox:
        g_pil = g_pil.crop(g_bbox)
    ganesha_out = os.path.join(OUT_DIR, "palace_ganesha.png")
    g_pil.save(ganesha_out)
    print("Saved Ganesha:", ganesha_out, g_pil.size)

    # -------------------------------------------------------------------------
    # 2. Extract and create J & B Gold Infinity Monogram
    # -------------------------------------------------------------------------
    # In Image 2, the monogram is at y=270..425, x=135..440
    mono = bgr[270:425, 135:440]
    mh, mw, _ = mono.shape

    # Inpaint D and M from inside the loops
    mask = np.zeros((mh, mw), dtype=np.uint8)
    # D mask
    d_roi = mono[45:115, 48:115]
    d_gray = cv2.cvtColor(d_roi, cv2.COLOR_BGR2GRAY)
    d_fg = (d_gray < 160).astype(np.uint8) * 255
    d_fg = cv2.dilate(d_fg, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    mask[45:115, 48:115] = d_fg

    # M mask
    m_roi = mono[45:115, 195:270]
    m_gray = cv2.cvtColor(m_roi, cv2.COLOR_BGR2GRAY)
    m_fg = (m_gray < 160).astype(np.uint8) * 255
    m_fg = cv2.dilate(m_fg, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    mask[45:115, 195:270] = m_fg

    wreath_clean = cv2.inpaint(mono, mask, 5, cv2.INPAINT_TELEA)

    # Touch up any remaining faint residue in right loop
    mask_touchup = np.zeros((mh, mw), dtype=np.uint8)
    mask_touchup[50:70, 240:265] = 255
    mask_touchup[95:120, 245:275] = 255
    wreath_clean = cv2.inpaint(wreath_clean, mask_touchup, 5, cv2.INPAINT_TELEA)

    # Render J and B inside the loops
    wreath_pil = Image.fromarray(cv2.cvtColor(wreath_clean, cv2.COLOR_BGR2RGB))
    mask_img = Image.new('L', wreath_pil.size, 0)
    d_mask = ImageDraw.Draw(mask_img)

    font_size = 58
    font = ImageFont.truetype(r"C:\Windows\Fonts\timesbd.ttf", font_size)

    j_bbox = font.getbbox('J')
    b_bbox = font.getbbox('B')

    j_w = j_bbox[2] - j_bbox[0]
    j_h = j_bbox[3] - j_bbox[1]
    j_x = 76 - j_w // 2
    j_y = 78 - j_h // 2 - j_bbox[1]

    b_w = b_bbox[2] - b_bbox[0]
    b_h = b_bbox[3] - b_bbox[1]
    b_x = 228 - b_w // 2
    b_y = 78 - b_h // 2 - b_bbox[1]

    d_mask.text((j_x, j_y), 'J', font=font, fill=255)
    d_mask.text((b_x, b_y), 'B', font=font, fill=255)

    # Gold gradient matching the reference
    gold_grad = np.zeros((mh, mw, 3), dtype=np.uint8)
    for y in range(mh):
        factor = np.clip((y - 45) / 65.0, 0, 1)
        r = int(195 * (1 - factor) + 110 * factor)
        g = int(145 * (1 - factor) + 68 * factor)
        b = int(68 * (1 - factor) + 24 * factor)
        gold_grad[y, :] = [r, g, b]

    mask_arr = np.array(mask_img).astype(float) / 255.0
    base_arr = np.array(wreath_pil).astype(float)
    comp_arr = base_arr * (1.0 - mask_arr[:, :, None]) + gold_grad * mask_arr[:, :, None]
    comp_bgr = cv2.cvtColor(comp_arr.astype(np.uint8), cv2.COLOR_RGB2BGR)

    # Alpha extract the wreath and letters
    comp_gray = cv2.cvtColor(comp_bgr, cv2.COLOR_BGR2GRAY)
    comp_bg = cv2.medianBlur(comp_gray, 31)
    diff_w = comp_bg.astype(float) - comp_gray.astype(float)
    alpha_w = np.clip((diff_w - 5.0) / 16.0, 0, 1) * 255
    alpha_w = cv2.GaussianBlur(alpha_w, (3, 3), 0.5)

    a_norm_w = np.clip(alpha_w / 255.0, 0.01, 1.0)[:, :, None]
    fg_w = (comp_bgr.astype(np.float32) - (1.0 - a_norm_w) * bg_col) / a_norm_w
    fg_w = np.clip(fg_w, 0, 255).astype(np.uint8)

    rgba_w = np.dstack([fg_w, alpha_w.astype(np.uint8)])
    pil_w = Image.fromarray(cv2.cvtColor(rgba_w, cv2.COLOR_BGRA2RGBA))
    bbox_w = pil_w.getchannel('A').getbbox()
    if bbox_w:
        pil_w = pil_w.crop(bbox_w)
    mono_out = os.path.join(OUT_DIR, "palace_monogram_jb.png")
    pil_w.save(mono_out)
    print("Saved Monogram:", mono_out, pil_w.size)

    # -------------------------------------------------------------------------
    # 3. Inpaint text from full card to create clean palace_card_backdrop.jpg
    # -------------------------------------------------------------------------
    # Area inside arch: y=95..560, x=90..485
    roi = bgr[95:560, 90:485]
    gray_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    bg_roi = cv2.medianBlur(gray_roi, 31)
    diff_roi = bg_roi.astype(float) - gray_roi.astype(float)

    fg_roi = (diff_roi > 8).astype(np.uint8) * 255
    fg_roi = cv2.dilate(fg_roi, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)), iterations=2)

    full_mask = np.zeros((h, w), dtype=np.uint8)
    full_mask[95:560, 90:485] = fg_roi

    inpainted = cv2.inpaint(bgr, full_mask, 5, cv2.INPAINT_TELEA)

    # Second pass for residual shadows in wreath area
    w_roi = inpainted[260:430, 130:445]
    w_g = cv2.cvtColor(w_roi, cv2.COLOR_BGR2GRAY)
    w_b = cv2.medianBlur(w_g, 35)
    w_d = np.abs(w_b.astype(float) - w_g.astype(float))
    w_m = (w_d > 6).astype(np.uint8) * 255
    w_m = cv2.dilate(w_m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)), iterations=2)

    full_mask2 = np.zeros((h, w), dtype=np.uint8)
    full_mask2[260:430, 130:445] = w_m
    clean_backdrop = cv2.inpaint(inpainted, full_mask2, 5, cv2.INPAINT_TELEA)

    backdrop_out = os.path.join(OUT_DIR, "palace_card_backdrop.jpg")
    cv2.imwrite(backdrop_out, clean_backdrop, [cv2.IMWRITE_JPEG_QUALITY, 96])
    print("Saved Backdrop:", backdrop_out, (w, h))

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Prepare the intro's shipping assets from the generated sources.

The elephant REARS to reach the bell: the whole body tilts back on its hind
legs while the two front legs tuck up under it and the trunk swings. So the
body cannot be flattened into the backdrop - it moves too. The layers are:

    intro3_scene.png    -> intro3_plate.jpg      the garden, no elephant
    intro3_ele_body.png -> intro3_ele_body.jpg   the elephant, less both front
                         + intro3_ele_mask.png   legs; colour and alpha apart
                        -> intro3_leg_far.png    the front legs, cut out
                        -> intro3_leg_near.png
    intro3_ele_trunk.png -> intro3_trunk_sheet.png 11 warped trunk poses

Why the body is a JPEG plus a mask rather than a transparent PNG: the same
picture costs ~660 KB as RGBA and ~160 KB this way, because photographic colour
compresses well and the alpha is nearly flat. Quantising the PNG instead was
tried and rejected - it mottles the smooth grey of the skin. Before the JPEG is
written the edge colour is bled outward, so JPEG ringing has nothing dark to
smear inward and the silhouette picks up no fringe when the mask cuts it back.

A cut-out and the hole it leaves MUST use the same boundary. Dilating the erase
(to be sure no soft matte edge stays behind) removes a few pixels more than the
layer puts back, and the backdrop shows through the difference as a pale halo
tracing every leg - plus a seam down the middle where the two legs meet.

So the split is made on the traced POLYGON, slightly grown, as a hard in/out
region: the layer takes the artwork's own alpha inside it, the body loses
exactly that same region. Soft silhouette edges move wholly into the layer, so
there is nothing left behind to ghost and nothing missing to glow.

The trunk gets a sprite sheet rather than a single image, because a trunk is a
muscular hydrostat: the bend has to increase along its length and the tip has
to lag the base and overshoot when it stops. One rigid rotation reads as a
lever. Each pose is a curl about the joint weighted by distance from it, a
lift, and a whip confined to the outer half - all weighted to zero at the joint,
so the seam with the head never opens. The page still drives the gross swing
with a real CSS rotation, so only the deformation is stepped.

PLACEMENT and PIVOTS below also live in styles.css; the two must agree.

    python scripts/bake_intro3.py
"""
import pathlib
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
GEN = ROOT / "assets" / "generated"
SRC = ROOT / "assets" / "unused" / "intro_sources"

SW, SH = 832, 1472                                 # the painting's frame
BODY_W = 740                                       # ample for a 3x phone
JPEG_Q, PLATE_Q = 90, 88

# Traced off the artwork (coordinates in the body asset). FAR is drawn behind,
# so it is taken first and NEAR gets whatever is left along their shared seam.
LEGS = {
    "far": dict(
        poly=[(424, 676), (492, 676), (496, 790), (493, 845), (488, 866), (478, 886),
              (462, 903), (430, 913), (400, 909), (385, 890), (388, 860), (398, 830),
              (412, 780), (420, 720)],
        cut=700, shoulder=(456, 700)),
    "near": dict(
        poly=[(492, 644), (544, 640), (542, 706), (550, 782), (558, 828), (572, 842),
              (574, 876), (580, 896), (576, 922), (558, 932), (500, 932), (484, 916),
              (478, 882), (487, 852), (492, 820), (491, 700)],
        cut=694, shoulder=(520, 690)),
}
LEG_RAMP = 22
HIND_FEET = (175, 922)      # where the whole elephant pivots when it rears

# Trunk sprite. JOINT is where it leaves the mouth; the warp is zero there.
TRUNK_JOINT = (824.0, 445.0)
TRUNK_R0, TRUNK_RMID, TRUNK_R1 = 25.0, 110.0, 190.0
TRUNK_BOX = (715, 880, 225, 455)        # x0, x1, y0, y1 in the body asset
# curl, lift, whip - a designed sequence, not a slider
TRUNK_POSES = [(0, 0, 0), (-2, -3, -1), (1, 3, -2), (2, 7, -2), (3, 10, -1),
               (4, 12, 1), (4, 12, 3), (2, 7, -3), (0, 3, 1), (-1, 1, -.5), (0, 0, 0)]


def load(name):
    for base in (GEN, SRC):
        p = base / name
        if p.exists():
            return Image.open(p).convert("RGBA")
    sys.exit("missing source: %s (looked in %s and %s)" % (name, GEN, SRC))


def kb(p):
    return p.stat().st_size / 1024


def main():
    # ---- backdrop, with no elephant in it --------------------------------
    plate = GEN / "intro3_plate.jpg"
    load("intro3_scene.png").convert("RGB").save(
        plate, quality=PLATE_Q, optimize=True, progressive=True)
    print("%-22s %6.0f KB" % (plate.name, kb(plate)))

    src = load("intro3_ele_body.png")
    W, H = src.size
    A = np.asarray(src).astype(np.float32)
    solid = A[:, :, 3] > 40
    yy = np.arange(H)[:, None]

    # ---- the two front legs ----------------------------------------------
    body = A.copy()
    for name in ("far", "near"):
        spec = LEGS[name]
        m = Image.new("L", (W, H), 0)
        ImageDraw.Draw(m).polygon(spec["poly"], fill=255)
        # Grow the TRACE a little so it comfortably contains the leg's soft
        # matte edge, then use it as a hard in/out region for both sides of
        # the split.
        m = m.filter(ImageFilter.MaxFilter(7))
        region = (np.asarray(m) > 127).astype(np.float32)
        cut = np.clip((yy - spec["cut"]) / float(LEG_RAMP), 0, 1)

        # The two legs deliberately OVERLAP rather than meeting edge to edge.
        # Each is scaled by the browser as its own image, so a shared border
        # gets anti-aliased twice and neither side quite covers it - a hairline
        # of backdrop shows down the join. Near is drawn over far, so the
        # overlap is invisible at rest and correct once they move apart.
        layer = A.copy(); layer[:, :, 3] *= region
        body[:, :, 3] *= (1 - region * cut)

        lp = np.asarray(Image.fromarray(layer.round().clip(0, 255).astype(np.uint8))).copy()
        lp[lp[:, :, 3] == 0] = 0        # PNG stores colour under transparency too
        dest = GEN / ("intro3_leg_%s.png" % name)
        Image.fromarray(lp).save(dest, optimize=True)
        print("%-22s %6.0f KB   shoulder %.2f%% %.2f%%" % (
            dest.name, kb(dest), spec["shoulder"][0] / W * 100, spec["shoulder"][1] / H * 100))

    # ---- the body: colour and alpha, separately --------------------------
    bimg = Image.fromarray(body.round().clip(0, 255).astype(np.uint8))
    bimg = bimg.resize((BODY_W, round(bimg.height * BODY_W / bimg.width)), Image.LANCZOS)
    b = np.asarray(bimg).astype(np.uint8)
    rgb, alpha = b[:, :, :3].copy(), b[:, :, 3].copy()

    keep = alpha > 8
    fill = Image.fromarray(rgb)
    for _ in range(9):                  # bleed the edge colour outward
        blur = np.asarray(fill.filter(ImageFilter.GaussianBlur(4)))
        cur = np.asarray(fill).copy()
        cur[~keep] = blur[~keep]
        fill = Image.fromarray(cur)

    jpg = GEN / "intro3_ele_body.jpg"
    msk = GEN / "intro3_ele_mask.png"
    fill.save(jpg, quality=JPEG_Q, optimize=True, progressive=True)
    # The mask must carry its data in the ALPHA channel: CSS `mask` defaults to
    # match-source, and a plain greyscale PNG has no alpha, so it masks nothing.
    Image.fromarray(np.dstack([np.zeros_like(alpha), np.zeros_like(alpha),
                               np.zeros_like(alpha), alpha])).save(msk, optimize=True)
    print("%-22s %6.0f KB" % (jpg.name, kb(jpg)))
    print("%-22s %6.0f KB" % (msk.name, kb(msk)))
    trunk_sheet(W, H)
    print("hind-feet pivot %.2f%% %.2f%%   (styles.css must match all pivots)"
          % (HIND_FEET[0] / W * 100, HIND_FEET[1] / H * 100))


def trunk_sheet(W, H):
    src = load("intro3_ele_trunk.png")
    A = np.asarray(src).astype(np.float32)
    X0, X1, Y0, Y1 = TRUNK_BOX
    FW, FH = X1 - X0, Y1 - Y0

    gx, gy = np.meshgrid(np.arange(X0, X1, dtype=np.float32),
                         np.arange(Y0, Y1, dtype=np.float32))
    dx, dy = gx - TRUNK_JOINT[0], gy - TRUNK_JOINT[1]
    r = np.hypot(dx, dy)
    prof = np.clip((r - TRUNK_R0) / (TRUNK_R1 - TRUNK_R0), 0, 1) ** 1.15
    whip_prof = np.clip((r - TRUNK_RMID) / (TRUNK_R1 - TRUNK_RMID), 0, 1) ** 1.20

    P = A.copy(); P[:, :, :3] *= P[:, :, 3:4]     # premultiply for clean sampling

    def warp(curl, lift, whip):
        a = np.radians(-(curl * prof + whip * whip_prof))     # per-pixel angle
        ca, sa = np.cos(a), np.sin(a)
        sx = TRUNK_JOINT[0] + dx * ca - dy * sa
        sy = TRUNK_JOINT[1] + dx * sa + dy * ca + lift * prof
        x0 = np.floor(sx).astype(np.int32); y0 = np.floor(sy).astype(np.int32)
        fx = (sx - x0)[..., None]; fy = (sy - y0)[..., None]
        at = lambda yi, xi: P[np.clip(yi, 0, A.shape[0]-1), np.clip(xi, 0, A.shape[1]-1)]
        top = at(y0, x0) * (1-fx) + at(y0, x0+1) * fx
        bot = at(y0+1, x0) * (1-fx) + at(y0+1, x0+1) * fx
        o = top * (1-fy) + bot * fy
        al = o[:, :, 3:4]
        return np.dstack([np.where(al > 1e-3, o[:, :, :3] / np.maximum(al, 1e-3), 0),
                          al]).clip(0, 255)

    sheet = Image.new("RGBA", (FW * len(TRUNK_POSES), FH), (0, 0, 0, 0))
    clipped = []
    for i, pose in enumerate(TRUNK_POSES):
        f = warp(*pose).round().astype(np.uint8)
        al = f[:, :, 3]
        if (al[0].max() > 40 or al[-1].max() > 40
                or al[:, 0].max() > 40 or al[:, -1].max() > 40):
            clipped.append(i)
        sheet.paste(Image.fromarray(f), (i * FW, 0))
    if clipped:
        sys.exit("trunk poses clipped by the sprite box: %s - widen TRUNK_BOX" % clipped)
    dest = GEN / "intro3_trunk_sheet.png"
    sheet.save(dest, optimize=True)
    print("%-22s %6.0f KB   %d poses, joint %.3f%% %.3f%% of its own box" % (
        dest.name, kb(dest), len(TRUNK_POSES),
        (TRUNK_JOINT[0] - X0) / FW * 100, (TRUNK_JOINT[1] - Y0) / FH * 100))


if __name__ == "__main__":
    main()

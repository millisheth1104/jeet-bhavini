#!/usr/bin/env python3
"""Build a bird wing-flap cycle as aligned transparent frames.

Why a sprite sheet rather than separate generations:

  - Generating each frame separately gives a different bird every time.
  - Seed-locking the generations keeps the bird but makes the model ignore the
    pose change - both frames came back wings-up.
  - Image-to-image keeps the bird but FLUX has such a strong prior for "flying
    bird" that it still refuses to draw a downstroke.

Drawing all four wing positions inside ONE image sidesteps all of that: the
model keeps the bird consistent within a single canvas, and the wing positions
genuinely differ.

Pipeline: generate sheet -> slice into N cells -> matte each cell -> crop every
frame by the UNION of their bounds so the body stays put and only wings move.

    python scripts/gen_bird_frames.py a
    python scripts/gen_bird_frames.py a b
"""
import io
import json
import os
import sys
import time
import base64
import pathlib
import urllib.request
import urllib.error
import concurrent.futures

from PIL import Image

FAL_KEY = os.environ.get("FAL_KEY")
OUT = pathlib.Path("assets/generated")
FLUX = "https://fal.run/fal-ai/flux/dev"
BIREFNET = "https://fal.run/fal-ai/birefnet"

FRAMES = 4
ALPHA_FLOOR = 8

SHEET_PROMPT = (
    "A horizontal animation sprite sheet of one bird's wingbeat. The SAME "
    "{desc} drawn FOUR times in a single evenly spaced row, four equal columns, "
    "each bird LARGE and filling its column, all four at identical size and "
    "aligned on one common horizontal centre line, side view facing right, "
    "only the wings differ between them: "
    "first with wings folded down close against the body, "
    "second with wings half opened outward, "
    "third with wings spread wide straight out, "
    "fourth with wings raised high above the body. "
    "Flat watercolour illustration with fine ink linework, plain flat white "
    "background, no text, no numbers, no labels, no grid, no borders, no frames"
)

BIRDS = {
    "a": "small Indian bulbul songbird with warm cream and soft terracotta "
         "plumage and a dark crest",
    "b": "small Indian songbird with sage green and pale gold plumage",
}


def post(url, payload, tries=3):
    body = json.dumps(payload).encode()
    last = None
    for attempt in range(tries):
        req = urllib.request.Request(url, data=body, method="POST", headers={
            "Authorization": "Key " + FAL_KEY, "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            last = "HTTP %s: %s" % (e.code, e.read()[:300].decode(errors="replace"))
            if e.code in (400, 401, 403, 422):
                break
        except Exception as e:
            last = str(e)
        time.sleep(2 * (attempt + 1))
    raise RuntimeError(last)


def data_uri(img):
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def matte(img):
    """Cut a single cell out to transparency with BiRefNet."""
    url = post(BIREFNET, {
        "image_url": data_uri(img),
        "model": "General Use (Heavy)",
        "operating_resolution": "1024x1024",
        "output_format": "png",
        "refine_foreground": True,
    })["image"]["url"]
    with urllib.request.urlopen(url, timeout=300) as r:
        return Image.open(io.BytesIO(r.read())).convert("RGBA")


def build(key):
    desc = BIRDS[key]
    res = post(FLUX, {
        "prompt": SHEET_PROMPT.format(desc=desc),
        "image_size": "landscape_16_9",
        "num_images": 1,
        "num_inference_steps": 36,
        "guidance_scale": 4.0,
        "enable_safety_checker": False,
    })
    with urllib.request.urlopen(res["images"][0]["url"], timeout=300) as r:
        sheet = Image.open(io.BytesIO(r.read())).convert("RGB")
    print("  sheet %dx%d" % sheet.size)

    W, H = sheet.size
    cw = W // FRAMES
    cells = [sheet.crop((i * cw, 0, (i + 1) * cw, H)) for i in range(FRAMES)]

    with concurrent.futures.ThreadPoolExecutor(max_workers=FRAMES) as ex:
        cut = list(ex.map(matte, cells))

    # union box across every frame, so the body stays put and only wings move
    boxes = []
    for im in cut:
        m = im.getchannel("A").point(lambda a: 255 if a > ALPHA_FLOOR else 0)
        b = m.getbbox()
        if b is None:
            raise RuntimeError("a frame matted to nothing")
        boxes.append(b)
    union = (min(b[0] for b in boxes), min(b[1] for b in boxes),
             max(b[2] for b in boxes), max(b[3] for b in boxes))

    for i, im in enumerate(cut, 1):
        dest = OUT / ("bird_%s_%d.png" % (key, i))
        im.crop(union).save(dest)
    w, h = union[2] - union[0], union[3] - union[1]
    print("  %d frames -> %dx%d each  (bird_%s_1..%d.png)" % (FRAMES, w, h, key, FRAMES))


def main():
    if not FAL_KEY:
        sys.exit("FAL_KEY not set")
    keys = sys.argv[1:] or list(BIRDS)
    bad = [k for k in keys if k not in BIRDS]
    if bad:
        sys.exit("unknown bird(s): %s (have %s)" % (bad, list(BIRDS)))
    OUT.mkdir(parents=True, exist_ok=True)
    for k in keys:
        print("bird_%s" % k)
        build(k)


if __name__ == "__main__":
    main()

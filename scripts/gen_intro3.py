#!/usr/bin/env python3
"""Generate the "ring the bell" intro: a blue-and-white chhatri, a caparisoned
elephant raising its trunk to a brass temple bell, a lotus courtyard.

Matched to a reference the client supplied. Generated in three layers rather
than one painting, because the elephant's trunk and the bell have to move
independently:

    intro3_scene      the pavilion, garden and courtyard - no elephant, no bell
    intro3_elephant   the caparisoned elephant with its parasol, matted
    intro3_bell       the brass bell on its chain, matted

All three carry the same REF style block, which is what keeps them reading as
one painting once they are stacked in styles.css.

Reads FAL_KEY from the environment or a gitignored .env at the repo root.

    python scripts/gen_intro3.py                    # all three layers
    python scripts/gen_intro3.py intro3_bell        # one layer
    python scripts/gen_intro3.py --full             # one-shot reference comp,
                                                    # for eyeballing the target
    python scripts/gen_intro3.py --seed 7 intro3_scene
"""
import json
import os
import sys
import time
import pathlib
import urllib.request
import urllib.error

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "generated"


def load_key():
    key = os.environ.get("FAL_KEY")
    if key:
        return key
    env = ROOT / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("FAL_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


FAL_KEY = load_key()
FLUX = "https://fal.run/fal-ai/flux/dev"
BIREFNET = "https://fal.run/fal-ai/birefnet"

# The reference's hand: a botanical-plate watercolour, not a photo and not a
# flat vector. Stated identically in every prompt so the layers match.
REF = (
    "delicate watercolour and gouache botanical illustration in the style of a "
    "luxury Indian wedding invitation, fine ink linework with soft translucent "
    "colour washes, painted on warm cream ivory paper, crisp detail with "
    "generous negative space, cobalt blue and white marble with antique gold "
    "detailing, coral pink and rose blossoms, sage and emerald green foliage, "
    "soft even daylight, no harsh shadows, luxury print quality, "
    "no text, no lettering, no words, no watermark, no signature, no frame, no border"
)

ASSETS = {
    # The courtyard the elephant will stand in. Deliberately empty in the
    # middle - the elephant and bell are laid over it.
    "intro3_scene": dict(
        prompt=(
            "An ornate Indian garden pavilion, a chhatri, with a domed roof of deep "
            "cobalt blue segmented with fine white and gold ribs and a tall gold "
            "finial on top, standing on slender white marble columns with gold "
            "capitals, its cusped scalloped archway painted cobalt blue and inlaid "
            "with white and gold floral panels, empty under the arch. "
            "Branches of pink blossom hang across the top of the frame from the "
            "upper right, a tall banana palm and cypress stand to the right, "
            "flowering shrubs and gold and terracotta pots of white and pink "
            "flowers line both sides, a still lotus pond with pink water lilies "
            "and round green lily pads fills the foreground, and the floor is a "
            "pale blue and white chequered marble terrace with shallow steps "
            "leading up into the pavilion. Tall vertical composition, the centre "
            "of the courtyard left open and empty. " + REF
        ),
        size={"width": 832, "height": 1472},
        cutout=False,
    ),
    # The elephant, with the coral parasol from the reference.
    "intro3_elephant": dict(
        prompt=(
            "A single ceremonial Indian elephant in full wedding caparison, standing "
            "in profile facing left, lifting its trunk high and curling the tip "
            "upward above its head, small tusks, one eye visible. It wears an "
            "embroidered coral, emerald green and gold jhool blanket with a deep "
            "fringe of gold bells over its back, a matching coral and gold "
            "embroidered headpiece between its ears, heavy gold anklets and layered "
            "gold bell necklaces. A large coral orange ceremonial parasol on a gold "
            "pole with hanging gold tassels rises behind its back. "
            "The whole animal and parasol in frame, nothing cropped, "
            "isolated on a flat plain mid-grey background. " + REF
        ),
        size={"width": 1024, "height": 1024},
        cutout=True,
    ),
    # The bell the trunk reaches for.
    "intro3_bell": dict(
        prompt=(
            "A single large antique brass Indian temple bell hanging straight down "
            "from a long fine brass chain, seen exactly straight on and centred, "
            "a ring at the crown, a band of engraved detail around the flared rim, "
            "a small clapper hanging just below the rim, warm polished brass with "
            "soft highlights, hanging perfectly vertical. "
            "Isolated on a flat plain mid-grey background, nothing else in frame. " + REF
        ),
        size={"width": 768, "height": 1024},
        cutout=True,
    ),
    # Not used by the page - a one-shot of the whole reference, to compare the
    # stacked layers against.
    "intro3_full": dict(
        prompt=(
            "An ornate Indian garden pavilion, a chhatri, with a deep cobalt blue "
            "domed roof ribbed in white and gold with a tall gold finial, on "
            "slender white marble columns, its cusped archway painted cobalt blue "
            "with white and gold floral inlay. A large antique brass temple bell "
            "hangs on a long chain from the centre of the arch. Below it a "
            "ceremonial Indian elephant in profile facing left, in an embroidered "
            "coral, emerald and gold blanket with gold bells, a coral headpiece and "
            "gold anklets, lifts its trunk up to touch the bell, with a large coral "
            "orange tasselled parasol on a gold pole behind its back. Pink blossom "
            "branches hang across the top of the frame, a banana palm and cypress "
            "to the right, gold and terracotta pots of pink and white flowers on "
            "both sides, a lotus pond with pink water lilies in the foreground, and "
            "a pale blue and white chequered marble terrace underfoot. "
            "Tall vertical composition. " + REF
        ),
        size={"width": 832, "height": 1472},
        cutout=False,
    ),
}


def post(url, payload, tries=3):
    """POST JSON to fal, retrying transient failures but not client errors."""
    body = json.dumps(payload).encode()
    last = None
    for attempt in range(tries):
        req = urllib.request.Request(url, data=body, method="POST", headers={
            "Authorization": "Key " + FAL_KEY,
            "Content-Type": "application/json",
        })
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            last = "HTTP %s: %s" % (e.code, e.read()[:400].decode(errors="replace"))
            if e.code in (400, 401, 403, 422):
                break
        except Exception as e:  # noqa: BLE001 - transient network errors
            last = str(e)
        time.sleep(2 * (attempt + 1))
    raise RuntimeError(last)


def fetch(url, dest):
    with urllib.request.urlopen(url, timeout=300) as r:
        dest.write_bytes(r.read())


def build(key, seed=None, suffix=""):
    spec = ASSETS[key]
    payload = {
        "prompt": spec["prompt"],
        "image_size": spec["size"],
        "num_images": 1,
        "num_inference_steps": 40,
        "guidance_scale": 3.5,
        "enable_safety_checker": False,
    }
    if seed is not None:
        payload["seed"] = seed
    res = post(FLUX, payload)
    url = res["images"][0]["url"]
    if spec["cutout"]:
        # BiRefNet keeps the chain, the tassels and the bell fringe; rembg
        # shreds thin structures like those.
        url = post(BIREFNET, {
            "image_url": url,
            "model": "General Use (Heavy)",
            "operating_resolution": "2048x2048",
            "output_format": "png",
            "refine_foreground": True,
        })["image"]["url"]
    dest = OUT / (key + suffix + ".png")
    fetch(url, dest)
    return dest


def main():
    args = sys.argv[1:]
    seed = None
    if "--seed" in args:
        i = args.index("--seed")
        seed = int(args[i + 1])
        del args[i:i + 2]
    suffix = ""
    if "--suffix" in args:
        i = args.index("--suffix")
        suffix = args[i + 1]
        del args[i:i + 2]

    if not FAL_KEY:
        sys.exit("FAL_KEY not set. Export it, or put FAL_KEY=... in .env at the "
                 "repo root (it is gitignored).")
    OUT.mkdir(parents=True, exist_ok=True)

    if "--full" in args:
        want = ["intro3_full"]
    else:
        want = [a for a in args if not a.startswith("--")] or [
            "intro3_scene", "intro3_elephant", "intro3_bell"]
    unknown = [k for k in want if k not in ASSETS]
    if unknown:
        sys.exit("unknown asset(s): %s\nknown: %s" % (unknown, list(ASSETS)))

    for key in want:
        t0 = time.time()
        try:
            dest = build(key, seed=seed, suffix=suffix)
            print("%-16s %7d KB  %.0fs  -> %s" % (
                key, dest.stat().st_size // 1024, time.time() - t0, dest.name))
        except Exception as e:  # noqa: BLE001 - report and carry on
            print("%-16s FAILED: %s" % (key, e))


if __name__ == "__main__":
    main()

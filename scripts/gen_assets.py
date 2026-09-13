#!/usr/bin/env python3
"""Generate the illustration asset pack for the Jeet x Bhavini wedding site via fal.ai.

Art direction: pin 1's shell (pale grey-ivory ground, mogra garlands, banana palm,
brass vessels) + pin 2/3's per-event cards (own accent colour, own illustrated object).

Reads FAL_KEY from the environment - never hard-code the key here.

    python scripts/gen_assets.py               # every asset
    python scripts/gen_assets.py mogra_long    # named assets only
    python scripts/gen_assets.py --list
"""
import json
import os
import sys
import time
import pathlib
import urllib.request
import urllib.error
import concurrent.futures

FAL_KEY = os.environ.get("FAL_KEY")
OUT = pathlib.Path("assets/generated")
FLUX = "https://fal.run/fal-ai/flux/dev"
REMBG = "https://fal.run/fal-ai/imageutils/rembg"
BIREFNET = "https://fal.run/fal-ai/birefnet"

# Matting backends. rembg is fine for solid props; thin structures (strung
# flower garlands, filigree, open frames) get shredded by it, so those use
# BiRefNet, which keeps fine detail.
MATTE = {
    "rembg": lambda u: post(REMBG, {"image_url": u})["image"]["url"],
    "birefnet": lambda u: post(BIREFNET, {
        "image_url": u,
        "model": "General Use (Heavy)",
        "operating_resolution": "2048x2048",
        "output_format": "png",
        "refine_foreground": True,
    })["image"]["url"],
}

# The shared spine. Every asset carries this so the set reads as one hand.
BASE = (
    "refined Indian wedding stationery illustration, soft realistic painted "
    "rendering with delicate detail, pale grey-ivory background, palette of "
    "dusty rose, sage green, terracotta and antique brass, generous negative "
    "space, elegant and restrained, luxury print quality, "
    "no text, no lettering, no words, no watermark, no signature"
)

# The five card illustrations share ONE palette and ONE hand. The first set
# drifted into five separate palettes - sage, indigo, mustard, pastel pink,
# grey-magenta - and stopped reading as a set on the page.
PALETTE = (
    "strictly limited palette of dusty rose, soft lavender, antique gold and "
    "warm sepia, low saturation, muted and faded, absolutely no green, no "
    "teal, no blue, no bright colour"
)

WC = (
    "loose traditional watercolour illustration for a vintage Indian wedding "
    "invitation, visible pigment washes with soft bleeding edges, fine sepia "
    "ink linework drawn over the wash, painted on aged ivory paper, delicate "
    "and gently faded, " + PALETTE + ", single subject centred on a flat "
    "medium warm grey background, no 3D, no photorealism, no gloss, no "
    "cartoon, no hard vector edges, no drop shadow, no text, no lettering, "
    "no words, no watermark, no signature"
)

# Isolated props that get cut out and layered by CSS.
CUT = "single object, centred, isolated on pure plain flat white background. "

# The invitation cards use a more vintage register than the rest of the site.
VINT = (
    'vintage Indian wedding invitation illustration, hand drawn with fine ink linework and flat faded inks, letterpress printed on aged ivory paper, muted desaturated traditional palette, softly worn and slightly faded, antique lithograph feel, elegant and restrained, no 3D, no photorealism, no cartoon, no gloss, no gradient mesh, no text, no lettering, no words, no watermark'
)

ASSETS = {
    # ---- pin 1 shell: hanging garlands, palm, brass -----------------------
    # The mogra garlands are pin 1's signature. They are thin and mostly white,
    # so they render on a mid-grey ground for matting contrast and are matted
    # with BiRefNet - rembg shreds them.
    "mogra_long": dict(
        prompt="One long thick vertical hanging temple garland densely packed with hundreds "
               "of small white mogra jasmine buds strung tightly together into a plump "
               "rope, topped by a large ornate antique brass lotus-bud finial hanging from "
               "a brass chain, and tipped at the bottom with a full cluster of orange "
               "marigold blooms and a deep red banana-flower bud, hanging straight down, "
               "very tall, filling the full height of the frame, thick and substantial, "
               "single object centred on a flat medium warm grey background. " + BASE,
        size="portrait_16_9", cutout=True, matte="birefnet"),

    "mogra_short": dict(
        prompt="One thick vertical hanging temple garland densely packed with small white "
               "mogra jasmine buds strung into a plump rope, a large ornate antique brass "
               "lotus finial at the top and a full cluster of orange marigold and a red bud "
               "at the tip, hanging straight down, filling the full height of the frame, "
               "thick and substantial, single object centred on a flat medium warm grey "
               "background. " + BASE,
        size="portrait_4_3", cutout=True, matte="birefnet"),

    "mogra_swag": dict(
        prompt="A wide horizontal swag of thick ropes of densely strung white mogra jasmine "
               "buds draping in three deep generous curves across the full width of the "
               "frame, large ornate antique brass lotus finials at each anchor point and "
               "full clusters of orange marigold hanging at each dip, thick and "
               "substantial, symmetrical, centred on a flat medium warm grey background. "
               + BASE,
        size="landscape_16_9", cutout=True, matte="birefnet"),

    "banana_palm_left": dict(
        prompt="A cluster of large deep green banana palm fronds and a slender areca palm "
               "leaf entering from the lower left corner and fanning up and right, rich "
               "botanical detail, glossy leaves, the rest of the frame empty plain white. "
               + CUT + BASE,
        size="portrait_4_3", cutout=True),

    "banana_palm_right": dict(
        prompt="A cluster of large deep green banana palm fronds entering from the lower "
               "right corner and fanning up and left, rich botanical detail, glossy leaves, "
               "the rest of the frame empty plain white. " + CUT + BASE,
        size="portrait_4_3", cutout=True),

    "brass_kalash": dict(
        prompt="An ornate antique brass kalash urn on a small carved wooden stool, brimming "
               "with a tall arrangement of blush pink tulip buds, pale wheat stems and "
               "sage-green foliage, beside it a smaller brass pot of green sprigs. "
               + CUT + BASE,
        size="portrait_4_3", cutout=True),

    "brass_elephant": dict(
        prompt="A small solid antique brass ceremonial elephant figurine standing on a "
               "carved wooden side table with turned legs and inlaid blue-green tile panels, "
               "three-quarter view. " + CUT + BASE,
        size="square_hd", cutout=True),

    "lotus_bowl": dict(
        prompt="A wide shallow antique brass bowl filled with floating pink lotus blossoms "
               "and petals, resting on a small carved wooden stool, a single lotus flower "
               "beside it. " + CUT + BASE,
        size="square_hd", cutout=True),

    "corner_botanical": dict(
        prompt="A corner arrangement for a page corner: blush pink roses and tulip buds, "
               "pale wheat stems, sage-green eucalyptus and a few small white mogra "
               "blossoms radiating from one corner, the rest of the frame empty plain white. "
               + CUT + BASE,
        size="square_hd", cutout=True),

    # ---- backdrops (kept opaque, used as low-opacity layers) --------------
    "palace_lineart": dict(
        prompt="A very faint delicate single-line architectural drawing of an Indian palace "
               "skyline: domes, chhatri pavilions, arched jharokha windows and minarets, "
               "drawn in thin pale sepia outline only, extremely light and washed out, "
               "on a plain warm ivory ground, no shading, no fill, architectural elevation, "
               "wide panoramic. " + BASE,
        size="landscape_16_9", cutout=False),

    "paper_grain": dict(
        prompt="A flat empty sheet of pale grey-ivory handmade cotton rag paper, extremely "
               "subtle fibre grain and soft mottling, completely blank, no objects, no "
               "pattern, evenly lit, seamless texture. " + BASE,
        size="square_hd", cutout=False),

    "night_sky": dict(
        prompt="A deep midnight navy indigo night sky above a faint silhouette of Indian "
               "palace domes and cypress trees along the bottom edge, scattered warm brass "
               "hanging lanterns glowing softly, drifting golden fireflies and tiny sparks, "
               "deep blue and warm gold only, moody, romantic, tall vertical. " + BASE,
        size="portrait_16_9", cutout=False),

    # ---- per-event motifs, one accent colour each ------------------------
    "motif_mamera": dict(
        prompt="An ornate antique brass kalash pot draped with a marigold garland, filled "
               "with mango leaves and a coconut, flanked by a sheaf of golden wheat stems "
               "and sage-green leaves, ceremonial, sage green and brass tones. "
               + CUT + BASE,
        size="square_hd", cutout=True),

    "motif_sangeet": dict(
        prompt="A pair of ornate dholak drums with rope lacing beside two slender crystal "
               "champagne flutes and a scatter of pink rose petals, charcoal grey and warm "
               "brass tones, festive but elegant. " + CUT + BASE,
        size="square_hd", cutout=True),

    "motif_mandap": dict(
        prompt="A four-post wedding mandap canopy, slender carved brass posts with a draped "
               "terracotta and ivory fabric roof, swags of marigold and mango leaves along "
               "the top edge, front elevation, symmetrical, terracotta and brass tones. "
               + CUT + BASE,
        size="square_hd", cutout=True),

    "motif_baraat": dict(
        prompt="A white ceremonial wedding horse in ornate embroidered blue and gold "
               "caparison with a plumed headdress, standing in profile, riderless, "
               "deep blue and brass tones. " + CUT + BASE,
        size="square_hd", cutout=True),

    "motif_lagna": dict(
        prompt="Two mirrored ceremonial elephants in ornate blue and magenta embroidered "
               "jhool, each carrying a fringed pink parasol, facing one another "
               "symmetrically with a marigold garland strung between them, magenta and "
               "blue tones. " + CUT + BASE,
        size="landscape_16_9", cutout=True),

    # ---- ornaments and frames --------------------------------------------
    "divider_lotus": dict(
        prompt="A single tiny simple stylised lotus blossom ornament seen from the front, "
               "drawn small and delicate in dusty rose and thin brass line, minimal, "
               "generous empty white space around it. " + CUT + BASE,
        size="square", cutout=True),

    # divider_rule and photo_frame are hand-authored SVG in assets/ornaments/
    # instead - pure geometry mattes badly, and vector stays crisp and
    # recolourable at ~1KB.

    "countdown_locket": dict(
        prompt="A single ornate vertical oval locket cartouche, blank ivory centre ringed by "
               "a slim antique brass border with fine beading, a tiny brass loop at the top "
               "and three small pearl droplets hanging from its base, the oval centre "
               "completely blank empty flat ivory. " + CUT + BASE,
        size="portrait_4_3", cutout=True),

    "ganesha_motif": dict(
        prompt="A small reverent line illustration of Lord Ganesha seated on a lotus, drawn "
               "simply in fine antique brass outline with soft ivory fill, auspicious, "
               "elegant, restrained, minimal. " + CUT + BASE,
        size="square_hd", cutout=True),

    # ---- invitation-card set -----------------------------------------------
    # Vintage stationery, not the softer painted style used elsewhere on the
    # site: fine ink linework, faded flat inks, letterpress on aged paper.

    "card_paper_a": dict(
        prompt='An empty sheet of aged ivory handmade wedding-card paper, warm cream, very subtle cloudy mottling and a few faint tea-coloured age stains near the edges, fine cotton fibre grain, completely blank, no objects, no pattern, no border, evenly lit.'
               " " + VINT,
        size="square_hd", cutout=False),

    "card_paper_b": dict(
        prompt='An empty sheet of aged ivory handmade paper in a slightly warmer sand tone, faint soft blotches and gentle foxing toward one corner, fine fibre grain, completely blank, no objects, no pattern, no border.'
               " " + VINT,
        size="square_hd", cutout=False),

    "card_paper_c": dict(
        prompt='An empty sheet of pale antique cream paper with a very faint cool grey cast, subtle mottling, fine grain, completely blank, no objects, no pattern, no border.'
               " " + VINT,
        size="square_hd", cutout=False),

    "ill_mameru": dict(
        prompt="A brass kalash pot brimming with soft pink and cream blossoms and a "
               "coconut, draped with a garland of small dusty rose flowers, a "
               "sheaf of pale wheat leaning beside it, a few sepia-toned leaves. "
               + WC,
        size="square_hd", cutout=True, matte="birefnet"),

    "ill_sangeet": dict(
        prompt="A dhol drum and a pair of tabla with a slender shehnai horn resting "
               "against them, arranged as one low group. "
               + WC,
        size="landscape_16_9", cutout=True, matte="birefnet"),

    "ill_mandap": dict(
        prompt="A four post wedding mandap canopy with a draped fabric roof and "
               "swags of blossoms, slender carved posts, front elevation, "
               "symmetrical. "
               + WC,
        size="square_hd", cutout=True, matte="birefnet"),

    # Rendered on mid-grey: faded ink on white gives BiRefNet nothing to
    # separate, and the first attempt matted away to nothing.
    "ill_lagna": dict(
        prompt="A seated Lord Ganesha on a lotus throne, flanked by a delicate spray "
               "of roses and trailing foliage, reverent, simple and clearly drawn "
               "with definite outlines. "
               + WC,
        size="square_hd", cutout=True, matte="birefnet"),

    "ill_om": dict(
        prompt='A single ornate Aum Om symbol with a small lotus beneath it and two fine curving flourishes either side, drawn in faded terracotta and antique gold ink, centred, small and delicate. '
               " " + CUT + VINT,
        size="square_hd", cutout=True, matte="birefnet"),

    "orn_hanging": dict(
        prompt='Three very slender hanging ornaments of different lengths suspended from fine beaded threads that run up to the top edge of the frame, small teardrop and bell shaped pendants with tiny tassels, thin and delicate, drawn in faded antique gold ink. '
               " " + CUT + VINT,
        size="portrait_4_3", cutout=True, matte="birefnet"),

    "orn_corner": dict(
        prompt='A delicate corner flourish of fine trailing vine, small paisley buds and tiny five petal flowers radiating from one corner, thin ink linework, faded antique gold and sage, the rest of the frame empty plain white. '
               " " + CUT + VINT,
        size="square_hd", cutout=True, matte="birefnet"),

    "orn_rule_band": dict(
        prompt='A slender horizontal ornamental band of tiny repeating paisley and floral motifs in faded antique gold ink on plain white, very thin, symmetrical, wide, delicate. '
               " " + CUT + VINT,
        size="landscape_16_9", cutout=True, matte="birefnet"),

    # Full-card architecture wash. The reference cards carry a faint sepia
    # photograph of palace architecture across the WHOLE card, not a strip at
    # the foot, so these are portrait and framed to fill a 2:3 card.
    "card_wash_a": dict(
        prompt="A faded sepia photograph of an ornate Rajasthani palace facade with carved "
               "jharokha balconies, arched windows and a domed chhatri, filling the whole "
               "tall vertical frame, heavily washed out and low contrast, pale warm sepia "
               "and cream, like an old print bleached by sunlight, no sky, no people. "
               + VINT,
        size="portrait_16_9", cutout=False),

    "card_wash_b": dict(
        prompt="A faded sepia photograph of a Mughal fort archway and colonnade with carved "
               "stone pillars receding into shadow, filling the whole tall vertical frame, "
               "heavily washed out and low contrast, pale warm sepia and cream, like an old "
               "print bleached by sunlight, no people. " + VINT,
        size="portrait_16_9", cutout=False),

    "card_wash_c": dict(
        prompt="A faded sepia photograph of an Indian palace courtyard with scalloped arches, "
               "a distant dome and a stepped plinth, filling the whole tall vertical frame, "
               "heavily washed out and low contrast, pale warm sepia and cream, like an old "
               "print bleached by sunlight, no people. " + VINT,
        size="portrait_16_9", cutout=False),

    # The લગ્ન card's corner piece, matched to the reference's વિવાહ card: a
    # caparisoned elephant with lavender blooms, anchored bottom-right and
    # bleeding off the card edge.
    # The લગ્ન card's bottom-LEFT corner. Replaces the Ganesha: the reference
    # card puts a loose spray of lavender blooms here, not a deity.
    "ill_lagna_blooms": dict(
        prompt="A loose spray of soft lavender and pale pink crocus and iris blooms "
               "on slender stems with a few fine grasses, rising and fanning out "
               "from one low corner, delicate and airy, nothing in the rest of the "
               "frame. "
               + WC,
        size="square_hd", cutout=True, matte="birefnet"),

    "ill_lagna_elephant": dict(
        prompt="A richly caparisoned Indian ceremonial elephant facing left, its hide "
               "a pale warm gold and cream, wearing an ornate embroidered jhool "
               "patterned in dusty rose, violet and antique gold with tassels and "
               "a domed gold headpiece, gold anklets, trunk curled up, standing "
               "alone. "
               + WC,
        size="square_hd", cutout=True, matte="birefnet"),

    # ---- intro screen -----------------------------------------------------
    # Matched to the reel: flat watercolour, blue tiled domes, the bell hanging
    # from a bracket at the arch apex, the elephant on DRY paved floor with the
    # lotus pond only along the bottom edge. Three layers so the elephant and
    # bell animate against a static scene.
    "intro_backdrop": dict(
        prompt="A tall vertical flat watercolour illustration of a Rajasthani palace "
               "pavilion on a soft blush-cream ground. A domed chhatri with a deep "
               "ultramarine blue tiled dome and gold finial sits centre, below it a tall "
               "scalloped cusped archway of blue and white tilework with carved ivory "
               "columns, and across the very top inside of that archway a slender "
               "horizontal carved stone beam with a small gold hook at its centre. "
               "Through the arch, a pale distant garden. "
               "The entire centre and foreground is a DRY pale cream stone courtyard floor "
               "of flat patterned tiles, completely empty and open, no water, no pond, no "
               "animals, no people, nothing standing on it. "
               "Pink bougainvillea branches trail in from the upper left, a banana palm and "
               "a cypress at the right, terracotta pots of pink lotus along the sides. Only "
               "along the very bottom edge of the frame is a shallow lotus pool with a "
               "blue-and-white tiled rim. Delicate ink linework, soft pastel washes. "
               + BASE,
        size="portrait_16_9", cutout=False),

    "intro_elephant": dict(
        prompt="A ceremonial Indian temple elephant standing in full side profile facing "
               "right, wearing an ornate embroidered jhool blanket in coral, gold and green "
               "with tassels and a small gold headpiece, its trunk curled upward and raised "
               "high above its head, tusks visible, standing squarely on all four feet on "
               "flat ground, complete whole animal, full body visible, flat watercolour "
               "illustration with delicate ink linework and soft pastel washes. "
               + CUT + BASE,
        size="square_hd", cutout=True, matte="birefnet"),

    "intro_bell": dict(
        prompt="A large ornate antique brass temple bell hanging from a SHORT thick brass "
               "chain of only a few links, with a sturdy brass mounting ring and hook at the "
               "very top of the chain, the bell body large below with a visible clapper and "
               "engraved bands, side view, symmetrical, flat watercolour illustration with "
               "ink linework. " + CUT + BASE,
        size="portrait_4_3", cutout=True, matte="birefnet"),

    # ---- names section backdrop, matched to the reel's second screen -------
    "hero_garden": dict(
        prompt="A tall vertical flat watercolour illustration of a Mughal charbagh garden on "
               "a soft blush-cream ground: two domed chhatri pavilions with deep ultramarine "
               "blue tiled domes and scalloped arches at the left and right, a carved white "
               "marble tiered fountain at the centre with a blue-and-white tiled basin, tall "
               "dark cypress trees, flowering pink blossom branches, terracotta pots of "
               "lotus. The upper third of the image is empty open blush sky with nothing in "
               "it. Delicate ink linework, soft pastel washes, airy and light. " + BASE,
        size="portrait_16_9", cutout=False),

    # ---- birds, as seed-locked wing-up / wing-down pairs -------------------
    # Same seed + a minimal prompt delta keeps the bird identical between
    # frames, so the two can be alternated as a wing flap.
    "bird_a_up": dict(
        prompt="A single small Indian bulbul songbird flying, seen from the side facing "
               "right, both wings raised high above its body in a full upstroke, tail "
               "narrow, warm cream and soft terracotta plumage with a dark crest, flat "
               "watercolour illustration with fine ink linework. " + CUT + BASE,
        size="square_hd", cutout=True, matte="birefnet", seed=770411),

    "bird_a_down": dict(
        prompt="A single small Indian bulbul songbird flying, seen from the side facing "
               "right, both wings swept low beneath its body in a full downstroke, tail "
               "narrow, warm cream and soft terracotta plumage with a dark crest, flat "
               "watercolour illustration with fine ink linework. " + CUT + BASE,
        size="square_hd", cutout=True, matte="birefnet", seed=770411),

    "bird_b_up": dict(
        prompt="A single small Indian songbird flying, seen from the side facing right, both "
               "wings raised high above its body in a full upstroke, tail narrow, sage green "
               "and pale gold plumage, flat watercolour illustration with fine ink linework. "
               + CUT + BASE,
        size="square_hd", cutout=True, matte="birefnet", seed=118322),

    "bird_b_down": dict(
        prompt="A single small Indian songbird flying, seen from the side facing right, both "
               "wings swept low beneath its body in a full downstroke, tail narrow, sage "
               "green and pale gold plumage, flat watercolour illustration with fine ink "
               "linework. " + CUT + BASE,
        size="square_hd", cutout=True, matte="birefnet", seed=118322),

    # ---- event card furniture, matching the reference cards ---------------
    "parchment": dict(
        prompt="A flat empty sheet of aged antique parchment paper in warm pale cream and "
               "soft beige, subtle mottling and gentle age toning toward the edges, "
               "completely blank with no objects, no pattern, no text, evenly lit, seamless "
               "texture. " + BASE,
        size="square_hd", cutout=False),

    "hanging_lantern": dict(
        prompt="Two ornate Indian hanging lanterns of different lengths suspended from fine "
               "beaded brass chains running up to the top edge of the frame, teardrop "
               "shaped pierced brass bodies with small tassels, warm brass and soft "
               "terracotta, hanging in the upper right. " + CUT + BASE,
        size="portrait_4_3", cutout=True, matte="birefnet"),

    # Warm replacement for the navy night sky.
    "night_sky_warm": dict(
        prompt="A deep oxblood wine and dark plum night sky above a faint silhouette of "
               "Indian palace domes and cypress trees along the bottom edge, scattered warm "
               "brass hanging lanterns glowing softly, drifting golden fireflies and tiny "
               "sparks, deep burgundy and warm gold only, absolutely no blue, moody, "
               "romantic, tall vertical. " + BASE,
        size="portrait_16_9", cutout=False),
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
            last = "HTTP %s: %s" % (e.code, e.read()[:300].decode(errors="replace"))
            if e.code in (400, 401, 403, 422):
                break
        except Exception as e:
            last = str(e)
        time.sleep(2 * (attempt + 1))
    raise RuntimeError(last)


def fetch(url, dest):
    with urllib.request.urlopen(url, timeout=300) as r:
        dest.write_bytes(r.read())


def build(key):
    spec = ASSETS[key]
    payload = {
        "prompt": spec["prompt"],
        "image_size": spec["size"],
        "num_images": 1,
        "num_inference_steps": 32,
        "guidance_scale": 3.5,
        "enable_safety_checker": False,
    }
    # A fixed seed keeps the subject stable across a pair of prompts that
    # differ only slightly - used for the two-frame bird wing flap.
    if spec.get("seed") is not None:
        payload["seed"] = spec["seed"]
    res = post(FLUX, payload)
    url = res["images"][0]["url"]
    if spec["cutout"]:
        url = MATTE[spec.get("matte", "rembg")](url)
    dest = OUT / (key + ".png")
    fetch(url, dest)
    return key, dest, dest.stat().st_size


def main():
    args = sys.argv[1:]
    if "--list" in args:
        for k, v in ASSETS.items():
            print("%-20s %-18s cutout=%s" % (k, v["size"], v["cutout"]))
        print("\n%d assets" % len(ASSETS))
        return
    if not FAL_KEY:
        sys.exit("FAL_KEY not set in environment.")
    OUT.mkdir(parents=True, exist_ok=True)

    want = args or list(ASSETS)
    unknown = [k for k in want if k not in ASSETS]
    if unknown:
        sys.exit("unknown asset(s): %s\nrun --list to see all" % unknown)

    failed = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
        futures = {ex.submit(build, k): k for k in want}
        for fut in concurrent.futures.as_completed(futures):
            key = futures[fut]
            try:
                name, dest, size = fut.result()
                print("OK   %-20s %5d KB  %s" % (name, size // 1024, dest))
            except Exception as e:
                failed.append(key)
                print("FAIL %-20s %s" % (key, e))
    if failed:
        print("\n%d failed, rerun with: python scripts/gen_assets.py %s"
              % (len(failed), " ".join(failed)))
        sys.exit(1)
    print("\ndone, %d assets in %s" % (len(want) - len(failed), OUT))


if __name__ == "__main__":
    main()

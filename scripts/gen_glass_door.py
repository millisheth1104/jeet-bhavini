#!/usr/bin/env python3
import json
import os
import urllib.request
import pathlib

FAL_KEY = os.environ.get("FAL_KEY")
if not FAL_KEY:
    env_path = pathlib.Path(".env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("FAL_KEY="):
                FAL_KEY = line.split("=", 1)[1].strip()

if not FAL_KEY:
    raise SystemExit("FAL_KEY missing")

OUT = pathlib.Path("assets/generated")
OUT.mkdir(parents=True, exist_ok=True)

PROMPT = (
    "A breathtaking royal Indian palace courtyard in Udaipur, seen from an arched doorway terrace. "
    "In the center is a serene turquoise water reflection pool with a classical tiered white marble fountain gently splashing water. "
    "Beyond the pool stand elegant white marble domed pavilions (chhatris) with intricate jali screens, lush green topiary and palms. "
    "Soft warm morning golden hour sunlight, ethereal hazy mist, soft pale peach and golden sky. "
    "Refined luxury Indian wedding stationery illustration style, soft painted rendering, delicate watercolor wash, peaceful and magnificent, "
    "high resolution, 8k, architectural elegance, no people, no text, no watermark, no frame"
)

def run():
    payload = {
        "prompt": PROMPT,
        "image_size": {
            "width": 1024,
            "height": 1536
        },
        "num_inference_steps": 28,
        "guidance_scale": 3.5,
        "enable_safety_checker": False
    }
    
    req = urllib.request.Request(
        "https://fal.run/fal-ai/flux/dev",
        headers={
            "Authorization": f"Key {FAL_KEY}",
            "Content-Type": "application/json"
        },
        data=json.dumps(payload).encode("utf-8")
    )
    
    print("Requesting generation from fal.ai FLUX...", flush=True)
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read().decode("utf-8"))
    
    img_url = result["images"][0]["url"]
    print(f"Downloading from {img_url}...", flush=True)
    
    target = OUT / "door_courtyard.jpg"
    urllib.request.urlretrieve(img_url, target)
    print(f"Saved courtyard backdrop to {target} ({target.stat().st_size} bytes)")

if __name__ == "__main__":
    run()

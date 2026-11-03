"""Turns tools/.cache screenshots into card images (WebP) and social previews (JPG)."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
cache = root / "tools" / ".cache"
out = root / "assets" / "work"
out.mkdir(parents=True, exist_ok=True)


def fit(im, w):
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


import json
ids = set(json.loads((root / "data" / "list.json").read_text(encoding="utf8")))

for f in sorted(cache.glob("*.jpg")):
    pid = f.stem[:-2] if f.stem.endswith("-m") else f.stem
    done = out / (f"{f.stem}.webp" if f.stem.endswith("-m") else f"{f.stem}-900.webp")
    if pid not in ids or done.exists():
        continue
    im = Image.open(f).convert("RGB")
    if f.stem.endswith("-m"):
        fit(im, 360).save(out / f"{f.stem}.webp", quality=78, method=6)
    else:
        fit(im, 480).save(out / f"{f.stem}-480.webp", quality=76, method=6)
        fit(im, 900).save(out / f"{f.stem}-900.webp", quality=78, method=6)
        fit(im, 1200).save(out / f"{f.stem}-og.jpg", quality=80, optimize=True, progressive=True)
print(sum(p.stat().st_size for p in out.iterdir()) // 1024, "KB in", len(list(out.iterdir())), "files")

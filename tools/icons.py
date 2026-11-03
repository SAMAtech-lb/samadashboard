"""Draws the logo icons (same shapes as assets/favicon.svg) and the home page's social preview image."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent.parent
assets = root / "assets"
S = 2048
k = S / 48
logo = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(logo)
d.rounded_rectangle([0, 0, S - 1, S - 1], radius=13 * k, fill="#3d5afe")
for pts, c in (([(9, 35), (19.5, 18), (26, 28)], "#9cc4ff"), ([(18, 35), (29.5, 13), (39, 35)], "#ffffff")):
    p = [(x * k, y * k) for x, y in pts]
    w = int(3.6 * k)
    d.line(p, fill=c, width=w, joint="curve")
    for q in (p[0], p[-1]):
        d.ellipse([q[0] - w / 2, q[1] - w / 2, q[0] + w / 2, q[1] + w / 2], fill=c)
for n in (180, 192, 512):
    logo.resize((n, n), Image.LANCZOS).save(assets / f"icon-{n}.png", optimize=True)
logo.resize((48, 48), Image.LANCZOS).save(root / "favicon.ico", sizes=[(48, 48)])

# Social preview: 1200x630, in the site's colours, with real demo screenshots
og = Image.new("RGB", (1200, 630), "#0f0f0e")
draw = ImageDraw.Draw(og)
for i, name in enumerate(["hotel-azure", "shop-norde", "restaurant-rossa"]):
    f = assets / "work" / f"{name}-900.webp"
    if f.exists():
        im = Image.open(f).convert("RGB").resize((560, 350), Image.LANCZOS)
        mask = Image.new("L", im.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, 559, 349], 18, fill=255)
        og.paste(im, (690, 40 + i * 190), mask)
og.paste(logo.resize((84, 84), Image.LANCZOS), (64, 64), logo.resize((84, 84), Image.LANCZOS))
font = "C:/Windows/Fonts/segoeuib.ttf"
draw.text((64, 200), "Web design", font=ImageFont.truetype(font, 76), fill="#edebe4")
draw.text((64, 288), "in Lebanon", font=ImageFont.truetype(font, 76), fill="#d7ff3a")
draw.text((64, 410), "Websites, online stores, apps and video", font=ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 28), fill="#b5b3ab")
draw.text((64, 530), "SAMA  ·  samatechlb.com", font=ImageFont.truetype(font, 30), fill="#edebe4")
og.save(assets / "og-home.jpg", quality=84, optimize=True)
print("icons and og image written")

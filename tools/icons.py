"""Makes the logo icons, the site photos and the home page's social preview image."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent.parent
assets = root / "assets"
S = 2048
k = S / 48

# Real SAMA logo: rounded square with a blue gradient and two rising peaks
grad = Image.new("RGB", (S, S))
px = grad.load()
a, b = (0x2a, 0x5f, 0xe0), (0x5b, 0x93, 0xff)
for y in range(0, S, 4):
    for x in range(0, S, 4):
        t = (x + (S - y)) / (2 * S)
        c = tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))
        for dy in range(4):
            for dx in range(4):
                if x + dx < S and y + dy < S:
                    px[x + dx, y + dy] = c
mask = Image.new("L", (S, S), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], radius=14 * k, fill=255)
logo = Image.new("RGBA", (S, S), (0, 0, 0, 0))
logo.paste(grad, (0, 0), mask)
d = ImageDraw.Draw(logo)
for pts, c in (([(9, 35), (19.5, 18), (26, 28)], "#9cc4ff"), ([(18, 35), (29.5, 13), (39, 35)], "#ffffff")):
    p = [(x * k, y * k) for x, y in pts]
    w = int(3.6 * k)
    d.line(p, fill=c, width=w, joint="curve")
    for q in (p[0], p[-1]):
        d.ellipse([q[0] - w / 2, q[1] - w / 2, q[0] + w / 2, q[1] + w / 2], fill=c)
for n in (180, 192, 512):
    logo.resize((n, n), Image.LANCZOS).save(assets / f"icon-{n}.png", optimize=True)
logo.resize((48, 48), Image.LANCZOS).save(root / "favicon.ico", sizes=[(48, 48)])

# Photos
photos = root / "tools" / ".cache" / "photos"
(assets / "img").mkdir(exist_ok=True)
for name, sizes in (("sky", (900, 1800)), ("dusk", (1400,)), ("edit", (800,))):
    src = photos / f"{name}.jpg"
    if src.exists():
        im = Image.open(src).convert("RGB")
        for w in sizes:
            im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(assets / "img" / f"{name}-{w}.webp", quality=68, method=6)

# Social preview: 1200x630, in the site's colours, with real demo screenshots
og = Image.new("RGB", (1200, 630), "#060a18")
draw = ImageDraw.Draw(og)
for i, name in enumerate(["hotel-azure", "shop-norde", "restaurant-rossa"]):
    f = assets / "work" / f"{name}-900.webp"
    if f.exists():
        im = Image.open(f).convert("RGB").resize((560, 350), Image.LANCZOS)
        m = Image.new("L", im.size, 0)
        ImageDraw.Draw(m).rounded_rectangle([0, 0, 559, 349], 18, fill=255)
        og.paste(im, (690, 40 + i * 190), m)
small = logo.resize((84, 84), Image.LANCZOS)
og.paste(small, (64, 64), small)
font = "C:/Windows/Fonts/segoeuib.ttf"
draw.text((64, 200), "Web design", font=ImageFont.truetype(font, 76), fill="#eef3ff")
draw.text((64, 288), "in Lebanon", font=ImageFont.truetype(font, 76), fill="#9cc4ff")
draw.text((64, 410), "Websites, online stores, apps and video", font=ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 28), fill="#c3cde6")
draw.text((64, 530), "SAMA  ·  samatechlb.com", font=ImageFont.truetype(font, 30), fill="#eef3ff")
og.save(assets / "og-home.jpg", quality=84, optimize=True)
print("icons, photos and og image written")

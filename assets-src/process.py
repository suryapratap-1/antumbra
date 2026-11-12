# Turn free 1024px generations into site assets: crop the watermark band, crop to aspect,
# upscale (Lanczos) + unsharp + film grain + a shared warm/teal grade so every photo looks like one shoot.
import sys, os, random
from PIL import Image, ImageFilter, ImageEnhance, ImageChops
SRC, OUT = 'assets-src/gen', 'public/img'
SPECS = {
  'atelier': ((1920, 1200), 'neutral'), 'carbon': ((1080, 1350), 'neutral'), 'leather': ((1080, 1350), 'neutral'),
  'titanium': ((1080, 1350), 'neutral'), 'mountain': ((1920, 1250), 'neutral'), 'saltflat': ((1200, 1600), 'cold'),
  'tunnel': ((1920, 1250), 'cold'), 'windtunnel': ((1920, 1080), 'cold'), 'eclipse': ((1920, 1080), 'neutral'),
}
def grain(im, amt=10):
    random.seed(3); n = Image.effect_noise(im.size, 64).convert('L').point(lambda v: 128 + (v - 128) * amt // 64)
    return ImageChops.overlay(im, Image.merge('RGB', [n, n, n]))
def grade(im, g):
    r, gch, b = im.split()
    if g == 'warm': r = r.point(lambda v: min(255, int(v * 1.04 + 3))); b = b.point(lambda v: int(v * .95))
    if g in ('teal','cold'): r = r.point(lambda v: int(v * .92)); gch = gch.point(lambda v: min(255, int(v * 1.02))); b = b.point(lambda v: min(255, int(v * 1.03)))
    im = Image.merge('RGB', (r, gch, b))
    return ImageEnhance.Contrast(im).enhance(1.04)
def process(name):
    (W, H), g = SPECS[name]
    im = Image.open(f'{SRC}/{name}.jpg').convert('RGB')
    w, h = im.size
    im = im.crop((0, 0, w, int(h * .93)))                       # drop the bottom band with the watermark
    w, h = im.size; tr = W / H
    if w / h > tr: nw = int(h * tr); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else: nh = int(w / tr); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im = im.resize((W, H), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    im = grain(grade(im, g))
    im.save(f'{OUT}/{name}.jpg', quality=80, optimize=True, progressive=True)
    print('processed', name, im.size)
for n in (sys.argv[1:] or SPECS):
    if os.path.exists(f'{SRC}/{n}.jpg'):
        try: Image.open(f'{SRC}/{n}.jpg').verify(); process(n)
        except Exception as e: print('skip', n, e)
    else: print('missing', n)

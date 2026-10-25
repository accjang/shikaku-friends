# tools/out_props/*.png(렌더 원본)을 투명 여백을 잘라 아래 가운데 맞춤 정사각형으로 assets/props/에 넣는다.
import glob, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'assets', 'props')
PX = 256
os.makedirs(OUT, exist_ok=True)
for f in sorted(glob.glob(os.path.join(ROOT, 'tools', 'out_props', '*.png'))):
    im = Image.open(f)
    im = im.crop(im.getbbox())
    w, h = im.size
    s = max(w, h)
    c = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    c.paste(im, ((s - w) // 2, s - h))
    c.resize((PX, PX), Image.LANCZOS).save(os.path.join(OUT, os.path.basename(f)), optimize=True)
    print(os.path.basename(f))

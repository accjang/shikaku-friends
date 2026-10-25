# tools/out/*.png(렌더 원본)을 투명 여백을 잘라 정사각형으로 맞춰 assets/chars/에 넣는다.
# <이름>_front에서는 머리 부분만 자른 <이름>_head.png(작은 아이콘)도 만든다.
import glob, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'assets', 'chars')
BODY_PX, HEAD_PX = 384, 160
# 머리가 끝나는 높이(몸 전체 대비, 팔이 안 들어오게)
HEAD_RATIO = {'cat': 0.64, 'panda': 0.58, 'rabbit': 0.71, 'shiba': 0.5, 'duck': 0.56}
os.makedirs(OUT, exist_ok=True)

def square(im, bottom=True):
    w, h = im.size
    s = max(w, h)
    c = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    c.paste(im, ((s - w) // 2, s - h if bottom else (s - h) // 2))
    return c

for f in sorted(glob.glob(os.path.join(ROOT, 'tools', 'out', '*.png'))):
    name = os.path.basename(f)[:-4]
    im = Image.open(f)
    im = im.crop(im.getbbox())
    square(im).resize((BODY_PX, BODY_PX), Image.LANCZOS).save(os.path.join(OUT, name + '.png'), optimize=True)
    if name.endswith('_front'):
        w, h = im.size
        head = im.crop((0, 0, w, int(h * HEAD_RATIO[name.split('_')[0]])))
        head = square(head.crop(head.getbbox()), bottom=False)
        head.resize((HEAD_PX, HEAD_PX), Image.LANCZOS).save(os.path.join(OUT, name.split('_')[0] + '_head.png'), optimize=True)
    print(name)

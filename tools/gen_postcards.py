# 판을 다 풀면 드러나는 픽셀아트 그림(앨범에 모인다). 캐릭터마다 4장 → assets/postcards/<캐릭터>_<1~4>.png. 실행: python3 tools/gen_postcards.py
# 1 얼굴(체크무늬) · 2 낮 풍경(그 친구 챕터의 소품) · 3 잔치(기뻐하는 자세·깃발) · 4 저녁/밤 풍경.
# 캐릭터 렌더(assets/chars)와 마을 소품(assets/props)을 바탕 위에 놓고 PIXELS칸으로 줄였다가 키워 도트 그림처럼 만든다.
# 판이 직사각형이어도 보이게 주인공은 가운데 근처에 둔다. 그림 번호·개수는 src/core/album.ts(PICTURES_PER_CHAPTER)와 맞춘다.
import os
import random
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(__file__), '..')
CH = os.path.join(ROOT, 'assets', 'chars')
PR = os.path.join(ROOT, 'assets', 'props')
OUT = os.path.join(ROOT, 'assets', 'postcards')
SIZE, PIXELS = 512, 64
# src/ui/theme.ts CHARACTER_THEME와 같은 색(soft, main)
THEME = {
    'cat': ('#ECE8F8', '#B9B0DA'),
    'panda': ('#E3F5EA', '#9ED9B5'),
    'rabbit': ('#FFE8EE', '#FFB3C7'),
    'shiba': ('#FFF0E0', '#FFC48F'),
    'duck': ('#FFF9DC', '#FFE27A'),
}
# 낮 풍경: (뒤 소품들 [(이름, 가로 중심, 바닥, 높이)], 연못 여부)
DAY = {
    'cat': ([('lamp', 0.16, 0.8, 0.5), ('bench', 0.76, 0.82, 0.3)], False),
    'panda': ([('bamboo', 0.14, 0.8, 0.62), ('bamboo', 0.86, 0.78, 0.55), ('rock', 0.8, 0.9, 0.16)], False),
    'rabbit': ([('picnic', 0.78, 0.9, 0.26), ('flowers', 0.16, 0.9, 0.22), ('tree', 0.14, 0.7, 0.5)], False),
    'shiba': ([('signpost', 0.16, 0.82, 0.4), ('fence', 0.8, 0.8, 0.22), ('log', 0.8, 0.93, 0.14)], False),
    'duck': ([('cattails', 0.14, 0.78, 0.4), ('lilypad', 0.78, 0.9, 0.12), ('lilypad', 0.2, 0.93, 0.1)], True),
}
# 저녁·밤 풍경: (하늘 위, 하늘 아래, 땅, 해/달, 소품들)
EVENING = {
    'cat': ('#2B2A5C', '#5B4E96', '#3E5A54', 'moon', [('house', 0.22, 0.8, 0.5), ('lamp', 0.84, 0.82, 0.46)]),
    'panda': ('#FFB37A', '#FFD9A0', '#7DB583', 'sun', [('bigtree', 0.2, 0.8, 0.66), ('stump', 0.82, 0.88, 0.18)]),
    'rabbit': ('#FF9EB5', '#FFD3B8', '#8CC08A', 'sun', [('well', 0.2, 0.82, 0.42), ('bush', 0.84, 0.86, 0.22)]),
    'shiba': ('#33336B', '#6A5AA8', '#44625A', 'moon', [('tree', 0.16, 0.8, 0.56), ('barrel', 0.84, 0.86, 0.24)]),
    'duck': ('#FF9A76', '#FFD08A', '#7FB8A0', 'sun', [('willow', 0.2, 0.8, 0.62), ('cattails', 0.86, 0.84, 0.32)]),
}


def rgb(hex_color):
    return tuple(int(hex_color[i:i + 2], 16) for i in (1, 3, 5))


def sprite(folder, name):
    im = Image.open(os.path.join(folder, f'{name}.png')).convert('RGBA')
    return im.crop(im.getbbox())


def put(base, im, cx, bottom, height):
    """그림을 높이(전체 대비 비율)로 맞춰 가로 중심 cx, 바닥 bottom에 놓는다."""
    h = int(SIZE * height)
    w = max(1, int(im.size[0] * h / im.size[1]))
    im = im.resize((w, h), Image.LANCZOS)
    base.alpha_composite(im, (int(SIZE * cx - w / 2), int(SIZE * bottom - h)))


def sky(top, bottom):
    im = Image.new('RGBA', (SIZE, SIZE))
    d = ImageDraw.Draw(im)
    a, b = rgb(top), rgb(bottom)
    for y in range(SIZE):
        t = y / SIZE
        d.line([(0, y), (SIZE, y)], fill=tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3)) + (255,))
    return im


def ground(d, color, horizon=0.68):
    # 완만한 언덕 두 겹
    c = rgb(color)
    back = tuple(min(255, int(v * 1.12)) for v in c)
    d.ellipse([-SIZE * 0.4, SIZE * (horizon - 0.06), SIZE * 0.7, SIZE * 1.3], fill=back)
    d.ellipse([SIZE * 0.3, SIZE * (horizon - 0.02), SIZE * 1.5, SIZE * 1.4], fill=back)
    d.rectangle([0, SIZE * (horizon + 0.1), SIZE, SIZE], fill=c)
    d.ellipse([-SIZE * 0.2, SIZE * (horizon + 0.02), SIZE * 1.2, SIZE * 1.5], fill=c)


def cloud(d, cx, cy, s, color=(255, 255, 255, 235)):
    for dx, dy, r in [(-0.9, 0.15, 0.6), (0, 0, 0.9), (0.9, 0.2, 0.55)]:
        x, y, rr = cx + dx * s, cy + dy * s, r * s
        d.ellipse([x - rr, y - rr * 0.7, x + rr, y + rr * 0.7], fill=color)


def sparkle(d, cx, cy, r, color='#FFFFFF'):
    d.polygon([(cx, cy - r * 2), (cx + r * 0.6, cy), (cx, cy + r * 2), (cx - r * 0.6, cy)], fill=color)
    d.polygon([(cx - r * 2, cy), (cx, cy + r * 0.6), (cx + r * 2, cy), (cx, cy - r * 0.6)], fill=color)


def portrait(name):
    soft, main = THEME[name]
    im = Image.new('RGBA', (SIZE, SIZE), soft)
    d = ImageDraw.Draw(im)
    step = SIZE // 8
    for y in range(8):
        for x in range(8):
            if (x + y) % 2 == 0:
                d.rectangle([x * step, y * step, (x + 1) * step, (y + 1) * step], fill=main + '55')
    for (sx, sy) in [(0.12, 0.15), (0.85, 0.2), (0.2, 0.82), (0.82, 0.78), (0.5, 0.08)]:
        sparkle(d, sx * SIZE, sy * SIZE, SIZE * 0.025)
    char = sprite(CH, f'{name}_head')
    h = 0.72
    if char.size[0] * h / char.size[1] > 0.85:
        h = 0.85 * char.size[1] / char.size[0]
    put(im, char, 0.5, 0.5 + h / 2 + 0.04, h)
    return im


def day(name):
    props, pond = DAY[name]
    im = sky('#9FD8FF', '#E4F6FF')
    d = ImageDraw.Draw(im)
    d.ellipse([SIZE * 0.74, SIZE * 0.07, SIZE * 0.9, SIZE * 0.23], fill='#FFE27A')
    cloud(d, SIZE * 0.25, SIZE * 0.16, SIZE * 0.08)
    cloud(d, SIZE * 0.6, SIZE * 0.3, SIZE * 0.06)
    ground(d, '#9BD68B')
    if pond:
        d.ellipse([-SIZE * 0.1, SIZE * 0.74, SIZE * 1.1, SIZE * 1.2], fill='#8FD3F4')
        d.ellipse([SIZE * 0.3, SIZE * 0.8, SIZE * 0.7, SIZE * 0.84], fill='#BDE8FB')
    for prop, cx, bottom, height in props:
        put(im, sprite(PR, prop), cx, bottom, height)
    put(im, sprite(CH, f'{name}_front'), 0.5, 0.94, 0.56)
    return im


def party(name):
    soft, main = THEME[name]
    im = sky(main, soft)
    d = ImageDraw.Draw(im)
    # 햇살 무늬
    for i in range(12):
        if i % 2 == 0:
            d.pieslice([-SIZE * 0.5, -SIZE * 0.5, SIZE * 1.5, SIZE * 1.5], i * 30, i * 30 + 30, fill=(255, 255, 255, 60))
    ground(d, '#A8DD96', 0.74)
    put(im, sprite(PR, 'bunting'), 0.5, 0.3, 0.26)
    # 색종이(시드 고정 — 다시 만들어도 같은 그림)
    rnd = random.Random(f'party:{name}')
    for _ in range(46):
        x, y = rnd.random() * SIZE, rnd.random() * SIZE * 0.7
        c = rnd.choice(['#FF7FA3', '#FFC23D', '#8DB4F2', '#7FCB9C', '#B39BF0', '#FFFFFF'])
        s = SIZE * 0.022
        d.rectangle([x, y, x + s, y + s], fill=c)
    put(im, sprite(PR, 'flowers'), 0.14, 0.95, 0.2)
    put(im, sprite(PR, 'flowers'), 0.86, 0.95, 0.2)
    put(im, sprite(CH, f'{name}_cheer'), 0.5, 0.95, 0.62)
    return im


def evening(name):
    top, bottom, land, light, props = EVENING[name]
    im = sky(top, bottom)
    d = ImageDraw.Draw(im)
    if light == 'moon':
        d.ellipse([SIZE * 0.68, SIZE * 0.08, SIZE * 0.86, SIZE * 0.26], fill='#FFF3B8')
        d.ellipse([SIZE * 0.63, SIZE * 0.05, SIZE * 0.79, SIZE * 0.21], fill=top)
        rnd = random.Random(f'stars:{name}')
        for _ in range(16):
            sparkle(d, rnd.random() * SIZE, rnd.random() * SIZE * 0.5, SIZE * 0.012, '#FFF7D6')
    else:
        d.ellipse([SIZE * 0.36, SIZE * 0.42, SIZE * 0.64, SIZE * 0.7], fill='#FFF0B0')
        cloud(d, SIZE * 0.2, SIZE * 0.2, SIZE * 0.07, (255, 240, 225, 220))
        cloud(d, SIZE * 0.8, SIZE * 0.14, SIZE * 0.06, (255, 240, 225, 220))
    ground(d, land)
    for prop, cx, bottom_y, height in props:
        put(im, sprite(PR, prop), cx, bottom_y, height)
    put(im, sprite(CH, f'{name}_q'), 0.54, 0.94, 0.54)
    return im


os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    os.remove(os.path.join(OUT, f))
for name in THEME:
    for n, make in enumerate([portrait, day, party, evening], start=1):
        pixel = make(name).convert('RGB').resize((PIXELS, PIXELS), Image.LANCZOS)
        pixel.resize((SIZE, SIZE), Image.NEAREST).save(os.path.join(OUT, f'{name}_{n}.png'), optimize=True)
    print(name)

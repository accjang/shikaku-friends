# 판을 다 풀면 드러나는 캐릭터 픽셀아트(assets/postcards/<캐릭터>.png). 실행: python3 tools/gen_postcards.py
# 캐릭터 얼굴(assets/chars/<이름>_head.png) + 챕터 색 바탕(체크무늬·반짝이)을 PIXELS칸으로 줄였다가
# 가장 가까운 색으로 키워 도트 그림처럼 만든다. 판이 직사각형이어도 가운데가 보이게 캐릭터는 가운데.
import os
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(__file__), '..')
CH = os.path.join(ROOT, 'assets', 'chars')
OUT = os.path.join(ROOT, 'assets', 'postcards')
SIZE, PIXELS = 512, 52
# src/ui/theme.ts CHARACTER_THEME와 같은 색(soft, main)
THEME = {
    'cat': ('#ECE8F8', '#B9B0DA'),
    'panda': ('#E3F5EA', '#9ED9B5'),
    'rabbit': ('#FFE8EE', '#FFB3C7'),
    'shiba': ('#FFF0E0', '#FFC48F'),
    'duck': ('#FFF9DC', '#FFE27A'),
}
os.makedirs(OUT, exist_ok=True)
for name, (soft, main) in THEME.items():
    im = Image.new('RGBA', (SIZE, SIZE), soft)
    d = ImageDraw.Draw(im)
    step = SIZE // 8
    for y in range(8):
        for x in range(8):
            if (x + y) % 2 == 0:
                d.rectangle([x * step, y * step, (x + 1) * step, (y + 1) * step], fill=main + '55')
    # 반짝이
    for (sx, sy) in [(0.12, 0.15), (0.85, 0.2), (0.2, 0.82), (0.82, 0.78), (0.5, 0.08)]:
        cx, cy, r = sx * SIZE, sy * SIZE, SIZE * 0.025
        d.polygon([(cx, cy - r * 2), (cx + r * 0.6, cy), (cx, cy + r * 2), (cx - r * 0.6, cy)], fill='#FFFFFF')
        d.polygon([(cx - r * 2, cy), (cx, cy + r * 0.6), (cx + r * 2, cy), (cx, cy - r * 0.6)], fill='#FFFFFF')
    char = Image.open(os.path.join(CH, f'{name}_head.png')).convert('RGBA')
    char = char.crop(char.getbbox())
    h = int(SIZE * 0.72)
    w = int(char.size[0] * h / char.size[1])
    if w > SIZE * 0.85:
        w = int(SIZE * 0.85)
        h = int(char.size[1] * w / char.size[0])
    char = char.resize((w, h), Image.LANCZOS)
    im.alpha_composite(char, ((SIZE - w) // 2, (SIZE - h) // 2 + int(SIZE * 0.04)))
    pixel = im.convert('RGB').resize((PIXELS, PIXELS), Image.LANCZOS)
    pixel.resize((SIZE, SIZE), Image.NEAREST).save(os.path.join(OUT, f'{name}.png'), optimize=True)
    print(name)

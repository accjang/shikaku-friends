# 앱 아이콘·안드로이드 적응형 아이콘·스플래시를 assets/brand/에 만든다(캐릭터 렌더 assets/chars/ 사용).
# 실행: python3 tools/gen_brand.py
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), '..')
CH = os.path.join(ROOT, 'assets', 'chars')
OUT = os.path.join(ROOT, 'assets', 'brand')
os.makedirs(OUT, exist_ok=True)

BG = (255, 241, 226)        # 크림(src/ui/theme.ts colors.bg와 맞춤)
INK = (75, 63, 107)
RECTS = [  # 3×3 판을 나눈 모양(x, y, w, h, 색)
    (0, 0, 2, 1, (255, 196, 214)),
    (2, 0, 1, 2, (191, 215, 255)),
    (0, 1, 1, 2, (184, 230, 201)),
    (1, 1, 1, 1, (255, 224, 163)),
    (1, 2, 2, 1, (217, 200, 255)),
]
FONT = None
for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']:
    if os.path.exists(f):
        FONT = f

def board(size, pad_ratio=0.16, numbers=True):
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    pad = int(size * pad_ratio)
    cell = (size - 2 * pad) / 3
    gap = cell * 0.08
    for x, y, w, h, col in RECTS:
        box = [pad + x * cell + gap, pad + y * cell + gap, pad + (x + w) * cell - gap, pad + (y + h) * cell - gap]
        d.rounded_rectangle(box, radius=cell * 0.22, fill=col + (255,))
        if numbers and FONT:
            f = ImageFont.truetype(FONT, int(cell * 0.42))
            cx, cy = pad + (x + 0.5) * cell, pad + (y + 0.5) * cell
            d.text((cx, cy), str(w * h), font=f, fill=INK + (255,), anchor='mm')
    return im

def paste_char(base, name, height_ratio, cx_ratio, bottom_ratio):
    ch = Image.open(os.path.join(CH, name))
    ch = ch.crop(ch.getbbox())
    s = base.size[0]
    h = int(s * height_ratio)
    w = int(ch.size[0] * h / ch.size[1])
    ch = ch.resize((w, h), Image.LANCZOS)
    base.alpha_composite(ch, (int(s * cx_ratio - w / 2), int(s * bottom_ratio - h)))

# 아이콘(iOS: 투명 없음 1024)
icon = Image.new('RGBA', (1024, 1024), BG + (255,))
icon.alpha_composite(board(1024, 0.13), (0, -70))
paste_char(icon, 'panda_head.png', 0.42, 0.5, 1.1)
icon.convert('RGB').save(os.path.join(OUT, 'icon.png'))

# 안드로이드 적응형: 전경(안전 영역 66% 안), 배경색은 app.json
fg = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
inner = board(1024, 0.26)
fg.alpha_composite(inner, (0, -50))
paste_char(fg, 'panda_head.png', 0.27, 0.5, 0.86)
fg.save(os.path.join(OUT, 'adaptive-icon.png'))

# 스플래시(가운데 그림만, 배경색은 app.json)
sp = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
# 뒤줄: 고양이·판다·토끼, 앞줄: 오리·시바(조금 작게 앞에)
for name, h, cx, bottom in [('cat_q.png', 0.4, 0.27, 0.72), ('panda_front.png', 0.46, 0.5, 0.7), ('rabbit_ql.png', 0.4, 0.73, 0.72),
                            ('duck_q.png', 0.27, 0.35, 0.86), ('shiba_ql.png', 0.33, 0.65, 0.88)]:
    paste_char(sp, name, h, cx, bottom)
sp.save(os.path.join(OUT, 'splash.png'))
Image.open(os.path.join(OUT, 'icon.png')).resize((48, 48), Image.LANCZOS).save(os.path.join(OUT, 'favicon.png'))
print('ok')

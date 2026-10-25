# tools/out_anims/*.png → assets/anims/ (같은 동작의 프레임은 같은 상자로 잘라 흔들리지 않게) + src/ui/sprites.ts 생성.
import glob, os, re
from collections import defaultdict
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'assets', 'anims')
PX = 192
os.makedirs(OUT, exist_ok=True)
for f in glob.glob(os.path.join(OUT, '*.png')):
    os.remove(f)

groups = defaultdict(list)
for f in sorted(glob.glob(os.path.join(ROOT, 'tools', 'out_anims', '*.png'))):
    m = re.match(r'(\w+?)_(\w+)_(\d+)\.png$', os.path.basename(f))
    groups[(m.group(1), m.group(2))].append(f)

for (name, anim), files in sorted(groups.items()):
    ims = [Image.open(f) for f in files]
    boxes = [im.getbbox() for im in ims]
    box = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
    for i, im in enumerate(ims):
        im = im.crop(box)
        w, h = im.size
        s = max(w, h)
        c = Image.new('RGBA', (s, s), (0, 0, 0, 0))
        c.paste(im, ((s - w) // 2, s - h))
        c.resize((PX, PX), Image.LANCZOS).save(os.path.join(OUT, f'{name}_{anim}_{i:02d}.png'), optimize=True)

lines = ['// 자동 생성(tools/crop_anims.py) — 손으로 고치지 않는다. 캐릭터 움직임 프레임.',
         "import type { ImageSourcePropType } from 'react-native';",
         '',
         "import type { CharacterId } from '@/core/chapters';",
         '',
         "export type AnimName = 'idle' | 'cheer';",
         '',
         'export const SPRITES: Partial<Record<CharacterId, Record<AnimName, ImageSourcePropType[]>>> = {']
for name in sorted({k[0] for k in groups}):
    lines.append(f'  {name}: {{')
    for anim in ('idle', 'cheer'):
        files = sorted(glob.glob(os.path.join(OUT, f'{name}_{anim}_*.png')))
        lines.append(f'    {anim}: [')
        for f in files:
            lines.append(f"      require('../../assets/anims/{os.path.basename(f)}'),")
        lines.append('    ],')
    lines.append('  },')
lines.append('};')
open(os.path.join(ROOT, 'src', 'ui', 'sprites.ts'), 'w').write('\n'.join(lines) + '\n')
print(len(glob.glob(os.path.join(OUT, '*.png'))), 'frames')

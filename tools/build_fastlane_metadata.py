# App Store Connect에 올릴 문구·스크린샷을 fastlane(deliver)이 읽는 폴더로 만든다. 실행: python3 tools/build_fastlane_metadata.py
# 입력: docs/store/listing/<코드>.md(title·subtitle·keywords·description), docs/store/art/<코드>/ios-1~5.jpg
# 결과(생성물, git에 올리지 않음): fastlane/metadata/<App Store 언어>/*.txt, fastlane/screenshots/<App Store 언어>/*.jpg
# 올리기: bundle 없이 `fastlane ios store_text`(문구만) 또는 `fastlane ios store_all`(문구+스크린샷) — fastlane/Fastfile, docs/store/asc-setup.md 9장.
import os
import re
import shutil

ROOT = os.path.join(os.path.dirname(__file__), '..')
LISTING = os.path.join(ROOT, 'docs', 'store', 'listing')
ART = os.path.join(ROOT, 'docs', 'store', 'art')
META = os.path.join(ROOT, 'fastlane', 'metadata')
SHOTS = os.path.join(ROOT, 'fastlane', 'screenshots')
PRIVACY_URL = 'https://accjang.github.io/shikaku-privacy/'
SUPPORT_URL = 'https://accjang.github.io/shikaku-privacy/support/'
COPYRIGHT = '2026 CHUNGLIMJUNGWON Co.,Ltd.'
# 앱 언어 코드 → App Store Connect 언어 코드(fastlane ALL_LANGUAGES). 필리핀어(fil)·스와힐리어(sw)는 App Store에 없어 뺀다(그 나라에는 영어가 보인다).
LOCALES = {
    'ko': 'ko', 'en': 'en-US', 'ja': 'ja', 'zh': 'zh-Hans', 'zh-Hant': 'zh-Hant', 'es': 'es-MX', 'pt': 'pt-BR', 'fr': 'fr-FR',
    'id': 'id', 'ms': 'ms', 'th': 'th', 'vi': 'vi', 'hi': 'hi', 'bn': 'bn-BD', 'ta': 'ta-IN', 'te': 'te-IN', 'mr': 'mr-IN',
    'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN', 'pa': 'pa-IN', 'ur': 'ur-PK', 'ar': 'ar-SA', 'he': 'he', 'tr': 'tr', 'uk': 'uk',
}
# App Store 글자 수 한도
LIMITS = {'name': 30, 'subtitle': 30, 'keywords': 100, 'description': 4000}


def parse(code):
    text = open(os.path.join(LISTING, f'{code}.md'), encoding='utf-8').read()

    def field(name):
        m = re.search(rf'^- {name}: (.*)$', text, re.M)
        if not m:
            raise SystemExit(f'{code}: {name} 없음')
        return m.group(1).strip()

    desc = text.split('## description', 1)[1].strip()
    return {'name': field('title'), 'subtitle': field('subtitle'), 'keywords': field('keywords'), 'description': desc}


def write(folder, name, value):
    with open(os.path.join(folder, f'{name}.txt'), 'w', encoding='utf-8') as f:
        f.write(value + '\n')


for d in (META, SHOTS):
    shutil.rmtree(d, ignore_errors=True)
    os.makedirs(d)
write(META, 'copyright', COPYRIGHT)
problems = []
for code, asc in LOCALES.items():
    data = parse(code)
    for key, limit in LIMITS.items():
        if len(data[key]) > limit:
            problems.append(f'{code} {key} {len(data[key])}자 > {limit}자')
    folder = os.path.join(META, asc)
    os.makedirs(folder)
    for key, value in data.items():
        write(folder, key, value)
    write(folder, 'privacy_url', PRIVACY_URL)
    write(folder, 'support_url', SUPPORT_URL)
    shots = os.path.join(SHOTS, asc)
    os.makedirs(shots)
    for i in range(1, 6):
        src = os.path.join(ART, code, f'ios-{i}.jpg')
        if not os.path.exists(src):
            problems.append(f'{code} 스크린샷 ios-{i}.jpg 없음(npm run store:art)')
            continue
        shutil.copyfile(src, os.path.join(shots, f'{i}.jpg'))
if problems:
    raise SystemExit('문제:\n' + '\n'.join(' - ' + p for p in problems))
print(f'{len(LOCALES)}개 언어 → fastlane/metadata, fastlane/screenshots')

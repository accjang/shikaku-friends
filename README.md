# 시카쿠 프렌즈 (Shikaku Friends)

숫자만큼 네모를 그리는 퍼즐 게임 **시카쿠**를, 술래잡기 게임의 고양이·판다·토끼·시바·오리 친구들과 함께 푸는 모바일 앱.
렐로(relo-app)와 같은 스택: **Expo(React Native) + TypeScript + expo-router + zustand**, 광고는 **AdMob**, 결제는 **RevenueCat**.
App Store와 Google Play에 같은 코드로 낸다.

## 게임
- 규칙: 판을 직사각형으로 나눈다. 직사각형마다 숫자가 하나, 숫자 = 그 직사각형의 칸 수.
- 조작: 칸을 드래그해 네모 그리기(드래그 중 `3×2=6`처럼 크기 표시, 맞으면 초록) · 네모를 탭하면 지우기 · 되돌리기 · 처음부터 · 힌트.
- 챕터 5개 × 40스테이지 = **200스테이지**(모두 답이 하나뿐인지 검증됨)
  - 1장 냥이의 방(5×5 → 7×8) · 2장 판다의 대나무숲(8×8 → 9×9) · 3장 토끼의 당근밭(9×10 → 10×11) · 4장 시바의 산책길(10×11 → 10×12) · 5장 오리의 연못(10×12 → 10×14)
  - 스테이지마다 후보 12개를 만들어 풀이기 갈림길 수(난이도)로 줄 세우고, 챕터 안에서 점점 어려운 후보를 고른다.
  - 앞 챕터에서 25개를 깨면 다음 챕터가 열린다. 별 3개 = 힌트 없이, 2개 = 힌트 1번, 1개 = 그 이상.
- **오늘의 퍼즐**: 날짜로 정해진 8×8 퍼즐(전 세계 같은 퍼즐), 하루 첫 클리어에 힌트 +1, 연속 일수 표시.
- 캐릭터: 챕터마다 안내하는 친구가 달라지고, 네모를 맞게 놓으면 통통 튀고 틀리면 고개를 젓는다(냥이 츤데레·판다 느긋·토끼 발랄·시바 의젓한 응원단장·오리 엉뚱 덜렁).
- **마을 꾸미기**: 스테이지 10개를 깰 때마다 술래잡기 게임 소품(꽃밭·깃발 줄·벤치·우물·버드나무…)을 하나씩 얻어 친구들 마을에 놓인다. 200스테이지면 20개, 마지막은 친구들의 집. 못 얻은 소품은 흐린 그림자로 보이고, 친구는 챕터가 열리면 마을에 온다. 홈에 "다음 소품까지 N스테이지" 카드.
- **자랑하기(공유)**: 오늘의 퍼즐은 Wordle처럼 번호·시간·힌트·연속 일수(정답 모양 없음), 스테이지는 별·시간을 문구로 공유한다.
- **클리어 연출**: 네모들이 차례로 통통 튀고, 색종이가 터지고, 별 풍선이 떠올라 "뻥" 터진 뒤 결과 창(캐릭터 기뻐하는 자세, 새 소품이면 소품 그림).
- 첫 실행 튜토리얼(규칙 + 4×4 연습 판), 효과음·진동, 한국어·영어·일본어·중국어(간체).

## 수익 모델(2026-10-25 확정)
- 무료 + 광고: 처음 5번 클리어까지는 광고 없음 → 이후 3번 클리어마다 "다음"을 누를 때 전면 광고(최소 3분 간격).
- 힌트가 떨어지면 **보상형 광고**를 보고 힌트 2개(사용자가 고를 때만). 광고 제거를 사도 그대로 쓸 수 있다.
- **광고 제거** 1회 구매(비소모성, **₩1,900 / US$1.99**): 전면 광고 없음 + 힌트 10개. 구매 복원 지원.
- 사는 곳: 설정 화면, 힌트가 떨어졌을 때 팝업, 그리고 전면 광고를 2번 이상 본 사람에게 클리어 창 아래 작은 버튼(하루 한 번).
- 숫자는 전부 `src/core/config.ts`에서 바꾼다.

## 실행
```bash
cd shikaku
npm install
npx expo start              # Expo Go로 빠르게 보기(광고·결제 없이 동작)
npx expo run:ios            # 개발 빌드(광고·결제 모듈 포함, Xcode 필요)
npx expo run:android        # 개발 빌드(Android Studio·에뮬레이터 필요)
npm test && npm run typecheck && npm run lint
```
개발 빌드에서는 구글 **테스트 광고**와 **가상 결제**가 나온다(진짜 돈이 나가지 않는다).

## 폴더
```
app/                 화면(expo-router): index 홈, stages, play/[id], tutorial, settings
src/core/            UI 없는 로직(전부 Jest 테스트): 규칙·풀이기·생성기·진행·광고 빈도·문구
src/data/            저장(AsyncStorage)·광고(AdMob)·결제(RevenueCat)
src/ui/              판(Board)·캐릭터(Mascot)·버튼·팝업·테마
content/levels.json  미리 만든 200스테이지(tools/gen_levels.ts 생성물, 손으로 고치지 않음)
assets/chars/        캐릭터 이미지(술래잡기 3D 모델 렌더), assets/brand/ 아이콘·스플래시, assets/sounds/ 효과음
assets/source/models 원본 3D 모델(cat·panda·rabbit은 accjang/taggame-assets, shiba·duck은 Higgsfield 2026-10-11 생성분), rigged/ 자세용 리깅 모델(Higgsfield 3D rigging)
assets/source/props  마을 소품 원본 3D 모델(술래잡기 소품, Higgsfield Tripo) → assets/props/ PNG
tools/               생성 스크립트(스테이지·캐릭터 렌더·아이콘·효과음)
docs/                출시 절차(RELEASE.md), 스토어 문구·개인정보처리방침(store/)
```

## 생성 스크립트
| 무엇 | 명령 |
|---|---|
| 스테이지 200개 | `npx tsx tools/gen_levels.ts` (출시 뒤에는 바꾸지 말 것 — 사용자 기록이 어긋난다) |
| 캐릭터 이미지 | `NODE_PATH=$(npm root -g) npm run render:chars && python3 tools/crop_chars.py` (자세는 `tools/char_poses.json` — 리깅 모델의 애니메이션 한 장면) |
| 마을 소품 | `NODE_PATH=$(npm root -g) npm run render:props && python3 tools/crop_props.py` |
| 아이콘·스플래시 | `python3 tools/gen_brand.py` |
| 효과음 | `python3 tools/gen_sounds.py` |

## 출시
[docs/RELEASE.md](docs/RELEASE.md)에 계정 준비부터 심사 제출까지 순서대로 정리했다.

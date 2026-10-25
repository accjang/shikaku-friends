# 시카쿠 프렌즈 (Shikaku Friends)

숫자만큼 네모를 그리는 퍼즐 게임 **시카쿠**를, 술래잡기 게임의 고양이·판다·토끼 친구들과 함께 푸는 모바일 앱.
렐로(relo-app)와 같은 스택: **Expo(React Native) + TypeScript + expo-router + zustand**, 광고는 **AdMob**. 앱 안 결제는 없다.
App Store와 Google Play에 같은 코드로 낸다.

## 게임
- 규칙: 판을 직사각형으로 나눈다. 직사각형마다 숫자가 하나, 숫자 = 그 직사각형의 칸 수.
- 조작: 칸을 드래그해 네모 그리기(드래그 중 `3×2=6`처럼 크기 표시, 맞으면 초록) · 네모를 탭하면 지우기 · 되돌리기 · 처음부터 · 힌트.
- 챕터 3개 × 30스테이지 = **90스테이지**(모두 답이 하나뿐인지 검증됨)
  - 1장 냥이의 방(5×5 → 7×8) · 2장 판다의 대나무숲(8×8 → 9×10) · 3장 토끼의 당근밭(10×10 → 10×12)
  - 앞 챕터에서 20개를 깨면 다음 챕터가 열린다. 별 3개 = 힌트 없이, 2개 = 힌트 1번, 1개 = 그 이상.
- **오늘의 퍼즐**: 날짜로 정해진 8×8 퍼즐(전 세계 같은 퍼즐), 하루 첫 클리어에 힌트 +1, 연속 일수 표시.
- 캐릭터: 챕터마다 안내하는 친구가 달라지고, 네모를 맞게 놓으면 통통 튀고 틀리면 고개를 젓는다(냥이 츤데레·판다 느긋·토끼 발랄).
- 첫 실행 튜토리얼(규칙 + 4×4 연습 판), 효과음·진동, 한국어·영어·일본어·중국어(간체).

## 수익 모델: 완전 무료 + 광고(2026-10-25 결정)
- 앱 안 결제(광고 제거 등)는 없다. 수익은 AdMob 광고만.
- 전면 광고: 처음 5번 클리어까지는 없음 → 이후 3번 클리어마다 "다음"을 누를 때(최소 3분 간격).
- 보상형 광고: 힌트가 떨어지면 사용자가 골라서 보고 힌트 2개.
- 숫자는 전부 `src/core/config.ts`에서 바꾼다.

## 실행
```bash
cd shikaku
npm install
npx expo start              # Expo Go로 빠르게 보기(광고 없이 동작)
npx expo run:ios            # 개발 빌드(광고 모듈 포함, Xcode 필요)
npx expo run:android        # 개발 빌드(Android Studio·에뮬레이터 필요)
npm test && npm run typecheck && npm run lint
```
개발 빌드에서는 구글 **테스트 광고**가 나온다.

## 폴더
```
app/                 화면(expo-router): index 홈, stages, play/[id], tutorial, settings
src/core/            UI 없는 로직(전부 Jest 테스트): 규칙·풀이기·생성기·진행·광고 빈도·문구
src/data/            저장(AsyncStorage)·광고(AdMob)
src/ui/              판(Board)·캐릭터(Mascot)·버튼·팝업·테마
content/levels.json  미리 만든 90스테이지(tools/gen_levels.ts 생성물, 손으로 고치지 않음)
assets/chars/        캐릭터 이미지(술래잡기 3D 모델 렌더), assets/brand/ 아이콘·스플래시, assets/sounds/ 효과음
assets/source/models 원본 3D 모델(accjang/taggame-assets의 cat·panda·rabbit.glb)
tools/               생성 스크립트(스테이지·캐릭터 렌더·아이콘·효과음)
docs/                출시 절차(RELEASE.md), 스토어 문구·개인정보처리방침(store/)
```

## 생성 스크립트
| 무엇 | 명령 |
|---|---|
| 스테이지 90개 | `npx tsx tools/gen_levels.ts` (출시 뒤에는 바꾸지 말 것 — 사용자 기록이 어긋난다) |
| 캐릭터 이미지 | `NODE_PATH=$(npm root -g) npm run render:chars && python3 tools/crop_chars.py` |
| 아이콘·스플래시 | `python3 tools/gen_brand.py` |
| 효과음 | `python3 tools/gen_sounds.py` |

## 출시
[docs/RELEASE.md](docs/RELEASE.md)에 계정 준비부터 심사 제출까지 순서대로 정리했다.

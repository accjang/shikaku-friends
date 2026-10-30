# 시카쿠 프렌즈 — Claude Code 작업 지침

## 프로젝트 개요
숫자만큼 직사각형을 그리는 논리 퍼즐 "시카쿠" 모바일 게임. 술래잡기 게임(accjang/taggame-assets)의 고양이·판다·토끼·시바·오리 3D 모델을 렌더한 이미지를 캐릭터로 쓴다.
App Store·Google Play 출시용. 스택: **Expo SDK 58(React Native 0.88) + TypeScript strict + expo-router + zustand + AsyncStorage**, 광고 AdMob, 결제 RevenueCat. 렐로(accjang/relo-app)와 같은 구성이지만 SDK는 58 — iOS 27 SDK(Xcode 27)로 빌드한 앱은 UIScene 생명주기가 필수라 57은 켜자마자 꺼진다(2026-10-30).
이름 "시카쿠 프렌즈"·번들 ID `app.shikakufriends.mobile` 확정, 수익은 무료+광고+광고 제거 1회 구매 ₩1,900/US$1.99(2026-10-25 사용자 결정).
게임 설명·수익 모델은 `README.md`, 출시 순서는 `docs/RELEASE.md`.

## 폴더 구조
```
app/            화면(expo-router)
src/core/       UI 없는 순수 로직: 규칙(puzzle)·풀이기(solver)·생성기(generator)·한 판 진행(game)·진행 기록(progress)·광고 빈도(adPolicy)·문구(i18n). 전부 테스트 대상
src/data/       저장소·광고·결제(SDK 연결은 여기서만, 실패는 조용히)
src/ui/         공용 컴포넌트·테마
content/        levels.json(생성물), infoplist/(iOS 현지화 이름·권한 문구)
assets/         chars/(캐릭터 렌더) brand/(아이콘·스플래시) sounds/(합성 효과음) source/models/(원본 GLB)
tools/          생성 스크립트
tests/          Jest 테스트
```

## 코딩 규칙
- TypeScript strict. 매직넘버 금지: 횟수·시간·가격·ID는 `src/core/config.ts` 상수로.
- 로직은 `src/core/`에 UI 없이 두고 Jest로 테스트한다. 화면은 로직을 호출만 한다.
- `content/levels.json`, `assets/chars/`, `assets/anims/`(+`src/ui/sprites.ts`), `assets/postcards/`, `assets/props/`, `assets/brand/`, `assets/sounds/`는 `tools/` 스크립트 생성물이다. 손으로 고치지 않는다.
- **출시 뒤에는 기존 스테이지를 다시 생성하지 않는다**(기록이 다른 퍼즐에 붙는다). 늘릴 때는 챕터를 추가한다.
- 문구는 언어마다 `src/core/locales/<코드>.ts`(28개, 기준은 ko.ts의 KO_UI). 키를 추가하면 28개 모두에 넣는다(빠지면 타입 오류·테스트 실패). 한 언어 검사: `npx tsx tools/check_locale.ts <코드>`.
- 광고·결제 키는 `.env`(EXPO_PUBLIC_*)로만. `process.env.EXPO_PUBLIC_이름`을 글자 그대로 써야 빌드 때 들어간다.
- 주석·커밋 메시지는 한국어, 식별자는 영어.
- 바꾼 뒤 `npm test && npm run typecheck && npm run lint` 전부 통과.

## 확인 방법
- 빠른 확인: `npx expo start` → Expo Go(광고·결제 없이 동작) 또는 `npx expo start --web`.
- 광고·결제까지: `npx expo run:ios` / `npx expo run:android`(개발 빌드, 테스트 광고·가상 결제).

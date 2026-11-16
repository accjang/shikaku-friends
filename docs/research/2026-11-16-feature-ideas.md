# 기능 아이디어 조사 (2026-11-16)

다른 퍼즐 앱·업계 자료를 웹으로 조사해 시카쿠 프렌즈에 넣을 만한 기능을 추렸다. 코드·그림을 가져오지 않고 장치만 참고한다.
조사 한계: 캐주얼 논리 퍼즐만 따로 다룬 2026년 공식 통계는 못 찾았고, 일반 모바일·퍼즐 장르 자료와 스토어 리뷰가 근거다. 수치는 2차 자료라 참고만.

## 조사에서 나온 것
- 다시 오게 하는 이유 1·2위는 연속 보상과 기간 한정 이벤트(설문 인용, 미검증). 1~3일짜리 짧은 이벤트가 효과적(Sensor Tower 라이브옵스 가이드).
- 연속 보상은 뒤로 갈수록 커지는 구조가 낫고, 7일째 큰 상자 같은 고비가 좋다 — 이미 7일 주기(+5)로 구현됨.
- 오늘의 퍼즐은 로그인·광고 없이 바로 들어가야 습관이 된다 — 이미 그렇게 돼 있음.
- 논리 퍼즐 리뷰의 불만 1위는 광고 과다. 그다음 힌트가 이유를 안 알려 줌, 큰 판에서 확대 안 됨, 다크 모드 없음·대비 낮음, 색각 지원 부족.
- 경쟁 노노그램 앱들의 공통 장치: 실수 시 목숨, 난이도별 큰 판, 정기 콘텐츠 추가, 계절 그래픽, 완성 그림 모아 보기.

## 후보 (효과·작업량은 추정)
| # | 기능 | 효과 | 작업량 | 메모 |
|---|---|---|---|---|
| 1 | 연속 기록 보호(하루 빠져도 주 1회 자동 유지) | 높음 | 작음 | 연속이 끊기면 이탈이 큼. 구매·광고 없이 무료로 |
| 2 | 지난 오늘의 퍼즐 달력(놓친 날 풀기, 달 도장) | 높음 | 중간 | 날짜 시드라 서버 없이 가능. 연속 일수에는 안 넣음 |
| 3 | 설명해 주는 힌트(왜 이 네모인지 한 줄) | 높음 | 중간 | 풀이기가 강제 수(후보 하나뿐인 숫자)를 찾으면 그 이유를 문장으로. 28개 언어 문구 필요 |
| 4 | 다크 모드 | 중간 | 중간 | 색이 theme.ts에 모여 있음. 파스텔 네모의 어두운 판 필요 |
| 5 | 엽서 앨범(클리어 그림 모아 보기) | 중간 | 작음~중간 | 지금은 캐릭터당 그림 1장 → 챕터마다 여러 장으로 늘리면 수집 요소 |
| 6 | 주말 이벤트 퍼즐(금~일 특별 판, 한정 소품) | 높음 | 큼 | 날짜 시드로 서버 없이. 한정 소품 그림 제작 필요 |
| 7 | 색각 보정(네모에 무늬·테두리) | 낮음~중간 | 작음 | 접근성. 설정 토글 |
| 8 | 오늘의 미션(3개: 힌트 없이 1판 등) | 중간 | 중간 | 업계 글은 "열게는 하지만 깊은 참여는 약함"으로 평가 |
| 9 | 큰 판 확대(핀치 줌) | 낮음 | 큼 | 최대 10×14라 지금은 필요성 낮음. 더 큰 판을 낼 때 |
| 10 | 알림(오늘의 퍼즐·연속 끊기기 전) | 높음 | 중간 | expo-notifications 네이티브 추가 → 재빌드. 권한 요청 시점 주의 |

## 추천 순서
1 → 2 → 3 (습관·만족에 직접, 서버 불필요) → 10 → 5 → 4. 광고는 지금 빈도(3판에 1번·첫 5판 없음)를 더 올리지 않는다.

## 출처
- https://gameindustrylibrary.com/documents/how-to-prepare-your-live-ops-for-the-holiday-season-2025/read
- https://gamegrowthadvisor.com/blog/2026-03-17-mobile-game-retention-strategies-2026/
- https://www.deconstructoroffun.com/blog/2024/9/23/daily-missions-in-puzzles-why-should-we-see-them-more-often
- https://www.deconstructoroffun.com/blog/2024/8/5/win-streak-the-gift-that-keeps-on-giving
- https://geekvibesnation.com/why-puzzle-games-keep-winning/
- https://peerpush.com/blog/how-we-fixed-a-one-and-done-problem-on-a-daily-puzzle-game
- https://apps.apple.com/us/app/nonogram-com-number-games/id1452992954
- https://apps.apple.com/us/app/id707706885
- https://appshunter.io/ios/app/622220631/reviews
- https://justuseapp.com/en/app/1530683853/sudoku-variants-by-logic-wiz/reviews

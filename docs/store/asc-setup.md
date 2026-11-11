# 시카쿠 프렌즈 — App Store Connect 입력 안내 (2026-11-11)

> Apple 조직 계정 전환이 승인된 뒤(2026-11-11 사용자) 그대로 따라 하는 순서와 값이다. 렐로 안내서(accjang/relo-app `docs/store/asc-setup.md`)와 같은 틀이고, 시카쿠에 맞춰 줄였다.
> 화면 이름은 한국어 App Store Connect 기준(괄호 안 영어). 실제 화면과 다르면 화면이 맞다. **결정 필요** = 사용자가 정할 것.
> 문구 출처: `docs/store/listing/<코드>.md`, 그림: `docs/store/art/`, 상품 ID·가격: `src/core/config.ts`.

## 0. 먼저 (계정 — 렐로와 공통, 한 번만)
1. **비즈니스(Business)** → 최신 계약 동의 → **유료 앱 계약(Paid Apps Agreement)** → 은행 계좌(법인 계좌) → 세금 양식(법인은 보통 **W-8BEN-E**, 한미 조세조약 칸). 계약이 "활성"이 돼야 인앱 구입 시험·판매가 된다.
2. 계약이 끝날 때까지 기다리지 않아도 1~4장(앱 만들기·정보·개인정보 설문·가격)은 할 수 있다.

## 1. 신규 앱 만들기 (앱 → + → 신규 앱)
| 칸 | 값 | 메모 |
|---|---|---|
| 플랫폼 | **iOS** | iPad 지원 없음(`supportsTablet: false`) |
| 이름 | `Shikaku Friends: Box Puzzle` | listing en 제목. 이미 누가 쓰면 거절 → `Shikaku Friends - Box Puzzle` 등으로 다시 |
| 기본 언어 | **영어(미국)** | 렐로와 같은 이유: 현지화가 없는 나라에는 기본 언어 페이지가 보인다 |
| 번들 ID | `app.shikakufriends.mobile` | 실기기 설치 때 Xcode 자동 서명으로 등록됐을 수 있다. 목록에 없으면 developer.apple.com → Certificates, Identifiers & Profiles → Identifiers → + 로 등록(기능 체크 없음) |
| SKU | `shikaku-friends-ios-001` | 만든 뒤 못 바꾼다 |
| 사용자 액세스 | 전체 액세스 | |

## 2. 앱 정보 (모든 버전 공통)
| 칸 | 값 |
|---|---|
| 이름·부제목(언어별) | 오른쪽 위 언어 메뉴에서 언어를 추가하며 `listing/<코드>.md`의 `title`·`subtitle`. 언어 코드 대응: zh=중국어(간체), zh-Hant=중국어(번체), es=스페인어(멕시코), pt=포르투갈어(브라질). App Store에 없는 언어(예: bn·te·mr·gu·kn·ml·pa·sw·fil·ur 일부)는 건너뛴다 — 그 나라에는 영어가 보인다 |
| 카테고리 | 기본 **게임**, 하위 **퍼즐**, 보조 **보드**(선택 — 비워도 됨) |
| 콘텐츠 권한 | **예**(타사 콘텐츠 포함, 권리 있음) — 광고가 타사 콘텐츠. 3D 캐릭터(Tripo·Meshy)·글꼴(Jua·Nunito OFL) 사용권은 출시 전 한 번 확인(`docs/RELEASE.md` 6장) |
| 개인정보 처리방침 URL | `https://accjang.github.io/shikaku-privacy/` (사이드바 "앱이 수집하는 개인정보" → 처리방침 옆 편집) |
| 연령 등급 | 아래 2-1 |

### 2-1. 연령 등급 설문
| 항목 | 답 |
|---|---|
| 자녀 보호 기능·연령 확인 | 아니요 |
| 제한 없는 웹 접근 | 아니요(처리방침 링크는 시스템 브라우저) |
| 사용자 생성 콘텐츠·소셜 미디어·메시지 | 아니요("결과 자랑하기"는 기기 공유 창일 뿐) |
| **광고** | **예** |
| 성숙한 주제·의료·성적 내용·폭력 | 모두 없음 |
| 도박·모의 도박·경품·루트박스 | 없음/아니요(소품은 클리어 보상, 확률 없음) |
| 어린이용(Made for Kids) | **선택 안 함**(제3자 광고·추적 때문 — `RELEASE.md` 6장) |

예상 결과 **4+**. App Store Connect가 계산한 값을 그대로 둔다.

## 3. 앱이 수집하는 개인정보 (App Privacy)
"예, 데이터를 수집합니다" → 아래 유형 체크 → 유형마다 **용도 / 사용자와 연결 / 추적** 답. 근거는 처리방침 4·5항(AdMob·RevenueCat).

| 데이터 유형 | 용도 | 연결 | 추적 | 어디서 |
|---|---|---|---|---|
| 식별자 > 기기 ID | 제3자 광고, 분석 | 예 | **예** | AdMob(IDFA는 ATT 허용 때만) |
| 식별자 > 사용자 ID | 앱 기능 | 예 | 아니요 | RevenueCat 무작위 App User ID |
| 구입 항목 > 구입 기록 | 앱 기능 | 예 | 아니요 | RevenueCat |
| 위치 > 대략적인 위치 | 제3자 광고, 분석 | 예 | **예** | AdMob(IP 추정) |
| 사용 데이터 > 광고 데이터 | 제3자 광고, 분석 | 예 | **예** | AdMob |
| 사용 데이터 > 제품 상호작용 | 제3자 광고, 분석 | 예 | **예** | AdMob |
| 진단 > 성능 데이터 | 제3자 광고, 분석 | 예 | 아니요 | AdMob |
| 진단 > 충돌 데이터 | 분석, 제3자 광고 | 아니요 | 아니요 | AdMob |
| 그 밖(연락처·사진·건강·정밀 위치·사용자 콘텐츠 등) | 체크 안 함 | | | 게임 진행은 기기 안에만 |

"추적 예"가 있으니 ATT 창이 필요하다 — 이미 구현됨(튜토리얼 뒤 첫 광고 준비 때). 저장 → **게시**.

## 4. 가격 및 사용 가능 여부
- 앱 가격 **무료**.
- 사용 가능 여부 → 모두 선택 후 **해제**: 중국 본토, EU 27개국(오스트리아·벨기에·불가리아·크로아티아·키프로스·체코·덴마크·에스토니아·핀란드·프랑스·독일·그리스·헝가리·아일랜드·이탈리아·라트비아·리투아니아·룩셈부르크·몰타·네덜란드·폴란드·포르투갈·루마니아·슬로바키아·슬로베니아·스페인·스웨덴), 아이슬란드·노르웨이·리히텐슈타인(목록에 있으면), 영국. 스위스·홍콩·마카오·대만은 둔다.
- "앞으로 추가되는 국가 자동 포함" **해제**.
- DSA 판매자(trader) 상태를 물으면 "EU에 배포하지 않음"에 가까운 항목(렐로와 같게).

## 5. 앱 내 구입 — 광고 제거 (수익화 → 앱 내 구입 → +)
| 칸 | 값 |
|---|---|
| 유형 | **비소모품** (Non-Consumable) |
| 참조 이름 | `Remove Ads` |
| 제품 ID | `shikaku_remove_ads` (앱 코드 `PRODUCT_IDS.adFree`와 정확히 같게) |
| 가격 | 기준 나라 대한민국 **₩1,900**, 미국 **$1.99**로 맞춤(가격 단계에 ₩1,900이 없으면 가장 가까운 값 → 알려 주기) |
| 사용 가능 여부 | 4장과 같은 나라 제외 |
| 가족 공유 | 끔 |
| 현지화 ko | 표시 이름 `광고 제거` / 설명 `광고를 없애고 힌트 10개를 받아요` |
| 현지화 en | 표시 이름 `Remove Ads` / 설명 `No more ads, plus 10 hints` |
| 현지화 ja | `広告削除` / `広告をなくしてヒント10個もらえる` |
| 심사 스크린샷 | 앱 설정 화면의 "광고 제거" 줄 캡처(실기기에서 찍기) |
| 심사 메모 | `Settings → Remove Ads. Non-consumable; also grants 10 hints once. Restore: Settings → Restore purchases.` |

**첫 인앱 구입은 1.0 버전과 함께 제출**: 버전 페이지의 "앱 내 구입 및 구독" 칸에서 이 상품을 추가.

## 6. RevenueCat 연결 (계약 활성 뒤)
1. App Store Connect → 사용자 및 액세스 → 통합 → **인앱 구입** 키 생성(.p8 내려받기 — 한 번만 받을 수 있음). 렐로용으로 이미 만든 키가 있으면 그대로 써도 된다(팀 단위).
2. RevenueCat → `Shikaku Friends` 프로젝트 → App Store 앱 설정 → .p8·Key ID·Issuer ID 올리기.
3. Products의 `shikaku_remove_ads`가 "찾을 수 없음"에서 정상으로 바뀌는지 확인.
4. **공개 키 `appl_…`를 Claude에게 알려 주기** → `.env`의 `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS`.
5. 샌드박스 계정(사용자 및 액세스 → 샌드박스)으로 실기기에서 구매·복원 시험.

## 7. 버전 1.0 페이지
| 칸 | 값 |
|---|---|
| 스크린샷 6.9" | `docs/store/art/<코드>/ios-1~5.jpg`(1320×2868), 언어별 현지화 페이지마다 |
| 프로모션 텍스트 | 비워도 됨(선택) |
| 설명·키워드 | `listing/<코드>.md`의 description·keywords |
| 지원 URL | `https://accjang.github.io/shikaku-privacy/support/` |
| 마케팅 URL | 비움 |
| 저작권 | `© 2026 CHUNGLIMJUNGWON Co.,Ltd.` |
| 빌드 | 3장 빌드 업로드 뒤 선택(`docs/RELEASE.md` 3장, Xcode Archive 또는 EAS) |
| 앱 심사 정보 | 로그인 필요 없음. 연락처는 대표 정보. 메모: 아래 |

심사 메모(영어):
```
No account or login is needed. The game works offline.
Ads: AdMob full-screen ads appear after the first few cleared stages, when tapping "Next".
Rewarded ads are optional (get hints, or continue after using up 3 mistakes in a stage).
In-app purchase "Remove Ads" (non-consumable): Settings → Remove Ads. It also grants 10 hints once.
It can also be bought from the "out of hints" popup. Restore: Settings → Restore purchases.
App Tracking Transparency prompt appears before the first ad is loaded, after the tutorial.
```

## 8. 순서 요약
계약·세금·계좌(0) → 앱 만들기(1) → 앱 정보·연령(2) → 개인정보 설문(3) → 가격·국가(4) → 인앱 상품(5) → RevenueCat 키(6) → AdMob 실제 ID와 함께 Release 빌드 업로드 → TestFlight 확인 → 버전 페이지(7) → 심사 제출.

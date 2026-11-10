# 출시 절차 (App Store · Google Play)

코드 쪽 준비(광고·결제 연결, 아이콘·스플래시, 다국어, 개인정보 문구)는 끝나 있다. 아래는 **계정·콘솔에서 사람이 해야 하는 일**과 빌드 순서다.
계정은 렐로(accjang/relo-app)와 같은 회사 계정을 쓴다.

## 0. 확정된 것
- 앱 이름: "시카쿠 프렌즈" / "Shikaku Friends", 번들 ID `app.shikakufriends.mobile`(스토어에 한 번 올리면 못 바꾼다) — 2026-10-25
- 광고 제거 가격: **US$1.99 / ₩1,900**(가격표에 ₩1,900이 없으면 $1.99에 가장 가까운 원화 값) — 2026-10-25
- 운영 주체: **주식회사 청림정원(`CHUNGLIMJUNGWON Co.,Ltd.`** — D&B 표기, 쉼표 뒤 띄어쓰기 없음), D-U-N-S 697129275 — 렐로와 같음
- 문의 메일 `gpawod2@gmail.com`(2026-11-10), 처리방침 https://accjang.github.io/relo-privacy/shikaku/ , 지원 URL https://accjang.github.io/relo-privacy/shikaku/support/ (원본 `tools/build_privacy_site.py`, `docs/store/privacy-policy.md`)
- 출시 국가: 렐로와 같게 **중국 본토, EU 27개국·EEA·영국 제외**(28개 언어도 이 시장 기준)
- 스토어 그림: `docs/store/art/`(`npm run store:art`)

## 계정 현황(2026-11-10, 렐로 세션 기록 기준)
| 계정 | 상태 | 시카쿠에 필요한 것 |
|---|---|---|
| Apple Developer | 개인 멤버십(팀 `MGRS7K5M43`) → **조직 계정 전환 신청함, Apple 승인 대기** | 승인 뒤 유료 앱 계약·세금(W-8BEN-E)·계좌 → 앱 등록·인앱 상품(5장, 2장) |
| AdMob | 회사 계정 가입 완료(게시자 `pub-3027332696680312`), 렐로 iOS 앱만 있음 | 시카쿠 앱 2개(iOS·Android)·광고 단위 4개 추가(1장) |
| RevenueCat | 회사 계정·렐로 프로젝트 완료 | 시카쿠 프로젝트·`ad_free` 권한·상품 추가(2장) |
| Google Play Console | **없음**(렐로는 iOS만) | 조직 계정으로 새로 가입(4장) |

## 1. AdMob (지금 가능)
렐로와 같은 AdMob 계정에 앱을 추가한다(새 계정 만들지 않는다).
1. **앱 → 앱 추가** → 플랫폼 **iOS** → "스토어에 등록돼 있나요?" **아니요** → 앱 이름 `Shikaku Friends`. 같은 방법으로 **Android** 앱도 하나 더.
2. 앱마다 광고 단위 2개(이름 예: `Shikaku iOS interstitial`, `Shikaku iOS rewarded`):
   - **전면 광고(Interstitial)**, **보상형(Rewarded)**. "파트너 입찰" 체크·고급 설정은 건드리지 않는다(빈도는 앱 코드가 정한다).
   - 보상형의 보상 설정은 기본값(1, Reward) 그대로 — 실제 보상(힌트 2개·하트 1개)은 앱이 준다.
3. **앱 ID 2개(`ca-app-pub-…~…`)와 광고 단위 ID 4개(`ca-app-pub-…/…`)를 Claude에게 알려 준다**(비밀 아님). 앱 ID는 `app.json`(`react-native-google-mobile-ads`의 `iosAppId`·`androidAppId`, 지금은 구글 테스트 ID), 광고 단위는 `.env`(`.env.example`)에 넣는다. 개발 빌드는 계속 테스트 광고만 나온다.
4. 개인정보 보호 및 메시지: 유럽을 출시에서 뺐으니 GDPR 메시지는 건너뛰어도 된다. **IDFA 안내 메시지(iOS)**는 선택(코드가 ATT 창을 직접 띄운다).
5. 앱이 공개되면 AdMob에서 스토어와 연결하고, `app-ads.txt`를 개발자 웹사이트에 올린다(AdMob 안내. 웹사이트는 스토어에 적은 마케팅/개발자 URL과 같은 도메인이어야 한다 — 그때 정한다).

## 2. 결제(RevenueCat + 스토어 상품)
**지금 가능(RevenueCat):**
1. RevenueCat → 왼쪽 위 프로젝트 목록 → **+ New project** `Shikaku Friends`(렐로 프로젝트와 섞지 않는다 — 고객·상품이 따로 관리됨).
2. **Apps & providers → App Store** 앱 추가: 이름 `Shikaku Friends`, Bundle ID `app.shikakufriends.mobile`. 인앱 결제 키(.p8) 칸은 **비워 둔다**(Apple 조직 전환 뒤).
   추천 화면("Pro", `monthly`·`lifetime` 기본값)이 나오면 **Go to dashboard**로 건너뛴다.
3. **Product catalog → Entitlements → + New**: Identifier `ad_free`(밑줄, 소문자), Description `Remove ads`.
4. **Products → + New**: 앱 Shikaku Friends(App Store), Identifier `shikaku_remove_ads`, 종류 Non-consumable → `ad_free`에 **Attach**. "스토어에 없음" 경고는 무시. Offerings는 만들지 않아도 된다(앱이 상품 ID로 직접 부른다).
5. 공개 키(`appl_…`)는 **App Store에 상품이 생긴 뒤에** 알려 준다(먼저 넣으면 개발 빌드가 가상 결제에서 실제 결제로 바뀌어 버튼이 비어 보인다).

**Apple 조직 전환 뒤:**
6. App Store Connect → 앱 → 수익화 → 앱 내 구입 → **비소모품** `shikaku_remove_ads`(참조 이름 `Remove Ads`, 가격 ₩1,900 / US$1.99, 가족 공유 끔, 현지화 ko "광고 제거"·en "Remove Ads", 심사용 스크린샷은 설정 화면 캡처). 첫 인앱 상품은 1.0 버전과 함께 심사에 추가.
7. App Store Connect → 사용자 및 액세스 → 통합 → **인앱 구입 키** 생성(.p8) → RevenueCat 앱 설정에 올린다(렐로에서 만든 키를 같이 써도 된다 — 키는 팀 단위).

**Google Play(4장에서 계정을 만든 뒤):**
8. Play Console → 수익 창출 → 인앱 상품 → 같은 ID `shikaku_remove_ads` 생성·활성화(먼저 결제 권한이 있는 빌드를 내부 테스트에 한 번 올려야 만들 수 있다).
9. RevenueCat 같은 프로젝트에 **Play Store 앱** 추가(패키지 `app.shikakufriends.mobile`, Google Cloud 서비스 계정 JSON — RevenueCat 안내대로), 상품을 `ad_free`에 Attach, 공개 키 `goog_…`를 알려 준다.

## 3. 빌드
`.env`를 채운 뒤:

**EAS(클라우드 빌드, 권장)**
```bash
npm i -g eas-cli && eas login
eas build:configure            # 처음 한 번(eas.json은 이미 있음)
eas build -p ios --profile production
eas build -p android --profile production   # .aab
eas submit -p ios / eas submit -p android
```
EAS 빌드는 `.env`를 읽지 않으므로 `eas secret:create`(또는 EAS 환경 변수)로 `EXPO_PUBLIC_*` 값을 넣는다.

**로컬(Xcode·Android Studio, 렐로와 같은 방식)**
```bash
npx expo prebuild --clean
npx expo run:ios --configuration Release      # 또는 Xcode에서 Archive → App Store Connect 업로드
cd android && ./gradlew bundleRelease          # 업로드 키스토어 필요(*.jks는 git에 올리지 않음)
```

Expo SDK를 올린 뒤나 `ios/`가 옛 SDK로 만들어져 있으면 `npx expo prebuild --clean`으로 네이티브 폴더를 새로 만든다(안 그러면 옛 AppDelegate가 남아 iOS 27에서 켜자마자 꺼진다).

버전 올리기: `app.json`의 `version`(사용자에게 보이는 1.0.1)과 `ios.buildNumber`·`android.versionCode`(올릴 때마다 +1).

## 4. Google Play
0. **개발자 계정 만들기**(아직 없음): play.google.com/console → **조직(Organization)** 계정, 등록비 US$25. 회사 이름·주소는 D&B와 같게(`CHUNGLIMJUNGWON Co.,Ltd.`, D-U-N-S 697129275), 연락처 이메일·전화 인증, 대표 신원 확인. 조직 계정은 개인 계정과 달리 **"비공개 테스트 12명·14일" 조건이 없다.** 결제 프로필(판매자 계정)에 세금·계좌도 넣는다.
1. Play Console → 앱 만들기(게임 · 무료).
2. **앱 콘텐츠**: 개인정보처리방침 URL(위 0장), 광고 포함 = 예, 앱 액세스 = 제한 없음, 콘텐츠 등급 설문, **타겟층**(아래 주의), **데이터 보안**(아래 표).
3. 내부 테스트 트랙에 .aab 업로드 → 인앱 상품 생성(2장) → 테스트.
4. 스토어 등록정보: 언어별 문구는 `docs/store/listing/<코드>.md`(28개 — 제목·부제·짧은 설명·키워드·스크린샷 문구·설명, 글자 수 검사됨). Play Console › 기본 스토어 등록정보 › 번역 관리에서 언어를 추가해 붙여 넣는다. 그림은 `docs/store/art/`(아래 "스토어 그림"): 아이콘 `icon-512.png`, 그래픽 이미지 `<코드>/feature.png`(1024×500), 휴대전화 스크린샷 `<코드>/play-1~5.jpg`(1080×1920).
5. 국가: 중국 본토·EU·EEA·영국 제외(0장).

## 5. App Store
1. (조직 전환 승인·유료 앱 계약 뒤) App Store Connect → 새 앱: 플랫폼 iOS, 이름 `Shikaku Friends: Box Puzzle`(listing en 제목, 기본 언어를 영어(미국)로 — 렐로와 같음), 번들 ID `app.shikakufriends.mobile`(실기기 설치 때 Xcode 자동 서명으로 팀에 이미 등록됐을 수 있다 — 목록에 없으면 Certificates, Identifiers & Profiles에서 등록), SKU `shikaku-friends-ios-001`. 저작권 `© 2026 CHUNGLIMJUNGWON Co.,Ltd.`, 지원 URL·처리방침 URL은 0장. 사용 가능 국가는 0장대로 빼고 "새 국가 자동 포함"은 해제.
2. **앱 개인정보 보호(영양 성분표)**: 아래 표대로. 추적(Tracking) = 예(AdMob 맞춤 광고, ATT로 묻는다).
3. 연령 등급 설문(폭력·도박 없음 → 4+). 카테고리: 게임 > 퍼즐 / 보조: 보드.
4. 스크린샷: 6.9인치 필수 → `docs/store/art/<코드>/ios-1~5.jpg`(1320×2868). 언어마다 현지화 페이지에 올린다. iPad는 `supportsTablet: false`라 필요 없음.
5. TestFlight로 실기기 확인 → 심사 제출. 심사 메모에 "광고 제거 IAP는 설정 화면과 힌트가 없을 때의 팝업에서 살 수 있다"고 적는다(전면 광고를 2번 이상 본 뒤에는 클리어 창 아래 작은 버튼으로도 보인다).

### 스토어 그림(`docs/store/art/`)
`npm run store:art`(웹 빌드 → `tools/gen_store_art.ts all`)가 만든다. 웹 빌드를 Playwright로 띄워 장면마다 진행 기록을 심고 찍은 뒤, 위에 그 언어의 `- shots:` 문구(listing 파일, 5개)를 얹는다.
장면: ① 홈 ② 드래그로 네모 그리기 ③ 다 풀면 그림 공개 ④ 소품을 다 모은 마을 ⑤ 별이 채워진 스테이지 목록. 광고 제거 상태로 찍어 광고 자리는 안 보인다.
한 언어만: `npx tsx tools/gen_store_art.ts ko`. 이미지는 언어당 약 2MB라 화면이 바뀌었을 때만 다시 만들어 커밋한다.
웹 빌드라 기기 글꼴 대신 Noto(devDependencies의 @fontsource)로 인도계·아랍·태국·한자를 그린다 — 실기기와 글자 모양이 조금 다를 수 있다.

### 개인정보 신고 표(두 스토어 공통 근거)
| 데이터 | 수집 주체 | 용도 | 비고 |
|---|---|---|---|
| 기기 식별자(IDFA/광고 ID) | Google AdMob | 광고, (동의 시) 맞춤 광고 | iOS는 ATT 허용 때만 |
| 대략적 위치(IP 기반) | Google AdMob | 광고 | |
| 사용 데이터·진단(광고 상호작용, 비정상 종료) | Google AdMob | 광고·분석 | |
| 구매 기록 | RevenueCat·Apple·Google | 앱 기능(광고 제거 권리) | 익명 사용자 ID |
| 게임 진행·설정 | 기기 안에만 저장 | 앱 기능 | 서버로 보내지 않음 |

## 6. 주의
- **아동 대상 지정 금지(권장)**: 귀여운 캐릭터라도 Play "타겟층"에 13세 미만을 넣으면 가족 정책이 적용돼 AdMob 설정(아동 대상 처리, 인증된 광고 SDK)이 바뀌어야 하고, App Store "Kids" 카테고리는 제3자 광고·추적이 사실상 막힌다. 13세 이상으로 신고하는 것을 기본으로 했다. 아이 대상으로 바꾸려면 광고 설정부터 다시 정한다.
- 스테이지(`content/levels.json`)는 출시 뒤 다시 만들지 않는다(기록·별이 다른 퍼즐에 붙는다). 스테이지를 늘릴 때는 `src/core/chapters.ts`에 챕터를 **추가**만 한다.
- 3D 캐릭터는 Higgsfield에서 Tripo(고양이·판다·토끼)·Meshy(시바·오리)로 만든 모델(`assets/source/models`). 마을 소품도 Tripo, 자세는 Higgsfield 3D rigging. 두 서비스의 상업 이용 조건(플랜별 라이선스)을 출시 전에 확인한다. 글꼴 Jua는 OFL(상업 이용 가능), 효과음은 직접 합성.

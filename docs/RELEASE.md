# 출시 절차 (App Store · Google Play)

코드 쪽 준비(광고·결제 연결, 아이콘·스플래시, 다국어, 개인정보 문구)는 끝나 있다. 아래는 **계정·콘솔에서 사람이 해야 하는 일**과 빌드 순서다.
렐로에서 이미 만든 계정(Apple Developer, Google Play Console, AdMob, RevenueCat)은 그대로 쓴다.

## 0. 확정된 것(2026-10-25)
- 앱 이름: "시카쿠 프렌즈" / "Shikaku Friends"
- 번들 ID: `app.shikakufriends.mobile` (`app.json`의 `ios.bundleIdentifier`, `android.package`). 스토어에 한 번 올리면 못 바꾼다.
- 광고 제거 가격: **US$1.99 / ₩1,900**(스토어 가격표에 ₩1,900이 없으면 $1.99에 가장 가까운 원화 값)

## 남은 준비
- [ ] 문의 메일 주소
- [ ] 개인정보처리방침을 올릴 주소(예: relo-privacy 저장소에 `shikaku/` 페이지 추가 → GitHub Pages)

## 1. AdMob
1. AdMob 콘솔 → 앱 추가 ×2(iOS, Android). 아직 스토어에 없으니 "게시 안 됨"으로 만들고 출시 후 스토어 연결.
2. 앱마다 광고 단위 2개: **전면(Interstitial)**, **보상형(Rewarded)**.
3. `app.json` → `plugins` → `react-native-google-mobile-ads`의 `iosAppId`, `androidAppId`를 **진짜 앱 ID(`ca-app-pub-…~…`)**로 바꾼다. (지금은 구글 테스트 앱 ID)
4. 광고 단위 ID 4개를 `.env`에 넣는다(`.env.example` 참고).
5. 개인정보 보호 및 메시지 → **GDPR 동의 메시지**(유럽), **IDFA 안내 메시지**(iOS)를 만든다. 코드가 UMP 동의 → ATT 순서로 띄운다.
6. 앱이 공개되면 `app-ads.txt`를 개발자 웹사이트에 올린다(AdMob이 안내).

## 2. 결제(RevenueCat + 스토어 상품)
1. App Store Connect → 앱 → 수익화 → 앱 내 구입 → **비소모성** 상품 `shikaku_remove_ads` 생성(이름 "광고 제거", 가격 US$1.99, 심사용 스크린샷).
2. Play Console → 수익 창출 → 인앱 상품 → 같은 ID `shikaku_remove_ads` 생성·활성화. (Play는 먼저 결제 권한이 있는 빌드를 한 번 올려야 상품을 만들 수 있다 → 4단계 내부 테스트 업로드 후)
3. RevenueCat → 새 Project(또는 렐로 Project에 앱 추가) → iOS 앱·Android 앱 연결(App Store Connect API 키 / Play 서비스 계정).
4. RevenueCat → Entitlements → `ad_free` 만들고 두 스토어의 `shikaku_remove_ads`를 붙인다.
5. 공개 SDK 키(`appl_…`, `goog_…`)를 `.env`에 넣는다.

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

버전 올리기: `app.json`의 `version`(사용자에게 보이는 1.0.1)과 `ios.buildNumber`·`android.versionCode`(올릴 때마다 +1).

## 4. Google Play
1. Play Console → 앱 만들기(게임 · 무료).
2. **앱 콘텐츠**: 개인정보처리방침 URL, 광고 포함 = 예, 앱 액세스 = 제한 없음, 콘텐츠 등급 설문, **타겟층**(아래 주의), **데이터 보안**(아래 표).
3. 내부 테스트 트랙에 .aab 업로드 → 인앱 상품 생성(2단계) → 테스트.
4. 개인 개발자 계정이면 **비공개 테스트 12명 이상 · 14일**을 채워야 프로덕션 신청이 열린다.
5. 스토어 등록정보: 문구는 `docs/store/listing.md`, 아이콘 512×512(`assets/brand/icon.png` 축소), 그래픽 이미지 1024×500, 휴대전화 스크린샷 2~8장.

## 5. App Store
1. App Store Connect → 새 앱(번들 ID 선택, SKU 예: `shikaku-friends`).
2. **앱 개인정보 보호(영양 성분표)**: 아래 표대로. 추적(Tracking) = 예(AdMob 맞춤 광고, ATT로 묻는다).
3. 연령 등급 설문(폭력·도박 없음 → 4+). 카테고리: 게임 > 퍼즐 / 보조: 보드.
4. 스크린샷: 6.9인치(1320×2868 또는 1290×2796) 필수. iPad는 `supportsTablet: false`라 필요 없음.
5. TestFlight로 실기기 확인 → 심사 제출. 심사 메모에 "광고 제거 IAP는 설정 화면과 힌트가 없을 때의 팝업에서 살 수 있다"고 적는다(전면 광고를 2번 이상 본 뒤에는 클리어 창 아래 작은 버튼으로도 보인다).

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

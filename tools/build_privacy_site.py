# 개인정보 처리방침·지원 페이지(정적 HTML)를 만든다. 렐로와 같은 GitHub Pages 저장소(accjang/relo-privacy)의 shikaku/ 아래에 올린다.
# 실행: python3 tools/build_privacy_site.py <출력 폴더>   (예: ../relo-privacy/shikaku)
# 결과: <출력>/index.html(처리방침) · <출력>/support/index.html(지원). 주소는 config 아래 PRIVACY_URL·SUPPORT_URL.
# 언어: ko·en·ja·zh-Hant. 다른 언어 브라우저는 영어. 문구를 바꾸면 시행일(EFFECTIVE)도 바꾼다.
import html
import os
import sys

EFFECTIVE = '2026-11-10'
EMAIL = 'gpawod2@gmail.com'
COMPANY_KO = '주식회사 청림정원'
COMPANY_EN = 'CHUNGLIMJUNGWON Co.,Ltd.'  # D&B·Apple 판매자 이름과 같은 표기
PRIVACY_URL = 'https://accjang.github.io/relo-privacy/shikaku/'
SUPPORT_URL = 'https://accjang.github.io/relo-privacy/shikaku/support/'
LANGS = [('ko', '한국어'), ('en', 'English'), ('ja', '日本語'), ('zh-Hant', '繁體中文')]

GOOGLE_PARTNER = 'https://policies.google.com/technologies/partner-sites'
GOOGLE_PRIVACY = 'https://policies.google.com/privacy'
RC_PRIVACY = 'https://www.revenuecat.com/privacy'
MAIL = f'<a href="mailto:{EMAIL}">{EMAIL}</a>'


def a(url: str, text: str) -> str:
    return f'<a href="{url}">{html.escape(text)}</a>'


# ── 처리방침 본문(언어별). 각 항목은 (제목, [문단 또는 ('ul', [항목...])]) ──
POLICY = {
    'ko': {
        'title': '시카쿠 프렌즈 개인정보 처리방침',
        'meta': f'시행일: {EFFECTIVE}',
        'lead': f'시카쿠 프렌즈는 대한민국 법인 {COMPANY_KO}({COMPANY_EN}, 이하 "회사")가 운영합니다. 문의: {MAIL}.',
        'sections': [
            ('1. 요약', [('ul', [
                '시카쿠 프렌즈(이하 "앱")는 회사가 제공하는 퍼즐 게임입니다.',
                '회원가입·로그인이 없고, 회사는 앱을 위한 서버를 운영하지 않습니다. 게임 진행과 설정은 이용자의 기기 안에만 저장됩니다.',
                '무료 버전은 광고 파트너(Google AdMob)를 통해 광고를 보여 주며, 이때 AdMob이 일부 정보를 수집할 수 있습니다(4항).',
                '"광고 제거" 1회 구매는 App Store·Google Play 결제로 처리되고, 구매 확인·복원은 RevenueCat이 맡습니다(5항).',
            ])]),
            ('2. 회사가 수집하지 않는 정보', [
                '회사는 이름, 이메일 주소, 전화번호, 정밀 위치, 연락처, 사진을 수집하지 않습니다. 앱에는 회사가 넣은 분석 도구나 충돌 보고 도구가 없습니다. 회사나 처리 위탁 업체에 전달되는 데이터는 4항, 5항, 7항에 적힌 것과 이용자가 보내는 이메일뿐입니다.',
            ]),
            ('3. 기기 안에만 저장되는 정보', [('ul', [
                '게임 진행: 깬 스테이지, 별, 최고 기록, 오늘의 퍼즐 기록과 연속 일수, 힌트 수, 튜토리얼을 마쳤는지.',
                '설정: 효과음, 진동, 언어, 함께 다닐 친구.',
                '광고·구매 상태: 전면 광고를 마지막으로 본 시각과 본 횟수(광고 빈도 조절용), 광고 제거를 샀는지.',
            ]),
                '이 정보는 회사에 전송되지 않습니다. 기기 백업(iCloud·Google 백업)을 켜 두었다면 운영체제가 다른 앱 데이터와 함께 백업할 수 있으며, 이는 Apple·Google의 정책에 따릅니다. 앱을 삭제하면 모두 지워집니다.',
                '"결과 자랑하기"를 누르면 기기의 공유 창이 열리고, 이용자가 고른 앱으로 결과 문구(스테이지·별·걸린 시간)가 전달됩니다. 회사는 이 내용을 받지 않습니다.',
            ]),
            ('4. 광고 (Google AdMob)', [
                '앱은 Google LLC의 AdMob으로 광고를 보여 줍니다. 설치 후 처음 몇 스테이지를 깰 때까지는 광고가 없고, 그 뒤에는 스테이지를 몇 번 깰 때마다 한 번 "다음"을 누를 때 전체 화면 광고가 나올 수 있습니다. 보상형 광고(힌트 받기, 실패 뒤 이어하기)는 이용자가 직접 고를 때만 나옵니다.',
                'Google은 AdMob으로 수집하는 데이터에 대해 독립 컨트롤러입니다. AdMob이 수집할 수 있는 정보: IP 주소(대략적인 위치 추정), 기기 식별자(iOS의 광고 식별자 IDFA는 이용자가 추적을 허용한 경우에만, Android의 광고 ID), 본 광고와 광고 탭 같은 광고 상호작용, 앱 실행·성능·충돌 정보. 목적: 광고 표시와 측정, 부정 사용 방지, 광고 성능 분석. 자세한 내용은 ' + a(GOOGLE_PRIVACY, 'Google 개인정보처리방침') + '과 ' + a(GOOGLE_PARTNER, '파트너 사이트 데이터 사용 방식') + '을 참고하세요.',
                '추적 허용(iOS): 앱이 처음 광고를 준비할 때 iOS의 "추적 허용" 창을 띄울 수 있습니다. 허용하지 않으면 광고 식별자가 제공되지 않고 맞춤형이 아닌 광고가 나옵니다. 선택과 관계없이 모든 기능을 쓸 수 있고, iOS <strong>설정 → 개인정보 보호 및 보안 → 추적</strong>에서 언제든 바꿀 수 있습니다. Android에서는 기기 설정의 광고 메뉴에서 광고 ID를 재설정하거나 삭제할 수 있습니다.',
                '해당 지역에서는 앱 <strong>설정 → 광고 개인정보 옵션</strong>에서 Google 동의 선택을 확인하거나 바꿀 수 있습니다.',
                '게임 진행 정보는 광고 파트너에게 전달하지 않습니다.',
                '맞춤형 광고에 쓰이는 행태정보: 수집 항목은 위 광고 상호작용·기기 식별자, 수집 방법은 광고 SDK의 자동 수집, 보유 기간은 Google 정책에 따르며, 거부는 위 추적 설정과 광고 ID 설정으로 할 수 있습니다.',
                '국외 이전: 위 정보는 광고를 요청할 때 네트워크로 Google LLC(미국)에 전송·처리될 수 있습니다.',
                '광고 제거를 사면 전체 화면 광고를 요청하지 않습니다. 보상형 광고는 원할 때만 볼 수 있습니다.',
            ]),
            ('5. 결제 (광고 제거)', [
                '"광고 제거"는 1회 구매 상품이며 Apple App Store 또는 Google Play 결제로 처리됩니다. 결제 정보는 Apple·Google이 처리하며 회사는 카드 번호 등을 받지 않습니다.',
                '구매 확인·복원은 RevenueCat, Inc.(미국)에 처리를 위탁합니다. RevenueCat이 처리하는 정보: 앱이 만든 무작위 사용자 ID(이름·연락처·광고 식별자와 연결되지 않음), 구매 기록(상품, 구매 시각, 스토어가 발급한 거래 정보), 기기 종류·OS·앱 버전. 목적은 구매 확인·복원입니다(' + a(RC_PRIVACY, 'RevenueCat 개인정보처리방침') + ').',
                '국외 이전: 위 정보는 앱 시작·구매·복원 때 네트워크로 RevenueCat, Inc.(미국)에 전송·보관되며, 위탁 계약 기간 또는 법령이 정한 기간 동안 보관됩니다.',
                '기기를 바꾸거나 앱을 다시 설치했다면 앱 <strong>설정 → 구매 복원</strong>으로 다시 적용할 수 있습니다.',
            ]),
            ('6. 아동', [
                '앱은 만 14세 미만 아동을 주된 대상으로 하지 않으며, 회사는 알면서 아동의 개인정보를 수집하지 않습니다. 아동이 개인정보를 보냈다고 생각되면 연락해 주세요. 바로 삭제하겠습니다.',
            ]),
            ('7. 제3자 제공·처리 위탁', [
                '회사는 개인정보를 판매하거나 다른 회사의 마케팅용으로 제공하지 않습니다. 회사는 처리 위탁 계약에 따라 회사의 지시대로만 데이터를 처리하는 RevenueCat, Inc.(구매 확인)를 씁니다. Google(AdMob, Google Play 결제)과 Apple(App Store 결제, iCloud 백업)은 각자의 개인정보처리방침에 따라 독립 컨트롤러로서 데이터를 처리합니다. 이용자가 보내는 이메일은 회사의 메일 서비스인 Google(Gmail)이 처리합니다. 법이 요구하면 데이터를 제공할 수 있습니다.',
            ]),
            ('8. 보유 기간과 파기', [('ul', [
                '기기 안 데이터: 앱을 삭제할 때까지.',
                'RevenueCat의 구매 기록: 회사가 RevenueCat을 쓰는 동안, 또는 이용자가 삭제를 요청할 때까지. Apple·Google은 자체 거래 기록을 따로 보관합니다.',
                '이용자가 보낸 이메일: 대화가 끝난 뒤 1년(결제 분쟁에 관한 것이면 3년). 법적 청구에 대응해야 하면 더 오래 보관할 수 있습니다.',
            ])]),
            ('9. 이용자의 선택과 권리', [
                '앱을 삭제하면 기기 안 정보가 모두 지워지며, 추적·광고 ID 설정은 언제든 바꿀 수 있습니다. 어디에 살든 회사가 가진 데이터에 대해 묻고 삭제를 요청할 수 있습니다. 구매 기록 삭제를 요청할 때는 스토어 영수증의 주문 번호를 함께 적어 주세요(계정이 없어 그것으로만 찾을 수 있습니다).',
            ]),
            ('10. 개인정보 보호책임자·문의', [
                f'개인정보에 관한 질문이나 요청은 제목에 "Privacy"를 넣어 {MAIL}으로 보내 주세요. 한 달 안에 답합니다.',
            ]),
            ('11. 변경', [
                '이 방침을 바꾸면 이 페이지에 새 시행일과 함께 게시합니다. 수집 항목이 늘어나는 변경은 앱 업데이트 안내에도 알립니다.',
            ]),
            ('12. EEA·영국·스위스', [
                '이 항은 유럽경제지역(EEA), 영국, 스위스에 있는 이용자에게 적용됩니다. 처리 근거: 맞춤형 광고와 광고 식별자는 Google 동의 메시지와 iOS 추적 허용으로 받는 동의(GDPR 6조 1항 a호), 비맞춤형 광고는 무료 앱 운영 재원 마련이라는 정당한 이익(6조 1항 f호), 구매 확인은 계약 이행(6조 1항 b호)과 법적 의무(6조 1항 c호), 이메일 답변은 정당한 이익(6조 1항 f호)입니다. 회사는 대한민국에 있으며, 유럽연합 집행위원회는 대한민국에 대해 적정성 결정(2021년 12월 17일)을 했습니다. RevenueCat으로의 이전은 표준계약조항(SCC)으로 보호됩니다.',
                '열람·정정·삭제·처리 제한·반대·이동권과 언제든 동의를 철회할 권리가 있으며, 거주국 개인정보 감독기관(영국 ICO, 스위스 FDPIC 등)에 민원을 낼 수 있습니다. 회사는 자동화된 처리만으로 법적 효력이 생기는 결정을 하지 않습니다.',
            ]),
        ],
        'footer': f'© 2026 {COMPANY_EN} · {a(SUPPORT_URL, "지원")}',
    },
    'en': {
        'title': 'Shikaku Friends Privacy Policy',
        'meta': f'Effective date: {EFFECTIVE}',
        'lead': f'Shikaku Friends is operated by {COMPANY_EN} (주식회사 청림정원), a company incorporated in the Republic of Korea (the "Company"). Contact: {MAIL}.',
        'sections': [
            ('1. Summary', [('ul', [
                'Shikaku Friends (the "App") is a puzzle game provided by the Company.',
                'There is no sign-up or login, and the Company runs no server for the App. Your game progress and settings are stored only on your device.',
                'The free version shows ads through our ad partner, Google AdMob, which may collect some information (section 4).',
                'The one-time "Remove Ads" purchase is handled by the App Store or Google Play; RevenueCat verifies and restores purchases (section 5).',
            ])]),
            ('2. Information the Company does not collect', [
                'The Company does not collect your name, email address, phone number, precise location, contacts or photos. The App contains no analytics or crash-reporting tools added by the Company. The only data that reaches the Company or its processors is described in sections 4, 5 and 7, plus any email you send us.',
            ]),
            ('3. Information stored only on your device', [('ul', [
                'Game progress: cleared stages, stars, best times, Daily Puzzle results and streak, hint count, whether you finished the tutorial.',
                'Settings: sound effects, vibration, language, chosen companion.',
                'Ad and purchase state: when you last saw a full-screen ad and how many you have seen (to limit ad frequency), and whether you bought Remove Ads.',
            ]),
                'This information is not sent to the Company. If device backup (iCloud or Google backup) is on, the operating system may include it in backups under Apple\'s or Google\'s policies. Deleting the App deletes all of it.',
                'When you tap "Share", your device\'s share sheet opens and the result text (stage, stars, time) goes to the app you choose. The Company does not receive it.',
            ]),
            ('4. Advertising (Google AdMob)', [
                'The App shows ads using AdMob by Google LLC. There are no ads during your first few cleared stages; after that, a full-screen ad may appear when you tap "Next" once every few clears. Rewarded ads (getting hints, continuing after running out of chances) appear only when you choose them.',
                'Google acts as an independent controller of the data it collects through AdMob. AdMob may collect: IP address (to estimate approximate location), device identifiers (on iOS, the advertising identifier IDFA only if you allow tracking; on Android, the advertising ID), ad interactions such as ads viewed and tapped, and app launch, performance and crash information. Purposes: showing and measuring ads, preventing fraud, and analysing ad performance. See ' + a(GOOGLE_PRIVACY, 'Google\'s Privacy Policy') + ' and ' + a(GOOGLE_PARTNER, 'How Google uses information from sites or apps that use its services') + '.',
                'Allow Tracking (iOS): when the App first prepares ads it may show the iOS "Allow Tracking" prompt. If you decline, no advertising identifier is shared and ads are not personalised. Every feature works either way, and you can change your choice anytime in iOS <strong>Settings → Privacy &amp; Security → Tracking</strong>. On Android, you can reset or delete your advertising ID in your device\'s ads settings.',
                'Where applicable, you can review or change your Google consent choices in the App under <strong>Settings → Ad privacy options</strong>.',
                'Your game progress is not shared with the ad partner.',
                'International transfer: this information may be sent over the network to and processed by Google LLC (USA) when ads are requested.',
                'After you buy Remove Ads, the App no longer requests full-screen ads. Rewarded ads remain available only if you choose to watch them.',
            ]),
            ('5. Purchases (Remove Ads)', [
                '"Remove Ads" is a one-time purchase processed by the Apple App Store or Google Play. Payment details are handled by Apple or Google; the Company never receives card numbers.',
                'Purchase verification and restoration are processed on the Company\'s behalf by RevenueCat, Inc. (USA). RevenueCat processes: a random user ID created by the App (not linked to your name, contact details or advertising identifier), purchase records (product, purchase time, transaction information issued by the store), and device type, OS and app version. The purpose is verifying and restoring purchases (' + a(RC_PRIVACY, 'RevenueCat Privacy Policy') + ').',
                'International transfer: this information is sent to and stored by RevenueCat, Inc. (USA) when the App starts and when you buy or restore, for the term of the processing agreement or as required by law.',
                'If you change devices or reinstall the App, use <strong>Settings → Restore purchases</strong> in the App.',
            ]),
            ('6. Children', [
                'The App is not primarily directed to children under 14 (under 13 in the United States), and the Company does not knowingly collect children\'s personal information. If you believe a child has sent us personal information, contact us and we will delete it promptly.',
            ]),
            ('7. Sharing and processors', [
                'The Company does not sell personal information or share it for other companies\' marketing. The Company uses RevenueCat, Inc. (purchase verification), which processes data only on the Company\'s instructions under a data processing agreement. Google (AdMob, Google Play billing) and Apple (App Store payments, iCloud backup) process data as independent controllers under their own privacy policies. Emails you send are handled by Google (Gmail), the Company\'s email provider. We may disclose data if required by law.',
            ]),
            ('8. Retention and deletion', [('ul', [
                'Data on your device: until you delete the App.',
                'Purchase records at RevenueCat: while the Company uses RevenueCat, or until you ask us to delete them. Apple and Google keep their own transaction records.',
                'Emails you send: one year after the conversation ends (three years for payment disputes), longer if needed to handle legal claims.',
            ])]),
            ('9. Your choices and rights', [
                'Deleting the App removes all on-device data, and you can change tracking and advertising-ID settings at any time. Wherever you live, you can ask about the data we hold and request its deletion. When asking us to delete purchase records, please include the order number from your store receipt (with no accounts, that is the only way we can find them).',
            ]),
            ('10. Privacy contact', [
                f'Send privacy questions or requests to {MAIL} with "Privacy" in the subject. We reply within one month.',
            ]),
            ('11. Changes', [
                'If we change this policy, we will post it on this page with a new effective date. Changes that add new types of data will also be noted in the App\'s update notes.',
            ]),
            ('12. EEA, UK and Switzerland', [
                'This section applies to users in the European Economic Area, the United Kingdom and Switzerland. Legal bases: personalised ads and advertising identifiers rely on your consent given through Google\'s consent message and iOS Allow Tracking (GDPR Art. 6(1)(a)); non-personalised ads rely on our legitimate interest in funding a free app (Art. 6(1)(f)); purchase verification relies on performance of a contract (Art. 6(1)(b)) and legal obligations (Art. 6(1)(c)); replying to emails relies on legitimate interest (Art. 6(1)(f)). The Company is located in the Republic of Korea, which is covered by a European Commission adequacy decision (17 December 2021). Transfers to RevenueCat are protected by Standard Contractual Clauses.',
                'You have the rights of access, rectification, erasure, restriction, objection and data portability, and you may withdraw consent at any time. You may lodge a complaint with your local supervisory authority (for example the UK ICO or the Swiss FDPIC). The Company makes no decisions with legal or similarly significant effects based solely on automated processing.',
            ]),
        ],
        'footer': f'© 2026 {COMPANY_EN} · {a(SUPPORT_URL, "Support")}',
    },
    'ja': {
        'title': 'シカクフレンズ プライバシーポリシー',
        'meta': f'施行日：{EFFECTIVE}',
        'lead': f'シカクフレンズは、大韓民国法人 {COMPANY_EN}（주식회사 청림정원、以下「当社」）が運営しています。お問い合わせ：{MAIL}。',
        'sections': [
            ('1. 概要', [('ul', [
                'シカクフレンズ（以下「本アプリ」）は当社が提供するパズルゲームです。',
                '会員登録・ログインはなく、当社は本アプリ用のサーバーを運用していません。ゲームの進行と設定はお使いの端末内にのみ保存されます。',
                '無料版では広告パートナー（Google AdMob）を通じて広告を表示し、その際に AdMob が一部の情報を収集することがあります（第4項）。',
                '「広告削除」の買い切り購入は App Store・Google Play の決済で処理され、購入の確認・復元は RevenueCat が担当します（第5項）。',
            ])]),
            ('2. 当社が収集しない情報', [
                '当社は氏名、メールアドレス、電話番号、正確な位置情報、連絡先、写真を収集しません。本アプリには当社が組み込んだ分析ツールやクラッシュレポートツールはありません。当社または委託先に渡るデータは、第4項・第5項・第7項に記載のものと、お客様が送信するメールのみです。',
            ]),
            ('3. 端末内にのみ保存される情報', [('ul', [
                'ゲームの進行：クリアしたステージ、星、ベストタイム、今日のパズルの記録と連続日数、ヒント数、チュートリアル完了の有無。',
                '設定：効果音、振動、言語、一緒に歩くなかま。',
                '広告・購入の状態：全画面広告を最後に見た時刻と回数（広告頻度の調整用）、広告削除を購入したかどうか。',
            ]),
                'これらの情報は当社に送信されません。端末のバックアップ（iCloud・Google バックアップ）が有効な場合、OS が他のアプリデータとともにバックアップすることがあり、これは Apple・Google のポリシーに従います。本アプリを削除するとすべて消去されます。',
                '「結果をシェア」を押すと端末の共有画面が開き、お客様が選んだアプリに結果の文章（ステージ・星・タイム）が渡されます。当社はこの内容を受け取りません。',
            ]),
            ('4. 広告（Google AdMob）', [
                '本アプリは Google LLC の AdMob で広告を表示します。インストール後、最初の数ステージをクリアするまでは広告はなく、その後は数回クリアするごとに一度、「次へ」を押したときに全画面広告が表示されることがあります。リワード広告（ヒントをもらう、チャンスを使い切った後に続ける）は、お客様が自分で選んだときだけ表示されます。',
                'Google は AdMob を通じて収集するデータについて独立した管理者です。AdMob が収集する可能性のある情報：IP アドレス（おおよその位置の推定）、端末識別子（iOS の広告識別子 IDFA はトラッキングを許可した場合のみ、Android の広告 ID）、表示・タップした広告などの広告操作、アプリの起動・パフォーマンス・クラッシュ情報。目的：広告の表示と測定、不正防止、広告効果の分析。詳しくは ' + a(GOOGLE_PRIVACY, 'Google プライバシーポリシー') + ' と ' + a(GOOGLE_PARTNER, 'Google のサービスを使用するサイトやアプリから収集した情報の Google による使用') + ' をご覧ください。',
                'トラッキングの許可（iOS）：本アプリが初めて広告を準備するときに、iOS の「トラッキングを許可」画面が表示されることがあります。許可しない場合、広告識別子は提供されず、パーソナライズされていない広告が表示されます。どちらを選んでもすべての機能を使え、iOS の<strong>設定 → プライバシーとセキュリティ → トラッキング</strong>からいつでも変更できます。Android では端末設定の広告メニューから広告 ID をリセット・削除できます。',
                '該当する地域では、本アプリの<strong>設定 → 広告のプライバシー設定</strong>で Google の同意設定を確認・変更できます。',
                'ゲームの進行情報は広告パートナーに渡しません。',
                '国外移転：上記の情報は、広告をリクエストする際にネットワーク経由で Google LLC（米国）に送信・処理されることがあります。',
                '広告削除を購入すると、全画面広告はリクエストしません。リワード広告はご希望のときだけ視聴できます。',
            ]),
            ('5. 決済（広告削除）', [
                '「広告削除」は買い切りの商品で、Apple App Store または Google Play の決済で処理されます。決済情報は Apple・Google が処理し、当社がカード番号などを受け取ることはありません。',
                '購入の確認・復元は RevenueCat, Inc.（米国）に委託しています。RevenueCat が処理する情報：本アプリが作成したランダムなユーザー ID（氏名・連絡先・広告識別子とは結び付きません）、購入記録（商品、購入時刻、ストアが発行した取引情報）、端末の種類・OS・アプリのバージョン。目的は購入の確認・復元です（' + a(RC_PRIVACY, 'RevenueCat プライバシーポリシー') + '）。',
                '国外移転：上記の情報はアプリの起動時・購入時・復元時にネットワーク経由で RevenueCat, Inc.（米国）に送信・保管され、委託契約の期間または法令で定められた期間保管されます。',
                '端末を変えたり再インストールしたりした場合は、本アプリの<strong>設定 → 購入を復元</strong>で再度適用できます。',
            ]),
            ('6. お子様', [
                '本アプリは14歳未満（米国では13歳未満）のお子様を主な対象としておらず、当社は故意にお子様の個人情報を収集しません。お子様が個人情報を送ったと思われる場合はご連絡ください。速やかに削除します。',
            ]),
            ('7. 第三者提供・委託', [
                '当社は個人情報を販売したり、他社のマーケティングのために提供したりしません。当社は委託契約に基づき当社の指示どおりにのみデータを処理する RevenueCat, Inc.（購入確認）を利用しています。Google（AdMob、Google Play 決済）と Apple（App Store 決済、iCloud バックアップ）は、それぞれのプライバシーポリシーに従い独立した管理者としてデータを処理します。お客様からのメールは当社のメールサービスである Google（Gmail）が処理します。法令で求められた場合はデータを提供することがあります。',
            ]),
            ('8. 保存期間と削除', [('ul', [
                '端末内のデータ：本アプリを削除するまで。',
                'RevenueCat の購入記録：当社が RevenueCat を利用している間、またはお客様が削除を求めるまで。Apple・Google は独自の取引記録を別途保管します。',
                'お客様からのメール：やり取りの終了後1年（決済の紛争に関するものは3年）。法的請求に対応する必要がある場合はより長く保管することがあります。',
            ])]),
            ('9. お客様の選択と権利', [
                '本アプリを削除すると端末内の情報はすべて消去され、トラッキングや広告 ID の設定はいつでも変更できます。お住まいの地域にかかわらず、当社が保有するデータについて問い合わせ、削除を求めることができます。購入記録の削除を求める場合は、ストアの領収書にある注文番号を添えてください（アカウントがないため、それでのみ特定できます）。',
            ]),
            ('10. 個人情報に関するお問い合わせ', [
                f'個人情報に関するご質問やご要望は、件名に「Privacy」と入れて {MAIL} までお送りください。1か月以内に回答します。',
            ]),
            ('11. 変更', [
                '本ポリシーを変更する場合は、新しい施行日とともにこのページに掲載します。収集する項目が増える変更は、アプリのアップデート案内でもお知らせします。',
            ]),
            ('12. EEA・英国・スイス', [
                '本項は欧州経済領域（EEA）、英国、スイスのお客様に適用されます。処理の根拠：パーソナライズ広告と広告識別子は Google の同意メッセージと iOS のトラッキング許可によるお客様の同意（GDPR 第6条1項a）、非パーソナライズ広告は無料アプリ運営の財源確保という正当な利益（同f）、購入確認は契約の履行（同b）と法的義務（同c）、メールへの返信は正当な利益（同f）です。当社は大韓民国にあり、欧州委員会は大韓民国について十分性認定（2021年12月17日）を行っています。RevenueCat への移転は標準契約条項（SCC）で保護されます。',
                'アクセス、訂正、消去、処理の制限、異議、データポータビリティの権利があり、いつでも同意を撤回できます。居住国の監督機関（英国 ICO、スイス FDPIC など）に苦情を申し立てることができます。当社は、自動処理のみによって法的効果を生じる決定を行いません。',
            ]),
        ],
        'footer': f'© 2026 {COMPANY_EN} · {a(SUPPORT_URL, "サポート")}',
    },
    'zh-Hant': {
        'title': '方塊朋友 隱私權政策',
        'meta': f'生效日期：{EFFECTIVE}',
        'lead': f'方塊朋友（Shikaku Friends）由大韓民國法人 {COMPANY_EN}（주식회사 청림정원，以下稱「本公司」）營運。聯絡方式：{MAIL}。',
        'sections': [
            ('1. 摘要', [('ul', [
                '方塊朋友（以下稱「本 App」）是本公司提供的益智遊戲。',
                '不需註冊或登入，本公司也沒有為本 App 營運伺服器。遊戲進度與設定只儲存在您的裝置中。',
                '免費版透過廣告合作夥伴 Google AdMob 顯示廣告，AdMob 可能因此收集部分資訊（第4條）。',
                '「移除廣告」一次性購買由 App Store 或 Google Play 付款處理，購買確認與還原由 RevenueCat 負責（第5條）。',
            ])]),
            ('2. 本公司不收集的資訊', [
                '本公司不收集您的姓名、電子郵件地址、電話號碼、精確位置、聯絡人或照片。本 App 沒有本公司加入的分析或當機回報工具。會傳到本公司或受託業者的資料，只有第4、5、7條所述內容，以及您寄給我們的電子郵件。',
            ]),
            ('3. 只儲存在裝置中的資訊', [('ul', [
                '遊戲進度：已過關卡、星星、最佳紀錄、每日謎題紀錄與連續天數、提示數量、是否完成教學。',
                '設定：音效、震動、語言、同行夥伴。',
                '廣告與購買狀態：最後一次看到全螢幕廣告的時間與次數（用於控制廣告頻率）、是否已購買移除廣告。',
            ]),
                '這些資訊不會傳送給本公司。若開啟裝置備份（iCloud 或 Google 備份），作業系統可能會連同其他 App 資料一起備份，並依 Apple 或 Google 的政策處理。刪除本 App 後，所有資料都會刪除。',
                '按下「分享成果」時會開啟裝置的分享畫面，成果文字（關卡、星星、時間）會傳到您選擇的 App。本公司不會收到這些內容。',
            ]),
            ('4. 廣告（Google AdMob）', [
                '本 App 使用 Google LLC 的 AdMob 顯示廣告。安裝後最初幾個關卡不會出現廣告，之後每過幾關，按下「下一關」時可能出現一次全螢幕廣告。獎勵廣告（取得提示、機會用完後繼續）只有在您自行選擇時才會出現。',
                'Google 對透過 AdMob 收集的資料是獨立的控管者。AdMob 可能收集：IP 位址（推估大略位置）、裝置識別碼（iOS 的廣告識別碼 IDFA 僅在您允許追蹤時提供；Android 的廣告 ID）、看過與點按的廣告等廣告互動，以及 App 啟動、效能與當機資訊。目的：顯示與衡量廣告、防止詐騙、分析廣告成效。詳情請參閱 ' + a(GOOGLE_PRIVACY, 'Google 隱私權政策') + ' 與 ' + a(GOOGLE_PARTNER, 'Google 如何使用使用其服務的網站或應用程式所提供的資訊') + '。',
                '允許追蹤（iOS）：本 App 第一次準備廣告時，可能會顯示 iOS 的「允許追蹤」視窗。若不允許，就不會提供廣告識別碼，並顯示非個人化廣告。無論如何選擇都能使用所有功能，也可以隨時在 iOS <strong>設定 → 隱私權與安全性 → 追蹤</strong>中變更。在 Android 上，可以在裝置設定的廣告選單中重設或刪除廣告 ID。',
                '在適用地區，您可以在本 App 的<strong>設定 → 廣告隱私選項</strong>中查看或變更 Google 同意設定。',
                '遊戲進度資訊不會提供給廣告合作夥伴。',
                '跨境傳輸：上述資訊可能在請求廣告時經由網路傳送至 Google LLC（美國）並由其處理。',
                '購買移除廣告後，本 App 不再請求全螢幕廣告。獎勵廣告仍只在您想看時才會出現。',
            ]),
            ('5. 付款（移除廣告）', [
                '「移除廣告」是一次性購買的商品，由 Apple App Store 或 Google Play 付款處理。付款資訊由 Apple 或 Google 處理，本公司不會收到信用卡號碼等資訊。',
                '購買確認與還原委託 RevenueCat, Inc.（美國）處理。RevenueCat 處理的資訊：本 App 產生的隨機使用者 ID（不與姓名、聯絡資訊或廣告識別碼連結）、購買紀錄（商品、購買時間、商店核發的交易資訊）、裝置類型、作業系統與 App 版本。目的是確認與還原購買（' + a(RC_PRIVACY, 'RevenueCat 隱私權政策') + '）。',
                '跨境傳輸：上述資訊會在 App 啟動、購買或還原時經由網路傳送至 RevenueCat, Inc.（美國）並保存，保存期間為委託契約期間或法令規定的期間。',
                '更換裝置或重新安裝後，可在本 App 的<strong>設定 → 恢復購買</strong>重新套用。',
            ]),
            ('6. 兒童', [
                '本 App 並非以未滿14歲（美國為未滿13歲）的兒童為主要對象，本公司不會在知情的情況下收集兒童的個人資料。若您認為兒童寄送了個人資料，請與我們聯絡，我們會立即刪除。',
            ]),
            ('7. 第三方提供與委託處理', [
                '本公司不出售個人資料，也不提供給其他公司作行銷用途。本公司依委託處理契約使用 RevenueCat, Inc.（購買確認），其只依本公司指示處理資料。Google（AdMob、Google Play 付款）與 Apple（App Store 付款、iCloud 備份）依各自的隱私權政策，以獨立控管者身分處理資料。您寄來的電子郵件由本公司的郵件服務 Google（Gmail）處理。法律要求時，我們可能提供資料。',
            ]),
            ('8. 保存期間與刪除', [('ul', [
                '裝置中的資料：直到刪除本 App。',
                'RevenueCat 的購買紀錄：本公司使用 RevenueCat 期間，或直到您要求刪除。Apple 與 Google 另行保存其交易紀錄。',
                '您寄來的電子郵件：對話結束後 1 年（付款爭議相關為 3 年）；若需處理法律主張，可能保存更久。',
            ])]),
            ('9. 您的選擇與權利', [
                '刪除本 App 即會刪除裝置中的所有資料，追蹤與廣告 ID 設定也可隨時變更。無論您住在哪裡，都可以詢問本公司持有的資料並要求刪除。要求刪除購買紀錄時，請附上商店收據中的訂單編號（因為沒有帳號，只能以此查找）。',
            ]),
            ('10. 隱私權聯絡窗口', [
                f'有關個人資料的問題或要求，請在主旨加上「Privacy」並寄至 {MAIL}。我們會在一個月內回覆。',
            ]),
            ('11. 變更', [
                '若變更本政策，我們會在此頁面公告並標示新的生效日期。增加收集項目的變更也會在 App 更新說明中告知。',
            ]),
            ('12. 歐洲經濟區、英國與瑞士', [
                '本條適用於歐洲經濟區（EEA）、英國與瑞士的使用者。處理依據：個人化廣告與廣告識別碼依據您透過 Google 同意訊息與 iOS 允許追蹤所給予的同意（GDPR 第6條第1項a款）；非個人化廣告依據維持免費 App 營運資金的正當利益（f款）；購買確認依據契約履行（b款）與法定義務（c款）；回覆電子郵件依據正當利益（f款）。本公司位於大韓民國，歐盟執委會已就大韓民國作出適足性決定（2021年12月17日）。傳輸至 RevenueCat 受標準契約條款（SCC）保護。',
                '您享有查閱、更正、刪除、限制處理、反對與資料可攜權，並可隨時撤回同意，也可向居住國的監管機關（如英國 ICO、瑞士 FDPIC）提出申訴。本公司不會僅依自動化處理作出產生法律效果的決定。',
            ]),
        ],
        'footer': f'© 2026 {COMPANY_EN} · {a(SUPPORT_URL, "支援")}',
    },
}

# ── 지원 페이지(자주 묻는 질문 + 문의) ──
SUPPORT = {
    'ko': {
        'title': '시카쿠 프렌즈 지원',
        'meta': '자주 묻는 질문과 문의',
        'faq': [
            ('어떻게 하나요?', '판을 직사각형으로 나눠요. 네모 하나에는 숫자가 딱 하나 들어가고, 그 숫자가 네모의 칸 수예요. 드래그해서 네모를 그리고, 네모를 톡 누르면 지워져요.'),
            ('하트가 줄었어요.', '숫자 하나에 크기도 맞지만 정답 자리가 아닌 네모를 그리면 하트가 하나 줄어요. 한 판에 3번까지 봐주고, 그 뒤에 또 틀리면 다시 하거나 광고를 보고 이어할 수 있어요. 크기가 틀린 회색 네모는 하트가 줄지 않아요.'),
            ('별은 어떻게 받나요?', '힌트 없이 풀면 별 3개, 힌트를 1개 쓰면 2개, 그 이상이면 1개예요. 같은 스테이지를 다시 풀어 별을 올릴 수 있어요.'),
            ('다음 친구의 스테이지가 안 열려요.', '앞 챕터에서 스테이지를 15개 깨면 다음 챕터가 열려요.'),
            ('힌트가 떨어졌어요.', '오늘의 퍼즐을 풀거나(연속으로 풀면 더 많이), 광고를 보고 힌트를 받을 수 있어요. 광고 제거를 사면 힌트 10개를 함께 드려요.'),
            ('광고 제거를 샀는데 광고가 나와요 / 폰을 바꿨어요.', '설정 → 구매 복원을 눌러 주세요. 산 계정(Apple ID·Google 계정)으로 로그인되어 있어야 해요.'),
            ('기록을 다른 기기로 옮길 수 있나요?', '진행 기록은 기기 안에만 저장되어 옮길 수 없어요. 앱을 지우면 기록도 지워지니 주의해 주세요. 광고 제거 구매는 구매 복원으로 다시 받을 수 있어요.'),
        ],
        'contact': f'그 밖의 문의는 {MAIL}으로 보내 주세요. 기기 이름, OS 버전, 앱 버전(설정 맨 아래)을 함께 적어 주시면 빨리 도와드릴 수 있어요.',
        'privacy': a(PRIVACY_URL + '#ko', '개인정보 처리방침'),
    },
    'en': {
        'title': 'Shikaku Friends Support',
        'meta': 'FAQ and contact',
        'faq': [
            ('How do I play?', 'Split the board into rectangles. Each rectangle holds exactly one number, and that number is its size in cells. Drag to draw a rectangle; tap one to erase it.'),
            ('I lost a heart.', 'Drawing a rectangle that has one number and the right size but is not in the solution costs a heart. You get three per stage; after that, another mistake lets you play again or watch an ad to continue. Grey rectangles with the wrong size never cost a heart.'),
            ('How do I earn stars?', 'Solve without hints for 3 stars, with one hint for 2, more for 1. You can replay a stage to improve your stars.'),
            ('The next friend\'s stages are locked.', 'Clear 15 stages in the previous chapter to unlock the next one.'),
            ('I\'m out of hints.', 'Solve the Daily Puzzle (more for streaks) or watch an ad for hints. Buying Remove Ads also gives you 10 hints.'),
            ('I bought Remove Ads but still see ads / I changed phones.', 'Tap Settings → Restore purchases while signed in with the Apple ID or Google account you used to buy.'),
            ('Can I move my progress to another device?', 'Progress is stored only on your device and cannot be transferred. Deleting the App deletes your progress. Remove Ads can be restored with Restore purchases.'),
        ],
        'contact': f'For anything else, email {MAIL}. Including your device model, OS version and app version (bottom of Settings) helps us help you faster.',
        'privacy': a(PRIVACY_URL + '#en', 'Privacy Policy'),
    },
    'ja': {
        'title': 'シカクフレンズ サポート',
        'meta': 'よくある質問とお問い合わせ',
        'faq': [
            ('遊び方は？', '盤面を長方形に分けます。四角ひとつに数字はちょうどひとつ、その数字が四角のマス数です。ドラッグで四角を描き、四角をタップすると消えます。'),
            ('ハートが減りました。', '数字がひとつで大きさも合っているのに正解の位置ではない四角を描くと、ハートがひとつ減ります。1ステージで3回まで大丈夫で、その後にまた間違えると、やり直すか広告を見て続けられます。大きさが違うグレーの四角ではハートは減りません。'),
            ('星はどうやってもらえますか？', 'ヒントなしで解くと星3つ、ヒント1回で2つ、それ以上で1つです。同じステージをもう一度解いて星を増やせます。'),
            ('次のなかまのステージが開きません。', '前の章でステージを15個クリアすると次の章が開きます。'),
            ('ヒントがなくなりました。', '今日のパズルを解く（連続で解くともっと）か、広告を見てヒントをもらえます。広告削除を購入するとヒント10個も付いてきます。'),
            ('広告削除を買ったのに広告が出る／機種変更しました。', '購入した Apple ID・Google アカウントでサインインした状態で、設定 → 購入を復元を押してください。'),
            ('記録を別の端末に移せますか？', '進行の記録は端末内にのみ保存されるため移せません。アプリを削除すると記録も消えるのでご注意ください。広告削除は購入の復元で再び適用できます。'),
        ],
        'contact': f'その他のお問い合わせは {MAIL} までお送りください。端末名、OS バージョン、アプリのバージョン（設定の一番下）を添えていただくと早く対応できます。',
        'privacy': a(PRIVACY_URL + '#ja', 'プライバシーポリシー'),
    },
    'zh-Hant': {
        'title': '方塊朋友 支援',
        'meta': '常見問題與聯絡我們',
        'faq': [
            ('怎麼玩？', '把盤面分成長方形。每個方塊裡剛好有一個數字，那個數字就是方塊的格數。拖曳畫出方塊，輕點方塊即可刪除。'),
            ('愛心變少了。', '畫出只含一個數字、大小也對，但不在正確位置的方塊，就會少一顆愛心。每關可以錯 3 次，之後再錯就要重玩，或看廣告繼續。大小不對的灰色方塊不會扣愛心。'),
            ('怎麼得到星星？', '不用提示解開得 3 顆星，用 1 次提示得 2 顆，更多則得 1 顆。可以重玩同一關提高星星數。'),
            ('下一位朋友的關卡沒有開啟。', '在前一章過 15 關，就會開啟下一章。'),
            ('提示用完了。', '解開每日謎題（連續解開會得到更多），或看廣告取得提示。購買移除廣告也會送 10 個提示。'),
            ('買了移除廣告卻還有廣告／換了手機。', '請用購買時的 Apple ID 或 Google 帳號登入，再按 設定 → 恢復購買。'),
            ('可以把紀錄移到其他裝置嗎？', '遊戲紀錄只儲存在裝置中，無法轉移。刪除 App 時紀錄也會刪除，請留意。移除廣告可以用恢復購買重新套用。'),
        ],
        'contact': f'其他問題請寄信至 {MAIL}。附上裝置型號、作業系統版本與 App 版本（在設定最下方），我們能更快協助您。',
        'privacy': a(PRIVACY_URL + '#zh-Hant', '隱私權政策'),
    },
}

STYLE = '''
  :root { --bg: #FFF6EC; --card: #FFFFFF; --ink: #4B3F6B; --muted: #8C80A8; --line: #EADFD3; --accent: #FF7FA3; --accent-text: #D44F78; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --bg: #1C1826; --card: #262135; --ink: #F3EEFF; --muted: #B4AACB; --line: #3A3350; --accent: #FF8FB0; --accent-text: #FFA9C4; }
  }
  :root[data-theme="dark"] { --bg: #1C1826; --card: #262135; --ink: #F3EEFF; --muted: #B4AACB; --line: #3A3350; --accent: #FF8FB0; --accent-text: #FFA9C4; }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body { margin: 0; background: var(--bg); color: var(--ink);
    font: 16px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", "Hiragino Sans", "PingFang TC", "Noto Sans CJK KR", sans-serif; }
  header { max-width: 760px; margin: 0 auto; padding: 28px 16px 8px; }
  .brand { font-weight: 800; font-size: 22px; margin: 0; }
  .tagline { color: var(--muted); margin: 2px 0 16px; font-size: 14px; }
  nav { display: flex; flex-wrap: wrap; gap: 8px; }
  nav a { display: inline-block; padding: 6px 14px; border: 1px solid var(--line); border-radius: 999px; color: var(--ink);
    background: var(--card); text-decoration: none; font-size: 14px; }
  nav a[aria-current="true"] { background: var(--accent); border-color: var(--accent); color: #FFFFFF; }
  main { max-width: 760px; margin: 0 auto; padding: 8px 16px 48px; }
  section { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 20px 20px 8px; margin: 16px 0; }
  .js section.hidden { display: none; }
  h1 { font-size: 24px; line-height: 1.3; margin: 0 0 4px; }
  h2 { font-size: 17px; margin: 24px 0 6px; }
  p, li { overflow-wrap: anywhere; }
  ul { padding-left: 20px; }
  .meta { color: var(--muted); font-size: 14px; margin: 0 0 12px; }
  a { color: var(--accent-text); }
  footer { max-width: 760px; margin: 0 auto; padding: 0 16px 32px; color: var(--muted); font-size: 13px; }
'''

# 렐로 페이지와 같은 언어 전환: 해시(#ko 등) → 그 섹션만. 해시가 없으면 브라우저 언어(번체 중국어 지역만 zh-Hant), 그 밖은 영어.
SCRIPT = '''
(function () {
  var langs = %s;
  document.documentElement.classList.add('js');
  function known(code) {
    for (var i = 0; i < langs.length; i++) if (langs[i].toLowerCase() === (code || '').toLowerCase()) return langs[i];
    return null;
  }
  function fromTag(tag) {
    var lower = (tag || '').toLowerCase().replace(/_/g, '-');
    var language = lower.split('-')[0];
    if (language === 'zh') return /-(hant|tw|hk|mo)(-|$)/.test(lower) && !/-hans(-|$)/.test(lower) ? known('zh-Hant') : null;
    return known(language);
  }
  function pick() {
    var hash = known((location.hash || '').replace('#', ''));
    if (hash) return hash;
    var tags = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
    for (var i = 0; i < tags.length; i++) { var l = fromTag(tags[i]); if (l) return l; }
    return 'en';
  }
  function show(lang) {
    langs.forEach(function (l) { var s = document.getElementById(l); if (s) s.classList.toggle('hidden', l !== lang); });
    document.querySelectorAll('nav a').forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('data-lang') === lang ? 'true' : 'false'); });
    document.documentElement.lang = lang;
  }
  document.querySelectorAll('nav a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var lang = a.getAttribute('data-lang');
      e.preventDefault(); show(lang);
      try { history.replaceState(null, '', '#' + lang); } catch (err) {}
      window.scrollTo(0, 0);
    });
  });
  window.addEventListener('hashchange', function () { show(pick()); });
  show(pick());
})();
''' % ('[' + ', '.join(f"'{c}'" for c, _ in LANGS) + ']')


def blocks(items: list) -> str:
    out = []
    for it in items:
        if isinstance(it, tuple) and it[0] == 'ul':
            out.append('<ul>' + ''.join(f'<li>{li}</li>' for li in it[1]) + '</ul>')
        else:
            out.append(f'<p>{it}</p>')
    return '\n'.join(out)


def page(title: str, desc: str, sections: str) -> str:
    nav = '\n'.join(f'    <a href="#{c}" data-lang="{c}" hreflang="{c}">{name}</a>' for c, name in LANGS)
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<style>{STYLE}</style>
</head>
<body>
<header>
  <p class="brand">Shikaku Friends</p>
  <p class="tagline">시카쿠 프렌즈 · シカクフレンズ · 方塊朋友</p>
  <nav aria-label="Language">
{nav}
  </nav>
</header>
<main>
{sections}
</main>
<script>{SCRIPT}</script>
</body>
</html>
'''


def build_policy() -> str:
    parts = []
    for code, _ in LANGS:
        p = POLICY[code]
        body = '\n'.join(f'  <h2>{html.escape(h)}</h2>\n{blocks(items)}' for h, items in p['sections'])
        parts.append(f'''<section id="{code}" lang="{code}">
  <h1>{html.escape(p["title"])}</h1>
  <p class="meta">{html.escape(p["meta"])}</p>
  <p>{p["lead"]}</p>
{body}
  <p class="meta">{p["footer"]}</p>
</section>''')
    return page('Shikaku Friends Privacy Policy', 'Shikaku Friends 개인정보 처리방침 · Privacy Policy · プライバシーポリシー · 隱私權政策', '\n\n'.join(parts))


def build_support() -> str:
    parts = []
    for code, _ in LANGS:
        s = SUPPORT[code]
        faq = '\n'.join(f'  <h2>{html.escape(q)}</h2>\n  <p>{html.escape(ans)}</p>' for q, ans in s['faq'])
        parts.append(f'''<section id="{code}" lang="{code}">
  <h1>{html.escape(s["title"])}</h1>
  <p class="meta">{html.escape(s["meta"])}</p>
{faq}
  <h2>✉️</h2>
  <p>{s["contact"]}</p>
  <p class="meta">{s["privacy"]} · © 2026 {COMPANY_EN}</p>
</section>''')
    return page('Shikaku Friends Support', 'Shikaku Friends 지원 · Support · サポート · 支援', '\n\n'.join(parts))


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit('사용법: python3 tools/build_privacy_site.py <출력 폴더>')
    out = sys.argv[1]
    os.makedirs(os.path.join(out, 'support'), exist_ok=True)
    with open(os.path.join(out, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(build_policy())
    with open(os.path.join(out, 'support', 'index.html'), 'w', encoding='utf-8') as f:
        f.write(build_support())
    print(f'{out}/index.html, {out}/support/index.html')


if __name__ == '__main__':
    main()

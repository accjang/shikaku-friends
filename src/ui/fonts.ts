// 둥근 글꼴 고르기. 앱 글자는 모두 fontFamily 'Round'(src/ui/theme.ts FONT.round)를 쓰고,
// 앱을 켤 때 그 언어에 맞는 파일을 'Round'라는 이름으로 불러오고, 언어를 바꿔 글꼴 종류가 달라지면 내렸다가 다시 불러온다.
// - Jua: 한글·기본 영문(악센트 없음) — ko·en·id·ms·fil·sw, 일·중은 한자·가나를 기기 글꼴로 대신 그린다.
// - Nunito ExtraBold: 악센트 라틴·베트남어·키릴 — es·pt·fr·vi·tr·uk, 그리고 태국·인도계·아랍·히브리 문자 언어(숫자·영문만 Nunito, 그 문자는 기기 글꼴).
import { Jua_400Regular } from '@expo-google-fonts/jua';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import * as Font from 'expo-font';

import { fontKindFor, type Locale } from '@/core/i18n';

import { FONT } from './theme';

let loaded: 'jua' | 'nunito' | null = null;

export async function loadRoundFont(locale: Locale): Promise<void> {
  const kind = fontKindFor(locale);
  if (loaded === kind) return;
  try {
    if (loaded !== null) await Font.unloadAsync(FONT.round);
    await Font.loadAsync({ [FONT.round]: kind === 'jua' ? Jua_400Regular : Nunito_800ExtraBold });
    loaded = kind;
  } catch {
    // 글꼴 없이도 앱은 뜬다(시스템 글꼴)
  }
}

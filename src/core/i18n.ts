// 문구(ko/en/ja/zh). 키가 빠진 언어는 영어 → 한국어 순으로 대신 쓴다. {name} 자리에 값을 넣는다.
import type { CharacterId } from './chapters';

export type Locale = 'ko' | 'en' | 'ja' | 'zh';
export const LOCALES: readonly Locale[] = ['ko', 'en', 'ja', 'zh'];
export const LOCALE_NAMES: Record<Locale, string> = { ko: '한국어', en: 'English', ja: '日本語', zh: '简体中文' };

const ko = {
  appName: '시카쿠 프렌즈',
  tagline: '숫자만큼 네모를 그려요',
  play: '이어하기',
  playFirst: '시작하기',
  stages: '스테이지',
  daily: '오늘의 퍼즐',
  dailyDone: '오늘 완료!',
  streak: '{n}일 연속',
  settings: '설정',
  howTo: '게임 방법',
  chapter: '챕터 {n}',
  chapterTitle1: '냥이의 방',
  chapterTitle2: '판다의 대나무숲',
  chapterTitle3: '토끼의 당근밭',
  locked: '잠김',
  unlockHint: '앞 챕터에서 {n}개 클리어하면 열려요',
  stage: '스테이지 {id}',
  hints: '힌트',
  hintsLeft: '힌트 {n}개',
  undo: '되돌리기',
  reset: '처음부터',
  resetConfirm: '판을 비울까요?',
  cancel: '취소',
  ok: '확인',
  clear: '클리어!',
  time: '시간',
  best: '최고 기록',
  newBest: '신기록!',
  next: '다음 스테이지',
  retry: '다시 하기',
  toStages: '스테이지 목록',
  home: '홈',
  chapterUnlocked: '새 챕터가 열렸어요!',
  dailyReward: '오늘의 보상: 힌트 +{n}',
  noHints: '힌트가 없어요',
  watchAd: '광고 보고 힌트 {n}개 받기',
  adNotReady: '지금은 광고를 불러올 수 없어요. 잠시 후 다시 해 주세요.',
  removeAds: '광고 제거',
  removeAdsDesc: '전면 광고가 사라지고 힌트 {n}개를 드려요',
  restore: '구매 복원',
  restored: '구매를 복원했어요',
  nothingToRestore: '복원할 구매가 없어요',
  purchased: '구매 완료! 고마워요',
  purchaseFailed: '구매하지 못했어요',
  adFreeOn: '광고 제거됨',
  sound: '효과음',
  haptics: '진동',
  language: '언어',
  privacy: '개인정보처리방침',
  adPrivacy: '광고 개인정보 옵션',
  contact: '문의하기',
  version: '버전 {v}',
  rule1: '판을 네모(직사각형)로 나눠요.',
  rule2: '네모 하나에는 숫자가 딱 하나 들어가요.',
  rule3: '숫자 = 그 네모의 칸 수예요.',
  ruleDrag: '칸을 드래그해서 네모를 그리고, 네모를 탭하면 지워져요.',
  tutorialTitle: '연습해 볼까요?',
  tutorialDone: '좋아요! 이제 진짜 시작!',
  start: '시작',
  skip: '건너뛰기',
} as const;

export type StringKey = keyof typeof ko;
type Dict = Partial<Record<StringKey, string>>;

const en: Dict = {
  appName: 'Shikaku Friends',
  tagline: 'Draw boxes that match the numbers',
  play: 'Continue',
  playFirst: 'Start',
  stages: 'Stages',
  daily: 'Daily Puzzle',
  dailyDone: 'Done today!',
  streak: '{n}-day streak',
  settings: 'Settings',
  howTo: 'How to play',
  chapter: 'Chapter {n}',
  chapterTitle1: "Kitty's Room",
  chapterTitle2: "Panda's Bamboo Grove",
  chapterTitle3: "Bunny's Carrot Patch",
  locked: 'Locked',
  unlockHint: 'Clear {n} stages in the previous chapter to unlock',
  stage: 'Stage {id}',
  hints: 'Hints',
  hintsLeft: '{n} hints',
  undo: 'Undo',
  reset: 'Restart',
  resetConfirm: 'Clear the board?',
  cancel: 'Cancel',
  ok: 'OK',
  clear: 'Clear!',
  time: 'Time',
  best: 'Best',
  newBest: 'New record!',
  next: 'Next stage',
  retry: 'Play again',
  toStages: 'Stage list',
  home: 'Home',
  chapterUnlocked: 'A new chapter is open!',
  dailyReward: "Today's reward: +{n} hint",
  noHints: 'No hints left',
  watchAd: 'Watch an ad for {n} hints',
  adNotReady: "Couldn't load an ad right now. Please try again later.",
  removeAds: 'Remove ads',
  removeAdsDesc: 'No more full-screen ads, plus {n} hints',
  restore: 'Restore purchases',
  restored: 'Purchases restored',
  nothingToRestore: 'Nothing to restore',
  purchased: 'Thank you for your purchase!',
  purchaseFailed: "The purchase didn't go through",
  adFreeOn: 'Ads removed',
  sound: 'Sound effects',
  haptics: 'Vibration',
  language: 'Language',
  privacy: 'Privacy policy',
  adPrivacy: 'Ad privacy options',
  contact: 'Contact us',
  version: 'Version {v}',
  rule1: 'Divide the board into rectangles.',
  rule2: 'Each rectangle holds exactly one number.',
  rule3: 'The number = how many cells the rectangle covers.',
  ruleDrag: 'Drag across cells to draw. Tap a rectangle to erase it.',
  tutorialTitle: "Let's practice!",
  tutorialDone: "Great! Let's begin!",
  start: 'Start',
  skip: 'Skip',
};

const ja: Dict = {
  appName: 'シカクフレンズ',
  tagline: '数字の数だけ四角を描こう',
  play: 'つづきから',
  playFirst: 'はじめる',
  stages: 'ステージ',
  daily: '今日のパズル',
  dailyDone: '今日はクリア！',
  streak: '{n}日連続',
  settings: '設定',
  howTo: '遊び方',
  chapter: 'チャプター {n}',
  chapterTitle1: 'ネコのお部屋',
  chapterTitle2: 'パンダの竹林',
  chapterTitle3: 'ウサギのにんじん畑',
  locked: 'ロック中',
  unlockHint: '前のチャプターで{n}ステージクリアすると開きます',
  stage: 'ステージ {id}',
  hints: 'ヒント',
  hintsLeft: 'ヒント {n}',
  undo: '戻す',
  reset: 'やり直し',
  resetConfirm: '盤面を消しますか？',
  cancel: 'キャンセル',
  ok: 'OK',
  clear: 'クリア！',
  time: 'タイム',
  best: 'ベスト',
  newBest: '新記録！',
  next: '次のステージ',
  retry: 'もう一度',
  toStages: 'ステージ一覧',
  home: 'ホーム',
  chapterUnlocked: '新しいチャプターが開きました！',
  dailyReward: '今日のごほうび：ヒント +{n}',
  noHints: 'ヒントがありません',
  watchAd: '広告を見てヒント{n}個もらう',
  adNotReady: '広告を読み込めませんでした。しばらくしてからお試しください。',
  removeAds: '広告を削除',
  removeAdsDesc: '全画面広告がなくなり、ヒント{n}個つき',
  restore: '購入を復元',
  restored: '購入を復元しました',
  nothingToRestore: '復元する購入はありません',
  purchased: 'ご購入ありがとうございます！',
  purchaseFailed: '購入できませんでした',
  adFreeOn: '広告削除済み',
  sound: '効果音',
  haptics: '振動',
  language: '言語',
  privacy: 'プライバシーポリシー',
  adPrivacy: '広告のプライバシー設定',
  contact: 'お問い合わせ',
  version: 'バージョン {v}',
  rule1: '盤面を長方形に分けます。',
  rule2: '長方形には数字がちょうど1つ入ります。',
  rule3: '数字 = その長方形のマスの数です。',
  ruleDrag: 'マスをドラッグして描き、長方形をタップで消します。',
  tutorialTitle: '練習してみよう！',
  tutorialDone: 'いいね！本番スタート！',
  start: 'スタート',
  skip: 'スキップ',
};

const zh: Dict = {
  appName: '方块朋友',
  tagline: '按数字画出方块',
  play: '继续',
  playFirst: '开始',
  stages: '关卡',
  daily: '每日谜题',
  dailyDone: '今日已完成！',
  streak: '连续{n}天',
  settings: '设置',
  howTo: '玩法',
  chapter: '第{n}章',
  chapterTitle1: '小猫的房间',
  chapterTitle2: '熊猫的竹林',
  chapterTitle3: '兔子的萝卜田',
  locked: '未解锁',
  unlockHint: '在上一章通关{n}关即可解锁',
  stage: '关卡 {id}',
  hints: '提示',
  hintsLeft: '提示 {n}',
  undo: '撤销',
  reset: '重来',
  resetConfirm: '清空棋盘吗？',
  cancel: '取消',
  ok: '确定',
  clear: '通关！',
  time: '用时',
  best: '最佳',
  newBest: '新纪录！',
  next: '下一关',
  retry: '再玩一次',
  toStages: '关卡列表',
  home: '首页',
  chapterUnlocked: '新章节已解锁！',
  dailyReward: '今日奖励：提示 +{n}',
  noHints: '没有提示了',
  watchAd: '看广告获得{n}个提示',
  adNotReady: '暂时无法加载广告，请稍后再试。',
  removeAds: '去除广告',
  removeAdsDesc: '不再显示全屏广告，并赠送{n}个提示',
  restore: '恢复购买',
  restored: '已恢复购买',
  nothingToRestore: '没有可恢复的购买',
  purchased: '感谢购买！',
  purchaseFailed: '购买未完成',
  adFreeOn: '已去除广告',
  sound: '音效',
  haptics: '振动',
  language: '语言',
  privacy: '隐私政策',
  adPrivacy: '广告隐私选项',
  contact: '联系我们',
  version: '版本 {v}',
  rule1: '把棋盘分成若干长方形。',
  rule2: '每个长方形里正好有一个数字。',
  rule3: '数字 = 该长方形的格子数。',
  ruleDrag: '拖动格子来画长方形，点击长方形可擦除。',
  tutorialTitle: '先练习一下吧！',
  tutorialDone: '太棒了！正式开始！',
  start: '开始',
  skip: '跳过',
};

const DICTS: Record<Locale, Dict> = { ko, en, ja, zh };

export function translate(locale: Locale, key: StringKey, vars?: Record<string, string | number>): string {
  const raw = DICTS[locale][key] ?? en[key] ?? ko[key];
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** 기기 언어 태그(예: "ko-KR", "zh-Hans-CN") → 지원 언어. 모르면 영어. */
export function pickLocale(tags: readonly string[]): Locale {
  for (const tag of tags) {
    const base = tag.toLowerCase().split(/[-_]/)[0];
    if ((LOCALES as readonly string[]).includes(base)) return base as Locale;
  }
  return 'en';
}

// ── 캐릭터 이름·대사 ──

export type Mood = 'start' | 'good' | 'bad' | 'hint' | 'clear';

export const CHARACTER_NAMES: Record<CharacterId, Record<Locale, string>> = {
  cat: { ko: '냥이', en: 'Kitty', ja: 'ニャン', zh: '小猫' },
  panda: { ko: '판다', en: 'Panda', ja: 'パンダ', zh: '熊猫' },
  rabbit: { ko: '토끼', en: 'Bunny', ja: 'ウサギ', zh: '兔兔' },
};

// 냥이: 츤데레, 판다: 느긋, 토끼: 발랄
const LINES: Record<CharacterId, Record<Locale, Record<Mood, string[]>>> = {
  cat: {
    ko: {
      start: ['흥, 풀 수 있겠어?', '이 정도는 쉽다냥.'],
      good: ['…제법인걸.', '나쁘지 않다냥.', '흥, 우연이겠지.'],
      bad: ['숫자랑 칸 수가 안 맞잖아.', '그건 아니다냥.'],
      hint: ['이번만 알려주는 거다냥.'],
      clear: ['…잘했어. 조금은.', '흥! 칭찬해 줄게.'],
    },
    en: {
      start: ['Hmph. Think you can solve it?', 'This one is easy, meow.'],
      good: ['...Not bad.', 'Hmph, lucky guess.', 'Acceptable, meow.'],
      bad: ["The number and size don't match.", 'Nope, meow.'],
      hint: ["Just this once, meow."],
      clear: ['...Well done. A little.', 'Hmph! I suppose that was good.'],
    },
    ja: {
      start: ['ふん、解けるのかニャ？', 'これくらい簡単だニャ。'],
      good: ['…なかなかやるニャ。', 'ふん、まぐれだニャ。'],
      bad: ['数字とマスの数が合ってないニャ。', 'それは違うニャ。'],
      hint: ['今回だけ教えてやるニャ。'],
      clear: ['…よくやったニャ。少しだけ。', 'ふん！ほめてやるニャ。'],
    },
    zh: {
      start: ['哼，你能解开吗？', '这点小事喵。'],
      good: ['…还不错嘛。', '哼，运气好而已喵。'],
      bad: ['数字和格子数不对喵。', '不是这样喵。'],
      hint: ['就告诉你这一次喵。'],
      clear: ['…做得好。一点点。', '哼！就夸你一下喵。'],
    },
  },
  panda: {
    ko: {
      start: ['천천히 해도 돼~', '대나무 먹으면서 풀어볼까?'],
      good: ['오, 딱 맞아!', '좋아~ 그거야.', '음~ 깔끔해.'],
      bad: ['음… 다시 볼까?', '숫자를 한 번 더 세어 봐~'],
      hint: ['여기부터 해 보자~'],
      clear: ['와~ 다 했다! 냠냠 축하해!', '최고야~'],
    },
    en: {
      start: ['Take your time~', 'Shall we solve it over some bamboo?'],
      good: ['Oh, perfect fit!', "Nice~ that's it.", 'Mm, so tidy.'],
      bad: ['Hmm... look again?', 'Count the cells once more~'],
      hint: ["Let's start here~"],
      clear: ['Yay~ all done! Munch munch!', "You're the best~"],
    },
    ja: {
      start: ['ゆっくりでいいよ〜', '竹を食べながら解こうか？'],
      good: ['おっ、ぴったり！', 'いいね〜それそれ。'],
      bad: ['うーん…もう一回見てみよう？', 'マスをもう一度数えてみて〜'],
      hint: ['ここから始めよう〜'],
      clear: ['わ〜い、できた！もぐもぐおめでとう！', '最高〜'],
    },
    zh: {
      start: ['慢慢来~', '边吃竹子边解吧？'],
      good: ['哦，刚刚好！', '不错~就是这样。'],
      bad: ['嗯…再看看？', '再数一遍格子吧~'],
      hint: ['从这里开始吧~'],
      clear: ['哇~完成啦！吧唧吧唧恭喜！', '最棒了~'],
    },
  },
  rabbit: {
    ko: {
      start: ['좋아좋아, 시작이다!', '깡총! 같이 풀자!'],
      good: ['좋아좋아!', '깡총! 정답!', '와, 대단해!'],
      bad: ['앗, 숫자랑 칸 수가 달라!', '으앗, 다시 해 보자!'],
      hint: ['여기 봐, 여기!'],
      clear: ['깡총깡총! 완성이다!', '우리 최고야!'],
    },
    en: {
      start: ["Yay, let's go!", "Hop hop! Let's solve it together!"],
      good: ['Yes yes!', 'Hop! Correct!', 'Wow, amazing!'],
      bad: ["Oops, that size doesn't match!", "Eek, let's try again!"],
      hint: ['Look here, here!'],
      clear: ['Hop hop! Finished!', "We're the best!"],
    },
    ja: {
      start: ['よーし、スタート！', 'ぴょん！一緒に解こう！'],
      good: ['いいね いいね！', 'ぴょん！正解！'],
      bad: ['あっ、数字とマスの数が違う！', 'うわっ、もう一回！'],
      hint: ['ここ見て、ここ！'],
      clear: ['ぴょんぴょん！完成！', 'わたしたち最高！'],
    },
    zh: {
      start: ['好耶，开始啦！', '蹦蹦！一起解吧！'],
      good: ['好耶好耶！', '蹦！答对了！'],
      bad: ['哎呀，数字和格子数不一样！', '呜哇，再来一次！'],
      hint: ['看这里，这里！'],
      clear: ['蹦蹦跳跳！完成啦！', '我们最棒了！'],
    },
  },
};

export function characterLine(ch: CharacterId, locale: Locale, mood: Mood, pick: number): string {
  const lines = LINES[ch][locale][mood];
  return lines[Math.abs(Math.floor(pick)) % lines.length];
}

/** 기준(한국어) 문구 전체(테스트용). */
export function translateKeys(): Record<StringKey, string> {
  return ko;
}

/** 그 언어에 빠진 문구 키(테스트용). */
export function missingKeys(locale: Locale): StringKey[] {
  return (Object.keys(ko) as StringKey[]).filter((k) => DICTS[locale][k] === undefined);
}

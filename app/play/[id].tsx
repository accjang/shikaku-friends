// 게임 화면. id = 스테이지("1-07") 또는 "daily"(오늘의 퍼즐).
// 위: 머리줄(뒤로·제목·시간) → 캐릭터+말풍선 → 하트 → 판 → 아래 도구(되돌리기·처음부터·힌트).
// 정답이 아닌 네모(크기·숫자는 맞음)는 놓지 않고 하트를 깎는다. 하트를 다 쓰고 또 틀리면 실패 창(다시 하기·광고로 이어하기).
// 다 풀면 축하 → 결과 창. "다음"을 누를 때 차례면 전면 광고(src/core/adPolicy.ts).
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, Platform, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { CHAPTERS, chapterById, levelCount, levelId, parseLevelId, type CharacterId } from '@/core/chapters';
import { BUBBLE_MS, CLEAR_DELAY_MS, DAILY_STREAK_REWARDS, MISTAKE_ALLOWANCE, MISTAKE_FLASH_MS, REWARDED_HINTS } from '@/core/config';
import { dailyPuzzle, dateKey } from '@/core/daily';
import { dailyShareText, stageShareText } from '@/core/share';
import { companionFor, newlyUnlockedProp, stagesCleared, type PropId } from '@/core/village';
import { applyHint, attemptPlace, clearAll, continueGame, heartsLeft, newGame, removeAt, undo, type GameState } from '@/core/game';
import { characterLine, PROP_NAMES, type Mood } from '@/core/i18n';
import { unpack, type PackedPuzzle } from '@/core/levelCodec';
import { addHints, recordDailyClear, recordLevelClear, spendHint, streakCycleDay } from '@/core/progress';
import { shouldOfferAdFree } from '@/core/adPolicy';
import { coverage, validClueIndex, type Puzzle, type Rect } from '@/core/puzzle';
import { maybeShowInterstitial, noteAdFreeOffered, showRewarded, useAdStore } from '@/data/ads';
import { useProgressStore } from '@/data/progressStore';
import { useSettingsStore } from '@/data/settingsStore';
import { buyAdFree, usePurchaseStore } from '@/data/purchases';
import { Board } from '@/ui/Board';
import { Celebration } from '@/ui/Celebration';
import { postcard } from '@/ui/postcards';
import { propImage } from '@/ui/props';
import { IconButton } from '@/ui/Button';
import { buzz, playSfx } from '@/ui/feedback';
import { Mascot } from '@/ui/Mascot';
import { Screen } from '@/ui/Screen';
import { ClearSheet, FailSheet, formatTime, NoHintSheet } from '@/ui/Sheets';
import { CHARACTER_THEME, colors, FONT, space } from '@/ui/theme';
import { useT } from '@/ui/useT';

import levelsJson from '../../content/levels.json';

const LEVELS = levelsJson as unknown as Record<string, PackedPuzzle>;
const DAILY_CHARACTERS: CharacterId[] = ['cat', 'panda', 'rabbit', 'shiba', 'duck'];
/** 하트 줄 높이(판 크기 계산에 뺀다). */
const HEARTS_ROW = 28;

interface Session {
  key: string;
  puzzle: Puzzle;
  character: CharacterId;
  title: string;
  kind: 'level' | 'daily';
  chapter: number;
  level: number;
}

function useSession(id: string, t: ReturnType<typeof useT>['t']): Session | null {
  return useMemo(() => {
    if (id === 'daily') {
      const key = dateKey(new Date());
      const day = Number(key.slice(-2));
      return { key, puzzle: dailyPuzzle(key), character: DAILY_CHARACTERS[day % DAILY_CHARACTERS.length], title: t('daily'), kind: 'daily', chapter: 0, level: 0 };
    }
    const parsed = parseLevelId(id);
    const packed = LEVELS[id];
    const ch = parsed ? chapterById(parsed.chapter) : undefined;
    if (!parsed || !packed || !ch) return null;
    return { key: id, puzzle: unpack(packed), character: ch.character, title: t('stage', { id }), kind: 'level', chapter: ch.id, level: parsed.level };
  }, [id, t]);
}

/** 앱이 앞에 있을 때만 흐르는 시계. */
function useStopwatch(running: boolean): number {
  const [ms, setMs] = useState(0);
  const base = useRef(0);
  const since = useRef<number | null>(null);
  useEffect(() => {
    const start = (): void => {
      if (since.current === null) since.current = Date.now();
    };
    const stop = (): void => {
      if (since.current !== null) base.current += Date.now() - since.current;
      since.current = null;
    };
    if (!running) {
      stop();
      setMs(base.current);
      return;
    }
    if (AppState.currentState === 'active' || Platform.OS === 'web') start();
    const sub = AppState.addEventListener('change', (s) => (s === 'active' ? start() : stop()));
    const timer = setInterval(() => setMs(base.current + (since.current ? Date.now() - since.current : 0)), 500);
    return () => {
      sub.remove();
      clearInterval(timer);
      stop();
    };
  }, [running]);
  return ms;
}

export default function Play() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useT();
  const session = useSession(id, t);
  // "다시 하기"는 게임 화면을 새로 띄운다(판·시계·말풍선 모두 처음부터)
  const [round, setRound] = useState(0);
  if (!session) {
    return (
      <Screen back title="?">
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Not found</Text>
      </Screen>
    );
  }
  return <Game key={`${session.key}:${round}`} session={session} t={t} locale={locale} onRestart={() => setRound((r) => r + 1)} />;
}

interface GameProps {
  session: Session;
  t: ReturnType<typeof useT>['t'];
  locale: ReturnType<typeof useT>['locale'];
  onRestart(): void;
}

function Game({ session, t, locale, onRestart }: GameProps) {
  const { puzzle } = session;
  // 안내 친구는 판을 시작할 때 정한다(고른 친구가 마을에 있으면 그 친구, 아니면 챕터 친구)
  const [character] = useState(() =>
    companionFor(useProgressStore.getState().progress, useSettingsStore.getState().companion, session.character),
  );
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const progress = useProgressStore((s) => s.progress);
  const updateProgress = useProgressStore((s) => s.update);
  const adFree = usePurchaseStore((s) => s.adFree);
  const purchaseMode = usePurchaseStore((s) => s.mode);
  const price = usePurchaseStore((s) => s.price);
  const rewardedLoaded = useAdStore((s) => s.rewardedLoaded);

  const [game, setGame] = useState<GameState>(newGame);
  const [mood, setMood] = useState<Mood>('start');
  const [beat, setBeat] = useState(0);
  const [line, setLine] = useState<string | null>(() => characterLine(character, locale, 'start', Math.random() * 10));
  const [showClear, setShowClear] = useState(false);
  const [noHint, setNoHint] = useState(false);
  const [adBusy, setAdBusy] = useState(false);
  const [offerAdFree, setOfferAdFree] = useState(false);
  /** 방금 실수한 네모(잠깐 빨갛게). */
  const [flash, setFlash] = useState<Rect | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [result, setResult] = useState<{
    stars: number | null;
    ms: number;
    best: number | null;
    newBest: boolean;
    notes: string[];
    reward: PropId | null;
    share: string;
    /** 오늘의 퍼즐 7일 주기 안 오늘 위치(처음 깬 날만). */
    streakDay: number | null;
  } | null>(null);
  const ms = useStopwatch(!game.solved && !game.failed);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const theme = CHARACTER_THEME[character];

  const react = useCallback(
    (m: Mood, keep = false) => {
      setMood(m);
      setBeat((b) => b + 1);
      setLine(characterLine(character, locale, m, Math.random() * 10));
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      if (!keep) bubbleTimer.current = setTimeout(() => setLine(null), BUBBLE_MS);
    },
    [character, locale],
  );
  useEffect(() => {
    bubbleTimer.current = setTimeout(() => setLine(null), BUBBLE_MS * 1.5);
    return () => {
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  // 판 크기: 화면 폭과 남은 높이에 맞춘다
  const reserved = 52 + 120 + HEARTS_ROW + 100 + insets.top + insets.bottom + 24;
  const cell = Math.floor(Math.min((Math.min(width, 560) - space.lg * 2 - 12) / puzzle.w, (height - reserved) / puzzle.h, 64));

  const finish = useCallback(
    (state: GameState) => {
      playSfx('clear');
      buzz('success');
      react('clear', true);
      const elapsed = ms;
      const notes: string[] = [];
      let stars: number | null = null;
      let best: number | null = null;
      let newBest = false;
      let share = '';
      let streakDay: number | null = null;
      const clearedBefore = stagesCleared(progress);
      if (session.kind === 'level') {
        const out = recordLevelClear(progress, session.key, state.hintsUsed, elapsed);
        useProgressStore.getState().set(out.progress);
        stars = out.stars;
        best = out.progress.levels[session.key].bestMs;
        newBest = out.newBest && !!progress.levels[session.key];
        if (out.unlockedChapter) notes.push(t('chapterUnlocked'));
        share = stageShareText(locale, { id: session.key, stars: out.stars, ms: elapsed });
      } else {
        const out = recordDailyClear(progress, session.key, elapsed);
        useProgressStore.getState().set(out.progress);
        best = out.progress.daily[session.key];
        if (out.reward > 0) notes.push(t('dailyReward', { d: out.streak, n: out.reward }));
        streakDay = out.reward > 0 ? streakCycleDay(out.streak) : null;
        share = dailyShareText(locale, {
          dateKey: session.key,
          ms: elapsed,
          hintsUsed: state.hintsUsed,
          streak: out.streak,
        });
      }
      // 스테이지 10개마다 마을 소품 하나
      const reward = newlyUnlockedProp(clearedBefore, stagesCleared(useProgressStore.getState().progress));
      setResult({ stars, ms: elapsed, best, newBest, notes, reward, share, streakDay });
      // 광고를 몇 번 본 사람에게만 클리어 창 아래 작은 "광고 제거" 버튼(하루 한 번)
      const today = dateKey(new Date());
      const ad = useAdStore.getState();
      const purchase = usePurchaseStore.getState();
      if (
        shouldOfferAdFree({
          adFree: purchase.adFree,
          canPurchase: purchase.mode !== 'disabled',
          interstitialsShown: ad.interstitialsShown,
          lastOfferDay: ad.lastOfferDay,
          today,
        })
      ) {
        setOfferAdFree(true);
        noteAdFreeOffered(today);
      }
      setTimeout(() => setShowClear(true), CLEAR_DELAY_MS);
    },
    [locale, ms, progress, react, session, t],
  );

  const commit = useCallback(
    (next: GameState, placed?: Rect) => {
      if (next === game) return;
      setGame(next);
      if (next.solved) {
        finish(next);
        return;
      }
      if (placed) {
        if (validClueIndex(puzzle, placed) >= 0) {
          playSfx('place');
          buzz('light');
          if (Math.random() < 0.45) react('good');
        } else {
          playSfx('wrong');
          buzz('error');
          // 숫자가 하나 들어 있는데 크기가 틀렸을 때만 지적(빈 칸 채우기 중에는 조용히)
          const inside = puzzle.clues.filter((c) => c.x >= placed.x && c.x < placed.x + placed.w && c.y >= placed.y && c.y < placed.y + placed.h);
          if (inside.length >= 1) react('bad');
        }
      }
    },
    [finish, game, puzzle, react],
  );

  const onPlace = useCallback(
    (r: Rect) => {
      const { state: next, mistake } = attemptPlace(game, puzzle, r);
      if (!mistake) {
        commit(next, r);
        return;
      }
      setGame(next);
      setFlash(r);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlash(null), MISTAKE_FLASH_MS);
      playSfx('wrong');
      buzz('error');
      react('bad');
    },
    [commit, game, puzzle, react],
  );
  const onRemove = useCallback(
    (x: number, y: number) => {
      playSfx('erase');
      commit(removeAt(game, puzzle, x, y));
    },
    [commit, game, puzzle],
  );
  const onDragStep = useCallback(() => buzz('light'), []);

  const onHint = (): void => {
    if (game.solved) return;
    const spent = spendHint(progress);
    if (!spent) {
      setNoHint(true);
      return;
    }
    updateProgress(() => spent);
    playSfx('hint');
    react('hint');
    commit(applyHint(game, puzzle));
  };

  const onWatchAd = async (): Promise<void> => {
    setAdBusy(true);
    const earned = await showRewarded();
    setAdBusy(false);
    if (earned) {
      updateProgress((p) => addHints(p, REWARDED_HINTS));
      setNoHint(false);
    } else {
      Alert.alert(t('adNotReady'));
    }
  };

  // 실패 뒤 보상형 광고로 이어하기(하트를 돌려받는다)
  const onContinue = async (): Promise<void> => {
    setAdBusy(true);
    const earned = await showRewarded();
    setAdBusy(false);
    if (earned) {
      setGame((g) => continueGame(g));
      react('start');
    } else {
      Alert.alert(t('adNotReady'));
    }
  };

  const onBuy = async (): Promise<void> => {
    const r = await buyAdFree();
    if (r === 'success') {
      setNoHint(false);
      Alert.alert(t('purchased'));
    } else if (r === 'error') Alert.alert(t('purchaseFailed'));
  };

  const restart = (): void => {
    setShowClear(false);
    onRestart();
  };

  const nextTarget = (): string => {
    if (session.kind === 'daily') return '/';
    const ch = chapterById(session.chapter)!;
    if (session.level < levelCount(ch)) return `/play/${levelId(ch.id, session.level + 1)}`;
    const nextCh = CHAPTERS.find((c) => c.id === ch.id + 1);
    return nextCh ? `/stages?chapter=${nextCh.id}` : '/stages';
  };

  const goNext = async (): Promise<void> => {
    setShowClear(false);
    await maybeShowInterstitial({ adFree, totalClears: useProgressStore.getState().progress.totalClears });
    router.replace(nextTarget() as never);
  };

  const pct = Math.round(coverage(puzzle, game.rects) * 100);
  const hearts = heartsLeft(game);

  return (
    <Screen
      back
      title={session.title}
      bg={theme.soft}
      right={
        <View style={styles.timer}>
          <Text style={styles.timerText}>{formatTime(ms)}</Text>
        </View>
      }
    >
      <View style={styles.mascotRow}>
        <Mascot character={character} mood={mood} beat={beat} line={line} size={96} anim={game.solved ? 'cheer' : 'idle'} />
      </View>

      <View style={styles.hearts} accessibilityLabel={`♥ ${hearts}/${MISTAKE_ALLOWANCE}`}>
        {Array.from({ length: MISTAKE_ALLOWANCE }, (_, i) => (
          <Ionicons key={i} name={i < hearts ? 'heart' : 'heart-outline'} size={22} color={i < hearts ? colors.mistake : colors.inkSoft} />
        ))}
      </View>

      <View style={styles.boardWrap}>
        <Board
          puzzle={puzzle}
          rects={game.rects}
          cell={cell}
          disabled={game.solved || game.failed}
          celebrate={game.solved}
          flash={flash}
          picture={postcard(character)}
          onPlace={onPlace}
          onRemove={onRemove}
          onDragStep={onDragStep}
        />
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: theme.dark }]} />
        </View>
      </View>

      <View style={styles.tools}>
        <IconButton icon="arrow-undo" label={t('undo')} onPress={() => setGame(undo(game))} disabled={game.history.length === 0 || game.solved || game.failed} />
        <IconButton
          icon="trash-outline"
          label={t('reset')}
          disabled={game.rects.length === 0 || game.solved || game.failed}
          onPress={() =>
            Platform.OS === 'web'
              ? setGame(clearAll(game, puzzle))
              : Alert.alert(t('resetConfirm'), undefined, [
                  { text: t('cancel'), style: 'cancel' },
                  { text: t('ok'), style: 'destructive', onPress: () => setGame(clearAll(game, puzzle)) },
                ])
          }
        />
        <IconButton icon="bulb" label={t('hints')} badge={progress.hints} color={colors.gold} onPress={onHint} disabled={game.solved || game.failed} />
      </View>

      <Celebration active={game.solved} />
      <ClearSheet
        visible={showClear && result !== null}
        character={character}
        line={characterLine(character, locale, 'clear', beat)}
        stars={result?.stars ?? null}
        timeMs={result?.ms ?? 0}
        bestMs={result?.best ?? null}
        newBest={result?.newBest ?? false}
        notes={result?.notes ?? []}
        primaryLabel={session.kind === 'daily' ? t('home') : t('next')}
        onPrimary={() => void goNext()}
        onRetry={restart}
        listLabel={session.kind === 'daily' ? t('stages') : t('toStages')}
        reward={result?.reward ? { image: propImage(result.reward), label: t('newProp', { name: PROP_NAMES[result.reward][locale] }) } : null}
        streak={result?.streakDay ? { day: result.streakDay, rewards: [...DAILY_STREAK_REWARDS], label: t('streakTrack') } : null}
        shareLabel={t('share')}
        onShare={() => {
          if (result?.share) void Share.share({ message: result.share }).catch(() => undefined);
        }}
        offer={offerAdFree && !adFree ? { label: `${t('removeAds')}${price ? ` · ${price}` : ''}`, onPress: () => void onBuy() } : null}
        onList={() => {
          setShowClear(false);
          router.replace(session.kind === 'daily' ? '/stages' : (`/stages?chapter=${session.chapter}` as never));
        }}
      />
      <FailSheet
        visible={game.failed}
        character={character}
        adReady={rewardedLoaded}
        adBusy={adBusy}
        listLabel={session.kind === 'daily' ? t('home') : t('toStages')}
        onContinue={() => void onContinue()}
        onRetry={restart}
        onList={() => router.replace(session.kind === 'daily' ? '/' : (`/stages?chapter=${session.chapter}` as never))}
      />
      <NoHintSheet
        visible={noHint}
        character={character}
        adReady={rewardedLoaded}
        adBusy={adBusy}
        showBuy={!adFree && purchaseMode !== 'disabled'}
        price={price}
        onWatchAd={() => void onWatchAd()}
        onBuy={() => void onBuy()}
        onClose={() => setNoHint(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  timer: { backgroundColor: colors.card, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 2, borderColor: colors.line },
  timerText: { fontFamily: FONT.round, fontSize: 16, color: colors.ink, fontVariant: ['tabular-nums'] },
  mascotRow: { height: 120, justifyContent: 'center', paddingHorizontal: space.lg },
  hearts: { height: HEARTS_ROW, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  boardWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { width: 160, height: 8, borderRadius: 4, backgroundColor: 'rgba(75,63,107,0.1)', marginTop: space.md, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  tools: { flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: space.md },
});

// 게임 화면. id = 스테이지("1-07") 또는 "daily"(오늘의 퍼즐).
// 위: 머리줄(뒤로·제목·시간) → 캐릭터+말풍선 → 판 → 아래 도구(되돌리기·처음부터·힌트).
// 다 풀면 축하 → 결과 창. "다음"을 누를 때 차례면 전면 광고(src/core/adPolicy.ts).
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CHAPTERS, chapterById, levelCount, levelId, parseLevelId, type CharacterId } from '@/core/chapters';
import { BUBBLE_MS, CLEAR_DELAY_MS, DAILY_HINT_REWARD, REWARDED_HINTS } from '@/core/config';
import { dailyPuzzle, dateKey } from '@/core/daily';
import { applyHint, clearAll, newGame, place, removeAt, undo, type GameState } from '@/core/game';
import { characterLine, type Mood } from '@/core/i18n';
import { unpack, type PackedPuzzle } from '@/core/levelCodec';
import { addHints, recordDailyClear, recordLevelClear, spendHint } from '@/core/progress';
import { shouldOfferAdFree } from '@/core/adPolicy';
import { coverage, validClueIndex, type Puzzle, type Rect } from '@/core/puzzle';
import { maybeShowInterstitial, noteAdFreeOffered, showRewarded, useAdStore } from '@/data/ads';
import { useProgressStore } from '@/data/progressStore';
import { buyAdFree, usePurchaseStore } from '@/data/purchases';
import { Board } from '@/ui/Board';
import { IconButton } from '@/ui/Button';
import { buzz, playSfx } from '@/ui/feedback';
import { Mascot } from '@/ui/Mascot';
import { Screen } from '@/ui/Screen';
import { ClearSheet, formatTime, NoHintSheet } from '@/ui/Sheets';
import { CHARACTER_THEME, colors, FONT, space } from '@/ui/theme';
import { useT } from '@/ui/useT';

import levelsJson from '../../content/levels.json';

const LEVELS = levelsJson as unknown as Record<string, PackedPuzzle>;
const DAILY_CHARACTERS: CharacterId[] = ['cat', 'panda', 'rabbit', 'shiba', 'duck'];

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
  const { puzzle, character } = session;
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
  const [result, setResult] = useState<{ stars: number | null; ms: number; best: number | null; newBest: boolean; notes: string[] } | null>(null);
  const ms = useStopwatch(!game.solved);
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
    };
  }, []);

  // 판 크기: 화면 폭과 남은 높이에 맞춘다
  const reserved = 52 + 120 + 100 + insets.top + insets.bottom + 24;
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
      if (session.kind === 'level') {
        const out = recordLevelClear(progress, session.key, state.hintsUsed, elapsed);
        useProgressStore.getState().set(out.progress);
        stars = out.stars;
        best = out.progress.levels[session.key].bestMs;
        newBest = out.newBest && !!progress.levels[session.key];
        if (out.unlockedChapter) notes.push(t('chapterUnlocked'));
      } else {
        const out = recordDailyClear(progress, session.key, elapsed);
        useProgressStore.getState().set(out.progress);
        best = out.progress.daily[session.key];
        if (out.rewarded) notes.push(t('dailyReward', { n: DAILY_HINT_REWARD }));
      }
      setResult({ stars, ms: elapsed, best, newBest, notes });
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
    [ms, progress, react, session, t],
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

  const onPlace = useCallback((r: Rect) => commit(place(game, puzzle, r), r), [commit, game, puzzle]);
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
        <Mascot character={character} mood={mood} beat={beat} line={line} size={96} />
      </View>

      <View style={styles.boardWrap}>
        <Board puzzle={puzzle} rects={game.rects} cell={cell} disabled={game.solved} onPlace={onPlace} onRemove={onRemove} onDragStep={onDragStep} />
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: theme.dark }]} />
        </View>
      </View>

      <View style={styles.tools}>
        <IconButton icon="arrow-undo" label={t('undo')} onPress={() => setGame(undo(game))} disabled={game.history.length === 0 || game.solved} />
        <IconButton
          icon="trash-outline"
          label={t('reset')}
          disabled={game.rects.length === 0 || game.solved}
          onPress={() =>
            Platform.OS === 'web'
              ? setGame(clearAll(game, puzzle))
              : Alert.alert(t('resetConfirm'), undefined, [
                  { text: t('cancel'), style: 'cancel' },
                  { text: t('ok'), style: 'destructive', onPress: () => setGame(clearAll(game, puzzle)) },
                ])
          }
        />
        <IconButton icon="bulb" label={t('hints')} badge={progress.hints} color={colors.gold} onPress={onHint} disabled={game.solved} />
      </View>

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
        offer={offerAdFree && !adFree ? { label: `${t('removeAds')}${price ? ` · ${price}` : ''}`, onPress: () => void onBuy() } : null}
        onList={() => {
          setShowClear(false);
          router.replace(session.kind === 'daily' ? '/stages' : (`/stages?chapter=${session.chapter}` as never));
        }}
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
  boardWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { width: 160, height: 8, borderRadius: 4, backgroundColor: 'rgba(75,63,107,0.1)', marginTop: space.md, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  tools: { flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: space.md },
});

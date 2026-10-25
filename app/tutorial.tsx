// 첫 실행 튜토리얼: 토끼가 규칙 세 줄을 보여 주고, 4×4 연습 판을 직접 풀어 본다. 설정의 "게임 방법"에서도 다시 연다.
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { generate } from '@/core/generator';
import { newGame, place, removeAt } from '@/core/game';
import { characterLine } from '@/core/i18n';
import { validClueIndex, type Rect } from '@/core/puzzle';
import { useProgressStore } from '@/data/progressStore';
import { Board } from '@/ui/Board';
import { Button } from '@/ui/Button';
import { buzz, playSfx } from '@/ui/feedback';
import { Mascot } from '@/ui/Mascot';
import { Screen } from '@/ui/Screen';
import { CHARACTER_THEME, colors, FONT, radius, RECT_PALETTE, space } from '@/ui/theme';
import { useT } from '@/ui/useT';

const PRACTICE_SEED = 7;
const PRACTICE = { w: 4, h: 4, minArea: 2, maxArea: 4, maxSide: 4 };

export default function Tutorial() {
  const { t, locale } = useT();
  const puzzle = useMemo(() => generate(PRACTICE_SEED, PRACTICE)!, []);
  const [step, setStep] = useState<'rules' | 'practice'>('rules');
  const [game, setGame] = useState(newGame);
  const [beat, setBeat] = useState(0);
  const done = game.solved;

  const finish = (): void => {
    useProgressStore.getState().update((p) => ({ ...p, tutorialDone: true }));
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const onPlace = (r: Rect): void => {
    const next = place(game, puzzle, r);
    setGame(next);
    setBeat((b) => b + 1);
    if (next.solved) {
      playSfx('clear');
      buzz('success');
    } else if (validClueIndex(puzzle, r) >= 0) playSfx('place');
    else playSfx('wrong');
  };

  const line =
    step === 'rules' ? t('tutorialTitle') : done ? t('tutorialDone') : beat > 0 ? characterLine('rabbit', locale, 'good', beat) : t('ruleDrag');

  return (
    <Screen bg={CHARACTER_THEME.rabbit.soft}>
      <View style={styles.top}>
        <View style={{ flex: 1 }} />
        <Pressable onPress={finish} hitSlop={10}>
          <Text style={styles.skip}>{t('skip')}</Text>
        </Pressable>
      </View>
      <View style={styles.mascot}>
        <Mascot character="rabbit" mood={done ? 'clear' : 'good'} beat={done ? beat : 0} line={line} size={110} anim={done ? 'cheer' : 'idle'} />
      </View>

      {step === 'rules' ? (
        <View style={styles.body}>
          {[t('rule1'), t('rule2'), t('rule3'), t('ruleDrag')].map((text, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(150 * i)} style={styles.ruleRow}>
              <View style={[styles.ruleNum, { backgroundColor: RECT_PALETTE[i] }]}>
                <Text style={styles.ruleNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.ruleText}>{text}</Text>
            </Animated.View>
          ))}
          <View style={{ flex: 1 }} />
          <Button label={t('start')} icon="arrow-forward" onPress={() => setStep('practice')} />
        </View>
      ) : (
        <View style={styles.body}>
          <View style={styles.boardWrap}>
            <Board
              puzzle={puzzle}
              rects={game.rects}
              cell={68}
              disabled={done}
              onPlace={onPlace}
              onRemove={(x, y) => {
                playSfx('erase');
                setGame(removeAt(game, puzzle, x, y));
              }}
            />
          </View>
          {done ? <Button label={t('start')} icon="play" onPress={finish} /> : <View style={{ height: 63 }} />}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', paddingHorizontal: space.lg, paddingTop: space.sm, height: 40 },
  skip: { fontFamily: FONT.round, fontSize: 16, color: colors.inkSoft },
  mascot: { paddingHorizontal: space.lg, height: 140, justifyContent: 'center' },
  body: { flex: 1, paddingHorizontal: space.xl, paddingBottom: space.xl },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm,
    gap: space.md,
  },
  ruleNum: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  ruleNumText: { fontFamily: FONT.round, fontSize: 18, color: colors.ink },
  ruleText: { flex: 1, fontFamily: FONT.round, fontSize: 17, color: colors.ink, lineHeight: 24 },
  boardWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

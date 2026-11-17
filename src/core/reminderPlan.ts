// 오늘의 퍼즐 알림 계획(UI 없음). 기기 안 로컬 알림만 쓴다(서버·원격 푸시 없음). 예약은 src/data/reminders.ts.
// 앞으로 REMINDER_PLAN_DAYS일 동안 날마다 REMINDER_HOUR시에 하나씩. 오늘 것을 이미 풀었거나 시각이 지났으면 오늘은 건너뛴다.
// 첫 알림에만 연속 일수를 담는다(그 뒤 날들은 그때의 연속 일수를 알 수 없어 일반 문구). 앱을 열거나 퍼즐을 풀 때마다 다시 계획한다.
import { REMINDER_HOUR, REMINDER_ID_PREFIX, REMINDER_PLAN_DAYS } from './config';
import { dateKey, prevDateKey } from './daily';
import { translate, type Locale } from './i18n';
import { dailyStreak, type Progress } from './progress';

export interface PlannedReminder {
  /** REMINDER_ID_PREFIX + 날짜 키. */
  id: string;
  fireAt: Date;
  title: string;
  body: string;
}

export function planReminders(p: Progress, now: Date, locale: Locale): PlannedReminder[] {
  const out: PlannedReminder[] = [];
  const today = dateKey(now);
  const streak = dailyStreak(p, today, prevDateKey);
  for (let i = 0; i < REMINDER_PLAN_DAYS; i++) {
    const fireAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, REMINDER_HOUR, 0, 0);
    const key = dateKey(fireAt);
    if (fireAt.getTime() <= now.getTime() || key in p.daily) continue;
    // 연속 중이면 첫 알림은 "끊기기 전에", 나머지는 일반 문구
    const first = out.length === 0;
    out.push({
      id: REMINDER_ID_PREFIX + key,
      fireAt,
      title: translate(locale, 'reminderTitle'),
      body: first && streak > 0 ? translate(locale, 'reminderStreakBody', { n: streak }) : translate(locale, 'reminderBody'),
    });
  }
  return out;
}

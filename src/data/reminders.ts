// 오늘의 퍼즐 알림(expo-notifications, 기기 안 로컬 알림). 계획은 src/core/reminderPlan.ts.
// 웹·모듈이 없는 환경에서는 아무것도 하지 않고, 실패는 조용히 넘긴다(알림 때문에 게임이 멈추면 안 된다).
import { Platform } from 'react-native';

import { REMINDER_ID_PREFIX } from '@/core/config';
import { planReminders } from '@/core/reminderPlan';

import { useProgressStore } from './progressStore';
import { deviceLocale, useSettingsStore } from './settingsStore';

type NotificationsModule = typeof import('expo-notifications');

function load(): NotificationsModule | null {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications') as NotificationsModule;
  } catch {
    return null;
  }
}

let handlerSet = false;
function ensureHandler(n: NotificationsModule): void {
  if (handlerSet) return;
  handlerSet = true;
  try {
    // 앱이 앞에 떠 있을 때는 배너를 띄우지 않는다(이미 게임 중)
    n.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: false, shouldShowList: false, shouldPlaySound: false, shouldSetBadge: false }),
    });
  } catch {
    // 지원 안 되는 환경
  }
}

/** 이 기기에서 알림을 쓸 수 있는지. */
export function remindersSupported(): boolean {
  return load() !== null;
}

/** 권한을 묻는다(이미 허락됐으면 묻지 않는다). 허락이면 true. */
export async function requestReminderPermission(): Promise<boolean> {
  const n = load();
  if (!n) return false;
  try {
    const cur = await n.getPermissionsAsync();
    if (cur.granted) return true;
    if (!cur.canAskAgain) return false;
    return (await n.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

async function cancelAll(n: NotificationsModule): Promise<void> {
  try {
    for (const s of await n.getAllScheduledNotificationsAsync()) {
      if (s.identifier.startsWith(REMINDER_ID_PREFIX)) await n.cancelScheduledNotificationAsync(s.identifier).catch(() => undefined);
    }
  } catch {
    // 목록을 못 읽으면 그만
  }
}

/** 지금 상태(설정·진행 기록·언어)로 알림을 다시 예약한다. 꺼져 있거나 권한이 없으면 예약을 지우기만 한다. */
export async function syncReminders(): Promise<void> {
  const n = load();
  if (!n) return;
  ensureHandler(n);
  await cancelAll(n);
  const settings = useSettingsStore.getState();
  if (!settings.reminders) return;
  try {
    if (!(await n.getPermissionsAsync()).granted) return;
    const plan = planReminders(useProgressStore.getState().progress, new Date(), settings.locale ?? deviceLocale());
    for (const r of plan) {
      await n.scheduleNotificationAsync({
        identifier: r.id,
        content: { title: r.title, body: r.body },
        trigger: { type: n.SchedulableTriggerInputTypes.DATE, date: r.fireAt },
      });
    }
  } catch {
    // 예약 실패는 조용히
  }
}

/** 알림을 켠다: 권한을 묻고, 허락이면 설정을 켜고 예약한다. 거절이면 false(설정은 꺼진 채). */
export async function enableReminders(): Promise<boolean> {
  const ok = await requestReminderPermission();
  useSettingsStore.getState().patch({ reminders: ok, reminderAsked: true });
  await syncReminders();
  return ok;
}

export async function disableReminders(): Promise<void> {
  useSettingsStore.getState().patch({ reminders: false });
  await syncReminders();
}

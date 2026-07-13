export type DailySchedule = {
  readonly enabled: boolean;
  /** 24-hour local time, e.g. "06:00" */
  readonly time: string;
  /** Minutes before shutdown/restart to warn players (stop & restart only) */
  readonly warningMinutes?: number;
};

export const DEFAULT_DAILY_SCHEDULE: DailySchedule = {
  enabled: false,
  time: '06:00',
  warningMinutes: 5,
};

export function normalizeDailySchedule(
  schedule?: Partial<DailySchedule> | null,
): DailySchedule {
  if (!schedule) {
    return { ...DEFAULT_DAILY_SCHEDULE };
  }

  const time = normalizeTimeString(schedule.time ?? DEFAULT_DAILY_SCHEDULE.time);

  return {
    enabled: Boolean(schedule.enabled),
    time,
    warningMinutes:
      schedule.warningMinutes ?? DEFAULT_DAILY_SCHEDULE.warningMinutes,
  };
}

export function normalizeTimeString(time: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) {
    return DEFAULT_DAILY_SCHEDULE.time;
  }

  const hours = Math.min(23, Math.max(0, Number(match[1])));
  const minutes = Math.min(59, Math.max(0, Number(match[2])));

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function getMsUntilNextOccurrence(timeStr: string): number {
  const [hours, minutes] = normalizeTimeString(timeStr)
    .split(':')
    .map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);

  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  return next.getTime() - now.getTime();
}

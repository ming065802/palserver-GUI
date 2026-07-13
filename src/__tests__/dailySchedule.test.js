import {
  DEFAULT_DAILY_SCHEDULE,
  getMsUntilNextOccurrence,
  normalizeDailySchedule,
  normalizeTimeString,
} from '../types/DailySchedule.types';

describe('normalizeTimeString', () => {
  it('pads single-digit hours and keeps two-digit minutes', () => {
    expect(normalizeTimeString('6:05')).toBe('06:05');
    expect(normalizeTimeString('23:59')).toBe('23:59');
  });

  it('clamps invalid values to valid ranges', () => {
    expect(normalizeTimeString('25:70')).toBe('23:59');
    expect(normalizeTimeString('0:00')).toBe('00:00');
  });

  it('falls back to default time for malformed input', () => {
    expect(normalizeTimeString('invalid')).toBe(DEFAULT_DAILY_SCHEDULE.time);
    expect(normalizeTimeString('')).toBe(DEFAULT_DAILY_SCHEDULE.time);
  });
});

describe('normalizeDailySchedule', () => {
  it('returns defaults when schedule is missing', () => {
    expect(normalizeDailySchedule()).toEqual(DEFAULT_DAILY_SCHEDULE);
    expect(normalizeDailySchedule(null)).toEqual(DEFAULT_DAILY_SCHEDULE);
  });

  it('merges partial schedule with defaults', () => {
    expect(
      normalizeDailySchedule({
        enabled: true,
        time: '9:30',
        warningMinutes: 10,
      }),
    ).toEqual({
      enabled: true,
      time: '09:30',
      warningMinutes: 10,
    });
  });
});

describe('getMsUntilNextOccurrence', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns positive delay for a later time today', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-13T08:00:00'));

    const delay = getMsUntilNextOccurrence('12:30');

    expect(delay).toBe(4.5 * 60 * 60 * 1000);
  });

  it('rolls over to tomorrow when the time already passed', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-13T20:00:00'));

    const delay = getMsUntilNextOccurrence('06:00');

    expect(delay).toBe(10 * 60 * 60 * 1000);
  });
});

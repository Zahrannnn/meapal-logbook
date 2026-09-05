/**
 * Work-calendar math for Meapal LogBook.
 *
 * - A pay period runs from the 21st of one month to the 20th of the next.
 * - Working days are Sunday → Thursday. Friday & Saturday are rest days: they never
 *   produce missing-day alerts and never break a streak.
 * - Hours targets are configured per period below (holidays aren't modeled — adjust
 *   the target when they land inside a period).
 */

export interface PayPeriod {
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
}

export interface WorkWeek {
  /** Saturday of the selected date's week — the week starts on the first rest day. */
  start: Date;
  /** Friday of that week (the week's last day). */
  end: Date;
  /** All seven days, Saturday → Friday. Fri/Sat are rest days but still displayed. */
  days: Date[];
  startStr: string;
  /** True when this week contains today. */
  isCurrent: boolean;
}

const toDayStr = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const isWorkingDay = (date: Date): boolean => {
  const day = date.getDay();
  return day >= 0 && day <= 4; // Sunday → Thursday
};

/** The period containing `today`: e.g. Sep 2 → Aug 21 – Sep 20. */
export const getPayPeriod = (today = new Date()): PayPeriod => {
  const start = startOfDay(today);
  if (start.getDate() < 21) {
    start.setMonth(start.getMonth() - 1);
  }
  start.setDate(21);
  const end = startOfDay(new Date(start.getFullYear(), start.getMonth() + 1, 20));
  return { start, end, startStr: toDayStr(start), endStr: toDayStr(end) };
};

/** The Saturday → Friday week containing `selectedDate` (rest days included). */
export const getWorkWeek = (selectedDate = new Date()): WorkWeek => {
  const start = startOfDay(selectedDate);
  start.setDate(start.getDate() - ((start.getDay() + 1) % 7)); // back to Saturday
  const days = [0, 1, 2, 3, 4, 5, 6].map((offset) => {
    const day = new Date(start);
    day.setDate(day.getDate() + offset);
    return day;
  });
  const today = startOfDay(new Date());
  return {
    start,
    end: days[days.length - 1],
    days,
    startStr: toDayStr(start),
    isCurrent: today >= start && today <= days[days.length - 1],
  };
};

/** Mon…sorry — Sun→Thu working days of the period, in order. */
export const getPeriodWorkdays = (period: PayPeriod): Date[] => {
  const days: Date[] = [];
  const cursor = new Date(period.start);
  while (cursor <= period.end) {
    if (isWorkingDay(cursor)) {
      days.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

/** Workdays already elapsed at `today` (today itself still has room to log). */
export const getElapsedWorkdays = (workdays: Date[], period: PayPeriod, today = new Date()): Date[] => {
  const todayStart = startOfDay(today);
  if (todayStart < period.start) return [];
  return workdays.filter((day) => day < todayStart);
};

/**
 * The current streak over ALL history: consecutive days ending today where every
 * working day has at least one entry. Rest days (Fri/Sat) never break the run, and
 * submitting on a rest day extends it. An un-logged today doesn't break it either —
 * the day is still in progress.
 */
export const getStreakDays = (loggedDates: Set<string>, today = new Date()): number => {
  const todayStart = startOfDay(today);
  let streak = 0;
  const cursor = new Date(todayStart);

  for (let back = 0; back < 365; back += 1) {
    const isToday = cursor.getTime() === todayStart.getTime();
    const logged = loggedDates.has(toDayStr(cursor));

    if (isWorkingDay(cursor)) {
      if (logged) {
        streak += 1;
      } else if (!isToday) {
        break; // a past working day with nothing logged ends the streak
      }
    } else if (logged) {
      streak += 1; // worked a rest day — it extends the run
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

// Expected logged hours per period, keyed by the period's start date. The default (160h)
// applies unless a period overrides it — add a key when a target changes.
const PERIOD_TARGET_HOURS: Record<string, number> = {
  '2026-08-21': 160,
};

export const getPeriodTargetHours = (period: PayPeriod): number =>
  PERIOD_TARGET_HOURS[period.startStr] ?? 160;

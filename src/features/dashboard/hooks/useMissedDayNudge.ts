import { useEffect, useMemo, useState } from 'react';
import { ActivityEntry } from '../../../entities';
import { getPayPeriod, isWorkingDay } from '../../../lib/payPeriod';
import { formatDateValue } from '@/components/date-picker';
import { logEvent } from '../../../lib/telemetry';

const NUDGE_DISMISS_KEY = 'logbook:nudge-dismissed';

// Most recent working day (Sun–Thu) with no activity, walking back from yesterday.
// Friday/Saturday are skipped, and the walk never goes before `lowerBound` (the period
// start), where we have no data. Returns null when there is no gap to recover.
const findMissedWorkday = (activities: ActivityEntry[], lowerBound: Date): Date | null => {
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (let back = 0; back < 7; back += 1) {
    cursor.setDate(cursor.getDate() - 1);
    if (!isWorkingDay(cursor)) continue;
    if (cursor < lowerBound) return null;

    const dateStr = formatDateValue(cursor);
    if (!activities.some((activity) => activity.date === dateStr)) {
      return new Date(cursor);
    }
  }

  return null;
};

/** Recovery nudge for the most recent unlogged working day. Only fires on the today
 *  view (the loaded period guarantees the data) and never on Friday/Saturday. */
export const useMissedDayNudge = ({
  activities,
  selectedDate,
  onLogNow,
}: {
  activities: ActivityEntry[];
  selectedDate: Date;
  onLogNow: (missedDay: Date) => void;
}) => {
  const [dismissedDate, setDismissedDate] = useState<string | null>(() => {
    try {
      return localStorage.getItem(NUDGE_DISMISS_KEY);
    } catch {
      return null;
    }
  });

  const missedWorkday = useMemo(() => {
    const viewingToday = selectedDate.toDateString() === new Date().toDateString();
    const todayIsRestDay = !isWorkingDay(new Date());
    if (!viewingToday || todayIsRestDay) return null;
    return findMissedWorkday(activities, getPayPeriod(selectedDate).start);
  }, [activities, selectedDate]);

  const showNudge = !!missedWorkday && dismissedDate !== formatDateValue(missedWorkday);

  const dismiss = (missedDay: Date) => {
    const dateStr = formatDateValue(missedDay);
    logEvent('nudge_dismiss', { date: dateStr });
    try {
      localStorage.setItem(NUDGE_DISMISS_KEY, dateStr);
    } catch {
      // storage unavailable (private mode) — dismissal just won't persist
    }
    setDismissedDate(dateStr);
  };

  const logNow = (missedDay: Date) => {
    logEvent('nudge_click', { date: formatDateValue(missedDay) });
    onLogNow(missedDay);
  };

  return { missedWorkday, showNudge, dismiss, logNow };
};

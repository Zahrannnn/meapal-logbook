/** `HH:mm` string helpers shared by the time pickers and the activity form. */

export const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export const toHHMM = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** "1h", "45m", "1h 30m" */
export const formatDurationLabel = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
};

/** Decimal hours (6.5) as hours and minutes ("6h 30m"); 0 renders "0h". */
export const formatHoursMinutes = (hours: number) => {
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes === 0) return '0h';
  return formatDurationLabel(totalMinutes);
};

export interface DayGap {
  start: string;
  end: string;
  minutes: number;
}

/**
 * Free windows on one day, bounded to the workday, wide enough to matter.
 * Overlapping entries collapse into the cursor, so back-to-back or layered
 * entries never produce phantom gaps. Computed on the day's unfiltered entries.
 */
export const dayGaps = (
  activities: Array<{ startTime: string; endTime: string }>,
  minMinutes = 15,
  dayStart = '09:00',
  dayEnd = '18:00',
): DayGap[] => {
  const workdayStart = toMinutes(dayStart);
  const workdayEnd = toMinutes(dayEnd);

  const spans = activities
    .map((activity) => ({ from: toMinutes(activity.startTime), to: toMinutes(activity.endTime) }))
    .filter((span) => span.to > span.from)
    .sort((left, right) => left.from - right.from);

  const gaps: DayGap[] = [];
  let cursor = workdayStart;
  for (const span of spans) {
    if (span.from - cursor >= minMinutes) {
      gaps.push({ start: toHHMM(cursor), end: toHHMM(span.from), minutes: span.from - cursor });
    }
    cursor = Math.max(cursor, span.to);
  }
  if (workdayEnd - cursor >= minMinutes) {
    gaps.push({ start: toHHMM(cursor), end: toHHMM(workdayEnd), minutes: workdayEnd - cursor });
  }
  return gaps;
};

/**
 * Where a `durationMinutes` entry lands among the day's precomputed free
 * slots: the first slot that fits it fully, otherwise the largest slot with
 * the entry clamped to it (`clamped: true` — the caller says so in a toast).
 * Null only when the day has no free slots at all.
 */
export const fitSlot = (
  gaps: DayGap[],
  durationMinutes: number,
): { start: string; end: string; clamped: boolean } | null => {
  if (durationMinutes <= 0 || gaps.length === 0) return null;
  const fit = gaps.find((gap) => gap.minutes >= durationMinutes);
  if (fit) return { start: fit.start, end: toHHMM(toMinutes(fit.start) + durationMinutes), clamped: false };
  const largest = gaps.reduce((left, right) => (right.minutes > left.minutes ? right : left));
  return { start: largest.start, end: largest.end, clamped: true };
};

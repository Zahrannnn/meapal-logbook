import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Ensures light mode is always used by removing the dark class from the document element.
 * This can be called from any component that needs to ensure light mode.
 */
export function ensureLightMode() {
  if (typeof document !== 'undefined') {
    // Always set dark mode to false
    document.documentElement.classList.toggle('dark', false);
  }
}

/**
 * Removes any dark mode classes from a className string
 * @param className The class string to process
 * @returns The class string with dark mode classes removed
 */
export function removeDarkClasses(className: string): string {
  return className
    .split(' ')
    .filter(cls => !cls.startsWith('dark:'))
    .join(' ');
}

/**
 * Calculates the actual (non-overlapping) total hours from a list of activities.
 * Merges overlapping time intervals so overlapping activities are not double-counted.
 *
 * Accepts either:
 * - Objects with `date` (YYYY-MM-DD), `startTime` (HH:mm), `endTime` (HH:mm)
 * - Objects with ISO datetime `startTime` and `endTime` (auto-detects date & time)
 *
 * @param activities - Array of activity-like objects
 * @returns Total hours as a number, with overlapping intervals merged
 */
export function calculateActualHours(
  activities: { date?: string; startTime: string; endTime: string }[]
): number {
  if (activities.length === 0) return 0;

  // Group activities by date
  const byDate: Record<string, { start: number; end: number }[]> = {};
  for (const a of activities) {
    let date: string;
    let startMin: number;
    let endMin: number;

    // Detect if startTime is an ISO datetime string or HH:mm
    if (a.startTime.includes('T')) {
      // ISO datetime format
      const startDt = new Date(a.startTime);
      const endDt = new Date(a.endTime);
      date = startDt.toISOString().split('T')[0];
      startMin = startDt.getHours() * 60 + startDt.getMinutes();
      endMin = endDt.getHours() * 60 + endDt.getMinutes();
    } else {
      // HH:mm format
      date = a.date || '1970-01-01';
      const [sh, sm] = a.startTime.split(':').map(Number);
      const [eh, em] = a.endTime.split(':').map(Number);
      startMin = sh * 60 + sm;
      endMin = eh * 60 + em;
    }

    if (endMin <= startMin) continue; // skip invalid intervals
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push({ start: startMin, end: endMin });
  }

  let totalMinutes = 0;

  for (const intervals of Object.values(byDate)) {
    // Sort by start time
    intervals.sort((a, b) => a.start - b.start);

    // Merge overlapping intervals
    const merged: { start: number; end: number }[] = [intervals[0]];
    for (let i = 1; i < intervals.length; i++) {
      const last = merged[merged.length - 1];
      const curr = intervals[i];
      if (curr.start <= last.end) {
        // Overlapping — extend the end if needed
        last.end = Math.max(last.end, curr.end);
      } else {
        merged.push({ ...curr });
      }
    }

    for (const iv of merged) {
      totalMinutes += iv.end - iv.start;
    }
  }

  return totalMinutes / 60;
}

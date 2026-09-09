import React from 'react';
import { PartyPopper } from 'lucide-react';
import { formatHoursMinutes } from '@/lib/time';

/** "+1h 30m" / "+30m" / "+2h" — for over-target deltas. */
const formatDelta = (hours: number) => {
  const minutes = Math.round(hours * 60);
  if (minutes < 60) return `+${minutes}m`;
  const whole = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `+${whole}h` : `+${whole}h ${rest}m`;
};

/** The hero's status line under the logged-hours KPI: rest day, overtime,
 *  target reached, empty, or remaining-to-target. */
export const DayStatusMessage: React.FC<{
  restDay: boolean;
  viewingToday: boolean;
  loggedHours: number;
  targetHours: number;
  stretchHours: number;
}> = ({ restDay, viewingToday, loggedHours, targetHours, stretchHours }) => {
  const overtime = !restDay && loggedHours >= stretchHours;
  const reached = !restDay && !overtime && loggedHours >= targetHours;
  const remainingHours = Math.max(0, targetHours - loggedHours);

  if (restDay) {
    return <p className="text-sm font-bold text-muted-foreground">Rest day: Fridays and Saturdays have no daily target.</p>;
  }
  if (overtime) {
    return (
      <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
        <span className="font-semibold text-emerald-600">Overtime</span>
        {loggedHours > stretchHours && (
          <span className="font-semibold text-emerald-600 tabular-nums">
            {formatDelta(loggedHours - stretchHours)} past stretch
          </span>
        )}
      </p>
    );
  }
  if (reached) {
    return (
      <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
        <PartyPopper className="size-4 text-orange-500" aria-hidden="true" />
        Main target reached
        {loggedHours > targetHours && (
          <span className="font-semibold text-emerald-600 tabular-nums">
            {formatDelta(loggedHours - targetHours)} over
          </span>
        )}
      </p>
    );
  }
  if (loggedHours <= 0) {
    return (
      <p className="text-sm font-bold text-foreground">
        {viewingToday ? 'Ready to log your day?' : 'No hours logged on this day.'}
      </p>
    );
  }
  return (
    <p className="text-sm font-bold text-foreground tabular-nums">
      {formatHoursMinutes(remainingHours)} remaining to target
    </p>
  );
};

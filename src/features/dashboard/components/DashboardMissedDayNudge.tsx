import React from 'react';
import { CalendarClockIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface DashboardMissedDayNudgeProps {
  missedDay: Date;
  onLogNow: () => void;
  onDismiss: () => void;
}

export const DashboardMissedDayNudge: React.FC<DashboardMissedDayNudgeProps> = ({
  missedDay,
  onLogNow,
  onDismiss,
}) => (
  <div
    role="status"
    className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3"
  >
    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
      <CalendarClockIcon className="size-[18px]" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-foreground">
        Nothing logged for {format(missedDay, 'EEEE, MMM d')}
      </p>
      <p className="text-xs font-medium text-warning/90">
        Your daily report has a gap. It only takes a minute to fill.
      </p>
    </div>
    <Button size="sm" onClick={onLogNow}>
      Log it now
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onDismiss}
      aria-label="Dismiss reminder"
      className="text-muted-foreground"
    >
      <XIcon />
    </Button>
  </div>
);

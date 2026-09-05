import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { InfoIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { logEvent } from '../../../lib/telemetry';
import type { PayPeriod } from '../../../lib/payPeriod';

interface DashboardPeriodProgressProps {
  period: PayPeriod;
  loggedHours: number;
  targetHours: number;
  workdays: Date[];
  elapsedWorkdays: number;
  canLogToday: boolean;
  onLogToday: () => void;
}

const isTodayAWorkday = (days: Date[]): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return days.some((day) => day.getTime() === today.getTime());
};

export const DashboardPeriodProgress: React.FC<DashboardPeriodProgressProps> = ({
  period,
  loggedHours,
  targetHours,
  workdays,
  elapsedWorkdays,
  canLogToday,
  onLogToday,
}) => {
  const reached = loggedHours >= targetHours;
  const remainingHours = targetHours - loggedHours;

  const progressPct = Math.min(100, Math.round((loggedHours / targetHours) * 100));
  const expectedByNow = targetHours * (elapsedWorkdays / Math.max(workdays.length, 1));
  const pacePct = Math.min(100, (expectedByNow / targetHours) * 100);
  // Pace = where you should be by today (elapsed share of the target), not the full target.
  const paceDiff = loggedHours - expectedByNow;
  const behindPace = Math.max(0, -paceDiff);
  const aheadPace = Math.max(0, paceDiff);
  const workdaysLeft = workdays.length - elapsedWorkdays - (isTodayAWorkday(workdays) ? 1 : 0);

  useEffect(() => {
    logEvent('period_progress_view', {
      logged_hours: Number(loggedHours.toFixed(1)),
      target_hours: targetHours,
      behind_hours: Number(behindPace.toFixed(1)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusBadge = reached ? (
    <Badge variant="success">Target reached</Badge>
  ) : period.end < new Date() ? (
    <Badge variant="secondary" className="tabular-nums">
      Closed at {progressPct}%
    </Badge>
  ) : paceDiff < -0.05 ? (
    <Badge variant="warning">{behindPace.toFixed(1)}h behind pace</Badge>
  ) : (
    <Badge variant="success">
      {aheadPace < 0.05 ? 'Right on pace' : `${aheadPace.toFixed(1)}h ahead of pace`}
    </Badge>
  );

  return (
    <Card className="rounded-2xl gap-3 py-5">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-6">
        <CardTitle>
          Pay period · {format(period.start, 'MMM d')} – {format(period.end, 'MMM d')}
        </CardTitle>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="How the pay period progress is calculated"
              className="text-muted-foreground/60 hover:text-foreground"
            >
              <InfoIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" collisionPadding={16} className="w-80 text-sm">
            <p className="font-bold text-foreground">How this is calculated</p>
            <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4 text-muted-foreground">
              <li>
                A pay period runs from the <span className="font-semibold text-foreground">21st to the 20th</span> of
                the following month. This is the period containing the date you selected.
              </li>
              <li>
                Hours sum the start–end time of your entries in the period; overlapping entries count once.
              </li>
              <li>
                The <span className="font-semibold text-foreground tabular-nums">{targetHours}h</span> target is set
                per period. The tick marks where you&apos;re expected to be by today.
              </li>
              <li>Working days are Sunday to Thursday.</li>
            </ul>
          </PopoverContent>
        </Popover>
      </div>

      <CardContent className="px-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-3xl leading-none font-extrabold text-foreground tabular-nums tracking-tight">
            {loggedHours.toFixed(1)}h
          </span>
          <span className="text-sm font-semibold text-muted-foreground tabular-nums">
            of {targetHours}h target
          </span>
          {statusBadge}
        </div>

        <div
          className="relative mt-4 h-2.5 w-full rounded-full bg-muted"
          title={`Expected by today: ${expectedByNow.toFixed(1)}h`}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
          <div
            className="absolute top-[-4px] h-[18px] w-[3px] rounded-full bg-foreground/70"
            style={{ left: `calc(${pacePct}% - 1.5px)` }}
            aria-hidden="true"
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 text-xs font-medium text-muted-foreground">
          <span className="tabular-nums">{progressPct}% of target</span>
          <span className="tabular-nums">
            {period.end < new Date()
              ? `Closed ${format(period.end, 'MMM d')}`
              : `${workdaysLeft} working ${workdaysLeft === 1 ? 'day' : 'days'} left · ends ${format(period.end, 'MMM d')}`}
          </span>
        </div>

        {!reached && behindPace > 0 && canLogToday && onLogToday && (
          <Button size="sm" className="mt-4" onClick={onLogToday}>
            Log today&apos;s work
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

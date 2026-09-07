import React from 'react';
import { format } from 'date-fns';
import { InfoIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { logEvent } from '../../../lib/telemetry';
import { getPeriodStretchHours, type PayPeriod } from '../../../lib/payPeriod';

interface DashboardPeriodProgressProps {
  period: PayPeriod;
  loggedHours: number;
  targetHours: number;
  workdays: Date[];
  elapsedWorkdays: number;
}

const isTodayAWorkday = (days: Date[]): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return days.some((day) => day.getTime() === today.getTime());
};

/** Compact side card for the grid next to the Today hero — not a full-width strip. */
export const DashboardPeriodProgress: React.FC<DashboardPeriodProgressProps> = ({
  period,
  loggedHours,
  targetHours,
  workdays,
  elapsedWorkdays,
}) => {
  const reached = loggedHours >= targetHours;
  const isClosed = period.end < new Date();
  const stretchHours = getPeriodStretchHours(period);
  const overtime = loggedHours >= stretchHours;

  // The label shows the real percentage (118% when over); only the bar caps at 100%.
  const progressPct = Math.round((loggedHours / targetHours) * 100);
  const expectedByNow = targetHours * (elapsedWorkdays / Math.max(workdays.length, 1));
  // Bar and pace scale to the stretch target so the main-target tick is visible on it.
  const stretchPct = Math.min(100, (loggedHours / stretchHours) * 100);
  const mainTickPct = Math.min(100, (targetHours / stretchHours) * 100);
  const pacePct = Math.min(100, (expectedByNow / stretchHours) * 100);
  // Pace = where you should be by today (elapsed share of the target), not the full target.
  const paceDiff = loggedHours - expectedByNow;
  const behindPace = Math.max(0, -paceDiff);
  const aheadPace = Math.max(0, paceDiff);
  const workdaysLeft = workdays.length - elapsedWorkdays - (isTodayAWorkday(workdays) ? 1 : 0);

  React.useEffect(() => {
    logEvent('period_progress_view', {
      logged_hours: Number(loggedHours.toFixed(1)),
      target_hours: targetHours,
      behind_hours: Number(behindPace.toFixed(1)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusBadge = overtime ? (
    <Badge variant="success" className="tabular-nums">
      Overtime +{(loggedHours - stretchHours).toFixed(1)}h
    </Badge>
  ) : reached ? (
    <Badge variant="success" className="tabular-nums">
      Main target reached · +{(loggedHours - targetHours).toFixed(1)}h
    </Badge>
  ) : isClosed ? (
    <Badge variant="secondary" className="tabular-nums">
      Closed at {progressPct}%
    </Badge>
  ) : paceDiff < -0.05 ? (
    <Badge variant="warning" className="tabular-nums">
      {behindPace.toFixed(1)}h behind pace
    </Badge>
  ) : (
    <Badge variant="success">
      {aheadPace < 0.05 ? 'Right on pace' : `${aheadPace.toFixed(1)}h ahead of pace`}
    </Badge>
  );

  return (
    <Card className="rounded-2xl py-4 h-full" aria-label={`Pay period ${format(period.start, 'MMM d')} – ${format(period.end, 'MMM d')}`}>
      <CardContent className="flex h-full flex-col gap-3 px-4 lg:px-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Pay period</p>
            <p className="text-sm font-bold text-foreground tabular-nums">
              {format(period.start, 'MMM d')} – {format(period.end, 'MMM d')}
            </p>
          </div>
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
                  The <span className="font-semibold text-foreground tabular-nums">{targetHours}h</span> main target is
                  set per period, with a <span className="font-semibold text-foreground tabular-nums">{stretchHours}h</span>{' '}
                  stretch target; the tick marks the main target and hours past it run overtime.
                </li>
                <li>Working days are Sunday to Thursday.</li>
              </ul>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl leading-none font-extrabold text-foreground tabular-nums tracking-tight">
              {loggedHours.toFixed(1)}h
            </span>
            <span className="text-sm font-semibold text-muted-foreground tabular-nums">
              / {targetHours}h · {progressPct}%
            </span>
          </div>

          <div
            className="relative mt-3 h-2 w-full"
            title={`Expected by today: ${expectedByNow.toFixed(1)}h · main target ${targetHours}h · overtime past ${stretchHours}h`}
          >
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
              {/* Primary fill up to the main target; emerald past it (overtime territory). */}
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${loggedHours <= targetHours ? stretchPct : mainTickPct}%` }}
              />
              {loggedHours > targetHours && (
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, stretchPct) - mainTickPct)}%` }}
                />
              )}
            </div>
            {/* Main-target tick; the bar's right edge is the stretch target. */}
            <div
              className="absolute -top-0.5 h-3 w-[3px] -translate-x-1/2 rounded-full bg-foreground/70"
              style={{ left: `${mainTickPct}%` }}
              aria-hidden="true"
            />
            {/* Pace tick: where you should be by today. */}
            {!isClosed && !reached && (
              <div
                className="absolute -top-0.5 h-3 w-[2px] -translate-x-1/2 rounded-full bg-foreground/40"
                style={{ left: `${pacePct}%` }}
                title={`Pace: ${expectedByNow.toFixed(1)}h by today`}
                aria-hidden="true"
              />
            )}
          </div>

          <p className="mt-2 text-xs font-medium text-muted-foreground tabular-nums">
            {isClosed
              ? `Closed ${format(period.end, 'MMM d')}`
              : `${workdaysLeft} working ${workdaysLeft === 1 ? 'day' : 'days'} left · ends ${format(period.end, 'MMM d')}`}
          </p>
        </div>

        <div className="mt-auto">{statusBadge}</div>
      </CardContent>
    </Card>
  );
};

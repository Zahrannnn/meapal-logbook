import React from 'react';
import { format } from 'date-fns';
import { Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatHoursMinutes } from '@/lib/time';
import { isWorkingDay } from '../../../lib/payPeriod';
import { DayStatusMessage } from './DayStatusMessage';
import { TargetBar } from './TargetBar';
import { useRecordCelebration } from '../hooks/useRecordCelebration';
import { TaskRecordLine } from './TaskRecordLine';

interface DashboardTodayHeroProps {
  selectedDate: Date;
  loggedHours: number;
  /** Main daily target (8h). */
  targetHours: number;
  /** Stretch daily target (9h) — past this, hours are overtime. The bar scales to it. */
  stretchHours: number;
  activityCount: number;
  taskBest: number;
  prevTaskBest: number;
  streakDays: number;
  isStreakLoading: boolean;
}

export const DashboardTodayHero: React.FC<DashboardTodayHeroProps> = ({
  selectedDate,
  loggedHours,
  targetHours,
  stretchHours,
  activityCount,
  taskBest,
  prevTaskBest,
  streakDays,
  isStreakLoading,
}) => {
  const viewingToday = selectedDate.toDateString() === new Date().toDateString();
  const restDay = !isWorkingDay(selectedDate);
  const heading = viewingToday ? `Today · ${format(selectedDate, 'EEE, MMM d')}` : format(selectedDate, 'EEE, MMM d');
  const progressPct = targetHours > 0 ? Math.round((loggedHours / targetHours) * 100) : 0;

  // Personal Task Record: no fixed limits, everyone races their own best.
  const isNewRecord = viewingToday && activityCount > prevTaskBest && prevTaskBest > 0;
  const burstPlaying = useRecordCelebration({ selectedDate, isNewRecord });

  return (
    <Card className="rounded-2xl gap-0 py-5" aria-label={`Daily progress for ${heading}`} data-tour="hero">
      <div className="flex items-start justify-between gap-4 px-4 lg:px-6">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{heading}</p>

          {/* The primary KPI: today's logged hours, the biggest element on the page. */}
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl leading-none font-extrabold tracking-tight text-foreground tabular-nums">
              {formatHoursMinutes(loggedHours)}
            </span>
            {!restDay && (
              <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                / {formatHoursMinutes(targetHours)} target
              </span>
            )}
          </p>

          <div className="mt-2.5">
            <DayStatusMessage
              restDay={restDay}
              viewingToday={viewingToday}
              loggedHours={loggedHours}
              targetHours={targetHours}
              stretchHours={stretchHours}
            />
          </div>
        </div>

        {viewingToday &&
          (isStreakLoading ? (
            <div className="h-7 w-28 shrink-0 rounded-full bg-muted animate-pulse" aria-label="Loading streak" />
          ) : (
            <span
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-bold text-foreground"
              aria-label={`${streakDays} day streak`}
            >
              <Flame
                className={`size-3.5 ${streakDays > 0 ? 'text-orange-500' : 'text-muted-foreground/40'}`}
                aria-hidden="true"
              />
              <span className="tabular-nums">{streakDays}</span> day streak
            </span>
          ))}
      </div>

      {!restDay && (
        <div className="px-4 lg:px-6">
          <div className="mt-4">
            <TargetBar loggedHours={loggedHours} targetHours={targetHours} stretchHours={stretchHours} />
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
            <span className="tabular-nums">
              {progressPct}% of main target · overtime past {formatHoursMinutes(stretchHours)}
            </span>
            <TaskRecordLine
              viewingToday={viewingToday}
              activityCount={activityCount}
              taskBest={taskBest}
              prevTaskBest={prevTaskBest}
              isNewRecord={isNewRecord}
              burstPlaying={burstPlaying}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

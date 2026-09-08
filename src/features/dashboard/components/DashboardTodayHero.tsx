import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Flame, PartyPopper, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatHoursMinutes } from '@/lib/time';
import { isWorkingDay } from '../../../lib/payPeriod';

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

/** "+1h 30m" / "+30m" / "+2h" — for over-target deltas. */
const formatDelta = (hours: number) => {
  const minutes = Math.round(hours * 60);
  if (minutes < 60) return `+${minutes}m`;
  const whole = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `+${whole}h` : `+${whole}h ${rest}m`;
};

const CONFETTI_COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444'];
const BURST_PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const angle = (Math.PI * 2 * i) / 14 + 0.35;
  const distance = 30 + (i % 4) * 11;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance - 12,
    rotate: ((i * 47) % 180) - 90,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    width: 5 + (i % 3) * 2,
    delay: (i % 5) * 0.04,
  };
});

/** One quiet burst when a new personal record lands. Plays once per day. */
const RecordBurst: React.FC = () => (
  <span className="pointer-events-none absolute -inset-3 z-10" aria-hidden="true">
    {BURST_PARTICLES.map((particle, index) => (
      <motion.span
        key={index}
        className="absolute left-1/2 top-1/2 rounded-[1px]"
        style={{ width: particle.width, height: particle.width * 0.6, backgroundColor: particle.color }}
        initial={{ x: 0, y: 0, opacity: 0.95, rotate: 0 }}
        animate={{ x: particle.x, y: particle.y, opacity: 0, rotate: particle.rotate }}
        transition={{ duration: 0.95, delay: particle.delay, ease: 'easeOut' }}
      />
    ))}
  </span>
);

/**
 * Two-segment day bar scaled to the stretch target: primary up to the main
 * target tick, emerald past it (overtime territory), tick at the main target.
 */
const TargetBar: React.FC<{ loggedHours: number; targetHours: number; stretchHours: number }> = ({
  loggedHours,
  targetHours,
  stretchHours,
}) => {
  const mainPositionPct = Math.min(100, (targetHours / stretchHours) * 100);
  const fillPct = Math.min(100, (loggedHours / stretchHours) * 100);
  const primaryWidthPct = loggedHours <= targetHours ? fillPct : mainPositionPct;
  const overtimeWidthPct = loggedHours > targetHours ? Math.min(100, fillPct) - mainPositionPct : 0;

  return (
    <div className="relative h-2 w-full">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${primaryWidthPct}%` }} />
        {overtimeWidthPct > 0 && (
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${overtimeWidthPct}%` }}
            title="Overtime"
          />
        )}
      </div>
      <div
        className="absolute -top-0.5 h-3 w-[3px] -translate-x-1/2 rounded-full bg-foreground/70"
        style={{ left: `${mainPositionPct}%` }}
        title={`Main target: ${formatHoursMinutes(targetHours)}`}
        aria-hidden="true"
      />
    </div>
  );
};

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

  const overtime = !restDay && loggedHours >= stretchHours;
  const reached = !restDay && !overtime && loggedHours >= targetHours;
  const remainingHours = Math.max(0, targetHours - loggedHours);
  const progressPct = targetHours > 0 ? Math.round((loggedHours / targetHours) * 100) : 0;

  // Personal Task Record: no fixed limits, everyone races their own best.
  const isNewRecord = viewingToday && activityCount > prevTaskBest && prevTaskBest > 0;
  const [burstPlaying, setBurstPlaying] = useState(false);
  const celebrateKey = `logbook:record-celebrated:${format(selectedDate, 'yyyy-MM-dd')}`;

  useEffect(() => {
    if (!isNewRecord) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (localStorage.getItem(celebrateKey)) return;
      localStorage.setItem(celebrateKey, '1');
      setBurstPlaying(true);
      timer = setTimeout(() => setBurstPlaying(false), 2400);
    } catch {
      setBurstPlaying(true);
      timer = setTimeout(() => setBurstPlaying(false), 2400);
    }
    return () => timer && clearTimeout(timer);
  }, [isNewRecord, celebrateKey]);

  const taskLine = (() => {
    if (viewingToday) {
      if (isNewRecord) {
        return (
          <span className="relative inline-flex items-center gap-1.5 font-bold text-foreground">
            {burstPlaying && <RecordBurst />}
            <Trophy className="size-3.5 text-amber-500" aria-hidden="true" />
            New personal record · {activityCount} tasks today
          </span>
        );
      }
      if (activityCount === 0) {
        return prevTaskBest > 0 ? (
          <span className="tabular-nums">0 tasks today · best {prevTaskBest}</span>
        ) : null;
      }
      if (activityCount === prevTaskBest) {
        return (
          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
            <Trophy className="size-3.5 text-amber-500" aria-hidden="true" />
            Matched your best · {activityCount} tasks today
          </span>
        );
      }
      if (prevTaskBest > 0) {
        return (
          <span className="tabular-nums">
            {activityCount} tasks today · {prevTaskBest - activityCount} away from your best ({prevTaskBest})
          </span>
        );
      }
      return <span className="tabular-nums">{activityCount} tasks today · your personal best</span>;
    }
    return (
      <span className="tabular-nums">
        {activityCount} {activityCount === 1 ? 'task' : 'tasks'}
        {taskBest > 0 ? ` · personal best ${taskBest}` : ''}
      </span>
    );
  })();

  const status = restDay ? (
    <p className="text-sm font-bold text-muted-foreground">Rest day: Fridays and Saturdays have no daily target.</p>
  ) : overtime ? (
    <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
      <span className="font-semibold text-emerald-600">Overtime</span>
      {loggedHours > stretchHours && (
        <span className="font-semibold text-emerald-600 tabular-nums">
          {formatDelta(loggedHours - stretchHours)} past stretch
        </span>
      )}
    </p>
  ) : reached ? (
    <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
      <PartyPopper className="size-4 text-orange-500" aria-hidden="true" />
      Main target reached
      {loggedHours > targetHours && (
        <span className="font-semibold text-emerald-600 tabular-nums">
          {formatDelta(loggedHours - targetHours)} over
        </span>
      )}
    </p>
  ) : loggedHours <= 0 ? (
    <p className="text-sm font-bold text-foreground">
      {viewingToday ? 'Ready to log your day?' : 'No hours logged on this day.'}
    </p>
  ) : (
    <p className="text-sm font-bold text-foreground tabular-nums">
      {formatHoursMinutes(remainingHours)} remaining to target
    </p>
  );

  return (
    <Card className="rounded-2xl gap-0 py-5" aria-label={`Daily progress for ${heading}`}>
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

          <div className="mt-2.5">{status}</div>
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
            {taskLine && <span>{taskLine}</span>}
          </div>
        </div>
      )}
    </Card>
  );
};

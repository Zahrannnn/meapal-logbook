import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { ActivityEntry, User, Project } from '../../../entities';
import { useDashboardActivityFeed } from '../hooks/useDashboardActivityFeed';
import { useDashboardDateNavigation } from '../hooks/useDashboardDateNavigation';
import { DashboardMetricCards } from './DashboardMetricCards';
import { DashboardTrendChart } from './DashboardTrendChart';
import { DashboardDateSelector } from './DashboardDateSelector';
import { DashboardFilters } from './DashboardFilters';
import { DashboardActivityList } from './DashboardActivityList';
import { DashboardPendingApprovals } from './DashboardPendingApprovals';
import { DashboardMissedDayNudge } from './DashboardMissedDayNudge';
import { DashboardPeriodProgress } from './DashboardPeriodProgress';
import { DashboardStreakCard } from './DashboardStreakCard';
import { logEvent } from '../../../lib/telemetry';
import { calculateActualHours } from '../../../lib/utils';
import {
  getPayPeriod,
  getPeriodTargetHours,
  getPeriodWorkdays,
  getElapsedWorkdays,
  isWorkingDay,
} from '../../../lib/payPeriod';
import { formatDateValue } from '@/components/date-picker';

const NUDGE_DISMISS_KEY = 'logbook:nudge-dismissed';

// StrictMode double-mounts effects in dev; dedupe so one page view = one event.
let lastDashboardViewAt = 0;

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

/** Three pulsing 'log entries' — the motif for a period being loaded. */
const LogEntryBars = () => (
  <span className="flex items-end gap-[3px] h-4" aria-hidden="true">
    {[0, 1, 2].map((index) => (
      <span
        key={index}
        className="w-[5px] rounded-[2px] bg-primary animate-pulse"
        style={{ height: `${7 + index * 3}px`, animationDelay: `${index * 180}ms`, animationDuration: '900ms' }}
      />
    ))}
  </span>
);

interface DashboardPageProps {
  currentUser: User;
  activities: ActivityEntry[];
  projects: Project[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  isActivitiesRefreshing?: boolean;
  loadedPeriodKey?: string | null;
  streakDays?: number;
  isStreakLoading?: boolean;
  onAddActivity: () => void;
  onEditActivity: (activity: ActivityEntry) => void;
  onDuplicateActivity: (activity: ActivityEntry) => void;
  onDeleteActivity: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterProject: string;
  onFilterChange: (project: string) => void;
  onOpenRecurringActivities?: () => void;
  onVoiceRecord?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  activities,
  projects,
  selectedDate,
  onDateChange,
  isActivitiesRefreshing = false,
  loadedPeriodKey = null,
  streakDays = 0,
  isStreakLoading = false,
  onAddActivity,
  onEditActivity,
  onDuplicateActivity,
  onDeleteActivity,
  searchQuery,
  onSearchChange,
  filterProject,
  onFilterChange,
  onOpenRecurringActivities,
  onVoiceRecord,
}) => {
  const {
    todayActivities,
    totalHoursToday,
    completedToday,
    targetProgress,
    weeklyTrendData,
    pendingActivities,
  } = useDashboardActivityFeed({
    activities,
    currentUser,
    selectedDate,
    searchQuery,
    filterProject,
  });

  const { goToPreviousDay, goToNextDay, goToToday } = useDashboardDateNavigation({
    selectedDate,
    onDateChange,
  });

  // Telemetry: view on mount, date navigation afterwards.
  const previousDateRef = useRef(selectedDate);
  useEffect(() => {
    if (previousDateRef.current !== selectedDate) {
      previousDateRef.current = selectedDate;
      logEvent('date_change', { to: formatDateValue(selectedDate) });
    }
  }, [selectedDate]);
  useEffect(() => {
    const now = Date.now();
    if (now - lastDashboardViewAt > 1000) {
      lastDashboardViewAt = now;
      logEvent('dashboard_view', { selected_date: formatDateValue(selectedDate) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recovery nudge: only on the today view (the loaded period guarantees the data) and
  // never on Friday/Saturday — rest days produce no alerts.
  const [dismissedDate, setDismissedDate] = useState<string | null>(() => {
    try {
      return localStorage.getItem(NUDGE_DISMISS_KEY);
    } catch {
      return null;
    }
  });
  const viewingToday = selectedDate.toDateString() === new Date().toDateString();
  const todayIsRestDay = !isWorkingDay(new Date());
  const payPeriod = useMemo(() => getPayPeriod(selectedDate), [selectedDate]);
  const missedWorkday = viewingToday && !todayIsRestDay ? findMissedWorkday(activities, payPeriod.start) : null;
  const showNudge = !!missedWorkday && dismissedDate !== formatDateValue(missedWorkday);

  const handleNudgeDismiss = (missedDay: Date) => {
    const dateStr = formatDateValue(missedDay);
    logEvent('nudge_dismiss', { date: dateStr });
    try {
      localStorage.setItem(NUDGE_DISMISS_KEY, dateStr);
    } catch {
      // storage unavailable (private mode) — dismissal just won't persist
    }
    setDismissedDate(dateStr);
  };

  const handleNudgeLogNow = (missedDay: Date) => {
    logEvent('nudge_click', { date: formatDateValue(missedDay) });
    onDateChange(missedDay);
    onAddActivity();
  };

  // Pay-period progress (21st → 20th) for whichever period the selected date belongs to:
  // the dashboard fetch loads exactly that period.
  const periodKey = `${currentUser.id}:${payPeriod.startStr}`;
  const periodCovered = loadedPeriodKey === periodKey;
  const ownActivities = useMemo(
    () => activities.filter((activity) => !activity.employeeName || activity.employeeName === currentUser.name),
    [activities, currentUser.name],
  );
  const periodWorkdays = useMemo(() => getPeriodWorkdays(payPeriod), [payPeriod]);
  const elapsedWorkdays = useMemo(
    () => getElapsedWorkdays(periodWorkdays, payPeriod),
    [periodWorkdays, payPeriod],
  );

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {showNudge && missedWorkday && (
        <DashboardMissedDayNudge
          missedDay={missedWorkday}
          onLogNow={() => handleNudgeLogNow(missedWorkday)}
          onDismiss={() => handleNudgeDismiss(missedWorkday)}
        />
      )}
      <DashboardDateSelector
        selectedDate={selectedDate}
        onPreviousDay={goToPreviousDay}
        onNextDay={goToNextDay}
        onToday={goToToday}
        onDateChange={onDateChange}
      />
      {/* Stay mounted while a new pay period loads; the switch gets its own moment. */}
      <div className="relative" aria-busy={isActivitiesRefreshing}>
        <AnimatePresence>
          {isActivitiesRefreshing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 z-10 flex items-start justify-center bg-background/60 backdrop-blur-[2px] rounded-xl"
            >
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -6, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="mt-16 flex items-center gap-3 rounded-full border bg-card px-4 py-2.5 shadow-card"
              >
                <LogEntryBars />
                <span className="text-sm font-bold text-foreground tabular-nums">
                  {format(payPeriod.start, 'MMM d')} – {format(payPeriod.end, 'MMM d')}
                </span>
                <span className="text-sm text-muted-foreground">loading pay period…</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-col gap-6 lg:gap-8">
          {periodCovered && (
            <div className="grid gap-4 lg:grid-cols-[1fr_14rem]">
              <DashboardPeriodProgress
                period={payPeriod}
                loggedHours={calculateActualHours(ownActivities)}
                targetHours={getPeriodTargetHours(payPeriod)}
                workdays={periodWorkdays}
                elapsedWorkdays={elapsedWorkdays.length}
                canLogToday={viewingToday}
                onLogToday={onAddActivity}
              />
              <DashboardStreakCard days={streakDays} isLoading={isStreakLoading} />
            </div>
          )}
          <DashboardMetricCards
            activityCount={todayActivities.length}
            targetActivitiesPerDay={currentUser.targetActivitiesPerDay}
            targetProgress={targetProgress}
            completedToday={completedToday}
            totalHoursToday={totalHoursToday}
            selectedDate={selectedDate}
          />
          <DashboardTrendChart
            weeklyTrendData={weeklyTrendData}
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            onLogFirst={onAddActivity}
          />
          <DashboardFilters
            searchQuery={searchQuery}
            filterProject={filterProject}
            projects={projects}
            onSearchChange={onSearchChange}
            onFilterChange={onFilterChange}
            resultCount={todayActivities.length}
          />
          <DashboardActivityList
            activities={todayActivities}
            projects={projects}
            currentUser={currentUser}
            onAddActivity={onAddActivity}
            onEditActivity={onEditActivity}
            onDuplicateActivity={onDuplicateActivity}
            onDeleteActivity={onDeleteActivity}
            onOpenRecurringActivities={onOpenRecurringActivities}
            onVoiceRecord={onVoiceRecord}
          />
          <DashboardPendingApprovals activities={pendingActivities} projects={projects} />
        </div>
      </div>
    </div>
  );
};

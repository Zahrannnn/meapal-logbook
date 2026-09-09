import React from 'react';
import { ActivityEntry, User, Project } from '../../../entities';
import { useDashboardActivityFeed } from '../hooks/useDashboardActivityFeed';
import { useDashboardTelemetry } from '../hooks/useDashboardTelemetry';
import { useMissedDayNudge } from '../hooks/useMissedDayNudge';
import { usePayPeriodProgress } from '../hooks/usePayPeriodProgress';
import { DashboardTodayHero } from './DashboardTodayHero';
import { DashboardTrendChart } from './DashboardTrendChart';
import { DashboardDayControls } from './DashboardDayControls';
import { DashboardActivityTimeline } from './DashboardActivityTimeline';
import { DashboardPendingApprovals } from './DashboardPendingApprovals';
import { DashboardMissedDayNudge } from './DashboardMissedDayNudge';
import { DashboardPeriodProgress } from './DashboardPeriodProgress';
import { DraftRecoveryBanner, PeriodLoadingOverlay } from './DashboardOverlays';
import { calculateActualHours } from '../../../lib/utils';
import { DAILY_STRETCH_HOURS, DAILY_TARGET_HOURS, getPeriodTargetHours } from '../../../lib/payPeriod';

interface DashboardPageProps {
  currentUser: User;
  activities: ActivityEntry[];
  projects: Project[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  isActivitiesRefreshing?: boolean;
  loadedPeriodKey?: string | null;
  streakDays?: number;
  taskBest?: number;
  prevTaskBest?: number;
  isStreakLoading?: boolean;
  onAddActivity: () => void;
  onEditActivity: (activity: ActivityEntry) => void;
  onDuplicateActivity: (activity: ActivityEntry) => void;
  onDeleteActivity: (id: string) => void;
  isDraftRestored?: boolean;
  onDiscardRecovery?: () => void;
  onOpenDrafts?: () => void;
  draftsCount?: number;
  optimisticId?: string | null;
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
  taskBest = 0,
  prevTaskBest = 0,
  isStreakLoading = false,
  onAddActivity,
  onEditActivity,
  onDuplicateActivity,
  onDeleteActivity,
  isDraftRestored = false,
  onDiscardRecovery,
  onOpenDrafts,
  draftsCount = 0,
  optimisticId = null,
  searchQuery,
  onSearchChange,
  filterProject,
  onFilterChange,
  onOpenRecurringActivities,
  onVoiceRecord,
}) => {
  const {
    todayActivities,
    dayActivityCount,
    totalHoursToday,
    weeklyTrendData,
    pendingActivities,
  } = useDashboardActivityFeed({
    activities,
    currentUser,
    selectedDate,
    searchQuery,
    filterProject,
  });

  useDashboardTelemetry(selectedDate);

  const { missedWorkday, showNudge, dismiss: dismissNudge, logNow: logNudgeNow } = useMissedDayNudge({
    activities,
    selectedDate,
    onLogNow: (missedDay) => {
      onDateChange(missedDay);
      onAddActivity();
    },
  });

  const { payPeriod, periodCovered, ownActivities, periodWorkdays, elapsedWorkdays } =
    usePayPeriodProgress({ currentUser, activities, selectedDate, loadedPeriodKey });

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {showNudge && missedWorkday && (
        <DashboardMissedDayNudge
          missedDay={missedWorkday}
          onLogNow={() => logNudgeNow(missedWorkday)}
          onDismiss={() => dismissNudge(missedWorkday)}
        />
      )}
      {isDraftRestored && (
        <DraftRecoveryBanner onContinue={onAddActivity} onDiscard={onDiscardRecovery} />
      )}
      <DashboardDayControls selectedDate={selectedDate} onDateChange={onDateChange} onAddActivity={onAddActivity} />
      {/* Stay mounted while a new pay period loads; the switch gets its own moment. */}
      <div className="relative" aria-busy={isActivitiesRefreshing}>
        <PeriodLoadingOverlay isActive={isActivitiesRefreshing} period={payPeriod} />
        <div className="flex flex-col gap-6 lg:gap-8">
          {periodCovered && (
            <>
              {/* The hero row: logging loop up front, pay period as its compact side card.
                  The primary CTA lives top-right in the app header. */}
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
                <DashboardTodayHero
                  selectedDate={selectedDate}
                  loggedHours={totalHoursToday}
                  targetHours={DAILY_TARGET_HOURS}
                  stretchHours={DAILY_STRETCH_HOURS}
                  activityCount={dayActivityCount}
                  taskBest={taskBest}
                  prevTaskBest={prevTaskBest}
                  streakDays={streakDays}
                  isStreakLoading={isStreakLoading}
                />

                <DashboardPeriodProgress
                  period={payPeriod}
                  loggedHours={calculateActualHours(ownActivities)}
                  targetHours={getPeriodTargetHours(payPeriod)}
                  workdays={periodWorkdays}
                  elapsedWorkdays={elapsedWorkdays.length}
                />
              </div>

              <DashboardActivityTimeline
                activities={todayActivities}
                projects={projects}
                currentUser={currentUser}
                selectedDate={selectedDate}
                isActivitiesRefreshing={isActivitiesRefreshing}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                filterProject={filterProject}
                onFilterChange={onFilterChange}
                onAddActivity={onAddActivity}
                onEditActivity={onEditActivity}
                onDuplicateActivity={onDuplicateActivity}
                onDeleteActivity={onDeleteActivity}
                onOpenRecurringActivities={onOpenRecurringActivities}
                onOpenDrafts={onOpenDrafts}
                draftsCount={draftsCount}
                optimisticId={optimisticId}
              />

              <DashboardTrendChart
                weeklyTrendData={weeklyTrendData}
                selectedDate={selectedDate}
                onDateChange={onDateChange}
                onLogFirst={onAddActivity}
              />
            </>
          )}
          <DashboardPendingApprovals activities={pendingActivities} projects={projects} />
        </div>
      </div>
    </div>
  );
};

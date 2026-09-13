import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { format } from 'date-fns';
import { PlusIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardFilters } from './DashboardFilters';
import { DayEmptyState, FilteredEmptyState } from './TimelineEmptyStates';
import { TimelineHeader } from './TimelineHeader';
import { TimelineRow } from './TimelineRow';
import { cn } from '@/lib/utils';
import { dayGaps, formatDurationLabel, toMinutes, type DayGap } from '@/lib/time';
import { isWorkingDay } from '../../../lib/payPeriod';
import type { ActivityEntry, Project, User } from '../../../entities';

interface DashboardActivityTimelineProps {
  activities: ActivityEntry[];
  projects: Project[];
  currentUser: User;
  selectedDate: Date;
  isActivitiesRefreshing?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterProject: string;
  onFilterChange: (project: string) => void;
  onAddActivity: () => void;
  onLogGap?: (start: string, end: string) => void;
  onEditActivity: (activity: ActivityEntry) => void;
  onDuplicateActivity: (activity: ActivityEntry) => void;
  onDeleteActivity: (id: string) => void;
  onOpenRecurringActivities?: () => void;
  onOpenDrafts?: () => void;
  draftsCount?: number;
  /** Row currently being saved optimistically — shows a saving shimmer. */
  optimisticId?: string | null;
}

const TimelineSkeleton = () => (
  <div className="px-4 pb-2 sm:px-5" aria-label="Loading activities">
    {[0, 1, 2].map((row) => (
      <div key={row} className="flex gap-4 py-4">
        <div className="flex w-16 shrink-0 flex-col gap-1.5 pt-0.5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-2.5 w-10" />
        </div>
        <div className="relative flex-1 pl-6">
          <span className="absolute left-0 top-1.5 size-1.5 rounded-full bg-muted-foreground/25" aria-hidden="true" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const DashboardActivityTimeline: React.FC<DashboardActivityTimelineProps> = ({
  activities,
  projects,
  currentUser,
  selectedDate,
  isActivitiesRefreshing = false,
  searchQuery,
  onSearchChange,
  filterProject,
  onFilterChange,
  onAddActivity,
  onLogGap,
  onEditActivity,
  onDuplicateActivity,
  onDeleteActivity,
  onOpenRecurringActivities,
  onOpenDrafts,
  draftsCount = 0,
  optimisticId = null,
}) => {
  const reduceMotion = useReducedMotion();
  const viewingToday = selectedDate.toDateString() === new Date().toDateString();
  const restDay = !isWorkingDay(selectedDate);
  const dayInPast = format(selectedDate, 'yyyy-MM-dd') < format(new Date(), 'yyyy-MM-dd');
  const isFiltering = !!searchQuery || filterProject !== 'all';

  const dayActivities = [...activities].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const totalMinutes = Math.round(dayActivities.reduce((sum, activity) => sum + activity.duration, 0) * 60);
  const showFilters = dayActivities.length > 0 || isFiltering;
  const isLoading = isActivitiesRefreshing && dayActivities.length === 0;

  // Gap chips only reflect the real day — hidden while search/project filters
  // shrink the list, since a filtered list's holes aren't free time.
  const gaps = onLogGap && !isFiltering && !isLoading ? dayGaps(dayActivities) : [];

  type Row = { kind: 'entry'; activity: ActivityEntry; index: number } | { kind: 'gap'; gap: DayGap; key: string };
  const rows: Row[] = (() => {
    if (gaps.length === 0) return dayActivities.map((activity, index) => ({ kind: 'entry' as const, activity, index }));
    const queue = [...gaps];
    const items: Row[] = [];
    dayActivities.forEach((activity, index) => {
      const startMin = toMinutes(activity.startTime);
      while (queue.length > 0 && toMinutes(queue[0].end) <= startMin) {
        const gap = queue.shift()!;
        items.push({ kind: 'gap', gap, key: `gap-${gap.start}` });
      }
      items.push({ kind: 'entry', activity, index });
    });
    queue.forEach((gap) => items.push({ kind: 'gap', gap, key: `gap-${gap.start}` }));
    return items;
  })();

  return (
    <Card className="rounded-2xl gap-0 py-0 overflow-hidden" data-tour="list">
      <TimelineHeader
        count={dayActivities.length}
        totalMinutes={totalMinutes}
        draftsCount={draftsCount}
        onOpenDrafts={onOpenDrafts}
        onOpenRecurringActivities={onOpenRecurringActivities}
      />

      {showFilters && (
        <div className="border-b border-border/70 px-4 py-3 lg:px-6">
          <DashboardFilters
            searchQuery={searchQuery}
            filterProject={filterProject}
            projects={projects}
            onSearchChange={onSearchChange}
            onFilterChange={onFilterChange}
            resultCount={isFiltering ? dayActivities.length : undefined}
          />
        </div>
      )}

      {isLoading ? (
        <TimelineSkeleton />
      ) : dayActivities.length === 0 ? (
        isFiltering ? (
          <FilteredEmptyState
            searchQuery={searchQuery}
            filterProject={filterProject}
            onClear={() => {
              onSearchChange('');
              onFilterChange('all');
            }}
          />
        ) : (
          <DayEmptyState
            selectedDate={selectedDate}
            restDay={restDay}
            viewingToday={viewingToday}
            dayInPast={dayInPast}
            onAddActivity={onAddActivity}
          />
        )
      ) : (
        <ol className="relative px-4 py-2 sm:px-5">
          {/* The day rail: one line every entry hangs from (desktop only; mobile stacks). */}
          <span
            className="absolute bottom-6 left-[calc(4rem+1.25rem)] top-6 hidden w-px bg-border sm:block sm:left-[calc(4.5rem+1.25rem)]"
            aria-hidden="true"
          />
          <AnimatePresence initial={false}>
          {rows.map((row) =>
            row.kind === 'gap' ? (
              <li key={row.key} className="relative flex justify-start py-1 sm:pl-20">
                <button
                  type="button"
                  onClick={() => onLogGap?.(row.gap.start, row.gap.end)}
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
                  aria-label={`Log an activity from ${row.gap.start} to ${row.gap.end}`}
                >
                  <PlusIcon className="size-3 transition-transform group-hover:scale-110" aria-hidden="true" />
                  Log {row.gap.start} – {row.gap.end}
                  <span className="font-medium opacity-60">· {formatDurationLabel(row.gap.minutes)} free</span>
                </button>
              </li>
            ) : (
              <motion.li
                key={row.activity.id}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, ease: 'easeOut', delay: Math.min(row.index * 0.04, 0.2) }}
                className={cn(
                  'relative flex flex-col py-4 sm:flex-row sm:items-start',
                  optimisticId === row.activity.id && 'animate-pulse',
                )}
                aria-busy={optimisticId === row.activity.id || undefined}
              >
                <TimelineRow
                  activity={row.activity}
                  project={projects.find((item) => item.id === row.activity.projectId)}
                  currentUser={currentUser}
                  onEdit={onEditActivity}
                  onDuplicate={onDuplicateActivity}
                  onDelete={onDeleteActivity}
                />
              </motion.li>
            )
          )}
          </AnimatePresence>
        </ol>
      )}
    </Card>
  );
};

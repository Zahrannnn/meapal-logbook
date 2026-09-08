import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ClockIcon, CopyIcon, FileTextIcon, MoreVertical, PencilIcon, PlusIcon, RepeatIcon, SearchXIcon, Trash2Icon } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DashboardFilters } from './DashboardFilters';
import { cn } from '@/lib/utils';
import { formatDurationLabel } from '@/lib/time';
import { isWorkingDay } from '../../../lib/payPeriod';
import { competencyOptions, type ActivityEntry, type Project, type User } from '../../../entities';

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
  onEditActivity: (activity: ActivityEntry) => void;
  onDuplicateActivity: (activity: ActivityEntry) => void;
  onDeleteActivity: (id: string) => void;
  onOpenRecurringActivities?: () => void;
  onOpenDrafts?: () => void;
  draftsCount?: number;
  /** Row currently being saved optimistically — shows a saving shimmer. */
  optimisticId?: string | null;
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const statusStyle: Record<ActivityEntry['status'], { label: string; badge: 'success' | 'warning' | 'destructive' | 'info'; dot: string }> = {
  completed: { label: 'Completed', badge: 'success', dot: 'bg-success' },
  'pending-approval': { label: 'Pending approval', badge: 'warning', dot: 'bg-warning' },
  blocked: { label: 'Blocked', badge: 'destructive', dot: 'bg-destructive' },
  'in-progress': { label: 'In progress', badge: 'info', dot: 'bg-info' },
};

// Stable, readable color per project id, so rows are scannable without a color field on the entity.
const projectHues = [221, 262, 168, 32, 340, 288, 199, 142];
const projectColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) % 997;
  const hue = projectHues[hash % projectHues.length];
  return { text: `hsl(${hue} 55% 34%)`, dot: `hsl(${hue} 70% 48%)` };
};

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

  const filteredEmptyState = (
    <Empty className="py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>No matches</EmptyTitle>
        <p className="text-sm text-muted-foreground">
          {searchQuery && filterProject !== 'all'
            ? `Nothing fits "${searchQuery}" in this project.`
            : searchQuery
              ? `Nothing matches "${searchQuery}" on this day.`
              : 'No activities for the selected project on this day.'}
        </p>
      </EmptyHeader>
      <EmptyContent>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            onSearchChange('');
            onFilterChange('all');
          }}
        >
          Clear filters
        </Button>
      </EmptyContent>
    </Empty>
  );

  const dayEmptyState = (
    <Empty className="py-14">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClockIcon />
        </EmptyMedia>
        {restDay ? (
          <>
            <EmptyTitle>Rest day</EmptyTitle>
            <p className="text-sm text-muted-foreground">
              Fridays and Saturdays have no target. Anything you log still counts.
            </p>
          </>
        ) : viewingToday ? (
          <>
            <EmptyTitle>Nothing logged yet</EmptyTitle>
            <p className="text-sm text-muted-foreground">Your entries will appear here as you log them.</p>
          </>
        ) : dayInPast ? (
          <>
            <EmptyTitle>Nothing logged on {format(selectedDate, 'EEE, MMM d')}</EmptyTitle>
            <p className="text-sm text-muted-foreground">This day has a gap. A late entry keeps your report accurate.</p>
          </>
        ) : (
          <>
            <EmptyTitle>Nothing on {format(selectedDate, 'EEE, MMM d')} yet</EmptyTitle>
            <p className="text-sm text-muted-foreground">You can get a head start on a future day.</p>
          </>
        )}
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" variant={restDay ? 'outline' : 'default'} onClick={onAddActivity}>
          <PlusIcon data-icon="inline-start" />
          {restDay ? 'Log time anyway' : viewingToday ? 'Log your first activity' : 'Log an activity'}
        </Button>
      </EmptyContent>
    </Empty>
  );

  return (
    <Card className="rounded-2xl gap-0 py-0 overflow-hidden" data-tour="list">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-4 py-3 lg:px-6">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          Today&apos;s activities
          {dayActivities.length > 0 && (
            <>
              <span className="text-sm font-semibold text-muted-foreground tabular-nums">{dayActivities.length}</span>
              <span className="text-sm font-medium text-muted-foreground tabular-nums">
                · {formatDurationLabel(totalMinutes)} logged
              </span>
            </>
          )}
        </h3>
        <div className="flex items-center gap-1.5">
          {onOpenDrafts && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenDrafts}
              className="text-muted-foreground hover:text-foreground"
            >
              <FileTextIcon data-icon="inline-start" />
              <span className="hidden sm:inline">Drafts</span>
              {draftsCount > 0 && (
                <span className="ml-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary/10 px-1 text-[10px] font-bold text-primary tabular-nums">
                  {draftsCount}
                </span>
              )}
            </Button>
          )}
          {onOpenRecurringActivities && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenRecurringActivities}
              className="text-muted-foreground hover:text-foreground"
            >
              <RepeatIcon data-icon="inline-start" />
              <span className="hidden sm:inline">Recurring</span>
            </Button>
          )}
        </div>
      </div>

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
          filteredEmptyState
        ) : (
          dayEmptyState
        )
      ) : (
        <ol className="relative px-4 py-2 sm:px-5">
          {/* The day rail: one line every entry hangs from (desktop only; mobile stacks). */}
          <span
            className="absolute bottom-6 left-[calc(4rem+1.25rem)] top-6 hidden w-px bg-border sm:block sm:left-[calc(4.5rem+1.25rem)]"
            aria-hidden="true"
          />
          <AnimatePresence initial={false}>
          {dayActivities.map((activity, index) => {
            const status = statusStyle[activity.status];
            const project = projects.find((item) => item.id === activity.projectId);
            const color = projectColor(activity.projectId || activity.id);
            const competencies = (activity.competencies ?? []).slice(0, 3);
            const hiddenCompetencies = (activity.competencies ?? []).length - competencies.length;
            const isSaving = optimisticId === activity.id;

            return (
              <motion.li
                key={activity.id}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, ease: 'easeOut', delay: Math.min(index * 0.04, 0.2) }}
                className={cn(
                  'relative flex flex-col py-4 sm:flex-row sm:items-start',
                  isSaving && 'animate-pulse',
                )}
                aria-busy={isSaving || undefined}
              >
                {/* Time gutter: when it starts (and ends, on desktop). */}
                <div className="flex w-auto shrink-0 items-baseline pt-0.5 sm:w-[4.5rem] sm:flex-col sm:items-end sm:gap-0.5">
                  <span className="text-xs font-bold text-foreground tabular-nums">{formatTime(activity.startTime)}</span>
                  <span className="hidden text-[11px] font-medium text-muted-foreground tabular-nums sm:inline">
                    {formatTime(activity.endTime)}
                  </span>
                </div>

                <span
                  className={cn(
                    'relative z-10 ml-5 mr-3.5 mt-1.5 hidden size-2.5 shrink-0 rounded-full ring-4 ring-card sm:ml-5 sm:mr-3.5 sm:block',
                    status.dot,
                  )}
                  aria-hidden="true"
                />

                <div className="mt-2 min-w-0 flex-1">
                  <h4 className="line-clamp-2 text-[15px] font-bold text-foreground leading-snug sm:truncate" title={activity.title}>
                    {activity.title}
                  </h4>
                  {activity.description && (
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground" title={activity.description}>
                      {activity.description}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-semibold" style={{ color: color.text }}>
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: color.dot }} />
                      {project?.name || 'Unknown project'}
                    </span>
                    {(currentUser.role === 'manager' || currentUser.role === 'admin') && activity.employeeName && (
                      <>
                        <span className="opacity-40">·</span>
                        <span>{activity.employeeName}</span>
                      </>
                    )}
                    {hiddenCompetencies > 0 && (
                      <>
                        <span className="opacity-40">·</span>
                        <span className="tabular-nums">+{hiddenCompetencies} skills</span>
                      </>
                    )}
                  </div>

                  {competencies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {competencies.map((competencyId) => {
                        const competency = competencyOptions.find((option) => option.id === competencyId);
                        const competencyColor = competency?.color || '#6366f1';
                        const label =
                          competency?.label || competencyId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                        return (
                          <span
                            key={competencyId}
                            className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold"
                            style={{ backgroundColor: `${competencyColor}14`, color: competencyColor }}
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Duration, status and actions stack into a scannable column on desktop. */}
                <div className="mt-2 flex items-center gap-2 sm:mt-0 sm:ml-auto sm:w-24 sm:flex-col sm:items-end sm:gap-1.5">
                  <span
                    className="text-base font-extrabold text-foreground tabular-nums sm:leading-none"
                    title="Duration"
                  >
                    {formatDurationLabel(Math.round(activity.duration * 60))}
                  </span>
                  <Badge variant={status.badge}>{status.label}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for "${activity.title}"`}
                        className="text-muted-foreground"
                      >
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onEditActivity(activity)}>
                        <PencilIcon />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicateActivity(activity)}>
                        <CopyIcon />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => onDeleteActivity(activity.id)}>
                        <Trash2Icon />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.li>
            );
          })}
          </AnimatePresence>
        </ol>
      )}
    </Card>
  );
};

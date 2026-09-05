import React from 'react';
import { ClockIcon, CopyIcon, PencilIcon, PlusIcon, RepeatIcon, Trash2Icon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { competencyOptions, type ActivityEntry, type Project, type User } from '../../../entities';

interface DashboardActivityListProps {
  activities: ActivityEntry[];
  projects: Project[];
  currentUser: User;
  onAddActivity: () => void;
  onEditActivity: (activity: ActivityEntry) => void;
  onDuplicateActivity: (activity: ActivityEntry) => void;
  onDeleteActivity: (id: string) => void;
  onOpenRecurringActivities?: () => void;
  onVoiceRecord?: () => void;
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const getStatus = (status: ActivityEntry['status']) => {
  if (status === 'completed') return { label: 'Completed', variant: 'success' as const };
  if (status === 'pending-approval') return { label: 'Pending approval', variant: 'warning' as const };
  if (status === 'blocked') return { label: 'Blocked', variant: 'destructive' as const };
  return { label: 'In progress', variant: 'info' as const };
};

// Stable, readable color per project id, so rows are scannable without a color field on the entity.
const projectHues = [221, 262, 168, 32, 340, 288, 199, 142];
const projectColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) % 997;
  const hue = projectHues[hash % projectHues.length];
  return { bg: `hsl(${hue} 70% 95%)`, text: `hsl(${hue} 55% 34%)`, dot: `hsl(${hue} 70% 48%)` };
};

const projectInitial = (name: string) => name.trim().charAt(0).toUpperCase() || '?';

export const DashboardActivityList: React.FC<DashboardActivityListProps> = ({
  activities,
  projects,
  currentUser,
  onAddActivity,
  onEditActivity,
  onDuplicateActivity,
  onDeleteActivity,
  onOpenRecurringActivities,
  onVoiceRecord,
}) => (
  <Card className="rounded-2xl gap-0 py-0 overflow-hidden">
    <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 border-b !py-4 lg:!px-6">
      <CardTitle className="text-base">
        Activity log
        {activities.length > 0 && (
          <span className="ml-2 text-sm font-semibold text-muted-foreground tabular-nums">
            {activities.length}
          </span>
        )}
      </CardTitle>
      <div className="flex flex-wrap justify-end gap-2">
        {onOpenRecurringActivities && (
          <Button variant="outline" size="sm" onClick={onOpenRecurringActivities}>
            <RepeatIcon data-icon="inline-start" />
            <span className="hidden sm:inline">Recurring</span>
          </Button>
        )}
        <Button size="sm" onClick={onAddActivity}>
          <PlusIcon data-icon="inline-start" />
          <span className="hidden sm:inline">New activity</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>
    </CardHeader>

    {activities.length === 0 ? (
      <Empty className="py-14">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ClockIcon />
          </EmptyMedia>
          <EmptyTitle>Nothing logged for this day</EmptyTitle>
          <p className="text-sm text-muted-foreground">
            Log what you worked on to keep your report up to date.
          </p>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" onClick={onAddActivity}>
            <PlusIcon data-icon="inline-start" />
            Log an activity
          </Button>
        </EmptyContent>
      </Empty>
    ) : (
      <ul className="divide-y divide-border">
        {activities.map((activity) => {
          const status = getStatus(activity.status);
          const project = projects.find((item) => item.id === activity.projectId);
          const color = projectColor(activity.projectId || activity.id);

          return (
            <motion.li
              key={activity.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 sm:p-5 lg:px-6 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div
                  className="size-10 rounded-lg flex items-center justify-center text-sm font-extrabold shrink-0"
                  style={{ backgroundColor: color.bg, color: color.text }}
                  aria-hidden="true"
                >
                  {projectInitial(project?.name || '?')}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-[15px] font-bold text-foreground leading-snug">{activity.title}</h4>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{activity.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1 tabular-nums">
                      <ClockIcon className="size-3.5 opacity-70" />
                      {formatTime(activity.startTime)} – {formatTime(activity.endTime)}
                    </span>
                    <span className="opacity-40">·</span>
                    <span className="tabular-nums">{activity.duration.toFixed(1)}h</span>
                    <span className="opacity-40">·</span>
                    <span className="flex items-center gap-1.5 font-semibold" style={{ color: color.text }}>
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: color.dot }} />
                      {project?.name || 'Unknown project'}
                    </span>
                    {(currentUser.role === 'manager' || currentUser.role === 'admin') && (
                      <>
                        <span className="opacity-40">·</span>
                        <span>{activity.employeeName}</span>
                      </>
                    )}
                  </div>

                  {activity.competencies && activity.competencies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {activity.competencies.map((competencyId) => {
                        const competency = competencyOptions.find((option) => option.id === competencyId);
                        const competencyColor = competency?.color || '#6366f1';
                        const label =
                          competency?.label ||
                          competencyId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                        const Icon = competency?.icon;

                        return (
                          <span
                            key={competencyId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold"
                            style={{ backgroundColor: `${competencyColor}18`, color: competencyColor }}
                          >
                            {Icon && <Icon className="size-3" />}
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 lg:ml-4 shrink-0 self-end lg:self-center">
                <Badge variant={status.variant}>{status.label}</Badge>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEditActivity(activity)}
                  aria-label={`Edit "${activity.title}"`}
                  title="Edit"
                  className="text-muted-foreground"
                >
                  <PencilIcon />
                </Button>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDuplicateActivity(activity)}
                  aria-label={`Duplicate "${activity.title}"`}
                  title="Duplicate to a new entry"
                  className="text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                >
                  <CopyIcon />
                </Button>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDeleteActivity(activity.id)}
                  aria-label={`Delete "${activity.title}"`}
                  title="Delete"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2Icon />
                </Button>
              </div>
            </motion.li>
          );
        })}
      </ul>
    )}
  </Card>
);

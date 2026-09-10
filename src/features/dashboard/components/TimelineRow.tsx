import React from 'react';
import { CopyIcon, MoreVertical, PencilIcon, Trash2Icon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDurationLabel } from '@/lib/time';
import { competencyOptions, type ActivityEntry, type Project, type User } from '../../../entities';

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
  // Lightness comes from tokens so per-project colors stay readable in the dark theme.
  return { text: `hsl(${hue} 55% var(--project-text-lightness))`, dot: `hsl(${hue} 70% var(--project-dot-lightness))` };
};

/** One entry's content inside the day rail — the animated `motion.li` wrapper stays with the list. */
export const TimelineRow: React.FC<{
  activity: ActivityEntry;
  project: Project | undefined;
  currentUser: User;
  onEdit: (activity: ActivityEntry) => void;
  onDuplicate: (activity: ActivityEntry) => void;
  onDelete: (id: string) => void;
}> = ({ activity, project, currentUser, onEdit, onDuplicate, onDelete }) => {
  const status = statusStyle[activity.status];
  const color = projectColor(activity.projectId || activity.id);
  const competencies = (activity.competencies ?? []).slice(0, 3);
  const hiddenCompetencies = (activity.competencies ?? []).length - competencies.length;

  return (
    <>
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
            <DropdownMenuItem onClick={() => onEdit(activity)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(activity)}>
              <CopyIcon />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(activity.id)}>
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

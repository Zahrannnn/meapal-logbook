import { FolderKanbanIcon } from 'lucide-react';
import { Field, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimeRangePicker } from '@/components/time-range-picker';
import { cn } from '@/lib/utils';
import { formatDurationLabel, toHHMM, toMinutes } from '@/lib/time';
import type { ActivityDraft } from '../model/activity.types';
import type { Project } from '../../../entities';

interface ActivityCoreFieldsProps {
  activity: ActivityDraft;
  projects: Project[];
  /** Shown when a save was attempted without a project. */
  projectError?: string;
  onChange: (updates: Partial<ActivityDraft>) => void;
}

const MAX_MINUTES = 24 * 60 - 1;

export const ActivityCoreFields = ({ activity, projects, projectError, onChange }: ActivityCoreFieldsProps) => {
  const durationMinutes = toMinutes(activity.endTime) - toMinutes(activity.startTime);

  // Moving start past end would invalidate the span; slide end along instead,
  // keeping whatever duration the entry had.
  const handleStartChange = (value: string) => {
    const startMin = toMinutes(value);
    if (toMinutes(activity.endTime) <= startMin) {
      const duration = Math.max(durationMinutes, 15);
      const nextEnd = Math.min(startMin + duration, MAX_MINUTES);
      if (nextEnd > startMin) {
        onChange({ startTime: value, endTime: toHHMM(nextEnd) });
        return;
      }
    }
    onChange({ startTime: value });
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)] sm:gap-x-3">
      <Field>
        <FieldLabel htmlFor="activity-project">
          <FolderKanbanIcon className="opacity-60" />
          Project
        </FieldLabel>
        <Select value={activity.projectId} onValueChange={(value) => onChange({ projectId: value })}>
          <SelectTrigger
            id="activity-project"
            aria-invalid={!!projectError}
            className={cn('w-full', projectError && 'border-destructive focus-visible:ring-destructive/30')}
          >
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {projectError && (
          <p className="mt-1.5 text-xs font-semibold text-destructive" role="alert">
            {projectError}
          </p>
        )}
      </Field>

      <Field>
        <FieldLabel>Time</FieldLabel>
        <TimeRangePicker
          startTime={activity.startTime}
          endTime={activity.endTime}
          onStartChange={handleStartChange}
          onEndChange={(value) => onChange({ endTime: value })}
        />
        {durationMinutes <= 0 && (
          <p className="text-xs font-semibold text-destructive" role="alert">
            End time must be after start time
          </p>
        )}
      </Field>
    </div>
  );
};

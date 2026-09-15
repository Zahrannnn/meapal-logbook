import React, { useMemo, useState } from 'react';
import { FolderKanbanIcon } from 'lucide-react';
import { Field, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimeRangePicker } from '@/components/time-range-picker';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
const DURATION_MODE_KEY = 'logbook:duration-mode';

type TimeMode = 'times' | 'duration';

const readTimeMode = (): TimeMode => {
  try {
    return localStorage.getItem(DURATION_MODE_KEY) === 'duration' ? 'duration' : 'times';
  } catch {
    return 'times';
  }
};

const START_TIME_OPTIONS = (() => {
  const options: Array<{ value: string; label: string }> = [];
  const base = new Date(2000, 0, 1);
  for (let minutes = 0; minutes < 24 * 60; minutes += 15) {
    const point = new Date(base.getTime() + minutes * 60000);
    options.push({
      value: `${String(point.getHours()).padStart(2, '0')}:${String(point.getMinutes()).padStart(2, '0')}`,
      label: point.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    });
  }
  return options;
})();

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 150, 180, 240, 300, 360, 420, 480];

export const ActivityCoreFields = ({ activity, projects, projectError, onChange }: ActivityCoreFieldsProps) => {
  const [timeMode, setTimeMode] = useState<TimeMode>(readTimeMode);
  const durationMinutes = toMinutes(activity.endTime) - toMinutes(activity.startTime);

  const switchTimeMode = (mode: string) => {
    if (mode !== 'times' && mode !== 'duration') return;
    setTimeMode(mode);
    try {
      localStorage.setItem(DURATION_MODE_KEY, mode);
    } catch {
      // storage unavailable — the choice just won't persist
    }
  };

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

  // Duration mode: pick a start and a length; the end is derived, so the draft
  // contract (start/end pair) never changes.
  const handleDurationStartChange = (value: string) => {
    const duration = Math.max(durationMinutes, 60);
    onChange({ startTime: value, endTime: toHHMM(Math.min(toMinutes(value) + duration, MAX_MINUTES)) });
  };
  const handleDurationChange = (minutes: number) => {
    onChange({ endTime: toHHMM(Math.min(toMinutes(activity.startTime) + minutes, MAX_MINUTES)) });
  };

  // Gap chips can prefill off-grid times (any entry end); keep them selectable.
  const startTimeOptions = useMemo(() => {
    if (START_TIME_OPTIONS.some((option) => option.value === activity.startTime)) return START_TIME_OPTIONS;
    const point = new Date(2000, 0, 1);
    const [hours, minutes] = activity.startTime.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return START_TIME_OPTIONS;
    point.setHours(hours, minutes);
    return [...START_TIME_OPTIONS, { value: activity.startTime, label: point.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]
      .sort((left, right) => toMinutes(left.value) - toMinutes(right.value));
  }, [activity.startTime]);

  const durationSelectValue = DURATION_OPTIONS.includes(durationMinutes)
    ? String(durationMinutes)
    : durationMinutes > 0
      ? String(durationMinutes)
      : '';
  const durationSelectOptions = DURATION_OPTIONS.includes(durationMinutes) || durationMinutes <= 0
    ? DURATION_OPTIONS
    : [...DURATION_OPTIONS, durationMinutes].sort((left, right) => left - right);

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
        <div className="flex items-center justify-between gap-2">
          <FieldLabel>Time</FieldLabel>
          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={timeMode}
            onValueChange={switchTimeMode}
            aria-label="Time entry mode"
          >
            <ToggleGroupItem value="times" className="h-6 px-2 text-[11px]">
              Times
            </ToggleGroupItem>
            <ToggleGroupItem value="duration" className="h-6 px-2 text-[11px]">
              Duration
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {timeMode === 'duration' ? (
          <div className="flex items-center gap-2">
            <Select value={activity.startTime} onValueChange={handleDurationStartChange}>
              <SelectTrigger aria-label="Start time" className="w-[45%]">
                <SelectValue placeholder="Start" />
              </SelectTrigger>
              <SelectContent>
                {startTimeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="shrink-0 text-xs font-semibold text-muted-foreground">+</span>
            <Select value={durationSelectValue} onValueChange={(value) => handleDurationChange(Number(value))}>
              <SelectTrigger aria-label="Duration" className="flex-1">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                {durationSelectOptions.map((minutes) => (
                  <SelectItem key={minutes} value={String(minutes)}>
                    {formatDurationLabel(minutes)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <TimeRangePicker
            startTime={activity.startTime}
            endTime={activity.endTime}
            onStartChange={handleStartChange}
            onEndChange={(value) => onChange({ endTime: value })}
          />
        )}
        {durationMinutes <= 0 && (
          <p className="text-xs font-semibold text-destructive" role="alert">
            End time must be after start time
          </p>
        )}
      </Field>
    </div>
  );
};

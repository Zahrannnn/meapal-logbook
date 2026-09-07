import * as React from 'react';
import { format } from 'date-fns';
import { ChevronDownIcon, ClockIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatDurationLabel, toHHMM, toMinutes } from '@/lib/time';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const buildOptions = () => {
  const options: Array<{ value: string; label: string }> = [];
  const base = new Date(2000, 0, 1);
  for (let minutes = 0; minutes < 24 * 60; minutes += 15) {
    const point = new Date(base.getTime() + minutes * 60000);
    const value = `${String(point.getHours()).padStart(2, '0')}:${String(point.getMinutes()).padStart(2, '0')}`;
    options.push({ value, label: format(point, 'h:mm a') });
  }
  return options;
};

const TIME_OPTIONS = buildOptions();

/** Label for any `HH:mm` value, even one not on the 15-minute grid. */
const labelFor = (value: string) => {
  const exact = TIME_OPTIONS.find((option) => option.value === value);
  if (exact) return exact.label;
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const point = new Date(2000, 0, 1, hours, minutes);
  return format(point, 'h:mm a');
};

/** Quick spans shown in the menu; picking one sets end = start + span. */
const DURATION_PRESETS = [
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '1h', minutes: 60 },
  { label: '1.5h', minutes: 90 },
  { label: '2h', minutes: 120 },
  { label: '3h', minutes: 180 },
];

interface TimeRangePickerProps {
  /** `HH:mm` (24h) strings, matching the activity form state. */
  startTime: string;
  endTime: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  className?: string;
}

/** One control, one menu: the trigger shows "9:00 AM – 10:00 AM", the menu picks both ends. */
export function TimeRangePicker({ startTime, endTime, onStartChange, onEndChange, className }: TimeRangePickerProps) {
  const durationMinutes = toMinutes(endTime) - toMinutes(startTime);
  const hasValidDuration = durationMinutes > 0;
  const activePreset = DURATION_PRESETS.find((preset) => preset.minutes === durationMinutes)?.label ?? '';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label={`Time range ${labelFor(startTime)} to ${labelFor(endTime)}`}
          className={cn('w-full justify-start font-medium', !hasValidDuration && 'border-destructive', className)}
        >
          <ClockIcon data-icon="inline-start" className="text-muted-foreground" />
          <span className="truncate">
            {labelFor(startTime)} – {labelFor(endTime)}
          </span>
          {hasValidDuration && (
            <Badge variant="secondary" className="ml-auto shrink-0 tabular-nums">
              {formatDurationLabel(durationMinutes)}
            </Badge>
          )}
          <ChevronDownIcon
            data-icon="inline-end"
            className={cn('text-muted-foreground', !hasValidDuration && 'ml-auto')}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" collisionPadding={16} className="w-80">
        <FieldGroup className="gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="activity-start">Start</FieldLabel>
              <Select value={startTime} onValueChange={onStartChange}>
                <SelectTrigger id="activity-start" className="w-full font-medium">
                  <SelectValue placeholder="Start" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {TIME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="activity-end">End</FieldLabel>
              <Select value={endTime} onValueChange={onEndChange}>
                <SelectTrigger id="activity-end" className="w-full font-medium">
                  <SelectValue placeholder="End" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {TIME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field>
            <FieldLabel>Quick duration</FieldLabel>
            <ToggleGroup
              type="single"
              variant="outline"
              value={activePreset}
              onValueChange={(value) => {
                if (!value) return;
                const preset = DURATION_PRESETS.find((item) => item.label === value);
                if (preset) {
                  onEndChange(toHHMM(Math.min(toMinutes(startTime) + preset.minutes, 24 * 60 - 1)));
                }
              }}
              className="w-full flex-wrap"
              aria-label="Quick duration"
            >
              {DURATION_PRESETS.map((preset) => (
                <ToggleGroupItem key={preset.label} value={preset.label} className="flex-1 min-w-0 px-2 font-bold">
                  {preset.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>

          {hasValidDuration ? (
            <p className="text-xs font-semibold text-muted-foreground">
              Duration: <span className="text-foreground tabular-nums">{formatDurationLabel(durationMinutes)}</span>
            </p>
          ) : (
            <p className="text-xs font-semibold text-destructive" role="alert">
              End time must be after start time
            </p>
          )}
        </FieldGroup>
      </PopoverContent>
    </Popover>
  );
}

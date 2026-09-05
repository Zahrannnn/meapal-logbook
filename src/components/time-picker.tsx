import * as React from 'react';
import { format } from 'date-fns';
import { ClockIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface TimePickerProps {
  id?: string;
  /** `HH:mm` (24h) string, matching the activity form state. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimePicker({ id, value, onChange, placeholder = 'Select time', className }: TimePickerProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className={cn('w-full bg-card', className)}>
        <span className="flex items-center gap-2 min-w-0">
          <ClockIcon className="size-4 opacity-60 shrink-0" />
          <SelectValue placeholder={placeholder}>{value ? labelFor(value) : placeholder}</SelectValue>
        </span>
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {TIME_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

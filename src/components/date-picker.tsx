import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/** Convert a `yyyy-MM-dd` string to a local Date, or undefined when empty/invalid. */
export const parseDateValue = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
};

/** Convert a local Date to a `yyyy-MM-dd` string. */
export const formatDateValue = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

interface DatePickerProps {
  id?: string;
  /** `yyyy-MM-dd` string, matching the rest of the form state. */
  value?: string;
  onChange: (value: string) => void;
  /** react-day-picker matcher, e.g. `{ before: new Date() }` to block past dates. */
  disabled?: React.ComponentProps<typeof Calendar>['disabled'];
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  id,
  value,
  onChange,
  disabled,
  placeholder = 'Pick a date',
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseDateValue(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start px-3 font-normal bg-card',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon />
          {selected ? (
            <span className="tabular-nums">{format(selected, 'EEE, MMM d, yyyy')}</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          disabled={disabled}
          onSelect={(date) => {
            if (date) {
              onChange(formatDateValue(date));
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

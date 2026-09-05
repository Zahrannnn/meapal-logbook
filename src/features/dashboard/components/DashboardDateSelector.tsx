import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DatePicker, formatDateValue } from '@/components/date-picker';

interface DashboardDateSelectorProps {
  selectedDate: Date;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onDateChange?: (date: Date) => void;
}

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const DashboardDateSelector: React.FC<DashboardDateSelectorProps> = ({
  selectedDate,
  onPreviousDay,
  onNextDay,
  onToday,
  onDateChange,
}) => {
  const dayStart = startOfToday();
  const selectedStart = new Date(selectedDate);
  selectedStart.setHours(0, 0, 0, 0);
  const dayDiff = Math.round((selectedStart.getTime() - dayStart.getTime()) / 86400000);

  const relativeLabel =
    dayDiff === 0 ? 'Today' : dayDiff === -1 ? 'Yesterday' : dayDiff === 1 ? 'Tomorrow' : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="icon" onClick={onPreviousDay} aria-label="Previous day" className="rounded-xl">
        <ChevronLeftIcon />
      </Button>

      {onDateChange ? (
        <DatePicker
          value={formatDateValue(selectedStart)}
          onChange={(value) => {
            const [year, month, day] = value.split('-').map(Number);
            onDateChange(new Date(year, month - 1, day));
          }}
          className="w-auto rounded-xl"
        />
      ) : (
        <div className="flex items-center gap-2.5 h-9 px-3 rounded-xl border bg-card shadow-xs min-w-[14rem] justify-center">
          <span className="text-sm font-bold text-foreground whitespace-nowrap">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      )}

      {relativeLabel && (
        <Badge variant={dayDiff === 0 ? 'default' : 'secondary'} className="hidden md:inline-flex">
          {relativeLabel}
        </Badge>
      )}

      <Button variant="outline" size="icon" onClick={onNextDay} aria-label="Next day" className="rounded-xl">
        <ChevronRightIcon />
      </Button>

      {dayDiff !== 0 && (
        <Button variant="outline" onClick={onToday} className="rounded-xl text-primary font-bold">
          Today
        </Button>
      )}
    </div>
  );
};

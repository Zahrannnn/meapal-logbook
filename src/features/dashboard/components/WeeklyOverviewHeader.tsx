import React from 'react';
import { format } from 'date-fns';
import { ChevronDown, InfoIcon } from 'lucide-react';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/** Disclosure header for the weekly overview: totals label, expand chevron and the
 *  "how these numbers are calculated" popover. */
export const WeeklyOverviewHeader: React.FC<{
  isOpen: boolean;
  onToggle: () => void;
  weekTotal: number;
  weekHours: number;
  windowLabel: string;
  selectedDate: Date;
  isCurrentWeek: boolean;
  canSelectBars: boolean;
}> = ({ isOpen, onToggle, weekTotal, weekHours, windowLabel, selectedDate, isCurrentWeek, canSelectBars }) => (
  <div
    className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-6 cursor-pointer select-none"
    onClick={onToggle}
    role="button"
    tabIndex={0}
    aria-expanded={isOpen}
    aria-label={isOpen ? 'Collapse weekly overview' : 'Expand weekly overview'}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onToggle();
      }
    }}
  >
    <CardTitle className="flex items-center gap-2">
      Weekly overview
      <ChevronDown
        className={`size-4 text-muted-foreground transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`}
        aria-hidden="true"
      />
    </CardTitle>
    <div className="flex items-center gap-0.5" onClick={(event) => event.stopPropagation()}>
      <p className="text-sm text-muted-foreground tabular-nums">
        {weekTotal} {weekTotal === 1 ? 'activity' : 'activities'} · {weekHours.toFixed(1)}h {windowLabel}
      </p>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="How these numbers are calculated"
            className="text-muted-foreground/60 hover:text-foreground"
          >
            <InfoIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" collisionPadding={16} className="w-80 text-sm">
          <p className="font-bold text-foreground">How this summary is calculated</p>
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4 text-muted-foreground">
            <li>
              Shows your week <span className="font-semibold text-foreground">Saturday to Friday</span> containing
              the selected date ({format(selectedDate, 'EEE, MMM d')}
              {isCurrentWeek ? ', current week' : ''}), the same days as the bars. The working days inside it are
              Sunday to Thursday.
            </li>
            <li>
              <span className="font-semibold text-foreground tabular-nums">{weekTotal}</span> = activities logged on
              those days.
            </li>
            <li>
              <span className="font-semibold text-foreground tabular-nums">{weekHours.toFixed(1)}h</span> = time
              between each entry&apos;s start and end. Overlapping entries count once, and entries whose end time
              isn&apos;t after their start are skipped.
            </li>
            <li>Friday and Saturday are rest days (muted in the chart), but anything you log on them counts.</li>
            {canSelectBars && <li>Select a bar to open that day.</li>}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  </div>
);

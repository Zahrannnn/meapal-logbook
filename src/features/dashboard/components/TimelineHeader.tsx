import React from 'react';
import { FileTextIcon, RepeatIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDurationLabel } from '@/lib/time';

/** Card toolbar: the day's entry count and total, plus the drafts/recurring quick actions. */
export const TimelineHeader: React.FC<{
  count: number;
  totalMinutes: number;
  draftsCount: number;
  onOpenDrafts?: () => void;
  onOpenRecurringActivities?: () => void;
}> = ({ count, totalMinutes, draftsCount, onOpenDrafts, onOpenRecurringActivities }) => (
  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-4 py-3 lg:px-6">
    <h3 className="flex items-center gap-2 text-base font-semibold">
      Today&apos;s activities
      {count > 0 && (
        <>
          <span className="text-sm font-semibold text-muted-foreground tabular-nums">{count}</span>
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
);

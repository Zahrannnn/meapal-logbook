import React from 'react';
import { ClockIcon, PlusIcon, SearchXIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

/** Shown when filters/search hide every entry on a day that has entries. */
export const FilteredEmptyState: React.FC<{
  searchQuery: string;
  filterProject: string;
  onClear: () => void;
}> = ({ searchQuery, filterProject, onClear }) => (
  <Empty className="py-12">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <SearchXIcon />
      </EmptyMedia>
      <EmptyTitle>No matches</EmptyTitle>
      <p className="text-sm text-muted-foreground">
        {searchQuery && filterProject !== 'all'
          ? `Nothing fits "${searchQuery}" in this project.`
          : searchQuery
            ? `Nothing matches "${searchQuery}" on this day.`
            : 'No activities for the selected project on this day.'}
      </p>
    </EmptyHeader>
    <EmptyContent>
      <Button size="sm" variant="outline" onClick={onClear}>
        Clear filters
      </Button>
    </EmptyContent>
  </Empty>
);

/** Shown when the day itself has no entries — copy varies by rest day / today / past / future. */
export const DayEmptyState: React.FC<{
  selectedDate: Date;
  restDay: boolean;
  viewingToday: boolean;
  dayInPast: boolean;
  onAddActivity: () => void;
}> = ({ selectedDate, restDay, viewingToday, dayInPast, onAddActivity }) => (
  <Empty className="py-14">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <ClockIcon />
      </EmptyMedia>
      {restDay ? (
        <>
          <EmptyTitle>Rest day</EmptyTitle>
          <p className="text-sm text-muted-foreground">
            Fridays and Saturdays have no target. Anything you log still counts.
          </p>
        </>
      ) : viewingToday ? (
        <>
          <EmptyTitle>Nothing logged yet</EmptyTitle>
          <p className="text-sm text-muted-foreground">Your entries will appear here as you log them.</p>
        </>
      ) : dayInPast ? (
        <>
          <EmptyTitle>Nothing logged on {format(selectedDate, 'EEE, MMM d')}</EmptyTitle>
          <p className="text-sm text-muted-foreground">This day has a gap. A late entry keeps your report accurate.</p>
        </>
      ) : (
        <>
          <EmptyTitle>Nothing on {format(selectedDate, 'EEE, MMM d')} yet</EmptyTitle>
          <p className="text-sm text-muted-foreground">You can get a head start on a future day.</p>
        </>
      )}
    </EmptyHeader>
    <EmptyContent>
      <Button size="sm" variant={restDay ? 'outline' : 'default'} onClick={onAddActivity}>
        <PlusIcon data-icon="inline-start" />
        {restDay ? 'Log time anyway' : viewingToday ? 'Log your first activity' : 'Log an activity'}
      </Button>
    </EmptyContent>
  </Empty>
);

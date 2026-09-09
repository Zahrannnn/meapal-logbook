import React from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardDateSelector } from './DashboardDateSelector';
import { useDashboardDateNavigation } from '../hooks/useDashboardDateNavigation';

/** The day controls and the primary CTA share the page's top row — sticky under the app header. */
export const DashboardDayControls: React.FC<{
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAddActivity: () => void;
}> = ({ selectedDate, onDateChange, onAddActivity }) => {
  const { goToPreviousDay, goToNextDay, goToToday } = useDashboardDateNavigation({
    selectedDate,
    onDateChange,
  });

  return (
    <div className="sticky top-[52px] z-20 -mx-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 bg-background/90 px-4 py-2 backdrop-blur-sm sm:top-14 lg:-mx-2 lg:rounded-b-xl lg:px-2">
      <DashboardDateSelector
        selectedDate={selectedDate}
        onPreviousDay={goToPreviousDay}
        onNextDay={goToNextDay}
        onToday={goToToday}
        onDateChange={onDateChange}
      />
      <Button onClick={onAddActivity} className="rounded-xl" data-tour="cta">
        <PlusIcon data-icon="inline-start" />
        Log activity
      </Button>
    </div>
  );
};

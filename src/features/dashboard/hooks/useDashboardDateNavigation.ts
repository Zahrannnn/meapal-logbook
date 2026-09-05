import { useCallback } from 'react';

interface UseDashboardDateNavigationOptions {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const useDashboardDateNavigation = ({
  selectedDate,
  onDateChange,
}: UseDashboardDateNavigationOptions) => {
  const goToPreviousDay = useCallback(() => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() - 1);
    onDateChange(nextDate);
  }, [onDateChange, selectedDate]);

  const goToNextDay = useCallback(() => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    onDateChange(nextDate);
  }, [onDateChange, selectedDate]);

  const goToToday = useCallback(() => {
    onDateChange(new Date());
  }, [onDateChange]);

  return {
    goToPreviousDay,
    goToNextDay,
    goToToday,
  };
};

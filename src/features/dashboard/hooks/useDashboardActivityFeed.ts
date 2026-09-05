import { useMemo } from 'react';
import type { ActivityEntry, User } from '../../../entities';
import { calculateActualHours } from '../../../lib/utils';
import { getWorkWeek } from '../../../lib/payPeriod';

interface UseDashboardActivityFeedOptions {
  activities: ActivityEntry[];
  currentUser: User;
  selectedDate: Date;
  searchQuery: string;
  filterProject: string;
}

export const useDashboardActivityFeed = ({
  activities,
  currentUser,
  selectedDate,
  searchQuery,
  filterProject,
}: UseDashboardActivityFeedOptions) => {
  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const filteredActivities = useMemo(() => {
    let filtered = activities;

    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (activity) =>
          activity.title.toLowerCase().includes(normalizedQuery) ||
          activity.description.toLowerCase().includes(normalizedQuery) ||
          activity.employeeName?.toLowerCase().includes(normalizedQuery),
      );
    }

    if (filterProject !== 'all') {
      filtered = filtered.filter((activity) => activity.projectId === filterProject);
    }

    return filtered;
  }, [activities, searchQuery, filterProject]);

  const todayActivities = useMemo(
    () => filteredActivities.filter((activity) => activity.date === selectedDateStr),
    [filteredActivities, selectedDateStr],
  );

  const totalHoursToday = useMemo(() => calculateActualHours(todayActivities), [todayActivities]);
  const completedToday = useMemo(
    () => todayActivities.filter((activity) => activity.status === 'completed').length,
    [todayActivities],
  );
  const targetProgress = (todayActivities.length / currentUser.targetActivitiesPerDay) * 100;

  const weeklyTrendData = useMemo(() => {
    // The working week containing the selected date: Sunday → Thursday. The calendar is
    // the context controller — the chart always shows this week's data.
    const week = getWorkWeek(selectedDate);
    return week.days.map((day) => {
      const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      const dayActivities = filteredActivities.filter((activity) => activity.date === dateStr);

      return {
        date: dateStr,
        day: day.toLocaleDateString('en-US', { weekday: 'short' }),
        activities: dayActivities.length,
        hours: calculateActualHours(dayActivities),
      };
    });
  }, [filteredActivities, selectedDate]);

  // Single source of truth for "this week": derived from the same 7 trend points the chart
  // plots (date-string comparisons, so timezone parsing can't shift the window bounds).
  const weekActivityCount = useMemo(
    () => weeklyTrendData.reduce((sum, point) => sum + point.activities, 0),
    [weeklyTrendData],
  );
  const weekHours = useMemo(
    () => weeklyTrendData.reduce((sum, point) => sum + point.hours, 0),
    [weeklyTrendData],
  );

  const pendingActivities = useMemo(
    () => todayActivities.filter((activity) => activity.status === 'pending-approval'),
    [todayActivities],
  );

  return {
    todayActivities,
    totalHoursToday,
    completedToday,
    targetProgress,
    weeklyTrendData,
    weekActivityCount,
    weekHours,
    pendingActivities,
  };
};

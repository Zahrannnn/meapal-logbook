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

  // Everything scoped to the selected day. The hero and approvals read the
  // UNFILTERED set: day totals are facts, not search results.
  const selectedDateActivities = useMemo(
    () => activities.filter((activity) => activity.date === selectedDateStr),
    [activities, selectedDateStr],
  );

  // The list and the weekly chart honor the active filters.
  const todayActivities = useMemo(
    () => filteredActivities.filter((activity) => activity.date === selectedDateStr),
    [filteredActivities, selectedDateStr],
  );

  const totalHoursToday = useMemo(() => calculateActualHours(selectedDateActivities), [selectedDateActivities]);

  const weeklyTrendData = useMemo(() => {
    // The Sat→Fri week containing the selected date, from the UNFILTERED set:
    // the weekly overview is context, not a search result. Filters scope to the
    // activity list only. The calendar is the context controller.
    const week = getWorkWeek(selectedDate);
    return week.days.map((day) => {
      const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      const dayActivities = activities.filter((activity) => activity.date === dateStr);

      return {
        date: dateStr,
        day: day.toLocaleDateString('en-US', { weekday: 'short' }),
        activities: dayActivities.length,
        hours: calculateActualHours(dayActivities),
        rest: day.getDay() === 5 || day.getDay() === 6,
      };
    });
  }, [activities, selectedDate]);

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
    () => selectedDateActivities.filter((activity) => activity.status === 'pending-approval'),
    [selectedDateActivities],
  );

  return {
    todayActivities,
    dayActivityCount: selectedDateActivities.length,
    totalHoursToday,
    weeklyTrendData,
    weekActivityCount,
    weekHours,
    pendingActivities,
  };
};

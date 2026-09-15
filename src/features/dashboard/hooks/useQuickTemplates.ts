import { useMemo } from 'react';
import type { ActivityEntry, User } from '../../../entities';

/**
 * The user's own recurring work as one-tap starting points: the latest distinct
 * title+project pairs they logged this period. Managers only ever see their own
 * entries here — team activity is not a template.
 */
export const useQuickTemplates = ({
  activities,
  currentUser,
  max = 4,
}: {
  activities: ActivityEntry[];
  currentUser: User;
  max?: number;
}) =>
  useMemo(() => {
    const own = activities.filter(
      (activity) => !activity.employeeName || activity.employeeName === currentUser.name,
    );
    const seen = new Map<string, ActivityEntry>();
    for (const activity of own) {
      const key = `${activity.title}::${activity.projectId}`;
      const existing = seen.get(key);
      if (!existing || activity.date > existing.date) {
        seen.set(key, activity);
      }
    }
    return [...seen.values()]
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, max);
  }, [activities, currentUser.name, max]);

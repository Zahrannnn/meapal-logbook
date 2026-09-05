import { useEffect, useState } from 'react';
import type { ActivityDraft, RecurrenceSettings } from '../model/activity.types';

export const activityWeekDays = [
  { label: 'S', value: 0, full: 'Sunday' },
  { label: 'M', value: 1, full: 'Monday' },
  { label: 'T', value: 2, full: 'Tuesday' },
  { label: 'W', value: 3, full: 'Wednesday' },
  { label: 'T', value: 4, full: 'Thursday' },
  { label: 'F', value: 5, full: 'Friday' },
  { label: 'S', value: 6, full: 'Saturday' },
] as const;

export const useActivityModalState = (activity: ActivityDraft, onChange: (activity: ActivityDraft) => void) => {
  const recurrence = activity.recurring;
  const [showRecurrence, setShowRecurrence] = useState(recurrence.type !== 'none');

  useEffect(() => {
    setShowRecurrence(recurrence.type !== 'none');
  }, [recurrence.type]);

  const updateActivity = (updates: Partial<ActivityDraft>) => {
    onChange({
      ...activity,
      ...updates,
    });
  };

  const updateRecurrence = (updates: Partial<RecurrenceSettings>) => {
    updateActivity({
      recurring: { ...recurrence, ...updates },
    });
  };

  const toggleDayOfWeek = (day: number) => {
    const days = recurrence.daysOfWeek;
    updateRecurrence({
      daysOfWeek: days.includes(day) ? days.filter((value) => value !== day) : [...days, day].sort(),
    });
  };

  const toggleCompetency = (competency: ActivityDraft['competencies'][number]) => {
    updateActivity({
      competencies: activity.competencies.includes(competency)
        ? activity.competencies.filter((value) => value !== competency)
        : [...activity.competencies, competency],
    });
  };

  return {
    showRecurrence,
    setShowRecurrence,
    recurrence,
    updateActivity,
    updateRecurrence,
    toggleDayOfWeek,
    toggleCompetency,
    weekDays: activityWeekDays,
  };
};

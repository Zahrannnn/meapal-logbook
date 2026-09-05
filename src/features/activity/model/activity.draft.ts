import type { ActivityEntry } from '../../../entities';
import type { ActivityDraft, RecurrenceCustomType, RecurrenceSettings, RecurrenceType } from './activity.types';

const toDateInputValue = (value: string | undefined): string => {
  if (!value) {
    return '';
  }

  return value.split('T')[0];
};

export const createDefaultRecurrence = (): RecurrenceSettings => ({
  type: 'none',
  interval: 1,
  daysOfWeek: [],
  customType: 'daily',
  startDate: '',
  endDate: '',
});

export const createDefaultActivityDraft = (): ActivityDraft => ({
  title: '',
  description: '',
  startTime: '09:00',
  endTime: '10:00',
  projectId: '',
  competencies: [],
  status: 'in-progress',
  notes: '',
  recurring: createDefaultRecurrence(),
  progress: 0,
  deadline: '',
});

const normalizeFrequency = (frequency: string | undefined): RecurrenceCustomType | undefined => {
  const normalized = frequency?.toLowerCase().replace(/[_\s-]+/g, '');

  if (normalized === 'daily' || normalized === 'day') {
    return 'daily';
  }

  if (normalized === 'weekly' || normalized === 'week') {
    return 'weekly';
  }

  if (normalized === 'monthly' || normalized === 'month') {
    return 'monthly';
  }

  return undefined;
};

const createRecurrenceFromEntry = (activity: ActivityEntry): RecurrenceSettings => {
  const frequency = normalizeFrequency(activity.recurring?.frequency ?? activity.frequency);
  const interval = activity.recurring?.interval ?? activity.interval ?? 1;
  const type: RecurrenceType = frequency ? (interval > 1 ? 'custom' : frequency) : 'none';

  return {
    type,
    interval,
    daysOfWeek: activity.recurring?.daysOfWeek ?? activity.daysOfWeek ?? [],
    customType: frequency || 'daily',
    startDate: activity.recurring?.startDate ?? activity.startDate ?? '',
    endDate: activity.recurring?.endDate ?? activity.endDate ?? '',
  };
};

export const createActivityDraftFromEntry = (activity: ActivityEntry): ActivityDraft => ({
  title: activity.title,
  description: activity.description,
  startTime: activity.startTime,
  endTime: activity.endTime,
  projectId: activity.projectId,
  competencies: activity.competencies || [],
  status: activity.status,
  notes: activity.notes || '',
  recurring: createRecurrenceFromEntry(activity),
  progress: activity.progress || 0,
  deadline: toDateInputValue(activity.deadline),
});

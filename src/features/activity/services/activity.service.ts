import type { ActivityDraft, ActivitySubmitOptions, ActivityUpdateContext } from '../model/activity.types';
import { activitiesApi, recurrenceActivitiesApi } from '../../../lib/api';
import {
  activityStatusToBackend,
  buildActivityDateTimes,
  getCompetencyIds,
  normalizeRecurrenceForApi,
} from '../mappers/activity.mapper';

const buildActivityPayload = (draft: ActivityDraft, context: ActivityUpdateContext) => {
  const dateTimes = buildActivityDateTimes(context.selectedDate, draft);

  return {
    userId: context.backendUserId,
    projectId: parseInt(draft.projectId, 10),
    title: draft.title,
    startTime: dateTimes.startTime,
    endTime: dateTimes.endTime,
    status: activityStatusToBackend[draft.status],
    notes: draft.notes || draft.description,
    competencyIds: getCompetencyIds(draft.competencies, context.backendCompetencies),
    recurring: normalizeRecurrenceForApi(draft.recurring),
    progress: draft.status === 'in-progress' ? draft.progress : undefined,
    deadline: draft.status === 'in-progress' ? draft.deadline : undefined,
  };
};

export const activityService = {
  submit: async (draft: ActivityDraft, options: ActivitySubmitOptions) => {
    const payload = buildActivityPayload(draft, options);

    if (options.editingActivity) {
      if (options.isEditingRecurringActivity) {
        const recurrence = normalizeRecurrenceForApi(draft.recurring);
        await recurrenceActivitiesApi.update(parseInt(options.editingActivity.id, 10), {
          projectId: payload.projectId,
          title: payload.title,
          notes: payload.notes || '',
          startTime: payload.startTime,
          endTime: payload.endTime,
          frequency: recurrence?.frequency,
          interval: recurrence?.interval,
          daysOfWeek: recurrence?.daysOfWeek,
          maxCount: 1,
          startDate: recurrence?.startDate,
          endDate: recurrence?.endDate,
          competencyIds: payload.competencyIds,
        });
        return;
      }

      await activitiesApi.update(parseInt(options.editingActivity.id, 10), payload);
      return;
    }

    await activitiesApi.create(payload);
  },

  delete: async (activityId: string) => {
    await activitiesApi.delete(parseInt(activityId, 10));
  },

  deleteRecurring: async (activityId: string) => {
    await recurrenceActivitiesApi.delete(parseInt(activityId, 10));
  },

  listRecurring: async () => recurrenceActivitiesApi.getAll({ limit: 100 }),
};

import type { ActivityEntry } from '../../../entities';
import { activityService } from '../../activity';
import { recurrenceActivitiesApi } from '../../../lib/api';

export const recurringActivitiesService = {
  list: () => activityService.listRecurring(),

  delete: (activityId: string) => activityService.deleteRecurring(activityId),

  update: (activityId: string, data: Parameters<typeof recurrenceActivitiesApi.update>[1]) =>
    recurrenceActivitiesApi.update(parseInt(activityId, 10), data),

  beginEdit: (activity: ActivityEntry) => activity,
};

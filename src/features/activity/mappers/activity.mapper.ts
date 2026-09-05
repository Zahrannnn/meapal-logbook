import type { ActivityEntry, CompetencyTag } from '../../../entities';
import type { BackendActivity, BackendCompetency } from '../../../lib/api';
import type { ActivityDraft, ConvertBackendActivityOptions, RecurrenceSettings } from '../model/activity.types';

export const activityStatusToBackend: Record<ActivityDraft['status'], BackendActivity['status']> = {
  completed: 'completed',
  'in-progress': 'in_progress',
  'pending-approval': 'pending',
  blocked: 'blocked',
};

export const activityStatusToFrontend: Record<BackendActivity['status'], ActivityDraft['status']> = {
  completed: 'completed',
  in_progress: 'in-progress',
  pending: 'pending-approval',
  blocked: 'blocked',
};

export const getCompetencyIds = (
  competencyTags: CompetencyTag[],
  backendCompetencies: BackendCompetency[],
): number[] =>
  competencyTags
    .map((tag) => {
      const name = tag.replace(/-/g, ' ');
      const competency = backendCompetencies.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
      return competency?.id;
    })
    .filter((id): id is number => id !== undefined);

export const normalizeRecurrenceForApi = (recurrence: RecurrenceSettings) => {
  if (recurrence.type === 'none') {
    return undefined;
  }

  return {
    frequency: recurrence.type === 'custom' ? recurrence.customType : recurrence.type,
    interval: recurrence.interval,
    daysOfWeek: recurrence.daysOfWeek,
    startDate: recurrence.startDate,
    endDate: recurrence.endDate,
  };
};

export const buildActivityDateTimes = (selectedDate: string, draft: ActivityDraft) => ({
  startTime: new Date(`${selectedDate}T${draft.startTime}:00`).toISOString(),
  endTime: new Date(`${selectedDate}T${draft.endTime}:00`).toISOString(),
});

export const convertBackendActivity = (
  activity: BackendActivity,
  options: ConvertBackendActivityOptions,
): ActivityEntry => {
  const startTime = new Date(activity.startTime);
  const endTime = new Date(activity.endTime);
  const recurring = activity.recurring ?? null;

  const competencies: CompetencyTag[] = (() => {
    // Primary path: use the nested competencies array (regular activities)
    if (activity.competencies && activity.competencies.length > 0) {
      return activity.competencies
        .map((entry) => entry.competency.name.toLowerCase().replace(/\s+/g, '-') as CompetencyTag)
        .filter((tag): tag is CompetencyTag => tag.length > 0);
    }

    // Fallback: resolve competencyIds (recurring activities return this instead)
    if (activity.competencyIds && activity.competencyIds.length > 0 && options.backendCompetencies) {
      return activity.competencyIds
        .map((id) => {
          const competency = options.backendCompetencies!.find((c) => c.id === id);
          return competency ? (competency.name.toLowerCase().replace(/\s+/g, '-') as CompetencyTag) : null;
        })
        .filter((tag): tag is CompetencyTag => tag !== null && tag.length > 0);
    }

    return [];
  })();

  return {
    id: activity.id.toString(),
    employeeName: `${activity.user.firstName} ${activity.user.lastName}`,
    employeeId: activity.userId.toString(),
    team: options.resolveTeamType(activity.user.teamId),
    title: activity.title,
    description: activity.notes || '',
    startTime: startTime.toTimeString().slice(0, 5),
    endTime: endTime.toTimeString().slice(0, 5),
    duration: (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60),
    date: startTime.toISOString().split('T')[0],
    projectId: activity.projectId.toString(),
    competencies,
    status: activityStatusToFrontend[activity.status] || 'in-progress',
    timestamp: new Date(activity.createdAt),
    notes: activity.notes || '',
    user: {
      id: activity.user.id,
      firstName: activity.user.firstName,
      lastName: activity.user.lastName,
      email: activity.user.email,
      teamId: activity.user.teamId,
    },
    project: { id: activity.project.id, name: activity.project.name },
    recurring,
    frequency: recurring?.frequency ?? activity.frequency,
    interval: recurring?.interval ?? activity.interval,
    daysOfWeek: recurring?.daysOfWeek ?? activity.daysOfWeek,
    startDate: recurring?.startDate ?? activity.startDate,
    endDate: recurring?.endDate ?? activity.endDate,
    createdAt: activity.createdAt,
    updatedAt: activity.updatedAt,
    progress: activity.progress,
    deadline: activity.deadline,
  };
};

import { z } from 'zod';
import type { ActivityDraft } from './activity.types';
import { createDefaultActivityDraft, createDefaultRecurrence } from './activity.draft';

const recurrenceSchema = z.object({
  type: z.enum(['none', 'daily', 'weekly', 'monthly', 'custom']),
  interval: z.number().int().min(1),
  daysOfWeek: z.array(z.number().int().min(0).max(6)),
  endDate: z.string(),
  startDate: z.string(),
  customType: z.enum(['daily', 'weekly', 'monthly']),
});

export const activityDraftSchema = z.object({
  title: z.string(),
  description: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  projectId: z.string(),
  competencies: z.array(z.string()),
  status: z.enum(['completed', 'in-progress', 'pending-approval', 'blocked']),
  notes: z.string(),
  recurring: recurrenceSchema,
  progress: z.number().optional(),
  deadline: z.string().optional(),
});

export const normalizeActivityDraft = (value: Partial<ActivityDraft> | null | undefined): ActivityDraft => {
  const defaults = createDefaultActivityDraft();
  const recurrenceDefaults = createDefaultRecurrence();

  return activityDraftSchema.parse({
    ...defaults,
    ...value,
    competencies: value?.competencies ?? defaults.competencies,
    recurring: {
      ...recurrenceDefaults,
      ...value?.recurring,
      daysOfWeek: value?.recurring?.daysOfWeek ?? recurrenceDefaults.daysOfWeek,
    },
  }) as ActivityDraft;
};

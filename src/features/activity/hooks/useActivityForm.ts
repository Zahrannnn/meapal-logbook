import { useState } from 'react';
import toast from 'react-hot-toast';
import type { ActivityEntry } from '../../../entities';
import { createActivityDraftFromEntry, createDefaultActivityDraft } from '../model/activity.draft';
import { normalizeActivityDraft } from '../model/activity.schema';
import type { ActivityDraft, ActivitySubmitOptions } from '../model/activity.types';
import { activityService } from '../services/activity.service';

interface UseActivityFormOptions {
  selectedDate: string;
  backendUserId: number | null;
  backendCompetencies: ActivitySubmitOptions['backendCompetencies'];
  onAfterSubmit: () => Promise<void>;
  onAfterRecurringUpdate?: () => Promise<void>;
  onClose: () => void;
}

export const useActivityForm = ({
  selectedDate,
  backendUserId,
  backendCompetencies,
  onAfterSubmit,
  onAfterRecurringUpdate,
  onClose,
}: UseActivityFormOptions) => {
  const [activity, setActivityState] = useState<ActivityDraft>(createDefaultActivityDraft);
  const [editingActivity, setEditingActivity] = useState<ActivityEntry | null>(null);
  const [isEditingRecurringActivity, setIsEditingRecurringActivity] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setActivity = (nextActivity: ActivityDraft) => {
    setActivityState(normalizeActivityDraft(nextActivity));
  };

  const mergeActivityPatch = (patch: Partial<ActivityDraft>) => {
    setActivityState((current) => normalizeActivityDraft({ ...current, ...patch }));
  };

  const resetActivityForm = () => {
    setActivityState(createDefaultActivityDraft());
    setEditingActivity(null);
    setIsEditingRecurringActivity(false);
  };

  const startEditingActivity = (entry: ActivityEntry) => {
    setEditingActivity(entry);
    setIsEditingRecurringActivity(false);
    setActivityState(createActivityDraftFromEntry(entry));
  };

  const startEditingRecurringActivity = (entry: ActivityEntry) => {
    setEditingActivity(entry);
    setIsEditingRecurringActivity(true);
    setActivityState(createActivityDraftFromEntry(entry));
  };

  const submitActivity = async () => {
    if (!backendUserId || !activity.title || !activity.projectId) {
      return;
    }

    if (!isEditingRecurringActivity && activity.status === 'in-progress') {
      if (!activity.deadline) {
        toast.error('Deadline is required for in-progress activities.');
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadlineDate = new Date(activity.deadline + 'T00:00:00');
      if (deadlineDate < today) {
        toast.error('Deadline cannot be a past date.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await activityService.submit(activity, {
        selectedDate,
        backendUserId,
        backendCompetencies,
        editingActivity,
        isEditingRecurringActivity,
      });

      if (isEditingRecurringActivity && onAfterRecurringUpdate) {
        await onAfterRecurringUpdate();
      }

      await onAfterSubmit();
      resetActivityForm();
      onClose();
    } catch (error: unknown) {
      console.error('Failed to submit activity:', error);
      const err = error as { message?: string; validationDetails?: Array<{ message?: string }> };
      const validationMessage = err.validationDetails?.[0]?.message;
      toast.error(validationMessage || err.message || 'Failed to save activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    activity,
    editingActivity,
    isEditingRecurringActivity,
    isSubmitting,
    setActivity,
    mergeActivityPatch,
    resetActivityForm,
    startEditingActivity,
    startEditingRecurringActivity,
    submitActivity,
  };
};

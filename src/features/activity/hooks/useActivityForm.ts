import { useEffect, useState } from 'react';
import { toast } from '@/lib/toast';
import type { ActivityEntry } from '../../../entities';
import { toMinutes } from '../../../lib/time';
import { addDraft, removeDraft, type StoredDraft } from '../model/drafts.storage';
import { createActivityDraftFromEntry, createDefaultActivityDraft } from '../model/activity.draft';
import { normalizeActivityDraft } from '../model/activity.schema';
import type { ActivityDraft, ActivitySubmitOptions } from '../model/activity.types';
import { activityService } from '../services/activity.service';
import { logEvent } from '../../../lib/telemetry';

type CreatedActivity = Awaited<ReturnType<typeof activityService.submit>>;

interface OptimisticContext {
  /** The server's activity for creates; null for edits (state is already correct). */
  created: CreatedActivity;
  tempId: string | null;
  editing: ActivityEntry | null;
}

interface UseActivityFormOptions {
  selectedDate: string;
  backendUserId: number | null;
  backendCompetencies: ActivitySubmitOptions['backendCompetencies'];
  /** Runs after a successful save; receives the created activity so optimistic rows reconcile. */
  onAfterSubmit: (context: OptimisticContext) => Promise<void>;
  onAfterRecurringUpdate?: () => Promise<void>;
  onClose: () => void;
  /** Inserts an optimistic entry before the network call; returns its temp id. */
  onOptimisticSubmit?: (
    draft: ActivityDraft,
    entryDate: string,
    editing: ActivityEntry | null,
  ) => string | null;
  /** Removes or restores the optimistic entry when the network call fails. */
  onOptimisticRollback?: (tempId: string) => void;
}

// The in-progress create draft survives refreshes and crashes: written on every
// change (with a timestamp, for the recovery banner), restored on app start,
// cleared on save, discard, or switching to edit. Explicit "Save as draft" work
// lives separately in drafts.storage.
const DRAFT_STORAGE_KEY = 'logbook:activity-draft';

interface StoredRecovery {
  savedAt: string;
  draft: ActivityDraft;
}

// Both sides go through the same normalize pass — zod's output key order can
// differ from the raw default literal, and string comparison needs exact match.
const EMPTY_DRAFT_JSON = JSON.stringify(normalizeActivityDraft(createDefaultActivityDraft()));

const isDefaultDraft = (draft: ActivityDraft) =>
  JSON.stringify(normalizeActivityDraft(draft)) === EMPTY_DRAFT_JSON;

const readStoredRecovery = (): StoredRecovery | null => {
  try {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<StoredRecovery> | ActivityDraft;
    // Legacy shape: the raw draft without a timestamp.
    if (typeof (parsed as StoredRecovery).savedAt !== 'string') {
      return { savedAt: new Date().toISOString(), draft: normalizeActivityDraft(parsed as ActivityDraft) };
    }
    return { savedAt: (parsed as StoredRecovery).savedAt, draft: normalizeActivityDraft((parsed as StoredRecovery).draft) };
  } catch {
    return null;
  }
};

const storeRecovery = (recovery: StoredRecovery | null) => {
  try {
    if (recovery) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(recovery));
    } else {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  } catch {
    // storage unavailable (private mode) — the draft just won't persist
  }
};

export const useActivityForm = ({
  selectedDate,
  backendUserId,
  backendCompetencies,
  onAfterSubmit,
  onAfterRecurringUpdate,
  onClose,
  onOptimisticSubmit,
  onOptimisticRollback,
}: UseActivityFormOptions) => {
  const [storedRecovery] = useState(readStoredRecovery);
  const [activity, setActivityState] = useState<ActivityDraft>(
    () => storedRecovery?.draft ?? createDefaultActivityDraft(),
  );
  // True right after a crash/refresh recovery, until the user has been told about it.
  const [isDraftRestored, setIsDraftRestored] = useState(
    () => !!storedRecovery && !isDefaultDraft(storedRecovery.draft),
  );
  const [editingActivity, setEditingActivity] = useState<ActivityEntry | null>(null);
  const [isEditingRecurringActivity, setIsEditingRecurringActivity] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Persist the create-mode draft; edit sessions are skipped (their target entry
  // already exists server-side) and cleared so a stale draft can't come back.
  useEffect(() => {
    if (editingActivity || isEditingRecurringActivity) return;
    storeRecovery(isDefaultDraft(activity) ? null : { savedAt: new Date().toISOString(), draft: activity });
  }, [activity, editingActivity, isEditingRecurringActivity]);

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
    setIsDraftRestored(false);
  };

  // Explicit "Save as draft": park the current form in the Drafts list and
  // start fresh. Returns false when there was nothing worth parking.
  const saveAsDraft = (entryDate: string): boolean => {
    if (isDefaultDraft(activity) || isEditingRecurringActivity) return false;
    addDraft(activity, entryDate);
    resetActivityForm();
    logEvent('draft_saved', { entry_date: entryDate });
    toast.success('Draft saved. Find it under Drafts.');
    return true;
  };

  // Resume an explicitly saved draft: it becomes the active form (still
  // auto-saved) and leaves the Drafts list.
  const resumeDraft = (stored: StoredDraft) => {
    setEditingActivity(null);
    setIsEditingRecurringActivity(false);
    setIsDraftRestored(false);
    setActivityState(normalizeActivityDraft(stored.draft));
    removeDraft(stored.id);
    logEvent('draft_resumed', { entry_date: stored.entryDate });
  };

  const startEditingActivity = (entry: ActivityEntry) => {
    storeRecovery(null);
    setIsDraftRestored(false);
    setEditingActivity(entry);
    setIsEditingRecurringActivity(false);
    setActivityState(createActivityDraftFromEntry(entry));
  };

  const startEditingRecurringActivity = (entry: ActivityEntry) => {
    storeRecovery(null);
    setIsDraftRestored(false);
    setEditingActivity(entry);
    setIsEditingRecurringActivity(true);
    setActivityState(createActivityDraftFromEntry(entry));
  };

  const submitActivity = async () => {
    if (!backendUserId || !activity.title || !activity.projectId) {
      return;
    }

    // Hours math silently drops spans that don't advance, so block them at the source.
    if (toMinutes(activity.endTime) <= toMinutes(activity.startTime)) {
      toast.error('End time must be after start time.');
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

    // Optimistic: the entry shows up in the list while the request runs.
    const tempId = onOptimisticSubmit?.(activity, selectedDate, editingActivity) ?? null;

    try {
      const created = await activityService.submit(activity, {
        selectedDate,
        backendUserId,
        backendCompetencies,
        editingActivity,
        isEditingRecurringActivity,
      });

      if (isEditingRecurringActivity && onAfterRecurringUpdate) {
        await onAfterRecurringUpdate();
      }

      await onAfterSubmit({ created, tempId, editing: editingActivity });
      resetActivityForm();
      onClose();
    } catch (error: unknown) {
      if (tempId) onOptimisticRollback?.(tempId);
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
    isDraftRestored,
    dismissDraftRestored: () => setIsDraftRestored(false),
    saveAsDraft,
    resumeDraft,
    setActivity,
    mergeActivityPatch,
    resetActivityForm,
    startEditingActivity,
    startEditingRecurringActivity,
    submitActivity,
  };
};

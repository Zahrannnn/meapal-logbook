/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from '@/lib/toast';
import type { ActivityEntry, User } from '../entities';
import type { ActivityDraft } from '../features/activity/model/activity.types';
import { listDrafts } from '../features/activity/model/drafts.storage';
import { subscribeDraftsChanged } from '../features/activity/model/drafts.storage';
import { activityService, createActivityDraftFromEntry, useActivityForm } from '../features/activity';
import { recurringActivitiesService } from '../features/recurring-activities';
import { useActivityReportAdminActions } from './useActivityReportAdminActions';
import { useActivityReportData } from './useActivityReportData';
import { useActivityReportUiState } from './useActivityReportUiState';
import { logEvent } from '../lib/telemetry';
import { formatDateValue } from '@/components/date-picker';
import { toMinutes } from '../lib/time';

interface UseActivityReportAppStateParams {
  currentUser: User | null;
  backendUserId: number | null;
  handleLogout: () => void;
}

export const useActivityReportAppState = ({
  currentUser,
  backendUserId,
  handleLogout,
}: UseActivityReportAppStateParams) => {
  const ui = useActivityReportUiState();
  const data = useActivityReportData({ currentUser, viewMode: ui.viewMode, selectedDate: ui.selectedDate });

  // Local-date string (NOT toISOString — that shifts to UTC and misdates entries
  // logged between midnight and the UTC offset).
  const selectedDateStr = formatDateValue(ui.selectedDate);

  // ── Optimistic everything ────────────────────────────────────────────────
  // Submits and deletes update the UI immediately; the network call follows.
  // `optimisticId` marks the row with a saving shimmer until the refetch lands.
  const [optimisticId, setOptimisticId] = useState<string | null>(null);
  const originalBeforeOptimistic = useRef<ActivityEntry | null>(null);
  const pendingDeletions = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const UNDO_DELAY_MS = 5000;

  const buildOptimisticEntry = (
    id: string,
    draft: ActivityDraft,
    entryDate: string,
    editing: ActivityEntry | null,
  ): ActivityEntry => {
    const durationMinutes = Math.max(0, toMinutes(draft.endTime) - toMinutes(draft.startTime));
    const now = new Date().toISOString();
    const base = editing ?? ({} as ActivityEntry);
    return {
      ...base,
      id,
      employeeName: currentUser?.name,
      title: draft.title,
      description: draft.description,
      startTime: draft.startTime,
      endTime: draft.endTime,
      duration: durationMinutes / 60,
      date: entryDate,
      projectId: draft.projectId,
      competencies: draft.competencies,
      status: draft.status,
      notes: draft.notes || undefined,
      timestamp: new Date(),
      user: {
        id: Number(backendUserId ?? 0),
        firstName: currentUser?.name?.split(' ')[0] ?? '',
        lastName: currentUser?.name?.split(' ').slice(1).join(' ') ?? '',
        email: '',
        teamId: 0,
      },
      project: { id: Number(draft.projectId), name: '' },
      createdAt: base.createdAt ?? now,
      updatedAt: now,
      progress: draft.progress,
      deadline: draft.deadline,
    };
  };

  const optimisticSubmit = (
    draft: ActivityDraft,
    entryDate: string,
    editing: ActivityEntry | null,
  ): string | null => {
    if (!currentUser) return null;

    if (editing) {
      originalBeforeOptimistic.current = data.activities.find((a) => a.id === editing.id) ?? null;
      data.setActivities((current) =>
        current.map((a) => (a.id === editing.id ? buildOptimisticEntry(editing.id, draft, entryDate, editing) : a)),
      );
      setOptimisticId(editing.id);
      return editing.id;
    }

    const tempId = `optimistic-${Date.now()}`;
    data.setActivities((current) => [...current, buildOptimisticEntry(tempId, draft, entryDate, null)]);
    setOptimisticId(tempId);
    return tempId;
  };

  const optimisticRollback = (tempId: string) => {
    const original = originalBeforeOptimistic.current;
    if (original?.id === tempId) {
      data.setActivities((current) => current.map((a) => (a.id === tempId ? original : a)));
    } else {
      data.setActivities((current) => current.filter((a) => a.id !== tempId));
    }
    originalBeforeOptimistic.current = null;
    setOptimisticId(null);
  };

  // ── End optimistic ───────────────────────────────────────────────────────

  const {
    activity: activityDraft,
    editingActivity,
    isEditingRecurringActivity,
    isSubmitting: isActivitySubmitting,
    isDraftRestored,
    dismissDraftRestored,
    saveAsDraft,
    resumeDraft,
    setActivity: setActivityDraft,
    mergeActivityPatch,
    resetActivityForm,
    startEditingActivity,
    startEditingRecurringActivity,
    submitActivity,
  } = useActivityForm({
    selectedDate: selectedDateStr,
    backendUserId,
    backendCompetencies: data.backendCompetencies,
    onAfterSubmit: async ({ created, tempId, editing }) => {
      // Reconcile the optimistic row with the server's copy; the period cache
      // stays valid, so no global refetch (and no full-screen loader).
      if (tempId && created && !editing) {
        const [mapped] = data.mapActivities([created]);
        if (mapped) {
          data.setActivities((current) => current.map((a) => (a.id === tempId ? mapped : a)));
        }
      }
      setOptimisticId(null);
      originalBeforeOptimistic.current = null;
      await data.refreshStreak();
    },
    onAfterRecurringUpdate: data.fetchRecurringActivities,
    onClose: ui.closeActivityEditor,
    onOptimisticSubmit: optimisticSubmit,
    onOptimisticRollback: optimisticRollback,
  });

  // Reactive count for the Drafts button; the storage module broadcasts changes.
  const [draftsCount, setDraftsCount] = useState(() => listDrafts().length);
  useEffect(() => subscribeDraftsChanged(() => setDraftsCount(listDrafts().length)), []);

  const admin = useActivityReportAdminActions({    backendUserId,
    editingProject: ui.editingProject,
    setEditingProject: ui.setEditingProject,
    editingUser: ui.editingUser,
    setEditingUser: ui.setEditingUser,
    editingTeam: ui.editingTeam,
    setEditingTeam: ui.setEditingTeam,
    editingCompetency: ui.editingCompetency,
    setEditingCompetency: ui.setEditingCompetency,
    setIsAddingProject: ui.setIsAddingProject,
    setIsAddingUser: ui.setIsAddingUser,
    setIsAddingTeam: ui.setIsAddingTeam,
    setIsAddingCompetency: ui.setIsAddingCompetency,
    refreshData: data.fetchAllData,
  });

  const handleAppLogout = () => {
    handleLogout();
    data.clearSessionData();
    ui.setViewMode('dashboard');
  };

  const handleEditActivity = (activity: ActivityEntry) => {
    startEditingActivity(activity);
    ui.openActivityEditor();
  };

  // Duplicate: prefill a fresh draft from an existing entry. Deliberately does NOT set
  // editingActivity, so saving creates a new entry for the viewed day instead of updating.
  const handleDuplicateActivity = (activity: ActivityEntry) => {
    logEvent('duplicate_click', { source_date: activity.date, project_id: activity.projectId });
    resetActivityForm();
    setActivityDraft(createActivityDraftFromEntry(activity));
    ui.openActivityEditor();
  };

  const handleOpenActivity = async () => {
    await data.ensureActivityDependencies();
    // A leftover create-draft (crash, refresh, accidental close) is already back
    // in the form; the dashboard banner announces it, so no extra toast here.
    if (isDraftRestored) {
      logEvent('draft_restored', {});
      dismissDraftRestored();
    }
    ui.openActivityEditor();
  };

  const handleSaveActivityDraft = () => {
    saveAsDraft(selectedDateStr);
    ui.closeActivityEditor();
  };

  const handleResumeDraft = async (stored: Parameters<typeof resumeDraft>[0]) => {
    await data.ensureActivityDependencies();
    resetActivityForm();
    resumeDraft(stored);
    ui.setIsDraftsOpen(false);
    ui.openActivityEditor();
  };

  const handleDiscardRecovery = () => {
    resetActivityForm();
    toast.success('Unfinished activity discarded');
  };

  const handleDeleteActivity = (id: string) => {
    const entry = data.activities.find((a) => a.id === id);
    if (!entry) return;

    // Optimistic removal; the network delete is deferred so Undo is real.
    data.setActivities((current) => current.filter((activity) => activity.id !== id));

    const timer = setTimeout(async () => {
      pendingDeletions.current.delete(id);
      try {
        await activityService.delete(id);
        void data.refreshStreak();
      } catch (err: any) {
        console.error('Failed to delete activity:', err);
        toast.error('Failed to delete the entry. It has been restored.');
        data.setActivities((current) => [...current, entry]);
      }
    }, UNDO_DELAY_MS);
    pendingDeletions.current.set(id, timer);

    toast.success('Entry deleted', {
      duration: UNDO_DELAY_MS,
      action: {
        label: 'Undo',
        onClick: () => {
          const pending = pendingDeletions.current.get(id);
          if (pending) {
            clearTimeout(pending);
            pendingDeletions.current.delete(id);
          }
          data.setActivities((current) => [...current, entry]);
        },
      },
    });
  };

  const handleEditRecurringActivity = (activity: ActivityEntry) => {
    startEditingRecurringActivity(activity);
    ui.startEditingRecurringActivity(activity);
  };

  const handleDeleteRecurringActivity = async (id: string) => {
    try {
      await recurringActivitiesService.delete(id);
      await data.fetchRecurringActivities();
    } catch (err: any) {
      console.error('Failed to delete recurring activity:', err);
      toast.error(err.message || 'Failed to delete recurring activity. Please try again.');
    }
  };

  return {
    ...data,
    ...ui,
    ...admin,
    activityDraft,
    editingActivity,
    isEditingRecurringActivity,
    isActivitySubmitting,
    isDraftRestored,
    setActivityDraft: setActivityDraft as (activity: ActivityDraft) => void,
    mergeActivityPatch,
    resetActivityForm,
    submitActivity,
    handleOpenActivity,
    handleSaveActivityDraft,
    handleResumeDraft,
    handleDiscardRecovery,
    draftsCount,
    optimisticId,
    handleAppLogout,
    handleEditActivity,
    handleDuplicateActivity,
    handleDeleteActivity,
    handleEditRecurringActivity,
    handleDeleteRecurringActivity,
  };
};

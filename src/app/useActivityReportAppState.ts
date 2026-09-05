/* eslint-disable @typescript-eslint/no-explicit-any */
import toast from 'react-hot-toast';
import type { ActivityEntry, User } from '../entities';
import type { ActivityDraft } from '../features/activity/model/activity.types';
import { activityService, createActivityDraftFromEntry, useActivityForm } from '../features/activity';
import { recurringActivitiesService } from '../features/recurring-activities';
import { useActivityReportAdminActions } from './useActivityReportAdminActions';
import { useActivityReportData } from './useActivityReportData';
import { useActivityReportUiState } from './useActivityReportUiState';
import { logEvent } from '../lib/telemetry';
import { formatDateValue } from '@/components/date-picker';

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

  const {
    activity: activityDraft,
    editingActivity,
    isEditingRecurringActivity,
    isSubmitting: isActivitySubmitting,
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
    onAfterSubmit: async () => {
      await data.fetchAllData();
      await data.refreshStreak();
    },
    onAfterRecurringUpdate: data.fetchRecurringActivities,
    onClose: ui.closeActivityEditor,
  });

  const admin = useActivityReportAdminActions({
    backendUserId,
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
    ui.openActivityEditor();
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      await activityService.delete(id);
      data.setActivities((current) => current.filter((activity) => activity.id !== id));
      void data.refreshStreak();
    } catch (err: any) {
      console.error('Failed to delete activity:', err);
      toast.error(err.message || 'Failed to delete activity. Please try again.');
    }
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
    setActivityDraft: setActivityDraft as (activity: ActivityDraft) => void,
    mergeActivityPatch,
    resetActivityForm,
    submitActivity,
    handleOpenActivity,
    handleAppLogout,
    handleEditActivity,
    handleDuplicateActivity,
    handleDeleteActivity,
    handleEditRecurringActivity,
    handleDeleteRecurringActivity,
  };
};

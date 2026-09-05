import { AppLayout, AppStateScreen } from './layout';
import { useAuthBootstrap } from './bootstrap';
import { ForgotPasswordModal, LoginPage } from '../features/auth';
import { ActivityReportContent } from './ActivityReportContent';
import { ActivityReportModals } from './ActivityReportModals';
import { useActivityReportAppState } from './useActivityReportAppState';

export const ActivityReportApp = () => {
  const { currentUser, backendUserId, isAuthLoading, handleLogin, handleLogout } = useAuthBootstrap();
  const app = useActivityReportAppState({ currentUser, backendUserId, handleLogout });

  if ((isAuthLoading || app.isLoading) && !currentUser) {
    return <AppStateScreen message="Starting session…" />;
  }

  if (!currentUser) {
    return (
      <>
        <LoginPage onLogin={handleLogin} onForgotPassword={() => app.setIsForgotPasswordOpen(true)} />
        <ForgotPasswordModal
          isOpen={app.isForgotPasswordOpen}
          onClose={() => app.setIsForgotPasswordOpen(false)}
        />
      </>
    );
  }

  if (app.isLoading) {
    return <AppStateScreen message="Loading your workspace…" />;
  }

  if (app.error) {
    return <AppStateScreen message={app.error} tone="error" actionLabel="Retry" onAction={app.fetchAllData} />;
  }

  return (
    <AppLayout
      currentUser={currentUser}
      viewMode={app.viewMode}
      onViewModeChange={app.setViewMode}
      onLogout={app.handleAppLogout}
      onOpenProfile={() => app.setIsProfileOpen(true)}
      onWhatsNewOpen={() => app.setIsWhatsNewOpen(true)}
      whatsNewUnseen={app.whatsNewUnseen}
      isMobileMenuOpen={app.isMobileMenuOpen}
      onMobileMenuOpenChange={app.setIsMobileMenuOpen}
      onAddActivity={() => void app.handleOpenActivity()}
    >
      <ActivityReportContent
        viewMode={app.viewMode}
        currentUser={currentUser}
        activities={app.activities}
        projects={app.projects}
        users={app.users}
        backendUsers={app.backendUsers}
        backendTeams={app.backendTeams}
        backendProjects={app.backendProjects}
        backendCompetencies={app.backendCompetencies}
        selectedDate={app.selectedDate}
        isActivitiesRefreshing={app.isActivitiesRefreshing}
        loadedPeriodKey={app.loadedPeriodKey}
        streakDays={app.streakDays}
        isStreakLoading={app.isStreakLoading}
        backendUserId={backendUserId}
        searchQuery={app.searchQuery}
        filterProject={app.filterProject}
        onDateChange={app.setSelectedDate}
        onAddActivity={() => void app.handleOpenActivity()}
        onEditActivity={app.handleEditActivity}
        onDuplicateActivity={app.handleDuplicateActivity}
        onDeleteActivity={app.handleDeleteActivity}
        onSearchChange={app.setSearchQuery}
        onFilterChange={app.setFilterProject}
        onOpenRecurringActivities={async () => {
          await app.fetchRecurringActivities();
          app.setIsRecurringActivitiesOpen(true);
        }}
        onVoiceRecord={() => app.setIsVoiceModalOpen(true)}
        onAddProject={app.handleAddProject}
        onEditProject={app.handleEditProject}
        onDeleteProject={app.handleDeleteProject}
        onAddUser={app.handleAddUser}
        onEditUser={app.handleEditUser}
        onDeleteUser={app.handleDeleteUser}
        onAddTeam={app.handleAddTeam}
        onEditTeam={app.handleEditTeam}
        onDeleteTeam={app.handleDeleteTeam}
        onAddCompetency={app.handleAddCompetency}
        onEditCompetency={app.handleEditCompetency}
        onDeleteCompetency={app.handleDeleteCompetency}
        onRefreshData={app.fetchAllData}
        onFetchReportsWithFilters={app.fetchReportsWithFilters}
      />

      <ActivityReportModals
        isAddingActivity={app.isAddingActivity}
        setIsAddingActivity={app.setIsAddingActivity}
        isAddingProject={app.isAddingProject}
        setIsAddingProject={app.setIsAddingProject}
        isAddingUser={app.isAddingUser}
        setIsAddingUser={app.setIsAddingUser}
        isAddingTeam={app.isAddingTeam}
        setIsAddingTeam={app.setIsAddingTeam}
        isAddingCompetency={app.isAddingCompetency}
        setIsAddingCompetency={app.setIsAddingCompetency}
        isProfileOpen={app.isProfileOpen}
        setIsProfileOpen={app.setIsProfileOpen}
        isRecurringActivitiesOpen={app.isRecurringActivitiesOpen}
        setIsRecurringActivitiesOpen={app.setIsRecurringActivitiesOpen}
        isVoiceModalOpen={app.isVoiceModalOpen}
        setIsVoiceModalOpen={app.setIsVoiceModalOpen}
        isWhatsNewOpen={app.isWhatsNewOpen}
        setIsWhatsNewOpen={app.setIsWhatsNewOpen}
        markWhatsNewSeen={app.markWhatsNewSeen}
        editingProject={app.editingProject}
        setEditingProject={app.setEditingProject}
        editingUser={app.editingUser}
        setEditingUser={app.setEditingUser}
        editingTeam={app.editingTeam}
        setEditingTeam={app.setEditingTeam}
        editingCompetency={app.editingCompetency}
        setEditingCompetency={app.setEditingCompetency}
        currentUser={currentUser}
        projects={app.projects}
        backendUsers={app.backendUsers}
        backendTeams={app.backendTeams}
        recurringActivities={app.recurringActivities}
        activityDraft={app.activityDraft}
        editingActivity={app.editingActivity}
        isEditingRecurringActivity={app.isEditingRecurringActivity}
        isActivitySubmitting={app.isActivitySubmitting}
        isSubmitting={app.isSubmitting}
        setActivityDraft={app.setActivityDraft}
        mergeActivityPatch={app.mergeActivityPatch}
        resetActivityForm={app.resetActivityForm}
        submitActivity={app.submitActivity}
        handleSaveProject={app.handleSaveProject}
        handleSaveUser={app.handleSaveUser}
        handleSaveTeam={app.handleSaveTeam}
        handleSaveCompetency={app.handleSaveCompetency}
        handleEditRecurringActivity={app.handleEditRecurringActivity}
        handleDeleteRecurringActivity={app.handleDeleteRecurringActivity}
        onProfileUpdated={app.fetchAllData}
      />
    </AppLayout>
  );
};

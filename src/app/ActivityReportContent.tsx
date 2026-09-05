import React from 'react';
import type { ActivityEntry, Project, User } from '../entities';
import type { BackendCompetency, BackendProject, BackendTeam, BackendUser } from '../lib/api';
import { AnalyticsPage } from '../features/analytics';
import { AdminPage } from '../features/admin';
import { DashboardPage } from '../features/dashboard';
import { ReportsPage } from '../features/reports';

interface ActivityReportContentProps {
  viewMode: 'dashboard' | 'analytics' | 'admin' | 'reports';
  currentUser: User;
  activities: ActivityEntry[];
  projects: Project[];
  users: User[];
  backendUsers: BackendUser[];
  backendTeams: BackendTeam[];
  backendProjects: BackendProject[];
  backendCompetencies: BackendCompetency[];
  selectedDate: Date;
  isActivitiesRefreshing?: boolean;
  loadedPeriodKey?: string | null;
  streakDays?: number;
  isStreakLoading?: boolean;
  backendUserId: number | null;
  searchQuery: string;
  filterProject: string;
  onDateChange: (date: Date) => void;
  onAddActivity: () => void;
  onEditActivity: (activity: ActivityEntry) => void;
  onDuplicateActivity: (activity: ActivityEntry) => void;
  onDeleteActivity: (id: string) => Promise<void>;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onOpenRecurringActivities: () => void;
  onVoiceRecord: () => void;
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => Promise<void>;
  onAddUser: () => void;
  onEditUser: (user: BackendUser) => void;
  onDeleteUser: (userId: number) => Promise<void>;
  onAddTeam: () => void;
  onEditTeam: (team: BackendTeam) => void;
  onDeleteTeam: (teamId: number) => Promise<void>;
  onAddCompetency: () => void;
  onEditCompetency: (competency: BackendCompetency) => void;
  onDeleteCompetency: (competencyId: number) => Promise<void>;
  onRefreshData: () => Promise<void>;
  onFetchReportsWithFilters: (filters: {
    startDate?: string;
    endDate?: string;
    teamId?: number;
    projectId?: number;
    userId?: number;
  }) => Promise<void>;
}

export const ActivityReportContent: React.FC<ActivityReportContentProps> = ({
  viewMode,
  currentUser,
  activities,
  projects,
  users,
  backendUsers,
  backendTeams,
  backendProjects,
  backendCompetencies,
  selectedDate,
  isActivitiesRefreshing = false,
  loadedPeriodKey = null,
  streakDays = 0,
  isStreakLoading = false,
  backendUserId,
  searchQuery,
  filterProject,
  onDateChange,
  onAddActivity,
  onEditActivity,
  onDuplicateActivity,
  onDeleteActivity,
  onSearchChange,
  onFilterChange,
  onOpenRecurringActivities,
  onVoiceRecord,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onAddTeam,
  onEditTeam,
  onDeleteTeam,
  onAddCompetency,
  onEditCompetency,
  onDeleteCompetency,
  onRefreshData,
  onFetchReportsWithFilters,
}) => {
  if (viewMode === 'dashboard') {
    return (
      <DashboardPage
        currentUser={currentUser}
        activities={activities}
        projects={projects}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        isActivitiesRefreshing={isActivitiesRefreshing}
        loadedPeriodKey={loadedPeriodKey}
        streakDays={streakDays}
        isStreakLoading={isStreakLoading}
        onAddActivity={onAddActivity}
        onEditActivity={onEditActivity}
        onDuplicateActivity={onDuplicateActivity}
        onDeleteActivity={onDeleteActivity}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        filterProject={filterProject}
        onFilterChange={onFilterChange}
        onOpenRecurringActivities={onOpenRecurringActivities}
        onVoiceRecord={onVoiceRecord}
      />
    );
  }

  if (viewMode === 'analytics') {
    return (
      <AnalyticsPage
        activities={activities}
        projects={projects}
        backendTeams={backendTeams}
        backendProjects={backendProjects}
        selectedDate={selectedDate}
        currentUserId={backendUserId || undefined}
      />
    );
  }

  if (viewMode === 'reports') {
    return (
      <ReportsPage
        activities={activities}
        projects={projects}
        users={users}
        backendUsers={backendUsers}
        backendTeams={backendTeams}
        currentUser={currentUser}
        onFetchWithFilters={onFetchReportsWithFilters}
      />
    );
  }

  return (
    <AdminPage
      users={users}
      backendUsers={backendUsers}
      backendTeams={backendTeams}
      backendCompetencies={backendCompetencies}
      projects={projects}
      backendProjects={backendProjects}
      currentUser={currentUser}
      onAddProject={onAddProject}
      onEditProject={onEditProject}
      onDeleteProject={onDeleteProject}
      onAddUser={onAddUser}
      onEditUser={onEditUser}
      onDeleteUser={onDeleteUser}
      onAddTeam={onAddTeam}
      onEditTeam={onEditTeam}
      onDeleteTeam={onDeleteTeam}
      onAddCompetency={onAddCompetency}
      onEditCompetency={onEditCompetency}
      onDeleteCompetency={onDeleteCompetency}
      onRefreshData={onRefreshData}
    />
  );
};

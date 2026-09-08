import React from 'react';
import type { ActivityEntry, Project, User } from '../entities';
import type { ActivityDraft } from '../features/activity/model/activity.types';
import type { BackendCompetency, BackendTeam, BackendUser, ParsedVoiceActivity } from '../lib/api';
import { ActivityModal } from '../features/activity';
import { DraftsDialog } from '../features/activity/components/DraftsDialog';
import { adaptParsedVoiceActivityToDraftPatch, VoiceActivityModal } from '../features/activity/voice';
import { CompetencyModal } from '../features/admin/components/CompetencyModal';
import { ProjectModal } from '../features/admin/components/ProjectModal';
import { TeamModal } from '../features/admin/components/TeamModal';
import { UserModal } from '../features/admin/components/UserModal';
import { MyProfileModal } from '../features/profile';
import { RecurringActivitiesModal } from '../features/recurring-activities';
import { ReleaseMoment } from '../features/whats-new';
import { WhatsNewModal } from '../features/whats-new';
import type { EditableProject } from '../features/admin/hooks/useProjectModalState';

interface ActivityReportModalsProps {
  isAddingActivity: boolean;
  setIsAddingActivity: (value: boolean) => void;
  isAddingProject: boolean;
  setIsAddingProject: (value: boolean) => void;
  isAddingUser: boolean;
  setIsAddingUser: (value: boolean) => void;
  isAddingTeam: boolean;
  setIsAddingTeam: (value: boolean) => void;
  isAddingCompetency: boolean;
  setIsAddingCompetency: (value: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (value: boolean) => void;
  isRecurringActivitiesOpen: boolean;
  setIsRecurringActivitiesOpen: (value: boolean) => void;
  isVoiceModalOpen: boolean;
  setIsVoiceModalOpen: (value: boolean) => void;
  isDraftsOpen: boolean;
  setIsDraftsOpen: (value: boolean) => void;
  isWhatsNewOpen: boolean;
  setIsWhatsNewOpen: (value: boolean) => void;
  isReleaseMomentOpen: boolean;
  closeReleaseMoment: () => void;
  markWhatsNewSeen: () => void;
  editingProject: EditableProject | null;
  setEditingProject: (value: EditableProject | null) => void;
  editingUser: BackendUser | null;
  setEditingUser: (value: BackendUser | null) => void;
  editingTeam: BackendTeam | null;
  setEditingTeam: (value: BackendTeam | null) => void;
  editingCompetency: BackendCompetency | null;
  setEditingCompetency: (value: BackendCompetency | null) => void;
  currentUser: User;
  projects: Project[];
  selectedDate: Date;
  backendCompetencies: BackendCompetency[];
  backendUsers: BackendUser[];
  backendTeams: BackendTeam[];
  recurringActivities: ActivityEntry[];
  activityDraft: ActivityDraft;
  editingActivity: ActivityEntry | null;
  isEditingRecurringActivity: boolean;
  isActivitySubmitting: boolean;
  isSubmitting: boolean;
  setActivityDraft: (activity: ActivityDraft) => void;
  mergeActivityPatch: (patch: Partial<ActivityDraft>) => void;
  resetActivityForm: () => void;
  submitActivity: (activity?: ActivityEntry) => Promise<void>;
  onSaveActivityDraft: () => void;
  onResumeActivityDraft: (draft: { id: string; savedAt: string; entryDate: string; draft: ActivityDraft }) => void;
  handleSaveProject: (projectData: Omit<Project, 'id'> & { projectType?: string; customerName?: string; teamIds?: number[] }) => Promise<void>;
  handleSaveUser: (userData: {
    email: string;
    username: string;
    password?: string;
    firstName: string;
    lastName: string;
    teamId: number;
    role: 'admin' | 'project_manager' | 'user';
    hireDate?: string;
  }) => Promise<void>;
  handleSaveTeam: (teamData: { name: string; description: string }) => Promise<void>;
  handleSaveCompetency: (competencyData: { name: string; description?: string }) => Promise<void>;
  handleEditRecurringActivity: (activity: ActivityEntry) => void;
  handleDeleteRecurringActivity: (id: string) => Promise<void>;
  onProfileUpdated: () => Promise<void>;
}

export const ActivityReportModals: React.FC<ActivityReportModalsProps> = ({
  isAddingActivity,
  setIsAddingActivity,
  isAddingProject,
  setIsAddingProject,
  isAddingUser,
  setIsAddingUser,
  isAddingTeam,
  setIsAddingTeam,
  isAddingCompetency,
  setIsAddingCompetency,
  isProfileOpen,
  setIsProfileOpen,
  isRecurringActivitiesOpen,
  setIsRecurringActivitiesOpen,
  isVoiceModalOpen,
  setIsVoiceModalOpen,
  isDraftsOpen,
  setIsDraftsOpen,
  isWhatsNewOpen,
  setIsWhatsNewOpen,
  isReleaseMomentOpen,
  closeReleaseMoment,
  markWhatsNewSeen,
  editingProject,
  setEditingProject,
  editingUser,
  setEditingUser,
  editingTeam,
  setEditingTeam,
  editingCompetency,
  setEditingCompetency,
  currentUser,
  projects,
  selectedDate,
  backendCompetencies,
  backendUsers,
  backendTeams,
  recurringActivities,
  activityDraft,
  editingActivity,
  isEditingRecurringActivity,
  isActivitySubmitting,
  isSubmitting,
  setActivityDraft,
  mergeActivityPatch,
  resetActivityForm,
  submitActivity,
  onSaveActivityDraft,
  onResumeActivityDraft,
  handleSaveProject,
  handleSaveUser,
  handleSaveTeam,
  handleSaveCompetency,
  handleEditRecurringActivity,
  handleDeleteRecurringActivity,
  onProfileUpdated,
}) => {
  return (
    <>
      <ActivityModal
        isOpen={isAddingActivity}
        onClose={() => {
          // Deliberately keeps the form: an untouched create-draft (restored or
          // saved earlier) must survive an accidental close. Discarding is an
          // explicit action inside the modal.
          setIsAddingActivity(false);
        }}
        activity={activityDraft}
        onChange={setActivityDraft}
        onSave={submitActivity}
        isEditing={!!editingActivity}
        projects={projects}
        isSubmitting={isActivitySubmitting}
        isEditingRecurringActivity={isEditingRecurringActivity}
        entryDate={selectedDate}
        backendCompetencies={backendCompetencies}
        onSaveDraft={() => {
          onSaveActivityDraft();
        }}
      />

      <DraftsDialog
        isOpen={isDraftsOpen}
        onClose={() => setIsDraftsOpen(false)}
        onResume={onResumeActivityDraft}
        projects={projects}
      />

      {isReleaseMomentOpen && (
        <ReleaseMoment
          onDone={closeReleaseMoment}
          onOpenWhatsNew={() => {
            closeReleaseMoment();
            setIsWhatsNewOpen(true);
          }}
        />
      )}
      <ProjectModal
        isOpen={isAddingProject}
        onClose={() => {
          setIsAddingProject(false);
          setEditingProject(null);
        }}
        project={editingProject}
        backendUsers={backendUsers}
        backendTeams={backendTeams}
        onSave={handleSaveProject}
        isEditing={!!editingProject}
        isSubmitting={isSubmitting}
      />

      <UserModal
        isOpen={isAddingUser}
        onClose={() => {
          setIsAddingUser(false);
          setEditingUser(null);
        }}
        user={editingUser}
        teams={backendTeams}
        onSave={handleSaveUser}
        isEditing={!!editingUser}
        isSubmitting={isSubmitting}
      />

      <TeamModal
        isOpen={isAddingTeam}
        onClose={() => {
          setIsAddingTeam(false);
          setEditingTeam(null);
        }}
        team={editingTeam}
        onSave={handleSaveTeam}
        isEditing={!!editingTeam}
        isSubmitting={isSubmitting}
      />

      <CompetencyModal
        isOpen={isAddingCompetency}
        onClose={() => {
          setIsAddingCompetency(false);
          setEditingCompetency(null);
        }}
        competency={editingCompetency}
        onSave={handleSaveCompetency}
        isEditing={!!editingCompetency}
        isSubmitting={isSubmitting}
      />

      <MyProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        // Skill changes update the profile's own lists locally; refetching the
        // whole app here fired the global loader on every skill edit.
        onProfileUpdated={undefined}
      />

      <RecurringActivitiesModal
        isOpen={isRecurringActivitiesOpen}
        onClose={() => setIsRecurringActivitiesOpen(false)}
        activities={recurringActivities}
        projects={projects}
        onEdit={handleEditRecurringActivity}
        onDelete={handleDeleteRecurringActivity}
        onCreateClick={() => {
          setIsRecurringActivitiesOpen(false);
          resetActivityForm();
          setIsAddingActivity(true);
        }}
      />

      <WhatsNewModal
        isOpen={isWhatsNewOpen}
        onClose={() => {
          setIsWhatsNewOpen(false);
          markWhatsNewSeen();
        }}
      />

      <VoiceActivityModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onActivityParsed={(parsed: ParsedVoiceActivity) => {
          mergeActivityPatch(adaptParsedVoiceActivityToDraftPatch(parsed, activityDraft));
          setIsVoiceModalOpen(false);
          setIsAddingActivity(true);
        }}
        onFallbackToManual={() => {
          setIsVoiceModalOpen(false);
          setIsAddingActivity(true);
        }}
        projects={projects}
      />
    </>
  );
};

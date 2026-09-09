import React from 'react';
import { motion } from 'framer-motion';
import { AdminProjectsGrid } from './AdminProjectsGrid';
import { BulkUserImportModal } from './BulkUserImportModal';
import { ProjectDetailModal } from './ProjectDetailModal';
import { CompetenciesTable, TeamsTable, UsersTable } from './AdminEntityTables';
import type {
  BackendCompetency,
  BackendProject,
  BackendTeam,
  BackendUser,
} from '../../../lib/api';
import type { Project, User } from '../../../entities';
import { AdminHeader } from './AdminHeader';
import { AdminTabs } from './AdminTabs';
import { AdminToolbar } from './AdminToolbar';
import { useAdminPageState } from '../hooks/useAdminPageState';

interface AdminPageProps {
  users: User[];
  backendUsers: BackendUser[];
  backendTeams: BackendTeam[];
  backendCompetencies: BackendCompetency[];
  projects: Project[];
  backendProjects: BackendProject[];
  currentUser: User;
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
  onRefreshData: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  backendUsers,
  backendTeams,
  backendCompetencies,
  projects,
  backendProjects,
  currentUser,
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
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isProjectManager = currentUser.role === 'manager';
  const admin = useAdminPageState({
    isAdmin,
    backendUsers,
    backendTeams,
    backendProjects,
    backendCompetencies,
    onDeleteUser,
    onDeleteTeam,
    onDeleteProject,
    onDeleteCompetency,
  });

  const handleAdd = () => {
    if (admin.activeTab === 'users') onAddUser();
    else if (admin.activeTab === 'teams') onAddTeam();
    else if (admin.activeTab === 'projects') onAddProject();
    else if (admin.activeTab === 'competencies') onAddCompetency();
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminHeader currentUser={currentUser} />
      <AdminTabs activeTab={admin.activeTab} tabs={admin.tabs} onTabChange={admin.setActiveTab} />
      <AdminToolbar activeTab={admin.activeTab} searchQuery={admin.searchQuery} onSearchChange={admin.setSearchQuery} onAdd={handleAdd} onOpenBulkImport={() => admin.setIsBulkImportOpen(true)} />

      <motion.div key={admin.activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {admin.activeTab === 'users' && (
          <UsersTable
            users={admin.filteredUsers}
            backendTeams={backendTeams}
            deletingId={admin.deletingId}
            onEditUser={onEditUser}
            onDeleteUser={admin.handleDeleteUser}
          />
        )}

        {admin.activeTab === 'teams' && (
          <TeamsTable
            teams={admin.filteredTeams}
            deletingId={admin.deletingId}
            onEditTeam={onEditTeam}
            onDeleteTeam={admin.handleDeleteTeam}
          />
        )}

        {admin.activeTab === 'projects' && (
          <AdminProjectsGrid
            filteredProjects={admin.filteredProjects}
            projects={projects}
            deletingId={admin.deletingId}
            onViewProject={admin.setViewingProject}
            onEditProject={onEditProject}
            onDeleteProject={admin.handleDeleteProject}
          />
        )}

        {admin.activeTab === 'competencies' && (
          <CompetenciesTable
            competencies={admin.filteredCompetencies}
            deletingId={admin.deletingId}
            onEditCompetency={onEditCompetency}
            onDeleteCompetency={admin.handleDeleteCompetency}
          />
        )}
      </motion.div>

      <ProjectDetailModal
        isOpen={!!admin.viewingProject}
        onClose={() => admin.setViewingProject(null)}
        project={admin.viewingProject}
        users={backendUsers}
        teams={backendTeams}
        canEdit={isAdmin || isProjectManager}
        onEdit={() => {
          if (admin.viewingProject) {
            const frontendProject = projects.find((entry) => entry.id === admin.viewingProject?.id.toString());
            if (frontendProject) {
              admin.setViewingProject(null);
              onEditProject(frontendProject);
            }
          }
        }}
      />

      <BulkUserImportModal
        isOpen={admin.isBulkImportOpen}
        onClose={() => admin.setIsBulkImportOpen(false)}
        teams={backendTeams}
        onSuccess={() => {
          onRefreshData();
          admin.setIsBulkImportOpen(false);
        }}
      />
    </div>
  );
};

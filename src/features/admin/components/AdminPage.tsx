import React from 'react';
import { Award, Building2, Edit2, Loader2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AdminProjectsGrid } from './AdminProjectsGrid';
import { BulkUserImportModal } from './BulkUserImportModal';
import { ProjectDetailModal } from './ProjectDetailModal';
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">User</th><th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Email</th><th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Team</th><th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Role</th><th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {admin.filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"><span className="text-purple-600 font-bold">{user.firstName[0]}{user.lastName[0]}</span></div><div><p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p><p className="text-sm text-gray-500">@{user.username}</p></div></div></td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">{backendTeams.find((team) => team.id === user.teamId)?.name || 'Unknown'}</span></td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-sm font-semibold ${user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{user.role}</span></td>
                    <td className="px-6 py-4"><div className="flex items-center justify-end gap-2"><button onClick={() => onEditUser(user)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button><button onClick={() => void admin.handleDeleteUser(user.id)} disabled={admin.deletingId === user.id} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">{admin.deletingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {admin.activeTab === 'teams' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Team</th><th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Description</th><th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Members</th><th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {admin.filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-green-600" /></div><p className="font-semibold text-gray-900">{team.name}</p></div></td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{team.description || '-'}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">{team._count?.users || 0} members</span></td>
                    <td className="px-6 py-4"><div className="flex items-center justify-end gap-2"><button onClick={() => onEditTeam(team)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button><button onClick={() => void admin.handleDeleteTeam(team.id)} disabled={admin.deletingId === `team-${team.id}`} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">{admin.deletingId === `team-${team.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Competency</th><th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Description</th><th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Created</th><th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {admin.filteredCompetencies.map((competency) => (
                  <tr key={competency.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><Award className="w-5 h-5 text-orange-600" /></div><p className="font-semibold text-gray-900">{competency.name}</p></div></td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{competency.description || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(competency.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4"><div className="flex items-center justify-end gap-2"><button onClick={() => onEditCompetency(competency)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button><button onClick={() => void admin.handleDeleteCompetency(competency.id)} disabled={admin.deletingId === `comp-${competency.id}`} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">{admin.deletingId === `comp-${competency.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

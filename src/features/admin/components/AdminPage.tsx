import React from 'react';
import { Award, Building2, Edit2, Loader2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
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
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Team</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                  <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {admin.filteredUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                        <div>
                          <p className="font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                          <p className="text-xs font-medium text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                        {backendTeams.find((team) => team.id === user.teamId)?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'project_manager' ? 'info' : 'secondary'} className="capitalize">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onEditUser(user)} aria-label={`Edit ${user.firstName}`} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                          <Edit2 className="size-4" />
                        </button>
                        <button onClick={() => void admin.handleDeleteUser(user.id)} disabled={admin.deletingId === user.id} aria-label={`Delete ${user.firstName}`} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50">
                          {admin.deletingId === user.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {admin.activeTab === 'teams' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Team</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Members</th>
                  <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {admin.filteredTeams.map((team) => (
                  <tr key={team.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Building2 className="size-4" />
                        </span>
                        <p className="font-semibold text-foreground">{team.name}</p>
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-5 py-3 text-muted-foreground">{team.description || '-'}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground tabular-nums">
                        {team._count?.users || 0} members
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onEditTeam(team)} aria-label={`Edit ${team.name}`} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                          <Edit2 className="size-4" />
                        </button>
                        <button onClick={() => void admin.handleDeleteTeam(team.id)} disabled={admin.deletingId === `team-${team.id}`} aria-label={`Delete ${team.name}`} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50">
                          {admin.deletingId === `team-${team.id}` ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                        </button>
                      </div>
                    </td>
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
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Competency</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Created</th>
                  <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {admin.filteredCompetencies.map((competency) => (
                  <tr key={competency.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Award className="size-4" />
                        </span>
                        <p className="font-semibold text-foreground">{competency.name}</p>
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-5 py-3 text-muted-foreground">{competency.description || '-'}</td>
                    <td className="px-5 py-3 text-muted-foreground">{new Date(competency.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onEditCompetency(competency)} aria-label={`Edit ${competency.name}`} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                          <Edit2 className="size-4" />
                        </button>
                        <button onClick={() => void admin.handleDeleteCompetency(competency.id)} disabled={admin.deletingId === `comp-${competency.id}`} aria-label={`Delete ${competency.name}`} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50">
                          {admin.deletingId === `comp-${competency.id}` ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                        </button>
                      </div>
                    </td>
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

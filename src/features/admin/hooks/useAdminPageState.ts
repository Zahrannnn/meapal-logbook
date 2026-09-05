import { useEffect, useState } from 'react';
import type { BackendCompetency, BackendProject, BackendTeam, BackendUser } from '../../../lib/api';
import { filterAdminData, getAdminTabs, getDefaultAdminTab, type AdminTabType } from '../mappers/admin.mapper';

interface UseAdminPageStateOptions {
  isAdmin: boolean;
  backendUsers: BackendUser[];
  backendTeams: BackendTeam[];
  backendProjects: BackendProject[];
  backendCompetencies: BackendCompetency[];
  onDeleteUser: (userId: number) => Promise<void>;
  onDeleteTeam: (teamId: number) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onDeleteCompetency: (competencyId: number) => Promise<void>;
}

export const useAdminPageState = ({
  isAdmin,
  backendUsers,
  backendTeams,
  backendProjects,
  backendCompetencies,
  onDeleteUser,
  onDeleteTeam,
  onDeleteProject,
  onDeleteCompetency,
}: UseAdminPageStateOptions) => {
  const [activeTab, setActiveTabState] = useState<AdminTabType>(() => {
    const saved = sessionStorage.getItem('adminActiveTab') as AdminTabType | null;
    return getDefaultAdminTab(isAdmin, saved);
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [viewingProject, setViewingProject] = useState<BackendProject | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  const setActiveTab = (tab: AdminTabType) => {
    setActiveTabState(tab);
    sessionStorage.setItem('adminActiveTab', tab);
  };

  useEffect(() => {
    if (!isAdmin && activeTab !== 'projects') {
      setActiveTab('projects');
    }
  }, [activeTab, isAdmin]);

  const tabs = getAdminTabs(isAdmin, {
    users: backendUsers.length,
    teams: backendTeams.length,
    projects: backendProjects.length,
    competencies: backendCompetencies.length,
  });

  const filtered = filterAdminData({
    searchQuery,
    backendUsers,
    backendTeams,
    backendProjects,
    backendCompetencies,
  });

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    setDeletingId(userId);
    try {
      await onDeleteUser(userId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (!confirm('Are you sure you want to delete this team? All users in this team will need to be reassigned.')) return;
    setDeletingId(`team-${teamId}`);
    try {
      await onDeleteTeam(teamId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? All associated activities will be deleted.')) return;
    setDeletingId(`project-${projectId}`);
    try {
      await onDeleteProject(projectId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCompetency = async (competencyId: number) => {
    if (!confirm('Are you sure you want to delete this competency?')) return;
    setDeletingId(`comp-${competencyId}`);
    try {
      await onDeleteCompetency(competencyId);
    } finally {
      setDeletingId(null);
    }
  };

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    deletingId,
    viewingProject,
    setViewingProject,
    isBulkImportOpen,
    setIsBulkImportOpen,
    tabs,
    ...filtered,
    handleDeleteUser,
    handleDeleteTeam,
    handleDeleteProject,
    handleDeleteCompetency,
  };
};

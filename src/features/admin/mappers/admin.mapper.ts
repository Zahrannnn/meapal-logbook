import type { BackendCompetency, BackendProject, BackendTeam, BackendUser } from '../../../lib/api';
import { Award, Building2, FolderKanban, Users } from 'lucide-react';

export type AdminTabType = 'users' | 'teams' | 'projects' | 'competencies';

export const getDefaultAdminTab = (isAdmin: boolean, activeTab: AdminTabType | null) => {
  if (activeTab && ['users', 'teams', 'projects', 'competencies'].includes(activeTab)) {
    if (!isAdmin && activeTab !== 'projects') {
      return 'projects' as const;
    }
    return activeTab;
  }

  return isAdmin ? ('users' as const) : ('projects' as const);
};

export const getAdminTabs = (
  isAdmin: boolean,
  counts: {
    users: number;
    teams: number;
    projects: number;
    competencies: number;
  },
) => {
  const allTabs = [
    {
      id: 'users' as const,
      label: 'Users',
      icon: Users,
      count: counts.users,
      activeClass: 'bg-purple-600 text-white shadow-lg',
      badgeClass: 'bg-purple-100 text-purple-700',
      adminOnly: true,
    },
    {
      id: 'teams' as const,
      label: 'Teams',
      icon: Building2,
      count: counts.teams,
      activeClass: 'bg-green-600 text-white shadow-lg',
      badgeClass: 'bg-green-100 text-green-700',
      adminOnly: true,
    },
    {
      id: 'projects' as const,
      label: 'Projects',
      icon: FolderKanban,
      count: counts.projects,
      activeClass: 'bg-blue-600 text-white shadow-lg',
      badgeClass: 'bg-blue-100 text-blue-700',
      adminOnly: false,
    },
    {
      id: 'competencies' as const,
      label: 'Competencies',
      icon: Award,
      count: counts.competencies,
      activeClass: 'bg-orange-600 text-white shadow-lg',
      badgeClass: 'bg-orange-100 text-orange-700',
      adminOnly: true,
    },
  ];

  return isAdmin ? allTabs : allTabs.filter((tab) => !tab.adminOnly);
};

export const filterAdminData = (params: {
  searchQuery: string;
  backendUsers: BackendUser[];
  backendTeams: BackendTeam[];
  backendProjects: BackendProject[];
  backendCompetencies: BackendCompetency[];
}) => {
  const normalizedQuery = params.searchQuery.toLowerCase();

  return {
    filteredUsers: params.backendUsers.filter(
      (user) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery),
    ),
    filteredTeams: params.backendTeams.filter((team) => team.name.toLowerCase().includes(normalizedQuery)),
    filteredProjects: params.backendProjects.filter((project) => project.name.toLowerCase().includes(normalizedQuery)),
    filteredCompetencies: params.backendCompetencies.filter((competency) =>
      competency.name.toLowerCase().includes(normalizedQuery),
    ),
  };
};

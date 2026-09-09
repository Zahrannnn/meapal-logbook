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
      activeClass: 'border-primary/40 bg-primary/10 text-primary',
      badgeClass: 'bg-primary/15 text-primary',
      adminOnly: true,
    },
    {
      id: 'teams' as const,
      label: 'Teams',
      icon: Building2,
      count: counts.teams,
      activeClass: 'border-primary/40 bg-primary/10 text-primary',
      badgeClass: 'bg-primary/15 text-primary',
      adminOnly: true,
    },
    {
      id: 'projects' as const,
      label: 'Projects',
      icon: FolderKanban,
      count: counts.projects,
      activeClass: 'border-primary/40 bg-primary/10 text-primary',
      badgeClass: 'bg-primary/15 text-primary',
      adminOnly: false,
    },
    {
      id: 'competencies' as const,
      label: 'Competencies',
      icon: Award,
      count: counts.competencies,
      activeClass: 'border-primary/40 bg-primary/10 text-primary',
      badgeClass: 'bg-primary/15 text-primary',
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

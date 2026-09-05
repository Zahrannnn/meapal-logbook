import type { Project, TeamType, User } from '../entities';
import type { BackendProject, BackendUser } from '../lib/api';

export const teamIdToType: Record<number, TeamType> = {
  1: 'app-dev',
  2: 'data-science',
  3: 'cyber-security',
  4: 'tech-support',
  5: 'as400',
  6: 'zos',
};

export const teamTypeToId: Record<string, number> = {
  'data-science': 1,
  'app-dev': 2,
  'backend': 3,
  'devops': 4,
  'ui-ux': 5,
  'embedded': 6,
};

export const projectStatusToFrontend: Record<string, 'active' | 'on-hold' | 'completed' | 'planned' | 'cancelled'> = {
  active: 'active',
  on_hold: 'on-hold',
  completed: 'completed',
  planned: 'planned',
  cancelled: 'cancelled',
};

export const projectStatusToBackend: Record<string, string> = {
  active: 'active',
  'on-hold': 'on_hold',
  completed: 'completed',
  planned: 'planned',
  cancelled: 'cancelled',
};

export type EditableProject = Project & {
  projectType?: 'prospected' | 'customer' | 'internal';
  customerName?: string;
  teamIds?: number[];
};

export const convertBackendProject = (project: BackendProject): EditableProject => ({
  id: project.id.toString(),
  name: project.name,
  description: project.description || '',
  status: projectStatusToFrontend[project.status] || 'active',
  startDate: project.startDate.split('T')[0],
  endDate: project.endDate?.split('T')[0],
  teams: project.teams.map((entry) => teamIdToType[entry.team.id] || 'app-dev'),
  teamIds: project.teams.map((entry) => entry.team.id),
  assignedMembers: project.members ? project.members.map((member) => member.user.id.toString()) : [],
  priority: project.priority as Project['priority'],
  progress: project.progress,
  projectType: project.projectType,
  customerName: project.customerName || '',
});

export const convertBackendUserToFrontend = (user: BackendUser): User => ({
  id: user.id.toString(),
  name: `${user.firstName} ${user.lastName}`,
  email: user.email,
  role: user.role === 'admin' ? 'admin' : user.role === 'project_manager' ? 'manager' : 'employee',
  team: (user.team?.name || (teamIdToType[user.teamId] || 'app-dev')) as User['team'],
  targetActivitiesPerDay: 5,
  joiningDate: user.hireDate || user.createdAt,
});

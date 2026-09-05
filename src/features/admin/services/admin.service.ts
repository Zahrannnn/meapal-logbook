import { competenciesApi, projectsApi, teamsApi, usersApi } from '../../../lib/api';

export const adminService = {
  users: usersApi,
  teams: teamsApi,
  projects: projectsApi,
  competencies: competenciesApi,
};

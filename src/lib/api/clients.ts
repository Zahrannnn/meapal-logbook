export { authApi } from './auth.client';
export { usersApi } from './users.client';
export { teamsApi } from './teams.client';
export { projectsApi } from './projects.client';
export { activitiesApi, recurrenceActivitiesApi } from './activities.client';
export { competenciesApi } from './competencies.client';
export { reportsApi } from './reports.client';
export { skillsApi } from './skills.client';
export { voiceApi } from './voice.client';

import { authApi } from './auth.client';
import { usersApi } from './users.client';
import { teamsApi } from './teams.client';
import { projectsApi } from './projects.client';
import { activitiesApi } from './activities.client';
import { competenciesApi } from './competencies.client';
import { reportsApi } from './reports.client';
import { skillsApi } from './skills.client';
import { voiceApi } from './voice.client';

export const api = {
  auth: authApi,
  users: usersApi,
  teams: teamsApi,
  projects: projectsApi,
  activities: activitiesApi,
  competencies: competenciesApi,
  reports: reportsApi,
  skills: skillsApi,
  voice: voiceApi,
};

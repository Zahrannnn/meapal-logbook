import type { TeamType } from '../team';

export type UserRole = 'employee' | 'manager' | 'admin' | 'project_manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team: string | TeamType;
  targetActivitiesPerDay: number;
  avatar?: string;
  joiningDate: string;
}

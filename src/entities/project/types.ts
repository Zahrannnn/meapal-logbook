import type { TeamType } from '../team';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'on-hold' | 'completed' | 'cancelled' | 'planned';
  startDate: string;
  endDate?: string;
  teams: TeamType[];
  assignedMembers: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
}

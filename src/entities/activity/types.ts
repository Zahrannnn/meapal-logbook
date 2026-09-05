import type { TeamType } from '../team';
import type { CompetencyTag } from '../competency';

export interface ActivityEntry {
  id: string;
  employeeName?: string;
  employeeId?: string;
  team?: TeamType;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  date: string;
  projectId: string;
  competencies?: CompetencyTag[];
  status: 'completed' | 'in-progress' | 'pending-approval' | 'blocked';
  timestamp: Date;
  approvedBy?: string;
  notes?: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    teamId: number;
    team?: { id: number; name: string };
  };
  project: { id: number; name: string };
  recurring?: {
    frequency?: string;
    interval?: number;
    daysOfWeek?: number[];
    startDate?: string;
    endDate?: string;
  } | null;
  frequency?: string;
  interval?: number;
  daysOfWeek?: number[];
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  deadline?: string;
}

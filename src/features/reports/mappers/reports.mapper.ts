import type { ActivityEntry, User as FrontendUser } from '../../../entities';
import type { BackendUser } from '../../../lib/api';
import { calculateActualHours } from '../../../lib/utils';

export type ReportType = 'project' | 'employee' | 'team' | 'payroll' | 'members' | 'followup';
export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'custom' | 'payroll';

export const getReportDateRange = (periodType: PeriodType, startDate: string, endDate: string) => {
  const today = new Date();
  let start: Date;
  let end: Date;

  switch (periodType) {
    case 'daily':
      start = today;
      end = today;
      break;
    case 'weekly':
      start = new Date(today);
      start.setDate(today.getDate() - 7);
      end = today;
      break;
    case 'monthly':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case 'payroll':
      if (today.getDate() >= 21) {
        start = new Date(today.getFullYear(), today.getMonth(), 21);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 20);
      } else {
        start = new Date(today.getFullYear(), today.getMonth() - 1, 21);
        end = new Date(today.getFullYear(), today.getMonth(), 20);
      }
      break;
    case 'custom':
      start = new Date(startDate);
      end = new Date(endDate);
      break;
    default:
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = today;
  }

  return { start, end };
};

export const groupActivitiesByEmployee = (activities: ActivityEntry[]) => {
  const grouped: Record<string, ActivityEntry[]> = {};
  activities.forEach((activity) => {
    const key = activity.employeeId || '';
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(activity);
  });
  return grouped;
};

export const groupActivitiesByProject = (activities: ActivityEntry[]) => {
  const grouped: Record<string, ActivityEntry[]> = {};
  activities.forEach((activity) => {
    if (!grouped[activity.projectId]) {
      grouped[activity.projectId] = [];
    }
    grouped[activity.projectId].push(activity);
  });
  return grouped;
};

export const groupActivitiesByTeam = (activities: ActivityEntry[]) => {
  const grouped: Record<string, ActivityEntry[]> = {};
  activities.forEach((activity) => {
    const key = activity.team || '';
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(activity);
  });
  return grouped;
};

export const summarizeFilteredActivities = (activities: ActivityEntry[]) => {
  const totalHours = calculateActualHours(activities);
  const completedActivities = activities.filter((activity) => activity.status === 'completed').length;

  return {
    totalActivities: activities.length,
    totalHours: totalHours.toFixed(1),
    completedActivities,
    completionRate: activities.length > 0 ? Math.round((completedActivities / activities.length) * 100) : 0,
    uniqueEmployees: new Set(activities.map((activity) => activity.employeeId)).size,
    uniqueProjects: new Set(activities.map((activity) => activity.projectId)).size,
    avgHoursPerDay: (totalHours / 30).toFixed(1),
  };
};

export const getDayName = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });

export const formatDateWithDay = (dateStr: string) => {
  const date = new Date(dateStr);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  return `${dayName}, ${dateStr}`;
};

export const getSelectedEmployeeName = (selectedEmployee: string, backendUsers: BackendUser[]) => {
  if (selectedEmployee === 'all') {
    return 'All_Employees';
  }

  const employee = backendUsers.find((user) => user.id.toString() === selectedEmployee);
  if (employee) {
    return `${employee.firstName}_${employee.lastName}`.replace(/\s+/g, '_');
  }

  return 'Employee';
};

export const resolveEmployeeDisplayName = (
  employeeId: string,
  users: FrontendUser[],
  backendUsers: BackendUser[],
  fallback?: string,
) => {
  const employee = users.find((user) => user.id === employeeId) || backendUsers.find((user) => user.id.toString() === employeeId);
  if (!employee) {
    return fallback || 'Unknown';
  }

  return 'name' in employee ? employee.name : `${employee.firstName} ${employee.lastName}`;
};

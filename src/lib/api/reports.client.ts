import { apiRequest } from './core';
import type { ApiResponse, EmployeeReport, FollowUpRow, OverallReport, ProjectReport, TeamReport } from './types';

export const reportsApi = {
  getOverall: async (params: { period: 'daily' | 'weekly' | 'monthly' | 'custom'; date?: string; startDate?: string; endDate?: string; teamId?: number; projectId?: number }): Promise<OverallReport> => {
    const query = new URLSearchParams();
    query.set('period', params.period);
    if (params.date) query.set('date', params.date);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.teamId) query.set('teamId', params.teamId.toString());
    if (params.projectId) query.set('projectId', params.projectId.toString());
    const response = await apiRequest<ApiResponse<OverallReport>>(`/reports/overall?${query.toString()}`);
    return response.data;
  },

  getByProject: async (projectId: number, params: { period: 'daily' | 'weekly' | 'monthly' | 'custom'; date?: string; startDate?: string; endDate?: string; teamId?: number }): Promise<ProjectReport> => {
    const query = new URLSearchParams();
    query.set('period', params.period);
    if (params.date) query.set('date', params.date);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.teamId) query.set('teamId', params.teamId.toString());
    const response = await apiRequest<ApiResponse<ProjectReport>>(`/reports/project/${projectId}?${query.toString()}`);
    return response.data;
  },

  getByTeam: async (teamId: number, params: { period: 'daily' | 'weekly' | 'monthly' | 'custom'; date?: string; startDate?: string; endDate?: string; projectId?: number }): Promise<TeamReport> => {
    const query = new URLSearchParams();
    query.set('period', params.period);
    if (params.date) query.set('date', params.date);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.projectId) query.set('projectId', params.projectId.toString());
    const response = await apiRequest<ApiResponse<TeamReport>>(`/reports/team/${teamId}?${query.toString()}`);
    return response.data;
  },

  getByEmployee: async (userId: number, params: { period: 'daily' | 'weekly' | 'monthly' | 'custom'; date?: string; startDate?: string; endDate?: string; projectId?: number }): Promise<EmployeeReport> => {
    const query = new URLSearchParams();
    query.set('period', params.period);
    if (params.date) query.set('date', params.date);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.projectId) query.set('projectId', params.projectId.toString());
    const response = await apiRequest<ApiResponse<EmployeeReport>>(`/reports/employee/${userId}?${query.toString()}`);
    return response.data;
  },

  getProjectDaily: async (projectId: number, date?: string) => {
    const query = date ? `?date=${date}` : '';
    const response = await apiRequest<ApiResponse<ProjectReport>>(`/reports/project/${projectId}/daily${query}`);
    return response.data;
  },
  getProjectWeekly: async (projectId: number, date?: string) => {
    const query = date ? `?date=${date}` : '';
    const response = await apiRequest<ApiResponse<ProjectReport>>(`/reports/project/${projectId}/weekly${query}`);
    return response.data;
  },
  getProjectMonthly: async (projectId: number, date?: string) => {
    const query = date ? `?date=${date}` : '';
    const response = await apiRequest<ApiResponse<ProjectReport>>(`/reports/project/${projectId}/monthly${query}`);
    return response.data;
  },
  getTeamDaily: async (teamId: number, date?: string) => {
    const query = date ? `?date=${date}` : '';
    const response = await apiRequest<ApiResponse<TeamReport>>(`/reports/team/${teamId}/daily${query}`);
    return response.data;
  },
  getTeamWeekly: async (teamId: number, date?: string) => {
    const query = date ? `?date=${date}` : '';
    const response = await apiRequest<ApiResponse<TeamReport>>(`/reports/team/${teamId}/weekly${query}`);
    return response.data;
  },
  getTeamMonthly: async (teamId: number, date?: string) => {
    const query = date ? `?date=${date}` : '';
    const response = await apiRequest<ApiResponse<TeamReport>>(`/reports/team/${teamId}/monthly${query}`);
    return response.data;
  },
  getEmployeeDaily: async (userId: number, date?: string) => {
    const query = date ? `?date=${date}` : '';
    const response = await apiRequest<ApiResponse<EmployeeReport>>(`/reports/employee/${userId}/daily${query}`);
    return response.data;
  },
  getEmployeeWeekly: async (userId: number, date?: string) => {
    const query = date ? `?date=${date}` : '';
    const response = await apiRequest<ApiResponse<EmployeeReport>>(`/reports/employee/${userId}/weekly${query}`);
    return response.data;
  },
  getEmployeeMonthly: async (userId: number, date?: string) => {
    const query = date ? `?date=${date}` : '';
    const response = await apiRequest<ApiResponse<EmployeeReport>>(`/reports/employee/${userId}/monthly${query}`);
    return response.data;
  },

  getFollowup: async (params: { startDate: string; endDate: string; projectId?: string; teamId?: string; userId?: string }): Promise<FollowUpRow[]> => {
    const query = new URLSearchParams();
    query.set('startDate', params.startDate);
    query.set('endDate', params.endDate);
    if (params.projectId) query.set('projectId', params.projectId);
    if (params.teamId) query.set('teamId', params.teamId);
    if (params.userId) query.set('userId', params.userId);
    const response = await apiRequest<ApiResponse<{ rows: FollowUpRow[] }>>(`/reports/followup?${query.toString()}`);
    return response.data.rows;
  },
};

import { apiRequest } from './core';
import type { ApiResponse, BackendActivity, PaginatedResponse } from './types';

const buildActivityQuery = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  projectId?: number;
  userId?: number;
  teamId?: number;
  startDate?: string;
  endDate?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  if (params?.projectId) query.set('projectId', params.projectId.toString());
  if (params?.userId) query.set('userId', params.userId.toString());
  if (params?.teamId) query.set('teamId', params.teamId.toString());
  if (params?.startDate) query.set('startDate', params.startDate);
  if (params?.endDate) query.set('endDate', params.endDate);
  return query;
};

export const activitiesApi = {
  getAll: async (params?: Parameters<typeof buildActivityQuery>[0]) => {
    const response = await apiRequest<ApiResponse<PaginatedResponse<BackendActivity> & { activities: BackendActivity[] }>>(
      `/activities?${buildActivityQuery(params).toString()}`,
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiRequest<ApiResponse<BackendActivity>>(`/activities/${id}`);
    return response.data;
  },

  getByUser: async (userId: number) => {
    const response = await apiRequest<ApiResponse<BackendActivity[]>>(`/activities/user/${userId}`);
    return response.data;
  },

  getByProject: async (projectId: number) => {
    const response = await apiRequest<ApiResponse<BackendActivity[]>>(`/activities/project/${projectId}`);
    return response.data;
  },

  getByDateRange: async (startDate: string, endDate: string, params?: { userId?: number; projectId?: number; teamId?: number }) => {
    const query = new URLSearchParams();
    query.set('startDate', startDate);
    query.set('endDate', endDate);
    if (params?.userId) query.set('userId', params.userId.toString());
    if (params?.projectId) query.set('projectId', params.projectId.toString());
    if (params?.teamId) query.set('teamId', params.teamId.toString());
    const response = await apiRequest<ApiResponse<BackendActivity[]>>(`/activities/range?${query.toString()}`);
    return response.data;
  },

  create: async (data: {
    userId: number;
    projectId: number;
    title: string;
    startTime: string;
    endTime: string;
    status?: string;
    notes?: string;
    competencyIds?: number[];
    recurring?: {
      frequency: string;
      interval: number;
      daysOfWeek?: number[];
      startDate?: string;
      endDate?: string;
    };
    progress?: number;
    deadline?: string;
  }) => {
    const response = await apiRequest<ApiResponse<BackendActivity>>('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<{
      projectId: number;
      title: string;
      startTime: string;
      endTime: string;
      status: string;
      notes: string;
      competencyIds: number[];
      recurring?: {
        frequency: string;
        interval: number;
        daysOfWeek?: number[];
        startDate?: string;
        endDate?: string;
      };
      progress?: number;
      deadline?: string;
    }>,
  ) => {
    const response = await apiRequest<ApiResponse<BackendActivity>>(`/activities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  updateStatus: async (id: number, status: string) => {
    const response = await apiRequest<ApiResponse<BackendActivity>>(`/activities/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data;
  },

  delete: async (id: number) => {
    await apiRequest<ApiResponse<null>>(`/activities/${id}`, { method: 'DELETE' });
  },
};

export const recurrenceActivitiesApi = {
  getAll: async (params?: Parameters<typeof buildActivityQuery>[0]) => {
    const response = await apiRequest<ApiResponse<PaginatedResponse<BackendActivity> & { activities: BackendActivity[] }>>(
      `/recurring?${buildActivityQuery(params).toString()}`,
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiRequest<ApiResponse<BackendActivity>>(`/recurring/${id}`);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<{
      projectId: number;
      title: string;
      notes: string;
      startTime: string;
      endTime: string;
      frequency: string;
      interval: number;
      daysOfWeek: number[];
      maxCount: number;
      startDate: string;
      endDate: string;
      competencyIds: number[];
    }>,
  ) => {
    const response = await apiRequest<ApiResponse<BackendActivity>>(`/recurring/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  delete: async (id: number) => {
    await apiRequest<ApiResponse<null>>(`/recurring/${id}`, { method: 'DELETE' });
  },
};

import { apiRequest } from './core';
import type { ApiResponse, BackendProject, PaginatedResponse } from './types';

export const projectsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    teamId?: number;
    ownerId?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.teamId) query.set('teamId', params.teamId.toString());
    if (params?.ownerId) query.set('ownerId', params.ownerId.toString());

    const response = await apiRequest<ApiResponse<PaginatedResponse<BackendProject> & { projects: BackendProject[] }>>(
      `/projects?${query.toString()}`,
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiRequest<ApiResponse<BackendProject>>(`/projects/${id}`);
    return response.data;
  },

  getByTeam: async (teamId: number) => {
    const response = await apiRequest<ApiResponse<BackendProject[]>>(`/projects/team/${teamId}`);
    return response.data;
  },

  getByOwner: async (ownerId: number) => {
    const response = await apiRequest<ApiResponse<BackendProject[]>>(`/projects/owner/${ownerId}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    description?: string;
    ownerId: number;
    status?: string;
    priority?: string;
    startDate: string;
    endDate?: string;
    teamIds?: number[];
    memberIds?: number[];
    projectType?: 'prospected' | 'customer' | 'internal';
    customerName?: string | null;
    progress?: number;
  }) => {
    const response = await apiRequest<ApiResponse<BackendProject>>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (id: number, data: Partial<BackendProject & { teamIds?: number[]; memberIds?: number[] }>) => {
    const response = await apiRequest<ApiResponse<BackendProject>>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  updateProgress: async (id: number, progress: number) => {
    const response = await apiRequest<ApiResponse<BackendProject>>(`/projects/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress }),
    });
    return response.data;
  },

  updateStatus: async (id: number, status: string) => {
    const response = await apiRequest<ApiResponse<BackendProject>>(`/projects/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data;
  },

  delete: async (id: number) => {
    await apiRequest<ApiResponse<null>>(`/projects/${id}`, { method: 'DELETE' });
  },
};

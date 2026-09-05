import { apiRequest } from './core';
import type { ApiResponse, BackendTeam, BackendUser, PaginatedResponse } from './types';

export const teamsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);

    const response = await apiRequest<ApiResponse<PaginatedResponse<BackendTeam> & { teams: BackendTeam[] }>>(
      `/teams?${query.toString()}`,
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiRequest<ApiResponse<BackendTeam>>(`/teams/${id}`);
    return response.data;
  },

  getMembers: async (id: number) => {
    const response = await apiRequest<ApiResponse<BackendUser[]>>(`/teams/${id}/members`);
    return response.data;
  },

  create: async (data: { name: string; description: string }) => {
    const response = await apiRequest<ApiResponse<BackendTeam>>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (id: number, data: Partial<{ name: string; description: string }>) => {
    const response = await apiRequest<ApiResponse<BackendTeam>>(`/teams/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  delete: async (id: number) => {
    await apiRequest<ApiResponse<null>>(`/teams/${id}`, { method: 'DELETE' });
  },
};

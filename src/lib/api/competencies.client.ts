import { apiRequest } from './core';
import type { ApiResponse, BackendCompetency, PaginatedResponse } from './types';

export const competenciesApi = {
  getAll: async () => {
    const response = await apiRequest<ApiResponse<BackendCompetency[]>>('/competencies/all');
    return response.data;
  },

  getPaginated: async (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);
    const response = await apiRequest<ApiResponse<PaginatedResponse<BackendCompetency> & { competencies: BackendCompetency[] }>>(
      `/competencies?${query.toString()}`,
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiRequest<ApiResponse<BackendCompetency>>(`/competencies/${id}`);
    return response.data;
  },

  create: async (data: { name: string; description?: string }) => {
    const response = await apiRequest<ApiResponse<BackendCompetency>>('/competencies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (id: number, data: Partial<{ name: string; description: string }>) => {
    const response = await apiRequest<ApiResponse<BackendCompetency>>(`/competencies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  delete: async (id: number) => {
    await apiRequest<ApiResponse<null>>(`/competencies/${id}`, { method: 'DELETE' });
  },

  seedDefaults: async () => {
    const response = await apiRequest<ApiResponse<BackendCompetency[]>>('/competencies/seed', {
      method: 'POST',
    });
    return response.data;
  },
};

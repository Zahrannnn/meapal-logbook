import { apiRequest } from './core';
import type { ApiResponse, BackendUser, PaginatedResponse } from './types';

export const usersApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);

    const response = await apiRequest<ApiResponse<PaginatedResponse<BackendUser> & { users: BackendUser[] }>>(
      `/users?${query.toString()}`,
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiRequest<ApiResponse<BackendUser>>(`/users/${id}`);
    return response.data;
  },

  create: async (data: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    teamId: number;
    role?: 'admin' | 'project_manager' | 'user';
    hireDate?: string;
  }) => {
    const response = await apiRequest<ApiResponse<BackendUser>>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<{
      email: string;
      username: string;
      password: string;
      firstName: string;
      lastName: string;
      teamId: number;
      role: 'admin' | 'project_manager' | 'user';
      hireDate: string;
    }>,
  ) => {
    const response = await apiRequest<ApiResponse<BackendUser>>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  delete: async (id: number) => {
    await apiRequest<ApiResponse<null>>(`/users/${id}`, { method: 'DELETE' });
  },
};

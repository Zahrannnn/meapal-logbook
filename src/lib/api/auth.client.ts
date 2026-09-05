import { apiRequest, getAuthToken, setAuthToken } from './core';
import type { ApiResponse, AuthResponse, BackendUser } from './types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiRequest<ApiResponse<AuthResponse>>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data.token) {
      setAuthToken(response.data.token);
    }

    return response.data;
  },

  logout: () => {
    setAuthToken(null);
  },

  getCurrentUser: async (): Promise<BackendUser | null> => {
    try {
      const token = getAuthToken();
      if (!token) return null;

      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.user?.id;
      if (!userId) return null;

      const response = await apiRequest<ApiResponse<BackendUser>>(`/users/${userId}`);
      return response.data;
    } catch {
      setAuthToken(null);
      return null;
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiRequest<ApiResponse<null>>('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyOtp: async (email: string, otp: string): Promise<{ resetToken: string }> => {
    const response = await apiRequest<ApiResponse<{ resetToken: string }>>('/users/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    return response.data;
  },

  resetPassword: async (email: string, newPassword: string, resetToken: string): Promise<void> => {
    await apiRequest<ApiResponse<null>>('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword, resetToken }),
    });
  },
};

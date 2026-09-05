/* eslint-disable @typescript-eslint/no-explicit-any */

import toast from 'react-hot-toast';
import Cookie from 'cookie-universal';

export const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/api/v1`;
export const cookies = Cookie();

let authToken: string | null = cookies.get('authToken');

export const setAuthToken = (token: string | null) => {
  authToken = token;

  if (token) {
    cookies.set('authToken', token, { expires: new Date(Date.now() + 1000 * 60 * 60 * 24) });
    return;
  }

  cookies.remove('authToken');
};

export const getAuthToken = () => authToken;

const handleAuthFailure = (message?: string) => {
  if (message === 'Token expired' || message === 'Invalid token') {
    setAuthToken(null);
    toast.error(`${message}. Please log in again.`);
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  }
};

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    (headers as Record<string, string>).Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    handleAuthFailure(data.message);
    const error: any = new Error(data.message || 'API request failed');
    error.validationDetails = data.validationDetails;
    error.status = data.status;
    throw error;
  }

  return data;
}

export async function apiUploadRequest<T>(endpoint: string, formData: FormData): Promise<T> {
  const headers: HeadersInit = {};

  if (authToken) {
    (headers as Record<string, string>).Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    handleAuthFailure(data.message);
    const error: any = new Error(data.message || 'Upload request failed');
    error.validationDetails = data.validationDetails;
    error.status = data.status;
    throw error;
  }

  return data;
}

import { cookies } from '../../../lib/api';

export interface BulkUploadResponse {
  message?: string;
  data?: {
    success?: number;
    successCount?: number;
    errors?: string[];
  };
}

/** POSTs the CSV to the backend's bulk user import endpoint. Throws on HTTP errors. */
export const uploadUsersCsv = async (file: File): Promise<BulkUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const API_BASE_URL = `http://${window.location.hostname}:3000/api/v1`;
  const token = cookies.get('authToken');

  const response = await fetch(`${API_BASE_URL}/users/upload-users-csv`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data: BulkUploadResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Upload failed');
  }

  return data;
};

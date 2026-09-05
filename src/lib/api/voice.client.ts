import { apiUploadRequest } from './core';
import type { ApiResponse, ParsedVoiceActivity } from './types';

export const voiceApi = {
  sendVoiceActivity: async (formData: FormData): Promise<ParsedVoiceActivity> => {
    const response: any = await apiUploadRequest('http://10.100.102.6:8543/api/v1/process', formData);
    return response.data ?? response;
  },
};

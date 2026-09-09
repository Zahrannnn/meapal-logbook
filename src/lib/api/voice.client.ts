import { apiUploadRequest } from './core';
import type { ApiResponse, ParsedVoiceActivity } from './types';

export const voiceApi = {
  sendVoiceActivity: async (formData: FormData): Promise<ParsedVoiceActivity> => {
    // The voice service answers with the standard envelope or the bare payload.
    const response = await apiUploadRequest<ApiResponse<ParsedVoiceActivity> | ParsedVoiceActivity>(
      'http://10.100.102.6:8543/api/v1/process',
      formData,
    );
    return ('data' in response ? response.data ?? response : response) as ParsedVoiceActivity;
  },
};

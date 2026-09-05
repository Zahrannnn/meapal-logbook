import type { ParsedVoiceActivity } from '../../../../lib/api';
import { voiceApi } from '../../../../lib/api';

const resolveAudioExtension = (mimeType: string) => {
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('wav')) return 'wav';
  if (mimeType.includes('mp4')) return 'mp4';
  return 'webm';
};

export const voiceService = {
  parseActivity: async (audioBlob: Blob): Promise<ParsedVoiceActivity> => {
    const formData = new FormData();
    const extension = resolveAudioExtension(audioBlob.type);
    formData.append('file', audioBlob, `voice-activity.${extension}`);
    return voiceApi.sendVoiceActivity(formData);
  },
};

import React from 'react';
import { AlertCircle, FilePenLine, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoiceErrorBannerProps {
  recordingError: string | null;
  sendError: string | null;
  onFallbackToManual: () => void;
}

export const VoiceErrorBanner: React.FC<VoiceErrorBannerProps> = ({
  recordingError,
  sendError,
  onFallbackToManual,
}) => {
  const message = recordingError || sendError;

  if (!message) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
    >
      {recordingError ? <MicOff className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-800">
          {recordingError ? 'Recording Error' : 'Voice Processing Error'}
        </p>
        <p className="text-xs text-red-600 mt-1">{message}</p>
        <button
          type="button"
          onClick={onFallbackToManual}
          className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-red-700 hover:text-red-800"
        >
          <FilePenLine className="w-3.5 h-3.5" />
          Continue in manual mode
        </button>
      </div>
    </motion.div>
  );
};

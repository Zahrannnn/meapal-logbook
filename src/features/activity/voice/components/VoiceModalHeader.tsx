import React from 'react';
import { Mic, X } from 'lucide-react';

interface VoiceModalHeaderProps {
  isSending: boolean;
  onClose: () => void;
}

export const VoiceModalHeader: React.FC<VoiceModalHeaderProps> = ({ isSending, onClose }) => (
  <div className="p-5 lg:p-6 bg-gradient-to-r from-violet-600 to-indigo-600 border-b border-violet-700">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
          <Mic className="w-6 h-6" />
          Voice Activity Log
        </h2>
        <p className="text-violet-100 text-sm mt-1">Describe your activity by voice</p>
      </div>
      <button
        onClick={onClose}
        disabled={isSending}
        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>
    </div>
  </div>
);

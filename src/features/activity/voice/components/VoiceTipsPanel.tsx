import React from 'react';
import { AlertCircle, FilePenLine } from 'lucide-react';

interface VoiceTipsPanelProps {
  isSending: boolean;
  onFallbackToManual: () => void;
}

export const VoiceTipsPanel: React.FC<VoiceTipsPanelProps> = ({ isSending, onFallbackToManual }) => (
  <div className="px-6 pb-5 lg:pb-6 space-y-3">
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
      <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-blue-700 leading-relaxed">
        <span className="font-semibold">Tip:</span> Describe the activity title, project, time range, and any
        notes. The AI will extract the details and pre-fill the activity form for you.
      </p>
    </div>
    <button
      type="button"
      onClick={onFallbackToManual}
      disabled={isSending}
      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
    >
      <FilePenLine className="w-4 h-4" />
      Switch to manual entry
    </button>
  </div>
);

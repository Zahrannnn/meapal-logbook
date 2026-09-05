import React from 'react';
import { Loader2, Mic, Pause, Play, RotateCcw, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatVoiceDuration, formatVoiceFileSize } from '../hooks/useVoicePlayback';

interface VoiceRecordedStateProps {
  audioBlob: Blob | null;
  audioUrl: string | null;
  duration: number;
  isPlaying: boolean;
  isSending: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onTogglePlayback: () => void;
  onReset: () => void;
  onSend: () => void;
}

export const VoiceRecordedState: React.FC<VoiceRecordedStateProps> = ({
  audioBlob,
  audioUrl,
  duration,
  isPlaying,
  isSending,
  audioRef,
  onTogglePlayback,
  onReset,
  onSend,
}) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-6 w-full">
    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
      <Mic className="w-8 h-8 text-emerald-600" />
    </div>
    <p className="text-gray-900 font-semibold text-lg mb-1">Recording Complete</p>
    <p className="text-gray-500 text-sm mb-6">
      {formatVoiceDuration(duration)} · {audioBlob && formatVoiceFileSize(audioBlob.size)}
    </p>

    {audioUrl && (
      <div className="w-full bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
        <audio ref={audioRef} src={audioUrl} />
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlayback}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow flex-shrink-0"
          >
            {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
          </button>
          <div className="flex-1">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: isPlaying ? '100%' : '0%' }}
                transition={{ duration, ease: 'linear' }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5 font-medium">{formatVoiceDuration(duration)}</p>
          </div>
        </div>
      </div>
    )}

    <div className="flex gap-3 w-full">
      <button
        onClick={onReset}
        disabled={isSending}
        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
      >
        <RotateCcw className="w-4 h-4" />
        Re-record
      </button>
      <button
        onClick={onSend}
        disabled={isSending}
        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-600/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send to process
          </>
        )}
      </button>
    </div>
  </motion.div>
);

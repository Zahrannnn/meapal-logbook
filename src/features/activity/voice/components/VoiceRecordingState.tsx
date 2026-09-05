import React from 'react';
import { Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatVoiceDuration } from '../hooks/useVoicePlayback';

interface VoiceRecordingStateProps {
  duration: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onStop: () => void;
}

export const VoiceRecordingState: React.FC<VoiceRecordingStateProps> = ({
  duration,
  canvasRef,
  onStop,
}) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-6 w-full">
    <div className="flex items-center gap-2 mb-6">
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-3 h-3 rounded-full bg-red-500"
      />
      <span className="text-red-600 text-sm font-bold uppercase tracking-wider">Recording</span>
    </div>

    <div className="w-full bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
      <canvas ref={canvasRef} width={400} height={80} className="w-full h-20" />
    </div>

    <p className="text-3xl font-mono font-bold text-gray-900 mb-8">{formatVoiceDuration(duration)}</p>

    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onStop}
      className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-xl shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/40 transition-shadow"
    >
      <Square className="w-8 h-8 text-white fill-white" />
    </motion.button>
    <p className="text-gray-400 text-xs mt-4">Tap to stop recording</p>
  </motion.div>
);

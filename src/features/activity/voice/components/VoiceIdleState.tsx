import React from 'react';
import { Mic } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoiceIdleStateProps {
  onStart: () => Promise<void>;
}

export const VoiceIdleState: React.FC<VoiceIdleStateProps> = ({ onStart }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8">
    <p className="text-gray-500 text-sm font-medium mb-8">Tap the microphone to start recording</p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => void onStart()}
      className="w-28 h-28 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transition-shadow"
    >
      <Mic className="w-12 h-12 text-white" />
    </motion.button>
    <p className="text-gray-400 text-xs mt-6">
      Example: &quot;I worked on the login page from 9AM to 11AM...&quot;
    </p>
  </motion.div>
);

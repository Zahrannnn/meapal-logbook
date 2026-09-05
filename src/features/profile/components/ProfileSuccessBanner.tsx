import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface ProfileSuccessBannerProps {
  message: string;
}

export const ProfileSuccessBanner: React.FC<ProfileSuccessBannerProps> = ({ message }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg flex items-center gap-2 text-green-700"
      >
        <CheckCircle className="w-5 h-5" />
        {message}
      </motion.div>
    )}
  </AnimatePresence>
);

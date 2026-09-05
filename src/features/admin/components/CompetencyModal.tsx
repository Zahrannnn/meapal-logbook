import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackendCompetency } from '../../../lib/api';

interface CompetencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  competency: BackendCompetency | null;
  onSave: (data: { name: string; description?: string }) => Promise<void>;
  isEditing: boolean;
  isSubmitting?: boolean;
}

export const CompetencyModal: React.FC<CompetencyModalProps> = ({
  isOpen,
  onClose,
  competency,
  onSave,
  isEditing,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (competency) {
        setFormData({
          name: competency.name,
          description: competency.description || ''
        });
      } else {
        setFormData({
          name: '',
          description: ''
        });
      }
      setError('');
    }
  }, [isOpen, competency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Competency name is required');
      return;
    }

    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save competency');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 lg:p-6 bg-gradient-to-r from-amber-500 to-orange-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg lg:text-xl font-bold text-white">
                      {isEditing ? 'Edit Competency' : 'Create New Competency'}
                    </h2>
                    <p className="text-amber-100 text-sm">
                      {isEditing ? 'Update competency information' : 'Add a new skill tag'}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 lg:p-6 space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Competency Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Competency Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all duration-200"
                  placeholder="e.g., Problem Solving"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none resize-none transition-all duration-200"
                  placeholder="Brief description of this competency..."
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>
            </form>

            {/* Footer */}
            <div className="p-5 lg:p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 border border-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {isEditing ? 'Update' : 'Create'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

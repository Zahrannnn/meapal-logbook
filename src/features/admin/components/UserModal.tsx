import React from 'react';
import { X, Save, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BackendUser, BackendTeam } from '../../../lib/api';
import { useUserModalState } from '../hooks/useUserModalState';
import { UserAccessFields, UserIdentityFields } from './UserModalFields';
import { UserPasswordFields } from './UserPasswordFields';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: BackendUser | null;
  teams: BackendTeam[];
  onSave: (data: {
    email: string;
    username: string;
    password?: string;
    firstName: string;
    lastName: string;
    teamId: number;
    role: 'admin' | 'project_manager' | 'user';
    hireDate?: string;
  }) => Promise<void>;
  isEditing: boolean;
  isSubmitting?: boolean;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
  teams,
  onSave,
  isEditing,
  isSubmitting = false
}) => {
  const { formData, setFormData, error, handleSubmit } = useUserModalState({
    isOpen,
    user,
    teams,
    isEditing,
    onSave,
  });

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
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-5 lg:p-6 bg-gradient-to-r from-violet-600 to-purple-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg lg:text-xl font-bold text-white">
                      {isEditing ? 'Edit User' : 'Create New User'}
                    </h2>
                    <p className="text-violet-100 text-sm">
                      {isEditing ? 'Update user information' : 'Add a new team member'}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <UserIdentityFields formData={formData} setFormData={setFormData} isSubmitting={isSubmitting} />

              <UserPasswordFields
                formData={formData}
                setFormData={setFormData}
                isEditing={isEditing}
                isSubmitting={isSubmitting}
              />

              <UserAccessFields formData={formData} setFormData={setFormData} teams={teams} isSubmitting={isSubmitting} />
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-600/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {isEditing ? 'Update User' : 'Create User'}
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

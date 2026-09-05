import React from 'react';
import { X, Save, Loader2, User, Mail, Lock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BackendUser, BackendTeam } from '../../../lib/api';
import { useUserModalState } from '../hooks/useUserModalState';

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

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all duration-200"
                    placeholder="John"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all duration-200"
                    placeholder="Doe"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
                  placeholder="abc@corelia.ai"
                  required
                  disabled={isSubmitting}
                />
                {/* <p className="text-xs text-gray-500 mt-1">Format: 3 letters + @corelia.ai (e.g. abc@corelia.ai)</p> */}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
                  placeholder="johndoe"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Password {!isEditing && '*'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
                    placeholder={isEditing ? '(unchanged)' : '••••••••'}
                    required={!isEditing}
                    disabled={isSubmitting}
                  />
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      <p className={`text-xs flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                        {formData.password.length >= 8 ? '✓' : '○'} At least 8 characters
                      </p>
                      <p className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        {/[A-Z]/.test(formData.password) ? '✓' : '○'} One uppercase letter
                      </p>
                      <p className={`text-xs flex items-center gap-1 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        {/[a-z]/.test(formData.password) ? '✓' : '○'} One lowercase letter
                      </p>
                      <p className={`text-xs flex items-center gap-1 ${/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        {/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(formData.password) ? '✓' : '○'} One special character
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password {!isEditing && '*'}
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
                    placeholder="••••••••"
                    required={!isEditing}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Team and Role */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Team *
                  </label>
                  <select
                    value={formData.teamId}
                    onChange={(e) => setFormData({ ...formData, teamId: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
                    required
                    disabled={isSubmitting}
                  >
                    <option value={0}>Select Team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'project_manager' | 'user' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="user">Team Member</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.role === 'admin' && '• Full access to all features'}
                    {formData.role === 'project_manager' && '• Can manage projects, view reports, assign tasks'}
                    {formData.role === 'user' && '• Can log activities and view own data'}
                  </p>
                </div>
              </div>

              {/* Hire Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hire Date
                </label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all duration-200"
                  disabled={isSubmitting}
                />
                {/* <p className="text-xs text-gray-500 mt-1">Cannot be a future date</p> */}
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

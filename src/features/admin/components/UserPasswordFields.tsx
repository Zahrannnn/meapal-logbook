import React from 'react';
import { Lock } from 'lucide-react';
import type { UserFormData } from '../hooks/useUserModalState';

const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

/** Password + confirm fields with the live strength checklist under the input. */
export const UserPasswordFields: React.FC<{
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  isEditing: boolean;
  isSubmitting: boolean;
}> = ({ formData, setFormData, isEditing, isSubmitting }) => (
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
          <p className={`text-xs flex items-center gap-1 ${hasSpecial.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
            {hasSpecial.test(formData.password) ? '✓' : '○'} One special character
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
);

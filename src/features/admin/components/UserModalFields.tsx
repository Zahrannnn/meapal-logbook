import React from 'react';
import { Mail, Users } from 'lucide-react';
import type { BackendTeam } from '../../../lib/api';
import type { UserFormData } from '../hooks/useUserModalState';

const inputClassName =
  'w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none';

/** First/last name, email and username — who the user is. */
export const UserIdentityFields: React.FC<{
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  isSubmitting: boolean;
}> = ({ formData, setFormData, isSubmitting }) => (
  <>
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

    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        <Mail className="w-4 h-4 inline mr-1" />
        Email Address *
      </label>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className={inputClassName}
        placeholder="abc@corelia.ai"
        required
        disabled={isSubmitting}
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Username *
      </label>
      <input
        type="text"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        className={inputClassName}
        placeholder="johndoe"
        required
        disabled={isSubmitting}
      />
    </div>
  </>
);

/** Team, role (with per-role hint) and hire date — how the user plugs into the org. */
export const UserAccessFields: React.FC<{
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  teams: BackendTeam[];
  isSubmitting: boolean;
}> = ({ formData, setFormData, teams, isSubmitting }) => (
  <>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Users className="w-4 h-4 inline mr-1" />
          Team *
        </label>
        <select
          value={formData.teamId}
          onChange={(e) => setFormData({ ...formData, teamId: parseInt(e.target.value) })}
          className={inputClassName}
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
          className={inputClassName}
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
    </div>
  </>
);

import React from 'react';
import { Calendar } from 'lucide-react';
import type { Project } from '../../../entities';
import type { ProjectFormData } from '../hooks/useProjectModalState';

const fieldClassName = 'w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-gray-900';

/** Name, description, status/priority, dates and the progress slider. */
export const BasicInfoSection: React.FC<{
  formData: ProjectFormData;
  setFormData: (data: ProjectFormData) => void;
}> = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
      <div className="w-6 h-6 bg-blue-600 rounded-lg"></div>
      Basic Information
    </h3>

    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Project Name *
      </label>
      <input type="text" value={formData.name} onChange={e => setFormData({
        ...formData,
        name: e.target.value
      })} className={fieldClassName} placeholder="e.g., Customer Portal Redesign" required />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Description *
      </label>
      <textarea value={formData.description} onChange={e => setFormData({
        ...formData,
        description: e.target.value
      })} className={`${fieldClassName} resize-none`} rows={3} placeholder="Brief description of the project" required />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Status
        </label>
        <select value={formData.status} onChange={e => setFormData({
          ...formData,
          status: e.target.value as Project['status']
        })} className={fieldClassName}>
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Priority
        </label>
        <select value={formData.priority} onChange={e => setFormData({
          ...formData,
          priority: e.target.value as Project['priority']
        })} className={fieldClassName}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Start Date *
        </label>
        <input type="date" value={formData.startDate} onChange={e => setFormData({
          ...formData,
          startDate: e.target.value
        })} className={fieldClassName} required />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          End Date (Optional)
        </label>
        <input type="date" value={formData.endDate} min={formData.startDate} onChange={e => setFormData({
          ...formData,
          endDate: e.target.value
        })} className={fieldClassName} />
      </div>
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Progress (%)
      </label>
      <input type="number" min="0" max="100" value={formData.progress} onChange={e => setFormData({
        ...formData,
        progress: parseInt(e.target.value) || 0
      })} className={fieldClassName} />
      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{
          width: `${formData.progress}%`
        }} />
      </div>
    </div>
  </div>
);

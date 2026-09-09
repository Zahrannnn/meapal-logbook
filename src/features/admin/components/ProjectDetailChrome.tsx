import React from 'react';
import { X, Building2, Edit2 } from 'lucide-react';
import type { BackendProject } from '../../../lib/api';

/** Dark gradient header: type/status/priority badges, project name, edit + close. */
export const ProjectDetailHeader: React.FC<{
  project: BackendProject;
  status: { label: string; bg: string; color: string };
  priority: { label: string; bg: string; color: string };
  projectType: { label: string; bg: string; color: string };
  onClose: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
}> = ({ project, status, priority, projectType, onClose, onEdit, canEdit = false }) => (
  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${projectType.bg} ${projectType.color}`}>
            {projectType.label}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${status.bg} ${status.color}`}>
            {status.label}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${priority.bg} ${priority.color}`}>
            {priority.label} Priority
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{project.name}</h2>
        {project.customerName && (
          <p className="text-green-400 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Customer: <span className="font-semibold">{project.customerName}</span>
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {canEdit && onEdit && (
          <button
            onClick={onEdit}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            title="Edit Project"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  </div>
);

export const ProjectDetailFooter: React.FC<{
  onClose: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
}> = ({ onClose, onEdit, canEdit = false }) => (
  <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
    {canEdit && onEdit && (
      <button
        onClick={onEdit}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <Edit2 className="w-4 h-4" />
        Edit Project
      </button>
    )}
    <button
      onClick={onClose}
      className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
    >
      Close
    </button>
  </div>
);

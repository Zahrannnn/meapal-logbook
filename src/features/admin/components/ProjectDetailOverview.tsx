import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, FolderKanban, Calendar, User } from 'lucide-react';
import type { BackendProject } from '../../../lib/api';
import { DetailSection } from './DetailSection';

/** Animated overall-progress bar with the four activity stats. */
export const ProgressSection: React.FC<{
  progress: number;
  projectActivities: unknown[];
  completedActivities: unknown[];
  inProgressActivities: unknown[];
  totalHours: number;
}> = ({ progress, projectActivities, completedActivities, inProgressActivities, totalHours }) => (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
      <TrendingUp className="w-5 h-5 text-blue-600" />
      Project Progress
    </h3>
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">Overall Progress</span>
        <span className="text-2xl font-bold text-blue-600">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-4 rounded-full ${
            progress >= 100 ? 'bg-green-500' :
            progress >= 75 ? 'bg-blue-500' :
            progress >= 50 ? 'bg-yellow-500' :
            'bg-orange-500'
          }`}
        />
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-card rounded-lg p-4 border border-gray-200">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Activities</p>
        <p className="text-2xl font-bold text-gray-900">{projectActivities.length}</p>
      </div>
      <div className="bg-card rounded-lg p-4 border border-gray-200">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Completed</p>
        <p className="text-2xl font-bold text-green-600">{completedActivities.length}</p>
      </div>
      <div className="bg-card rounded-lg p-4 border border-gray-200">
        <p className="text-xs text-gray-500 uppercase tracking-wide">In Progress</p>
        <p className="text-2xl font-bold text-blue-600">{inProgressActivities.length}</p>
      </div>
      <div className="bg-card rounded-lg p-4 border border-gray-200">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Hours</p>
        <p className="text-2xl font-bold text-purple-600">{totalHours.toFixed(1)}h</p>
      </div>
    </div>
  </div>
);

export const DescriptionSection: React.FC<{ description: string }> = ({ description }) => (
  <DetailSection icon={FolderKanban} title="Description">
    <p className="text-gray-700 leading-relaxed">{description}</p>
  </DetailSection>
);

export const TimelineSection: React.FC<{ project: BackendProject; formatDate: (d: string) => string }> = ({
  project,
  formatDate,
}) => (
  <DetailSection icon={Calendar} title="Timeline">
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Start Date</span>
        <span className="font-semibold text-gray-900">{formatDate(project.startDate)}</span>
      </div>
      {project.endDate && (
        <div className="flex items-center justify-between">
          <span className="text-gray-600">End Date</span>
          <span className="font-semibold text-gray-900">{formatDate(project.endDate)}</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Created</span>
        <span className="font-semibold text-gray-900">{formatDate(project.createdAt)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Last Updated</span>
        <span className="font-semibold text-gray-900">{formatDate(project.updatedAt)}</span>
      </div>
    </div>
  </DetailSection>
);

export const OwnerSection: React.FC<{ project: BackendProject }> = ({ project }) => (
  <DetailSection icon={User} title="Project Owner">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
        {project.owner.firstName[0]}{project.owner.lastName[0]}
      </div>
      <div>
        <p className="font-bold text-gray-900 text-lg">
          {project.owner.firstName} {project.owner.lastName}
        </p>
        <p className="text-gray-600">{project.owner.email}</p>
      </div>
    </div>
  </DetailSection>
);

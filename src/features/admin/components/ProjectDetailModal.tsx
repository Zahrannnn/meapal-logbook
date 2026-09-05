import React from 'react';
import { 
  X, Calendar, Users, Building2, FolderKanban, 
  Clock, CheckCircle2, AlertCircle, PauseCircle, 
  Target, TrendingUp, User, Briefcase, Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BackendProject, BackendUser, BackendTeam } from '../../../lib/api';
import { calculateActualHours } from '../../../lib/utils';
import { useProjectDetailData } from '../hooks/useProjectDetailData';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: BackendProject | null;
  users: BackendUser[];
  teams: BackendTeam[];
  onEdit?: () => void;
  canEdit?: boolean;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  onClose,
  project,
  users,
  teams,
  onEdit,
  canEdit = false
}) => {
  const {
    projectActivities,
    completedActivities,
    inProgressActivities,
    totalHours,
    activeUsers,
    isLoadingActivities,
    formatDate,
    getTeamColor,
    status,
    priority,
    projectType,
    teamsById,
  } = useProjectDetailData({ project, users, teams });

  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Progress Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Project Progress
                </h3>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Overall Progress</span>
                    <span className="text-2xl font-bold text-blue-600">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress || 0}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-4 rounded-full ${
                        (project.progress || 0) >= 100 ? 'bg-green-500' :
                        (project.progress || 0) >= 75 ? 'bg-blue-500' :
                        (project.progress || 0) >= 50 ? 'bg-yellow-500' :
                        'bg-orange-500'
                      }`}
                    />
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Activities</p>
                    <p className="text-2xl font-bold text-gray-900">{projectActivities.length}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{completedActivities.length}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{inProgressActivities.length}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Hours</p>
                    <p className="text-2xl font-bold text-purple-600">{totalHours.toFixed(1)}h</p>
                  </div>
                </div>
              </div>

              {/* Loading state for activities */}
              {isLoadingActivities && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-gray-500 text-sm">Loading activities...</span>
                </div>
              )}

              {/* Description */}
              {project.description && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-gray-600" />
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{project.description}</p>
                </div>
              )}

              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Timeline */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    Timeline
                  </h3>
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
                </div>

                {/* Owner */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    Project Owner
                  </h3>
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
                </div>
              </div>

              {/* Assigned Teams */}
              {project.teams && project.teams.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-600" />
                    Assigned Teams ({project.teams.length})
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {project.teams.map((t, idx) => {
                      const teamColor = getTeamColor(t.team.name);
                      const teamMemberCount = users.filter(u => u.teamId === t.team.id).length;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm"
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${teamColor}20` }}
                          >
                            <Users className="w-5 h-5" style={{ color: teamColor }} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{t.team.name}</p>
                            <p className="text-sm text-gray-500">{teamMemberCount} members</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Assigned Members */}
              {project.members && project.members.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-violet-600" />
                    Assigned Members ({project.members.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {project.members.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                          {member.user.firstName[0]}{member.user.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
                        </div>
                        {member.user.team && (
                          <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600">
                            {member.user.team.name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Contributors */}
              {activeUsers.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Active Contributors ({activeUsers.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeUsers.map(user => {
                      const userActivities = projectActivities.filter(a => a.userId === user.id);
                      const userHours = calculateActualHours(userActivities);
                      const userTeam = teamsById.get(user.teamId);
                      const teamColor = userTeam ? getTeamColor(userTeam.name) : '#6B7280';
                      
                      return (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200"
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: teamColor }}
                          >
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-500">{userActivities.length} tasks</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-blue-600 font-medium">{userHours.toFixed(1)}h</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Activities */}
              {projectActivities.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    Recent Activities
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {projectActivities.slice(0, 10).map(activity => {
                      const activityUser = users.find(u => u.id === activity.userId);
                      const activityStatus = {
                        completed: { bg: 'bg-green-100', text: 'text-green-700' },
                        in_progress: { bg: 'bg-blue-100', text: 'text-blue-700' },
                        blocked: { bg: 'bg-red-100', text: 'text-red-700' },
                        pending: { bg: 'bg-gray-100', text: 'text-gray-700' }
                      }[activity.status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
                      
                      return (
                        <div
                          key={activity.id}
                          className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{activity.title}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{activityUser ? `${activityUser.firstName} ${activityUser.lastName}` : 'Unknown'}</span>
                              <span>•</span>
                              <span>{formatDate(activity.startTime)}</span>
                              <span>•</span>
                              <span>{activity.duration?.toFixed(1)}h</span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${activityStatus.bg} ${activityStatus.text}`}>
                            {activity.status.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {projectActivities.length > 10 && (
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      And {projectActivities.length - 10} more activities...
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import React from 'react';
import { Edit2, Eye, FolderKanban, Loader2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Project } from '../../../entities';
import type { BackendProject } from '../../../lib/api';

interface AdminProjectsGridProps {
  filteredProjects: BackendProject[];
  projects: Project[];
  deletingId: string | number | null;
  onViewProject: (project: BackendProject) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => Promise<void>;
}

const projectTypeConfig: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  prospected: { bg: 'bg-gradient-to-br from-yellow-50 to-orange-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: '🎯' },
  customer: { bg: 'bg-gradient-to-br from-green-50 to-emerald-50', text: 'text-green-700', border: 'border-green-200', icon: '🏢' },
  internal: { bg: 'bg-gradient-to-br from-blue-50 to-indigo-50', text: 'text-blue-700', border: 'border-blue-200', icon: '🔧' },
};

const statusConfig: Record<string, { bg: string; text: string; glow: string }> = {
  active: { bg: 'bg-green-500', text: 'text-white', glow: 'shadow-green-200' },
  on_hold: { bg: 'bg-yellow-500', text: 'text-white', glow: 'shadow-yellow-200' },
  completed: { bg: 'bg-blue-500', text: 'text-white', glow: 'shadow-blue-200' },
  cancelled: { bg: 'bg-red-500', text: 'text-white', glow: 'shadow-red-200' },
  planned: { bg: 'bg-gray-500', text: 'text-white', glow: 'shadow-gray-200' },
};

const priorityConfig: Record<string, { color: string }> = {
  critical: { color: '#EF4444' },
  high: { color: '#F97316' },
  medium: { color: '#EAB308' },
  low: { color: '#6B7280' },
};

const getProgressColor = (progress: number) => {
  if (progress >= 100) return '#10B981';
  if (progress >= 75) return '#3B82F6';
  if (progress >= 50) return '#F59E0B';
  return '#EF4444';
};

export const AdminProjectsGrid: React.FC<AdminProjectsGridProps> = ({
  filteredProjects,
  projects,
  deletingId,
  onViewProject,
  onEditProject,
  onDeleteProject,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      {filteredProjects.map((project, index) => {
        const frontendProject = projects.find((entry) => entry.id === project.id.toString());
        const typeStyle = projectTypeConfig[project.projectType || 'internal'] || projectTypeConfig.internal;
        const status = statusConfig[project.status] || statusConfig.planned;
        const priorityColor = priorityConfig[project.priority]?.color || '#6B7280';
        const progressColor = getProgressColor(project.progress);

        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05,
              type: 'spring',
              stiffness: 100,
            }}
            whileHover={{
              y: -8,
              scale: 1.02,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            }}
            className={`${typeStyle.bg} rounded-2xl border-2 ${typeStyle.border} overflow-hidden cursor-pointer group transition-all duration-300`}
            onClick={() => onViewProject(project)}
          >
            <div className="p-5 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="text-3xl font-black text-gray-700 leading-none min-w-8 text-center"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {typeStyle.icon}
                  </motion.div>
                  <div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${typeStyle.text}`}>
                      {project.projectType || 'internal'}
                    </span>
                    {project.customerName && (
                      <p className="text-xs text-gray-500 mt-0.5">{project.customerName}</p>
                    )}
                  </div>
                </div>
                <motion.span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text} shadow-lg ${status.glow}`}
                  whileHover={{ scale: 1.1 }}
                >
                  {project.status.replace('_', ' ')}
                </motion.span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                {project.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                {project.description || 'No description available'}
              </p>
            </div>

            <div className="px-5 pb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500 font-medium">Progress</span>
                <motion.span
                  className="font-bold text-lg"
                  style={{ color: progressColor }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  {project.progress}%
                </motion.span>
              </div>
              <div className="h-3 bg-gray-200/80 rounded-full overflow-hidden backdrop-blur">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: progressColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{
                    duration: 1,
                    delay: 0.2 + index * 0.05,
                    ease: 'easeOut',
                  }}
                />
              </div>
            </div>

            <div className="px-5 py-4 bg-white/60 backdrop-blur border-t border-gray-200/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: priorityColor }} />
                <span className="text-xs font-semibold text-gray-600 capitalize">
                  {project.priority} priority
                </span>
              </div>

              <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onViewProject(project)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-xl transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => frontendProject && onEditProject(frontendProject)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                  title="Edit Project"
                >
                  <Edit2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => void onDeleteProject(project.id.toString())}
                  disabled={deletingId === `project-${project.id}`}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                  title="Delete Project"
                >
                  {deletingId === `project-${project.id}` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        );
      })}

      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400"
        >
          <FolderKanban className="w-16 h-16 mb-4" />
          <p className="text-lg font-medium">No projects found</p>
          <p className="text-sm">Try adjusting your search or add a new project</p>
        </motion.div>
      )}
    </div>
  );
};

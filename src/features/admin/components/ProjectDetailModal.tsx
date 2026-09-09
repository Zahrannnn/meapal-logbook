import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BackendProject, BackendUser, BackendTeam } from '../../../lib/api';
import { useProjectDetailData } from '../hooks/useProjectDetailData';
import { ProjectDetailHeader, ProjectDetailFooter } from './ProjectDetailChrome';
import { DescriptionSection, OwnerSection, ProgressSection, TimelineSection } from './ProjectDetailOverview';
import { ContributorsSection, MembersSection, RecentActivitiesSection, TeamsSection } from './ProjectDetailPeople';

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
            <ProjectDetailHeader
              project={project}
              status={status}
              priority={priority}
              projectType={projectType}
              onClose={onClose}
              onEdit={onEdit}
              canEdit={canEdit}
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <ProgressSection
                progress={project.progress || 0}
                projectActivities={projectActivities}
                completedActivities={completedActivities}
                inProgressActivities={inProgressActivities}
                totalHours={totalHours}
              />

              {/* Loading state for activities */}
              {isLoadingActivities && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-gray-500 text-sm">Loading activities...</span>
                </div>
              )}

              {project.description && <DescriptionSection description={project.description} />}

              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TimelineSection project={project} formatDate={formatDate} />
                <OwnerSection project={project} />
              </div>

              {project.teams && project.teams.length > 0 && (
                <TeamsSection teams={project.teams} users={users} getTeamColor={getTeamColor} />
              )}

              {project.members && project.members.length > 0 && (
                <MembersSection members={project.members} />
              )}

              {activeUsers.length > 0 && (
                <ContributorsSection
                  activeUsers={activeUsers}
                  projectActivities={projectActivities}
                  teamsById={teamsById}
                  getTeamColor={getTeamColor}
                />
              )}

              {projectActivities.length > 0 && (
                <RecentActivitiesSection projectActivities={projectActivities} users={users} formatDate={formatDate} />
              )}
            </div>

            <ProjectDetailFooter onClose={onClose} onEdit={onEdit} canEdit={canEdit} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

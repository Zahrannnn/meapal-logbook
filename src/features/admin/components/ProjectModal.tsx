import React from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '../../../entities';
import type { BackendTeam, BackendUser } from '../../../lib/api';
import {
  type EditableProject,
  type ProjectType,
  useProjectModalState,
} from '../hooks/useProjectModalState';
import {
  CustomerNameSection,
  MemberAssignmentSection,
  ProjectTypeSection,
  TeamSelectionSection,
} from './ProjectFormSections';
import { BasicInfoSection } from './ProjectBasicInfoSection';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: EditableProject | null;
  backendUsers: BackendUser[];
  backendTeams: BackendTeam[];
  onSave: (project: Omit<Project, 'id'> & { projectType?: ProjectType; customerName?: string; teamIds?: number[] }) => void | Promise<void>;
  isEditing: boolean;
  isSubmitting?: boolean;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  backendUsers,
  backendTeams,
  onSave,
  isEditing,
  isSubmitting = false
}) => {
  const {
    formData,
    setFormData,
    selectedTeamIds,
    memberSearch,
    setMemberSearch,
    filteredUsers,
    toggleTeam,
    toggleMember,
    handleSubmit,
  } = useProjectModalState({ isOpen, project, backendUsers, onSave });

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
            onClick={e => e.stopPropagation()}
            className="bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-5 lg:p-6 border-b border-gray-100 bg-gradient-to-r from-violet-600 to-purple-600">
              <div className="flex items-center justify-between">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {isEditing ? 'Edit Project' : 'Create New Project'}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-6">
              <ProjectTypeSection formData={formData} setFormData={setFormData} />

              {formData.projectType === 'customer' && (
                <CustomerNameSection formData={formData} setFormData={setFormData} />
              )}

              <BasicInfoSection formData={formData} setFormData={setFormData} />

              <TeamSelectionSection
                backendTeams={backendTeams}
                selectedTeamIds={selectedTeamIds}
                toggleTeam={toggleTeam}
              />

              {selectedTeamIds.length > 0 && (
                <MemberAssignmentSection
                  formData={formData}
                  backendTeams={backendTeams}
                  memberSearch={memberSearch}
                  setMemberSearch={setMemberSearch}
                  filteredUsers={filteredUsers}
                  toggleMember={toggleMember}
                />
              )}
            </form>

            <div className="p-5 lg:p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-6 py-3 bg-card text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 border border-gray-200 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-600/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {isEditing ? 'Update Project' : 'Create Project'}
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

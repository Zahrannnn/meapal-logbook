import React from 'react';
import { X, Save, Users, Calendar, Loader2, Building2, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '../../../entities';
import type { BackendTeam, BackendUser } from '../../../lib/api';
import {
  projectTypeColors,
  type EditableProject,
  type ProjectType,
  useProjectModalState,
} from '../hooks/useProjectModalState';

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

  return <AnimatePresence>
      {isOpen && <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{
        scale: 0.95,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} exit={{
        scale: 0.95,
        opacity: 0
      }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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
              {/* Project Type Selection */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-violet-600" />
                  Project Type <span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['prospected', 'customer', 'internal'] as ProjectType[]).map(type => {
                    const isSelected = formData.projectType === type;
                    const colors = projectTypeColors[type];
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, projectType: type })}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                          isSelected 
                            ? `${colors.bg} ${colors.border} shadow-md` 
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <p className={`font-semibold text-sm capitalize ${isSelected ? colors.text : 'text-gray-700'}`}>
                          {type}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {type === 'prospected' && 'Potential projects'}
                          {type === 'customer' && 'Client projects'}
                          {type === 'internal' && 'Internal projects'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Name (only for customer projects) */}
              {formData.projectType === 'customer' && (
                <div className="space-y-2">
                  <label className=" text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-gray-900 transition-all duration-200"
                    placeholder="e.g., Ricoh, Alliance Healthcare, FICOFI"
                    required={formData.projectType === 'customer'}
                  />
                </div>
              )}

              {/* Basic Info */}
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
              })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-gray-900" placeholder="e.g., Customer Portal Redesign" required />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea value={formData.description} onChange={e => setFormData({
                ...formData,
                description: e.target.value
              })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-gray-900 resize-none" rows={3} placeholder="Brief description of the project" required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select value={formData.status} onChange={e => setFormData({
                  ...formData,
                  status: e.target.value as Project['status']
                })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-gray-900">
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
                })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-gray-900">
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
                })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-gray-900" required />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      End Date (Optional)
                    </label>
                    <input type="date" value={formData.endDate} min={formData.startDate} onChange={e => setFormData({
                  ...formData,
                  endDate: e.target.value
                })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-gray-900" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Progress (%)
                  </label>
                  <input type="number" min="0" max="100" value={formData.progress} onChange={e => setFormData({
                ...formData,
                progress: parseInt(e.target.value) || 0
              })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-gray-900" />
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{
                  width: `${formData.progress}%`
                }} />
                  </div>
                </div>
              </div>

              {/* Team Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-600 rounded-lg"></div>
                  Select Teams *
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {backendTeams.map(team => {
                const isSelected = selectedTeamIds.includes(team.id);
                return <button key={team.id} type="button" onClick={() => toggleTeam(team.id)} className={`p-4 rounded-lg border-2 transition-all text-left ${isSelected ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2 bg-violet-100">
                          <Users className="w-5 h-5 text-violet-600" />
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">{team.name}</p>
                        {team.description && <p className="text-xs text-gray-500 mt-1">{team.description}</p>}
                      </button>;
              })}
                </div>
              </div>

              {/* Member Assignment */}
              {selectedTeamIds.length > 0 && <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-violet-600" />
                    Assign Team Members ({formData.assignedMembers?.length || 0} selected)
                  </h3>
                  <input
                    type="text"
                    placeholder="Search members by name or email..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent mb-3"
                  />
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-4 space-y-2">
                    {filteredUsers.length === 0 ? <p className="text-gray-500 text-sm">{memberSearch ? 'No members found matching search' : 'No members available from selected teams'}</p> : filteredUsers.map(user => {
                const isSelected = formData.assignedMembers?.includes(user.id.toString());
                const userTeam = backendTeams.find(t => t.id === user.teamId);
                return <label key={user.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                            <input type="checkbox" checked={isSelected} onChange={() => toggleMember(user.id.toString())} className="w-5 h-5 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">{user.firstName} {user.lastName}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            {userTeam && <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700">
                                {userTeam.name}
                              </span>}
                          </label>;
              })}
                  </div>
                </div>}
            </form>

            <div className="p-5 lg:p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 border border-gray-200 disabled:opacity-50">
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
        </motion.div>}
    </AnimatePresence>;
};

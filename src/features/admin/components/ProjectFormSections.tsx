import React from 'react';
import { Users, Building2, Briefcase } from 'lucide-react';
import type { BackendTeam, BackendUser } from '../../../lib/api';
import { projectTypeColors, type ProjectFormData, type ProjectType } from '../hooks/useProjectModalState';

/** The three-way project type picker: prospected / customer / internal. */
export const ProjectTypeSection: React.FC<{
  formData: ProjectFormData;
  setFormData: (data: ProjectFormData) => void;
}> = ({ formData, setFormData }) => (
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
);

/** Customer Name (only for customer projects). */
export const CustomerNameSection: React.FC<{
  formData: ProjectFormData;
  setFormData: (data: ProjectFormData) => void;
}> = ({ formData, setFormData }) => (
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
);

export const TeamSelectionSection: React.FC<{
  backendTeams: BackendTeam[];
  selectedTeamIds: number[];
  toggleTeam: (id: number) => void;
}> = ({ backendTeams, selectedTeamIds, toggleTeam }) => (
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
);

export const MemberAssignmentSection: React.FC<{
  formData: ProjectFormData;
  backendTeams: BackendTeam[];
  memberSearch: string;
  setMemberSearch: (query: string) => void;
  filteredUsers: BackendUser[];
  toggleMember: (id: string) => void;
}> = ({ formData, backendTeams, memberSearch, setMemberSearch, filteredUsers, toggleMember }) => (
  <div className="space-y-4">
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
  </div>
);

import React from 'react';
import { Download, UserCheck, UsersRound } from 'lucide-react';
import type { BackendTeam, BackendUser } from '../../../lib/api';

interface TeamMembersReportsSectionProps {
  backendTeams: BackendTeam[];
  backendUsers: BackendUser[];
  selectedTeam: string;
  isExportingMembers: boolean;
  onExportAllMembers: () => void;
  onExportTeamMembers: (teamId?: string) => void;
}

const getTeamMemberCount = (team: BackendTeam, backendUsers: BackendUser[]) => {
  if (backendUsers.length > 0) {
    return backendUsers.filter((user) => Number(user.teamId) === team.id).length;
  }

  if (team.users) return team.users.length;
  return team._count?.users ?? 0;
};

export const TeamMembersReportsSection: React.FC<TeamMembersReportsSectionProps> = ({
  backendTeams,
  backendUsers,
  selectedTeam,
  isExportingMembers,
  onExportAllMembers,
  onExportTeamMembers,
}) => (
  <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6 lg:p-8">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-sm">
            <UsersRound className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Team Members Reports</h3>
        </div>
        <p className="mt-2 text-sm text-gray-600">Export team member lists and information</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onExportAllMembers}
          disabled={isExportingMembers || backendUsers.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UsersRound className="w-5 h-5" />
          All Members Report
        </button>
        <button
          type="button"
          onClick={() => onExportTeamMembers(selectedTeam)}
          disabled={isExportingMembers || backendUsers.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-100 transition hover:bg-cyan-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserCheck className="w-5 h-5" />
          Selected Team Report
        </button>
      </div>
    </div>

    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {backendTeams.map((team) => {
        const memberCount = getTeamMemberCount(team, backendUsers);
        return (
          <button
            key={team.id}
            type="button"
            onClick={() => onExportTeamMembers(team.id.toString())}
            disabled={isExportingMembers}
            className="group flex min-h-28 items-start justify-between rounded-xl border border-gray-200 bg-gray-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-purple-200 hover:bg-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div>
              <UsersRound className="mb-4 h-6 w-6 text-gray-400 group-hover:text-purple-500" />
              <p className="font-bold text-gray-900">{team.name}</p>
              <p className="mt-1 text-sm text-gray-600">{memberCount} members</p>
            </div>
            <Download className="mt-1 h-4 w-4 text-gray-300 group-hover:text-purple-500" />
          </button>
        );
      })}
    </div>
  </section>
);

import React from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import type { BackendProject, BackendTeam } from '../../../lib/api';
import type { ReportPeriod } from '../hooks/useAnalyticsReport';

interface AnalyticsHeaderProps {
  period: ReportPeriod;
  selectedTeamId?: number;
  selectedProjectId?: number;
  backendTeams: BackendTeam[];
  backendProjects: BackendProject[];
  isLoading: boolean;
  onPeriodChange: (period: ReportPeriod) => void;
  onTeamChange: (teamId?: number) => void;
  onProjectChange: (projectId?: number) => void;
  onRefresh: () => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  period,
  selectedTeamId,
  selectedProjectId,
  backendTeams,
  backendProjects,
  isLoading,
  onPeriodChange,
  onTeamChange,
  onProjectChange,
  onRefresh,
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-5 lg:p-6">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-500 text-sm">Performance insights from the backend</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <div className="flex bg-gray-100 rounded-xl p-1 w-full sm:w-auto">
          {(['daily', 'weekly', 'monthly'] as ReportPeriod[]).map((entry) => (
            <button
              key={entry}
              onClick={() => onPeriodChange(entry)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                period === entry ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {entry.charAt(0).toUpperCase() + entry.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={selectedTeamId || ''}
          onChange={(event) => onTeamChange(event.target.value ? parseInt(event.target.value, 10) : undefined)}
          className="flex-1 sm:flex-none w-full sm:w-auto min-w-[130px] max-w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 truncate"
        >
          <option value="">All Teams</option>
          {backendTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        <select
          value={selectedProjectId || ''}
          onChange={(event) => onProjectChange(event.target.value ? parseInt(event.target.value, 10) : undefined)}
          className="flex-1 sm:flex-none w-full sm:w-auto min-w-[130px] max-w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 truncate"
        >
          <option value="">All Projects</option>
          {backendProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 disabled:opacity-50 ml-auto sm:ml-0"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  </div>
);

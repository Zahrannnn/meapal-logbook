import React from 'react';
import { Loader2 } from 'lucide-react';

interface AnalyticsTeamPerformanceProps {
  isLoading: boolean;
  teamPerformance: Array<{
    teamId: number;
    teamName: string;
    totalActivities: number;
    totalHours: number;
    completionRate: number;
    activeMembers: number;
    totalMembers: number;
  }>;
}

export const AnalyticsTeamPerformance: React.FC<AnalyticsTeamPerformanceProps> = ({
  isLoading,
  teamPerformance,
}) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-4">Team Performance</h3>
    {isLoading ? (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    ) : teamPerformance.length > 0 ? (
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {teamPerformance.map((team, index) => (
          <div key={team.teamId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{team.teamName}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{team.totalActivities} activities</span>
                <span>{team.totalHours.toFixed(1)}h</span>
                <span>{team.completionRate}% completed</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {team.activeMembers} / {team.totalMembers} active
              </p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="h-64 flex items-center justify-center text-gray-500">No team performance data available</div>
    )}
  </div>
);

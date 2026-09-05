import React from 'react';
import { Loader2, Users } from 'lucide-react';

interface AnalyticsTopPerformersProps {
  isLoading: boolean;
  topPerformers: Array<{
    userId: number;
    firstName: string;
    lastName: string;
    teamName: string;
    totalActivities: number;
    totalHours: number;
  }>;
}

export const AnalyticsTopPerformers: React.FC<AnalyticsTopPerformersProps> = ({
  isLoading,
  topPerformers,
}) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
      <Users className="w-5 h-5 text-purple-600" />
      Top Performers
    </h3>
    {isLoading ? (
      <div className="h-48 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    ) : topPerformers.length > 0 ? (
      <div className="space-y-3">
        {topPerformers.map((performer, index) => (
          <div key={performer.userId} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-500'
              }`}
            >
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">
                {performer.firstName} {performer.lastName}
              </p>
              <p className="text-xs text-gray-500">{performer.teamName}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-blue-600">{performer.totalActivities}</p>
              <p className="text-xs text-gray-500">{performer.totalHours.toFixed(1)}h</p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No performer data available</div>
    )}
  </div>
);

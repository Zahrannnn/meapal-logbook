import React from 'react';
import type { ActivityEntry, Project } from '../../../entities';

interface AnalyticsRecentActivitiesTableProps {
  activities: ActivityEntry[];
  projects: Project[];
}

const getStatusClassName = (status: ActivityEntry['status']) => {
  if (status === 'completed') return 'bg-green-100 text-green-700';
  if (status === 'pending-approval') return 'bg-yellow-100 text-yellow-700';
  if (status === 'blocked') return 'bg-red-100 text-red-700';
  return 'bg-blue-100 text-blue-700';
};

export const AnalyticsRecentActivitiesTable: React.FC<AnalyticsRecentActivitiesTableProps> = ({
  activities,
  projects,
}) => (
  <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
    <div className="p-5 border-b border-gray-100">
      <h3 className="text-lg font-bold text-gray-900">Recent Activities</h3>
    </div>

    <div className="overflow-x-auto max-h-80">
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Employee</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Activity</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Project</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Duration</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {activities.slice(0, 10).map((activity) => (
            <tr key={activity.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{activity.employeeName}</td>
              <td className="px-4 py-3 text-sm text-gray-900">
                <p className="font-semibold truncate max-w-xs">{activity.title}</p>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {projects.find((project) => project.id === activity.projectId)?.name || 'Unknown'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">{activity.duration.toFixed(1)}h</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClassName(activity.status)}`}>
                  {activity.status}
                </span>
              </td>
            </tr>
          ))}
          {activities.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                No activities found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

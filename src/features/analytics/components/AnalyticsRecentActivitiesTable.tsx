import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { ActivityEntry, Project } from '../../../entities';

interface AnalyticsRecentActivitiesTableProps {
  activities: ActivityEntry[];
  projects: Project[];
}

const statusVariant = (status: ActivityEntry['status']) => {
  if (status === 'completed') return 'success' as const;
  if (status === 'pending-approval') return 'warning' as const;
  if (status === 'blocked') return 'destructive' as const;
  return 'info' as const;
};

const statusLabel = (status: ActivityEntry['status']) => {
  if (status === 'pending-approval') return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
};

export const AnalyticsRecentActivitiesTable: React.FC<AnalyticsRecentActivitiesTableProps> = ({
  activities,
  projects,
}) => (
  <div className="overflow-hidden rounded-2xl border bg-card">
    <div className="border-b px-5 py-4">
      <h3 className="text-sm font-bold text-foreground">Recent activities</h3>
    </div>

    <div className="max-h-80 overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50 sticky top-0">
          <tr>
            {['Employee', 'Activity', 'Project', 'Duration', 'Status'].map((heading) => (
              <th
                key={heading}
                className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {activities.slice(0, 10).map((activity) => (
            <tr key={activity.id} className="transition-colors hover:bg-muted/40">
              <td className="px-4 py-3 text-sm font-semibold text-foreground">{activity.employeeName}</td>
              <td className="max-w-xs px-4 py-3 text-sm text-foreground">
                <p className="truncate font-medium">{activity.title}</p>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {projects.find((project) => project.id === activity.projectId)?.name || 'Unknown'}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-foreground tabular-nums">
                {activity.duration.toFixed(1)}h
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant(activity.status)}>{statusLabel(activity.status)}</Badge>
              </td>
            </tr>
          ))}
          {activities.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm font-medium text-muted-foreground">
                No activities found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

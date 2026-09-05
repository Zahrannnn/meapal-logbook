import React from 'react';
import { ClockIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { ActivityEntry, Project } from '../../../entities';

interface DashboardPendingApprovalsProps {
  activities: ActivityEntry[];
  projects: Project[];
}

export const DashboardPendingApprovals: React.FC<DashboardPendingApprovalsProps> = ({ activities, projects }) => {
  if (activities.length === 0) {
    return null;
  }

  return (
    <Alert variant="warning" className="rounded-2xl">
      <ClockIcon />
      <AlertTitle>
        Awaiting approval
        <Badge variant="warning" className="ml-2 tabular-nums">
          {activities.length}
        </Badge>
      </AlertTitle>
      <AlertDescription>
        <div className="w-full space-y-2">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between gap-3 bg-card/70 rounded-lg px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {projects.find((project) => project.id === activity.projectId)?.name || 'Unknown project'}
                </p>
              </div>
              <Badge variant="warning" className="whitespace-nowrap">
                Pending
              </Badge>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
};

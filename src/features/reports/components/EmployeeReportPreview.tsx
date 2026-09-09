import React from 'react';
import { DownloadIcon } from 'lucide-react';
import { calculateActualHours } from '../../../lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ActivityEntry, Project, User as UserType } from '../../../entities';
import type { BackendTeam, BackendUser } from '../../../lib/api';
import { statusBadgeVariant } from '../mappers/reports.mapper';

/** Per-employee grouping: recent entries, durations and status badges. */
export const EmployeePreview: React.FC<{
  activities: Record<string, ActivityEntry[]>;
  users: UserType[];
  backendUsers: BackendUser[];
  projects: Project[];
}> = ({ activities: byEmployee, users, backendUsers, projects }) => (
  <div className="divide-y divide-border">
    {Object.entries(byEmployee).map(([employeeId, employeeActivities]) => {
      const employee =
        users.find((entry) => entry.id === employeeId) ||
        backendUsers.find((entry) => entry.id.toString() === employeeId);
      const employeeName = employee
        ? 'name' in employee
          ? employee.name
          : `${employee.firstName} ${employee.lastName}`
        : employeeActivities[0]?.employeeName || 'Unknown';
      const totalHours = calculateActualHours(employeeActivities);

      return (
        <div key={employeeId} className="px-5 py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">
                {employeeName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
              </span>
              <div>
                <h4 className="text-sm font-bold text-foreground">{employeeName}</h4>
                <p className="text-xs font-medium text-muted-foreground tabular-nums">
                  {employeeActivities.length} {employeeActivities.length === 1 ? 'activity' : 'activities'}
                </p>
              </div>
            </div>
            <p className="text-lg font-extrabold text-foreground tabular-nums">{totalHours.toFixed(1)}h</p>
          </div>
          <ul className="divide-y divide-border/70 rounded-lg border border-border/70">
            {employeeActivities.slice(0, 10).map((activity) => {
              const project = projects.find((entry) => entry.id === activity.projectId);
              return (
                <li key={activity.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{activity.title}</p>
                    <p className="text-xs font-medium text-muted-foreground tabular-nums">
                      {activity.date} · {activity.startTime} – {activity.endTime}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs font-bold text-foreground tabular-nums">
                      {activity.duration.toFixed(1)}h
                    </span>
                    <Badge variant={statusBadgeVariant(activity.status)}>{activity.status}</Badge>
                  </div>
                </li>
              );
            })}
          </ul>
          {employeeActivities.length > 10 && (
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              + {employeeActivities.length - 10} more in the exported file
            </p>
          )}
        </div>
      );
    })}
  </div>
);

/* ── Roster: team member list exports (people, not activities) ─────────── */

export const RosterCard: React.FC<{
  backendTeams: BackendTeam[];
  backendUsers: BackendUser[];
  isExportingMembers: boolean;
  onExportAllMembers: () => void;
  onExportTeamMembers: (teamId?: string) => void;
}> = ({ backendTeams, backendUsers, isExportingMembers, onExportAllMembers, onExportTeamMembers }) => {
  const memberCount = (team: BackendTeam) => {
    if (backendUsers.length > 0) return backendUsers.filter((user) => Number(user.teamId) === team.id).length;
    if (team.users) return team.users.length;
    return team._count?.users ?? 0;
  };

  return (
    <section className="rounded-2xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Roster</h3>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            Team member lists — independent of the report filters above.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onExportAllMembers}
          disabled={isExportingMembers || backendUsers.length === 0}
        >
          <DownloadIcon data-icon="inline-start" />
          All members
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 px-5 py-4">
        {backendTeams.map((team) => (
          <Button
            key={team.id}
            size="sm"
            variant="outline"
            onClick={() => onExportTeamMembers(team.id.toString())}
            disabled={isExportingMembers || backendUsers.length === 0}
          >
            <DownloadIcon data-icon="inline-start" />
            {team.name} · {memberCount(team)}
          </Button>
        ))}
      </div>
    </section>
  );
};

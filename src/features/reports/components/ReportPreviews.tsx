import React from 'react';
import { DownloadIcon, Loader2Icon } from 'lucide-react';
import { calculateActualHours } from '../../../lib/utils';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { ActivityEntry, Project, User as UserType } from '../../../entities';
import type { BackendTeam, BackendUser } from '../../../lib/api';

const statusBadgeVariant = (status: ActivityEntry['status']) => {
  if (status === 'completed') return 'success' as const;
  if (status === 'pending-approval') return 'warning' as const;
  if (status === 'blocked') return 'destructive' as const;
  return 'info' as const;
};

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

export const ProjectPreview: React.FC<{ activities: Record<string, ActivityEntry[]>; projects: Project[] }> = ({
  activities: byProject,
  projects,
}) => (
  <ul className="divide-y divide-border">
    {Object.entries(byProject).map(([projectId, projectActivities]) => {
      const project = projects.find((entry) => entry.id === projectId);
      const totalHours = calculateActualHours(projectActivities);
      const completed = projectActivities.filter((activity) => activity.status === 'completed').length;
      const contributors = new Set(projectActivities.map((activity) => activity.employeeId)).size;

      return (
        <li key={projectId} className="flex items-center justify-between gap-3 px-1 py-3.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{project?.name || 'Unknown project'}</p>
            <p className="text-xs font-medium text-muted-foreground tabular-nums">
              {projectActivities.length} activities · {contributors}{' '}
              {contributors === 1 ? 'contributor' : 'contributors'}
            </p>
          </div>
          <p className="shrink-0 text-sm font-extrabold text-foreground tabular-nums">{totalHours.toFixed(1)}h</p>
        </li>
      );
    })}
  </ul>
);

export const TeamPreview: React.FC<{ activities: Record<string, ActivityEntry[]>; backendTeams: BackendTeam[] }> = ({
  activities: byTeam,
  backendTeams,
}) => (
  <ul className="divide-y divide-border">
    {Object.entries(byTeam).map(([teamId, teamActivities]) => {
      const team = backendTeams.find((entry) => entry.id.toString() === teamId);
      const totalHours = calculateActualHours(teamActivities);
      const employees = new Set(teamActivities.map((activity) => activity.employeeId)).size;
      const uniqueProjects = new Set(teamActivities.map((activity) => activity.projectId)).size;

      return (
        <li key={teamId} className="flex items-center justify-between gap-3 px-1 py-3.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{team?.name || teamId}</p>
            <p className="text-xs font-medium text-muted-foreground tabular-nums">
              {teamActivities.length} activities · {employees} employees · {uniqueProjects} projects
            </p>
          </div>
          <p className="shrink-0 text-sm font-extrabold text-foreground tabular-nums">{totalHours.toFixed(1)}h</p>
        </li>
      );
    })}
  </ul>
);

/* ── Follow-up preview: the French rapport de suivi table ──────────────── */

interface FollowUpRowLike {
  project: string;
  task: string;
  responsible: string;
  status: string;
  progress: number | null;
  chargesEnJ: number | null;
  dateDebut: string | null;
  deadline: string | null;
  dateDeFin: string | null;
  pointsBloquants: string | null;
  commentaires: string | null;
}

export const FollowUpPreview: React.FC<{
  rows: FollowUpRowLike[];
  isLoading: boolean;
  isExporting: boolean;
  onExport: () => void;
}> = ({ rows, isLoading, isExporting, onExport }) => {
  const statusClass = (status: string) => {
    if (status === 'Done') return 'bg-success/10 text-success';
    if (status === 'En cours') return 'bg-info/10 text-info';
    if (status === 'Bloqué') return 'bg-destructive/10 text-destructive';
    return 'bg-warning/10 text-warning';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2.5 px-5 py-4" aria-label="Loading follow-up report">
        {[0, 1, 2, 3].map((row) => (
          <Skeleton key={row} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex min-h-[8rem] flex-col items-center justify-center gap-1 py-8 text-center">
        <p className="text-sm font-semibold text-foreground">No follow-up data found</p>
        <p className="text-sm text-muted-foreground">Try adjusting the period or filters.</p>
      </div>
    );
  }

  const headers = ['Projet', 'Tâche', 'Responsable', 'Statut', 'Avancement', 'Charges (J)', 'Date Début', 'Deadline', 'Date de Fin', 'Points Bloquants', 'Commentaires'];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              {headers.map((header) => (
                <th key={header} className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, index) => {
              const statusClass =
                row.status === 'Done'
                  ? 'bg-success/10 text-success'
                  : row.status === 'En cours'
                    ? 'bg-info/10 text-info'
                    : row.status === 'Bloqué'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-warning/10 text-warning';
              return (
                <tr key={`${row.project}-${row.task}-${index}`} className="transition-colors hover:bg-muted/40">
                  <td className="px-3 py-2.5">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{row.project}</span>
                  </td>
                  <td className="max-w-xs truncate py-2.5 pr-3 text-foreground" title={row.task}>{row.task}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground">{row.responsible}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-bold', statusClass)}>{row.status}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{row.progress !== null && row.progress !== undefined ? `${row.progress}%` : '—'}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{row.chargesEnJ !== null && row.chargesEnJ !== undefined ? row.chargesEnJ.toFixed(1) : '—'}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">{row.dateDebut || '—'}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">{row.deadline || '—'}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">{row.dateDeFin || '—'}</td>
                  <td className="max-w-[12rem] truncate px-3 py-2.5 text-muted-foreground" title={row.pointsBloquants || ''}>{row.pointsBloquants || '—'}</td>
                  <td className="max-w-[12rem] truncate px-3 py-2.5 text-muted-foreground" title={row.commentaires || ''}>{row.commentaires || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2.5">
        <p className="text-xs font-medium text-muted-foreground tabular-nums">
          {rows.length} {rows.length === 1 ? 'row' : 'rows'}
        </p>
        <Button size="sm" variant="outline" onClick={onExport} disabled={isExporting}>
          {isExporting ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : <DownloadIcon data-icon="inline-start" />}
          Export follow-up CSV
        </Button>
      </div>
    </div>
  );
};

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

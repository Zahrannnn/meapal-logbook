import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon, DownloadIcon, FileSpreadsheetIcon, Loader2Icon } from 'lucide-react';
import type { BackendTeam, BackendUser } from '../../../lib/api';
import { calculateActualHours } from '../../../lib/utils';
import type { ActivityEntry, Project, User as UserType } from '../../../entities';
import { getDayName, getReportDateRange, getSelectedEmployeeName, groupActivitiesByEmployee, groupActivitiesByProject, groupActivitiesByTeam, type PeriodType, type ReportType } from '../mappers/reports.mapper';
import { useReportsState } from '../hooks/useReportsState';
import { ReportsSummaryStats } from './ReportsSummaryStats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ReportsPageProps {
  activities: ActivityEntry[];
  projects: Project[];
  users: UserType[];
  backendUsers: BackendUser[];
  backendTeams: BackendTeam[];
  currentUser: UserType;
  onFetchWithFilters: (filters: {
    startDate?: string;
    endDate?: string;
    teamId?: number;
    projectId?: number;
    userId?: number;
  }) => Promise<void>;
}

const REPORT_TYPES: Array<{ value: ReportType; label: string }> = [
  { value: 'employee', label: 'Employee activity' },
  { value: 'project', label: 'Project status' },
  { value: 'team', label: 'Team performance' },
  { value: 'payroll', label: 'Payroll (21st – 20th)' },
  { value: 'followup', label: 'Follow-up (Rapport de suivi)' },
  { value: 'members', label: 'Team members list' },
];

const PERIODS: Array<{ value: PeriodType; label: string }> = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'Last 7 days' },
  { value: 'monthly', label: 'This month' },
  { value: 'payroll', label: 'Payroll period (21st – 20th)' },
  { value: 'custom', label: 'Custom range' },
];

const fmtDay = (date: Date) => format(date, 'MMM d, yyyy');

const statusBadgeVariant = (status: ActivityEntry['status']) => {
  if (status === 'completed') return 'success' as const;
  if (status === 'pending-approval') return 'warning' as const;
  if (status === 'blocked') return 'destructive' as const;
  return 'info' as const;
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="flex min-w-0 flex-col gap-1.5">
    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    {children}
  </label>
);

export const ReportsPage: React.FC<ReportsPageProps> = (props) => {
  const reports = useReportsState(props);

  const { reportType, periodType, startDate, endDate, dateRange } = reports;

  // Payroll reports always ride the 21st → 20th preset.
  const handleReportTypeChange = (type: ReportType) => {
    reports.setReportType(type);
    if (type === 'payroll' && periodType !== 'payroll') reports.setPeriodType('payroll');
    if (type !== 'payroll' && periodType === 'payroll') reports.setPeriodType('monthly');
  };

  const teamName =
    reports.selectedTeam === 'all'
      ? 'All teams'
      : (props.backendTeams.find((team) => team.id.toString() === reports.selectedTeam)?.name ?? 'All teams');
  const projectName =
    reports.selectedProject === 'all'
      ? 'All projects'
      : (props.projects.find((project) => project.id === reports.selectedProject)?.name ?? 'All projects');
  const employeeName =
    reports.selectedEmployee === 'all'
      ? 'All employees'
      : getSelectedEmployeeName(reports.selectedEmployee, props.backendUsers).replace(/_/g, ' ');

  const scopeLine = `${fmtDay(dateRange.start)} → ${fmtDay(dateRange.end)} · ${teamName} · ${projectName} · ${employeeName}`;

  const canExport =
    reports.reportType === 'followup' ? reports.followUpRows.length > 0 : reports.filteredActivities.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Reports</h1>
        <p className="mt-0.5 text-sm font-medium text-muted-foreground">Build, preview and export activity reports</p>
      </header>

      {/* Report builder: one loop — scope, summary, preview, export */}
      <section className="flex flex-col overflow-hidden rounded-2xl border bg-card">
        {/* Controls */}
        <div className="grid grid-cols-2 gap-3 border-b border-border px-5 py-4 lg:grid-cols-6 lg:px-6">
          <Field label="Report type">
            <Select value={reportType} onValueChange={(value) => handleReportTypeChange(value as ReportType)}>
              <SelectTrigger aria-label="Report type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Period">
            <Select value={periodType} onValueChange={(value) => reports.setPeriodType(value as PeriodType)}>
              <SelectTrigger aria-label="Period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((entry) => (
                  <SelectItem key={entry.value} value={entry.value}>
                    {entry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {periodType === 'custom' && (
            <>
              <Field label="Start date">
                <input
                  type="date"
                  value={reports.startDate}
                  onChange={(event) => reports.setStartDate(event.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  aria-label="Start date"
                />
              </Field>
              <Field label="End date">
                <input
                  type="date"
                  value={reports.endDate}
                  onChange={(event) => reports.setEndDate(event.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  aria-label="End date"
                />
              </Field>
            </>
          )}

          <Field label="Team">
            <Select value={reports.selectedTeam} onValueChange={reports.setSelectedTeam}>
              <SelectTrigger aria-label="Team">
                <SelectValue placeholder="All teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All teams</SelectItem>
                {props.backendTeams.map((team) => (
                  <SelectItem key={team.id} value={String(team.id)}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Project">
            <Select value={reports.selectedProject} onValueChange={reports.setSelectedProject}>
              <SelectTrigger aria-label="Project">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                {props.projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Employee">
            <Select value={reports.selectedEmployee} onValueChange={reports.setSelectedEmployee}>
              <SelectTrigger aria-label="Employee">
                <SelectValue placeholder="All employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All employees</SelectItem>
                {props.backendUsers.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Scope line: what the numbers below cover */}
          <div className="col-span-full flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <CalendarIcon className="size-3.5 opacity-70" aria-hidden="true" />
            <span className="truncate">{scopeLine}</span>
          </div>
        </div>

        {/* Summary strip */}
        <div className="border-b border-border px-5 py-4 lg:px-6">
          <ReportsSummaryStats summaryStats={reports.summaryStats} />
        </div>

        {/* Preview */}
        <div className="min-h-[12rem]">
          {reports.reportType === 'followup' ? (
            <FollowUpPreview
              rows={reports.followUpRows}
              isLoading={reports.isLoadingFollowUp}
              onExport={() => void reports.exportFollowUpCsv()}
              isExporting={reports.isExporting}
            />
          ) : reports.filteredActivities.length === 0 ? (
            <div className="flex min-h-[10rem] flex-col items-center justify-center gap-1 py-10 text-center">
              <FileSpreadsheetIcon className="size-10 text-muted-foreground/30" aria-hidden="true" />
              <p className="text-sm font-semibold text-foreground">Nothing matches this scope</p>
              <p className="text-sm text-muted-foreground">Adjust the period, team, project or employee filters.</p>
            </div>
          ) : reportType === 'employee' || reportType === 'payroll' ? (
            <EmployeePreview activities={reports.activitiesByEmployee} users={props.users} backendUsers={props.backendUsers} projects={props.projects} />
          ) : reportType === 'project' ? (
            <ProjectPreview activities={reports.activitiesByProject} projects={props.projects} />
          ) : (
            <TeamPreview activities={reports.activitiesByTeam} backendTeams={props.backendTeams} />
          )}
        </div>

        {/* Exports live next to the results they export */}
        <div className="flex flex-wrap items-center gap-2 border-t bg-muted/50 px-5 py-3.5">
          {reportType === 'followup' ? (
            <Button size="sm" variant="outline" onClick={() => void reports.exportFollowUpCsv()} disabled={!canExport || reports.isExporting}>
              <FileSpreadsheetIcon data-icon="inline-start" />
              Export follow-up CSV
            </Button>
          ) : (
            <>
              <Button size="sm" onClick={() => void reports.exportToExcel()} disabled={!canExport || reports.isExporting}>
                <DownloadIcon data-icon="inline-start" />
                Export CSV
              </Button>
              <Button size="sm" variant="outline" onClick={() => void reports.exportDetailedXLSX()} disabled={!canExport || reports.isExporting}>
                <FileSpreadsheetIcon data-icon="inline-start" />
                Detailed XLSX
              </Button>
            </>
          )}
          {!canExport && (
            <span className="text-xs font-medium text-muted-foreground">Nothing to export for this scope yet.</span>
          )}
        </div>
      </section>

      {/* Roster: a different data domain — people, not activities */}
      <RosterCard
        backendTeams={props.backendTeams}
        backendUsers={props.backendUsers}
        selectedTeam={reports.selectedTeam}
        isExportingMembers={reports.isExportingMembers}
        onExportAllMembers={reports.exportAllMembersReport}
        onExportTeamMembers={reports.exportTeamMembersReport}
      />
    </div>
  );
};

/* ── Previews ──────────────────────────────────────────────────────────── */

type ReportsPagePropsForPreview = {
  users: UserType[];
  backendUsers: BackendUser[];
  projects: Project[];
};

const EmployeePreview: React.FC<{
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

const ProjectPreview: React.FC<{ activities: Record<string, ActivityEntry[]>; projects: Project[] }> = ({
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

const TeamPreview: React.FC<{ activities: Record<string, ActivityEntry[]>; backendTeams: BackendTeam[] }> = ({
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

const FollowUpRowShape = null;

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

const FollowUpPreview: React.FC<{
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

const RosterCard: React.FC<{
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

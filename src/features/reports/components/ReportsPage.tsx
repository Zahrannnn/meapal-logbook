import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon, DownloadIcon, FileSpreadsheetIcon, Loader2Icon } from 'lucide-react';
import type { BackendTeam, BackendUser } from '../../../lib/api';
import { calculateActualHours } from '../../../lib/utils';
import type { ActivityEntry, Project, User as UserType } from '../../../entities';
import { getDayName, getReportDateRange, getSelectedEmployeeName, groupActivitiesByEmployee, groupActivitiesByProject, groupActivitiesByTeam, type PeriodType, type ReportType } from '../mappers/reports.mapper';
import { useReportsState } from '../hooks/useReportsState';
import { ReportsSummaryStats } from './ReportsSummaryStats';
import {
  EmployeePreview,
  FollowUpPreview,
  ProjectPreview,
  RosterCard,
  TeamPreview,
} from './ReportPreviews';
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
                <SelectItem value="all">All projects</SelectItem>
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
            <Button size="sm" variant="outline" onClick={() => void reports.exportFollowUpCsv()} disabled={!canExport || reports.isExporting || reports.isExportingFollowUp}>
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
        isExportingMembers={reports.isExportingMembers}
        onExportAllMembers={reports.exportAllMembersReport}
        onExportTeamMembers={reports.exportTeamMembersReport}
      />
    </div>
  );
};

/* ── Previews ──────────────────────────────────────────────────────────── */


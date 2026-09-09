import React from 'react';
import { CalendarIcon } from 'lucide-react';
import type { BackendTeam, BackendUser } from '../../../lib/api';
import type { Project } from '../../../entities';
import type { PeriodType, ReportType } from '../mappers/reports.mapper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="flex min-w-0 flex-col gap-1.5">
    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    {children}
  </label>
);

const dateInputClassName =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

/** The builder's scope row: report type, period (with custom dates), team,
 *  project, employee — plus the one-line summary of what the numbers cover. */
export const ReportScopeControls: React.FC<{
  reportType: ReportType;
  periodType: PeriodType;
  startDate: string;
  endDate: string;
  selectedTeam: string;
  selectedProject: string;
  selectedEmployee: string;
  backendTeams: BackendTeam[];
  projects: Project[];
  backendUsers: BackendUser[];
  scopeLine: string;
  onReportTypeChange: (type: ReportType) => void;
  onPeriodChange: (period: PeriodType) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onTeamChange: (team: string) => void;
  onProjectChange: (project: string) => void;
  onEmployeeChange: (employee: string) => void;
}> = ({
  reportType,
  periodType,
  startDate,
  endDate,
  selectedTeam,
  selectedProject,
  selectedEmployee,
  backendTeams,
  projects,
  backendUsers,
  scopeLine,
  onReportTypeChange,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
  onTeamChange,
  onProjectChange,
  onEmployeeChange,
}) => (
  <div className="grid grid-cols-2 gap-3 border-b border-border px-5 py-4 lg:grid-cols-6 lg:px-6">
    <Field label="Report type">
      <Select value={reportType} onValueChange={(value) => onReportTypeChange(value as ReportType)}>
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
      <Select value={periodType} onValueChange={(value) => onPeriodChange(value as PeriodType)}>
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
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            className={dateInputClassName}
            aria-label="Start date"
          />
        </Field>
        <Field label="End date">
          <input
            type="date"
            value={endDate}
            onChange={(event) => onEndDateChange(event.target.value)}
            className={dateInputClassName}
            aria-label="End date"
          />
        </Field>
      </>
    )}

    <Field label="Team">
      <Select value={selectedTeam} onValueChange={onTeamChange}>
        <SelectTrigger aria-label="Team">
          <SelectValue placeholder="All teams" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All teams</SelectItem>
          {backendTeams.map((team) => (
            <SelectItem key={team.id} value={String(team.id)}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>

    <Field label="Project">
      <Select value={selectedProject} onValueChange={onProjectChange}>
        <SelectTrigger aria-label="Project">
          <SelectValue placeholder="All projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All projects</SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>

    <Field label="Employee">
      <Select value={selectedEmployee} onValueChange={onEmployeeChange}>
        <SelectTrigger aria-label="Employee">
          <SelectValue placeholder="All employees" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All employees</SelectItem>
          {backendUsers.map((user) => (
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
);

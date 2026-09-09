import React from 'react';
import { format } from 'date-fns';
import { DownloadIcon, FileSpreadsheetIcon, Loader2Icon } from 'lucide-react';
import type { BackendTeam, BackendUser } from '../../../lib/api';
import type { ActivityEntry, Project, User as UserType } from '../../../entities';
import { getReportDateRange, getSelectedEmployeeName, type PeriodType, type ReportType } from '../mappers/reports.mapper';
import { useReportsState } from '../hooks/useReportsState';
import { ReportsSummaryStats } from './ReportsSummaryStats';
import { ReportScopeControls } from './ReportScopeControls';
import { EmployeePreview, RosterCard } from './EmployeeReportPreview';
import { FollowUpPreview } from './FollowUpReportPreview';
import { ProjectPreview, TeamPreview } from './GroupReportPreviews';
import { Button } from '@/components/ui/button';

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

const fmtDay = (date: Date) => format(date, 'MMM d, yyyy');

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
        <ReportScopeControls
          reportType={reportType}
          periodType={periodType}
          startDate={reports.startDate}
          endDate={reports.endDate}
          selectedTeam={reports.selectedTeam}
          selectedProject={reports.selectedProject}
          selectedEmployee={reports.selectedEmployee}
          backendTeams={props.backendTeams}
          projects={props.projects}
          backendUsers={props.backendUsers}
          scopeLine={scopeLine}
          onReportTypeChange={handleReportTypeChange}
          onPeriodChange={reports.setPeriodType}
          onStartDateChange={reports.setStartDate}
          onEndDateChange={reports.setEndDate}
          onTeamChange={reports.setSelectedTeam}
          onProjectChange={reports.setSelectedProject}
          onEmployeeChange={reports.setSelectedEmployee}
        />

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
              isExporting={reports.isExporting || reports.isExportingFollowUp}
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

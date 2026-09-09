import { useEffect, useMemo, useState } from 'react';
import { toast } from '@/lib/toast';
import type { BackendTeam, BackendUser } from '../../../lib/api';
import type { ActivityEntry, Project, User } from '../../../entities';
import {
  getReportDateRange,
  getSelectedEmployeeName,
  groupActivitiesByEmployee,
  groupActivitiesByProject,
  groupActivitiesByTeam,
  summarizeFilteredActivities,
  type PeriodType,
  type ReportType,
} from '../mappers/reports.mapper';
import { reportsService } from '../services/reports.service';
import {
  buildAllMembersCsv,
  buildDetailedReportCsv,
  buildEmployeeActivityCsv,
  buildTeamMembersCsv,
} from '../utils/report-exporters';
import { useFollowUpReport } from './useFollowUpReport';
import { toErrorMessage } from '../utils/errors';

interface UseReportsStateOptions {
  activities: ActivityEntry[];
  projects: Project[];
  users: User[];
  backendUsers: BackendUser[];
  backendTeams: BackendTeam[];
  onFetchWithFilters: (filters: {
    startDate?: string;
    endDate?: string;
    teamId?: number;
    projectId?: number;
    userId?: number;
  }) => Promise<void>;
}

export const useReportsState = ({
  activities,
  projects,
  users,
  backendUsers,
  backendTeams,
  onFetchWithFilters,
}: UseReportsStateOptions) => {
  const [reportType, setReportType] = useState<ReportType>('employee');
  const [periodType, setPeriodType] = useState<PeriodType>('monthly');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 21);
    return start.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth(), 20);
    return end.toISOString().split('T')[0];
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingMembers, setIsExportingMembers] = useState(false);

  const filteredActivities = useMemo(() => {
    const { start, end } = getReportDateRange(periodType, startDate, endDate);
    // Normalize to start/end of day to avoid time-component mismatches
    const rangeStart = new Date(start);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(end);
    rangeEnd.setHours(23, 59, 59, 999);
    return activities.filter((activity) => {
      const activityDate = new Date(activity.date);
      const inDateRange = activityDate >= rangeStart && activityDate <= rangeEnd;
      const matchesTeam = selectedTeam === 'all' || activity.team === selectedTeam;
      const matchesProject = selectedProject === 'all' || activity.projectId === selectedProject;
      const matchesEmployee = selectedEmployee === 'all' || activity.employeeId === selectedEmployee;
      return inDateRange && matchesTeam && matchesProject && matchesEmployee;
    });
  }, [activities, periodType, startDate, endDate, selectedTeam, selectedProject, selectedEmployee]);

  const activitiesByEmployee = useMemo(() => groupActivitiesByEmployee(filteredActivities), [filteredActivities]);
  const activitiesByProject = useMemo(() => groupActivitiesByProject(filteredActivities), [filteredActivities]);
  const activitiesByTeam = useMemo(() => groupActivitiesByTeam(filteredActivities), [filteredActivities]);
  const summaryStats = useMemo(() => summarizeFilteredActivities(filteredActivities), [filteredActivities]);
  const dateRange = useMemo(() => getReportDateRange(periodType, startDate, endDate), [periodType, startDate, endDate]);

  // Fetch activities from API with current filters whenever they change
  useEffect(() => {
    const { start, end } = dateRange;
    const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    void onFetchWithFilters({
      startDate: formatDate(start),
      endDate: formatDate(end),
      teamId: selectedTeam !== 'all' ? Number(selectedTeam) : undefined,
      projectId: selectedProject !== 'all' ? Number(selectedProject) : undefined,
      userId: selectedEmployee !== 'all' ? Number(selectedEmployee) : undefined,
    });
  }, [dateRange, selectedTeam, selectedProject, selectedEmployee, onFetchWithFilters]);

  const exportAllMembersReport = async () => {
    setIsExportingMembers(true);
    try {
      const csvContent = buildAllMembersCsv(backendUsers, backendTeams);
      reportsService.downloadCsvFile(`All_Team_Members_Report_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
    } catch (error: unknown) {
      console.error('Export failed:', error);
      toast.error(toErrorMessage(error, 'Failed to export report. Please try again.'));
    } finally {
      setIsExportingMembers(false);
    }
  };

  const exportTeamMembersReport = async (teamId?: string) => {
    setIsExportingMembers(true);
    try {
      const targetTeamId = teamId || selectedTeam;
      const team = backendTeams.find((entry) => entry.id.toString() === targetTeamId);
      const teamName = team?.name || 'All Teams';
      const teamMembers = targetTeamId === 'all' ? backendUsers : backendUsers.filter((user) => user.teamId.toString() === targetTeamId);
      const csvContent = buildTeamMembersCsv(teamName, teamMembers, activities);
      reportsService.downloadCsvFile(`${teamName.replace(/[^a-zA-Z0-9]/g, '_')}_Members_Report_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
    } catch (error: unknown) {
      console.error('Export failed:', error);
      toast.error(toErrorMessage(error, 'Failed to export report. Please try again.'));
    } finally {
      setIsExportingMembers(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const { start, end } = getReportDateRange(periodType, startDate, endDate);
      const dateRangeStr = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      const employeeName = getSelectedEmployeeName(selectedEmployee, backendUsers);
      const csvContent =
        reportType === 'employee' || reportType === 'payroll'
          ? buildEmployeeActivityCsv(employeeName, dateRangeStr, filteredActivities, projects)
          : '';
      reportsService.downloadCsvFile(`${employeeName}_${reportType}_report_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.csv`, csvContent);
    } catch (error: unknown) {
      console.error('Export failed:', error);
      toast.error(toErrorMessage(error, 'Failed to export report. Please try again.'));
    } finally {
      setIsExporting(false);
    }
  };

  const exportDetailedXLSX = async () => {
    setIsExporting(true);
    try {
      const { start, end } = getReportDateRange(periodType, startDate, endDate);
      const employeeName = getSelectedEmployeeName(selectedEmployee, backendUsers);
      const csvContent = buildDetailedReportCsv(employeeName, start, end, activitiesByEmployee, users, backendUsers, projects);
      reportsService.downloadCsvFile(`${employeeName}_detailed_report_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.csv`, csvContent);
    } catch (error: unknown) {
      console.error('Export failed:', error);
      toast.error(toErrorMessage(error, 'Failed to export report.'));
    } finally {
      setIsExporting(false);
    }
  };

  const { followUpRows, isLoadingFollowUp, isExportingFollowUp, exportFollowUpCsv } = useFollowUpReport({
    reportType,
    periodType,
    startDate,
    endDate,
    selectedProject,
    selectedTeam,
    selectedEmployee,
  });

  return { reportType, setReportType, periodType, setPeriodType, selectedTeam, setSelectedTeam, selectedProject, setSelectedProject, selectedEmployee, setSelectedEmployee, startDate, setStartDate, endDate, setEndDate, isExporting, isExportingMembers, filteredActivities, activitiesByEmployee, activitiesByProject, activitiesByTeam, summaryStats, dateRange, exportAllMembersReport, exportTeamMembersReport, exportToExcel, exportDetailedXLSX, followUpRows, isLoadingFollowUp, isExportingFollowUp, exportFollowUpCsv };
};

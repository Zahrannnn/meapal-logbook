/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import type { BackendTeam, BackendUser } from '../../../lib/api';
import { calculateActualHours } from '../../../lib/utils';
import type { ActivityEntry, Project, User } from '../../../entities';
import {
  getDayName,
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
import { reportsApi } from '../../../lib/api/reports.client';
import type { FollowUpRow } from '../../../lib/api/types';

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
  const [followUpRows, setFollowUpRows] = useState<FollowUpRow[]>([]);
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);

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
      let csvContent = '\uFEFF';
      csvContent += 'MEAPAL LOGBOOK - ALL TEAM MEMBERS REPORT\n';
      csvContent += `Generated: ${new Date().toLocaleString()}\n`;
      csvContent += `Total Members: ${backendUsers.length}\n\n`;
      csvContent += 'No,Name,Email,Username,Role,Team,Title,Hire Date\n';
      const sortedUsers = [...backendUsers].sort((left, right) => {
        const teamCompare = (left.team?.name || '').localeCompare(right.team?.name || '');
        if (teamCompare !== 0) return teamCompare;
        return `${left.firstName} ${left.lastName}`.localeCompare(`${right.firstName} ${right.lastName}`);
      });
      sortedUsers.forEach((user, index) => {
        const hireDate = user.hireDate ? new Date(user.hireDate).toLocaleDateString() : 'N/A';
        csvContent += [index + 1, `"${user.firstName} ${user.lastName}"`, user.email, user.username, user.role, `"${user.team?.name || 'Unassigned'}"`, `"${user.title || 'N/A'}"`, hireDate].join(',');
        csvContent += '\n';
      });
      csvContent += '\n\nTEAM SUMMARY\nTeam,Members Count\n';
      backendTeams.forEach((team) => {
        csvContent += `"${team.name}",${backendUsers.filter((user) => user.teamId === team.id).length}\n`;
      });
      reportsService.downloadCsvFile(`All_Team_Members_Report_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(error.message || 'Failed to export report. Please try again.');
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
      let csvContent = '\uFEFF';
      csvContent += 'MEAPAL LOGBOOK - TEAM MEMBERS REPORT\n';
      csvContent += `Team: ${teamName}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n`;
      csvContent += `Total Members: ${teamMembers.length}\n\n`;
      csvContent += 'No,Name,Email,Username,Role,Title,Hire Date,Total Activities,Total Hours\n';
      [...teamMembers]
        .sort((left, right) => `${left.firstName} ${left.lastName}`.localeCompare(`${right.firstName} ${right.lastName}`))
        .forEach((user, index) => {
          const hireDate = user.hireDate ? new Date(user.hireDate).toLocaleDateString() : 'N/A';
          const userActivities = activities.filter((activity) => activity.employeeId === user.id.toString());
          csvContent += [index + 1, `"${user.firstName} ${user.lastName}"`, user.email, user.username, user.role, `"${user.title || 'N/A'}"`, hireDate, userActivities.length, calculateActualHours(userActivities).toFixed(1)].join(',');
          csvContent += '\n';
        });
      reportsService.downloadCsvFile(`${teamName.replace(/[^a-zA-Z0-9]/g, '_')}_Members_Report_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(error.message || 'Failed to export report. Please try again.');
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
      let csvContent = '\uFEFF';
      if (reportType === 'employee' || reportType === 'payroll') {
        csvContent += `MEAPAL LOGBOOK - ACTIVITY REPORT\nEmployee: ${employeeName.replace(/_/g, ' ')}\nReport Period: ${dateRangeStr}\nGenerated: ${new Date().toLocaleString()}\n\n`;
        csvContent += 'Day,Date,Role,Activity Type,Project/Task,Description,Start Time,End Time,Duration (hours),Status\n';
        [...filteredActivities].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()).forEach((activity) => {
          const project = projects.find((entry) => entry.id === activity.projectId);
          csvContent += [getDayName(activity.date), activity.date, 'Developer', activity.competencies?.[0] || 'General', project?.name || 'Unknown', `"${activity.title.replace(/"/g, '""')}"`, activity.startTime, activity.endTime, activity.duration.toFixed(1), activity.status].join(',');
          csvContent += '\n';
        });
      }
      reportsService.downloadCsvFile(`${employeeName}_${reportType}_report_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.csv`, csvContent);
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(error.message || 'Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportDetailedXLSX = async () => {
    setIsExporting(true);
    try {
      const { start, end } = getReportDateRange(periodType, startDate, endDate);
      const employeeName = getSelectedEmployeeName(selectedEmployee, backendUsers);
      const formatCsvValue = (value: string | number | undefined | null) => {
        const text = value === undefined || value === null || value === '' ? 'N/A' : String(value);
        return `"${text.replace(/"/g, '""')}"`;
      };

      let csvContent = '\uFEFF';
      csvContent += `MEAPAL LOGBOOK - DETAILED ACTIVITY REPORT\nEmployee: ${employeeName.replace(/_/g, ' ')}\nReport Period: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}\nGenerated: ${new Date().toLocaleString()}\n\n`;
      Object.entries(activitiesByEmployee).forEach(([employeeId, employeeActivities]) => {
        const employee = users.find((entry) => entry.id === employeeId) || backendUsers.find((entry) => entry.id.toString() === employeeId);
        const employeeNameValue = employee ? ('name' in employee ? employee.name : `${employee.firstName} ${employee.lastName}`) : employeeActivities[0]?.employeeName || 'Unknown';
        const sortedActivities = [...employeeActivities].sort((left, right) => {
          const dateCompare = new Date(left.date).getTime() - new Date(right.date).getTime();
          if (dateCompare !== 0) return dateCompare;
          return left.startTime.localeCompare(right.startTime);
        });
        const totalHours = calculateActualHours(sortedActivities);

        csvContent += `\n========== ${employeeNameValue.toUpperCase()} ==========\n\n`;
        csvContent += `Total Activities,${sortedActivities.length}\n`;
        csvContent += `Total Hours,${totalHours.toFixed(1)}\n\n`;
        csvContent += 'Day,Date,Project,Activity,Description,Start Time,End Time,Duration (hours),Status\n';

        sortedActivities.forEach((activity) => {
          const project = projects.find((entry) => entry.id === activity.projectId);
          csvContent += [
            formatCsvValue(getDayName(activity.date)),
            formatCsvValue(activity.date),
            formatCsvValue(project?.name || activity.project?.name || 'Unknown'),
            formatCsvValue(activity.title),
            formatCsvValue(activity.description || activity.notes),
            formatCsvValue(activity.startTime),
            formatCsvValue(activity.endTime),
            activity.duration.toFixed(1),
            formatCsvValue(activity.status),
          ].join(',');
          csvContent += '\n';
        });

        csvContent += '\n';
      });
      reportsService.downloadCsvFile(`${employeeName}_detailed_report_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.csv`, csvContent);
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(error.message || 'Failed to export report.');
    } finally {
      setIsExporting(false);
    }
  };

  const fetchFollowUpData = useCallback(async () => {
    if (reportType !== 'followup') return;
    setIsLoadingFollowUp(true);
    try {
      const { start, end } = getReportDateRange(periodType, startDate, endDate);
      const fmtDate = (d: Date) => d.toISOString().split('T')[0];
      const params: { startDate: string; endDate: string; projectId?: string; teamId?: string; userId?: string } = {
        startDate: fmtDate(start),
        endDate: fmtDate(end),
      };
      if (selectedProject !== 'all') params.projectId = selectedProject;
      if (selectedTeam !== 'all') params.teamId = selectedTeam;
      if (selectedEmployee !== 'all') params.userId = selectedEmployee;
      const rows = await reportsApi.getFollowup(params);
      setFollowUpRows(rows);
    } catch (error: any) {
      console.error('Follow-up fetch failed:', error);
      toast.error(error.message || 'Failed to load follow-up data.');
      setFollowUpRows([]);
    } finally {
      setIsLoadingFollowUp(false);
    }
  }, [reportType, periodType, startDate, endDate, selectedProject, selectedTeam, selectedEmployee]);

  useEffect(() => {
    if (reportType === 'followup') {
      fetchFollowUpData();
    }
  }, [reportType, fetchFollowUpData, startDate, endDate]);

  const exportFollowUpCsv = async () => {
    if (followUpRows.length === 0) {
      toast('No data to export. Adjust filters and try again.', { icon: 'ℹ️' });
      return;
    }
    setIsExporting(true);
    try {
      const formatVal = (value: string | number | null | undefined): string => {
        if (value === null || value === undefined) return '';
        const text = String(value);
        if (text.includes(',') || text.includes('"') || text.includes('\n') || text.includes('\r')) {
          return `"${text.replace(/"/g, '""')}"`;
        }
        return text;
      };

      const headers = ['Projet','Tâche','Responsable','Statut','Avancement (%)','Charges en J','Date Début','Deadline','Date de Fin','Points Bloquants','Commentaires'];
      let csv = '\uFEFF';
      csv += headers.join(',') + '\r\n';
      for (const row of followUpRows) {
        csv += [
          formatVal(row.project),
          formatVal(row.task),
          formatVal(row.responsible),
          formatVal(row.status),
          row.progress !== null && row.progress !== undefined ? String(row.progress) : '',
          row.chargesEnJ !== null && row.chargesEnJ !== undefined ? String(row.chargesEnJ) : '',
          formatVal(row.dateDebut),
          formatVal(row.deadline),
          formatVal(row.dateDeFin),
          formatVal(row.pointsBloquants),
          formatVal(row.commentaires),
        ].join(',') + '\r\n';
      }
      const { start, end } = getReportDateRange(periodType, startDate, endDate);
      const fmtDate = (d: Date) => d.toISOString().split('T')[0];
      reportsService.downloadCsvFile(`Rapport_Suivi_${fmtDate(start)}_to_${fmtDate(end)}.csv`, csv);
      toast.success(`Follow-up report exported (${followUpRows.length} rows)`);
    } catch (error: any) {
      console.error('Follow-up export failed:', error);
      toast.error(error.message || 'Failed to export follow-up report.');
    } finally {
      setIsExporting(false);
    }
  };

  return { reportType, setReportType, periodType, setPeriodType, selectedTeam, setSelectedTeam, selectedProject, setSelectedProject, selectedEmployee, setSelectedEmployee, startDate, setStartDate, endDate, setEndDate, isExporting, isExportingMembers, filteredActivities, activitiesByEmployee, activitiesByProject, activitiesByTeam, summaryStats, dateRange, exportAllMembersReport, exportTeamMembersReport, exportToExcel, exportDetailedXLSX, followUpRows, isLoadingFollowUp, exportFollowUpCsv };
};

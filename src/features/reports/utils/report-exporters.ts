import { csvField } from './csv';
import { calculateActualHours } from '../../../lib/utils';
import type { ActivityEntry, Project, User as UserType } from '../../../entities';
import type { BackendTeam, BackendUser } from '../../../lib/api';
import type { FollowUpRow } from '../../../lib/api/types';
import { getDayName } from '../mappers/reports.mapper';

/** "All Team Members" roster + per-team counts. */
export const buildAllMembersCsv = (backendUsers: BackendUser[], backendTeams: BackendTeam[]): string => {
  let csvContent = '';
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
  return csvContent;
};

/** Per-member roster for one team (or everyone when teamName is "All Teams"). */
export const buildTeamMembersCsv = (
  teamName: string,
  teamMembers: BackendUser[],
  activities: ActivityEntry[],
): string => {
  let csvContent = '';
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
  return csvContent;
};

/** The employee/payroll activity listing. */
export const buildEmployeeActivityCsv = (
  employeeName: string,
  dateRangeStr: string,
  activities: ActivityEntry[],
  projects: Project[],
): string => {
  let csvContent = '';
  csvContent += `MEAPAL LOGBOOK - ACTIVITY REPORT\nEmployee: ${employeeName.replace(/_/g, ' ')}\nReport Period: ${dateRangeStr}\nGenerated: ${new Date().toLocaleString()}\n\n`;
  csvContent += 'Day,Date,Role,Activity Type,Project/Task,Description,Start Time,End Time,Duration (hours),Status\n';
  [...activities]
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
    .forEach((activity) => {
      const project = projects.find((entry) => entry.id === activity.projectId);
      csvContent += [getDayName(activity.date), activity.date, 'Developer', activity.competencies?.[0] || 'General', project?.name || 'Unknown', `"${activity.title.replace(/"/g, '""')}"`, activity.startTime, activity.endTime, activity.duration.toFixed(1), activity.status].join(',');
      csvContent += '\n';
    });
  return csvContent;
};

/** Detailed per-employee breakdown with totals, grouped by header banners. */
export const buildDetailedReportCsv = (
  employeeName: string,
  start: Date,
  end: Date,
  activitiesByEmployee: Record<string, ActivityEntry[]>,
  users: UserType[],
  backendUsers: BackendUser[],
  projects: Project[],
): string => {
  let csvContent = '';
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
        csvField(getDayName(activity.date)),
        csvField(activity.date),
        csvField(project?.name || activity.project?.name || 'Unknown'),
        csvField(activity.title),
        csvField(activity.description || activity.notes),
        csvField(activity.startTime),
        csvField(activity.endTime),
        activity.duration.toFixed(1),
        csvField(activity.status),
      ].join(',');
      csvContent += '\n';
    });

    csvContent += '\n';
  });
  return csvContent;
};

const FOLLOW_UP_HEADERS = ['Projet','Tâche','Responsable','Statut','Avancement (%)','Charges en J','Date Début','Deadline','Date de Fin','Points Bloquants','Commentaires'];

/** The French rapport de suivi rows. */
export const buildFollowUpCsv = (followUpRows: FollowUpRow[]): string => {
  const orEmpty = (value: number | null | undefined) => (value !== null && value !== undefined ? String(value) : '');
  let csv = '';
  csv += FOLLOW_UP_HEADERS.join(',') + '\r\n';
  for (const row of followUpRows) {
    csv += [
      csvField(row.project),
      csvField(row.task),
      csvField(row.responsible),
      csvField(row.status),
      orEmpty(row.progress),
      orEmpty(row.chargesEnJ),
      csvField(row.dateDebut),
      csvField(row.deadline),
      csvField(row.dateDeFin),
      csvField(row.pointsBloquants),
      csvField(row.commentaires),
    ].join(',') + '\r\n';
  }
  return csv;
};

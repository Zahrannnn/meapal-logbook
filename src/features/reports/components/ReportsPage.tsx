import React from 'react';
import { Building2, ClipboardList, FileSpreadsheet, FolderKanban, Loader2, User } from 'lucide-react';
import type { BackendTeam, BackendUser } from '../../../lib/api';
import { calculateActualHours } from '../../../lib/utils';
import { teams } from '../../../entities';
import type { ActivityEntry, Project, User as UserType } from '../../../entities';
import { getDayName } from '../mappers/reports.mapper';
import { useReportsState } from '../hooks/useReportsState';
import { ReportsHeader } from './ReportsHeader';
import { ReportsFiltersSection } from './ReportsFiltersSection';
import { ReportsSummaryStats } from './ReportsSummaryStats';
import { TeamMembersReportsSection } from './TeamMembersReportsSection';
import { FollowUpReportSection } from './FollowUpReportSection';

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

export const ReportsPage: React.FC<ReportsPageProps> = ({
  activities,
  projects,
  users,
  backendUsers,
  backendTeams,
  onFetchWithFilters,
}) => {
  const reports = useReportsState({ activities, projects, users, backendUsers, backendTeams, onFetchWithFilters });

  return (
    <div className="space-y-6 lg:space-y-8">
      <ReportsHeader
        canExport={reports.reportType === 'followup' ? reports.followUpRows.length > 0 : reports.filteredActivities.length > 0}
        isExporting={reports.isExporting}
        onExportCsv={reports.reportType === 'followup' ? reports.exportFollowUpCsv : reports.exportToExcel}
        onExportDetailed={reports.exportDetailedXLSX}
        hideDetailedExport={reports.reportType === 'followup'}
      />
      <ReportsFiltersSection
        reportType={reports.reportType}
        periodType={reports.periodType}
        selectedTeam={reports.selectedTeam}
        selectedProject={reports.selectedProject}
        selectedEmployee={reports.selectedEmployee}
        startDate={reports.startDate}
        endDate={reports.endDate}
        backendTeams={backendTeams}
        backendUsers={backendUsers}
        projects={projects}
        rangeStart={reports.dateRange.start}
        rangeEnd={reports.dateRange.end}
        onReportTypeChange={reports.setReportType}
        onPeriodTypeChange={reports.setPeriodType}
        onTeamChange={reports.setSelectedTeam}
        onProjectChange={reports.setSelectedProject}
        onEmployeeChange={reports.setSelectedEmployee}
        onStartDateChange={reports.setStartDate}
        onEndDateChange={reports.setEndDate}
      />
      <TeamMembersReportsSection
        backendTeams={backendTeams}
        backendUsers={backendUsers}
        selectedTeam={reports.selectedTeam}
        isExportingMembers={reports.isExportingMembers}
        onExportAllMembers={reports.exportAllMembersReport}
        onExportTeamMembers={reports.exportTeamMembersReport}
      />
      <FollowUpReportSection
        backendTeams={backendTeams}
        backendUsers={backendUsers}
        projects={projects}
      />
      <ReportsSummaryStats summaryStats={reports.summaryStats} />

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {reports.reportType === 'employee' && 'Employee Activity Report'}
            {reports.reportType === 'project' && 'Project Status Report'}
            {reports.reportType === 'team' && 'Team Performance Report'}
            {reports.reportType === 'payroll' && 'Payroll Period Report (21st - 20th)'}
            {reports.reportType === 'members' && 'Team Members List'}
            {reports.reportType === 'followup' && 'Follow-Up Report (Rapport de Suivi)'}
          </h3>
        </div>
        {reports.reportType === 'followup' ? (
          reports.isLoadingFollowUp ? (
            <div className="p-12 text-center">
              <Loader2 className="w-10 h-10 text-teal-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500 font-semibold">Loading follow-up data…</p>
            </div>
          ) : reports.followUpRows.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold">No follow-up data found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your date range or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-700">Projet</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-700">Tâche</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-700">Responsable</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-700">Statut</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-gray-700">Avancement</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-gray-700">Charges (J)</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-700">Date Début</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-700">Deadline</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-700">Date de Fin</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-700">Points Bloquants</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-700">Commentaires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.followUpRows.map((row, idx) => {
                    const statusStyle = row.status === 'Done' ? 'bg-green-100 text-green-700'
                      : row.status === 'En cours' ? 'bg-blue-100 text-blue-700'
                      : row.status === 'Bloqué' ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700';
                    return (
                      <tr key={`${row.project}-${row.task}-${idx}`} className="hover:bg-gray-50">
                        <td className="px-3 py-2"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{row.project}</span></td>
                        <td className="px-3 py-2 text-gray-700 max-w-xs truncate" title={row.task}>{row.task}</td>
                        <td className="px-3 py-2 text-gray-900 font-medium">{row.responsible}</td>
                        <td className="px-3 py-2 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${statusStyle}`}>{row.status}</span></td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">{row.progress !== null && row.progress !== undefined ? `${row.progress}%` : '—'}</td>
                        <td className="px-3 py-2 text-right text-gray-700">{row.chargesEnJ !== null && row.chargesEnJ !== undefined ? row.chargesEnJ.toFixed(1) : '—'}</td>
                        <td className="px-3 py-2 text-gray-600">{row.dateDebut || '—'}</td>
                        <td className="px-3 py-2 text-gray-600">{row.deadline || '—'}</td>
                        <td className="px-3 py-2 text-gray-600">{row.dateDeFin || '—'}</td>
                        <td className="px-3 py-2 text-gray-600 max-w-xs truncate" title={row.pointsBloquants || ''}>{row.pointsBloquants || '—'}</td>
                        <td className="px-3 py-2 text-gray-600 max-w-xs truncate" title={row.commentaires || ''}>{row.commentaires || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="p-3 border-t border-gray-100 bg-gray-50 text-sm text-gray-600 font-medium">
                {reports.followUpRows.length} row{reports.followUpRows.length !== 1 ? 's' : ''} found
              </div>
            </div>
          )
        ) : reports.filteredActivities.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">No activities found for the selected filters</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your date range or filters</p>
          </div>
        ) : reports.reportType === 'employee' || reports.reportType === 'payroll' ? (
          <div className="divide-y divide-gray-100">
            {Object.entries(reports.activitiesByEmployee).map(([employeeId, employeeActivities]) => {
              const employee = users.find((entry) => entry.id === employeeId) || backendUsers.find((entry) => entry.id.toString() === employeeId);
              const employeeName = employee ? ('name' in employee ? employee.name : `${employee.firstName} ${employee.lastName}`) : employeeActivities[0]?.employeeName || 'Unknown';
              const totalHours = calculateActualHours(employeeActivities);
              return (
                <div key={employeeId} className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{employeeName}</h4>
                        <p className="text-sm text-gray-600">{employeeActivities.length} activities</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">{totalHours.toFixed(1)}h</p>
                      <p className="text-xs text-gray-500">Total Hours</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Day</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Date</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Project</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Activity</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Time</th>
                          <th className="px-3 py-2 text-right font-semibold text-gray-700">Hours</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {employeeActivities.slice(0, 10).map((activity) => {
                          const project = projects.find((entry) => entry.id === activity.projectId);
                          return (
                            <tr key={activity.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-600 font-medium">{getDayName(activity.date)}</td>
                              <td className="px-3 py-2 text-gray-900">{activity.date}</td>
                              <td className="px-3 py-2"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{project?.name || 'Unknown'}</span></td>
                              <td className="px-3 py-2 text-gray-700 max-w-xs truncate">{activity.title}</td>
                              <td className="px-3 py-2 text-gray-600">{activity.startTime} - {activity.endTime}</td>
                              <td className="px-3 py-2 text-right font-medium text-gray-900">{activity.duration.toFixed(1)}</td>
                              <td className="px-3 py-2 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${activity.status === 'completed' ? 'bg-green-100 text-green-700' : activity.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{activity.status}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {employeeActivities.length > 10 && (
                      <div className="py-3 text-center text-sm font-medium text-gray-500">
                        + {employeeActivities.length - 10} more activities (export to see all)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : reports.reportType === 'project' ? (
          <div className="divide-y divide-gray-100">
            {Object.entries(reports.activitiesByProject).map(([projectId, projectActivities]) => {
              const project = projects.find((entry) => entry.id === projectId);
              const totalHours = calculateActualHours(projectActivities);
              const completed = projectActivities.filter((activity) => activity.status === 'completed').length;
              return (
                <div key={projectId} className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <FolderKanban className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{project?.name || 'Unknown Project'}</h4>
                        <p className="text-sm text-gray-600">{projectActivities.length} activities • {new Set(projectActivities.map((activity) => activity.employeeId)).size} contributors</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">{totalHours.toFixed(1)}h</p>
                      <p className="text-xs text-gray-500">{Math.round((completed / projectActivities.length) * 100)}% completed</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {Object.entries(reports.activitiesByTeam).map(([teamId, teamActivities]) => {
              const team = teams.find((entry) => entry.id === teamId) || backendTeams.find((entry) => entry.id.toString() === teamId);
              const totalHours = calculateActualHours(teamActivities);
              const uniqueEmployees = new Set(teamActivities.map((activity) => activity.employeeId)).size;
              const uniqueProjects = new Set(teamActivities.map((activity) => activity.projectId)).size;
              return (
                <div key={teamId} className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{team?.name || teamId}</h4>
                        <p className="text-sm text-gray-600">{uniqueEmployees} employees • {uniqueProjects} projects</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{totalHours.toFixed(1)}h</p>
                      <p className="text-xs text-gray-500">{(totalHours / uniqueEmployees).toFixed(1)}h avg/employee</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { Calendar, Filter } from 'lucide-react';
import type { BackendTeam, BackendUser } from '../../../lib/api';
import type { Project } from '../../../entities';
import type { PeriodType, ReportType } from '../mappers/reports.mapper';

interface ReportsFiltersSectionProps {
  reportType: ReportType;
  periodType: PeriodType;
  selectedTeam: string;
  selectedProject: string;
  selectedEmployee: string;
  startDate: string;
  endDate: string;
  backendTeams: BackendTeam[];
  backendUsers: BackendUser[];
  projects: Project[];
  rangeStart: Date;
  rangeEnd: Date;
  onReportTypeChange: (value: ReportType) => void;
  onPeriodTypeChange: (value: PeriodType) => void;
  onTeamChange: (value: string) => void;
  onProjectChange: (value: string) => void;
  onEmployeeChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export const ReportsFiltersSection: React.FC<ReportsFiltersSectionProps> = (props) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
      <Filter className="w-5 h-5 text-indigo-600" />
      Report Filters
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Report Type</label>
        <select value={props.reportType} onChange={(event) => props.onReportTypeChange(event.target.value as ReportType)} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none">
          <option value="employee">Employee Report</option>
          <option value="project">Project Report</option>
          <option value="team">Team Report</option>
          <option value="payroll">Payroll Period (21-20)</option>
          <option value="members">Team Members List</option>
          <option value="followup">Follow-Up Report</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Period</label>
        <select value={props.periodType} onChange={(event) => props.onPeriodTypeChange(event.target.value as PeriodType)} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none">
          <option value="daily">Today</option>
          <option value="weekly">Last 7 Days</option>
          <option value="monthly">This Month</option>
          <option value="payroll">Payroll Period (21-20)</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Team</label>
        <select value={props.selectedTeam} onChange={(event) => props.onTeamChange(event.target.value)} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none">
          <option value="all">All Teams</option>
          {props.backendTeams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Project</label>
        <select value={props.selectedProject} onChange={(event) => props.onProjectChange(event.target.value)} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none">
          <option value="all">All Projects</option>
          {props.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Employee</label>
        <select value={props.selectedEmployee} onChange={(event) => props.onEmployeeChange(event.target.value)} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none">
          <option value="all">All Employees</option>
          {props.backendUsers.map((user) => <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>)}
        </select>
      </div>
      {props.periodType === 'custom' && <>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
          <input type="date" value={props.startDate} onChange={(event) => props.onStartDateChange(event.target.value)} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
          <input type="date" value={props.endDate} onChange={(event) => props.onEndDateChange(event.target.value)} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none" />
        </div>
      </>}
    </div>
    <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
      <p className="text-sm text-indigo-800">
        <Calendar className="w-4 h-4 inline mr-2" />
        <strong>Report Period:</strong> {props.rangeStart.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} {' -> '} {props.rangeEnd.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
      </p>
    </div>
  </div>
);

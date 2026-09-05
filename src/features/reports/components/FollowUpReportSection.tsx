import React, { useState } from 'react';
import { Calendar, ClipboardList, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { BackendTeam, BackendUser } from '../../../lib/api';
import type { Project } from '../../../entities';
import { reportsApi } from '../../../lib/api/reports.client';
import { reportsService } from '../services/reports.service';
import type { FollowUpRow } from '../../../lib/api/types';

interface FollowUpReportSectionProps {
  backendTeams: BackendTeam[];
  backendUsers: BackendUser[];
  projects: Project[];
}

const formatCsvValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n') || text.includes('\r')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const buildCsvContent = (rows: FollowUpRow[]): string => {
  const BOM = '\uFEFF';
  const headers = [
    'Projet',
    'Tâche',
    'Responsable',
    'Statut',
    'Avancement (%)',
    'Charges en J',
    'Date Début',
    'Deadline',
    'Date de Fin',
    'Points Bloquants',
    'Commentaires',
  ];

  let csv = BOM;
  csv += headers.join(',') + '\r\n';

  for (const row of rows) {
    csv +=
      [
        formatCsvValue(row.project),
        formatCsvValue(row.task),
        formatCsvValue(row.responsible),
        formatCsvValue(row.status),
        row.progress !== null && row.progress !== undefined ? String(row.progress) : '',
        row.chargesEnJ !== null && row.chargesEnJ !== undefined ? String(row.chargesEnJ) : '',
        formatCsvValue(row.dateDebut),
        formatCsvValue(row.deadline),
        formatCsvValue(row.dateDeFin),
        formatCsvValue(row.pointsBloquants),
        formatCsvValue(row.commentaires),
      ].join(',') + '\r\n';
  }

  return csv;
};

export const FollowUpReportSection: React.FC<FollowUpReportSectionProps> = ({
  backendTeams,
  backendUsers,
  projects,
}) => {
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates.');
      return;
    }

    setIsExporting(true);
    try {
      const params: { startDate: string; endDate: string; projectId?: string; teamId?: string; userId?: string } = {
        startDate,
        endDate,
      };
      if (selectedProject !== 'all') params.projectId = selectedProject;
      if (selectedTeam !== 'all') params.teamId = selectedTeam;
      if (selectedEmployee !== 'all') params.userId = selectedEmployee;

      const rows = await reportsApi.getFollowup(params);

      if (rows.length === 0) {
        toast('No data found for the selected filters.', { icon: 'ℹ️' });
        return;
      }

      const csvContent = buildCsvContent(rows);
      const filename = `Rapport_Suivi_${startDate}_to_${endDate}.csv`;
      reportsService.downloadCsvFile(filename, csvContent);
      toast.success(`Follow-up report exported (${rows.length} rows)`);
    } catch (error: unknown) {
      console.error('Follow-up export failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to export follow-up report.';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6 lg:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Follow-Up Report</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Export the project follow-up table (rapport de suivi) as CSV
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting || !startDate || !endDate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-200 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Project</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
          >
            <option value="all">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Team</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
          >
            <option value="all">All Teams</option>
            {backendTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Employee</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
          >
            <option value="all">All Employees</option>
            {backendUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
};

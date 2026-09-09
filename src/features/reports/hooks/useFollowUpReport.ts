import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/lib/toast';
import { getReportDateRange, type PeriodType, type ReportType } from '../mappers/reports.mapper';
import { reportsService } from '../services/reports.service';
import { reportsApi } from '../../../lib/api/reports.client';
import type { FollowUpRow } from '../../../lib/api/types';
import { buildFollowUpCsv } from '../utils/report-exporters';
import { toErrorMessage } from '../utils/errors';

const fmtDate = (d: Date) => d.toISOString().split('T')[0];

/** The follow-up report type: its rows come from a dedicated endpoint and export
 *  as the French rapport de suivi. */
export const useFollowUpReport = ({
  reportType,
  periodType,
  startDate,
  endDate,
  selectedProject,
  selectedTeam,
  selectedEmployee,
}: {
  reportType: ReportType;
  periodType: PeriodType;
  startDate: string;
  endDate: string;
  selectedProject: string;
  selectedTeam: string;
  selectedEmployee: string;
}) => {
  const [followUpRows, setFollowUpRows] = useState<FollowUpRow[]>([]);
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchFollowUpData = useCallback(async () => {
    if (reportType !== 'followup') return;
    setIsLoadingFollowUp(true);
    try {
      const { start, end } = getReportDateRange(periodType, startDate, endDate);
      const params: { startDate: string; endDate: string; projectId?: string; teamId?: string; userId?: string } = {
        startDate: fmtDate(start),
        endDate: fmtDate(end),
      };
      if (selectedProject !== 'all') params.projectId = selectedProject;
      if (selectedTeam !== 'all') params.teamId = selectedTeam;
      if (selectedEmployee !== 'all') params.userId = selectedEmployee;
      const rows = await reportsApi.getFollowup(params);
      setFollowUpRows(rows);
    } catch (error: unknown) {
      console.error('Follow-up fetch failed:', error);
      toast.error(toErrorMessage(error, 'Failed to load follow-up data.'));
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
      const csv = buildFollowUpCsv(followUpRows);
      const { start, end } = getReportDateRange(periodType, startDate, endDate);
      reportsService.downloadCsvFile(`Rapport_Suivi_${fmtDate(start)}_to_${fmtDate(end)}.csv`, csv);
      toast.success(`Follow-up report exported (${followUpRows.length} rows)`);
    } catch (error: unknown) {
      console.error('Follow-up export failed:', error);
      toast.error(toErrorMessage(error, 'Failed to export follow-up report.'));
    } finally {
      setIsExporting(false);
    }
  };

  return { followUpRows, isLoadingFollowUp, isExportingFollowUp: isExporting, exportFollowUpCsv };
};

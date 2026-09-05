import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ActivityEntry } from '../../../entities';
import type { OverallReport } from '../../../lib/api';
import {
  mapCompetencyDistribution,
  mapRadarData,
  mapSummaryStats,
  mapTeamPerformance,
  mapTopPerformers,
  mapWeeklyTrendData,
} from '../mappers/analytics.mapper';
import { analyticsService } from '../services/analytics.service';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

interface UseAnalyticsReportOptions {
  activities: ActivityEntry[];
  selectedDate: Date;
}

export const useAnalyticsReport = ({ activities, selectedDate }: UseAnalyticsReportOptions) => {
  const [period, setPeriod] = useState<ReportPeriod>('weekly');
  const [report, setReport] = useState<OverallReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>(undefined);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getOverallReport({
        period,
        date: selectedDate.toISOString().split('T')[0],
        teamId: selectedTeamId,
        projectId: selectedProjectId,
      });
      setReport(data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
      setError('Failed to load report data. Using local data instead.');
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  }, [period, selectedDate, selectedTeamId, selectedProjectId]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  const weeklyTrendData = useMemo(() => mapWeeklyTrendData(report, activities, selectedDate), [report, activities, selectedDate]);
  const competencyDistribution = useMemo(() => mapCompetencyDistribution(report, activities), [report, activities]);
  const radarData = useMemo(() => mapRadarData(report, activities), [report, activities]);
  const summaryStats = useMemo(() => mapSummaryStats(report, activities), [report, activities]);
  const teamPerformance = useMemo(() => mapTeamPerformance(report), [report]);
  const topPerformers = useMemo(() => mapTopPerformers(report), [report]);

  return {
    period,
    setPeriod,
    report,
    isLoading,
    error,
    selectedTeamId,
    setSelectedTeamId,
    selectedProjectId,
    setSelectedProjectId,
    fetchReport,
    weeklyTrendData,
    competencyDistribution,
    radarData,
    summaryStats,
    teamPerformance,
    topPerformers,
  };
};

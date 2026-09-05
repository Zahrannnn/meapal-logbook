import React from 'react';
import { ActivityEntry, Project } from '../../../entities';
import type { BackendProject, BackendTeam } from '../../../lib/api';
import { useAnalyticsReport } from '../hooks/useAnalyticsReport';
import { AnalyticsHeader } from './AnalyticsHeader';
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';
import { AnalyticsProductivityChart } from './AnalyticsProductivityChart';
import { AnalyticsCompetencyDistribution } from './AnalyticsCompetencyDistribution';
import { AnalyticsRadarSection } from './AnalyticsRadarSection';
import { AnalyticsTeamPerformance } from './AnalyticsTeamPerformance';
import { AnalyticsTopPerformers } from './AnalyticsTopPerformers';
import { AnalyticsRecentActivitiesTable } from './AnalyticsRecentActivitiesTable';

interface AnalyticsPageProps {
  activities: ActivityEntry[];
  projects: Project[];
  backendTeams: BackendTeam[];
  backendProjects: BackendProject[];
  selectedDate: Date;
  currentUserId?: number;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  activities,
  projects,
  backendTeams,
  backendProjects,
  selectedDate,
}) => {
  const {
    period,
    setPeriod,
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
  } = useAnalyticsReport({
    activities,
    selectedDate,
  });

  return (
    <div className="space-y-6 lg:space-y-8">
      <AnalyticsHeader
        period={period}
        selectedTeamId={selectedTeamId}
        selectedProjectId={selectedProjectId}
        backendTeams={backendTeams}
        backendProjects={backendProjects}
        isLoading={isLoading}
        onPeriodChange={setPeriod}
        onTeamChange={setSelectedTeamId}
        onProjectChange={setSelectedProjectId}
        onRefresh={() => void fetchReport()}
      />

      {error && <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm">{error}</div>}

      <AnalyticsSummaryCards summaryStats={summaryStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsProductivityChart isLoading={isLoading} weeklyTrendData={weeklyTrendData} />
        <AnalyticsCompetencyDistribution isLoading={isLoading} competencyDistribution={competencyDistribution} />
        <AnalyticsRadarSection isLoading={isLoading} radarData={radarData} />
        <AnalyticsTeamPerformance isLoading={isLoading} teamPerformance={teamPerformance} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsTopPerformers isLoading={isLoading} topPerformers={topPerformers} />
        <AnalyticsRecentActivitiesTable activities={activities} projects={projects} />
      </div>
    </div>
  );
};

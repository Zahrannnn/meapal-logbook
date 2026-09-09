import React from 'react';
import { format, endOfWeek, startOfWeek } from 'date-fns';
import { ActivityEntry, Project } from '../../../entities';
import type { BackendProject, BackendTeam } from '../../../lib/api';
import { useAnalyticsReport } from '../hooks/useAnalyticsReport';
import { AnalyticsHeader } from './AnalyticsHeader';
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';
import { AnalyticsProductivityChart } from './AnalyticsProductivityChart';
import { AnalyticsCompetencyDistribution } from './AnalyticsCompetencyDistribution';
import { AnalyticsRankings } from './AnalyticsRankings';
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

  // Every number on this page is scoped to the selected period — say so.
  const scopeLabel =
    period === 'daily'
      ? format(selectedDate, 'EEE, MMM d, yyyy')
      : period === 'weekly'
        ? `${format(startOfWeek(selectedDate), 'MMM d')} – ${format(endOfWeek(selectedDate), 'MMM d')}`
        : format(selectedDate, 'MMMM yyyy');

  // The table obeys the same project/team filters as the rest of the page.
  const filteredActivities = React.useMemo(
    () =>
      selectedProjectId
        ? activities.filter((activity) => activity.projectId === String(selectedProjectId))
        : activities,
    [activities, selectedProjectId],
  );

  return (
    <div className="flex flex-col gap-6">
      <AnalyticsHeader
        period={period}
        scopeLabel={scopeLabel}
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

      {error && (
        <div role="alert" className="rounded-xl border border-warning/30 bg-warning/10 p-3.5 text-sm font-semibold text-warning">
          {error}
        </div>
      )}

      <AnalyticsSummaryCards summaryStats={summaryStats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AnalyticsProductivityChart isLoading={isLoading} weeklyTrendData={weeklyTrendData} />
        <AnalyticsCompetencyDistribution isLoading={isLoading} competencyDistribution={competencyDistribution} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnalyticsRankings
          isLoading={isLoading}
          teamPerformance={teamPerformance}
          topPerformers={topPerformers}
        />
        <AnalyticsRecentActivitiesTable activities={filteredActivities} projects={projects} />
      </div>    </div>
  );
};

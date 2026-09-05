import { useEffect, useMemo, useState } from 'react';
import type { BackendActivity, BackendProject, BackendTeam, BackendUser } from '../../../lib/api';
import { activitiesApi } from '../../../lib/api';
import { calculateActualHours } from '../../../lib/utils';

interface UseProjectDetailDataParams {
  project: BackendProject | null;
  users: BackendUser[];
  teams: BackendTeam[];
}

export const useProjectDetailData = ({
  project,
  users,
  teams,
}: UseProjectDetailDataParams) => {
  const [projectActivities, setProjectActivities] = useState<BackendActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  useEffect(() => {
    if (!project) {
      setProjectActivities([]);
      return;
    }

    let cancelled = false;
    setIsLoadingActivities(true);

    activitiesApi.getByProject(project.id).then((activities) => {
      if (!cancelled) {
        setProjectActivities(activities);
        setIsLoadingActivities(false);
      }
    }).catch((err) => {
      console.error('Failed to fetch project activities:', err);
      if (!cancelled) {
        setProjectActivities([]);
        setIsLoadingActivities(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [project]);

  return useMemo(() => {
    if (!project) {
      return {
        projectActivities: [] as BackendActivity[],
        completedActivities: [] as BackendActivity[],
        inProgressActivities: [] as BackendActivity[],
        totalHours: 0,
        activeUsers: [] as BackendUser[],
        isLoadingActivities: false,
        formatDate: (dateStr: string) => dateStr,
        getTeamColor: () => '#6B7280',
        status: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Planned' },
        priority: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Medium' },
        projectType: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Internal' },
        teamsById: new Map<number, BackendTeam>(),
      };
    }

    const completedActivities = projectActivities.filter((activity) => activity.status === 'completed');
    const inProgressActivities = projectActivities.filter((activity) => activity.status === 'in_progress');
    const totalHours = calculateActualHours(projectActivities);
    const activeUserIds = [...new Set(projectActivities.map((activity) => activity.userId))];
    const activeUsers = users.filter((user) => activeUserIds.includes(user.id));

    const formatDate = (dateStr: string) =>
      new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

    const getTeamColor = (teamName: string) => {
      const colors: Record<string, string> = {
        'Data Science': '#8B5CF6',
        'Application Development': '#3B82F6',
        'Backend Engineering': '#10B981',
        'DevOps': '#F59E0B',
        'UI/UX Design': '#EC4899',
        'Embedded Systems': '#6366F1',
      };
      return colors[teamName] || '#6B7280';
    };

    const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
      planned: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Planned' },
      active: { color: 'text-green-600', bg: 'bg-green-100', label: 'Active' },
      on_hold: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'On Hold' },
      completed: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Completed' },
      cancelled: { color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' },
    };

    const priorityConfig: Record<string, { color: string; bg: string; label: string }> = {
      low: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Low' },
      medium: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Medium' },
      high: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'High' },
      critical: { color: 'text-red-600', bg: 'bg-red-100', label: 'Critical' },
    };

    const projectTypeConfig: Record<string, { color: string; bg: string; label: string }> = {
      prospected: { color: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Prospected' },
      customer: { color: 'text-green-700', bg: 'bg-green-100', label: 'Customer' },
      internal: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Internal' },
    };

    return {
      projectActivities,
      completedActivities,
      inProgressActivities,
      totalHours,
      activeUsers,
      isLoadingActivities,
      formatDate,
      getTeamColor,
      status: statusConfig[project.status] || statusConfig.planned,
      priority: priorityConfig[project.priority] || priorityConfig.medium,
      projectType: projectTypeConfig[project.projectType || 'internal'] || projectTypeConfig.internal,
      teamsById: new Map(teams.map((team) => [team.id, team])),
    };
  }, [isLoadingActivities, project, projectActivities, teams, users]);
};

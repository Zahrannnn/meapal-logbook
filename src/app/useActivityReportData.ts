import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActivityEntry, Project, User } from '../entities';
import {
  activitiesApi,
  competenciesApi,
  projectsApi,
  teamsApi,
  usersApi,
  type BackendActivity,
  type BackendCompetency,
  type BackendProject,
  type BackendTeam,
  type BackendUser,
} from '../lib/api';
import { convertBackendActivity } from '../features/activity';
import { recurringActivitiesService } from '../features/recurring-activities';
import { convertBackendProject, convertBackendUserToFrontend, teamIdToType } from './appMappers';
import { getPayPeriod, getStreakDays } from '../lib/payPeriod';
import type { ViewMode } from './useActivityReportUiState';

interface UseActivityReportDataParams {
  currentUser: User | null;
  viewMode: ViewMode;
  selectedDate: Date;
}

type LoadedViewsState = Partial<Record<ViewMode, boolean>>;

const backendEntryDate = (startTime: string): string => new Date(startTime).toISOString().split('T')[0];

const toDayStr = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const useActivityReportData = ({ currentUser, viewMode, selectedDate }: UseActivityReportDataParams) => {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [backendUsers, setBackendUsers] = useState<BackendUser[]>([]);
  const [backendTeams, setBackendTeams] = useState<BackendTeam[]>([]);
  const [backendProjects, setBackendProjects] = useState<BackendProject[]>([]);
  const [backendCompetencies, setBackendCompetencies] = useState<BackendCompetency[]>([]);
  const [backendActivities, setBackendActivities] = useState<BackendActivity[]>([]);
  const [recurringActivities, setRecurringActivities] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Scoped to date-window refreshes: the dashboard stays mounted while this is true.
  const [isActivitiesRefreshing, setIsActivitiesRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedViews, setLoadedViews] = useState<LoadedViewsState>({});
  const loadedViewsRef = useRef(loadedViews);
  loadedViewsRef.current = loadedViews;
  // The dashboard always loads one full pay period: the one containing the selected date
  // (the calendar is the context controller). `loadedPeriodKey` says which period is in
  // state, so switching periods refetches and staying inside one is instant.
  const [loadedPeriodKey, setLoadedPeriodKey] = useState<string | null>(null);
  const loadedPeriodKeyRef = useRef<string | null>(null);
  // Streak over ALL history: one year-scoped fetch of the user's own entries, recomputed
  // after every save/delete (see refreshStreak). Independent of the loaded period.
  const [streakDays, setStreakDays] = useState(0);
  const [isStreakLoading, setIsStreakLoading] = useState(true);
  const isInitialMount = useRef(true);

  const mapActivities = useCallback(
    (items: BackendActivity[]) =>
      items.map((activity) =>
        convertBackendActivity(activity, {
          resolveTeamType: (teamId) => teamIdToType[teamId] || 'app-dev',
        }),
      ),
    [],
  );

  const fetchPeriodActivities = useCallback(
    async (date: Date, setSilent: boolean) => {
      if (!currentUser) return;

      const isManager = currentUser.role === 'manager' || currentUser.role === 'admin';

      // Always load the full pay period containing the requested date: the period card
      // needs it and in-period navigation becomes instant.
      const period = getPayPeriod(date);
      const periodKey = `${currentUser.id}:${period.startStr}`;

      if (loadedPeriodKeyRef.current === periodKey) {
        return; // this period is already in state
      }

      if (setSilent) setIsActivitiesRefreshing(true);

      try {
        const activitiesData = await (isManager
          ? activitiesApi.getAll({ limit: 5000, startDate: period.startStr, endDate: period.endStr }).then((res) => res.activities)
          : activitiesApi.getAll({ limit: 5000, userId: Number(currentUser.id), startDate: period.startStr, endDate: period.endStr }).then((res) => res.activities));

        setBackendActivities(activitiesData);
        setActivities(mapActivities(activitiesData));
        loadedPeriodKeyRef.current = periodKey;
        setLoadedPeriodKey(periodKey);
      } catch (err) {
        console.error('Failed to refresh activities for date:', err);
      } finally {
        if (setSilent) setIsActivitiesRefreshing(false);
      }
    },
    [currentUser, mapActivities],
  );

  const fetchDashboardData = useCallback(async () => {
    if (!currentUser) return;

    const isManager = currentUser.role === 'manager' || currentUser.role === 'admin';

    // Load the full pay period containing the selected date.
    const period = getPayPeriod(selectedDate);

    const [activitiesData, projectsRes] = await Promise.all([
      isManager
        ? activitiesApi.getAll({ limit: 5000, startDate: period.startStr, endDate: period.endStr }).then((res) => res.activities)
        : activitiesApi.getAll({ limit: 5000, userId: Number(currentUser.id), startDate: period.startStr, endDate: period.endStr }).then((res) => res.activities),
      projectsApi.getAll({ limit: 100 }),
    ]);

    setBackendActivities(activitiesData);
    setActivities(mapActivities(activitiesData));
    setBackendProjects(projectsRes.projects);
    setProjects(projectsRes.projects.map(convertBackendProject));
    loadedPeriodKeyRef.current = `${currentUser.id}:${period.startStr}`;
    setLoadedPeriodKey(loadedPeriodKeyRef.current);
  }, [currentUser, mapActivities, selectedDate]);

  // Silent, scoped refresh for date navigation: fetches only activities (projects are not
  // date-scoped) and never touches the global isLoading, so the page stays mounted.
  const refreshActivitiesForDate = useCallback(
    async (date: Date) => {
      await fetchPeriodActivities(date, true);
    },
    [fetchPeriodActivities],
  );

  // The streak spans every period, so it gets its own year-scoped fetch of the user's
  // entries and is recomputed whenever it could have changed (login, save, delete).
  const refreshStreak = useCallback(async () => {
    if (!currentUser) return;
    setIsStreakLoading(true);
    try {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 364);
      const res = await activitiesApi.getAll({
        limit: 5000,
        userId: Number(currentUser.id),
        startDate: toDayStr(start),
        endDate: toDayStr(end),
      });
      const loggedDates = new Set(res.activities.map((activity) => backendEntryDate(activity.startTime)));
      setStreakDays(getStreakDays(loggedDates, end));
    } catch (err) {
      console.error('Failed to refresh streak:', err);
    } finally {
      setIsStreakLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void refreshStreak();
  }, [refreshStreak]);

  const fetchAnalyticsData = useCallback(async () => {
    const [activitiesRes, projectsRes, teamsRes] = await Promise.all([
      activitiesApi.getAll({ limit: 10 }),
      projectsApi.getAll({ limit: 100 }),
      teamsApi.getAll({ limit: 100 }),
    ]);

    setBackendActivities(activitiesRes.activities);
    setActivities(mapActivities(activitiesRes.activities));
    setBackendProjects(projectsRes.projects);
    setProjects(projectsRes.projects.map(convertBackendProject));
    setBackendTeams(teamsRes.teams);
  }, [mapActivities]);

  const fetchReportsData = useCallback(async () => {
    const [projectsRes, usersRes, teamsRes] = await Promise.all([
      projectsApi.getAll({ limit: 100 }),
      usersApi.getAll({ limit: 100 }),
      teamsApi.getAll({ limit: 100 }),
    ]);

    setBackendProjects(projectsRes.projects);
    setProjects(projectsRes.projects.map(convertBackendProject));
    setBackendUsers(usersRes.users);
    setUsers(usersRes.users.map(convertBackendUserToFrontend));
    setBackendTeams(teamsRes.teams);
  }, []);

  const fetchReportsWithFilters = useCallback(async (filters: {
    startDate?: string;
    endDate?: string;
    teamId?: number;
    projectId?: number;
    userId?: number;
  }) => {
    try {
      const activitiesRes = await activitiesApi.getAll({
        limit: 5000,
        startDate: filters.startDate,
        endDate: filters.endDate,
        teamId: filters.teamId,
        projectId: filters.projectId,
        userId: filters.userId,
      });
      setBackendActivities(activitiesRes.activities);
      setActivities(mapActivities(activitiesRes.activities));
    } catch (err) {
      console.error('Failed to fetch filtered reports data:', err);
    }
  }, [mapActivities]);

  const fetchAdminData = useCallback(async () => {
    const [projectsRes, usersRes, teamsRes, competenciesRes] = await Promise.all([
      projectsApi.getAll({ limit: 100 }),
      usersApi.getAll({ limit: 100 }),
      teamsApi.getAll({ limit: 100 }),
      competenciesApi.getAll(),
    ]);

    setBackendProjects(projectsRes.projects);
    setProjects(projectsRes.projects.map(convertBackendProject));
    setBackendUsers(usersRes.users);
    setUsers(usersRes.users.map(convertBackendUserToFrontend));
    setBackendTeams(teamsRes.teams);
    setBackendCompetencies(competenciesRes);
  }, []);
  // Store fetcher functions in a ref to prevent fetchViewData from being recreated
  // when individual fetchers change (e.g. when selectedDate changes fetchDashboardData)
  const fetchersRef = useRef({ fetchDashboardData, fetchAnalyticsData, fetchReportsData, fetchAdminData });
  fetchersRef.current = { fetchDashboardData, fetchAnalyticsData, fetchReportsData, fetchAdminData };

  const fetchViewData = useCallback(
    async (targetView: ViewMode, force = false) => {
      if (!currentUser) return;
      if (!force && loadedViewsRef.current[targetView]) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const fetchers = fetchersRef.current;
        if (targetView === 'dashboard') {
          await fetchers.fetchDashboardData();
        } else if (targetView === 'analytics') {
          await fetchers.fetchAnalyticsData();
        } else if (targetView === 'reports') {
          await fetchers.fetchReportsData();
        } else {
          await fetchers.fetchAdminData();
        }

        setLoadedViews((current) => ({ ...current, [targetView]: true }));
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser],
  );

  // Re-fetch dashboard activities when selectedDate changes. Deliberately silent: no global
  // spinner, the loaded window is reused when the new date is already covered by it.
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    void refreshActivitiesForDate(selectedDate);
  }, [selectedDate, refreshActivitiesForDate]);

  useEffect(() => {
    if (currentUser) {
      // Always force re-fetch on tab switch since views share state but load different data
      void fetchViewData(viewMode, true);
      return;
    }

    setIsLoading(false);
    setError(null);
  }, [currentUser, fetchViewData, viewMode]);

  const ensureActivityDependencies = useCallback(async () => {
    const pendingRequests: Promise<unknown>[] = [];

    if (projects.length === 0) {
      pendingRequests.push(
        projectsApi.getAll({ limit: 100 }).then((projectsRes) => {
          setBackendProjects(projectsRes.projects);
          setProjects(projectsRes.projects.map(convertBackendProject));
        }),
      );
    }

    if (backendCompetencies.length === 0) {
      pendingRequests.push(
        competenciesApi.getAll().then((competenciesRes) => {
          setBackendCompetencies(competenciesRes);
        }),
      );
    }

    if (pendingRequests.length > 0) {
      await Promise.all(pendingRequests);
    }
  }, [backendCompetencies.length, projects.length]);

  const fetchRecurringActivities = useCallback(async () => {
    try {
      // Ensure competencies are available for resolving competencyIds
      let competencies = backendCompetencies;
      if (competencies.length === 0) {
        competencies = await competenciesApi.getAll();
        setBackendCompetencies(competencies);
      }

      const response = await recurringActivitiesService.list();
      setRecurringActivities(
        response.activities.map((activity) =>
          convertBackendActivity(activity, {
            resolveTeamType: (teamId) => teamIdToType[teamId] || 'app-dev',
            backendCompetencies: competencies,
          }),
        ),
      );
    } catch (err) {
      console.error('Failed to fetch recurring activities:', err);
    }
  }, [backendCompetencies]);

  const clearSessionData = () => {
    setActivities([]);
    setProjects([]);
    setUsers([]);
    setBackendUsers([]);
    setBackendTeams([]);
    setBackendProjects([]);
    setBackendCompetencies([]);
    setBackendActivities([]);
    setRecurringActivities([]);
    setLoadedViews({});
    loadedPeriodKeyRef.current = null;
    setLoadedPeriodKey(null);
  };

  return {
    activities,
    setActivities,
    projects,
    users,
    backendUsers,
    backendTeams,
    backendProjects,
    backendCompetencies,
    backendActivities,
    recurringActivities,
    isLoading,
    isActivitiesRefreshing,
    loadedPeriodKey,
    streakDays,
    isStreakLoading,
    refreshStreak,
    error,
    fetchAllData: () => fetchViewData(viewMode, true),
    fetchViewData,
    fetchReportsWithFilters,
    fetchRecurringActivities,
    ensureActivityDependencies,
    clearSessionData,
  };
};

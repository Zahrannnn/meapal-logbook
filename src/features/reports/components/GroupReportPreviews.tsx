import React from 'react';
import { calculateActualHours } from '../../../lib/utils';
import type { ActivityEntry, Project } from '../../../entities';
import type { BackendTeam } from '../../../lib/api';

/** Totals per project: activity count, distinct contributors, hours. */
export const ProjectPreview: React.FC<{ activities: Record<string, ActivityEntry[]>; projects: Project[] }> = ({
  activities: byProject,
  projects,
}) => (
  <ul className="divide-y divide-border">
    {Object.entries(byProject).map(([projectId, projectActivities]) => {
      const project = projects.find((entry) => entry.id === projectId);
      const totalHours = calculateActualHours(projectActivities);
      const completed = projectActivities.filter((activity) => activity.status === 'completed').length;
      const contributors = new Set(projectActivities.map((activity) => activity.employeeId)).size;

      return (
        <li key={projectId} className="flex items-center justify-between gap-3 px-1 py-3.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{project?.name || 'Unknown project'}</p>
            <p className="text-xs font-medium text-muted-foreground tabular-nums">
              {projectActivities.length} activities · {contributors}{' '}
              {contributors === 1 ? 'contributor' : 'contributors'}
            </p>
          </div>
          <p className="shrink-0 text-sm font-extrabold text-foreground tabular-nums">{totalHours.toFixed(1)}h</p>
        </li>
      );
    })}
  </ul>
);

/** Totals per team: activity count, employees, distinct projects, hours. */
export const TeamPreview: React.FC<{ activities: Record<string, ActivityEntry[]>; backendTeams: BackendTeam[] }> = ({
  activities: byTeam,
  backendTeams,
}) => (
  <ul className="divide-y divide-border">
    {Object.entries(byTeam).map(([teamId, teamActivities]) => {
      const team = backendTeams.find((entry) => entry.id.toString() === teamId);
      const totalHours = calculateActualHours(teamActivities);
      const employees = new Set(teamActivities.map((activity) => activity.employeeId)).size;
      const uniqueProjects = new Set(teamActivities.map((activity) => activity.projectId)).size;

      return (
        <li key={teamId} className="flex items-center justify-between gap-3 px-1 py-3.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{team?.name || teamId}</p>
            <p className="text-xs font-medium text-muted-foreground tabular-nums">
              {teamActivities.length} activities · {employees} employees · {uniqueProjects} projects
            </p>
          </div>
          <p className="shrink-0 text-sm font-extrabold text-foreground tabular-nums">{totalHours.toFixed(1)}h</p>
        </li>
      );
    })}
  </ul>
);

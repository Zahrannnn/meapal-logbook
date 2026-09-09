import React from 'react';
import { RefreshCwIcon } from 'lucide-react';
import type { BackendProject, BackendTeam } from '../../../lib/api';
import type { ReportPeriod } from '../hooks/useAnalyticsReport';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsHeaderProps {
  period: ReportPeriod;
  /** Human-readable date scope of the current numbers, e.g. "Sep 2 – Sep 8". */
  scopeLabel: string;
  selectedTeamId?: number;
  selectedProjectId?: number;
  backendTeams: BackendTeam[];
  backendProjects: BackendProject[];
  isLoading: boolean;
  onPeriodChange: (period: ReportPeriod) => void;
  onTeamChange: (teamId?: number) => void;
  onProjectChange: (projectId?: number) => void;
  onRefresh: () => void;
}

const PERIODS: Array<{ value: ReportPeriod; label: string }> = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  period,
  scopeLabel,
  selectedTeamId,
  selectedProjectId,
  backendTeams,
  backendProjects,
  isLoading,
  onPeriodChange,
  onTeamChange,
  onProjectChange,
  onRefresh,
}) => (
  <header className="flex flex-col gap-4">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Analytics</h1>
        <p className="mt-0.5 text-sm font-medium text-muted-foreground">Team performance · {scopeLabel}</p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onRefresh}
        disabled={isLoading}
        aria-label="Refresh analytics"
        className="text-muted-foreground hover:text-foreground"
      >
        <RefreshCwIcon className={isLoading ? 'animate-spin' : ''} />
      </Button>
    </div>

    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <div
        className="flex w-full rounded-lg border border-input bg-card p-1 sm:w-auto"
        role="group"
        aria-label="Report period"
      >
        {PERIODS.map((entry) => (
          <button
            key={entry.value}
            onClick={() => onPeriodChange(entry.value)}
            aria-pressed={period === entry.value}
            className={`flex-1 rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors sm:flex-none ${
              period === entry.value ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-2.5 sm:flex-none sm:ml-auto">
        <Select
          value={selectedTeamId ? String(selectedTeamId) : 'all'}
          onValueChange={(value) => onTeamChange(value === 'all' ? undefined : parseInt(value, 10))}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by team">
            <SelectValue placeholder="All teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All teams</SelectItem>
            {backendTeams.map((team) => (
              <SelectItem key={team.id} value={String(team.id)}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedProjectId ? String(selectedProjectId) : 'all'}
          onValueChange={(value) => onProjectChange(value === 'all' ? undefined : parseInt(value, 10))}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by project">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {backendProjects.map((project) => (
              <SelectItem key={project.id} value={String(project.id)}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </header>
);

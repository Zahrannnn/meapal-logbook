import React, { useState } from 'react';
import { AnalyticsCard } from './AnalyticsCard';
import { cn } from '@/lib/utils';

interface TeamRow {
  teamId: number;
  teamName: string;
  totalActivities: number;
  totalHours: number;
  completionRate: number;
  activeMembers: number;
  totalMembers: number;
}

interface PerformerRow {
  userId: number;
  firstName: string;
  lastName: string;
  teamName: string;
  totalActivities: number;
  totalHours: number;
}

interface AnalyticsRankingsProps {
  isLoading: boolean;
  teamPerformance: TeamRow[];
  topPerformers: PerformerRow[];
}

const rankBadgeClass = (index: number) => {
  if (index === 0) return 'bg-amber-100 text-amber-700';
  if (index === 1) return 'bg-muted text-muted-foreground';
  if (index === 2) return 'bg-orange-100 text-orange-700';
  return 'bg-muted text-muted-foreground';
};

/** Team and individual rankings in one card — same question, two lenses. */
export const AnalyticsRankings: React.FC<AnalyticsRankingsProps> = ({
  isLoading,
  teamPerformance,
  topPerformers,
}) => {
  const [tab, setTab] = useState<'teams' | 'people'>('teams');
  const isEmpty = tab === 'teams' ? teamPerformance.length === 0 : topPerformers.length === 0;

  return (
    <AnalyticsCard
      title="Rankings"
      action={
        <div className="flex rounded-lg border border-input bg-card p-1" role="group" aria-label="Ranking type">
          {(
            [
              { value: 'teams', label: 'Teams' },
              { value: 'people', label: 'People' },
            ] as const
          ).map((entry) => (
            <button
              key={entry.value}
              onClick={() => setTab(entry.value)}
              aria-pressed={tab === entry.value}
              className={`rounded-md px-3 py-1 text-xs font-bold transition-colors ${
                tab === entry.value ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
      }
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyTitle={tab === 'teams' ? 'No team data available' : 'No performer data available'}
      bodyClassName="flex flex-col gap-4"
    >
      {tab === 'teams' ? (
        teamPerformance.map((team) => (
          <div key={team.teamId} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-bold text-foreground">{team.teamName}</p>
              <p className="shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
                {team.totalHours.toFixed(1)}h · {team.activeMembers}/{team.totalMembers} active
              </p>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, team.completionRate)}%` }}
                title={`${team.completionRate}% completed`}
              />
            </div>
            <p className="text-xs font-medium text-muted-foreground tabular-nums">
              {team.totalActivities} activities · {team.completionRate}% completed
            </p>
          </div>
        ))
      ) : (
        topPerformers.map((performer, index) => (
          <div key={performer.userId} className="flex items-center gap-3 rounded-lg px-1 py-1.5">
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold tabular-nums ${rankBadgeClass(index)}`}
              aria-label={`Rank ${index + 1}`}
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">
                {performer.firstName} {performer.lastName}
              </p>
              <p className="truncate text-xs font-medium text-muted-foreground">{performer.teamName}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-extrabold text-foreground tabular-nums">{performer.totalActivities}</p>
              <p className="text-[11px] font-medium text-muted-foreground tabular-nums">
                {performer.totalHours.toFixed(1)}h
              </p>
            </div>
          </div>
        ))
      )}
    </AnalyticsCard>
  );
};

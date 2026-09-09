import React from 'react';
import { cn } from '@/lib/utils';

interface AnalyticsSummaryCardsProps {
  summaryStats: {
    totalActivities: number;
    completedActivities: number;
    totalHours: number | string;
    completionRate: number;
    averageHoursPerDay: number | string;
  };
}

interface Stat {
  label: string;
  value: string;
  emphasis?: boolean;
}

/** One stat strip instead of five pastel cards: numbers first, no decoration. */
export const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({ summaryStats }) => {
  const hours =
    typeof summaryStats.totalHours === 'number' ? summaryStats.totalHours.toFixed(1) : summaryStats.totalHours;
  const avg =
    typeof summaryStats.averageHoursPerDay === 'number'
      ? summaryStats.averageHoursPerDay.toFixed(1)
      : summaryStats.averageHoursPerDay;

  const stats: Stat[] = [
    { label: 'Total activities', value: String(summaryStats.totalActivities), emphasis: true },
    { label: 'Completed', value: String(summaryStats.completedActivities) },
    { label: 'Total hours', value: `${hours}h`, emphasis: true },
    { label: 'Completion rate', value: `${summaryStats.completionRate}%` },
    { label: 'Avg hours / day', value: `${avg}h` },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-3 lg:grid-cols-5"
      aria-label="Period summary"
    >
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-1.5 bg-card px-4 py-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
          <p
            className={cn(
              'text-2xl leading-none font-extrabold tabular-nums tracking-tight',
              stat.emphasis ? 'text-foreground' : 'text-foreground/80',
            )}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};

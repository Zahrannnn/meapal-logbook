import React from 'react';
import { cn } from '@/lib/utils';

interface ReportsSummaryStatsProps {
  summaryStats: {
    totalActivities: number;
    totalHours: string | number;
    completionRate: number;
    uniqueEmployees: number;
    uniqueProjects: number;
    completedActivities: number;
    avgHoursPerDay: string | number;
  };
}

/** One stat strip with hairline dividers — numbers first, no pastel tiles. */
export const ReportsSummaryStats: React.FC<ReportsSummaryStatsProps> = ({ summaryStats }) => {
  const stats: Array<{ label: string; value: string }> = [
    { label: 'Total activities', value: String(summaryStats.totalActivities) },
    { label: 'Completed', value: String(summaryStats.completedActivities) },
    {
      label: 'Total hours',
      value: `${typeof summaryStats.totalHours === 'number' ? summaryStats.totalHours.toFixed(1) : summaryStats.totalHours}h`,
    },
    { label: 'Completion rate', value: `${summaryStats.completionRate}%` },
    { label: 'Employees', value: String(summaryStats.uniqueEmployees) },
    { label: 'Projects', value: String(summaryStats.uniqueProjects) },
    {
      label: 'Avg / day',
      value: `${typeof summaryStats.avgHoursPerDay === 'number' ? summaryStats.avgHoursPerDay.toFixed(1) : summaryStats.avgHoursPerDay}h`,
    },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-4 lg:grid-cols-7"
      aria-label="Report summary"
    >
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-1.5 bg-card px-4 py-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
          <p className="text-xl leading-none font-extrabold tabular-nums tracking-tight text-foreground">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};

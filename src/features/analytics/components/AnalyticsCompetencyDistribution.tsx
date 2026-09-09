import React from 'react';
import { ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Tooltip } from 'recharts';
import { AnalyticsCard } from './AnalyticsCard';

interface AnalyticsCompetencyDistributionProps {
  isLoading: boolean;
  competencyDistribution: Array<{
    competency: string;
    percentage: number;
    value: number;
    color: string;
  }>;
}

export const AnalyticsCompetencyDistribution: React.FC<AnalyticsCompetencyDistributionProps> = ({
  isLoading,
  competencyDistribution,
}) => (
  <AnalyticsCard
    title="Competency distribution"
    isLoading={isLoading}
    isEmpty={competencyDistribution.length === 0}
    emptyTitle="No competency data available"
  >
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="w-full max-w-[13rem] shrink-0">
        <ResponsiveContainer width="100%" height={200}>
          <RechartsPie>
            <Pie
              data={competencyDistribution}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              labelLine={false}
              dataKey="value"
            >
              {competencyDistribution.map((entry) => (
                <Cell key={entry.competency} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: 'var(--popover-foreground)',
              }}
            />
          </RechartsPie>
        </ResponsiveContainer>
      </div>

      <ul className="flex w-full flex-col gap-2">
        {competencyDistribution.map((entry) => (
          <li key={entry.competency} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden="true" />
              <span className="truncate">{entry.competency}</span>
            </span>
            <span className="shrink-0 font-bold text-foreground tabular-nums">{entry.percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  </AnalyticsCard>
);

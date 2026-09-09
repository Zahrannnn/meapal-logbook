import React from 'react';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { AnalyticsCard } from './AnalyticsCard';

interface AnalyticsProductivityChartProps {
  isLoading: boolean;
  weeklyTrendData: Array<{
    day: string;
    activities: number;
    completed: number;
  }>;
}

const tooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '0.75rem',
  fontSize: '12px',
  color: 'var(--popover-foreground)',
};

export const AnalyticsProductivityChart: React.FC<AnalyticsProductivityChartProps> = ({
  isLoading,
  weeklyTrendData,
}) => (
  <AnalyticsCard
    title="Productivity trend"
    isLoading={isLoading}
    isEmpty={weeklyTrendData.length === 0}
    emptyTitle="No activity in this period"
    className="lg:col-span-2"
  >
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={weeklyTrendData} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="day" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar dataKey="activities" name="Activities" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={36} />
        <Bar dataKey="completed" name="Completed" fill="var(--success)" radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  </AnalyticsCard>
);

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { parseDateValue } from '@/components/date-picker';
import { logEvent } from '../../../lib/telemetry';

export interface TrendPoint {
  date: string;
  day: string;
  activities: number;
  hours: number;
  /** Friday/Saturday — rest days get muted bars, but anything logged still counts. */
  rest?: boolean;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: number | string;
    payload?: TrendPoint;
  }>;
}

const ChartTooltip = ({ active, payload }: TooltipProps) => {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
      <p className="text-xs font-bold text-foreground">
        {point.day}
        {point.rest && <span className="ml-1.5 font-medium text-muted-foreground">rest day</span>}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
        {point.activities} {point.activities === 1 ? 'activity' : 'activities'}
        {point.hours > 0 && ` · ${point.hours.toFixed(1)}h`}
      </p>
    </div>
  );
};

/** The weekly bar chart, or ghost bars hinting at the shape of a week not yet logged. */
export const WeeklyChartBody: React.FC<{
  weeklyTrendData: TrendPoint[];
  weekTotal: number;
  weekRange: string;
  isCurrentWeek: boolean;
  selectedDateStr: string;
  onDateChange?: (date: Date) => void;
  /** Opens the log form for the selected day — used by the empty-week CTA. */
  onLogFirst?: () => void;
}> = ({ weeklyTrendData, weekTotal, weekRange, isCurrentWeek, selectedDateStr, onDateChange, onLogFirst }) => {
  const handleBarClick = (data: { payload?: TrendPoint }) => {
    const dateStr = data?.payload?.date;
    const date = parseDateValue(dateStr);
    if (date && onDateChange) {
      logEvent('bar_click', { date: dateStr });
      onDateChange(date);
    }
  };

  return (
    <CardContent className="px-2 pt-5">
      {weekTotal === 0 ? (
        <div className="relative flex h-[180px] items-end justify-center overflow-hidden rounded-lg">
          {/* ghost bars hinting at the shape of a logged week */}
          <div className="flex items-end gap-3 opacity-25" aria-hidden="true">
            {[64, 96, 40, 118, 72, 30, 84].map((height, index) => (
              <div
                key={index}
                className="w-9 rounded-t-md border border-dashed border-muted-foreground/40 bg-muted/40"
                style={{ height: `${height}px` }}
              />
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-semibold text-foreground">Nothing logged this week</p>
            <p className="text-xs text-muted-foreground">
              {isCurrentWeek
                ? 'Your Sun–Thu days fill in as you log.'
                : `The working days of ${weekRange} would appear here.`}
            </p>
            {isCurrentWeek && onLogFirst && (
              <Button size="sm" variant="outline" className="mt-1" onClick={onLogFirst}>
                Log the first one
              </Button>
            )}
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyTrendData} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="var(--muted-foreground)"
              tickLine={false}
              axisLine={false}
              style={{ fontSize: '12px', fontWeight: 600 }}
            />
            <YAxis
              allowDecimals={false}
              stroke="var(--muted-foreground)"
              tickLine={false}
              axisLine={false}
              style={{ fontSize: '12px', fontWeight: 600 }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)' }} />
            <Bar
              dataKey="activities"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
              cursor={onDateChange ? 'pointer' : undefined}
              activeBar={{ fill: 'var(--chart-1)' }}
              onClick={onDateChange ? handleBarClick : undefined}
            >
              {weeklyTrendData.map((point) => {
                const isSelected = point.date === selectedDateStr;
                const fill = isSelected
                  ? 'var(--chart-1)'
                  : point.rest
                    ? 'color-mix(in srgb, var(--muted-foreground) 20%, transparent)'
                    : 'color-mix(in srgb, var(--chart-1) 22%, transparent)';
                return <Cell key={point.date} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  );
};

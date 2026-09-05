import React from 'react';
import { format } from 'date-fns';
import { InfoIcon } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { parseDateValue } from '@/components/date-picker';
import { logEvent } from '../../../lib/telemetry';
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

interface TrendPoint {
  date: string;
  day: string;
  activities: number;
  hours: number;
}

interface DashboardTrendChartProps {
  weeklyTrendData: TrendPoint[];
  selectedDate: Date;
  onDateChange?: (date: Date) => void;
  /** Opens the log form for the selected day — used by the empty-week CTA. */
  onLogFirst?: () => void;
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
      <p className="text-xs font-bold text-foreground">{point.day}</p>
      <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
        {point.activities} {point.activities === 1 ? 'activity' : 'activities'}
        {point.hours > 0 && ` · ${point.hours.toFixed(1)}h`}
      </p>
    </div>
  );
};

export const DashboardTrendChart: React.FC<DashboardTrendChartProps> = ({
  weeklyTrendData,
  selectedDate,
  onDateChange,
  onLogFirst,
}) => {
  const weekTotal = weeklyTrendData.reduce((sum, point) => sum + point.activities, 0);
  const weekHours = weeklyTrendData.reduce((sum, point) => sum + point.hours, 0);
  // The five points are the Sun→Thu working week containing the selected date.
  const weekStartStr = weeklyTrendData[0]?.date;
  const weekEndStr = weeklyTrendData[weeklyTrendData.length - 1]?.date;
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isCurrentWeek = !!weekStartStr && todayStr >= weekStartStr && todayStr <= weekEndStr;
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  // Range label: "Aug 16 – Thu 20" within a month, "Aug 30 – Sep 3" across months.
  const weekStart = parseDateValue(weekStartStr);
  const weekEnd = parseDateValue(weekEndStr);
  const weekRange = !weekStart || !weekEnd
    ? ''
    : weekStart.getMonth() === weekEnd.getMonth()
      ? `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'EEE d')}`
      : `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`;
  const windowLabel = isCurrentWeek ? `this week · ${weekRange}` : weekRange;

  const handleBarClick = (data: { payload?: TrendPoint }) => {
    const dateStr = data?.payload?.date;
    const date = parseDateValue(dateStr);
    if (date && onDateChange) {
      logEvent('bar_click', { date: dateStr });
      onDateChange(date);
    }
  };

  return (
    <Card className="rounded-2xl py-5 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-6">
        <CardTitle>Weekly activity trend</CardTitle>
        <div className="flex items-center gap-0.5">
          <p className="text-sm text-muted-foreground tabular-nums">
            {weekTotal} {weekTotal === 1 ? 'activity' : 'activities'} · {weekHours.toFixed(1)}h {windowLabel}
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="How these numbers are calculated"
                className="text-muted-foreground/60 hover:text-foreground"
              >
                <InfoIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" collisionPadding={16} className="w-80 text-sm">
              <p className="font-bold text-foreground">How this summary is calculated</p>
              <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4 text-muted-foreground">
                <li>
                  Shows your week <span className="font-semibold text-foreground">Saturday to Friday</span> containing
                  the selected date ({format(selectedDate, 'EEE, MMM d')}
                  {isCurrentWeek ? ', current week' : ''}) — the same days as the bars. The working days inside it are
                  Sunday to Thursday.
                </li>
                <li>
                  <span className="font-semibold text-foreground tabular-nums">{weekTotal}</span> = activities logged on
                  those days.
                </li>
                <li>
                  <span className="font-semibold text-foreground tabular-nums">{weekHours.toFixed(1)}h</span> = time
                  between each entry&apos;s start and end. Overlapping entries count once, and entries whose end time
                  isn&apos;t after their start are skipped.
                </li>
                <li>Friday and Saturday are rest days, but anything you log on them counts.</li>
                <li>Your current search and project filters apply.</li>
                {onDateChange && <li>Select a bar to open that day.</li>}
              </ul>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <CardContent className="px-2">
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
                  return (
                    <Cell
                      key={point.date}
                      fill={isSelected ? 'var(--chart-1)' : 'color-mix(in srgb, var(--chart-1) 22%, transparent)'}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

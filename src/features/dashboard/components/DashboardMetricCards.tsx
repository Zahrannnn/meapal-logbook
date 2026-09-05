import React from 'react';
import { Activity, CalendarCheck2, CheckCircle2, Clock, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface DashboardMetricCardsProps {
  activityCount: number;
  targetActivitiesPerDay: number;
  targetProgress: number;
  completedToday: number;
  totalHoursToday: number;
  selectedDate: Date;
}

const dateLabel = (date: Date) =>
  date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

interface MetricCellProps {
  icon: React.ElementType;
  value: string;
  suffix?: string;
  label: string;
  hint: string;
  progress?: number;
  accent?: string;
  className?: string;
}

const MetricCell = ({ icon: Icon, value, suffix, label, hint, progress, accent, className }: MetricCellProps) => (
  <div className={`flex flex-col gap-3 bg-card p-4 lg:p-5 ${className || ''}`}>
    <div className="flex items-start justify-between gap-2">
      <p className="text-[13px] font-semibold text-muted-foreground leading-snug">{label}</p>
      <Icon className={`size-4 shrink-0 translate-y-0.5 ${accent || 'text-muted-foreground/70'}`} aria-hidden="true" />
    </div>

    <p className="text-2xl lg:text-[1.75rem] leading-none font-extrabold text-foreground tabular-nums tracking-tight">
      {value}
      {suffix && <span className="text-base font-bold text-muted-foreground"> {suffix}</span>}
    </p>

    <div className="mt-auto">
      {typeof progress === 'number' ? (
        <div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs font-medium text-muted-foreground mt-2">{hint}</p>
        </div>
      ) : (
        <p className="text-xs font-medium text-muted-foreground">{hint}</p>
      )}
    </div>
  </div>
);

export const DashboardMetricCards: React.FC<DashboardMetricCardsProps> = ({
  activityCount,
  targetActivitiesPerDay,
  targetProgress,
  completedToday,
  totalHoursToday,
  selectedDate,
}) => {
  const progressPct = Math.min(Math.round(targetProgress), 100);
  const completionPct = activityCount > 0 ? Math.round((completedToday / activityCount) * 100) : 0;

  return (
    <Card className="gap-0 rounded-2xl p-0" aria-label={`Activity summary for ${dateLabel(selectedDate)}`}>
      {/* Every number below belongs to the day selected in the calendar. */}
      <div className="flex items-center justify-between border-b border-border/70 px-4 lg:px-5 py-2.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Daily summary</p>
        <p className="text-xs font-bold text-foreground tabular-nums">{dateLabel(selectedDate)}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-b-2xl overflow-hidden">
        <MetricCell
          icon={Activity}
          value={String(activityCount)}
          suffix={targetActivitiesPerDay ? `/ ${targetActivitiesPerDay}` : undefined}
          label="Logged"
          hint="Against your daily target"
          progress={progressPct}
        />
        <MetricCell
          icon={CheckCircle2}
          value={String(completedToday)}
          label="Completed"
          hint={activityCount > 0 ? `${completionPct}% of what you logged` : 'Nothing logged yet'}
        />
        <MetricCell
          icon={Clock}
          value={`${totalHoursToday.toFixed(1)}h`}
          label="Hours logged"
          hint="Total duration"
        />
        <MetricCell
          icon={Send}
          value={String(activityCount)}
          label="Submitted"
          hint={`Entries saved for ${dateLabel(selectedDate)}`}
        />
      </div>
    </Card>
  );
};

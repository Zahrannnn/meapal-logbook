import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ActivityEntry, Project } from '../../../entities';

interface AnalyticsRecentActivitiesTableProps {
  activities: ActivityEntry[];
  projects: Project[];
}

const nameHues = [221, 262, 168, 32, 340, 288, 199, 142];

const personColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 997;
  const hue = nameHues[hash % nameHues.length];
  return { bg: `hsl(${hue} 70% 95%)`, text: `hsl(${hue} 55% 34%)` };
};

const statusDotClass = (status: ActivityEntry['status']) => {
  if (status === 'completed') return 'bg-success';
  if (status === 'pending-approval') return 'bg-warning';
  if (status === 'blocked') return 'bg-destructive';
  return 'bg-info';
};

const statusLabel = (status: ActivityEntry['status']) => {
  if (status === 'pending-approval') return 'Pending approval';
  if (status === 'in-progress') return 'In progress';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

type DayGroup = { key: string; label: string; entries: ActivityEntry[]; hours: number };

const groupLabel = (date: string, today: Date) => {
  const entryDate = new Date(`${date}T00:00:00`);
  const diffDays = Math.round((today.getTime() - entryDate.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return format(entryDate, 'EEE, MMM d');
};

export const AnalyticsRecentActivitiesTable: React.FC<AnalyticsRecentActivitiesTableProps> = ({
  activities,
  projects,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const groups = React.useMemo(() => {
    const map = new Map<string, ActivityEntry[]>();
    for (const activity of activities) {
      const list = map.get(activity.date) ?? [];
      list.push(activity);
      map.set(activity.date, list);
    }
    return [...map.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 7)
      .map<DayGroup>(([date, entries]) => ({
        key: date,
        label: groupLabel(date, today),
        entries: entries.sort((a, b) => b.startTime.localeCompare(a.startTime)),
        hours: entries.reduce((sum, entry) => sum + entry.duration, 0),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities]);

  const maxDuration = Math.max(1, ...groups.flatMap((group) => group.entries.map((entry) => entry.duration)));

  if (activities.length === 0) {
    return (
      <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border bg-card text-sm font-medium text-muted-foreground">
        No activities in this period
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden rounded-2xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h3 className="text-sm font-bold text-foreground">Team pulse</h3>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Latest {Math.min(activities.length, 40)} entries
        </p>
      </div>

      <div className="max-h-[26rem] overflow-y-auto">
        {groups.map((group) => (
          <section key={group.key} aria-label={group.label}>
            <div className="flex items-center justify-between bg-muted/50 px-5 py-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{group.label}</p>
              <p className="text-[11px] font-semibold text-muted-foreground tabular-nums">
                {group.entries.length} · {group.hours.toFixed(1)}h
              </p>
            </div>

            <ul className="divide-y divide-border/70">
              {group.entries.map((activity) => {
                const color = personColor(activity.employeeName || '?');
                const project = projects.find((item) => item.id === activity.projectId);
                const barPct = Math.round((activity.duration / maxDuration) * 100);
                const notable = activity.status !== 'completed';

                return (
                  <li key={activity.id} className="flex items-start gap-3 px-5 py-3">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold"
                      style={{ backgroundColor: color.bg, color: color.text }}
                      aria-hidden="true"
                    >
                      {initials(activity.employeeName || '?')}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground" title={activity.title}>
                        {activity.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                        {activity.employeeName}
                        {project ? ` · ${project.name}` : ''}
                      </p>
                      {/* Relative weight of the entry at a glance */}
                      <span
                        className="mt-1.5 block h-[3px] w-16 overflow-hidden rounded-full bg-muted"
                        aria-hidden="true"
                      >
                        <span
                          className="block h-full rounded-full bg-primary/50"
                          style={{ width: `${Math.max(8, barPct)}%` }}
                        />
                      </span>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-xs font-extrabold text-foreground tabular-nums">
                        {activity.duration.toFixed(1)}h
                      </span>
                      <span className="flex items-center gap-1.5">
                        {notable && (
                          <span className="text-[11px] font-semibold text-muted-foreground">
                            {statusLabel(activity.status)}
                          </span>
                        )}
                        <span
                          className={cn('size-2 rounded-full', statusDotClass(activity.status))}
                          title={statusLabel(activity.status)}
                        />
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

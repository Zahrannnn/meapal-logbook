import type { ActivityEntry } from '../../../entities';
import { competencyOptions } from '../../../entities';
import type { OverallReport } from '../../../lib/api';
import { calculateActualHours } from '../../../lib/utils';

export const mapWeeklyTrendData = (report: OverallReport | null, activities: ActivityEntry[], selectedDate: Date) => {
  if (report?.dailyBreakdown && report.dailyBreakdown.length > 0) {
    return report.dailyBreakdown.map((day) => ({
      day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
      activities: day.activitiesCount,
      hours: day.totalHours,
      completed: day.completedCount,
    }));
  }

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - (6 - index));
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dayActivities = activities.filter((activity) => activity.date === dateStr);

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      activities: dayActivities.length,
      hours: calculateActualHours(dayActivities),
      completed: dayActivities.filter((activity) => activity.status === 'completed').length,
    };
  });
};

export const mapCompetencyDistribution = (report: OverallReport | null, activities: ActivityEntry[]) => {
  if (report?.competencyDistribution && report.competencyDistribution.length > 0) {
    return report.competencyDistribution.map((competency) => ({
      competency: competency.competencyName,
      value: competency.count,
      percentage: competency.percentage,
      color:
        competencyOptions.find((option) => option.label.toLowerCase() === competency.competencyName.toLowerCase())?.color ||
        '#888',
    }));
  }

  const distribution: Record<string, number> = {};
  activities.forEach((activity) => {
    activity.competencies?.forEach((competency) => {
      distribution[competency] = (distribution[competency] || 0) + 1;
    });
  });

  return Object.entries(distribution).map(([key, value]) => ({
    competency: competencyOptions.find((option) => option.id === key)?.label || key,
    value,
    percentage: activities.length > 0 ? Math.round((value / activities.length) * 100) : 0,
    color: competencyOptions.find((option) => option.id === key)?.color || '#888',
  }));
};

export const mapRadarData = (report: OverallReport | null, activities: ActivityEntry[]) =>
  competencyOptions.map((competency) => ({
    competency: competency.label.split(' ')[0],
    fullName: competency.label,
    value:
      report?.competencyDistribution?.find(
        (distribution) => distribution.competencyName.toLowerCase() === competency.label.toLowerCase(),
      )?.count || activities.filter((activity) => activity.competencies?.includes(competency.id)).length,
  }));

export const mapSummaryStats = (report: OverallReport | null, activities: ActivityEntry[]) => {
  if (report?.summary) {
    return {
      totalActivities: report.summary.totalActivities,
      completedActivities: report.summary.completedActivities,
      totalHours: report.summary.totalHours,
      completionRate: report.summary.completionRate,
      averageHoursPerDay: report.summary.averageHoursPerDay,
    };
  }

  const completedActivities = activities.filter((activity) => activity.status === 'completed').length;
  const totalHours = calculateActualHours(activities);

  return {
    totalActivities: activities.length,
    completedActivities,
    totalHours,
    completionRate: activities.length > 0 ? Math.round((completedActivities / activities.length) * 100) : 0,
    averageHoursPerDay: activities.length > 0 ? (totalHours / 7).toFixed(1) : 0,
  };
};

export const mapTeamPerformance = (report: OverallReport | null) => report?.teamPerformance || [];

export const mapTopPerformers = (report: OverallReport | null) => report?.topPerformers || [];

import React from 'react';
import { Calendar, CheckCircle2, Clock, FolderKanban, TrendingUp } from 'lucide-react';

interface AnalyticsSummaryCardsProps {
  summaryStats: {
    totalActivities: number;
    completedActivities: number;
    totalHours: number | string;
    completionRate: number;
    averageHoursPerDay: number | string;
  };
}

export const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({ summaryStats }) => (
  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 lg:p-5 border border-blue-100/50">
      <div className="flex items-center gap-2 text-blue-600 mb-2">
        <FolderKanban className="w-5 h-5" />
        <span className="text-sm font-semibold">Total Activities</span>
      </div>
      <p className="text-2xl lg:text-3xl font-bold text-blue-900">{summaryStats.totalActivities}</p>
    </div>

    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 lg:p-5 border border-emerald-100/50">
      <div className="flex items-center gap-2 text-emerald-600 mb-2">
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-sm font-semibold">Completed</span>
      </div>
      <p className="text-2xl lg:text-3xl font-bold text-emerald-900">{summaryStats.completedActivities}</p>
    </div>

    <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl p-4 lg:p-5 border border-violet-100/50">
      <div className="flex items-center gap-2 text-violet-600 mb-2">
        <Clock className="w-5 h-5" />
        <span className="text-sm font-semibold">Total Hours</span>
      </div>
      <p className="text-3xl font-bold text-purple-900">
        {typeof summaryStats.totalHours === 'number' ? summaryStats.totalHours.toFixed(1) : summaryStats.totalHours}h
      </p>
    </div>

    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
      <div className="flex items-center gap-2 text-orange-600 mb-2">
        <TrendingUp className="w-5 h-5" />
        <span className="text-sm font-semibold">Completion Rate</span>
      </div>
      <p className="text-3xl font-bold text-orange-900">{summaryStats.completionRate}%</p>
    </div>

    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-4">
      <div className="flex items-center gap-2 text-cyan-600 mb-2">
        <Calendar className="w-5 h-5" />
        <span className="text-sm font-semibold">Avg Hours/Day</span>
      </div>
      <p className="text-3xl font-bold text-cyan-900">{summaryStats.averageHoursPerDay}h</p>
    </div>
  </div>
);

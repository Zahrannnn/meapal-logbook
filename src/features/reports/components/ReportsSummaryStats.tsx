import React from 'react';
import { BarChart3, Calendar, Clock, FolderKanban, PieChart, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

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

const cards = [
  { key: 'totalActivities', label: 'Total Activities', icon: BarChart3, className: 'bg-blue-100 text-blue-600', suffix: '' },
  { key: 'totalHours', label: 'Total Hours', icon: Clock, className: 'bg-teal-100 text-teal-600', suffix: 'h' },
  { key: 'completionRate', label: 'Completion Rate', icon: TrendingUp, className: 'bg-green-100 text-green-600', suffix: '%' },
  { key: 'uniqueEmployees', label: 'Employees', icon: Users, className: 'bg-purple-100 text-purple-600', suffix: '' },
  { key: 'uniqueProjects', label: 'Projects', icon: FolderKanban, className: 'bg-orange-100 text-orange-600', suffix: '' },
  { key: 'completedActivities', label: 'Completed', icon: PieChart, className: 'bg-indigo-100 text-indigo-600', suffix: '' },
  { key: 'avgHoursPerDay', label: 'Avg/Day', icon: Calendar, className: 'bg-pink-100 text-pink-600', suffix: 'h' },
] as const;

export const ReportsSummaryStats: React.FC<ReportsSummaryStatsProps> = ({ summaryStats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
    {cards.map((card, index) => {
      const Icon = card.icon;
      const value = summaryStats[card.key];
      return (
        <motion.div key={card.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.className}`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}{card.suffix}</p>
          <p className="text-xs text-gray-600">{card.label}</p>
        </motion.div>
      );
    })}
  </div>
);

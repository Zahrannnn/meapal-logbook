import { Activity, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import type { User } from '../../../entities';

interface DashboardStatsGridProps {
  currentUser: User;
  totalActivities: number;
  completedActivities: number;
  totalHours: number;
  weeklyActivities: number;
  targetProgress: number;
}

export const DashboardStatsGrid = ({
  currentUser,
  totalActivities,
  completedActivities,
  totalHours,
  weeklyActivities,
  targetProgress,
}: DashboardStatsGridProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100/80 hover:shadow-md hover:border-gray-200/80 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{totalActivities}</p>
          <p className="text-xs text-gray-500 font-medium">of {currentUser.targetActivitiesPerDay}</p>
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-3">Activities Today</p>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(targetProgress, 100)}%` }}
        />
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100/80 hover:shadow-md hover:border-gray-200/80 transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{completedActivities}</p>
      </div>
      <p className="text-sm font-semibold text-gray-700 mt-4">Completed</p>
      <p className="text-xs text-emerald-600 font-medium mt-1">
        {totalActivities > 0 ? `${Math.round((completedActivities / totalActivities) * 100)}% completion rate` : 'No activities yet'}
      </p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100/80 hover:shadow-md hover:border-gray-200/80 transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
      </div>
      <p className="text-sm font-semibold text-gray-700 mt-4">Total Hours</p>
      <p className="text-xs text-teal-600 font-medium mt-1">Logged today</p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100/80 hover:shadow-md hover:border-gray-200/80 transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{weeklyActivities}</p>
      </div>
      <p className="text-sm font-semibold text-gray-700 mt-4">This Week</p>
      <p className="text-xs text-violet-600 font-medium mt-1">Last 7 days</p>
    </motion.div>
  </div>
);

import React from 'react';
import { Calendar, Clock, Edit2, FolderKanban, Repeat, StopCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ActivityEntry, Project } from '../../../entities';

interface RecurringActivityCardProps {
  activity: ActivityEntry;
  projects: Project[];
  onEdit: (activity: ActivityEntry) => void;
  onDelete: (id: string, title: string) => void;
}

const getProjectName = (projectId: string, projects: Project[]) => {
  const project = projects.find((entry) => entry.id === projectId);
  return project?.name || 'Unknown Project';
};

const formatRecurrence = (activity: ActivityEntry) => {
  if (!activity.frequency) return 'No recurrence';

  const frequency = activity.frequency.toLowerCase();
  const interval = activity.interval || 1;
  const daysOfWeek = activity.daysOfWeek || [];
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (frequency === 'daily') {
    return interval === 1 ? 'Daily' : `Every ${interval} days`;
  }
  if (frequency === 'weekly') {
    const days = daysOfWeek.map((day) => weekDays[day]).join(', ');
    return interval === 1 ? `Weekly${days ? ` on ${days}` : ''}` : `Every ${interval} weeks${days ? ` on ${days}` : ''}`;
  }
  if (frequency === 'monthly') {
    return interval === 1 ? 'Monthly' : `Every ${interval} months`;
  }

  return frequency;
};

const formatDateRange = (activity: ActivityEntry) => {
  const start = activity.startDate ? new Date(activity.startDate).toLocaleDateString() : '';
  const end = activity.endDate ? new Date(activity.endDate).toLocaleDateString() : 'No end date';
  return start ? `${start} - ${end}` : 'Not specified';
};

export const RecurringActivityCard: React.FC<RecurringActivityCardProps> = ({
  activity,
  projects,
  onEdit,
  onDelete,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{activity.title}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <FolderKanban className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium truncate">{getProjectName(activity.projectId, projects)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">
              {activity.startTime} - {activity.endTime}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Repeat className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">{formatRecurrence(activity)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium truncate">{formatDateRange(activity)}</span>
          </div>
        </div>

        {activity.description && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{activity.description}</p>}

        {activity.competencies && activity.competencies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activity.competencies.map((competency) => (
              <span key={competency} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                {competency}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 flex-shrink-0">
        <button
          onClick={() => onEdit(activity)}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm hover:shadow-md"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(activity.id, activity.title)}
          className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors shadow-sm hover:shadow-md"
          title="Stop"
        >
          <StopCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  </motion.div>
);

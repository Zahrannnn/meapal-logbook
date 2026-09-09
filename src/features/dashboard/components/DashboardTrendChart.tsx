import React, { useState } from 'react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { parseDateValue } from '@/components/date-picker';
import { WeeklyOverviewHeader } from './WeeklyOverviewHeader';
import { WeeklyChartBody, type TrendPoint } from './WeeklyChartBody';

interface DashboardTrendChartProps {
  weeklyTrendData: TrendPoint[];
  selectedDate: Date;
  onDateChange?: (date: Date) => void;
  /** Opens the log form for the selected day — used by the empty-week CTA. */
  onLogFirst?: () => void;
}

const WEEKLY_OPEN_KEY = 'logbook:weekly-open';

export const DashboardTrendChart: React.FC<DashboardTrendChartProps> = ({
  weeklyTrendData,
  selectedDate,
  onDateChange,
  onLogFirst,
}) => {
  // Analytics are tertiary on this screen: collapsed until the user asks for them.
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return localStorage.getItem(WEEKLY_OPEN_KEY) === '1';
    } catch {
      return false;
    }
  });

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    try {
      localStorage.setItem(WEEKLY_OPEN_KEY, next ? '1' : '0');
    } catch {
      // storage unavailable — the section just won't remember its state
    }
  };

  const weekTotal = weeklyTrendData.reduce((sum, point) => sum + point.activities, 0);
  const weekHours = weeklyTrendData.reduce((sum, point) => sum + point.hours, 0);
  // The seven points are the Sat→Fri week containing the selected date.
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

  return (
    <Card className="rounded-2xl py-5 gap-0">
      <WeeklyOverviewHeader
        isOpen={isOpen}
        onToggle={toggleOpen}
        weekTotal={weekTotal}
        weekHours={weekHours}
        windowLabel={windowLabel}
        selectedDate={selectedDate}
        isCurrentWeek={isCurrentWeek}
        canSelectBars={!!onDateChange}
      />

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="weekly-chart"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <WeeklyChartBody
              weeklyTrendData={weeklyTrendData}
              weekTotal={weekTotal}
              weekRange={weekRange}
              isCurrentWeek={isCurrentWeek}
              selectedDateStr={selectedDateStr}
              onDateChange={onDateChange}
              onLogFirst={onLogFirst}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

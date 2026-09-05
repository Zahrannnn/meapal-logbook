import { Calendar, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';
import { DatePicker, parseDateValue } from '@/components/date-picker';
import type { RecurrenceSettings, RecurrenceType } from '../model/activity.types';

interface ActivityRecurrenceSectionProps {
  recurrence: RecurrenceSettings;
  showRecurrence: boolean;
  onToggleOpen: () => void;
  onUpdate: (updates: Partial<RecurrenceSettings>) => void;
  onToggleDay: (day: number) => void;
  weekDays: ReadonlyArray<{ label: string; value: number; full: string }>;
}

export const ActivityRecurrenceSection = ({
  recurrence,
  showRecurrence,
  onToggleOpen,
  onUpdate,
  onToggleDay,
  weekDays,
}: ActivityRecurrenceSectionProps) => (
  <div className="border-t border-gray-200 pt-5">
    <button
      type="button"
      onClick={onToggleOpen}
      className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-primary transition-colors mb-3"
    >
      <Repeat className="w-4 h-4" />
      Repeat
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${recurrence.type !== 'none' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
        {recurrence.type !== 'none' ? recurrence.type : 'off'}
      </span>
    </button>

    {showRecurrence && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-4 bg-gray-50 rounded-xl p-4 border border-gray-200"
      >
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Repeat</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { value: 'none', label: 'Does not repeat' },
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'custom', label: 'Custom' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onUpdate({ type: option.value as RecurrenceType })}
                className={`px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-200 ${
                  recurrence.type === option.value
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {recurrence.type === 'custom' && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Repeat Every</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={recurrence.interval}
                  onChange={(event) => onUpdate({ interval: parseInt(event.target.value, 10) || 1 })}
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:border-ring focus:ring-[3px] focus:ring-ring/50 focus:outline-none text-gray-900 font-medium"
                />
                <select
                  value={recurrence.customType}
                  onChange={(event) => onUpdate({ customType: event.target.value as RecurrenceSettings['customType'] })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-ring focus:ring-[3px] focus:ring-ring/50 focus:outline-none text-gray-900 font-medium cursor-pointer"
                >
                  <option value="daily">Day(s)</option>
                  <option value="weekly">Week(s)</option>
                  <option value="monthly">Month(s)</option>
                </select>
              </div>
            </div>

            {recurrence.customType === 'weekly' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Repeat On</label>
                <div className="flex gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => onToggleDay(day.value)}
                      title={day.full}
                      className={`w-10 h-10 rounded-full font-semibold text-sm transition-all duration-200 ${
                        recurrence.daysOfWeek.includes(day.value)
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {recurrence.type === 'weekly' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Repeat On</label>
            <div className="flex gap-2">
              {weekDays.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => onToggleDay(day.value)}
                  title={day.full}
                  className={`w-10 h-10 rounded-full font-semibold text-sm transition-all duration-200 ${
                    recurrence.daysOfWeek.includes(day.value)
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {recurrence.type !== 'none' && (
          <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Start Date
              </label>
              <DatePicker
                value={recurrence.startDate?.slice(0, 10)}
                onChange={(value) => onUpdate({ startDate: value })}
                disabled={[{ before: new Date() }]}
                placeholder="Pick a start date"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                End Date (Optional)
              </label>
              <DatePicker
                value={recurrence.endDate?.slice(0, 10)}
                onChange={(value) => onUpdate({ endDate: value })}
                disabled={[{ before: parseDateValue(recurrence.startDate) ?? new Date() }]}
                placeholder="Pick an end date"
              />
            </div>
          </div>
        )}

        {recurrence.type !== 'none' && (
          <div className="bg-primary/5 border-primary/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-foreground mb-1">Summary:</p>
            <p className="text-xs text-primary">
              {recurrence.type === 'daily' && 'Repeats every day'}
              {recurrence.type === 'weekly' &&
                `Repeats weekly${
                  recurrence.daysOfWeek.length > 0
                    ? ` on ${recurrence.daysOfWeek.map((day) => weekDays[day].full).join(', ')}`
                    : ''
                }`}
              {recurrence.type === 'monthly' && 'Repeats every month'}
              {recurrence.type === 'custom' &&
                `Repeats every ${recurrence.interval} ${recurrence.customType}${recurrence.interval > 1 ? 's' : ''}${
                  recurrence.customType === 'weekly' && recurrence.daysOfWeek.length > 0
                    ? ` on ${recurrence.daysOfWeek.map((day) => weekDays[day].full).join(', ')}`
                    : ''
                }`}
              {recurrence.startDate && ` from ${new Date(recurrence.startDate).toLocaleDateString()}`}
              {recurrence.endDate && ` until ${new Date(recurrence.endDate).toLocaleDateString()}`}
            </p>
          </div>
        )}
      </motion.div>
    )}
  </div>
);

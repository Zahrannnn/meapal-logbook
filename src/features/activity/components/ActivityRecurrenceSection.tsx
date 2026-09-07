import { format } from 'date-fns';
import { CalendarDays, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { DatePicker, parseDateValue } from '@/components/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { RecurrenceSettings, RecurrenceType } from '../model/activity.types';

interface ActivityRecurrenceSectionProps {
  recurrence: RecurrenceSettings;
  showRecurrence: boolean;
  onToggleOpen: () => void;
  onUpdate: (updates: Partial<RecurrenceSettings>) => void;
  onToggleDay: (day: number) => void;
  weekDays: ReadonlyArray<{ label: string; value: number; full: string }>;
}

const typeChipLabel: Record<RecurrenceType, string> = {
  none: 'Off',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  custom: 'Custom',
};

const recurrenceOptionButton = (selected: boolean) =>
  `px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-200 ${
    selected
      ? 'bg-primary text-primary-foreground shadow-xs'
      : 'bg-card text-foreground hover:bg-muted border border-border'
  }`;

const dayButton = (selected: boolean) =>
  `w-10 h-10 rounded-full font-semibold text-sm transition-all duration-200 ${
    selected
      ? 'bg-primary text-primary-foreground shadow-xs'
      : 'bg-card text-foreground hover:bg-muted border border-border'
  }`;

const WeekdayPicker = ({
  recurrence,
  weekDays,
  onToggleDay,
}: Pick<ActivityRecurrenceSectionProps, 'recurrence' | 'weekDays' | 'onToggleDay'>) => (
  <div>
    <p className="text-sm font-semibold text-foreground mb-2">Repeat on</p>
    <div className="flex gap-2">
      {weekDays.map((day) => {
        const selected = recurrence.daysOfWeek.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            onClick={() => onToggleDay(day.value)}
            title={day.full}
            aria-pressed={selected}
            aria-label={day.full}
            className={dayButton(selected)}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  </div>
);

export const ActivityRecurrenceSection = ({
  recurrence,
  showRecurrence,
  onToggleOpen,
  onUpdate,
  onToggleDay,
  weekDays,
}: ActivityRecurrenceSectionProps) => {
  const dateLabel = (value: string | undefined) => {
    const date = parseDateValue(value?.slice(0, 10) ?? '');
    return date ? format(date, 'MMM d, yyyy') : '';
  };

  return (
    <div>
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={showRecurrence}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <Repeat className="size-4" />
        Repeat
        <span
          className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
            recurrence.type !== 'none' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          }`}
        >
          {typeChipLabel[recurrence.type]}
        </span>
      </button>

      {showRecurrence && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 bg-muted/40 rounded-xl p-4 border border-border mt-3 overflow-hidden"
        >
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Repeat</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['none', 'daily', 'weekly', 'monthly', 'custom'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onUpdate({ type: option })}
                  className={recurrenceOptionButton(recurrence.type === option)}
                >
                  {option === 'none' ? 'Does not repeat' : typeChipLabel[option]}
                </button>
              ))}
            </div>
          </div>

          {recurrence.type === 'custom' && (
            <div className="space-y-4 border-t border-border pt-4">
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Repeat every</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={recurrence.interval}
                    onChange={(event) =>
                      onUpdate({ interval: Math.max(1, parseInt(event.target.value, 10) || 1) })
                    }
                    className="w-20"
                    aria-label="Repeat every"
                  />
                  <Select
                    value={recurrence.customType}
                    onValueChange={(value) =>
                      onUpdate({ customType: value as RecurrenceSettings['customType'] })
                    }
                  >
                    <SelectTrigger className="flex-1" aria-label="Repeat unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Day(s)</SelectItem>
                      <SelectItem value="weekly">Week(s)</SelectItem>
                      <SelectItem value="monthly">Month(s)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {recurrence.customType === 'weekly' && (
                <WeekdayPicker recurrence={recurrence} weekDays={weekDays} onToggleDay={onToggleDay} />
              )}
            </div>
          )}

          {recurrence.type === 'weekly' && (
            <WeekdayPicker recurrence={recurrence} weekDays={weekDays} onToggleDay={onToggleDay} />
          )}

          {recurrence.type !== 'none' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border pt-4">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-2">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  Start date
                </p>
                <DatePicker
                  value={recurrence.startDate?.slice(0, 10)}
                  onChange={(value) => onUpdate({ startDate: value })}
                  disabled={[{ before: new Date() }]}
                  placeholder="Pick a start date"
                />
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-2">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  End date <span className="font-normal text-muted-foreground">(optional)</span>
                </p>
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
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-foreground">
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
                {recurrence.startDate && ` from ${dateLabel(recurrence.startDate)}`}
                {recurrence.endDate && ` until ${dateLabel(recurrence.endDate)}`}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

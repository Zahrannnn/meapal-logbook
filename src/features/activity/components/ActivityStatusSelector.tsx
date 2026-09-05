import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import type { ActivityDraft } from '../model/activity.types';

interface ActivityStatusSelectorProps {
  status: ActivityDraft['status'];
  onChange: (status: ActivityDraft['status']) => void;
}

const statusOptions = [
  { value: 'in-progress', label: 'In progress', dot: 'bg-info', selected: 'data-[state=on]:border-info/60 data-[state=on]:bg-info/10 data-[state=on]:text-info' },
  { value: 'completed', label: 'Completed', dot: 'bg-success', selected: 'data-[state=on]:border-success/60 data-[state=on]:bg-success/10 data-[state=on]:text-success' },
  { value: 'pending-approval', label: 'Pending approval', dot: 'bg-warning', selected: 'data-[state=on]:border-warning/60 data-[state=on]:bg-warning/10 data-[state=on]:text-warning' },
  { value: 'blocked', label: 'Blocked', dot: 'bg-destructive', selected: 'data-[state=on]:border-destructive/60 data-[state=on]:bg-destructive/10 data-[state=on]:text-destructive' },
] as const;

export const ActivityStatusSelector = ({ status, onChange }: ActivityStatusSelectorProps) => (
  <div className="flex flex-col gap-2.5">
    <span className="text-sm font-medium flex items-center gap-1">
      Status <span className="text-destructive">*</span>
    </span>
    <ToggleGroup
      type="single"
      variant="outline"
      spacing={2}
      value={status}
      onValueChange={(value) => {
        if (value) onChange(value as ActivityDraft['status']);
      }}
      className="w-full"
      aria-label="Status"
    >
      {statusOptions.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.label}
          className={cn('flex-1 min-w-0 px-2 rounded-xl border font-bold', option.selected)}
        >
          <span className={cn('size-2 rounded-full shrink-0', option.dot, status === option.value ? '' : 'opacity-40')} />
          <span className="truncate">{option.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  </div>
);

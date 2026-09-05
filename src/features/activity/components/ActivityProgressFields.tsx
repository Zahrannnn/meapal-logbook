import React from 'react';
import { Field, FieldLabel } from '@/components/ui/field';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/date-picker';
import type { ActivityDraft } from '../model/activity.types';

interface ActivityProgressFieldsProps {
  activity: ActivityDraft;
  onChange: (updates: Partial<ActivityDraft>) => void;
}

export const ActivityProgressFields: React.FC<ActivityProgressFieldsProps> = ({
  activity,
  onChange,
}) => {
  if (activity.status !== 'in-progress') {
    return null;
  }

  const progress = activity.progress || 0;

  return (
    <div className="flex flex-col gap-5 rounded-xl border bg-muted/40 p-4">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Progress</span>
          <Badge variant="secondary" className="tabular-nums">
            {progress}%
          </Badge>
        </div>
        <Slider
          aria-label="Progress"
          min={0}
          max={100}
          step={5}
          value={[progress]}
          onValueChange={(values) => onChange({ progress: values[0] })}
        />
        <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
          <span>Just started</span>
          <span>Almost done</span>
        </div>
      </div>

      <Field>
        <FieldLabel>
          Deadline <span className="text-destructive">*</span>
        </FieldLabel>
        <DatePicker
          value={activity.deadline || undefined}
          onChange={(value) => onChange({ deadline: value })}
          disabled={[{ before: new Date() }]}
          placeholder="When is this due?"
        />
      </Field>
    </div>
  );
};

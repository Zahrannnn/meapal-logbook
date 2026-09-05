import React, { useEffect, useRef } from 'react';
import { Loader2Icon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { logEvent } from '../../../lib/telemetry';
import type { ActivityModalProps } from '../model/activity.types';
import { useActivityModalState } from '../hooks/useActivityModalState';
import { ActivityBasicFields } from './ActivityBasicFields';
import { ActivityStatusSelector } from './ActivityStatusSelector';
import { ActivityCompetencyPicker } from './ActivityCompetencyPicker';
import { ActivityRecurrenceSection } from './ActivityRecurrenceSection';
import { ActivityProgressFields } from './ActivityProgressFields';

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  activity,
  onChange,
  onSave,
  isEditing,
  projects,
  isSubmitting = false,
  isEditingRecurringActivity = false,
}) => {
  const {
    showRecurrence,
    setShowRecurrence,
    recurrence,
    updateActivity,
    updateRecurrence,
    toggleDayOfWeek,
    toggleCompetency,
    weekDays,
  } = useActivityModalState(activity, onChange);

  const canSubmit = !!activity.title && !!activity.projectId && !isSubmitting;
  const missingHint = !activity.title ? 'Add a title first' : !activity.projectId ? 'Pick a project first' : undefined;
  const mode = isEditing ? 'edit' : isEditingRecurringActivity ? 'edit-recurring' : 'create';

  // Telemetry: open on show; save at submit; cancel on any close that wasn't a save.
  const savedRef = useRef(false);
  useEffect(() => {
    if (isOpen) {
      savedRef.current = false;
      logEvent('modal_open', { mode });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSave = () => {
    if (!canSubmit) return;
    savedRef.current = true;
    logEvent('modal_save', { mode });
    onSave();
  };

  const requestClose = () => {
    if (!savedRef.current && !isSubmitting) {
      logEvent('modal_cancel', { mode });
    }
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) requestClose();
      }}
    >
      <DialogContent className="sm:max-w-3xl max-h-[90dvh] flex flex-col gap-0 p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-lg">
            {isEditing ? 'Edit activity' : 'Log an activity'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of this entry' : 'What did you work on?'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-6 py-5 overflow-y-auto flex-1">
          <ActivityBasicFields activity={activity} projects={projects} onChange={updateActivity} />
          {!isEditingRecurringActivity && (
            <>
              <ActivityStatusSelector status={activity.status} onChange={(status) => updateActivity({ status })} />
              <ActivityProgressFields activity={activity} onChange={updateActivity} />
            </>
          )}
          <ActivityCompetencyPicker competencies={activity.competencies} onToggle={toggleCompetency} />
          <ActivityRecurrenceSection
            recurrence={recurrence}
            showRecurrence={showRecurrence}
            onToggleOpen={() => setShowRecurrence(!showRecurrence)}
            onUpdate={updateRecurrence}
            onToggleDay={toggleDayOfWeek}
            weekDays={weekDays}
          />
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/50 border-t border-border sm:items-center gap-2">
              <Button variant="outline" onClick={requestClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!canSubmit} title={missingHint}>
            {isSubmitting ? (
              <>
                <Loader2Icon data-icon="inline-start" className="animate-spin" />
                Saving…
              </>
            ) : isEditing ? (
              'Save changes'
            ) : (
              'Log activity'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

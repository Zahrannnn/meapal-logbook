import React from 'react';
import { format } from 'date-fns';
import { CalendarDays, Loader2Icon, SaveIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '../../../shared/ui/dialogs/ConfirmDialog';
import { logEvent } from '../../../lib/telemetry';
import type { ActivityModalProps } from '../model/activity.types';
import { createDefaultActivityDraft } from '../model/activity.draft';
import { isDefaultDraft } from '../model/drafts.storage';
import { useActivityModalState } from '../hooks/useActivityModalState';
import { useActivityModalSession } from '../hooks/useActivityModalSession';
import { ActivityTitleHero } from './ActivityTitleHero';
import { ActivityCoreFields } from './ActivityCoreFields';
import { ActivityStatusSelector } from './ActivityStatusSelector';
import { ActivityProgressFields } from './ActivityProgressFields';
import { ActivityDescriptionField, ActivityNotesField } from './ActivityDetailFields';
import { ActivityCompetencyPicker } from './ActivityCompetencyPicker';
import { ActivityRecurrenceSection } from './ActivityRecurrenceSection';
import { ActivityDetailsDrawer } from './ActivityDetailsDrawer';

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
  entryDate,
  backendCompetencies,
  onSaveDraft,
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

  const mode = isEditing ? 'edit' : isEditingRecurringActivity ? 'edit-recurring' : 'create';
  const hasDetails =
    !!activity.description || !!activity.notes || activity.competencies.length > 0 || recurrence.type !== 'none';
  // Parking requires something to park; only create-mode drafts are listed.
  const canSaveDraft = mode === 'create' && !isDefaultDraft(activity);

  const {
    isDiscardOpen,
    setIsDiscardOpen,
    validationErrors,
    requestClose,
    handleSaveDraft,
    handleSave,
  } = useActivityModalSession({
    isOpen,
    activity,
    onChange,
    onClose,
    onSave,
    onSaveDraft,
    isSubmitting,
    mode,
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) requestClose();
      }}
    >
      <DialogContent
        className="sm:max-w-2xl max-h-[90dvh] flex flex-col gap-0 p-0 overflow-hidden rounded-2xl"
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault();
            handleSave();
          }
        }}
      >
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border space-y-0">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 pr-8">
            <DialogTitle className="text-lg">{isEditing ? 'Edit activity' : 'Log activity'}</DialogTitle>
            {entryDate && (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-bold text-foreground tabular-nums">
                <CalendarDays className="size-3.5 text-muted-foreground" aria-hidden="true" />
                For {format(entryDate, 'EEE, MMM d')}
              </span>
            )}
          </div>
          <DialogDescription className="sr-only">
            {isEditing ? 'Update the details of this entry' : 'What did you work on?'}
          </DialogDescription>
        </DialogHeader>

        <form
          id="activity-form"
          className="flex flex-col gap-5 px-6 py-5 overflow-y-auto flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            handleSave();
          }}
        >
          <ActivityTitleHero
            title={activity.title}
            onTitleChange={(title) => onChange({ ...activity, title })}
            isEditing={isEditing}
            titleError={validationErrors.title && !activity.title ? validationErrors.title : undefined}
          />

          <ActivityCoreFields
            activity={activity}
            projects={projects}
            projectError={!activity.projectId ? validationErrors.project : undefined}
            onChange={updateActivity}
          />

          {!isEditingRecurringActivity && (
            <>
              <ActivityStatusSelector status={activity.status} onChange={(status) => updateActivity({ status })} />
              <ActivityProgressFields activity={activity} onChange={updateActivity} />
            </>
          )}

          <ActivityDetailsDrawer forceOpen={hasDetails} hasContent={hasDetails}>
            <ActivityDescriptionField
              value={activity.description}
              onChange={(value) => updateActivity({ description: value })}
            />
            <ActivityCompetencyPicker
              competencies={activity.competencies}
              onToggle={toggleCompetency}
              options={backendCompetencies ?? []}
            />
            <ActivityNotesField value={activity.notes || ''} onChange={(value) => updateActivity({ notes: value })} />
            <ActivityRecurrenceSection
              recurrence={recurrence}
              showRecurrence={showRecurrence}
              onToggleOpen={() => setShowRecurrence(!showRecurrence)}
              onUpdate={updateRecurrence}
              onToggleDay={toggleDayOfWeek}
              weekDays={weekDays}
            />
          </ActivityDetailsDrawer>
        </form>

        <DialogFooter className="px-6 py-4 bg-muted/50 border-t border-border sm:items-center gap-2">
          {canSaveDraft && onSaveDraft && (
            <Button variant="outline" type="button" onClick={handleSaveDraft} disabled={isSubmitting} className="sm:mr-auto">
              <SaveIcon data-icon="inline-start" />
              Save as draft
            </Button>
          )}
          <Button variant="outline" type="button" onClick={requestClose} disabled={isSubmitting}>
            Cancel
          </Button>
          {/* The footer button lives outside the scrolling form; `form` ties them together. */}
          <Button type="submit" form="activity-form" disabled={isSubmitting}>
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

        <ConfirmDialog
          isOpen={isDiscardOpen}
          onClose={() => setIsDiscardOpen(false)}
          onConfirm={() => {
            setIsDiscardOpen(false);
            logEvent('modal_cancel', { mode });
            // Discarding is explicit: clear the form and the persisted draft with it.
            onChange(createDefaultActivityDraft());
            onClose();
          }}
          title="Discard this activity?"
          message="Your changes haven't been saved yet."
          confirmText="Discard"
          cancelText="Keep editing"
          variant="warning"
        />
      </DialogContent>
    </Dialog>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import type { ActivityEntry } from '../../../entities';
import { logEvent } from '../../../lib/telemetry';

export type ActivityModalMode = 'edit' | 'edit-recurring' | 'create';

/**
 * One modal session: dirty tracking against the state at open, a discard guard
 * so Escape/backdrop can't destroy typed content, telemetry, and title/project
 * validation with focus-to-first-error on save.
 */
export const useActivityModalSession = ({
  isOpen,
  activity,
  onChange,
  onClose,
  onSave,
  onSaveDraft,
  isSubmitting,
  mode,
}: {
  isOpen: boolean;
  activity: ActivityEntry;
  onChange: (activity: ActivityEntry) => void;
  onClose: () => void;
  onSave: () => void;
  onSaveDraft?: () => void;
  isSubmitting: boolean;
  mode: ActivityModalMode;
}) => {
  // Telemetry: open on show; save at submit; cancel on any close that wasn't a save.
  const savedRef = useRef(false);
  const initialDraftRef = useRef('');
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ title?: string; project?: string }>({});

  useEffect(() => {
    if (isOpen) {
      savedRef.current = false;
      initialDraftRef.current = JSON.stringify(activity);
      setValidationErrors({});
      setIsDiscardOpen(false);
      logEvent('modal_open', { mode });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const isDirty = JSON.stringify(activity) !== initialDraftRef.current;

  const requestClose = () => {
    if (isSubmitting) return;
    // Escape and backdrop clicks must not silently destroy typed content.
    if (!savedRef.current && isDirty) {
      setIsDiscardOpen(true);
      return;
    }
    if (!savedRef.current) {
      logEvent('modal_cancel', { mode });
    }
    onClose();
  };

  const handleSaveDraft = () => {
    if (isSubmitting) return;
    logEvent('modal_draft_saved', { mode });
    onSaveDraft?.();
  };

  const handleSave = () => {
    const missing: { title?: string; project?: string } = {};
    if (!activity.title) missing.title = 'Give this activity a title';
    if (!activity.projectId) missing.project = 'Pick a project';

    if (missing.title || missing.project) {
      setValidationErrors(missing);
      const first = document.getElementById(missing.title ? 'activity-title' : 'activity-project');
      first?.focus();
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    savedRef.current = true;
    logEvent('modal_save', { mode });
    onSave();
  };

  return {
    isDiscardOpen,
    setIsDiscardOpen,
    validationErrors,
    requestClose,
    handleSaveDraft,
    handleSave,
  };
};

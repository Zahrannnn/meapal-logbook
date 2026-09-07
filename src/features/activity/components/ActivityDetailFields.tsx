import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

interface ActivityDetailFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const ActivityDescriptionField = ({ value, onChange }: ActivityDetailFieldProps) => (
  <Field>
    <FieldLabel htmlFor="activity-description">
      Description <span className="font-normal text-muted-foreground">(optional)</span>
    </FieldLabel>
    <Textarea
      id="activity-description"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={3}
      placeholder="Describe what you worked on…"
      className="resize-none"
    />
  </Field>
);

export const ActivityNotesField = ({ value, onChange }: ActivityDetailFieldProps) => {
  const [isOpen, setIsOpen] = useState(() => value.length > 0);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 self-start text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <PlusIcon className="size-4" />
        Add notes
      </button>
    );
  }

  return (
    <Field>
      <FieldLabel htmlFor="activity-notes">
        Notes <span className="font-normal text-muted-foreground">(optional)</span>
      </FieldLabel>
      <Textarea
        id="activity-notes"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        placeholder="Challenges, learnings, extra context…"
        className="resize-none"
        autoFocus
      />
      <FieldDescription>Only you and approvers see this.</FieldDescription>
    </Field>
  );
};

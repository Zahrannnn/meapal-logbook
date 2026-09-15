import React from 'react';
import { Repeat2Icon } from 'lucide-react';
import type { ActivityEntry } from '../../../entities';

/** One-tap starting points: the user's own recent work, retimed into the
 *  selected day's next free slot on click. */
export const QuickRelogBar: React.FC<{
  templates: ActivityEntry[];
  onPick: (template: ActivityEntry) => void;
}> = ({ templates, onPick }) => {
  if (templates.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Quick re-log">
      <span className="text-xs font-semibold text-muted-foreground">Log again:</span>
      {templates.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onPick(template)}
          title={template.title}
          className="inline-flex max-w-[15rem] items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
        >
          <Repeat2Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="truncate">{template.title}</span>
        </button>
      ))}
    </div>
  );
};

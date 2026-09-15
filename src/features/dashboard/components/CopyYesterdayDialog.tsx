import React from 'react';
import { formatDurationLabel } from '@/lib/time';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ActivityEntry, Project } from '../../../entities';

/** Confirms copying the previous workday's entries onto the selected day,
 *  times verbatim. */
export const CopyYesterdayDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: ActivityEntry[];
  projects: Project[];
  onConfirm: (entries: ActivityEntry[]) => void;
}> = ({ open, onOpenChange, entries, projects, onConfirm }) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Copy the previous workday?</AlertDialogTitle>
        <AlertDialogDescription>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} will be duplicated onto this
          day with the same times. You can edit or delete them after.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <ul className="max-h-56 space-y-1.5 overflow-y-auto rounded-lg border bg-muted/40 p-3 text-sm">
        {entries.map((entry) => {
          const project = projects.find((item) => item.id === entry.projectId);
          return (
            <li key={entry.id} className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate font-medium text-foreground" title={entry.title}>
                {entry.title}
                {project && <span className="ml-1.5 text-xs font-normal text-muted-foreground">{project.name}</span>}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {entry.startTime} – {entry.endTime} · {formatDurationLabel(Math.round(entry.duration * 60))}
              </span>
            </li>
          );
        })}
      </ul>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={() => onConfirm(entries)}>
          Copy {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

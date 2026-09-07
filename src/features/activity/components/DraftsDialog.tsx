import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FileTextIcon, Trash2Icon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { listDrafts, removeDraft, type StoredDraft } from '../model/drafts.storage';
import { formatDurationLabel, toMinutes } from '@/lib/time';
import { parseDateValue } from '@/components/date-picker';
import type { Project } from '../../../entities';

interface DraftsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Loads the draft back into the log form; removes it from the list. */
  onResume: (draft: StoredDraft) => void;
  projects: Project[];
}

export const DraftsDialog: React.FC<DraftsDialogProps> = ({ isOpen, onClose, onResume, projects }) => {
  const [drafts, setDrafts] = useState<StoredDraft[]>([]);

  useEffect(() => {
    if (isOpen) setDrafts(listDrafts());
  }, [isOpen]);

  const handleDelete = (id: string) => {
    removeDraft(id);
    setDrafts((current) => current.filter((draft) => draft.id !== id));
  };

  const projectName = (projectId: string) => projects.find((project) => project.id === projectId)?.name;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85dvh] flex flex-col gap-0 p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-lg">Drafts</DialogTitle>
          <DialogDescription>Activities you parked. Resume one to finish logging it.</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          {drafts.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileTextIcon />
                </EmptyMedia>
                <EmptyTitle>No drafts</EmptyTitle>
                <p className="text-sm text-muted-foreground">
                  Click "Save as draft" while logging to park an activity for later.
                </p>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="divide-y divide-border">
              {drafts.map((draft) => {
                const entryDate = parseDateValue(draft.entryDate);
                const saved = new Date(draft.savedAt);
                const duration = toMinutes(draft.draft.endTime) - toMinutes(draft.draft.startTime);

                return (
                  <li key={draft.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h4 className="truncate text-sm font-bold text-foreground" title={draft.draft.title}>
                        {draft.draft.title || 'Untitled activity'}
                      </h4>
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground tabular-nums">
                        {entryDate ? `For ${format(entryDate, 'EEE, MMM d')}` : 'No day set'}
                        {projectName(draft.draft.projectId) ? ` · ${projectName(draft.draft.projectId)}` : ''}
                        {duration > 0 ? ` · ${formatDurationLabel(duration)}` : ''}
                        {' · '}
                        saved {format(saved, 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onResume(draft)}>
                      Continue
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete draft "${draft.draft.title || 'Untitled activity'}"`}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(draft.id)}
                    >
                      <Trash2Icon />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

import React from 'react';
import { Loader2Icon, RepeatIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '../../../shared/ui';
import { ActivityEntry, Project } from '../../../entities';
import { useRecurringDeleteConfirm } from '../hooks/useRecurringDeleteConfirm';
import { RecurringActivitiesEmptyState } from './RecurringActivitiesEmptyState';
import { RecurringActivityCard } from './RecurringActivityCard';

interface RecurringActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityEntry[];
  projects: Project[];
  onEdit: (activity: ActivityEntry) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  onCreateClick?: () => void;
}

export const RecurringActivitiesModal: React.FC<RecurringActivitiesModalProps> = ({
  isOpen,
  onClose,
  activities,
  projects,
  onEdit,
  onDelete,
  isLoading = false,
  onCreateClick,
}) => {
  const { deleteConfirm, openDeleteConfirm, closeDeleteConfirm, confirmDelete } = useRecurringDeleteConfirm(onDelete);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-3xl max-h-[90dvh] flex flex-col gap-0 p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-lg flex items-center gap-2">
              <span className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center [&_svg]:size-[18px]">
                <RepeatIcon />
              </span>
              Recurring activities
            </DialogTitle>
            <DialogDescription>Your activity templates that log themselves</DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5 overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-primary">
                <Loader2Icon className="size-8 animate-spin" />
              </div>
            ) : activities.length === 0 ? (
              <RecurringActivitiesEmptyState onCreateClick={onCreateClick} />
            ) : (
              <div className="flex flex-col gap-4">
                {activities.map((activity) => (
                  <RecurringActivityCard
                    key={activity.id}
                    activity={activity}
                    projects={projects}
                    onEdit={onEdit}
                    onDelete={openDeleteConfirm}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-muted/50 border-t border-border">
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
        title="Stop recurring activity"
        message={`Are you sure you want to stop "${deleteConfirm.title}"?`}
        confirmText="Stop"
        variant="danger"
      />
    </>
  );
};


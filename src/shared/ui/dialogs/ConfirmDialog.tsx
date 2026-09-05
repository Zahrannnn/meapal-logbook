import React from 'react';
import { AlertTriangle, Loader2Icon } from 'lucide-react';
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
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger',
}) => {
  const confirmStyles = {
    danger: 'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30',
    warning: 'bg-warning text-white hover:bg-warning/90 focus-visible:ring-warning/30',
    info: 'bg-primary text-primary-foreground hover:bg-primary/90',
  } as const;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
    >
      <AlertDialogContent className="max-w-md gap-0 p-0 rounded-2xl overflow-hidden">
        <AlertDialogHeader className="px-6 pt-6 pb-5 flex-row items-start gap-4 text-left space-y-0">
          <div
            className={cn(
              'size-11 rounded-full flex items-center justify-center shrink-0',
              variant === 'danger' && 'bg-destructive/10 text-destructive',
              variant === 'warning' && 'bg-warning/10 text-warning',
              variant === 'info' && 'bg-primary/10 text-primary',
            )}
          >
            <AlertTriangle className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <AlertDialogTitle className="text-base">{title}</AlertDialogTitle>
            <AlertDialogDescription className="mt-1.5">{message}</AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="px-6 py-4 bg-muted/50 border-t border-border gap-2">
          <AlertDialogCancel onClick={onClose} disabled={isLoading} className="mt-0 rounded-xl font-bold">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={cn('rounded-xl font-bold', confirmStyles[variant])}
          >
            {isLoading ? (
              <>
                <Loader2Icon data-icon="inline-start" className="animate-spin" />
                Processing…
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

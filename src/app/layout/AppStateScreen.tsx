import React from 'react';
import { AlertCircle } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AppStateScreenProps {
  message: string;
  tone?: 'loading' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}

export const AppStateScreen: React.FC<AppStateScreenProps> = ({
  message,
  tone = 'loading',
  actionLabel,
  onAction,
}) => {
  if (tone === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <AppLogo large className="justify-center mb-10" />

          <div className="rounded-lg border border-destructive/25 bg-card px-6 py-8 shadow-sm">
            <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto mb-4">
              <AlertCircle className="size-5" />
            </span>
            <p className="text-sm text-foreground leading-relaxed">{message}</p>
            {actionLabel && onAction && (
              <Button onClick={onAction} className="mt-6 w-full">
                {actionLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-xs text-center">
        <AppLogo large className="justify-center" />

        <div className="mt-10 mx-auto h-0.5 w-28 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full w-1/3 rounded-full bg-primary',
              'animate-[loading-bar_1.4s_ease-in-out_infinite]',
            )}
          />
        </div>

        <p className="mt-5 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

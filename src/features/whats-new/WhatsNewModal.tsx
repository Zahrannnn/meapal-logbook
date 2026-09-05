import React from 'react';
import { format } from 'date-fns';
import { BarChart3, CalendarDays, Flame, Target } from 'lucide-react';
import { AppLogo } from '@/app/layout/AppLogo';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CURRENT_RELEASE } from '@/content/whatsNew';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SECTION_ICONS = [Target, Flame, CalendarDays, BarChart3] as const;

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose }) => {
  const releaseDate = format(new Date(CURRENT_RELEASE.date), 'MMMM d, yyyy');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden max-h-[85dvh] flex flex-col">
        <div className="px-6 pt-6 pb-5 border-b border-border bg-muted/30 shrink-0">
          <AppLogo className="mb-5" />
          <DialogHeader className="text-left gap-1.5">
            <DialogTitle>What&apos;s new</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-1">
                <p className="text-sm text-foreground font-medium">{CURRENT_RELEASE.title}</p>
                <p className="text-xs text-muted-foreground">
                  Version {CURRENT_RELEASE.version} · {releaseDate}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-3">
          {CURRENT_RELEASE.sections.map((section, index) => {
            const Icon = SECTION_ICONS[index % SECTION_ICONS.length];

            return (
              <section
                key={section.title}
                className="rounded-md border border-border bg-card px-4 py-3.5"
              >
                <div className="flex items-start gap-3 mb-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-4" strokeWidth={2} />
                  </span>
                  <h3 className="text-sm font-medium text-foreground leading-snug pt-1">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-2 pl-11">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed"
                    >
                      <span
                        className={cn('mt-2 size-1.5 shrink-0 rounded-full bg-primary/70')}
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 shrink-0">
          <Button onClick={onClose} className="w-full sm:w-auto sm:min-w-28">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityDetailsDrawerProps {
  /** Open automatically when true (e.g. editing an entry that has details). */
  forceOpen: boolean;
  /** True while the drawer holds content — surfaced on the collapsed toggle. */
  hasContent: boolean;
  children: React.ReactNode;
}

/**
 * One disclosure for everything optional (description, skills, notes, repeat),
 * so the default create flow is just title + project + times + status.
 */
export const ActivityDetailsDrawer = ({ forceOpen, hasContent, children }: ActivityDetailsDrawerProps) => {
  // The entry's own content can force the drawer open, but once the user
  // toggles it their choice wins for the rest of the session.
  const [userOverride, setUserOverride] = useState<boolean | null>(null);
  const isOpen = userOverride ?? forceOpen;

  return (
    <div className="border-t border-border pt-4">
      <button
        type="button"
        onClick={() => setUserOverride(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <SlidersHorizontal className="size-4 shrink-0" aria-hidden="true" />
        Add details
        {!isOpen && hasContent && (
          <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
        )}
        <span className="ml-auto hidden items-center gap-2 text-xs font-medium text-muted-foreground/80 sm:flex">
          Description · Skills · Notes · Repeat
          <ChevronDown
            className={cn('size-4 transition-transform duration-200', isOpen ? '' : '-rotate-90')}
            aria-hidden="true"
          />
        </span>
        <ChevronDown
          className={cn('ml-auto size-4 shrink-0 transition-transform duration-200 sm:hidden', isOpen ? '' : '-rotate-90')}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="activity-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-5 pt-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

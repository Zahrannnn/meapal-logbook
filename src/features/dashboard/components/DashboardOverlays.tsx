import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { HistoryIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PayPeriod } from '../../../lib/payPeriod';

/** Three pulsing 'log entries' — the motif for a period being loaded. */
const LogEntryBars = () => (
  <span className="flex items-end gap-[3px] h-4" aria-hidden="true">
    {[0, 1, 2].map((index) => (
      <span
        key={index}
        className="w-[5px] rounded-[2px] bg-primary animate-pulse"
        style={{ height: `${7 + index * 3}px`, animationDelay: `${index * 180}ms`, animationDuration: '900ms' }}
      />
    ))}
  </span>
);

/** Frosted overlay while a new pay period loads; the page stays mounted underneath. */
export const PeriodLoadingOverlay: React.FC<{
  isActive: boolean;
  period: PayPeriod;
}> = ({ isActive, period }) => (
  <AnimatePresence>
    {isActive && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="absolute inset-0 z-10 flex items-start justify-center bg-background/60 backdrop-blur-[2px] rounded-xl"
      >
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -6, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="mt-16 flex items-center gap-3 rounded-full border bg-card px-4 py-2.5 shadow-card"
        >
          <LogEntryBars />
          <span className="text-sm font-bold text-foreground tabular-nums">
            {format(period.start, 'MMM d')} – {format(period.end, 'MMM d')}
          </span>
          <span className="text-sm text-muted-foreground">loading pay period…</span>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/** Recovery: an auto-saved in-progress activity from a previous session. */
export const DraftRecoveryBanner: React.FC<{
  onContinue: () => void;
  onDiscard?: () => void;
}> = ({ onContinue, onDiscard }) => (
  <div
    className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border bg-muted/40 px-4 py-2.5"
    role="status"
  >
    <HistoryIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    <p className="min-w-0 flex-1 text-sm font-medium text-foreground">
      You have an unfinished activity. Continue where you left off?
    </p>
    {onDiscard && (
      <Button
        variant="ghost"
        size="sm"
        onClick={onDiscard}
        className="text-muted-foreground hover:text-foreground"
      >
        Discard
      </Button>
    )}
    <Button size="sm" onClick={onContinue}>
      Continue
    </Button>
  </div>
);

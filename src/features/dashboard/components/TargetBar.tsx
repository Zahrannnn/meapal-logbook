import React from 'react';
import { formatHoursMinutes } from '@/lib/time';

/**
 * Two-segment day bar scaled to the stretch target: primary up to the main
 * target tick, emerald past it (overtime territory), tick at the main target.
 */
export const TargetBar: React.FC<{ loggedHours: number; targetHours: number; stretchHours: number }> = ({
  loggedHours,
  targetHours,
  stretchHours,
}) => {
  const mainPositionPct = Math.min(100, (targetHours / stretchHours) * 100);
  const fillPct = Math.min(100, (loggedHours / stretchHours) * 100);
  const primaryWidthPct = loggedHours <= targetHours ? fillPct : mainPositionPct;
  const overtimeWidthPct = loggedHours > targetHours ? Math.min(100, fillPct) - mainPositionPct : 0;

  return (
    <div className="relative h-2 w-full">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${primaryWidthPct}%` }} />
        {overtimeWidthPct > 0 && (
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${overtimeWidthPct}%` }}
            title="Overtime"
          />
        )}
      </div>
      <div
        className="absolute -top-0.5 h-3 w-[3px] -translate-x-1/2 rounded-full bg-foreground/70"
        style={{ left: `${mainPositionPct}%` }}
        title={`Main target: ${formatHoursMinutes(targetHours)}`}
        aria-hidden="true"
      />
    </div>
  );
};

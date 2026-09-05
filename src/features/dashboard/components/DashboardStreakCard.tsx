import React from 'react';
import { Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface DashboardStreakCardProps {
  days: number;
  isLoading?: boolean;
}

export const DashboardStreakCard: React.FC<DashboardStreakCardProps> = ({ days, isLoading = false }) => (
  <Card
    className="rounded-2xl py-5 flex flex-col items-center justify-center gap-1 min-h-[9.5rem]"
    aria-label="Current streak"
  >
    {isLoading ? (
      <div className="flex flex-col items-center gap-2">
        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
        <div className="h-4 w-20 rounded bg-muted animate-pulse" />
      </div>
    ) : (
      <>
        <Flame
          className={`size-8 ${days > 0 ? 'text-orange-500' : 'text-muted-foreground/30'}`}
          aria-hidden="true"
        />
        <p className="text-3xl leading-none font-extrabold text-foreground tabular-nums tracking-tight">
          {days}
        </p>
        <p className="text-sm font-bold text-foreground">day streak</p>
        <p className="text-xs font-medium text-muted-foreground">
          {days > 0 ? 'Keep it going!' : 'Log a working day to start'}
        </p>
      </>
    )}
  </Card>
);

import React from 'react';
import { Loader2Icon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface AnalyticsCardProps {
  title: string;
  /** Optional right-side content in the header row (counts, badges). */
  action?: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

/** Shared shell for analytics cards: one surface, one title row, skeleton/empty handling. */
export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  action,
  isLoading = false,
  isEmpty = false,
  emptyTitle = 'No data available',
  className,
  bodyClassName,
  children,
}) => (
  <section className={cn('rounded-2xl border bg-card p-5', className)}>
    <div className="mb-4 flex items-center justify-between gap-2">
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      {action}
    </div>

    {isLoading ? (
      <div className="flex h-[17rem] flex-col gap-3" aria-label={`Loading ${title}`}>
        <Skeleton className="h-full w-full" />
      </div>
    ) : isEmpty ? (
      <div className="flex h-[17rem] items-center justify-center text-sm font-medium text-muted-foreground">
        {emptyTitle}
      </div>
    ) : (
      <div className={bodyClassName}>{children}</div>
    )}
  </section>
);

export const AnalyticsCardSpinner: React.FC = () => <Loader2Icon className="size-5 animate-spin text-muted-foreground" />;

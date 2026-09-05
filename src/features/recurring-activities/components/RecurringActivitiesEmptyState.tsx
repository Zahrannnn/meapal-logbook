import React from 'react';
import { MousePointerClickIcon, RepeatIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

interface RecurringActivitiesEmptyStateProps {
  onCreateClick?: () => void;
}

export const RecurringActivitiesEmptyState: React.FC<RecurringActivitiesEmptyStateProps> = ({ onCreateClick }) => (
  <Empty className="py-12">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <RepeatIcon />
      </EmptyMedia>
      <EmptyTitle>No recurring activities yet</EmptyTitle>
      <EmptyDescription>
        Turn on <span className="font-semibold text-foreground">Repeat</span> when logging an activity, and it
        will create entries for you automatically.
      </EmptyDescription>
    </EmptyHeader>
    {onCreateClick && (
      <EmptyContent>
        <Button size="sm" onClick={onCreateClick}>
          <MousePointerClickIcon data-icon="inline-start" />
          Create one now
        </Button>
      </EmptyContent>
    )}
  </Empty>
);

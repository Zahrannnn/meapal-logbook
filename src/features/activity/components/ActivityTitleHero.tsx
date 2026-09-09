import React from 'react';
import { cn } from '@/lib/utils';

/** The hero: the placeholder is the question, so the input needs no label. */
export const ActivityTitleHero: React.FC<{
  title: string;
  onTitleChange: (title: string) => void;
  isEditing: boolean;
  titleError?: string;
}> = ({ title, onTitleChange, isEditing, titleError }) => (
  <div
    className={cn(
      'border-b pb-2 transition-colors',
      titleError && !title ? 'border-destructive' : 'border-border focus-within:border-foreground/30',
    )}
  >
    {/* Bare input — the shadcn Input's base `md:text-sm` would shrink the hero. */}
    <input
      id="activity-title"
      type="text"
      value={title}
      onChange={(event) => onTitleChange(event.target.value)}
      placeholder={isEditing ? 'Activity title' : 'What did you work on?'}
      aria-label="Activity title"
      aria-invalid={!!(titleError && !title)}
      className="w-full bg-transparent text-xl font-bold tracking-tight text-foreground outline-none placeholder:font-semibold placeholder:text-muted-foreground/50"
      autoFocus
    />
    {titleError && !title && (
      <p className="text-xs font-semibold text-destructive" role="alert">
        {titleError}
      </p>
    )}
  </div>
);

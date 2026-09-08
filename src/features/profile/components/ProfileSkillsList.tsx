import React from 'react';
import { format } from 'date-fns';
import { CheckIcon, ChevronDownIcon, Trash2Icon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { SkillLevel, UserSkill } from '../../../lib/api';
import { profileSkillLevels } from '../hooks/useProfileSkills';

interface ProfileSkillsListProps {
  skills: UserSkill[];
  isLoading: boolean;
  onUpdateSkillLevel: (competencyId: number, level: SkillLevel) => void;
  onRemoveSkill: (competencyId: number) => void;
}

const levelBadgeClass = (level: SkillLevel) => {
  switch (level) {
    case 'expert':
      return 'bg-success/10 text-success';
    case 'advanced':
      return 'bg-primary/10 text-primary';
    case 'intermediate':
      return 'bg-info/10 text-info';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const levelLabel = (level: SkillLevel) => profileSkillLevels.find((entry) => entry.value === level)?.label ?? level;

export const ProfileSkillsList: React.FC<ProfileSkillsListProps> = ({
  skills,
  isLoading,
  onUpdateSkillLevel,
  onRemoveSkill,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2" aria-label="Loading skills">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex items-center justify-between rounded-xl border px-3.5 py-3">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <Empty className="py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CheckIcon />
          </EmptyMedia>
          <EmptyTitle>No skills yet</EmptyTitle>
          <p className="text-sm text-muted-foreground">Add your first skill above to build your profile.</p>
        </EmptyHeader>
        <EmptyContent />
      </Empty>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border bg-card">
      {skills.map((skill) => (
        <li key={skill.competencyId} className="flex items-center justify-between gap-3 px-3.5 py-3">
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold text-foreground">{skill.competencyName}</h4>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground tabular-nums">
              Added {format(new Date(skill.addedAt), 'MMM d, yyyy')}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Level: ${levelLabel(skill.level)}. Change level`}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-transform active:scale-95',
                    levelBadgeClass(skill.level),
                  )}
                >
                  {levelLabel(skill.level)}
                  <ChevronDownIcon className="size-3" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {profileSkillLevels.map((skillLevel) => (
                  <DropdownMenuItem
                    key={skillLevel.value}
                    onClick={() => onUpdateSkillLevel(skill.competencyId, skillLevel.value)}
                    className="justify-between"
                  >
                    {skillLevel.label}
                    {skill.level === skillLevel.value && <CheckIcon className="size-3.5" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${skill.competencyName}`}
              onClick={() => onRemoveSkill(skill.competencyId)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2Icon />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
};

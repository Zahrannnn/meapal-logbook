import React from 'react';
import { AwardIcon, Loader2Icon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BackendCompetency, SkillLevel } from '../../../lib/api';
import { profileSkillLevels } from '../hooks/useProfileSkills';

interface ProfileSkillFormProps {
  skillCount: number;
  unownedCompetencies: BackendCompetency[];
  selectedCompetency: number | '';
  selectedLevel: SkillLevel;
  isSaving: boolean;
  onSelectCompetency: (value: number | '') => void;
  onSelectLevel: (value: SkillLevel) => void;
  onAddSkill: () => void;
}

export const ProfileSkillForm: React.FC<ProfileSkillFormProps> = ({
  skillCount,
  unownedCompetencies,
  selectedCompetency,
  selectedLevel,
  isSaving,
  onSelectCompetency,
  onSelectLevel,
  onAddSkill,
}) => (
  <div className="flex flex-col gap-2.5">
    <div className="flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <AwardIcon className="size-4 text-primary" aria-hidden="true" />
        Skills
      </h3>
      <span className="text-xs font-semibold text-muted-foreground tabular-nums">
        {skillCount} {skillCount === 1 ? 'skill' : 'skills'}
      </span>
    </div>

    <div className="flex flex-col gap-2.5 rounded-xl border bg-muted/40 p-3.5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Add a skill</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select
          value={selectedCompetency ? String(selectedCompetency) : ''}
          onValueChange={(value) => onSelectCompetency(value ? parseInt(value, 10) : '')}
        >
          <SelectTrigger className="flex-1 w-full">
            <SelectValue placeholder="Select a skill…" />
          </SelectTrigger>
          <SelectContent>
            {unownedCompetencies.map((competency) => (
              <SelectItem key={competency.id} value={String(competency.id)}>
                {competency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedLevel} onValueChange={(value) => onSelectLevel(value as SkillLevel)}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {profileSkillLevels.map((skillLevel) => (
              <SelectItem key={skillLevel.value} value={skillLevel.value}>
                {skillLevel.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => onAddSkill()} disabled={!selectedCompetency || isSaving}>
          {isSaving ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : <PlusIcon data-icon="inline-start" />}
          Add
        </Button>
      </div>
    </div>
  </div>
);

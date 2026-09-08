import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from '@/lib/toast';
import type { BackendCompetency, SkillLevel, UserSkill } from '../../../lib/api';
import { profileService } from '../services/profile.service';

export const profileSkillLevels: { value: SkillLevel; label: string; color: string }[] = [
  { value: 'beginner', label: 'Beginner', color: 'bg-muted text-muted-foreground' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-info/10 text-info' },
  { value: 'advanced', label: 'Advanced', color: 'bg-primary/10 text-primary' },
  { value: 'expert', label: 'Expert', color: 'bg-success/10 text-success' },
];

const UNDO_DELAY_MS = 5000;

interface UseProfileSkillsOptions {
  isOpen: boolean;
  onProfileUpdated?: () => void;
}

export const useProfileSkills = ({ isOpen, onProfileUpdated }: UseProfileSkillsOptions) => {
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [availableCompetencies, setAvailableCompetencies] = useState<BackendCompetency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState<number | ''>('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>('intermediate');
  // Skill removals are deferred so the Undo action is real; the network call
  // only fires after the undo window closes.
  const pendingRemovals = useRef(new Map<number, { timer: ReturnType<typeof setTimeout>; skill: UserSkill }>());

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { skills: skillData, competencies } = await profileService.loadProfileSkills();
      setSkills(skillData);
      setAvailableCompetencies(competencies);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      void loadData();
    }
  }, [isOpen, loadData]);

  const handleAddSkill = useCallback(
    async (competencyId?: number, level?: SkillLevel) => {
      const id = competencyId ?? (selectedCompetency as number);
      if (!id) return;
      setIsSaving(true);
      try {
        const newSkill = await profileService.addSkill(id, level ?? selectedLevel);
        setSkills((currentSkills) => [...currentSkills, newSkill]);
        setSelectedCompetency('');
        setSelectedLevel('intermediate');
        toast.success('Skill added');
        onProfileUpdated?.();
      } catch (error) {
        console.error('Failed to add skill:', error);
        toast.error('Failed to add skill. You may already have this skill.');
      } finally {
        setIsSaving(false);
      }
    },
    [onProfileUpdated, selectedCompetency, selectedLevel],
  );

  const handleUpdateSkillLevel = useCallback(
    async (competencyId: number, level: SkillLevel) => {
      try {
        await profileService.updateSkillLevel(competencyId, level);
        setSkills((currentSkills) =>
          currentSkills.map((skill) => (skill.competencyId === competencyId ? { ...skill, level } : skill)),
        );
        toast.success('Skill level updated');
        onProfileUpdated?.();
      } catch (error) {
        console.error('Failed to update skill:', error);
        toast.error('Failed to update the skill level.');
      }
    },
    [onProfileUpdated],
  );

  const restoreSkill = useCallback((skill: UserSkill) => {
    setSkills((currentSkills) =>
      [...currentSkills, skill].sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1)),
    );
  }, []);

  const handleRemoveSkill = useCallback(
    (competencyId: number) => {
      const skill = skills.find((entry) => entry.competencyId === competencyId);
      if (!skill) return;

      // Optimistic removal; the network delete is deferred so Undo is real.
      setSkills((currentSkills) => currentSkills.filter((entry) => entry.competencyId !== competencyId));

      const timer = setTimeout(async () => {
        pendingRemovals.current.delete(competencyId);
        try {
          await profileService.removeSkill(competencyId);
          onProfileUpdated?.();
        } catch (error) {
          console.error('Failed to remove skill:', error);
          toast.error('Failed to remove the skill. It has been restored.');
          restoreSkill(skill);
        }
      }, UNDO_DELAY_MS);
      pendingRemovals.current.set(competencyId, { timer, skill });

      toast.success('Skill removed', {
        duration: UNDO_DELAY_MS,
        action: {
          label: 'Undo',
          onClick: () => {
            const pending = pendingRemovals.current.get(competencyId);
            if (pending) {
              clearTimeout(pending.timer);
              pendingRemovals.current.delete(competencyId);
            }
            restoreSkill(skill);
          },
        },
      });
    },
    [onProfileUpdated, restoreSkill, skills],
  );

  const unownedCompetencies = useMemo(
    () =>
      availableCompetencies.filter(
        (competency) => !skills.some((skill) => skill.competencyId === competency.id),
      ),
    [availableCompetencies, skills],
  );

  return {
    skills,
    isLoading,
    isSaving,
    selectedCompetency,
    setSelectedCompetency,
    selectedLevel,
    setSelectedLevel,
    unownedCompetencies,
    handleAddSkill,
    handleUpdateSkillLevel,
    handleRemoveSkill,
  };
};

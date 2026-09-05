import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import type { BackendCompetency, SkillLevel, UserSkill } from '../../../lib/api';
import { profileService } from '../services/profile.service';

export const profileSkillLevels: { value: SkillLevel; label: string; color: string }[] = [
  { value: 'beginner', label: 'Beginner', color: 'bg-gray-100 text-gray-700' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-700' },
  { value: 'advanced', label: 'Advanced', color: 'bg-purple-100 text-purple-700' },
  { value: 'expert', label: 'Expert', color: 'bg-green-100 text-green-700' },
];

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
  const [successMessage, setSuccessMessage] = useState('');

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

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 2000);
  }, []);

  const handleAddSkill = useCallback(async () => {
    if (!selectedCompetency) return;

    setIsSaving(true);
    try {
      const newSkill = await profileService.addSkill(selectedCompetency as number, selectedLevel);
      setSkills((currentSkills) => [...currentSkills, newSkill]);
      setSelectedCompetency('');
      setSelectedLevel('intermediate');
      showSuccess('Skill added successfully!');
      onProfileUpdated?.();
    } catch (error) {
      console.error('Failed to add skill:', error);
      toast.error('Failed to add skill. You may already have this skill.');
    } finally {
      setIsSaving(false);
    }
  }, [onProfileUpdated, selectedCompetency, selectedLevel, showSuccess]);

  const handleUpdateSkillLevel = useCallback(
    async (competencyId: number, level: SkillLevel) => {
      try {
        await profileService.updateSkillLevel(competencyId, level);
        setSkills((currentSkills) =>
          currentSkills.map((skill) => (skill.competencyId === competencyId ? { ...skill, level } : skill)),
        );
        showSuccess('Skill level updated!');
        onProfileUpdated?.();
      } catch (error) {
        console.error('Failed to update skill:', error);
      }
    },
    [onProfileUpdated, showSuccess],
  );

  const handleRemoveSkill = useCallback(
    async (competencyId: number) => {
      if (!confirm('Are you sure you want to remove this skill?')) return;

      try {
        await profileService.removeSkill(competencyId);
        setSkills((currentSkills) => currentSkills.filter((skill) => skill.competencyId !== competencyId));
        showSuccess('Skill removed!');
        onProfileUpdated?.();
      } catch (error) {
        console.error('Failed to remove skill:', error);
      } finally {
        void loadData();
      }
    },
    [loadData, onProfileUpdated, showSuccess],
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
    successMessage,
    unownedCompetencies,
    handleAddSkill,
    handleUpdateSkillLevel,
    handleRemoveSkill,
  };
};

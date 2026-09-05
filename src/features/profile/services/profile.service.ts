import { competenciesApi, skillsApi } from '../../../lib/api';
import type { BackendCompetency, SkillLevel, UserSkill } from '../../../lib/api';

export const profileService = {
  loadProfileSkills: async (): Promise<{ skills: UserSkill[]; competencies: BackendCompetency[] }> => {
    const [skills, competencies] = await Promise.all([skillsApi.getMySkills(), competenciesApi.getAll()]);
    return { skills, competencies };
  },

  addSkill: async (competencyId: number, level: SkillLevel) => skillsApi.addMySkill(competencyId, level),

  updateSkillLevel: async (competencyId: number, level: SkillLevel) => skillsApi.updateMySkill(competencyId, level),

  removeSkill: async (competencyId: number) => skillsApi.removeMySkill(competencyId),
};
